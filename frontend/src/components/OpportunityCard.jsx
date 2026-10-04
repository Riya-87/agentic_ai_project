import React from 'react';
import { ArrowRight, Bookmark, BookmarkCheck, ShieldCheck } from 'lucide-react';

export const OpportunityCard = ({
  opportunity,
  match,
  isSaved,
  savedStatus,
  onSave,
  onOpenDetail
}) => {
  const opp = opportunity;

  // Exact 8 domain extensions & pigments matching Sharon Ahmed's shot
  const getDomainStyle = (cat, title = '') => {
    const text = `${cat} ${title}`.toLowerCase();

    if (text.includes('scholarship') || text.includes('singapore') || text.includes('merit')) {
      return {
        extension: '.sg',
        bg: 'bg-gradient-to-br from-[#FCD692] via-[#F9B95C] to-[#E99E37]', // Pêche
        price: 'USD$16.05',
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-900',
      };
    }
    if (text.includes('cloud') || text.includes('fellowship') || text.includes('research')) {
      return {
        extension: '.cloud',
        bg: 'bg-gradient-to-br from-[#EEA399] via-[#D7897F] to-[#C06F65]', // Nectarine
        price: 'USD$24.00',
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-900',
      };
    }
    if (text.includes('beauty') || text.includes('design') || text.includes('ui')) {
      return {
        extension: '.beauty',
        bg: 'bg-gradient-to-br from-[#C4E1EC] via-[#A8D3E3] to-[#86BCDA]', // Pastel Lagune
        price: 'USD$12.01',
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-900',
      };
    }
    if (text.includes('shop') || text.includes('ecommerce') || text.includes('store')) {
      return {
        extension: '.shop',
        bg: 'bg-gradient-to-br from-[#4FC3A1] via-[#2EB88A] to-[#1E9B71]', // Mint / Emerald
        price: 'USD$4.28',
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-white',
      };
    }
    if (text.includes('hackathon') || text.includes('code') || text.includes('tech')) {
      return {
        extension: '.com',
        bg: 'bg-gradient-to-br from-[#A2E048] via-[#8CCB2D] to-[#71AC19]', // Lime Green from Dribbble shot
        price: 'USD$8.00',
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-950',
      };
    }
    if (text.includes('us') || text.includes('america') || text.includes('global') || text.includes('internship')) {
      return {
        extension: '.us',
        bg: 'bg-gradient-to-br from-[#40A8E3] via-[#2092D8] to-[#1272B5]', // Ocean Blue from Dribbble shot
        price: 'USD$9.02',
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-white',
      };
    }
    if (text.includes('grant') || text.includes('fund')) {
      return {
        extension: '.io',
        bg: 'bg-gradient-to-br from-[#C7B9F8] via-[#B29DF4] to-[#997EEA]', // Soft Lavender from Dribbble shot
        price: 'USD$9.99',
        badgeBg: 'bg-white text-slate-900',
        textColor: 'text-slate-900',
      };
    }
    // Default to .site (Mint green from Dribbble Card 1)
    return {
      extension: '.site',
      bg: 'bg-gradient-to-br from-[#BDE4D2] via-[#96C7B3] to-[#77AA94]', // Menthe
      price: 'USD$8.00',
      badgeBg: 'bg-white text-slate-900',
      textColor: 'text-slate-900',
    };
  };

  const domain = getDomainStyle(opp.category, opp.title);

  return (
    <div
      onClick={onOpenDetail}
      className={`group relative rounded-[28px] ${domain.bg} p-6 shadow-md hover:shadow-2xl transition-all duration-300 card-tactile flex flex-col justify-between min-h-[220px] overflow-hidden select-none border border-black/5`}
    >
      {/* Topographic Guilloche Contour Wave Pattern Overlay */}
      <div className="absolute inset-0 contour-guilloche opacity-90 transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 contour-lines-overlay opacity-60" />

      {/* Ambient glass highlight */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Top Row: Circular Domain Badge & Bookmark Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Circular Badge with Extension initials from Sharon Ahmed's shot */}
            <div className={`w-12 h-12 rounded-full ${domain.badgeBg} flex items-center justify-center font-extrabold text-xs shadow-md tracking-tight transition-transform group-hover:scale-105`}>
              <span>{domain.extension}</span>
            </div>
            {opp.verification_status === 'VERIFIED' && (
              <span className="p-1 rounded-full bg-black/10 text-slate-900 backdrop-blur-sm" title="Verified Domain">
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
                  <span className="px-2 py-0.5 rounded-full bg-black/10 backdrop-blur-md text-slate-900 text-[9px] font-bold uppercase tracking-wider">
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

        {/* Extension Label & Opportunity Title */}
        <div className="space-y-1 pt-1">
          <span className="text-xs font-semibold text-slate-900/60 block">
            {domain.extension}
          </span>
          <h3 className={`text-base font-extrabold ${domain.textColor} tracking-tight line-clamp-2 leading-snug drop-shadow-sm`}>
            {opp.title}
          </h3>
          <p className={`text-xs ${domain.textColor} opacity-80 truncate`}>
            {opp.organization}
          </p>
        </div>
      </div>

      {/* Bottom Row: Starting at USD$X.XX and Arrow Button ( -> ) */}
      <div className="relative z-10 pt-4 border-t border-black/10 flex items-end justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium text-slate-900/60 block">
            Starting at
          </span>
          <span className={`text-base font-extrabold ${domain.textColor} tracking-tight`}>
            {domain.price}
          </span>
        </div>

        {/* Minimalist Arrow Button ( -> ) from Dribbble shot */}
        <button
          onClick={onOpenDetail}
          className="w-8 h-8 rounded-full bg-transparent hover:bg-black/10 flex items-center justify-center transition-all duration-200 group-hover:translate-x-1"
          title="Explore Details"
        >
          <ArrowRight className={`w-4 h-4 ${domain.textColor}`} />
        </button>
      </div>
    </div>
  );
};
