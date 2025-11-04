#!/bin/bash

# Puper Mobile Deployment Script
# This script builds the web app and syncs it to the iOS mobile app

set -e  # Exit on error

echo "🚽 Puper Mobile Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from puper/frontend directory${NC}"
    exit 1
fi

# Step 1: Install dependencies (if needed)
echo -e "${BLUE}Step 1: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Step 2: Build the web app
echo -e "${BLUE}Step 2: Building web app...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Web app built successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 3: Sync to iOS
echo -e "${BLUE}Step 3: Syncing to iOS...${NC}"
npx cap sync ios

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Synced to iOS successfully${NC}"
else
    echo -e "${RED}✗ Sync failed${NC}"
    exit 1
fi
echo ""

# Step 4: Open in Xcode (optional)
echo -e "${BLUE}Step 4: Opening in Xcode...${NC}"
read -p "Do you want to open the project in Xcode now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx cap open ios
    echo -e "${GREEN}✓ Xcode opened${NC}"
else
    echo -e "${YELLOW}Skipped opening Xcode${NC}"
    echo -e "${BLUE}To open later, run: npx cap open ios${NC}"
fi
echo ""

echo -e "${GREEN}=================================="
echo -e "🎉 Deployment complete!"
echo -e "==================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. In Xcode, select your device/simulator"
echo "2. Click the Play button (or press Cmd + R)"
echo "3. The app will build and launch"
echo ""
echo -e "${YELLOW}Tip: After making code changes, run this script again to rebuild and sync${NC}"

