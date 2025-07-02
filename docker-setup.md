# Docker Setup Guide for Store Locator App

## Prerequisites
- Docker and Docker Compose installed
- Git (for cloning the repository)

## Environment Files Setup

### 1. Create `.env` file in project root:
```bash
# Environment Configuration for Docker Compose
NODE_ENV=production
BUILD_TARGET=production

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=store_locator
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=3001
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Proxy Configuration (optional)
PROXY_PORT=80
```

### 2. Create `.env.development` file for development:
```bash
# Development Environment Configuration
NODE_ENV=development
BUILD_TARGET=dev

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=dev_password
POSTGRES_DB=store_locator_dev
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend Configuration
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Development Mounts
BACKEND_DEV_MOUNT=./backend
FRONTEND_DEV_MOUNT=./frontend
```

### 3. Create `backend/.env` file:
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:your_secure_password_here@postgres:5432/store_locator?schema=public
CORS_ORIGIN=http://localhost:3000
```

### 4. Create `frontend/.env` file:
```bash
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Quick Start Commands

### Production Mode (Recommended)
```bash
# 1. Clone and navigate to project
cd Store-and-Product-Locator-App

# 2. Create environment files (see above)

# 3. Build and start all services
docker-compose up --build -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f

# 6. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5432
```

### Development Mode
```bash
# 1. Use development environment
docker-compose --env-file .env.development up --build -d

# 2. Access with hot reload
# Frontend: http://localhost:5173 (Vite dev server)
# Backend: http://localhost:3001 (with nodemon)
```

## Detailed Step-by-Step Instructions

### Step 1: Environment Setup
1. **Copy environment templates:**
   ```bash
   # Create main .env file
   cp docker-setup.md .env  # Copy the .env content from this file
   
   # Create development .env file
   cp docker-setup.md .env.development  # Copy the .env.development content
   ```

2. **Update environment values:**
   - Replace `your_secure_password_here` with a strong password
   - Replace `your_google_maps_api_key_here` with your Google Maps API key
   - Adjust ports if needed

### Step 2: Build and Run

#### Option A: Production Build
```bash
# Build images
docker-compose build

# Start services in detached mode
docker-compose up -d

# View running containers
docker-compose ps
```

#### Option B: Development Build
```bash
# Build and start in development mode
docker-compose --env-file .env.development up --build -d

# Alternatively, for foreground with logs
docker-compose --env-file .env.development up --build
```

### Step 3: Database Setup
The database will be automatically set up with Prisma migrations when the backend starts.

### Step 4: Verify Installation
```bash
# Check all services are running
docker-compose ps

# Check backend health
curl http://localhost:3001

# Check frontend
curl http://localhost:3000

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## Useful Docker Commands

### Container Management
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This deletes database data)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# View logs for specific service
docker-compose logs -f backend

# Execute command in running container
docker-compose exec backend npm run prisma:generate
docker-compose exec postgres psql -U postgres -d store_locator
```

### Development Commands
```bash
# Rebuild specific service
docker-compose build backend --no-cache

# Run database migrations
docker-compose exec backend npx prisma db push

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Seed database
docker-compose exec backend npx prisma db seed
```

### Debugging
```bash
# Enter backend container shell
docker-compose exec backend sh

# Enter database container
docker-compose exec postgres psql -U postgres -d store_locator

# View container resource usage
docker stats

# View detailed container info
docker inspect store-locator-backend
```

## Access Points
- **Frontend (Production):** http://localhost:3000
- **Frontend (Development):** http://localhost:5173  
- **Backend API:** http://localhost:3001
- **Database:** localhost:5432
- **Reverse Proxy (Optional):** http://localhost:80

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change ports in .env file
   FRONTEND_PORT=3001
   BACKEND_PORT=3002
   ```

2. **Database connection issues:**
   ```bash
   # Check if database is ready
   docker-compose logs postgres
   
   # Restart backend after database is ready
   docker-compose restart backend
   ```

3. **Permission denied (Linux/macOS):**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER .
   ```

4. **Build cache issues:**
   ```bash
   # Clean build
   docker-compose build --no-cache
   docker system prune -f
   ```

## Production Considerations

1. **Security:**
   - Use strong passwords
   - Don't expose database port in production
   - Use HTTPS in production
   - Regular security updates

2. **Performance:**
   - Use production builds
   - Enable gzip compression
   - Use CDN for static assets
   - Monitor resource usage

3. **Data Persistence:**
   - Database data is persisted in Docker volume
   - Backup regularly: `docker-compose exec postgres pg_dump -U postgres store_locator > backup.sql`

## Optional: Nginx Reverse Proxy
```bash
# Start with reverse proxy
docker-compose --profile proxy up -d

# Access everything through port 80
# Frontend: http://localhost/
# Backend API: http://localhost/api/
``` 