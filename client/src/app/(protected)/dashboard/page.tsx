"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useAuth";
import { Zap, Calendar, Loader2 } from 'lucide-react';
import { Dashboard3D } from '@/components/ui/3d-icons';

// -- Lazy-load heavy chart & 3D components so the page shell paints instantly --
const MetricsGrid = dynamic(
  () => import('@/components/analytics/MetricsGrid').then(m => ({ default: m.MetricsGrid })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const PerformanceTrend = dynamic(
  () => import('@/components/analytics/PerformanceCharts').then(m => ({ default: m.PerformanceTrend })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const SkillRadar = dynamic(
  () => import('@/components/analytics/PerformanceCharts').then(m => ({ default: m.SkillRadar })),
  { loading: () => <ChartSkeleton className="h-100" />, ssr: false }
);
const AIAnalystPanel = dynamic(
  () => import('@/components/analytics/AIAnalystPanel').then(m => ({ default: m.AIAnalystPanel })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const SplineHero = dynamic(
  () => import('@/components/analytics/SplineHero').then(m => ({ default: m.SplineHero })),
  { loading: () => <div className="w-full h-125 md:h-162.5 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 animate-pulse flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>, ssr: false }
);

function ChartSkeleton({ className = "h-64" }: { className?: string }) {
  return <div className={`w-full ${className} rounded-3xl bg-zinc-900/40 border border-white/5 animate-pulse`} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Mesh (From original advanced design) */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      <div className="fixed left-0 right-0 top-0 -z-10 m-auto h-77.5 w-77.5 rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
      <div className="fixed right-0 bottom-0 -z-10 h-100 w-100 rounded-full bg-fuchsia-600 opacity-10 blur-[120px]"></div>

      <div className="max-w-400 mx-auto p-4 md:p-8 relative z-10 space-y-8 h-full overflow-y-auto">

        {/* Top Navbar Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
             <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 shadow-sm border border-zinc-800 text-indigo-400 transform transition-transform hover:scale-105 hover:rotate-3">
                 <Dashboard3D className="w-8 h-8" isActive={true} />
             </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl bg-clip-text bg-[linear-gradient(to_right,white,rgba(255,255,255,0.7))]">
                  Dashboard
              </h1>
              <p className="mt-1 text-sm font-medium text-zinc-400">
                  Welcome back, {user?.firstName || 'Learner'}. Here is your decision center.
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
             <button
              onClick={() => router.push("/history")}
              className="px-5 py-2.5 text-sm font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-white transition-all shadow-sm hover:bg-zinc-800"
             >
                 View Reports
             </button>
             <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/exams/create")}
                className="group relative px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all shadow-md overflow-hidden"
             >
                <span className="relative z-10 flex items-center gap-2">
                    Start Practice <Zap className="w-4 h-4 text-indigo-200 group-hover:text-white transition-colors" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
             </motion.button>
          </div>
        </header>

        {/* Hero 3D Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full mt-4"
        >
          <SplineHero />
        </motion.div>

        {/* 1. Learning Health & Core Metrics Grid */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">Core Analytics</h2>
            <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent ml-4"></div>
          </div>
          <MetricsGrid />
        </div>

        {/* 2. Complex Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 pb-12">
          <div className="lg:col-span-2 space-y-6">
            <PerformanceTrend />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkillRadar />
              {/* ROI Focus Bubble replacement placeholder */}
              <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 h-100 flex flex-col items-center justify-center">
                 <div className="text-center p-6 border border-dashed border-zinc-800 rounded-2xl w-full h-full flex flex-col items-center justify-center bg-zinc-900/20">
                    <Calendar className="w-10 h-10 text-zinc-600 mb-3" />
                    <h3 className="text-zinc-300 font-medium">Focus Area ROI</h3>
                    <p className="text-zinc-500 text-sm mt-2 max-w-50">Interactive Bubble chart loading module...</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <AIAnalystPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
