const express = require('express');
const { all, get } = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();

function parseFeedback(row) {
  return row && {
    ...row,
    overall_band: Number(row.overall_band),
    criteria: row.criteria || [],
    strengths: row.strengths || [],
    improvements: row.improvements || [],
  };
}

router.get('/', auth, async (req, res) => {
  try {
    const feedback = await all(
      `SELECT af.*, pt.title AS test_title
       FROM ai_feedback_results af
       JOIN practice_tests pt ON pt.id = af.test_id
       WHERE af.user_id = ?
       ORDER BY af.created_at DESC`,
      [req.user.id]
    );
    res.json({ feedback: feedback.map(parseFeedback) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/test/:testId', auth, async (req, res) => {
  try {
    const feedback = await all(
      `SELECT af.*, pt.title AS test_title
       FROM ai_feedback_results af
       JOIN practice_tests pt ON pt.id = af.test_id
       WHERE af.user_id = ? AND af.test_id = ?
       ORDER BY af.created_at DESC`,
      [req.user.id, req.params.testId]
    );
    res.json({ feedback: feedback.map(parseFeedback) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const feedback = await get(
      `SELECT af.*, pt.title AS test_title
       FROM ai_feedback_results af
       JOIN practice_tests pt ON pt.id = af.test_id
       WHERE af.id = ? AND af.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!feedback) return res.status(404).json({ error: 'AI feedback not found' });
    res.json({ feedback: parseFeedback(feedback) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
