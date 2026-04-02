import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f131c] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Animated 404 Badge */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-[#c0c1ff]/20 to-[#8083ff]/10 border border-[#464554] mb-8">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#c0c1ff] to-[#8083ff]">
            404
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#dfe2ee] mb-3">
          Page Not Found
        </h1>
        <p className="text-[#908fa0] text-sm mb-8 leading-relaxed">
          The route you&apos;re looking for doesn&apos;t exist or has been moved.
          This agent has no instructions for this path.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-[#0f131c] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Back to Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#464554] text-[#dfe2ee] rounded-xl text-sm font-bold hover:bg-[#1c2028] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            Sign In
          </Link>
        </div>

        {/* Decorative glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#8083ff]/5 rounded-full blur-[120px] pointer-events-none" />
      </div>
    </div>
  );
}
