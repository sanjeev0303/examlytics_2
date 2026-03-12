"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Activity, Brain, Target, Zap, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';
import { Loader2 } from 'lucide-react';

interface MetricProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  delay: number;
}

function MetricCard({ title, value, change, trend, icon: Icon, color, delay }: MetricProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative p-6 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group"
    >
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500", color)}></div>

      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-black/40 text-white shadow-inner">
          <Icon size={24} className={cn("text-white/80 transition-colors group-hover:text-white", color.replace('from-', 'text-').split(' ')[0])} />
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-black/30 backdrop-blur-md",
          trend === 'up' ? "text-emerald-400 border border-emerald-400/20" :
          trend === 'down' ? "text-red-400 border border-red-400/20" : "text-zinc-400 border border-zinc-400/20"
        )}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {change}
        </div>
      </div>

      <div>
        <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function MetricsGrid() {
  const { data: readinessData, isLoading: loadingReadiness } = useQuery({
    queryKey: ['readiness-score'],
    queryFn: () => AnalyticsService.getReadinessScore()
  });

  const { data: streaksData, isLoading: loadingStreaks } = useQuery({
    queryKey: ['streaks'],
    queryFn: () => AnalyticsService.getStreaks()
  });

  if (loadingReadiness || loadingStreaks) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const score = readinessData?.interviewReadinessScore || 0;
  const breakdown = readinessData?.breakdown || {};
  const accuracy = (breakdown.topicMasteryAvg || 0) * 100;

  const currentStreak = streaksData?.currentStreak || 0;
  const longestStreak = streaksData?.longestStreak || 0;

  const metrics = [
    { title: "Learning Health", value: `${score.toFixed(1)}/100`, change: score > 70 ? "+Good" : "Needs Work", trend: score > 70 ? "up" : "down", icon: Activity, color: "from-emerald-500 to-green-500", delay: 0.1 },
    { title: "Current Streak", value: `${currentStreak} Days`, change: `Max ${longestStreak}`, trend: currentStreak > 0 ? "up" : "neutral", icon: Zap, color: "from-indigo-500 to-blue-500", delay: 0.2 },
    { title: "Avg Accuracy", value: `${accuracy.toFixed(1)}%`, change: accuracy > 60 ? "+Steady" : "-Needs Review", trend: accuracy > 60 ? "up" : "down", icon: Target, color: "from-purple-500 to-pink-500", delay: 0.3 },
    { title: "Consistency", value: `${((breakdown.consistencyScore || 0) * 10).toFixed(1)}/10`, change: "Steady", trend: "neutral", icon: Clock, color: "from-amber-500 to-orange-500", delay: 0.4 },
    { title: "Confidence Score", value: `${((breakdown.confidenceScore || 0) * 10).toFixed(1)}/10`, change: "Variable", trend: "neutral", icon: Brain, color: "from-cyan-500 to-blue-500", delay: 0.5 },
    { title: "Risk of Failure", value: score < 50 ? "High" : score < 75 ? "Medium" : "Low", change: "Based on Health", trend: score < 50 ? "up" : "down", icon: ShieldAlert, color: "from-rose-500 to-red-500", delay: 0.6 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((m, i) => (
        <MetricCard key={i} {...m} trend={m.trend as "up" | "down" | "neutral"} />
      ))}
    </div>
  );
}
