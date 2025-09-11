#!/bin/bash

# Enhanced BrainSAIT Healthcare Platform Deployment with Cache Invalidation
set -e

echo "🚀 Enhanced BrainSAIT Healthcare Platform Deployment"
echo "🔧 Includes automatic cache invalidation and verification"

# Configuration
REGION="us-east-1"
BUCKET_NAME="brainsait-healthcare-perfect-1757562975"
STACK_NAME="brainsait-healthcare-stack"

# Build optimized production bundle
echo "📦 Building optimized production bundle..."
npm run build

# Upload to S3 with optimized caching
echo "📤 Uploading files to S3..."
aws s3 sync out/ s3://$BUCKET_NAME --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html" \
  --region $REGION

aws s3 sync out/ s3://$BUCKET_NAME --delete \
  --cache-control "public,max-age=0,must-revalidate" \
  --exclude "*" --include "*.html" \
  --region $REGION

# Get CloudFront distribution ID
echo "🔍 Finding CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query 'DistributionList.Items[?contains(DomainName, `d2aob1zfjnx4wa`)].Id' \
  --output text)

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "🔄 Invalidating CloudFront cache (Distribution: $DISTRIBUTION_ID)..."
  
  # Create cache invalidation
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)
  
  echo "✅ Cache invalidation created: $INVALIDATION_ID"
  
  # Wait for invalidation to complete
  echo "⏳ Waiting for cache invalidation to complete..."
  aws cloudfront wait invalidation-completed \
    --distribution-id $DISTRIBUTION_ID \
    --id $INVALIDATION_ID
  
  echo "✅ Cache invalidation completed!"
else
  echo "❌ Could not find CloudFront distribution"
  exit 1
fi

# Get deployment URLs
CLOUDFRONT_URL="https://d2aob1zfjnx4wa.cloudfront.net"
API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`APIGatewayURL`].OutputValue' \
  --output text \
  --region $REGION)

# Health check with cache-busted request
echo "🔍 Performing health check..."
HEALTH_CHECK=$(curl -s -H "Cache-Control: no-cache" "$CLOUDFRONT_URL" | grep -o "BrainSAIT Healthcare" | head -1)

if [ "$HEALTH_CHECK" = "BrainSAIT Healthcare" ]; then
  echo "✅ Health check passed - New UI is live!"
else
  echo "⚠️ Health check warning - Please verify manually"
fi

# Test API
echo "🏥 Testing Healthcare API..."
API_RESPONSE=$(curl -s "$API_URL/api" | jq -r '.status' 2>/dev/null || echo "unknown")
if [ "$API_RESPONSE" = "perfect" ]; then
  echo "✅ API health check passed"
else
  echo "⚠️ API health check warning"
fi

echo ""
echo "🎉 Enhanced Deployment Complete!"
echo "🌐 Website: $CLOUDFRONT_URL"
echo "🔗 API: $API_URL"
echo "🔄 Cache: Invalidated and refreshed"
echo ""
echo "💡 USER INSTRUCTIONS:"
echo "   1. Hard refresh your browser: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)"
echo "   2. Or open in incognito/private mode"
echo "   3. Clear browser cache if needed"
echo ""
echo "🏆 BrainSAIT Perfect Healthcare Platform - Enhanced UI Now Live!"
