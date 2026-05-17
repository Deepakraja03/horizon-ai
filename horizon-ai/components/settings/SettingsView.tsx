import React from "react";
import { HealthData } from "../../types";

export interface SettingsViewProps {
  apiHealth: HealthData | null;
  selectedProvider: string;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  systemPrompt: string;
  setSystemPrompt: (val: string) => void;
  handleProviderSelect: (provider: string) => void;
  testPrompt: string;
  setTestPrompt: (val: string) => void;
  testResponse: string;
  executingPrompt: boolean;
  promptError: string | null;
  handleTestPrompt: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function SettingsView({
  apiHealth,
  selectedProvider,
  selectedModel,
  setSelectedModel,
  systemPrompt,
  setSystemPrompt,
  handleProviderSelect,
  testPrompt,
  setTestPrompt,
  testResponse,
  executingPrompt,
  promptError,
  handleTestPrompt,
}: SettingsViewProps) {
  return (
    <div className="space-y-6 animate-fade-in text-graphite-900 dark:text-graphite-100">
      <style>{`
        button, [role="button"], .cursor-pointer {
          cursor: pointer !important;
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Provider Panel */}
          <div className="p-5 rounded-xl border border-graphite-200/60 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/30 backdrop-blur-md shadow-sm">
            <h3 className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 tracking-widest uppercase mb-4 font-display">
              Core Provider
            </h3>

            <div className="space-y-2.5">
              {/* Gemini option */}
              <div
                onClick={() => handleProviderSelect("gemini")}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                  selectedProvider === "gemini"
                    ? "bg-indigo-500/[0.03] dark:bg-indigo-500/[0.04] border-indigo-500/80 shadow-sm"
                    : "bg-transparent border-graphite-200/50 dark:border-graphite-850 hover:border-graphite-300 dark:hover:border-graphite-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedProvider === "gemini" ? "bg-indigo-500" : "bg-graphite-300 dark:bg-graphite-700"}`} />
                  <span className="text-xs font-semibold tracking-tight">Google Gemini</span>
                </div>
                <span className="text-[9px] font-mono text-graphite-400">
                  {apiHealth?.providers.gemini ? "connected" : "offline"}
                </span>
              </div>

              {/* Groq option */}
              <div
                onClick={() => handleProviderSelect("groq")}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                  selectedProvider === "groq"
                    ? "bg-indigo-500/[0.03] dark:bg-indigo-500/[0.04] border-indigo-500/80 shadow-sm"
                    : "bg-transparent border-graphite-200/50 dark:border-graphite-850 hover:border-graphite-300 dark:hover:border-graphite-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedProvider === "groq" ? "bg-indigo-500" : "bg-graphite-300 dark:bg-graphite-700"}`} />
                  <span className="text-xs font-semibold tracking-tight">Groq LPU AI</span>
                </div>
                <span className="text-[9px] font-mono text-graphite-400">
                  {apiHealth?.providers.groq ? "connected" : "offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="p-5 rounded-xl border border-graphite-200/60 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/30 backdrop-blur-md space-y-4.5 shadow-sm">
            <div>
              <label className="block text-[9px] font-bold text-graphite-400 dark:text-graphite-500 tracking-wider uppercase mb-1.5 font-mono">
                Model ID
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedModel(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-lg bg-white/60 dark:bg-graphite-950/60 border border-graphite-200/60 dark:border-graphite-850 text-xs font-medium text-graphite-800 dark:text-graphite-200 focus:outline-none focus:border-indigo-500/80 appearance-none transition-colors"
                >
                  {selectedProvider === "gemini" ? (
                    <>
                      <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    </>
                  ) : (
                    <>
                      <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                      <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                    </>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-graphite-400">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-graphite-400 dark:text-graphite-500 tracking-wider uppercase mb-1.5 font-mono">
                System Instructions
              </label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSystemPrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-graphite-950/60 border border-graphite-200/60 dark:border-graphite-850 text-xs text-graphite-800 dark:text-graphite-200 focus:outline-none focus:border-indigo-500/80 transition-colors leading-relaxed font-mono"
                placeholder="Core role guidelines..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sleek Minimal Playground */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-xl border border-graphite-200/60 dark:border-graphite-850 bg-white/40 dark:bg-graphite-900/30 backdrop-blur-md flex flex-col h-full justify-between shadow-sm">
            <div className="w-full flex flex-col h-full">
              {/* Header block */}
              <div className="flex items-center justify-between border-b border-graphite-200/40 dark:border-graphite-850/50 pb-3.5 mb-5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-graphite-400 dark:text-graphite-500 tracking-widest uppercase font-display">
                    Interactive Playground
                  </span>
                </div>
                
                {/* Active Model Monospace Tag */}
                <div className="px-2 py-0.5 rounded bg-graphite-100 dark:bg-graphite-950 border border-graphite-200/50 dark:border-graphite-850">
                  <span className="text-[8px] font-mono tracking-tight text-graphite-500 dark:text-graphite-450">
                    {selectedProvider} • {selectedModel}
                  </span>
                </div>
              </div>

              {/* Form Input block */}
              <form onSubmit={handleTestPrompt} className="space-y-3">
                <textarea
                  rows={2}
                  required
                  value={testPrompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestPrompt(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Enter a validation prompt..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/60 dark:bg-graphite-950/60 border border-graphite-200/60 dark:border-graphite-850 focus:border-indigo-500/80 focus:outline-none text-xs text-graphite-800 dark:text-graphite-200 transition-colors leading-relaxed font-sans shadow-sm"
                />
                <p className="text-[9px] text-graphite-400 dark:text-graphite-500 font-mono tracking-tight flex items-center gap-1.5">
                  <span className="text-indigo-500 font-bold">↵ Enter</span> to run execution • <span className="text-graphite-500 font-bold">⇧↵ Shift+Enter</span> for new line
                </p>
              </form>

              {/* Output Monitor */}
              <div className="mt-5 flex-1 flex flex-col">
                <label className="block text-[9px] font-bold text-graphite-400 dark:text-graphite-500 tracking-wider uppercase mb-2 font-mono">
                  Completion Stream
                </label>

                <div className={`flex-1 min-h-[140px] p-4 rounded-lg border text-xs leading-relaxed relative transition-all duration-300 font-mono ${
                  executingPrompt 
                    ? "bg-indigo-500/[0.01] border-indigo-500/30 text-indigo-500/80 animate-pulse" 
                    : promptError
                    ? "bg-rose-500/[0.01] border-rose-500/30 text-rose-500"
                    : "bg-white/60 dark:bg-graphite-950/60 border-graphite-200/60 dark:border-graphite-850 text-graphite-700 dark:text-graphite-300 shadow-inner"
                }`}>
                  {testResponse ? (
                    <div className="whitespace-pre-wrap font-sans text-graphite-800 dark:text-graphite-200 text-[11px] leading-relaxed relative pl-0.5">
                      {testResponse}
                      <span className="inline-block w-1.5 h-3 bg-indigo-500 ml-1 animate-pulse" />
                    </div>
                  ) : promptError ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="text-[9px] font-bold tracking-wider uppercase text-rose-500">
                        validation_error
                      </div>
                      <div className="text-[10px] leading-relaxed text-rose-500 font-medium">
                        {promptError}
                      </div>
                    </div>
                  ) : executingPrompt ? (
                    <div className="h-full flex flex-col justify-center items-center py-6 text-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-indigo-500 animate-ping" />
                        <span className="text-[9px] font-bold tracking-wider uppercase text-indigo-500/80">
                          querying response stream...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center py-8 text-center gap-1.5 opacity-70">
                      <span className="text-[9px] font-bold text-graphite-400 dark:text-graphite-550 uppercase tracking-widest">
                        awaiting command
                      </span>
                      <span className="text-[8.5px] text-graphite-400 dark:text-graphite-550 max-w-xs font-sans leading-relaxed">
                        Input validator text in prompt block and press Enter to query selected core model.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
