/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Habit, Completion, Todo } from '../types';

export const calculateProgress = (habits: Habit[], todos: Todo[], completions: Completion[]) => {
  const totalTasks = habits.length + todos.length;
  const completedHabits = completions.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const completedTasks = completedHabits + completedTodos;
  
  const progress = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
    
  return {
    total: totalTasks,
    completed: completedTasks,
    progress,
    remaining: totalTasks - completedTasks
  };
};
