#!/bin/bash

# 🚽 Püper - Cloud Build Deployment (No Xcode Required!)
# This uses EAS Build which builds in the cloud

set -e

echo "🚽 Püper - Cloud Build Deployment (No Xcode Needed!)"
echo "====================================================="
echo ""
echo "✅ EAS Build works on ANY Mac - builds happen in the cloud!"
echo ""

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: Must run from PuperMobile directory"
    echo "   cd PuperMobile && ./deploy-cloud-build.sh"
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

# Verify this is the Expo project
if [ ! -f "app.json" ] || ! grep -q "expo" app.json; then
    echo "❌ Error: This doesn't look like an Expo project"
    echo "   Make sure you're in PuperMobile directory"
    exit 1
fi

echo "✅ This is the Expo project (cloud build compatible)"
echo ""

# Step 1: Verify App Store Connect Setup
echo "📋 STEP 1: App Store Connect Setup"
echo "-----------------------------------"
echo ""
echo "Before building, ensure you have:"
echo "  ✅ Apple Developer Account ($99/year)"
echo "  ✅ App created in App Store Connect"
echo "  ✅ Bundle ID: com.sidewayz8.puper"
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
    echo "     - Bundle ID: com.sidewayz8.puper"
    echo ""
    echo "  4. Run this script again"
    exit 0
fi

# Step 2: Update eas.json
echo ""
echo "📋 STEP 2: Configure eas.json (if needed)"
echo "------------------------------------------"
echo ""
echo "Check if eas.json has your Apple credentials..."
echo ""
read -p "Have you updated eas.json with your Apple ID and Team ID? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 You can update eas.json now, or do it later before submission"
    echo "   For now, we'll build the app (submission can be done later)"
    echo ""
fi

# Step 3: Build in Cloud
echo ""
echo "📋 STEP 3: Build iOS App in Cloud"
echo "----------------------------------"
echo ""
echo "🌐 This will build in the CLOUD - no Xcode needed on your Mac!"
echo "   Build time: ~15-30 minutes"
echo "   Your Mac compatibility: ✅ Perfect (any Mac works!)"
echo ""
read -p "Ready to build? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🏗️  Building iOS app in the cloud..."
    echo "   No Xcode needed - build happens on Expo servers!"
    echo "   This may take 15-30 minutes"
    echo ""
    eas build --platform ios --profile production
    
    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📱 View build status:"
    echo "   https://expo.dev/accounts/$(eas whoami)/projects/puper-mobile/builds"
    echo ""
    echo "📥 Download the .ipa file from the link above"
    echo ""
fi

# Step 4: Submit (optional)
echo ""
echo "📋 STEP 4: Submit to App Store (Optional)"
echo "------------------------------------------"
echo ""
read -p "Submit to App Store now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if eas.json is configured
    if grep -q "your-apple-id@example.com" eas.json 2>/dev/null; then
        echo ""
        echo "⚠️  Warning: eas.json still has placeholder values"
        echo "   Please update eas.json with your credentials first"
        echo "   Then run: eas submit --platform ios --latest"
        echo ""
    else
        echo ""
        echo "📤 Submitting to App Store..."
        eas submit --platform ios --latest
        echo ""
        echo "✅ Submitted!"
        echo ""
    fi
else
    echo ""
    echo "📝 You can submit later with:"
    echo "   eas submit --platform ios --latest"
    echo ""
fi

echo ""
echo "🎉 Cloud build process complete!"
echo ""
echo "✅ Key Points:"
echo "   - No Xcode needed (build happens in cloud)"
echo "   - Works on any Mac (including yours!)"
echo "   - Your macOS 15.6.1 is perfectly compatible"
echo ""
echo "📚 Resources:"
echo "   - Build status: https://expo.dev/accounts/$(eas whoami)/projects/puper-mobile/builds"
echo "   - App Store Connect: https://appstoreconnect.apple.com/"
echo "   - No Xcode guide: NO_XCODE_NEEDED.md"
echo ""

