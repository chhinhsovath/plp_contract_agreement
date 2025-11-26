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
    echo "Current /agreement configuration:"
    grep -A 15 "location /agreement" "$CONFIG_FILE"
    echo ""
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

# Strategy: Insert /agreement location BEFORE the first "location /" block
# This ensures /agreement takes priority over the catch-all location
sudo awk '
/location \/ \{/ && !added {
    # Insert /agreement block BEFORE the catch-all location /
    print "    # Agreement app (port 5050) - /agreement path"
    print "    # Note: Next.js handles /agreement prefix with basePath config"
    print "    # This location must come BEFORE location / to take priority"
    print "    location /agreement {"
    print "        proxy_pass http://192.168.155.122:5050;"
    print "        proxy_http_version 1.1;"
    print "        proxy_set_header Upgrade $http_upgrade;"
    print "        proxy_set_header Connection '\''upgrade'\'';"
    print "        proxy_set_header Host $host;"
    print "        proxy_set_header X-Real-IP $remote_addr;"
    print "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
    print "        proxy_set_header X-Forwarded-Proto $scheme;"
    print "        proxy_set_header X-Forwarded-Host $host;"
    print "        proxy_set_header X-Forwarded-Port $server_port;"
    print "        proxy_cache_bypass $http_upgrade;"
    print "        proxy_redirect off;"
    print "    }"
    print ""
    added = 1
}
{ print }
END {
    if (!added) {
        print "" > "/dev/stderr"
        print "WARNING: Could not find \"location /\" block to insert before." > "/dev/stderr"
        print "The /agreement location was not added." > "/dev/stderr"
        print "You may need to add it manually." > "/dev/stderr"
        exit 1
    }
}
' "$CONFIG_FILE" | sudo tee "$TEMP_CONFIG" > /dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to create new configuration${NC}"
    echo ""
    echo "Your Nginx config might not have a standard 'location /' block."
    echo "Please add the /agreement location manually before any catch-all location."
    echo ""
    echo "Add this block:"
    echo "    location /agreement {"
    echo "        proxy_pass http://192.168.155.122:5050;"
    echo "        proxy_http_version 1.1;"
    echo "        proxy_set_header Upgrade \$http_upgrade;"
    echo "        proxy_set_header Connection 'upgrade';"
    echo "        proxy_set_header Host \$host;"
    echo "        proxy_set_header X-Real-IP \$remote_addr;"
    echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "        proxy_set_header X-Forwarded-Host \$host;"
    echo "        proxy_set_header X-Forwarded-Port \$server_port;"
    echo "        proxy_cache_bypass \$http_upgrade;"
    echo "        proxy_redirect off;"
    echo "    }"
    exit 1
fi

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
    echo "  1. Test existing app: https://plp-tms.moeys.gov.kh"
    echo "  2. Test agreement app: https://plp-tms.moeys.gov.kh/agreement"
    echo "  3. Check PM2 status: pm2 status"
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
