const DEFAULT_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4.1-mini';
const CRITERIA_LABELS = [
  'Task Achievement',
  'Coherence and Cohesion',
  'Grammar',
  'Lexical Resource / Vocabulary',
];

function clampBand(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 6;
  return Math.min(9, Math.max(0, Math.round(numeric * 2) / 2));
}

function cleanList(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  const items = value.map(item => String(item).trim()).filter(Boolean).slice(0, 4);
  return items.length ? items : fallback;
}

function normalizeFeedback(value) {
  const criteriaByLabel = new Map(
    (Array.isArray(value?.criteria) ? value.criteria : []).map(item => [
      String(item?.label || '').toLowerCase(),
      item,
    ])
  );
  const criteria = CRITERIA_LABELS.map(label => {
    const source = criteriaByLabel.get(label.toLowerCase())
      || [...criteriaByLabel.entries()].find(([key]) => key.includes(label.split(' ')[0].toLowerCase()))?.[1]
      || {};
    return {
      label,
      band: clampBand(source.band),
      feedback: String(source.feedback || 'Review this criterion and add more precise development. Include what is working, what is limiting the band, and one concrete next step.').trim(),
    };
  });
  const average = criteria.reduce((sum, item) => sum + item.band, 0) / criteria.length;

  return {
    overall: clampBand(value?.overall_band ?? value?.overall ?? average),
    criteria,
    strengths: cleanList(value?.strengths, ['The response presents a clear attempt to address the task.']),
    improvements: cleanList(value?.improvements, ['Develop ideas with more specific support and proofread carefully.']),
    summary: String(value?.summary || 'The response has a clear foundation and can improve through fuller development and more precise language.').trim(),
  };
}

function extractJson(text) {
  const source = String(text || '').trim();
  if (!source) throw new Error('The AI provider returned an empty response');
  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || source.slice(source.indexOf('{'), source.lastIndexOf('}') + 1);
  return JSON.parse(candidate);
}

function getMessageContent(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(part => part?.text || part?.content || '').join('');
  }
  if (typeof data?.output_text === 'string') return data.output_text;
  throw new Error('The AI provider response did not contain feedback text');
}

function buildPrompt({ prompt, essay, taskType }) {
  return [
    `IELTS writing task type: ${taskType || 'unknown'}`,
    'Writing question and instructions:',
    prompt || 'No task prompt was supplied. Evaluate how clearly and fully the response develops its apparent purpose.',
    '',
    'Candidate response:',
    essay,
  ].join('\n');
}

function buildWritingPrompt({ title, description, prompt, instruction, questionText, taskType }) {
  return [
    title ? `Title: ${title}` : '',
    taskType ? `Task type: ${taskType}` : '',
    description ? `Topic/context: ${description}` : '',
    prompt ? `Prompt: ${prompt}` : '',
    instruction ? `Instructions: ${instruction}` : '',
    questionText ? `Question: ${questionText}` : '',
  ].filter(Boolean).join('\n');
}

async function evaluateWriting({ prompt, essay, taskType }) {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) return null;

  const apiUrl = process.env.AI_API_URL?.trim() || DEFAULT_API_URL;
  const model = process.env.AI_MODEL?.trim() || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 45000));

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a careful IELTS Writing examiner. Assess only the supplied candidate response against the supplied writing question and instructions.
Use the task prompt as the source of topic, purpose, and required response type. If the essay is about children, technology, cities, charts, maps, or any other topic, judge relevance against that exact topic instead of giving generic feedback.
Return valid JSON with this exact shape:
{
  "overall_band": 6.5,
  "criteria": [
    {"label":"Task Achievement","band":6.5,"feedback":"3-5 sentences. Explain exactly what is relevant or missing for this prompt, whether the position/overview is clear, how well ideas or data are developed, and one specific improvement."},
    {"label":"Coherence and Cohesion","band":6.5,"feedback":"3-5 sentences. Explain paragraphing, logical flow, referencing, linking, repetition, and one specific improvement."},
    {"label":"Grammar","band":6.5,"feedback":"3-5 sentences. Explain sentence range, accuracy, recurring error types, punctuation/control, and one specific improvement."},
    {"label":"Lexical Resource / Vocabulary","band":6.5,"feedback":"3-5 sentences. Explain vocabulary precision for this topic, collocations, repetition, word-form/spelling issues, and one specific improvement."}
  ],
  "strengths": ["Three specific strengths tied to the response"],
  "improvements": ["Three concrete next steps tied to the response"],
  "summary": "4-6 sentences giving a detailed overall assessment with the main reason for the band."
}
Use IELTS bands from 0 to 9 in 0.5 increments. Be direct and specific, but supportive. Do not claim this is an official score.`,
          },
          { role: 'user', content: buildPrompt({ prompt, essay, taskType }) },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`AI provider request failed (${response.status}): ${detail.slice(0, 300)}`);
    }

    return normalizeFeedback(extractJson(getMessageContent(await response.json())));
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { evaluateWriting, normalizeFeedback, buildWritingPrompt };
