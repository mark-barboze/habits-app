/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA-uJSg3992GW09pBJ5J-HAsUQ5tblXAOc",
  authDomain: "habits-11ca1.firebaseapp.com",
  projectId: "habits-11ca1",
  storageBucket: "habits-11ca1.firebasestorage.app",
  messagingSenderId: "391545166130",
  appId: "1:391545166130:web:eda8b184262e2cd5209f2b"
};

// 🔍 Debug logs
console.log("🔥 API KEY CHECK:", firebaseConfig.apiKey);
console.log("🔥 FULL CONFIG:", JSON.stringify(firebaseConfig));

// ✅ Initialize app safely
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

console.log("Firebase Project ID:", firebaseConfig.projectId);

// ✅ Services (BOUND TO SAME APP)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// 🔍 Debug auth state
onAuthStateChanged(auth, (user) => {
  console.log("Auth state:", user);
});

// ❌ DO NOT export signInWithPopup
// ❌ DO NOT import firebase/auth functions here unnecessarily
