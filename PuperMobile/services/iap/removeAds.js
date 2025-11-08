import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as RNIap from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import productConfig from '../../in-app-purchases/remove-ads.json';

const PRODUCT_ID = productConfig?.productId || 'com.sidewayz8.puper.remove_ads';
const STORAGE_KEY = '@puper/removeAdsPurchased';

const RemoveAdsContext = createContext({
  ready: false,
  removeAds: false,
  purchasing: false,
  restoring: false,
  error: null,
  buyRemoveAds: async () => {},
  restorePurchases: async () => {},
  clearLocalEntitlement: async () => {},
});

export const RemoveAdsProvider = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [removeAds, setRemoveAds] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);

  const purchaseUpdateSubRef = useRef(null);
  const purchaseErrorSubRef = useRef(null);

  // Load cached entitlement immediately to avoid flicker
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached === '1') setRemoveAds(true);
      } catch {}
    })();
  }, []);

  const checkEntitlementFromStore = useCallback(async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      const owned = purchases?.find?.((p) => p.productId === PRODUCT_ID);
      if (owned) {
        setRemoveAds(true);
        await AsyncStorage.setItem(STORAGE_KEY, '1');
        return true;
      }
      // Not owned according to store: ensure local cache is cleared
      setRemoveAds(false);
      try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
      return false;
    } catch (e) {
      // Swallow errors; user might be offline
      return removeAds; // fall back to cached state
    }
  }, [removeAds]);

  useEffect(() => {
    let ended = false;
    (async () => {
      try {
        setError(null);
        await RNIap.initConnection();
        if (Platform.OS === 'android' && RNIap.flushFailedPurchasesCachedAsPendingAndroid) {
          try { await RNIap.flushFailedPurchasesCachedAsPendingAndroid(); } catch {}
        }
        // Prefetch product metadata (optional)
        try { await RNIap.getProducts({ skus: [PRODUCT_ID] }); } catch {}

        // Subscribe to purchase updates
        purchaseUpdateSubRef.current = RNIap.purchaseUpdatedListener(async (purchase) => {
          try {
            if (purchase?.productId === PRODUCT_ID && purchase?.transactionReceipt) {
              await RNIap.finishTransaction({ purchase, isConsumable: false });
              setRemoveAds(true);
              await AsyncStorage.setItem(STORAGE_KEY, '1');
            }
          } catch (finishErr) {
            // Ignore finish errors; will re-verify via restore path
          }
        });
        purchaseErrorSubRef.current = RNIap.purchaseErrorListener((err) => {
          setError(err?.message || String(err));
          setPurchasing(false);
        });

        // Optionally verify entitlement on launch (default off for testing)
        const autoRestore = Constants?.expoConfig?.extra?.iap?.autoRestoreOnLaunch ?? false;
        if (autoRestore) {
          await checkEntitlementFromStore();
        }
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        if (!ended) setReady(true);
      }
    })();

    return () => {
      ended = true;
      try { purchaseUpdateSubRef.current?.remove?.(); } catch {}
      try { purchaseErrorSubRef.current?.remove?.(); } catch {}
      try { RNIap.endConnection(); } catch {}
    };
  }, [checkEntitlementFromStore]);

  const buyRemoveAds = useCallback(async () => {
    setPurchasing(true);
    setError(null);
    try {
      // API variants exist across versions; this form works on modern RNIap
      await RNIap.requestPurchase({ sku: PRODUCT_ID });
      // Post-purchase, purchaseUpdatedListener will set entitlement
      // As a fallback, re-check entitlement after a short delay
      setTimeout(checkEntitlementFromStore, 1500);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setPurchasing(false);
    }
  }, [checkEntitlementFromStore]);

  const restorePurchases = useCallback(async () => {
    setRestoring(true);
    setError(null);
    try {
      const ok = await checkEntitlementFromStore();
      return ok;
    } catch (e) {
      setError(e?.message || String(e));
      return false;
    } finally {
      setRestoring(false);
    }
  }, [checkEntitlementFromStore]);

  const clearLocalEntitlement = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
    setRemoveAds(false);
    return true;
  }, []);

  const value = useMemo(() => ({
    ready,
    removeAds,
    purchasing,
    restoring,
    error,
    buyRemoveAds,
    restorePurchases,
    clearLocalEntitlement,
  }), [ready, removeAds, purchasing, restoring, error, buyRemoveAds, restorePurchases, clearLocalEntitlement]);

  return (
    <RemoveAdsContext.Provider value={value}>
      {children}
    </RemoveAdsContext.Provider>
  );
};

export const useRemoveAds = () => useContext(RemoveAdsContext);
