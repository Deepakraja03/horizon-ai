export interface HealthData {
  status: string;
  engine: string;
  providers: {
    gemini: boolean;
    groq: boolean;
  };
}

export interface ConfigData {
  active_llm_providers: {
    gemini: { active: boolean; models: string[] };
    groq: { active: boolean; models: string[] };
  };
  default_mode: string;
}

export type CandidateStage = "applied" | "screening" | "interview" | "offer" | "archived";

export interface MatchDetails {
  accuracy: number;
  seniorityIndex: number;
  gaps: string[];
  strengths: string[];
  summary: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  score: number;
  title: string;
  stage: CandidateStage;
  category: string;
  experience: number;
  skills: string[];
  education: string;
  matchDetails: MatchDetails;
  job_id?: string;
}

export interface ParsedJD {
  title: string;
  summary: string;
  min_experience: number;
  education: string;
  required_skills: string[];
  preferred_skills: string[];
}

export interface JobDescription {
  id: string;
  title: string;
  summary: string;
  min_experience: number;
  education: string;
  required_skills: string[];
  preferred_skills: string[];
  posted_by_org: string;
}
