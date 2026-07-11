# Contributing

Thanks for your interest in improving AI Study Planner! This guide covers the local workflow and the standards we hold PRs to.

## Prerequisites

- Node.js 20 (see `.nvmrc`)
- MongoDB (local, Docker, or Atlas)
- Optional: an OpenAI API key for live AI features

## Getting started

```bash
# Backend
cd backend && npm install && cp .env.example .env

# Frontend
cd ../frontend && npm install && cp .env.example .env.local
```

Run both dev servers (see the [README](README.md#option-b--local-dev)), or use `docker compose up --build` from the repo root.

## Development flow

1. Create a feature branch (`feat/…`, `fix/…`, `docs/…`).
2. Make focused, minimal changes that follow existing patterns.
3. Add or update tests for user-facing behavior changes.
4. Run the local checks below and make sure they pass.
5. Update docs if behavior or APIs change.
6. Open a pull request against `main` with a clear description.

## Local checks

```bash
# Backend
cd backend
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # Jest + Supertest

# Frontend
cd frontend
npm run lint
npm run build
```

CI (`.github/workflows/ci.yml`) runs these plus Docker builds on every PR.

## Coding standards

- Keep changes small, readable, and maintainable; prefer existing utilities and conventions.
- Formatting is enforced by Prettier and linting by ESLint — run `npm run lint:fix` / `npm run format` before committing.
- Backend logging goes through the Pino `logger` (or `req.log`); avoid `console.*`.
- Never commit secrets or `.env` files.
- Business logic lives in `services/`; keep controllers thin.

## Commit & PR conventions

- Write descriptive commit messages (Conventional Commits style encouraged, e.g. `feat: add subject filter`).
- Reference related issues in the PR description.
- Ensure CI is green before requesting review.
