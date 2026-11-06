# Contributing to AI Study Planner

Thank you for contributing to **AI Study Planner**! This document outlines our development setup, architectural conventions, quality checks, and pull request workflow.

## Prerequisites

- **Node.js**: v20 LTS (see `.nvmrc`)
- **Database**: MongoDB 7+ (local instance, Docker container, or MongoDB Atlas)
- **OpenAI API Key** *(optional)*: Required only when testing live LLM completions; all AI features automatically degrade to deterministic curriculum fallbacks when `OPENAI_API_KEY` is unset.

## Local Workspace Setup

```bash
# 1. Install dependencies for root, backend, and frontend workspaces
npm install

# 2. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Start both development servers concurrently
npm run dev:all
```

Alternatively, launch the entire stack (including MongoDB 7) with Docker Compose:

```bash
cp .env.example .env
docker compose up --build
```

## Architectural Guidelines

### Backend (`backend/src/`)

We enforce a strict 4-layer architecture:

1. **Routes (`src/routes/`)**: Define endpoint paths, attach rate limiters (`authLimiter`, `userLimiter`, `aiLimiter`), declare `express-validator` chains, and document schemas via `@openapi` JSDoc annotations.
2. **Controllers (`src/controllers/`)**: Parse HTTP request parameters, verify validation results, invoke domain services, and return standardized envelopes via `sendSuccess` / `sendError`. Keep controllers free of database queries.
3. **Services (`src/services/`)**: Own domain business logic, date/state validation, AI prompt sanitization, schema validation, and error throwing (`AppError`).
4. **Repositories & Models (`src/repositories/`, `src/models/`)**: Encapsulate Mongoose queries, projections, and aggregation pipelines.

### Frontend (`frontend/src/`)

- **Data Fetching**: Use custom TanStack Query hooks in `src/hooks/` (`useStudyPlans`, `useTasks`, `useAnalytics`) rather than inline `useQuery` calls so cache keys and invalidation remain consistent.
- **Error Isolation**: Wrap independent dashboard widgets and charts in `<ErrorBoundary>` (`src/components/ui/ErrorBoundary.tsx`) and maintain route-level `error.tsx` boundaries.
- **Theming & Accessibility**: All new components and pages must include `dark:` Tailwind variants, keyboard navigation support (`Escape` to close modals), and `aria-label` attributes on icon buttons.

## Quality Assurance Checks

Before opening a pull request, ensure all checks pass from the repository root:

```bash
npm run lint:all         # ESLint across backend and frontend
npm run type-check:all   # TypeScript strict check across backend and frontend
npm run test:all         # Jest + Supertest suite & frontend verification
npm run format:all       # Format code with Prettier
```

## Commit & Pull Request Conventions

1. Create a focused branch from `main` (`feat/short-name`, `fix/short-name`, `docs/short-name`).
2. Follow **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
3. Add or update unit/integration tests in `backend/tests/` for any backend service, repository, or route changes.
4. Update OpenAPI annotations and Markdown documentation (`README.md`, `docs/ARCHITECTURE.md`) when adding or modifying endpoints or environment variables.
