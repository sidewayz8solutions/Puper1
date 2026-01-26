#!/usr/bin/env node

/**
 * Copy Supabase Storage objects from one project to another.
 *
 * Usage (from PuperMobile/):
 *   SOURCE_SUPABASE_URL=... SOURCE_SERVICE_ROLE_KEY=... \
 *   TARGET_SUPABASE_URL=... TARGET_SERVICE_ROLE_KEY=... \
 *   BUCKETS=review-photos \
 *   node scripts/migrate-storage-between-supabase.js
 */

import { createClient } from '@supabase/supabase-js';

const sourceUrl = process.env.SOURCE_SUPABASE_URL;
const sourceKey = process.env.SOURCE_SERVICE_ROLE_KEY;
const targetUrl = process.env.TARGET_SUPABASE_URL;
const targetKey = process.env.TARGET_SERVICE_ROLE_KEY;

if (!sourceUrl || !sourceKey || !targetUrl || !targetKey) {
  console.error('Missing env vars: SOURCE_SUPABASE_URL, SOURCE_SERVICE_ROLE_KEY, TARGET_SUPABASE_URL, TARGET_SERVICE_ROLE_KEY');
  process.exit(1);
}

const buckets = (process.env.BUCKETS || 'review-photos').split(',').map(s => s.trim()).filter(Boolean);

const source = createClient(sourceUrl, sourceKey, { auth: { persistSession: false } });
const target = createClient(targetUrl, targetKey, { auth: { persistSession: false } });

const joinPath = (a, b) => (a ? `${a.replace(/\/$/, '')}/${b}` : b);

async function listAllObjects(bucket, path = '') {
  const out = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await source.storage.from(bucket).list(path, { limit, offset });
    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const item of data) {
      const full = joinPath(path, item.name);
      if (!item.id) {
        out.push(...await listAllObjects(bucket, full));
      } else {
        out.push(full);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return out;
}

async function copyObject(bucket, objectPath) {
  const { data: blob, error: dlError } = await source.storage.from(bucket).download(objectPath);
  if (dlError) throw dlError;

  const ab = await blob.arrayBuffer();
  const buf = Buffer.from(ab);
  const contentType = blob.type || 'application/octet-stream';

  const { error: upError } = await target.storage.from(bucket).upload(objectPath, buf, {
    upsert: true,
    contentType,
    cacheControl: '3600'
  });
  if (upError) throw upError;
}

(async () => {
  for (const bucket of buckets) {
    console.log(`\n==> Bucket: ${bucket}`);

    // best-effort create bucket on target (ok if it already exists)
    try {
      await target.storage.createBucket(bucket, { public: true });
    } catch (_) {}

    const objects = await listAllObjects(bucket, '');
    console.log(`Found ${objects.length} objects`);

    let i = 0;
    for (const p of objects) {
      i += 1;
      if (i % 25 === 0) console.log(`Copied ${i}/${objects.length}`);
      await copyObject(bucket, p);
    }

    console.log(`Done: ${bucket}`);
  }

  console.log('\nAll buckets copied.');
})().catch((e) => {
  console.error('Storage migration failed:', e?.message || e);
  process.exit(1);
});

