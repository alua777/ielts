require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/passages', require('./routes/passages'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/attempts', require('./routes/attempts'));
app.use('/api/writing', require('./routes/writing'));
app.use('/api/speaking', require('./routes/speaking'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IELTS API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Init DB then start server
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 IELTS API running on http://localhost:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  POST   /api/auth/register`);
    console.log(`  POST   /api/auth/login`);
    console.log(`  GET    /api/auth/me`);
    console.log(`  GET    /api/questions?section=reading`);
    console.log(`  POST   /api/questions`);
    console.log(`  POST   /api/attempts`);
    console.log(`  POST   /api/attempts/:id/answers`);
    console.log(`  POST   /api/attempts/:id/complete`);
    console.log(`  GET    /api/attempts`);
    console.log(`  POST   /api/writing`);
    console.log(`  GET    /api/writing`);
    console.log(`  POST   /api/speaking`);
    console.log(`  GET    /api/speaking`);
  });
}).catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.error('\nFailed to initialize database: PostgreSQL is not reachable.');
    console.error(`DATABASE_URL: ${process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ielts'}`);
    console.error('\nStart a local database first:');
    console.error('  cd backend');
    console.error('  npm run db:up');
    console.error('\nIf Docker Desktop is not running, open Docker Desktop first, then rerun npm run db:up.\n');
  } else {
    console.error('Failed to initialize database:', err);
  }
  process.exit(1);
});
