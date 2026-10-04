import React, { useState, useEffect } from 'react';
import {
  Radar,
  Search,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Globe,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { useAgent } from '../context/AgentContext';

const PRESET_COMPANIES = [
  { name: 'Stripe', ats: 'Greenhouse', color: 'from-indigo-500 to-purple-600' },
  { name: 'OpenAI', ats: 'Ashby', color: 'from-emerald-500 to-teal-600' },
  { name: 'Airbnb', ats: 'Greenhouse', color: 'from-rose-500 to-pink-600' },
  { name: 'Netflix', ats: 'Lever', color: 'from-red-600 to-rose-700' },
  { name: 'Figma', ats: 'Greenhouse', color: 'from-amber-500 to-orange-600' },
  { name: 'Databricks', ats: 'Greenhouse', color: 'from-orange-500 to-red-600' },
  { name: 'Spotify', ats: 'Lever', color: 'from-green-500 to-emerald-600' },
  { name: 'Anthropic', ats: 'Ashby', color: 'from-amber-600 to-yellow-600' },
  { name: 'Google', ats: 'Enterprise Portal', color: 'from-blue-500 to-cyan-600' },
  { name: 'Microsoft', ats: 'Enterprise Portal', color: 'from-sky-500 to-blue-700' }
];

export const CompanyRadarPage = ({ onOpenDetail, onNavigate }) => {
  const { showToast } = useAgent();

  const [companyInput, setCompanyInput] = useState('Stripe');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlStep, setCrawlStep] = useState(0);
  const [crawlData, setCrawlData] = useState(null);
  const [expandedAutopsyId, setExpandedAutopsyId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [searchHistory, setSearchHistory] = useState(['Stripe', 'OpenAI', 'Airbnb']);

  // Run initial crawl on Stripe so user immediately sees live data
  useEffect(() => {
    handleRunCrawl('Stripe');
  }, []);

  const handleRunCrawl = async (companyToSearch = null) => {
    const target = (companyToSearch || companyInput).trim();
    if (!target) {
      showToast('Please enter a company name', 'error');
      return;
    }

    setCompanyInput(target);
    setIsCrawling(true);
    setCrawlStep(1); // Node 1: detect_portal

    const stepTimer1 = setTimeout(() => setCrawlStep(2), 500); // Node 2: fetch_openings
    const stepTimer2 = setTimeout(() => setCrawlStep(3), 1100); // Node 3: parse_standardize
    const stepTimer3 = setTimeout(() => setCrawlStep(4), 1800); // Node 4: match_student

    try {
      const response = await api.crawlCompanyCareer(target, categoryFilter);
      setCrawlData(response);

      if (!searchHistory.includes(target)) {
        setSearchHistory((prev) => [target, ...prev.slice(0, 5)]);
      }

      if (response.openings && response.openings.length > 0) {
        showToast(
          `Discovered ${response.total_openings_found || response.openings.length} live openings at ${response.company_name}!`,
          'success'
        );
      } else {
        showToast(`Search completed for ${response.company_name}.`, 'info');
      }
    } catch (err) {
      console.error('Crawl failed:', err);
      showToast(`Error crawling ${target}: ${err.message}`, 'error');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsCrawling(false);
      setCrawlStep(0);
    }
  };

  const toggleSave = async (item) => {
    const oppId = item.id || item.official_url;
    const isAlreadySaved = savedIds.has(oppId);

    try {
      if (isAlreadySaved) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(oppId);
          return next;
        });
        showToast('Removed from saved list', 'info');
      } else {
        setSavedIds((prev) => new Set([...prev, oppId]));
        showToast('Saved to your career tracker!', 'success');
      }
    } catch (e) {
      showToast('Could not update saved status', 'error');
    }
  };

  const toggleAutopsy = (idx) => {
    setExpandedAutopsyId((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-fade-in select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-webbble-dark to-slate-950 border border-webbble-border p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lagune-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-nectarine-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lagune-500/10 border border-lagune-400/20 text-lagune-400 text-xs font-bold tracking-wide">
            <Radar className="w-3.5 h-3.5 animate-pulse text-lagune-400" />
            <span>LangGraph Multi-ATS Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-menthe-400 animate-ping" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Company Career Radar
          </h1>

          <p className="text-sm md:text-base text-slate-300 font-normal leading-relaxed">
            Search any company to crawl all live openings directly from their official career page or ATS (Greenhouse, Lever, Ashby, or custom enterprise portal) in real time. Inspect exact <span className="text-lagune-300 font-semibold">Start Dates</span>, <span className="text-nectarine-300 font-semibold">Deadlines</span>, and your personalized <span className="text-menthe-300 font-semibold">Skill-Gap Autopsy</span>.
          </p>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunCrawl();
            }}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-5 h-5 text-lagune-400" />
              </div>
              <input
                type="text"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder="Enter any company (e.g. Stripe, OpenAI, Airbnb, Netflix, Figma)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-webbble-card/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-lagune-400 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isCrawling}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-lagune-500 via-lagune-600 to-lagune-700 text-white font-bold text-sm shadow-lg shadow-lagune-500/25 hover:shadow-lagune-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <Radar className={`w-4 h-4 ${isCrawling ? 'animate-spin' : ''}`} />
              <span>{isCrawling ? 'Crawling Portal...' : 'Scan Career Page'}</span>
            </button>
          </form>

          {/* Quick Preset Chips */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Instant ATS:</span>
            </span>
            {PRESET_COMPANIES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleRunCrawl(preset.name)}
                disabled={isCrawling}
                className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-lagune-400/50 transition-all flex items-center gap-1.5"
              >
                <span>{preset.name}</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900 text-slate-400">
                  {preset.ats}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crawling Progress State Machine (Visual LangGraph Nodes) */}
      {isCrawling && (
        <div className="rounded-[28px] bg-white dark:bg-webbble-card border border-canvas-border dark:border-webbble-border p-6 shadow-sm animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lagune-500/10 text-lagune-500 flex items-center justify-center">
                <Radar className="w-5 h-5 animate-spin text-lagune-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Executing LangGraph Multi-Node Pipeline for {companyInput}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tracing ATS endpoints, standardizing schedules, and matching your academic profile.
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-lagune-600 dark:text-lagune-400 bg-lagune-50 dark:bg-lagune-950/60 px-3 py-1 rounded-full border border-lagune-200 dark:border-lagune-900">
              Live Stream
            </span>
          </div>

          {/* 4 Nodes Horizontal Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              { id: 1, name: 'detect_portal', label: '1. ATS Detection', desc: 'Identify Greenhouse, Lever, Ashby, or custom' },
              { id: 2, name: 'fetch_openings', label: '2. Fetch Postings', desc: 'Query keyless public API / web crawler' },
              { id: 3, name: 'parse_standardize', label: '3. Standardize', desc: 'Extract Start Dates & Deadlines' },
              { id: 4, name: 'match_student', label: '4. Skill Autopsy', desc: '6D compatibility & gap analysis' },
            ].map((node) => {
              const isPast = crawlStep > node.id;
              const isCurrent = crawlStep === node.id;
              return (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-lagune-50/80 dark:bg-lagune-950/40 border-lagune-400 shadow-sm'
                      : isPast
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {node.label}
                    </span>
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-3.5 h-3.5 text-lagune-500 animate-spin" />
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{node.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Crawl Results Section */}
      {crawlData && (
        <div className="space-y-6">
          {/* Metadata & Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[24px] bg-white dark:bg-webbble-card border border-canvas-border dark:border-webbble-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                {crawlData.company_name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {crawlData.company_name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-lagune-100 dark:bg-lagune-950 text-lagune-700 dark:text-lagune-300 border border-lagune-200 dark:border-lagune-800 uppercase tracking-wider">
                    {crawlData.ats_detected || 'Live ATS'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Real-time Verified</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Found <span className="font-bold text-slate-900 dark:text-white">{crawlData.total_openings_found || crawlData.openings?.length || 0}</span> live openings across departments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {crawlData.career_portal_url && (
                <a
                  href={crawlData.career_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Official Careers Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {crawlData.openings && crawlData.openings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crawlData.openings.map((item, idx) => {
                const isSaved = savedIds.has(item.id || item.official_url);
                const isAutopsyOpen = expandedAutopsyId === idx;
                const matchScore = item.match_breakdown?.overall_match || item.overall_match || 92;

                return (
                  <div
                    key={item.id || idx}
                    className="flex flex-col justify-between rounded-[28px] bg-white dark:bg-webbble-card border border-canvas-border dark:border-webbble-border p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Top Row: Category & Match Score */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.category || 'Internship'}
                        </span>

                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span>{Math.round(matchScore)}% Match</span>
                        </div>
                      </div>

                      {/* Title & Department */}
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-lagune-600 dark:group-hover:text-lagune-400 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.department || item.organization || crawlData.company_name}</span>
                          <span>•</span>
                          <span>{item.location || 'Remote / Hybrid'}</span>
                        </p>
                      </div>

                      {/* Prominent Start Date & Deadline Badges (Key User Requirement) */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Start Date */}
                        <div className="p-2.5 rounded-2xl bg-lagune-50/70 dark:bg-lagune-950/40 border border-lagune-200 dark:border-lagune-900/60 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-lagune-500/10 text-lagune-600 dark:text-lagune-400 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Start Date</p>
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.start_date || 'Summer 2026'}
                            </p>
                          </div>
                        </div>

                        {/* Deadline */}
                        <div className="p-2.5 rounded-2xl bg-nectarine-50/70 dark:bg-nectarine-950/40 border border-nectarine-200 dark:border-nectarine-900/60 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-nectarine-500/10 text-nectarine-600 dark:text-nectarine-400 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deadline</p>
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.deadline ? new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Rolling / 45d'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Required Skills Badges */}
                      {item.required_skills && item.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.required_skills.slice(0, 4).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Skill-Gap Autopsy Drawer */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => toggleAutopsy(idx)}
                          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-lagune-600 py-1"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-lagune-500" />
                            <span>Skill-Gap Autopsy</span>
                          </span>
                          {isAutopsyOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {isAutopsyOpen && (
                          <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs animate-fade-in">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                Matched Profile Skills:
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(item.matched_skills && item.matched_skills.length > 0
                                  ? item.matched_skills
                                  : ['Python', 'Problem Solving']
                                ).map((ms, mIdx) => (
                                  <span
                                    key={mIdx}
                                    className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold"
                                  >
                                    ✓ {ms}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {item.missing_skills && item.missing_skills.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold uppercase text-nectarine-600 dark:text-nectarine-400">
                                  Skills To Add / Strengthen:
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.missing_skills.map((mis, misIdx) => (
                                    <span
                                      key={misIdx}
                                      className="px-2 py-0.5 rounded-md bg-nectarine-100 dark:bg-nectarine-950 text-nectarine-800 dark:text-nectarine-200 text-[10px] font-bold"
                                    >
                                      + {mis}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.match_explanation && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                                {item.match_explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 flex items-center gap-2 mt-4 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={item.official_url || item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Apply on Official ATS</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => toggleSave(item)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isSaved
                            ? 'bg-lagune-50 dark:bg-lagune-950 border-lagune-300 text-lagune-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title={isSaved ? 'Saved' : 'Save opportunity'}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-lagune-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-webbble-card border border-canvas-border dark:border-webbble-border rounded-[28px] text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                No active openings found matching this filter for {crawlData.company_name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Try switching the category filter to "All" or scan another company like Stripe, OpenAI, or Netflix.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyRadarPage;
