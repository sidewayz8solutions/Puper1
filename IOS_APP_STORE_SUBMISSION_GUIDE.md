# 📱 iOS App Store Submission Guide for Püper

## Prerequisites

### 1. Apple Developer Account
- **Cost**: $99/year
- **Sign up**: https://developer.apple.com/programs/enroll/
- **Processing time**: 1-2 business days for approval

### 2. Required Software
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

### 3. App Store Connect Setup
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Püper
   - **Primary Language**: English
   - **Bundle ID**: com.sidewayz8.puper
   - **SKU**: puper-001 (or any unique identifier)

## Step-by-Step Submission Process

### Phase 1: Configure Your Build

#### 1.1. Update `eas.json` with Your Apple ID
```bash
cd PuperMobile
```

Edit `eas.json` and update the iOS submission section:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

**Finding Your IDs:**
- **Apple ID**: Your Apple Developer account email
- **ASC App ID**: Found in App Store Connect under App Information
- **Team ID**: Found at https://developer.apple.com/account/#/membership/

#### 1.2. Verify app.json Configuration
Ensure these fields are correct:
```json
{
  "expo": {
    "name": "Püper",
    "slug": "puper-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.sidewayz8.puper",
      "buildNumber": "1"
    }
  }
}
```

### Phase 2: Build Your iOS App

#### 2.1. Create Production Build
```bash
cd PuperMobile

# Build for iOS
npm run build:ios

# Or use EAS CLI directly
eas build --platform ios --profile production
```

**Build Process:**
- Takes 15-30 minutes
- Requires Apple Developer credentials
- EAS will prompt you to:
  - Generate certificates (first time)
  - Create provisioning profiles
  - Sign in to Apple Developer account

#### 2.2. Monitor Build Progress
- Visit: https://expo.dev/accounts/YOUR_USERNAME/projects/puper-mobile/builds
- Track build status in real-time
- Download `.ipa` file once complete

### Phase 3: TestFlight Beta Testing (Optional but Recommended)

#### 3.1. Submit to TestFlight
```bash
# Auto-submit to TestFlight after build completes
eas submit --platform ios --latest

# Or submit specific build
eas submit --platform ios --id BUILD_ID
```

#### 3.2. TestFlight Setup
1. Go to **App Store Connect** → **TestFlight**
2. Add **Test Information**:
   - Beta App Description
   - Feedback Email
   - Privacy Policy URL: (your website)
3. Add **Internal Testers** (up to 100)
4. Create **External Test Group** (up to 10,000)

#### 3.3. Beta Testing Period
- **Duration**: 1-4 weeks recommended
- **Collect feedback** on:
  - Map functionality
  - Location accuracy
  - Restroom search performance
  - UI/UX issues
  - Crash reports

### Phase 4: App Store Metadata

#### 4.1. App Information
In **App Store Connect** → **App Information**:

