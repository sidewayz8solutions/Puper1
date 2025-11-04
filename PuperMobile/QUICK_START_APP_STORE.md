# 🚀 Quick Start: Deploy to Apple App Store

## ✅ No Xcode Required!

**EAS Build builds in the cloud** - your Mac doesn't need Xcode! This works on:
- ✅ macOS 15.6.1 (your version)
- ✅ Any Mac model
- ✅ Even Windows/Linux!

**See:** `NO_XCODE_NEEDED.md` for details

## Prerequisites (5-10 minutes)

1. **Apple Developer Account** ($99/year)
   - Sign up: https://developer.apple.com/programs/enroll/
   - Takes 1-2 business days for approval

2. **EAS CLI** (already installed ✅)
   - You're logged in as: `buttond`

## Step-by-Step Deployment (30-45 minutes)

### Step 1: Create App in App Store Connect (5 min)

1. Go to https://appstoreconnect.apple.com/
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Püper
   - **Primary Language**: English
   - **Bundle ID**: `com.sidewayz8.puper`
   - **SKU**: `puper-001`
4. **Note your App Store Connect App ID** (found in App Information)

### Step 2: Get Your Apple Team ID (2 min)

1. Go to https://developer.apple.com/account/#/membership/
2. **Note your Team ID** (10-character string)

### Step 3: Update eas.json (5 min)

Edit `PuperMobile/eas.json` and replace the placeholder values:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-actual-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

**Where to find:**
- `appleId`: Your Apple Developer account email
- `ascAppId`: From Step 1 (App Store Connect App ID)
- `appleTeamId`: From Step 2 (Team ID)

### Step 4: Build Your App in the Cloud (15-30 min)

**🌐 This builds in the cloud - no Xcode needed!**

**Option A: Use the cloud build script (Recommended)**
```bash
cd PuperMobile
./deploy-cloud-build.sh
```

**Option B: Manual cloud build**
```bash
cd PuperMobile
eas build --platform ios --profile production
```

**Note:** Build happens on Expo's servers, not your Mac. Your macOS version is perfectly fine!

**Monitor build progress:**
- Visit: https://expo.dev/accounts/buttond/projects/puper-mobile/builds
- Or run: `eas build:list`

### Step 5: Submit to App Store (5 min)

**Option A: TestFlight (Recommended for first time)**
```bash
cd PuperMobile
eas submit --platform ios --latest
```

Then:
1. Go to App Store Connect → TestFlight
2. Wait for processing (10-30 minutes)
3. Test your app
4. When ready, submit for App Store review

**Option B: Direct App Store submission**
```bash
cd PuperMobile
eas submit --platform ios --latest
```

Then complete App Store listing in App Store Connect.

### Step 6: Complete App Store Listing (10-15 min)

In **App Store Connect** → **Your App** → **App Store**:

1. **Screenshots** (Required):
   - iPhone 15 Pro Max: 1290 x 2796 pixels (3-10 screenshots)
   - iPhone 11 Pro Max: 1284 x 2778 pixels (3-10 screenshots)
   - iPad Pro 12.9": 2048 x 2732 pixels (3-10 screenshots)

2. **App Information**:
   - **Privacy Policy URL**: (Required) Host your privacy policy
   - **Support URL**: (Required) Your website or GitHub
   - **Category**: Lifestyle or Travel
   - **Age Rating**: Complete questionnaire (Result: 4+)

3. **App Description**:
   - See `IOS_APP_STORE_SUBMISSION_GUIDE.md` for full description
   - **Keywords**: `restroom,bathroom,toilet,finder,map,accessibility,travel`

4. **Pricing**: Free

### Step 7: Submit for Review (2 min)

1. In App Store Connect, click **"Add for Review"**
2. Select your uploaded build
3. Answer export compliance (No - if only using HTTPS)
4. Click **"Submit for Review"**

### Step 8: Wait for Review (24-48 hours)

- **Average time**: 24-48 hours
- **First submission**: May take 3-5 days
- You'll receive email updates

## 🎉 What Happens Next?

### If Approved ✅
- App goes live automatically (or on your scheduled date)
- Appears in App Store within 24 hours
- Start receiving downloads!

### If Rejected ❌
- Review the rejection reasons
- Fix issues (may need new build)
- Resubmit

## 📚 Full Documentation

- **Detailed Guide**: `IOS_APP_STORE_SUBMISSION_GUIDE.md`
- **Checklist**: `APP_STORE_DEPLOYMENT_CHECKLIST.md`
- **Deployment Script**: `./deploy-app-store.sh`

## 🆘 Need Help?

### Common Issues:

**Build fails:**
```bash
eas build --platform ios --clear-cache
```

**Certificate issues:**
```bash
eas credentials
```

**Check build status:**
```bash
eas build:list
```

**Check submission status:**
- Visit: https://appstoreconnect.apple.com/

## Quick Commands Reference

```bash
# Build
cd PuperMobile
eas build --platform ios --profile production

# Submit
eas submit --platform ios --latest

# Check status
eas build:list
eas submit:list

# View builds online
# https://expo.dev/accounts/buttond/projects/puper-mobile/builds
```

---

**Ready?** Start with Step 1 above! 🚀

**Good luck with your App Store submission!**

