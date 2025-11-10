# Fix GitHub Build Error

## Problem
The GitHub build modal shows: **"Failed to read "/eas.json". Run `eas build:configure` to create the file."**

## Solution

When building from GitHub, you need to set the **Base directory** to where your `eas.json` file is located.

### Steps:

1. In the "Start a build from GitHub" modal:
   - **Base directory**: Change from `/` to `Puper1/PuperMobile`
   - Keep all other settings as they are:
     - Platform: iOS (or All)
     - Git ref: main
     - EAS Build profile: production
     - Environment: Production

2. Click **Confirm** to start the build

## Why This Happens

- The `eas.json` file is located at: `Puper1/PuperMobile/eas.json`
- The GitHub repository root doesn't have `eas.json`
- EAS needs to know where to find the Expo project configuration

## Alternative: Build from Command Line

If you prefer to build from command line (which we've been doing):

```bash
cd /Users/wshirlz6234/Desktop/Puper/Puper1/PuperMobile
npx eas-cli build --platform ios --profile production
```

This automatically finds `eas.json` in the current directory.

## Verify eas.json is in GitHub

Make sure `eas.json` is committed and pushed to your GitHub repository:

```bash
cd /Users/wshirlz6234/Desktop/Puper/Puper1/PuperMobile
git status
git add eas.json
git commit -m "Add eas.json configuration"
git push
```

The file should be at: `Puper1/PuperMobile/eas.json` in your GitHub repository.


