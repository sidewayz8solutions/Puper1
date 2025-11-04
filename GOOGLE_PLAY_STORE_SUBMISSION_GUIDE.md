# 🤖 Google Play Store Submission Guide for Püper

## Prerequisites

### 1. Google Play Developer Account
- **Cost**: $25 (one-time fee)
- **Sign up**: https://play.google.com/console/signup
- **Processing time**: 24-48 hours for verification
- **Requirements**: Google account, valid payment method, government ID

### 2. Required Software
```bash
# Install EAS CLI globally (if not already installed)
npm install -g eas-cli

# Login to your Expo account
eas login
```

### 3. Google Play Console Setup
1. Go to [Google Play Console](https://play.google.com/console/)
2. Click **"Create app"**
3. Fill in:
   - **App name**: Püper
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
4. Accept declarations and click **"Create app"**

## Step-by-Step Submission Process

### Phase 1: Configure Your Build

#### 1.1. Verify app.json Configuration
```bash
cd PuperMobile
```

Ensure these fields are correct in `app.json`:
```json
{
  "expo": {
    "name": "Püper",
    "slug": "puper-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.sidewayz8.puper",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA"
      ]
    }
  }
}
```

**Important:**
- `package`: Must be unique across all Play Store apps
- `versionCode`: Integer that increments with each update (1, 2, 3...)
- `version`: User-facing version string (1.0.0, 1.0.1, 1.1.0...)

#### 1.2. Update eas.json for Android
Your `eas.json` should include:
```json
{
  "build": {
    "production": {
      "android": {
        "package": "com.sidewayz8.puper",
        "buildType": "aab"
      }
    }
  }
}
```

**Note**: Google Play requires AAB (Android App Bundle) format since August 2021.

### Phase 2: Build Your Android App

#### 2.1. Create Production Build
```bash
cd PuperMobile

# Build for Android (AAB format)
npm run build:android

# Or use EAS CLI directly
eas build --platform android --profile production
```

**Build Process:**
- Takes 10-20 minutes
- First build will generate a keystore (keep this secure!)
- EAS automatically manages signing credentials

#### 2.2. Download Your Build
- Visit: https://expo.dev/accounts/YOUR_USERNAME/projects/puper-mobile/builds
- Download the `.aab` file once complete
- Keep this file safe for upload to Play Console

#### 2.3. Important: Save Your Keystore
```bash
# Download your keystore credentials
eas credentials

# Select Android → Production → Download keystore
```

**⚠️ CRITICAL**: Store your keystore safely! You'll need it for all future updates.

### Phase 3: Set Up Your App in Play Console

#### 3.1. App Access
1. Go to **"App access"** in the left menu
2. Select:
   - **All functionality is available without restrictions**: If true
   - **Some functionality is restricted**: If you have special features
3. Click **"Save"**

#### 3.2. Ads Declaration
1. Go to **"Ads"**
2. Select:
   - **No, my app does not contain ads** (if you have no ads)
   - **Yes, my app contains ads** (if you show ads)
3. Click **"Save"**

#### 3.3. Content Rating
1. Go to **"Content rating"**
2. Click **"Start questionnaire"**
3. Enter email address
4. Select category: **"Utility, Productivity, Communication, or Other"**
5. Answer questions:
   - Does your app depict violence? **No**
   - Does your app contain sexual content? **No**
   - Does your app contain profanity? **No**
   - Does your app include user-generated content? **Yes** (reviews and ratings)
   - Does your app allow user interaction? **Yes** (adding restrooms, reviews)
6. Submit questionnaire
7. Apply rating (usually "Everyone")

#### 3.4. Target Audience and Content
1. Go to **"Target audience and content"**
2. **Target age**: Select age ranges (13+, 16-17, 18+)
3. **Store presence**: Make app available on Google Play for Children: **No**
4. Click **"Next"** and save

#### 3.5. News Apps
- Select **"No"** (unless you have news content)

#### 3.6. COVID-19 Contact Tracing and Status Apps
- Select **"No"**

#### 3.7. Data Safety
1. Go to **"Data safety"**
2. Click **"Start"**
3. Answer questions:

**Data Collection:**
- Does your app collect or share user data? **Yes**
- Location: **Precise location** (collected, not shared)
  - Purpose: App functionality (finding nearby restrooms)
  - Optional: **No** (required for core functionality)
- Personal info: **Photos** (optional, for uploads)
  - Purpose: App functionality (restroom photos)
  - Optional: **Yes**

**Security Practices:**
- Is data encrypted in transit? **Yes**
- Can users request data deletion? **Yes** (provide instructions)

4. Submit and save

### Phase 4: Store Listing

#### 4.1. Main Store Listing
Go to **"Main store listing"**

**App name**: Püper

**Short description** (80 characters max):
```
Find clean restrooms anywhere with our 5-toilet rating system!
```

**Full description** (4000 characters max):
```
🚽 Püper - Your Guide to Relief

Never get caught without a clean restroom again! Püper is the ultimate restroom finder app, helping you discover clean, accessible public restrooms wherever you go.

✨ KEY FEATURES

🗺️ INTERACTIVE MAP
• Real-time restroom locations powered by GPS
• Smart search filters for quick results
• Distance-based ranking to find the closest options
• Automatic geolocation to show nearby facilities

🚽 UNIQUE 5-TOILET RATING SYSTEM
• Forget stars! We use toilets to rate facilities
• Rate restrooms on cleanliness, supplies, and accessibility
• See honest reviews from real users
• Community-driven rankings

♿ ACCESSIBILITY FIRST
• Filter by wheelchair accessibility
• Baby changing station indicators
• Gender-neutral restroom options
• Detailed accessibility information for every location

💬 COMMUNITY POWERED
• Add new restrooms to help others
• Share photos and honest reviews
• Real-time availability updates
• Help build the world's largest restroom database
• Earn points for contributions

📍 SMART SEARCH
• Find restrooms along your route
• Filter by amenities and features
• View distance to each facility
• Save your favorite locations

🏆 COMMUNITY FEATURES
• Leave detailed ratings and reviews
• Upload photos to help others
• Rate cleanliness, availability, and amenities
• Help fellow travelers find relief

WHY PÜPER?

Perfect for:
• Road trippers and travelers
• Parents with young children
• People with accessibility needs
• City explorers and tourists
• Delivery drivers and rideshare workers
• Anyone who values clean facilities

Our unique geolocation-based ranking automatically finds and ranks nearby restrooms based on your current location using the innovative 5-toilet rating system. No more guessing which restroom is closest or cleanest!

PRIVACY & SECURITY
• Your location is never shared with other users
• Optional anonymous reviews
• Secure data encryption
• GDPR compliant
• Your privacy is our priority

JOIN THE COMMUNITY

Help us build the world's most comprehensive restroom database! Add new locations, leave honest reviews, and help others find relief when they need it most.

PERMISSIONS

• Location: Required to find nearby restrooms
• Camera: Optional, for uploading photos of facilities
• Internet: Required to access restroom database

SUPPORT

Questions or feedback? Contact us at support@puper.com
Visit our website: puper.com

Made with 💩 for everyone who needs to go!
```

#### 4.2. App Icon
- **Size**: 512 x 512 pixels
- **Format**: PNG (32-bit)
- **File size**: Max 1 MB
- Upload the icon from `PuperMobile/assets/icon.png`

#### 4.3. Feature Graphic
- **Size**: 1024 x 500 pixels
- **Format**: PNG or JPEG
- **Required**: Yes

Create a feature graphic showing:
- App logo/name
- Key feature (map with toilet markers)
- Tagline: "Your Guide to Relief"

**Tools**:
- Canva (free templates)
- Figma
- Photoshop

#### 4.4. Screenshots

**Requirements:**
- **Phone**: Minimum 2, maximum 8 screenshots
- **Minimum size**: 320 pixels
- **Maximum size**: 3840 pixels
- **Aspect ratio**: 16:9 to 9:16

**Recommended sizes:**
- Phone: 1080 x 1920 pixels (Portrait)
- Tablet: 1200 x 1920 pixels or 1920 x 1200 pixels

**Screenshot Content:**
1. Home page with hero video/image
2. Map view showing nearby restrooms
3. Restroom details with 5-toilet rating
4. Filter options (accessibility, baby changing)
5. Add restroom feature
6. Rankings page
7. Review/rating interface
8. User profile/settings

**Tools for Screenshots:**
- Android Emulator
- [Android Screenshot](https://www.apkmonk.com/)
- [Screenshot Generator](https://screenshots.pro/)

#### 4.5. Video (Optional)
- **Format**: YouTube video link
- **Length**: 30 seconds to 2 minutes
- **Content**: Feature overview and app demo

#### 4.6. App Category
- **Category**: Lifestyle or Travel & Local
- **Tags**: Add relevant tags (max 5):
  - Restroom
  - Bathroom
  - Toilet Finder
  - Accessibility
  - Travel

#### 4.7. Contact Details
- **Email**: your-email@example.com
- **Website**: https://puper.com or GitHub link
- **Phone** (optional): Your contact number
- **Privacy Policy**: **REQUIRED** - URL to your privacy policy

#### 4.8. External Marketing (Optional)
- **Promotional graphic** (180 x 120): Optional
- **TV banner** (1280 x 720): Optional for Android TV

### Phase 5: Release

#### 5.1. Select Countries
1. Go to **"Countries/regions"**
2. Select countries where you want to distribute
3. **Recommendation**: Start with "All countries" or select specific regions

#### 5.2. Create Release
1. Go to **"Production"** → **"Create new release"**
2. Upload your `.aab` file
3. **Release name**: "1.0.0 - Initial Release"
4. **Release notes** (max 500 characters per language):

```
🎉 Welcome to Püper - Your Guide to Relief!

What's included in version 1.0.0:
• Interactive map with restroom locations
• Unique 5-toilet rating system
• Accessibility filters (wheelchair, baby changing, gender-neutral)
• Community reviews and ratings
• Add new restrooms to the database
• Geolocation-based search
• Real-time distance calculations

Find clean, accessible restrooms wherever you go!
```

#### 5.3. Review Release
- Review all information
- Check for warnings or errors
- Fix any issues flagged by Google

#### 5.4. Submit for Review
1. Click **"Save"** to save your draft
2. Click **"Review release"**
3. Review summary
4. Click **"Start rollout to Production"**

### Phase 6: Review Process

#### 6.1. Review Timeline
- **Average**: 1-7 days
- **First submission**: May take up to 7 days
- **Updates**: Usually 1-3 days
- **Expedited review**: Not available for Play Store

#### 6.2. Possible Outcomes

**✅ Approved**
- App goes live within a few hours
- Appears in search results within 24-48 hours
- Email notification sent

**❌ Rejected**
Common reasons:
1. **Privacy policy missing or inadequate**
2. **Permissions not justified**
3. **Content policy violations**
4. **Misleading description or screenshots**
5. **App crashes on test devices**

**Fix and Resubmit:**
- Address all issues mentioned
- Update listing or app as needed
- Create new release with fixes

#### 6.3. Testing Before Launch
**Internal Testing** (Recommended):
1. Go to **"Internal testing"**
2. Create release
3. Add test users (email addresses)
4. Test thoroughly before production release

**Closed Testing** (Optional):
- Up to 100 testers
- More controlled than open beta

**Open Testing** (Optional):
- Anyone can join
- Get broader feedback before launch

### Phase 7: Post-Approval

#### 7.1. Monitor Performance
**Play Console Analytics**:
- Installs and uninstalls
- Ratings and reviews
- Crashes and ANRs
- User acquisition
- Revenue (if applicable)

#### 7.2. Respond to Reviews
- Address user concerns promptly
- Thank users for positive feedback
- Provide support for issues
- Update app based on feedback

#### 7.3. Updates
For future updates:

```bash
# Update version in app.json:
# - Increment versionCode (e.g., 2, 3, 4...)
# - Update version string (e.g., "1.0.1", "1.1.0")

{
  "android": {
    "versionCode": 2,
    "version": "1.0.1"
  }
}

# Build new version
cd PuperMobile
npm run build:android

# Create new release in Play Console
# Upload new .aab file
# Add release notes
# Roll out to production
```

#### 7.4. Release Management
**Staged Rollout** (Recommended):
1. Start with 20% of users
2. Monitor for crashes/issues
3. Increase to 50%, then 100%
4. Pause and fix if problems occur

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
eas build --platform android --clear-cache

# Check build logs
eas build:list
```

### Keystore Issues
- **Never lose your keystore!**
- Store in secure location (password manager)
- Backup to multiple locations
- If lost, you cannot update the app (must publish as new app)

### Upload Fails
- Ensure you're uploading `.aab` not `.apk`
- Check file size (max 150 MB)
- Verify package name matches everywhere

### App Rejected
Common fixes:
- Add comprehensive privacy policy
- Justify all permissions in description
- Update screenshots if misleading
- Fix crashes reported in pre-launch report

### Pre-launch Report Shows Crashes
1. Review crash logs in Play Console
2. Test on multiple devices/Android versions
3. Fix issues and upload new build
4. Consider internal testing first

## Costs Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Google Play Developer | $25 | One-time |
| EAS Build (Free tier) | $0 | - |
| EAS Build (Paid tier) | $29-$99/mo | Monthly (optional) |

## Best Practices

### Optimization
- Use Android App Bundle (AAB) format
- Optimize app size (target < 50 MB)
- Support multiple screen sizes
- Test on various Android versions

### ASO (App Store Optimization)
- Use all 50 characters in short description
- Include keywords naturally in full description
- Update screenshots regularly
- Respond to reviews
- Encourage satisfied users to rate

### Quality
- Target Android 13 (API 33) or higher
- Follow Material Design guidelines
- Test thoroughly before submission
- Monitor pre-launch report
- Fix crashes immediately

## Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Play Console Policies](https://play.google.com/about/developer-content-policy/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Android Guide](https://docs.expo.dev/build-reference/android-builds/)
- [Android Developers](https://developer.android.com/)

## Support

For help with the Püper app specifically:
- Email: your-email@example.com
- GitHub: https://github.com/sidewayz8/Puper1

---

**Good luck with your Play Store submission! 🚀**

*Last updated: October 26, 2025*
