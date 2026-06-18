function clamp(value, min = 4, max = 8) {
  return Math.min(max, Math.max(min, value));
}

function roundHalf(value) {
  return Math.round(value * 2) / 2;
}

function wordCount(value = '') {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function variation(value = '') {
  return [...value].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 5;
}

function criterion(label, band, feedback) {
  return { label, band: roundHalf(clamp(band)), feedback };
}

function buildWritingFeedback(submissions) {
  if (!submissions.length) {
    return {
      section: 'writing',
      overall_band: 6,
      criteria: [
        criterion('Task Achievement', 6, 'The response addresses the task, but the main ideas need fuller development.'),
        criterion('Coherence and Cohesion', 6, 'The organisation is clear overall. Use more purposeful paragraphing and linking.'),
        criterion('Grammar', 6, 'A mix of sentence forms is visible, with some errors that reduce precision.'),
        criterion('Lexical Resource / Vocabulary', 6, 'Vocabulary is suitable for the topic. Use more precise academic language.'),
      ],
      strengths: ['A clear attempt to answer the task.', 'The central message is generally easy to follow.'],
      improvements: ['Develop each main idea with a specific example.', 'Review sentence boundaries and word choice.'],
      summary: 'Estimated mock feedback is available, but no complete writing response was found.',
      submissions: [],
    };
  }

  const scored = submissions.map(submission => {
    const words = wordCount(submission.essay_text);
    const target = submission.task_type === 'task1' ? 150 : 250;
    const sentences = submission.essay_text.split(/[.!?]+/).filter(item => item.trim()).length;
    const base = clamp(4.5 + Math.min(words / target, 1) * 1.4 + Math.min(sentences / 12, 1) * 0.6 + variation(submission.essay_text) * 0.1);
    return { ...submission, estimated_band: roundHalf(base), word_count: words };
  });
  const overall = roundHalf(scored.reduce((sum, item) => sum + item.estimated_band, 0) / scored.length);

  return {
    section: 'writing',
    overall_band: overall,
    criteria: [
      criterion('Task Achievement', overall, 'The response answers the task and presents a position. Develop supporting details more fully.'),
      criterion('Coherence and Cohesion', overall + 0.25, 'Ideas progress logically. Make paragraph purposes clearer and avoid mechanical linking.'),
      criterion('Grammar', overall - 0.25, 'There is a useful range of structures. Check agreement, articles, and punctuation.'),
      criterion('Lexical Resource / Vocabulary', overall, 'Vocabulary is generally appropriate. Add more precise topic-specific language.'),
    ],
    strengths: ['The response stays relevant to the task.', 'Ideas are organised into a readable progression.'],
    improvements: ['Support claims with more specific evidence or examples.', 'Leave time to proofread grammar and repeated vocabulary.'],
    summary: `This AI Feedback Preview estimates a Writing Band ${overall.toFixed(1)} based on response length, development, and language variety.`,
    submissions: scored,
  };
}

function buildSpeakingFeedback(submissions) {
  const available = submissions.length > 0;
  const averageSize = available
    ? submissions.reduce((sum, item) => sum + Number(item.file_size || 0), 0) / submissions.length
    : 0;
  const durationProxy = clamp(5.5 + Math.min(averageSize / 250000, 1) * 0.5 + Math.min(submissions.length / 3, 1) * 0.5);
  const overall = available ? roundHalf(durationProxy) : 6;

  return {
    section: 'speaking',
    overall_band: overall,
    criteria: [
      criterion('Fluency and Coherence', overall, 'Answers are generally sustained. Reduce pauses and connect ideas more naturally.'),
      criterion('Lexical Resource / Vocabulary', overall, 'Vocabulary communicates the main ideas clearly. Use more flexible paraphrasing.'),
      criterion('Grammar', overall - 0.25, 'A useful range of sentence forms is attempted. Improve accuracy in longer answers.'),
      criterion('Pronunciation', overall + 0.25, 'Speech is generally understandable. Use clearer stress and more varied intonation.'),
    ],
    strengths: ['You completed the speaking parts and maintained a clear response.', 'The main ideas are understandable.'],
    improvements: ['Extend answers with reasons and examples.', 'Practise natural pacing, sentence stress, and fewer filler words.'],
    summary: available
      ? `This AI Feedback Preview estimates a Speaking Band ${overall.toFixed(1)} from the submitted recordings.`
      : 'Estimated mock feedback is available, but no speaking recordings were found.',
    submissions,
  };
}

function buildMockExamFeedback(writingSubmissions, speakingSubmissions) {
  return {
    disclaimer: 'AI Feedback Preview: practice estimate only, not an official IELTS score.',
    writing: buildWritingFeedback(writingSubmissions),
    speaking: buildSpeakingFeedback(speakingSubmissions),
  };
}

module.exports = { buildMockExamFeedback };
