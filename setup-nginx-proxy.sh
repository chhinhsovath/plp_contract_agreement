#!/bin/bash

# Setup script for Nginx reverse proxy to serve agreement app at /agreement path
# This preserves your existing plp-tms.moeys.gov.kh setup (port 3030)

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PLP Agreement - Nginx Reverse Proxy Setup                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Find existing Nginx config
echo -e "${BLUE}Step 1: Finding Nginx configuration for plp-tms.moeys.gov.kh...${NC}"

# Search for the config file
CONFIG_FILE=""
if [ -f "/etc/nginx/sites-available/plp-tms" ]; then
    CONFIG_FILE="/etc/nginx/sites-available/plp-tms"
elif [ -f "/etc/nginx/sites-available/plp-tms.moeys.gov.kh" ]; then
    CONFIG_FILE="/etc/nginx/sites-available/plp-tms.moeys.gov.kh"
else
    # Search for files containing plp-tms
    FOUND=$(grep -l "plp-tms.moeys.gov.kh" /etc/nginx/sites-available/* 2>/dev/null | head -1)
    if [ -n "$FOUND" ]; then
        CONFIG_FILE="$FOUND"
    fi
fi

if [ -z "$CONFIG_FILE" ]; then
    echo -e "${RED}✗ Could not find Nginx config for plp-tms.moeys.gov.kh${NC}"
    echo "Available configs:"
    ls -la /etc/nginx/sites-available/
    exit 1
fi

echo -e "${GREEN}✓ Found config: $CONFIG_FILE${NC}"
echo ""

# Step 2: Backup existing configuration
echo -e "${BLUE}Step 2: Creating backup of existing configuration...${NC}"
BACKUP_FILE="${CONFIG_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
sudo cp "$CONFIG_FILE" "$BACKUP_FILE"
echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
echo ""

# Step 3: Check if /agreement location already exists
echo -e "${BLUE}Step 3: Checking if /agreement configuration already exists...${NC}"
if grep -q "location /agreement" "$CONFIG_FILE"; then
    echo -e "${YELLOW}⚠ /agreement location block already exists!${NC}"
    echo "Please review manually: $CONFIG_FILE"
    echo "Backup is available at: $BACKUP_FILE"
    exit 0
fi
echo -e "${GREEN}✓ No existing /agreement configuration found${NC}"
echo ""

# Step 4: Show current configuration
echo -e "${BLUE}Step 4: Current Nginx configuration:${NC}"
echo -e "${YELLOW}---${NC}"
cat "$CONFIG_FILE"
echo -e "${YELLOW}---${NC}"
echo ""

# Step 5: Create new configuration with /agreement location
echo -e "${BLUE}Step 5: Adding /agreement location block...${NC}"

# Create temporary file with new configuration
TEMP_CONFIG="/tmp/nginx-plp-tms-new.conf"

# Read the existing config and add /agreement location before the last closing brace
sudo awk '
/^}$/ && !added {
    print "    # Agreement app (port 5050) - /agreement path"
    print "    # Note: Next.js handles /agreement prefix with basePath config"
    print "    location /agreement {
        proxy_pass http://192.168.155.122:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '\''upgrade'\'';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }
}
{ print }
' "$CONFIG_FILE" | sudo tee "$TEMP_CONFIG" > /dev/null

echo -e "${GREEN}✓ New configuration prepared${NC}"
echo ""

# Step 6: Show the new configuration
echo -e "${BLUE}Step 6: Review new configuration:${NC}"
echo -e "${YELLOW}---${NC}"
cat "$TEMP_CONFIG"
echo -e "${YELLOW}---${NC}"
echo ""

# Step 7: Ask for confirmation
echo -e "${YELLOW}Do you want to apply this configuration? (yes/no)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}✗ Configuration not applied. Backup preserved at: $BACKUP_FILE${NC}"
    rm "$TEMP_CONFIG"
    exit 0
fi

# Step 8: Apply the new configuration
echo -e "${BLUE}Step 7: Applying new configuration...${NC}"
sudo cp "$TEMP_CONFIG" "$CONFIG_FILE"
rm "$TEMP_CONFIG"
echo -e "${GREEN}✓ Configuration applied${NC}"
echo ""

# Step 9: Test Nginx configuration
echo -e "${BLUE}Step 8: Testing Nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration test passed${NC}"
    echo ""

    # Step 10: Reload Nginx
    echo -e "${BLUE}Step 9: Reloading Nginx...${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
    echo ""

    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Setup completed successfully!                               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Your applications are now accessible at:${NC}"
    echo "  - https://plp-tms.moeys.gov.kh (existing app - port 3030)"
    echo "  - https://plp-tms.moeys.gov.kh/agreement (new agreement app - port 5050)"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Ensure port 5050 app is running (pm2 status)"
    echo "  2. Test: curl http://localhost:5050"
    echo "  3. Visit: https://plp-tms.moeys.gov.kh/agreement"
    echo ""
    echo -e "${BLUE}Backup location: $BACKUP_FILE${NC}"

else
    echo -e "${RED}✗ Nginx configuration test failed!${NC}"
    echo ""
    echo -e "${YELLOW}Rolling back to previous configuration...${NC}"
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo -e "${GREEN}✓ Rolled back to backup${NC}"
    echo ""
    echo "Please review the error messages above and fix any issues."
    exit 1
fi
