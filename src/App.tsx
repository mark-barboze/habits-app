/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthGuard';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { AdminDashboard } from './components/AdminDashboard';
import { WeeklyReport } from './components/WeeklyReport';
import { logout } from './services/authService';
import { getLatestWeeklyReport } from './services/reportService';
import { deleteUserAccount } from './services/userService';
import { LogOut, Bell, ChevronRight, FileText, Sparkles, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'admin' | 'settings' | 'report'>('dashboard');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [captchaInput, setCaptchaInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      window.location.reload();
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      const checkReport = async () => {
        await getLatestWeeklyReport(user.uid);
      };
      checkReport();
    }
  }, [user, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user || !profile) {
    return <LandingPage />;
  }

  if (!profile.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-black text-red-500">ACCOUNT DISABLED</h1>
          <p className="text-gray-500">Your account has been flagged or disabled by an administrator. Please contact support if you believe this is an error.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold"
          >
            Check Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'analytics' && <Analytics />}
      {activeTab === 'admin' && profile.isAdmin && <AdminDashboard />}
      {activeTab === 'report' && <WeeklyReport />}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex items-center space-x-4">
              <img 
                src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} 
                alt="Profile" 
                className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-800"
              />
              <div>
                <h3 className="text-xl font-bold">{profile?.displayName}</h3>
                <p className="text-sm text-gray-500">{profile?.email}</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Account Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Display Name</p>
                  <p className="font-medium">{profile?.displayName}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Email Address</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center space-x-3 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all transform active:scale-[0.98]"
              >
                <LogOut size={20} />
                <span>Logout from Device</span>
              </button>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteStep(1);
                  setCaptchaInput('');
                }}
                className="w-full flex items-center justify-center space-x-3 py-4 bg-gray-100 dark:bg-gray-800 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl font-bold transition-all"
              >
                <AlertCircle size={20} />
                <span>Delete My Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
                  <ShieldAlert className="text-red-600 dark:text-red-400" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Security Protocol</h3>
                  <p className="text-gray-500 text-sm mt-1">This action is irreversible and permanent.</p>
                </div>
              </div>

              {deleteStep === 1 && (
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Security Verification</p>
                    <p className="text-sm font-medium mb-4">Type <span className="font-black text-red-500 underline">DELETE</span> to confirm access</p>
                    <input 
                      type="text" 
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      placeholder="Type here..."
                      className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center font-black tracking-widest focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <button 
                    disabled={captchaInput !== 'DELETE'}
                    onClick={() => setDeleteStep(2)}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Warning</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {deleteStep === 2 && (
                <div className="space-y-6">
                  <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <ul className="text-sm space-y-4 font-medium text-red-900 dark:text-red-200">
                      <li className="flex items-start space-x-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">!</span>
                        <span>All Habits records will be erased</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">!</span>
                        <span>AI Weekly Summaries permanently deleted</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">!</span>
                        <span>Auth account and local data removed</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="w-full py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20 flex items-center justify-center space-x-2"
                    >
                      {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <span>Delete Permanently</span>}
                    </button>
                    <button 
                      disabled={isDeleting}
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      Cancel Protocol
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
