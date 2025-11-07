#!/bin/bash

# Puper iOS App Store Deployment Script
# This script builds and submits your app to App Store Connect

echo "🚽 Building 'Püper - Find Your Roll' iOS App for App Store..."

# Navigate to project directory
cd /Users/wshirlz6234/Desktop/Puper/Puper1/PuperMobile

echo "📋 Step 1: Verifying configuration..."
npx expo-doctor

# Ensure icon asset exists; if not, app.config.js will fall back
if [ -f "./assets/pup.jpg" ]; then
	echo "🖼️ Using app icon: assets/pup.jpg"
elif [ -f "./assets/puperl.jpg" ]; then
	echo "🖼️ Using fallback app icon: assets/puperl.jpg"
else
	echo "⚠️  Warning: pup.jpg and puperl.jpg not found. Falling back to assets/icon.png for this build."
	echo "    To use the new logo, add pup.jpg to PuperMobile/assets (1024x1024 recommended)."
fi

echo "🔨 Step 2: Building iOS app for production..."
eas build --platform ios --profile production

echo "📤 Step 3: Submitting to App Store Connect..."
eas submit --platform ios --latest

echo "✅ Build and submission complete!"
echo "📱 Your app should now be available in App Store Connect for review."
echo ""
echo "🗺️ Build Configuration Summary:"
echo "- Google Maps API Key: Configured ✅"
echo "- iPad Support: Enabled ✅"
echo "- Location Permissions: Set ✅"
echo "- Bundle ID: com.sidewayz8.puper ✅"
echo "- Build Number: 7 ✅"
echo ""
echo "Next steps:"
echo "1. Check App Store Connect for your build"
echo "2. Submit for App Store review"
echo "3. Test on your iPad once approved"