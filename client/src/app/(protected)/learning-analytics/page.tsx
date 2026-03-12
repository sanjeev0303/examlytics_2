"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { Activity3D } from '@/components/ui/3d-icons';
import { Loader2 } from 'lucide-react';

// -- Lazy-load every heavy analytics panel so the page shell paints instantly --
function PanelSkeleton({ className = "h-80" }: { className?: string }) {
  return (
    <div className={`w-full ${className} rounded-3xl bg-zinc-900/40 border border-white/5 animate-pulse flex items-center justify-center`}>
      <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
    </div>
  );
}

const AnalyticsOverview = dynamic(
  () => import('@/components/analytics/advanced/AnalyticsOverview').then(m => ({ default: m.AnalyticsOverview })),
  { loading: () => <PanelSkeleton className="h-96" />, ssr: false }
);
const PerformanceMetrics = dynamic(
  () => import('@/components/analytics/advanced/PerformanceMetrics').then(m => ({ default: m.PerformanceMetrics })),
  { loading: () => <PanelSkeleton />, ssr: false }
);
const BehaviorAnalysis = dynamic(
  () => import('@/components/analytics/advanced/BehaviorAnalysis').then(m => ({ default: m.BehaviorAnalysis })),
  { loading: () => <PanelSkeleton />, ssr: false }
);
const EngagementMetrics = dynamic(
  () => import('@/components/analytics/advanced/EngagementMetrics').then(m => ({ default: m.EngagementMetrics })),
  { loading: () => <PanelSkeleton />, ssr: false }
);

export default function LearningAnalyticsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden p-4 md:p-8 lg:p-12 font-sans relative">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] sm:top-[-20%] left-[-10%] w-[50%] sm:w-[40%] aspect-square rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] sm:w-[40%] aspect-square rounded-full bg-rose-600/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] aspect-square rounded-full bg-cyan-600/10 blur-[100px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="max-w-400 mx-auto p-4 md:p-8 relative z-10 space-y-8 h-full overflow-y-auto">

        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#0F172A] rounded-xl border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Activity3D className="w-6 h-6" isActive={true} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(to_right,white,rgba(255,255,255,0.7))]">
                Learning Intelligence
              </h1>
            </div>
            <p className="text-zinc-400 text-sm max-w-md">
              AI-driven unified dashboard tracking mastery, cognitive fatigue, and predictive performance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5 backdrop-blur-md">
              Export Report
            </button>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]">
              AI Tutor Consult
            </button>
          </motion.div>
        </header>

        {/* Modular Grid Layout */}
        <div className="space-y-6">
          <AnalyticsOverview />
          {/* <SplineHero /> */}

          <div className="pt-4">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-indigo-500"></span>
              Performance & Mastery
            </h2>
            <PerformanceMetrics />
          </div>

          <div className="pt-4">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-rose-500"></span>
              Cognitive Behavior
            </h2>
            <BehaviorAnalysis />
          </div>

          <div className="pt-4">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-blue-500"></span>
              Engagement Dynamics
            </h2>
            <EngagementMetrics />
          </div>
        </div>

      </div>
    </div>
  );
}
