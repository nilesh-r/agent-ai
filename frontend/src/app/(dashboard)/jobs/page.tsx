"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Job } from "@/types";

const tabs = ["All", "Matched", "Applied", "Archived"];

const statusStyle: Record<string, string> = {
  READY:    "border border-emerald-500/60 text-emerald-400 bg-emerald-500/10",
  SCRAPING: "border border-amber-500/60 text-amber-400 bg-amber-500/10",
  EMAILED:  "border border-sky-500/60 text-sky-400 bg-sky-500/10",
  APPLIED:  "border border-primary/60 text-primary bg-primary/10",
  ARCHIVED: "border border-outline-variant text-on-surface-variant bg-surface-container",
};

const matchColor = (m: number) => m >= 90 ? "text-emerald-400" : m >= 80 ? "text-amber-400" : "text-on-surface-variant";
const barColor  = (m: number) => m >= 90 ? "bg-emerald-400" : m >= 80 ? "bg-amber-400" : "bg-outline-variant";

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [allJobs, setAllJobs] = useState<Job[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getJobs();
        setAllJobs(data);
      } catch (e) {
        console.error("Failed to load jobs", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = allJobs.filter(j => {
    const tabMatch =
      activeTab === "All"      ? true :
      activeTab === "Matched"  ? (j.match_score || 0) >= 85 :
      activeTab === "Applied"  ? j.status === "APPLIED" :
      j.status === "ARCHIVED";
      
    const searchMatch = j.title?.toLowerCase().includes(search.toLowerCase()) || 
                        j.company?.toLowerCase().includes(search.toLowerCase());
    return tabMatch && searchMatch;
  });

  return (
    <div className="p-8 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-on-surface">Job Scraper &amp; Matcher</h2>
        <button 
          onClick={() => api.runAgent()} 
          className="bg-surface-container-highest hover:bg-surface-bright text-on-surface px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          Run Scraper
        </button>
      </div>

      {/* Search + Tabs */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">search</span>
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface placeholder-outline focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1 bg-surface-container rounded-lg p-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === t ? "bg-primary text-surface-dim" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/20">
        <div className="p-5 bg-surface-container-high">
          <h3 className="text-sm font-bold text-on-surface">All Opportunities</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Job Title</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Company</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Location</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Match %</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Status</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant text-sm">Loading jobs...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant text-sm">No jobs match your current filters.</td></tr>
            ) : filtered.map((job, i) => (
              <tr key={job.id || i} className="hover:bg-surface-container-high transition-colors">
                <td className="px-5 py-4 font-semibold text-on-surface">
                  {job.url ? <a href={job.url} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary">{job.title}</a> : job.title}
                </td>
                <td className="px-5 py-4 text-on-surface-variant">{job.company}</td>
                <td className="px-5 py-4 text-on-surface-variant">{job.location || "Remote"}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${matchColor(job.match_score || 0)}`}>{job.match_score || 0}%</span>
                    <div className="w-16 h-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor(job.match_score || 0)}`} style={{ width: `${job.match_score || 0}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${statusStyle[job.status || "READY"] || statusStyle.READY}`}>{job.status || "READY"}</span>
                </td>
                <td className="px-5 py-4">
                  <button className="text-outline hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-base">visibility</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
