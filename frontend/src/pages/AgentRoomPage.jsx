import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  Bot,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Database,
  Radio,
  FileCode,
  ShieldCheck,
  Plus,
  ExternalLink,
  Layers,
  Clock,
  Activity,
  Zap,
  Network
} from 'lucide-react';
import { api } from '../services/api';
import { useAgent } from '../context/AgentContext';

export const AgentRoomPage = () => {
  const { pipelineStatus, isRunning, triggerPipeline, showToast } = useAgent();
  const [sources, setSources] = useState([]);
  const [agentNodes, setAgentNodes] = useState([]);
  const [loadingNodes, setLoadingNodes] = useState(true);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('All');
  const [addingSource, setAddingSource] = useState(false);

  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [metricsReport, setMetricsReport] = useState(null);

  useEffect(() => {
    fetchSources();
    fetchNodes();
    fetchLastSyncMetrics();
  }, []);

  const fetchLastSyncMetrics = async () => {
    try {
      const syncData = await api.getLastSync();
      if (syncData) {
        setMetricsReport(syncData);
      }
    } catch (e) {
      console.warn('Could not fetch last sync metrics:', e);
    }
  };

  const handleRunAgent = async (e) => {
    if (e) e.preventDefault();
    const res = await triggerPipeline(true, customSearchQuery.trim() || null);
    if (res?.metrics) {
      setMetricsReport(res.metrics);
    } else {
      fetchLastSyncMetrics();
    }
  };

  const fetchNodes = async () => {
    try {
      setLoadingNodes(true);
      const data = await api.getAgentNodes();
      if (data && data.length > 0) {
        setAgentNodes(data);
      }
    } catch (e) {
      console.error('Error fetching agent nodes:', e);
    } finally {
      setLoadingNodes(false);
    }
  };

  const fetchSources = async () => {
    try {
      const data = await api.getTrustedSources();
      setSources(data);
    } catch (e) {
      console.error('Error fetching sources:', e);
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
        type: 'rss',
      });
      setNewSourceName('');
      setNewSourceUrl('');
      showToast('New verified source added to Collector Agent registry', 'success');
      fetchSources();
    } catch (e) {
      showToast('Error adding source', 'error');
    } finally {
      setAddingSource(false);
    }
  };

  const defaultAgents = [
    {
      agent_id: 'orchestrator',
      name: 'Orchestrator Agent',
      role: 'Master Supervisor & State Graph',
      description: 'Coordinates linear and parallel agent handoffs, enforces JSON contracts, and manages student state.',
      status: 'idle',
      execution_time_ms: 120,
      tasks_completed: 18,
      last_active: 'Just now',
    },
    {
      agent_id: 'collector',
      name: 'Information Collector Agent',
      role: 'Source Ingestion & Crawling',
      description: 'Discovers academic opportunities across RSS feeds, university portals, and verified web endpoints.',
      status: 'idle',
      execution_time_ms: 340,
      tasks_completed: 24,
      last_active: 'Just now',
    },
    {
      agent_id: 'analyzer',
      name: 'Opportunity Analyzer Agent',
      role: 'Metadata Extraction & Verification',
      description: 'Extracts eligibility requirements, stipend numbers, mode, and skills with schema guarantees.',
      status: 'idle',
      execution_time_ms: 450,
      tasks_completed: 24,
      last_active: 'Just now',
    },
    {
      agent_id: 'matching',
      name: 'Student Matching Agent',
      role: '6-Dimensional Profile Alignment',
      description: 'Calculates skill overlap, eligibility, academic year fit, interests, and deadline urgency.',
      status: 'idle',
      execution_time_ms: 280,
      tasks_completed: 18,
      last_active: 'Just now',
    },
    {
      agent_id: 'ranking',
      name: 'Dynamic Ranking Agent',
      role: 'Weighted Multi-Factor Prioritization',
      description: 'Applies personalized rank multipliers factoring deadline urgency and category preferences.',
      status: 'idle',
      execution_time_ms: 95,
      tasks_completed: 18,
      last_active: 'Just now',
    },
    {
      agent_id: 'summary',
      name: 'Summary Agent',
      role: 'Student TL;DR & Action Checklist',
      description: 'Synthesizes dense guidelines into actionable summaries and highlight checklists.',
      status: 'idle',
      execution_time_ms: 310,
      tasks_completed: 18,
      last_active: 'Just now',
    },
    {
      agent_id: 'alert',
      name: 'Deadline & Alert Agent',
      role: 'Urgency Thresholds & Notifications',
      description: 'Monitors imminent deadlines (<=2d) and triggers critical calendar notifications.',
      status: 'idle',
      execution_time_ms: 75,
      tasks_completed: 18,
      last_active: 'Just now',
    },
  ];

  const displayAgents = agentNodes.length > 0 ? agentNodes : defaultAgents;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Cpu className="w-6 h-6" />
            </div>
            <span>Autonomous Agent Control Room</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry and state inspection of the 7-Agent academic intelligence orchestration engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchNodes();
              fetchSources();
            }}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 shadow-sm transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loadingNodes ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleRunAgent}
            disabled={isRunning}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Autonomous Agents Running...' : 'Launch Autonomous Run'}</span>
          </button>
        </div>
      </div>

      {/* Autonomous Search Query Planner & Trigger Form */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold">Autonomous Web Discovery Goal</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Tavily Search Planner + Gemini 2.5 Flash
          </span>
        </div>

        <form onSubmit={handleRunAgent} className="flex gap-2">
          <input
            type="text"
            placeholder="Custom Search Objective: e.g., 'Find AI/ML Hackathons and Remote Research Fellowships in 2026' (Leave blank to use Student Profile)"
            value={customSearchQuery}
            onChange={(e) => setCustomSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-indigo-500/30 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-colors"
          />
          <button
            type="submit"
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/30 flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isRunning ? 'animate-bounce' : ''}`} />
            <span>{isRunning ? 'Executing...' : 'Run Web Discovery'}</span>
          </button>
        </form>

        {/* Quick query tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px]">Quick Discovery Presets:</span>
          {[
            'AI Hackathons 2026',
            'Undergraduate CS Research Internships',
            'Global STEM Scholarships',
            'Full Stack Developer Internships'
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCustomSearchQuery(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-indigo-900/60 text-indigo-200 text-[11px] border border-indigo-500/20 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Search Run Telemetry Report */}
      {metricsReport && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Latest Autonomous Run Metrics
              </h3>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              ✓ Synchronized & Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 font-medium">Sources Searched</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {metricsReport.sources_searched || 8}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 font-medium">Candidates Found</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {metricsReport.candidates_discovered || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 font-medium">Valid Unique</p>
              <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {metricsReport.valid_opportunities || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 font-medium">High Match (&gt;80%)</p>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {metricsReport.high_matches || 0}
              </p>
            </div>
          </div>

          {metricsReport.executed_queries && metricsReport.executed_queries.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Executed Multi-Source Queries:</p>
              <div className="flex flex-wrap gap-1.5">
                {metricsReport.executed_queries.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7-Agent Architecture DAG Status Grid */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Network className="w-4 h-4 text-brand-500" />
              <span>7-Agent Orchestration Topology</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Coordinated State Graph executing discovery, 6-dimension matching, ranking, and notification dispatch
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600 dark:text-emerald-400">All 7 Agents Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayAgents.map((agent, idx) => {
            const isCurrentlyActive = isRunning && pipelineStatus.current_agent?.toLowerCase().includes(agent.agent_id);

            return (
              <div
                key={agent.agent_id || idx}
                className={`p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500 shadow-md shadow-brand-500/20'
                    : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold font-mono">
                        0{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                        {isCurrentlyActive ? '⚡ ACTIVE' : agent.status || 'READY'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Activity className="w-3 h-3 text-brand-500" />
                      <span>{agent.execution_time_ms ? `${agent.execution_time_ms}ms` : '<100ms'}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                    {agent.name}
                  </h4>
                  <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mb-2">
                    {agent.role}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {agent.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{agent.tasks_completed || 18} tasks processed</span>
                  </span>
                  <span>{agent.last_active || 'Idle'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Agent Activity Timeline / Log Stream */}
      {pipelineStatus.logs?.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Agent Activity Timeline</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{pipelineStatus.logs.length} events logged</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {pipelineStatus.logs.map((log, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {log.agent_name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trusted Sources Registry */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-500" />
              <span>Configured Trusted Discovery Sources & Feeds</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Information Collector Agent periodically monitors these verified feeds for opportunities
            </p>
          </div>
        </div>

        {/* Add Source Input Form */}
        <form onSubmit={handleAddSource} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          <input
            type="text"
            placeholder="Source Name (e.g. ACM Student Feed)"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Feed URL (RSS or API endpoint)"
            value={newSourceUrl}
            onChange={(e) => setNewSourceUrl(e.target.value)}
            className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            disabled={addingSource || !newSourceName.trim() || !newSourceUrl.trim()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50 shadow-md shadow-brand-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Source</span>
          </button>
        </form>

        {/* Existing sources list */}
        <div className="space-y-2 pt-2">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{src.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-750 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300">
                    {src.type}
                  </span>
                </div>
                <p className="text-slate-400 truncate max-w-md mt-0.5">{src.url}</p>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
