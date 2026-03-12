"use client";

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Maximize2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';

const defaultTrendData = [
  { day: 'Mon', accuracy: 65, predicted: null },
  { day: 'Tue', accuracy: 68, predicted: null },
  { day: 'Wed', accuracy: 74, predicted: null },
  { day: 'Thu', accuracy: 72, predicted: null },
  { day: 'Fri', accuracy: 81, predicted: null },
  { day: 'Sat', accuracy: 85, predicted: null },
  { day: 'Sun', accuracy: 88, predicted: 88 },
  { day: 'Mon(Est)', accuracy: null, predicted: 91 },
  { day: 'Tue(Est)', accuracy: null, predicted: 94 },
];

const defaultSkillData = [
  { subject: 'Algorithms', val: 90, lastImp: '2 days ago' },
  { subject: 'System Design', val: 70, lastImp: '1 week ago' },
  { subject: 'React', val: 95, lastImp: 'Yesterday' },
  { subject: 'Databases', val: 60, lastImp: '2 weeks ago' },
  { subject: 'Networking', val: 80, lastImp: '5 days ago' },
  { subject: 'Concurrency', val: 50, lastImp: '1 month ago' },
];

export function PerformanceMetrics() {
  const { data: curveData, isLoading: loadingCurve } = useQuery({
    queryKey: ['learning-curve'],
    queryFn: () => AnalyticsService.getLearningCurve()
  });

  const { data: weakTopicsData, isLoading: loadingSkills } = useQuery({
    queryKey: ['weak-topics-radar'],
    queryFn: () => AnalyticsService.getWeakTopics()
  });

  const displayTrendData = useMemo(() => {
    if (!curveData || !curveData.labels || curveData.labels.length === 0) return defaultTrendData;

    const dataPairs = curveData.labels.map((label: string, index: number) => ({
      day: label,
      accuracy: (curveData.datasets?.accuracy?.[index] || 0) * 100,
      predicted: null as number | null
    }));

    if (dataPairs.length > 0) {
      const lastVal = dataPairs[dataPairs.length - 1].accuracy;
      dataPairs[dataPairs.length - 1].predicted = lastVal;
      // Add predictions
      dataPairs.push({ day: 'Next(Est)', accuracy: null as any, predicted: Math.min(100, lastVal * 1.05) });
      dataPairs.push({ day: 'Next+1(Est)', accuracy: null as any, predicted: Math.min(100, lastVal * 1.08) });
    }

    return dataPairs;
  }, [curveData]);

  const displaySkillData = useMemo(() => {
    if (!weakTopicsData || !Array.isArray(weakTopicsData) || weakTopicsData.length === 0) return defaultSkillData;
    return weakTopicsData.slice(0, 6).map((topic: any) => ({
      subject: topic.topicName,
      val: topic.accuracy,
      lastImp: `${topic.attempts} attempts`
    }));
  }, [weakTopicsData]);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
      {/* Trend Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 flex flex-col min-h-112.5"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Predictive Performance Trend</h3>
            <p className="text-sm text-zinc-400">Accuracy progression with AI forecast mapping.</p>
          </div>
          <button className="p-2 text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 rounded-xl">
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Historical Core
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <div className="w-2 h-2 rounded-full bg-cyan-400 border-2 border-zinc-950"></div> AI Forecast Model
          </div>
        </div>

        <div className="flex-1 w-full min-h-62.5 relative">
          {loadingCurve ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={1}>
            <AreaChart data={displayTrendData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <pattern id="diagonalPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                  <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="2"/>
                </pattern>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
              <Area type="monotone" dataKey="predicted" stroke="#22d3ee" strokeWidth={3} strokeDasharray="5 5" fill="url(#diagonalPattern)" />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex gap-3 items-start">
          <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-200/80">
            <span className="text-indigo-300 font-semibold">Insight:</span> If you maintain your current daily activity rate, you are projected to reach the 90%+ mastery tier by Tuesday.
          </p>
        </div>
      </motion.div>

      {/* Skill Mastery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 flex flex-col min-h-112.5"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Topological Skill Mastery</h3>
            <p className="text-sm text-zinc-400">Multi-dimensional capability footprint.</p>
          </div>
        </div>

        <div className="flex-1 w-full min-h-75 relative z-10">
          {loadingSkills ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={1}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={displaySkillData}>
              <PolarGrid stroke="#3f3f46" strokeDasharray="3 3"/>
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Mastery" dataKey="val" stroke="#a855f7" strokeWidth={3} fill="#a855f7" fillOpacity={0.4} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
                        <div className="text-white font-semibold mb-2 flex justify-between items-center gap-6">
                          {data.subject}
                          <span className="text-purple-400">{data.val}%</span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          Last trained: <span className="text-zinc-200">{data.lastImp}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>          )}        </div>
      </motion.div>
    </div>
  );
}
