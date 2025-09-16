# BrainSAIT Healthcare Platform - Deployment Guide

## 🏥 Static Deployment to AWS S3

This guide explains how to deploy the BrainSAIT Healthcare Platform to AWS S3 as a static website accessible at:
**https://brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com**

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js** 18+ and npm
4. **Git** for version control

## 🚀 Quick Deployment

### Option 1: Automated Script
```bash
# Run the automated deployment script
./deploy-s3.sh
```

### Option 2: Manual Deployment
```bash
# 1. Install dependencies
npm ci

# 2. Build static application
npm run build:optimized

# 3. Deploy to S3
aws s3 sync out/ s3://brainsait-healthcare-1757618402 \
    --region us-east-1 \
    --delete \
    --exact-timestamps

# 4. Configure website hosting
aws s3 website s3://brainsait-healthcare-1757618402 \
    --index-document index.html \
    --error-document 404.html \
    --region us-east-1
```

## 🏗️ Architecture Overview

The platform is deployed as a **static Next.js application** with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │    S3 Bucket    │    │   Lambda API    │
│   (Optional)    ├────┤  Static Assets  ├────┤   Gateway       │
│   CDN Layer     │    │                 │    │   (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components:
- **Frontend**: Static React/Next.js application
- **API**: External Lambda functions via API Gateway
- **Storage**: S3 for static file hosting
- **CDN**: CloudFront for global distribution (recommended)

## 🔧 Configuration

### Environment Variables
The following environment variables are automatically configured:

```javascript
// Production Configuration
NEXT_PUBLIC_API_URL: 'https://vmzuql0azj.execute-api.us-east-1.amazonaws.com/prod'
NEXT_PUBLIC_SITE_URL: 'https://brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com'
```

### Build Configuration
```javascript
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com'
    : '',
}
```

## 📦 Build Process

### 1. Static Export Generation
```bash
npm run build:optimized
```

This command:
- ✅ Generates static HTML files
- ✅ Optimizes JavaScript bundles
- ✅ Processes CSS and assets
- ✅ Creates the `out/` directory

### 2. File Structure
```
out/
├── index.html              # Main dashboard page
├── oid-management/
│   └── index.html         # OID management interface
├── _next/
│   ├── static/            # Optimized assets
│   └── chunks/            # JavaScript bundles
├── 404.html               # Error page
└── robots.txt             # SEO configuration
```

## 🌐 Features Supported

### ✅ Fully Functional
- ✅ **Healthcare Dashboard** - Real-time metrics and analytics
- ✅ **OID Management** - Complete tree visualization and management
- ✅ **Patient Records** - Comprehensive patient data management
- ✅ **AI Analytics** - Medical AI insights and performance tracking
- ✅ **Responsive Design** - Mobile and desktop optimized
- ✅ **Arabic/RTL Support** - Full internationalization
- ✅ **Security Headers** - HIPAA compliant security measures

### 🔧 External Dependencies
- ✅ **API Endpoints** - Served via AWS Lambda/API Gateway
- ✅ **Authentication** - External auth service integration
- ✅ **Database** - External database connections
- ✅ **File Uploads** - S3 direct uploads

## 🔐 Security Configuration

### HTTPS Enforcement
- All traffic redirected to HTTPS
- HSTS headers configured
- Secure cookie settings

### Healthcare Compliance
- HIPAA compliant headers
- CSP (Content Security Policy)
- XSS protection enabled
- Frame options configured

### Security Headers Applied:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
```

## 📊 Performance Optimizations

### Build Optimizations
- ✅ **Code Splitting** - Automatic route-based splitting
- ✅ **Tree Shaking** - Unused code elimination
- ✅ **Minification** - JavaScript and CSS compression
- ✅ **Image Optimization** - WebP conversion where supported

### Caching Strategy
```bash
# Static assets (1 year cache)
/_next/static/* - Cache-Control: public,max-age=31536000,immutable

# HTML files (no cache)
/*.html - Cache-Control: public,max-age=0,must-revalidate

# API calls (client-side caching)
External API - Handled by client-side cache
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next out node_modules
npm ci
npm run build:optimized
```

#### 2. **S3 Access Denied**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify bucket permissions
aws s3api get-bucket-policy --bucket brainsait-healthcare-1757618402
```

#### 3. **Website Not Loading**
```bash
# Check S3 website configuration
aws s3api get-bucket-website --bucket brainsait-healthcare-1757618402

# Verify bucket policy allows public read
aws s3api get-bucket-policy --bucket brainsait-healthcare-1757618402
```

#### 4. **API Calls Failing**
- Verify external API Gateway is running
- Check CORS configuration
- Validate API endpoint URLs

## 📈 Monitoring & Analytics

### Health Checks
The deployment script includes automatic health checks:
```bash
curl -sf https://brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com
```

### Performance Monitoring
- **CloudWatch** - AWS native monitoring
- **Real User Monitoring** - Client-side performance tracking
- **API Gateway Logs** - External API performance

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
name: Deploy to S3
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
      - run: npm run build:optimized
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: ./deploy-s3.sh
```

## 📞 Support

For deployment issues or questions:

1. **Check logs**: `tail -f /var/log/deployment.log`
2. **AWS Support**: Contact AWS support for infrastructure issues
3. **Application Issues**: Check the application logs in CloudWatch

## 🎯 Next Steps

After successful deployment:

1. **🌐 Configure CloudFront** for global CDN
2. **📝 Set up custom domain** with Route 53
3. **🔐 SSL Certificate** via AWS Certificate Manager
4. **📊 Monitoring** with CloudWatch dashboards
5. **🔧 Auto-deployment** via CI/CD pipeline

---

## 📋 Quick Checklist

- [ ] AWS CLI configured
- [ ] Dependencies installed (`npm ci`)
- [ ] Build successful (`npm run build:optimized`)
- [ ] S3 bucket accessible
- [ ] Website loading correctly
- [ ] API endpoints responding
- [ ] Security headers configured
- [ ] Performance optimized

**🎉 Your BrainSAIT Healthcare Platform is now live!**

Access it at: **https://brainsait-healthcare-1757618402.s3-website-us-east-1.amazonaws.com**