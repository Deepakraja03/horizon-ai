import React, { useState } from "react";
import Image from "next/image";
import { Candidate } from "../../types";

export interface JDParserViewProps {
  onUpdateCandidates: (candidate: Candidate) => void;
  onJdParsed?: (jd: ParsedJD | null) => void;
  provider: string;
  modelName: string;
}

interface ParsedJD {
  title: string;
  summary: string;
  min_experience: number;
  education: string;
  required_skills: string[];
  preferred_skills: string[];
}

interface SkillMatchItem {
  name: string;
  status: "matched" | "neutral" | "missing";
}

interface MatchCandidateResult {
  candidate: Candidate;
  matchScore: number;
  skillsScore: number;
  seniorityScore: number;
  skillsMatrix: SkillMatchItem[];
  summary: string;
}

// Interactive High-Fidelity presets
const PRESETS = [
  {
    name: "Senior Backend Engineer",
    text: `Position: Senior Backend Engineer
Experience: 5+ Years
Education: Bachelor's in CS or equivalent experience

Core Responsibilities:
- Design and implement highly scalable microservices using Node.js, Go, and PostgreSQL.
- Architect high-performance distributed caching systems using Redis.
- Orchestrate data streaming structures utilizing Kafka for real-time telemetry pipelines.
- Build resilient system structures, optimizing queries, database indexes, and connection pools.

Qualifications:
- Deep experience in scale architecture, distributed systems, and backend development.
- Strong proficiency in Node.js, Go, SQL databases (PostgreSQL, MySQL), and Redis.
- Familiarity with Kafka, Docker, and Kubernetes deployment pipelines is preferred.`,
  },
  {
    name: "UI/UX Designer",
    text: `Position: Senior UI/UX Designer
Experience: 4+ Years
Education: BFA in Interaction Design, Human-Computer Interaction, or equivalent

Role details:
We are seeking an empathetic UI/UX designer to craft modern, premium SaaS dashboards. You will build comprehensive design systems in Figma, conduct user research, and build interactive high-fidelity prototypes.

Requirements:
- Deep mastery of Figma, including advanced variables, component properties, and layout auto-flows.
- Solid experience creating complex SaaS dashboard design systems.
- High empathy for users and strong interface craft.
- Familiarity with HTML, CSS, Tailwind, or React is a nice-to-have to facilitate communication with engineering.`,
  },
  {
    name: "DevOps Engineer",
    text: `Position: Lead DevOps Platform Engineer
Experience: 7+ Years
Education: BS in Computer Science or Software Engineering

Responsibilities:
- Build and orchestrate scalable Kubernetes container infrastructures.
- Author robust Terraform Infrastructure as Code (IaC) structures across AWS instances.
- Standardize zero-downtime CI/CD orchestration pipelines.
- Ensure 99.99% availability of production servers.

Technical Skills:
- Mandatory: Terraform, AWS Cloud Suite, Kubernetes (EKS), Docker, CI/CD pipelines.
- Preferred: Python scripting, Prometheus, and Grafana logging.`,
  },
];

