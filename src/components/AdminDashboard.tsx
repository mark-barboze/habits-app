/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { getAllUsers, toggleUserActiveStatus, getUserHabits } from '../services/adminService';
import { UserProfile, Habit } from '../types';
import { User, Shield, ShieldOff, Eye, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userHabits, setUserHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this user?`)) {
      await toggleUserActiveStatus(userId, !currentStatus);
      await loadUsers();
    }
  };

  const handleViewHabits = async (user: UserProfile) => {
    setSelectedUser(user);
    const habits = await getUserHabits(user.uid);
    setUserHabits(habits);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Secure Access
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 px-10">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} 
                        className="w-8 h-8 rounded-full" 
                        alt="" 
                      />
                      <span className="font-semibold text-sm">{u.displayName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.createdAt && (u.createdAt.toDate ? format(u.createdAt.toDate(), 'MMM d, yyyy') : format(new Date(u.createdAt), 'MMM d, yyyy'))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${u.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewHabits(u)}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="View Habits"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(u.uid, u.isActive)}
                        className={`p-2 rounded-lg transition-colors ${u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}
                        title={u.isActive ? 'Disable User' : 'Enable User'}
                      >
                        {u.isActive ? <ShieldOff size={16} /> : <Shield size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.displayName}'s Habits</h3>
                  <p className="text-xs text-gray-500 font-medium">{selectedUser.email}</p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <Eye className="rotate-180" size={24} />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {userHabits.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 italic">This user has no habits yet.</p>
                ) : (
                  userHabits.map(h => (
                    <div key={h.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{h.name}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{h.difficulty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{h.streakCurrent} day streak</p>
                        <p className="text-[10px] text-gray-400">Best: {h.streakLongest}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
