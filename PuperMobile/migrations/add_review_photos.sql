-- Migration: Add photos column to reviews table
-- This migration adds a photos column to store array of photo URLs from Supabase Storage

-- Add photos column as text array (can store multiple photo URLs)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Add index for better query performance if needed
-- CREATE INDEX IF NOT EXISTS idx_reviews_photos ON reviews USING GIN (photos);

-- Update existing reviews to have empty array if null
UPDATE reviews 
SET photos = '{}' 
WHERE photos IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN reviews.photos IS 'Array of photo URLs from Supabase Storage for review photos (max 3 per review)';

