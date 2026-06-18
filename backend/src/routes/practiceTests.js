const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();
const SECTIONS = new Set(['reading', 'listening', 'writing', 'speaking']);
const DIFFICULTIES = new Set(['Beginner', 'Intermediate', 'Advanced']);

function parseTest(row) {
  if (!row) return null;
  return {
    ...row,
    duration_minutes: Number(row.duration_minutes),
    latest_band: row.latest_band == null ? null : Number(row.latest_band),
    question_types: row.question_types || [],
    content: row.content || {},
  };
}

const joinedSelect = `
  SELECT pt.*,
    COALESCE(pp.status, 'not_started') AS status,
    pp.latest_band AS latest_band
  FROM practice_tests pt
  LEFT JOIN practice_test_progress pp
    ON pp.test_id = pt.id AND pp.user_id = ?
`;

function validatePayload(body, partial = false) {
  const required = ['section', 'title', 'description', 'difficulty', 'duration_minutes'];
  if (!partial) {
    const missing = required.filter(key => body[key] === undefined || body[key] === '');
    if (missing.length) return `Missing required fields: ${missing.join(', ')}`;
  }
  if (body.section && !SECTIONS.has(body.section)) return 'Invalid section';
  if (body.difficulty && !DIFFICULTIES.has(body.difficulty)) return 'Invalid difficulty';
  if (body.duration_minutes !== undefined && Number(body.duration_minutes) <= 0) {
    return 'duration_minutes must be greater than zero';
  }
  return null;
}

router.get('/', auth, async (req, res) => {
  try {
    const conditions = [];
    const params = [req.user.id];
    const add = (sql, value) => {
      conditions.push(sql);
      params.push(value);
    };

    conditions.push('pt.published = TRUE');
    if (req.query.section) add('pt.section = ?', req.query.section);
    if (req.query.difficulty) add('pt.difficulty = ?', req.query.difficulty);
    if (req.query.status) add("COALESCE(pp.status, 'not_started') = ?", req.query.status);
    if (req.query.search) {
      conditions.push('(pt.title ILIKE ? OR pt.description ILIKE ?)');
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const tests = await all(
      `${joinedSelect} ${where}
       ORDER BY pt.section, pt.created_at, pt.title`,
      params
    );
    res.json({ tests: tests.map(parseTest) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/section/:section', auth, async (req, res) => {
  try {
    if (!SECTIONS.has(req.params.section)) {
      return res.status(400).json({ error: 'Invalid section' });
    }
    const tests = await all(
      `${joinedSelect} WHERE pt.section = ? AND pt.published = TRUE ORDER BY pt.created_at, pt.title`,
      [req.user.id, req.params.section]
    );
    res.json({ tests: tests.map(parseTest) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const test = await get(`${joinedSelect} WHERE pt.id = ? AND pt.published = TRUE`, [req.user.id, req.params.id]);
    if (!test) return res.status(404).json({ error: 'Practice test not found' });
    res.json({ test: parseTest(test) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const validationError = validatePayload(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const id = req.body.id || uuidv4();
    await run(
      `INSERT INTO practice_tests
       (id, section, title, description, difficulty, duration_minutes, question_types, status, latest_band, content)
       VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?::jsonb)`,
      [
        id,
        req.body.section,
        req.body.title,
        req.body.description,
        req.body.difficulty,
        Number(req.body.duration_minutes),
        JSON.stringify(req.body.question_types || []),
        req.body.status || 'not_started',
        req.body.latest_band ?? null,
        JSON.stringify(req.body.content || {}),
      ]
    );
    const test = await get(`${joinedSelect} WHERE pt.id = ?`, [req.user.id, id]);
    res.status(201).json({ test: parseTest(test) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM practice_tests WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Practice test not found' });
    const validationError = validatePayload(req.body, true);
    if (validationError) return res.status(400).json({ error: validationError });

    const next = { ...existing, ...req.body };
    await run(
      `UPDATE practice_tests SET
        section = ?, title = ?, description = ?, difficulty = ?, duration_minutes = ?,
        question_types = ?::jsonb, content = ?::jsonb,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        next.section,
        next.title,
        next.description,
        next.difficulty,
        Number(next.duration_minutes),
        JSON.stringify(next.question_types || []),
        JSON.stringify(next.content || {}),
        req.params.id,
      ]
    );
    if (req.body.status !== undefined || req.body.latest_band !== undefined) {
      await run(
        `INSERT INTO practice_test_progress (user_id, test_id, status, latest_band)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (user_id, test_id) DO UPDATE SET
           status = EXCLUDED.status,
           latest_band = COALESCE(EXCLUDED.latest_band, practice_test_progress.latest_band),
           updated_at = CURRENT_TIMESTAMP`,
        [
          req.user.id,
          req.params.id,
          req.body.status || existing.status || 'not_started',
          req.body.latest_band ?? null,
        ]
      );
    }
    const test = await get(`${joinedSelect} WHERE pt.id = ?`, [req.user.id, req.params.id]);
    res.json({ test: parseTest(test) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await get('SELECT id FROM practice_tests WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Practice test not found' });
    await run('DELETE FROM practice_tests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Practice test deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
