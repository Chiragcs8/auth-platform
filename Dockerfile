# ─── Stage 1: Dependencies ──────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Provide dummy DATABASE_URL so prisma generate (via postinstall) can resolve prisma.config.ts
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm ci

# ─── Stage 2: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy installed dependencies + generated Prisma client from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY . .

# Re-generate Prisma client to ensure consistency with full source
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Build Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ─── Stage 3: Init (migrations + seed) ──────────────────────────
# This stage has full node_modules including devDependencies (tsx, prisma CLI)
# so it can run prisma migrate deploy and prisma db seed
FROM node:20-alpine AS init
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=builder /app/package.json ./package.json

# ─── Stage 4: Production ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone Next.js server (includes traced node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma generated client (custom output at src/generated/prisma)
COPY --from=builder /app/src/generated ./src/generated

# libc6-compat needed for pg native bindings on Alpine
RUN apk add --no-cache libc6-compat

# Copy entrypoint script
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]