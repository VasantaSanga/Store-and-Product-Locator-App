# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only required files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the source code
COPY . .

# Build the frontend
RUN npm run build

# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S nodejs && adduser -S frontend -G nodejs

# Copy built app and dependencies from builder
COPY --from=builder --chown=frontend:nodejs /app/dist ./dist
COPY --from=builder --chown=frontend:nodejs /app/package*.json ./
COPY --from=builder --chown=frontend:nodejs /app/node_modules ./node_modules

USER frontend

# Expose default Vite preview port
EXPOSE 4173

# Use Vite's built-in preview server (no nginx needed!)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]