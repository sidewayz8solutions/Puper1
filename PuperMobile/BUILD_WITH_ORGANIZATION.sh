#!/bin/bash

# Build script for Puper under Sidewayz 8 Solutions organization
# Version 1.0.9, Build 21

cd "$(dirname "$0")"

echo "🚀 Building Puper iOS app under Sidewayz 8 Solutions organization"
echo "================================================================"
echo ""
echo "Project: Puper"
echo "Organization: Sidewayz 8 Solutions"
echo "Version: 1.0.9"
echo "Build Number: 21"
echo ""
echo "This will run in INTERACTIVE mode so you can set up credentials if needed."
echo ""

EXPO_ACCOUNT=sidewayz-8-solutions npx eas-cli build --platform ios --profile production

echo ""
echo "✅ Build process complete!"
echo ""
echo "Next steps:"
echo "1. Check build status: https://expo.dev/accounts/sidewayz-8-solutions/projects/puper/builds"
echo "2. After build completes, submit to App Store Connect:"
echo "   EXPO_ACCOUNT=sidewayz-8-solutions npx eas-cli submit --platform ios --profile production --latest"





