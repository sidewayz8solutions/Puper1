# 🚀 Püper - Master Deployment Checklist

## Overview

This is your complete checklist to deploy Püper to both iOS App Store and Google Play Store. Follow these steps sequentially for a successful launch.

---

## ✅ Pre-Deployment Checklist

### Development Environment
- [x] Node.js 18+ installed
- [x] npm installed
- [x] Expo CLI installed globally
- [x] EAS CLI installed globally (`npm install -g eas-cli`)
- [x] Git repository set up
- [x] Code pushed to GitHub/GitLab

### App Configuration
- [x] App name finalized: **Püper**
- [x] Bundle IDs configured:
  - iOS: `com.sidewayz8.puper`
  - Android: `com.sidewayz8.puper`
- [x] Version numbers set: `1.0.0`
- [x] App icons created (see `PuperMobile/assets/`)
- [x] Splash screens configured
- [x] Environment variables configured in `app.json`

### Backend Setup
- [x] Supabase project created
- [x] PostGIS extension enabled
- [x] Database tables created (restrooms, reviews)
- [x] RPC functions deployed
- [x] Row Level Security (RLS) policies configured
- [x] API keys secured in `app.json` extra field

### Legal & Compliance
- [ ] Privacy Policy created and hosted
- [ ] Terms of Service created (optional but recommended)
- [ ] Support email set up
- [ ] Age rating reviewed (4+ / Everyone)

---

## 📱 iOS App Store Deployment

### Step 1: Apple Developer Account Setup
**Timeline: 1-2 business days**

- [ ] Sign up for Apple Developer Program ($99/year)
  - URL: https://developer.apple.com/programs/enroll/
- [ ] Complete verification process
- [ ] Accept agreements in Developer Portal

### Step 2: App Store Connect Setup
**Timeline: 30 minutes**

- [ ] Create new app in App Store Connect
  - Name: Püper
  - Bundle ID: com.sidewayz8.puper
  - SKU: puper-001
  - Primary Language: English (US)
- [ ] Complete app information
- [ ] Set category: Lifestyle or Travel
- [ ] Configure pricing: Free

### Step 3: Build iOS App
**Timeline: 30-45 minutes**

```bash
cd PuperMobile

# Login to Expo
eas login

# Configure EAS (first time only)
eas build:configure

# Build for iOS
npm run build:ios
# or: eas build --platform ios --profile production
```

- [ ] Build initiated successfully
- [ ] Monitor build at: https://expo.dev
- [ ] Build completed without errors
- [ ] Download `.ipa` file

### Step 4: Prepare App Store Metadata
**Timeline: 2-3 hours**

- [ ] **Screenshots** prepared (1290 x 2796 px):
  1. Map view with restrooms
  2. Restroom details with 5-toilet rating
  3. Filter options screen
  4. Add restroom feature
  5. Rankings page
  
- [ ] **App icon** (1024x1024) uploaded
- [ ] **App description** written (see IOS_APP_STORE_SUBMISSION_GUIDE.md)
- [ ] **Keywords** optimized
- [ ] **Privacy Policy URL** added
- [ ] **Support URL** added
- [ ] **Age rating** questionnaire completed

### Step 5: TestFlight (Optional but Recommended)
**Timeline: 1-2 weeks**

```bash
# Submit to TestFlight
eas submit --platform ios --latest
```

- [ ] TestFlight build submitted
- [ ] Internal testers added
- [ ] Beta testing conducted
- [ ] Feedback collected and addressed

### Step 6: Submit for Review
**Timeline: 24-48 hours**

- [ ] All metadata complete
- [ ] Build selected in App Store Connect
- [ ] Export compliance answered
- [ ] Submitted for review
- [ ] Confirmation email received

### Step 7: Monitor & Launch
- [ ] Review approved ✅
- [ ] App goes live
- [ ] Verify app appears in App Store
- [ ] Monitor initial reviews and ratings

**iOS Status**: ⏳ In Progress / ✅ Complete

---

## 🤖 Google Play Store Deployment

### Step 1: Google Play Developer Account
**Timeline: 24-48 hours**

- [ ] Sign up for Google Play Console ($25 one-time)
  - URL: https://play.google.com/console/signup
- [ ] Complete identity verification
- [ ] Accept Developer Distribution Agreement

### Step 2: Create App in Play Console
**Timeline: 15 minutes**

