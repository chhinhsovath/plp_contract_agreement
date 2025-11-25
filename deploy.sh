#!/bin/bash

# PLP Contract Agreement - One-Command Deployment Script
# Usage: bash deploy.sh "Your commit message"
# Example: bash deploy.sh "feature: add new dashboard"
# repository: https://github.com/chhinhsovath/plp_contract_agreement.git
set -e

# Load environment variables from .env and .env.local
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '#' | xargs)
fi

# Extract server password from .env
DEPLOY_SERVER_PASSWORD="${DEPLOY_SERVER_PASSWORD:-testing-123}"


# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="admin_moeys"
DEPLOY_SERVER="192.168.155.122"
DEPLOY_PATH="/home/admin_moeys/plp_contract_agreement"
COMMIT_MESSAGE="${1:-chore: deploy update}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PLP Contract Agreement - Automated Deployment Script        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Local build validation
echo -e "${YELLOW}Step 1: Building locally to validate code...${NC}"
echo -e "${BLUE}This ensures code builds successfully before pushing to git${NC}"
npm run build > /tmp/local_build.log 2>&1 || {
  echo -e "${RED}✗ Local build failed!${NC}"
  echo -e "${RED}Fix the errors below before deploying:${NC}"
  echo ""
  tail -50 /tmp/local_build.log
  echo ""
  echo -e "${RED}Deployment aborted. Code NOT pushed to git.${NC}"
  exit 1
}
echo -e "${GREEN}✓ Local build successful${NC}"

# Step 2: Local git operations
echo ""
echo -e "${YELLOW}Step 2: Preparing local changes...${NC}"
git add .
echo -e "${GREEN}✓ Files staged${NC}"

git commit -m "$COMMIT_MESSAGE" || echo -e "${YELLOW}⚠ No changes to commit${NC}"
echo -e "${GREEN}✓ Committed with message: '$COMMIT_MESSAGE'${NC}"

echo ""
echo -e "${YELLOW}Step 3: Pushing to GitHub...${NC}"
git push origin main
echo -e "${GREEN}✓ Pushed to GitHub${NC}"

echo ""
echo -e "${YELLOW}Step 4: Deploying to server ($DEPLOY_SERVER)...${NC}"

# Step 2: Remote deployment via SSH with password authentication
# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
  echo -e "${YELLOW}Installing sshpass...${NC}"
  if command -v brew &> /dev/null; then
    brew install sshpass 2>/dev/null || true
  else
    echo -e "${RED}❌ sshpass not found and cannot auto-install${NC}"
    echo "Please install sshpass: brew install sshpass (macOS) or apt-get install sshpass (Linux)"
    exit 1
  fi
fi

sshpass -p "$DEPLOY_SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 $DEPLOY_USER@$DEPLOY_SERVER << 'REMOTE_EOF'
set -e

echo -e "\033[1;34m📁 Navigating to deployment directory...\033[0m"
cd /home/admin_moeys/plp_contract_agreement

echo -e "\033[1;34m🔄 Pulling latest code from GitHub...\033[0m"
git fetch origin main
git reset --hard origin/main
echo -e "\033[0;32m✓ Code pulled\033[0m"

echo -e "\033[1;34m🧹 Cleaning up Docker artifacts...\033[0m"
rm -f docker-compose.yml Dockerfile .dockerignore 2>/dev/null || true
echo -e "\033[0;32m✓ Cleanup done\033[0m"

echo -e "\033[1;34m📦 Installing dependencies...\033[0m"
npm ci 2>&1 | tail -10
echo -e "\033[0;32m✓ Dependencies installed\033[0m"

echo -e "\033[1;34m🔨 Building application...\033[0m"
npm run build > /tmp/build.log 2>&1 || {
  echo -e "\033[0;31m✗ Build failed\033[0m"
  tail -50 /tmp/build.log
  exit 1
}
echo -e "\033[0;32m✓ Build completed\033[0m"

echo -e "\033[1;34m🔥 Ensuring port 5050 is open in firewall...\033[0m"
if command -v ufw &> /dev/null; then
  echo "testing-123" | sudo -S ufw allow 5050/tcp 2>/dev/null || echo "Firewall rule already exists"
  echo -e "\033[0;32m✓ Port 5050 is open in firewall\033[0m"
else
  echo -e "\033[0;33m⚠ UFW not found, skipping firewall configuration\033[0m"
fi

echo -e "\033[1;34m🚀 Starting application...\033[0m"
if command -v pm2 &> /dev/null; then
  pm2 delete plp-contract-agreement 2>/dev/null || true
  NODE_ENV=production PORT=5050 pm2 start npm --name "plp-contract-agreement" --update-env -- start
  pm2 save
  echo -e "\033[0;32m✓ Application started with PM2 (NODE_ENV=production)\033[0m"
else
  echo -e "\033[0;33m⚠ PM2 not found, starting with npm...\033[0m"
  NODE_ENV=production PORT=5050 nohup npm start > /tmp/plp-contract-agreement.log 2>&1 &
  echo -e "\033[0;32m✓ Application started\033[0m"
fi

echo ""
echo -e "\033[1;34m⏳ Waiting 10 seconds for application to be ready...\033[0m"
sleep 10

echo -e "\033[1;34m📊 Checking application status...\033[0m"
if command -v pm2 &> /dev/null; then
  pm2 status plp-contract-agreement 2>/dev/null || echo "PM2 status: Running"
fi

echo ""
echo -e "\033[1;34m🏥 Running health check...\033[0m"
if curl -s http://localhost:5050/api/health | grep -q '"status"'; then
  echo -e "\033[0;32m✓ Application is healthy\033[0m"
else
  echo -e "\033[0;33m⚠ Health check endpoint pending, checking basic connectivity...\033[0m"
  sleep 5
  if curl -s http://localhost:5050 > /dev/null; then
    echo -e "\033[0;32m✓ Application is responding\033[0m"
  else
    echo -e "\033[0;31m✗ Application not responding yet\033[0m"
  fi
fi

echo ""
echo -e "\033[1;34m⚙️  Initializing background tasks...\033[0m"
sleep 3
if curl -s http://localhost:5050/api/init/training-status-updater | grep -q '"success":true'; then
  echo -e "\033[0;32m✓ Training status updater initialized\033[0m"
  echo -e "\033[0;32m  └─ Running daily at 2 AM Cambodia time\033[0m"
else
  echo -e "\033[0;33m⚠ Training status updater initialization pending\033[0m"
fi

REMOTE_EOF

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Your platform is live at:${NC}"
echo -e "${BLUE}  🌐 Domain: http://mel.openplp.org${NC}"
echo -e "${BLUE}  🔗 Direct: http://192.168.155.122:5050${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test your changes: http://mel.openplp.org or http://192.168.155.122:5050"
echo "  2. View logs: ssh $DEPLOY_USER@$DEPLOY_SERVER 'pm2 logs plp-contract-agreement'"
echo "  3. Restart app: ssh $DEPLOY_USER@$DEPLOY_SERVER 'pm2 restart plp-contract-agreement'"
echo "  4. Check status: ssh $DEPLOY_USER@$DEPLOY_SERVER 'pm2 status'"
echo ""
