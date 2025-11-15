# App Store Connect - Pricing Setup Guide

## Build Submitted ✅
- **Version**: 1.0.9
- **Build Number**: 21
- **Build ID**: 26a05583-b571-47cb-be2f-0fa33177930f

## Step 1: Set App Price to $2.99

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app: **Püper**
3. Go to **Pricing and Availability**
4. Click **Edit** next to pricing
5. Select the price tier that corresponds to **$2.99**
   - Look for "Tier 3" or "$2.99" in the price list
6. Click **Save**

## Step 2: Create "No Ad's" IAP (Remove Ads – one-time)

1. In App Store Connect, go to your app: **Püper**
2. Navigate to **In-App Purchases** (in the left sidebar)
3. Click the **+** button (top left)
4. Select **Non-Consumable**
5. Fill in the following:

   **Reference Name:**
   - `No Ad's`

   **Product ID:**
   - `com.sidewayz8.puper.ads`

   **Price:**
   - Choose your desired one-time price tier (for example $4.99)

   **Review Information:**
   - **Display Name**: `Remove Ads (One-time purchase)`
   - **Description**: `Enjoy Püper without ads and keep finding your roll.`

6. Click **Save**
7. **Submit for Review** (can be reviewed with your app submission)

## Step 3: Verify Ads Configuration

✅ **Ads are already configured in the build:**
- Google Mobile Ads SDK integrated
- Banner ads displayed in the app
- Ad tracking permissions configured
- Currently using test AdMob IDs (acceptable for App Store review)

**Note:** After App Store approval, you'll want to replace test IDs with production AdMob IDs for real revenue.

## Step 4: Complete App Listing

Before submitting for review, ensure:
- [ ] App description is complete
- [ ] Screenshots uploaded (iPhone and iPad)
- [ ] Privacy policy URL is set
- [ ] Age rating is configured
- [ ] App review information is complete
- [ ] Pricing is set to **$2.99**
- [ ] Premium IAP created (**$9.99 Remove Ads**)

## Step 5: Submit for Review

1. In App Store Connect, go to your app version (1.0.9)
2. Complete all required information
3. Click **Submit for Review**

## Pricing Summary

- **App Purchase Price**: $2.99
- **Premium IAP (Remove Ads)**: $9.99 (one-time, non-consumable)

## Notes

- Pricing is managed in App Store Connect, not in code
- The IAP product ID must match what you use in your app code (when you implement the purchase flow)
- Test AdMob IDs are fine for review; replace with production IDs before launch for real revenue





