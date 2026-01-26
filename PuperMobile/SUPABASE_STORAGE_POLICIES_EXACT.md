# Exact Supabase Storage Policies for review-photos

## Prerequisites
- Bucket `review-photos` already created and set to PUBLIC

## Step-by-Step Policy Setup

### POLICY 1: Allow Authenticated Users to Upload Photos

**Go to**: Supabase Dashboard → Storage → review-photos → Policies → New Policy

**Select**: "For INSERT"

**Policy Name**: `Allow authenticated users to upload photos`

**Paste this SQL exactly**:
```
(bucket_id = 'review-photos'::text) AND (auth.role() = 'authenticated'::text)
```

**Click**: Review → Save policy

---

### POLICY 2: Allow Public Read Access to Photos

**Go to**: Supabase Dashboard → Storage → review-photos → Policies → New Policy

**Select**: "For SELECT"

**Policy Name**: `Allow public read access to photos`

**Paste this SQL exactly**:
```
(bucket_id = 'review-photos'::text)
```

**Click**: Review → Save policy

---

## What These Policies Do

### Policy 1 (INSERT)
- **Who**: Only authenticated users (logged in)
- **What**: Can upload files
- **Where**: Only to review-photos bucket
- **SQL means**:
  - bucket_id = 'review-photos' → Only this bucket
  - auth.role() = 'authenticated' → Only logged-in users

### Policy 2 (SELECT)
- **Who**: Anyone (public, no login needed)
- **What**: Can read/download files
- **Where**: Only from review-photos bucket
- **SQL means**:
  - bucket_id = 'review-photos' → Only this bucket
  - No role check = anyone can read

## Verification

After creating both policies:

1. Go to Storage → review-photos → Policies tab
2. You should see 2 policies:
   - Allow authenticated users to upload photos (INSERT)
   - Allow public read access to photos (SELECT)

3. Test in app: Try uploading a photo

## If Photos Still Don't Upload

Check in order:
1. Bucket is PUBLIC: Storage → review-photos → Settings
2. Both policies exist: Storage → review-photos → Policies
3. Policy SQL is exact: Copy-paste above exactly
4. Bucket name is review-photos (lowercase, hyphen)

Done! Photos should upload now.

