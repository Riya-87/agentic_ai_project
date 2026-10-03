import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

export const MatchBadge = ({ match, size = 'md', showDropdown = true }) => {
  const [open, setOpen] = useState(false);
  const score = Math.round(match?.overall_match || 0);

  let textColor = 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
  let dotColor = 'bg-slate-400';

  if (score >= 85) {
    textColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60';
    dotColor = 'bg-emerald-500';
  } else if (score >= 70) {
    textColor = 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60';
    dotColor = 'bg-blue-500';
  } else if (score >= 50) {
    textColor = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60';
    dotColor = 'bg-amber-500';
  }

  const isSmall = size === 'sm';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          if (showDropdown) {
            e.stopPropagation();
            setOpen(!open);
          }
        }}
        className={`flex items-center gap-1.5 rounded-lg font-medium transition-all ${textColor} ${
          isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span>{score}% Match</span>
        {showDropdown && (
          <ChevronDown className={`w-3 h-3 transition-transform text-slate-400 ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && showDropdown && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-72 sm:w-80 z-40 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in text-slate-800 dark:text-slate-100 text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Match Breakdown
              </span>
              <span className="font-bold text-brand-600 dark:text-brand-400">
                {score}% Overall
              </span>
            </div>

            {/* Score Breakdown Bars */}
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Skills</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{Math.round(match?.skill_match || 0)}%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Eligibility</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{Math.round(match?.eligibility_match || 0)}%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Interest</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{Math.round(match?.interest_match || 0)}%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Academic Fit</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{Math.round(match?.academic_year_match || 100)}%</span>
              </div>
            </div>

            {/* Matched Skills */}
            {match?.matched_skills?.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                  Matched Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {match.matched_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {match?.missing_skills?.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                  Missing Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {match.missing_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]"
                    >
                      ○ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

