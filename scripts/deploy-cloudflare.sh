#!/bin/bash

###############################################################################
# Enhanced Cloudflare Tunnel Deployment Script
# 
# This script automates the deployment of the BrainSAIT Healthcare Platform
# with enhanced Cloudflare Tunnel configuration
#
# Usage: ./scripts/deploy-cloudflare.sh [environment]
#   environment: dev, staging, production (default: production)
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Environment
ENVIRONMENT="${1:-production}"
ENV_FILE="$PROJECT_ROOT/.env"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

check_docker_running() {
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

load_env() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error ".env file not found at $ENV_FILE"
        log_info "Create .env file from .env.example and configure your variables"
        exit 1
    fi
    
    # Export variables from .env
    set -a
    source "$ENV_FILE"
    set +a
    
    log_success "Environment variables loaded from $ENV_FILE"
}

validate_env() {
    log_info "Validating environment variables..."
    
    local required_vars=(
        "CLOUDFLARE_TUNNEL_TOKEN"
        "NODE_ENV"
        "AWS_REGION"
        "NPHIES_BASE_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    log_success "All required environment variables present"
}

check_tunnel_token() {
    log_info "Validating Cloudflare tunnel token format..."
    
    if [[ ! "$CLOUDFLARE_TUNNEL_TOKEN" =~ ^[A-Za-z0-9_-]{100,}$ ]]; then
        log_warning "Tunnel token format looks unusual. Verify it's correct."
    else
        log_success "Tunnel token format valid"
    fi
}

stop_existing_containers() {
    log_info "Stopping existing containers..."
    
    cd "$PROJECT_ROOT"
    
    if docker-compose ps -q 2>/dev/null | grep -q .; then
        docker-compose down --remove-orphans
        log_success "Stopped existing containers"
    else
        log_info "No existing containers to stop"
    fi
}

build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    docker-compose build --no-cache
    
    log_success "Docker images built successfully"
}

start_services() {
    log_info "Starting services..."
    
    cd "$PROJECT_ROOT"
    docker-compose up -d
    
    log_success "Services started"
}

wait_for_health() {
    log_info "Waiting for services to become healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose ps | grep -q "healthy"; then
            log_success "Services are healthy"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    log_error "Services did not become healthy within timeout"
    docker-compose logs --tail=50
    exit 1
}

verify_tunnel() {
    log_info "Verifying Cloudflare tunnel connection..."
    
    sleep 5  # Give tunnel time to establish
    
    # Check tunnel logs for successful connection
    if docker-compose logs cloudflared 2>&1 | grep -q "Registered tunnel connection"; then
        log_success "Cloudflare tunnel connected successfully"
    else
        log_warning "Tunnel connection status unclear. Check logs:"
        docker-compose logs cloudflared | tail -20
    fi
}

verify_metrics() {
    log_info "Verifying metrics endpoint..."
    
    if curl -sf http://localhost:2000/ready &> /dev/null; then
        log_success "Metrics endpoint responding"
        
        # Show some basic metrics
        log_info "Current tunnel metrics:"
        curl -s http://localhost:2000/metrics | grep -E "cloudflared_tunnel_" | head -5
    else
        log_warning "Metrics endpoint not responding yet"
    fi
}

verify_app_health() {
    log_info "Verifying application health..."
    
    local max_attempts=10
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf http://localhost:3000/api/health &> /dev/null; then
            log_success "Application health check passed"
            return 0
        fi
        
        echo -n "."
        sleep 3
        ((attempt++))
    done
    
    log_error "Application health check failed"
    docker-compose logs brainsait-app | tail -50
    exit 1
}

show_deployment_info() {
    cat << EOF

${GREEN}╔════════════════════════════════════════════════════════════════╗
║          Cloudflare Deployment Successful! ✅                  ║
╚════════════════════════════════════════════════════════════════╝${NC}

${BLUE}📊 Deployment Information:${NC}

  Environment:     ${ENVIRONMENT}
  Tunnel Protocol: QUIC
  Connections:     4 persistent connections
  HTTP/2:          Enabled
  Metrics Port:    2000

${BLUE}🌐 Public Endpoints:${NC}

  Main Site:       https://brainsait.com
  WWW:             https://www.brainsait.com
  API:             https://api.brainsait.com
  Health:          https://health.brainsait.com
  NPHIES:          https://nphies.brainsait.com
  Static:          https://static.brainsait.com
  Admin:           https://admin.brainsait.com

${BLUE}📈 Local Monitoring:${NC}

  App Health:      http://localhost:3000/api/health
  Tunnel Metrics:  http://localhost:2000/metrics
  Ready Check:     http://localhost:2000/ready

${BLUE}🔧 Useful Commands:${NC}

  View logs:         docker-compose logs -f
  Restart tunnel:    docker-compose restart cloudflared
  Stop services:     docker-compose down
  View metrics:      curl http://localhost:2000/metrics

${BLUE}📚 Documentation:${NC}

  Enhanced Guide:  docs/CLOUDFLARE-DEPLOYMENT-ENHANCED.md
  Quick Start:     QUICK-START-POST-AUDIT.md
  Security:        docs/SECURITY-BEST-PRACTICES.md

${GREEN}✨ Next Steps:${NC}

  1. Test endpoints: curl -I https://brainsait.com
  2. Monitor metrics: http://localhost:2000/metrics
  3. Configure WAF rules in Cloudflare dashboard
  4. Set up monitoring alerts
  5. Enable Zero Trust policies for admin.brainsait.com

${YELLOW}⚠️  Remember to:${NC}

  - Configure DNS CNAME records in Cloudflare
  - Enable WAF and DDoS protection
  - Set up monitoring and alerting
  - Review security best practices

EOF
}

cleanup_on_error() {
    log_error "Deployment failed. Rolling back..."
    docker-compose down --remove-orphans
    exit 1
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    log_info "Starting Enhanced Cloudflare Deployment for $ENVIRONMENT environment"
    echo
    
    # Trap errors for cleanup
    trap cleanup_on_error ERR
    
    # Pre-flight checks
    log_info "=== Pre-flight Checks ==="
    check_command docker
    check_command docker-compose
    check_command curl
    check_docker_running
    load_env
    validate_env
    check_tunnel_token
    echo
    
    # Deployment
    log_info "=== Deployment ==="
    stop_existing_containers
    build_images
    start_services
    echo
    
    # Verification
    log_info "=== Verification ==="
    wait_for_health
    verify_app_health
    verify_tunnel
    verify_metrics
    echo
    
    # Success
    show_deployment_info
    
    log_success "Deployment completed successfully!"
}

# Run main function
main "$@"
