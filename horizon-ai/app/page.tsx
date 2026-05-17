"use client";

import React, { useState, useEffect } from "react";
import { HealthData, ConfigData, Candidate, CandidateStage, ParsedJD, JobDescription } from "../types";
import { supabase } from "../lib/supabaseClient";

// Import Modularized Components
import LoginForm from "../components/auth/LoginForm";
import Sidebar from "../components/global/Sidebar";
import Header from "../components/global/Header";
import TabPlaceholder from "../components/global/TabPlaceholder";
import DashboardView from "../components/dashboard/DashboardView";
import SettingsView from "../components/settings/SettingsView";
import PipelineView from "../components/pipeline/PipelineView";
import JDParserView from "../components/jd/JDParserView";
import CompareView from "../components/compare/CompareView";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  // Theme control state (LIGHT by default)
  const [theme, setTheme] = useState<string>("light");

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [role, setRole] = useState<"org" | "candidate">("org");

  // JDs and Applications states
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [activeJob, setActiveJob] = useState<JobDescription | null>(null);
  const [candidateApplications, setCandidateApplications] = useState<Candidate[]>([]);
  const [applyingJob, setApplyingJob] = useState<JobDescription | null>(null);
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [isUploadingApplication, setIsUploadingApplication] = useState<boolean>(false);
  const [candidateNameInput, setCandidateNameInput] = useState<string>("");
  const [candidateEmailInput, setCandidateEmailInput] = useState<string>("");
  const [applicationSuccessMsg, setApplicationSuccessMsg] = useState<string | null>(null);

  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Backend connection status states
  const [apiHealth, setApiHealth] = useState<HealthData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [checkingApi, setCheckingApi] = useState<boolean>(false);

  // AI Settings state
  const [selectedProvider, setSelectedProvider] = useState<string>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [systemPrompt, setSystemPrompt] = useState<string>("You are an elite talent acquisition AI helper.");
  const [lastParsedJd, setLastParsedJd] = useState<ParsedJD | null>(null);

  // Prompt tester state
  const [testPrompt, setTestPrompt] = useState<string>(
    "Explain in two sentences what makes a software engineer candidate stand out from a resume."
  );
  const [testResponse, setTestResponse] = useState<string>("");
  const [executingPrompt, setExecutingPrompt] = useState<boolean>(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  // Pipeline Candidates State
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "c1",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      score: 92,
      title: "Senior Backend Engineer",
      stage: "applied",
      category: "Engineering",
      experience: 6,
      skills: ["Node.js", "Go", "PostgreSQL", "Redis", "Kafka"],
      education: "BS Computer Science",
      matchDetails: {
        accuracy: 92,
        seniorityIndex: 8,
        gaps: ["Frontend Frameworks", "GraphQL"],
        strengths: ["Scale architecture", "Distributed caching", "Microservices"],
        summary: "Exceptional system design skills. Built microservices scaled to 5M daily users. Highly recommended for the core infrastructure team.",
      },
    },
    {
      id: "c2",
      name: "Sofia Chen",
      email: "sofia.c@example.com",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
      score: 88,
      title: "Fullstack Engineer",
      stage: "screening",
      category: "Engineering",
      experience: 4,
      skills: ["React", "TypeScript", "Node.js", "Tailwind"],
      education: "MS Software Engineering",
      matchDetails: {
        accuracy: 88,
        seniorityIndex: 6,
        gaps: ["Docker deployment", "Kubernetes"],
        strengths: ["State management", "DB performance tuning", "UI craft"],
        summary: "Strong UI craft and deep understanding of modern web performance. Needs slight ramp-up on advanced DevOps.",
      },
    },
    {
      id: "c3",
      name: "Marcus Vance",
      email: "mvance@example.com",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
      score: 85,
      title: "Product Manager",
      stage: "interview",
      category: "Product",
      experience: 5,
      skills: ["Product Strategy", "A/B Testing", "Agile", "Jira"],
      education: "MBA",
      matchDetails: {
        accuracy: 85,
        seniorityIndex: 7,
        gaps: ["SQL query writing", "Technical architecture"],
        strengths: ["Product roadmap strategy", "A/B testing analytics", "Stakeholder management"],
        summary: "Proven record of growing user engagement by 40% in a B2B SaaS startup. Excellent product intuition.",
      },
    },
    {
      id: "c4",
      name: "Elena Rostova",
      email: "elena.r@example.com",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704a",
      score: 95,
      title: "DevOps Engineer",
      stage: "offer",
      category: "DevOps",
      experience: 8,
      skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
      education: "BS Computer Science",
      matchDetails: {
        accuracy: 95,
        seniorityIndex: 9,
        gaps: ["Python coding expertise"],
        strengths: ["Terraform IaC", "CI/CD orchestration", "Zero-downtime migrations"],
        summary: "Architected zero-downtime migrations of 200+ container instances on AWS. Absolute perfect fit for the platform team.",
      },
    },
    {
      id: "c5",
      name: "Jordan Miller",
      email: "jordan.m@example.com",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704b",
      score: 89,
      title: "UI/UX Designer",
      stage: "interview",
      category: "Design",
      experience: 4,
      skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
      education: "BFA Interaction Design",
      matchDetails: {
        accuracy: 89,
        seniorityIndex: 5,
        gaps: ["HTML/JS implementation"],
        strengths: ["Prototyping", "Design system consistency", "User empathy"],
        summary: "Designed SaaS application dashboards featured in TechCrunch. Highly pixel-perfect execution.",
      },
    },
    {
      id: "c6",
      name: "Liam Gallagher",
      email: "liam.g@example.com",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704c",
      score: 78,
      title: "Frontend Developer",
      stage: "screening",
      category: "Engineering",
      experience: 2,
      skills: ["React", "CSS", "JavaScript"],
      education: "Bootcamp Graduate",
      matchDetails: {
        accuracy: 78,
        seniorityIndex: 3,
        gaps: ["GraphQL", "Next.js App Router", "Advanced state management"],
        strengths: ["Clean markup", "Tailwind CSS"],
        summary: "Mid-level frontend engineer eager to learn. Good CSS craft but needs strong mentorship in React patterns.",
      },
    }
  ]);

  const handleUpdateStage = (candidateId: string, newStage: CandidateStage) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
    // Persist to SQLite/Supabase in the background
    void fetch(`${API_BASE_URL}/api/candidates/${candidateId}/stage`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stage: newStage }),
    });
  };

  const handleNewCandidate = (candidate: Candidate) => {
    setCandidates((prev) => [
      ...prev.filter((c) => c.id !== candidate.id),
      candidate,
    ]);
  };

  // Load candidates specifically linked to the active job
  const loadCandidatesForJob = async (jobId?: string) => {
    try {
      const url = jobId
        ? `${API_BASE_URL}/api/candidates?job_id=${encodeURIComponent(jobId)}`
        : `${API_BASE_URL}/api/candidates`;
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as Candidate[];
        setCandidates(data);
      }
    } catch (err) {
      console.error("Failed to load candidates for job:", err);
    }
  };

  // Sync candidate lists whenever the active job choice changes
  useEffect(() => {
    if (activeJob) {
      void loadCandidatesForJob(activeJob.id);
    } else {
      void loadCandidatesForJob();
    }
  }, [activeJob]);

  // Check backend health & configurations
  const checkBackendHealth = async () => {
    setCheckingApi(true);
    try {
      // Fetch Health
      const healthRes = await fetch(`${API_BASE_URL}/api/health`);
      if (healthRes.ok) {
        const health = (await healthRes.json()) as HealthData;
        setApiHealth(health);
      }

      // Fetch Config
      const configRes = await fetch(`${API_BASE_URL}/api/config`);
      if (configRes.ok) {
        const config = (await configRes.json()) as ConfigData;
        setConfigData(config);

        // Auto-select active provider
        if (config.default_mode !== "none") {
          setSelectedProvider(config.default_mode);
          setSelectedModel(
            config.default_mode === "gemini" ? "gemini-2.5-flash" : "llama-3.3-70b-versatile"
          );
        }
      }

      // Fetch active jobs list first
      await fetchJobs();
      
      // Fetch Candidates from Database
      if (activeJob) {
        await loadCandidatesForJob(activeJob.id);
      } else {
        const candRes = await fetch(`${API_BASE_URL}/api/candidates`);
        if (candRes.ok) {
          const data = (await candRes.json()) as Candidate[];
          setCandidates(data);
        }
      }
    } catch (err) {
      console.error("FastAPI Backend Offline:", err);
      setApiHealth(null);
      setConfigData(null);
    } finally {
      setCheckingApi(false);
    }
  };

  // Sync theme and state on mount
  useEffect(() => {
    // 1. Theme initialization (Default to Light)
    const savedTheme = localStorage.getItem("theme") || "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 2. Fetch available jobs posted in the DB
    void fetchJobs();

    // 3. Monitor active Supabase session changes
    if (supabase) {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          const userEmail = session.user.email || "google-user@horizon.ai";
          setEmail(userEmail);
          const cachedRole = localStorage.getItem("horizon_auth_role") as "org" | "candidate" | null;
          if (cachedRole) {
            setRole(cachedRole);
            if (cachedRole === "candidate") {
              void fetchCandidateApplications(userEmail);
            }
          }
          void checkBackendHealth();
        }
        setLoadingSession(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          const userEmail = session.user.email || "google-user@horizon.ai";
          setEmail(userEmail);
          const cachedRole = localStorage.getItem("horizon_auth_role") as "org" | "candidate" | null;
          if (cachedRole) {
            setRole(cachedRole);
            if (cachedRole === "candidate") {
              void fetchCandidateApplications(userEmail);
            }
          }
          void checkBackendHealth();
        } else {
          setIsAuthenticated(false);
        }
        setLoadingSession(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // 4. Fetch health checks
      void checkBackendHealth();
      setLoadingSession(false);
    }
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Fetch all jobs in the database
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      if (response.ok) {
        const data = await response.json() as JobDescription[];
        // Keeping activeJob null by default to select 'All Posted Roles' and load all candidates first
        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to load jobs list:", err);
    }
  };

  // Fetch candidate applications list for candidates dashboard
  const fetchCandidateApplications = async (userEmail: string) => {
    if (!userEmail) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates/applications?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json() as Candidate[];
        setCandidateApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch candidate applications:", err);
    }
  };

  // Handle live Supabase Google OAuth Trigger
  const handleGoogleSignIn = async () => {
    setLoggingIn(true);
    setLoginError(null);

    // Save selected role in cache to recover after Google Redirect callback completes
    localStorage.setItem("horizon_auth_role", role);

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
      } catch (err: unknown) {
        setLoggingIn(false);
        setLoginError(err instanceof Error ? err.message : "Supabase Google OAuth connection failed.");
      }
    } else {
      // Elegant local sandbox redirect simulation if Supabase env credentials are not configured yet
      setTimeout(() => {
        setIsAuthenticated(true);
        setLoggingIn(false);
        const mockEmail = role === "org" ? "lead.recruiter@horizon.ai" : "candidate.seeker@google.com";
        setEmail(mockEmail);
        if (role === "candidate") {
          void fetchCandidateApplications(mockEmail);
        }
        void checkBackendHealth();
      }, 1500);
    }
  };

  // Handle LLM testing calls
  const handleTestPrompt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting prompt test request:", {
      testPrompt,
      selectedProvider,
      selectedModel,
      systemPrompt,
    });
    setExecutingPrompt(true);
    setTestResponse("");
    setPromptError(null);

    const run = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/test-prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: testPrompt,
            provider: selectedProvider,
            model_name: selectedModel,
            system_instruction: systemPrompt,
          }),
        });

        const data = (await response.json()) as { response?: string; detail?: string };
        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch response from AI engine");
        }

        console.log("Prompt response successful:", data.response);
        setTestResponse(data.response || "");
      } catch (err: unknown) {
        console.error("AI Testing Error:", err);
        setPromptError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setExecutingPrompt(false);
      }
    };

    void run();
  };

  // Auto-switch models when changing providers
  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    if (provider === "gemini") {
      setSelectedModel("gemini-2.5-flash");
    } else {
      setSelectedModel("llama-3.3-70b-versatile");
    }
  };

  // Logout reset
  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab("dashboard");
    setTestResponse("");
    setPromptError(null);
    if (supabase) void supabase.auth.signOut();
    localStorage.removeItem("horizon_auth_role");
  };

  // Render high-fidelity loading placeholder during active session mounts
  if (loadingSession) {
    return (
      <div className="min-h-screen w-screen bg-graphite-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Premium Glow Blurs */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>

        <div className="text-center space-y-4 relative z-10">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center font-bold text-white shadow-2xl shadow-indigo-500/30 font-display text-2xl animate-bounce">
            H
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white font-display">
            Horizon AI
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs text-graphite-400 font-mono font-medium">
            <svg className="animate-spin h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Restoring Secure Session...
          </div>
        </div>
      </div>
    );
  }

  // Render Login view if unauthenticated
  if (!isAuthenticated) {
    return (
      <LoginForm
        role={role}
        setRole={setRole}
        loggingIn={loggingIn}
        handleGoogleSignIn={handleGoogleSignIn}
        loginError={loginError}
      />
    );
  }

  // Import CandidatePortalView dynamically
  const CandidatePortalView = require("../components/candidate/CandidatePortalView").default;

  // Render Candidate Seeker Workspace
  if (role === "candidate") {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-transparent transition-colors duration-300">
        {/* Candidate Top Header */}
        <header className="px-6 py-4 border-b border-graphite-200/50 dark:border-graphite-800 flex items-center justify-between bg-white/40 dark:bg-graphite-950/40 backdrop-blur-xl relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 font-display text-sm">
              H
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-graphite-900 dark:text-white leading-none">Horizon Careers</h1>
              <span className="text-[10px] text-graphite-500 dark:text-graphite-400 mt-0.5 block">Welcome, {email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggler */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-graphite-250 dark:border-graphite-800 flex items-center justify-center hover:bg-graphite-100 dark:hover:bg-graphite-900 transition-colors cursor-pointer"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 text-[10.5px] font-bold transition-all duration-300 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="max-w-6xl mx-auto">
            <CandidatePortalView
              jobs={jobs}
              candidateEmail={email}
              candidateApplications={candidateApplications}
              onRefreshApplications={fetchCandidateApplications}
              apiBaseUrl={API_BASE_URL}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
            />
          </div>
        </main>
      </div>
    );
  }

  // Compute live real-time statistics from active Supabase database data
  const liveCandidatesCount = candidates.length;
  const liveJobsCount = jobs.length;
  const liveAverageScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
    : 0;

  // Render Recruiter Dashboard Home after login
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent transition-colors duration-300">
      {/* Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      {/* Main viewport area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-6 lg:p-8 relative">
        {/* Glow Blurs */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Top Header Panel */}
        <Header
          activeTab={activeTab}
          theme={theme}
          toggleTheme={toggleTheme}
          apiHealth={apiHealth}
          checkingApi={checkingApi}
          checkBackendHealth={checkBackendHealth}
          jobs={jobs}
          activeJob={activeJob}
          setActiveJob={setActiveJob}
        />

        {/* Scrollable View Content wrapper */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <DashboardView
              apiHealth={apiHealth}
              checkingApi={checkingApi}
              setActiveTab={setActiveTab}
              candidatesCount={liveCandidatesCount}
              jobsCount={liveJobsCount}
              averageScore={liveAverageScore}
            />
          )}

          {/* Dynamic Model Switcher Settings Tab */}
          {activeTab === "settings" && (
            <SettingsView
              apiHealth={apiHealth}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
              handleProviderSelect={handleProviderSelect}
              testPrompt={testPrompt}
              setTestPrompt={setTestPrompt}
              testResponse={testResponse}
              executingPrompt={executingPrompt}
              promptError={promptError}
              handleTestPrompt={handleTestPrompt}
            />
          )}

          {/* Pipeline & Analytics Tab */}
          {activeTab === "pipeline" && (
            <PipelineView
              candidates={candidates}
              jobs={jobs}
              handleUpdateStage={handleUpdateStage}
              handleNewCandidate={handleNewCandidate}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
            />
          )}

          {/* Job Description Structured Parser Tab (Day 5) */}
          {activeTab === "jd-parser" && (
            <JDParserView
              onUpdateCandidates={handleNewCandidate}
              onJdParsed={(parsed) => {
                setLastParsedJd(parsed);
                void fetchJobs(); // Refresh jobs list from Supabase!
              }}
              provider={selectedProvider}
              modelName={selectedModel}
            />
          )}

          {/* Multi-Candidate Compare Mode (Day 6) */}
          {activeTab === "compare" && (
            <CompareView
              key={lastParsedJd ? lastParsedJd.title : "compare"}
              candidates={candidates}
              lastParsedJd={lastParsedJd}
              provider={selectedProvider}
              modelName={selectedModel}
            />
          )}

          {/* Tab Placeholders */}
          {activeTab !== "dashboard" &&
            activeTab !== "settings" &&
            activeTab !== "pipeline" &&
            activeTab !== "jd-parser" &&
            activeTab !== "compare" && (
              <TabPlaceholder activeTab={activeTab} />
            )}
        </div>
      </main>
    </div>
  );
}
