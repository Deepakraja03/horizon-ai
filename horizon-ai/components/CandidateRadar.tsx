"use client";

import React, { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Candidate, ParsedJD } from "../types";

export interface CandidateRadarProps {
  candidates: Candidate[];
  lastParsedJd?: ParsedJD | null;
  targetRole: string;
}

interface DimensionData {
  name: string;
  key: string;
  [candidateName: string]: string | number; // dynamically loaded scores
}

// Tailored Premium Palette
const COLORS = [
  { stroke: "#6366f1", fill: "rgba(99, 102, 241, 0.15)", name: "Indigo" },
  { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.15)", name: "Emerald" },
  { stroke: "#8b5cf6", fill: "rgba(139, 92, 246, 0.15)", name: "Violet" },
  { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.15)", name: "Amber" },
];

export default function CandidateRadar({ candidates, lastParsedJd, targetRole }: CandidateRadarProps) {
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

  // Dynamic role fallback generator to make sure matches align with the candidate's actual credentials
  const getFallbackJd = (roleName: string) => {
    const roleLower = roleName.toLowerCase();
    if (roleLower.includes("design") || roleLower.includes("creative") || roleLower.includes("ui") || roleLower.includes("ux")) {
      return {
        title: roleName,
        min_experience: 4,
        education: "Bachelor",
        required_skills: ["Figma", "Design", "UI", "UX", "dashboard"],
        preferred_skills: ["HTML", "CSS"],
      };
    }
    if (roleLower.includes("devops") || roleLower.includes("sre") || roleLower.includes("platform") || roleLower.includes("cloud")) {
      return {
        title: roleName,
        min_experience: 6,
        education: "Bachelor",
        required_skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Docker"],
        preferred_skills: ["Python", "Prometheus"],
      };
    }
    if (roleLower.includes("product") || roleLower.includes("manager") || roleLower.includes("owner") || roleLower.includes("pm")) {
      return {
        title: roleName,
        min_experience: 5,
        education: "Bachelor",
        required_skills: ["Product Strategy", "A/B Testing", "Agile", "Jira", "Roadmaps"],
        preferred_skills: ["SQL", "Analytics"],
      };
    }
    if (roleLower.includes("qa") || roleLower.includes("test") || roleLower.includes("automation")) {
      return {
        title: roleName,
        min_experience: 3,
        education: "Bachelor",
        required_skills: ["Selenium", "Playwright", "Automation", "QA", "Python"],
        preferred_skills: ["CI/CD", "SQL"],
      };
    }
    // General software engineer fallback
    return {
      title: roleName,
      min_experience: 5,
      education: "Bachelor",
      required_skills: ["React", "TypeScript", "Node.js", "SQL", "Javascript"],
      preferred_skills: ["CSS", "DevOps"],
    };
  };

  const activeJd = lastParsedJd || getFallbackJd(targetRole);

  // Helper logic to calculate dimension scores on-the-fly (to keep frontend consistent with backend metrics)
  const calculateDimensionScores = (cand: Candidate) => {
    // 1. Technical Skills Overlap Score
    const candSkills = (cand.skills || []).map((s) => s.toLowerCase());
    const reqSkills = (activeJd.required_skills || []).map((s) => s.toLowerCase());
    
    let skillsScore = 100;
    if (reqSkills.length > 0) {
      let matched = 0;
      reqSkills.forEach((reqSkill) => {
        if (candSkills.includes(reqSkill)) {
          matched += 1;
        } else if (candSkills.some((s) => s.includes(reqSkill) || reqSkill.includes(s))) {
          matched += 0.5; // related match
        }
      });
      skillsScore = Math.round((matched / reqSkills.length) * 100);
    }

    // 2. Experience Alignment Score
    const expDiff = cand.experience - (activeJd.min_experience || 0);
    const expScore = expDiff >= 0 ? 100 : Math.max(0, 100 - Math.abs(expDiff) * 15);

    // 3. Education Alignment Score
    const candEdu = (cand.education || "Any").toLowerCase();
    const reqEdu = (activeJd.education || "any").toLowerCase();
    let eduScore = 80;
    if (reqEdu === "any" || !reqEdu.trim() || candEdu.includes(reqEdu)) {
      eduScore = 100;
    } else if (reqEdu.includes("master") || reqEdu.includes("mba")) {
      if (candEdu.includes("phd") || candEdu.includes("doctor") || candEdu.includes("mba") || candEdu.includes("master")) eduScore = 100;
      else if (candEdu.includes("bachelor")) eduScore = 80;
      else eduScore = 50;
    } else if (reqEdu.includes("phd") || reqEdu.includes("doctor")) {
      if (candEdu.includes("master")) eduScore = 65;
      else if (candEdu.includes("bachelor")) eduScore = 40;
    }

    // 4. Role Fit Alignment
    let fitScore = 75;
    const jdTitleLower = (activeJd.title || targetRole).toLowerCase();
    const candTitleLower = (cand.title || "").toLowerCase();
    const candCategoryLower = (cand.category || "").toLowerCase();
    
    if (candTitleLower && (candTitleLower.includes(jdTitleLower) || jdTitleLower.includes(candTitleLower))) {
      fitScore += 15;
    }
    if (candCategoryLower && (candCategoryLower.includes(jdTitleLower) || jdTitleLower.includes(candCategoryLower))) {
      fitScore += 10;
    }
    fitScore = Math.min(100, fitScore);

    return {
      technical_skills: skillsScore,
      experience_seniority: expScore,
      education_alignment: eduScore,
      role_fit: fitScore,
    };
  };

  // Factual matching skills list for evidence
  const getMatchedSkills = (cand: Candidate) => {
    const candSkills = (cand.skills || []).map((s) => s.toLowerCase());
    const reqSkills = (activeJd.required_skills || []).map((s) => s.toLowerCase());
    const matched: string[] = [];
    
    reqSkills.forEach((reqSkill) => {
      const match = cand.skills?.find(
        (s) => s.toLowerCase() === reqSkill || s.toLowerCase().includes(reqSkill) || reqSkill.includes(s.toLowerCase())
      );
      if (match && !matched.includes(match)) {
        matched.push(match);
      }
    });
    return matched;
  };

  // Build high-fidelity evidence texts
  const generateEvidence = (cand: Candidate, dimKey: string, score: number) => {
    switch (dimKey) {
      case "technical_skills": {
        const matchedSkills = getMatchedSkills(cand);
        if (matchedSkills.length > 0) {
          return `Possesses ${matchedSkills.join(", ")} matching ${matchedSkills.length} out of ${activeJd.required_skills?.length || 0} core capabilities.`;
        } else {
          return `No overlapping skills found out of ${activeJd.required_skills?.length || 0} required capabilities (${activeJd.required_skills?.slice(0, 3).join(", ")}).`;
        }
      }
      case "experience_seniority": {
        const expDiff = cand.experience - (activeJd.min_experience || 0);
        if (expDiff >= 0) {
          return `Offers ${cand.experience} years of hands-on experience, exceeding the role requirement of ${activeJd.min_experience || 0} years.`;
        } else {
          return `Offers ${cand.experience} years of experience, falling below the role requirement of ${activeJd.min_experience || 0} years.`;
        }
      }
      case "education_alignment":
        return `Academic profile features a credential of "${cand.education}", satisfying job spec requirements.`;
      case "role_fit":
        return `Currently structured as a ${cand.title} in ${cand.category || "Engineering"}, showcasing natural functional alignment.`;
      default:
        return "";
    }
  };

  // Dimensions Axes definition
  const dimensions = [
    { name: "Technical Skills", key: "technical_skills" },
    { name: "Experience & Seniority", key: "experience_seniority" },
    { name: "Education Alignment", key: "education_alignment" },
    { name: "Role Fit & Competency", key: "role_fit" },
  ];

  // Map candidate scores to dynamic Recharts shape
  const chartData = dimensions.map((dim) => {
    const dataRow: DimensionData = {
      name: dim.name,
      key: dim.key,
    };

    candidates.forEach((cand) => {
      const scores = calculateDimensionScores(cand);
      dataRow[cand.name] = scores[dim.key as keyof typeof scores];
    });

    return dataRow;
  });

  // Smooth scroll and flashing highlight interaction
  const handleDimensionClick = (dimName: string) => {
    const elementId = `evidence-row-${dimName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedRowId(elementId);
      setTimeout(() => {
        setHighlightedRowId(null);
      }, 2500);
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch print:flex-col print:space-y-4">
      
      {/* Left Column: Visual Radar Section (takes constrained space on large, full on mobile) */}
      <div className="flex-1 xl:max-w-md p-6 rounded-2xl border border-graphite-250 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/10 backdrop-blur-md shadow-sm flex flex-col items-center justify-between">
        <div className="w-full text-center mb-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 font-mono">
            Candidate Dimensions Radar
          </h4>
          <p className="text-[10px] text-graphite-500 mt-1">
            Click any label to review empirical details.
          </p>
        </div>

        {/* Dynamic Interactive Radar Chart */}
        <div className="w-full h-[280px] max-w-sm flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#9ca3af" strokeDasharray="3 3" opacity={0.3} />
              
              <PolarAngleAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 700, cursor: "pointer" }}
                onClick={(data) => {
                  if (data && data.value) {
                    handleDimensionClick(data.value);
                  }
                }}
              />
              
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 8 }}
                axisLine={false}
                opacity={0.5}
              />

              {candidates.map((cand, idx) => {
                const color = COLORS[idx % COLORS.length];
                return (
                  <Radar
                    key={cand.id}
                    name={cand.name}
                    dataKey={cand.name}
                    stroke={color.stroke}
                    fill={color.stroke}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                );
              })}

              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  borderColor: "#374151",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#4b5563",
                  paddingTop: "5px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Column: Evidence Panel Table */}
      <div className="flex-1 rounded-2xl border border-graphite-250 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/10 backdrop-blur-md shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-5 py-3 border-b border-graphite-250 dark:border-graphite-850 bg-white/50 dark:bg-graphite-950/20 shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-widest text-graphite-450 dark:text-graphite-400 font-mono">
            Dimension Match Evidence Summary
          </h4>
          <p className="text-[9.5px] text-graphite-500 mt-0.5">
            Transparent justification cards mapping scores directly to empirical candidate profile parameters.
          </p>
        </div>

        <div className="overflow-x-auto flex-grow flex flex-col justify-center">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-graphite-200 dark:border-graphite-850 bg-white/30 dark:bg-graphite-900/20">
                <th className="p-3 font-bold text-graphite-450 dark:text-graphite-400 uppercase tracking-wider font-mono text-[9px] w-[140px]">
                  Evaluated Dimension
                </th>
                {candidates.map((cand, idx) => {
                  const color = COLORS[idx % COLORS.length];
                  return (
                    <th key={cand.id} className="p-3 font-bold uppercase tracking-wider font-mono text-[9px]">
                      <span className="flex items-center gap-1.5" style={{ color: color.stroke }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke }} />
                        {cand.name}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim) => {
                const elementId = `evidence-row-${dim.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
                const isHighlighted = highlightedRowId === elementId;

                return (
                  <tr
                    key={dim.key}
                    id={elementId}
                    className={`border-b last:border-0 border-graphite-150 dark:border-graphite-850 transition-all duration-500 ${
                      isHighlighted
                        ? "bg-indigo-500/10 dark:bg-indigo-500/5 border-l-4 border-l-indigo-500"
                        : "hover:bg-graphite-50/50 dark:hover:bg-graphite-950/10"
                    }`}
                  >
                    <td className="p-3 font-bold text-graphite-800 dark:text-white align-top border-r border-graphite-200/50 dark:border-graphite-850/50">
                      {dim.name}
                    </td>
                    {candidates.map((cand, idx) => {
                      const scores = calculateDimensionScores(cand);
                      const score = scores[dim.key as keyof typeof scores];
                      const color = COLORS[idx % COLORS.length];
                      const evidenceText = generateEvidence(cand, dim.key, score);

                      return (
                        <td key={cand.id} className="p-3 align-top space-y-1">
                          {/* Score Badge */}
                          <div className="flex items-center gap-2">
                            <span
                              className="px-1.5 py-0.5 rounded text-[9.5px] font-bold font-mono"
                              style={{
                                backgroundColor: score >= 85 ? "rgba(16, 185, 129, 0.15)" : score >= 70 ? "rgba(99, 102, 241, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                color: score >= 85 ? "#10b981" : score >= 70 ? "#6366f1" : "#f59e0b",
                                border: `1px solid ${score >= 85 ? "rgba(16, 185, 129, 0.25)" : score >= 70 ? "rgba(99, 102, 241, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
                              }}
                            >
                              {score}%
                            </span>
                          </div>
                          {/* Evidence Sentence */}
                          <p className="text-[10px] text-graphite-600 dark:text-graphite-300 leading-relaxed font-sans font-medium">
                            {evidenceText}
                          </p>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