- [ ] Create new app
  - Name: Püper
  - Language: English (United States)
  - Type: App
  - Free or Paid: Free
- [ ] Accept declarations

### Step 3: Build Android App
**Timeline: 20-30 minutes**

```bash
cd PuperMobile

# Build for Android (AAB format)
npm run build:android
# or: eas build --platform android --profile production
```

- [ ] Build initiated successfully
- [ ] Monitor build progress
- [ ] Build completed without errors
- [ ] Download `.aab` file

### Step 4: Save Keystore (CRITICAL!)
```bash
eas credentials
# Select: Android → Production → Download keystore
```

- [ ] Keystore downloaded
- [ ] Keystore backed up to secure location
- [ ] Keystore password saved in password manager

**⚠️ WARNING**: Without the keystore, you cannot update your app!

### Step 5: Complete Play Console Setup
**Timeline: 1-2 hours**

#### App Access
- [ ] Declared app access level

#### Ads
- [ ] Ads declaration completed

#### Content Rating
- [ ] Content rating questionnaire completed
- [ ] Rating assigned (usually "Everyone")

#### Target Audience
- [ ] Target age ranges selected (13+, 16-17, 18+)
- [ ] Google Play for Children: No

#### Data Safety
- [ ] Data collection declared:
  - Location: Precise (for finding restrooms)
  - Photos: Optional (for uploads)
- [ ] Security practices declared
- [ ] Data deletion process documented

### Step 6: Prepare Store Listing
**Timeline: 2-3 hours**

- [ ] **App name**: Püper
- [ ] **Short description** (80 chars): Created
- [ ] **Full description** (4000 chars): Written
- [ ] **App icon** (512x512): Uploaded
- [ ] **Feature graphic** (1024x500): Created and uploaded
- [ ] **Screenshots** (1080x1920):
  1. Home/Hero screen
  2. Map view
  3. Restroom details
  4. Filters
  5. Add restroom
  6. Rankings
  7. Reviews
  8. Profile/Settings
  
- [ ] **Category**: Lifestyle or Travel & Local
- [ ] **Tags**: Added relevant tags
- [ ] **Contact details**: Email, website
- [ ] **Privacy Policy URL**: Added

### Step 7: Create Production Release
**Timeline: 30 minutes**

- [ ] Navigate to Production → Create new release
- [ ] Upload `.aab` file
- [ ] Release name: "1.0.0 - Initial Release"
- [ ] Release notes written
- [ ] Countries/regions selected
- [ ] Review and submit

### Step 8: Monitor Review
**Timeline: 1-7 days**

- [ ] Submission confirmed
- [ ] Pre-launch report reviewed (no crashes)
- [ ] Review approved ✅
- [ ] App goes live
- [ ] Verify app appears in Play Store

**Android Status**: ⏳ In Progress / ✅ Complete

---

## 🌐 Web App Deployment (Optional)

### Vercel Deployment
```bash
cd puper/frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Domain configured (optional)
- [ ] SSL certificate active

### Alternative: Netlify
```bash
cd puper/frontend

# Build
npm run build

