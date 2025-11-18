import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as RNIap from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import productConfig from '../../in-app-purchases/remove-ads.json';
import { verifyIosReceiptWithSupabase, verifyAndroidReceiptWithSupabase } from '../../supabase/supabase';

const PRODUCT_ID = productConfig.productId;
const STORAGE_KEY = '@puper/removeAdsPurchased';

const extractAndroidPurchaseToken = (purchase) => {
  if (!purchase) return null;
  if (purchase.purchaseToken) return purchase.purchaseToken;
  if (purchase.token) return purchase.token;
  if (purchase.transactionReceipt) {
    try {
      const parsed = JSON.parse(purchase.transactionReceipt);
      return parsed?.purchaseToken || parsed?.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

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
  const [productReady, setProductReady] = useState(false);
  const productCacheRef = useRef([]);

  // Validate receipt with Apple / Google and sync entitlement
  const syncEntitlementWithBackend = useCallback(
    async (purchase) => {
      if (!purchase) return;
      try {
        if (Platform.OS === 'ios' && purchase.transactionReceipt) {
          const result = await verifyIosReceiptWithSupabase(purchase.transactionReceipt, null);
          if (result?.valid && result?.hasRemoveAds) {
            setRemoveAds(true);
            await AsyncStorage.setItem(STORAGE_KEY, '1');
          }
        } else if (Platform.OS === 'android') {
          const token = extractAndroidPurchaseToken(purchase);
          if (!token) return;
          const pkg = Constants?.expoConfig?.android?.package;
          const result = await verifyAndroidReceiptWithSupabase(token, purchase.productId || PRODUCT_ID, pkg);
          if (result?.valid) {
            setRemoveAds(true);
            await AsyncStorage.setItem(STORAGE_KEY, '1');
          }
        }
      } catch (e) {
        console.warn('[IAP] syncEntitlementWithBackend failed', e);
      }
    },
    []
  );

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
        
        // Validate receipt with Apple for compliance using receipt from restored purchase
        try {
          await syncEntitlementWithBackend(owned);
        } catch (err) {
          console.warn('[IAP] Receipt validation failed (non-fatal)', err);
        }
        
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
  }, [removeAds, syncEntitlementWithBackend]);

  useEffect(() => {
    let ended = false;
    (async () => {
      try {
        setError(null);
        await RNIap.initConnection();
        if (Platform.OS === 'android' && RNIap.flushFailedPurchasesCachedAsPendingAndroid) {
          try { await RNIap.flushFailedPurchasesCachedAsPendingAndroid(); } catch {}
        }
        // Prefetch product metadata (required on iOS or StoreKit throws "Missing purchase request configuration")
        let fetchedProducts = [];
        try {
          fetchedProducts = await RNIap.getProducts({ skus: [PRODUCT_ID] });
        } catch (e1) {
          try {
            fetchedProducts = await RNIap.getProducts([PRODUCT_ID]);
          } catch (e2) {
            console.warn('[IAP] getProducts failed', e1 || e2);
          }
        }
        if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
          productCacheRef.current = fetchedProducts;
          setProductReady(true);
        } else {
          setProductReady(false);
          setError('In-app purchase is temporarily unavailable. Please try again shortly.');
        }

        // Subscribe to purchase updates
        purchaseUpdateSubRef.current = RNIap.purchaseUpdatedListener(async (purchase) => {
          try {
            if (purchase?.productId === PRODUCT_ID) {
              await RNIap.finishTransaction({ purchase, isConsumable: false });
              setRemoveAds(true);
              await AsyncStorage.setItem(STORAGE_KEY, '1');
              
              try {
                await syncEntitlementWithBackend(purchase);
              } catch (err) {
                console.warn('[IAP] Receipt validation failed (non-fatal)', err);
              }
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
    if (!ready) {
      setError('Store not ready. Please try again in a moment.');
      return;
    }
    if (!productReady) {
      setError('Purchase configuration missing. Please pull to refresh and try again.');
      return;
    }
    setPurchasing(true);
    setError(null);
    try {
      const productSku =
        productCacheRef.current?.find?.((p) => p.productId === PRODUCT_ID)?.productId || PRODUCT_ID;
      // API variants exist across versions; try object form then fallback to legacy signature
      try {
        await RNIap.requestPurchase({
          sku: productSku,
          andDangerouslyFinishTransactionAutomatically: false,
        });
      } catch (e1) {
        try {
          await RNIap.requestPurchase(productSku);
        } catch (e2) {
          throw e2 || e1;
        }
      }
      // Post-purchase, purchaseUpdatedListener will set entitlement
      // As a fallback, re-check entitlement after a short delay
      setTimeout(checkEntitlementFromStore, 1500);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setPurchasing(false);
    }
  }, [ready, checkEntitlementFromStore]);

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
