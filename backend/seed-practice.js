require('dotenv').config();
const { getDb, run } = require('./src/db/database');
const { practiceTests, mockTests } = require('./src/data/practiceTests');

async function seedPracticeTests() {
  await getDb();
  for (const test of practiceTests) {
    await run(
      `INSERT INTO practice_tests
       (id, section, title, description, difficulty, duration_minutes, question_types, content)
       VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         section = EXCLUDED.section,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         difficulty = EXCLUDED.difficulty,
         duration_minutes = EXCLUDED.duration_minutes,
         question_types = EXCLUDED.question_types,
         content = EXCLUDED.content,
         updated_at = CURRENT_TIMESTAMP`,
      [
        test.id,
        test.section,
        test.title,
        test.description,
        test.difficulty,
        test.duration_minutes,
        JSON.stringify(test.question_types),
        JSON.stringify(test.content),
      ]
    );
  }
  for (const test of mockTests) {
    await run(
      `INSERT INTO mock_tests
       (id, title, description, difficulty, duration_minutes, sections)
       VALUES (?, ?, ?, ?, ?, ?::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         difficulty = EXCLUDED.difficulty,
         duration_minutes = EXCLUDED.duration_minutes,
         sections = EXCLUDED.sections,
         updated_at = CURRENT_TIMESTAMP`,
      [
        test.id,
        test.title,
        test.description,
        test.difficulty,
        test.duration_minutes,
        JSON.stringify(test.sections),
      ]
    );
  }
  console.log(`Seeded ${practiceTests.length} practice tests and ${mockTests.length} full mock tests.`);
  process.exit(0);
}

seedPracticeTests().catch(error => {
  console.error('Practice seed failed:', error.message);
  process.exit(1);
});
