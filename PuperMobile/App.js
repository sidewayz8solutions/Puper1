import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';

import { Asset } from 'expo-asset';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import {
  useVideoPlayer,
  VideoView,
} from 'expo-video';
import { Video } from 'expo-av';
import { Animated } from 'react-native';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import mobileAds, { AppOpenAd, BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { useRemoveAds } from './services/iap/removeAds';
import Constants from 'expo-constants';

import {
  photoService,
  restroomService,
  supabase,
} from './services/supabase';

const { width, height } = Dimensions.get('window');

export default function App() {
  // Show custom splash.MOV on launch - always starts true on every app open
  const [showSplashVideo, setShowSplashVideo] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashVideoFinished = useRef(false);
  // Preload the splash video so it starts immediately
  const splashAssetRef = useRef(Asset.fromModule(require('./assets/splash3.mp4')));

  useEffect(() => {
    console.log('🎬 App mounted - splash video will play');
    (async () => {
      try {
        await splashAssetRef.current.downloadAsync();
        console.log('✅ Splash video asset preloaded');
      } catch (e) {
        console.log('⚠️ Splash video preload failed:', e);
      }
    })();
  }, []);



  // Fallback timeout: allow full 12s video; only hide if something is wrong (15s fallback)
  useEffect(() => {
    if (!showSplashVideo) return;
    const t = setTimeout(() => {
      if (!splashVideoFinished.current) {
        console.log('⏱️ Splash video timeout - forcing hide');
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }).start(() => setShowSplashVideo(false));
      }
    }, 15000);
    return () => clearTimeout(t);
  }, [showSplashVideo, splashOpacity]);
  // Main navigation state
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'map', or 'ranking'
  const mapRef = useRef(null);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const lastMapActivityRef = useRef(Date.now());
  const watchdogIntervalRef = useRef(null);
  const resumeCheckTimeoutRef = useRef(null);
  const reviewsSubRef = useRef(null);
  const restroomsSubRef = useRef(null);

  // Location and map state
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [region, setRegion] = useState({
    latitude: 29.9511, // Default to New Orleans like web app
    longitude: -90.0715,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Restroom data
  const [restrooms, setRestrooms] = useState([]);
  const [selectedRestroom, setSelectedRestroom] = useState(null);

  // UI State
  const [showMenu, setShowMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingModalTab, setRatingModalTab] = useState('form');

  const [showFilters, setShowFilters] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [addLocation, setAddLocation] = useState(null);

  const [showAdminCodeModal, setShowAdminCodeModal] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    wheelchair_accessible: false,
    baby_changing: false,
    gender_neutral: false
  });

  // Add restroom form
  const [newRestroom, setNewRestroom] = useState({
    name: '',
    description: '',
    wheelchair_accessible: false,
    baby_changing: false,
    gender_neutral: false
  });

  // Rating form
  const [newRating, setNewRating] = useState({
    rating: 5,
    cleanliness_rating: 5,
    stocked_rating: 5,
    review_text: '', // Changed from 'comment' to 'review_text' for clarity
    gender: 'unisex',
    availability_status: 'available' // 'available', 'busy', 'closed'
  });

  // Review photos (up to 3)
  // Reviews and photos data
  const [restroomReviews, setRestroomReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [photoViewer, setPhotoViewer] = useState({ visible: false, url: null });

  const [reviewPhotos, setReviewPhotos] = useState([]);

  const [stats, setStats] = useState({
    totalRestrooms: 0,
    averageRating: '0.0',
    accessibleCount: 0
  });
  const [adsInitialized, setAdsInitialized] = useState(false);
  const { removeAds, buyRemoveAds, restorePurchases, purchasing, restoring, grantLocalEntitlement } = useRemoveAds();
  // Interstitial ad state
  const interstitialRef = useRef(null);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const lastInterstitialTimeRef = useRef(0);
  const interstitialHistoryRef = useRef([]);
  // Policy‑friendly ad frequency: no forced double on launch, user-first shows,
  // and a conservative cadence (1 per 120s max) with UI gating.
  const INTERSTITIAL_WINDOW_MS = 30 * 1000; // 30s cadence window
  const INTERSTITIAL_MAX_PER_WINDOW = 1; // one per window
  const STARTUP_SECOND_AD_MIN_GAP_MS = 5 * 1000; // retained but unused in compliant mode
  const initialInterstitialCountRef = useRef(0);
  const waitingForSecondInitialInterstitialRef = useRef(false);
  const pendingAdRef = useRef(false); // when UI is busy, remember to show when free
  const launchTimeRef = useRef(Date.now());

  const recordAdImpression = useCallback(() => {
    const now = Date.now();
    interstitialHistoryRef.current = interstitialHistoryRef.current.filter(
      (timestamp) => now - timestamp < INTERSTITIAL_WINDOW_MS
    );
    interstitialHistoryRef.current.push(now);
  }, []);

  const canShowAnotherAd = useCallback(() => {
    const now = Date.now();
    interstitialHistoryRef.current = interstitialHistoryRef.current.filter(
      (timestamp) => now - timestamp < INTERSTITIAL_WINDOW_MS
    );
    return interstitialHistoryRef.current.length < INTERSTITIAL_MAX_PER_WINDOW;
  }, []);

  // App open ad management
  const appOpenUnitIdIos = Constants?.expoConfig?.extra?.admob?.appOpenUnitIdIos;
  const APP_OPEN_AD_UNIT_ID = Platform.select({
    ios: __DEV__ ? TestIds.APP_OPEN : (appOpenUnitIdIos || 'ca-app-pub-8579480495006676/9033300373'),
    android: TestIds.APP_OPEN,
    default: TestIds.APP_OPEN,
  });
  const APP_OPEN_AD_MAX_AGE_MS = 4 * 60 * 60 * 1000;
  const appOpenAdRef = useRef(null);
  const appOpenAdLoadTimeRef = useRef(null);
  const appOpenAdIsShowingRef = useRef(false);
  const appOpenAdRetryTimeoutRef = useRef(null);
  const appOpenLastShownRef = useRef(0);
  const appOpenAllowedRef = useRef(true);
  const showAppOpenAdIfAvailableRef = useRef(() => {});
  const initialAdSequencePendingRef = useRef(true);
  const waitingForInterstitialRef = useRef(false);
  const maybeShowInterstitialRef = useRef(() => false);
  // Track when the last fullscreen ad (interstitial or app-open) fully closed to enforce usable gap
  const lastAdClosedAtRef = useRef(0);

  const loadInterstitialForInitialSequence = useCallback(() => {
    if (!interstitialRef.current) {
      return;
    }
    try {
      interstitialRef.current.load();
    } catch (error) {
      console.warn('Failed to load interstitial for initial sequence', error?.message ?? error);
    }
  }, []);

  const loadAppOpenAd = useCallback(() => {
    if (!appOpenAllowedRef.current || !initialAdSequencePendingRef.current) {
      return;
    }
    if (!APP_OPEN_AD_UNIT_ID || appOpenAdRef.current) {
      return;
    }
    if (appOpenAdRetryTimeoutRef.current) {
      clearTimeout(appOpenAdRetryTimeoutRef.current);
      appOpenAdRetryTimeoutRef.current = null;
    }

    const ad = AppOpenAd.createForAdRequest(APP_OPEN_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      appOpenAdLoadTimeRef.current = Date.now();
      showAppOpenAdIfAvailableRef.current();
    });

    ad.addAdEventListener(AdEventType.OPENED, () => {
      appOpenAdIsShowingRef.current = true;
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      appOpenAdIsShowingRef.current = false;
      appOpenAdRef.current = null;
      appOpenAdLoadTimeRef.current = null;
      // Start 30s usability timer only after ad fully closes
      lastAdClosedAtRef.current = Date.now();
      appOpenLastShownRef.current = lastAdClosedAtRef.current;
      appOpenAllowedRef.current = false;
      // Do NOT chain an interstitial immediately; next scheduled interval will handle it
    });

    ad.addAdEventListener(AdEventType.ERROR, () => {
      appOpenAdIsShowingRef.current = false;
      appOpenAdRef.current = null;
      appOpenAdLoadTimeRef.current = null;
      if (appOpenAllowedRef.current) {
        appOpenAdRetryTimeoutRef.current = setTimeout(() => loadAppOpenAd(), 30000);
      }
      if (initialAdSequencePendingRef.current) {
        initialAdSequencePendingRef.current = false;
        waitingForInterstitialRef.current = false;
        setCurrentScreen('map');
      }
    });

    ad.load();
    appOpenAdRef.current = ad;
  }, [APP_OPEN_AD_UNIT_ID, loadInterstitialForInitialSequence]);

  const showAppOpenAdIfAvailable = useCallback(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    const ad = appOpenAdRef.current;
    if (!ad) {
      loadAppOpenAd();
      return;
    }

    if (!appOpenAllowedRef.current) {
      return;
    }

    if (!canShowAnotherAd()) {
      appOpenAllowedRef.current = false;
      return;
    }

    if (appOpenAdIsShowingRef.current) {
      return;
    }

    const loadedAt = appOpenAdLoadTimeRef.current;
    if (!loadedAt || Date.now() - loadedAt > APP_OPEN_AD_MAX_AGE_MS) {
      appOpenAdRef.current = null;
      appOpenAdLoadTimeRef.current = null;
      loadAppOpenAd();
      return;
    }

    try {
      ad.show();
    } catch (error) {
      console.warn('App open ad show failed', error?.message ?? error);
      appOpenAdIsShowingRef.current = false;
      appOpenAdRef.current = null;
      appOpenAdLoadTimeRef.current = null;
      loadAppOpenAd();
    }
  }, [loadAppOpenAd, canShowAnotherAd, recordAdImpression]);

  useEffect(() => {
    showAppOpenAdIfAvailableRef.current = showAppOpenAdIfAvailable;
  }, [showAppOpenAdIfAvailable]);

  // Load location and fetch nearby restrooms
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        // Load some initial seeded data even without location
        await loadInitialSeededData();
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);

      // Fetch nearby restrooms from Supabase
      await fetchNearbyRestrooms(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  // Initialize ads SDK once
  useEffect(() => {
    if (removeAds) return; // Skip ads init if user purchased removal
    let initializationTimeout;
    mobileAds()
      .initialize()
      .then(() => {
        if (removeAds) return; // double-check after async
        setAdsInitialized(true);
        loadAppOpenAd();
        initializationTimeout = setTimeout(() => {
          showAppOpenAdIfAvailable();
          if (Platform.OS !== 'ios') {
            waitingForInterstitialRef.current = true;
            if (maybeShowInterstitialRef.current) {
              const shown = maybeShowInterstitialRef.current({ force: true });
              if (shown) {
                waitingForInterstitialRef.current = false;
              }
            }
          }
        }, 1500);
      })
      .catch(err => console.warn('Ads initialization failed', err));
    return () => {
      if (initializationTimeout) clearTimeout(initializationTimeout);
    };
  }, [loadAppOpenAd, showAppOpenAdIfAvailable, removeAds]);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        // Re-mount the MapView to avoid blank map issues after returning from ads/external apps
        setMapRenderKey((k) => k + 1);
        // Give React a tick to mount before attempting any map interaction
        setTimeout(() => {
          try {
            if (mapRef.current && region) {
              // Nudge the map to re-render its tiles
              mapRef.current.animateToRegion(region, 0);
            }
          } catch (e) {
            console.warn('Map animateToRegion after resume failed', e?.message ?? e);
          }
        }, 50);
        // One-shot fallback: if map not ready or no activity within short window, force another remount
        if (resumeCheckTimeoutRef.current) {
          clearTimeout(resumeCheckTimeoutRef.current);
        }
        resumeCheckTimeoutRef.current = setTimeout(() => {
          const sinceActivity = Date.now() - lastMapActivityRef.current;
          if (currentScreen === 'map' && (!mapReady || sinceActivity > 15000)) {
            console.warn('Watchdog: forcing secondary map remount after resume');
            setMapRenderKey((k) => k + 1);
            try {
              if (mapRef.current && region) {
                mapRef.current.animateToRegion(region, 0);
              }
            } catch (e) {
              console.warn('Map animateToRegion in resume watchdog failed', e?.message ?? e);
            }
          }
        }, 3000);
        showAppOpenAdIfAvailable();
      }
    });

    return () => {
      subscription.remove();
      if (appOpenAdRetryTimeoutRef.current) {
        clearTimeout(appOpenAdRetryTimeoutRef.current);
        appOpenAdRetryTimeoutRef.current = null;
      }
      if (resumeCheckTimeoutRef.current) {
        clearTimeout(resumeCheckTimeoutRef.current);
        resumeCheckTimeoutRef.current = null;
      }
    };
  }, [showAppOpenAdIfAvailable]);

  // Prefer real AdMob unit IDs from app config (extra.admob.bannerUnitIdIos / interstitialUnitIdIos) with test fallback
  const realBannerIdIos = Constants?.expoConfig?.extra?.admob?.bannerUnitIdIos;
  const realInterstitialIdIos = Constants?.expoConfig?.extra?.admob?.interstitialUnitIdIos;
  const bannerAdUnitId = Platform.select({
    ios: realBannerIdIos || TestIds.BANNER,
    android: TestIds.BANNER,
    default: TestIds.BANNER,
  });
  const interstitialUnitId = Platform.select({
    ios: realInterstitialIdIos || TestIds.INTERSTITIAL,
    android: TestIds.INTERSTITIAL,
    default: TestIds.INTERSTITIAL,
  });

  // Prepare and load an interstitial ad
  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });
    interstitialRef.current = ad;
    const onLoaded = ad.addAdEventListener(AdEventType.LOADED, handleInterstitialLoaded);
    const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      handleInterstitialClosed();
      ad.load();
    });
    const onError = ad.addAdEventListener(AdEventType.ERROR, handleInterstitialError);
    ad.load();
    return () => {
      onLoaded();
      onClosed();
      onError();
    };
  }, [handleInterstitialClosed, handleInterstitialError, handleInterstitialLoaded, interstitialUnitId]);

  const isUiBlockingAd = useCallback(() => {
    // UI gating disabled: allow interstitials to interrupt any screen
    return false;
  }, []);

  const maybeShowInterstitial = useCallback(
    ({ force = false } = {}) => {
      try {
        const now = Date.now();
        // Enforce at least 30s since last fullscreen ad closed
        const gapOk = now - (lastAdClosedAtRef.current || 0) >= INTERSTITIAL_WINDOW_MS;
        if (!force && !gapOk) {
          return false;
        }
        if (force && !gapOk) {
          return false;
        }
        if (interstitialLoaded && interstitialRef.current) {
          interstitialRef.current.show();
          recordAdImpression();
          if (initialAdSequencePendingRef.current) {
            initialInterstitialCountRef.current += 1;
          }
          return true;
        }
      } catch (e) {
        console.warn('Interstitial show failed', e?.message);
      }
      return false;
    },
    [interstitialLoaded, recordAdImpression]
  );

  const handleInterstitialClosed = useCallback(() => {
    setInterstitialLoaded(false);
    interstitialHistoryRef.current = interstitialHistoryRef.current.filter(
      (timestamp) => Date.now() - timestamp < INTERSTITIAL_WINDOW_MS
    );
    // Mark usable period start
    lastAdClosedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    return () => {
      waitingForInterstitialRef.current = false;
      initialAdSequencePendingRef.current = false;
    };
  }, []);

  useEffect(() => {
    maybeShowInterstitialRef.current = maybeShowInterstitial;
  }, [maybeShowInterstitial]);

  const handleInterstitialLoaded = useCallback(() => {
    setInterstitialLoaded(true);
    if (waitingForInterstitialRef.current) {
      const shown = maybeShowInterstitialRef.current({ force: true });
      if (shown) {
        waitingForInterstitialRef.current = false;
      }
    }
    // No second startup ad in compliant mode
  }, []);

  const handleInterstitialError = useCallback(() => {
    setInterstitialLoaded(false);
    if (waitingForInterstitialRef.current) {
      waitingForInterstitialRef.current = false;
      initialAdSequencePendingRef.current = false;
      if (currentScreen !== 'map') {
        setCurrentScreen('map');
      }
    }
  }, [currentScreen]);

  useEffect(() => {
    // Compliant mode: no initial forced interstitial sequence
    initialAdSequencePendingRef.current = false;
    waitingForInterstitialRef.current = false;
  }, []);

  // Periodic attempt exactly every 30s; respects usable gap and disable when ads removed
  useEffect(() => {
    if (removeAds) return;
    const interval = setInterval(() => {
      if (!removeAds) {
        maybeShowInterstitialRef.current({ force: false });
      }
    }, INTERSTITIAL_WINDOW_MS);
    return () => clearInterval(interval);
  }, [removeAds]);

  const maybeShowInterstitialPublic = useCallback(
    (options = {}) => maybeShowInterstitialRef.current(options),
    []
  );

  // Fetch nearby restrooms from Supabase
  const fetchNearbyRestrooms = async (lat, lon, radius = 5000) => {
    setLoading(true);
    try {
      console.log(`Fetching ALL restrooms globally (distance computed from ${lat}, ${lon})`);
      const data = await restroomService.getAllRestrooms(lat, lon);
      console.log(`Loaded ${data.length} restrooms globally`);

      // If no restrooms found, load seeded data
      if (data.length === 0) {
        console.log('No restrooms found, loading seeded data...');
        await loadInitialSeededData();
        return;
      }

      // Attach formatted aggregates for UI convenience
      const withAggregates = data.map(r => ({
        ...r,
        avg_rating: typeof r.avg_rating === 'number' ? r.avg_rating : (r.rating || 0),
        review_count: typeof r.review_count === 'number' ? r.review_count : (r.reviews?.length || 0),
      }));
      setRestrooms(withAggregates);
      // Refresh realtime subscription for these restroom IDs
      try {
        const ids = withAggregates.map(r => r.id).filter(Boolean);
        if (reviewsSubRef.current && reviewsSubRef.current.unsubscribe) {
          reviewsSubRef.current.unsubscribe();
          reviewsSubRef.current = null;
        }
        if (ids.length > 0 && restroomService.subscribeToReviews) {
          reviewsSubRef.current = restroomService.subscribeToReviews(ids, (newReview) => {
            const restId = newReview.restroom_id;
            const rating = Number(newReview.rating) || 0;
            setRestrooms(prev => prev.map(r => {
              if (r.id !== restId) return r;
              const prevCount = r.review_count || 0;
              const prevAvg = r.avg_rating || 0;
              const nextCount = prevCount + 1;
              const nextAvg = nextCount > 0 ? ((prevAvg * prevCount) + rating) / nextCount : rating;
              return { ...r, review_count: nextCount, avg_rating: nextAvg };
            }));
          });
        }
      } catch (e) {
        console.warn('Realtime reviews subscription setup failed', e?.message || e);
      }
      setErrorMsg(null);

      // Update stats
      setStats({
        totalRestrooms: data.length,
        averageRating: withAggregates.length > 0
          ? (withAggregates.reduce((sum, r) => sum + (r.avg_rating || 0), 0) / withAggregates.length).toFixed(1)
          : '0.0',
        accessibleCount: withAggregates.filter(r => r.wheelchair_accessible).length
      });
    } catch (error) {
      console.error('Error fetching restrooms:', error);
      setErrorMsg('Failed to load restrooms');
      // Load seeded data as fallback
      await loadInitialSeededData();
    } finally {
      setLoading(false);
    }
  };

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      try {
        if (reviewsSubRef.current && reviewsSubRef.current.unsubscribe) {
          reviewsSubRef.current.unsubscribe();
          reviewsSubRef.current = null;
        }
      } catch {}
    };
  }, []);

  // Subscribe to global restroom inserts so new restrooms appear immediately
  useEffect(() => {
    if (!restroomService.subscribeToRestrooms) return;
    try {
      if (restroomsSubRef.current && restroomsSubRef.current.unsubscribe) {
        restroomsSubRef.current.unsubscribe();
        restroomsSubRef.current = null;
      }
      restroomsSubRef.current = restroomService.subscribeToRestrooms((newRestroom) => {
        try {
          const lat = newRestroom.lat ?? newRestroom.latitude;
          const lon = newRestroom.lon ?? newRestroom.lng ?? newRestroom.longitude;
          let distance = 0;
          if (location?.coords && lat != null && lon != null) {
            distance = restroomService.calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              lat,
              lon
            );
          }

          setRestrooms((prev) => {
            if (prev.some((r) => r.id === newRestroom.id)) return prev;
            return [
              {
                ...newRestroom,
                latitude: lat,
                longitude: lon,
                distance,
                review_count: 0,
                avg_rating: 0
              },
              ...prev
            ];
          });
        } catch (e) {
          console.warn('[Realtime] Failed to merge restroom', e?.message || e);
        }
      });
    } catch (e) {
      console.warn('[Realtime] Restrooms subscribe failed', e?.message || e);
    }
    return () => {
      try {
        if (restroomsSubRef.current && restroomsSubRef.current.unsubscribe) {
          restroomsSubRef.current.unsubscribe();
          restroomsSubRef.current = null;
        }
      } catch {}
    };
  }, [location]);


  // Load initial seeded data for map initialization
  const loadInitialSeededData = async () => {
    console.log('Loading initial seeded restroom data...');
    try {
      const seededData = [
        {
          id: 'seeded-1',
          name: 'Starbucks - French Quarter',
          lat: 29.9574,
          lon: -90.0644,
          latitude: 29.9574,
          longitude: -90.0644,
          wheelchair_accessible: true,
          baby_changing: true,
          gender_neutral: false,
          avg_rating: 4.2,
          reviews: [{ rating: 4, cleanliness_rating: 4, stocked_rating: 5, comment: 'Clean and well-maintained' }]
        },
        {
          id: 'seeded-2',
          name: 'Jackson Square Public Restrooms',
          lat: 29.9565,
          lon: -90.0629,
          latitude: 29.9565,
          longitude: -90.0629,
          wheelchair_accessible: true,
          baby_changing: false,
          gender_neutral: true,
          avg_rating: 3.8,
          reviews: [{ rating: 4, cleanliness_rating: 3, stocked_rating: 4, comment: 'Public facility, decent condition' }]
        },
        {
          id: 'seeded-3',
          name: 'Cafe Du Monde',
          lat: 29.9573,
          lon: -90.0609,
          latitude: 29.9573,
          longitude: -90.0609,
          wheelchair_accessible: false,
          baby_changing: false,
          gender_neutral: false,
          avg_rating: 3.5,
          reviews: [{ rating: 3, cleanliness_rating: 4, stocked_rating: 3, comment: 'Small but clean' }]
        },
        {
          id: 'seeded-4',
          name: 'Louisiana State Museum',
          lat: 29.9582,
          lon: -90.0634,
          latitude: 29.9582,
          longitude: -90.0634,
          wheelchair_accessible: true,
          baby_changing: true,
          gender_neutral: true,
          avg_rating: 4.5,
          reviews: [{ rating: 5, cleanliness_rating: 4, stocked_rating: 5, comment: 'Excellent facility' }]
        },
        {
          id: 'seeded-5',
          name: 'McDonald\'s - Canal Street',
          lat: 29.9529,
          lon: -90.0692,
          latitude: 29.9529,
          longitude: -90.0692,
          wheelchair_accessible: true,
          baby_changing: true,
          gender_neutral: false,
          avg_rating: 3.2,
          reviews: [{ rating: 3, cleanliness_rating: 3, stocked_rating: 3, comment: 'Standard fast food restroom' }]
        }
      ];

      setRestrooms(seededData);
      setErrorMsg(null);

      // Update stats for seeded data
      setStats({
        totalRestrooms: seededData.length,
        averageRating: (seededData.reduce((sum, r) => sum + (r.avg_rating || 0), 0) / seededData.length).toFixed(1),
        accessibleCount: seededData.filter(r => r.wheelchair_accessible).length
      });

      console.log(`Loaded ${seededData.length} seeded restrooms`);
    } catch (error) {
      console.error('Error loading seeded data:', error);
      setErrorMsg('Failed to load initial data');
    }
  };

  // Handle "Find Nearby" button press
  const handleFindNearby = async () => {
    if (location) {
      await fetchNearbyRestrooms(
        location.coords.latitude,
        location.coords.longitude,
        5000
      );
    } else {
      setErrorMsg('Location not available yet');
    }
  };

  // Handle map ready
  const handleMapReady = () => {
    console.log('Map is ready');
    setMapReady(true);
    lastMapActivityRef.current = Date.now();
  };
  const handleRegionChangeComplete = () => {
    lastMapActivityRef.current = Date.now();
  };

  // Map watchdog: periodically verify activity; if stale for >60s while on map screen, remount.
  useEffect(() => {
    if (watchdogIntervalRef.current) {
      clearInterval(watchdogIntervalRef.current);
    }
    watchdogIntervalRef.current = setInterval(() => {
      if (currentScreen !== 'map') return;
      const sinceActivity = Date.now() - lastMapActivityRef.current;
      if (sinceActivity > 60000) { // 60s without region change or ready event
        console.warn('Watchdog: map appears stale (>60s inactivity); remounting MapView');
        setMapReady(false);
        setMapRenderKey((k) => k + 1);
        setTimeout(() => {
          try {
            if (mapRef.current && region) {
              mapRef.current.animateToRegion(region, 0);
            }
          } catch (e) {
            console.warn('Map animateToRegion after stale remount failed', e?.message ?? e);
          }
        }, 75);
      }
    }, 10000); // check every 10s
    return () => {
      if (watchdogIntervalRef.current) {
        clearInterval(watchdogIntervalRef.current);
        watchdogIntervalRef.current = null;
      }
    };
  }, [currentScreen, region]);

  // Handle map errors
  const handleMapError = (error) => {
    console.error('Map error:', error);
    setErrorMsg('Map failed to load. Please try again.');
  };

  // Handle map press for adding restrooms
  const handleMapPress = (event) => {
    if (addMode) {
      const coordinate = event.nativeEvent.coordinate;
      setAddLocation(coordinate);
      setShowAddForm(true);
    }
  };

  // Handle POI (Point of Interest) clicks - Google Places
  const handlePoiClick = (event) => {
    const { coordinate, placeId, name } = event.nativeEvent;

    // Create a temporary restroom object for the Google Place
    const googlePlaceRestroom = {
      id: placeId || `google-place-${Date.now()}`,
      name: name || 'Google Place',
      lat: coordinate.latitude,
      lon: coordinate.longitude,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      isGooglePlace: true,
      placeId: placeId,
      reviews: [],
      avg_rating: 0,
      wheelchair_accessible: false,
      baby_changing: false,
      gender_neutral: false
    };

    // Show rating modal for this Google Place
    setSelectedRestroom(googlePlaceRestroom);
    setShowRatingModal(true);
  };

  // Add new restroom
  const handleAddRestroom = async () => {
    if (!addLocation || !newRestroom.name.trim()) {
      Alert.alert('Error', 'Please provide a name and location for the restroom');
      return;
    }

    try {
      setLoading(true);
      await restroomService.create({
        ...newRestroom,
        lat: addLocation.latitude,
        lon: addLocation.longitude
      });

      // Reset form
      setNewRestroom({
        name: '',
        description: '',
        wheelchair_accessible: false,
        baby_changing: false,
        gender_neutral: false
      });
      setShowAddForm(false);
      setAddMode(false);
      setAddLocation(null);

      // Refresh restrooms
      if (location) {
        await fetchNearbyRestrooms(location.coords.latitude, location.coords.longitude);
      }

      Alert.alert('Success', 'Restroom added successfully!');
    } catch (error) {
      console.error('Error adding restroom:', error);
      Alert.alert('Error', 'Failed to add restroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to submit review without photos
  const submitReviewWithoutPhotos = async () => {
    if (!selectedRestroom) return;

    try {
      setLoading(true);

      // If this is a Google Place that doesn't exist in our database yet, create it first
      if (selectedRestroom.isGooglePlace) {
        console.log('Rating Google Place:', selectedRestroom.name);

        // Check if restroom already exists by location (within ~10 meters)
        const existing = restrooms.find(r =>
          Math.abs(r.lat - selectedRestroom.lat) < 0.0001 &&
          Math.abs(r.lon - selectedRestroom.lon) < 0.0001
        );

        if (!existing) {
          console.log('Creating new restroom entry for:', selectedRestroom.name);

          try {
            // Create new restroom from Google Place
            const newRestroomData = await restroomService.create({
              name: selectedRestroom.name,
              description: `Added from Google Places (${selectedRestroom.placeId || 'unknown'})`,
              lat: selectedRestroom.lat,
              lon: selectedRestroom.lon,
              wheelchair_accessible: false,
              baby_changing: false,
              gender_neutral: false
            });

            // Use the newly created restroom ID for the review
            selectedRestroom.id = newRestroomData.id;
            console.log('Successfully created restroom with ID:', newRestroomData.id);
          } catch (createError) {
            console.error('Failed to create restroom:', createError);
            throw new Error(`Could not create restroom: ${createError.message}`);
          }
        } else {
          console.log('Using existing restroom:', existing.name);
          // Use existing restroom ID
          selectedRestroom.id = existing.id;
        }
      }

      // Prepare review data without photos
      const reviewData = {
        restroom_id: selectedRestroom.id,
        rating: newRating.rating,
        cleanliness_rating: newRating.cleanliness_rating,
        stocked_rating: newRating.stocked_rating,
        review_text: newRating.review_text,
        comment: newRating.review_text,
        photos: [], // Empty array
        gender: newRating.gender,
        availability_status: newRating.availability_status
      };

      // Add the review
      const inserted = await restroomService.addReview(reviewData);
      // Optimistically update local aggregates for the specific restroom without full refetch (will still refetch below)
      if (inserted && inserted.restroom_id) {
        setRestrooms(prev => prev.map(r => {
          if (r.id !== inserted.restroom_id) return r;
          const newCount = (r.review_count || (r.reviews?.length || 0)) + 1;
          const newAvg = ((r.avg_rating || 0) * (newCount - 1) + (inserted.rating || 0)) / newCount;
          return {
            ...r,
            review_count: newCount,
            avg_rating: newAvg,
            reviews: r.reviews ? [...r.reviews, inserted] : [inserted]
          };
        }));
      }

      // Reset rating form and photos
      setNewRating({
        rating: 5,
        cleanliness_rating: 5,
        stocked_rating: 5,
        review_text: '',
        gender: 'unisex',
        availability_status: 'available'
      });
      setReviewPhotos([]);
      setShowRatingModal(false);
      setSelectedRestroom(null);

      // Refresh restrooms
      if (location) {
        await fetchNearbyRestrooms(location.coords.latitude, location.coords.longitude);
      }

      Alert.alert('Success', 'Review added successfully!');
  // Attempt to show an interstitial after adding a review (gentle frequency control handled in maybeShowInterstitial)
  maybeShowInterstitialPublic();
    } catch (error) {
      console.error('Error adding review:', error);
      Alert.alert('Error', `Failed to add review: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  // Load reviews for a restroom (latest first)
  async function loadRestroomReviews(restroomId) {
    try {
      setReviewsLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('id, restroom_id, rating, cleanliness_rating, stocked_rating, review_text, comment, photos, gender, availability_status, created_at')
        .eq('restroom_id', restroomId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setRestroomReviews(data || []);
    } catch (e) {
      console.warn('Failed to load restroom reviews', e?.message || e);
      setRestroomReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  // Flatten all photos across reviews for the Photos tab
  const restroomPhotos = useMemo(() => {
    const out = [];
    (restroomReviews || []).forEach((r) => {
      (r.photos || []).forEach((url, idx) => {
        out.push({ url, key: `${r.id}-${idx}` });
      });
    });
    return out;
  }, [restroomReviews]);


  // When opening the rating modal, reset to the form and preload reviews/photos
  useEffect(() => {
    if (showRatingModal && selectedRestroom?.id) {
      setRatingModalTab('form');
      loadRestroomReviews(selectedRestroom.id);
    }
  }, [showRatingModal, selectedRestroom?.id]);

  // Add rating
  const handleAddRating = async () => {
    if (!selectedRestroom) return;

    try {
      setLoading(true);

      // If this is a Google Place that doesn't exist in our database yet, create it first
      if (selectedRestroom.isGooglePlace) {
        console.log('Rating Google Place:', selectedRestroom.name);

        // Check if restroom already exists by location (within ~10 meters)
        const existing = restrooms.find(r =>
          Math.abs(r.lat - selectedRestroom.lat) < 0.0001 &&
          Math.abs(r.lon - selectedRestroom.lon) < 0.0001
        );

        if (!existing) {
          console.log('Creating new restroom entry for:', selectedRestroom.name);

          try {
            // Create new restroom from Google Place
            const newRestroomData = await restroomService.create({
              name: selectedRestroom.name,
              description: `Added from Google Places (${selectedRestroom.placeId || 'unknown'})`,
              lat: selectedRestroom.lat,
              lon: selectedRestroom.lon,
              wheelchair_accessible: false,
              baby_changing: false,
              gender_neutral: false
            });

            // Use the newly created restroom ID for the review
            selectedRestroom.id = newRestroomData.id;
            console.log('Successfully created restroom with ID:', newRestroomData.id);
          } catch (createError) {
            console.error('Failed to create restroom:', createError);
            throw new Error(`Could not create restroom: ${createError.message}`);
          }
        } else {
          console.log('Using existing restroom:', existing.name);
          // Use existing restroom ID
          selectedRestroom.id = existing.id;
        }
      }

      // Upload photos to Supabase Storage first (if any)
      let photoUrls = [];
      if (reviewPhotos.length > 0) {
        const photoUris = reviewPhotos.map(photo => photo.uri);

        // Generate a unique identifier for file naming (using restroom ID + timestamp)
        const fileIdentifier = `${selectedRestroom.id}-${Date.now()}`;

        const uploadResult = await photoService.uploadReviewPhotos(photoUris, fileIdentifier);

        if (uploadResult.errors && uploadResult.errors.length > 0) {
          console.warn('Some photos failed to upload:', uploadResult.errors);
          // Continue with successful uploads, but warn user
          if (uploadResult.urls.length === 0) {
            Alert.alert(
              'Photo Upload Failed',
              'Photos could not be uploaded. Would you like to submit the review without photos?',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
                { text: 'Submit Without Photos', onPress: () => {
                  // Continue with review submission without photos
                  submitReviewWithoutPhotos();
                }}
              ]
            );
            return;
          }
        }

        photoUrls = uploadResult.urls;
      }

      // Prepare review data with photo URLs
      const reviewData = {
        restroom_id: selectedRestroom.id,
        rating: newRating.rating,
        cleanliness_rating: newRating.cleanliness_rating,
        stocked_rating: newRating.stocked_rating,
        review_text: newRating.review_text, // Written review text
        comment: newRating.review_text, // Keep for backward compatibility
        photos: photoUrls, // Array of photo URLs from Supabase Storage
        gender: newRating.gender,
        availability_status: newRating.availability_status
      };

      // Add the review
      await restroomService.addReview(reviewData);

      // Reset rating form and photos
      setNewRating({
        rating: 5,
        cleanliness_rating: 5,
        stocked_rating: 5,
        review_text: '',
        gender: 'unisex',
        availability_status: 'available'
      });
      setReviewPhotos([]);
      setShowRatingModal(false);

      // Clear selection after submitting
      setSelectedRestroom(null);

      // Refresh global restrooms list
      if (location) {
        await fetchNearbyRestrooms(location.coords.latitude, location.coords.longitude);
      }

      Alert.alert('Success', 'Rating added successfully!');
      // Attempt to show an interstitial after adding a rating
      maybeShowInterstitialPublic();
    } catch (error) {
      console.error('Error adding rating:', error);
      console.error('Error details:', error.message);
      console.error('Selected restroom:', selectedRestroom);
      Alert.alert(
        'Error',
        `Failed to add rating: ${error.message || 'Unknown error'}\n\nPlease check the console for details.`
      );
    } finally {
      setLoading(false);
    }
  };



  // Calculate average rating from reviews
  const getAverageRating = (restroom) => {
    if (restroom.reviews && restroom.reviews.length > 0) {
      return restroomService.calculateAverageRating(restroom.reviews);
    }
    return restroom.avg_rating || 3;
  };

  // Request camera and media library permissions
  const requestImagePermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to add photos to your review.'
      );
      return false;
    }
    return true;
  };

  // Pick image from camera or library
  const pickImage = async (source) => {
    if (reviewPhotos.length >= 3) {
      Alert.alert('Maximum Photos', 'You can only add up to 3 photos per review.');
      return;
    }

    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    let result;

    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newPhotos = [...reviewPhotos, ...result.assets];
      // Limit to 3 photos
      setReviewPhotos(newPhotos.slice(0, 3));
    }
  };

  // Remove photo from review
  const removePhoto = (index) => {
    setReviewPhotos(reviewPhotos.filter((_, i) => i !== index));
  };

  // Filter restrooms based on current filters
  const filteredRestrooms = restrooms.filter(restroom => {
    if (filters.wheelchair_accessible && !restroom.wheelchair_accessible) return false;
    if (filters.baby_changing && !restroom.baby_changing) return false;
    if (filters.gender_neutral && !restroom.gender_neutral) return false;
    return true;
  });

  // Star rating component
  const StarRating = ({ rating, onRatingChange, size = 24 }) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange && onRatingChange(star)}
            disabled={!onRatingChange}
          >
            <Text style={[styles.star, { fontSize: size, opacity: star <= rating ? 1 : 0.35 }]}>
              {'🚽'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };


  // HomePage Component (Landing Page)
  const HomePage = () => {
    const [videoReady, setVideoReady] = useState(false);
    const heroSource = useRef(Asset.fromModule(require('./assets/hero-video.mp4')));
    // Preload hero video file so we don't show blank background
    useEffect(() => {
      (async () => {
        try { await heroSource.current.downloadAsync(); } catch {}
        setVideoReady(true);
      })();
    }, []);

    const player = useVideoPlayer(require('./assets/hero-video.mp4'), player => {
      player.loop = true;
      player.muted = true;
      player.play();
    });

    return (
      <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
        <StatusBar style="light" />

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <VideoView
            player={player}
            style={styles.heroBackground}
            contentFit="cover"
            nativeControls={false}
          />
          {/* Simple Map Button - Top Left */}
          <TouchableOpacity
            style={styles.simpleMapButton}
            onPress={() => setCurrentScreen('map')}
          >
            <Text style={styles.mapButtonText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>

        {/* Guide to Relief Section */}
        <View style={styles.guideSection}>
          <View style={styles.guideContent}>
            <Text style={styles.guideTitle}>🚽 PÜPER</Text>
            <Text style={styles.guideSubtitle}>Your Guide to Relief</Text>
            <Text style={styles.guideDescription}>
              Never get caught without a clean restroom again! Find and rate public restrooms wherever you are.
            </Text>

            <TouchableOpacity
              style={styles.guideCtaButton}
              onPress={() => setCurrentScreen('map')}
            >
              <Text style={styles.guideCtaButtonText}>🗺️ Start Finding Restrooms</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Püper?</Text>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🗺️</Text>
              <Text style={styles.featureTitle}>Real-time Map</Text>
              <Text style={styles.featureDescription}>
                Find restrooms near you with our interactive map powered by community data.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🚽</Text>
              <Text style={styles.featureTitle}>5-Toilet Rating System</Text>
              <Text style={styles.featureDescription}>
                Rate restrooms with our unique toilet-based system instead of boring stars.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>♿</Text>
              <Text style={styles.featureTitle}>Accessibility Info</Text>
              <Text style={styles.featureDescription}>
                Filter by wheelchair access, baby changing stations, and gender-neutral options.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureTitle}>Community Reviews</Text>
              <Text style={styles.featureDescription}>
                Read honest reviews about cleanliness, accessibility, and amenities.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureTitle}>Mobile First</Text>
              <Text style={styles.featureDescription}>
                Designed specifically for mobile users with smooth, native performance.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureTitle}>Privacy Focused</Text>
              <Text style={styles.featureDescription}>
                Your data is secure and we never share your location without permission.
              </Text>
            </View>
          </View>
        </View>

        {/* Call to Action Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Join the Community</Text>
          <Text style={styles.ctaDescription}>
            Help others find relief by adding and reviewing restrooms in your area.
          </Text>

          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={[styles.ctaButton, styles.primaryButton]}
              onPress={() => setCurrentScreen('map')}
            >
              <Text style={styles.ctaButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaButton, styles.secondaryButton]}
              onPress={() => setCurrentScreen('ranking')}
            >
              <Text style={[styles.ctaButtonText, styles.secondaryButtonText]}>🏆 View Rankings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Püper - Your Guide to Relief</Text>
        </View>
      </ScrollView>
    );
  };

  // Ranking Page Component
  const RankingPage = () => {
    const baseForRanking = location?.coords
      ? filteredRestrooms.filter(r => {
          if (typeof r.distance === 'number') return r.distance <= 30000; // 30 km radius
          const la = r.latitude ?? r.lat;
          const lo = r.longitude ?? r.lon;
          if (la == null || lo == null) return false;
          const d = restroomService.calculateDistance(location.coords.latitude, location.coords.longitude, la, lo);
          return d <= 30000;
        })
      : filteredRestrooms;

    const sortedRestrooms = [...baseForRanking].sort((a, b) => {
      const ratingA = getAverageRating(a);
      const ratingB = getAverageRating(b);
      if (ratingB !== ratingA) return ratingB - ratingA; // Highest rating first
      const da = typeof a.distance === 'number' ? a.distance : Number.POSITIVE_INFINITY;
      const db = typeof b.distance === 'number' ? b.distance : Number.POSITIVE_INFINITY;
      return da - db; // tie-breaker by proximity
    });

    return (
      <View style={styles.rankingContainer}>
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.menuIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🚽 PÜPER</Text>
            <Text style={styles.headerSubtitle}>Top Rated Restrooms</Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setCurrentScreen('map')}
          >
            <Text style={styles.menuIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>

        {/* Rankings List */}
        <ScrollView style={styles.rankingsList} showsVerticalScrollIndicator={false}>
          <Text style={styles.rankingsTitle}>🏆 Top Rated Restrooms</Text>

          {sortedRestrooms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No restrooms found yet!</Text>
              <Text style={styles.emptyStateSubtext}>Add some ratings to see rankings</Text>
            </View>
          ) : (
            sortedRestrooms.map((restroom, index) => {
              const avgRating = getAverageRating(restroom);
              const reviewCount = restroom.review_count || (restroom.reviews?.length || 0);
              const distance = restroom.distance
                ? restroomService.formatDistance(restroom.distance)
                : '';

              return (
                <TouchableOpacity
                  key={restroom.id}
                  style={styles.rankingItem}
                  onPress={() => {
                    setSelectedRestroom(restroom);
                    setShowRatingModal(true);
                    setCurrentScreen('map');
                  }}
                >
                  <View style={styles.rankingHeader}>
                    <Text style={styles.rankingNumber}>#{index + 1}</Text>
                    <View style={styles.rankingStars}>
                      <Text style={styles.starText}>{avgRating.toFixed(1)} 🚽</Text>
                    </View>
                  </View>

                  <View style={styles.rankingContent}>
                    <Text style={styles.restroomName}>{restroom.name || 'Restroom'}</Text>
                    <Text style={styles.restroomDetails}>
                      {distance && `${distance} • `}
                      {`${reviewCount} review${reviewCount === 1 ? '' : 's'} • `}
                      {restroom.wheelchair_accessible && '♿ '}
                      {restroom.baby_changing && '👶 '}
                      {restroom.gender_neutral && '🚻 '}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() => {
                      setSelectedRestroom(restroom);
                      setShowRatingModal(true);
                      setCurrentScreen('map');
                    }}
                  >
                    <Text style={styles.rateButtonText}>Rate</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  };

  // Main render function
  if (currentScreen === 'home') {
    return (
      <View style={{ flex: 1 }}>
        <HomePage />
        {showSplashVideo && (
          <View
            activeOpacity={1}

            style={[StyleSheet.absoluteFill, { zIndex: 10000 }]}
          >
            <Animated.View style={[styles.introSplashContainer, { opacity: splashOpacity }]}>
              <Video
                source={require('./assets/splash3.mp4')}
                style={styles.introSplashVideo}
                resizeMode="cover"
                shouldPlay
                isLooping={false}
                onLoad={() => {
                  console.log('✅ Splash video loaded and playing');
                }}
                onPlaybackStatusUpdate={(status) => {
                  if (status.didJustFinish && !splashVideoFinished.current) {
                    console.log('🎬 Splash video finished playing');
                    splashVideoFinished.current = true;
                    Animated.timing(splashOpacity, {
                      toValue: 0,
                      duration: 450,
                      useNativeDriver: true,
                    }).start(() => setShowSplashVideo(false));
                  }
                }}
              />
              <View style={styles.skipHintContainer} pointerEvents="none">
                <Text style={styles.skipHintText}></Text>
              </View>
            </Animated.View>
          </View>
        )}
      </View>
    );
  }

  if (currentScreen === 'ranking') {
    return (
      <View style={{ flex: 1 }}>
        <RankingPage />
        {showSplashVideo && (
          <View
            activeOpacity={1}

            style={[StyleSheet.absoluteFill, { zIndex: 10000 }]}
          >
            <Animated.View style={[styles.introSplashContainer, { opacity: splashOpacity }]}>
              <Video
                source={require('./assets/splash3.mp4')}
                style={styles.introSplashVideo}
                resizeMode="cover"
                shouldPlay
                isLooping={false}
                onLoad={() => {
                  console.log('✅ Splash video loaded and playing');
                }}
                onPlaybackStatusUpdate={(status) => {
                  if (status.didJustFinish && !splashVideoFinished.current) {
                    console.log('🎬 Splash video finished playing');
                    splashVideoFinished.current = true;
                    Animated.timing(splashOpacity, {
                      toValue: 0,
                      duration: 450,
                      useNativeDriver: true,
                    }).start(() => setShowSplashVideo(false));
                  }
                }}
              />
              <View style={styles.skipHintContainer} pointerEvents="none">
                <Text style={styles.skipHintText}></Text>
              </View>
            </Animated.View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header with Back Button and Menu */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.menuIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🚽 PÜPER</Text>
          <Text style={styles.headerSubtitle}>Your Guide to Relief</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (addMode) {
                setAddMode(false);
                setAddLocation(null);
              } else {
                setAddMode(true);
                Alert.alert('Add Mode', 'Tap anywhere on the map to add a new restroom!');
              }
            }}
          >
            <Text style={styles.addIcon}>{addMode ? '✕' : '+'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <MapView
        key={`map-${mapRenderKey}`}
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsPointsOfInterest={true}
        loadingEnabled={true}
        loadingIndicatorColor="#6B4423"
        loadingBackgroundColor="#F5F5DC"
        onMapReady={handleMapReady}
        onMapError={handleMapError}
        onPress={handleMapPress}
        onPoiClick={handlePoiClick}
        onRegionChangeComplete={handleRegionChangeComplete}
        // Additional iOS optimizations
        showsCompass={true}
        showsScale={Platform.OS === 'ios'}
        maxZoomLevel={20}
        minZoomLevel={3}
        // Enable traffic and terrain for better user experience
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
      >
        {/* Restroom markers */}
        {filteredRestrooms.map((restroom) => {
          const avgRating = getAverageRating(restroom);
          const distance = restroom.distance
            ? restroomService.formatDistance(restroom.distance)
            : '';

          const reviewCount = restroom.review_count || (restroom.reviews?.length || 0);
          return (
            <Marker
              key={restroom.id}
              coordinate={{
                latitude: restroom.latitude || restroom.lat,
                longitude: restroom.longitude || restroom.lon,
              }}
              title={restroom.name || 'Restroom'}
              description={`${avgRating.toFixed(1)} 🚽 • ${reviewCount} review${reviewCount === 1 ? '' : 's'} ${distance ? `• ${distance}` : ''}`}
              onPress={() => {
                setSelectedRestroom(restroom);
                setShowRatingModal(true);
              }}
            >
              <View style={[
                styles.markerContainer,
                {
                  backgroundColor: '#8B4513', // Brown color like web app
                  borderColor: '#654321',
                }
              ]}>
                <Text style={styles.markerIcon}>🚽</Text>
                {/* Rating badge */}
                {avgRating > 0 && (
                  <View style={[
                    styles.ratingBadge,
                    {
                      backgroundColor: avgRating >= 4 ? '#27AE60' :
                                      avgRating >= 3 ? '#FFD700' :
                                      avgRating >= 2 ? '#FF6347' : '#E74C3C'
                    }
                  ]}>
                    <Text style={styles.ratingBadgeText}>{avgRating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </Marker>
          );
        })}

        {/* Add location marker */}
        {addLocation && (
          <Marker
            coordinate={addLocation}
            title="New Restroom Location"
            description="Tap to add details"
          >
            <View style={[
              styles.markerContainer,
              {
                backgroundColor: '#0dffe7', // Cyan color like web app
                borderColor: '#00bfa5'
              }
            ]}>
              <Text style={[styles.markerIcon, { color: '#00bfa5' }]}>+</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Map Loading Overlay */}
      {!mapReady && (
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator size="large" color="#6B4423" />
          <Text style={styles.mapLoadingText}>Loading Map...</Text>
        </View>
      )}

      {/* Bottom Stats Bar + Banner Ad */}
      <View style={styles.bottomInfo}>
        {loading && (
          <ActivityIndicator size="small" color="#FFF" style={{ marginBottom: 10 }} />
        )}
        <Text style={styles.infoText}>
          {errorMsg
            ? `⚠️ ${errorMsg}`
            : `📍 ${stats.totalRestrooms} restrooms • ${Number(stats.averageRating).toFixed(1)} 🚽 • ♿ ${stats.accessibleCount} accessible`}
        </Text>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleFindNearby}
          disabled={loading || !location}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Searching...' : 'Refresh Nearby Restrooms'}
          </Text>
        </TouchableOpacity>
        {/* In‑app purchase CTA: make Remove Ads very visible */}
        {!removeAds && (
          <TouchableOpacity
            style={[styles.secondaryButton, purchasing && styles.buttonDisabled]}
            onPress={buyRemoveAds}
            disabled={purchasing}
          >
            <Text style={styles.secondaryButtonText}>
              {purchasing ? 'Processing…' : 'Remove Ads — $4.99'}
            </Text>
          </TouchableOpacity>
        )}
        {/* Test Banner Ad (replace TestIds with real unit IDs in production) */}
        <View style={styles.adWrapper}>
          {removeAds ? (
            <Text style={styles.adFreeText}>Ad-Free ✅</Text>
          ) : adsInitialized ? (
            <BannerAd
              unitId={bannerAdUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              onAdFailedToLoad={(e) => console.warn('Banner failed to load', e?.message)}
            />
          ) : (
            <Text style={styles.adLoadingText}>Loading ad…</Text>
          )}
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMenu}
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.menuModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {!removeAds && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  buyRemoveAds();
                }}
              >
                <Text style={styles.menuItemText}>{purchasing ? 'Processing…' : '🚫 Remove Ads ($4.99)'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setCurrentScreen('home');
              }}
            >
              <Text style={styles.menuItemText}>🏠 Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowFilters(true);
              }}
            >
              <Text style={styles.menuItemText}>🔍 Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                handleFindNearby();
              }}
            >
              <Text style={styles.menuItemText}>📍 Find Nearby</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setCurrentScreen('ranking');
              }}
            >
              <Text style={styles.menuItemText}>🏆 Rankings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                Alert.alert('About Püper', 'Your guide to finding clean and accessible restrooms everywhere!');
              }}
            >
              <Text style={styles.menuItemText}>ℹ️ About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setShowMenu(false);
                await restorePurchases();
              }}
            >
              <Text style={styles.menuItemText}>{restoring ? 'Restoring…' : '🔄 Restore Purchases'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowAdminCodeModal(true);
              }}
            >
              <Text style={styles.menuItemText}>🔑 Enter Admin Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filters Modal */}

      {/* Admin Code Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAdminCodeModal}
        onRequestClose={() => setShowAdminCodeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.menuModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Admin Code</Text>
              <TouchableOpacity onPress={() => setShowAdminCodeModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              value={adminCodeInput}
              onChangeText={setAdminCodeInput}
              placeholder="Enter code"
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.submitRatingButton}
              onPress={async () => {
                const expected = Constants?.expoConfig?.extra?.adminOverrideCode;
                if (!expected) {
                  Alert.alert('Not configured', 'No admin code set in app.json (extra.adminOverrideCode).');
                  return;
                }
                if ((adminCodeInput || '').trim() === expected) {
                  await grantLocalEntitlement();
                  Alert.alert('Ad‑Free Unlocked', 'Admin override activated on this device.');
                  setShowAdminCodeModal(false);
                  setAdminCodeInput('');
                } else {
                  Alert.alert('Invalid Code', 'Please try again.');
                }
              }}
            >
              <Text style={styles.submitRatingButtonText}>Unlock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterText}>♿ Wheelchair Accessible</Text>
              <Switch
                value={filters.wheelchair_accessible}
                onValueChange={(value) => setFilters(prev => ({ ...prev, wheelchair_accessible: value }))}
                trackColor={{ false: '#ccc', true: '#6B4423' }}
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterText}>👶 Baby Changing</Text>
              <Switch
                value={filters.baby_changing}
                onValueChange={(value) => setFilters(prev => ({ ...prev, baby_changing: value }))}
                trackColor={{ false: '#ccc', true: '#6B4423' }}
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterText}>🚻 Gender Neutral</Text>
              <Switch
                value={filters.gender_neutral}
                onValueChange={(value) => setFilters(prev => ({ ...prev, gender_neutral: value }))}
                trackColor={{ false: '#ccc', true: '#6B4423' }}
              />
            </View>

            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setFilters({
                  wheelchair_accessible: false,
                  baby_changing: false,
                  gender_neutral: false
                });
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Restroom Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddForm}
        onRequestClose={() => setShowAddForm(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.addModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Restroom</Text>
              <TouchableOpacity onPress={() => {
                setShowAddForm(false);
                setAddMode(false);
                setAddLocation(null);
              }}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newRestroom.name}
                onChangeText={(text) => setNewRestroom(prev => ({ ...prev, name: text }))}
                placeholder="Enter restroom name"
                placeholderTextColor="#999"
              />

              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newRestroom.description}
                onChangeText={(text) => setNewRestroom(prev => ({ ...prev, description: text }))}
                placeholder="Optional description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />

              <View style={styles.switchContainer}>
                <View style={styles.switchItem}>
                  <Text style={styles.switchText}>♿ Wheelchair Accessible</Text>
                  <Switch
                    value={newRestroom.wheelchair_accessible}
                    onValueChange={(value) => setNewRestroom(prev => ({ ...prev, wheelchair_accessible: value }))}
                    trackColor={{ false: '#ccc', true: '#6B4423' }}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={styles.switchText}>👶 Baby Changing</Text>
                  <Switch
                    value={newRestroom.baby_changing}
                    onValueChange={(value) => setNewRestroom(prev => ({ ...prev, baby_changing: value }))}
                    trackColor={{ false: '#ccc', true: '#6B4423' }}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={styles.switchText}>🚻 Gender Neutral</Text>
                  <Switch
                    value={newRestroom.gender_neutral}
                    onValueChange={(value) => setNewRestroom(prev => ({ ...prev, gender_neutral: value }))}
                    trackColor={{ false: '#ccc', true: '#6B4423' }}
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.addRestroomButton, { opacity: newRestroom.name.trim() ? 1 : 0.5 }]}
              onPress={handleAddRestroom}
              disabled={!newRestroom.name.trim() || loading}
            >
              <Text style={styles.addRestroomButtonText}>
                {loading ? 'Adding...' : 'Add Restroom'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>



      {/* Photo Viewer */}
      <Modal
        animationType="fade"
        transparent
        visible={photoViewer.visible}
        onRequestClose={() => setPhotoViewer({ visible: false, url: null })}
      >
        <View style={styles.imageViewer}>
          <TouchableOpacity style={styles.imageViewerClose} onPress={() => setPhotoViewer({ visible: false, url: null })}>
            <Text style={{ color: '#FFF', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
          {photoViewer.url ? (
            <Image source={{ uri: photoViewer.url }} style={styles.imageViewerImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRatingModal}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >


          <View style={styles.ratingModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleLight}>
                Rate {selectedRestroom?.name || 'Restroom'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowRatingModal(false);
                setSelectedRestroom(null);
                // Reset form when closing
                setNewRating({
                  rating: 5,
                  cleanliness_rating: 5,
                  stocked_rating: 5,
                  review_text: '',
                  gender: 'unisex',
                  availability_status: 'available'
                });
                setReviewPhotos([]);
              }}>
                <Text style={styles.closeButtonLight}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs inside Rating Modal */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tab, ratingModalTab === 'form' && styles.tabActive]}
                onPress={() => setRatingModalTab('form')}
              >
                <Text style={[styles.tabText, ratingModalTab === 'form' && styles.tabTextActive]}>Rate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, ratingModalTab === 'reviews' && styles.tabActive]}
                onPress={() => setRatingModalTab('reviews')}
              >
                <Text style={[styles.tabText, ratingModalTab === 'reviews' && styles.tabTextActive]}>Written Reviews</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, ratingModalTab === 'photos' && styles.tabActive]}
                onPress={() => setRatingModalTab('photos')}
              >
                <Text style={[styles.tabText, ratingModalTab === 'photos' && styles.tabTextActive]}>Photos</Text>
              </TouchableOpacity>
            </View>

            {ratingModalTab === 'form' ? (
              <View>
                {/* Rating form */}
                <ScrollView style={styles.ratingContainer}>
                  <Text style={styles.ratingLabel}>Overall Rating</Text>
                  <StarRating
                    rating={newRating.rating}
                    onRatingChange={(rating) => setNewRating(prev => ({ ...prev, rating }))}
                    size={32}
                  />

                  <Text style={styles.ratingLabel}>Cleanliness</Text>
                  <StarRating
                    rating={newRating.cleanliness_rating}
                    onRatingChange={(rating) => setNewRating(prev => ({ ...prev, cleanliness_rating: rating }))}
                  />

                  <Text style={styles.ratingLabel}>Stock Level</Text>
                  <StarRating
                    rating={newRating.stocked_rating}
                    onRatingChange={(rating) => setNewRating(prev => ({ ...prev, stocked_rating: rating }))}
                  />

                  <Text style={styles.ratingLabel}>Availability Status</Text>
                  <View style={styles.availabilityOptions}>
                    {[
                      { value: 'available', label: '🟢 Available', color: '#27AE60' },
                      { value: 'busy', label: '🟡 Busy', color: '#F39C12' },
                      { value: 'closed', label: '🔴 Closed', color: '#E74C3C' }
                    ].map(option => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.availabilityOption,
                          {
                            backgroundColor: newRating.availability_status === option.value ? option.color : 'rgba(26,26,26,0.5)',
                            borderColor: option.color
                          }
                        ]}
                        onPress={() => setNewRating(prev => ({ ...prev, availability_status: option.value }))}
                      >
                        <Text style={[
                          styles.availabilityOptionText,
                          { color: newRating.availability_status === option.value ? '#FFF' : option.color }
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.ratingLabel}>Write Your Review</Text>
                  <TextInput
                    style={[styles.textInputDark, styles.textArea]}
                    value={newRating.review_text}
                    onChangeText={(text) => setNewRating(prev => ({ ...prev, review_text: text }))}
                    placeholder="Share your experience... How was the cleanliness? What amenities were available? Any tips for other users?"
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={5}
                  />

                  {/* Photo Upload Section */}
                  <Text style={styles.ratingLabel}>Photos (Optional - Up to 3)</Text>
                  <View style={styles.photoContainer}>
                    {reviewPhotos.map((photo, index) => (
                      <View key={index} style={styles.photoPreview}>
                        <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={() => removePhoto(index)}
                        >
                          <Text style={styles.removePhotoText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {reviewPhotos.length < 3 && (
                      <TouchableOpacity
                        style={styles.addPhotoButton}
                        onPress={() => {
                          Alert.alert(
                            'Add Photo',
                            'Choose photo source',
                            [
                              { text: 'Camera', onPress: () => pickImage('camera') },
                              { text: 'Photo Library', onPress: () => pickImage('library') },
                              { text: 'Cancel', style: 'cancel' }
                            ]
                          );
                        }}
                      >
                        <Text style={styles.addPhotoText}>+</Text>
                        <Text style={styles.addPhotoLabel}>Add Photo</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.submitRatingButton}
                  onPress={handleAddRating}
                  disabled={loading}
                >
                  <Text style={styles.submitRatingButtonText}>
                    {loading ? 'Submitting...' : 'Submit Rating'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : ratingModalTab === 'reviews' ? (
              <ScrollView style={{ maxHeight: '75%' }}>
                {reviewsLoading ? (
                  <ActivityIndicator size="small" color="#FFF" style={{ marginTop: 12 }} />
                ) : restroomReviews.length === 0 ? (
                  <Text style={styles.noDataText}>No reviews yet. Be the first to review!</Text>
                ) : (
                  restroomReviews.map((r) => (
                    <View key={r.id} style={styles.reviewItem}>
                      <Text style={styles.reviewMeta}>{Number(r.rating || 0).toFixed(1)} 🚽 • {new Date(r.created_at).toLocaleDateString()}</Text>
                      {(r.review_text || r.comment) ? (
                        <Text style={styles.reviewText}>{r.review_text || r.comment}</Text>
                      ) : null}
                      {Array.isArray(r.photos) && r.photos.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosRow}>
                          {r.photos.map((url, idx) => (
                            <TouchableOpacity key={`${r.id}-${idx}`} onPress={() => setPhotoViewer({ visible: true, url })}>
                              <Image source={{ uri: url }} style={styles.photoThumb} />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            ) : (
              <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 10 }}>
                {restroomPhotos.length === 0 ? (
                  <Text style={styles.noDataText}>No photos yet.</Text>
                ) : (
                  restroomPhotos.map((p) => (
                    <TouchableOpacity key={p.key} onPress={() => setPhotoViewer({ visible: true, url: p.url })}>
                      <Image source={{ uri: p.url }} style={styles.photoThumb} />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>



        </KeyboardAvoidingView>
      </Modal>

      {/* Splash Video Overlay - Rendered last so it's on top */}
      {showSplashVideo && (
        <View
          activeOpacity={1}

          style={[StyleSheet.absoluteFill, { zIndex: 10000 }]}
        >
          <Animated.View style={[styles.introSplashContainer, { opacity: splashOpacity }]}>
            <Video
              source={require('./assets/splash3.mp4')}
              style={styles.introSplashVideo}
              resizeMode="cover"
              shouldPlay
              isLooping={false}
              onLoad={() => {
                console.log('✅ Splash video loaded and playing');
              }}
              onPlaybackStatusUpdate={(status) => {
                if (status.didJustFinish && !splashVideoFinished.current) {
                  console.log('🎬 Splash video finished playing');
                  splashVideoFinished.current = true;
                  Animated.timing(splashOpacity, {
                    toValue: 0,
                    duration: 450,
                    useNativeDriver: true,
                  }).start(() => setShowSplashVideo(false));
                }
              }}
            />
            <View style={styles.skipHintContainer} pointerEvents="none">
              <Text style={styles.skipHintText}></Text>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  introSplashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  introSplashVideo: {
    width: '100%',
    height: '100%',
  },
  skipHintContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skipHintText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.85,
  },

  // Landing Page Styles
  homeContainer: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  heroSection: {
    height: height * 0.7,
    position: 'relative',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(107, 68, 35, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#F5F5DC',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  heroDescription: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Features Section
  featuresSection: {
    padding: 30,
    backgroundColor: '##797a7a',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4423',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
    textAlign: 'center',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Call to Action Section
  ctaSection: {
    backgroundColor: '#6B4423',
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#F5F5DC',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  ctaButtons: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#FFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  secondaryButtonText: {
    color: '#FFF',
  },

  // Footer
  footer: {
    backgroundColor: '#2D1810',
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#F5F5DC',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#6B4423',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#F5F5DC',
    marginTop: 5,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 245, 220, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B4423',
    fontWeight: '600',
  },
  markerContainer: {
    backgroundColor: '#8B4513', // Brown color like web app
    borderRadius: 25,
    padding: 8,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    position: 'relative',
    overflow: 'visible', // ensure badges aren’t clipped by marker snapshot
  },
  markerIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  ratingBadge: {
    position: 'absolute',
    // Keep fully inside marker to avoid clipping on iOS/Maps snapshot
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 10,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  accessibilityIndicators: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -15 }],
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  accessibilityIcon: {
    fontSize: 8,
    marginHorizontal: 1,
  },
  bottomInfo: {
    backgroundColor: '#6B4423',
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#FFF',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  adWrapper: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    minHeight: 50,
  },
  adLoadingText: {
    color: '#F5F5DC',
    fontSize: 12,
    fontStyle: 'italic',
  },
  adFreeText: {
    color: '#0dffe7',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#6B4423',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: '#0dffe7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
  },
  secondaryButtonText: {
    color: '#064f48',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  filterModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 350,
  },
  addModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  ratingModal: {
    backgroundColor: '#2C2C2C', // Dark background for better emoji visibility
    borderRadius: 20,
    padding: 20,
    width: '92%',
    maxWidth: 440,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  modalTitleLight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5F5DC', // Light color for dark background
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  closeButtonLight: {
    fontSize: 24,
    color: '#F5F5DC', // Light color for dark background
    fontWeight: 'bold',
  },
  // Restroom Details modal styles
  detailsModal: {
    backgroundColor: 'rgba(26,26,26,0.95)',
    borderRadius: 16,
    marginHorizontal: 12,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#8B6B4A',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tabActive: {
    backgroundColor: '#6B4423',
    borderColor: '#6B4423',
  },
  tabText: {
    color: '#DDD',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  writeReviewButton: {
    marginLeft: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#27AE60',
    borderRadius: 999,
  },
  writeReviewButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  reviewItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)'
  },
  reviewMeta: {
    color: '#BBB',
    marginBottom: 6,
  },
  reviewText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 20,
  },
  photosRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  photoThumb: {
    width: 96,
    height: 96,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#333',
  },
  noDataText: {
    color: '#CCC',
    padding: 16,
    textAlign: 'center',
  },
  imageViewer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImage: {
    width: '100%',
    height: '80%',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },

  // Menu items
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  // Filter items
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  clearFiltersButton: {
    backgroundColor: '#6B4423',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  clearFiltersText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Form elements
  formContainer: {
    maxHeight: 400,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  // Side-by-side layout for rating modal + details pane
  sideBySideRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '95%',
    maxWidth: 900,
  },
  detailsPane: {
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    padding: 20,
    flex: 1,
    minWidth: 0,
    maxWidth: 480,
    maxHeight: '80%',
  },

  textInputDark: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#1a1a1a',
    color: '#F5F5DC',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    marginTop: 20,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchText: {
    fontSize: 16,
    color: '#333',
  },
  addRestroomButton: {
    backgroundColor: '#6B4423',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  addRestroomButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Rating components
  ratingContainer: {
    maxHeight: 400,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F5F5DC', // Light color for dark background
    marginBottom: 10,
    marginTop: 20,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  star: {
    marginHorizontal: 5,
  },
  submitRatingButton: {
    backgroundColor: '#6B4423',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitRatingButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Availability status styles
  availabilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  availabilityOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 2,
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
  },
  availabilityOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Photo upload styles
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  photoPreview: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 10,
  },
  addPhotoText: {
    fontSize: 32,
    color: '#F5F5DC',
    marginBottom: 5,
  },
  addPhotoLabel: {
    fontSize: 12,
    color: '#F5F5DC',
    textAlign: 'center',
  },

  // Ranking page styles
  rankingContainer: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  rankingsList: {
    flex: 1,
    padding: 20,
  },
  rankingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4423',
    textAlign: 'center',
    marginBottom: 20,
  },
  rankingItem: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingHeader: {
    alignItems: 'center',
    marginRight: 15,
  },
  rankingNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  rankingStars: {
    alignItems: 'center',
    marginTop: 5,
  },
  starText: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B4423',
    marginTop: 2,
  },
  rankingContent: {
    flex: 1,
  },
  restroomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
    marginBottom: 5,
  },
  restroomDetails: {
    fontSize: 12,
    color: '#666',
  },
  rateButton: {
    backgroundColor: '#6B4423',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  rateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4423',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Simple map button styles
  simpleMapButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 3,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
  },

  // Guide to Relief section styles
  guideSection: {
    backgroundColor: '#F5F5DC',
    paddingVertical: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  guideContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  guideTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6B4423',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  guideSubtitle: {
    fontSize: 20,
    color: '#6B4423',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    opacity: 0.8,
  },
  guideDescription: {
    fontSize: 16,
    color: '#6B4423',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    opacity: 0.9,
  },
  guideCtaButton: {
    backgroundColor: '#6B4423',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  guideCtaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
