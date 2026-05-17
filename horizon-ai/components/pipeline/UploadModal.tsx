import React, { useState, useRef } from "react";
import { Candidate } from "../../types";

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidate: Candidate) => void;
  provider: string;
  modelName: string;
}

const CATEGORIES = ["Engineering", "Product", "Design", "DevOps"];

export default function UploadModal({ isOpen, onClose, onSuccess, provider, modelName }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Inline Editor form state
  const [parsedCandidate, setParsedCandidate] = useState<Candidate | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  // Upload & parse request
  const uploadFile = async (file: File) => {
    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".pdf") && !filename.endsWith(".txt")) {
      setError("Unsupported file format. Please upload a PDF or TXT resume.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(
        `${API_BASE_URL}/api/upload-resume?provider=${provider}&model_name=${modelName}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to parse resume.");
      }

      const data = (await res.json()) as Omit<Candidate, "id" | "stage">;
      
      // Seed with structural defaults for local state editor
      setParsedCandidate({
        ...data,
        id: "", // Will be generated on backend DB insertion
        stage: "applied", // Initial pipeline stage
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error uploading and parsing file.");
    } finally {
      setUploading(false);
    }
  };

  // Persist form changes to SQLite/Supabase
  const handleSaveCandidate = async () => {
    if (!parsedCandidate) return;

    setUploading(true);
    setError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedCandidate),
      });

      if (!res.ok) {
        throw new Error("Failed to persist candidate to database.");
      }

      const savedCandidate = (await res.json()) as Candidate;
      onSuccess(savedCandidate);
      
      // Reset modal state
      setParsedCandidate(null);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving candidate.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-graphite-950/40 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-graphite-200/60 dark:border-graphite-850 bg-white dark:bg-graphite-950 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-sm font-bold uppercase tracking-widest text-graphite-400 font-mono">
            {parsedCandidate ? "Inline Candidate Editor" : "Parse Applicant Resume"}
          </h3>
          <button onClick={onClose} className="text-graphite-400 hover:text-graphite-600 dark:hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto pr-1">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Step 1: Drag & Drop Zone (Task 4.1) */}
          {!parsedCandidate && !uploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 rounded-xl border border-dashed text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-500/[0.04] scale-[0.98] shadow-md shadow-indigo-500/10"
                  : "border-graphite-300 dark:border-graphite-800 bg-graphite-50/50 dark:bg-graphite-900/30 hover:border-indigo-500/50 hover:bg-indigo-500/[0.01]"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.txt"
                className="hidden"
              />
              <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4 transition-transform group-hover:scale-110">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h4 className="text-xs font-bold mb-1 leading-normal">Drag and drop resume here</h4>
              <p className="text-[10px] text-graphite-500 dark:text-graphite-400">PDF or plain text format accepted (max 5MB)</p>
            </div>
          )}

          {/* Loader Stage */}
          {uploading && !parsedCandidate && (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h4 className="text-xs font-bold mb-1 animate-pulse">Extracting resume telemetry...</h4>
              <p className="text-[10px] text-graphite-500 dark:text-graphite-400">Gemini/Groq structuring parsed PDF attributes...</p>
            </div>
          )}

          {/* Step 2: Inline Editor Preview Form (Task 4.4) */}
          {parsedCandidate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={parsedCandidate.name}
                    onChange={(e) => setParsedCandidate({ ...parsedCandidate, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={parsedCandidate.email}
                    onChange={(e) => setParsedCandidate({ ...parsedCandidate, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={parsedCandidate.title}
                    onChange={(e) => setParsedCandidate({ ...parsedCandidate, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                    Job Category
                  </label>
                  <select
                    value={parsedCandidate.category}
                    onChange={(e) => setParsedCandidate({ ...parsedCandidate, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                    Exp (Years)
                  </label>
                  <input
                    type="number"
                    value={parsedCandidate.experience}
                    onChange={(e) => setParsedCandidate({ ...parsedCandidate, experience: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                    Highest Ed
                  </label>
                  <input
                    type="text"
                    value={parsedCandidate.education}
                    onChange={(e) => setParsedCandidate({ ...parsedCandidate, education: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                    AI Match Score
                  </label>
                  <input
                    type="number"
                    value={parsedCandidate.score}
                    onChange={(e) => {
                      const score = Number(e.target.value);
                      setParsedCandidate({
                        ...parsedCandidate,
                        score,
                        matchDetails: { ...parsedCandidate.matchDetails, accuracy: score },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                  Technical Arsenal (Comma-separated)
                </label>
                <input
                  type="text"
                  value={parsedCandidate.skills.join(", ")}
                  onChange={(e) =>
                    setParsedCandidate({
                      ...parsedCandidate,
                      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider block mb-1.5 font-mono">
                    Strengths (Comma-separated)
                  </label>
                  <textarea
                    value={parsedCandidate.matchDetails.strengths.join(", ")}
                    onChange={(e) =>
                      setParsedCandidate({
                        ...parsedCandidate,
                        matchDetails: {
                          ...parsedCandidate.matchDetails,
                          strengths: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200 h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-amber-500 tracking-wider block mb-1.5 font-mono">
                    Identified Gaps (Comma-separated)
                  </label>
                  <textarea
                    value={parsedCandidate.matchDetails.gaps.join(", ")}
                    onChange={(e) =>
                      setParsedCandidate({
                        ...parsedCandidate,
                        matchDetails: {
                          ...parsedCandidate.matchDetails,
                          gaps: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200 h-20 resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-graphite-400 tracking-wider block mb-1.5 font-mono">
                  AI Synapse Summary
                </label>
                <textarea
                  value={parsedCandidate.matchDetails.summary}
                  onChange={(e) =>
                    setParsedCandidate({
                      ...parsedCandidate,
                      matchDetails: {
                        ...parsedCandidate.matchDetails,
                        summary: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-900/40 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200 h-20 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-graphite-200/60 dark:border-graphite-850 shrink-0 flex justify-end gap-3">
          {parsedCandidate ? (
            <>
              <button
                onClick={() => setParsedCandidate(null)}
                disabled={uploading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-graphite-600 dark:text-graphite-400 border border-graphite-200 dark:border-graphite-800 hover:bg-graphite-50 dark:hover:bg-graphite-900 transition"
              >
                Back
              </button>
              <button
                onClick={handleSaveCandidate}
                disabled={uploading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-md shadow-indigo-600/20 flex items-center"
              >
                {uploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                ) : null}
                Save & Add to Pipeline
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-graphite-600 dark:text-graphite-400 border border-graphite-200 dark:border-graphite-800 hover:bg-graphite-50 dark:hover:bg-graphite-900 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