export default function JDParserView({ onUpdateCandidates, onJdParsed, provider, modelName }: JDParserViewProps) {
  const [jdText, setJdText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States after successful backend parse
  const [parsedJd, setParsedJd] = useState<ParsedJD | null>(null);
  const [matchingCandidates, setMatchingCandidates] = useState<MatchCandidateResult[] | null>(null);
  
  // Grid row accordion state
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccessId, setSyncSuccessId] = useState<string | null>(null);

  const applyPreset = (text: string) => {
    setJdText(text);
    setError(null);
  };

  const handleClear = () => {
    setJdText("");
    setParsedJd(null);
    setMatchingCandidates(null);
    setError(null);
    if (onJdParsed) {
      onJdParsed(null);
    }
  };

  // Perform AI Analysis & Scan Pipeline (Task 5.2 & 5.3)
  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) {
      setError("Please paste a job description or choose a preset template.");
      return;
    }

    setParsing(true);
    setError(null);
    setParsedJd(null);
    setMatchingCandidates(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // Step 1: Parse JD Structure
      const parseRes = await fetch(`${API_BASE_URL}/api/parse-jd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd_text: jdText,
          provider,
          model_name: modelName,
        }),
      });

      if (!parseRes.ok) {
        const errData = await parseRes.json();
        throw new Error(errData.detail || "Failed to parse job description.");
      }

      const jdData = (await parseRes.json()) as ParsedJD;
      setParsedJd(jdData);
      if (onJdParsed) {
        onJdParsed(jdData);
      }

      // Step 2: Compute Semantic Match Matrix against pipeline candidates
      const matchRes = await fetch(`${API_BASE_URL}/api/match-jd-candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jdData),
      });

      if (!matchRes.ok) {
        throw new Error("Failed to scan candidate pipeline against parsed JD requirements.");
      }

      const matchData = (await matchRes.json()) as MatchCandidateResult[];
      setMatchingCandidates(matchData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error analyzing job description.");
    } finally {
      setParsing(false);
    }
  };

  // Sync dynamic score back to Database (Task 5.4 Actions)
  const handleSyncScore = async (result: MatchCandidateResult) => {
    setSyncingId(result.candidate.id);
    setError(null);

    const updatedCand: Candidate = {
      ...result.candidate,
      score: result.matchScore, // update core pipeline score to match this JD!
      matchDetails: {
        ...result.candidate.matchDetails,
        accuracy: result.matchScore,
        summary: `Dynamic JD Match Synapse: ${result.summary}`,
      },
    };

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCand),
      });

      if (!res.ok) {
        throw new Error("Failed to sync score back to database.");
      }

      const savedCandidate = (await res.json()) as Candidate;
      onUpdateCandidates(savedCandidate);
      
      // Update local state results dynamically
      if (matchingCandidates) {
        setMatchingCandidates(
          matchingCandidates.map((m) =>
            m.candidate.id === savedCandidate.id ? { ...m, candidate: savedCandidate } : m
          )
        );
      }

      setSyncSuccessId(savedCandidate.id);
      setTimeout(() => setSyncSuccessId(null), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error syncing candidate score.");
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Left Column: Workspace Pasting Area (Task 5.1) */}
      <div className="flex-1 flex flex-col min-w-[320px] max-w-full xl:max-w-md bg-white/40 dark:bg-graphite-900/30 border border-graphite-200/60 dark:border-graphite-850 p-5 rounded-2xl backdrop-blur-md shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-graphite-400 font-mono mb-4">
          JD Pasting Workspace
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Template Quick Presets */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 uppercase tracking-wider mb-2 font-mono">
            Load Template Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.text)}
                disabled={parsing}
                className="px-2.5 py-1.5 rounded-lg border border-graphite-200 dark:border-graphite-800 text-[10px] font-semibold text-graphite-700 dark:text-graphite-300 bg-white/50 dark:bg-graphite-900/40 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] cursor-pointer transition disabled:opacity-50"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Big Paste Box */}
        <div className="flex-1 flex flex-col mb-4">
          <label className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 uppercase tracking-wider mb-2 font-mono">
            Job Specification Text
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            disabled={parsing}
            placeholder="Paste raw Job Description specifications here (responsibilities, technical stack, requirements, experience levels)..."
            className="flex-1 w-full p-4 rounded-xl border border-graphite-200/60 dark:border-graphite-850 bg-white/60 dark:bg-graphite-900/20 focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-xs text-graphite-850 dark:text-graphite-250 font-sans resize-none leading-relaxed transition-all shadow-inner"
          />
        </div>

        {/* Workspace Actions */}
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleClear}
            disabled={parsing || !jdText}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-graphite-600 dark:text-graphite-400 border border-graphite-200 dark:border-graphite-800 hover:bg-graphite-50 dark:hover:bg-graphite-900 cursor-pointer transition disabled:opacity-50"
          >
            Clear Workspace
          </button>
          <button
            onClick={handleAnalyzeJD}
            disabled={parsing || !jdText.trim()}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-md shadow-indigo-600/20 flex items-center justify-center cursor-pointer"
          >
            {parsing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Scanning telemetry...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-2 5h.01M9 16h.01M9 12h.01M12 12h3M12 16h3M12 10h3" />
                </svg>
                Analyze & Scan Pipeline
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: AI Analysis Output & Grid Matrix */}
      <div className="flex-1 flex flex-col bg-white/40 dark:bg-graphite-900/30 border border-graphite-200/60 dark:border-graphite-850 p-5 rounded-2xl backdrop-blur-md shadow-sm overflow-hidden h-full">
        {!parsedJd && !parsing && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4 animate-pulse">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-graphite-900 dark:text-white mb-1.5 font-display">Awaiting JD Analysis</h4>
            <p className="text-xs text-graphite-500 max-w-sm">
              Paste in a job specification on the left and trigger the pipeline scan. The structured AI criteria and matching candidate matrix will display here.
            </p>
          </div>
        )}

        {parsing && !parsedJd && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h4 className="text-sm font-bold text-graphite-900 dark:text-white mb-1.5 font-display">Extracting Role Telemetry</h4>
            <p className="text-xs text-graphite-500 max-w-xs animate-pulse">
              Gemini / Groq structuring qualifications, required skills, and calculating match index weights...
            </p>
          </div>
        )}

        {parsedJd && (
          <div className="flex-grow flex flex-col h-full overflow-hidden space-y-5">
            {/* Top segment: Parsed JD summary details */}
            <div className="p-4 rounded-xl border border-graphite-200/60 dark:border-graphite-850 bg-white/60 dark:bg-graphite-950/40 shrink-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base font-bold font-display text-indigo-600 dark:text-indigo-400">
                    {parsedJd.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-wider text-graphite-450 dark:text-graphite-400 font-mono">
                    <span>Exp Level: {parsedJd.min_experience}+ Years</span>
                    <span className="w-1 h-1 rounded-full bg-graphite-400 dark:bg-graphite-500"></span>
                    <span>Degree: {parsedJd.education}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 uppercase tracking-widest font-mono">
                  Structured JD
                </span>
              </div>
              <p className="text-[11px] text-graphite-650 dark:text-graphite-300 leading-relaxed">
                {parsedJd.summary}
              </p>
            </div>

            {/* Bottom Segment: Ranked matching Candidate Matrix (Task 5.4) */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-[200px]">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <h4 className="text-xs font-bold uppercase tracking-widest text-graphite-400 font-mono">
                  Semantic Candidate Suitability Matrix
                </h4>
                <span className="text-[10px] text-graphite-400 dark:text-graphite-500 font-mono">
                  Scanned: {matchingCandidates?.length || 0} Candidates
                </span>
              </div>

              {/* Grid matrix container */}
              <div className="flex-grow overflow-y-auto pr-1 space-y-2.5">
                {matchingCandidates?.map((match) => {
                  const isExpanded = expandedCandidateId === match.candidate.id;
                  
                  return (
                    <div
                      key={match.candidate.id}
                      className={`rounded-xl border transition-all duration-300 ${
                        isExpanded
                          ? "border-indigo-500 bg-indigo-500/[0.02]"
                          : "border-graphite-200/60 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/10 hover:border-graphite-350 dark:hover:border-graphite-800"
                      }`}
                    >
                      {/* Accordion Row Trigger Header */}
                      <div
                        onClick={() =>
                          setExpandedCandidateId(isExpanded ? null : match.candidate.id)
                        }
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {match.candidate.avatar ? (
                            <Image
                              src={match.candidate.avatar}
                              alt={match.candidate.name}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-xl object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              {match.candidate.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <h5 className="text-xs font-bold text-graphite-800 dark:text-white">
                              {match.candidate.name}
                            </h5>
                            <p className="text-[10px] text-graphite-400 dark:text-graphite-500 font-medium">
                              {match.candidate.title} • {match.candidate.experience} yrs exp
                            </p>
                          </div>
                        </div>

                        {/* Visual score pill with color weights */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide ${
                                match.matchScore >= 85
                                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25"
                                  : match.matchScore >= 70
                                  ? "bg-indigo-500/15 text-indigo-500 border border-indigo-500/25"
                                  : "bg-amber-500/15 text-amber-500 border border-amber-500/25"
                              }`}
                            >
                              {match.matchScore}% Match
                            </span>
                          </div>
                          
                          {/* Expanded Chevron indicator */}
                          <svg
                            className={`w-4 h-4 text-graphite-400 transition-transform duration-300 ${
                              isExpanded ? "transform rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Expander body: Interactive Skill Overlap Matrix Grid (Task 5.4) */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-graphite-200/40 dark:border-graphite-850/40 space-y-4 animate-fade-in">
                          {/* Technical Skills Overlap tags */}
                          <div>
                            <p className="text-[9px] font-bold text-graphite-400 dark:text-graphite-550 uppercase tracking-widest font-mono mb-2">
                              Core Requirements Overlap Matrix
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {match.skillsMatrix.map((skill) => (
                                <span
                                  key={skill.name}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                    skill.status === "matched"
                                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                      : skill.status === "neutral"
                                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                      : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                  }`}
                                >
                                  {/* Color Indicator Bullet */}
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      skill.status === "matched"
                                        ? "bg-emerald-500"
                                        : skill.status === "neutral"
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                  />
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Quick Score Parameters Cards */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-2.5 rounded-lg bg-white/40 dark:bg-graphite-950/20 border border-graphite-200/40 dark:border-graphite-850/40">
                              <span className="text-[8px] font-bold text-graphite-400 uppercase tracking-wider block font-mono">
                                Technical Suitability
                              </span>
                              <span className="text-sm font-bold block mt-0.5">{match.skillsScore}% Match</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white/40 dark:bg-graphite-950/20 border border-graphite-200/40 dark:border-graphite-850/40">
                              <span className="text-[8px] font-bold text-graphite-400 uppercase tracking-wider block font-mono">
                                Experience Suitability
                              </span>
                              <span className="text-sm font-bold block mt-0.5">{match.seniorityScore}% Match</span>
                            </div>
                          </div>

                          {/* Justification summary & persistence button */}
                          <div className="p-3 rounded-lg bg-graphite-50 dark:bg-graphite-950/30 text-[10.5px] text-graphite-650 dark:text-graphite-300 leading-relaxed border border-graphite-150 dark:border-graphite-850/60">
                            {match.summary}
                          </div>

                          <div className="flex justify-end gap-2.5 pt-1">
                            <span className="text-[9px] text-graphite-450 dark:text-graphite-500 flex items-center font-mono">
                              DB Score: {match.candidate.score}%
                            </span>
                            
                            <button
                              onClick={() => handleSyncScore(match)}
                              disabled={syncingId !== null}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center cursor-pointer ${
                                syncSuccessId === match.candidate.id
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/10"
                              }`}
                            >
                              {syncingId === match.candidate.id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                                  Syncing...
                                </>
                              ) : syncSuccessId === match.candidate.id ? (
                                <>
                                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Synced Successfully!
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                                  </svg>
                                  Sync Match Score
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
