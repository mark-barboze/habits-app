/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Habit } from '../types';
import { Check, Flame, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  isCompleted, 
  onToggle, 
  onEdit 
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/20 dark:hover:shadow-black/40",
        isCompleted && "bg-gray-50/50 dark:bg-gray-800/30"
      )}
    >
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button 
            onClick={onToggle}
            className={cn(
              "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 transform active:scale-95 border-2",
              isCompleted 
                ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30" 
                : "bg-transparent border-gray-200 dark:border-gray-700 text-transparent hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            <Check size={24} className={cn("transition-opacity", isCompleted ? "opacity-100" : "opacity-0 group-hover:opacity-40 group-hover:text-gray-400")} />
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-semibold tracking-tight truncate",
              isCompleted && "text-gray-400 dark:text-gray-600 line-through decoration-2"
            )}>
              {habit.name}
            </h3>
            <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className={cn(
                "px-2 py-0.5 rounded-md",
                habit.difficulty === 'hard' 
                  ? "bg-red-500/10 text-red-500" 
                  : "bg-blue-500/10 text-blue-500"
              )}>
                {habit.difficulty === 'hard' ? 'HARD' : 'EASY'}
              </span>
              {habit.category && (
                <span className="opacity-50">•</span>
              )}
              {habit.category && (
                <span>{habit.category}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl">
            <Flame size={16} className={cn(
              "transition-colors",
              habit.streakCurrent > 0 ? "text-orange-500" : "text-gray-300 dark:text-gray-700"
            )} />
            <span className="text-sm font-bold">{habit.streakCurrent}</span>
          </div>

          <button 
            onClick={onEdit}
            className="p-2 text-gray-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
