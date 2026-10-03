import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Calendar,
  Building2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';

export const DeadlinesPage = ({ onOpenDetail }) => {
  const { user } = useAuth();
  const { showToast } = useAgent();

  const [deadlines, setDeadlines] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const [events, metricsData] = await Promise.all([
        api.getDeadlines(savedOnly),
        api.getUrgencyMetrics(),
      ]);
      setDeadlines(events || []);
      setMetrics(metricsData);
    } catch (e) {
      console.error('Error fetching deadlines:', e);
      showToast('Error loading deadlines', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, [savedOnly, user]);

  const handleStatusUpdate = async (oppId, newStatus) => {
    try {
      if (newStatus === 'untrack') {
        await api.removeSaved(oppId);
        showToast('Removed from tracking', 'info');
      } else {
        await api.saveOpportunity(oppId, newStatus);
        showToast(`Updated to ${newStatus.replace('_', ' ')}`, 'success');
      }
      fetchDeadlines();
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  // Group events into 4 clean tiers
  const closingToday = deadlines.filter((d) => d.days_left !== null && d.days_left <= 1);
  const within3Days = deadlines.filter((d) => d.days_left !== null && d.days_left >= 2 && d.days_left <= 3);
  const thisWeek = deadlines.filter((d) => d.days_left !== null && d.days_left >= 4 && d.days_left <= 7);
  const later = deadlines.filter((d) => d.days_left === null || d.days_left > 7);

  const sections = [
    {
      id: 'today',
      title: 'Closing Today & Tomorrow',
      badge: 'Critical Urgency',
      badgeColor: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
      dotColor: 'bg-rose-500',
      items: closingToday,
      emptyText: 'No critical deadlines today.'
    },
    {
      id: '3days',
      title: 'Within 3 Days',
      badge: 'Approaching Fast',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      dotColor: 'bg-amber-500',
      items: within3Days,
      emptyText: 'No deadlines approaching in the next 3 days.'
    },
    {
      id: 'thisweek',
      title: 'This Week (4-7 Days)',
      badge: 'Upcoming',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
      dotColor: 'bg-blue-500',
      items: thisWeek,
      emptyText: 'No deadlines in this range.'
    },
    {
      id: 'later',
      title: 'Later Deadlines',
      badge: 'More than 7 days',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      dotColor: 'bg-emerald-500',
      items: later,
      emptyText: 'No upcoming later deadlines.'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Deadline Center</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
              {deadlines.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chronological deadline tracking prioritized by urgency to ensure you never miss an application
          </p>
        </div>

        {/* Filter Toggle */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shrink-0">
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(e) => setSavedOnly(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700"
          />
          <span>Saved & Tracked Only</span>
        </label>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-7 h-7 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading upcoming deadlines...</p>
        </div>
      ) : deadlines.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No deadlines found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {savedOnly
                ? 'You have not saved or tracked any opportunities yet. Save opportunities to monitor their deadlines.'
                : 'No active opportunity deadlines found in the system.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
            if (section.items.length === 0) return null;

            return (
              <div key={section.id} className="space-y-3">
                {/* Section Header */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${section.dotColor}`} />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">({section.items.length})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${section.badgeColor}`}>
                    {section.badge}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  {section.items.map((item) => {
                    const daysLeft = item.days_left;
                    let urgencyStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                    let urgencyLabel = `${daysLeft} days left`;

                    if (daysLeft !== null && daysLeft <= 1) {
                      urgencyStyle = 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900';
                      urgencyLabel = daysLeft === 0 ? 'Closing Today' : '1 day left';
                    } else if (daysLeft !== null && daysLeft <= 3) {
                      urgencyStyle = 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-900';
                    }

                    return (
                      <div
                        key={item.opportunity_id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                              {item.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 ${urgencyStyle}`}>
                              <Clock className="w-3 h-3" />
                              <span>{urgencyLabel}</span>
                            </span>
                            {item.saved_status && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800">
                                {item.saved_status.toUpperCase()}
                              </span>
                            )}
                          </div>

                          <h3
                            onClick={() => onOpenDetail && onOpenDetail({ opportunity: { id: item.opportunity_id, title: item.title, organization: item.organization, category: item.category, deadline: item.deadline } })}
                            className="text-sm font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer truncate"
                          >
                            {item.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.organization}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Due: {item.deadline ? new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {onOpenDetail && (
                            <button
                              onClick={() => onOpenDetail({ opportunity: { id: item.opportunity_id, title: item.title, organization: item.organization, category: item.category, deadline: item.deadline } })}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
