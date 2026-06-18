const auth = require('./auth');
const { get } = require('../db/database');
const { isAdminEmail } = require('../utils/admin');

async function adminMiddleware(req, res, next) {
  auth(req, res, async () => {
    try {
      const user = await get('SELECT id, email, role, status FROM users WHERE id = ?', [req.user.id]);
      if (!user) return res.status(401).json({ error: 'User not found' });
      if (user.status === 'banned') return res.status(403).json({ error: 'Account is banned' });
      if (user.role !== 'admin' && !isAdminEmail(user.email)) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      req.admin = user;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = adminMiddleware;
