import React, { useState, useRef } from "react";
import Image from "next/image";
import { Candidate, ParsedJD } from "../../types";
import CandidateRadar from "../CandidateRadar";

export interface CompareViewProps {
  candidates: Candidate[];
  lastParsedJd?: ParsedJD | null;
  provider: string;
  modelName: string;
}

interface AnalysisItem {
  id: string;
  name: string;
  relative_strengths: string[];
  relative_gaps: string[];
}

interface ComparisonResult {
  recommended_winner_id: string;
  comparative_summary: string;
  candidate_analysis: AnalysisItem[];
}

export default function CompareView({ candidates, lastParsedJd, provider, modelName }: CompareViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetRole, setTargetRole] = useState(lastParsedJd ? lastParsedJd.title : "General Software Engineer");
  const [useParsedJd, setUseParsedJd] = useState(lastParsedJd ? true : false);
  const [mode, setMode] = useState<"selection" | "comparison">("selection");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const ROLE_SUGGESTIONS = [
    "Senior Software Engineer",
    "Product Manager",
    "UI/UX Designer",
    "DevOps Specialist",
    "QA Automation Engineer",
  ];

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      if (newSet.size >= 4) {
        setError("Maximum 4 candidates can be compared at once.");
        setTimeout(() => setError(null), 3000);
        return;
      }
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectedCandidates = candidates.filter((c) => selectedIds.has(c.id));

  const handleCompare = async () => {
    if (selectedCandidates.length < 2) return;
    
    setAnalyzing(true);
    setError(null);
    setMode("comparison");

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const payload = selectedCandidates.map(c => ({
        id: c.id,
        name: c.name,
        title: c.title,
        experience: c.experience,
        skills: c.skills,
        score: c.score,
        education: c.education,
        summary: c.matchDetails?.summary || "",
      }));

      const res = await fetch(`${API_BASE_URL}/api/compare-candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: payload,
          target_role: targetRole,
          parsed_jd: useParsedJd ? lastParsedJd : null,
          provider,
          model_name: modelName,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to compare candidates.");
      }

      const data = (await res.json()) as ComparisonResult;
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error analyzing candidates.");
      setMode("selection");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const getWinnerData = () => {
    if (!result) return null;
    return candidates.find(c => c.id === result.recommended_winner_id);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] print:h-auto print:bg-white print:text-black">
      {/* Hide header and ALL other site layout elements in print mode */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide EVERYTHING in the body */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the print ref container and its children */
          #compare-print-report, #compare-print-report * {
            visibility: visible !important;
          }
          /* Absolutely position the print report to fill the entire page bounds */
          #compare-print-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-border {
            border-color: #e5e7eb !important;
          }
          .print-text {
            color: #111827 !important;
          }
          .print-bg {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-grid {
            display: grid !important;
            page-break-inside: avoid;
          }
        }
      `}} />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold print-hidden shrink-0">
          {error}
        </div>
      )}

      {/* Mode 1: Selection (Task 6.1) */}
      {mode === "selection" && (
        <div className="flex-1 flex flex-col min-h-0 bg-white/40 dark:bg-graphite-900/30 border border-graphite-200/60 dark:border-graphite-850 p-6 rounded-2xl backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="mb-5">
            <h3 className="text-sm font-bold font-display text-graphite-900 dark:text-white">
              Multi-Candidate Batch Selector
            </h3>
            <p className="text-xs text-graphite-500 mt-1">
              Specify the target role and select 2 to 4 candidates to generate a side-by-side comparative analysis.
            </p>
          </div>

          {/* Active Job Description Specs Indicator (Day 5 Integration) */}
          {lastParsedJd && (
            <div className="mb-5 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs font-bold text-graphite-900 dark:text-white flex items-center gap-1.5 font-display">
                    Parsed JD Specifications Active
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-indigo-500 text-white uppercase tracking-wider">
                      Day 5 Synced
                    </span>
                  </h4>
                  <p className="text-[10px] text-graphite-500 mt-0.5">
                    Benchmark candidates directly against <span className="font-semibold text-indigo-500">{lastParsedJd.title}</span> specs.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setUseParsedJd(!useParsedJd);
                  if (!useParsedJd) {
                    setTargetRole(lastParsedJd.title);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  useParsedJd
                    ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "border-graphite-250 dark:border-graphite-800 text-graphite-650 dark:text-graphite-400 hover:border-indigo-500/30 bg-white/40 dark:bg-graphite-900/30"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${useParsedJd ? "bg-white animate-pulse" : "bg-graphite-400"}`} />
                {useParsedJd ? "Using JD Criteria" : "Use JD Criteria"}
              </button>
            </div>
          )}

          {/* Target Role Input & Suggestions */}
          <div className="mb-5 p-4 rounded-xl border border-graphite-200/50 dark:border-graphite-850 bg-white/60 dark:bg-graphite-950/20 shrink-0">
            <label className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 uppercase tracking-wider mb-2 block font-mono">
              Target Comparison Position / Role
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={useParsedJd}
                placeholder="Specify the comparison role (e.g. Lead Software Architect)..."
                className={`w-full px-3.5 py-2 rounded-lg border text-xs focus:outline-none transition mb-3 ${
                  useParsedJd
                    ? "border-indigo-500/30 bg-indigo-500/[0.02] text-indigo-500 dark:text-indigo-400 font-bold cursor-not-allowed select-none opacity-90 pr-10"
                    : "border-graphite-200/60 dark:border-graphite-850 bg-white/60 dark:bg-graphite-900/40 text-graphite-850 dark:text-graphite-250 focus:border-indigo-500"
                }`}
              />
              {useParsedJd && (
                <span className="absolute right-3 top-2.5 text-indigo-500 select-none">
                  <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
              )}
            </div>

            {useParsedJd && lastParsedJd ? (
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-graphite-450 dark:text-graphite-500 uppercase tracking-widest font-mono">
                  Benchmark Skills Matrix Criteria
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {lastParsedJd.required_skills?.map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold font-mono select-none">
                      ✓ {skill}
                    </span>
                  ))}
                  {lastParsedJd.preferred_skills?.map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md border border-indigo-500/25 bg-indigo-500/10 text-indigo-500 text-[9px] font-bold font-mono select-none">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {ROLE_SUGGESTIONS.map(role => (
                  <button
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${
                      targetRole === role
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-500"
                        : "border-graphite-200 dark:border-graphite-800 text-graphite-660 dark:text-graphite-400 bg-white/40 dark:bg-graphite-900/30 hover:border-indigo-500/30"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {candidates.map((candidate) => {
                const isSelected = selectedIds.has(candidate.id);
                return (
                  <div
                    key={candidate.id}
                    onClick={() => toggleSelection(candidate.id)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/[0.03] shadow-sm shadow-indigo-500/10"
                        : "border-graphite-200/60 dark:border-graphite-850 bg-white/60 dark:bg-graphite-950/40 hover:border-indigo-500/30"
                    }`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? "bg-indigo-500 border-indigo-500 text-white" 
                          : "border-graphite-300 dark:border-graphite-700 text-transparent"
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      {candidate.avatar ? (
                        <Image
                          src={candidate.avatar as string}
                          alt={candidate.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-xl object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {candidate.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-graphite-800 dark:text-white">{candidate.name}</h4>
                        <p className="text-[10px] text-graphite-500">{candidate.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-semibold">
                      <span className="text-graphite-500">{candidate.experience} Yrs Exp</span>
                      <span className={`${
                        candidate.score >= 85 ? "text-emerald-500" : candidate.score >= 70 ? "text-indigo-500" : "text-amber-500"
                      }`}>Score: {candidate.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Floating Action Bar */}
          {selectedIds.size >= 2 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-graphite-900 dark:bg-graphite-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-graphite-700 animate-fade-in-up">
              <span className="text-xs font-bold font-mono">
                {selectedIds.size} Candidates Selected
              </span>
              <button
                onClick={handleCompare}
                className="px-5 py-2 rounded-full bg-indigo-500 hover:bg-indigo-400 text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Analyze & Compare
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Comparison Layout (Task 6.2 & 6.3) */}
      {mode === "comparison" && (
        <div ref={printRef} id="compare-print-report" className="flex-1 flex flex-col min-h-0 bg-white/40 dark:bg-graphite-900/30 border border-graphite-200/60 dark:border-graphite-850 p-6 rounded-2xl backdrop-blur-md shadow-sm overflow-y-auto print:p-0 print:border-none print:shadow-none print:bg-white">
          
          {/* Header & Export Actions */}
          <div className="flex justify-between items-center mb-6 print-hidden">
            <button
              onClick={() => { setMode("selection"); setResult(null); }}
              className="flex items-center gap-2 text-xs font-semibold text-graphite-500 hover:text-graphite-800 dark:hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Selection
            </button>

            {result && (
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Report PDF
              </button>
            )}
          </div>

          {/* Loading State */}
          {analyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 print-hidden">
              <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h4 className="text-sm font-bold text-graphite-900 dark:text-white mb-1.5 font-display">Synthesizing Comparison</h4>
              <p className="text-xs text-graphite-500 max-w-xs animate-pulse">
                GenAI is computing cross-candidate semantic strengths and formatting the synthesis report...
              </p>
            </div>
          )}

          {/* Result Payload */}
          {result && (
            <div className="space-y-6 print-text print:space-y-4">
              
              {/* Report Header for Print */}
              <div className="hidden print:block mb-6 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold font-display text-gray-900">Horizon AI Talent Suite</h1>
                <p className="text-sm text-gray-500 mt-1">Comparative Candidate Synthesis Report • Role: {targetRole}</p>
              </div>

              {/* Top AI Synthesis Recommendation Panel (Task 6.3) */}
              <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.03] print:border-gray-200 print:bg-gray-50 print-border print-bg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-graphite-900 dark:text-white print-text font-display">
                      AI Director Recommendation
                    </h3>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider font-mono mt-0.5 print-text">
                      Target Role: {targetRole}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-graphite-600 dark:text-graphite-300 print-text leading-relaxed">
                  {result.comparative_summary}
                </p>

                {getWinnerData() && (
                  <div className="mt-4 p-3 rounded-xl bg-white/60 dark:bg-graphite-900/60 border border-indigo-500/20 flex items-center gap-4 print-bg print-border">
                    {getWinnerData()?.avatar ? (
                      <Image
                        src={getWinnerData()!.avatar as string}
                        alt="Winner"
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-xl object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold">
                        {getWinnerData()!.name.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5 font-mono">
                        Primary Recommended Hire
                      </p>
                      <h4 className="text-sm font-bold text-graphite-900 dark:text-white print-text">
                        {getWinnerData()!.name}
                      </h4>
                      <p className="text-[10px] text-graphite-500 font-semibold mt-0.5">
                        {getWinnerData()!.title} • Score: {getWinnerData()!.score}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Overlaid Dimensions Radar & Evidence Panel */}
              <CandidateRadar 
                candidates={selectedCandidates} 
                lastParsedJd={lastParsedJd} 
                targetRole={targetRole} 
              />

              {/* Side-by-Side Columnar Matrix Grid (Task 6.2) */}
              <div 
                className="grid gap-4 print-grid"
                style={{ gridTemplateColumns: `repeat(${selectedCandidates.length}, minmax(0, 1fr))` }}
              >
                {selectedCandidates.map((candidate) => {
                  const analysis = result.candidate_analysis.find(a => a.id === candidate.id);
                  const isWinner = result.recommended_winner_id === candidate.id;

                  return (
                    <div 
                      key={candidate.id} 
                      className={`flex flex-col border rounded-2xl overflow-hidden print-border ${
                        isWinner 
                          ? "border-indigo-500/50 shadow-md shadow-indigo-500/10 print-border" 
                          : "border-graphite-200/60 dark:border-graphite-850 print-border"
                      }`}
                    >
                      {/* Candidate Header */}
                      <div className={`p-4 border-b border-graphite-200/60 dark:border-graphite-850 print-border ${
                        isWinner ? "bg-indigo-500/[0.03] print-bg" : "bg-white/40 dark:bg-graphite-950/40 print-bg"
                      }`}>
                        <div className="flex flex-col items-center text-center">
                          {candidate.avatar ? (
                            <Image
                              src={candidate.avatar as string}
                              alt={candidate.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-2xl object-cover mb-3 shadow-sm"
                              unoptimized
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-sm">
                              {candidate.name.substring(0, 2)}
                            </div>
                          )}
                          <h4 className="text-sm font-bold text-graphite-900 dark:text-white print-text">
                            {candidate.name}
                          </h4>
                          <p className="text-[10px] text-graphite-500 font-medium mt-0.5">
                            {candidate.title}
                          </p>
                          <span className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide ${
                            candidate.score >= 85 ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25" :
                            candidate.score >= 70 ? "bg-indigo-500/15 text-indigo-500 border border-indigo-500/25" :
                            "bg-amber-500/15 text-amber-500 border border-amber-500/25"
                          }`}>
                            Score: {candidate.score}%
                          </span>
                        </div>
                      </div>

                      {/* Content Stack */}
                      <div className="p-4 flex-1 flex flex-col gap-5 bg-white/20 dark:bg-graphite-900/10 print:bg-white print-text">
                        
                        {/* Profile Meta */}
                        <div>
                          <p className="text-[9px] font-bold text-graphite-400 uppercase tracking-widest font-mono mb-2">Metrics</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-graphite-500">Experience</span>
                              <span className="font-semibold text-graphite-800 dark:text-graphite-200 print-text">{candidate.experience} Yrs</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-graphite-500">Education</span>
                              <span className="font-semibold text-graphite-800 dark:text-graphite-200 print-text truncate ml-2" title={candidate.education}>
                                {candidate.education.length > 20 ? candidate.education.substring(0, 20) + "..." : candidate.education}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div>
                          <p className="text-[9px] font-bold text-graphite-400 uppercase tracking-widest font-mono mb-2">Technical Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.slice(0, 5).map(s => (
                              <span key={s} className="px-2 py-0.5 rounded bg-graphite-100 dark:bg-graphite-800 border border-graphite-200 dark:border-graphite-700 text-[9px] font-semibold text-graphite-700 dark:text-graphite-300 print-border print-text">
                                {s}
                              </span>
                            ))}
                            {candidate.skills.length > 5 && (
                              <span className="px-2 py-0.5 rounded bg-graphite-100 dark:bg-graphite-800 border border-graphite-200 dark:border-graphite-700 text-[9px] font-semibold text-graphite-500 print-border print-text">
                                +{candidate.skills.length - 5}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* AI Analysis Injection */}
                        {analysis && (
                          <div className="mt-auto space-y-4 pt-4 border-t border-graphite-200/60 dark:border-graphite-850 print-border">
                            {/* Strengths */}
                            <div>
                              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono mb-1.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Key Advantages
                              </p>
                              <ul className="space-y-1.5">
                                {analysis.relative_strengths.map((str, i) => (
                                  <li key={i} className="text-[10px] text-graphite-650 dark:text-graphite-300 leading-relaxed print-text relative pl-3">
                                    <span className="absolute left-0 top-1 w-1 h-1 rounded-full bg-emerald-500"></span>
                                    {str}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Gaps */}
                            <div>
                              <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest font-mono mb-1.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Relative Gaps
                              </p>
                              <ul className="space-y-1.5">
                                {analysis.relative_gaps.map((gap, i) => (
                                  <li key={i} className="text-[10px] text-graphite-650 dark:text-graphite-300 leading-relaxed print-text relative pl-3">
                                    <span className="absolute left-0 top-1 w-1 h-1 rounded-full bg-rose-500"></span>
                                    {gap}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
