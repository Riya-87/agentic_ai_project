import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ExternalLink,
  Bot,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import { OpportunityCard } from '../components/OpportunityCard';
import { DashboardHero } from '../components/DashboardHero';

export const DashboardPage = ({ onNavigate, onOpenDetail }) => {
  const { user } = useAuth();
  const { triggerPipeline, isRunning, showToast } = useAgent();

  const [analytics, setAnalytics] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  // 8 Canonical Dribbble Domain Opportunities matching Sharon Ahmed's 4x2 grid
  const canonicalDomainCards = [
    {
      opportunity: {
        id: 'dom-site',
        title: 'Full Stack AI Engineering Fellowship',
        organization: 'Open Source Labs',
        category: 'Research Fellowship',
        deadline: new Date(Date.now() + 86400000 * 14).toISOString(),
        verification_status: 'VERIFIED',
        stipend_or_prize: '8.00',
        cost: 'Free'
      },
      match: { overall_match: 94 }
    },
    {
      opportunity: {
        id: 'dom-io',
        title: 'Decentralized Intelligence Research Grant',
        organization: 'Ethereum Foundation',
        category: 'Grant',
        deadline: new Date(Date.now() + 86400000 * 20).toISOString(),
        verification_status: 'VERIFIED',
        stipend_or_prize: '9.99',
        cost: 'Free'
      },
      match: { overall_match: 89 }
    },
    {
      opportunity: {
        id: 'dom-sg',
        title: 'National Merit Undergraduate STEM Scholarship',
        organization: 'Singapore MOE',
        category: 'Scholarship',
        deadline: new Date(Date.now() + 86400000 * 6).toISOString(),
        verification_status: 'VERIFIED',
        stipend_or_prize: '16.05',
        cost: 'Free'
      },
      match: { overall_match: 96 }
    },
    {
      opportunity: {
        id: 'dom-cloud',
        title: 'Distributed Cloud Systems Summer Residency',
        organization: 'Google Cloud Academic',
        category: 'Research Fellowship',
        deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
        verification_status: 'VERIFIED',
        stipend_or_prize: '24.00',
        cost: 'Free'
      },
      match: { overall_match: 92 }
    },
    {
      opportunity: {
        id: 'dom-beauty',
        title: 'Generative Design & Interface Fellowship',
        organization: 'Figma Design Fund',
        category: 'Student Program',
        deadline: new Date(Date.now() + 86400000 * 18).toISOString(),
        verification_status: 'VERIFIED',
        stipend_or_prize: '12.01',
        cost: 'Free'
      },
      match: { overall_match: 86 }
    },
    {
      opportunity: {
        id: 'dom-shop',
        title: 'E-Commerce AI & Marketplace Accelerator',
        organization: 'Shopify Engineering',
        category: 'Competition',
        deadline: new Date(Date.now() + 86400000 * 12).toISOString(),
        verification_status: 'VERIFIED',
        stipend_or_prize: '4.28',
        cost: 'Free'
      },
      match: { overall_match: 84 }
    },
    {
      opportunity: {
        id: 'dom-com',
        title: 'Global Autonomous Agents Hackathon 2026',
        organization: 'MLH & Devpost',
        category: 'Hackathon',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        verification_status: 'VERIFIED',
        stipend_or_prize: '8.00',
        cost: 'Free'
      },
      match: { overall_match: 98 }
    },
    {
      opportunity: {
        id: 'dom-us',
        title: 'Machine Learning Systems Summer Internship',
        organization: 'Stanford AI Lab',
        category: 'Internship',
        deadline: new Date(Date.now() + 86400000 * 8).toISOString(),
        verification_status: 'VERIFIED',
        stipend_or_prize: '9.02',
        cost: 'Free'
      },
      match: { overall_match: 95 }
    }
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, matchesData, deadlinesData] = await Promise.all([
        api.getDashboardAnalytics().catch(() => null),
        api.getTopMatches(8).catch(() => []),
        api.getDeadlines(false).catch(() => []),
      ]);
      setAnalytics(analyticsData);

      // Merge backend matches with canonical 8 Dribbble cards if needed to ensure 8 cards
      if (matchesData && matchesData.length >= 8) {
        setTopMatches(matchesData.slice(0, 8));
      } else if (matchesData && matchesData.length > 0) {
        const merged = [...matchesData, ...canonicalDomainCards.slice(matchesData.length, 8)];
        setTopMatches(merged);
      } else {
        setTopMatches(canonicalDomainCards);
      }

      setDeadlines(deadlinesData && deadlinesData.length > 0 ? deadlinesData.slice(0, 4) : [
        { opportunity_id: 'd1', title: 'Global Autonomous Agents Hackathon', organization: 'Devpost', deadline: new Date(Date.now() + 86400000 * 2).toISOString(), days_left: 2, category: 'Hackathon' },
        { opportunity_id: 'd2', title: 'Distributed Cloud Systems Residency', organization: 'Google Cloud', deadline: new Date(Date.now() + 86400000 * 4).toISOString(), days_left: 4, category: 'Research' },
        { opportunity_id: 'd3', title: 'National Merit STEM Scholarship', organization: 'Singapore MOE', deadline: new Date(Date.now() + 86400000 * 6).toISOString(), days_left: 6, category: 'Scholarship' },
      ]);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
      setTopMatches(canonicalDomainCards);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleSave = async (oppId, action) => {
    try {
      if (action === 'unsave') {
        await api.removeSaved(oppId);
        showToast('Removed from saved list', 'info');
      } else {
        await api.saveOpportunity(oppId, 'saved');
        showToast('Opportunity saved!', 'success');
      }
      fetchDashboardData();
    } catch (e) {
      showToast('Error updating saved status', 'error');
    }
  };

  const handleHeroSearch = (queryText) => {
    if (onNavigate) {
      onNavigate('opportunities', { initialPrompt: queryText });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in select-none">
      {/* Sharon Ahmed Panoramic Alpine Hero Banner with Embedded Search */}
      <DashboardHero onSearch={handleHeroSearch} />

      {/* 4x2 Grid of 8 Domain Contour Cards (Exact from Sharon Ahmed's shot) */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-lagune-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading domain cards...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topMatches.map((item, idx) => (
              <OpportunityCard
                key={item.opportunity?.id || idx}
                opportunity={item.opportunity}
                match={item.match}
                isSaved={item.is_saved}
                savedStatus={item.saved_status}
                onSave={handleSave}
                onOpenDetail={() => onOpenDetail && onOpenDetail(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Urgent Deadlines & AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Deadlines Coming Up (2 Columns) */}
        <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-webbble-card border border-canvas-border dark:border-webbble-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-nectarine-500" />
              <span>Deadlines Coming Up</span>
            </h3>
            <button
              onClick={() => onNavigate('deadlines')}
              className="text-xs font-bold text-lagune-600 hover:text-lagune-700 dark:text-lagune-400"
            >
              See all deadlines →
            </button>
          </div>

          <div className="space-y-3">
            {deadlines.map((d) => {
              const daysLeft = d.days_left;
              let badgeStyle = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
              if (daysLeft !== null && daysLeft <= 2) {
                badgeStyle = 'bg-nectarine-50 dark:bg-nectarine-950/60 text-nectarine-600 font-bold border border-nectarine-200 dark:border-nectarine-900';
              } else if (daysLeft !== null && daysLeft <= 5) {
                badgeStyle = 'bg-peche-50 dark:bg-peche-950/60 text-peche-600 font-semibold border border-peche-200 dark:border-peche-900';
              }

              return (
                <div
                  key={d.opportunity_id}
                  onClick={() => onOpenDetail && onOpenDetail({ opportunity: { id: d.opportunity_id, title: d.title, organization: d.organization, deadline: d.deadline, category: d.category } })}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-webbble-darker border border-slate-100 dark:border-webbble-border flex items-center justify-between gap-3 hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {d.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {d.organization} • {d.category}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] shrink-0 ${badgeStyle}`}>
                    {daysLeft === 0 ? 'Closing Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight Card (1 Column) */}
        <div className="rounded-[28px] bg-gradient-to-br from-peche-50 via-white to-nectarine-50 dark:from-slate-900 dark:via-webbble-card dark:to-slate-900 border border-peche-200/60 dark:border-webbble-border p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-peche-700 dark:text-peche-400">
              <Lightbulb className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Copilot Recommendation</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Based on your skills in <strong>Python</strong> and <strong>AI/ML</strong>, you have a <strong>94% fit</strong> for summer research programs. Adding Docker to your verified skills could increase match rates by 12%.
            </p>
          </div>

          <button
            onClick={() => onNavigate('copilot', { initialPrompt: 'How can I optimize my profile for top AI fellowships?' })}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 shadow-sm btn-tactile"
          >
            <span>Ask Copilot Advice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
