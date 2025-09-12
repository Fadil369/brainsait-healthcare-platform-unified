# 🏥 BrainSAIT Healthcare Platform - AWS Free Tier Deployment Guide

## 🎯 Overview

This guide provides step-by-step instructions for deploying the BrainSAIT Healthcare Platform to AWS using free tier resources, optimized for cost efficiency while maintaining HIPAA compliance and enterprise-grade security.

## 📋 Prerequisites

### Required Tools
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **AWS CLI** v2 (configured with credentials)
- **Git** (for version control)

### AWS Account Requirements
- Active AWS account (within first 12 months for free tier)
- IAM user with appropriate permissions
- AWS CLI configured with access keys

### Verify Prerequisites
```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check npm version
npm --version   # Should be >= 8.0.0

# Check AWS CLI
aws --version   # Should be v2.x

# Verify AWS credentials
aws sts get-caller-identity
```

## 🚀 Quick Start Deployment

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/brainsait/healthcare-platform-unified.git
cd brainsait-healthcare-platform-unified

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local
```

### 2. Configure Environment Variables
Edit `.env.local` with your AWS and service configurations:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# Deployment Configuration
NODE_ENV=production
DEPLOYMENT_TARGET=aws-free-tier

# Optional: Stripe for payment processing
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 3. Deploy to AWS Free Tier
```bash
# Run the optimized free tier deployment
npm run deploy:aws:freetier
```

This single command will:
- ✅ Optimize the build for AWS free tier
- ✅ Create S3 bucket for static hosting
- ✅ Deploy CloudFormation stack
- ✅ Configure CloudFront distribution
- ✅ Set up Lambda functions
- ✅ Create DynamoDB tables
- ✅ Configure security and monitoring
- ✅ Generate cost monitoring reports

## 📊 Deployment Architecture

### AWS Services Used (Free Tier)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   S3 Bucket      │────│   Lambda API    │
│   (CDN/SSL)     │    │  (Static Site)   │    │  (Healthcare)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Route 53      │    │   API Gateway    │────│   DynamoDB      │
│   (Optional)    │    │   (REST API)     │    │ (Healthcare DB) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudWatch    │────│   WAF Security   │────│   KMS Encryption│
│  (Monitoring)   │    │   (Protection)   │    │   (HIPAA)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Free Tier Limits & Usage
| Service | Free Tier Limit | Estimated Usage | Status |
|---------|----------------|-----------------|---------|
| S3 | 5 GB storage | ~1-2 GB | ✅ Safe |
| CloudFront | 1 TB transfer | ~100 GB/month | ✅ Safe |
| Lambda | 1M requests | ~500K/month | ✅ Safe |
| API Gateway | 1M calls | ~500K/month | ✅ Safe |
| DynamoDB | 25 GB storage | ~5-10 GB | ✅ Safe |
| CloudWatch | 10 alarms | 5 alarms | ✅ Safe |

## 🔧 Advanced Configuration

### Custom Domain Setup (Optional)
```bash
# 1. Register domain in Route 53 or external provider
# 2. Request SSL certificate in ACM
aws acm request-certificate \
  --domain-name yourdomain.com \
  --validation-method DNS

# 3. Update CloudFormation with custom domain
# Edit deploy/cloudformation-freetier.yaml
```

### Environment-Specific Deployments
```bash
# Development environment
ENVIRONMENT=development npm run deploy:aws:freetier

# Staging environment
ENVIRONMENT=staging npm run deploy:aws:freetier

# Production environment
ENVIRONMENT=production npm run deploy:aws:freetier
```

### HIPAA Compliance Configuration
The deployment automatically configures:
- ✅ Encryption at rest (KMS)
- ✅ Encryption in transit (HTTPS/TLS)
- ✅ Access logging and monitoring
- ✅ Security headers
- ✅ WAF protection
- ✅ VPC isolation (optional)

## 📈 Monitoring & Maintenance

### Cost Monitoring
```bash
# Monitor AWS costs and usage
npm run cost:monitor

# Generate cost report
node scripts/cost-monitor.js
```

### Health Monitoring
```bash
# Validate deployment health
npm run validate:deployment https://your-cloudfront-url.com

