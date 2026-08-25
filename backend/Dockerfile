FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies (cached layer)
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Development stage
FROM base AS dev
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 4000
CMD ["bun", "--watch", "index.ts"]

# Production stage
FROM base AS prod
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["bun", "run", "start"]
