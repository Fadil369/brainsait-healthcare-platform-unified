# 🐳 Docker Deployment Guide

## 🏥 BrainSAIT Healthcare Platform - Docker Deployment

### 📋 Prerequisites

1. **AWS EC2 Free Tier Instance** (t2.micro)
2. **Cloudflare Account** with domain `brainsait.com`
3. **Docker & Docker Compose** installed

### 🚀 Quick Deployment

#### Step 1: Setup EC2 Instance
```bash
# Run on fresh Amazon Linux 2 instance
curl -sSL https://raw.githubusercontent.com/brainsait/healthcare-platform/main/setup-ec2.sh | bash
```

#### Step 2: Deploy Application
```bash
# Upload files to EC2
scp -r . ec2-user@your-instance:/opt/brainsait/

# SSH to instance
ssh ec2-user@your-instance

# Navigate to app directory
cd /opt/brainsait

# Set Cloudflare tunnel token
export CLOUDFLARE_TUNNEL_TOKEN="your-tunnel-token"

# Deploy
./deploy-docker.sh
```

### 🔧 Configuration Files

#### **Docker Compose** (`docker-compose.yml`)
- **brainsait-app**: Main Next.js application
- **cloudflared**: Cloudflare tunnel for public access
- **nginx**: Reverse proxy with HIPAA headers

#### **Dockerfile**
- Multi-stage build for optimization
- Node.js 18 Alpine base
- Production-ready configuration

#### **Nginx Configuration** (`nginx.conf`)
- HIPAA compliant security headers
- SSL termination
- Healthcare API routing

### 🌐 Cloudflare Tunnel Setup

#### 1. Create Tunnel
```bash
cloudflared tunnel create brainsait-healthcare
```

#### 2. Configure DNS
```bash
# Add CNAME records in Cloudflare dashboard
brainsait.com -> tunnel-id.cfargotunnel.com
www.brainsait.com -> tunnel-id.cfargotunnel.com
api.brainsait.com -> tunnel-id.cfargotunnel.com
```

#### 3. Get Tunnel Token
```bash
cloudflared tunnel token brainsait-healthcare
```

### 📊 Service Architecture

```
Internet → Cloudflare → Tunnel → Nginx → Next.js App
                                    ↓
                              Healthcare APIs
                              (NPHIES, FHIR)
```

### 🔒 Security Features

- **HIPAA Compliant Headers**
- **SSL/TLS Encryption**
- **Content Security Policy**
- **XSS Protection**
- **CSRF Protection**

### 📈 Monitoring & Health Checks

#### Health Check Endpoints
- **Main**: `https://brainsait.com/api/health`
- **FHIR**: `https://brainsait.com/api/fhir/metadata`
- **NPHIES**: `https://brainsait.com/api/nphies/eligibility`

#### Docker Health Checks
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### 🔄 Deployment Commands

```bash
# Initial deployment
docker-compose up -d --build

# Update deployment
git pull origin main
docker-compose down
docker-compose up -d --build

# View logs
docker-compose logs -f brainsait-app

# Scale services (if needed)
docker-compose up -d --scale brainsait-app=2
```

### 🌍 Environment Variables

```bash
# Required environment variables
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
AWS_REGION=us-east-1
NPHIES_BASE_URL=https://nphies.sa/fhir/R4
CLOUDFLARE_TUNNEL_TOKEN=your-token
```

### 📱 Access URLs

- **Main Site**: https://brainsait.com
- **API Docs**: https://api.brainsait.com
- **Health Check**: https://health.brainsait.com
- **NPHIES**: https://nphies.brainsait.com

### 🛠️ Troubleshooting

#### Common Issues

1. **Container won't start**
   ```bash
   docker-compose logs brainsait-app
   ```

2. **Tunnel connection failed**
   ```bash
   docker-compose logs cloudflared
   ```

3. **Health check failing**
   ```bash
   curl http://localhost:3000/api/health
   ```

#### Performance Optimization

```bash
# Monitor resource usage
docker stats

# Clean up unused images
docker system prune -a

# Update containers
docker-compose pull
docker-compose up -d
```

### 💰 Cost Optimization

- **EC2 t2.micro**: Free tier eligible
- **Cloudflare**: Free plan sufficient
- **Docker**: No additional costs
- **Estimated Monthly**: $0 (within free tier limits)

### 🔄 CI/CD Integration

The Docker deployment integrates with existing GitHub workflows:

```yaml
# .github/workflows/docker-deploy.yml
- name: Deploy to EC2
  run: |
    ssh ec2-user@${{ secrets.EC2_HOST }} "cd /opt/brainsait && ./deploy.sh"
```

### 📞 Support

- **Documentation**: This guide
- **Issues**: GitHub Issues
- **Health Status**: https://health.brainsait.com

---

**🏥 BrainSAIT Healthcare Platform - Docker Deployment Complete!**
