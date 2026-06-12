const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/questions?section=reading
router.get('/', auth, async (req, res) => {
  try {
    const { section } = req.query;
    let rows;
    if (section) {
      rows = await all(
        `SELECT q.*, qg.question_type, p.section, p.title AS passage_title, p.body AS passage_text, qg.order_index
         FROM questions q
         JOIN question_groups qg ON q.group_id = qg.id
         JOIN passages p ON qg.passage_id = p.id
         WHERE p.section = ?
         ORDER BY qg.order_index, q.question_number`,
        [section]
      );
    } else {
      rows = await all(
        `SELECT q.*, qg.question_type, p.section, p.title AS passage_title, p.body AS passage_text, qg.order_index
         FROM questions q
         JOIN question_groups qg ON q.group_id = qg.id
         JOIN passages p ON qg.passage_id = p.id
         ORDER BY p.section, qg.order_index, q.question_number`
      );
    }
    // Parse options JSON string back to array
    rows = rows.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
    }));
    res.json({ questions: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/questions/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const q = await get(
      `SELECT q.*, qg.question_type, p.section, p.title AS passage_title, p.body AS passage_text
       FROM questions q
       JOIN question_groups qg ON q.group_id = qg.id
       JOIN passages p ON qg.passage_id = p.id
       WHERE q.id = ?`,
      [req.params.id]
    );
    if (!q) return res.status(404).json({ error: 'Question not found' });
    q.options = q.options ? JSON.parse(q.options) : null;
    res.json({ question: q });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/questions  (add a question)
router.post('/', auth, async (req, res) => {
  try {
    const {
      group_id,
      question_text,
      question_number,
      options,
      correct_answer,
    } = req.body;

    if (!group_id || !question_text || !question_number)
      return res.status(400).json({ error: 'group_id, question_number, and question_text are required' });

    const id = uuidv4();
    await run(
      `INSERT INTO questions
        (id, group_id, question_number, question_text, options, correct_answer)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id, group_id, question_number, question_text,
        options ? JSON.stringify(options) : null,
        correct_answer || null,
      ]
    );

    res.status(201).json({ message: 'Question created', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/questions/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { question_text, options, correct_answer, question_number } = req.body;
    const q = await get('SELECT id FROM questions WHERE id = ?', [req.params.id]);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    await run(
      `UPDATE questions SET
        question_text = COALESCE(?, question_text),
        question_number = COALESCE(?, question_number),
        options = COALESCE(?, options),
        correct_answer = COALESCE(?, correct_answer)
       WHERE id = ?`,
      [
        question_text || null,
        question_number ?? null,
        options ? JSON.stringify(options) : null,
        correct_answer || null,
        req.params.id,
      ]
    );

    res.json({ message: 'Question updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/questions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await run('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
