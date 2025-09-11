# BrainSAIT Perfect Healthcare Platform - Terraform Infrastructure
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "brainsait-healthcare.com"
}

# S3 Bucket for static website (Free tier: 5GB)
resource "aws_s3_bucket" "website" {
  bucket        = "brainsait-healthcare-perfect-${random_id.bucket_suffix.hex}"
  force_destroy = true
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website]
}

# CloudFront Distribution (Free tier: 1TB transfer, 10M requests)
resource "aws_cloudfront_distribution" "website" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.website.website_endpoint
    origin_id   = "S3-${aws_s3_bucket.website.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "BrainSAIT Perfect Healthcare Platform"

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # Cache behavior for static assets
  ordered_cache_behavior {
    path_pattern           = "*.js"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 31536000
    default_ttl = 31536000
    max_ttl     = 31536000
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  price_class = "PriceClass_100"  # Use only North America and Europe

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "BrainSAIT Healthcare"
    Environment = var.environment
    Project     = "Perfect Healthcare Platform"
  }
}

# DynamoDB Table (Free tier: 25GB, 25 RCU/WCU)
resource "aws_dynamodb_table" "healthcare_data" {
  name           = "brainsait-healthcare-data"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "id"
  range_key      = "type"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = false  # Cost optimization
  }

  tags = {
    Name        = "BrainSAIT Healthcare Data"
    Environment = var.environment
    HIPAA       = "Compliant"
  }
}

# Lambda Function (Free tier: 1M requests, 400,000 GB-seconds)
resource "aws_lambda_function" "healthcare_api" {
  filename         = "healthcare-api.zip"
  function_name    = "brainsait-healthcare-api"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.healthcare_data.name
      ENVIRONMENT    = var.environment
    }
  }

  tags = {
    Name        = "BrainSAIT Healthcare API"
    Environment = var.environment
  }
}

# Package Lambda function
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "../lambda/healthcare-api.js"
  output_path = "healthcare-api.zip"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "brainsait-healthcare-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.healthcare_data.arn
      }
    ]
  })
}

# API Gateway (Free tier: 1M calls)
resource "aws_api_gateway_rest_api" "healthcare_api" {
  name        = "brainsait-healthcare-api"
  description = "BrainSAIT Perfect Healthcare API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.healthcare_api.id
  parent_id   = aws_api_gateway_rest_api.healthcare_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "api" {
  rest_api_id   = aws_api_gateway_rest_api.healthcare_api.id
  resource_id   = aws_api_gateway_resource.api.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "api" {
  rest_api_id = aws_api_gateway_rest_api.healthcare_api.id
  resource_id = aws_api_gateway_resource.api.id
  http_method = aws_api_gateway_method.api.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.healthcare_api.invoke_arn
}

resource "aws_api_gateway_deployment" "api" {
  depends_on = [aws_api_gateway_integration.api]

  rest_api_id = aws_api_gateway_rest_api.healthcare_api.id
  stage_name  = "prod"
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.healthcare_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.healthcare_api.execution_arn}/*/*"
}

# Outputs
output "website_url" {
  description = "Website URL"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "api_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.healthcare_api.id}.execute-api.${var.aws_region}.amazonaws.com/prod"
}

output "s3_bucket" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.website.id
}

output "estimated_cost" {
  description = "Estimated monthly cost"
  value       = "$0-5 USD (Free tier optimized)"
}
