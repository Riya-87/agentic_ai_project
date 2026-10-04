import React from 'react';
import { ArrowRight, Bookmark, BookmarkCheck, ShieldCheck, Calendar, Award } from 'lucide-react';

export const OpportunityCard = ({
  opportunity,
  match,
  isSaved,
  savedStatus,
  onSave,
  onOpenDetail
}) => {
  const opp = opportunity;

  // Harmonious gradients matching the Webbble tactile aesthetic
  const getCategoryStyle = (cat = '', title = '') => {
    const text = `${cat} ${title}`.toLowerCase();

    if (text.includes('scholarship') || text.includes('merit') || text.includes('grant')) {
      return {
        badge: 'SCHOLAR',
        bg: 'bg-gradient-to-br from-[#FCD692] via-[#F9B95C] to-[#E99E37]', // Peche
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-900',
      };
    }
    if (text.includes('fellowship') || text.includes('research') || text.includes('phd') || text.includes('lab')) {
      return {
        badge: 'FELLOW',
        bg: 'bg-gradient-to-br from-[#EEA399] via-[#D7897F] to-[#C06F65]', // Nectarine
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-900',
      };
    }
    if (text.includes('hackathon') || text.includes('challenge') || text.includes('code') || text.includes('build')) {
      return {
        badge: 'HACK',
        bg: 'bg-gradient-to-br from-[#A2E048] via-[#8CCB2D] to-[#71AC19]', // Lime Green
        badgeBg: 'bg-white text-slate-950',
        textColor: 'text-slate-950',
      };
    }
    if (text.includes('job') || text.includes('full-time') || text.includes('engineer')) {
      return {
        badge: 'JOB',
        bg: 'bg-gradient-to-br from-[#4FC3A1] via-[#2EB88A] to-[#1E9B71]', // Emerald
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-white',
      };
    }
    if (text.includes('competition') || text.includes('tournament') || text.includes('prize')) {
      return {
        badge: 'COMP',
        bg: 'bg-gradient-to-br from-[#C7B9F8] via-[#B29DF4] to-[#997EEA]', // Soft Lavender
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-900',
      };
    }
    if (text.includes('conference') || text.includes('summit') || text.includes('open source')) {
      return {
        badge: 'OPEN',
        bg: 'bg-gradient-to-br from-[#C4E1EC] via-[#A8D3E3] to-[#86BCDA]', // Pastel Lagune
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-900',
      };
    }
    // Default to Internship (Ocean Blue)
    return {
      badge: 'INTERN',
      bg: 'bg-gradient-to-br from-[#40A8E3] via-[#2092D8] to-[#1272B5]', // Ocean Blue
      badgeBg: 'bg-white text-slate-900',
      textColor: 'text-white',
    };
  };

  const style = getCategoryStyle(opp.category, opp.title);

  const formattedDeadline = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Rolling';

  const stipendDisplay = opp.stipend_or_prize || (opp.is_free ? 'Free / Funded' : 'Mentorship & Perks');

  return (
    <div
      onClick={onOpenDetail}
      className={`group relative rounded-[28px] ${style.bg} p-6 shadow-md hover:shadow-2xl transition-all duration-300 card-tactile flex flex-col justify-between min-h-[230px] overflow-hidden select-none border border-black/5 cursor-pointer`}
    >
      {/* Topographic Guilloche Contour Wave Pattern Overlay */}
      <div className="absolute inset-0 contour-guilloche opacity-90 transition-transform duration-700 group-hover:scale-105 pointer-events-none" />
      <div className="absolute inset-0 contour-lines-overlay opacity-60 pointer-events-none" />

      {/* Ambient glass highlight */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Top Row: Category Initial Badge & Match Pill + Bookmark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Category Initial Pill Badge */}
            <div className={`px-2.5 py-1.5 rounded-xl ${style.badgeBg} flex items-center justify-center font-extrabold text-[11px] shadow-md tracking-wider transition-transform group-hover:scale-105`}>
              <span>{style.badge}</span>
            </div>
            {opp.verification_status === 'VERIFIED' && (
              <span className="p-1 rounded-full bg-black/10 text-slate-900 backdrop-blur-sm" title="Verified Opportunity">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end" onClick={(e) => e.stopPropagation()}>
            {match && (
              <>
                <span className="px-2.5 py-1 rounded-full bg-white/30 backdrop-blur-md text-slate-900 text-[11px] font-extrabold shadow-sm border border-white/30">
                  {Math.round(match.overall_match || 88)}% Match
                </span>
                {match.eligibility_status && (
                  <span className="px-2 py-0.5 rounded-full bg-black/15 backdrop-blur-md text-slate-900 text-[9px] font-extrabold uppercase tracking-wider">
                    {match.eligibility_status}
                  </span>
                )}
              </>
            )}
            <button
              type="button"
              onClick={() => onSave(opp.id, isSaved ? 'unsave' : 'saved')}
              title={isSaved ? `Status: ${savedStatus || 'Saved'}` : 'Save'}
              className="p-2 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm text-slate-900 transition-colors"
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 fill-current text-slate-900" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Category & Opportunity Title */}
        <div className="space-y-1 pt-1">
          <span className="text-[11px] font-bold text-slate-900/70 uppercase tracking-wider block">
            {opp.category || 'Opportunity'} • {opp.mode || 'Online'}
          </span>
          <h3 className={`text-base font-extrabold ${style.textColor} tracking-tight line-clamp-2 leading-snug drop-shadow-sm`}>
            {opp.title}
          </h3>
          <p className={`text-xs ${style.textColor} opacity-85 truncate font-medium`}>
            {opp.organization}
          </p>
        </div>
      </div>

      {/* Bottom Row: Stipend / Perks & Arrow Button */}
      <div className="relative z-10 pt-4 border-t border-black/10 flex items-end justify-between">
        <div className="space-y-0.5 max-w-[75%]">
          <span className="text-[10px] font-semibold text-slate-900/70 block uppercase tracking-wider">
            Stipend / Prize
          </span>
          <span className={`text-xs font-extrabold ${style.textColor} tracking-tight block truncate`}>
            {stipendDisplay}
          </span>
          <span className="text-[10px] font-medium text-slate-900/60 block">
            📅 Deadline: {formattedDeadline}
          </span>
        </div>

        {/* Minimalist Arrow Button */}
        <button
          onClick={onOpenDetail}
          className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all duration-200 group-hover:translate-x-1 shrink-0"
          title="Explore Details"
        >
          <ArrowRight className={`w-4 h-4 ${style.textColor}`} />
        </button>
      </div>
    </div>
  );
};
