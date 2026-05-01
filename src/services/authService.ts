/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ✅ Import ONLY types + specific helpers (no default auth creation)
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

// ✅ ALWAYS use centralized Firebase instance
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

import { UserProfile, OperationType } from '../types';
import { handleFirestoreError } from './errorService';

// 🔐 Login with Google
export const loginWithGoogle = async () => {
  let currentStep = 'signIn';

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    currentStep = 'getDoc:users';

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      currentStep = 'getDoc:admins';

      const isAdminRef = doc(db, 'admins', user.uid);
      const isAdminSnap = await getDoc(isAdminRef);
      const isAdmin = isAdminSnap.exists();

      const newUser: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        isAdmin,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        isActive: true,
      };

      currentStep = 'setDoc:users';
      await setDoc(userRef, newUser);
    } else {
      currentStep = 'updateDoc:users';

      await updateDoc(userRef, {
        lastActive: serverTimestamp(),
      });
    }
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      return;
    }

    console.error(`Error in loginWithGoogle at step: ${currentStep}`, error);
    handleFirestoreError(error, OperationType.WRITE, currentStep);
  }
};

// 🚪 Logout
export const logout = () => signOut(auth);

// 🔁 Auth listener
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

// 👤 Get user profile
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};
