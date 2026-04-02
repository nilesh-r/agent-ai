"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(profile);
      showToast("Profile saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save profile. Ensure backend is running.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-[1200px] mx-auto w-full animate-pulse">
        <div className="h-24 w-24 bg-surface-container rounded-full mb-8"></div>
        <div className="h-8 w-48 bg-surface-container rounded mb-2"></div>
        <div className="h-4 w-32 bg-surface-container rounded"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-rose-400 max-w-[1200px] mx-auto w-full">Failed to load profile data. Is the backend running?</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto w-full">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-8 mb-8 pb-8 border-b border-outline-variant/30">
        <div className="relative group">
          <img alt="User profile" className="w-28 h-28 rounded-full border-2 border-primary/50 shadow-[0_0_20px_rgba(192,193,255,0.15)] object-cover bg-surface-dim" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGmm4MpYXeoiJvfwO-hWIK2lgpPZSeXUtsttWxsPMFqNliyagz4Ruk9OXs3eiN3LOAPdkILV5fILc1EKUVOj1UphXLTx6v1DJ_BYvxbb8fMYghKAMU_40_zB4jz_aHxsVZgLsGHd4Nf7-VdO6ji1k46glVkojYPEI4zNxB4OIkIOZbBWIr9epmqML3zxgpfIxz0xwXQDhJAMhFipXExmlntmhDn9gMPnJL8GxW4Uhc4tpk5mJxJTZEiLeIbrxJHeRtZHvK26-OoxO3" />
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
             <span className="material-symbols-outlined text-white">edit</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-primary/80 tracking-widest pl-1">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Nilesh Kumar"
              value={profile.name || ""} 
              onChange={e => setProfile({...profile, name: e.target.value})}
              className="text-3xl font-bold bg-transparent text-on-surface focus:outline-none border-b border-outline-variant/50 focus:border-primary w-full max-w-md pb-1 placeholder:text-on-surface-variant/30" 
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-primary/80 tracking-widest pl-1">Professional Title</label>
            <input 
              type="text" 
              placeholder="e.g. Senior AI Software Engineer"
              value={profile.title || ""} 
              onChange={e => setProfile({...profile, title: e.target.value})}
              className="text-sm text-on-surface-variant bg-transparent focus:outline-none border-b border-outline-variant/50 focus:border-primary w-full max-w-md pb-1 block placeholder:text-on-surface-variant/30" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <div className="bg-surface-container rounded-2xl p-7 border border-outline-variant/30 shadow-lg">
            <h3 className="text-xl font-bold text-on-surface mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">target</span> Agent Targeting
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">These parameters constrain how the AI discovers and negotiates jobs.</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 ml-1">Desired Roles</label>
                <input 
                  type="text" 
                  placeholder="e.g. Software Engineer, Tech Lead, AI Researcher"
                  value={profile.roles || ""} 
                  onChange={e => setProfile({...profile, roles: e.target.value})}
                  className="w-full bg-surface-dim border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 ml-1">Salary Threshold</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 font-medium">$</span>
                  <input 
                    type="text" 
                    placeholder="e.g. 150,000"
                    value={profile.salary?.replace('$', '') || ""} 
                    onChange={e => setProfile({...profile, salary: e.target.value})}
                    className="w-full bg-surface-dim border border-outline-variant/50 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 ml-1 flex justify-between">
                  <span>Core Skills</span>
                  <span className="text-[10px] text-primary/70 font-normal normal-case">Comma-separated</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. React, Python, Docker, Next.js"
                  value={Array.isArray(profile.skills) ? profile.skills.join(", ") : (profile.skills || "")} 
                  onChange={e => setProfile({...profile, skills: e.target.value})}
                  className="w-full bg-surface-dim border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                />
                
                {/* Visual Skill Tags */}
                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider flex-wrap mt-3">
                  {(Array.isArray(profile.skills) ? profile.skills : (profile.skills || "").split(",")).filter((s: string) => s.trim().length > 0).map((skill: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <div className="bg-surface-container rounded-2xl p-7 border border-outline-variant/30 shadow-lg flex flex-col h-full">
            <h3 className="text-xl font-bold text-on-surface mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span> Context Data
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">Paste your resume content or LinkedIn summary below for the AI to analyze during matchmaking.</p>
            
            <div className="flex-1 min-h-[250px]">
              <textarea 
                placeholder="--- PASTE RESUME CONTENT HERE ---&#10;&#10;EXPERIENCE:&#10;Software Engineer at Acme Corp (2020-Present)..."
                value={profile.resume_text || ""} 
                onChange={e => setProfile({...profile, resume_text: e.target.value})}
                className="w-full h-full min-h-[250px] bg-surface-dim border border-outline-variant/50 rounded-xl p-4 text-sm text-on-surface font-mono placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-inner" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container rounded-2xl p-7 border border-outline-variant/30 shadow-lg">
        <h3 className="text-xl font-bold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">cable</span> System Integrations
        </h3>
        <p className="text-xs text-on-surface-variant mb-6">These core platforms are natively wired into your Orchestrator via environment configurations.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-dim rounded-xl border border-outline-variant/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-3xl text-primary/70">mark_email_unread</span>
            <span className="text-xs font-bold text-on-surface mt-1">Hunter.io</span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span>
          </div>
          <div className="p-4 bg-surface-dim rounded-xl border border-outline-variant/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-3xl text-primary/70">smart_toy</span>
            <span className="text-xs font-bold text-on-surface mt-1">Google Gemini</span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span>
          </div>
           <div className="p-4 bg-surface-dim rounded-xl border border-outline-variant/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-3xl text-primary/70">travel_explore</span>
            <span className="text-xs font-bold text-on-surface mt-1">Adzuna Jobs</span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span>
          </div>
          <div className="p-4 bg-surface-dim rounded-xl border border-outline-variant/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-3xl text-primary/70">code</span>
            <span className="text-xs font-bold text-on-surface mt-1">GitHub API</span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 pb-12">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-primary to-[#7074ff] text-surface-dim px-10 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(192,193,255,0.3)] hover:shadow-[0_0_30px_rgba(192,193,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
        >
          {saving ? <span className="w-5 h-5 border-2 border-surface-dim/30 border-t-surface-dim rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-lg">save</span>}
          {saving ? "Saving Configuration..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
