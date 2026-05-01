import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔥 Config
const firebaseConfig = {
  apiKey: "AIzaSyA-uJSg3992GW09pBJ5J-HAsUQ5tblXAOc",
  authDomain: "habits-11ca1.firebaseapp.com",
  projectId: "habits-11ca1",
  storageBucket: "habits-11ca1.appspot.com",
  messagingSenderId: "391545166130",
  appId: "1:391545166130:web:eda8b184262e2cd5209f2b"
};

// 🔒 SINGLE APP INSTANCE
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🔒 FORCE AUTH TO BIND HERE (THIS IS THE KEY)
export const auth = initializeAuth(app, {
  persistence: undefined // let browser decide default
});

// fallback safety (some environments need this)
try {
  getAuth(app);
} catch {}

// 🔒 Firestore
export const db = getFirestore(app);

// 🔒 Provider
export const googleProvider = new GoogleAuthProvider();
