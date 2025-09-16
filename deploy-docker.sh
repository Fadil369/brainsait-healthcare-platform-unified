#!/bin/bash

# BrainSAIT Healthcare Platform - Docker Deployment Script
# For AWS Free Tier EC2 Instance

set -e

echo "🏥 BrainSAIT Healthcare Platform - Docker Deployment"
echo "=================================================="

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /opt/brainsait
sudo chown ec2-user:ec2-user /opt/brainsait
cd /opt/brainsait

# Clone or copy application files
echo "📥 Deploying application files..."
# Files should be uploaded via SCP or Git

# Create logs directory
mkdir -p logs ssl

# Set environment variables
echo "🔐 Setting up environment..."
cat > .env << EOF
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
AWS_REGION=us-east-1
NPHIES_BASE_URL=https://nphies.sa/fhir/R4
CLOUDFLARE_TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
EOF

# Build and start services
echo "🚀 Building and starting services..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🔍 Performing health check..."
if curl -f http://localhost:3000/api/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker-compose logs
    exit 1
fi

# Show status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 Deployment Complete!"
echo "========================"
echo "🌐 Local URL: http://localhost:3000"
echo "🔗 Public URL: https://brainsait.com (via Cloudflare Tunnel)"
echo "🏥 Health Check: http://localhost:3000/api/health"
echo ""
echo "📋 Useful Commands:"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose restart          # Restart services"
echo "  docker-compose down             # Stop services"
echo "  docker-compose up -d --build    # Rebuild and restart"
