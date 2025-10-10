// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCy3vq_hwtsAYylrscz-zW82vALb4nPJO4",
  authDomain: "narayanganj-traveller-bd.firebaseapp.com",
  databaseURL: "https://narayanganj-traveller-bd-default-rtdb.firebaseio.com",
  projectId: "narayanganj-traveller-bd",
  storageBucket: "narayanganj-traveller-bd.firebasestorage.app",
  messagingSenderId: "275509624245",
  appId: "1:275509624245:web:d38230dbc6d7a5a813edfc",
  measurementId: "G-0RE0D001NS"
};

// Initialize Firebase (check if already initialized)
let app;
try {
  // Try to get existing app first
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    // App already exists, get the existing one
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } else {
    throw error;
  }
}

// Initialize Analytics (only in browser environment)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Analytics initialization failed:', error);
}

// Initialize Firebase services
let auth, db, storage, realtimeDb;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize Realtime Database with error handling
  try {
    realtimeDb = getDatabase(app);
    console.log('Firebase Realtime Database initialized successfully');
    console.log('Firebase Realtime Database URL:', firebaseConfig.databaseURL);
  } catch (rtdbError) {
    console.warn('Firebase Realtime Database initialization failed:', rtdbError);
    console.warn('Please enable Realtime Database in Firebase Console: https://console.firebase.google.com/project/narayanganj-traveller-bd/database');
    realtimeDb = null;
  }
  
  console.log('Firebase initialized successfully with real configuration');
} catch (error) {
  console.error('Firebase services initialization failed:', error);
  // Create mock objects to prevent crashes
  auth = null;
  db = null;
  storage = null;
  realtimeDb = null;
}

export { auth, db, storage, realtimeDb, analytics };

// Export demo config flag (now false since we're using real Firebase)
export const isDemoConfig = false;

// Email link authentication settings
export const getEmailLinkSettings = () => ({
  // URL to redirect to after email confirmation
  url: typeof window !== 'undefined' ? `${window.location.origin}/auth/verify-email` : 'http://localhost:8080/auth/verify-email',
  // Whether to handle the code in the app
  handleCodeInApp: true,
  // iOS bundle ID (if applicable)
  iOS: {
    bundleId: 'com.narayanganj.traveller'
  },
  // Android package name (if applicable)
  android: {
    packageName: 'com.narayanganj.traveller',
    installApp: true,
    minimumVersion: '12'
  },
  // Dynamic link domain (if using Firebase Dynamic Links)
  dynamicLinkDomain: 'narayanganj-traveller-bd.page.link'
});

export default app;
