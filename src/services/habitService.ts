/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Habit, Completion, OperationType } from '../types';
import { handleFirestoreError } from './errorService';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { updateDailyQuoteCompletions } from './quoteService';

const getHabitsCol = (userId: string) => collection(db, 'users', userId, 'habits');
const getCompletionsCol = (userId: string) => collection(db, 'users', userId, 'completions');

export const createHabit = async (userId: string, habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'streakCurrent' | 'streakLongest' | 'isActive'>) => {
  console.log("Add habit triggered");
  console.log("User ID:", auth.currentUser?.uid);

  if (!userId) return;
  
  try {
    const newHabit = {
      ...habit,
      userId,
      streakCurrent: 0,
      streakLongest: 0,
      isActive: true,
      createdAt: serverTimestamp(),
    };
    
    console.log(`Collection path: users/${userId}/habits`);
    console.log("Writing to Firestore...");
    await addDoc(getHabitsCol(userId), newHabit);
    console.log("Write SUCCESS");
  } catch (error) {
    console.error("Write FAILED:", error);
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/habits`);
  }
};

export const updateHabit = async (userId: string, habitId: string, updates: Partial<Habit>) => {
  if (!userId) return;

  try {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);
    await updateDoc(habitRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/habits/${habitId}`);
  }
};

export const deleteHabit = async (userId: string, habitId: string) => {
  if (!userId) {
    throw new Error("User ID is required to delete habits");
  }
  
  try {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);
    await deleteDoc(habitRef);
    
    // Also delete completions
    const q = query(
      getCompletionsCol(userId), 
      where('habitId', '==', habitId)
    );
    const snaps = await getDocs(q);
    
    const deletePromises = snaps.docs.map(snap => deleteDoc(snap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/habits/${habitId}`);
    throw error;
  }
};

export const subscribeToUserHabits = (userId: string, callback: (habits: Habit[]) => void) => {
  if (!userId) return () => {};

  const q = query(getHabitsCol(userId));
  
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Habit))
      .sort((a, b) => {
        const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
        const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
    callback(habits);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/habits`);
  });
};

export const toggleHabitCompletion = async (userId: string, habit: Habit, date: string) => {
  if (!userId) return;
  
  const habitId = habit.id;
  
  try {
    const q = query(
      getCompletionsCol(userId), 
      where('habitId', '==', habitId),
      where('date', '==', date)
    );
    
    const snaps = await getDocs(q);
    
    if (snaps.empty) {
      // Complete habit
      await addDoc(getCompletionsCol(userId), {
        habitId,
        userId,
        date,
        completedAt: serverTimestamp()
      });
      
      // Update streaks
      await updateStreak(userId, habitId, date, true);
      
      // Update daily quote completions count
      await updateDailyQuoteCompletions(userId, 1);
    } else {
      // Uncomplete habit
      await deleteDoc(snaps.docs[0].ref);
      
      // Update streaks
      await updateStreak(userId, habitId, date, false);

      // Update daily quote completions count
      await updateDailyQuoteCompletions(userId, -1);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/completions`);
  }
};

const updateStreak = async (userId: string, habitId: string, date: string, isIncrement: boolean) => {
  if (!userId) return;

  // Simplistic streak logic: only update if it's today
  const today = format(new Date(), 'yyyy-MM-dd');
  if (date !== today) return; 

  const habitRef = doc(db, 'users', userId, 'habits', habitId);
  const habitSnap = await getDoc(habitRef);
  if (!habitSnap.exists()) return;
  
  const habitData = habitSnap.data() as Habit;
  let { streakCurrent, streakLongest, lastCompletionDate } = habitData;
  
  if (isIncrement) {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    if (lastCompletionDate === yesterday) {
      streakCurrent += 1;
    } else {
      streakCurrent = 1;
    }
    
    if (streakCurrent > streakLongest) {
      streakLongest = streakCurrent;
    }
    
    await updateDoc(habitRef, {
      streakCurrent,
      streakLongest,
      lastCompletionDate: date
    });
  } else {
    // If we uncomplete today's habit, streak resets or decreases
    // Simplification: reset to 0
    await updateDoc(habitRef, {
      streakCurrent: 0,
      lastCompletionDate: null
    });
  }
};

export const subscribeToCompletions = (userId: string, date: string, callback: (completions: Completion[]) => void) => {
  if (!userId) return () => {};

  const q = query(
    getCompletionsCol(userId),
    where('date', '==', date)
  );
  
  return onSnapshot(q, (snapshot) => {
    const completions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Completion));
    callback(completions);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/completions`);
  });
};

export const getUserCompletionsForRange = async (userId: string, startDate: string, endDate: string) => {
  if (!userId) return [];

  try {
    const q = query(
      getCompletionsCol(userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map(doc => ({ id: doc.id, ...doc.data() } as Completion));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/completions`);
    return [];
  }
};
