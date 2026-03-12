"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/hooks/useAuth";
import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Filter, Search, History, BookOpen } from "lucide-react";
import { HistoryTimelineItem } from "@/components/exam/HistoryTimelineItem";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from 'motion/react';
import { History3D } from '@/components/ui/3d-icons';

export default function ExamHistoryPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();

  const { data: history, isLoading } = useQuery({
    queryKey: ["examHistory"],
    queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        return api.getExamHistory({
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    enabled: !!user?.id,
  });

  // Flatten Data for List
  const flatData = useMemo(() => {
    if (!history) return [];

    const grouped: Record<string, any[]> = {};
    history.forEach((session: any) => {
        const date = new Date(session.startedAt);
        let key = format(date, "MMMM yyyy");

        if (isToday(date)) key = "Today";
        else if (isYesterday(date)) key = "Yesterday";
        else if (isThisWeek(date)) key = "This Week";

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(session);
    });

    const groupOrder = ["Today", "Yesterday", "This Week"];
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        const idxA = groupOrder.indexOf(a);
        const idxB = groupOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0; // Natural sort for months ideally, but simplified for now
    });

    return sortedKeys.map(key => ({
        label: key,
        items: grouped[key].sort((a,b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    }));
  }, [history]);

  if (!user || (!isLoading && !user.id)) return <div className="flex h-screen items-center justify-center text-zinc-500">Please sign in to view history.</div>;

  if (isLoading) return (
      <div className="min-h-full w-full bg-zinc-50 pb-20 dark:bg-black relative overflow-hidden pt-8 sm:pt-12">
        <div className="mx-auto max-w-4xl px-4 py-12 animate-fade-in sm:px-6">
          {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mb-4 h-28 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
          ))}
        </div>
      </div>
  );

  return (
    <div className="min-h-full w-full bg-zinc-50 pb-20 dark:bg-black relative overflow-hidden pt-8 sm:pt-12">
      {/* Dynamic Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="absolute left-0 top-0 h-full w-full opacity-30 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="history-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-zinc-200 dark:text-zinc-800"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#history-grid)" />
        </svg>

        <motion.div
           animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] dark:bg-indigo-600/20"
        />
        <motion.div
           animate={{
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-0 h-100 w-100 -translate-y-1/2 translate-x-1/3 rounded-full bg-emerald-500/20 blur-[120px] dark:bg-emerald-600/20"
        />
        <motion.div
           animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-sky-500/20 blur-[100px] dark:bg-sky-600/20"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 mb-4 gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-transparent">
                  <History3D className="h-8 w-8" isActive={true} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                  Learning Journey
              </h1>
            </div>
            <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                A timeline of your assessments, performance, and growth.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
              <Button variant="outline" className="hidden items-center gap-2 rounded-xl border-zinc-200 bg-white font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:flex">
                  <Filter className="h-4 w-4" /> Filter
              </Button>
              <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                   <Input
                      placeholder="Search topics..."
                      className="h-10 w-full rounded-xl border-zinc-200 bg-white pl-10 font-medium placeholder:text-zinc-400 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                   />
              </div>
          </div>
        </div>

        {/* Timeline List */}
        <div className="relative">
            {flatData.length > 0 ? (
              <div className="space-y-10">
                  {flatData.map((group, groupIdx) => (
                      <div key={group.label} className="relative">
                           <div className="sticky top-0 z-20 mb-6 flex items-center bg-zinc-50/90 py-3 backdrop-blur-md dark:bg-zinc-950/90">
                              <h2 className="rounded-lg bg-zinc-200/50 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400">
                                  {group.label}
                              </h2>
                              <div className="ml-4 h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                          </div>

                          <div className="ml-3 space-y-4 border-l-2 border-zinc-200 pl-6 dark:border-zinc-800 sm:ml-0 sm:border-0 sm:pl-0">
                               {group.items.map((session, idx) => (
                                   <HistoryTimelineItem
                                      key={session.sessionId}
                                      session={session}
                                      isLast={idx === group.items.length - 1}
                                   />
                               ))}
                          </div>
                      </div>
                  ))}
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-32 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                      <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white sm:text-xl">No history recorded yet</h3>
                  <p className="mt-2 max-w-sm text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Your learning journey starts with your first step. Take an assessment to see it here.
                  </p>
                  <Button
                    onClick={() => router.push("/exams/create")}
                    className="mt-8 rounded-xl bg-indigo-600 px-6 font-semibold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600"
                  >
                      Start an Exam
                  </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
