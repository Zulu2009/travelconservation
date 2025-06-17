import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration for TravelConservation
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDrgW4eEblv_meou81pCJ1VcpiaB_llt4g',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'travelconservation-b4f04.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'travelconservation-b4f04',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'travelconservation-b4f04.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '1076018123076',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:1076018123076:web:8cf0799de2408810a50711',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-SLYS2Z3JSM'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
  // Connect to Firebase emulators
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

// Firebase app instance
export default app;

// Type definitions for Firebase
export type FirebaseApp = typeof app;
export type FirebaseAuth = typeof auth;
export type FirebaseFirestore = typeof db;
export type FirebaseStorage = typeof storage;
export type FirebaseFunctions = typeof functions;
