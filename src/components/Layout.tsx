/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from './AuthGuard';
import { ThemeToggle } from './ThemeToggle';
import { logout } from '../services/authService';
import { LogOut, Home, BarChart2, Settings, User, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'analytics' | 'admin' | 'settings' | 'report';
  setActiveTab: (tab: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile } = useAuth();
  const isAdmin = profile?.isAdmin || false;

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex flex-col items-center justify-center space-y-1 py-2 px-4 rounded-xl transition-all duration-200",
        activeTab === id 
          ? "text-black dark:text-white bg-gray-100 dark:bg-gray-800 shadow-sm" 
          : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
      )}
    >
      <Icon size={20} />
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white dark:bg-black rounded-sm" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Habits</h1>
            
            {/* Desktop Navigation */}
            <nav className="ml-8 hidden sm:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'dashboard' ? "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#121212]"
                )}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'analytics' ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                )}
              >
                Stats
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    activeTab === 'admin' ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'settings' ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                )}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all relative",
                  activeTab === 'report' ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                )}
              >
                Report
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2" />
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold">{profile?.displayName}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{isAdmin ? 'Admin' : 'User'}</span>
              </div>
              <img 
                src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-800"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-900 px-4 py-2 sm:hidden">
        <div className="flex items-center justify-around">
          <NavItem id="dashboard" icon={Home} label="Home" />
          <NavItem id="analytics" icon={BarChart2} label="Stats" />
          <NavItem id="report" icon={FileText} label="Report" />
          {isAdmin && <NavItem id="admin" icon={User} label="Admin" />}
          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>
      </nav>

      {/* Side Nav (Desktop) - Optional but let's keep it simple for now with top bar + bottom nav mobile */}
    </div>
  );
};
