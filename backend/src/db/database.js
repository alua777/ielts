const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ielts';

const pool = new Pool({ connectionString, max: Number(process.env.PG_POOL_MAX || 10) });
let writeQueue = Promise.resolve();

function normalizeQuery(query) {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

async function getDb() {
  await createTables();
  return pool;
}

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS passages (
      id TEXT PRIMARY KEY,
      section TEXT NOT NULL CHECK(section IN ('reading', 'listening', 'writing', 'speaking')),
      title TEXT NOT NULL,
      body TEXT,
      audio_url TEXT,
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query('ALTER TABLE passages ADD COLUMN IF NOT EXISTS audio_url TEXT');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS question_groups (
      id TEXT PRIMARY KEY,
      passage_id TEXT NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
      question_type TEXT NOT NULL CHECK(question_type IN ('matching', 'fill_blank', 'true_false', 'mcq', 'essay', 'speaking_prompt')),
      instruction TEXT NOT NULL,
      from_number INTEGER NOT NULL,
      to_number INTEGER NOT NULL,
      order_index INTEGER DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES question_groups(id) ON DELETE CASCADE,
      question_number INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      section TEXT NOT NULL CHECK(section IN ('reading', 'listening', 'writing', 'speaking', 'full')),
      status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed')),
      started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMPTZ,
      time_taken_seconds INTEGER,
      total_score REAL,
      band_score REAL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      user_answer TEXT,
      is_correct INTEGER,
      score REAL DEFAULT 0,
      submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS writing_submissions (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      essay_text TEXT NOT NULL,
      task_type TEXT CHECK(task_type IN ('task1', 'task2')),
      word_count INTEGER,
      score REAL,
      feedback TEXT,
      submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS speaking_submissions (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
      passage_id TEXT REFERENCES passages(id) ON DELETE SET NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      part_index INTEGER NOT NULL,
      audio_path TEXT NOT NULL,
      mime_type TEXT,
      file_size INTEGER,
      score REAL DEFAULT 6.0,
      feedback TEXT,
      submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (attempt_id, part_index)
    )
  `);
}

async function all(query, params = []) {
  await writeQueue;
  const result = await pool.query(normalizeQuery(query), params);
  return result.rows;
}

async function get(query, params = []) {
  const rows = await all(query, params);
  return rows[0] || null;
}

async function run(query, params = []) {
  writeQueue = writeQueue.then(() => pool.query(normalizeQuery(query), params));
  await writeQueue;
}

async function waitForDb() {
  await writeQueue;
}

module.exports = { getDb, all, get, run, waitForDb, pool };
