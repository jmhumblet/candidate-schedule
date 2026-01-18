# Firebase Configuration

To enable the backend features (Authentication, Cloud Storage, Sharing), you must configure Firebase.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  Add a Web App to your project.
4.  Copy the `firebaseConfig` object.
5.  Open `src/firebase/config.ts` in this project.
6.  Replace the placeholder values with your real configuration.

## Firestore Rules

To secure your data, copy the contents of `firestore.rules` (in the root directory) to your Firebase Console > Firestore Database > Rules.

## Features

*   **Google Login:** Enabled in Sidebar.
*   **Session Sync:** Sessions are saved to Firestore when logged in.
*   **Offline Support:** Works offline and syncs when online.
*   **Sharing:** Share sessions via email (requires the recipient to log in with that email).
