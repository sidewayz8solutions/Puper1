# ⚡ Püper - Quick Start Deployment Guide

**Your app is ready! Follow these steps to get it live on both app stores.**

---

## 🎯 Step 1: Install Required Tools (5 minutes)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account (create one at expo.dev if needed)
eas login
```

---

## 💳 Step 2: Sign Up for Developer Accounts (30 minutes)

### Apple Developer ($99/year)
1. Go to: https://developer.apple.com/programs/enroll/
2. Sign up with your Apple ID
3. Pay $99 annual fee
4. Wait 1-2 business days for approval

### Google Play Developer ($25 one-time)
1. Go to: https://play.google.com/console/signup
2. Sign up with your Google account
3. Pay $25 one-time fee
4. Wait 24-48 hours for verification

---

## 📱 Step 3: Build Your Apps (1 hour)

### iOS Build

```bash
cd PuperMobile

# First time setup (EAS will ask questions)
eas build:configure

# Build for iOS
npm run build:ios

# OR manually:
eas build --platform ios --profile production
```

**What happens:**
- Build takes 15-30 minutes
- EAS generates certificates automatically
- You'll get a link to monitor progress
- Download `.ipa` file when complete

### Android Build

```bash
cd PuperMobile

# Build for Android
npm run build:android

# OR manually:
eas build --platform android --profile production
```

**What happens:**
- Build takes 10-20 minutes
- EAS generates keystore automatically
- Download `.aab` file when complete

### ⚠️ CRITICAL: Save Your Android Keystore

```bash
# Download keystore immediately
eas credentials

# Select: Android → Production → Download keystore
```

**Save this in 3 places:**
1. Password manager (1Password, LastPass, etc.)
2. Secure cloud backup (Google Drive, Dropbox, etc.)
3. External hard drive

**Without this, you can NEVER update your Android app!**

---

## 📸 Step 4: Prepare Screenshots (2 hours)

### iOS Screenshots (1290 x 2796 pixels)

```bash
# Run iOS simulator
cd PuperMobile
npm run ios

# In simulator:
# 1. Open the app
# 2. Navigate to each screen
# 3. Press Cmd+S to save screenshot
# 4. Repeat for all key screens

# Screens to capture:
# - Map view with restrooms
# - Restroom details with ratings
# - Filter menu
# - Add restroom form
# - Rankings page
```

### Android Screenshots (1080 x 1920 pixels)

```bash
# Run Android emulator
cd PuperMobile
npm run android

