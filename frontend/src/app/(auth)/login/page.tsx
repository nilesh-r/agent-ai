"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

const PIPELINE_STEPS = [
  { icon: "radar", label: "Scanning Adzuna", color: "#c0c1ff", delay: 0 },
  { icon: "model_training", label: "Gemini Matching", color: "#00e5a0", delay: 0.6 },
  { icon: "contact_mail", label: "Hunter.io Lookup", color: "#ffb783", delay: 1.2 },
  { icon: "mark_email_read", label: "Drafting Outreach", color: "#c0c1ff", delay: 1.8 },
];

function PipelineStep({ icon, label, color, delay }: { icon: string; label: string; color: string; delay: number }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), delay * 1000 + 1000);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay + 0.3, duration: 0.5, type: "spring" }}
      className="flex items-center gap-3"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500"
        style={{ background: active ? `${color}20` : "rgba(49,53,62,0.4)", border: `1px solid ${active ? color + "50" : "#31353e"}` }}
      >
        <span className="material-symbols-outlined text-sm" style={{ color: active ? color : "#464554" }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#dfe2ee]">{label}</span>
          <AnimatePresence>
            {active && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${color}15`, color: color }}
              >DONE</motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="h-1 mt-1.5 bg-[#1c2028] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
            initial={{ width: "0%" }}
            animate={{ width: active ? "100%" : "0%" }}
            transition={{ duration: 0.8, delay: active ? 0 : delay + 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Handle incoming Google OAuth token ──
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Set cookie on the frontend domain
      document.cookie = `auth-token=${token}; path=/; max-age=1800; samesite=strict`;
      // Immediately redirect to main dashboard
      router.push("/");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.login({ email, password });
      document.cookie = `auth-token=${data.access_token}; path=/; max-age=1800; samesite=strict`;
      router.push("/");
    } catch (err: unknown) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    window.location.href = `${backendUrl}/auth/google/login`;
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* Dynamic Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://transparenttextures.com/patterns/asfalt-light.png')]" />

      {/* === LEFT: FORM SIDE === */}
      <div className="w-full lg:w-[45%] xl:w-[42%] shrink-0 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] glass-panel p-10 rounded-[2rem]"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#c0c1ff] via-[#8083ff] to-[#6366f1] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-white text-2xl">smart_toy</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#c0c1ff] to-[#6ee7b7] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#080c14] shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter leading-none italic">SOVEREIGN</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c0c1ff] mt-1">Core Intelligence</p>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <h2 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
              Welcome back,<br />
              <span className="text-gradient">Commander.</span>
            </h2>
            <p className="text-sm text-[#908fa0] mt-3 font-medium">Initialize your career trajectory control.</p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-400 text-sm">lock_person</span>
                  </div>
                  <p className="text-xs text-red-400 font-bold tracking-wide">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280] ml-1">Terminal ID (Email)</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors duration-300"
                  style={{ color: focusedField === "email" ? "#c0c1ff" : "#464554" }}>alternate_email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="commander@sovereign.ai"
                  className="w-full glass-input rounded-2xl pl-12 pr-4 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#6b7280]">Access Key</label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-[#c0c1ff]/50 hover:text-[#c0c1ff] transition-colors uppercase tracking-wider">Reset Key?</Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors duration-300"
                  style={{ color: focusedField === "password" ? "#c0c1ff" : "#464554" }}>key</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-2xl pl-12 pr-12 py-4 text-sm text-[#dfe2ee] placeholder-[#3a3d4a] focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#464554] hover:text-[#908fa0] transition-colors">
                  <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.01, y: -2 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              className="relative w-full py-4 rounded-2xl text-sm font-black overflow-hidden flex items-center justify-center gap-3 mt-4 disabled:opacity-70 shadow-xl shadow-[#6366f1]/20"
              style={{ background: "linear-gradient(135deg, #c0c1ff 0%, #8083ff 50%, #6366f1 100%)", color: "#080c14" }}
            >
              {loading ? (
                <><span className="w-5 h-5 border-3 border-[#080c14]/20 border-t-[#080c14] rounded-full animate-spin relative z-10" />INITIALIZING ALPHA FLOW...</>
              ) : (
                <><span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>AUTHORIZE ACCESS</>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-[#3a3d4a] font-black uppercase tracking-[0.2em]">OR SECURE OAUTH</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-1 gap-4">
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 border border-white/5 rounded-2xl text-xs font-black text-[#dfe2ee] bg-white/[0.01] backdrop-blur-sm transition-all flex items-center justify-center gap-3 uppercase tracking-widest hover:border-[#c0c1ff]/30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" fill="#4285F4"/>
                <path d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z" fill="#34A853"/>
                <path d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" fill="#FBBC05"/>
                <path d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"/>
              </svg>
              Google Cryptographic Login
            </motion.button>
          </div>

          <p className="text-center text-xs text-[#6b7280] mt-10 font-bold tracking-wide">
            First mission?{" "}
            <Link href="/signup" className="text-[#c0c1ff] hover:text-white transition-colors underline underline-offset-4 decoration-1 decoration-[#c0c1ff]/30">Establish Nexus Connection</Link>
          </p>
        </motion.div>
      </div>

      {/* === RIGHT: SHOWCASE SIDE === */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative items-center justify-center px-12 xl:px-20 overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#c0c1ff 1px, transparent 1px), linear-gradient(90deg, #c0c1ff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#00e5a0]/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[600px]"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 mb-10 shadow-[0_0_20px_rgba(52,211,153,0.1)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Autonomous Core: ONLINE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-8"
          >
            Your AI agent<br />
            <span className="text-gradient">never sleeps.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-[#908fa0] text-xl leading-relaxed mb-12 max-w-lg font-medium opacity-80"
          >
            Discovery, semantic fit evaluation via Gemini 2.5, recruiter reconnaissance, and hyper-personalized outreach — orchestrated 24/7.
          </motion.p>

          {/* Live Pipeline Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            className="p-8 rounded-[2.5rem] glass-panel relative overflow-hidden group mb-8"
          >
            <div className="scanline" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c0c1ff]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#c0c1ff] animate-spin-slow">settings</span>
                </div>
                <span className="text-sm font-black text-white uppercase tracking-[0.2em]">Alpha Pipeline</span>
              </div>
              <span className="text-[10px] font-black text-[#c0c1ff] bg-[#c0c1ff]/10 px-3 py-1.5 rounded-full tracking-widest border border-[#c0c1ff]/20">EXECUTING</span>
            </div>

            <div className="space-y-6 relative z-10">
              {PIPELINE_STEPS.map((step) => (
                <PipelineStep key={step.label} {...step} />
              ))}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="grid grid-cols-3 gap-6"
          >
            {[
              { value: "94%", label: "Accuracy", color: "#c0c1ff" },
              { value: "3.2s", label: "Latency", color: "#34d399" },
              { value: "100%", label: "Automated", color: "#6366f1" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 rounded-2xl glass-panel text-center hover:bg-white/[0.02] transition-colors group"
              >
                <p className="text-3xl font-black tracking-tighter group-hover:scale-110 transition-transform" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[9px] text-[#6b7280] font-black mt-2 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c0c1ff]/20 border-t-[#c0c1ff] rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

