import fs from 'fs';
const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const c = appJson.expo || {};
const adsTopLevel = appJson['react-native-google-mobile-ads'] || {};
console.log(JSON.stringify({
  version: c.version,
  build: c.ios?.buildNumber,
  GAD: c.ios?.infoPlist?.GADApplicationIdentifier,
  hasATT: !!c.ios?.infoPlist?.NSUserTrackingUsageDescription,
  hasGoogleMapsKey: !!c.ios?.config?.googleMapsApiKey,
  adsRoot: adsTopLevel,
  hasIosAppId: !!adsTopLevel?.ios_app_id,
  bannerUnitIdIos: c.extra?.admob?.bannerUnitIdIos,
  interstitialUnitIdIos: c.extra?.admob?.interstitialUnitIdIos,
  plugins: c.plugins
}, null, 2));
