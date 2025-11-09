// Extend Metro to treat .mov/.MOV as assets (ESM because package.json has "type": "module")
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver = config.resolver || {};
config.resolver.assetExts = Array.from(new Set([...(config.resolver.assetExts || []), 'mov', 'MOV']));
module.exports = config;
