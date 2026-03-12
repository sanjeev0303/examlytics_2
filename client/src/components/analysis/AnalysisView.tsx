"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RadialChart } from "@/components/analytics/RadialChart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Loader2,
  BrainCircuit,
  Target,
  BarChart3,
  Lightbulb,
  Award,
  ArrowRight
} from "lucide-react";
import { AnalysisActionButtons } from "@/components/analysis/AnalysisActionButtons";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AnalysisViewProps {
  initialResult: any;
  sessionId: string;
  token: string;
}

export function AnalysisView({ initialResult, sessionId, token }: AnalysisViewProps) {
  const router = useRouter();

  const { data: result, isFetching } = useQuery({
    queryKey: ["exam-analysis", sessionId],
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${token}` };
      return api.getExamSession(sessionId, { headers });
    },
    initialData: initialResult,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll while session is still being processed
      if (data?.status && data.status !== "COMPLETED" && data.status !== "FAILED") {
        return 2000;
      }
      // Poll if AI analysis is still in progress
      if (
        data?.improvementRecommendation === "Analysis in progress..." ||
        data?.weakTopics?.[0]?.topicId === "Uncategorized"
      ) {
        return 2000;
      }
      return false;
    },
  });

  const isAnalyzing = result?.improvementRecommendation === "Analysis in progress...";
  const isProcessingSubmission = result?.status && result.status !== "COMPLETED" && result.status !== "FAILED";

  // Processing screen with modern unified design
  if (isProcessingSubmission) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-indigo-500/10 ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-white/10">
            <BrainCircuit className="h-10 w-10 animate-pulse text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Analyzing Your Performance
        </h1>
        <p className="mb-6 max-w-sm text-center text-sm text-zinc-500 dark:text-zinc-400">
          Our AI is evaluating your answers, calculating scores, and generating personalized recommendations...
        </p>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Processing</span>
        </div>
      </div>
    );
  }

  const scorePercentage = result?.totalQuestions > 0
    ? Math.round((result.correctCount / result.totalQuestions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 pt-10 dark:bg-black sm:pt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                <Target className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Exam Analysis
              </h1>
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Session Reference: <span className="font-mono text-zinc-400 dark:text-zinc-500">{sessionId.split('-')[0]}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="gap-2 rounded-xl border-zinc-200 bg-white font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <LayoutDashboardIcon className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Top Overview Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Accuracy Card using RadialChart wrapper */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
             <div className="absolute right-0 top-0 -mr-4 -mt-4 opacity-[0.03] dark:opacity-5">
                <Award className="h-32 w-32" />
             </div>
             <div className="relative z-10 flex h-full flex-col">
                <h3 className="mb-1 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                   Overall Score
                </h3>
                <div className="flex-1 -mx-4 mt-2">
                   <RadialChart
                     score={result.correctCount}
                     total={result.totalQuestions}
                     title=""
                     description=""
                   />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm font-medium text-zinc-600 dark:text-zinc-400">
                   <span>Correct: <strong className="text-zinc-900 dark:text-white">{result.correctCount}</strong></span>
                   <span>Total: <strong className="text-zinc-900 dark:text-white">{result.totalQuestions}</strong></span>
                </div>
             </div>
          </div>

          {/* Time Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
             <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                <Clock className="h-4 w-4" /> Duration Stats
             </h3>
             <div className="flex items-end gap-2">
               <span className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                 {Math.floor(result.timeTaken / 60)}<span className="text-2xl text-zinc-400 dark:text-zinc-600">m</span> {result.timeTaken % 60}<span className="text-2xl text-zinc-400 dark:text-zinc-600">s</span>
               </span>
             </div>
             <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
               Average <strong className="text-zinc-700 dark:text-zinc-300">{Math.floor(result.totalQuestions > 0 ? result.timeTaken / result.totalQuestions : 0)}s</strong> per question
             </p>
          </div>

          {/* AI Recommendation Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-indigo-200 bg-linear-to-br from-indigo-50 to-white p-6 shadow-sm transition-all hover:shadow-md dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-zinc-900">
             <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                <Lightbulb className="h-4 w-4" /> Expert Insight
             </h3>

             {isAnalyzing ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 opacity-70">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <p className="animate-pulse text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        Gathering insights...
                    </p>
                </div>
             ) : (
                <div className="flex h-full flex-col justify-center">
                    <p className="text-sm font-medium leading-relaxed text-indigo-950/80 dark:text-indigo-200/80">
                        {result.improvementRecommendation}
                    </p>
                </div>
             )}
          </div>
        </div>

        {/* Middle Section: Weak Topics & Summary */}
        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Weak Topics Panel */}
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
               <h3 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white">
                  <AlertTriangle className="h-5 w-5 text-amber-500" /> Needs Improvement
               </h3>
               {isAnalyzing && (
                 <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                   <Loader2 className="h-3 w-3 animate-spin" /> Analyzing
                 </span>
               )}
            </div>

            <div className="flex-1 rounded-xl bg-zinc-50/50 px-2 pb-2 pt-2 dark:bg-zinc-950/50">
               {(!result.weakTopics || result.weakTopics.length === 0) ? (
                  <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                      <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500/50" />
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Awesome job! No weak areas detected.</p>
                  </div>
               ) : (
                  <div className="flex flex-col gap-2">
                     {(result.weakTopics || []).map((topic: any, idx: number) => {
                         const accuracy = Math.round(topic.accuracy);
                         const isCritical = accuracy < 40;
                         return (
                             <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                                 <div>
                                     <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {topic.topicName && topic.topicName !== "Unknown" ? topic.topicName : (topic.topicId || "Uncategorized")}
                                     </div>
                                     <div className={cn(
                                        "mt-1 w-fit rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                        isCritical
                                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                     )}>
                                        {topic.severity} Priority
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className={cn(
                                        "block text-xl font-black tracking-tight",
                                        isCritical ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-500"
                                     )}>
                                        {accuracy}%
                                     </span>
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Accuracy</span>
                                 </div>
                             </div>
                         );
                     })}
                  </div>
               )}
            </div>

            {/* Improve Buttons */}
            {((result.weakTopics || []).length > 0 && !isAnalyzing) && (
               <div className="p-4 pt-4">
                   <AnalysisActionButtons weakTopics={result.weakTopics} />
               </div>
            )}
          </div>

          {/* Quick Stats Panel */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
             <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white">
                <BarChart3 className="h-5 w-5 text-indigo-500" /> Performance Breakdown
             </h3>
             <div className="space-y-5">
                 <div className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                       </div>
                       <span className="font-medium text-zinc-600 dark:text-zinc-300">Correct Answers</span>
                    </div>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">{result.correctCount}</span>
                 </div>

                 <div className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                          <XCircle className="h-5 w-5" />
                       </div>
                       <span className="font-medium text-zinc-600 dark:text-zinc-300">Incorrect Answers</span>
                    </div>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                       {result.totalQuestions - result.correctCount}
                    </span>
                 </div>

                 <div className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          <Target className="h-5 w-5" />
                       </div>
                       <span className="font-medium text-zinc-600 dark:text-zinc-300">Total Attempted</span>
                    </div>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">{result.totalQuestions}</span>
                 </div>
             </div>
             <div className="mt-8">
                <AnalysisActionButtons mode="dashboard" />
             </div>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div>
           <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800 sm:flex-row sm:items-end">
              <div>
                 <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Detailed Review</h2>
                 <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">A question-by-question breakdown of your performance.</p>
              </div>
           </div>

           <div className="space-y-6">
              {(result.questions || []).map((q: any, idx: number) => {
                  const isCorrect = q.isCorrect;
                  return (
                      <div
                        key={idx}
                        className={cn(
                          "overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-900",
                          isCorrect ? "border-emerald-200/60 dark:border-emerald-900/30" : "border-rose-200/60 dark:border-rose-900/30"
                        )}
                      >
                         {/* Question Header */}
                         <div className={cn(
                            "flex items-start justify-between gap-4 border-b bg-zinc-50/50 px-6 py-4 dark:bg-zinc-950/50",
                            isCorrect ? "border-emerald-100 dark:border-emerald-900/20" : "border-rose-100 dark:border-rose-900/20"
                         )}>
                             <div className="flex items-start gap-4">
                                <span className={cn(
                                   "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                                   isCorrect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                                )}>
                                   {idx + 1}
                                </span>
                                <h3 className="mt-1 text-base font-semibold leading-relaxed text-zinc-900 dark:text-zinc-100">
                                   {q.text}
                                </h3>
                             </div>
                             <div className={cn(
                                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm",
                                isCorrect
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-900/50"
                                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-900/50"
                             )}>
                                 {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                 {isCorrect ? "Correct" : "Incorrect"}
                             </div>
                         </div>

                         {/* Answers Body */}
                         <div className="px-6 py-5">
                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                 {/* User Answer */}
                                 <div className={cn(
                                    "rounded-xl border p-4",
                                    isCorrect
                                      ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/20 dark:bg-emerald-950/10"
                                      : "border-rose-100 bg-rose-50/50 dark:border-rose-900/20 dark:bg-rose-950/10"
                                 )}>
                                     <div className="mb-2 flex items-center gap-2">
                                        <span className={cn(
                                           "text-[10px] font-bold uppercase tracking-widest",
                                           isCorrect ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"
                                        )}>
                                           Your Answer
                                        </span>
                                     </div>
                                     <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                        {q.userAnswer || <span className="italic text-zinc-400">Skipped</span>}
                                     </p>
                                 </div>

                                 {/* Correct Answer (if wrong) */}
                                 {!isCorrect && (
                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/20 dark:bg-emerald-950/10">
                                        <div className="mb-2 flex items-center gap-2">
                                           <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                                              Correct Answer
                                           </span>
                                        </div>
                                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                           {q.correctAnswer}
                                        </p>
                                    </div>
                                 )}
                             </div>

                             {/* Explanation */}
                             {q.explanation && (
                                 <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/20 dark:bg-indigo-950/10">
                                     <div className="mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                         <HelpCircle className="h-4 w-4" />
                                         <span className="text-xs font-bold uppercase tracking-widest">Explanation</span>
                                     </div>
                                     <p className="text-sm leading-relaxed text-indigo-950/80 dark:text-indigo-200/80">
                                         {q.explanation}
                                     </p>
                                 </div>
                             )}

                             {/* Footer Meta */}
                             <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                                 <div className="flex items-center gap-1.5">
                                     <Clock className="h-3.5 w-3.5" /> Time spent: {q.timeSpent || 0}s
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                     <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                     Type: <span className="uppercase">{q.type}</span>
                                 </div>
                             </div>
                         </div>
                      </div>
                  );
              })}
           </div>
        </div>
      </div>
    </div>
  );
}

// Ensure LayoutDashboardIcon is available
function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
