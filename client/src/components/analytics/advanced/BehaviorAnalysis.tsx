"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts';
import { Brain, BatteryWarning, TrendingDown, Clock, Zap, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';

const defaultHeatmapData = [
  { time: '6am', mon: 10, tue: 20, wed: 30, thu: 15, fri: 5, sat: 0, sun: 0 },
  { time: '9am', mon: 40, tue: 60, wed: 80, thu: 50, fri: 40, sat: 10, sun: 20 },
  { time: '12pm', mon: 80, tue: 90, wed: 100, thu: 85, fri: 70, sat: 30, sun: 40 },
  { time: '3pm', mon: 60, tue: 70, wed: 85, thu: 60, fri: 50, sat: 50, sun: 60 },
  { time: '6pm', mon: 50, tue: 60, wed: 70, thu: 55, fri: 60, sat: 80, sun: 90 },
  { time: '9pm', mon: 30, tue: 40, wed: 50, thu: 30, fri: 40, sat: 100, sun: 80 },
];

const fatigueData = [
  { session: '0-15m', efficiency: 95, fatigue: 10 },
  { session: '15-30m', efficiency: 90, fatigue: 25 },
  { session: '30-45m', efficiency: 75, fatigue: 55 },
  { session: '45-60m', efficiency: 45, fatigue: 85 },
  { session: '60m+', efficiency: 20, fatigue: 98 },
];

export function BehaviorAnalysis() {
  const { data: readiness, isLoading: loadingReadiness } = useQuery({
    queryKey: ['readiness-score'],
    queryFn: () => AnalyticsService.getReadinessScore()
  });

  const { data: streaks, isLoading: loadingStreaks } = useQuery({
    queryKey: ['streaks'],
    queryFn: () => AnalyticsService.getStreaks()
  });

  const displayHeatmap = useMemo(() => {
    if (!streaks || !streaks.activityCalendar || streaks.activityCalendar.length === 0) return defaultHeatmapData;

    // Convert real daily activity counts into a pseudo-heatmap based on their dates.
    // In a real production app, we would have an hourly endpoint.
    const weekMap = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
    streaks.activityCalendar.forEach((entry: any) => {
      const d = new Date(entry.date);
      const day = d.getDay();
      const count = entry.count || 0;
      if (day === 1) weekMap.mon += count;
      else if (day === 2) weekMap.tue += count;
      else if (day === 3) weekMap.wed += count;
      else if (day === 4) weekMap.thu += count;
      else if (day === 5) weekMap.fri += count;
      else if (day === 6) weekMap.sat += count;
      else if (day === 0) weekMap.sun += count;
    });

    return [
      { time: '6am', mon: Math.floor(weekMap.mon * 0.1), tue: Math.floor(weekMap.tue * 0.1), wed: Math.floor(weekMap.wed * 0.1), thu: Math.floor(weekMap.thu * 0.1), fri: Math.floor(weekMap.fri * 0.1), sat: Math.floor(weekMap.sat * 0), sun: 0 },
      { time: '12pm', mon: Math.floor(weekMap.mon * 0.4), tue: Math.floor(weekMap.tue * 0.5), wed: Math.floor(weekMap.wed * 0.3), thu: Math.floor(weekMap.thu * 0.4), fri: Math.floor(weekMap.fri * 0.3), sat: Math.floor(weekMap.sat * 0.5), sun: Math.floor(weekMap.sun * 0.6) },
      { time: '6pm', mon: Math.floor(weekMap.mon * 0.3), tue: Math.floor(weekMap.tue * 0.2), wed: Math.floor(weekMap.wed * 0.4), thu: Math.floor(weekMap.thu * 0.3), fri: Math.floor(weekMap.fri * 0.4), sat: Math.floor(weekMap.sat * 0.3), sun: Math.floor(weekMap.sun * 0.2) },
      { time: '9pm', mon: Math.floor(weekMap.mon * 0.2), tue: Math.floor(weekMap.tue * 0.2), wed: Math.floor(weekMap.wed * 0.2), thu: Math.floor(weekMap.thu * 0.2), fri: Math.floor(weekMap.fri * 0.2), sat: Math.floor(weekMap.sat * 0.2), sun: Math.floor(weekMap.sun * 0.2) },
    ];
  }, [streaks]);

  const displayFatigue = useMemo(() => {
     if (!readiness || !readiness.breakdown) return fatigueData;
     const mult = readiness.breakdown.speedFactor || 1;
     return [
       { session: '0-15m', efficiency: 95 * mult, fatigue: 10 / mult },
       { session: '15-30m', efficiency: 90 * mult, fatigue: 25 / mult },
       { session: '30-45m', efficiency: 75 * mult, fatigue: 55 },
       { session: '45-60m', efficiency: 45 * mult, fatigue: 85 * mult },
       { session: '60m+', efficiency: 20 * mult, fatigue: 98 * mult },
     ];
  }, [readiness]);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full mt-6">
      {/* Learning Behavior Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-rose-500/10 flex flex-col min-h-112.5"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Chronological Activity Matrix</h3>
            <p className="text-sm text-zinc-400">Time-of-day engagement intensity mapping.</p>
          </div>
        </div>

        <div className="flex-1 w-full overflow-x-auto">
          <div className="min-w-100 h-full flex flex-col gap-2">
            <div className="flex justify-end gap-2 text-xs text-zinc-500 mb-2">
              <span className="w-8 text-center">M</span>
              <span className="w-8 text-center">T</span>
              <span className="w-8 text-center">W</span>
              <span className="w-8 text-center">T</span>
              <span className="w-8 text-center">F</span>
              <span className="w-8 text-center">S</span>
              <span className="w-8 text-center">S</span>
            </div>

            {loadingStreaks ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              </div>
            ) : displayHeatmap.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-10 text-right pr-2">{row.time}</span>
                <div className="flex flex-1 justify-end gap-2">
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                    const val = row[day as keyof typeof row] as number;
                    const opacity = val / 100;
                    return (
                      <div
                        key={day}
                        className="w-8 h-8 rounded-md transition-all duration-300 hover:scale-110 cursor-pointer relative group"
                        style={{ backgroundColor: `rgba(244, 63, 94, ${opacity || 0.05})` }}
                      >
                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-800 text-white text-xs py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-50">
                          {val} interactions
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock size={16} /> Peak: <span className="text-white font-medium">Wednesdays, 12PM</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Less</span>
            <div className="w-24 h-2 rounded-full bg-linear-to-r from-rose-500/10 to-rose-500"></div>
            <span className="text-zinc-500">More</span>
          </div>
        </div>
      </motion.div>

      {/* Focus & Cognitive Fatigue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-amber-500/10 flex flex-col min-h-112.5"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Cognitive Fatigue Index</h3>
              <p className="text-sm text-zinc-400">Session length vs. learning efficiency curve.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-50 relative">
          <ResponsiveContainer width="100%" height="100%" minHeight={1}>
            <BarChart data={displayFatigue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="session" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Fatigue Threshold', fill: '#ef4444', fontSize: 10 }} />
              <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
                {displayFatigue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.efficiency > 50 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2"><Zap size={16} className="text-emerald-400"/> Optimal Session</div>
            <div className="text-2xl font-bold text-white">28<span className="text-sm text-zinc-500 font-normal ml-1">mins</span></div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2"><BatteryWarning size={16} className="text-rose-400"/> Burnout Risk</div>
            <div className="text-2xl font-bold text-white">&gt;45<span className="text-sm text-zinc-500 font-normal ml-1">mins</span></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
