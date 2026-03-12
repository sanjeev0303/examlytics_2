import { ApiClient } from "./api.client";

export const AnalyticsService = {
  getWeakTopics: (options?: RequestInit) => ApiClient.fetchWithAuth("/exams/weak-topics", options),
  getStreaks: (options?: RequestInit) => ApiClient.fetchWithAuth("/analytics/streaks", options),
  getLearningCurve: (options?: RequestInit) => ApiClient.fetchWithAuth("/analytics/learning-curve", options),
  getReadinessScore: (options?: RequestInit) => ApiClient.fetchWithAuth("/analytics/readiness-score", options),
  getDueTopics: (options?: RequestInit) => ApiClient.fetchWithAuth("/analytics/due-topics", options),
};
