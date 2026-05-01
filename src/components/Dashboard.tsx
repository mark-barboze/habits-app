/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthGuard';
import { 
  subscribeToUserHabits, 
  subscribeToCompletions, 
  toggleHabitCompletion, 
  createHabit, 
  updateHabit, 
  deleteHabit 
} from '../services/habitService';
import { 
  subscribeToUserTodos, 
  toggleTodoCompletion, 
  createTodo, 
  updateTodo, 
  deleteTodo 
} from '../services/todoService';
import { calculateProgress } from '../lib/logic';
import { Habit, Completion, Todo } from '../types';
import { HabitCard } from './HabitCard';
import { HabitModal } from './HabitModal';
import { TodoCard } from './TodoCard';
import { TodoModal } from './TodoModal';
import { QuoteWidget } from './QuoteWidget';
import { Plus, ListCheck, TrendingUp, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    
    const unsubHabits = subscribeToUserHabits(user.uid, (data) => {
      console.log(`Dashboard: subscribeToUserHabits listener fired. Received ${data.length} habits.`);
      setHabits(data);
    });
    const unsubTodos = subscribeToUserTodos(user.uid, (data) => {
      console.log(`Dashboard: subscribeToUserTodos listener fired. Received ${data.length} todos.`);
      setTodos(data);
    });
    const unsubCompletions = subscribeToCompletions(user.uid, today, (data) => {
      console.log(`Dashboard: subscribeToCompletions listener fired. Received ${data.length} completions.`);
      setCompletions(data);
    });
    
    return () => {
      unsubHabits();
      unsubTodos();
      unsubCompletions();
    };
  }, [user, today]);

  const handleHabitSave = async (data: any) => {
    if (!user) return;
    if (editingHabit) {
      await updateHabit(user.uid, editingHabit.id, data);
    } else {
      await createHabit(user.uid, data);
    }
    setIsHabitModalOpen(false);
    setEditingHabit(undefined);
  };

  const handleTodoSave = async (data: any) => {
    if (!user) return;
    if (editingTodo) {
      await updateTodo(user.uid, editingTodo.id, data);
    } else {
      await createTodo(user.uid, data);
    }
    setIsTodoModalOpen(false);
    setEditingTodo(undefined);
  };

  const handleHabitDelete = async (habit: Habit) => {
    if (!user) return;
    try {
      // Optimistic update fallback: remove from local state immediately
      setHabits(prev => prev.filter(h => h.id !== habit.id));
      
      await deleteHabit(user.uid, habit.id);
      
      setIsHabitModalOpen(false);
      setEditingHabit(undefined);
    } catch (error: any) {
      console.error("Dashboard: [DELETE ERROR] habit:", habit.id, error);
    }
  };

  const handleTodoDelete = async (todoId: string) => {
    if (!user) return;
    try {
      // Optimistic update fallback: remove from local state immediately
      setTodos(prev => prev.filter(t => t.id !== todoId));

      await deleteTodo(user.uid, todoId);
      
      setIsTodoModalOpen(false);
      setEditingTodo(undefined);
    } catch (error: any) {
      console.error("Dashboard: [DELETE ERROR] todo:", todoId, error);
    }
  };

  const sortedHabits = [...habits].sort((a, b) => {
    const aDone = completions.some(c => c.habitId === a.id);
    const bDone = completions.some(c => c.habitId === b.id);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const { progress: completionRate } = calculateProgress(habits, todos, completions);

  return (
    <div className="space-y-10">
      <QuoteWidget />
      
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black text-white dark:bg-white dark:text-black p-8 rounded-[2rem] flex flex-col justify-between space-y-8">
          <div>
            <h2 className="text-4xl font-bold tracking-tight">Daily Progress</h2>
            <p className="opacity-60 text-sm mt-2">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-6xl font-bold">{completionRate}%</span>
              <p className="text-xs uppercase tracking-widest font-bold opacity-60">Success Rate</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 dark:bg-black/10 flex items-center justify-center">
              <TrendingUp size={32} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => { setEditingHabit(undefined); setIsHabitModalOpen(true); }}
            className="group bg-gray-50 dark:bg-[#121212] p-6 rounded-[2rem] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center">
                <Plus size={24} />
              </div>
              <div className="text-left">
                <span className="block text-xl font-bold">Add Habit</span>
                <span className="text-xs text-gray-500 font-medium">Build long-term consistency</span>
              </div>
            </div>
          </button>

          <button 
            onClick={() => { setEditingTodo(undefined); setIsTodoModalOpen(true); }}
            className="group bg-gray-50 dark:bg-[#121212] p-6 rounded-[2rem] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center">
                <ListCheck size={24} />
              </div>
              <div className="text-left">
                <span className="block text-xl font-bold">Add To-Do</span>
                <span className="text-xs text-gray-500 font-medium">Quick tasks for today</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Unified List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold tracking-tight">Today's Focus</h3>
        </div>

        {habits.length === 0 && todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-[#121212]/50 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 font-medium">Clear schedule! Add something to track.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {habits.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 pl-2">
                  <TrendingUp size={14} />
                  <span>Habits</span>
                </div>
                <div className="grid gap-3">
                  <AnimatePresence mode="popLayout">
                    {sortedHabits.map((habit) => (
                      <HabitCard 
                        key={habit.id}
                        habit={habit}
                        isCompleted={completions.some(c => c.habitId === habit.id)}
                        onToggle={() => user && toggleHabitCompletion(user.uid, habit, today)}
                        onEdit={() => { setEditingHabit(habit); setIsHabitModalOpen(true); }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {todos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 pl-2">
                  <CheckCircle2 size={14} />
                  <span>To-Dos</span>
                </div>
                <div className="grid gap-3">
                  <AnimatePresence mode="popLayout">
                    {sortedTodos.map((todo) => (
                      <TodoCard 
                        key={todo.id}
                        todo={todo}
                        onToggle={() => user && toggleTodoCompletion(user.uid, todo.id, !todo.completed)}
                        onEdit={() => { setEditingTodo(todo); setIsTodoModalOpen(true); }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isHabitModalOpen && (
          <HabitModal 
            habit={editingHabit}
            onClose={() => { setIsHabitModalOpen(false); setEditingHabit(undefined); }}
            onSave={handleHabitSave}
            onDelete={editingHabit ? () => handleHabitDelete(editingHabit) : undefined}
          />
        )}
        {isTodoModalOpen && (
          <TodoModal
            todo={editingTodo}
            onClose={() => { setIsTodoModalOpen(false); setEditingTodo(undefined); }}
            onSave={handleTodoSave}
            onDelete={editingTodo ? () => handleTodoDelete(editingTodo.id) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
