"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function TopNavbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [running, setRunning] = useState(false);
  const { showToast } = useToast();

  const handleRunAgent = async () => {
    setRunning(true);
    try {
      await api.runAgent();
      showToast("Agent pipeline started! Refresh in a few seconds to see results.", "success");
      setTimeout(() => setRunning(false), 2000);
    } catch (e) {
      console.error(e);
      showToast("Failed to start agent. Is the backend running?", "error");
      setRunning(false);
    }
  };

  return (
    <header className="h-[72px] w-full sticky top-0 z-40 bg-surface-dim/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 shadow-2xl shadow-on-surface/5">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-on-surface-variant hover:text-on-surface transition-colors p-1"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <h2 className="text-lg font-semibold text-on-surface font-sans">
          Orchestrator
        </h2>
        <div className="h-4 w-[1px] bg-outline-variant hidden sm:block" />
        <div className="items-center gap-2 hidden sm:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
            Live Pipeline
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handleRunAgent}
          disabled={running}
          className="bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-surface-dim rounded-md px-4 sm:px-6 py-2 font-sans text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {running ? "hourglass_empty" : "play_arrow"}
          </span>
          <span className="hidden sm:inline">
            {running ? "Starting..." : "Run Agent"}
          </span>
        </button>
      </div>
    </header>
  );
}
