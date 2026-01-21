export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "PLACEHOLDER_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "placeholder-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "placeholder-bucket.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "00000000000",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:00000000000:web:00000000000000",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-PLACEHOLDER"
};
