#!/bin/bash

# Build the Next.js application
npm run build

# Configure S3 bucket for website hosting
aws s3api put-bucket-website \
  --bucket brainsait-healthcare-1757618402 \
  --website-configuration '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"404.html"}}'

# Set bucket policy for public access
aws s3api put-bucket-policy \
  --bucket brainsait-healthcare-1757618402 \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ],
        "Resource": "arn:aws:s3:::brainsait-healthcare-1757618402/*"
      }
    ]
  }'

# Deploy to S3
aws s3 sync out/ s3://brainsait-healthcare-1757618402 --delete

echo "Deployment complete. Website available at:"
echo "https://brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com"
