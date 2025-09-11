#!/bin/bash

# BrainSAIT Healthcare Platform - AWS Deployment Script
# Deploys the unified healthcare platform to AWS with optimizations

set -e

echo "🏥 BrainSAIT Healthcare Platform - AWS Deployment"
echo "=================================================="

# Configuration
REGION=${AWS_REGION:-us-east-1}
BUCKET_NAME="brainsait-healthcare-unified-$(date +%s)"
DISTRIBUTION_ID=""
BUILD_DIR="out"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Please install AWS CLI."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js 18+."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure'."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci --production=false
    log_success "Dependencies installed"
}

# Build the application
build_application() {
    log_info "Building application for production..."
    
    # Set production environment
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1
    
    # Build with optimizations
    npm run build
    
    # Export static files
    npx next export
    
    log_success "Application built successfully"
    log_info "Bundle size: $(du -sh $BUILD_DIR | cut -f1)"
}

# Create S3 bucket
create_s3_bucket() {
    log_info "Creating S3 bucket: $BUCKET_NAME"
    
    if aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"; then
        log_success "S3 bucket created: $BUCKET_NAME"
    else
        log_error "Failed to create S3 bucket"
        exit 1
    fi
    
    # Configure bucket for static website hosting
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document 404.html
    
    # Set bucket policy for public read access
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket "$BUCKET_NAME" \
        --policy file://bucket-policy.json
    
    rm bucket-policy.json
    
    log_success "S3 bucket configured for static hosting"
}

# Upload files to S3
upload_to_s3() {
    log_info "Uploading files to S3..."
    
    # Upload with optimized settings
    aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
        --delete \
        --cache-control "public, max-age=31536000" \
        --exclude "*.html" \
        --exclude "*.json"
    
    # Upload HTML files with shorter cache
    aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
        --delete \
        --cache-control "public, max-age=0, must-revalidate" \
        --include "*.html" \
        --include "*.json"
    
    log_success "Files uploaded to S3"
}

# Create CloudFront distribution
create_cloudfront_distribution() {
    log_info "Creating CloudFront distribution..."
    
    cat > cloudfront-config.json << EOF
{
    "CallerReference": "brainsait-healthcare-$(date +%s)",
    "Comment": "BrainSAIT Healthcare Platform Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/404.html",
                "ResponseCode": "404",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}
EOF
    
    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config file://cloudfront-config.json \
        --query 'Distribution.Id' \
        --output text)
    
    rm cloudfront-config.json
    
    if [ -n "$DISTRIBUTION_ID" ]; then
        log_success "CloudFront distribution created: $DISTRIBUTION_ID"
        
        # Get distribution domain name
        DOMAIN_NAME=$(aws cloudfront get-distribution \
            --id "$DISTRIBUTION_ID" \
            --query 'Distribution.DomainName' \
            --output text)
        
        log_info "Distribution domain: https://$DOMAIN_NAME"
    else
        log_error "Failed to create CloudFront distribution"
        exit 1
    fi
}

# Wait for distribution deployment
wait_for_deployment() {
    log_info "Waiting for CloudFront distribution deployment..."
    
    aws cloudfront wait distribution-deployed --id "$DISTRIBUTION_ID"
    
    log_success "CloudFront distribution deployed successfully"
}

# Create invalidation
create_invalidation() {
    log_info "Creating CloudFront invalidation..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    if [ -n "$INVALIDATION_ID" ]; then
        log_success "Invalidation created: $INVALIDATION_ID"
    else
        log_warning "Failed to create invalidation"
    fi
}

# Setup health checks
setup_health_checks() {
    log_info "Setting up health checks..."
    
    # Create health check for the application
    HEALTH_CHECK_ID=$(aws route53 create-health-check \
        --caller-reference "brainsait-healthcare-$(date +%s)" \
        --health-check-config Type=HTTPS,ResourcePath=/api/health,FullyQualifiedDomainName="$DOMAIN_NAME",Port=443,RequestInterval=30,FailureThreshold=3 \
        --query 'HealthCheck.Id' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$HEALTH_CHECK_ID" ]; then
        log_success "Health check created: $HEALTH_CHECK_ID"
    else
        log_warning "Health check creation skipped (Route53 not configured)"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f bucket-policy.json cloudfront-config.json
}

# Main deployment function
main() {
    log_info "Starting BrainSAIT Healthcare Platform deployment..."
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    check_prerequisites
    install_dependencies
    build_application
    create_s3_bucket
    upload_to_s3
    create_cloudfront_distribution
    wait_for_deployment
    create_invalidation
    setup_health_checks
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "=================================================="
    echo "📊 Deployment Summary:"
    echo "   S3 Bucket: $BUCKET_NAME"
    echo "   CloudFront Distribution: $DISTRIBUTION_ID"
    echo "   Domain: https://$DOMAIN_NAME"
    echo "   Region: $REGION"
    echo ""
    echo "🔗 Access your application:"
    echo "   https://$DOMAIN_NAME"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Configure custom domain (optional)"
    echo "   2. Set up monitoring and alerts"
    echo "   3. Configure backup and disaster recovery"
    echo "   4. Update DNS records if using custom domain"
    echo ""
    log_success "BrainSAIT Healthcare Platform is now live! 🚀"
}

# Run main function
main "$@"
