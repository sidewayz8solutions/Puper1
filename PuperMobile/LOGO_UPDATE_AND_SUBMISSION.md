# iOS Build: New Logo and App Title

This project has been updated to use the new app title and icon:

- App name (display): `Püper - Find Your Roll`
- Icon path: `./assets/pup.jpg`

## Add the new logo

1. Save the provided image as `pup.jpg` in `PuperMobile/assets/`.
2. Recommended: 1024×1024, square, no rounded corners.
3. While `.jpg` is supported for the app icon, Apple’s guidelines often prefer PNG. If you run into issues, convert it to PNG and update the path accordingly.

The `app.config.js` dynamically prefers `pup.jpg`, falls back to `puperl.jpg`, and then to `icon.png` if neither is present, so builds won’t fail while you’re adding the asset.

## Build and submit

From the `PuperMobile` folder:

- Quick path (one-liner steps are in the helper script):
  - `./deploy-ios.sh` – verifies config, builds with EAS, and submits the latest build to App Store Connect.

- Guided path:
  - `./deploy-app-store.sh` – interactive helper that walks through build and submit.

Notes:

- iOS build number is bumped to `5`. App version is `1.0.1`.
- Bundle ID remains `com.sidewayz8.puper`.
- App Store listing title (the name users see in the store) must be confirmed in App Store Connect. This code change sets the in-app/installed name; ensure the Store listing title matches: `Püper - Find Your Roll`.

## Troubleshooting

- If the build still shows the old icon, clear caches in Expo/EAS and make sure `assets/pup.jpg` is present and committed.
- If App Store Connect rejects the icon, convert to PNG (1024×1024) and point `icon` to the PNG file.
