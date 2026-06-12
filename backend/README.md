# IELTS Backend API

Node.js + Express + PostgreSQL backend for the IELTS practice app.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with your secret
npm run db:up           # starts local Postgres on localhost:5433
npm run seed            # optional: load sample IELTS content
npm run dev            # development with auto-restart
npm start              # production
```

If `npm run db:up` fails, open Docker Desktop first and wait until it says the engine is running.

Server runs on http://localhost:5000

---

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get token |
| GET | `/api/auth/me` | Get current user (🔒) |

**Register body:**
```json
{ "name": "Alua", "email": "alua@email.com", "password": "123456" }
```

**Login body:**
```json
{ "email": "alua@email.com", "password": "123456" }
```

Both return a `token`. Add it to all protected requests:
```
Authorization: Bearer <token>
```

---

### Questions (🔒 all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | All questions |
| GET | `/api/questions?section=reading` | By section |
| GET | `/api/questions/:id` | Single question |
| POST | `/api/questions` | Add question |
| PUT | `/api/questions/:id` | Edit question |
| DELETE | `/api/questions/:id` | Delete question |

**Add question body:**
```json
{
  "section": "reading",
  "passage_title": "Electroreception in Fish",
  "passage_text": "Open your eyes in sea water...",
  "question_text": "What is the term for passive signal detection?",
  "question_type": "fill_blank",
  "correct_answer": "electroreception",
  "order_index": 1
}
```
`question_type` options: `mcq`, `fill_blank`, `true_false`, `matching`, `essay`

---

### Exam Attempts (🔒 all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attempts` | Start attempt |
| GET | `/api/attempts` | My attempts |
| GET | `/api/attempts/:id` | Attempt + answers |
| POST | `/api/attempts/:id/answers` | Submit answers |
| POST | `/api/attempts/:id/complete` | Finish + get score |

**Start attempt:**
```json
{ "section": "reading" }
```

**Submit answers (array):**
```json
[
  { "question_id": "uuid-here", "user_answer": "electroreception" },
  { "question_id": "uuid-here", "user_answer": "True" }
]
```

**Complete attempt:**
```json
{ "time_taken_seconds": 1200 }
```
Returns band score (4.0–9.0).

---

### Writing (🔒 all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/writing` | Submit essay |
| GET | `/api/writing` | My submissions |
| GET | `/api/writing/:id` | Single submission |
| PATCH | `/api/writing/:id/score` | Add score + feedback |

**Submit essay:**
```json
{
  "attempt_id": "uuid",
  "question_id": "uuid",
  "essay_text": "The graph shows...",
  "task_type": "task1"
}
```

---

## Database Tables

- `users` — accounts
- `questions` — question bank (reading/writing/listening)
- `exam_attempts` — each exam session per user
- `answers` — per-question answers linked to attempt
- `writing_submissions` — full essays with word count + feedback

## Connecting from React

```js
// After login, save token:
localStorage.setItem('token', data.token);

// Use in requests:
const res = await fetch('http://localhost:5000/api/questions?section=reading', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```
