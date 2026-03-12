"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, useUser } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Loader2, Sparkles, ChevronRight, ChevronLeft,
  Briefcase, Trophy, BookOpen, Code2, Brain, FlaskConical,
  CheckCircle2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOALS = [
  {
    id: "JOB",
    label: "Land a Job",
    desc: "Ace technical interviews at top companies",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    active: "border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30",
  },
  {
    id: "COMPETITIVE",
    label: "Crack Competitive Exams",
    desc: "JEE, NEET, GATE and more",
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    active: "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30",
  },
  {
    id: "LEARNING",
    label: "Improve My Skills",
    desc: "General aptitude and programming",
    icon: BookOpen,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    active: "border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30",
  },
];

const EXAM_TYPES = [
  { id: "JOB",      label: "Job Interview",    icon: Briefcase,    color: "text-blue-500",    active: "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20" },
  { id: "CODING",   label: "Coding Challenge", icon: Code2,        color: "text-violet-500",  active: "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20" },
  { id: "JEE",      label: "JEE Mains/Adv",    icon: FlaskConical, color: "text-amber-500",   active: "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20" },
  { id: "NEET",     label: "NEET",             icon: Brain,        color: "text-rose-500",    active: "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20" },
  { id: "APTITUDE", label: "General Aptitude", icon: BookOpen,     color: "text-emerald-500", active: "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20" },
];

const LANGUAGES      = ["Python", "Java", "JavaScript", "C++", "Go", "Ruby", "Swift", "Rust"];
const JOB_CATEGORIES = ["Frontend Developer", "Backend Developer", "Full Stack", "DevOps", "Data Science", "System Design", "SQL", "Mobile Developer"];
const JEE_SUBJECTS   = ["Physics", "Chemistry", "Mathematics"];
const NEET_SUBJECTS  = ["Physics", "Chemistry", "Biology"];

