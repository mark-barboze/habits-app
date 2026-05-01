import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-uJSg3992GW09pBJ5J-HAsUQ5tblXAOc",
  authDomain: "habits-11ca1.firebaseapp.com",
  projectId: "habits-11ca1",
  storageBucket: "habits-11ca1.appspot.com",
  messagingSenderId: "391545166130",
  appId: "1:391545166130:web:eda8b184262e2cd5209f2b"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();