#!/bin/bash

###############################################################################
# Setup Daily Cron Job for Database Migration
# This script helps you set up automatic daily migration
###############################################################################

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Daily Database Migration - Cron Setup Helper          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}This will help you set up automatic daily database migration.${NC}"
echo ""
echo -e "Current project directory: ${GREEN}$PROJECT_DIR${NC}"
echo ""

# Ask for preferred time
echo -e "${BLUE}What time should the migration run daily?${NC}"
echo ""
echo "  1) 2:00 AM (recommended - low traffic time)"
echo "  2) 11:00 PM (before midnight)"
echo "  3) 3:00 AM"
echo "  4) Custom time"
echo ""
read -p "Enter choice [1-4]: " time_choice

case $time_choice in
    1)
        HOUR=2
        MINUTE=0
        TIME_DESC="2:00 AM"
        ;;
    2)
        HOUR=23
        MINUTE=0
        TIME_DESC="11:00 PM"
        ;;
    3)
        HOUR=3
        MINUTE=0
        TIME_DESC="3:00 AM"
        ;;
    4)
        read -p "Enter hour (0-23): " HOUR
        read -p "Enter minute (0-59): " MINUTE
        TIME_DESC="$HOUR:$(printf '%02d' $MINUTE)"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Create the cron entry
CRON_ENTRY="$MINUTE $HOUR * * * cd $PROJECT_DIR && ./migrate-db.sh >> $PROJECT_DIR/logs/cron-migration.log 2>&1"

echo ""
echo -e "${GREEN}Cron job will be set up with the following configuration:${NC}"
echo ""
echo "  Time: $TIME_DESC daily"
echo "  Script: $PROJECT_DIR/migrate-db.sh"
echo "  Log: $PROJECT_DIR/logs/cron-migration.log"
echo ""
echo "Cron entry:"
echo -e "${BLUE}$CRON_ENTRY${NC}"
echo ""

read -p "Add this cron job? (y/n): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo "Cancelled."
    exit 0
fi

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "migrate-db.sh"; then
    echo ""
    echo -e "${YELLOW}⚠ Warning: A similar cron job already exists:${NC}"
    crontab -l | grep "migrate-db.sh"
    echo ""
    read -p "Replace it? (y/n): " replace

    if [[ $replace == "y" || $replace == "Y" ]]; then
        # Remove old entry and add new one
        (crontab -l 2>/dev/null | grep -v "migrate-db.sh"; echo "$CRON_ENTRY") | crontab -
        echo ""
        echo -e "${GREEN}✓ Cron job updated successfully!${NC}"
    else
        echo "Keeping existing cron job."
        exit 0
    fi
else
    # Add new cron entry
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo ""
    echo -e "${GREEN}✓ Cron job added successfully!${NC}"
fi

echo ""
echo -e "${BLUE}Current crontab entries for this project:${NC}"
crontab -l | grep "migrate-db.sh"

echo ""
echo -e "${GREEN}═════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════════════${NC}"
echo ""
echo "The database migration will run automatically at $TIME_DESC daily."
echo ""
echo "Useful commands:"
echo "  • View all cron jobs:        crontab -l"
echo "  • Remove this cron job:      crontab -e  (then delete the line)"
echo "  • Check cron logs:           tail -f $PROJECT_DIR/logs/cron-migration.log"
echo "  • Test migration manually:   $PROJECT_DIR/migrate-db.sh"
echo ""
