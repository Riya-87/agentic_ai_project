import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  Award,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Send,
  Link,
  ShieldCheck,
  Globe,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { MatchBadge } from './MatchBadge';

export const OpportunityDetailModal = ({
  item,
  isOpen,
  onClose,
  onSave,
  onUpdateStatus
}) => {
  if (!isOpen || !item) return null;

  const { opportunity: opp, match, is_saved, saved_status } = item;
  const [currentStatus, setCurrentStatus] = useState(saved_status || (is_saved ? 'saved' : ''));
  const [notes, setNotes] = useState('');

  const deadlineFormatted = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Ongoing / Open Rolling';

  const lastCheckedFormatted = opp.updated_at
    ? new Date(opp.updated_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '2 hours ago';

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    if (onUpdateStatus) {
      onUpdateStatus(opp.id, newStatus, notes);
    } else if (onSave) {
      onSave(opp.id, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-fade-in my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-bold uppercase tracking-wider">
                {opp.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                {opp.mode}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                {opp.cost}
              </span>
              
              {opp.is_demo ? (
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-mono border border-slate-300 dark:border-slate-700">
                  DEMO DATA
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE DATA
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {opp.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Building2 className="w-4 h-4 text-brand-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{opp.organization}</span>
              <span>•</span>
              <span>{opp.location}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          {/* AI Matching Intelligence Breakdown Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-500/5 via-brand-500/10 to-indigo-500/5 border border-brand-500/20">
            <div className="flex items-center justify-between pb-3 border-b border-brand-500/10 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Transparent Match System
                </h4>
              </div>
              <MatchBadge match={match} size="md" showDropdown={false} />
            </div>

            {/* Why it matches */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Match Explanation: </span>
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {match?.explanation || 'High overall alignment with your academic degree, listed skills, and category interests.'}
                </span>
              </div>

              {/* Bulleted Why This Matches Reasons */}
              {match?.match_reasons?.length > 0 && (
                <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-850/70 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Detailed Alignment Breakdown
                  </p>
                  {match.match_reasons.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      {r.type === 'positive' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{r.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {match?.missing_requirements && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
                  <span className="font-bold">Missing Reqs & Prep Tips: </span>
                  <span>{match.missing_requirements}</span>
                </div>
              )}

              {/* Dimensional Metrics Progress */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Skill Fit</p>
                  <p className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                    {Math.round(match?.skill_match || 0)}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Eligibility</p>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {Math.round(match?.eligibility_match || 0)}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Interests</p>
                  <p className="text-base font-extrabold text-purple-600 dark:text-purple-400">
                    {Math.round(match?.interest_match || 0)}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Academic Year</p>
                  <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    {Math.round(match?.academic_year_match || 100)}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Deadline Score</p>
                  <p className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                    {Math.round(match?.deadline_urgency || 0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span>Application Deadline</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {deadlineFormatted}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Perks / Prizes / Stipend</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {opp.stipend_or_prize || 'Certificates & Mentorship'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Opportunity Description & Overview
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80 text-sm leading-relaxed whitespace-pre-line">
              {opp.description}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Eligibility Requirements
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80 text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700 dark:text-slate-300">{opp.eligibility}</p>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Required Skills & Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {opp.required_skills?.map((sk, idx) => {
                const isMatched = match?.matched_skills?.includes(sk);
                return (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                      isMatched
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isMatched ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="text-slate-400">○</span>}
                    {sk}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Provenance & Multi-Source Attribution Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {opp.verification_status === 'VERIFIED' ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>✓ Verified Official Portal</span>
                  </span>
                ) : opp.verification_status === 'PUBLIC SOURCE' ? (
                  <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                    <Globe className="w-4 h-4" />
                    <span>🌐 Public Web Source Verified</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>⚠️ Unverified Public Source</span>
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-[11px]">
                Last checked: {lastCheckedFormatted}
              </span>
            </div>

            {/* Multiple Sources Listing */}
            {opp.sources && opp.sources.length > 0 ? (
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Discovered Across {opp.sources.length} Public Sources & Aggregators:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {opp.sources.map((src, sIdx) => (
                    <a
                      key={sIdx}
                      href={src.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                          {src.source_name || 'Web Source'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {src.source_type || 'search_result'}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Source Provider</span>
                  <span className="font-semibold">{opp.source_name || 'Official Institution Portal'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Organization</span>
                  <span className="font-semibold">{opp.organization}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Data Provenance</span>
                  <span className="font-semibold">{opp.is_demo ? 'Academic Seed Archive' : 'Autonomous Web Discovery'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-wrap items-center justify-between gap-4">
          {/* Tracking Status Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">My Status:</span>
            {['saved', 'in_progress', 'applied'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(currentStatus === st ? '' : st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                  currentStatus === st
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                }`}
              >
                {st === 'in_progress' ? 'In Progress' : st}
              </button>
            ))}
          </div>

          {/* Official Apply Link Button */}
          <div className="flex items-center gap-3">
            <a
              href={opp.official_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all"
            >
              <span>Visit Official Website ↗</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

