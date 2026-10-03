import React, { useState } from 'react';
import { Award, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const ProfileStrengthMeter = ({ strengthData, onNavigateProfile }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const score = strengthData?.score || 70;
  const level = strengthData?.level || 'Advanced';
  const categories = strengthData?.categories || [];
  const recommendations = strengthData?.missing_recommendations || [];
  const suggestedSkills = strengthData?.suggested_skills || [];

  let barColor = 'from-amber-500 to-orange-500';
  if (score >= 85) barColor = 'from-emerald-500 to-teal-500';
  else if (score >= 70) barColor = 'from-brand-500 to-indigo-500';

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Profile Match Power</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold">
                Dynamic 6-Tier Matrix
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Higher score boosts precision for AI ranking & opportunity recommendations
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{score}%</span>
          <span className="ml-2 px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase">
            {level}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700 shadow-sm`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* 6-Part Category Breakdown Grid (Toggleable) */}
      {categories.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-colors py-1"
          >
            <span>6-Dimensional Strength Breakdown</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-slate-400">
                {showBreakdown ? 'Hide details' : 'View breakdown'}
              </span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showBreakdown && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
              {categories.map((cat, idx) => {
                const pct = Math.round((cat.earned_points / (cat.max_points || 1)) * 100);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {cat.name}
                      </span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {cat.earned_points}/{cat.max_points}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-brand-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actionable recommendations */}
      {recommendations.length > 0 ? (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Recommended Profile Boosts:</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec, rIdx) => (
              <span
                key={rIdx}
                className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[11px] font-medium"
              >
                + {rec}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile is at maximum matching power (100%) for optimal ranking!</span>
        </div>
      )}
    </div>
  );
};
