const express = require('express');
const { all, get } = require('../db/database');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/passages?section=reading
// Returns passages with nested groups and questions
router.get('/', auth, async (req, res) => {
  try {
    const { section } = req.query;
    const passages = section
      ? await all('SELECT * FROM passages WHERE section = ? ORDER BY order_index', [section])
      : await all('SELECT * FROM passages ORDER BY section, order_index');

    const result = await Promise.all(passages.map(async passage => {
      const groups = await all(
        'SELECT * FROM question_groups WHERE passage_id = ? ORDER BY order_index',
        [passage.id]
      );

      const groupsWithQuestions = await Promise.all(groups.map(async group => {
        const questions = (await all(
          'SELECT * FROM questions WHERE group_id = ? ORDER BY question_number',
          [group.id]
        )).map(q => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : null,
        }));

        return { ...group, questions };
      }));

      return { ...passage, groups: groupsWithQuestions };
    }));

    res.json({ passages: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/passages/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const passage = await get('SELECT * FROM passages WHERE id = ?', [req.params.id]);
    if (!passage) return res.status(404).json({ error: 'Passage not found' });

    const groups = await all(
      'SELECT * FROM question_groups WHERE passage_id = ? ORDER BY order_index',
      [passage.id]
    );

    const groupsWithQuestions = await Promise.all(groups.map(async group => {
      const questions = (await all(
        'SELECT * FROM questions WHERE group_id = ? ORDER BY question_number',
        [group.id]
      )).map(q => ({ ...q, options: q.options ? JSON.parse(q.options) : null }));
      return { ...group, questions };
    }));

    res.json({ passage: { ...passage, groups: groupsWithQuestions } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
