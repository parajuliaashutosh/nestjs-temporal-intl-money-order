# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production ----
FROM node:20-alpine AS production
WORKDIR /app

# Copy production node_modules from base
COPY --from=base /app/node_modules ./node_modules
# Copy compiled output
COPY --from=builder /app/dist ./dist
# Copy package.json for scripts reference
COPY package*.json ./

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Default command = API server
CMD ["node", "dist/main"]