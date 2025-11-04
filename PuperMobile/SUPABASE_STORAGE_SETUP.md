# 📸 Supabase Storage Setup for Review Photos

## ✅ What's Been Set Up

### 1. Database Migration
- **File**: `migrations/add_review_photos.sql`
- **What it does**: Adds a `photos` column (TEXT array) to the `reviews` table
- **Status**: Ready to run in Supabase

### 2. Photo Upload Service
- **File**: `services/supabase.js`
- **Function**: `photoService.uploadReviewPhotos()`
- **What it does**: Uploads photos to Supabase Storage and returns URLs

### 3. Code Integration
- **File**: `App.js`
- **Updated**: Review submission now uploads photos to Supabase Storage first
- **Stores**: Photo URLs in the `photos` column

## 🚀 Setup Steps

### Step 1: Run the Database Migration

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**:
   - Copy the contents of `migrations/add_review_photos.sql`
   - Paste into SQL Editor
   - Click "Run" or press `Cmd/Ctrl + Enter`

4. **Verify**:
   - Go to "Table Editor" → "reviews" table
   - Check that `photos` column exists (type: text array)

### Step 2: Create Storage Bucket

1. **Go to Storage**:
   - Click "Storage" in the left sidebar

2. **Create New Bucket**:
   - Click "Create bucket"
   - **Bucket name**: `review-photos`
   - **Public bucket**: ✅ Check this (so photos are publicly accessible)
   - **File size limit**: 10 MB (or your preferred limit)
   - Click "Create bucket"

3. **Set Bucket Policies** (Optional but Recommended):
   - Click on the `review-photos` bucket
   - Go to "Policies" tab
   - Click "New policy"
   - **Policy name**: "Allow authenticated uploads"
   - **Policy**: 
     ```sql
     -- Allow authenticated users to upload photos
     CREATE POLICY "Allow authenticated uploads" ON storage.objects
     FOR INSERT TO authenticated
     WITH CHECK (bucket_id = 'review-photos');
     
     -- Allow public read access
     CREATE POLICY "Allow public read" ON storage.objects
     FOR SELECT TO public
     USING (bucket_id = 'review-photos');
     ```

### Step 3: Verify Storage Configuration

1. **Check Bucket Settings**:
   - Ensure bucket is public
   - Check file size limits
   - Verify policies are set correctly

2. **Test Upload** (Optional):
   - Try uploading a test photo through the app
   - Check Storage → `review-photos` bucket to see if file appears

## 📋 Storage Bucket Details

- **Bucket Name**: `review-photos`
- **Path Structure**: `review-photos/review-{reviewId}-{index}-{timestamp}.{ext}`
- **Example**: `review-photos/review-123-0-1699123456789.jpg`
- **Max Photos**: 3 per review
- **File Size**: Recommended 10 MB limit per photo

## 🔧 Code Changes Made

### services/supabase.js
- Added `photoService` with:
  - `uploadReviewPhoto()` - Upload single photo
  - `uploadReviewPhotos()` - Upload multiple photos
  - `deleteReviewPhoto()` - Delete photo (optional cleanup)

### App.js
- Updated `handleAddRating()` to:
  1. Upload photos to Supabase Storage first
  2. Get public URLs
  3. Store URLs in review data
  4. Submit review with photo URLs

## 📝 Database Schema

The `reviews` table now has:
- `photos` (TEXT[]) - Array of photo URLs from Supabase Storage

Example data:
```json
{
  "id": 123,
  "restroom_id": 456,
  "rating": 5,
  "review_text": "Great restroom!",
  "photos": [
    "https://[project].supabase.co/storage/v1/object/public/review-photos/review-123-0-1699123456789.jpg",
    "https://[project].supabase.co/storage/v1/object/public/review-photos/review-123-1-1699123456790.jpg"
  ]
}
```

## 🆘 Troubleshooting

### Photos Not Uploading

1. **Check Storage Bucket**:
   - Ensure `review-photos` bucket exists
   - Verify bucket is public
   - Check file size limits

2. **Check Permissions**:
   - Verify RLS policies allow uploads
   - Check if bucket policies are set correctly

3. **Check Console Logs**:
   - Look for upload errors in app console
   - Check Supabase Storage logs

### Photos Not Displaying

1. **Check URLs**:
   - Verify photo URLs are correct
   - Check if URLs are accessible (try opening in browser)

2. **Check CORS** (if needed):
   - Supabase Storage should handle CORS automatically
   - If issues persist, check bucket CORS settings

### Migration Fails

1. **Check Column Already Exists**:
   - If `photos` column already exists, migration will skip
   - This is safe - the `IF NOT EXISTS` prevents errors

2. **Manual Column Addition**:
   - If migration doesn't work, manually add column:
     ```sql
     ALTER TABLE reviews ADD COLUMN photos TEXT[] DEFAULT '{}';
     ```

## ✅ Verification Checklist

- [ ] Database migration run successfully
- [ ] `photos` column exists in `reviews` table
- [ ] Storage bucket `review-photos` created
- [ ] Bucket is set to public
- [ ] Test photo upload works
- [ ] Photos appear in Storage bucket
- [ ] Photo URLs are stored in database
- [ ] Photos display correctly in app

## 🎯 Next Steps

After setup is complete:
1. Test photo upload in the app
2. Verify photos appear in Supabase Storage
3. Check that photo URLs are stored in reviews
4. Test displaying photos in review list (if needed)

---

**All code is ready!** Just run the migration and create the storage bucket. 🚀

