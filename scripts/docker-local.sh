#!/bin/bash

# Script to build and run Docker setup locally

set -e

echo "🐳 Building and starting Goranee v2 Docker setup locally..."

# Note: Admin panel will be built inside Docker using nginx.Dockerfile.local
# This avoids Node.js version conflicts (admin panel needs Node 14, but local might have Node 22)
echo "📦 Admin panel will be built inside Docker container (avoids Node.js version conflicts)"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl nginx/certbot
mkdir -p server/uploads server/backups
mkdir -p database_data

# Build and start services
echo "🚀 Starting Docker Compose..."
docker-compose -f docker-compose.local.yaml up --build -d

echo ""
echo "✅ Services are starting up!"
echo ""
echo "📋 Service URLs:"
echo "   - Main site: http://localhost"
echo "   - Admin panel: http://localhost/admin"
echo "   - API: http://localhost/api"
echo "   - Health check: http://localhost/api/health"
echo ""
echo "📊 View logs: docker-compose -f docker-compose.local.yaml logs -f"
echo "🛑 Stop services: docker-compose -f docker-compose.local.yaml down"
echo ""

