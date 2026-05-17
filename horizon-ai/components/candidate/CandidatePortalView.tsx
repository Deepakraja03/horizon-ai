import React, { useState, useEffect } from "react";
import { JobDescription, Candidate } from "../../types";

export interface CandidatePortalViewProps {
  jobs: JobDescription[];
  candidateEmail: string;
  candidateApplications: Candidate[];
  onRefreshApplications: (email: string) => void;
  apiBaseUrl: string;
  selectedProvider: string;
  selectedModel: string;
}

export default function CandidatePortalView({
  jobs,
  candidateEmail,
  candidateApplications,
  onRefreshApplications,
  apiBaseUrl,
  selectedProvider,
  selectedModel,
}: CandidatePortalViewProps) {
  // Candidate form state
  const [emailInput, setEmailInput] = useState<string>(candidateEmail || "");
  const [nameInput, setNameInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"jobs" | "my-applications">("jobs");

  // Selection/Apply state
  const [applyingJob, setApplyingJob] = useState<JobDescription | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<Candidate | null>(null);

  // Sync email input with parent email state
  useEffect(() => {
    if (candidateEmail) {
      setEmailInput(candidateEmail);
      onRefreshApplications(candidateEmail);
    }
  }, [candidateEmail]);

  // Handle file drop/change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  // Submit job application form
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    if (!selectedFile) {
      setErrorMessage("Please select or drop a valid PDF/TXT resume to upload.");
      return;
    }
    if (!nameInput.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!emailInput.trim()) {
      setErrorMessage("Please enter your email address to track application status.");
      return;
    }

    setIsApplying(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setParsedResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("job_id", applyingJob.id);
    formData.append("candidate_name", nameInput.trim());
    formData.append("candidate_email", emailInput.trim());
    formData.append("provider", selectedProvider);
    if (selectedModel) {
      formData.append("model_name", selectedModel);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/candidates/apply`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit resume. Please try again.");
      }

      const candidateData = await response.json() as Candidate;
      setParsedResult(candidateData);
      setSuccessMessage(`Success! You have applied for the ${applyingJob.title} role.`);
      
      // Update local storage email to track applications easily
      localStorage.setItem("horizon_candidate_email", emailInput.trim());
      
      // Refresh applications list
      onRefreshApplications(emailInput.trim());

      // Reset file form
      setSelectedFile(null);
      setNameInput("");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Network error processing resume application.");
    } finally {
      setIsApplying(false);
    }
  };

  // Search applications manually for other emails
  const handleEmailSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      onRefreshApplications(emailInput.trim());
    }
  };

  // Stage styling helpers
  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "applied":
        return <span className="px-2.5 py-1 rounded-full text-[9.5px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">Applied</span>;
      case "screening":
        return <span className="px-2.5 py-1 rounded-full text-[9.5px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">Screening</span>;
      case "interview":
        return <span className="px-2.5 py-1 rounded-full text-[9.5px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Interview</span>;
      case "offer":
        return <span className="px-2.5 py-1 rounded-full text-[9.5px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Offer Made 🚀</span>;
      case "archived":
        return <span className="px-2.5 py-1 rounded-full text-[9.5px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">Archived</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[9.5px] font-bold bg-graphite-500/10 text-graphite-500">{stage}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-transparent border border-indigo-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-7xl select-none opacity-10 font-bold">
          CANDIDATE
        </div>
        <h2 className="text-xl font-bold text-graphite-900 dark:text-white flex items-center gap-2">
          👋 Welcome to the Candidate Career Portal
        </h2>
        <p className="text-xs text-graphite-500 dark:text-graphite-400 mt-1 max-w-2xl leading-relaxed">
          Find matching careers, apply by uploading your resume, and track your application stage dynamically. Our advanced AI scans and scores your application in real-time.
        </p>

        {/* View Switcher Controls */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "jobs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 cursor-default"
                : "bg-white/60 dark:bg-graphite-900/60 border border-graphite-250 dark:border-graphite-800 text-graphite-600 dark:text-graphite-300 hover:bg-white dark:hover:bg-graphite-900 cursor-pointer"
            }`}
          >
            🔍 Explore Careers ({jobs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("my-applications");
              if (emailInput.trim()) {
                onRefreshApplications(emailInput.trim());
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "my-applications"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 cursor-default"
                : "bg-white/60 dark:bg-graphite-900/60 border border-graphite-250 dark:border-graphite-800 text-graphite-600 dark:text-graphite-300 hover:bg-white dark:hover:bg-graphite-900 cursor-pointer"
            }`}
          >
            📋 Track My Applications ({candidateApplications.length})
          </button>
        </div>
      </div>

      {/* JOBS BOARD LISTING */}
      {activeTab === "jobs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-white/50 dark:bg-graphite-950/40 border border-white/20 dark:border-graphite-900 shadow-sm flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300 group hover:shadow-lg hover:shadow-indigo-500/[0.02]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
                      {job.posted_by_org}
                    </span>
                    <h3 className="text-base font-extrabold text-graphite-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                      {job.title}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-bold">
                    ⏱️ Min {job.min_experience} Years
                  </span>
                </div>

                <p className="text-xs text-graphite-550 dark:text-graphite-400 line-clamp-3 leading-relaxed">
                  {job.summary}
                </p>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-graphite-400 uppercase tracking-widest">
                    Required Skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-md bg-graphite-100 dark:bg-graphite-900 border border-graphite-200/50 dark:border-graphite-800 text-[10px] font-semibold text-graphite-700 dark:text-graphite-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {job.preferred_skills && job.preferred_skills.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-graphite-400 uppercase tracking-widest">
                      Preferred Nice-to-haves
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.preferred_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 rounded-md bg-indigo-500/[0.03] border border-indigo-500/10 text-[10px] font-medium text-indigo-600 dark:text-indigo-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-graphite-250/30 dark:border-graphite-850/30 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-graphite-400">
                  🎓 Degree: {job.education}
                </span>
                <button
                  onClick={() => {
                    setApplyingJob(job);
                    setSuccessMessage(null);
                    setParsedResult(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  🚀 Apply Instantly
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TRACK APPLICATIONS VIEWS */}
      {activeTab === "my-applications" && (
        <div className="space-y-5">
          {/* Email verification input */}
          <form
            onSubmit={handleEmailSearch}
            className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-white/40 dark:bg-graphite-950/20 border border-graphite-200/50 dark:border-graphite-850 backdrop-blur-md"
          >
            <div className="flex-1 space-y-1">
              <label className="block text-[10px] font-bold text-graphite-400 uppercase tracking-widest">
                Search & Sync Applications Email
              </label>
              <input
                type="email"
                required
                placeholder="candidate.seeker@google.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-graphite-900 border border-graphite-250 dark:border-graphite-800 text-xs font-semibold text-graphite-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 self-end bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
            >
              🔄 Refresh Pipeline Sync
            </button>
          </form>

          {candidateApplications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-graphite-250 dark:border-graphite-800 bg-white/20 dark:bg-graphite-900/10">
              <span className="text-4xl">📁</span>
              <h3 className="text-sm font-extrabold text-graphite-950 dark:text-white mt-3">
                No active applications found
              </h3>
              <p className="text-xs text-graphite-500 dark:text-graphite-400 mt-1 max-w-sm mx-auto leading-relaxed">
                We couldn't locate any applications linked to the email <span className="font-bold text-indigo-500">{emailInput || "above"}</span> yet. Try applying for one of our active jobs!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidateApplications.map((app) => {
                // Find matching job name
                const matchingJob = jobs.find((j) => j.id === app.job_id);
                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white/50 dark:bg-graphite-950/40 border border-white/20 dark:border-graphite-900 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-sm font-extrabold text-graphite-900 dark:text-white">
                          {matchingJob ? matchingJob.title : app.title}
                        </h4>
                        {getStageBadge(app.stage)}
                      </div>
                      <p className="text-[11px] text-graphite-550 dark:text-graphite-400">
                        Applicant: <span className="font-semibold text-graphite-800 dark:text-graphite-200">{app.name}</span> ({app.email})
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-graphite-400">
                        <span>📊 Synapse Match Score:</span>
                        <span className="font-bold text-indigo-500">{app.score}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-graphite-200 dark:bg-graphite-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${app.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-graphite-50 dark:bg-graphite-900/50 border border-graphite-200/50 dark:border-graphite-800 md:max-w-md">
                      <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
                        🎯 AI Application Summary
                      </div>
                      <p className="text-[10px] text-graphite-600 dark:text-graphite-400 italic leading-relaxed">
                        "{app.matchDetails.summary}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* APPLY MODAL OVERLAY */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-850 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                  Instantly Apply With AI Resume Parser
                </span>
                <h3 className="text-lg font-extrabold text-graphite-900 dark:text-white">
                  Apply for: {applyingJob.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setApplyingJob(null);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  setParsedResult(null);
                }}
                className="text-graphite-400 hover:text-graphite-600 dark:hover:text-white text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {successMessage ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  ✅ {successMessage}
                </div>

                {parsedResult && (
                  <div className="p-4 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/15 space-y-3">
                    <h4 className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest font-mono">
                      🤖 AI Parse & Matching Synapse Results
                    </h4>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-graphite-400 text-[10px] uppercase">Parsed Name</span>
                        <p className="font-semibold text-graphite-800 dark:text-white">{parsedResult.name}</p>
                      </div>
                      <div>
                        <span className="text-graphite-400 text-[10px] uppercase">Match Score</span>
                        <p className="font-bold text-indigo-500">{parsedResult.score}%</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-graphite-400 text-[10px] uppercase">AI Assessment Summary</span>
                      <p className="text-graphite-600 dark:text-graphite-300 italic leading-relaxed bg-white dark:bg-graphite-900 p-2.5 rounded-lg border border-graphite-200/50 dark:border-graphite-800">
                        "{parsedResult.matchDetails.summary}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-graphite-400 text-[10px] uppercase">Gaps Identified</span>
                        <ul className="list-disc pl-4 text-rose-500 space-y-0.5 mt-1 text-[11px]">
                          {parsedResult.matchDetails.gaps.map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-graphite-400 text-[10px] uppercase">Strengths Highlighted</span>
                        <ul className="list-disc pl-4 text-emerald-500 space-y-0.5 mt-1 text-[11px]">
                          {parsedResult.matchDetails.strengths.map((str, i) => (
                            <li key={i}>{str}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setApplyingJob(null);
                    setSuccessMessage(null);
                    setParsedResult(null);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close & View applications dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold leading-relaxed">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-graphite-500 dark:text-graphite-400 tracking-wider uppercase mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-graphite-900 border border-graphite-250 dark:border-graphite-800 text-xs font-semibold text-graphite-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-graphite-500 dark:text-graphite-400 tracking-wider uppercase mb-1.5">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="candidate.seeker@google.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-graphite-900 border border-graphite-250 dark:border-graphite-800 text-xs font-semibold text-graphite-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-graphite-500 dark:text-graphite-400 tracking-wider uppercase">
                    Upload Resume (PDF or TXT)
                  </label>
                  <div className="border-2 border-dashed border-graphite-250 dark:border-graphite-800 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors duration-300 relative group bg-graphite-50/50 dark:bg-graphite-900/30">
                    <input
                      type="file"
                      required
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <span className="text-3xl block group-hover:scale-110 transition-transform duration-300">📄</span>
                      <p className="text-xs font-semibold text-graphite-800 dark:text-graphite-200">
                        {selectedFile ? selectedFile.name : "Drag & drop or click to upload your resume"}
                      </p>
                      <p className="text-[10px] text-graphite-400">
                        Supports PDF and plain text up to 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-xl text-[10px] text-indigo-500 leading-relaxed font-medium">
                  💡 <span className="font-bold">Pro-Tip:</span> The AI will automatically evaluate your skill match score, experience alignment, and gap analysis matching the specific requirements of the <span className="font-bold">{applyingJob.title}</span> role instantly!
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className="flex-1 py-3 border border-graphite-250 dark:border-graphite-800 hover:bg-graphite-50 dark:hover:bg-graphite-900 text-graphite-700 dark:text-graphite-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 disabled:opacity-50"
                  >
                    {isApplying ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Resume with AI...
                      </>
                    ) : (
                      "🚀 Submit Application"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
