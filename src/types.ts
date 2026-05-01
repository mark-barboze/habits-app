/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  createdAt: any; // Firestore Timestamp
  lastActive: any; // Firestore Timestamp
  isActive: boolean;
}

export type HabitDifficulty = 'easy' | 'hard';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  difficulty: HabitDifficulty;
  category?: string;
  streakCurrent: number;
  streakLongest: number;
  lastCompletionDate?: string; // YYYY-MM-DD
  createdAt: any; // Firestore Timestamp
  isActive: boolean;
}

export interface Todo {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  color: 'black' | 'green' | 'red';
  createdAt: any; // Firestore Timestamp
  completedAt?: any; // Firestore Timestamp
}

export interface Completion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedAt: any; // Firestore Timestamp
}

export interface Quote {
  text: string;
  author: string;
  category: string;
}

export interface DailyQuote extends Quote {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completionsToday: number;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  createdAt: any;
  dateRange: {
    start: string;
    end: string;
  };
  stats: {
    totalHabits: number;
    completedHabits: number;
    totalTodos: number;
    completedTodos: number;
    streak: number;
  };
  aiContent: {
    summary: string;
    whatWentWrong: string;
    improvementSteps: string;
    quote: string;
  };
  progressData: { day: string; value: number }[];
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
