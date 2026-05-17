import React from "react";
import { HealthData } from "../../types";

export interface DashboardViewProps {
  apiHealth: HealthData | null;
  checkingApi: boolean;
  setActiveTab: (tab: string) => void;
  candidatesCount?: number;
  jobsCount?: number;
  averageScore?: number;
}

export default function DashboardView({
  apiHealth,
  checkingApi,
  setActiveTab,
  candidatesCount = 0,
  jobsCount = 0,
  averageScore = 0,
}: DashboardViewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Live Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="p-5 rounded-xl glass-panel relative overflow-hidden bg-white/40 dark:bg-graphite-900/30 border border-graphite-200/60 dark:border-graphite-850">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
          <span className="text-xs font-semibold text-graphite-500 dark:text-graphite-400 tracking-wide uppercase block">
            Total Candidates
          </span>
          <span className="text-3xl font-bold text-graphite-900 dark:text-white mt-2 block font-display">
            {candidatesCount}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-flex items-center gap-1">
            Active in Pipeline
          </span>
        </div>

        {/* Active Jobs */}
        <div className="p-5 rounded-xl glass-panel relative overflow-hidden bg-white/40 dark:bg-graphite-900/30 border border-graphite-200/60 dark:border-graphite-850">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
          <span className="text-xs font-semibold text-graphite-500 dark:text-graphite-400 tracking-wide uppercase block">
            Active Careers
          </span>
          <span className="text-3xl font-bold text-graphite-900 dark:text-white mt-2 block font-display">
            {jobsCount}
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 inline-flex items-center gap-1">
            Published Job Specs
          </span>
        </div>

        {/* Avg Match score */}
        <div className="p-5 rounded-xl glass-panel relative overflow-hidden bg-white/40 dark:bg-graphite-900/30 border border-graphite-200/60 dark:border-graphite-850">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <span className="text-xs font-semibold text-graphite-500 dark:text-graphite-400 tracking-wide uppercase block">
            Avg Match Accuracy
          </span>
          <span className="text-3xl font-bold text-graphite-900 dark:text-white mt-2 block font-display">
            {averageScore}%
          </span>
          <span className="text-[10px] text-emerald-650 dark:text-emerald-450 font-semibold mt-1 inline-flex items-center gap-1 font-display">
            Gemini-Powered Index
          </span>
        </div>

        {/* Response Latency */}
        <div className="p-5 rounded-xl glass-panel relative overflow-hidden bg-white/40 dark:bg-graphite-900/30 border border-graphite-200/60 dark:border-graphite-850">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
          <span className="text-xs font-semibold text-graphite-500 dark:text-graphite-400 tracking-wide uppercase block">
            AI Engine Latency
          </span>
          <span className="text-3xl font-bold text-graphite-900 dark:text-white mt-2 block font-display">
            2.4s
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 inline-flex items-center gap-1">
            Standard Response Time
          </span>
        </div>
      </div>

      {/* Main Operational Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-graphite-200 dark:border-graphite-800/80 bg-gradient-to-b from-white/10 to-white/20 dark:from-graphite-900/20 dark:to-graphite-950/20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl"></div>
          <h2 className="text-xl font-bold text-graphite-900 dark:text-white mb-4 font-display">
            Horizon AI Workspace Dashboard
          </h2>
          <p className="text-graphite-700 dark:text-graphite-300 text-sm leading-relaxed mb-6">
            Welcome to the recruitment control hub. Leverage Gemini AI to scan, parse, and stack-rank incoming applicant resumes against structured job specifications automatically. Streamline stages dynamically using the Kanban interface and make optimal hiring choices with high-fidelity candidate comparison matrices.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActiveTab("pipeline")}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-center shadow-lg shadow-indigo-600/10 dark:shadow-indigo-600/20 transition cursor-pointer"
            >
              Go to Applicant Pipeline
            </button>
            <button
              onClick={() => setActiveTab("jd-parser")}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-graphite-100 hover:bg-graphite-200 dark:bg-graphite-800 dark:hover:bg-graphite-700 text-graphite-800 dark:text-graphite-200 text-center border border-graphite-250 dark:border-graphite-700 transition cursor-pointer"
            >
              Post New JD & Scan
            </button>
          </div>
        </div>

        {/* Engine Health diagnostic side card */}
        <div className="p-6 rounded-2xl glass-panel border border-graphite-200 dark:border-graphite-800/80 bg-white/40 dark:bg-graphite-900/30 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-graphite-900 dark:text-white tracking-wide uppercase mb-4 font-display">
              FastAPI Engine Health
            </h3>
            {checkingApi ? (
              <div className="space-y-2 py-4">
                <div className="h-4 bg-graphite-200 dark:bg-graphite-800 animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-graphite-200 dark:bg-graphite-800 animate-pulse rounded w-1/2"></div>
              </div>
            ) : apiHealth ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-graphite-500 dark:text-graphite-400 font-semibold">Server Status</span>
                  <code className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded font-mono font-bold">
                    OPERATIONAL
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-graphite-500 dark:text-graphite-400 font-semibold">Gemini Adapter</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      apiHealth.providers.gemini
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-graphite-100 dark:bg-graphite-800 text-graphite-400 dark:text-graphite-500"
                    }`}
                  >
                    {apiHealth.providers.gemini ? "API Key Connected" : "Missing Key"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-graphite-500 dark:text-graphite-400 font-semibold">Groq Adapter</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      apiHealth.providers.groq
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-graphite-100 dark:bg-graphite-800 text-graphite-400 dark:text-graphite-500"
                    }`}
                  >
                    {apiHealth.providers.groq ? "API Key Connected" : "Missing Key"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <span className="text-xs text-rose-600 dark:text-rose-400 block font-semibold mb-2 font-display">
                  Backend Disconnected
                </span>
                <p className="text-[11px] text-graphite-500 dark:text-graphite-400 leading-relaxed">
                  Make sure your FastAPI server is currently running.
                </p>
              </div>
            )}
          </div>
          <div className="border-t border-graphite-200 dark:border-graphite-800/80 pt-4 mt-4 text-[10px] text-graphite-500 dark:text-graphite-550 leading-relaxed">
            Connected to Supabase Cloud Engine.
          </div>
        </div>
      </div>

      {/* Platform Quick Actions */}
      <div className="p-6 rounded-2xl glass-panel border border-graphite-200 dark:border-graphite-800/80 bg-white/40 dark:bg-graphite-900/30">
        <h3 className="text-sm font-bold text-graphite-900 dark:text-white tracking-wide uppercase mb-4 font-display">
          Platform Workspace Shortcuts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveTab("pipeline")}
            className="p-5 rounded-xl bg-white/40 dark:bg-graphite-950/40 border border-graphite-250 dark:border-graphite-900 hover:border-indigo-500/40 cursor-pointer transition flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 uppercase block w-max mb-3 font-mono">
                Kanban Workspace
              </span>
              <span className="text-xs font-semibold text-graphite-900 dark:text-white block font-display">
                Candidate Pipeline Boards
              </span>
              <p className="text-[10px] text-graphite-500 dark:text-graphite-400 mt-1 leading-relaxed">
                Browse all active candidates, advance applicant stages dynamically, and examine individual Gemini feedback details.
              </p>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-450 font-bold block mt-4 font-mono">
              Launch Pipeline &rarr;
            </span>
          </div>

          <div
            onClick={() => setActiveTab("jd-parser")}
            className="p-5 rounded-xl bg-white/40 dark:bg-graphite-950/40 border border-graphite-250 dark:border-graphite-900 hover:border-indigo-500/40 cursor-pointer transition flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 uppercase block w-max mb-3 font-mono">
                Structured Scan
              </span>
              <span className="text-xs font-semibold text-graphite-900 dark:text-white block font-display">
                AI Job Spec Parser
              </span>
              <p className="text-[10px] text-graphite-500 dark:text-graphite-400 mt-1 leading-relaxed">
                Paste raw Job Descriptions, extract core technical criteria, and compute instant semantic match scores against candidates.
              </p>
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-440 font-bold block mt-4 font-mono">
              Launch JD Parser &rarr;
            </span>
          </div>

          <div
            onClick={() => setActiveTab("compare")}
            className="p-5 rounded-xl bg-white/40 dark:bg-graphite-950/40 border border-graphite-250 dark:border-graphite-900 hover:border-indigo-500/40 cursor-pointer transition flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 uppercase block w-max mb-3 font-mono">
                Synapse Matrix
              </span>
              <span className="text-xs font-semibold text-graphite-900 dark:text-white block font-display">
                Multi-Candidate Comparison
              </span>
              <p className="text-[10px] text-graphite-500 dark:text-graphite-400 mt-1 leading-relaxed">
                Cross-analyze up to 4 top applicants side-by-side on an interactive scoring matrix and generate structured PDF reports.
              </p>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold block mt-4 font-mono">
              Launch Comparison &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
