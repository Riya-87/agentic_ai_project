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
  ShieldCheck,
  UploadCloud,
  Bot,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityAgentPanel } from '../components/OpportunityAgentPanel';
import { ResumeUploadModal } from '../components/ResumeUploadModal';

export const OpportunitiesPage = ({ onOpenDetail, initialSearch = '' }) => {
  const { user } = useAuth();
  const { showToast } = useAgent();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState(initialSearch || '');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('Any');
  const [isFree, setIsFree] = useState(false);
  const [minMatch, setMinMatch] = useState(0);
  const [urgency, setUrgency] = useState('');
  const [sourceVerified, setSourceVerified] = useState('all');
  const [sourcePlatform, setSourcePlatform] = useState('All');
  const [sortBy, setSortBy] = useState('match');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Tri-Pane & Modal State
  const [agentPanelOpen, setAgentPanelOpen] = useState(true);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // AI Interpretation State
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState(null);

  // Expanded Categories matching PRD
  const quickCategories = [
    { id: 'All', label: 'All' },
    { id: 'For You', label: '✨ For You' },
    { id: 'Internship', label: 'Internships' },
    { id: 'Job', label: 'Jobs' },
    { id: 'Hackathon', label: 'Hackathons' },
    { id: 'Competition', label: 'Competitions' },
    { id: 'Research Fellowship', label: 'Fellowships' },
    { id: 'Scholarship', label: 'Scholarships' },
    { id: 'Conference', label: 'Conferences' },
    { id: 'Open Source', label: 'Open Source' },
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
    'Machine Learning',
    'Remote Summer Internships',
    'Free AI Hackathons',
    'Undergrad Research Fellowships',
    'Open Source Grants'
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
        verification_status:
          sourceVerified !== 'all'
            ? sourceVerified === 'verified'
              ? 'VERIFIED'
              : sourceVerified === 'public'
              ? 'PUBLIC SOURCE'
              : 'UNVERIFIED'
            : undefined,
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
        showToast('✨ AI refined your search filter', 'success');
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
        showToast('Removed from tracker', 'info');
      } else {
        await api.saveOpportunity(oppId, 'SAVED');
        showToast('Saved to your tracker!', 'success');
      }
      fetchOpportunities();
    } catch (e) {
      showToast('Error updating saved status', 'error');
    }
  };

  // Called when Agent refines active filters or produces shortlisted items
  const handleAgentFilters = (activeFilters, shortlistedOpps) => {
    if (activeFilters.mode) {
      setMode(activeFilters.mode);
    }
    if (activeFilters.category) {
      setCategory(activeFilters.category);
    }
    if (shortlistedOpps && shortlistedOpps.length > 0) {
      // Map to item format if needed
      const mapped = shortlistedOpps.map((opp) => ({
        opportunity: opp,
        match: {
          overall_match: opp.match_score,
          skill_match: opp.skill_match,
          education_match: opp.education_match,
          eligibility_status: opp.eligibility_status,
          explanation: opp.match_reason
        },
        is_saved: false,
        saved_status: null
      }));
      setOpportunities(mapped);
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
    <div className="flex h-full -m-4 sm:-m-6 md:-m-8 overflow-hidden">
      {/* Center Main Discovery Pane */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Page Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>Academic & Career Discovery</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/40">
                {opportunities.length} opportunities
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Autonomous multi-source research agent grounded by our 6-Factor Matching Engine
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Resume Upload Button */}
            <button
              onClick={() => setResumeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4 text-brand-500" />
              <span>Upload Resume (PDF)</span>
            </button>

            {/* AI Agent Panel Toggle */}
            <button
              onClick={() => setAgentPanelOpen(!agentPanelOpen)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-2xs transition-all active:scale-95 ${
                agentPanelOpen
                  ? 'bg-slate-900 text-white dark:bg-brand-600 border-transparent'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-500'
              }`}
            >
              <Bot className="w-4 h-4 text-brand-400" />
              <span>{agentPanelOpen ? 'Hide Agent' : 'Opportunity Agent'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Natural Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search anything: "Machine Learning", "Remote 3rd year internship", "AI Hackathons"...'
              className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />

            <div className="absolute right-2 flex items-center gap-1.5">
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={isInterpreting}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-500 dark:hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isInterpreting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-brand-300" />
                )}
                <span>Search</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => {
                setSearch(q);
                handleAiSearch(q);
              }}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 hover:border-brand-500 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 whitespace-nowrap transition-all shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/60 dark:border-slate-800/60">
          {quickCategories.map((c) => {
            const isSelected = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Select */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="Any">All Formats</option>
              <option value="Online">Remote / Online</option>
              <option value="Offline">On-Site / In-Person</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            {/* Free only toggle */}
            <button
              onClick={() => setIsFree(!isFree)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all ${
                isFree
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              Free / Stiped Only
            </button>

            {/* Min Match Score */}
            <select
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value={0}>Any Match Score</option>
              <option value={70}>70%+ Compatibility</option>
              <option value={80}>80%+ Compatibility</option>
              <option value={90}>90%+ Top Matches</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="match">6-Factor AI Match</option>
              <option value="deadline">Approaching Deadline</option>
              <option value="recent">Recently Discovered</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold transition-all"
              >
                Reset ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Opportunity Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-850 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-500 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              No matching opportunities found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try broadening your filter criteria or ask our AI Opportunity Agent in the right panel to crawl the live web for you.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((item) => (
              <OpportunityCard
                key={item.opportunity?.id || item.id}
                opportunity={item.opportunity || item}
                match={item.match}
                isSaved={item.is_saved}
                savedStatus={item.saved_status}
                onSave={handleSave}
                onOpenDetail={() => onOpenDetail(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Tri-Pane: Conversational Opportunity Agent Panel */}
      <OpportunityAgentPanel
        isOpen={agentPanelOpen}
        onToggle={() => setAgentPanelOpen(!agentPanelOpen)}
        onSelectOpportunity={(opp) => onOpenDetail({ opportunity: opp, match: { overall_match: opp.match_score } })}
        onApplyFilters={handleAgentFilters}
      />

      {/* Resume Analyzer Modal */}
      <ResumeUploadModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onProfileUpdated={() => {
          fetchOpportunities();
          showToast('Profile updated & matches recalculated!', 'success');
        }}
      />
    </div>
  );
};
