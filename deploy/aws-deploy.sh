#!/bin/bash

# BrainSAIT Perfect Healthcare Platform - AWS Free Tier Deployment
set -e

echo "🚀 Deploying BrainSAIT Perfect Healthcare Platform to AWS (Free Tier Optimized)"

# Configuration
REGION="us-east-1"  # Free tier eligible
BUCKET_NAME="brainsait-healthcare-perfect-$(date +%s)"
STACK_NAME="brainsait-healthcare-stack"
DOMAIN_NAME="brainsait-healthcare.com"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Installing..."
    curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
    sudo installer -pkg AWSCLIV2.pkg -target /
fi

# Build optimized production bundle
echo "📦 Building optimized production bundle..."
npm run build

# Create S3 bucket (Free tier: 5GB storage, 20,000 GET requests)
echo "🪣 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document 404.html

# Upload build files with optimized caching
echo "📤 Uploading files to S3..."
aws s3 sync out/ s3://$BUCKET_NAME --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html" \
  --region $REGION

# Upload HTML files with shorter cache
aws s3 sync out/ s3://$BUCKET_NAME --delete \
  --cache-control "public,max-age=0,must-revalidate" \
  --exclude "*" --include "*.html" \
  --region $REGION

# Set bucket policy for public read
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

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Deploy CloudFormation stack (Free tier services)
echo "☁️ Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file deploy/cloudformation.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    BucketName=$BUCKET_NAME \
    DomainName=$DOMAIN_NAME \
  --capabilities CAPABILITY_IAM \
  --region $REGION

# Get CloudFront distribution URL
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
  --output text \
  --region $REGION)

echo "✅ Deployment Complete!"
echo "🌐 Website URL: $CLOUDFRONT_URL"
echo "🪣 S3 Bucket: $BUCKET_NAME"
echo "💰 Free Tier Usage Optimized"

# Cleanup
rm -f bucket-policy.json AWSCLIV2.pkg

echo "🎉 BrainSAIT Perfect Healthcare Platform deployed successfully!"
