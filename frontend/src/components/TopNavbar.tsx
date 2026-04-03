"use client";
import { useState } from "react";
import { motion } from "framer-motion";
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
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 shadow-[0_0_12px_rgba(34,197,94,0.8)]"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase drop-shadow-[0_0_4px_rgba(34,197,94,0.3)]">
            Live Pipeline
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <motion.button
          whileHover={running ? {} : { scale: 1.05, boxShadow: "0px 0px 20px rgba(192, 193, 255, 0.4)" }}
          whileTap={running ? {} : { scale: 0.95 }}
          onClick={handleRunAgent}
          disabled={running}
          className="relative overflow-hidden bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-surface-dim rounded-md px-4 sm:px-6 py-2 font-sans text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
        >
          {running && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
          <motion.span
            className="material-symbols-outlined text-lg relative z-10"
            style={{ fontVariationSettings: "'FILL' 1" }}
            animate={running ? { rotate: 360 } : {}}
            transition={running ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
          >
            {running ? "autorenew" : "play_arrow"}
          </motion.span>
          <span className="hidden sm:inline relative z-10">
            {running ? "Starting..." : "Run Agent"}
          </span>
        </motion.button>
      </div>
    </header>
  );
}
