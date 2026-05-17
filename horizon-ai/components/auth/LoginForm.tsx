import React from "react";

export interface LoginFormProps {
  role: "org" | "candidate";
  setRole: (val: "org" | "candidate") => void;
  loggingIn: boolean;
  handleGoogleSignIn: () => void;
  loginError: string | null;
}

export default function LoginForm({
  role,
  setRole,
  loggingIn,
  handleGoogleSignIn,
  loginError,
}: LoginFormProps) {
  return (
    <div className="min-h-screen w-screen bg-transparent flex flex-col justify-between p-6 lg:p-12 relative overflow-hidden transition-colors duration-300">
      {/* Background Cinematic Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/5 dark:bg-emerald-600/5 rounded-full blur-[140px] animate-pulse delay-1000"></div>

      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 font-display text-lg">
            H
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-graphite-900 dark:text-white leading-none tracking-tight">
              Horizon AI
            </h1>
            <span className="text-[10px] text-graphite-550 dark:text-graphite-400 mt-0.5 block font-medium">
              Talent Acquisition Shell
            </span>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-500/15 uppercase tracking-wider">
          v2.0 Decoupled Release
        </span>
      </header>

      {/* Main Landing & Launcher Section */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-12 z-10 relative">
        
        {/* Left Side: About the Site */}
        <section className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/15">
              Next-Gen Recruitment
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] text-graphite-950 dark:text-white font-display">
              The Decoupled <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                AI Talent Ecosystem
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-graphite-550 dark:text-graphite-300 max-w-xl leading-relaxed">
              Welcome to the recruitment platform designed for modern product teams. We bridge the gap between organizational hiring intelligence and candidate applications with real-time feedback loops and Gemini AI evaluation.
            </p>
          </div>

          {/* Dynamic Twin Roles Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            {/* Org capabilities */}
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-graphite-950/30 border border-white/20 dark:border-graphite-900/60 shadow-sm space-y-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏢</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-graphite-900 dark:text-white">
                  For Organizations
                </h3>
              </div>
              <ul className="space-y-1.5 text-[11px] text-graphite-550 dark:text-graphite-400">
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-indigo-500 font-bold">&bull;</span>
                  Post job descriptions directly to your dashboard.
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-indigo-500 font-bold">&bull;</span>
                  Manage candidate stages on an interactive Kanban pipeline.
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-indigo-500 font-bold">&bull;</span>
                  Compare top candidates using AI matching matrices.
                </li>
              </ul>
            </div>

            {/* Candidate capabilities */}
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-graphite-950/30 border border-white/20 dark:border-graphite-900/60 shadow-sm space-y-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧑‍💻</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-graphite-900 dark:text-white">
                  For Candidates
                </h3>
              </div>
              <ul className="space-y-1.5 text-[11px] text-graphite-550 dark:text-graphite-400">
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  Browse active jobs and apply with a single PDF drop.
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  Get instant AI match score, strength & gap analysis.
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  Track your application stage dynamically in real-time.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Right Side: Interactive Role Launcher & OAuth */}
        <section className="lg:col-span-5 w-full flex justify-center">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl glass-panel bg-white/40 dark:bg-graphite-950/40 neon-glow-purple border border-white/20 dark:border-graphite-800/50 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold tracking-tight text-graphite-900 dark:text-white">
                Enter Your Workspace
              </h3>
              <p className="text-[10px] text-graphite-500 dark:text-graphite-400 mt-1 uppercase tracking-widest font-semibold">
                Select your role to get started
              </p>
            </div>

            {/* Workspace role chooser buttons */}
            <div className="grid grid-cols-1 gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setRole("org")}
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 text-left cursor-pointer ${
                  role === "org"
                    ? "bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/25"
                    : "bg-white/60 dark:bg-graphite-900/60 border-graphite-250 dark:border-graphite-800 hover:border-graphite-400 dark:hover:border-graphite-700"
                }`}
              >
                <span className="text-2xl p-2 rounded-lg bg-indigo-500/10 text-indigo-500">🏢</span>
                <div>
                  <h4 className="text-xs font-bold text-graphite-900 dark:text-white uppercase tracking-wider">
                    I am an Organization
                  </h4>
                  <p className="text-[9.5px] text-graphite-500 dark:text-graphite-400 mt-0.5">
                    Hiring managers, admins, and recruiters.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 text-left cursor-pointer ${
                  role === "candidate"
                    ? "bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/25"
                    : "bg-white/60 dark:bg-graphite-900/60 border-graphite-250 dark:border-graphite-800 hover:border-graphite-400 dark:hover:border-graphite-700"
                }`}
              >
                <span className="text-2xl p-2 rounded-lg bg-emerald-500/10 text-emerald-500">🧑‍💻</span>
                <div>
                  <h4 className="text-xs font-bold text-graphite-900 dark:text-white uppercase tracking-wider">
                    I am a Candidate
                  </h4>
                  <p className="text-[9.5px] text-graphite-500 dark:text-graphite-400 mt-0.5">
                    Job seekers, applicants, and consultants.
                  </p>
                </div>
              </button>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10.5px] font-semibold leading-relaxed animate-pulse">
                ⚠️ {loginError}
              </div>
            )}

            {/* Google OAuth trigger */}
            <button
              type="button"
              disabled={loggingIn}
              onClick={handleGoogleSignIn}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-3 text-xs font-bold shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/30 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loggingIn ? (
                <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4.5 w-4.5 bg-white p-0.5 rounded-md" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.513 0-6.36-2.847-6.36-6.36s2.847-6.36 6.36-6.36c1.611 0 3.076.611 4.195 1.616l3.054-3.054C19.043 2.373 15.827 1.2 12.24 1.2 6.136 1.2 1.2 6.136 1.2 12.24s4.936 11.04 11.04 11.04c6.36 0 10.58-4.47 10.58-10.78 0-.693-.06-1.396-.18-2.215H12.24Z"
                  />
                </svg>
              )}
              {loggingIn ? "Connecting Google Redirect..." : `Enter ${role === "org" ? "Organization" : "Candidate"} Workspace`}
            </button>
          </div>
        </section>

      </main>

      {/* Footer copyright */}
      <footer className="max-w-7xl w-full mx-auto text-center border-t border-graphite-250/20 dark:border-graphite-850/20 pt-6 mt-6 z-10 relative">
        <p className="text-[10px] text-graphite-500 dark:text-graphite-400 font-semibold tracking-wider uppercase">
          &copy; {new Date().getFullYear()} Horizon AI &bull; Secure Google SSO Verified
        </p>
      </footer>
    </div>
  );
}
