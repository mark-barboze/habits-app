/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import { Todo } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TodoModalProps {
  todo?: Todo;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
}

export const TodoModal: React.FC<TodoModalProps> = ({ todo, onClose, onSave, onDelete }) => {
  const [text, setText] = useState(todo?.text || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({ text, completed: todo?.completed || false, color: 'black' });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('TodoModal: handleDelete clicked', todo?.id);
    
    if (!isDeleting) {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000); // Reset after 3s
      return;
    }

    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-[#0f0f0f] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl"
      >
        <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold tracking-tight">{todo ? 'Edit To-Do' : 'New To-Do'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Task</label>
            <input 
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Buy groceries"
              className="w-full bg-gray-50 dark:bg-[#121212] border-0 focus:ring-2 focus:ring-black dark:focus:ring-white rounded-2xl p-5 text-xl font-semibold transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black py-5 px-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center space-x-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {todo ? <Save size={20} /> : <Plus size={20} />}
              <span>{todo ? 'Save Task' : 'Create Task'}</span>
            </button>
            
            {todo && (
              <button 
                type="button"
                onClick={handleDelete}
                className={cn(
                  "w-full py-5 px-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center space-x-3 transition-all",
                  isDeleting 
                    ? "bg-red-600 text-white animate-pulse" 
                    : "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white"
                )}
              >
                <Trash2 size={20} />
                <span>{isDeleting ? 'Click Again to Confirm' : 'Delete Task'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
