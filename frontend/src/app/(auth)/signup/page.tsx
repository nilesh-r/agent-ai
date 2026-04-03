"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

const steps = ["Account", "Profile", "Preferences"];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
      const user = await api.register({
        email: form.email,
        password: form.password,
        name: form.name
      });
      
      const data = await api.login({
        email: form.email,
        password: form.password
      });

      document.cookie = `auth-token=${data.access_token}; path=/; max-age=1800; samesite=strict`;

      await api.updateProfile({
        user_id: user.id,
        title: form.title,
        skills: form.skills,
        preferred_roles: form.roles.split(",").map(r => r.trim()),
        resume_text: resumeText || undefined,
      });
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError(message);
      setStep(0); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-stretch overflow-hidden">
      {/* Dynamic Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://transparenttextures.com/patterns/asfalt-light.png')]" />

      {/* LEFT COLUMN: Signup Form (40%) */}
      <div className="w-full lg:w-[45%] xl:w-[40%] shrink-0 flex items-center justify-center p-8 relative z-20 overflow-y-auto">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] glass-panel p-10 rounded-[2.5rem] relative z-10 my-auto"
        >
          {/* Logo */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] rounded-[1.25rem] mb-6 shadow-2xl shadow-[#8083ff]/30">
              <span className="material-symbols-outlined text-[#0a0e16] text-2xl">smart_toy</span>
            </div>
            <h1 className="text-3xl font-black text-[#dfe2ee] tracking-tighter italic">SOVEREIGN</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c0c1ff] mt-2">Nexus Onboarding</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black transition-all duration-500 ${
                  i < step ? "bg-emerald-400 text-[#0a0e16]" :
                  i === step ? "bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-[#0a0e16] shadow-lg shadow-[#8083ff]/20" :
                  "bg-white/5 border border-white/10 text-[#464554]"
                }`}>
                  {i < step ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                </div>
                {i === step && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    className="text-[10px] font-black uppercase tracking-[0.15em] text-[#c0c1ff]"
                  >
                    {s}
                  </motion.span>
                )}
                {i < steps.length - 1 && <div className={`w-6 h-px transition-colors duration-500 ${i < step ? "bg-emerald-400" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-red-400 text-sm">report</span>
              <p className="text-xs text-red-400 font-bold tracking-wide">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleNext} className="space-y-6">
            {/* Step 0: Account */}
            {step === 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="mb-8">
                  <h2 className="text-xl font-black text-[#dfe2ee] tracking-tight">Identity Creation</h2>
                  <p className="text-sm text-[#908fa0] mt-1 font-medium">Establish your central authentication key.</p>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280]">Full Legal Name</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-300"
                        style={{ color: focusedField === "name" ? "#c0c1ff" : "#464554" }}>badge</span>
                      <input required value={form.name} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} onChange={set("name")} placeholder="Commander Alex Chen" type="text"
                        className="w-full glass-input rounded-2xl pl-12 pr-4 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280]">Nexus Email</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-300"
                        style={{ color: focusedField === "email" ? "#c0c1ff" : "#464554" }}>alternate_email</span>
                      <input required value={form.email} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} onChange={set("email")} placeholder="alex@nexus.sovereign" type="email"
                        className="w-full glass-input rounded-2xl pl-12 pr-4 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280]">Access Cipher</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-300"
                        style={{ color: focusedField === "password" ? "#c0c1ff" : "#464554" }}>fingerprint</span>
                      <input required value={form.password} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} onChange={set("password")} placeholder="Secure redundant key" type={showPassword ? "text" : "password"}
                        className="w-full glass-input rounded-2xl pl-12 pr-12 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#464554] hover:text-[#908fa0] transition-colors">
                        <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Profile */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="mb-8">
                  <h2 className="text-xl font-black text-[#dfe2ee] tracking-tight">Core Competencies</h2>
                  <p className="text-sm text-[#908fa0] mt-1 font-medium">Map your existing professional architecture.</p>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280]">Primary Designation</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-300"
                        style={{ color: focusedField === "title" ? "#c0c1ff" : "#464554" }}>rocket</span>
                      <input value={form.title} onFocus={() => setFocusedField("title")} onBlur={() => setFocusedField(null)} onChange={set("title")} placeholder="Senior Systems Architect" type="text"
                        className="w-full glass-input rounded-2xl pl-12 pr-4 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280]">Technical Stack</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-300"
                        style={{ color: focusedField === "skills" ? "#c0c1ff" : "#464554" }}>terminal</span>
                      <input value={form.skills} onFocus={() => setFocusedField("skills")} onBlur={() => setFocusedField(null)} onChange={set("skills")} placeholder="PyTorch, Rust, Kubernetes, GCP" type="text"
                        className="w-full glass-input rounded-2xl pl-12 pr-4 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none" />
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-input rounded-2xl p-6 flex items-center gap-4 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <span className="material-symbols-outlined text-[#c0c1ff]">
                        {resumeName ? "verified" : "cloud_upload"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-[#dfe2ee] font-black tracking-tight italic">
                        {resumeName ? "BLUEPRINT INGESTED" : "UPLOAD STRATEGY DOC"}
                      </p>
                      <p className="text-[10px] text-[#464554] font-bold uppercase tracking-widest mt-1">
                        {resumeName ? resumeName : "PDF / DOCX — AUGMENT AGENT"}
                      </p>
                    </div>
                  </motion.div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="mb-8">
                  <h2 className="text-xl font-black text-[#dfe2ee] tracking-tight">Mission Parameters</h2>
                  <p className="text-sm text-[#908fa0] mt-1 font-medium">Configure autonomous search objectives.</p>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280]">Target Objectives</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-300"
                        style={{ color: focusedField === "roles" ? "#c0c1ff" : "#464554" }}>target</span>
                      <input value={form.roles} onFocus={() => setFocusedField("roles")} onBlur={() => setFocusedField(null)} onChange={set("roles")} placeholder="VP Engineering, Head of AI" type="text"
                        className="w-full glass-input rounded-2xl pl-12 pr-4 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280]">Compensation Baseline (USD)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-300"
                        style={{ color: focusedField === "salary" ? "#c0c1ff" : "#464554" }}>payments</span>
                      <input value={form.salary} onFocus={() => setFocusedField("salary")} onBlur={() => setFocusedField(null)} onChange={set("salary")} placeholder="$250,000+" type="text"
                        className="w-full glass-input rounded-2xl pl-12 pr-4 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none" />
                    </div>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_20px_rgba(52,211,153,0.05)]">
                    <p className="text-[11px] font-black text-emerald-400 mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-sm animate-pulse">auto_awesome</span> CORE SYNCHRONIZED</p>
                    <p className="text-[10px] text-[#908fa0] font-bold leading-relaxed uppercase tracking-wider">Your autonomous operative is primed for immediate deployment upon nexus establishment.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="w-24 py-4 glass-panel rounded-2xl text-[10px] font-black text-[#dfe2ee] hover:bg-white/5 transition-all uppercase tracking-widest">
                  ABORT
                </button>
              )}
              <motion.button 
                type="submit" 
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.01, y: -2 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                className="flex-1 py-4 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-[#0a0e16] rounded-2xl text-[11px] font-black hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-60 uppercase tracking-widest shadow-xl shadow-[#8083ff]/10"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-[#0a0e16]/30 border-t-[#0a0e16] rounded-full animate-spin" /> SYNCHRONIZING...</>
                ) : step < steps.length - 1 ? (
                  <>PROCEED PHASE {step + 2} <span className="material-symbols-outlined text-sm">chevron_right</span></>
                ) : (
                  <><span className="material-symbols-outlined text-sm">rocket_launch</span> DEPLOY OPERATIVE</>
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-center text-[10px] font-bold text-[#6b7280] mt-10 uppercase tracking-[0.2em]">
            EXISTING COMMANDER?{" "}
            <Link href="/login" className="text-[#c0c1ff] hover:text-white transition-colors underline underline-offset-4">LOGIN NEXUS</Link>
          </p>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Branding (60%) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative items-center justify-center px-12 xl:px-24 overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#c0c1ff 1px, transparent 1px), linear-gradient(90deg, #c0c1ff 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#6366f1]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00e5a0]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Content Container */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[900px]"
        >
          <div className="mb-16">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-[0.25em] uppercase mb-10 shadow-[0_0_30px_rgba(52,211,153,0.1)]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM PROTOCOL: ACTIVE
            </motion.div>
            <h2 className="text-5xl lg:text-6xl xl:text-8xl font-black text-[#dfe2ee] tracking-tighter leading-[0.9] mb-12 italic">
              Automate your <br />
              <span className="text-gradient">Professional Ascent.</span>
            </h2>
            <p className="text-[#908fa0] text-xl xl:text-2xl max-w-3xl leading-relaxed font-medium opacity-80">
              Sovereign AI orchestrates a multi-agent pipeline to discover, score, and engage with career opportunities — autonomously.
            </p>
          </div>

          {/* Interactive Bento Grid */}
          <div className="grid grid-cols-2 gap-6 xl:gap-8">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -5, backgroundColor: "rgba(22, 27, 39, 0.8)" }}
              className="glass-panel p-10 rounded-[2.5rem] group transition-all duration-500"
            >
              <div className="w-14 h-14 bg-[#8083ff]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-[#8083ff]/10">
                <span className="material-symbols-outlined text-[#c0c1ff] text-3xl">radar</span>
              </div>
              <h3 className="text-[#dfe2ee] text-xl font-black mb-3 tracking-tight italic">NEXUS DISCOVERY</h3>
              <p className="text-[#908fa0] text-sm font-medium leading-relaxed">Direct API integration with Adzuna for real-time career signal acquisition.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -5, backgroundColor: "rgba(22, 27, 39, 0.8)" }}
              className="glass-panel p-10 rounded-[2.5rem] group transition-all duration-500 border-l-[#00e5a0]/30"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-[#00e5a0]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[#00e5a0] text-3xl">psychology</span>
                </div>
                <span className="text-[10px] font-black bg-[#00e5a0]/10 text-[#00e5a0] px-4 py-2 rounded-xl tracking-[0.2em] border border-[#00e5a0]/20">GEMINI 2.5</span>
              </div>
              <h3 className="text-[#dfe2ee] text-xl font-black mb-3 tracking-tight italic">SEMANTIC ANALYTICS</h3>
              <p className="text-[#908fa0] text-sm font-medium leading-relaxed">Advanced embedding algorithms score mission fit against JDs with high precision.</p>
            </motion.div>

            {/* Feature 3 (Full width) */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="col-span-2 glass-panel p-10 rounded-[3rem] relative overflow-hidden group border-t-white/10"
            >
              <div className="absolute right-[-40px] top-[-40px] w-80 h-80 bg-[#c0c1ff]/5 rounded-full blur-3xl group-hover:bg-[#c0c1ff]/10 transition-colors duration-700" />
              <div className="scanline" />
              
              <div className="flex items-center gap-6 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-2xl border border-white/5 group-hover:border-[#c0c1ff]/30 transition-colors">
                  <span className="material-symbols-outlined text-[#dfe2ee] text-2xl animate-pulse">send</span>
                </div>
                <div>
                  <h3 className="text-[#dfe2ee] font-black text-xl tracking-tight italic">AUTONOMOUS OUTREACH</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <p className="text-[10px] text-[#908fa0] uppercase tracking-widest font-black">Orchestrating transmission...</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#0a0e16]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 mt-4 relative z-10 shadow-inner group-hover:border-white/10 transition-colors">
                <p className="text-sm text-[#c0c1ff]/80 font-mono leading-relaxed truncate">&quot;Transmission: Greetings HR Operation, based on the Staff Engineer signal detected...&quot;</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

