# Puper Mobile App 🚽📱

A native iOS mobile application for finding and rating restrooms, built with React and Capacitor.

## Quick Start

### Option 1: Using the Deployment Script (Recommended)
```bash
cd puper/frontend
./deploy-mobile.sh
```

This script will:
1. ✅ Check and install dependencies
2. 🏗️ Build the web app
3. 📱 Sync to iOS
4. 🚀 Optionally open in Xcode

### Option 2: Manual Steps
```bash
cd puper/frontend

# Build the web app
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## What's Different in the Mobile App?

The mobile app is the **same React web app** running in a native iOS container via Capacitor. This means:

✅ **Same Features**:
- Interactive Google Maps with 3D view
- Restroom search and filtering
- User reviews and ratings
- Profile management
- Real-time location tracking

✅ **Mobile Enhancements**:
- Native iOS look and feel
- Better performance (no browser overhead)
- Access to native device features (camera, location)
- Offline capability (with service workers)
- Push notifications (can be added)
- App Store distribution

## Development Workflow

### Making Changes
1. Edit your React code in `src/`
2. Run the deployment script: `./deploy-mobile.sh`
3. Test in Xcode simulator or device

### Testing
- **Simulator**: Fast, good for UI testing
- **Physical Device**: Required for testing location, camera, and performance

### Debugging
- Use Safari Web Inspector to debug the WebView
- Enable in Safari: **Develop > [Your Device] > [App Name]**
- Console logs, network requests, and DOM inspection available

## App Configuration

### Current Settings
- **Bundle ID**: `com.sidewayz8.puper`
- **Display Name**: Puper
- **Version**: 1.0
- **Build**: 1
- **Minimum iOS**: 14.0
- **Supported Orientations**: Portrait, Landscape

### Customization
Edit `capacitor.config.json` to change:
- App ID
- App name
- Splash screen settings
- Server configuration

## Features Enabled

### Location Services ✅
- Find nearby restrooms
- Distance calculations
- Map centering

### Camera Access ✅
- Take photos of restrooms
- Upload to reviews

### Network Access ✅
- Google Maps API
- Supabase backend
- Real-time updates

## Building for Different Targets

### Development Build (Simulator)
1. Open in Xcode: `npx cap open ios`
2. Select a simulator (e.g., iPhone 15 Pro)
3. Click Play (Cmd + R)

### Development Build (Device)
1. Connect iPhone via USB
2. Select device in Xcode
3. Configure signing (select your team)
4. Click Play (Cmd + R)

### Production Build (App Store)
1. In Xcode: **Product > Archive**
2. **Distribute App > App Store Connect**
3. Upload to TestFlight/App Store

## Troubleshooting

### "No such file or directory" when running deploy script
```bash
chmod +x deploy-mobile.sh
./deploy-mobile.sh
```

### Blank screen in app
```bash
# Rebuild and sync
npm run build
npx cap sync ios
```

### Location not working
- Check permissions in iOS Settings
- Test on physical device (simulator location is limited)

### Build errors in Xcode
```bash
# Clean and rebuild
cd ios/App
pod deintegrate
pod install
cd ../..
npx cap sync ios
```

## File Structure

```
puper/frontend/
├── src/                      # React source code
│   ├── components/          # UI components
│   ├── pages/              # App pages
│   ├── services/           # API services
│   └── context/            # React context
├── public/                  # Static assets
├── build/                   # Built web app (synced to mobile)
├── ios/                     # iOS native project
│   └── App/                # Xcode project
│       ├── App.xcodeproj   # Xcode project file
│       ├── App/            # App source
│       └── Pods/           # CocoaPods dependencies
├── capacitor.config.json   # Capacitor configuration
├── deploy-mobile.sh        # Deployment script
└── package.json            # Dependencies
```

## Adding Native Features

### Example: Add Geolocation Plugin
```bash
npm install @capacitor/geolocation
npx cap sync ios
```

Then use in your React code:
```javascript
import { Geolocation } from '@capacitor/geolocation';

const position = await Geolocation.getCurrentPosition();
```

### Available Capacitor Plugins
- `@capacitor/camera` - Camera and photos
- `@capacitor/geolocation` - GPS location
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/share` - Native share dialog
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/status-bar` - Status bar styling
- And many more...

## Performance Tips

1. **Optimize Images**: Use WebP format, compress images
2. **Code Splitting**: React lazy loading for routes
3. **Minimize Bundle**: Remove unused dependencies
4. **Cache API Calls**: Use React Query effectively
5. **Lazy Load Maps**: Load Google Maps only when needed

## App Store Preparation

### Required Assets
- [ ] App Icon (1024x1024)
- [ ] Screenshots (various device sizes)
- [ ] Privacy Policy URL
- [ ] App Description
- [ ] Keywords
- [ ] Support URL

### Before Submission
- [ ] Test on multiple devices
- [ ] Test all features thoroughly
- [ ] Check for crashes
- [ ] Verify all permissions work
- [ ] Test offline behavior
- [ ] Review App Store guidelines

## Environment Variables

Create `.env` in `puper/frontend/`:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
REACT_APP_SUPABASE_URL=your_url_here
REACT_APP_SUPABASE_ANON_KEY=your_key_here
```

These are bundled during build, so rebuild after changing them.

## Resources

- 📚 [Capacitor Docs](https://capacitorjs.com/docs)
- 🍎 [Apple Developer](https://developer.apple.com)
- 📱 [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- 🔧 [Xcode Help](https://developer.apple.com/xcode/)

## Support

For issues:
1. Check the main deployment guide: `../MOBILE_DEPLOYMENT_GUIDE.md`
2. Review Capacitor logs in Xcode console
3. Use Safari Web Inspector for React debugging
4. Check Capacitor GitHub issues

---

**Happy coding! 🚽✨**

