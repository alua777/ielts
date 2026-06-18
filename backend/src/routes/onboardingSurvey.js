const express = require('express');
const { get, run } = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();
const SECTIONS = new Set(['reading', 'listening', 'writing', 'speaking']);

function parseSurvey(row) {
  if (!row) return null;
  return {
    ...row,
    current_band: row.current_band == null ? null : Number(row.current_band),
    target_band: row.target_band == null ? null : Number(row.target_band),
    study_hours: row.study_hours == null ? null : Number(row.study_hours),
    weak_sections: row.weak_sections || [],
  };
}

router.post('/', auth, async (req, res) => {
  try {
    const { current_band, target_band, weak_sections = [], exam_date, study_hours } = req.body;
    const weakSections = Array.isArray(weak_sections)
      ? weak_sections.filter(section => SECTIONS.has(section))
      : [];

    await run(
      `INSERT INTO onboarding_surveys
       (user_id, current_band, target_band, weak_sections, exam_date, study_hours)
       VALUES (?, ?, ?, ?::jsonb, ?, ?)
       ON CONFLICT (user_id) DO UPDATE SET
         current_band = EXCLUDED.current_band,
         target_band = EXCLUDED.target_band,
         weak_sections = EXCLUDED.weak_sections,
         exam_date = EXCLUDED.exam_date,
         study_hours = EXCLUDED.study_hours,
         updated_at = CURRENT_TIMESTAMP`,
      [
        req.user.id,
        current_band === '' || current_band == null ? null : Number(current_band),
        target_band === '' || target_band == null ? null : Number(target_band),
        JSON.stringify(weakSections),
        exam_date || null,
        study_hours === '' || study_hours == null ? null : Number(study_hours),
      ]
    );

    const survey = await get('SELECT * FROM onboarding_surveys WHERE user_id = ?', [req.user.id]);
    res.status(201).json({ survey: parseSurvey(survey) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', auth, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const survey = await get('SELECT * FROM onboarding_surveys WHERE user_id = ?', [req.params.userId]);
    res.json({ survey: parseSurvey(survey) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
