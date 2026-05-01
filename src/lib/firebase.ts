/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

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

// ✅ Safe initialization (only once)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

console.log("Firebase Project ID:", firebaseConfig.projectId);

// ✅ Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 🔍 Auth state debug
onAuthStateChanged(auth, (user) => {
  console.log("Auth state:", user);
});

// 🧪 Optional test
export async function testFirestoreConnection() {
  try {
    console.log('Testing Firestore connection for project:', firebaseConfig.projectId);
    await getDocFromServer(doc(db, '_health_', 'test'));
    console.log('Firestore connected successfully');
  } catch (error: any) {
    console.error('Firestore connection error detail:', error);
    if (error.code === 'permission-denied') {
      console.log('Firestore connected, but access was denied (check rules)');
    }
  }
}

export { signInWithPopup };
