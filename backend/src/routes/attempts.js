const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');
const auth = require('../middleware/auth');

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
     `SELECT a.*, q.question_text, q.correct_answer, p.section
 FROM answers a
 JOIN questions q ON a.question_id = q.id
 JOIN question_groups qg ON q.group_id = qg.id
 JOIN passages p ON qg.passage_id = p.id
 WHERE a.attempt_id = ?`,
      [req.params.id]
    );

    res.json({ attempt, answers });
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
        is_correct = user_answer?.trim().toLowerCase() === question.correct_answer.trim().toLowerCase() ? 1 : 0;
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

    await run(
      `UPDATE exam_attempts SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        time_taken_seconds = ?,
        total_score = ?,
        band_score = ?
       WHERE id = ?`,
      [time_taken_seconds || null, correct, band, req.params.id]
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
