import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

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

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.warn("Firebase is not configured. Please update src/firebase/config.ts with your project details.");
}

export { app, auth, db };
