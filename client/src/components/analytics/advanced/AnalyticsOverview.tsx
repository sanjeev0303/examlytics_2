"use client";

import React, { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { Target, Activity, BrainCircuit, Zap, TrendingUp, Clock, FileCheck2, Timer, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';
import { ExamService } from '@/services/exam.service';

// Spline is ~2 MB — load it only when visible, never on the server
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-zinc-500">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50" />
    </div>
  ),
});

const metrics = [
  { id: 1, label: 'Overall Accuracy', value: '84.2%', trend: '+4.5%', isPositive: true, icon: Target, insight: 'Your accuracy improved after increasing study frequency.' },
  { id: 2, label: 'Learning Velocity', value: '2.4', unit: 'skills/wk', trend: '+1.2', isPositive: true, icon: Zap, insight: 'Top 10% of cohort speed.' },
  { id: 3, label: 'Focus Score', value: '88/100', trend: '-2.0', isPositive: false, icon: BrainCircuit, insight: 'Slight drop in late-night sessions.' },
  { id: 4, label: 'Retention Rate', value: '92%', trend: '+5.1%', isPositive: true, icon: Activity, insight: 'Spaced repetition is working well.' }
];

const liveTelemetry = [
  { label: 'Active Session', value: '42m 15s', icon: Clock },
  { label: 'Questions Solved Today', value: '47', icon: FileCheck2 },
  { label: 'Current Focus Level', value: 'High', icon: Timer },
];

export function AnalyticsOverview() {
  const { data: readinessData, isLoading: loadingReadiness } = useQuery({
    queryKey: ['readiness-score'],
    queryFn: () => AnalyticsService.getReadinessScore()
  });

  const { data: streaksData, isLoading: loadingStreaks } = useQuery({
    queryKey: ['streaks'],
    queryFn: () => AnalyticsService.getStreaks()
  });

  const { data: historyData } = useQuery({
    queryKey: ['exam-history'],
    queryFn: () => ExamService.getHistory()
  });

  const displayMetrics = useMemo(() => {
    if (!readinessData?.breakdown) return metrics;
    const { score, breakdown } = readinessData;
    const accuracy = (breakdown.topicMasteryAvg * 100).toFixed(1);
    const speed = (breakdown.speedFactor * 10).toFixed(1);
    const focus = (breakdown.consistencyScore * 100).toFixed(1);
    const retention = (breakdown.confidenceScore * 100).toFixed(1);

    return [
      { id: 1, label: 'Overall Accuracy', value: `${accuracy}%`, trend: 'Active', isPositive: true, icon: Target, insight: 'Real-time accuracy based on mastery.' },
      { id: 2, label: 'Learning Velocity', value: speed, unit: ' pace', trend: 'Active', isPositive: true, icon: Zap, insight: 'Dynamic speed calculation.' },
      { id: 3, label: 'Consistency Score', value: `${focus}/100`, trend: 'Active', isPositive: breakdown.consistencyScore > 0.6, icon: BrainCircuit, insight: 'Your current study consistency.' },
      { id: 4, label: 'Confidence Rate', value: `${retention}%`, trend: 'Active', isPositive: true, icon: Activity, insight: 'AI measured confidence rate.' }
    ];
  }, [readinessData]);

  const telemetry = useMemo(() => {
    if (!historyData || !historyData.exams) return liveTelemetry;
    let totalQuestions = 0;
    historyData.exams.forEach((ex: any) => totalQuestions += ex.score > 0 ? 10 : 0); // rough estimate if no q count

    return [
      { label: 'Active Days', value: `${streaksData?.totalActiveDays || 0} / ${streaksData?.longestStreak || 0} max`, icon: Clock },
      { label: 'Total Exams', value: `${historyData.total || 0}`, icon: FileCheck2 },
      { label: 'Interview Readiness', value: readinessData?.score < 50 ? 'Low' : readinessData?.score < 80 ? 'Medium' : 'High', icon: Timer },
    ];
  }, [historyData, streaksData, readinessData]);

  // Don't block entire page — show skeleton placeholders inline instead
  const isLoading = loadingReadiness || loadingStreaks;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full h-100 rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center group">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-zinc-500">Initializing Core...</div>}>
            <Spline scene="https://prod.spline.design/o3v1HPnOwXUx88B6/scene.splinecode" />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

        <div className="relative z-10 p-8 flex flex-col justify-between h-full w-full max-w-2xl pointer-events-none">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Intelligence Core
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-zinc-400 text-sm md:text-base max-w-md"
            >
              Real-time synchronization of your cognitive state and mastery levels. Everything is interconnected.
            </motion.p>
          </div>

          <div className="flex gap-4 mt-8">
            {telemetry.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 py-3 px-4 rounded-2xl flex items-center gap-3"
                >
                  <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">{item.label}</div>
                    <div className="text-sm font-semibold text-white">{item.value}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="relative p-6 rounded-3xl bg-zinc-900/40 backdrop-blur-md border border-white/5 overflow-hidden group hover:bg-zinc-900/60 transition-colors"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <Icon size={64} />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 bg-zinc-800 rounded-xl border border-white/5 text-zinc-300">
                  <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${metric.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {metric.isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                  {metric.trend}
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-zinc-400 text-sm font-medium mb-1">{metric.label}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{metric.value}</span>
                  {metric.unit && <span className="text-xs text-zinc-500">{metric.unit}</span>}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                <p className="text-xs text-indigo-300 flex items-start gap-1.5 leading-relaxed">
                  <Zap size={14} className="shrink-0 mt-0.5" />
                  {metric.insight}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