# Take screenshots of same screens
```

### Feature Graphic for Play Store (1024 x 500 pixels)

Create using:
- **Canva**: Free templates, search "app feature graphic"
- **Figma**: Design from scratch
- **Photoshop**: If you have it

**Include:**
- Püper logo/name
- Toilet emoji 🚽
- Tagline: "Your Guide to Relief"
- Phone mockup showing app (optional)

---

## 📝 Step 5: Create Privacy Policy (30 minutes)

**Use the template** in `PRIVACY_POLICY.md`:

1. **Copy** `PRIVACY_POLICY.md` content
2. **Customize** with your:
   - Contact email
   - Company/personal name
   - Website URL
3. **Host** it:
   - **GitHub Pages** (free): Create a repo, add file, enable Pages
   - **Your website**: yoursite.com/privacy
   - **Privacy policy generator**: https://www.privacypolicygenerator.info/

4. **Get the URL** - You'll need this for both app stores

---

## 🍎 Step 6: Submit to iOS App Store (2 hours)

### A. App Store Connect Setup

1. Go to: https://appstoreconnect.apple.com/
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Name**: Püper
   - **Bundle ID**: com.sidewayz8.puper
   - **SKU**: puper-001
   - **Language**: English (US)

### B. Upload Build

```bash
# After your iOS build completes
cd PuperMobile
eas submit --platform ios --latest
```

### C. Complete App Information

1. **App Information**:
   - Category: Lifestyle or Travel
   - Privacy Policy URL: [your URL from Step 5]
   - Support URL: GitHub repo or website

2. **Pricing**: Free

3. **Screenshots**: Upload the 5 you took

4. **App Description** (copy from `IOS_APP_STORE_SUBMISSION_GUIDE.md`):
   - Use the full description provided
   - Add subtitle: "Your Guide to Relief"
   - Keywords: restroom,bathroom,toilet,finder,map,accessibility,travel

5. **Age Rating**:
   - Complete questionnaire
   - Result should be: 4+

### D. Submit for Review

1. Click **"Add for Review"**
2. Select your uploaded build
3. Answer export compliance: **"No"** (just HTTPS)
4. Click **"Submit for Review"**

**Timeline**: 24-48 hours for first review

---

## 🤖 Step 7: Submit to Google Play Store (2 hours)

### A. Play Console Setup

1. Go to: https://play.google.com/console/
2. Click **"Create app"**
3. Fill in:
   - **Name**: Püper
   - **Language**: English (US)
   - **Type**: App
   - **Free or Paid**: Free

### B. Complete Required Sections

**App Access**: All functionality available without restrictions

**Ads**: No ads (or Yes if you have them)

**Content Rating**:
1. Start questionnaire
2. Category: Utility/Productivity
3. Answer questions (all "No" except user-generated content)
4. Submit → Rating: Everyone

**Target Audience**:
- Age: 13+, 16-17, 18+
- Children: No

**Data Safety**:
- Location: Collected (for finding restrooms), Required
- Photos: Collected (optional), For app functionality
- Data encrypted in transit: Yes
- Users can request deletion: Yes

### C. Store Listing

1. **Short description** (80 chars):
   ```
   Find clean restrooms anywhere with our 5-toilet rating system!
   ```

2. **Full description**: Copy from `GOOGLE_PLAY_STORE_SUBMISSION_GUIDE.md`

3. **App icon**: Upload 512x512 from `PuperMobile/assets/icon.png`

4. **Feature graphic**: Upload your 1024x500 graphic

5. **Screenshots**: Upload your 8 Android screenshots

6. **Category**: Lifestyle or Travel & Local

7. **Contact**:
   - Email: your-email@example.com
   - Privacy Policy: [your URL from Step 5]

### D. Create Release

1. Go to **"Production"** → **"Create new release"**
2. Upload your `.aab` file
3. **Release name**: "1.0.0 - Initial Release"
4. **Release notes**:
   ```
   🎉 Welcome to Püper!
   
   • Find nearby restrooms with GPS
   • 5-toilet rating system
   • Filters for accessibility
   • Community reviews
   • Add new restrooms
   ```

5. **Countries**: Select all

6. Click **"Review release"** → **"Start rollout to Production"**

**Timeline**: 1-7 days for first review

---

## 🎉 Step 8: Launch & Monitor (Ongoing)

### Day 1
- [ ] Check if apps are live
- [ ] Download and test on real devices
- [ ] Monitor crash reports
- [ ] Respond to first reviews

### Week 1
- [ ] Track downloads daily
- [ ] Address any bugs immediately
- [ ] Collect user feedback
- [ ] Plan first update

### Month 1
- [ ] Analyze usage patterns
- [ ] Optimize based on data
- [ ] Add requested features
- [ ] Marketing push

---

## ⚡ TL;DR - Commands to Run

```bash
# 1. Install tools
npm install -g eas-cli
eas login

# 2. Build apps
cd PuperMobile
npm run build:ios
npm run build:android

# 3. Save keystore
eas credentials
# Download Android keystore!

# 4. Submit apps
eas submit --platform ios --latest
# (Android submitted via Play Console website)
```

---

## 🆘 Need Help?

### Detailed Guides
- **iOS**: `IOS_APP_STORE_SUBMISSION_GUIDE.md` (427 lines)
- **Android**: `GOOGLE_PLAY_STORE_SUBMISSION_GUIDE.md` (555 lines)
- **Complete Checklist**: `MASTER_DEPLOYMENT_CHECKLIST.md` (493 lines)

### Common Issues

**Build fails?**
```bash
eas build --platform ios --clear-cache
eas build --platform android --clear-cache
```

**Submission rejected?**
- Read rejection reason carefully
- Fix the specific issue mentioned
- Resubmit

**App crashes?**
- Check crash logs in App Store Connect / Play Console
- Fix bug and create new build
- Submit update

---

## 💰 Costs Reminder

- Apple: $99/year
- Google: $25 one-time
- **Total**: $124 first year, $99/year after

---

## 🎊 You're Almost There!

Follow these 8 steps and your app will be live in both stores within 1-2 weeks!

**Questions?** Check the detailed guides or reach out for help.

**Good luck! 🚀**

---

**Made with 💩 for everyone who needs to go!**
