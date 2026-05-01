import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { OperationType } from '../types';
import { handleFirestoreError } from './errorService';

const HABITS_COLLECTION = 'habits';
const TODOS_COLLECTION = 'todos';
const COMPLETIONS_COLLECTION = 'completions';
const REPORTS_COLLECTION = 'weekly_reports';
const DAILY_QUOTES_COLLECTION = 'dailyQuotes';
const USERS_COLLECTION = 'users';

export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const userId = user.uid;

  try {
    // 1. Delete documents in subcollections
    const subCollections = [
      'habits',
      'todos',
      'completions',
      'reports',
      'dailyQuotes'
    ];

    for (const collName of subCollections) {
      const collRef = collection(db, 'users', userId, collName);
      const snap = await getDocs(collRef);
      
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
      }
    }

    // 2. Delete the user profile document
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    // 3. Finally delete the auth user
    await deleteUser(user);
  } catch (error) {
    console.error("Account deletion error:", error);
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    throw error;
  }
};
