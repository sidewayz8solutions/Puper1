# Using Xcode Compositor for Puper Mobile Development

## What is Xcode Compositor?

Xcode Compositor is a streamlined way to build and test iOS apps without the full Xcode IDE overhead. It's perfect for quick iterations during development.

## Prerequisites

- Xcode installed (includes Compositor)
- Puper web app built (`npm run build`)
- iOS project synced (`npx cap sync ios`)

## Quick Start with Compositor

### Step 1: Prepare the App
```bash
cd puper/frontend
./deploy-mobile.sh
```

### Step 2: Open with Compositor

**Option A: From Terminal**
```bash
open -a "Xcode" ios/App/App.xcodeproj
```

**Option B: Using Capacitor CLI**
```bash
npx cap open ios
```

**Option C: Direct Open**
- Navigate to `puper/frontend/ios/App/`
- Double-click `App.xcworkspace` (NOT .xcodeproj)

### Step 3: Build and Run

In Xcode:
1. **Select Target Device**:
   - Click device dropdown (top-left, next to Play button)
   - Choose simulator (e.g., "iPhone 15 Pro")
   - Or select your connected iPhone

2. **Build & Run**:
   - Click the **Play** button (▶️)
   - Or press **Cmd + R**
   - Wait for build to complete
   - App launches automatically!

## Compositor Workflow

### Development Cycle
```
Edit React Code → Build Web App → Sync to iOS → Run in Compositor
      ↓                ↓              ↓              ↓
   src/*.js      npm run build   npx cap sync   Cmd + R
```

### Fast Iteration
```bash
# Make changes to React code
# Then run:
npm run build && npx cap sync ios

# In Xcode: Cmd + R to rebuild and run
```

## Compositor Features

### 1. Device Selection
- **Simulators**: iPhone, iPad, various iOS versions
- **Physical Devices**: Connected via USB
- **Quick Switch**: Change device without rebuilding

### 2. Live Debugging
- **Console Logs**: View in Xcode console (bottom panel)
- **Breakpoints**: Set in Swift code (if needed)
- **Web Inspector**: Use Safari for React debugging

### 3. Performance Tools
- **Memory Graph**: Check for leaks
- **CPU Usage**: Monitor performance
- **Network Activity**: Track API calls

## Using Safari Web Inspector

### Enable Web Inspector
1. In Xcode, run the app on simulator/device
2. Open Safari on your Mac
3. Go to **Develop** menu
4. Find your device/simulator
5. Select the Puper app
6. Web Inspector opens!

### What You Can Do
- View console logs from React
- Inspect DOM elements
- Monitor network requests
- Debug JavaScript
- Test responsive design

## Compositor Shortcuts

| Action | Shortcut |
|--------|----------|
| Build & Run | Cmd + R |
| Stop | Cmd + . |
| Clean Build | Cmd + Shift + K |
| Build Only | Cmd + B |
| Show Console | Cmd + Shift + Y |
| Show Navigator | Cmd + 0 |
| Show Inspector | Cmd + Option + 0 |

## Common Compositor Tasks

### Change App Icon
1. Open `ios/App/App/Assets.xcassets`
2. Click `AppIcon`
3. Drag images to appropriate slots
4. Rebuild (Cmd + R)

### Change Launch Screen
1. Open `ios/App/App/Base.lproj/LaunchScreen.storyboard`
2. Edit in Interface Builder
3. Rebuild (Cmd + R)

### Update App Name
1. Open `ios/App/App/Info.plist`
2. Find `CFBundleDisplayName`
3. Change value
4. Rebuild (Cmd + R)

### Change Bundle ID
1. Select project in navigator
2. Select "App" target
3. Go to "Signing & Capabilities"
4. Change "Bundle Identifier"
5. Rebuild (Cmd + R)

## Troubleshooting Compositor

### Build Fails
```bash
# Clean build folder
Cmd + Shift + K in Xcode

# Or from terminal:
cd ios/App
xcodebuild clean
cd ../..
```

### Simulator Not Showing
```bash
# Reset simulator
xcrun simctl erase all

# Or open Simulator app:
open -a Simulator
```

### Code Signing Issues
1. Go to **Signing & Capabilities** tab
2. Check "Automatically manage signing"
3. Select your team
4. Rebuild

### Pod Install Issues
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
npx cap sync ios
```

## Compositor vs Full Xcode

| Feature | Compositor | Full Xcode |
|---------|-----------|------------|
| Build & Run | ✅ | ✅ |
| Debugging | ✅ | ✅ |
| Interface Builder | ✅ | ✅ |
| Performance Tools | ✅ | ✅ |
| Advanced Features | Limited | ✅ |
| Resource Usage | Lower | Higher |
| Speed | Faster | Slower |

## Best Practices

### 1. Keep Builds Fresh
```bash
# After React changes:
npm run build
npx cap sync ios
# Then Cmd + R in Xcode
```

### 2. Use Simulators for UI
- Fast iteration
- Multiple device sizes
- No device needed

### 3. Use Devices for Features
- Real GPS
- Camera
- Performance
- Final testing

### 4. Clean Regularly
```bash
# Clean Xcode build
Cmd + Shift + K

# Clean npm build
rm -rf build
npm run build
```

### 5. Version Control
```bash
# Commit before major changes
git add .
git commit -m "Working mobile build"
```

## Advanced Compositor Features

### Custom Build Schemes
1. Click scheme dropdown (next to device)
2. Select "Edit Scheme"
3. Customize build settings
4. Save

### Environment Variables
1. Edit Scheme → Run → Arguments
2. Add environment variables
3. Access in app code

### Build Configurations
1. Project settings → Configurations
2. Add Debug/Release configs
3. Customize per environment

## Integration with Deployment Script

The `deploy-mobile.sh` script automates:
1. ✅ Dependency check
2. ✅ Web app build
3. ✅ iOS sync
4. ✅ Xcode launch

Just run:
```bash
./deploy-mobile.sh
```

Then use Compositor normally!

## Tips for Quick Development

### 1. Keep Xcode Open
- Leave Xcode running
- Just rebuild (Cmd + R) after syncing
- Faster than reopening

### 2. Use Hot Reload (Web)
```bash
# For web development:
npm start

# For mobile testing:
./deploy-mobile.sh
```

### 3. Simulator Shortcuts
- **Cmd + K**: Toggle keyboard
- **Cmd + Shift + H**: Home button
- **Cmd + L**: Lock screen
- **Cmd + Right/Left**: Rotate

### 4. Multiple Simulators
- Run multiple simulators simultaneously
- Test different screen sizes
- Compare layouts

## Resources

- [Xcode Documentation](https://developer.apple.com/xcode/)
- [iOS Simulator Guide](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│  Puper Mobile - Compositor Quick Ref    │
├─────────────────────────────────────────┤
│  Build Web:    npm run build            │
│  Sync iOS:     npx cap sync ios         │
│  Open Xcode:   npx cap open ios         │
│  Build & Run:  Cmd + R                  │
│  Stop:         Cmd + .                  │
│  Clean:        Cmd + Shift + K          │
│  Console:      Cmd + Shift + Y          │
│  Deploy All:   ./deploy-mobile.sh       │
└─────────────────────────────────────────┘
```

---

**Happy mobile development! 🚽📱**

