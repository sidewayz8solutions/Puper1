# 🚽 Püper - Apple App Store Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Apple Developer Account
- [ ] **Apple Developer Program membership** ($99/year)
  - Sign up at: https://developer.apple.com/programs/enroll/
  - Processing time: 1-2 business days
- [ ] **Team ID** noted (found at https://developer.apple.com/account/#/membership/)
- [ ] **Apple ID** email confirmed

### 2. App Store Connect Setup
- [ ] **App created in App Store Connect**
  - Go to: https://appstoreconnect.apple.com/
  - Click "My Apps" → "+" → "New App"
  - Fill in:
    - Platform: iOS
    - Name: Püper
    - Primary Language: English
    - Bundle ID: `com.sidewayz8.puper`
    - SKU: `puper-001` (or any unique identifier)
- [ ] **App Store Connect App ID** noted (found in App Information)
- [ ] **App Store Connect agreement signed**

### 3. Configuration Files
- [ ] **eas.json updated** with:
  - `appleId`: Your Apple Developer account email
  - `ascAppId`: Your App Store Connect App ID
  - `appleTeamId`: Your Apple Team ID
- [ ] **app.json verified**:
  - Bundle ID: `com.sidewayz8.puper`
  - Version: `1.0.0`
  - Build Number: `1`

### 4. App Assets
- [ ] **App Icon** (1024x1024px PNG)
  - Located at: `assets/icon.png`
- [ ] **Screenshots prepared**:
  - iPhone 15 Pro Max (6.7"): 1290 x 2796 pixels (3-10 screenshots)
  - iPhone 11 Pro Max (6.5"): 1284 x 2778 pixels (3-10 screenshots)
  - iPad Pro 12.9": 2048 x 2732 pixels (3-10 screenshots)
- [ ] **App Preview Video** (optional, 15-30 seconds)

### 5. App Store Metadata
- [ ] **App Name**: Püper - Restroom Finder
- [ ] **Subtitle**: Your Guide to Relief
- [ ] **Description** (4000 chars max) - See IOS_APP_STORE_SUBMISSION_GUIDE.md
- [ ] **Keywords** (100 chars max): `restroom,bathroom,toilet,finder,map,accessibility,travel`
- [ ] **Privacy Policy URL** - Hosted and accessible
- [ ] **Support URL** - GitHub or website
- [ ] **Marketing URL** (optional)
- [ ] **Category**: Lifestyle or Travel

### 6. Testing
- [ ] **App tested on iOS Simulator**
- [ ] **App tested on physical device** (if possible)
- [ ] **All features working**:
  - Location services
  - Map display
  - Restroom search
  - Rating system
  - Photo upload (if implemented)

## 🏗️ Build Process

### Step 1: Build the App
```bash
cd PuperMobile
eas build --platform ios --profile production
```

**OR use the automated script:**
```bash
cd PuperMobile
./deploy-app-store.sh
```

**Build time:** 15-30 minutes

**Monitor build:**
- Visit: https://expo.dev/accounts/YOUR_USERNAME/projects/puper-mobile/builds
- Or: `eas build:list`

### Step 2: Build Verification
- [ ] Build completed successfully
- [ ] No build errors
- [ ] Build number matches app.json (`buildNumber: "1"`)

## 📤 Submission Process

### Option A: TestFlight (Recommended First Time)

#### 1. Submit to TestFlight
```bash
cd PuperMobile
eas submit --platform ios --latest
```

#### 2. Complete TestFlight Setup
- [ ] Go to App Store Connect → TestFlight
- [ ] Wait for processing (10-30 minutes)
- [ ] Add **Test Information**:
  - Beta App Description
  - Feedback Email
  - Privacy Policy URL
- [ ] Add **Internal Testers** (up to 100)
- [ ] Create **External Test Group** (up to 10,000)

#### 3. Beta Testing
- [ ] Test app thoroughly on TestFlight
- [ ] Collect feedback from testers
- [ ] Fix any critical issues
- [ ] Prepare for App Store submission

### Option B: Direct App Store Submission

#### 1. Submit Build
```bash
cd PuperMobile
eas submit --platform ios --latest
```

#### 2. Complete App Store Listing
- [ ] Upload **screenshots** for all required sizes
- [ ] Complete **App Information** section
- [ ] Add **Privacy Policy URL**
- [ ] Add **Support URL**
- [ ] Complete **Age Rating** questionnaire (Result: 4+)
- [ ] Fill in **App Description**
- [ ] Add **Keywords**
- [ ] Set **Price**: Free
- [ ] Set **Availability**: All countries

#### 3. Export Compliance
- [ ] Answer encryption question:
  - "Does your app use encryption?"
  - Answer: **No** (if only using HTTPS)
  - Or: **Yes** and complete follow-up questions

#### 4. Submit for Review
- [ ] Click **"Add for Review"**
- [ ] Select your uploaded build
- [ ] Answer all required questions
- [ ] Click **"Submit for Review"**

## 📋 Review Process

### Timeline
- **Average review time**: 24-48 hours
- **First submission**: May take 3-5 days
- **Expedited review**: Available for critical fixes

### Possible Outcomes

#### ✅ Approved
- [ ] App goes live automatically or on scheduled date
- [ ] Email confirmation received
- [ ] App appears in App Store within 24 hours

#### ⚠️ Metadata Rejected
- [ ] Review rejection email received
- [ ] Fix metadata issues (description, screenshots, etc.)
- [ ] Resubmit without new build

#### ❌ Rejected
- [ ] Review rejection email received
- [ ] Address technical issues
- [ ] Fix bugs or missing functionality
- [ ] Create new build
- [ ] Resubmit

### Common Rejection Reasons
1. **Incomplete Information**: Missing privacy policy or support URL
2. **Crashes**: App crashes during review
3. **Broken Features**: Features don't work as described
4. **Privacy Issues**: Insufficient permission descriptions
5. **Design Issues**: Poor user interface or broken layouts

## 🎉 Post-Approval

### Release
- [ ] Choose release method:
  - **Automatic**: Goes live immediately
  - **Manual**: You control release
  - **Scheduled**: Set specific date/time

### Monitor
- [ ] Watch **App Analytics** in App Store Connect:
  - Downloads and installations
  - User engagement
  - Crashes and issues
  - Ratings and reviews

### Respond
- [ ] **Respond to reviews**:
  - Address user concerns
  - Thank users for positive feedback
  - Provide support for issues

## 🔄 Future Updates

### For Updates:
1. **Update version** in `app.json`:
   ```json
   {
     "version": "1.0.1",
     "ios": {
       "buildNumber": "2"
     }
   }
   ```

2. **Build new version**:
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit update**:
   ```bash
   eas submit --platform ios --latest
   ```

## 📞 Support

### If You Need Help:
- **EAS Build Issues**: Check build logs at expo.dev
- **Certificate Issues**: Run `eas credentials` to manage
- **Submission Issues**: Verify Apple Developer account is active
- **Review Issues**: Check App Store Review Guidelines

### Resources:
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

**Ready to deploy?** Run `./deploy-app-store.sh` or follow the steps above manually!

**Good luck with your App Store submission! 🚀**

