#!/bin/bash

# Submit to App Store Connect script
# This will run interactively to get the App Store Connect App ID if needed

cd "$(dirname "$0")"

echo "📤 Submitting Puper to App Store Connect"
echo "========================================"
echo ""
echo "Build: Version 1.0.9, Build 21"
echo "Organization: Sidewayz 8 Solutions"
echo ""
echo "Running in interactive mode..."
echo ""

EXPO_ACCOUNT=sidewayz-8-solutions npx eas-cli submit --platform ios --profile production --latest

echo ""
echo "✅ Submission complete!"
echo ""
echo "Next steps:"
echo "1. Set app price to \$2.99 in App Store Connect"
echo "2. Create Premium IAP (\$9.99 Remove Ads)"
echo "3. Complete app listing details"
echo "4. Submit for review"
echo ""
echo "See APP_STORE_PRICING_SETUP.md for detailed instructions."


