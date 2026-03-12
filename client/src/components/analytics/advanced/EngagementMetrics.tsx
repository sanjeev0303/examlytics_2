"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { AlertOctagon, Timer, Gauge, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';
import { ExamService } from '@/services/exam.service';

const defaultVelocityData = [
  { module: 'Module 1', speed: 85, avg: 70 },
  { module: 'Module 2', speed: 92, avg: 72 },
  { module: 'Module 3', speed: 65, avg: 75 },
  { module: 'Module 4', speed: 45, avg: 73 },
  { module: 'Module 5', speed: 88, avg: 70 },
];

const defaultStruggleLogs = [
  { id: 1, topic: 'Dynamic Programming', metric: '3.4x average time', status: 'critical', time: '2 hours ago' },
  { id: 2, topic: 'Database Normalization', metric: '4 failed attempts', status: 'warning', time: 'Yesterday' },
  { id: 3, topic: 'React Context API', metric: 'Skipped 2 videos', status: 'info', time: '3 days ago' },
];

export function EngagementMetrics() {
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['exam-history', 1, 5],
    queryFn: () => ExamService.getHistory()
  });

  const { data: dueTopicsData, isLoading: loadingTopics } = useQuery({
    queryKey: ['due-topics'],
    queryFn: () => AnalyticsService.getDueTopics()
  });

  const displayVelocity = useMemo(() => {
    if (!historyData || !historyData.exams || historyData.exams.length === 0) return defaultVelocityData;

    // Reverse to show oldest to newest left to right
    const recent = [...historyData.exams].slice(0, 7).reverse();
    return recent.map((exam: any, i: number) => ({
      module: `Exam ${i + 1}`,
      speed: Math.round(exam.score),
      avg: 70
    }));
  }, [historyData]);

  const displayLogs = useMemo(() => {
    if (!dueTopicsData || !dueTopicsData.dueTopics || dueTopicsData.dueTopics.length === 0) return defaultStruggleLogs;

    return dueTopicsData.dueTopics.slice(0, 4).map((topic: any, i: number) => {
      let status = 'info';
      if (topic.priority === 'HIGH') status = 'critical';
      else if (topic.priority === 'MEDIUM') status = 'warning';

      return {
        id: i,
        topic: topic.topic,
        metric: `Mastery dropping (${(topic.masteryScore * 100).toFixed(0)}%)`,
        status,
        time: `${topic.daysSinceLast} days ago`
      };
    });
  }, [dueTopicsData]);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full mt-6">
      {/* Learning Velocity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="xl:col-span-2 p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 flex flex-col min-h-100"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Gauge size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Learning Velocity & Pace</h3>
              <p className="text-sm text-zinc-400">Your speed vs. cohort average across modules.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-50 relative">
          {loadingHistory ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={1}>
            <LineChart data={displayVelocity} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="module" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="speed" name="Your Score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#18181b' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="avg" name="Passing Avg" stroke="#71717a" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Struggle / Friction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 flex flex-col min-h-100"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Friction Points</h3>
            <p className="text-sm text-zinc-400">Identified areas of struggle.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 relative">
          {loadingTopics ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : displayLogs.map((log: any) => (
            <div key={log.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-white/10 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {log.status === 'critical' && <AlertOctagon size={16} className="text-rose-500" />}
                  {log.status === 'warning' && <Timer size={16} className="text-amber-500" />}
                  {log.status === 'info' && <InfoIcon size={16} className="text-blue-500" />}
                  <span className="font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-37.5">{log.topic}</span>
                </div>
                <span className="text-xs text-zinc-500 whitespace-nowrap">{log.time}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-zinc-400">
                <span>{log.metric}</span>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2.5 group-hover:translate-x-0 duration-300" />
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5">
          View Remediation Plan
        </button>
      </motion.div>
    </div>
  );
}

function InfoIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  );
}
