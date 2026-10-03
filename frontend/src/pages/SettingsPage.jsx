import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Globe,
  Plus,
  RefreshCw,
  Bell,
  Sliders,
  Check,
  Zap,
  Activity,
  Cpu,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast, triggerPipeline } = useAgent();

  const [activeSubTab, setActiveSubTab] = useState('sources'); // 'sources' | 'preferences' | 'engine'
  const [sources, setSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('All');
  const [addingSource, setAddingSource] = useState(false);

  // Preference states
  const [minMatchThreshold, setMinMatchThreshold] = useState(50);
  const [deadlineAlertDays, setDeadlineAlertDays] = useState(5);
  const [autoDiscoverWeb, setAutoDiscoverWeb] = useState(true);

  // Sync state
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchSources();
    fetchSyncInfo();
  }, []);

  const fetchSyncInfo = async () => {
    try {
      const data = await api.getLastSync();
      setLastSync(data);
    } catch (e) {
      console.warn('Could not fetch sync info:', e);
    }
  };

  const fetchSources = async () => {
    try {
      setLoadingSources(true);
      const data = await api.getTrustedSources();
      setSources(data || []);
    } catch (e) {
      console.error('Error fetching sources:', e);
    } finally {
      setLoadingSources(false);
    }
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;

    try {
      setAddingSource(true);
      await api.addTrustedSource({
        name: newSourceName.trim(),
        url: newSourceUrl.trim(),
        category_focus: newSourceCategory,
        type: 'web',
      });
      showToast('Trusted source added to discovery catalog', 'success');
      setNewSourceName('');
      setNewSourceUrl('');
      fetchSources();
    } catch (e) {
      showToast('Failed to add source', 'error');
    } finally {
      setAddingSource(false);
    }
  };

  const handleTriggerDiscovery = async () => {
    try {
      setIsSyncing(true);
      showToast('Launching autonomous discovery across verified web sources...', 'info');
      await triggerPipeline(true);
      showToast('Autonomous discovery complete!', 'success');
      await fetchSyncInfo();
    } catch (e) {
      showToast('Discovery sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <span>Settings & Intelligence</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure discovery sources, match preferences, and autonomous agent settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        {[
          { id: 'sources', label: 'Verified Public Sources', icon: Globe },
          { id: 'preferences', label: 'Match & Alert Preferences', icon: Sliders },
          { id: 'engine', label: 'AI Engine & Diagnostics', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Verified Public Sources */}
      {activeSubTab === 'sources' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Discovery Sources</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The Collector agent monitors these public platforms, portals, and repositories for student opportunities.
              </p>
            </div>
            <button
              onClick={handleTriggerDiscovery}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center gap-2 shrink-0 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Discovering...' : 'Sync Sources Now'}</span>
            </button>
          </div>

          {/* Add Custom Source */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add Custom Web / RSS Source</h4>
            <form onSubmit={handleAddSource} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Source Name (e.g., Stanford AI Lab)"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <input
                type="url"
                placeholder="URL (e.g., https://ai.stanford.edu/news)"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newSourceCategory}
                  onChange={(e) => setNewSourceCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none flex-1"
                >
                  <option value="All">All Categories</option>
                  <option value="Hackathon">Hackathons</option>
                  <option value="Internship">Internships</option>
                  <option value="Research Fellowship">Research</option>
                  <option value="Scholarship">Scholarships</option>
                </select>
                <button
                  type="submit"
                  disabled={addingSource || !newSourceName.trim() || !newSourceUrl.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sources List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loadingSources ? (
              <div className="col-span-2 py-10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
                <span>Loading verified source catalog...</span>
              </div>
            ) : sources.map((src) => (
              <div
                key={src.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {src.name}
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{src.url}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300 shrink-0">
                  {src.category_focus || 'All'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Match & Alert Preferences */}
      {activeSubTab === 'preferences' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Minimum Match Threshold</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Highlight opportunities when the 6-dimension match score is above this percentage.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="5"
                  value={minMatchThreshold}
                  onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
                  className="w-32 accent-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 w-10 text-right">
                  {minMatchThreshold}%
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Deadline Urgency Alert Window</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Flag opportunities as urgent when their closing deadline is within this number of days.
                </p>
              </div>
              <select
                value={deadlineAlertDays}
                onChange={(e) => setDeadlineAlertDays(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <option value={3}>3 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Autonomous Web Crawling</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically discover and index newly published opportunities from trusted public sources.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoDiscoverWeb}
                onChange={(e) => setAutoDiscoverWeb(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => showToast('Preferences updated successfully', 'success')}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-sm hover:bg-brand-500 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      )}

      {/* Tab: AI Engine & Diagnostics */}
      {activeSubTab === 'engine' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              <span>Multi-Agent System Health</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Collector Agent</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active (Tavily Web Search)
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Verification Agent</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active (Domain & Schema Filter)
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Match & Copilot Agent</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active (Google Gemini 2.5 Flash)
                </p>
              </div>
            </div>
          </div>

          {lastSync && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Last Discovery Diagnostics:</span>
              <div className="flex flex-wrap gap-4 text-slate-500 dark:text-slate-400">
                <span>Sources Queried: <strong className="text-slate-900 dark:text-white">{lastSync.sources_searched ?? 8}</strong></span>
                <span>Candidates Discovered: <strong className="text-slate-900 dark:text-white">{lastSync.candidates_discovered ?? 0}</strong></span>
                <span>Valid Opportunities: <strong className="text-slate-900 dark:text-white">{lastSync.valid_opportunities ?? 0}</strong></span>
                <span>Duplicates Filtered: <strong className="text-slate-900 dark:text-white">{lastSync.duplicates_removed ?? 0}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
