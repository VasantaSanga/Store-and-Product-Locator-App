#!/bin/bash

# Start script for Store Locator App

set -e

echo "🚀 Starting Store Locator App..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse command line arguments
MODE="production"
LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dev|--development)
            MODE="development"
            shift
            ;;
        -l|--logs)
            LOGS=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -d, --dev, --development    Start in development mode"
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

# Start services
if [ "$LOGS" = true ]; then
    echo "🏃 Starting services with logs..."
    docker-compose $ENV_ARG up
else
    echo "🏃 Starting services in background..."
    docker-compose $ENV_ARG up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 5
    
    # Show status
    echo "📊 Service Status:"
    docker-compose $ENV_ARG ps
    
    echo ""
    echo "✅ Services started successfully!"
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