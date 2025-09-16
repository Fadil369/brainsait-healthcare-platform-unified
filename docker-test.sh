#!/bin/bash

echo "🐳 Testing Docker deployment locally..."

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Build and start
echo "🏗️ Building containers..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Test health endpoint
echo "🔍 Testing health endpoint..."
if curl -f http://localhost:3000/api/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    echo "📋 Container logs:"
    docker-compose logs
fi

echo "📊 Container status:"
docker-compose ps
