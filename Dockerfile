# ---- Builder ----
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production ----
FROM node:20-slim AS production
WORKDIR /app

# Only copy what's needed
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production deps directly in final image
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force && \
    # Remove unnecessary files from node_modules
    find node_modules -name "*.md" -delete && \
    find node_modules -name "*.ts" -not -name "*.d.ts" -delete && \
    find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null; \
    find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null; \
    find node_modules -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null; true

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

CMD ["node", "dist/main"]
