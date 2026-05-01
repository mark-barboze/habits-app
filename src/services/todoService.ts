/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Todo, OperationType } from '../types';
import { handleFirestoreError } from './errorService';

const getTodosCol = (userId: string) => collection(db, 'users', userId, 'todos');

export const createTodo = async (userId: string, todo: Omit<Todo, 'id' | 'userId' | 'createdAt'>) => {
  if (!userId) return;
  
  try {
    const newTodo = {
      ...todo,
      userId,
      createdAt: serverTimestamp(),
    };
    
    await addDoc(getTodosCol(userId), newTodo);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/todos`);
  }
};

export const updateTodo = async (userId: string, todoId: string, updates: Partial<Todo>) => {
  if (!userId) return;

  try {
    const todoRef = doc(db, 'users', userId, 'todos', todoId);
    await updateDoc(todoRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/todos/${todoId}`);
  }
};

export const deleteTodo = async (userId: string, todoId: string) => {
  if (!userId) {
    throw new Error("User ID is required to delete todos");
  }
  
  try {
    const todoRef = doc(db, 'users', userId, 'todos', todoId);
    await deleteDoc(todoRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/todos/${todoId}`);
    throw error;
  }
};

import { startOfDay } from 'date-fns';

export const subscribeToUserTodos = (userId: string, callback: (todos: Todo[]) => void) => {
  if (!userId) return () => {};

  const q = query(getTodosCol(userId));
  
  return onSnapshot(q, (snapshot) => {
    const today = startOfDay(new Date());
    const todos = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data } as Todo;
    })
    .sort((a, b) => {
      const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
      const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    })
    .filter(todo => {
      // Logic: 
      // 1. If not completed, always show (Carry forward)
      // 2. If completed, only show if it was completed today OR created today
      if (!todo.completed) return true;
      
      const compDate = todo.completedAt?.toDate ? todo.completedAt.toDate() : (todo.completedAt ? new Date(todo.completedAt) : null);
      const createDate = todo.createdAt?.toDate ? todo.createdAt.toDate() : new Date(todo.createdAt);
      
      if (compDate && compDate >= today) return true;
      if (createDate >= today) return true;
      
      return false;
    });
    
    callback(todos);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/todos`);
  });
};

export const toggleTodoCompletion = async (userId: string, todoId: string, completed: boolean) => {
  if (!userId) return;

  try {
    const todoRef = doc(db, 'users', userId, 'todos', todoId);
    await updateDoc(todoRef, { 
      completed,
      completedAt: completed ? serverTimestamp() : null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/todos/${todoId}`);
  }
};
