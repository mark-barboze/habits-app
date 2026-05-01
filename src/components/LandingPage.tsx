/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { loginWithGoogle } from '../services/authService';
import { motion } from 'motion/react';
import { CheckCircle2, Zap, BarChart3, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-gray-100 dark:bg-gray-900 rounded-full blur-[120px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gray-100 dark:bg-gray-900 rounded-full blur-[120px] opacity-30 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <nav className="flex items-center justify-between mb-24">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 bg-white dark:bg-black rounded-md" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">Habits</span>
          </div>

          <ThemeToggle />
        </nav>

        <div className="max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8"
          >
            Own Your<br />
            <span className="text-gray-400 dark:text-gray-600">Routine.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-500 max-w-xl mb-12"
          >
            A minimal, elite-grade habit tracking platform designed for those who chase precision and progress every single day.
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={loginWithGoogle}
            className="group flex items-center space-x-4 bg-black dark:bg-white text-white dark:text-black py-6 px-10 rounded-2xl text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/10"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mt-48">
          {[
            { icon: Zap, title: "Streak Engine", desc: "Build momentum with our advanced daily streak tracking system." },
            { icon: BarChart3, title: "Elite Analytics", desc: "Visualize your growth with precision data and progress charts." },
            { icon: Sparkles, title: "Weekly AI Report", desc: "Get a personalized weekly report with insights, progress analysis, and actionable improvement tips." },
            { icon: ShieldCheck, title: "Private & Local", desc: "Your data is yours. Secure, fast, and always synchronized." },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-4 text-center md:text-left"
            >
              <div className="w-14 h-14 bg-gray-50 dark:bg-[#151515] rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs font-bold uppercase tracking-widest gap-6">
          <p>© 2026 Habits by Mark Barboze</p>
        </div>
      </footer>
    </div>
  );
};
