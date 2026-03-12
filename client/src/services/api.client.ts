const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClient {
  static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      credentials: "include",
      headers,
    });

    if (res.status === 204) return null;

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || error.message || `API request failed: ${res.statusText}`);
    }

    return res.json();
  }
}
