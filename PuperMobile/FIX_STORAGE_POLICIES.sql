-- Run this ENTIRE script in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query

-- Step 1: Drop any existing policies on review-photos bucket
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to review-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from review-photos" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to upload" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to read" ON storage.objects;

-- Step 2: Create INSERT policy for anonymous uploads
CREATE POLICY "anon_insert_review_photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'review-photos');

-- Step 3: Create SELECT policy for public read access
CREATE POLICY "public_select_review_photos"
ON storage.objects
FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'review-photos');

-- Step 4: Create UPDATE policy (needed for upsert)
CREATE POLICY "anon_update_review_photos"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'review-photos')
WITH CHECK (bucket_id = 'review-photos');

-- Step 5: Verify the bucket exists and is public
-- If this returns no rows, you need to create the bucket first
SELECT * FROM storage.buckets WHERE id = 'review-photos';

-- Step 6: Make sure the bucket is set to public (run this to update it)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'review-photos';
