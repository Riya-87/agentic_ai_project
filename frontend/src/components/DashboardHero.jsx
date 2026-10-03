import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, ArrowRight, Globe, Check } from 'lucide-react';

export const DashboardHero = ({ onSearch, onSelectCategory }) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Exact domain suggestions from Sharon Ahmed's shot
  const domainSuggestions = [
    { name: 'orelloo.net', ext: '.net' },
    { name: 'orelloo.com', ext: '.com', isSelected: true },
    { name: 'orelloo.to', ext: '.to' },
    { name: 'orelloo.us', ext: '.us' },
    { name: 'orelloo.sg', ext: '.sg' },
    { name: 'orelloo.shop', ext: '.shop' },
    { name: 'orelloo.site', ext: '.site' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    setIsDropdownOpen(false);
    if (onSearch) {
      onSearch(suggestion.name);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-canvas-border dark:border-webbble-border">
      {/* Panoramic Alpine Mountain Landscape Banner from Sharon Ahmed Reference */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden hero-alpine-gradient">
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
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-8 text-center space-y-4">
          <div className="space-y-1 max-w-2xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              Get your business online .com domain from SG$8.01 (1st year).
            </h1>
            <p className="text-xs sm:text-sm text-lagune-100/90 font-medium drop-shadow">
              As low as SG$8.01/1st year.
            </p>
          </div>

          {/* Centered Floating Search Input Container */}
          <div ref={dropdownRef} className="relative w-full max-w-lg">
            <form onSubmit={handleFormSubmit} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="orelloo.com"
                className="w-full pl-6 pr-12 py-3.5 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-semibold placeholder:text-slate-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-lagune-400/40 transition-all border border-white/60"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-lagune-600 transition-colors p-1"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Dribbble Style Floating Autocomplete Dropdown - Exact from Sharon Ahmed's shot */}
            {isDropdownOpen && (
              <div className="absolute left-0 w-44 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 text-left animate-fade-in">
                {domainSuggestions.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleSelectSuggestion(item)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-all ${
                      item.isSelected
                        ? 'bg-[#DFF1FA] text-[#165882] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
