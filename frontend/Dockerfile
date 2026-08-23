FROM oven/bun:1-alpine AS base
WORKDIR /app

# ── Install all deps (needed for build plugins like bun-plugin-tailwind) ──────
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Build the static SPA ──────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN bun run build

# ── Production: serve the SPA via Bun's built-in static server ───────────────
# We keep the full source so Bun can use its native HTML serving (src/index.ts).
# Only prod deps are needed at runtime.
FROM base AS prod
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY . .
EXPOSE 3000
CMD ["bun", "run", "start"]

# ── Development stage ─────────────────────────────────────────────────────────
FROM base AS dev
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["bun", "--hot", "src/index.ts"]
