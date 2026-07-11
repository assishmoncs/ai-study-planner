# Deployment Guide

The app ships as two containers (backend API + frontend) plus a MongoDB instance. You can deploy them together with Docker Compose or separately on managed platforms.

## 1. Docker Compose (single host)

```bash
cp .env.example .env
# Edit .env — at minimum set a strong JWT_SECRET (32+ chars).
docker compose up --build -d
```

Services:

| Service   | Port  | Notes                                  |
| --------- | ----- | -------------------------------------- |
| frontend  | 3000  | Next.js standalone server              |
| backend   | 5000  | Express API (`/api`)                   |
| mongo     | 27017 | Data persisted in the `mongo-data` volume |

Check health:

```bash
curl localhost:5000/api/health
curl localhost:5000/api/ready
```

> **Note:** `NEXT_PUBLIC_*` variables are inlined at **build time**. If you change the public API URL, rebuild the frontend image (`docker compose build frontend`).

## 2. Building images individually

```bash
docker build -t ai-study-planner-backend ./backend
docker build -t ai-study-planner-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api ./frontend
```

Both images run as a non-root user, and the backend image includes a `HEALTHCHECK` hitting `/api/health`.

## 3. Managed platforms

### Backend (Render / Railway / Fly.io)

- Deploy `backend/` using its `Dockerfile`, or set the start command to `npm start`.
- Set env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and optionally `OPENAI_API_KEY`/`OPENAI_MODEL`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `LOG_LEVEL`.
- Point the platform's health check at `/api/health` (or `/api/ready` for dependency-aware checks).
- Use a managed MongoDB (e.g. MongoDB Atlas) for `MONGODB_URI`.

### Frontend (Vercel / Netlify / container platform)

- On **Vercel**: import the repo with the root set to `frontend/`. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
- On a **container platform**: build with the `NEXT_PUBLIC_API_URL` build arg and run the standalone server on port `3000`.

## 4. Production checklist

- [ ] `JWT_SECRET` is a strong random value (32+ chars) and unique per environment.
- [ ] `NODE_ENV=production` on the backend.
- [ ] `CLIENT_URL` matches the deployed frontend origin (CORS + cookies).
- [ ] MongoDB uses authentication and TLS; the connection string is stored as a secret.
- [ ] `OPENAI_API_KEY` set if live AI is desired (otherwise fallbacks are used).
- [ ] HTTPS terminated at the load balancer / platform edge (refresh cookies are HttpOnly).
- [ ] Logs shipped/aggregated (`LOG_LEVEL=info` in production).
- [ ] CI green (`.github/workflows/ci.yml`).

## 5. Scaling notes

- The API is stateless (JWT-based), so it scales horizontally behind a load balancer; enable `trust proxy` (already set for production) so rate limiting sees real client IPs.
- For multi-instance rate limiting, back `express-rate-limit` with a shared store (e.g. Redis) instead of the default in-memory store.
- MongoDB should be scaled/managed independently (replica set for HA).
