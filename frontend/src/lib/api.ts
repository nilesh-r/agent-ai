import { StatsData, PipelineNode, Job, Email, User, Log, Profile, CodeAnalysisResult, LoginData, RegisterData } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

export async function fetchApi<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
  login: (data: LoginData): Promise<{ access_token: string }> =>
    fetchApi<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: RegisterData): Promise<User & { id: string }> =>
    fetchApi<User & { id: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: (token?: string): Promise<User> =>
    fetchApi<User>("/auth/me", token ? { headers: { Authorization: `Bearer ${token}` } } : {}),

  // Agents & Analytics
  getJobs: (): Promise<Job[]> => fetchApi<Job[]>("/api/jobs"),
  getStats: (): Promise<StatsData> => fetchApi<StatsData>("/api/stats"),
  getPipelineStatus: (): Promise<PipelineNode[]> => fetchApi<PipelineNode[]>("/api/pipeline-status"),
  getLogs: (limit = 100): Promise<Log[]> => fetchApi<Log[]>(`/api/logs?limit=${limit}`),
  getProfile: (): Promise<Profile> => fetchApi<Profile>("/api/profile"),
  updateProfile: (data: Partial<Profile> & { user_id?: string }): Promise<Profile> =>
    fetchApi<Profile>("/api/profile", { method: "PUT", body: JSON.stringify(data) }),
  analyzeRepo: (url: string): Promise<CodeAnalysisResult> =>
    fetchApi<CodeAnalysisResult>("/api/analyze-repo", { method: "POST", body: JSON.stringify({ url }) }),
  getEmails: (): Promise<Email[]> => fetchApi<Email[]>("/api/emails"),
  sendEmail: (emailId: string): Promise<{ success: boolean; message: string }> =>
    fetchApi<{ success: boolean; message: string }>(`/api/send-email/${emailId}`, { method: "POST" }),
  runAgent: (): Promise<{ success: boolean; message: string }> =>
    fetchApi<{ success: boolean; message: string }>("/api/run-agent", { method: "POST" }),

  // Settings
  getIntegrationStatus: (): Promise<Record<string, boolean>> => fetchApi<Record<string, boolean>>("/api/settings/status"),
};
