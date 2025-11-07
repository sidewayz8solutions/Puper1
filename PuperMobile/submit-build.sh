#!/bin/bash

# Build and Submit Script for Püper iOS App
# Version 1.0.9, Build 21

set -e

cd "$(dirname "$0")"

echo "🚀 Püper - Build and Submit to App Store Connect"
echo "=================================================="
echo ""
echo "Version: 1.0.9"
echo "Build Number: 21"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Make sure we're logged in
echo "🔐 Checking EAS login status..."
if ! npx eas-cli whoami &> /dev/null; then
    echo "⚠️  Not logged in. Please login:"
    npx eas-cli login
fi

echo "✅ Logged in to EAS"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Build only (iOS production)"
echo "2) Submit latest build to App Store Connect"
echo "3) Build and submit (full process)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Building iOS app for production..."
        npx eas-cli build --platform ios --profile production --non-interactive
        echo ""
        echo "✅ Build started! Check status at: https://expo.dev"
        echo ""
        echo "After build completes, run this script again and choose option 2 to submit."
        ;;
    2)
        echo ""
        echo "📤 Submitting latest build to App Store Connect..."
        npx eas-cli submit --platform ios --profile production --latest --non-interactive
        echo ""
        echo "✅ Submission complete!"
        echo ""
        echo "📝 Next steps:"
        echo "1. Go to App Store Connect: https://appstoreconnect.apple.com"
        echo "2. Set app price to \$2.99 in Pricing and Availability"
        echo "3. Create IAP for premium (\$9.99 Remove Ads)"
        echo "4. Complete app listing details"
        echo "5. Submit for review"
        ;;
    3)
        echo ""
        echo "📦 Building iOS app for production..."
        npx eas-cli build --platform ios --profile production --non-interactive
        echo ""
        echo "⏳ Waiting for build to complete..."
        echo "   (This may take 15-30 minutes)"
        echo ""
        read -p "Press Enter when build is complete, or Ctrl+C to exit and submit later..."
        echo ""
        echo "📤 Submitting build to App Store Connect..."
        npx eas-cli submit --platform ios --profile production --latest --non-interactive
        echo ""
        echo "✅ Build and submission complete!"
        echo ""
        echo "📝 Next steps:"
        echo "1. Go to App Store Connect: https://appstoreconnect.apple.com"
        echo "2. Set app price to \$2.99 in Pricing and Availability"
        echo "3. Create IAP for premium (\$9.99 Remove Ads)"
        echo "4. Complete app listing details"
        echo "5. Submit for review"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

