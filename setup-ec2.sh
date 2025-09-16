#!/bin/bash

# EC2 Free Tier Setup for BrainSAIT Healthcare Platform
# Run this script on a fresh Amazon Linux 2 instance

set -e

echo "🏥 Setting up EC2 Free Tier for BrainSAIT Healthcare Platform"
echo "============================================================"

# Update system
echo "📦 Updating system..."
sudo yum update -y

# Install required packages
echo "🔧 Installing required packages..."
sudo yum install -y git curl wget htop

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Cloudflared
echo "☁️ Installing Cloudflared..."
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/brainsait
sudo chown ec2-user:ec2-user /opt/brainsait

# Create systemd service for auto-start
echo "🔄 Creating systemd service..."
sudo tee /etc/systemd/system/brainsait-healthcare.service > /dev/null <<EOF
[Unit]
Description=BrainSAIT Healthcare Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/brainsait
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=ec2-user

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl enable brainsait-healthcare.service

# Configure firewall
echo "🔥 Configuring firewall..."
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Create deployment script
echo "📝 Creating deployment helper..."
cat > /home/ec2-user/deploy.sh << 'EOF'
#!/bin/bash
cd /opt/brainsait
echo "🔄 Pulling latest changes..."
git pull origin main
echo "🏗️ Rebuilding containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo "✅ Deployment complete!"
EOF

chmod +x /home/ec2-user/deploy.sh

echo ""
echo "✅ EC2 Setup Complete!"
echo "====================="
echo ""
echo "📋 Next Steps:"
echo "1. Upload your application files to /opt/brainsait"
echo "2. Set up Cloudflare tunnel token"
echo "3. Run: cd /opt/brainsait && docker-compose up -d"
echo ""
echo "🔗 Useful Commands:"
echo "  sudo systemctl status brainsait-healthcare  # Check service status"
echo "  cd /opt/brainsait && docker-compose logs -f # View logs"
echo "  ~/deploy.sh                                 # Quick deployment"
echo ""
echo "🌐 Your instance is ready for BrainSAIT Healthcare Platform!"
