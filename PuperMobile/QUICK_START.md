# 🚀 Püper Mobile - Quick Start

## ⚡ Test on Your iPhone (2 Minutes)

### Step 1: Install Expo Go
- Open **App Store** on your iPhone
- Search **"Expo Go"**
- Install (it's free)

### Step 2: Scan QR Code
- Open **Expo Go** app
- Tap **"Scan QR Code"**
- Scan the QR code in your terminal
- **App launches!** 🎉

### Step 3: Test the App
- Allow location permissions
- See the map with toilet markers 🚽
- Tap markers to see ratings
- Enjoy your native iPhone app!

---

## 🖥️ Test on Simulator (If you have Xcode)

```bash
# In the terminal, press 'i'
# iOS simulator opens automatically
```

---

## 🔧 Development Commands

```bash
# Start development server
yarn start

# Start and clear cache
yarn start --clear

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Run in web browser
yarn web
```

---

## 📱 Build for App Store

```bash
# Install EAS CLI (one time)
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

---

## 🎨 Customize

### Change Colors
Edit `App.js` and update:
```javascript
backgroundColor: '#6B4423'  // Your brown theme
```

### Add Supabase Data
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_URL',
  'YOUR_KEY'
);
```

### Update App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name"
  }
}
```

---

## 🆘 Troubleshooting

**QR code won't scan?**
- Make sure iPhone and computer are on same WiFi
- Try restarting: `yarn start --clear`

**Location not working?**
- Allow permissions when prompted
- Check Settings > Püper > Location

**App crashes?**
- Check terminal for errors
- Press `r` in terminal to reload

---

## 📚 Full Documentation

See `README.md` for complete guide including:
- Detailed setup instructions
- App Store submission guide
- Feature development tips
- Troubleshooting

---

## 🎯 Quick Tips

- **Hot Reload**: Shake device to open developer menu
- **Reload**: Press `r` in terminal
- **Debug**: Press `j` in terminal
- **Clear Cache**: `yarn start --clear`

---

**Your app is running! Scan the QR code and test it now!** 🚀

