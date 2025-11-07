// CommonJS bridge so native build scripts (ios_config.sh) can require this and read app.json
module.exports = require('./app.json');
import fs from 'fs';

// Prefer pup.jpg, then puperl.jpg, then icon.png
let iconPath = './assets/icon.png';
if (fs.existsSync('./assets/pup.jpg')) {
  iconPath = './assets/pup.jpg';
} else if (fs.existsSync('./assets/puperl.jpg')) {
  iconPath = './assets/puperl.jpg';
}

export default {
  expo: {
    name: "Püper - Find Your Roll",
    slug: "puper-mobile",
  version: "1.0.7",
    orientation: "portrait",
    icon: iconPath,
    userInterfaceStyle: "light",
    newArchEnabled: true,
    description: "Your guide to relief - Find clean, accessible public restrooms wherever you are",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#6B4423"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sidewayz8.puper",
  buildNumber: "9",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Püper needs your location to find nearby restrooms.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Püper needs your location to find nearby restrooms.",
        NSCameraUsageDescription: "Püper needs camera access to take photos of restrooms.",
        NSPhotoLibraryUsageDescription: "Püper needs photo library access to add photos to your reviews.",
        ITSAppUsesNonExemptEncryption: false,
        NSUserTrackingUsageDescription: "This identifier will be used to deliver ads that help support the app.",
        GADApplicationIdentifier: "ca-app-pub-3940256099942544~1458002511",
        SKAdNetworkItems: [{ SKAdNetworkIdentifier: "cstr6suwn9.skadnetwork" }]
      },
      config: {
        googleMapsApiKey: "AIzaSyD5l5VGgUMgtp_MnI6Ztd1SwqQsGp9mZ0w",
        usesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#6B4423"
      },
      package: "com.sidewayz8.puper",
      versionCode: 1,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      config: {
        googleMaps: {
          apiKey: "AIzaSyD5l5VGgUMgtp_MnI6Ztd1SwqQsGp9mZ0w"
        }
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow Püper to use your location to find nearby restrooms."
        }
      ],
      "expo-video"
    ],
    extra: {
      supabaseUrl: "https://qunaiicjcelvdunluwqh.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bmFpaWNqY2VsdmR1bmx1d3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjA4NjEsImV4cCI6MjA2OTMzNjg2MX0.rFXwY95lvcXZEds7f16KodwhfnGHQBp7GsV4WTFQHjI",
      googleMapsApiKey: "AIzaSyD5l5VGgUMgtp_MnI6Ztd1SwqQsGp9mZ0w",
      eas: {
        projectId: "af6f90c0-22b0-4a09-8116-2388a353c764"
      }
    }
  }
,
  'react-native-google-mobile-ads': {
    ios_app_id: 'ca-app-pub-3940256099942544~1458002511',
    user_tracking_usage_description: 'This identifier will be used to deliver ads that help support the app.',
    sk_ad_network_items: ['cstr6suwn9.skadnetwork']
  }
};