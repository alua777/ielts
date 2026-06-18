const express = require('express');
const { all } = require('../db/database');
const auth = require('../middleware/auth');
const { buildMockExamFeedback } = require('../utils/mockExamFeedback');

const router = express.Router();

function matches(item, query) {
  const section = query.section;
  const status = query.status;
  const search = query.search?.trim().toLowerCase();
  return (!section || section === 'all' || item.section === section)
    && (!status || status === 'all' || item.status === status)
    && (!search || item.title.toLowerCase().includes(search));
}

function sortItems(items, sort) {
  return [...items].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sort === 'highest') return Number(b.estimated_band || 0) - Number(a.estimated_band || 0);
    if (sort === 'lowest') return Number(a.estimated_band || 0) - Number(b.estimated_band || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

router.get('/', auth, async (req, res) => {
  try {
    const examAttempts = await all(
      `SELECT ea.*,
        COUNT(a.id) FILTER (WHERE a.is_correct IS NOT NULL) AS score_total,
        COUNT(a.id) FILTER (WHERE a.is_correct = 1) AS score_raw
       FROM exam_attempts ea
       LEFT JOIN answers a ON a.attempt_id = ea.id
       WHERE ea.user_id = ?
       GROUP BY ea.id`,
      [req.user.id]
    );

    const practiceProgress = await all(
      `SELECT pp.*, pt.title, pt.section, pt.duration_minutes
       FROM practice_test_progress pp
       JOIN practice_tests pt ON pt.id = pp.test_id
       WHERE pp.user_id = ?`,
      [req.user.id]
    );

    const aiFeedback = await all(
      `SELECT af.*, pt.title, pt.duration_minutes
       FROM ai_feedback_results af
       JOIN practice_tests pt ON pt.id = af.test_id
       WHERE af.user_id = ?
       ORDER BY af.created_at DESC`,
      [req.user.id]
    );

    const examHistory = await Promise.all(examAttempts.map(async attempt => {
      let criteria = null;
      if (attempt.status === 'completed') {
        const writingAnswers = await all(
          `SELECT a.id, a.question_id, a.user_answer AS essay_text, q.question_text,
             p.title AS passage_title
           FROM answers a
           JOIN questions q ON q.id = a.question_id
           JOIN question_groups qg ON qg.id = q.group_id
           JOIN passages p ON p.id = qg.passage_id
           WHERE a.attempt_id = ? AND p.section = 'writing' AND a.user_answer <> ''`,
          [attempt.id]
        );
        const speaking = await all(
          'SELECT * FROM speaking_submissions WHERE attempt_id = ? ORDER BY part_index',
          [attempt.id]
        );
        const feedback = buildMockExamFeedback(writingAnswers, speaking);
        criteria = {
          writing: feedback.writing.criteria,
          speaking: feedback.speaking.criteria,
        };
      }

      return {
        id: attempt.id,
        source: 'mock',
        title: attempt.section === 'full' ? 'Full Mock Test' : `${attempt.section[0].toUpperCase()}${attempt.section.slice(1)} Test`,
        section: attempt.section === 'full' ? 'mock' : attempt.section,
        status: attempt.status,
        score_raw: Number(attempt.score_raw || 0),
        score_total: Number(attempt.score_total || 0),
        estimated_band: attempt.band_score == null ? null : Number(attempt.band_score),
        duration_minutes: attempt.time_taken_seconds ? Math.max(1, Math.round(attempt.time_taken_seconds / 60)) : null,
        criteria,
        created_at: attempt.completed_at || attempt.started_at,
        review_url: `/review-answers?attempt=${attempt.id}`,
      };
    }));

    const latestFeedbackByTest = new Map();
    aiFeedback.forEach(feedback => {
      if (!latestFeedbackByTest.has(feedback.test_id)) latestFeedbackByTest.set(feedback.test_id, feedback);
    });

    const practiceHistory = practiceProgress
      .filter(progress => progress.status !== 'not_started')
      .map(progress => {
        const feedback = latestFeedbackByTest.get(progress.test_id);
        if (feedback) {
          return {
            id: feedback.id,
            source: 'practice',
            test_id: feedback.test_id,
            title: feedback.title,
            section: feedback.section,
            status: 'reviewed',
            score_raw: null,
            score_total: null,
            estimated_band: Number(feedback.overall_band),
            duration_minutes: Number(feedback.duration_minutes),
            criteria: feedback.criteria || [],
            created_at: feedback.created_at,
            review_url: `/practice/feedback/${feedback.id}`,
          };
        }
        return {
          id: `${progress.user_id}:${progress.test_id}`,
          source: 'practice',
          test_id: progress.test_id,
          title: progress.title,
          section: progress.section,
          status: progress.status,
          score_raw: null,
          score_total: null,
          estimated_band: progress.latest_band == null ? null : Number(progress.latest_band),
          duration_minutes: Number(progress.duration_minutes),
          criteria: null,
          created_at: progress.updated_at,
          review_url: `/practice/test/${progress.test_id}`,
        };
      });

    const items = sortItems(
      [...examHistory, ...practiceHistory].filter(item => matches(item, req.query)),
      req.query.sort
    );
    const bands = items.map(item => item.estimated_band).filter(value => value != null);
    const stats = {
      total_attempts: items.length,
      average_band: bands.length ? bands.reduce((sum, value) => sum + value, 0) / bands.length : null,
      best_band: bands.length ? Math.max(...bands) : null,
      practice_minutes: items.reduce((sum, item) => sum + Number(item.duration_minutes || 0), 0),
    };

    res.json({ attempts: items, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
