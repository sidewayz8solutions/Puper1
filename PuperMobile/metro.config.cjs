// Metro configuration: ensure .mov/.MOV are treated as assets.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude supabase/functions from Metro bundler (they contain TypeScript for Deno edge functions)
config.resolver.blockList = [
  /supabase\/functions\/.*/,
];

const assetExts = (config.resolver && config.resolver.assetExts) ? config.resolver.assetExts : [];
if (!assetExts.includes('mov')) assetExts.push('mov');
if (!assetExts.includes('MOV')) assetExts.push('MOV');
config.resolver.assetExts = assetExts;

module.exports = config;
