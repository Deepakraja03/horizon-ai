import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Candidate, CandidateStage, JobDescription } from "../../types";
import UploadModal from "./UploadModal";

export interface PipelineViewProps {
  candidates: Candidate[];
  jobs?: JobDescription[];
  handleUpdateStage: (candidateId: string, newStage: CandidateStage) => void;
  handleNewCandidate: (candidate: Candidate) => void;
  selectedProvider: string;
  selectedModel: string;
}

const STAGES: { id: CandidateStage; label: string }[] = [
  { id: "applied", label: "Applied" },
  { id: "screening", label: "Screening" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "archived", label: "Archived" },
];

const CATEGORIES = ["All", "Engineering", "Product", "Design", "DevOps"];

export default function PipelineView({
  candidates,
  jobs = [],
  handleUpdateStage,
  handleNewCandidate,
  selectedProvider,
  selectedModel,
}: PipelineViewProps) {
  // Find job details
  const getAppliedRoleName = (jobId?: string) => {
    if (!jobId || !jobs || jobs.length === 0) return "General Pool";
    const job = jobs.find((j) => j.id === jobId);
    return job ? job.title : "General Pool";
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filter candidates based on current criteria
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
      const matchesScore = c.score >= scoreFilter;
      return matchesSearch && matchesCategory && matchesScore;
    });
  }, [candidates, searchTerm, categoryFilter, scoreFilter]);

  // Derived KPIs
  const avgScore = useMemo(() => {
    if (candidates.length === 0) return 0;
    const total = candidates.reduce((acc, c) => acc + c.score, 0);
    return Math.round(total / candidates.length);
  }, [candidates]);

  const interviewRatio = useMemo(() => {
    if (candidates.length === 0) return 0;
    const interviewing = candidates.filter((c) => c.stage === "interview").length;
    return Math.round((interviewing / candidates.length) * 100);
  }, [candidates]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 80) return "text-indigo-500 bg-indigo-500/10 border-indigo-500/30";
    if (score >= 70) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-rose-500 bg-rose-500/10 border-rose-500/30";
  };

  const getScoreRing = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 80) return "text-indigo-500";
    if (score >= 70) return "text-amber-500";
    return "text-rose-500";
  };

  // Helper to handle stage movements
  const moveStage = (e: React.MouseEvent, candidate: Candidate, direction: "prev" | "next") => {
    e.stopPropagation();
    const currentIndex = STAGES.findIndex((s) => s.id === candidate.stage);
    let newIndex = currentIndex;
    if (direction === "next" && currentIndex < STAGES.length - 1) newIndex++;
    if (direction === "prev" && currentIndex > 0) newIndex--;
    if (newIndex !== currentIndex) {
      handleUpdateStage(candidate.id, STAGES[newIndex].id);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in text-graphite-900 dark:text-graphite-100 relative">
      {/* KPI Dashboard (Task 3.2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="p-4 rounded-xl border border-graphite-200/60 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/30 backdrop-blur-md flex items-center justify-between shadow-sm relative overflow-hidden">
          <div>
            <p className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 tracking-widest uppercase mb-1 font-mono">
              Avg Match Score
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-display">{avgScore}</span>
              <span className="text-[10px] font-semibold text-emerald-500 mb-1 flex items-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                4.2%
              </span>
            </div>
          </div>
          {/* Sparkline Mock */}
          <div className="w-24 h-10 opacity-70">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path d="M0 35 Q 20 20, 40 30 T 80 15 L 100 5" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-graphite-200/60 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/30 backdrop-blur-md flex items-center justify-between shadow-sm relative overflow-hidden">
          <div>
            <p className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 tracking-widest uppercase mb-1 font-mono">
              Total Pipeline
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-display">{candidates.length}</span>
              <span className="text-[10px] font-semibold text-graphite-400 mb-1 flex items-center">Active</span>
            </div>
          </div>
          {/* Sparkline Mock */}
          <div className="w-24 h-10 opacity-70">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path d="M0 40 Q 25 35, 50 20 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-graphite-200/60 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/30 backdrop-blur-md flex items-center justify-between shadow-sm relative overflow-hidden">
          <div>
            <p className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 tracking-widest uppercase mb-1 font-mono">
              Interview Ratio
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-display">{interviewRatio}%</span>
              <span className="text-[10px] font-semibold text-rose-500 mb-1 flex items-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                1.1%
              </span>
            </div>
          </div>
          {/* Sparkline Mock */}
          <div className="w-24 h-10 opacity-70">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path d="M0 10 Q 20 15, 40 10 T 80 25 L 100 35" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-500" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar (Task 3.3) */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 shrink-0">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-graphite-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search candidates by name, title, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200 transition-colors shadow-sm"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs font-semibold text-graphite-800 dark:text-graphite-200 transition-colors shadow-sm appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat} Roles</option>
            ))}
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs font-semibold text-graphite-800 dark:text-graphite-200 transition-colors shadow-sm appearance-none cursor-pointer"
          >
            <option value={0}>All Scores</option>
            <option value={90}>Score 90+</option>
            <option value={80}>Score 80+</option>
            <option value={70}>Score 70+</option>
          </select>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 flex items-center gap-1 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Candidate
          </button>
        </div>
      </div>

      {/* Kanban Board (Task 3.1) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stage.id);
            return (
              <div key={stage.id} className="w-[280px] h-full flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-display flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-graphite-400 dark:bg-graphite-500"></span>
                    {stage.label}
                  </h4>
                  <span className="text-[10px] font-mono font-semibold text-graphite-500 bg-graphite-100 dark:bg-graphite-800 px-1.5 py-0.5 rounded">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Column Drop Zone / Scroll Area */}
                <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-4">
                  {stageCandidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="group p-4 rounded-xl border border-graphite-200/80 dark:border-graphite-800 bg-white/70 dark:bg-graphite-900/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-indigo-500/40"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          {c.avatar ? (
                            <Image src={c.avatar} alt={c.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" unoptimized />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {c.name.split(" ").map(n => n[0]).join("").substring(0,2)}
                            </div>
                          )}
                          <div>
                            <h5 className="text-xs font-bold truncate max-w-[140px] leading-tight">{c.name}</h5>
                            <p className="text-[10px] text-indigo-500 font-semibold truncate max-w-[140px]">{c.title}</p>
                            {c.job_id && (
                              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 truncate max-w-[140px]">
                                💼 {getAppliedRoleName(c.job_id)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border ${getScoreColor(c.score)}`}>
                          {c.score}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        {c.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-graphite-100 dark:bg-graphite-800 text-graphite-600 dark:text-graphite-300 border border-graphite-200/50 dark:border-graphite-700">
                            {skill}
                          </span>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="text-[8px] font-semibold px-1 py-0.5 rounded text-graphite-400">+{c.skills.length - 3}</span>
                        )}
                      </div>

                      {/* Quick Move Actions */}
                      <div className="flex items-center justify-between border-t border-graphite-100 dark:border-graphite-800/60 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => moveStage(e, c, "prev")}
                          disabled={stage.id === "applied"}
                          className="text-[10px] text-graphite-400 hover:text-indigo-500 disabled:opacity-30 transition flex items-center"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Prev
                        </button>
                        
                        <button
                          onClick={(e) => moveStage(e, c, "next")}
                          disabled={stage.id === "archived"}
                          className="text-[10px] text-graphite-400 hover:text-indigo-500 disabled:opacity-30 transition flex items-center"
                        >
                          Next
                          <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {stageCandidates.length === 0 && (
                    <div className="h-24 rounded-xl border border-dashed border-graphite-300 dark:border-graphite-700 flex items-center justify-center text-[10px] font-semibold text-graphite-400 uppercase tracking-widest">
                      Empty Stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Profile Drawer (Task 3.4) */}
      {selectedCandidate && (
        <div className="absolute inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-graphite-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCandidate(null)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md h-full bg-white dark:bg-graphite-950 border-l border-graphite-200/60 dark:border-graphite-850 shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-graphite-200/60 dark:border-graphite-850 bg-graphite-50 dark:bg-graphite-900/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-graphite-500 font-display">
                Profile Insights
              </h3>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-graphite-400 hover:text-graphite-700 dark:hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Identity & Score Block */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {selectedCandidate.avatar ? (
                    <Image src={selectedCandidate.avatar} alt={selectedCandidate.name} width={56} height={56} className="w-14 h-14 rounded-2xl object-cover shadow-sm" unoptimized />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                      {selectedCandidate.name.split(" ").map(n => n[0]).join("").substring(0,2)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold font-display leading-tight">{selectedCandidate.name}</h2>
                    <p className="text-sm text-graphite-550">{selectedCandidate.title}</p>
                    <p className="text-xs text-graphite-400 mt-1 flex items-center gap-1 font-mono">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {selectedCandidate.email}
                    </p>
                    <div className="mt-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                      <span>💼 Applied Role:</span>
                      <span>{getAppliedRoleName(selectedCandidate.job_id)}</span>
                    </div>
                  </div>
                </div>

                {/* Circular Score Gauge */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-graphite-100 dark:text-graphite-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${getScoreRing(selectedCandidate.score)} transition-all duration-1000 ease-out`}
                      strokeDasharray={`${selectedCandidate.score}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold font-mono">{selectedCandidate.score}</span>
                  </div>
                </div>
              </div>

              {/* AI Match Summary */}
              <div>
                <h4 className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 tracking-widest uppercase mb-3 font-mono flex items-center gap-1.5">
                  <span className="text-indigo-500">✦</span>
                  AI Synapse Summary
                </h4>
                <div className="p-4 rounded-xl bg-indigo-500/[0.03] dark:bg-indigo-500/[0.04] border border-indigo-500/20 text-xs text-graphite-700 dark:text-graphite-300 leading-relaxed">
                  {selectedCandidate.matchDetails.summary}
                </div>
              </div>

              {/* Skills Grid */}
              <div>
                <h4 className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 tracking-widest uppercase mb-3 font-mono">
                  Technical Arsenal
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill) => (
                    <span key={skill} className="text-[10px] font-semibold px-2 py-1 rounded bg-graphite-100 dark:bg-graphite-800/80 text-graphite-700 dark:text-graphite-200 border border-graphite-200/50 dark:border-graphite-700 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase mb-3 font-mono flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {selectedCandidate.matchDetails.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-graphite-600 dark:text-graphite-400 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span className="leading-tight">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-amber-500 tracking-widest uppercase mb-3 font-mono flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Identified Gaps
                  </h4>
                  <ul className="space-y-2">
                    {selectedCandidate.matchDetails.gaps.map((gap, i) => (
                      <li key={i} className="text-xs text-graphite-600 dark:text-graphite-400 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span className="leading-tight">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-graphite-200/60 dark:border-graphite-850 bg-graphite-50 dark:bg-graphite-900/50 flex gap-3">
              <button 
                onClick={() => handleUpdateStage(selectedCandidate.id, "archived")}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition flex-1"
              >
                Archive Profile
              </button>
              <button 
                onClick={() => {
                  const currentIndex = STAGES.findIndex(s => s.id === selectedCandidate.stage);
                  if (currentIndex < STAGES.length - 1) {
                    handleUpdateStage(selectedCandidate.id, STAGES[currentIndex + 1].id);
                  }
                }}
                disabled={selectedCandidate.stage === "archived"}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition flex-1"
              >
                Advance Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload and Inline Edit Modal (Day 4 Sprints) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleNewCandidate}
        provider={selectedProvider}
        modelName={selectedModel}
      />
    </div>
  );
}