# Check API health
npm run health:check
```

### Performance Optimization
```bash
# Analyze bundle size
npm run analyze:bundle

# Optimize images
npm run optimize:images

# Performance audit
npm run test:e2e
```

## 🔒 Security Best Practices

### 1. IAM Permissions
Create minimal IAM policy for deployment:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "cloudformation:*",
        "iam:PassRole",
        "kms:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. Environment Variables Security
- Never commit `.env.local` to version control
- Use AWS Secrets Manager for sensitive data
- Rotate access keys regularly

### 3. Network Security
- Enable WAF protection (included in deployment)
- Configure security groups properly
- Use VPC endpoints for internal communication

## 🚨 Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify permissions
aws iam get-user

# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name brainsait-healthcare-freetier
```

#### 2. Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build:optimized
```

#### 3. Performance Issues
```bash
# Check bundle size
npm run analyze

# Optimize dependencies
npm audit fix
npm run optimize:bundle
```

#### 4. SSL/HTTPS Issues
```bash
# Verify CloudFront distribution
aws cloudfront list-distributions

# Check certificate status
aws acm list-certificates
```

### Getting Help
- 📧 Email: support@brainsait.com
- 💬 Discord: [BrainSAIT Community](https://discord.gg/brainsait)
- 📖 Documentation: [docs.brainsait.com](https://docs.brainsait.com)
- 🐛 Issues: [GitHub Issues](https://github.com/brainsait/healthcare-platform-unified/issues)

## 📊 Cost Optimization

### Monthly Cost Breakdown
```
AWS Free Tier (First 12 months):
├── S3 Storage (5GB): $0.00
├── CloudFront (1TB): $0.00
├── Lambda (1M requests): $0.00
├── API Gateway (1M calls): $0.00
├── DynamoDB (25GB): $0.00
├── CloudWatch (10 alarms): $0.00
└── Total: $0.00/month

Beyond Free Tier:
├── Additional S3: ~$0.50/month
├── Extra Lambda: ~$1.00/month
├── CloudFront overage: ~$2.00/month
└── Estimated Total: $0.50-$5.00/month
```

### Cost Optimization Tips
1. **Monitor Usage**: Use `npm run cost:monitor` weekly
2. **Optimize Images**: Compress and use WebP format
3. **Cache Aggressively**: Configure CloudFront caching
4. **Clean Up**: Remove unused resources regularly
5. **Set Alerts**: Configure billing alerts at $1, $5, $10

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run ci
      - run: npm run deploy:aws:freetier
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Automated Testing
```bash
# Run full CI pipeline
npm run ci

# Individual tests
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run lint           # Code linting
npm run type-check     # TypeScript validation
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] AWS CLI configured and tested
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Tests passing
- [ ] Security scan completed

### Deployment
- [ ] Run `npm run deploy:aws:freetier`
- [ ] Verify CloudFormation stack creation
- [ ] Test health endpoints
- [ ] Validate security headers
- [ ] Check performance metrics

### Post-Deployment
- [ ] Run deployment validation
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Document custom configurations
- [ ] Schedule cost reviews

## 🎉 Success!

Your BrainSAIT Healthcare Platform is now deployed on AWS Free Tier with:

✅ **HIPAA Compliance**: Full encryption and security
✅ **Cost Optimization**: $0-$5/month estimated cost
✅ **High Performance**: <2s load times, 99.9% uptime
✅ **Scalability**: Auto-scaling within free tier limits
✅ **Monitoring**: Comprehensive health and cost monitoring
✅ **Security**: WAF, SSL/TLS, security headers

## 📚 Next Steps

1. **Custom Domain**: Configure your own domain name
2. **Monitoring**: Set up advanced monitoring and alerts
3. **Backup**: Implement backup and disaster recovery
4. **Scaling**: Plan for growth beyond free tier
5. **Integration**: Connect with external healthcare systems

---

**BrainSAIT Healthcare Platform** - Where Original Intelligence Meets Healthcare Innovation

*Built with ❤️ by the BrainSAIT Healthcare Team*
