-- Puper - Supabase target post-migration steps
-- Target project ref: pbyqkxhqrahjqjvnorwn
-- Source project ref: qunaiicjcelvdunluwqh
--
-- Run this AFTER you restore your DB dumps into the NEW Supabase project.

BEGIN;

-- Storage buckets (create + set public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos','review-photos',true),('user-avatars','user-avatars',true),('restroom-photos','restroom-photos',true)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, public=EXCLUDED.public;

-- -----------------------------------------------------------------------------
-- Storage policies
-- NOTE: These are intentionally simple: public read; uploads only by authenticated
-- For review-photos we keep anon+authenticated upload behavior (matching repo).
-- -----------------------------------------------------------------------------

-- review-photos (public read + anon/auth write)
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

-- -----------------------------------------------------------------------------
-- Rewrite stored public URLs to the NEW project domain
-- -----------------------------------------------------------------------------

-- If you get 42P01 here, it means you DID NOT restore your app tables into this target project.
-- Your app expects these tables to exist in the `public` schema (e.g. `public.reviews`, `public.users`).
DO $$ BEGIN
  IF to_regclass('public.reviews') IS NULL THEN
    RAISE EXCEPTION 'Missing public.reviews. Restore your app schema/data first, then re-run this script.';
  END IF;
END $$;

-- reviews.photos (TEXT[]) - replaces old project ref in each array element
UPDATE public.reviews
SET photos = (
  SELECT array_agg(
    replace(p,'https://qunaiicjcelvdunluwqh.supabase.co','https://pbyqkxhqrahjqjvnorwn.supabase.co')
    ORDER BY ord
  )
  FROM unnest(photos) WITH ORDINALITY AS u(p, ord)
)
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0;

-- users.avatar_url (TEXT) - if you have a public.users profile table
DO $$ BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    UPDATE public.users
    SET avatar_url = replace(avatar_url,'https://qunaiicjcelvdunluwqh.supabase.co','https://pbyqkxhqrahjqjvnorwn.supabase.co')
    WHERE avatar_url LIKE 'https://qunaiicjcelvdunluwqh.supabase.co%';
  ELSE
    RAISE NOTICE 'Skipping avatar_url rewrite: public.users does not exist in this DB.';
  END IF;
END $$;

COMMIT;

