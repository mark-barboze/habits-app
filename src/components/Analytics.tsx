/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthGuard';
import { subscribeToUserHabits, getUserCompletionsForRange, subscribeToCompletions } from '../services/habitService';
import { subscribeToUserTodos } from '../services/todoService';
import { calculateProgress } from '../lib/logic';
import { Habit, Completion, Todo } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { Activity, Award, Target, Zap, ListTodo, ClipboardList } from 'lucide-react';
import { cn } from '../lib/utils';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<Completion[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const unsubHabits = subscribeToUserHabits(user.uid, setHabits);
    const unsubTodos = subscribeToUserTodos(user.uid, setTodos);
    const unsubTodayComp = subscribeToCompletions(user.uid, format(new Date(), 'yyyy-MM-dd'), setTodayCompletions);
    
    const loadCompletions = async () => {
      const start = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
      const end = format(new Date(), 'yyyy-MM-dd');
      const data = await getUserCompletionsForRange(user.uid, start, end);
      setCompletions(data);
    };
    
    loadCompletions();
    return () => {
      unsubHabits();
      unsubTodos();
      unsubTodayComp();
    };
  }, [user]);

  // Group completions by date for heatmap
  const completionsByDate = completions.reduce((acc, c) => {
    acc[c.date] = (acc[c.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Last 7 days for the bar chart
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const { 
    progress: progressRate, 
    remaining: totalRemaining, 
    total: totalTasksForToday,
    completed: completedTasksForToday
  } = calculateProgress(habits, todos, todayCompletions);

  const totalTodosCount = todos.length;
  const remainingTodosCount = todos.filter(t => !t.completed).length;

  const chartData = last7Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const isToday = isSameDay(day, new Date());
    
    if (isToday) {
      return {
        name: format(day, 'EEE'),
        value: progressRate
      };
    }

    const count = completionsByDate[dateStr] || 0;
    const value = habits.length > 0 ? (count / habits.length) * 100 : 0;
    return {
      name: format(day, 'EEE'),
      value: Math.round(value)
    };
  });

  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-3xl font-bold tracking-tight">Your Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Progress Rate", value: `${progressRate}%`, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Remaining To-Dos for Today', value: remainingTodosCount, icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Total Habits', value: habits.length, icon: Target, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Total To-Dos', value: totalTodosCount, icon: ListTodo, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-[2rem] space-y-2`}>
            <stat.icon className={stat.color} size={20} />
            <div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Chart (Mocked but using habits count) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Performance</h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Activity</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} 
                />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'white' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#10B981' : '#000000'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Month Calendar Grid */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm">
          <h3 className="text-xl font-bold mb-6 capitalize">{format(new Date(), 'MMMM yyyy')}</h3>
          <div className="grid grid-cols-7 gap-2">
            {eachDayOfInterval({
              start: startOfMonth(new Date()),
              end: endOfMonth(new Date())
            }).map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const count = completionsByDate[dateStr] || 0;
              const intensity = habits.length > 0 ? count / habits.length : 0;
              
              return (
                <div 
                  key={i} 
                  title={`${format(day, 'MMM d')}: ${count} habits`}
                  className={cn(
                    "aspect-square rounded-lg transition-all flex items-center justify-center text-[10px] font-bold",
                    intensity === 0 && "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600",
                    intensity > 0 && intensity < 1 && "bg-green-100 dark:bg-green-500/10 text-green-600",
                    intensity === 1 && "bg-green-500 text-white shadow-sm"
                  )}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-center mt-6 text-gray-500 uppercase tracking-widest font-bold">Monthly Progress</p>
        </div>
      </div>
    </div>
  );
};
