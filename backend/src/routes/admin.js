const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const admin = require('../middleware/admin');
const { all, get, run } = require('../db/database');

const router = express.Router();
const audioDir = path.join(__dirname, '../../uploads/listening');
fs.mkdirSync(audioDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, audioDir),
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname) || '.mp3'}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) return cb(new Error('Only audio files are allowed'));
    cb(null, true);
  },
});

router.use(admin);

function parseTest(row) {
  return row && {
    ...row,
    duration_minutes: Number(row.duration_minutes),
    latest_band: row.latest_band == null ? null : Number(row.latest_band),
    question_types: row.question_types || [],
    content: row.content || {},
    published: Boolean(row.published),
  };
}

router.get('/summary', async (_req, res) => {
  try {
    const [users, activeUsers, tests, publishedTests, attempts, feedback] = await Promise.all([
      get('SELECT COUNT(*)::int AS count FROM users'),
      get(`SELECT COUNT(DISTINCT user_id)::int AS count FROM exam_attempts WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '7 days'`),
      get('SELECT COUNT(*)::int AS count FROM practice_tests'),
      get('SELECT COUNT(*)::int AS count FROM practice_tests WHERE published = TRUE'),
      get('SELECT COUNT(*)::int AS count FROM exam_attempts'),
      get('SELECT COUNT(*)::int AS count FROM ai_feedback_results'),
    ]);
    const difficultQuestionTypes = await all(
      `SELECT qg.question_type,
        COUNT(*)::int AS answered,
        ROUND(AVG(CASE WHEN a.is_correct = 1 THEN 0 ELSE 1 END)::numeric, 2)::float AS incorrect_rate
       FROM answers a
       JOIN questions q ON q.id = a.question_id
       JOIN question_groups qg ON qg.id = q.group_id
       WHERE a.is_correct IS NOT NULL
       GROUP BY qg.question_type
       HAVING COUNT(*) > 0
       ORDER BY incorrect_rate DESC, answered DESC
       LIMIT 6`
    );
    res.json({
      summary: {
        total_users: users.count,
        active_users: activeUsers.count,
        practice_tests: tests.count,
        published_tests: publishedTests.count,
        attempts: attempts.count,
        ai_feedback: feedback.count,
      },
      difficult_question_types: difficultQuestionTypes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/practice-tests', async (req, res) => {
  try {
    const conditions = [];
    const params = [];
    const add = (sql, value) => { conditions.push(sql); params.push(value); };
    if (req.query.section) add('section = ?', req.query.section);
    if (req.query.search) {
      conditions.push('(title ILIKE ? OR description ILIKE ?)');
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const tests = await all(`SELECT * FROM practice_tests ${where} ORDER BY updated_at DESC, title`, params);
    res.json({ tests: tests.map(parseTest) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/practice-tests', async (req, res) => {
  try {
    const id = req.body.id || uuidv4();
    await run(
      `INSERT INTO practice_tests
       (id, section, title, description, difficulty, duration_minutes, question_types, published, content)
       VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?::jsonb)`,
      [
        id,
        req.body.section,
        req.body.title,
        req.body.description,
        req.body.difficulty || 'Intermediate',
        Number(req.body.duration_minutes || 20),
        JSON.stringify(req.body.question_types || []),
        req.body.published !== false,
        JSON.stringify(req.body.content || {}),
      ]
    );
    const test = await get('SELECT * FROM practice_tests WHERE id = ?', [id]);
    res.status(201).json({ test: parseTest(test) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/practice-tests/:id', async (req, res) => {
  try {
    const existing = await get('SELECT * FROM practice_tests WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Practice test not found' });
    const next = { ...existing, ...req.body };
    await run(
      `UPDATE practice_tests SET
       section = ?, title = ?, description = ?, difficulty = ?, duration_minutes = ?,
       question_types = ?::jsonb, published = ?, content = ?::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        next.section,
        next.title,
        next.description,
        next.difficulty,
        Number(next.duration_minutes),
        JSON.stringify(next.question_types || []),
        next.published !== false,
        JSON.stringify(next.content || {}),
        req.params.id,
      ]
    );
    const test = await get('SELECT * FROM practice_tests WHERE id = ?', [req.params.id]);
    res.json({ test: parseTest(test) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/practice-tests/:id/publish', async (req, res) => {
  try {
    await run('UPDATE practice_tests SET published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.body.published !== false, req.params.id]);
    const test = await get('SELECT * FROM practice_tests WHERE id = ?', [req.params.id]);
    if (!test) return res.status(404).json({ error: 'Practice test not found' });
    res.json({ test: parseTest(test) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/practice-tests/:id/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'audio file is required' });
    const test = await get('SELECT * FROM practice_tests WHERE id = ?', [req.params.id]);
    if (!test) return res.status(404).json({ error: 'Practice test not found' });
    const content = { ...(test.content || {}), audio_url: `/uploads/listening/${req.file.filename}` };
    await run('UPDATE practice_tests SET content = ?::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(content), req.params.id]);
    res.json({ audio_url: content.audio_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/practice-tests/:id', async (req, res) => {
  try {
    await run('DELETE FROM practice_tests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Practice test deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const params = [];
    const where = req.query.search
      ? 'WHERE u.name ILIKE ? OR u.email ILIKE ?'
      : '';
    if (req.query.search) params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    const users = await all(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.created_at,
        COUNT(DISTINCT ea.id)::int AS attempts_count,
        COUNT(DISTINCT af.id)::int AS feedback_count,
        MAX(COALESCE(ea.completed_at, ea.started_at, af.created_at)) AS last_activity,
        ROUND(AVG(ea.band_score)::numeric, 2)::float AS average_band
       FROM users u
       LEFT JOIN exam_attempts ea ON ea.user_id = u.id
       LEFT JOIN ai_feedback_results af ON af.user_id = u.id
       ${where}
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      params
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const updates = [];
    const params = [];
    if (req.body.status) { updates.push('status = ?'); params.push(req.body.status); }
    if (req.body.role) { updates.push('role = ?'); params.push(req.body.role); }
    if (!updates.length) return res.status(400).json({ error: 'No updates provided' });
    params.push(req.params.id);
    await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    const user = await get('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [req.params.id]);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id/attempts', async (req, res) => {
  try {
    await run('DELETE FROM exam_attempts WHERE user_id = ?', [req.params.id]);
    await run('DELETE FROM ai_feedback_results WHERE user_id = ?', [req.params.id]);
    await run('DELETE FROM practice_test_progress WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User attempts and practice progress reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' });
    await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
