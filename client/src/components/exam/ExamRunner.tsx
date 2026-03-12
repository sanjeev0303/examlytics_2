"use client";

import React, { useState, useEffect, useTransition, memo, useMemo } from "react";
import { useTimer } from "react-timer-hook";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Flag,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Menu,
  Sparkles,
  CircleDot,
  Send,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Question {
  id: string;
  text: string;
  options: string[];
  type: "MCQ" | "CODING" | "SUBJECTIVE";
}

interface ExamRunnerProps {
  questions: Question[];
  duration: number;
  onSubmit: (answers: { questionId: string; answer: string; timeSpent: number }[]) => void;
  isSubmitting?: boolean;
  title?: string;
  isStreaming?: boolean;
  totalExpected?: number;
  streamStatus?: string;
}

/* ─────────── Question Card ─────────── */
const QuestionArea = memo(
  ({
    question,
    questionNumber,
    totalQuestions,
    answer,
    isFlagged,
    onAnswer,
    onToggleFlag,
    onNavigate,
    isFirst,
    isLast,
    isPending,
    isStreaming,
    isSubmitting,
  }: {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    answer: string;
    isFlagged: boolean;
    onAnswer: (val: string) => void;
    onToggleFlag: () => void;
    onNavigate: (dir: "prev" | "next" | "submit") => void;
    isFirst: boolean;
    isLast: boolean;
    isPending: boolean;
    isStreaming: boolean;
    isSubmitting: boolean;
  }) => (
    <div className="mx-auto w-full max-w-3xl">
      {/* Question number + Flag row */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-500/20">
            {questionNumber}
          </span>
          <div className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            of {totalQuestions} &middot; {question.type}
          </div>
        </div>
        <button
          onClick={onToggleFlag}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            isFlagged
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          )}
        >
          <Flag className={cn("h-3.5 w-3.5", isFlagged && "fill-current")} />
          {isFlagged ? "Flagged" : "Flag"}
        </button>
      </div>

      {/* Question text */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-lg font-semibold leading-relaxed text-zinc-900 dark:text-white sm:text-xl">
          {question.text}
        </h2>

        {/* Options */}
        <div
          className={cn(
            "mt-8 space-y-3 transition-opacity duration-150",
            isPending ? "opacity-60" : "opacity-100"
          )}
        >
          {question.type === "MCQ" ? (
            <RadioGroup value={answer || ""} onValueChange={onAnswer} className="space-y-3">
              {(question.options || []).map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = answer === option;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-4 rounded-xl border px-5 py-4 transition-all",
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/60 shadow-sm shadow-indigo-500/10 dark:border-indigo-500/60 dark:bg-indigo-950/30"
                        : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    <RadioGroupItem value={option} id={`opt-${idx}`} className="sr-only" />
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-200/80 text-zinc-500 group-hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:group-hover:bg-zinc-600"
                      )}
                    >
                      {letter}
                    </span>
                    <Label
                      htmlFor={`opt-${idx}`}
                      className="flex-1 cursor-pointer text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300"
                    >
                      {option}
                    </Label>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          ) : (
            <textarea
              className="min-h-44 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium leading-relaxed outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:focus:border-indigo-500"
              placeholder="Type your answer here..."
              value={answer || ""}
              onChange={(e) => onAnswer(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => onNavigate("prev")}
          disabled={isFirst}
          className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {isLast ? (
          <Button
            onClick={() => onNavigate("submit")}
            disabled={isSubmitting || isStreaming}
            className="gap-2.5 rounded-xl bg-emerald-600 px-7 py-2.5 font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Exam
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => onNavigate("next")}
            className="gap-2 rounded-xl bg-zinc-900 px-6 font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
);
QuestionArea.displayName = "QuestionArea";

/* ─────────── Sidebar / Question Palette ─────────── */
const ExamSidebar = memo(
  ({
    questions,
    answers,
    flags,
    currentIndex,
    onNavigate,
    isStreaming,
    totalExpected,
  }: {
    questions: Question[];
    answers: Record<string, string>;
    flags: Record<string, boolean>;
    currentIndex: number;
    onNavigate: (index: number) => void;
    isStreaming: boolean;
    totalExpected: number;
  }) => {
    const answeredCount = Object.keys(answers).length;
    const flaggedCount = Object.values(flags).filter(Boolean).length;
    const loadedCount = questions.length;
    const pendingSlots = isStreaming ? Math.max(0, totalExpected - loadedCount) : 0;

    return (
      <aside className="hidden w-72 flex-col border-l border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:flex">
        {/* Header */}
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Question Palette
          </h3>
          {isStreaming && (
            <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span className="font-medium">
                Loading {loadedCount}/{totalExpected}...
              </span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const answered = !!answers[q.id];
              const flagged = !!flags[q.id];
              const active = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => onNavigate(idx)}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all duration-200",
                    active
                      ? "scale-110 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900"
                      : flagged
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                        : answered
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  )}
                >
                  {idx + 1}
                  {flagged && (
                    <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500 ring-1 ring-white dark:ring-zinc-900" />
                  )}
                </button>
              );
            })}

            {/* Streaming placeholder slots */}
            {Array.from({ length: pendingSlots }).map((_, idx) => (
              <div
                key={`pending-${idx}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700"
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-400/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <div className="border-t border-zinc-100 p-5 dark:border-zinc-800">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Answered
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                Flagged
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{flaggedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <div className="h-2.5 w-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
                Unanswered
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {loadedCount - answeredCount}
              </span>
            </div>
            {isStreaming && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-500">
                  <CircleDot className="h-2.5 w-2.5 animate-pulse" />
                  Streaming
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{pendingSlots}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }
);
ExamSidebar.displayName = "ExamSidebar";

/* ─────────── Main Component ─────────── */
export const ExamRunner = ({
  questions = [],
  duration,
  onSubmit,
  isSubmitting = false,
  title = "Exam Session",
  isStreaming = false,
  totalExpected = 0,
  streamStatus = "READY",
}: ExamRunnerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [times, setTimes] = useState<Record<string, number>>({});
  const [lastQuestionChange, setLastQuestionChange] = useState(Date.now());
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const expiryTimestamp = useMemo(() => {
    const d = new Date();
    d.setSeconds(d.getSeconds() + duration);
    return d;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { seconds, minutes, hours } = useTimer({
    expiryTimestamp,
    onExpire: () => handleSubmit(true),
  });

  const currentQuestion = questions[currentQuestionIndex];

  // Show elegant waiting state when questions haven't loaded yet
  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" />
          <Loader2 className="relative h-10 w-10 animate-spin text-indigo-500" />
        </div>
        <p className="text-sm font-medium text-zinc-500">Loading exam content...</p>
      </div>
    );
  }

  const handleAnswer = (val: string) => {
    startTransition(() => {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
    });
  };

  const toggleFlag = () => {
    setFlags((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }));
  };

  const handleNavigation = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    const now = Date.now();
    const spent = Math.floor((now - lastQuestionChange) / 1000);
    setTimes((prev) => ({
      ...prev,
      [currentQuestion.id]: (prev[currentQuestion.id] || 0) + spent,
    }));
    setLastQuestionChange(now);
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = (force = false) => {
    if (!force && isSubmitting) return;
    if (isStreaming && !force) {
      toast.warning("Still loading questions. Please wait...");
      return;
    }

    const unansweredCount = questions.length - Object.keys(answers).length;
    if (!force && unansweredCount > 0) {
      toast.warning(`You have ${unansweredCount} unanswered questions.`, {
        description: "Review your answers or submit now.",
        action: { label: "Submit Anyway", onClick: () => handleSubmit(true) },
      });
      return;
    }

    const now = Date.now();
    const spent = Math.floor((now - lastQuestionChange) / 1000);
    const finalTimes = {
      ...times,
      [currentQuestion.id]: (times[currentQuestion.id] || 0) + spent,
    };

    const submission = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || "",
      timeSpent: finalTimes[q.id] || 0,
    }));
    onSubmit(submission);
  };

  const onAreaNavigate = (dir: "prev" | "next" | "submit") => {
    if (dir === "prev") handleNavigation(currentQuestionIndex - 1);
    if (dir === "next") handleNavigation(currentQuestionIndex + 1);
    if (dir === "submit") handleSubmit(false);
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* ──── Top Bar ──── */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Mobile palette trigger */}
            <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
              <SheetTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 sm:w-80">
                <SheetHeader>
                  <SheetTitle className="text-left text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Question Palette
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 grid grid-cols-5 gap-2.5">
                  {questions.map((q, idx) => {
                    const answered = !!answers[q.id];
                    const flagged = !!flags[q.id];
                    const active = idx === currentQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          handleNavigation(idx);
                          setIsPaletteOpen(false);
                        }}
                        className={cn(
                          "relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all",
                          active
                            ? "bg-indigo-600 text-white shadow-md"
                            : flagged
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : answered
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        )}
                      >
                        {idx + 1}
                        {flagged && (
                          <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </button>
                    );
                  })}
                  {/* Streaming placeholders in mobile */}
                  {isStreaming &&
                    Array.from({ length: Math.max(0, totalExpected - questions.length) }).map(
                      (_, idx) => (
                        <div
                          key={`mp-${idx}`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700"
                        >
                          <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-400/60" />
                        </div>
                      )
                    )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Title + progress text */}
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h1>
              <p className="mt-0.5 text-xs text-zinc-400">
                Question {currentQuestionIndex + 1} of {questions.length}
                {isStreaming && (
                  <span className="ml-2 inline-flex items-center gap-1 text-indigo-500">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    streaming
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right side: timer + finish */}
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-sm font-bold tabular-nums",
                hours === 0 && minutes < 5
                  ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              )}
            >
              <Clock className="h-3.5 w-3.5 opacity-60" />
              {hours > 0 ? `${hours}:` : ""}
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </div>

            {/* Finish button (desktop) */}
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || isStreaming}
              className={cn(
                "hidden gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 sm:flex",
                isSubmitting && "opacity-80"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Finish Exam
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-0.5 w-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* ──── Content Area ──── */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <QuestionArea
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            answer={answers[currentQuestion.id]}
            isFlagged={!!flags[currentQuestion.id]}
            onAnswer={handleAnswer}
            onToggleFlag={toggleFlag}
            onNavigate={onAreaNavigate}
            isFirst={currentQuestionIndex === 0}
            isLast={currentQuestionIndex === questions.length - 1}
            isPending={isPending}
            isStreaming={isStreaming}
            isSubmitting={isSubmitting}
          />
        </main>

        {/* Desktop Sidebar */}
        <ExamSidebar
          questions={questions}
          answers={answers}
          flags={flags}
          currentIndex={currentQuestionIndex}
          onNavigate={handleNavigation}
          isStreaming={isStreaming}
          totalExpected={totalExpected || questions.length}
        />
      </div>
    </div>
  );
};
