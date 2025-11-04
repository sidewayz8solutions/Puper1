#!/bin/bash

# 🚽 Püper - Apple App Store Deployment Script
# This script guides you through deploying to the App Store

set -e

echo "🚽 Püper - Apple App Store Deployment"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: Must run from PuperMobile directory"
    echo "   cd PuperMobile && ./deploy-app-store.sh"
    exit 1
fi

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if logged in
echo "🔐 Checking EAS login status..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in. Please login:"
    echo "   eas login"
    exit 1
fi

echo "✅ Logged in as: $(eas whoami)"
echo ""

# Step 1: Verify App Store Connect Setup
echo "📋 STEP 1: App Store Connect Setup"
echo "-----------------------------------"
echo ""
echo "Before building, ensure you have:"
echo "  ✅ Apple Developer Account ($99/year)"
echo "  ✅ App created in App Store Connect"
echo "  ✅ Bundle ID: com.sidewayz8.puper"
echo "  ✅ App Store Connect App ID"
echo ""
read -p "Have you created the app in App Store Connect? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 Please do the following:"
    echo "  1. Go to https://appstoreconnect.apple.com/"
    echo "  2. Click 'My Apps' → '+' → 'New App'"
    echo "  3. Fill in:"
    echo "     - Platform: iOS"
    echo "     - Name: Püper"
    echo "     - Primary Language: English"
    echo "     - Bundle ID: com.sidewayz8.puper"
    echo "     - SKU: puper-001"
    echo ""
    echo "  4. Note your App Store Connect App ID"
    echo "  5. Run this script again"
    exit 0
fi

# Step 2: Update eas.json
echo ""
echo "📋 STEP 2: Configure eas.json"
echo "------------------------------"
echo ""
echo "You need to update eas.json with:"
echo "  - Your Apple ID email"
echo "  - Your App Store Connect App ID"
echo "  - Your Apple Team ID"
echo ""
read -p "Have you updated eas.json? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 Please update PuperMobile/eas.json with your credentials"
    echo "   You can find your Team ID at:"
    echo "   https://developer.apple.com/account/#/membership/"
    echo ""
    echo "   After updating, run this script again"
    exit 0
fi

# Step 3: Build
echo ""
echo "📋 STEP 3: Build iOS App"
echo "-------------------------"
echo ""
echo "This will create a production build for the App Store."
echo "Build time: ~15-30 minutes"
echo ""
read -p "Ready to build? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🏗️  Building iOS app..."
    echo "   This may take 15-30 minutes"
    echo ""
    eas build --platform ios --profile production
    
    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📱 View build status:"
    echo "   https://expo.dev/accounts/$(eas whoami)/projects/puper-mobile/builds"
    echo ""
fi

# Step 4: Submit to TestFlight or App Store
echo ""
echo "📋 STEP 4: Submit to App Store"
echo "------------------------------"
echo ""
echo "Choose submission method:"
echo "  1) TestFlight (Recommended for first submission)"
echo "  2) App Store (Direct submission)"
echo "  3) Skip submission (do it manually)"
echo ""
read -p "Choose option (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "📤 Submitting to TestFlight..."
        eas submit --platform ios --latest
        echo ""
        echo "✅ Submitted to TestFlight!"
        echo ""
        echo "📝 Next steps:"
        echo "  1. Go to App Store Connect → TestFlight"
        echo "  2. Wait for processing (10-30 minutes)"
        echo "  3. Add test information and testers"
        echo "  4. Test your app"
        echo "  5. Submit for App Store review when ready"
        ;;
    2)
        echo ""
        echo "📤 Submitting to App Store..."
        eas submit --platform ios --latest
        echo ""
        echo "✅ Submitted to App Store!"
        echo ""
        echo "📝 Next steps:"
        echo "  1. Go to App Store Connect"
        echo "  2. Complete all required metadata:"
        echo "     - Screenshots (required sizes)"
        echo "     - App description"
        echo "     - Privacy policy URL"
        echo "     - Support URL"
        echo "     - Keywords"
        echo "  3. Submit for review"
        ;;
    3)
        echo ""
        echo "📝 To submit manually:"
        echo "   eas submit --platform ios --latest"
        echo ""
        echo "   Or download the .ipa and upload via:"
        echo "   https://appstoreconnect.apple.com/"
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "📚 Resources:"
echo "  - Build status: https://expo.dev/accounts/$(eas whoami)/projects/puper-mobile/builds"
echo "  - App Store Connect: https://appstoreconnect.apple.com/"
echo "  - Submission guide: IOS_APP_STORE_SUBMISSION_GUIDE.md"
echo ""

