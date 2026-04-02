const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getCookie("auth-token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Clear stale cookie and redirect to login
    if (typeof document !== "undefined") {
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please sign in again.");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (data: any) =>
    fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: any) =>
    fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: (token?: string) =>
    fetchApi("/auth/me", token ? { headers: { Authorization: `Bearer ${token}` } } : {}),

  // Agents & Analytics
  getJobs: () => fetchApi("/api/jobs"),
  getStats: () => fetchApi("/api/stats"),
  getPipelineStatus: () => fetchApi("/api/pipeline-status"),
  getLogs: (limit = 100) => fetchApi(`/api/logs?limit=${limit}`),
  getProfile: () => fetchApi("/api/profile"),
  updateProfile: (data: any) =>
    fetchApi("/api/profile", { method: "PUT", body: JSON.stringify(data) }),
  analyzeRepo: (url: string) =>
    fetchApi("/api/analyze-repo", { method: "POST", body: JSON.stringify({ url }) }),
  getEmails: () => fetchApi("/api/emails"),
  sendEmail: (emailId: string) =>
    fetchApi(`/api/send-email/${emailId}`, { method: "POST" }),
  runAgent: () =>
    fetchApi("/api/run-agent", { method: "POST" }),

  // Settings
  getIntegrationStatus: () => fetchApi("/api/settings/status"),
};
