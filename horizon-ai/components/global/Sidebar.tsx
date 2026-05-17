import React from "react";

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  handleLogout,
}: SidebarProps) {
  return (
    <aside className="w-64 h-full glass-panel border-r border-graphite-200 dark:border-graphite-800/80 p-5 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-8">
        {/* Logo Brand */}
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 font-display">
            H
          </div>
          <div>
            <span className="font-extrabold font-display tracking-tight text-graphite-900 dark:text-white block">
              Horizon AI
            </span>
            <span className="text-[10px] text-graphite-500 dark:text-graphite-400 font-semibold tracking-wider uppercase block">
              Talent Suite
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500 font-bold"
                : "text-graphite-600 dark:text-graphite-300 hover:bg-graphite-100 dark:hover:bg-graphite-900/60 hover:text-graphite-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
              ></path>
            </svg>
            Dashboard Home
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "pipeline"
                ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500 font-bold"
                : "text-graphite-600 dark:text-graphite-300 hover:bg-graphite-100 dark:hover:bg-graphite-900/60 hover:text-graphite-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab("jd-parser")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "jd-parser"
                ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500 font-bold"
                : "text-graphite-600 dark:text-graphite-300 hover:bg-graphite-100 dark:hover:bg-graphite-900/60 hover:text-graphite-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            JD Parser
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "compare"
                ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500 font-bold"
                : "text-graphite-600 dark:text-graphite-300 hover:bg-graphite-100 dark:hover:bg-graphite-900/60 hover:text-graphite-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              ></path>
            </svg>
            Compare Mode
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeTab === "settings"
                ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500 font-bold"
                : "text-graphite-600 dark:text-graphite-300 hover:bg-graphite-100 dark:hover:bg-graphite-900/60 hover:text-graphite-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              ></path>
            </svg>
            AI Settings
          </button>
        </nav>
      </div>

      {/* User Card Segment with Logout */}
      <div className="border-t border-graphite-200 dark:border-graphite-800/80 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-graphite-200 dark:bg-graphite-800 border border-graphite-350 dark:border-graphite-700/60 flex items-center justify-center text-xs font-semibold text-graphite-800 dark:text-white font-display">
              DR
            </div>
            <div>
              <span className="text-xs font-semibold text-graphite-900 dark:text-white block font-display">
                Deepak Raja
              </span>
              <span className="text-[10px] text-graphite-500 dark:text-graphite-400 block font-semibold">
                Lead Recruiter
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-1.5 rounded bg-graphite-100 dark:bg-graphite-900 hover:bg-graphite-200 dark:hover:bg-graphite-850 border border-graphite-250 dark:border-graphite-800 hover:border-graphite-300 dark:hover:border-graphite-700 text-[10px] font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase transition cursor-pointer"
        >
          Sign Out Session
        </button>
      </div>
    </aside>
  );
}
