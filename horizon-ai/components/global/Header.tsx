import React from "react";
import { HealthData, JobDescription } from "../../types";

export interface HeaderProps {
  activeTab: string;
  theme: string;
  toggleTheme: () => void;
  apiHealth: HealthData | null;
  checkingApi: boolean;
  checkBackendHealth: () => Promise<void>;
  jobs?: JobDescription[];
  activeJob?: JobDescription | null;
  setActiveJob?: (job: JobDescription) => void;
}

export default function Header({
  activeTab,
  theme,
  toggleTheme,
  apiHealth,
  checkingApi,
  checkBackendHealth,
  jobs = [],
  activeJob = null,
  setActiveJob,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-graphite-200 dark:border-graphite-900/80 pb-6 mb-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1 font-mono">
          Horizon AI &bull; Talent Acquisition Suite
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-graphite-900 dark:text-white">
          {activeTab === "dashboard" && "Talent Acquisition Dashboard"}
          {activeTab === "pipeline" && "Applicant Pipeline"}
          {activeTab === "jd-parser" && "Job Description Parser"}
          {activeTab === "compare" && "Multi-Candidate Matrix"}
          {activeTab === "settings" && "AI Settings Swapper"}
        </h1>
      </div>

      {/* Action Row: Theme toggle + Diagnostics */}
      <div className="flex items-center gap-3">
        {jobs.length > 0 && setActiveJob && (
          <div className="flex items-center gap-2 mr-1">
            <span className="text-[9px] font-bold text-graphite-400 dark:text-graphite-500 uppercase tracking-widest hidden md:inline">
              🎯 Focal JD:
            </span>
            <select
              value={activeJob?.id || "all"}
              onChange={(e) => {
                if (e.target.value === "all") {
                  if (setActiveJob) setActiveJob(null as any);
                } else {
                  const selected = jobs.find((j) => j.id === e.target.value);
                  if (selected && setActiveJob) setActiveJob(selected);
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-graphite-250 dark:border-graphite-805 bg-white/70 dark:bg-graphite-900/70 text-xs font-bold text-graphite-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm backdrop-blur-md"
            >
              <option value="all" className="bg-white dark:bg-graphite-950 text-graphite-900 dark:text-white">
                All Posted Roles
              </option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id} className="bg-white dark:bg-graphite-950 text-graphite-900 dark:text-white">
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg glass-panel glass-panel-hover flex items-center justify-center text-graphite-600 dark:text-graphite-300 focus:outline-none cursor-pointer"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          )}
        </button>

        {/* Diagnostics badge */}
        <button
          onClick={() => {
            void checkBackendHealth();
          }}
          disabled={checkingApi}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold glass-panel glass-panel-hover flex items-center gap-2 focus:outline-none cursor-pointer text-graphite-700 dark:text-white"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${apiHealth ? "bg-emerald-500" : "bg-rose-500"} ${
              checkingApi ? "animate-ping" : ""
            }`}
          ></span>
          {apiHealth ? "Backend Operational" : "Backend Offline"}
        </button>
      </div>
    </header>
  );
}
