# Ads Setup and Privacy

This app integrates Google Mobile Ads using `react-native-google-mobile-ads` via EAS (Expo SDK 54).

## What was added

- Library: `react-native-google-mobile-ads`
- iOS Info.plist keys added via Expo config (no plugin):
  - `GADApplicationIdentifier` (AdMob App ID)
  - `NSUserTrackingUsageDescription` (ATT prompt)
  - `SKAdNetworkItems` (Google’s SKAdNetwork id)
- Banner ad (test unit) shown at the bottom of the main screen

## Replace test IDs with your real AdMob IDs

- App IDs:
  - iOS: set `expo.ios.infoPlist.GADApplicationIdentifier` to your real AdMob App ID.
  - Android: set your AdMob App ID in AndroidManifest (will be handled in a later step before Android release).
- Ad unit IDs (code): replace `TestIds.BANNER` with your production unit IDs.

## Build requirements

- Requires EAS Build (a new native build) after adding the library.
- iOS will display the App Tracking Transparency prompt if you choose to personalize ads.

## Privacy and consent

- If serving personalized ads in the EU/EEA or under CCPA, you must implement consent flows.
- Consider adding a consent screen and using Google UMP (User Messaging Platform) SDK.
- If unsure, default to non-personalized ads and provide a toggle in settings.

## Troubleshooting

- If the ad does not show in development, keep using test IDs—production IDs may be filtered on simulators.
- Ensure the iOS Info.plist keys exist in `app.json`/`app.config.js` under `expo.ios.infoPlist` (especially `GADApplicationIdentifier`).
- Check device logs for errors from Google Mobile Ads SDK.
