"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

const severityStyle: Record<string, string> = {
  HIGH: "text-rose-400 bg-rose-500/10 border border-rose-500/30",
  MED:  "text-amber-400 bg-amber-500/10 border border-amber-500/30",
  LOW:  "text-sky-400 bg-sky-500/10 border border-sky-500/30",
  info: "text-sky-400 bg-sky-500/10 border border-sky-500/30",
  warning: "text-amber-400 bg-amber-500/10 border border-amber-500/30",
  error: "text-rose-400 bg-rose-500/10 border border-rose-500/30",
  success: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
};

const getIcon = (severity: string) => {
  const s = severity.toLowerCase();
  if (s === "error" || s === "high") return "warning";
  if (s === "success") return "check_circle";
  if (s === "info" || s === "low") return "lightbulb";
  return "code_blocks";
};

export default function CodePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { showToast } = useToast();

  const handleAnalyze = async () => {
    if (!repoUrl) return;
    setLoading(true);
    setAnalyzed(false);
    try {
      const result = await api.analyzeRepo(repoUrl);
      setAnalysisResult(result);
      setAnalyzed(true);
    } catch (err) {
      console.error(err);
      showToast("Analysis failed. Ensure API keys are set in backend .env", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-on-surface">Code Analysis Agent</h2>
        <button
          onClick={handleAnalyze}
          disabled={loading || !repoUrl}
          className="bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-surface-dim px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <span className="w-4 h-4 border-2 border-surface-dim/30 border-t-surface-dim rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-base">play_arrow</span>}
          {loading ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>

      {/* Repo Input */}
      <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/20 flex items-center gap-3">
        <span className="material-symbols-outlined text-outline">code</span>
        <input
          type="text"
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          onKeyDown={e => e.key === "Enter" && handleAnalyze()}
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !repoUrl}
          className="text-xs font-bold text-primary hover:text-on-surface transition-colors px-3 py-1.5 border border-primary/40 rounded-lg hover:bg-primary/10 disabled:opacity-50"
        >
          Connect
        </button>
      </div>

      {!analyzed && !loading && (
        <div className="bg-surface-container rounded-xl flex items-center justify-center min-h-[400px] border border-outline-variant/20">
          <div className="text-center max-w-sm">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">terminal</span>
            <h3 className="text-base font-bold text-on-surface mb-2">Awaiting Repository</h3>
            <p className="text-sm text-on-surface-variant">Enter a GitHub URL above and click &quot;Run Analysis&quot; to start the Gemini code review.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-surface-container rounded-xl flex items-center justify-center min-h-[400px] border border-outline-variant/20 animate-pulse">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-primary mb-3 block animate-spin">sync</span>
            <h3 className="text-sm font-bold text-on-surface">Fetching from GitHub &amp; Prompting Gemini 1.5...</h3>
          </div>
        </div>
      )}

      {analyzed && analysisResult && (
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Score Card */}
          <div className="col-span-1 space-y-4">
            <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/20 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Engineering Score</p>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#c0c1ff] to-[#8083ff] mb-1">{analysisResult.score || 0}</div>
              <p className="text-xs text-on-surface-variant">/ 100 based on Repo &amp; README</p>
            </div>
          </div>

          {/* Right: Suggestions */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Gemini Improvement Suggestions</h3>
            {analysisResult.suggestions?.map((s: any, i: number) => (
              <div key={i} className="bg-surface-container rounded-xl p-4 border border-outline-variant/20 flex items-start gap-3">
                <span className={`material-symbols-outlined text-xl mt-0.5 ${s.severity === 'error' ? 'text-rose-400' : 'text-primary'}`}>{getIcon(s.severity)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-on-surface">{s.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${severityStyle[s.severity?.toLowerCase()] || severityStyle.LOW}`}>{s.severity?.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
