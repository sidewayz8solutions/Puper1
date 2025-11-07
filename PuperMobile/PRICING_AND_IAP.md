# Pricing and In‑App Purchase Plan

Goal: $2.99 paid app (with ads) and a one‑time $9.99 in‑app purchase to permanently remove ads.

## 1) App Store pricing ($2.99)

Set this in App Store Connect:

- App Store Connect → Your App → Pricing and Availability → Edit price → choose U.S. price tier that corresponds to $2.99.
- Save and submit changes for the new version.

Notes:

- App price is managed entirely in App Store Connect; no code changes are needed to charge $2.99 for the download.

## 2) Create the "Remove Ads" IAP ($9.99)

Create a non‑consumable IAP in App Store Connect:

- App Store Connect → Your App → In‑App Purchases → + → Non‑Consumable
- Reference Name: Remove Ads (Lifetime)
- Product ID (example): `remove_ads_lifetime`
- Price: $9.99
- Review Information: upload screenshots if requested by review
- Add English (U.S.) display name and description
- Submit for review (can be reviewed with your next binary)

## 3) Wire up in the app (when ready)

We’ll use `expo-in-app-purchases` so it works with Expo and EAS without extra native plugins.

Data flow:

- Fetch products → show "Remove ads" option if not purchased
- On purchase success → hide ads immediately and persist a flag
- Add “Restore Purchases” to re‑enable on fresh installs

Minimal code sketch (to integrate later):

```js
import * as InAppPurchases from 'expo-in-app-purchases';
import * as SecureStore from 'expo-secure-store';

const PRODUCT_IDS = ['remove_ads_lifetime'];

async function initIAP(setAdsDisabled) {
  await InAppPurchases.connectAsync();
  const { responseCode, results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    // render results[0] in UI
  }
  InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      for (const purchase of results) {
        if (purchase.acknowledged === false) {
          // Unlock
          await SecureStore.setItemAsync('adsDisabled', 'true');
          setAdsDisabled(true);
          await InAppPurchases.finishTransactionAsync(purchase, true);
        }
      }
    }
  });
}

export async function restorePurchases(setAdsDisabled) {
  const { results } = await InAppPurchases.getPurchaseHistoryAsync(false);
  const owned = results?.some(p => PRODUCT_IDS.includes(p.productId));
  if (owned) {
    await SecureStore.setItemAsync('adsDisabled', 'true');
    setAdsDisabled(true);
  }
}
```

UI hooks:

- Show a “Remove Ads – $9.99” button if ads are currently shown
- Show a “Restore Purchases” button (required by Apple)

Persistence:

- Read `adsDisabled` from `expo-secure-store` on startup to decide whether to render banner ads.

## 4) AdMob configuration reminder

- iOS Info.plist contains the AdMob App ID (currently test ID). Replace with your real AdMob App ID when you’re ready.
- Keep `app-ads.txt` hosted. We’ve added `app-ads.txt` with your publisher id in both `PuperMobile/` and repo root for hosting.

## 5) Release checklist

- [ ] Update real AdMob App ID in `app.json`
- [ ] Create the IAP in App Store Connect and submit it
- [ ] Implement the code above and add UI buttons (Remove / Restore)
- [ ] Submit a new build with marketing text describing the Remove Ads purchase
