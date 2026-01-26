-- Püper / Supabase fresh-start bootstrap
--
-- Run this in the Supabase SQL Editor for your TARGET project.
-- It is intended to be (reasonably) idempotent for repeated runs.
--
-- Includes:
--   - Core tables: public.restrooms, public.reviews, public.users (profile)
--   - PostGIS (geography point) + trigger + indexes
--   - RPCs: find_nearby_restrooms, search_restrooms, get_restrooms_in_bounds, find_closest_restrooms
--   - RLS + policies (public read, open inserts, authenticated updates)
--   - Storage buckets + policies (review-photos, user-avatars, restroom-photos)

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.restrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text,
  lat double precision NOT NULL,
  lon double precision NOT NULL,
  -- Use geography so ST_DWithin/ST_Distance work in meters without manual conversions
  location geography(Point, 4326),

  wheelchair_accessible boolean NOT NULL DEFAULT false,
  baby_changing boolean NOT NULL DEFAULT false,
  gender_neutral boolean NOT NULL DEFAULT false,

  -- Extra fields used by the web app/import scripts
  google_place_id text,
  opening_hours text,
  fee boolean,
  requires_fee boolean NOT NULL DEFAULT false,
  is_free boolean,
  verified boolean NOT NULL DEFAULT false,

  accessibility_features jsonb NOT NULL DEFAULT '{}'::jsonb,
  amenities jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Optional cached/summary fields (some UI paths set these on insert)
  avg_rating double precision,
  review_count integer,
  overall_rating integer,
  cleanliness_rating integer,
  stocked_rating integer,
  availability_rating integer,
  rating_comment text,

  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.users (
  -- Profile table keyed by auth user id
  id uuid PRIMARY KEY,
  -- Core identity / profile fields used by the web app
  email text,
  display_name text,
  bio text,
  username text,
  full_name text,
  avatar_url text,

  -- Gamification / stats (web app writes these on profile creation)
  level integer NOT NULL DEFAULT 1,
  points integer NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  restrooms_added integer NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- If the table already existed from a partial run, ensure required columns exist.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reviews_count integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS restrooms_added integer;

-- Backfill defaults if columns were added by ALTER TABLE above
ALTER TABLE public.users ALTER COLUMN level SET DEFAULT 1;
ALTER TABLE public.users ALTER COLUMN points SET DEFAULT 0;
ALTER TABLE public.users ALTER COLUMN reviews_count SET DEFAULT 0;
ALTER TABLE public.users ALTER COLUMN restrooms_added SET DEFAULT 0;

-- Keep FK creation separate so repeated runs won't fail on duplicate constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_id_fkey_auth'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_fkey_auth
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restroom_id uuid NOT NULL,
  user_id uuid,

  -- Ratings (keep multiple column spellings for backwards/forwards compatibility)
  rating integer,
  cleanliness_rating integer,
  cleanliness integer,
  stocked_rating integer,
  stock_rating integer,

  amenities jsonb,
  wait_time integer,

  comment text,
  review_text text,
  photos text[] NOT NULL DEFAULT '{}'::text[],
  gender text,
  is_report boolean NOT NULL DEFAULT false,

  availability_status text NOT NULL DEFAULT 'available',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_restroom_id_fkey'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_restroom_id_fkey
      FOREIGN KEY (restroom_id) REFERENCES public.restrooms(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_user_id_fkey'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Availability status constraint (repo migration expects this)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'availability_status_check'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT availability_status_check
      CHECK (availability_status IN ('available', 'busy', 'closed'));
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- PostGIS: keep restrooms.location in sync with lat/lon
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_restroom_location()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.lat IS NULL OR NEW.lon IS NULL THEN
    NEW.location := NULL;
  ELSE
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.lon, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_restroom_location ON public.restrooms;
CREATE TRIGGER trg_set_restroom_location
BEFORE INSERT OR UPDATE OF lat, lon
ON public.restrooms
FOR EACH ROW
EXECUTE FUNCTION public.set_restroom_location();

-- -----------------------------------------------------------------------------
-- Convenience triggers: keep duplicate rating column names in sync
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_review_rating_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- cleanliness vs cleanliness_rating
  IF NEW.cleanliness IS NULL AND NEW.cleanliness_rating IS NOT NULL THEN
    NEW.cleanliness := NEW.cleanliness_rating;
  ELSIF NEW.cleanliness_rating IS NULL AND NEW.cleanliness IS NOT NULL THEN
    NEW.cleanliness_rating := NEW.cleanliness;
  END IF;

  -- stocked_rating vs stock_rating
  IF NEW.stock_rating IS NULL AND NEW.stocked_rating IS NOT NULL THEN
    NEW.stock_rating := NEW.stocked_rating;
  ELSIF NEW.stocked_rating IS NULL AND NEW.stock_rating IS NOT NULL THEN
    NEW.stocked_rating := NEW.stock_rating;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_review_rating_columns ON public.reviews;
CREATE TRIGGER trg_sync_review_rating_columns
BEFORE INSERT OR UPDATE
ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.sync_review_rating_columns();

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_restrooms_lat ON public.restrooms(lat);
CREATE INDEX IF NOT EXISTS idx_restrooms_lon ON public.restrooms(lon);
CREATE INDEX IF NOT EXISTS idx_restrooms_location_gist ON public.restrooms USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_reviews_restroom_id ON public.reviews(restroom_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_availability_status ON public.reviews(availability_status);

-- -----------------------------------------------------------------------------
-- RPCs
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.find_nearby_restrooms(
  user_lat double precision,
  user_lon double precision,
  radius_meters double precision DEFAULT 5000
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  address text,
  lat double precision,
  lon double precision,
  lng double precision,
  wheelchair_accessible boolean,
  baby_changing boolean,
  gender_neutral boolean,
  google_place_id text,
  created_at timestamptz,
  updated_at timestamptz,
  distance_meters double precision,
  avg_rating double precision,
  review_count integer
)
LANGUAGE sql
STABLE
AS $$
  WITH params AS (
    SELECT ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography AS p
  ), base AS (
    SELECT
      r.id,
      r.name,
      r.description,
      r.address,
      r.lat,
      r.lon,
      r.lon AS lng,
      r.wheelchair_accessible,
      r.baby_changing,
      r.gender_neutral,
      r.google_place_id,
      r.created_at,
      r.updated_at,
      ST_Distance(r.location, (SELECT p FROM params)) AS distance_meters
    FROM public.restrooms r
    WHERE r.location IS NOT NULL
      AND ST_DWithin(r.location, (SELECT p FROM params), radius_meters)
  )
  SELECT
    b.*,
    COALESCE(AVG(rv.rating)::double precision, 0) AS avg_rating,
    COUNT(rv.id)::int AS review_count
  FROM base b
  LEFT JOIN public.reviews rv ON rv.restroom_id = b.id
  GROUP BY
    b.id, b.name, b.description, b.address, b.lat, b.lon, b.lng,
    b.wheelchair_accessible, b.baby_changing, b.gender_neutral,
    b.google_place_id, b.created_at, b.updated_at, b.distance_meters
  ORDER BY b.distance_meters ASC
  LIMIT 500;
$$;

CREATE OR REPLACE FUNCTION public.search_restrooms(
  search_query text,
  user_lat double precision,
  user_lon double precision,
  radius_meters double precision DEFAULT 10000
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  address text,
  lat double precision,
  lon double precision,
  lng double precision,
  wheelchair_accessible boolean,
  baby_changing boolean,
  gender_neutral boolean,
  google_place_id text,
  created_at timestamptz,
  updated_at timestamptz,
  distance_meters double precision,
  avg_rating double precision,
  review_count integer
)
LANGUAGE sql
STABLE
AS $$
  WITH params AS (
    SELECT
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography AS p,
      NULLIF(TRIM(search_query), '') AS q
  ), base AS (
    SELECT
      r.id,
      r.name,
      r.description,
      r.address,
      r.lat,
      r.lon,
      r.lon AS lng,
      r.wheelchair_accessible,
      r.baby_changing,
      r.gender_neutral,
      r.google_place_id,
      r.created_at,
      r.updated_at,
      ST_Distance(r.location, (SELECT p FROM params)) AS distance_meters
    FROM public.restrooms r
    WHERE r.location IS NOT NULL
      AND ST_DWithin(r.location, (SELECT p FROM params), radius_meters)
      AND (
        (SELECT q FROM params) IS NULL
        OR r.name ILIKE '%' || (SELECT q FROM params) || '%'
        OR COALESCE(r.address, '') ILIKE '%' || (SELECT q FROM params) || '%'
        OR COALESCE(r.description, '') ILIKE '%' || (SELECT q FROM params) || '%'
      )
  )
  SELECT
    b.*,
    COALESCE(AVG(rv.rating)::double precision, 0) AS avg_rating,
    COUNT(rv.id)::int AS review_count
  FROM base b
  LEFT JOIN public.reviews rv ON rv.restroom_id = b.id
  GROUP BY
    b.id, b.name, b.description, b.address, b.lat, b.lon, b.lng,
    b.wheelchair_accessible, b.baby_changing, b.gender_neutral,
    b.google_place_id, b.created_at, b.updated_at, b.distance_meters
  ORDER BY b.distance_meters ASC
  LIMIT 500;
$$;

CREATE OR REPLACE FUNCTION public.get_restrooms_in_bounds(
  north_lat double precision,
  south_lat double precision,
  east_lon double precision,
  west_lon double precision
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  address text,
  lat double precision,
  lon double precision,
  wheelchair_accessible boolean,
  baby_changing boolean,
  gender_neutral boolean,
  google_place_id text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    r.id,
    r.name,
    r.description,
    r.address,
    r.lat,
    r.lon,
    r.wheelchair_accessible,
    r.baby_changing,
    r.gender_neutral,
    r.google_place_id,
    r.created_at,
    r.updated_at
  FROM public.restrooms r
  WHERE r.lat BETWEEN south_lat AND north_lat
    AND r.lon BETWEEN west_lon AND east_lon
  ORDER BY r.created_at DESC
  LIMIT 2000;
$$;

CREATE OR REPLACE FUNCTION public.find_closest_restrooms(
  lat double precision,
  lon double precision,
  limit_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  address text,
  lat double precision,
  lon double precision,
  distance_meters double precision
)
LANGUAGE sql
STABLE
AS $$
  WITH p AS (
    SELECT ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography AS pt
  )
  SELECT
    r.id,
    r.name,
    r.description,
    r.address,
    r.lat,
    r.lon,
    ST_Distance(r.location, (SELECT pt FROM p)) AS distance_meters
  FROM public.restrooms r
  WHERE r.location IS NOT NULL
  ORDER BY r.location <-> (SELECT pt FROM p)
  LIMIT GREATEST(1, LEAST(limit_count, 100));
$$;

-- -----------------------------------------------------------------------------
-- RLS + policies
-- -----------------------------------------------------------------------------

ALTER TABLE public.restrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Restrooms
DROP POLICY IF EXISTS restrooms_public_read ON public.restrooms;
CREATE POLICY restrooms_public_read
ON public.restrooms
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS restrooms_open_insert ON public.restrooms;
CREATE POLICY restrooms_open_insert
ON public.restrooms
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS restrooms_auth_update ON public.restrooms;
CREATE POLICY restrooms_auth_update
ON public.restrooms
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Reviews
DROP POLICY IF EXISTS reviews_public_read ON public.reviews;
CREATE POLICY reviews_public_read
ON public.reviews
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS reviews_open_insert ON public.reviews;
CREATE POLICY reviews_open_insert
ON public.reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS reviews_auth_update ON public.reviews;
CREATE POLICY reviews_auth_update
ON public.reviews
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Users/profile
DROP POLICY IF EXISTS users_public_read ON public.users;
CREATE POLICY users_public_read
ON public.users
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS users_self_insert ON public.users;
CREATE POLICY users_self_insert
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS users_self_update ON public.users;
CREATE POLICY users_self_update
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Auth -> public.users auto-profile (optional but recommended)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    bio,
    username,
    full_name,
    avatar_url,
    level,
    points,
    reviews_count,
    restrooms_added,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(split_part(NEW.email, '@', 1), ''),
      'User'
    ),
    NULLIF(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      NULLIF(split_part(NEW.email, '@', 1), ''),
      'user'
    ),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    1,
    0,
    0,
    0,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- Grants (RLS still applies)
-- ----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE public.restrooms TO anon, authenticated;
GRANT INSERT ON TABLE public.restrooms TO anon, authenticated;
GRANT UPDATE ON TABLE public.restrooms TO authenticated;

GRANT SELECT ON TABLE public.reviews TO anon, authenticated;
GRANT INSERT ON TABLE public.reviews TO anon, authenticated;
GRANT UPDATE ON TABLE public.reviews TO authenticated;

GRANT SELECT ON TABLE public.users TO anon, authenticated;
GRANT INSERT ON TABLE public.users TO authenticated;
GRANT UPDATE ON TABLE public.users TO authenticated;

GRANT EXECUTE ON FUNCTION public.find_nearby_restrooms(double precision, double precision, double precision) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_restrooms(text, double precision, double precision, double precision) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_restrooms_in_bounds(double precision, double precision, double precision, double precision) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_closest_restrooms(double precision, double precision, integer) TO anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Storage buckets + policies
-- -----------------------------------------------------------------------------

-- Buckets (PUBLIC)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('review-photos','review-photos',true),
  ('user-avatars','user-avatars',true),
  ('restroom-photos','restroom-photos',true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public;

-- review-photos (public read + anon/auth write) - matches repo behavior
DROP POLICY IF EXISTS "public_select_review_photos" ON storage.objects;
DROP POLICY IF EXISTS "anon_insert_review_photos" ON storage.objects;
DROP POLICY IF EXISTS "anon_update_review_photos" ON storage.objects;

CREATE POLICY "public_select_review_photos"
ON storage.objects FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'review-photos');

CREATE POLICY "anon_insert_review_photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'review-photos');

CREATE POLICY "anon_update_review_photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'review-photos')
WITH CHECK (bucket_id = 'review-photos');

-- user-avatars + restroom-photos (public read + authenticated write)
DROP POLICY IF EXISTS "public_select_user_media" ON storage.objects;
DROP POLICY IF EXISTS "auth_insert_user_media" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_user_media" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_user_media" ON storage.objects;

CREATE POLICY "public_select_user_media"
ON storage.objects FOR SELECT
TO anon, authenticated, public
USING (bucket_id IN ('user-avatars','restroom-photos'));

CREATE POLICY "auth_insert_user_media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('user-avatars','restroom-photos'));

CREATE POLICY "auth_update_user_media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('user-avatars','restroom-photos'))
WITH CHECK (bucket_id IN ('user-avatars','restroom-photos'));

CREATE POLICY "auth_delete_user_media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('user-avatars','restroom-photos'));

COMMIT;
