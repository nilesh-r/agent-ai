"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.login({ email, password });
      document.cookie = `auth-token=${data.access_token}; path=/; max-age=1800; samesite=strict`;
      router.push("/");
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.location.href = `${backendUrl}/auth/google/login`;
  };

  return (
    <div className="min-h-screen bg-[#0a0e16] flex flex-col lg:flex-row items-stretch">
      {/* LEFT COLUMN: Login Form (40%) */}
      <div className="w-full lg:w-[45%] xl:w-[40%] shrink-0 flex items-center justify-center p-8 relative z-20 bg-[#0a0e16] border-r border-[#161b27]">
        
        {/* Subtle left-side glow */}
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#8083ff]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[380px] relative z-10">
          {/* Logo */}
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] rounded-xl mb-4 shadow-lg shadow-[#8083ff]/20">
              <span className="material-symbols-outlined text-[#0a0e16] text-xl">smart_toy</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#dfe2ee] tracking-tight">Sovereign AI</h1>
            <p className="text-sm text-[#908fa0] mt-1">Career Agent Control Panel</p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#dfe2ee] mb-1">Welcome back</h2>
            <p className="text-sm text-[#908fa0]">Sign in to your agent dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-400 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-1.5">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-4 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#908fa0]">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-[#c0c1ff] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#464554] text-sm">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0f131c] border border-[#31353e] rounded-xl pl-10 pr-11 py-3 text-sm text-[#dfe2ee] placeholder-[#464554] focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#464554] hover:text-[#908fa0] transition-colors">
                  <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-[#0f131c] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0f131c]/30 border-t-[#0f131c] rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-[#31353e]" />
            <span className="text-[10px] text-[#464554] font-semibold uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-[#31353e]" />
          </div>

          {/* Google OAuth — MUST be outside the form to avoid validation blocking */}
          <button type="button" onClick={handleGoogleLogin} className="w-full py-3.5 border border-[#31353e] rounded-xl text-sm font-semibold text-[#dfe2ee] hover:bg-[#161b27] transition-colors flex items-center justify-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" fill="#4285F4"/>
              <path d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z" fill="#34A853"/>
              <path d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" fill="#FBBC05"/>
              <path d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-[#908fa0] mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#c0c1ff] font-semibold hover:underline">Create account</Link>
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
