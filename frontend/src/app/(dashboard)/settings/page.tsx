"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface IntegrationStatus {
  gemini: boolean;
  google_oauth: boolean;
  github: boolean;
  hunter: boolean;
  adzuna: boolean;
  mongodb: boolean;
  redis: boolean;
}

const integrations = [
  { key: "gemini", name: "Google Gemini", icon: "smart_toy", description: "AI text generation & semantic embeddings" },
  { key: "google_oauth", name: "Google OAuth", icon: "passkey", description: "Social sign-in authentication" },
  { key: "github", name: "GitHub API", icon: "code", description: "Repository analysis & code review" },
  { key: "hunter", name: "Hunter.io", icon: "mark_email_unread", description: "Recruiter email discovery" },
  { key: "adzuna", name: "Adzuna Jobs", icon: "travel_explore", description: "Real-time job listing API" },
  { key: "mongodb", name: "MongoDB", icon: "database", description: "Primary data store" },
  { key: "redis", name: "Redis", icon: "memory", description: "Task queue & caching" },
];

export default function SettingsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Check backend health
        const health = await api.getIntegrationStatus(); // Or a proper health endpoint if added to api.ts
        setBackendHealth(!!health); // Simplified for now

        // Check integration status
        const data = await api.getIntegrationStatus();
        setStatus(data as unknown as IntegrationStatus);
      } catch (e) {
        console.error("Failed to fetch settings", e);
        setBackendHealth(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const configured = status ? Object.values(status).filter(Boolean).length : 0;
  const total = integrations.length;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1200px] mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Settings & Integrations</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Monitor your API connections and system health
        </p>
      </div>

      {/* System Health Card */}
      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            System Health
          </h3>
          {!loading && (
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                backendHealth
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {backendHealth ? "All Systems Operational" : "Backend Unreachable"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-dim rounded-xl p-4 border border-outline-variant/30">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Backend API
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${backendHealth ? "bg-emerald-500" : backendHealth === false ? "bg-rose-500" : "bg-[#464554] animate-pulse"}`} />
              <span className="text-sm font-semibold text-on-surface">
                {loading ? "Checking..." : backendHealth ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <div className="bg-surface-dim rounded-xl p-4 border border-outline-variant/30">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Integrations
            </p>
            <span className="text-sm font-semibold text-on-surface">
              {loading ? "..." : `${configured} / ${total} Active`}
            </span>
          </div>
          <div className="bg-surface-dim rounded-xl p-4 border border-outline-variant/30">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              API Version
            </p>
            <span className="text-sm font-semibold text-primary">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Integration Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Connected Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const isActive = status?.[integration.key as keyof IntegrationStatus] ?? false;
            return (
              <div
                key={integration.key}
                className={`bg-surface-container rounded-xl p-5 border transition-all hover:bg-surface-container-high ${
                  isActive ? "border-emerald-500/20" : "border-outline-variant/20"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? "bg-primary/10" : "bg-surface-dim"}`}>
                    <span className={`material-symbols-outlined text-xl ${isActive ? "text-primary" : "text-outline"}`}>
                      {integration.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-1 rounded ${
                      loading
                        ? "bg-surface-dim text-on-surface-variant"
                        : isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {loading ? "..." : isActive ? "ACTIVE" : "NOT SET"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-on-surface mb-1">{integration.name}</h4>
                <p className="text-[11px] text-on-surface-variant">{integration.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/20">
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Configuration Guide
        </h3>
        <div className="bg-surface-dim rounded-xl p-4 font-mono text-xs text-on-surface-variant leading-relaxed">
          <p className="text-primary mb-2"># To configure integrations:</p>
          <p>1. Copy <span className="text-on-surface">backend/.env.example</span> → <span className="text-on-surface">backend/.env</span></p>
          <p>2. Fill in your API keys for each service</p>
          <p>3. Restart the backend: <span className="text-on-surface">uvicorn app.main:app --reload</span></p>
          <p className="mt-2 text-primary"># Required for full functionality:</p>
          <p>• <span className="text-on-surface">GEMINI_API_KEY</span> — Powers AI matching & email drafting</p>
          <p>• <span className="text-on-surface">ADZUNA_APP_ID + ADZUNA_API_KEY</span> — Real-time job discovery</p>
          <p>• <span className="text-on-surface">HUNTER_API_KEY</span> — Recruiter contact lookup</p>
        </div>
      </div>
    </div>
  );
}
