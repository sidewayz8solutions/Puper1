# Build and Submit to App Store Connect

## Current Configuration
- **Version**: 1.0.9
- **Build Number**: 21
- **Bundle ID**: com.sidewayz8.puper
- **Ads**: Configured (using test IDs - replace with production IDs before final release)

## Step 1: Build the App

```bash
cd /Users/wshirlz6234/Desktop/Puper/Puper1/PuperMobile

# Make sure you're logged in to EAS
npx eas-cli login

# Build for iOS production
npx eas-cli build --platform ios --profile production --non-interactive
```

## Step 2: Submit to App Store Connect

After the build completes successfully, submit it:

```bash
# Submit the latest build to App Store Connect
npx eas-cli submit --platform ios --profile production --latest --non-interactive
```

**Note**: The submit command will automatically:
- Use the latest completed build
- Upload to App Store Connect
- Use your Apple ID: benjamin@sidewayz8solutions.com
- Use your Team ID: 66C32GHYYA

## Step 3: Configure Pricing in App Store Connect

**IMPORTANT**: Pricing must be set in App Store Connect, not in code.

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app: **Püper**
3. Go to **Pricing and Availability**
4. Click **Edit** next to pricing
5. Set the app price to **$2.99** (or find the corresponding price tier)
6. Save changes

## Step 4: Create Premium IAP (Remove Ads - $9.99)

1. In App Store Connect, go to your app: **Püper**
2. Navigate to **In-App Purchases**
3. Click the **+** button to create a new IAP
4. Select **Non-Consumable**
5. Fill in:
   - **Reference Name**: Remove Ads (Lifetime)
   - **Product ID**: `com.sidewayz8.puper.remove_ads_lifetime`
   - **Price**: $9.99
   - **Display Name**: Remove Ads (Lifetime)
   - **Description**: Permanently remove all ads from the app
6. Save and submit for review (can be reviewed with your next binary)

## Step 5: Complete App Store Listing

Before submitting for review, make sure:
- [ ] App description is complete
- [ ] Screenshots are uploaded (iPhone and iPad)
- [ ] Privacy policy URL is set
- [ ] Age rating is configured
- [ ] App review information is complete

## Step 6: Submit for Review

1. In App Store Connect, go to your app version
2. Complete all required information
3. Click **Submit for Review**

## Current Ad Configuration

**Note**: Currently using test AdMob IDs. Before final release:
- Replace test IDs in `App.js` (line 141) with production ad unit IDs
- Replace test App ID in `app.json` (line 27) with your production AdMob App ID

Test IDs (current):
- App ID: `ca-app-pub-3940256099942544~1458002511`
- Banner Unit: `TestIds.BANNER`

These will show test ads, which is fine for App Store review, but you'll need production IDs for real revenue.

