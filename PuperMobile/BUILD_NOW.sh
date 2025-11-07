#!/bin/bash

# Build script for Puper under Sidewayz 8 Solutions
# This will run interactively to set up credentials if needed

cd "$(dirname "$0")"

echo "🚀 Building Puper iOS app"
echo "========================"
echo ""
echo "Organization: Sidewayz 8 Solutions"
echo "Project: Puper"
echo "Version: 1.0.9"
echo "Build Number: 21"
echo ""
echo "Running in interactive mode to set up credentials..."
echo ""

EXPO_ACCOUNT=sidewayz-8-solutions npx eas-cli build --platform ios --profile production

