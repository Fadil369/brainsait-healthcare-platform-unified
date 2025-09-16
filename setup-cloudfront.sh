#!/bin/bash

# BrainSAIT Healthcare Platform - CloudFront Setup for HTTPS
# This script creates a CloudFront distribution for HTTPS access

set -e

echo "🏥 Setting up CloudFront Distribution for HTTPS"
echo "=============================================="

# Configuration
S3_BUCKET="brainsait-healthcare-1757618402"
S3_WEBSITE_ENDPOINT="brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com"
AWS_REGION="us-east-1"

# Create CloudFront distribution
echo "Creating CloudFront distribution..."

DISTRIBUTION_CONFIG='{
  "CallerReference": "brainsait-healthcare-'$(date +%s)'",
  "Comment": "BrainSAIT Healthcare Platform - Static Website Distribution",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-Website-'${S3_BUCKET}'",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "Compress": true,
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-Website-'${S3_BUCKET}'",
        "DomainName": "'${S3_WEBSITE_ENDPOINT}'",
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
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/404.html",
        "ResponseCode": "404"
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/404.html",
        "ResponseCode": "404"
      }
    ]
  },
  "PriceClass": "PriceClass_100"
}'

# Create the distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config "$DISTRIBUTION_CONFIG" \
  --region $AWS_REGION \
  --query 'Distribution.Id' \
  --output text)

if [ $? -eq 0 ]; then
  echo "✅ CloudFront distribution created successfully!"
  echo "Distribution ID: $DISTRIBUTION_ID"
  
  # Get the CloudFront domain name
  CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --region $AWS_REGION \
    --query 'Distribution.DomainName' \
    --output text)
  
  echo ""
  echo "🌐 Your HTTPS-enabled website URLs:"
  echo "HTTP (S3):   http://$S3_WEBSITE_ENDPOINT"
  echo "HTTPS (CloudFront): https://$CLOUDFRONT_DOMAIN"
  echo ""
  echo "⏳ Note: CloudFront deployment takes 10-15 minutes to complete globally"
  echo "📊 You can monitor the deployment status in the AWS Console"
  
  # Update the deployment script with the new CloudFront ID
  if [ -f "deploy-s3.sh" ]; then
    sed -i.bak "s/CLOUDFRONT_ID=\"E1234567890ABC\"/CLOUDFRONT_ID=\"$DISTRIBUTION_ID\"/" deploy-s3.sh
    echo "✅ Updated deploy-s3.sh with CloudFront distribution ID"
  fi
  
else
  echo "❌ Failed to create CloudFront distribution"
  exit 1
fi

echo ""
echo "🎉 HTTPS setup complete! Your healthcare platform will be accessible via HTTPS once CloudFront deployment is complete."