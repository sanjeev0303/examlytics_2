"use client";

import { cn } from "@/lib/utils";

interface BenchmarkProps {
    userScore: number;
    cohortScore: number;
    label: string;
}

export function BenchmarkBar({ userScore, cohortScore, label }: BenchmarkProps) {
    return (
        <div className="space-y-3 group">
            <div className="flex justify-between text-sm items-center">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">{label}</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-lg font-mono text-zinc-900 dark:text-white">
                        {userScore}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
                        vs {cohortScore}%
                    </span>
                </div>
            </div>
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden relative shadow-inner">
                {/* Cohort Marker */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-zinc-300 dark:bg-zinc-600 z-10 box-content border-x border-white dark:border-zinc-900"
                    style={{ left: `${cohortScore}%` }}
                    title={`Cohort: ${cohortScore}%`}
                />

                {/* User Fill */}
                <div
                    className={cn(
                        "h-full rounded-r-full transition-all duration-1500e-out",
                        userScore >= cohortScore
                            ? "bg-linear-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            : "bg-linear-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                    )}
                    style={{ width: `${userScore}%` }}
                />
            </div>
        </div>
    );
}
