import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Bot, Compass, Flame } from 'lucide-react';

export const DashboardHero = ({ onSearch, onSelectCategory }) => {
  const [query, setQuery] = useState('');

  const opportunitySuggestions = [
    { label: 'Machine Learning Internships', query: 'Machine Learning' },
    { label: 'Remote Software Internships', query: 'Remote Summer Software Internships' },
    { label: 'AI & Web3 Hackathons', query: 'AI Hackathons' },
    { label: 'Undergrad Research Fellowships', query: 'Undergraduate Research Fellowships' },
    { label: 'Google & Open Source Programs', query: 'Google Summer of Code' },
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-canvas-border dark:border-webbble-border">
      {/* Panoramic Alpine Mountain Landscape Banner with Modern Contrast */}
      <div className="relative min-h-[280px] sm:min-h-[300px] w-full overflow-hidden hero-alpine-gradient flex flex-col justify-center">
        {/* Mountain Silhouette Layers SVG */}
        <div className="absolute inset-0 opacity-90 mix-blend-soft-light pointer-events-none">
          <svg className="w-full h-full object-cover" preserveAspectRatio="none" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 400L250 160L420 280L620 120L850 290L1050 140L1200 260V400H0Z" fill="#1b384c" opacity="0.5" />
            <path d="M-50 400L180 210L360 320L580 180L800 310L980 200L1250 330V400H-50Z" fill="#152c3c" opacity="0.65" />
            <path d="M0 400L120 280L280 360L460 260L650 350L840 250L1020 340L1200 270V400H0Z" fill="#0d1f2b" opacity="0.85" />
          </svg>
        </div>

        {/* Ambient atmospheric lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-peche-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-menthe-300/20 rounded-full blur-2xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-8 text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-lagune-200" />
            <span>AI Academic & Career Opportunity Discovery Agent</span>
          </div>

          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Discover Dream Internships, Research & Hackathons.
            </h1>
            <p className="text-xs sm:text-sm text-lagune-100/90 font-medium drop-shadow max-w-xl mx-auto">
              Autonomous multi-source research agent evaluating eligibility, deadlines, and 6-factor profile compatibility.
            </p>
          </div>

          {/* Centered Floating Search Input Container */}
          <div className="w-full max-w-xl">
            <form onSubmit={handleFormSubmit} className="relative shadow-2xl rounded-2xl">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try searching "Machine Learning", "Remote Software Internships", "AI Hackathons"...'
                className="w-full pl-5 pr-28 py-4 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-semibold placeholder:text-slate-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-lagune-400/40 transition-all border border-white/80"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Discover</span>
              </button>
            </form>

            {/* Quick Suggestion Chips */}
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[11px] text-white/80 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-peche-300" /> Hot:
              </span>
              {opportunitySuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(item.query);
                    if (onSearch) onSearch(item.query);
                  }}
                  className="px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-md text-white/95 text-[11px] font-semibold border border-white/20 transition-all hover:scale-105 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
