# 📸 How to Get App Store Screenshots

## Required Screenshots

You need screenshots for:
- ✅ **iPhone 6.5"** (iPhone 11 Pro Max): 1284 x 2778 pixels
- ✅ **iPad Pro 12.9"**: 2048 x 2732 pixels
- ⚠️ **Apple Watch**: Only needed if you have a Watch app (you probably don't)

## 🎯 Quick Solution: Use iOS Simulator (Easiest)

### Step 1: Run Your App in Simulator

```bash
cd PuperMobile

# Start Expo development server
npm start

# In another terminal, run on iOS simulator
npm run ios
```

Or if you have EAS set up:
```bash
eas build --profile preview --platform ios
# Then download and run in simulator
```

### Step 2: Take Screenshots in Simulator

1. **Open iOS Simulator** (comes with Xcode)
   - If you don't have Xcode, you can download just the Command Line Tools
   - Or use a different method (see below)

2. **Choose the Right Device**:
   - For iPhone 6.5": **iPhone 15 Pro Max** or **iPhone 11 Pro Max**
   - For iPad: **iPad Pro (12.9-inch)**

3. **Take Screenshot**:
   - Press `Cmd + S` in the simulator
   - Or: **Device** → **Screenshot** in the menu

4. **Screenshots are saved to**:
   - `~/Desktop/` (by default)
   - Or: **File** → **Save Screen** in simulator menu

## 📱 Alternative: Use Your Physical iPhone

### Step 1: Run App on Your Phone

```bash
cd PuperMobile
npm start
```

Then scan the QR code with:
- **Expo Go app** (if using Expo Go)
- Or build and install the app directly

### Step 2: Take Screenshots

1. **On iPhone**: Press `Side Button + Volume Up` simultaneously
2. **Screenshots saved** to Photos app
3. **Transfer to Mac**: AirDrop or iCloud Photos

### Step 3: Resize Screenshots (If Needed)

If your phone screenshots aren't the right size, you can resize them:

**Using Preview (Mac):**
1. Open screenshot in Preview
2. **Tools** → **Adjust Size**
3. Set dimensions:
   - iPhone 6.5": 1284 x 2778 pixels
   - iPad: 2048 x 2732 pixels
4. Save

**Using Online Tools:**
- https://www.iloveimg.com/resize-image
- Upload → Resize → Set exact dimensions → Download

## 🖼️ Screenshot Content Ideas

Take screenshots showing:
1. **Map view** with restrooms
2. **Restroom details** with ratings
3. **Search/filter** screen
4. **Add restroom** feature
5. **Profile/leaderboard** (if you have one)

## 📐 Exact Dimensions Needed

### iPhone 6.5" (Required)
- **Size**: 1284 x 2778 pixels
- **Device**: iPhone 11 Pro Max or iPhone 15 Pro Max
- **Quantity**: 3-10 screenshots

### iPad Pro 12.9" (Required)
- **Size**: 2048 x 2732 pixels
- **Device**: iPad Pro 12.9-inch
- **Quantity**: 3-10 screenshots

### Apple Watch (Only if you have Watch app)
- If you don't have an Apple Watch app, **you can skip this**
- Apple Watch screenshots are optional unless you've built a Watch companion app

## 🎨 Professional Screenshot Tools (Optional)

If you want to make them look more professional:

1. **Screenshot Framer** (Free tool):
   - https://www.screenshots.design/
   - Upload screenshots → Add device frames → Download

2. **Previewed** (Paid):
   - https://previewed.app/
   - Professional mockups

3. **Figma** (Free):
   - Create device frames
   - Insert screenshots

## 🚀 Quick Method: Use Expo Development Build

If you have the app running on your phone:

1. **Take screenshots** directly from your phone
2. **AirDrop to Mac** or use iCloud Photos
3. **Resize if needed** using Preview or online tool

## ⚠️ About Apple Watch Screenshots

**You probably don't need these!** Apple Watch screenshots are only required if:
- You have an Apple Watch companion app
- Your app has Watch-specific features

**If you don't have a Watch app:**
- Skip the Apple Watch section in App Store Connect
- It's optional

## 📋 Screenshot Checklist

- [ ] iPhone 6.5" screenshots (3-10 images)
- [ ] iPad Pro 12.9" screenshots (3-10 images)
- [ ] Apple Watch screenshots (only if you have Watch app)

---

**Easiest method**: Run your app in iOS Simulator and press `Cmd + S` to take screenshots! 📸

