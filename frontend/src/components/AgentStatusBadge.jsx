import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

export const AgentStatusBadge = () => {
  const { isRunning, triggerPipeline } = useAgent();

  if (isRunning) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold animate-pulse border border-brand-500/20">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-500" />
        <span>Searching public sources...</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => triggerPipeline(true)}
      title="Discover new matched scholarships, hackathons & internships"
      className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-98"
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
      <span>Find New Opportunities</span>
    </button>
  );
};
