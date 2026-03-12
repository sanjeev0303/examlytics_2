"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';
import { Loader2 } from 'lucide-react';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number | string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
        <p className="text-zinc-400 text-sm mb-2 font-medium">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm font-semibold flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PerformanceTrend() {
  const { data: curveData, isLoading } = useQuery({
    queryKey: ['learning-curve'],
    queryFn: () => AnalyticsService.getLearningCurve()
  });

  const chartData = useMemo(() => {
    if (!curveData || !curveData.labels) return [];
    return curveData.labels.map((label: string, index: number) => ({
      name: label,
      accuracy: (curveData.datasets?.accuracy?.[index] || 0) * 100,
      confidence: (curveData.datasets?.confidence?.[index] || 0) * 100,
    }));
  }, [curveData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 h-100 flex flex-col"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Performance vs Confidence</h3>
          <p className="text-zinc-400 text-sm">Tracking accuracy and readiness.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Accuracy</div>
          <div className="flex items-center gap-2 text-xs text-zinc-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Confidence</div>
        </div>
      </div>
      <div className="flex-1 w-full min-h-62.5 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAccuracy)" />
            <Area type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorConfidence)" />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

export function SkillRadar() {
  const { data: weakTopicsData, isLoading } = useQuery({
    queryKey: ['weak-topics-radar'],
    queryFn: () => AnalyticsService.getWeakTopics()
  });

  const processedData = useMemo(() => {
    if (!weakTopicsData || !Array.isArray(weakTopicsData) || weakTopicsData.length === 0) return [{ subject: "Go", A: 80, fullMark: 100 }, { subject: "React", A: 60, fullMark: 100 }, { subject: "SQL", A: 90, fullMark: 100 }];
    return weakTopicsData.slice(0, 6).map((topic: any) => ({
      subject: topic.topicName,
      A: topic.accuracy,
      fullMark: 100,
    }));
  }, [weakTopicsData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 h-100 flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>

      <div className="w-full mb-2">
        <h3 className="text-lg font-semibold text-white">Skill Constellation</h3>
        <p className="text-zinc-400 text-sm">Your technical mastery profile.</p>
      </div>

      <div className="flex-1 w-full min-h-62.5 relative z-10">
        {isLoading ? (
           <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
           </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={processedData}>
            <PolarGrid stroke="#3f3f46" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Student" dataKey="A" stroke="#818cf8" strokeWidth={3} fill="#818cf8" fillOpacity={0.4} />
            <RechartsTooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
