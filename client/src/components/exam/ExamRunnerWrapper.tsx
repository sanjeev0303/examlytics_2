"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { ExamRunner } from "./ExamRunner";

interface ExamRunnerWrapperProps {
  questions: any[];
  duration: number;
  sessionId: string;
  isStreaming?: boolean;
  totalExpected?: number;
  streamStatus?: string;
}

export function ExamRunnerWrapper({
  questions,
  duration,
  sessionId,
  isStreaming = false,
  totalExpected = 0,
  streamStatus = "READY",
}: ExamRunnerWrapperProps) {
  const router = useRouter();
  const { getToken } = useAuth();

  const submitMutation = useMutation({
    mutationFn: async (answers: any[]) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
      };
      const timeTaken = answers.reduce((acc: any, curr: any) => acc + (curr.timeSpent || 0), 0);
      return api.submitExam({ sessionId, answers, timeTaken }, { headers });
    },
    onSuccess: () => {
       router.replace(`/analysis/${sessionId}`);
    },
    onError: (error) => {
        console.error(error);
        alert("Failed to submit exam");
    }
  });

  return (
     <ExamRunner
       questions={questions}
       duration={duration}
       onSubmit={(answers) => submitMutation.mutate(answers)}
       isSubmitting={submitMutation.isPending}
       isStreaming={isStreaming}
       totalExpected={totalExpected}
       streamStatus={streamStatus}
     />
  );
}
