/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, OperationType, Habit } from '../types';
import { handleFirestoreError } from './errorService';

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
};

export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  try {
    const q = query(collection(db, 'habits'), orderBy('createdAt', 'desc'));
    // Since we are admins, we can see all habits but we should still filter by userId if needed
    // Actually the rules allow list for admin without constraint
    const snaps = await getDocs(q);
    return snaps.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Habit))
      .filter(h => h.userId === userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'habits');
    return [];
  }
};

export const toggleUserActiveStatus = async (userId: string, isActive: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isActive });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};