# Deploy build folder to Netlify
# Or connect GitHub repo for auto-deploy
```

- [ ] Netlify project created
- [ ] Build settings configured
- [ ] Deploy successful
- [ ] Custom domain (optional)

**Web Status**: ⏳ In Progress / ✅ Complete

---

## 🧪 Quality Assurance Checklist

### Functionality Testing
- [ ] Map loads and displays correctly
- [ ] User location permission requested
- [ ] Restrooms load from Supabase
- [ ] Markers appear on map with correct data
- [ ] Clicking marker shows restroom details
- [ ] Filter functionality works (wheelchair, baby changing, gender-neutral)
- [ ] Add restroom feature functional
- [ ] Rating system works (1-5 toilets)
- [ ] Review submission successful
- [ ] Distance calculations accurate
- [ ] Rankings page displays correctly

### Platform-Specific Testing

#### iOS Testing
- [ ] Tested on iPhone simulator
- [ ] Tested on physical iPhone (if available)
- [ ] Location permissions working
- [ ] Camera permissions working
- [ ] No crashes or freezes
- [ ] Performance acceptable
- [ ] UI renders correctly on all screen sizes

#### Android Testing
- [ ] Tested on Android emulator
- [ ] Tested on physical Android device (if available)
- [ ] Location permissions working
- [ ] Camera permissions working
- [ ] No crashes or ANRs
- [ ] Performance acceptable
- [ ] UI renders correctly on various screen sizes

### Cross-Platform Consistency
- [ ] Design consistent across platforms
- [ ] Features work identically
- [ ] Data syncs properly via Supabase
- [ ] Error handling consistent

---

## 📊 Post-Launch Checklist

### Day 1
- [ ] Verify apps are live in stores
- [ ] Test downloads on real devices
- [ ] Monitor for crash reports
- [ ] Respond to initial reviews
- [ ] Share launch announcement

### Week 1
- [ ] Monitor analytics daily
- [ ] Track downloads and active users
- [ ] Collect user feedback
- [ ] Address critical bugs immediately
- [ ] Plan first update based on feedback

### Week 2-4
- [ ] Analyze user behavior patterns
- [ ] Identify most-used features
- [ ] Plan feature improvements
- [ ] Optimize performance based on data
- [ ] Respond to all reviews

### Ongoing
- [ ] Weekly analytics review
- [ ] Monthly feature updates
- [ ] Regular bug fixes
- [ ] Community engagement
- [ ] Marketing efforts

---

## 🆘 Troubleshooting Quick Reference

### Build Failures
```bash
# Clear cache and rebuild
eas build --platform ios --clear-cache
eas build --platform android --clear-cache

# Check logs
eas build:list
```

### Submission Rejected
1. Read rejection reason carefully
2. Address all mentioned issues
3. Update app or metadata as needed
4. Resubmit

### App Crashes
1. Check crash logs in respective consoles
2. Reproduce issue locally
3. Fix and create new build
4. Submit update

### Can't Update Android App
- **Keystore lost**: You must publish as new app
- **Prevention**: Backup keystore in multiple secure locations

---

## 📞 Support Resources

### Documentation
- [iOS Submission Guide](./IOS_APP_STORE_SUBMISSION_GUIDE.md)
- [Android Submission Guide](./GOOGLE_PLAY_STORE_SUBMISSION_GUIDE.md)
- [Deployment Plan](./DEPLOYMENT_PLAN.md)
- [Ready for Submission](./READY_FOR_SUBMISSION.md)

### Official Resources
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://help.apple.com/app-store-connect/)
- [Google Play Console](https://support.google.com/googleplay/android-developer/)

### Püper Support
- GitHub: https://github.com/sidewayz8/Puper1
- Email: your-email@example.com

---

## 💰 Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Yearly |
| Google Play Developer | $25 | One-time |
| EAS Build (Free) | $0 | - |
| Supabase (Free tier) | $0 | - |
| Domain (optional) | $10-15 | Yearly |
| **Total First Year** | **$124+** | - |
| **Total Subsequent Years** | **$99+** | - |

---

## 🎯 Success Metrics

### Technical KPIs
- **Crash-free rate**: Target > 99%
- **App load time**: Target < 3 seconds
- **API response time**: Target < 500ms
- **User retention (Day 7)**: Target > 40%

### Business KPIs
- **Downloads (Month 1)**: Target 500+
- **Active users**: Track daily/monthly
- **Average rating**: Target 4.0+
- **Review response rate**: Target 100%

---

## ✨ Final Pre-Submission Checks

### iOS
- [ ] Bundle ID correct everywhere
- [ ] Version and build number match
- [ ] All screenshots uploaded
- [ ] Privacy policy accessible
- [ ] TestFlight testing complete (if used)
- [ ] Ready to submit ✅

### Android
- [ ] Package name correct everywhere
- [ ] Version code and version string correct
- [ ] Keystore safely backed up
- [ ] All store listing complete
- [ ] Feature graphic created
- [ ] Ready to submit ✅

### Both Platforms
- [ ] App tested thoroughly
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] User experience polished
- [ ] Support channels ready

---

## 🎊 Ready to Launch!

When all checklists above are complete:

1. **iOS**: Click "Submit for Review" in App Store Connect
2. **Android**: Click "Start rollout to Production" in Play Console
3. **Celebrate!** 🎉
4. **Monitor closely** for first 48 hours
5. **Respond to feedback** immediately
6. **Iterate and improve** based on user data

---

**Made with 💩 for everyone who needs to go!**

*Last updated: October 26, 2025*
*Version: 1.0.0*
