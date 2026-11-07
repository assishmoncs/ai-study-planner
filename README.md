# AI Study Planner

AI Study Planner is a full-stack application for organizing study plans, managing tasks, tracking focus sessions, and reviewing progress. It includes optional AI-assisted plan and task suggestions. When the OpenAI API is unavailable or unconfigured, the backend provides deterministic suggestions.

[![CI](https://github.com/assishmoncs/ai-study-planner/actions/workflows/ci.yml/badge.svg)](https://github.com/assishmoncs/ai-study-planner/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Create and manage study plans with schedules, priorities, progress, and logged hours.
- Organize tasks by plan, status, priority, and due date.
- Use a configurable Pomodoro timer with break intervals, optional browser notifications, and study-hour logging.
- Review task activity and study progress in dashboard and analytics views.
- Generate study plan and task suggestions through the OpenAI API or built-in fallbacks.
- Sign in with JWT access tokens and rotating refresh tokens stored in HTTP-only cookies.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS, TanStack Query, Zustand, Recharts, Framer Motion |
| Backend | Node.js 20, Express 4, TypeScript, Mongoose, OpenAI SDK |
| Database | MongoDB 7 |
| Tooling | npm workspaces, Jest, ESLint, Prettier, Docker Compose, GitHub Actions |

The backend follows a routes, controllers, services, repositories, and models structure. See [Architecture](docs/ARCHITECTURE.md) for the application design and data flow.

## Getting started

### Prerequisites

- Node.js 20 and npm for local development
- MongoDB 7, either locally or through Docker
- Docker and Docker Compose if using the container setup

### Docker Compose

Copy the root environment template to `.env`, set a unique `JWT_SECRET` of at least 32 characters, and start the stack:

```bash
cp .env.example .env
docker compose up --build
```

The OpenAI key is optional. Without it, AI suggestion endpoints return built-in fallback results.

| Service | Local address |
| --- | --- |
| Web app | `http://localhost:3000` |
| API | `http://localhost:5000/api` |
| API documentation | `http://localhost:5000/api/docs` |
| Health and readiness | `http://localhost:5000/api/health`, `http://localhost:5000/api/ready` |

Docker Compose starts MongoDB, the API, and the web app. It stores MongoDB data in the `mongo-data` volume.

### Local development

Install dependencies from the repository root and create environment files for each application:

```bash
npm ci
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev:all
```

Set `MONGODB_URI` and `JWT_SECRET` in `backend/.env`. The frontend defaults to the API at `http://localhost:5000/api`. The backend defaults to allowing browser requests from `http://localhost:3000`. A local MongoDB instance must be running before the backend starts.

On Windows PowerShell, `Copy-Item` can be used in place of `cp`.

## Configuration

The root `.env` supplies Docker Compose values. Local development uses `backend/.env` and `frontend/.env.local`.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Backend local development | MongoDB connection string; required outside the test environment. Compose supplies its own connection string. |
| `JWT_SECRET` | Backend | Signing secret; required. Use at least 32 characters in production. |
| `OPENAI_API_KEY` | Backend | Optional key for AI-generated suggestions. |
| `OPENAI_MODEL` | Backend | Optional model override; defaults to `gpt-4o-mini` in Compose. |
| `CLIENT_URL` | Backend | Allowed browser origin; defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_API_URL` | Frontend | API base URL; defaults to `http://localhost:5000/api`. |
| `NEXT_PUBLIC_APP_URL` | Frontend | Public application URL; defaults to `http://localhost:3000`. |

See [the root template](.env.example), [backend template](backend/.env.example), and [frontend template](frontend/.env.example) for the remaining settings. Keep real secrets out of version control. `NEXT_PUBLIC_*` values are embedded in the frontend at build time.

## API

The API is served under `/api`. Interactive OpenAPI documentation is available at `/api/docs` when the backend is running.

| Area | Main routes |
| --- | --- |
| Authentication | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me` |
| Study plans | `/study-plans`, `/study-plans/:id`, `/study-plans/:id/log-hours`, `/study-plans/ai/suggest` |
| Tasks | `/tasks`, `/tasks/:id`, `/tasks/ai/suggest` |
| Analytics | `/analytics/summary`, `/analytics/daily`, `/analytics/subjects` |
| Operations | `/health`, `/ready` |

Study plan, task, and analytics routes require an access token. The refresh endpoint uses the refresh cookie. Refer to the OpenAPI documentation for methods, request bodies, and query parameters.

## Development checks

Run checks from the repository root:

```bash
npm run check:all
npm run build:all
```

`check:all` runs lint, type checks, and workspace test scripts. The frontend test script currently runs its TypeScript check. For the backend Jest suite and formatting check, use:

```bash
npm run test:ci -w backend
npm run format:check -w backend
```

CI installs each application from its own lockfile with `npm ci --workspaces=false`, then runs its checks and builds both Docker images. If you change dependencies in an application, update and commit that application's `package-lock.json`.

## Project structure

```text
backend/              Express API, Mongoose models, tests, and Dockerfile
frontend/             Next.js application and Dockerfile
docs/                 Architecture and deployment guides
.github/workflows/     CI workflow
docker-compose.yml    Local container stack
package.json          Root npm workspace scripts
```

For deployment details, see [Deployment](docs/DEPLOYMENT.md). For contribution guidelines, see [Contributing](CONTRIBUTING.md). This project is available under the [MIT License](LICENSE).