**Privacy Policy URL**: (Required)
- Create a privacy policy page
- Host at: yourwebsite.com/privacy
- Or use: [Privacy Policy Generator](https://www.privacypolicygenerator.info/)

**Category**:
- Primary: Lifestyle or Travel
- Secondary: Navigation

**Content Rights**:
- Copyright: © 2025 Püper / Your Name

#### 4.2. Pricing and Availability
- **Price**: Free
- **Availability**: All countries
- **Pre-Order**: No

#### 4.3. Prepare App Screenshots

**Required Sizes:**
- **6.7" Display (iPhone 15 Pro Max)**: 1290 x 2796 pixels (3-10 screenshots)
- **6.5" Display (iPhone 11 Pro Max)**: 1284 x 2778 pixels (3-10 screenshots)
- **iPad Pro (3rd Gen) 12.9"**: 2048 x 2732 pixels (3-10 screenshots)

**Screenshot Content Ideas:**
1. Map view showing nearby restrooms
2. Restroom details with 5-toilet ratings
3. Filter options (accessibility, baby changing, etc.)
4. Add restroom feature
5. Ranking/leaderboard page

**Tools for Screenshots:**
- iOS Simulator + Cmd+S
- [Screenshot Framer](https://www.screenshots.design/)
- [Previewed](https://previewed.app/)

#### 4.4. App Preview Video (Optional)
- **Length**: 15-30 seconds
- **Format**: MP4 or M4V
- **Resolution**: Same as screenshots
- **Content**: Show key features: map, search, rating

#### 4.5. App Store Description

**App Name**: Püper - Restroom Finder

**Subtitle**: Your Guide to Relief

**Promotional Text** (170 characters):
```
Find clean, accessible restrooms anywhere! Use our unique 5-toilet rating system and community reviews to discover the best facilities near you.
```

**Description** (4000 characters max):
```
🚽 Püper - Your Guide to Relief

Never get caught without a clean restroom again! Püper is the ultimate restroom finder app, helping millions of people discover clean, accessible public restrooms wherever they go.

✨ KEY FEATURES

🗺️ INTERACTIVE MAP
• Real-time restroom locations powered by GPS
• Smart search filters for quick results
• Distance-based ranking to find the closest options

🚽 UNIQUE 5-TOILET RATING SYSTEM
• Forget stars! We use toilets to rate facilities
• Rate restrooms on cleanliness, supplies, and accessibility
• See honest reviews from real users

♿ ACCESSIBILITY FIRST
• Filter by wheelchair accessibility
• Baby changing station indicators
• Gender-neutral restroom options
• Detailed accessibility information

💬 COMMUNITY POWERED
• Add new restrooms to help others
• Share photos and honest reviews
• Real-time availability updates
• Help build the world's largest restroom database

📍 SMART SEARCH
• Find restrooms along your route
• Filter by amenities and features
• Get turn-by-turn directions
• Save your favorite locations

🏆 GAMIFICATION
• Earn points for contributions
• Unlock achievement badges
• Climb the community leaderboard
• Help fellow travelers find relief

WHY PÜPER?

Perfect for:
• Road trippers and travelers
• Parents with young children
• People with accessibility needs
• City explorers and tourists
• Anyone who values clean facilities

Our unique geolocation-based ranking automatically finds and ranks nearby restrooms based on your current location. No more guessing which restroom is closest or cleanest!

PRIVACY & SECURITY
• Your location is never shared with other users
• Optional anonymous reviews
• Secure data encryption
• GDPR compliant

JOIN THE COMMUNITY

Help us build the world's most comprehensive restroom database! Add new locations, leave honest reviews, and help others find relief when they need it most.

SUPPORT

Questions or feedback? Contact us at support@puper.com
Visit our website: puper.com
Follow us on social media for updates and tips

Made with 💩 for everyone who needs to go!

---

Note: Püper requires location services to find nearby restrooms. Camera access is optional for uploading photos.
```

**Keywords** (100 characters max):
```
restroom,bathroom,toilet,finder,map,accessibility,travel,public,facilities,review,rating,relief
```

**Support URL**: 
- Your website or GitHub page
- Example: https://github.com/sidewayz8/Puper1

**Marketing URL** (Optional):
- Landing page for the app
- Example: https://puper.com

#### 4.6. Age Rating Questionnaire
Complete the questionnaire:
- **Unrestricted Web Access**: No
- **Gambling**: No
- **Contests**: No
- **Mature/Suggestive Themes**: No
- **Violence**: None
- **Horror/Fear Themes**: None
- **Profanity or Crude Humor**: None

**Result**: Rated **4+** (for all ages)

### Phase 5: Submit for Review

#### 5.1. Final Checklist
- [ ] All screenshots uploaded (iPhone & iPad)
- [ ] App description complete
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] App icon uploaded (1024x1024)
- [ ] Version 1.0.0 ready
- [ ] Build uploaded from EAS/TestFlight
- [ ] Export compliance information complete

#### 5.2. Export Compliance
**Does your app use encryption?**
- Select "No" if you're only using HTTPS
- Or "Yes" and answer follow-up questions about encryption

#### 5.3. Submit
1. Click **"Add for Review"**
2. Select your uploaded build
3. Answer all required questions
4. Click **"Submit for Review"**

### Phase 6: Review Process

#### 6.1. Review Timeline
- **Average**: 24-48 hours
- **First submission**: May take 3-5 days
- **Expedited review**: Available for critical fixes

#### 6.2. Possible Outcomes

**✅ Approved**
- Your app goes live automatically or on your scheduled date
- You'll receive email confirmation
- App appears in App Store within 24 hours

**⚠️ Metadata Rejected**
- Minor issues with description, screenshots, etc.
- Fix and resubmit without new build

**❌ Rejected**
- Review guidelines violation
- Technical issues
- Missing functionality
- Address concerns and resubmit

#### 6.3. Common Rejection Reasons
1. **Incomplete Information**: Missing privacy policy or support URL
2. **Crashes**: App crashes during review
3. **Broken Features**: Features don't work as described
4. **Privacy Issues**: Insufficient permission descriptions
5. **Design Issues**: Poor user interface or broken layouts

### Phase 7: Post-Approval

#### 7.1. Release Your App
- **Automatic Release**: Goes live immediately upon approval
- **Manual Release**: You control when it goes live
- **Scheduled Release**: Set a specific date/time

#### 7.2. Monitor Performance
**App Analytics** (in App Store Connect):
- Downloads and installations
- User engagement
- Crashes and issues
- Ratings and reviews

**Respond to Reviews**:
- Address user concerns
- Thank users for positive feedback
- Provide support for issues

#### 7.3. Updates
For future updates:
```bash
# Update version in app.json
# Increment buildNumber (e.g., "2", "3", etc.)

cd PuperMobile
npm run build:ios
eas submit --platform ios --latest
```

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
eas build --platform ios --clear-cache

# Check build logs
eas build:list
```

### Certificate Issues
```bash
# Revoke and regenerate certificates
eas credentials

# Select iOS → Production → Manage Credentials
```

### Submission Fails
- Verify Apple Developer account is active
- Ensure App Store Connect agreement is signed
- Check that bundle ID matches everywhere

### App Rejected for Privacy
- Add detailed privacy policy
- Update permission descriptions in `app.json`
- Explain data collection clearly

## Costs Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Yearly |
| EAS Build (Free tier) | $0 | - |
| EAS Build (Paid tier) | $29-$99/mo | Monthly (optional) |

## Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Guide](https://help.apple.com/app-store-connect/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Forums](https://forums.expo.dev/)

## Support

For help with the Püper app specifically:
- Email: your-email@example.com
- GitHub: https://github.com/sidewayz8/Puper1

---

**Good luck with your App Store submission! 🚀**

*Last updated: October 26, 2025*
