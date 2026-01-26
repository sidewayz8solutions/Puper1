-- Puper / Supabase bootstrap SQL (repo-derived)
--
-- IMPORTANT:
--   This file ONLY includes SQL that exists in this repository.
--   It assumes your base schema already exists (at minimum: public.reviews table,
--   plus Supabase storage schema). Run your core schema/DDL first.

BEGIN;

-- -----------------------------------------------------------------------------
-- Storage bucket + policies for review photos
-- Bucket: review-photos (PUBLIC)
-- -----------------------------------------------------------------------------

-- Create bucket if it does not exist (Supabase creates storage schema/tables)
-- NOTE: column set may vary by Supabase version; this is the minimal insert.
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- From: PuperMobile/FIX_STORAGE_POLICIES.sql
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to review-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from review-photos" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to upload" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to read" ON storage.objects;

CREATE POLICY "anon_insert_review_photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'review-photos');

CREATE POLICY "public_select_review_photos"
ON storage.objects
FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'review-photos');

CREATE POLICY "anon_update_review_photos"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'review-photos')
WITH CHECK (bucket_id = 'review-photos');

-- Ensure bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'review-photos';

-- -----------------------------------------------------------------------------
-- Migrations that modify the reviews table
-- -----------------------------------------------------------------------------

-- From: PuperMobile/migrations/add_review_photos.sql
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

UPDATE reviews
SET photos = '{}'
WHERE photos IS NULL;

COMMENT ON COLUMN reviews.photos IS 'Array of photo URLs from Supabase Storage for review photos (max 3 per review)';

-- From: PuperMobile/migrations/add_availability_status.sql
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available';

ALTER TABLE reviews
ADD CONSTRAINT availability_status_check
CHECK (availability_status IN ('available', 'busy', 'closed'));

COMMENT ON COLUMN reviews.availability_status IS 'Current availability status of the restroom: available, busy, or closed';

CREATE INDEX IF NOT EXISTS idx_reviews_availability_status
ON reviews(availability_status);

COMMIT;

