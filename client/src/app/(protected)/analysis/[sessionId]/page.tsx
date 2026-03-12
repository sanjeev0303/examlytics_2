"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import { useParams } from "next/navigation";

export default function AnalysisPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getToken, user, isLoading: authLoading } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const t = await getToken();
        if (!t) throw new Error("Not authenticated");
        setToken(t);
        const data = await api.getExamSession(sessionId, {
          headers: { Authorization: `Bearer ${t}` },
        });
        setResult(data);
      } catch (err: unknown) {
        console.error("Failed to fetch analysis:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">Failed to load response data</h2>
        <p className="text-gray-600">Error: {error}</p>
        <p className="text-xs text-gray-400 font-mono">Session: {sessionId}</p>
      </div>
    );
  }

  if (!result) return <div>Analysis not found.</div>;

  return (
    <AnalysisView
      initialResult={result}
      sessionId={sessionId}
      token={token!}
    />
  );
}
