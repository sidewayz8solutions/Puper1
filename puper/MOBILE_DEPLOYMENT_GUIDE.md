# Puper Mobile App Deployment Guide

## Overview
This guide covers building and deploying the Puper mobile app for iOS using Capacitor. The web app has been configured to run as a native mobile application.

## Prerequisites

### Required Software
- **Node.js** 18+ (already installed)
- **Xcode** 14+ (for iOS development)
- **CocoaPods** (for iOS dependencies)
- **Capacitor CLI** (already installed in project)

### Install CocoaPods (if not already installed)
```bash
sudo gem install cocoapods
```

## Project Structure
```
puper/frontend/
├── capacitor.config.json    # Capacitor configuration
├── ios/                      # iOS native project
│   └── App/                  # Xcode project
├── build/                    # Web build output (synced to mobile)
├── src/                      # React source code
└── package.json             # Dependencies
```

## Configuration

### App Details
- **App ID**: `com.sidewayz8.puper`
- **App Name**: Puper
- **Web Directory**: `build`
- **Platform**: iOS (Capacitor 6.2.1)

### Permissions Configured
The app has the following permissions configured in `Info.plist`:
- **Location Services**: For finding nearby restrooms
- **Camera**: For taking photos of restrooms
- **Microphone**: For voice features (optional)
- **Network Access**: For API calls

## Build Process

### Step 1: Install Dependencies
```bash
cd puper/frontend
npm install --legacy-peer-deps
```

### Step 2: Build the Web App
```bash
npm run build
```
This creates an optimized production build in the `build/` directory.

### Step 3: Sync with Capacitor
```bash
npx cap sync ios
```
This copies the web build to the iOS project and updates native dependencies.

### Step 4: Open in Xcode
```bash
npx cap open ios
```
This opens the iOS project in Xcode.

## Building in Xcode

### For Development (Simulator)
1. Open the project in Xcode (from Step 4 above)
2. Select a simulator from the device dropdown (e.g., iPhone 15 Pro)
3. Click the **Play** button or press `Cmd + R`
4. The app will build and launch in the simulator

### For Development (Physical Device)
1. Connect your iPhone via USB
2. Select your device from the device dropdown
3. Ensure your Apple Developer account is configured:
   - Go to **Xcode > Preferences > Accounts**
   - Add your Apple ID
4. Select your development team in the project settings:
   - Click on the **App** project in the navigator
   - Go to **Signing & Capabilities**
   - Select your team from the dropdown
5. Click the **Play** button or press `Cmd + R`

### For Production (App Store)
1. Archive the app:
   - In Xcode, select **Product > Archive**
   - Wait for the build to complete
2. Distribute the app:
   - Click **Distribute App**
   - Choose **App Store Connect**
   - Follow the prompts to upload to TestFlight/App Store

## Quick Commands Reference

### Development Workflow
```bash
# Navigate to frontend directory
cd puper/frontend

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Build web app
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Update After Code Changes
```bash
# After making changes to React code:
npm run build
npx cap sync ios

# Then rebuild in Xcode (Cmd + R)
```

### Add Capacitor Plugins (if needed)
```bash
# Example: Add Geolocation plugin
npm install @capacitor/geolocation
npx cap sync ios
```

## Using Xcode Compositor (Recommended for Quick Testing)

Based on your preferences, you can use **Xcode Compositor** for quick mobile deployment:

1. Build the web app: `npm run build`
2. Sync to iOS: `npx cap sync ios`
3. Open Xcode Compositor (if available on your system)
4. Load the iOS project from `puper/frontend/ios/App/App.xcodeproj`
5. Select your device/simulator and run

## Environment Variables

Make sure you have a `.env` file in `puper/frontend/` with:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are bundled into the build during `npm run build`.

## Troubleshooting

### Build Fails in Xcode
- Clean build folder: **Product > Clean Build Folder** (Cmd + Shift + K)
- Delete derived data: **Xcode > Preferences > Locations > Derived Data** (click arrow and delete folder)
- Reinstall pods:
  ```bash
  cd ios/App
  pod deintegrate
  pod install
  ```

### App Shows Blank Screen
- Ensure `npm run build` completed successfully
- Check that `build/` directory exists and has content
- Run `npx cap sync ios` again
- Check browser console in Safari Web Inspector (for debugging WebView)

### Location Not Working
- Ensure location permissions are granted in iOS Settings
- Check that `Info.plist` has location usage descriptions
- Test on a physical device (simulator location can be unreliable)

### Google Maps Not Loading
- Verify `REACT_APP_GOOGLE_MAPS_API_KEY` is set correctly
- Ensure the API key has iOS restrictions configured in Google Cloud Console
- Add bundle ID `com.sidewayz8.puper` to allowed iOS apps

## Testing on Device

### Enable Developer Mode (iOS 16+)
1. Go to **Settings > Privacy & Security > Developer Mode**
2. Toggle **Developer Mode** on
3. Restart your device

### Trust Developer Certificate
1. After installing the app, go to **Settings > General > VPN & Device Management**
2. Find your developer certificate
3. Tap **Trust**

## App Store Submission Checklist

- [ ] App icons added (all required sizes)
- [ ] Launch screen configured
- [ ] Privacy policy URL ready
- [ ] App Store screenshots prepared
- [ ] App description written
- [ ] Keywords selected
- [ ] Age rating determined
- [ ] Pricing tier selected
- [ ] TestFlight beta testing completed
- [ ] All required metadata filled in App Store Connect

## Current Status

✅ **Completed**:
- Capacitor iOS integration configured
- iOS project structure created
- Permissions configured (Location, Camera, Microphone)
- App entitlements set up
- Development signing configured
- Archive created (as of 2025-09-01)

🔄 **Next Steps**:
1. Build the latest web app: `npm run build`
2. Sync to iOS: `npx cap sync ios`
3. Open in Xcode: `npx cap open ios`
4. Test on simulator or device
5. Submit to App Store (when ready)

## Additional Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Support

For issues specific to:
- **Capacitor**: Check [Capacitor GitHub Issues](https://github.com/ionic-team/capacitor/issues)
- **React Build**: Check webpack configuration in `config/webpack.config.js`
- **iOS Native**: Check Xcode build logs and iOS system logs

