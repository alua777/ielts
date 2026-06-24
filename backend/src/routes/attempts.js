const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');
const auth = require('../middleware/auth');
const { buildMockExamFeedback } = require('../utils/mockExamFeedback');
const { evaluateWriting, buildWritingPrompt } = require('../services/writingFeedback');

const router = express.Router();

// Converts raw score (0-40) to IELTS band score
function toBandScore(correct, total) {
  if (!total) return 0;
  const pct = correct / total;
  if (pct >= 0.97) return 9.0;
  if (pct >= 0.93) return 8.5;
  if (pct >= 0.87) return 8.0;
  if (pct >= 0.80) return 7.5;
  if (pct >= 0.73) return 7.0;
  if (pct >= 0.67) return 6.5;
  if (pct >= 0.60) return 6.0;
  if (pct >= 0.53) return 5.5;
  if (pct >= 0.47) return 5.0;
  if (pct >= 0.40) return 4.5;
  return 4.0;
}

// POST /api/attempts  — start a new exam attempt
router.post('/', auth, async (req, res) => {
  try {
    const { section } = req.body;
    if (!section)
      return res.status(400).json({ error: 'section is required (reading, writing, listening, full)' });

    const id = uuidv4();
    await run(
      'INSERT INTO exam_attempts (id, user_id, section) VALUES (?, ?, ?)',
      [id, req.user.id, section]
    );

    res.status(201).json({ message: 'Attempt started', attempt_id: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attempts  — list all attempts for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const attempts = await all(
      'SELECT * FROM exam_attempts WHERE user_id = ? ORDER BY started_at DESC',
      [req.user.id]
    );
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attempts/:id  — get attempt + all answers
router.delete('/:id', auth, async (req, res) => {
  try {
    const attempt = await get(
      'SELECT id FROM exam_attempts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    const recordings = await all(
      'SELECT audio_path FROM speaking_submissions WHERE attempt_id = ?',
      [req.params.id]
    );

    await run('DELETE FROM exam_attempts WHERE id = ?', [req.params.id]);

    await Promise.all(recordings.map(({ audio_path }) => {
      if (!audio_path) return Promise.resolve();
      const relativePath = audio_path.replace(/^[/\\]+/, '');
      return fs.promises.unlink(path.join(__dirname, '../..', relativePath)).catch(() => {});
    }));

    res.json({ message: 'Attempt abandoned and deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const attempt = await get('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    const answers = await all(
     `SELECT a.*, q.question_text, q.correct_answer, p.section,
       p.title AS passage_title, qg.instruction
 FROM answers a
 JOIN questions q ON a.question_id = q.id
 JOIN question_groups qg ON q.group_id = qg.id
 JOIN passages p ON qg.passage_id = p.id
 WHERE a.attempt_id = ?`,
      [req.params.id]
    );

    const writingSubmissions = answers
      .filter(answer => answer.section === 'writing' && answer.user_answer?.trim())
      .map(answer => ({
        id: answer.id,
        question_id: answer.question_id,
        question_text: answer.question_text,
        essay_text: answer.user_answer,
        passage_title: answer.passage_title,
        task_type: answer.passage_title?.toLowerCase().includes('task 1') ? 'task1' : 'task2',
      }));
    const speakingSubmissions = await all(
      `SELECT ss.*, p.title AS passage_title
       FROM speaking_submissions ss
       LEFT JOIN passages p ON p.id = ss.passage_id
       WHERE ss.attempt_id = ?
       ORDER BY ss.part_index`,
      [req.params.id]
    );
    const mockFeedback = buildMockExamFeedback(writingSubmissions, speakingSubmissions);
    if (attempt.writing_feedback) {
      const tasks = Array.isArray(attempt.writing_feedback.tasks) ? attempt.writing_feedback.tasks : [];
      mockFeedback.writing = {
        ...mockFeedback.writing,
        ...attempt.writing_feedback,
        submissions: mockFeedback.writing.submissions.map((submission, index) => {
          const taskFeedback = tasks[index];
          if (!taskFeedback) return submission;
          return {
            ...submission,
            estimated_band: taskFeedback.overall_band,
            ai_feedback: taskFeedback,
          };
        }),
      };
    }

    res.json({
      attempt,
      answers,
      writing_submissions: mockFeedback.writing.submissions,
      speaking_submissions: speakingSubmissions,
      mock_feedback: mockFeedback,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attempts/:id/answers  — submit one or multiple answers
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const attempt = await get('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.status === 'completed')
      return res.status(400).json({ error: 'This attempt is already completed' });

    // Accept single answer or array
    const incoming = Array.isArray(req.body) ? req.body : [req.body];

    for (const item of incoming) {
      const { question_id, user_answer } = item;
      if (!question_id) continue;

      const question = await get(
        `SELECT q.*, qg.question_type
         FROM questions q
         JOIN question_groups qg ON q.group_id = qg.id
         WHERE q.id = ?`,
        [question_id]
      );
      if (!question) continue;

      // Auto-grade for non-essay questions
      let is_correct = null;
      let score = 0;
      if (question.question_type !== 'essay' && question.correct_answer) {
        const submitted = user_answer?.trim().toLowerCase() || '';
        const expected = question.correct_answer.trim().toLowerCase();
        const normalizedSubmitted = question.question_type === 'mcq' && /^[a-z][.)]\s/.test(submitted)
          ? submitted[0]
          : submitted;
        is_correct = normalizedSubmitted === expected ? 1 : 0;
        score = is_correct ? 1 : 0;
      }

      // Upsert: replace existing answer for same attempt+question
      const existing = await get('SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?', [req.params.id, question_id]);
      if (existing) {
        await run(
          'UPDATE answers SET user_answer = ?, is_correct = ?, score = ? WHERE id = ?',
          [user_answer, is_correct, score, existing.id]
        );
      } else {
        await run(
          'INSERT INTO answers (id, attempt_id, question_id, user_answer, is_correct, score) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), req.params.id, question_id, user_answer, is_correct, score]
        );
      }
    }

    res.json({ message: 'Answers saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attempts/:id/complete  — finish exam and calculate score
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { time_taken_seconds } = req.body;

    const attempt = await get('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.status === 'completed')
      return res.status(400).json({ error: 'Already completed' });

    const answers = await all('SELECT * FROM answers WHERE attempt_id = ?', [req.params.id]);
    const gradedAnswers = answers.filter(a => a.is_correct !== null);
    const correct = gradedAnswers.filter(a => a.is_correct === 1).length;
    const total = gradedAnswers.length;
    const speakingScores = await all(
      'SELECT score FROM speaking_submissions WHERE attempt_id = ? AND score IS NOT NULL',
      [req.params.id]
    );
    const speakingBand = speakingScores.length
      ? speakingScores.reduce((sum, row) => sum + Number(row.score || 0), 0) / speakingScores.length
      : null;
    const band = speakingBand ? Math.max(toBandScore(correct, total), speakingBand) : toBandScore(correct, total);
    let writingFeedback = null;
    const writingAnswers = await all(
      `SELECT a.user_answer AS essay_text, q.question_text, qg.instruction, p.title AS passage_title
       FROM answers a
       JOIN questions q ON q.id = a.question_id
       JOIN question_groups qg ON qg.id = q.group_id
       JOIN passages p ON p.id = qg.passage_id
       WHERE a.attempt_id = ? AND p.section = 'writing' AND a.user_answer <> ''
       ORDER BY q.question_number`,
      [req.params.id]
    );

    if (writingAnswers.length && process.env.AI_API_KEY) {
      try {
        const evaluated = await Promise.all(writingAnswers.map(async (answer) => {
          const taskType = answer.passage_title?.toLowerCase().includes('task 1') ? 'task1' : 'task2';
          const feedback = await evaluateWriting({
            prompt: buildWritingPrompt({
              title: answer.passage_title,
              instruction: answer.instruction,
              questionText: answer.question_text,
              taskType,
            }),
            essay: answer.essay_text,
            taskType,
          });
          return feedback ? { answer, feedback, taskType } : null;
        }));
        const available = evaluated.filter(Boolean);
        if (available.length) {
          const overall = Math.round(
            (available.reduce((sum, item) => sum + item.feedback.overall, 0) / available.length) * 2
          ) / 2;
          writingFeedback = {
            section: 'writing',
            overall_band: overall,
            criteria: available.length === 1
              ? available[0].feedback.criteria
              : available[0].feedback.criteria.map((criterion, index) => ({
                ...criterion,
                band: Math.round(
                  (available.reduce((sum, item) => sum + item.feedback.criteria[index].band, 0) / available.length) * 2
                ) / 2,
                feedback: available
                  .map((item, taskIndex) => `Task ${taskIndex + 1}: ${item.feedback.criteria[index].feedback}`)
                  .join('\n\n'),
              })),
            strengths: [...new Set(available.flatMap(item => item.feedback.strengths))].slice(0, 4),
            improvements: [...new Set(available.flatMap(item => item.feedback.improvements))].slice(0, 4),
            summary: available.map((item, index) => `Task ${index + 1}: ${item.feedback.summary}`).join(' '),
            tasks: available.map((item, index) => ({
              task_number: index + 1,
              task_type: item.taskType,
              question_text: item.answer.question_text,
              instruction: item.answer.instruction,
              overall_band: item.feedback.overall,
              criteria: item.feedback.criteria,
              strengths: item.feedback.strengths,
              improvements: item.feedback.improvements,
              summary: item.feedback.summary,
              word_count: item.answer.essay_text.trim().split(/\s+/).filter(Boolean).length,
            })),
          };
          console.log(`[writing-feedback] AI assessment used for mock attempt ${req.params.id} (${available.length} task${available.length === 1 ? '' : 's'}, model: ${process.env.AI_MODEL || 'gpt-4.1-mini'})`);
        } else {
          console.warn(`[writing-feedback] Local fallback used for mock attempt ${req.params.id}: AI evaluator returned no result`);
        }
      } catch (aiError) {
        console.error(`[writing-feedback] Local fallback used for mock attempt ${req.params.id}:`, aiError.message);
      }
    } else if (writingAnswers.length) {
      console.warn(`[writing-feedback] Local fallback used for mock attempt ${req.params.id}: AI_API_KEY is not configured`);
    }

    await run(
      `UPDATE exam_attempts SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        time_taken_seconds = ?,
        total_score = ?,
        band_score = ?,
        writing_feedback = ?::jsonb
       WHERE id = ?`,
      [time_taken_seconds || null, correct, band, writingFeedback ? JSON.stringify(writingFeedback) : null, req.params.id]
    );

    res.json({
      message: 'Exam completed',
      result: {
        correct_answers: correct,
        total_graded: total,
        band_score: band,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
