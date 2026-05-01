/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Todo } from '../types';
import { Check, MoreVertical, Edit2, Trash2, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface TodoCardProps {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
}

const COLOR_MAP: Record<string, string> = {
  black: 'bg-black dark:bg-white',
  green: 'bg-green-500',
  red: 'bg-red-500'
};

const TEXT_COLOR_MAP: Record<string, string> = {
  black: 'text-black dark:text-white',
  green: 'text-green-500',
  red: 'text-red-500'
};

export const TodoCard: React.FC<TodoCardProps> = ({ 
  todo, 
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
        "group relative bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/20 dark:hover:shadow-black/40",
        todo.completed && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button 
            onClick={onToggle}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-95 border-2",
              todo.completed 
                ? "bg-green-500 border-green-500 text-white" 
                : "bg-transparent border-gray-200 dark:border-gray-700"
            )}
          >
            {todo.completed ? <Check size={18} /> : null}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-semibold truncate",
              todo.completed && "text-gray-400 dark:text-gray-600 line-through decoration-2"
            )}>
              {todo.text}
            </h3>
            <div className="flex items-center space-x-2">
               <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 opacity-60">To-Do</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onEdit}
          className="p-2 text-gray-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </motion.div>
  );
};
