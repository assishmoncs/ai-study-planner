# syntax=docker/dockerfile:1

# --- Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json server.ts ./
COPY src ./src
RUN npm run build

# --- Runtime ---
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

USER nodejs
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||5000)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
