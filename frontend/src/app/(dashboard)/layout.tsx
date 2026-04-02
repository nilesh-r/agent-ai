"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { ToastProvider } from "@/components/Toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 lg:ml-[240px] flex flex-col bg-surface-dim min-h-screen">
        <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1">{children}</div>
        {/* Footer / System Status */}
        <footer className="mt-auto px-4 lg:px-8 py-4 bg-surface-container-lowest border-t border-surface-container-low flex items-center justify-between">
          <div className="flex gap-4 lg:gap-6 text-[10px] text-on-surface-variant font-mono">
            <span className="items-center gap-2 hidden sm:flex">
              CPU: <span className="text-emerald-400">12.4%</span>
            </span>
            <span className="flex items-center gap-2">
              LATENCY: <span className="text-emerald-400">14ms</span>
            </span>
            <span className="flex items-center gap-2">
              VERSION: <span className="text-primary">v1.0.0</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-outline font-bold uppercase tracking-widest">
            <span className="text-emerald-500">System Nominal</span>
          </div>
        </footer>
      </main>
    </ToastProvider>
  );
}
