# 📸 Photo Upload Setup Guide

## ⚠️ CRITICAL: Your app can't upload photos yet!

The photo upload feature requires a Supabase Storage bucket to be created. Follow these steps **NOW** to enable photo uploads.

## 🚀 Quick Setup (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your **Puper** project (ID: `pbyqkxhqrahjqjvnorwn`)

### Step 2: Create Storage Bucket
1. Click **Storage** in the left sidebar
2. Click **Create bucket**
3. Fill in:
   - **Bucket name**: `review-photos` (EXACT - case sensitive!)
   - **Public bucket**: ✅ **CHECK THIS BOX** (required for photos to display)
   - **File size limit**: `10 MB`
4. Click **Create bucket**

### Step 3: Set Bucket Policies (IMPORTANT!)
1. Click on the `review-photos` bucket
2. Go to **Policies** tab
3. Click **New policy** → **For INSERT**
   - Name: `Allow authenticated uploads`
   - Template: `Authenticated users can upload`
   - Click **Review** → **Save policy**

4. Click **New policy** → **For SELECT**
   - Name: `Allow public read`
   - Template: `Public read access`
   - Click **Review** → **Save policy**

### Step 4: Verify Setup
1. In the app, try uploading a photo to a review
2. If it works, you'll see the photo thumbnail
3. If it fails, check the error message

## 🆘 Troubleshooting

### "Photos could not be uploaded"
- **Check**: Is the bucket named exactly `review-photos`?
- **Check**: Is the bucket set to **Public**?
- **Check**: Are the policies created?

### Photos upload but don't appear
- **Check**: Are the policies allowing public read access?
- **Check**: Is the bucket public?

### Still not working?
1. Open the app console (if available)
2. Try uploading a photo
3. Look for error messages
4. Share the error with support

## ✅ Verification Checklist
- [ ] Bucket `review-photos` created
- [ ] Bucket is set to **Public**
- [ ] INSERT policy created
- [ ] SELECT policy created
- [ ] Test photo upload works

**Once complete, photos will upload automatically!** 🎉

