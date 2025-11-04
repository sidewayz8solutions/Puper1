#!/bin/bash

# Script to add Android platform to Puper mobile app

set -e

echo "🤖 Adding Android Platform to Puper"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from puper/frontend directory${NC}"
    exit 1
fi

# Check if Android Studio is installed
if ! command -v android &> /dev/null; then
    echo -e "${YELLOW}Warning: Android Studio/SDK not detected${NC}"
    echo "Please install Android Studio from: https://developer.android.com/studio"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Install Capacitor Android
echo -e "${BLUE}Step 1: Installing Capacitor Android...${NC}"
npm install @capacitor/android --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Capacitor Android installed${NC}"
else
    echo -e "${RED}✗ Installation failed${NC}"
    exit 1
fi
echo ""

# Step 2: Add Android platform
echo -e "${BLUE}Step 2: Adding Android platform...${NC}"
npx cap add android

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Android platform added${NC}"
else
    echo -e "${RED}✗ Failed to add Android platform${NC}"
    exit 1
fi
echo ""

# Step 3: Build web app
echo -e "${BLUE}Step 3: Building web app...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Web app built${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Sync to Android
echo -e "${BLUE}Step 4: Syncing to Android...${NC}"
npx cap sync android

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Synced to Android${NC}"
else
    echo -e "${RED}✗ Sync failed${NC}"
    exit 1
fi
echo ""

# Step 5: Open in Android Studio (optional)
echo -e "${BLUE}Step 5: Opening in Android Studio...${NC}"
read -p "Do you want to open the project in Android Studio now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx cap open android
    echo -e "${GREEN}✓ Android Studio opened${NC}"
else
    echo -e "${YELLOW}Skipped opening Android Studio${NC}"
    echo -e "${BLUE}To open later, run: npx cap open android${NC}"
fi
echo ""

echo -e "${GREEN}=================================="
echo -e "🎉 Android platform added!"
echo -e "==================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Open Android Studio: npx cap open android"
echo "2. Wait for Gradle sync to complete"
echo "3. Select your device/emulator"
echo "4. Click the Run button"
echo ""
echo -e "${YELLOW}Note: Make sure you have Android SDK and build tools installed${NC}"

