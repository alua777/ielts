# IELTS Buddy

Full-stack IELTS practice application built with React, Express, and PostgreSQL.

## Requirements

- Node.js
- Docker Desktop

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Create `frontend/.env` containing:

```env
VITE_API_URL=http://localhost:5000/api
```

3. Start PostgreSQL:

```powershell
cd backend
npm run db:up
```

4. Install and seed the backend:

```powershell
cd backend
npm install
npm run seed
npm run dev
```

5. Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:5000`.
