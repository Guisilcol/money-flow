# syntax=docker/dockerfile:1

# ---- Base ----
FROM oven/bun:1 AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- Builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js standalone output for smaller image
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

USER nextjs

CMD ["bun", "server.js"]
