#!/bin/bash

# Automatic (non-interactive) Nginx setup for /agreement path
# This version doesn't ask for confirmation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}PLP Agreement - Automatic Nginx Setup${NC}"
echo ""

# Step 1: Find existing Nginx config
echo -e "${BLUE}Finding Nginx configuration...${NC}"

CONFIG_FILE=""
if [ -f "/etc/nginx/sites-available/plp-tms" ]; then
    CONFIG_FILE="/etc/nginx/sites-available/plp-tms"
elif [ -f "/etc/nginx/sites-available/plp-tms.moeys.gov.kh" ]; then
    CONFIG_FILE="/etc/nginx/sites-available/plp-tms.moeys.gov.kh"
else
    FOUND=$(sudo grep -l "plp-tms.moeys.gov.kh" /etc/nginx/sites-available/* 2>/dev/null | head -1)
    if [ -n "$FOUND" ]; then
        CONFIG_FILE="$FOUND"
    fi
fi

if [ -z "$CONFIG_FILE" ]; then
    echo -e "${RED}✗ Could not find Nginx config for plp-tms.moeys.gov.kh${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found config: $CONFIG_FILE${NC}"

# Step 2: Backup
echo -e "${BLUE}Creating backup...${NC}"
BACKUP_FILE="${CONFIG_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
sudo cp "$CONFIG_FILE" "$BACKUP_FILE"
echo -e "${GREEN}✓ Backup: $BACKUP_FILE${NC}"

# Step 3: Check if already exists
if sudo grep -q "location /agreement" "$CONFIG_FILE"; then
    echo -e "${YELLOW}⚠ /agreement already configured${NC}"
    exit 0
fi

# Step 4: Add /agreement location
echo -e "${BLUE}Adding /agreement location...${NC}"
TEMP_CONFIG="/tmp/nginx-plp-tms-new.conf"

sudo awk '
/location \/ \{/ && !added {
    print "    # Agreement app (port 5050)"
    print "    location /agreement {"
    print "        proxy_pass http://192.168.155.122:5050;"
    print "        proxy_http_version 1.1;"
    print "        proxy_set_header Upgrade $http_upgrade;"
    print "        proxy_set_header Connection '\''upgrade'\'';"
    print "        proxy_set_header Host $host;"
    print "        proxy_set_header X-Real-IP $remote_addr;"
    print "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
    print "        proxy_set_header X-Forwarded-Proto $scheme;"
    print "        proxy_cache_bypass $http_upgrade;"
    print "    }"
    print ""
    added = 1
}
{ print }
' "$CONFIG_FILE" | sudo tee "$TEMP_CONFIG" > /dev/null

# Step 5: Apply configuration
sudo cp "$TEMP_CONFIG" "$CONFIG_FILE"
sudo rm "$TEMP_CONFIG"
echo -e "${GREEN}✓ Configuration applied${NC}"

# Step 6: Test and reload
echo -e "${BLUE}Testing Nginx...${NC}"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Config valid${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
    echo ""
    echo -e "${GREEN}Setup complete!${NC}"
    echo "Test: https://plp-tms.moeys.gov.kh/agreement"
else
    echo -e "${RED}✗ Config invalid, rolling back${NC}"
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi
