#!/bin/bash

# Stop script for Store Locator App

set -e

echo "🛑 Stopping Store Locator App..."

# Parse command line arguments
REMOVE_VOLUMES=false
MODE="production"

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--volumes)
            REMOVE_VOLUMES=true
            shift
            ;;
        -d|--dev|--development)
            MODE="development"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -v, --volumes               Remove volumes (⚠️  deletes database data)"
            echo "  -d, --dev, --development    Stop development environment"
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
    if [ -f "$ENV_FILE" ]; then
        ENV_ARG="--env-file $ENV_FILE"
    else
        ENV_ARG=""
    fi
else
    ENV_ARG=""
fi

# Stop services
if [ "$REMOVE_VOLUMES" = true ]; then
    echo "⚠️  Stopping services and removing volumes (this will delete database data)..."
    docker-compose $ENV_ARG down -v
    echo "🗑️  Volumes removed"
else
    echo "🛑 Stopping services..."
    docker-compose $ENV_ARG down
fi

echo "✅ Services stopped successfully!"

# Show what was stopped
echo ""
echo "📊 Current containers:"
docker ps -a --filter "name=store-locator" || echo "No store-locator containers found" 