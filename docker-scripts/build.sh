#!/bin/bash

# Build script for Store Locator App

set -e

echo "🚀 Building Store Locator App with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one based on the template in docker-setup.md"
    exit 1
fi

# Parse command line arguments
MODE="production"
CLEAN=false
LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dev|--development)
            MODE="development"
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -l|--logs)
            LOGS=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -d, --dev, --development    Build in development mode"
            echo "  -c, --clean                 Clean build (no cache)"
            echo "  -l, --logs                  Show logs after starting"
            echo "  -h, --help                  Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo "📝 Build mode: $MODE"

# Set environment file
if [ "$MODE" = "development" ]; then
    ENV_FILE=".env.development"
    if [ ! -f "$ENV_FILE" ]; then
        echo "❌ $ENV_FILE file not found. Please create one based on the template in docker-setup.md"
        exit 1
    fi
    ENV_ARG="--env-file $ENV_FILE"
else
    ENV_ARG=""
fi

# Clean build if requested
if [ "$CLEAN" = true ]; then
    echo "🧹 Cleaning Docker cache..."
    docker-compose $ENV_ARG down -v 2>/dev/null || true
    docker system prune -f
    BUILD_ARG="--build --no-cache"
else
    BUILD_ARG="--build"
fi

# Build and start services
echo "🏗️  Building and starting services..."
if [ "$LOGS" = true ]; then
    docker-compose $ENV_ARG up $BUILD_ARG
else
    docker-compose $ENV_ARG up $BUILD_ARG -d
    
    # Wait a moment for services to start
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Check service status
    echo "📊 Service Status:"
    docker-compose $ENV_ARG ps
    
    echo ""
    echo "✅ Build complete!"
    echo ""
    
    if [ "$MODE" = "development" ]; then
        echo "🌐 Development URLs:"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend:  http://localhost:3001"
    else
        echo "🌐 Production URLs:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:3001"
    fi
    
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs:     docker-compose $ENV_ARG logs -f"
    echo "   Stop services: docker-compose $ENV_ARG down"
    echo "   Restart:       docker-compose $ENV_ARG restart"
fi 