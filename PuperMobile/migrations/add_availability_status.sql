-- Add availability_status column to reviews table
-- This allows users to report if a restroom is available, busy, or closed

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available';

-- Add a check constraint to ensure only valid values
ALTER TABLE reviews 
ADD CONSTRAINT availability_status_check 
CHECK (availability_status IN ('available', 'busy', 'closed'));

-- Add comment to document the column
COMMENT ON COLUMN reviews.availability_status IS 'Current availability status of the restroom: available, busy, or closed';

-- Optional: Create an index for faster queries on availability_status
CREATE INDEX IF NOT EXISTS idx_reviews_availability_status 
ON reviews(availability_status);
