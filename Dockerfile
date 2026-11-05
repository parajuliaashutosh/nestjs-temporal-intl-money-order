# ---- Builder ----
FROM oven/bun:1.4-slim AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- Production ----
FROM oven/bun:1.4-slim AS production
WORKDIR /app

# Only copy what's needed
COPY --from=builder /app/dist ./dist
COPY package.json bun.lock ./

# Install only production deps
RUN bun install --frozen-lockfile --production && \
    # Remove unnecessary files from node_modules
    find node_modules -name "*.md" -delete && \
    find node_modules -name "*.ts" -not -name "*.d.ts" -delete && \
    find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null; \
    find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null; \
    find node_modules -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null; true

# `bun` user (uid 1000) ships with the base image
USER bun

CMD ["bun", "dist/main.js"]
