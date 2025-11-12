# App Store Connect API Key - Key Identifier & Issuer Identifier

## What You Need

When uploading an App Store Connect API key to EAS, you need **3 pieces of information**:

1. **API Key File** (`.p8` file) - ✅ You already have this: `ApiKey_1CQIS1UMLXOO.p8`
2. **Key Identifier** - Found in App Store Connect
3. **Issuer Identifier** - Found in App Store Connect

## How to Find Key Identifier

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click on your name/profile in the top right
3. Select **"Users and Access"**
4. Click on the **"Keys"** tab
5. Find the key you downloaded (look for the key with identifier similar to your filename: `1CQIS1UMLXOO`)
6. Click on the key to view details
7. You'll see:
   - **Key ID**: This is your **Key Identifier** (e.g., `1CQIS1UMLXOO`)
   - **Issuer ID**: This is your **Issuer Identifier** (looks like a UUID, e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## How to Find Issuer Identifier

The **Issuer Identifier** is also in App Store Connect:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click on your name/profile in the top right
3. Select **"Users and Access"**
4. Click on the **"Keys"** tab
5. At the top of the page, you'll see:
   - **Issuer ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (this is your Issuer Identifier)

## Quick Reference

- **Key Identifier**: The 10-character alphanumeric code (e.g., `1CQIS1UMLXOO`)
  - Usually matches part of your `.p8` filename
  - Found in the key details in App Store Connect

- **Issuer Identifier**: A UUID format string (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
  - Found at the top of the Keys page in App Store Connect
  - Same for all keys in your account

## Steps to Fill the Modal

1. **ASC API Key File**: ✅ Already uploaded (`ApiKey_1CQIS1UMLXOO.p8`)

2. **Key Identifier**: 
   - Go to App Store Connect → Users and Access → Keys
   - Find your key and copy the **Key ID** (10 characters)
   - Paste it into the "Key Identifier" field

3. **Issuer Identifier**:
   - In the same Keys page, copy the **Issuer ID** from the top
   - Paste it into the "Issuer Identifier" field

4. **Name**: ✅ Already filled ("William Shirley")

5. Click **Save**

## If You Don't Have an API Key Yet

If you need to create a new App Store Connect API key:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click your name → **Users and Access**
3. Go to the **Keys** tab
4. Click the **+** button to create a new key
5. Give it a name (e.g., "EAS Submit Key")
6. Select **App Manager** or **Admin** access
7. Click **Generate**
8. **Download the `.p8` file** immediately (you can only download it once!)
9. Copy the **Key ID** and **Issuer ID** before closing the page

## Notes

- The `.p8` file can only be downloaded once, so make sure you save it securely
- The Key Identifier and Issuer Identifier are always visible in App Store Connect, so you can retrieve them anytime
- This API key is used by EAS Submit to upload your app to App Store Connect automatically




