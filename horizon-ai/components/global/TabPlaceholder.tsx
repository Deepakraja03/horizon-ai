import React from "react";

export interface TabPlaceholderProps {
  activeTab: string;
}

export default function TabPlaceholder({ activeTab }: TabPlaceholderProps) {
  return (
    <div className="p-12 rounded-2xl glass-panel text-center animate-fade-in border-graphite-200 dark:border-graphite-800">
      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase block mb-2">
        Sprint Milestone
      </span>
      <h2 className="text-lg font-bold text-graphite-900 dark:text-white block mb-1 font-display">
        {activeTab === "pipeline" && "Day 3 Candidate Pipeline Component"}
        {activeTab === "jd-parser" && "Day 5 Job Description Analysis Engine"}
        {activeTab === "compare" && "Day 6 Multi-Candidate Comparison Board"}
      </h2>
      <p className="text-xs text-graphite-500 dark:text-graphite-400 max-w-sm mx-auto leading-relaxed mb-6">
        This layout tab is scheduled for subsequent steps. Follow along the live progression tracking file to check off
        completed checklist items!
      </p>
      <a
        href="/tracker.html"
        className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white inline-block shadow-lg shadow-indigo-600/10 dark:shadow-indigo-600/20 transition cursor-pointer"
      >
        Open Interactive Roadmap Tracker
      </a>
    </div>
  );
}
