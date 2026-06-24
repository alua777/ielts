const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { get, run } = require('../db/database');
const auth = require('../middleware/auth');
const { evaluateWriting, buildWritingPrompt } = require('../services/writingFeedback');

const router = express.Router();

router.get('/status', auth, (_req, res) => {
  const apiUrl = process.env.AI_API_URL?.trim() || 'https://api.openai.com/v1/chat/completions';
  let providerHost = 'invalid URL';
  try {
    providerHost = new URL(apiUrl).host;
  } catch {
    // Return a safe configuration status without exposing credentials or the full URL.
  }

  res.json({
    writing_ai_configured: Boolean(process.env.AI_API_KEY?.trim()),
    provider_host: providerHost,
    model: process.env.AI_MODEL?.trim() || 'gpt-4.1-mini',
    fallback_enabled: true,
  });
});

function words(value = '') {
  return value.trim().split(/\s+/).filter(Boolean);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundHalf(value) {
  return Math.round(value * 2) / 2;
}

function contentVariation(value) {
  return [...value].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 5;
}

function scoreResponse(section, response) {
  const wordCount = words(response).length;
  const sentenceCount = Math.max(1, response.split(/[.!?]+/).filter(item => item.trim()).length);
  const uniqueWords = new Set(words(response.toLowerCase()).map(word => word.replace(/[^a-z']/g, ''))).size;
  const lexicalRatio = wordCount ? uniqueWords / wordCount : 0;
  const lengthTarget = section === 'writing' ? 250 : 120;
  const lengthScore = clamp(wordCount / lengthTarget, 0, 1);
  const sentenceScore = clamp(sentenceCount / (section === 'writing' ? 12 : 8), 0, 1);
  const varietyScore = clamp((lexicalRatio - 0.25) / 0.4, 0, 1);
  const variation = contentVariation(response) * 0.1;
  const overall = roundHalf(clamp(4 + lengthScore * 1.7 + sentenceScore * 0.8 + varietyScore * 1.1 + variation, 4, 8));

  const labels = section === 'writing'
    ? ['Task Achievement', 'Coherence and Cohesion', 'Grammatical Range and Accuracy', 'Lexical Resource']
    : ['Fluency and Coherence', 'Lexical Resource', 'Grammatical Range and Accuracy', 'Pronunciation'];

  const criteria = labels.map((label, index) => ({
    label,
    band: roundHalf(clamp(overall + ((contentVariation(`${response}${index}`) - 2) * 0.25), 4, 8)),
    feedback: index === 0
      ? 'Your response addresses the task clearly; develop key ideas with more specific support.'
      : index === 1
        ? 'The response is easy to follow. Use a wider range of linking language without overusing it.'
        : index === 2
          ? 'You use a useful mix of structures. Check smaller agreement and punctuation errors.'
          : section === 'speaking'
            ? 'Your delivery is generally clear. Emphasise stressed words and vary intonation more naturally.'
            : 'Vocabulary is appropriate and varied. Add more precise topic-specific language.',
  }));

  return {
    overall,
    criteria,
    strengths: [
      'A clear response with a recognisable position or central message.',
      lexicalRatio > 0.45 ? 'Good vocabulary variety across the response.' : 'Ideas are expressed in direct, understandable language.',
    ],
    improvements: [
      wordCount < lengthTarget * 0.75
        ? `Develop the response further; aim for about ${lengthTarget} words.`
        : 'Support the strongest ideas with more precise examples.',
      section === 'speaking'
        ? 'Use fuller answers and smoother transitions between ideas.'
        : 'Leave time to review grammar, punctuation, and paragraph flow.',
    ],
    summary: `This AI Feedback Preview estimates a Band ${overall.toFixed(1)}. The response has a solid foundation and will improve most through fuller development and more precise language.`,
  };
}

async function handleCheck(section, req, res) {
  try {
    const { test_id: testId, response, essay_text: essayText, transcript } = req.body;
    const userResponse = response || essayText || transcript || '';
    if (!testId || !userResponse.trim()) {
      return res.status(400).json({ error: 'test_id and a response are required' });
    }

    const test = await get('SELECT * FROM practice_tests WHERE id = ? AND section = ?', [testId, section]);
    if (!test) return res.status(404).json({ error: `${section} practice test not found` });

    let feedback = scoreResponse(section, userResponse);
    let assessmentSource = 'local_fallback';
    if (section === 'writing') {
      try {
        const aiFeedback = await evaluateWriting({
          prompt: buildWritingPrompt({
            title: test.title,
            description: test.description,
            prompt: test.content?.prompt,
            taskType: test.content?.task_type,
          }),
          essay: userResponse,
          taskType: test.content?.task_type,
        });
        if (aiFeedback) {
          feedback = aiFeedback;
          assessmentSource = 'ai';
          console.log(`[writing-feedback] AI assessment used for test ${testId} (model: ${process.env.AI_MODEL || 'gpt-4.1-mini'})`);
        } else {
          console.warn(`[writing-feedback] Local fallback used for test ${testId}: AI_API_KEY is not configured`);
        }
      } catch (aiError) {
        console.error(`[writing-feedback] Local fallback used for test ${testId}:`, aiError.message);
      }
    } else {
      console.warn(`[${section}-feedback] Local fallback used for test ${testId}: no external evaluator is configured`);
    }
    const id = uuidv4();
    await run(
      `INSERT INTO ai_feedback_results
       (id, user_id, test_id, section, user_response, overall_band, criteria, strengths, improvements, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?)`,
      [
        id,
        req.user.id,
        testId,
        section,
        userResponse,
        feedback.overall,
        JSON.stringify(feedback.criteria),
        JSON.stringify(feedback.strengths),
        JSON.stringify(feedback.improvements),
        feedback.summary,
      ]
    );
    await run(
      `INSERT INTO practice_test_progress (user_id, test_id, status, latest_band)
       VALUES (?, ?, 'completed', ?)
       ON CONFLICT (user_id, test_id) DO UPDATE SET
         status = 'completed',
         latest_band = EXCLUDED.latest_band,
         updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, testId, feedback.overall]
    );

    res.status(201).json({
      feedback: {
        id,
        test_id: testId,
        section,
        user_response: userResponse,
        overall_band: feedback.overall,
        assessment_source: assessmentSource,
        ...feedback,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

router.post('/writing', auth, (req, res) => handleCheck('writing', req, res));
router.post('/speaking', auth, (req, res) => handleCheck('speaking', req, res));

module.exports = router;
