"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ExamRunnerWrapper } from "@/components/exam/ExamRunnerWrapper";
import { useParams } from "next/navigation";
import { Loader2, Sparkles, Zap } from "lucide-react";

export default function ExamSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getToken, user, isLoading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalExpected, setTotalExpected] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string>("LOADING");
  const [duration, setDuration] = useState(600);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const questionIdsRef = useRef<Set<string>>(new Set());

  // Poll streaming endpoint for progressive question loading
  const pollStream = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const data = await api.getStreamingQuestions(sessionId, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      } as any);

      if (data.status === "FAILED") {
        setError("Exam generation failed. Please try again.");
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }

      if (data.totalExpected) setTotalExpected(data.totalExpected);
      if (data.duration) setDuration(data.duration);

      // Merge new questions without duplicates
      if (data.questions && data.questions.length > 0) {
        setQuestions((prev) => {
          const newQuestions = [...prev];
          for (const q of data.questions) {
            if (!questionIdsRef.current.has(q.id)) {
              questionIdsRef.current.add(q.id);
              newQuestions.push(q);
            }
          }
          return newQuestions;
        });

        setStreamStatus(data.status);
        setInitialLoading(false);
      }

      if (data.isComplete) {
        setIsComplete(true);
        setStreamStatus("READY");
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch {
      // Silently retry on network errors
    }
  }, [sessionId, getToken]);

  // Fallback: try full session load if streaming not available
  const tryFullSession = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return false;

      const data = await api.getExamSession(sessionId, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      } as any);

      if (data.status === "COMPLETED" && data.questions?.length > 0) {
        // Already completed exam — load normally for review
        setQuestions(data.questions);
        setTotalExpected(data.totalQuestions);
        setIsComplete(true);
        setStreamStatus("READY");
        setDuration(data.duration || 600);
        setInitialLoading(false);
        return true;
      }

      if ((data.status === "READY" || data.status === "LIVE") && data.questions?.length > 0) {
        setQuestions(data.questions);
        setTotalExpected(data.questions.length);
        setIsComplete(true);
        setStreamStatus("READY");
        setDuration(data.duration || 600);
        setInitialLoading(false);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, [sessionId, getToken]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("Authentication required");
      setInitialLoading(false);
      return;
    }

    // Start by trying streaming, with fallback to full session
    const init = async () => {
      // First try streaming endpoint
      await pollStream();

      // If no questions yet, try full session as fallback
      if (questionIdsRef.current.size === 0) {
        const loaded = await tryFullSession();
        if (loaded) return;
      }

      // Start polling if not yet complete
      if (!isComplete) {
        pollRef.current = setInterval(pollStream, 1500);
      }
    };

    init();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [authLoading, user, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop polling once complete
  useEffect(() => {
    if (isComplete && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [isComplete]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-900/20">
          <Zap className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show streaming loader while waiting for first question(s)
  if (initialLoading || questions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" />
          <div className="relative rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 p-5 shadow-xl shadow-indigo-500/25">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Crafting Your Exam</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            AI is generating personalized questions...
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:0ms]" />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <ExamRunnerWrapper
      questions={questions}
      duration={duration}
      sessionId={sessionId}
      isStreaming={!isComplete}
      totalExpected={totalExpected}
      streamStatus={streamStatus}
    />
  );
}
