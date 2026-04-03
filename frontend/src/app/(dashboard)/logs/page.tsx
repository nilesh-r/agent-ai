"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Log } from "@/types";

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.getLogs();
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
    
    // Live polling every 5s
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const levelStyles: Record<string, string> = {
    SUCCESS: "text-emerald-400",
    RUNNING: "text-amber-400 animate-pulse",
    PENDING: "text-[#c7c4d7]",
    ERROR:   "text-rose-400",
  };

  const dotStyles: Record<string, string> = {
    SUCCESS: "bg-emerald-500",
    RUNNING: "bg-amber-500 animate-pulse",
    PENDING: "bg-[#464554]",
    ERROR:   "bg-rose-500",
  };

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-on-surface">Activity Logs</h2>
        <button 
          onClick={() => api.runAgent()}
          className="bg-surface-container-highest hover:bg-surface-bright text-on-surface px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          Trigger Agent
        </button>
      </div>

      <div className="bg-surface-container rounded-xl overflow-hidden shadow-inner border border-outline-variant/20">
        <div className="p-5 bg-surface-container-high flex items-center gap-3 border-b border-outline-variant/30">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]"></div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Live Execution Log (Polling)</h3>
        </div>

        <div className="bg-surface-container-lowest font-mono text-[12px] divide-y divide-outline-variant/10 max-h-[600px] overflow-y-auto">
          {loading && logs.length === 0 && (
            <div className="p-6 text-center text-on-surface-variant">Connecting to log stream...</div>
          )}
          {!loading && logs.length === 0 && (
            <div className="p-6 text-center text-on-surface-variant">No logs recorded yet.</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-surface-container transition-colors">
              <span className="text-outline shrink-0">{log.timestamp}</span>
              <div className="flex items-center gap-2 w-28 shrink-0">
                <div className={`w-1.5 h-1.5 rounded-full ${dotStyles[log.level] || dotStyles.PENDING}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${levelStyles[log.level] || levelStyles.PENDING}`}>{log.level}</span>
              </div>
              <span className="text-on-surface-variant">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
