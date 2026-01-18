import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { initializeAnalytics, Analytics } from 'firebase/analytics';
import { getPerformance, FirebasePerformance } from 'firebase/performance';
import { firebaseConfig } from './config';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;
let performance: FirebasePerformance | undefined;

// Check if the configuration has been updated from the placeholders
if (firebaseConfig.apiKey !== "PLACEHOLDER_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Initialize Firestore with persistent offline cache
    // This allows the app to work offline and sync when online
    db = initializeFirestore(app, {
      localCache: persistentLocalCache()
    });

    // Initialize Analytics and Performance Monitoring
    // These are initialized conditionally to prevent crashes in non-browser environments (like tests)
    // or if the browser blocks them.
    if (typeof window !== 'undefined') {
        try {
            // We use initializeAnalytics instead of getAnalytics to configure privacy settings
            // This disables ad personalization features to be more privacy-friendly
            analytics = initializeAnalytics(app, {
                config: {
                    allow_ad_personalization_signals: false,
                    allow_google_signals: false
                }
            });
            performance = getPerformance(app);
        } catch (e) {
            console.warn("Firebase Analytics/Performance initialization failed (possibly blocked or unsupported):", e);
        }
    }

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.warn("Firebase is not configured. Please update src/firebase/config.ts with your project details.");
}

export { app, auth, db, analytics, performance };
