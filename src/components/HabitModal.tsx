/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import { Habit, HabitDifficulty } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface HabitModalProps {
  habit?: Habit;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
}

const CATEGORIES = ['discipline', 'fitness', 'growth', 'mindfulness'];

export const HabitModal: React.FC<HabitModalProps> = ({ habit, onClose, onSave, onDelete }) => {
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(habit?.difficulty || 'easy');
  const [category, setCategory] = useState(habit?.category || 'discipline');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, description, difficulty, category });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('HabitModal: handleDelete clicked', habit?.id);
    
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
            <h2 className="text-2xl font-bold tracking-tight">{habit ? 'Edit Habit' : 'New Habit'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Habit Name</label>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Meditation"
              className="w-full bg-gray-50 dark:bg-[#121212] border-0 focus:ring-2 focus:ring-black dark:focus:ring-white rounded-2xl p-5 text-xl font-semibold transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Notes (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this important?"
              className="w-full bg-gray-50 dark:bg-[#121212] border-0 focus:ring-2 focus:ring-black dark:focus:ring-white rounded-2xl p-5 min-h-[100px] text-lg font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Difficulty</label>
              <div className="flex p-1 bg-gray-50 dark:bg-[#121212] rounded-2xl border border-transparent">
                {(['easy', 'hard'] as HabitDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "flex-1 py-3 px-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                      difficulty === d 
                        ? "bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white" 
                        : "text-gray-500"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#121212] border-0 focus:ring-2 focus:ring-black dark:focus:ring-white rounded-2xl p-4 text-sm font-bold transition-all capitalize appearance-none cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black py-5 px-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center space-x-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {habit ? <Save size={20} /> : <Plus size={20} />}
              <span>{habit ? 'Save Habit' : 'Create Habit'}</span>
            </button>
            
            {habit && (
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
                <span>{isDeleting ? 'Click Again to Confirm' : 'Delete Habit'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
