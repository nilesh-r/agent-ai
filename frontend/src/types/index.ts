export interface LoginData {
  email: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  password?: string;
  name?: string;
}

export interface StatsData {

  jobsFound: number;
  emailsSent: number;
  responseRate: number;
  avgMatch: number;
}

export type PipelineStatus = "idle" | "running" | "success" | "error";

export interface PipelineNode {
  id: string;
  name: string;
  status: PipelineStatus;
  lastRun?: string;
  errorMessage?: string;
}

export interface Log {
  id: string;
  level: string;
  message: string;
  timestamp: string;
  source?: string;
}

export interface Profile {
  user_id?: string;
  name?: string;
  title?: string;
  skills?: string | string[];
  roles?: string;
  preferred_roles?: string[];
  salary?: string;
  resume_text?: string;
  github_url?: string;
}

export type Job = {
  id: string;
  title: string;
  company: string;
  match_score?: number;
  status?: string;
  url?: string;
  location?: string;
  posted_at?: string;
}

export interface Email {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  status: "draft" | "sent" | "opened" | "bounced" | "failed";
  company?: string;
  created_at?: string;
}

export interface CodeSuggestion {
  title: string;
  description: string;
  severity: "HIGH" | "MED" | "LOW" | "info" | "warning" | "error" | "success";
}

export interface CodeAnalysisResult {
  score: number;
  suggestions: CodeSuggestion[];
}

export interface User {
  id?: string;
  name: string;
  email: string;
  provider?: string;
}
