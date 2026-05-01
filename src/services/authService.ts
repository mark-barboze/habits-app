/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup } from '../lib/firebase';
import { UserProfile, OperationType } from '../types';
import { handleFirestoreError } from './errorService';

export const loginWithGoogle = async () => {
  try {
    let currentStep = 'signIn';
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    currentStep = 'getDoc:users';
    // Check if user profile exists, if not create it
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
        isAdmin: isAdmin,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        isActive: true,
      };
      
      currentStep = 'setDoc:users';
      await setDoc(userRef, newUser);
    } else {
      currentStep = 'updateDoc:users';
      // Update last active
      await updateDoc(userRef, {
        lastActive: serverTimestamp()
      });
    }
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return;
    }
    console.error(`Error in loginWithGoogle at step: ${currentStep}`, error);
    handleFirestoreError(error, OperationType.WRITE, currentStep);
  }
};

export const logout = () => signOut(auth);

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
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
