import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Building2,
  Calendar,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';

export const SavedPage = ({ onOpenDetail }) => {
  const { user } = useAuth();
  const { showToast } = useAgent();

  const [savedItems, setSavedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const data = await api.getSaved(statusFilter !== 'all' ? statusFilter : null);
      setSavedItems(data);
    } catch (e) {
      console.error('Error fetching saved opportunities:', e);
      showToast('Error loading saved applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [statusFilter, user]);

  const handleStatusChange = async (oppId, newStatus) => {
    try {
      await api.updateSavedStatus(oppId, { status: newStatus });
      showToast(`Application status set to ${newStatus}`, 'success');
      fetchSaved();
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleRemove = async (oppId) => {
    try {
      await api.removeSaved(oppId);
      showToast('Removed from tracking board', 'info');
      fetchSaved();
    } catch (e) {
      showToast('Error removing item', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-500" />
            <span>Saved & Applied Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal application submissions, drafts, and notes
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {['all', 'saved', 'in_progress', 'applied'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st === 'in_progress' ? 'In Progress' : st}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : savedItems.length > 0 ? (
        <div className="space-y-3">
          {savedItems.map((item) => {
            const opp = item.opportunity;
            const isApplied = item.status === 'applied';
            const isInProgress = item.status === 'in_progress';

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-500/50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase">
                      {opp.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        isApplied
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.status === 'in_progress' ? 'In Progress' : item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {opp.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {opp.organization}
                    </span>
                    {opp.deadline && (
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        Due {new Date(opp.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Switcher & Portal Link */}
                <div className="flex items-center gap-3">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(opp.id, e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="saved">Status: Saved</option>
                    <option value="in_progress">Status: In Progress</option>
                    <option value="applied">Status: Applied</option>
                    <option value="archived">Status: Archived</option>
                  </select>

                  <a
                    href={opp.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>Apply Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleRemove(opp.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove from tracking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
          <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            No opportunities tracked under &quot;{statusFilter}&quot;.
          </p>
          <p className="text-slate-400">
            Bookmark opportunities in the Opportunities Hub to organize your deadlines here.
          </p>
        </div>
      )}
    </div>
  );
};
