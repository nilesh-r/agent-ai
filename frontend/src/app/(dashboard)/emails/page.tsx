"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Email } from "@/types";

const statusStyle: Record<string, string> = {
  DRAFT:   "bg-primary/20 text-primary",
  SENT:    "bg-sky-500/20 text-sky-400",
  OPENED:  "bg-emerald-500/20 text-emerald-400",
  BOUNCED: "bg-rose-500/20 text-rose-400",
};

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selected, setSelected] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getEmails();
        setEmails(data);
        if (data.length > 0) setSelected(data[0]);
      } catch (e) {
        console.error("Failed to load emails", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Panel — Email List */}
      <div className="w-72 shrink-0 border-r border-outline-variant/30 bg-surface-container flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <h2 className="text-sm font-bold text-on-surface">Outreach Queue</h2>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{emails.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/20">
          {loading ? (
            <div className="p-4 text-center text-xs text-on-surface-variant">Loading emails...</div>
          ) : emails.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant">No emails found. Start the agent.</div>
          ) : emails.map(e => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className={`w-full text-left px-4 py-3 hover:bg-surface-container-high transition-colors ${selected?.id === e.id ? "bg-surface-container-high border-l-2 border-primary" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-on-surface truncate pr-2">{e.company || "Company"}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusStyle[e.status?.toUpperCase()] || statusStyle.DRAFT}`}>{e.status?.toUpperCase() || "DRAFT"}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate">{e.recipient || "No recipient"}</p>
              <p className="text-[10px] text-outline mt-0.5">Auto-generated</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel — Active Draft */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="p-5 bg-surface-container-high flex justify-between items-center border-b border-outline-variant/30 shrink-0">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-on-surface">Active Outreach Preview</h3>
                <p className="text-[10px] text-on-surface-variant">To: {selected.recipient || "Recruiting Manager"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-[10px] font-bold rounded ${statusStyle[selected.status?.toUpperCase()] || statusStyle.DRAFT}`}>{selected.status?.toUpperCase() || "DRAFT"}</span>
              </div>
            </div>

            <div className="flex-1 p-6 bg-surface-container-low font-mono text-sm leading-relaxed text-on-surface-variant overflow-y-auto whitespace-pre-wrap">
              {selected.body}
            </div>

            {selected.status !== "sent" && (
              <div className="p-4 bg-surface-container-high flex items-center justify-between gap-3 border-t border-outline-variant/30 shrink-0">
                <button className="flex-1 px-4 py-3 border border-outline-variant text-on-surface rounded-lg text-sm font-bold hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Text
                </button>
                <button onClick={async () => {
                    try {
                      await api.sendEmail(selected.id);
                      setSelected({ ...selected, status: "sent" });
                      setEmails(prev => prev.map(e => e.id === selected.id ? { ...e, status: "sent" } : e));
                    } catch (err) {
                      console.error("Failed to send email", err);
                    }
                  }} className="flex-1 px-4 py-3 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-surface-dim rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  Approve &amp; Send Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-on-surface-variant">
            Select an email to preview
          </div>
        )}
      </div>
    </div>
  );
}
