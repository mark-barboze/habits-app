/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-uJSg3992GW09pBJ5J-HAsUQ5tblXAOc",
  authDomain: "habits-11ca1.firebaseapp.com",
  projectId: "habits-11ca1",
  storageBucket: "habits-11ca1.firebasestorage.app",
  messagingSenderId: "391545166130",
  appId: "1:391545166130:web:eda8b184262e2cd5209f2b"
};

const app = initializeApp(firebaseConfig);
console.log("Firebase Project ID:", firebaseConfig.projectId);
export const db = getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
  console.log("Auth state:", user);
});

export async function testFirestoreConnection() {
  try {
    // Attempt to read a dummy document to verify connection
    // We use a specific document to avoid "collection not found" type warnings
    console.log('Testing Firestore connection for project:', firebaseConfig.projectId);
    await getDocFromServer(doc(db, '_health_', 'test'));
    console.log('Firestore connected successfully');
  } catch (error: any) {
    console.error('Firestore connection error detail:', error);
    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error('CRITICAL: Please check your Firebase configuration or internet connection.');
    } else if (error.code === 'permission-denied') {
      console.log('Firestore connected, but access was denied (check rules)');
    } else {
      console.warn('Initial Firestore connection check notice:', error.message);
    }
  }
}

export { signInWithPopup };
