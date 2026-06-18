const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { get, run } = require('../db/database');
const { resolveRole } = require('../utils/admin');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ielts_secret_key_change_in_production';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const role = resolveRole(email);

    await run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, role]
    );

    const token = jwt.sign({ id, name, email, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id, name, email, role, status: 'active' },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status === 'banned')
      return res.status(403).json({ error: 'This account has been banned' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const role = resolveRole(user.email, user.role);
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role, status: user.status },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await get('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
