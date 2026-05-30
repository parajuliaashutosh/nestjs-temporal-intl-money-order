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
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "dist/main"]