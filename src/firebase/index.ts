
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, connectAuthEmulator } from 'firebase/auth';
import { Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Initializes and returns Firebase services, creating a new app instance if one
 * doesn't already exist. It also connects to local emulators if the
 * appropriate environment variables are set.
 *
 * This function is designed to work on both the server and the client.
 *
 * @returns {Object} An object containing the initialized Firebase services:
 *   - firebaseApp: The Firebase app instance.
 *   - auth: The Firebase Auth service instance.
 *   - firestore: The Firebase Firestore service instance.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  let auth: Auth;
  let firestore: Firestore;

  // Initialize the Firebase app, or get the existing one.
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  // Get the Auth and Firestore service instances.
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);

  // Connect to local emulators in development mode if the host environment variables are set.
  // This is a check to see if we're in a browser environment before using window.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Check if the Auth emulator is running and connect if so.
    if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST && !auth.emulatorConfig) {
      connectAuthEmulator(auth, `http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
    }
    // Check if the Firestore emulator is running and connect if so.
    if (process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST) {
        try {
            connectFirestoreEmulator(firestore, 'localhost', 8080);
        } catch (e) {
            // Emulator may already be connected
        }
    }
  }

  return { firebaseApp, auth, firestore };
}
