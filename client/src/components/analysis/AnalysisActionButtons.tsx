"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Zap, ArrowRight, BookOpen, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisActionButtonsProps {
  weakTopics?: any[];
  mode?: "improve" | "dashboard";
}

export function AnalysisActionButtons({ weakTopics = [], mode = "improve" }: AnalysisActionButtonsProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState([10]);
  const [examMode, setExamMode] = useState("Mixed");

  if (mode === "dashboard") {
    return (
      <Button
        onClick={() => router.push('/dashboard')}
        className="group w-full gap-2 rounded-xl bg-zinc-900 px-6 py-5 font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <LayoutDashboardIcon className="h-4 w-4" />
        Return to Dashboard
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    );
  }

  const handleStartExam = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      // Use first weak topic's ID or name
      const firstTopic = weakTopics[0];
      const topicIdentifier = firstTopic?.topicId || firstTopic?.topicName || "general-improvement";

      const payload = {
        type: "IMPROVEMENT",
        mode: examMode,
        difficulty: "MEDIUM",
        questionCount: questionCount[0],
        topicId: topicIdentifier,
      };

      const res = await api.startExam(payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res && res.jobId) {
        const jobId = res.jobId;
        toast.success("Initializing practice session...");
        setOpen(false);

        // Streaming is fast now, redirect immediately to target ID (jobId for pending) or session page
        router.push(`/exam/${jobId}`);
      } else {
        toast.error("Failed to start exam");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!weakTopics || weakTopics.length === 0}
          className="group w-full gap-2 rounded-xl bg-emerald-600 px-6 py-5 font-semibold text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <Zap className="h-4 w-4" />
          Improve Weak Areas
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden rounded-2xl p-0 dark:border-zinc-800 dark:bg-zinc-900 border-zinc-200">
        <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white dark:from-emerald-900/50 dark:to-teal-900/50 dark:border-b dark:border-zinc-800">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
                <TargetIcon className="h-5 w-5" /> Target Practice
             </DialogTitle>
             <DialogDescription className="text-emerald-50 dark:text-emerald-200/80 font-medium">
               Configure a custom session to strengthen your weak topics
             </DialogDescription>
           </DialogHeader>
        </div>

        <div className="space-y-6 bg-white p-6 dark:bg-zinc-900">
          {/* Question Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <Label className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-white">
                 Session Length
               </Label>
               <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                 {questionCount[0]} Questions
               </span>
            </div>
            <Slider
              value={questionCount}
              onValueChange={setQuestionCount}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-bold text-zinc-400">
              <span>MIN 5</span>
              <span>MAX 50</span>
            </div>
          </div>

          {/* Exam Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-white">
               Question Format
            </Label>
            <RadioGroup value={examMode} onValueChange={setExamMode} className="grid grid-cols-1 gap-2">
              <Label
                htmlFor="objective"
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                  examMode === "Objective" ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-950/20" : "border-zinc-200 dark:border-zinc-800"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      examMode === "Objective" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                   )}>
                      <CheckBoxIcon className="h-4 w-4" />
                   </div>
                   <div className="font-medium text-zinc-900 dark:text-zinc-100">Multiple Choice</div>
                </div>
                <RadioGroupItem value="Objective" id="objective" className="sr-only" />
              </Label>

              <Label
                htmlFor="subjective"
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                  examMode === "Subjective" ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-950/20" : "border-zinc-200 dark:border-zinc-800"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      examMode === "Subjective" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                   )}>
                      <PenTool className="h-4 w-4" />
                   </div>
                   <div className="font-medium text-zinc-900 dark:text-zinc-100">Open Ended</div>
                </div>
                <RadioGroupItem value="Subjective" id="subjective" className="sr-only" />
              </Label>

              <Label
                htmlFor="mixed"
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                  examMode === "Mixed" ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-950/20" : "border-zinc-200 dark:border-zinc-800"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      examMode === "Mixed" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                   )}>
                      <BookOpen className="h-4 w-4" />
                   </div>
                   <div className="font-medium text-zinc-900 dark:text-zinc-100">Mixed Format</div>
                </div>
                <RadioGroupItem value="Mixed" id="mixed" className="sr-only" />
              </Label>
            </RadioGroup>
          </div>

          <div className="pt-2">
             {/* Start Button */}
             <Button
               onClick={handleStartExam}
               disabled={loading}
               className="w-full gap-2 rounded-xl bg-emerald-600 py-6 font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
             >
               {loading ? (
                 <>
                   <Loader2 className="h-5 w-5 animate-spin" />
                   Initializing Session...
                 </>
               ) : (
                 <>
                   <Zap className="h-5 w-5" />
                   Begin Practice
                 </>
               )}
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Icons
function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <circle cx="12" cy="12" r="10"/>
       <circle cx="12" cy="12" r="6"/>
       <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
function CheckBoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <path d="m9 12 2 2 4-4"/>
     </svg>
  );
}
function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
