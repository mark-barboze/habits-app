import React, { useEffect, useState, useRef } from 'react';
import { 
  getLatestWeeklyReport, 
  generateAndSaveWeeklyReport,
  deleteWeeklyReport
} from '../services/reportService';
import { WeeklyReport as WeeklyReportType } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Trophy,
  Loader2,
  FileText,
  Trash2,
  X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from './AuthGuard';

export const WeeklyReport: React.FC = () => {
  const [report, setReport] = useState<WeeklyReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchReport();
    }
  }, [profile]);

  const fetchReport = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getLatestWeeklyReport(profile.uid);
      setReport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!profile) return;
    setGenerating(true);
    try {
      const newReport = await generateAndSaveWeeklyReport(profile.uid);
      setReport(newReport as WeeklyReportType);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!report || !profile) return;
    setDeleting(true);
    try {
      await deleteWeeklyReport(report.id, profile.uid);
      setReport(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current || !report) return;
    
    try {
      const element = reportRef.current;
      
      // Save original styles
      const originalWidth = element.style.width;
      const originalTransform = element.style.transform;
      const originalTransformOrigin = element.style.transformOrigin;
      const originalBorder = element.style.border;
      const originalShadow = element.style.boxShadow;

      // Prepare for high-quality capture
      element.style.width = '1200px'; // Consistent width for PDF
      element.style.border = 'none';
      element.style.boxShadow = 'none';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: 1200,
        height: element.scrollHeight, // Capture full height
      });
      
      // Restore styles
      element.style.width = originalWidth;
      element.style.transform = originalTransform;
      element.style.transformOrigin = originalTransformOrigin;
      element.style.border = originalBorder;
      element.style.boxShadow = originalShadow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fits all content on one page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / (imgWidth / 2), pdfHeight / (imgHeight / 2));
      const finalImgWidth = (imgWidth / 2) * ratio;
      const finalImgHeight = (imgHeight / 2) * ratio;

      // Center the content on the page
      const marginX = (pdfWidth - finalImgWidth) / 2;
      const marginY = 5; // Minimal top margin

      pdf.addImage(imgData, 'PNG', marginX, marginY, finalImgWidth, finalImgHeight);
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175); // gray-400
      pdf.text('© 2026 Habits by Mark Barboze', pdfWidth / 2, pdfHeight - 10, { align: 'center' });

      pdf.save(`Habits_Weekly_Report_${report.dateRange.start.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-gray-400" size={40} />
        <p className="text-gray-500 font-medium tracking-tight">Analyzing your week...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6 space-y-8">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800">
          <FileText className="text-gray-400" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">No Active Report</h2>
          <p className="text-gray-500 text-lg">Your weekly AI summary hasn't been generated yet or has expired (visible for 24 hours only).</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center justify-center mx-auto space-x-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {generating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
          <span>{generating ? 'Generating Report...' : 'Generate Weekly Report'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black tracking-tight">Weekly Report</h2>
        <button 
          onClick={downloadPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Download size={16} />
          <span>Download PDF</span>
        </button>
      </div>

      <div 
        ref={reportRef} 
        className="p-8 md:p-12 rounded-[3rem] border space-y-12 overflow-hidden"
        style={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6', color: '#000000' }}
      >
        {/* Header */}
        <div className="relative border-b pb-8 flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-0" style={{ borderBottomColor: '#f3f4f6' }}>
          {/* Logo - Left on desktop, Top on mobile */}
          <div className="flex md:absolute left-0 top-0 items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0" style={{ backgroundColor: '#000000' }}>
              <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: '#ffffff' }} />
            </div>
            <h1 className="text-xl font-black tracking-tighter" style={{ color: '#000000' }}>HABITS</h1>
          </div>

          {/* Central Title */}
          <div className="text-center w-full">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: '#000000' }}>Weekly Report</h2>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#9ca3af' }}>{report.dateRange.start} — {report.dateRange.end}</p>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Habits" value={report.stats.totalHabits} icon={FileText} hexColor="#9ca3af" />
          <StatCard label="Completed" value={report.stats.completedHabits} icon={CheckCircle2} hexColor="#22c55e" />
          <StatCard label="Tasks" value={report.stats.totalTodos} icon={FileText} hexColor="#9ca3af" />
          <StatCard label="Completed" value={report.stats.completedTodos} icon={Trophy} hexColor="#3b82f6" />
          <StatCard label="Streak" value={report.stats.streak} icon={Zap} hexColor="#f97316" />
        </div>

        {/* Progress Graph */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center space-x-2" style={{ color: '#9ca3af' }}>
              <TrendingUp size={16} />
              <span>Weekly Momentum</span>
            </h3>
          </div>
          <div className="h-[200px] w-full rounded-3xl p-6 border" style={{ backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.progressData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  style={{ fontSize: '10px', fontWeight: 'bold', fill: '#9ca3af' }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                          {payload[0].value} completions
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {report.progressData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value > 0 ? (index === report.progressData.length - 1 ? '#000000' : '#444444') : '#eeeeee'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AISection title="Summary" content={report.aiContent.summary} icon={Zap} />
          <AISection title="What went wrong" content={report.aiContent.whatWentWrong} icon={FileText} borderColor="#f3f4f6" />
        </div>

        <div className="p-8 rounded-[2.5rem] border space-y-6" style={{ backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }}>
          <h3 className="text-xl font-black tracking-tight flex items-center space-x-3">
            <TrendingUp style={{ color: '#3b82f6' }} />
            <span style={{ color: '#000000' }}>Path to Improvement</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {report.aiContent.improvementSteps
              .split(/\d+\./)
              .map(s => s.trim())
              .filter(s => s.length > 5)
              .map((step, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 rounded-2xl border" style={{ backgroundColor: '#ffffff', borderColor: '#f9fafb' }}>
                <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                  {i + 1}
                </span>
                <p className="text-sm font-medium pt-1.5 leading-relaxed" style={{ color: '#4b5563' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t text-center space-y-4" style={{ borderColor: '#f3f4f6' }}>
          <p className="text-xl font-serif italic leading-relaxed" style={{ color: '#4b5563' }}>"{report.aiContent.quote}"</p>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center space-x-2 text-red-500 hover:text-red-600 font-bold transition-colors text-sm px-6 py-3 bg-red-50 dark:bg-red-500/10 rounded-2xl"
        >
          <Trash2 size={16} />
          <span>Delete Report</span>
        </button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black">Delete Report?</h3>
                <p className="text-gray-500 text-sm">Action cannot be undone. This report will be permanently removed.</p>
              </div>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="animate-spin" size={18} /> : <span>Delete Permanently</span>}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, hexColor }: any) => (
  <div className="p-6 rounded-3xl border transition-colors" style={{ backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>{label}</p>
      <Icon size={14} style={{ color: hexColor }} />
    </div>
    <p className="text-3xl font-black tracking-tight" style={{ color: '#000000' }}>{value}</p>
  </div>
);

const AISection = ({ title, content, icon: Icon, borderColor = "#f3f4f6" }: any) => (
  <div className={`p-8 rounded-[2.5rem] border space-y-4`} style={{ backgroundColor: '#ffffff', borderColor: borderColor }}>
    <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center space-x-2" style={{ color: '#9ca3af' }}>
      <Icon size={12} />
      <span>{title}</span>
    </h3>
    <p className="text-sm leading-relaxed font-medium pt-1.5" style={{ color: '#4b5563' }}>{content}</p>
  </div>
);
