const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads/speaking');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only audio uploads are allowed'));
    }
    cb(null, true);
  },
});

router.post('/', auth, upload.single('audio'), async (req, res) => {
  try {
    const { attempt_id, passage_id, part_index } = req.body;

    if (!attempt_id || part_index === undefined || !req.file) {
      return res.status(400).json({ error: 'attempt_id, part_index, and audio are required' });
    }

    const attempt = await get('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [attempt_id, req.user.id]);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    const existing = await get(
      'SELECT id, audio_path FROM speaking_submissions WHERE attempt_id = ? AND part_index = ?',
      [attempt_id, Number(part_index)]
    );

    const audioPath = `/uploads/speaking/${req.file.filename}`;
    const score = 6.0;

    if (existing) {
      await run(
        `UPDATE speaking_submissions SET
          passage_id = ?,
          audio_path = ?,
          mime_type = ?,
          file_size = ?,
          score = ?
         WHERE id = ?`,
        [passage_id || null, audioPath, req.file.mimetype, req.file.size, score, existing.id]
      );

      if (existing.audio_path) {
        const oldPath = path.join(__dirname, '../..', existing.audio_path);
        fs.promises.unlink(oldPath).catch(() => {});
      }

      return res.json({ message: 'Speaking submission updated', id: existing.id, audio_path: audioPath, score });
    }

    const id = uuidv4();
    await run(
      `INSERT INTO speaking_submissions
        (id, attempt_id, passage_id, user_id, part_index, audio_path, mime_type, file_size, score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, attempt_id, passage_id || null, req.user.id, Number(part_index), audioPath, req.file.mimetype, req.file.size, score]
    );

    res.status(201).json({ message: 'Speaking submitted', id, audio_path: audioPath, score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const submissions = await all(
      `SELECT ss.*, p.title AS passage_title
       FROM speaking_submissions ss
       LEFT JOIN passages p ON ss.passage_id = p.id
       WHERE ss.user_id = ?
       ORDER BY ss.submitted_at DESC`,
      [req.user.id]
    );
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
