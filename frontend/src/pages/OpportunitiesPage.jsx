import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import { OpportunityCard } from '../components/OpportunityCard';

export const OpportunitiesPage = ({ onOpenDetail }) => {
  const { user } = useAuth();
  const { showToast } = useAgent();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('Any');
  const [isFree, setIsFree] = useState(false);
  const [minMatch, setMinMatch] = useState(0);
  const [urgency, setUrgency] = useState('');
  const [sourceVerified, setSourceVerified] = useState('all');
  const [sourcePlatform, setSourcePlatform] = useState('All');
  const [sortBy, setSortBy] = useState('match');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // AI Interpretation State
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState(null);

  const quickCategories = [
    { id: 'All', label: 'All' },
    { id: 'For You', label: '✨ For You' },
    { id: 'Internship', label: 'Internships' },
    { id: 'Hackathon', label: 'Hackathons' },
    { id: 'Scholarship', label: 'Scholarships' },
    { id: 'Research Fellowship', label: 'Research' },
    { id: 'Competition', label: 'Competitions' },
  ];

  const sourcePlatforms = [
    'All',
    'LinkedIn',
    'Internshala',
    'Devpost',
    'MLH',
    'Kaggle',
    'Unstop',
    'University Portals'
  ];

  const quickPrompts = [
    'Free AI hackathons',
    'Remote research fellowships',
    'Undergrad scholarships',
    'Summer software internships',
  ];

  const fetchOpportunities = async (overrideParams = {}) => {
    try {
      setLoading(true);

      let effectiveMinMatch = minMatch;
      let effectiveCategory = category;

      if (category === 'For You') {
        effectiveMinMatch = Math.max(minMatch, 60);
        effectiveCategory = 'All';
      }

      const params = {
        category: effectiveCategory !== 'All' ? effectiveCategory : undefined,
        mode: mode !== 'Any' ? mode : undefined,
        is_free: isFree ? true : undefined,
        search: search.trim() || undefined,
        min_match: effectiveMinMatch > 0 ? effectiveMinMatch : undefined,
        urgency: urgency || undefined,
        sort_by: sortBy,
        source: sourcePlatform !== 'All' ? sourcePlatform : undefined,
        verification_status: sourceVerified !== 'all' ? (sourceVerified === 'verified' ? 'VERIFIED' : sourceVerified === 'public' ? 'PUBLIC SOURCE' : 'UNVERIFIED') : undefined,
        ...overrideParams,
      };

      const data = await api.getOpportunities(params);
      setOpportunities(data);
    } catch (e) {
      console.error('Error loading opportunities:', e);
      showToast('Failed to load opportunities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [category, mode, isFree, urgency, sortBy, minMatch, sourceVerified, sourcePlatform, user]);

  const handleAiSearch = async (queryText) => {
    const text = queryText || search;
    if (!text.trim()) return;

    try {
      setIsInterpreting(true);
      const parsed = await api.interpretSearch(text);
      if (parsed) {
        setAiInterpretation(parsed);
        if (parsed.category && parsed.category !== 'All') {
          setCategory(parsed.category);
        }
        if (parsed.mode && parsed.mode !== 'Any') {
          setMode(parsed.mode);
        }
        if (parsed.is_free !== undefined && parsed.is_free !== null) {
          setIsFree(parsed.is_free);
        }
        if (parsed.max_days_left && parsed.max_days_left <= 7) {
          setUrgency('approaching');
        }
        showToast('✨ AI interpreted your query', 'success');
      }
    } catch (e) {
      console.error('Error in AI query interpreter:', e);
      fetchOpportunities({ search: text });
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim().length > 3) {
      handleAiSearch(search);
    } else {
      fetchOpportunities();
    }
  };

  const handleSave = async (oppId, action) => {
    try {
      if (action === 'unsave') {
        await api.removeSaved(oppId);
        showToast('Removed from saved', 'info');
      } else {
        await api.saveOpportunity(oppId, 'saved');
        showToast('Saved to your tracker!', 'success');
      }
      fetchOpportunities();
    } catch (e) {
      showToast('Error updating saved status', 'error');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setMode('Any');
    setIsFree(false);
    setMinMatch(0);
    setUrgency('');
    setSourceVerified('all');
    setSourcePlatform('All');
    setSortBy('match');
    setAiInterpretation(null);
  };

  const activeFilterCount = [
    category !== 'All' && category !== 'For You',
    mode !== 'Any',
    isFree,
    minMatch > 0,
    urgency !== '',
    sourceVerified !== 'all',
    sourcePlatform !== 'All'
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Discover Opportunities</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/40">
              {opportunities.length} found
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalized academic discovery matched with your profile and verified across the web
          </p>
        </div>
      </div>

      {/* Prominent Natural Language Search Box */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="What are you looking for? (e.g., 'Remote AI internships for 3rd year students')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchOpportunities({ search: undefined });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isInterpreting}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            {isInterpreting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isInterpreting ? 'Interpreting...' : 'Search'}</span>
          </button>
        </form>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Suggestions:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearch(qp);
                handleAiSearch(qp);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors border border-slate-200/50 dark:border-slate-800"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* AI Interpretation indicator if active */}
        {aiInterpretation && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/50 text-xs text-brand-900 dark:text-brand-200">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="truncate">{aiInterpretation.explanation || 'Filtered using natural language understanding'}</span>
            </div>
            <button
              onClick={() => {
                setAiInterpretation(null);
                clearFilters();
              }}
              className="text-slate-400 hover:text-rose-500 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Category Pills & Toolbar */}
      <div className="space-y-3">
        {/* Quick category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickCategories.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Count & Filter Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Found <strong className="text-slate-900 dark:text-white font-semibold">{opportunities.length}</strong> opportunities matching your criteria
          </p>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="match">Sort by: Best Match</option>
              <option value="deadline">Sort by: Deadline</option>
              <option value="new">Sort by: Newest</option>
            </select>

            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showFiltersDrawer || activeFilterCount > 0
                  ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showFiltersDrawer ? (
                <ChevronUp className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Filter Drawer */}
        {showFiltersDrawer && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {/* Mode filter */}
              <div className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 font-semibold">Mode / Location</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  <option value="Any">Any Mode</option>
                  <option value="Online">Online / Remote</option>
                  <option value="Offline">In-Person</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Source Platform filter */}
              <div className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 font-semibold">Source Platform</label>
                <select
                  value={sourcePlatform}
                  onChange={(e) => setSourcePlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  {sourcePlatforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Verification level filter */}
              <div className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 font-semibold">Source Verification</label>
                <select
                  value={sourceVerified}
                  onChange={(e) => setSourceVerified(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified Only</option>
                  <option value="public">Public Web Only</option>
                </select>
              </div>

              {/* Urgency */}
              <div className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 font-semibold">Deadline Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                >
                  <option value="">All Deadlines</option>
                  <option value="critical">Closing in ≤ 2 Days</option>
                  <option value="approaching">Closing in 3-5 Days</option>
                  <option value="upcoming">Upcoming (6-14 Days)</option>
                </select>
              </div>
            </div>

            {/* Bottom row: Free only toggle & Min Match Slider */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Free Only</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Min Match:</span>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="10"
                    value={minMatch}
                    onChange={(e) => setMinMatch(Number(e.target.value))}
                    className="w-24 accent-brand-500 cursor-pointer"
                  />
                  <span className="font-bold text-brand-600 dark:text-brand-400 min-w-[32px]">
                    {minMatch > 0 ? `${minMatch}%+` : 'Off'}
                  </span>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Opportunities 2-Column Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-7 h-7 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Matching opportunities with your profile...</p>
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {opportunities.map((item) => (
            <OpportunityCard
              key={item.opportunity.id}
              opportunity={item.opportunity}
              match={item.match}
              isSaved={item.is_saved}
              savedStatus={item.saved_status}
              onSave={handleSave}
              onOpenDetail={() => onOpenDetail(item)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No matching opportunities found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or resetting filters to explore more opportunities.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