const DIFFICULTY_META = {
  EASY:   { label: "Easy",   color: "text-emerald-500", desc: "Foundations & basics" },
  MEDIUM: { label: "Medium", color: "text-amber-500",   desc: "Standard difficulty" },
  HARD:   { label: "Hard",   color: "text-rose-500",    desc: "Advanced challenge" },
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ["Your Goal", "Exam Type", "Configure & Launch"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const done   = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300",
                  done   && "bg-primary border-primary text-primary-foreground",
                  active && "bg-primary/10 border-primary text-primary scale-110",
                  !done && !active && "bg-muted border-border text-muted-foreground"
                )}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span className={cn(
                "text-[10px] font-medium hidden sm:block text-center whitespace-nowrap",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {labels[i]}
              </span>
            </div>
            {i < total - 1 && (
              <div className={cn(
                "w-16 sm:w-24 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500",
                done ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [goal, setGoal] = useState("");

  // Step 2
  const [examType, setExamType] = useState("");

  // Step 3
  const [difficulty,    setDifficulty]    = useState("MEDIUM");
  const [mode,          setMode]          = useState("Mixed");
  const [questionCount, setQuestionCount] = useState([10]);
  const [language,      setLanguage]      = useState("");
  const [jobCategory,   setJobCategory]   = useState("");
  const [subjects,      setSubjects]      = useState<string[]>([]);
  const [topicFocus,    setTopicFocus]    = useState("");

  const handleSubjectToggle = (sub: string) =>
    setSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );

  const selectedType = EXAM_TYPES.find(t => t.id === examType);

  const handleGoalNext = () => {
    if (!goal) { toast.error("Please select a goal"); return; }
    setStep(2);
  };

  const handleTypeNext = () => {
    if (!examType) { toast.error("Please select an exam type"); return; }
    setLanguage(""); setJobCategory(""); setSubjects([]);
    setStep(3);
  };

  const handleLaunch = async () => {
    if (examType === "CODING" && !language)   { toast.error("Please select a programming language"); return; }
    if (examType === "JOB"    && !jobCategory){ toast.error("Please select a job role"); return; }
    if ((examType === "JEE" || examType === "NEET") && subjects.length === 0) {
      toast.error("Please select at least one subject"); return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) { toast.error("Please log in to continue"); setLoading(false); return; }

      // Save onboarding preferences (non-blocking)
      api.onboardUser({
        email: user?.email || "",
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "",
        role: goal,
        examTypes: [examType],
      }).catch(() => {});

      // Start exam
      const topicId = topicFocus
        || (examType === "CODING" ? language
          : examType === "JOB"   ? jobCategory
          : "General");

      const res = await api.startExam(
        {
          type: examType,
          mode: mode.toUpperCase(),
          difficulty,
          questionCount: questionCount[0],
          topicId,
          language:    examType === "CODING" ? language    : undefined,
          jobCategory: examType === "JOB"    ? jobCategory : undefined,
          subjects: (examType === "JEE" || examType === "NEET") ? subjects : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res?.jobId) { toast.error("Failed to start exam generation"); setLoading(false); return; }

      toast.success("Generating your exam…");

      const jobId = res.jobId;
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.getExamStatus(jobId, { headers: { Authorization: `Bearer ${token}` } });
          if (status.status === "READY" || status.status === "COMPLETED") {
            clearInterval(pollInterval);
            toast.success("Exam ready! Let's go!");
            router.push(`/exam/${status.sessionId || jobId}`);
          } else if (status.status === "STREAMING") {
            clearInterval(pollInterval);
            toast.success("Questions streaming! Let's go!");
            router.push(`/exam/${status.sessionId || jobId}`);
          } else if (status.status === "FAILED") {
            clearInterval(pollInterval);
            toast.error(status.error || "Exam generation failed");
            setLoading(false);
          }
        } catch { /* ignore */ }
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) { toast.error("Exam generation timed out"); setLoading(false); }
      }, 60000);

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full h-screen relative flex flex-col items-center justify-center px-4 py-12">
      {/* Animated SVG Grid Background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/80 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]">
        <svg
          className="absolute inset-0 h-full w-full stroke-zinc-400/30 dark:stroke-zinc-600/20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="onboarding-grid" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
              <path d="M0 40V.5H40" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#onboarding-grid)" />
        </svg>
      </div>

      {/* Floating 3D Orbs */}
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 right-1/4 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 left-1/4 h-96 w-96 translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-600/20"
      />

      <div className="w-full max-w-3xl relative z-10">

        {/* Header */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Exam Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {step === 1 && "What's your primary goal?"}
            {step === 2 && "Choose your exam type"}
            {step === 3 && "Configure your exam"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {step === 1 && "We'll personalise your experience based on this."}
            {step === 2 && "Pick the exam you want to start right now."}
            {step === 3 && "Fine-tune the parameters to match your needs."}
          </p>
        </div>

        <StepIndicator current={step} total={3} />

        {/* ── STEP 1: Goal ── */}
        {step === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {GOALS.map(g => {
              const Icon = g.icon;
              const isActive = goal === g.id;
              return (
                <motion.div whileHover={{ y: -4, scale: 1.01 }} key={g.id}>
                <button
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    "w-full h-full p-4 border-2 rounded-2xl text-left flex items-center gap-4 transition-all duration-200 backdrop-blur-sm",
                    isActive ? g.active : "border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", g.bg)}>
                    <Icon className={cn("w-6 h-6", g.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{g.label}</div>
                    <div className="text-sm text-muted-foreground">{g.desc}</div>
                  </div>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                </button>
                </motion.div>
              );
            })}

            <Button className="w-full h-12 mt-2 text-base font-semibold" onClick={handleGoalNext} disabled={!goal}>
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* ── STEP 2: Exam Type ── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXAM_TYPES.map(t => {
                const Icon = t.icon;
                const isActive = examType === t.id;
                return (
                  <motion.div whileHover={{ y: -4, scale: 1.02 }} key={t.id}>
                  <button
                    onClick={() => setExamType(t.id)}
                    className={cn(
                      "w-full h-full p-4 border-2 rounded-2xl text-left flex items-center gap-3 transition-all duration-200 backdrop-blur-sm",
                      isActive ? t.active : "border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", t.color)} />
                    <span className="font-semibold text-foreground text-sm">{t.label}</span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-primary ml-auto shrink-0" />}
                  </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="h-12 px-6" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 h-12 text-base font-semibold" onClick={handleTypeNext} disabled={!examType}>
                Configure Exam <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Configuration + Launch ── */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {selectedType && (
              <div className="flex justify-center mb-5">
                <Badge variant="outline" className={cn("gap-1.5 px-3 py-1 text-sm font-medium", selectedType.color)}>
                  <selectedType.icon className="w-3.5 h-3.5" />
                  {selectedType.label}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Left: Configuration */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 space-y-4">
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="w-4 h-4 text-primary" /> Exam Configuration
                    </CardTitle>
                    <CardDescription>Customise the AI-generated exam to fit your learning goals.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">

                    {examType === "CODING" && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Programming Language <span className="text-rose-500">*</span></Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="h-10 bg-muted/30 border-border/50">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {examType === "JOB" && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Target Role <span className="text-rose-500">*</span></Label>
                        <Select value={jobCategory} onValueChange={setJobCategory}>
                          <SelectTrigger className="h-10 bg-muted/30 border-border/50">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_CATEGORIES.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {(examType === "JEE" || examType === "NEET") && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Subjects <span className="text-rose-500">*</span>
                          <span className="text-muted-foreground font-normal ml-1">(select at least one)</span>
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border rounded-xl p-4 bg-muted/20">
                          {(examType === "JEE" ? JEE_SUBJECTS : NEET_SUBJECTS).map(sub => (
                            <label key={sub} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                id={sub}
                                checked={subjects.includes(sub)}
                                onCheckedChange={() => handleSubjectToggle(sub)}
                              />
                              <span className="text-sm font-medium text-muted-foreground">{sub}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Focus Topic <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Input
                        placeholder="e.g. Dynamic Programming, Organic Chemistry, SQL Joins…"
                        value={topicFocus}
                        onChange={e => setTopicFocus(e.target.value)}
                        className="bg-muted/30 border-border/50 h-10"
                      />
                      <p className="text-xs text-muted-foreground">Leave empty for a balanced mix.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Difficulty</Label>
                        <RadioGroup value={difficulty} onValueChange={setDifficulty} className="space-y-1.5">
                          {(["EASY", "MEDIUM", "HARD"] as const).map(d => (
                            <label key={d} className="flex items-center gap-2 cursor-pointer">
                              <RadioGroupItem value={d} id={`diff-${d}`} />
                              <span className={cn("text-sm font-medium", DIFFICULTY_META[d].color)}>{DIFFICULTY_META[d].label}</span>
                              <span className="text-xs text-muted-foreground">— {DIFFICULTY_META[d].desc}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Question Mode</Label>
                        <Select value={mode} onValueChange={setMode}>
                          <SelectTrigger className="h-10 bg-muted/30 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Objective">Objective (MCQ)</SelectItem>
                            <SelectItem value="Subjective">Subjective (Text)</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>

              {/* Right: Summary + Launch */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Exam Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Questions: {questionCount[0]}</Label>
                        <span className="text-xs text-muted-foreground">~{questionCount[0] * 2} mins</span>
                      </div>
                      <Slider
                        value={questionCount}
                        onValueChange={setQuestionCount}
                        min={5} max={50} step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5</span><span>50</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3.5 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">{selectedType?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Difficulty</span>
                        <span className={cn("font-medium", DIFFICULTY_META[difficulty as keyof typeof DIFFICULTY_META]?.color)}>
                          {difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mode</span>
                        <span className="font-medium">{mode}</span>
                      </div>
                      {language    && <div className="flex justify-between"><span className="text-muted-foreground">Language</span><span className="font-medium">{language}</span></div>}
                      {jobCategory && <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium">{jobCategory}</span></div>}
                      {subjects.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subjects</span>
                          <span className="font-medium text-right">{subjects.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full h-11 font-semibold text-sm" onClick={handleLaunch} disabled={loading}>
                      {loading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                        : <><Sparkles className="w-4 h-4 mr-2" /> Start Exam</>
                      }
                    </Button>
                  </CardContent>
                </Card>

                <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep(2)} disabled={loading}>
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Change exam type
                </Button>
              </motion.div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
