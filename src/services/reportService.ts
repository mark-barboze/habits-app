import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  orderBy, 
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { WeeklyReport, OperationType } from '../types';
import { handleFirestoreError } from './errorService';
import { startOfWeek, endOfWeek, format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { generateWeeklySummary } from './geminiService';

const getHabitsCol = (userId: string) => collection(db, 'users', userId, 'habits');
const getTodosCol = (userId: string) => collection(db, 'users', userId, 'todos');
const getCompletionsCol = (userId: string) => collection(db, 'users', userId, 'completions');
const getReportsCol = (userId: string) => collection(db, 'users', userId, 'reports');

export const generateAndSaveWeeklyReport = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");

  const now = new Date();
  const start = startOfWeek(subDays(now, 1)); // Previous week
  const end = endOfWeek(subDays(now, 1));

  // 1. Fetch habits
  const habitsQuery = query(getHabitsCol(userId));
  const habitsSnap = await getDocs(habitsQuery);
  const habits = habitsSnap.docs.map(d => d.data().name);

  // 2. Fetch completions for the period
  const completionsQuery = query(getCompletionsCol(userId));
  const completionsSnap = await getDocs(completionsQuery);
  const weeklyCompletions = completionsSnap.docs.filter(d => {
    const date = parseISO(d.data().date);
    return isWithinInterval(date, { start, end });
  });

  // 3. Fetch todos for the period
  const todosQuery = query(getTodosCol(userId));
  const todosSnap = await getDocs(todosQuery);
  const weeklyTodos = todosSnap.docs.filter(d => {
    const created = d.data().createdAt?.toDate() || new Date();
    return d.data().completed && isWithinInterval(created, { start, end });
  });

  // 4. Calculate stats
  // Total habits just means the count of habits the user has
  const totalHabits = habitsSnap.docs.length;
  // Completed habits is the count of unique habit completions this week
  const completedHabits = weeklyCompletions.length;
  // Total todos created or active in this period
  const totalTodosQuery = query(getTodosCol(userId));
  const totalTodosSnap = await getDocs(totalTodosQuery);
  const totalTodos = totalTodosSnap.docs.filter(d => {
    const created = d.data().createdAt?.toDate() || new Date(0);
    return isWithinInterval(created, { start, end });
  }).length;
  
  const completedTodos = weeklyTodos.length;
  const streak = habitsSnap.docs.reduce((acc, d) => acc + (d.data().streakCurrent || 0), 0);

  const stats = {
    totalHabits,
    completedHabits,
    totalTodos,
    completedTodos,
    streak
  };

  // 5. Generate progress data for graph
  const progressData = [];
  for (let i = 0; i < 7; i++) {
    const day = format(subDays(end, 6 - i), 'EEE');
    const dayDate = format(subDays(end, 6 - i), 'yyyy-MM-dd');
    const dayCompletions = weeklyCompletions.filter(c => c.data().date === dayDate).length;
    progressData.push({ day, value: dayCompletions });
  }

  // 6. Get AI Content
  const aiContent = await generateWeeklySummary(stats, habits, weeklyTodos.map(t => t.data().text));

  const reportData = {
    userId,
    createdAt: serverTimestamp(),
    dateRange: {
      start: format(start, 'MMM dd'),
      end: format(end, 'MMM dd, yyyy')
    },
    stats,
    aiContent,
    progressData
  };

  try {
    const docRef = await addDoc(getReportsCol(userId), reportData);
    return { id: docRef.id, ...reportData };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/reports`);
    throw error;
  }
};

export const getLatestWeeklyReport = async (userId: string) => {
  if (!userId) return null;

  try {
    const q = query(getReportsCol(userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    // Sort in-memory to avoid needing a composite index
    const sortedDocs = [...snap.docs].sort((a, b) => {
      const aTime = a.data().createdAt?.toDate()?.getTime() || 0;
      const bTime = b.data().createdAt?.toDate()?.getTime() || 0;
      return bTime - aTime;
    });
    
    const doc = sortedDocs[0];
    const data = doc.data();
    
    // Check for 24h expiry
    const createdAt = data.createdAt?.toDate() || new Date();
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation > 24) return null;

    return { id: doc.id, ...data } as WeeklyReport;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/reports`);
    return null;
  }
};

export const deleteWeeklyReport = async (reportId: string, userId: string) => {
  if (!userId) return;

  try {
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'users', userId, 'reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/reports/${reportId}`);
    throw error;
  }
};
