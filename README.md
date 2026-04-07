# AI-Powered Personalized Study Planner & Productivity Dashboard

A production-ready full-stack application that helps students organise their learning with AI-generated study plans, task management, a Pomodoro timer, and an analytics dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (Bearer tokens) |
| AI | OpenAI GPT-4o-mini |
| State | Zustand + TanStack Query |
| Charts | Recharts |

---

## Project Structure

```
ai-study-planner/
├── backend/                        # Node.js / Express API
│   ├── src/
│   │   ├── app.js                  # Express app factory (middleware, routes)
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── controllers/            # HTTP request handlers (thin layer)
│   │   │   ├── authController.js
│   │   │   ├── studyPlanController.js
│   │   │   ├── taskController.js
│   │   │   └── analyticsController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT protect() guard
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── StudyPlan.js
│   │   │   └── Task.js
│   │   ├── routes/                 # Express routers + validation rules
│   │   │   ├── authRoutes.js
│   │   │   ├── studyPlanRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── services/               # Business logic (called by controllers)
│   │   │   ├── authService.js
│   │   │   ├── studyPlanService.js
│   │   │   ├── taskService.js
│   │   │   ├── analyticsService.js
│   │   │   └── aiService.js        # OpenAI integration
│   │   └── utils/
│   │       ├── jwtUtils.js         # signAccessToken / verifyToken
│   │       └── responseHelper.js  # Standardised JSON responses
│   ├── tests/                      # Jest + Supertest tests
│   │   ├── app.test.js
│   │   └── utils.test.js
│   ├── server.js                   # Entry point – starts Express + DB
│   ├── .env.example
│   └── package.json
│
├── frontend/                       # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout (fonts, Providers)
│   │   │   ├── globals.css         # Tailwind base + component classes
│   │   │   ├── page.tsx            # Landing / home page
│   │   │   ├── (auth)/             # Public auth routes (no sidebar)
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── dashboard/          # Protected: main dashboard
│   │   │   │   ├── layout.tsx      # Auth guard + shell (Sidebar + TopBar)
│   │   │   │   └── page.tsx
│   │   │   ├── study-plans/        # Protected: study plans CRUD
│   │   │   │   └── page.tsx
│   │   │   ├── tasks/              # Protected: tasks CRUD
│   │   │   │   └── page.tsx
│   │   │   └── analytics/          # Protected: analytics charts
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── layout/             # Sidebar, TopBar, Providers (React Query)
│   │   │   └── dashboard/          # Reusable feature components
│   │   │       ├── StatCard.tsx
│   │   │       ├── ActivityChart.tsx
│   │   │       ├── SubjectBreakdown.tsx
│   │   │       ├── RecentTasks.tsx
│   │   │       ├── StudyPlanCard.tsx
│   │   │       ├── TaskItem.tsx
│   │   │       ├── CreatePlanModal.tsx
│   │   │       └── CreateTaskModal.tsx
│   │   ├── hooks/                  # Custom React hooks (data fetching)
│   │   │   ├── useStudyPlans.ts
│   │   │   ├── useTasks.ts
│   │   │   └── useAnalytics.ts
│   │   ├── lib/
│   │   │   └── api.ts              # Axios instance with JWT interceptors
│   │   ├── store/
│   │   │   └── authStore.ts        # Zustand auth store (persisted)
│   │   └── types/
│   │       └── index.ts            # Shared TypeScript interfaces
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Folder Explanation

### Backend

| Folder/File | Purpose |
|-------------|---------|
| `src/app.js` | Creates the Express app, registers global middleware (Helmet, CORS, rate limiting, morgan) and mounts all routes |
| `src/config/` | Database connection and environment helpers |
| `src/models/` | Mongoose schemas with validation, virtuals, and pre-save hooks |
| `src/controllers/` | **Thin** handlers: validate input → call service → send response |
| `src/services/` | **Business logic**: DB queries, password hashing, token generation, OpenAI calls |
| `src/routes/` | Express routers with express-validator input rules |
| `src/middleware/` | `protect()` JWT guard and global Express error handler |
| `src/utils/` | JWT sign/verify helpers and a standard JSON response helper |
| `tests/` | Jest unit + integration tests using Supertest |

### Frontend

| Folder/File | Purpose |
|-------------|---------|
| `app/(auth)/` | Route group for public pages (login, register) — no sidebar |
| `app/dashboard/` | Main protected section with sidebar shell via `layout.tsx` auth guard |
| `components/layout/` | `Sidebar`, `TopBar`, and `Providers` (TanStack Query client) |
| `components/dashboard/` | Composable UI blocks: stat cards, charts, modals, list items |
| `hooks/` | Custom hooks that wrap TanStack Query for data fetching |
| `lib/api.ts` | Pre-configured Axios instance; adds Bearer token and handles 401 globally |
| `store/authStore.ts` | Zustand store with `localStorage` persistence for JWT + user data |
| `types/index.ts` | Single source of truth for TypeScript interfaces shared across the app |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | — | Create account |
| `POST` | `/login` | — | Login, returns JWT |
| `GET` | `/me` | ✓ | Get own profile |
| `PATCH` | `/me` | ✓ | Update profile/preferences |

### Study Plans — `/api/study-plans`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List all plans (filter by `status`, `subject`) |
| `POST` | `/` | Create a study plan |
| `GET` | `/:id` | Get single plan |
| `PATCH` | `/:id` | Update plan |
| `DELETE` | `/:id` | Delete plan |
| `POST` | `/:id/log-hours` | Add completed hours |
| `POST` | `/ai/suggest` | Generate AI study plan via GPT |

### Tasks — `/api/tasks`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List tasks (filter by `status`, `priority`, `studyPlan`) |
| `POST` | `/` | Create task |
| `GET` | `/:id` | Get task |
| `PATCH` | `/:id` | Update task |
| `DELETE` | `/:id` | Delete task |

### Analytics — `/api/analytics`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/summary` | Task + plan counts and totals |
| `GET` | `/daily?days=30` | Daily activity (tasks done, minutes studied) |
| `GET` | `/subjects` | Per-subject hours breakdown |

---

## Initial Setup

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm ≥ 9

### 1. Clone & install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env – set MONGODB_URI, JWT_SECRET, OPENAI_API_KEY

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local – set NEXT_PUBLIC_API_URL
```

### 3. Run in development

```bash
# Terminal 1 – Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 – Frontend (http://localhost:3000)
cd frontend
npm run dev
```

### 4. Run backend tests

```bash
cd backend
npm test
```

### 5. Build for production

```bash
# Backend
cd backend
npm start          # node server.js

# Frontend
cd frontend
npm run build
npm start
```

---

## Architecture Decisions

- **Separation of concerns**: controllers only handle HTTP; all business logic lives in services.
- **Mongoose virtuals**: `StudyPlan.progressPercent` is computed on-the-fly, never stored.
- **Standardised responses**: every API response uses `{ success, message, data }` via `responseHelper.js`.
- **Optimistic UX**: TanStack Query's `invalidateQueries` keeps the UI in sync after mutations.
- **Persisted auth**: Zustand + `localStorage` ensures the user stays logged in across page reloads.
- **Rate limiting + Helmet**: protect the API from brute-force and common web attacks.

