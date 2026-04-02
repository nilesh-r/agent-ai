"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const steps = ["Account", "Profile", "Preferences"];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeName, setResumeName] = useState<string>("");
  const [resumeText, setResumeText] = useState<string>("");
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    title: "", skills: "",
    roles: "", salary: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeName(file.name);
      // For a real app, parse PDF/DOCX here. We'll simulate storing text.
      setResumeText(`Simulated uploaded content of ${file.name}`);
    }
  };

  const router = useRouter();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) { 
      setStep(s => s + 1); 
      return; 
    }
    
    setLoading(true);
    setError(null);
    try {
      // First register
      const user = await api.register({
        email: form.email,
        password: form.password,
        name: form.name
      });
      
      // Auto login
      const data = await api.login({
        email: form.email,
        password: form.password
      });

      // VERY IMPORTANT: Set cookie BEFORE calling updateProfile, because updateProfile is an authenticated endpoint
      document.cookie = `auth-token=${data.access_token}; path=/; max-age=1800; samesite=strict`;

      // Update profile with remaining data
      await api.updateProfile({
        user_id: user.id,
        title: form.title,
        skills: form.skills,
        preferred_roles: form.roles.split(",").map(r => r.trim()),
        resume_text: resumeText || undefined,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      setStep(0); // Go back to first step to fix errors if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e16] flex items-stretch">
      {/* LEFT COLUMN: Signup Form (40%) */}
      <div className="w-full lg:w-[45%] xl:w-[40%] shrink-0 flex items-center justify-center p-8 relative z-20 bg-[#0a0e16] border-r border-[#161b27] overflow-y-auto">
        
        {/* Subtle left-side glow */}
        <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-[#8083ff]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[380px] relative z-10 my-auto">
          {/* Logo */}
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] rounded-xl mb-4 shadow-lg shadow-[#8083ff]/20">
              <span className="material-symbols-outlined text-[#0a0e16] text-xl">smart_toy</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#dfe2ee] tracking-tight">Sovereign AI</h1>
            <p className="text-sm text-[#908fa0] mt-1">Career Agent Setup</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  i < step ? "bg-emerald-500 text-[#0a0e16]" :
                  i === step ? "bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-[#0a0e16]" :
                  "bg-[#161b27] border border-[#31353e] text-[#908fa0]"
                }`}>
                  {i < step ? <span className="material-symbols-outlined text-[10px]">check</span> : i + 1}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${i === step ? "text-[#c0c1ff]" : "text-[#464554]"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`w-4 h-px ${i < step ? "bg-emerald-500" : "bg-[#31353e]"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-400 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleNext} className="space-y-5">
            {/* Step 0: Account */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#dfe2ee] mb-1">Create your account</h2>
                  <p className="text-sm text-[#908fa0]">Start with your login credentials</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">Full Name</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">person</span>
                      <input required value={form.name} onChange={set("name")} placeholder="Alex Chen" type="text"
                        className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-4 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">mail</span>
                      <input required value={form.email} onChange={set("email")} placeholder="alex@example.com" type="email"
                        className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-4 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">lock</span>
                      <input required value={form.password} onChange={set("password")} placeholder="Min. 8 characters" type={showPassword ? "text" : "password"}
                        className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-11 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#464554] hover:text-[#908fa0] transition-colors">
                        <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Profile */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#dfe2ee] mb-1">Your professional profile</h2>
                  <p className="text-sm text-[#908fa0]">Help the AI Agent understand your background</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">Current Title</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">work</span>
                      <input value={form.title} onChange={set("title")} placeholder="Senior Solutions Architect" type="text"
                        className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-4 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">Key Skills (comma-separated)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">code</span>
                      <input value={form.skills} onChange={set("skills")} placeholder="Python, Node.js, AWS, Docker" type="text"
                        className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-4 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors" />
                    </div>
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0f131c] border border-[#31353e] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-[#c0c1ff]/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#464554]">
                      {resumeName ? "task" : "upload_file"}
                    </span>
                    <div>
                      <p className="text-sm text-[#dfe2ee] font-semibold">
                        {resumeName ? "Resume Uploaded" : "Upload Resume"}
                      </p>
                      <p className="text-[10px] text-[#464554]">
                        {resumeName ? resumeName : "PDF or DOCX — optional"}
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#dfe2ee] mb-1">Agent preferences</h2>
                  <p className="text-sm text-[#908fa0]">Configure your job search targets</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">Target Roles</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">manage_search</span>
                      <input value={form.roles} onChange={set("roles")} placeholder="Staff Engineer, Tech Lead" type="text"
                        className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-4 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">Target Salary (USD / year)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">payments</span>
                      <input value={form.salary} onChange={set("salary")} placeholder="$200k – $250k" type="text"
                        className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-4 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors" />
                    </div>
                  </div>
                  <div className="bg-[#0f131c] border border-emerald-500/30 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-xs">auto_awesome</span> Agent Ready</p>
                    <p className="text-[11px] text-[#908fa0]">Your AI career agent will start discovering jobs immediately.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3.5 border border-[#31353e] rounded-xl text-sm font-bold text-[#dfe2ee] hover:bg-[#161b27] transition-colors">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-[#0f131c] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-[#0f131c]/30 border-t-[#0f131c] rounded-full animate-spin" /> Creating...</>
                ) : step < steps.length - 1 ? (
                  <>Continue <span className="material-symbols-outlined text-sm">arrow_forward</span></>
                ) : (
                  <><span className="material-symbols-outlined text-sm">rocket_launch</span> Launch Agent</>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-[#908fa0] mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#c0c1ff] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Info / Ad / Branding (60%) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative items-center justify-center px-12 xl:px-24 overflow-hidden bg-[#0f131c]">
        {/* Deep background mesh gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(128,131,255,0.08),_transparent_40%),radial-gradient(circle_at_30%_70%,_rgba(0,229,160,0.05),_transparent_40%)]" />
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[800px] 2xl:max-w-[900px]">
          
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Autonomous Pipeline Active
            </div>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#dfe2ee] tracking-tight leading-tight mb-6">
              Let the AI do the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0c1ff] to-[#8083ff]">heavy lifting.</span>
            </h2>
            <p className="text-[#908fa0] text-lg xl:text-xl max-w-2xl leading-relaxed">
              Sovereign AI autonomously discovers jobs, evaluates your fit using Gemini 2.5, and drafts hyper-personalized cold outreach emails while you sleep.
            </p>
          </div>

          {/* Interactive Bento Grid */}
          <div className="grid grid-cols-2 gap-5 xl:gap-6">
            {/* Feature 1 */}
            <div className="bg-[#161b27]/60 backdrop-blur-md border border-[#31353e]/50 rounded-2xl p-8 hover:bg-[#161b27]/80 hover:border-[#8083ff]/30 transition-all group">
              <div className="w-12 h-12 bg-[#8083ff]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#c0c1ff] text-2xl">radar</span>
              </div>
              <h3 className="text-[#dfe2ee] text-lg font-bold mb-2">Live Job Scraping</h3>
              <p className="text-[#908fa0]">Connects directly to Adzuna API to fetch real-time and premium opportunities.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#161b27]/60 backdrop-blur-md border border-[#31353e]/50 rounded-2xl p-8 hover:bg-[#161b27]/80 hover:border-[#8083ff]/30 transition-all group outline outline-1 outline-transparent hover:outline-[#c0c1ff]/20">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#00e5a0]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#00e5a0] text-2xl">analytics</span>
                </div>
                <span className="text-[10px] font-bold bg-[#00e5a0]/10 text-[#00e5a0] px-3 py-1.5 rounded-md tracking-wider">GEMINI 2.5</span>
              </div>
              <h3 className="text-[#dfe2ee] text-lg font-bold mb-2">Semantic Matching</h3>
              <p className="text-[#908fa0]">Embedding algorithms score your unique resume against live JDs instantly.</p>
            </div>

            {/* Feature 3 (Full width) */}
            <div className="col-span-2 bg-gradient-to-br from-[#161b27]/80 to-[#0f131c]/80 backdrop-blur-md border border-[#31353e]/50 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-[#c0c1ff]/5 rounded-full blur-3xl group-hover:bg-[#c0c1ff]/10 transition-colors" />
              <div className="flex items-center gap-5 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#31353e] flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-[#dfe2ee] text-lg">mark_email_read</span>
                </div>
                <div>
                  <h3 className="text-[#dfe2ee] font-bold text-base">Automated Outreach</h3>
                  <p className="text-xs text-[#908fa0] mt-0.5">Drafted 3 seconds ago</p>
                </div>
              </div>
              <div className="bg-[#0a0e16]/80 backdrop-blur-sm border border-[#31353e] rounded-xl p-5 mt-4 relative z-10 shadow-inner">
                <p className="text-sm text-[#908fa0] font-mono leading-relaxed truncate">"Hi HR Team, I am Alex Chen. Based on the Senior SWE role..."</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
