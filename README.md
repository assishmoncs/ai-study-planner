# AI Study Planner

Full-stack study planner with AI-generated plans, task management, Pomodoro tracking, and analytics.

## Tech Stack

- Frontend: Next.js 15, React, TypeScript, Tailwind CSS, TanStack Query, Zustand
- Backend: Node.js, Express, Mongoose
- Auth: JWT access + refresh tokens, HttpOnly refresh cookies
- AI: OpenAI
- Charts: Recharts

## Features

- AI study plan generation with validated JSON fallback
- Study plans, tasks, and analytics dashboards
- Pomodoro timer with custom cycles, sound, notifications, and session logging
- Dark mode
- Toast notifications, loading states, and error boundaries
- Security hardening: rate limiting, input sanitization, Helmet, CORS, env validation

## Project Structure

```text
backend/
  src/
    app.js
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
  tests/

frontend/
  src/
    app/
    components/
    hooks/
    lib/
    store/
    types/
```

## Setup

### 1) Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 3) Run

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Screenshots / GIFs

Add your latest dashboard, Pomodoro, and analytics screenshots here:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/pomodoro.gif`
- `docs/screenshots/analytics.png`

## API

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

### Study Plans

- `GET /api/study-plans`
- `POST /api/study-plans`
- `GET /api/study-plans/:id`
- `PATCH /api/study-plans/:id`
- `DELETE /api/study-plans/:id`
- `POST /api/study-plans/:id/log-hours`
- `POST /api/study-plans/ai/suggest`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Analytics

- `GET /api/analytics/summary`
- `GET /api/analytics/daily?days=30`
- `GET /api/analytics/subjects`

## Testing

```bash
cd backend
npm test
```

## Notes

- The Pomodoro timer automatically logs completed focus sessions to the selected active study plan.
- Refresh tokens are rotated on login and refresh.
