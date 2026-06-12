const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/writing  — submit a writing essay
router.post('/', auth, async (req, res) => {
  try {
    const { attempt_id, question_id, essay_text, task_type } = req.body;

    if (!attempt_id || !question_id || !essay_text)
      return res.status(400).json({ error: 'attempt_id, question_id, and essay_text are required' });

    const attempt = await get('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [attempt_id, req.user.id]);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    const wordCount = essay_text.trim().split(/\s+/).filter(Boolean).length;

    const existing = await get(
      'SELECT id FROM writing_submissions WHERE attempt_id = ? AND question_id = ?',
      [attempt_id, question_id]
    );

    if (existing) {
      await run(
        'UPDATE writing_submissions SET essay_text = ?, word_count = ?, task_type = ? WHERE id = ?',
        [essay_text, wordCount, task_type || null, existing.id]
      );
      return res.json({ message: 'Writing submission updated', id: existing.id, word_count: wordCount });
    }

    const id = uuidv4();
    await run(
      `INSERT INTO writing_submissions (id, attempt_id, question_id, user_id, essay_text, task_type, word_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, attempt_id, question_id, req.user.id, essay_text, task_type || null, wordCount]
    );

    res.status(201).json({ message: 'Writing submitted', id, word_count: wordCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/writing  — get all writing submissions for user
router.get('/', auth, async (req, res) => {
  try {
    const submissions = await all(
      `SELECT ws.*, q.question_text, p.title AS passage_title
       FROM writing_submissions ws
       JOIN questions q ON ws.question_id = q.id
       JOIN question_groups qg ON q.group_id = qg.id
       JOIN passages p ON qg.passage_id = p.id
       WHERE ws.user_id = ?
       ORDER BY ws.submitted_at DESC`,
      [req.user.id]
    );
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/writing/:id  — get single submission
router.get('/:id', auth, async (req, res) => {
  try {
    const sub = await get(
      `SELECT ws.*, q.question_text, p.title AS passage_title
       FROM writing_submissions ws
       JOIN questions q ON ws.question_id = q.id
       JOIN question_groups qg ON q.group_id = qg.id
       JOIN passages p ON qg.passage_id = p.id
       WHERE ws.id = ? AND ws.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    res.json({ submission: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/writing/:id/score  — add score + feedback (for teacher/admin use)
router.patch('/:id/score', auth, async (req, res) => {
  try {
    const { score, feedback } = req.body;
    await run(
      'UPDATE writing_submissions SET score = ?, feedback = ? WHERE id = ?',
      [score ?? null, feedback || null, req.params.id]
    );
    res.json({ message: 'Score and feedback saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
