import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthGuard';
import { getDailyQuote } from '../services/quoteService';
import { DailyQuote } from '../types';
import { Quote as QuoteIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const QuoteWidget: React.FC = () => {
  const { user } = useAuth();
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchQuote = async () => {
        const q = await getDailyQuote(user.uid);
        setQuote(q);
        setLoading(false);
      };
      fetchQuote();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="w-full h-32 bg-gray-50 dark:bg-gray-900 rounded-[2rem] animate-pulse mb-8" />
    );
  }

  if (!quote) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-8 p-12 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 relative group flex flex-col items-center justify-center text-center"
      >
        <div className="relative z-10 max-w-2xl px-4">
          <h2 className="text-xl md:text-3xl font-medium tracking-tight text-black dark:text-white leading-relaxed italic">
            "{quote.text}"
          </h2>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
