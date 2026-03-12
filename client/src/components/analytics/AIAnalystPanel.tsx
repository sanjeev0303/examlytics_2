"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';
import { useRouter } from 'next/navigation';

export function AIAnalystPanel() {
  const router = useRouter();
  const { data: dueTopicsData, isLoading } = useQuery({
    queryKey: ['due-topics'],
    queryFn: () => AnalyticsService.getDueTopics()
  });

  const insights = useMemo(() => {
    const defaultInsights = [
      {
        title: "Pacing Warning",
        desc: "You are rushing the first 15% of your questions resulting in a 40% error rate.",
        action: "Practice untimed sets",
        color: "from-rose-500/20 to-orange-500/20",
        iconColor: "text-orange-400"
      },
      {
        title: "Strong Subject Recovery",
        desc: "Your accuracy in Dynamic Programming improved by +12% this week. Keep going!",
        action: "Take advanced DP mock",
        color: "from-emerald-500/20 to-teal-500/20",
        iconColor: "text-emerald-400"
      },
      {
        title: "Efficiency Opportunity",
        desc: "Spending 10% more time on System Design questions could yield a 20% score bump.",
        action: "Review architecture patterns",
        color: "from-indigo-500/20 to-blue-500/20",
        iconColor: "text-indigo-400"
      }
    ];

    if (!dueTopicsData || !dueTopicsData.dueTopics || dueTopicsData.dueTopics.length === 0) {
      return defaultInsights;
    }

    return dueTopicsData.dueTopics.slice(0, 3).map((topic: any) => {
      const isHighPriority = topic.priority === 'HIGH';
      return {
        title: `${topic.priority} Priority Review`,
        desc: `Your mastery in ${topic.topic} is dropping (${(topic.masteryScore * 100).toFixed(1)}%). It's been ${topic.daysSinceLast} days since your last review.`,
        action: `Review ${topic.topic}`,
        color: isHighPriority ? "from-rose-500/20 to-orange-500/20" : "from-amber-500/20 to-yellow-500/20",
        iconColor: isHighPriority ? "text-rose-400" : "text-amber-400",
      };
    });
  }, [dueTopicsData]);

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden">
      {/* Animated gradient border effect via pseudo element */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">Examlytics AI Analyst</h3>
          <p className="text-zinc-400 text-xs font-medium">Real-time learning insights</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : insights.map((insight: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (idx * 0.1) }}
            className={`p-4 rounded-2xl bg-linear-to-br ${insight.color} border border-white/5 group hover:border-white/10 transition-all`}
          >
            <div className="flex gap-3">
              <Lightbulb className={`w-5 h-5 shrink-0 mt-0.5 ${insight.iconColor}`} />
              <div>
                <h4 className="text-white text-sm font-semibold">{insight.title}</h4>
                <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{insight.desc}</p>
                <button
                  onClick={() => router.push('/weak-topics')}
                  className="mt-3 text-xs font-medium px-3 py-1.5 rounded-full bg-black/40 text-white flex items-center gap-2 group-hover:bg-black/60 transition-colors"
                >Action</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
