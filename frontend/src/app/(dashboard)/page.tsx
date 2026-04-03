"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatsData, PipelineNode, Job, Email } from "@/types";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon?: string }> = {
  success: { 
    color: "emerald", 
    bg: "bg-emerald-500 text-emerald-500 border-emerald-500", 
    icon: "check_circle" 
  },
  running: { 
    color: "amber", 
    bg: "bg-amber-500 text-amber-500 border-amber-500 animate-pulse", 
    icon: "sync" 
  },
  error: { 
    color: "rose", 
    bg: "bg-rose-500 text-rose-500 border-rose-500", 
    icon: "error" 
  },
  idle: { 
    color: "gray", 
    bg: "bg-[#31353e] text-[#908fa0] border-[#464554]", 
    icon: "pause_circle" 
  },
};

const PIPELINE_ICONS = ["travel_explore", "memory", "person_search", "outgoing_mail", "code"];

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData>({ jobsFound: 0, emailsSent: 0, responseRate: 0, avgMatch: 0 });
  const [pipeline, setPipeline] = useState<PipelineNode[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, pipelineData, jobsData, emailsData] = await Promise.all([
          api.getStats(),
          api.getPipelineStatus(),
          api.getJobs(),
          api.getEmails()
        ]);
        setStats(statsData || { jobsFound: 0, emailsSent: 0, responseRate: 0, avgMatch: 0 });
        setPipeline(pipelineData || []);
        setJobs((jobsData || []).slice(0, 3));
        setEmails((emailsData || []).slice(0, 1));
        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Unable to connect to the career agent service. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
    
    // Poll pipeline status every 5 seconds
    const interval = setInterval(async () => {
      try {
        const pipelineData = await api.getPipelineStatus();
        setPipeline(pipelineData);
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBgColor = (status: string) => {
    return STATUS_CONFIG[status]?.bg || STATUS_CONFIG.idle.bg;
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 max-w-[1200px] mx-auto w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-[#181c24] p-6 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Jobs Found Today</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#dfe2ee]">
                {loading ? "..." : stats.jobsFound}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl text-[#31353e] opacity-20 group-hover:scale-110 transition-transform">search</span>
        </div>
        <div className="bg-[#181c24] p-6 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Emails Sent</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#dfe2ee]">
                {loading ? "..." : stats.emailsSent}
              </span>
              <span className="text-xs text-[#c0c1ff] font-medium">Daily Limit: 200</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl text-[#31353e] opacity-20 group-hover:scale-110 transition-transform">send</span>
        </div>
        <div className="bg-[#181c24] p-6 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Response Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#dfe2ee]">
                {loading ? "..." : `${stats.responseRate}%`}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl text-[#31353e] opacity-20 group-hover:scale-110 transition-transform">analytics</span>
        </div>
        <div className="bg-[#181c24] p-6 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Avg Match Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#dfe2ee]">
                {loading ? "..." : stats.avgMatch}
              </span>
              <span className="text-xs text-[#c0c1ff] font-medium">/ 100</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl text-[#31353e] opacity-20 group-hover:scale-110 transition-transform">target</span>
        </div>
      </div>

      {/* Agent Workflow Visualization */}
      <div className="bg-[#1c2028] rounded-xl p-8 shadow-inner">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#c7c4d7]">Active Pipeline: Career Orchestration</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-semibold text-[#c7c4d7]">SUCCESS</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] font-semibold text-[#c7c4d7]">RUNNING</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[10px] font-semibold text-[#c7c4d7]">ERROR</span></div>
          </div>
        </div>
        <div className="relative flex items-start justify-between">
          {pipeline.length > 0 ? pipeline.map((node, i) => {
            return (
              <React.Fragment key={node.id}>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center ${getStatusBgColor(node.status)} bg-opacity-20`}>
                    <span className="material-symbols-outlined text-2xl">{PIPELINE_ICONS[i] || "filter_vintage"}</span>
                  </div>
                  <p className={`text-[11px] font-bold ${node.status === 'idle' ? 'text-[#c7c4d7]' : ''}`}>{node.name}</p>
                </div>
                {i < pipeline.length - 1 && <div className={`mt-7 flex-1 workflow-line mx-2 ${node.status === 'idle' ? 'opacity-50' : ''}`}></div>}
              </React.Fragment>
            );
          }) : (
            <div className="w-full text-center text-sm text-[#908fa0]">
              {error ? <span className="text-rose-400">{error}</span> : "Initializing career orchestration pipeline..."}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Tables & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Jobs Table (Left) */}
        <div className="lg:col-span-7 bg-[#1c2028] rounded-xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 bg-[#262a33] flex items-center gap-3 border-b border-[#31353e]/50">
            <h3 className="text-sm font-bold tracking-tight">Recent Opportunities</h3>
            <div className="flex-1"></div>
            <Link href="/jobs" className="text-xs text-[#c0c1ff] hover:underline font-bold shrink-0">View All Jobs →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#181c24] text-[#c7c4d7] text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Match %</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#31353e]">
                {jobs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#908fa0]">No jobs found yet. Run the agent.</td>
                  </tr>
                )}
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#31353e]/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{job.title}</td>
                    <td className="px-6 py-4 text-sm text-[#c7c4d7]">{job.company}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-400">{job.match_score || 0}%</span>
                        <div className="w-12 h-1.5 bg-[#464554] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${job.match_score || 0}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">{job.status || "Ready"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Panel (Right) */}
        <div className="lg:col-span-5 bg-[#1c2028] rounded-xl flex flex-col shadow-xl border border-[#31353e]/30">
          <div className="p-6 bg-[#262a33] flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold tracking-tight">Active Outreach</h3>
              <p className="text-[10px] text-[#c7c4d7]">
                {emails.length > 0 ? `To: ${emails[0].recipient}` : "No active drafts at the moment."}
              </p>
            </div>
            {emails.length > 0 && <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded">{emails[0].status?.toUpperCase() || "DRAFT"}</span>}
          </div>
          <div className="p-6 flex-1 bg-[#181c24] font-mono text-[11px] leading-relaxed text-[#c7c4d7] overflow-y-auto max-h-[200px] whitespace-pre-wrap">
            {emails.length > 0 ? emails[0].body : "Start the pipeline to generate your first AI outreach email."}
          </div>
          <div className="p-4 bg-[#262a33] flex items-center justify-between gap-3">
            <Link href="/emails" className="flex-1 px-4 py-2 border border-[#464554] text-[#dfe2ee] rounded-lg text-xs font-bold hover:bg-[#31353e] transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">visibility</span>
              View All Emails
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
