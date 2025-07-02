# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package and lock files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript project
RUN npm run build

# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

# Install required packages for Prisma and PostgreSQL client
RUN apk add --no-cache \
    postgresql-client \
    openssl \
    openssl-dev \
    libc6-compat

# Create non-root user
RUN addgroup -S nodejs && adduser -S backend -G nodejs

# Copy only necessary files from builder
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/package*.json ./
COPY --from=builder --chown=backend:nodejs /app/prisma ./prisma

USER backend

EXPOSE 3001

CMD ["npm", "start"]