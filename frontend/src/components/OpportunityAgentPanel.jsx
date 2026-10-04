import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Bot,
  User,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

export const OpportunityAgentPanel = ({
  onSelectOpportunity,
  onApplyFilters,
  isOpen = true,
  onToggle
}) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 **Hi! I'm your AI Opportunity Discovery Agent.**\n\nTell me what you're interested in (e.g. *\"Machine Learning\"*, *\"Remote Web Dev internships\"*, or *\"AI Hackathons\"*). I maintain conversational memory, rank results using our **6-Factor Matching Engine**, and help refine your search step-by-step!",
      suggestedActions: ['Machine Learning', 'Remote Internships', 'AI Hackathons', 'Research Fellowships']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [latestOpportunities, setLatestOpportunities] = useState([]);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend = null) => {
    const text = textToSend || inputValue;
    if (!text || !text.trim() || loading) return;

    const userMsg = text.trim();
    setInputValue('');

    // Append user message immediately
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.agentChat(userMsg, sessionId);
      if (res.session_id) {
        setSessionId(res.session_id);
      }
      if (res.active_filters) {
        setActiveFilters(res.active_filters);
        if (onApplyFilters) {
          onApplyFilters(res.active_filters, res.opportunities);
        }
      }
      if (res.opportunities && res.opportunities.length > 0) {
        setLatestOpportunities(res.opportunities);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          opportunities: res.opportunities || [],
          suggestedActions: res.suggested_actions || [],
          comparison: res.comparison || null,
          explanation: res.explanation || null
        }
      ]);
    } catch (err) {
      console.error('Agent chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Oops, I encountered an issue processing that query: ${err.message || 'Please check your connection and try again.'}`,
          suggestedActions: ['Try again', 'Show active opportunities']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = async () => {
    if (sessionId) {
      try {
        await api.agentResetSession(sessionId);
      } catch (e) {
        console.warn('Failed to reset session on server:', e);
      }
    }
    setSessionId(null);
    setActiveFilters({});
    setLatestOpportunities([]);
    setMessages([
      {
        role: 'assistant',
        content: '🔄 **Session reset.** What new domain, role, or opportunity shall we explore next?',
        suggestedActions: ['Machine Learning', 'Remote Internships', 'Summer 2026', 'Competitions']
      }
    ]);
  };

  // Convert simple markdown formatting (bold, bullet points)
  const formatMarkdown = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold handling
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li
            key={idx}
            className="ml-4 list-disc text-xs leading-relaxed text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*]\s*/, '') }}
          />
        );
      }
      if (line.trim().match(/^\d+\.\s/)) {
        return (
          <div
            key={idx}
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 mb-0.5"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p
          key={idx}
          className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 mb-1"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  // Extract active filter labels
  const filterPills = Object.entries(activeFilters).filter(
    ([k, v]) => v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '')
  );

  return (
    <div
      className={`h-full flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 relative ${
        isOpen ? 'w-full md:w-[380px] lg:w-[420px]' : 'w-0 overflow-hidden'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Opportunity Agent
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Groq AI" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Multi-turn Discovery & 6-Factor Matching
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetSession}
            title="Reset Conversation Memory"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {onToggle && (
            <button
              onClick={onToggle}
              title="Close Agent Panel"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Memory Bar */}
      {filterPills.length > 0 && (
        <div className="px-4 py-2 bg-brand-50/60 dark:bg-brand-950/20 border-b border-brand-100/50 dark:border-brand-900/30 flex items-center gap-1.5 flex-wrap shrink-0">
          <SlidersHorizontal className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0 mr-1" />
          <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
            Memory:
          </span>
          {filterPills.map(([k, v]) => (
            <span
              key={k}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-brand-200 dark:border-brand-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs"
            >
              {k}: {Array.isArray(v) ? v.join(', ') : String(v)}
            </span>
          ))}
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-3.5 h-3.5 text-brand-400" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-brand-600 rounded-tr-xs'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-xs'
                }`}
              >
                {isUser ? (
                  <p className="text-xs leading-relaxed">{msg.content}</p>
                ) : (
                  <div>{formatMarkdown(msg.content)}</div>
                )}

                {/* Inline Recommended Opportunities Carousel */}
                {msg.opportunities && msg.opportunities.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-brand-500" />
                      Shortlisted Opportunities ({msg.opportunities.length})
                    </p>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {msg.opportunities.slice(0, 4).map((opp) => (
                        <div
                          key={opp.id}
                          onClick={() => onSelectOpportunity && onSelectOpportunity(opp)}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 cursor-pointer transition-all hover:shadow-sm group flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600">
                              {opp.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span>{opp.organization}</span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {Math.round(opp.match_score || 85)}% Match
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-brand-500 transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && !isUser && (
                  <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(act)}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>{act}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 items-start animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-3.5 h-3.5 text-brand-400 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Agent reasoning across 6 dimensions...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3.5 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-850/50 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search, refine, or ask 'Which is best?'..."
            disabled={loading}
            className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="absolute right-1.5 p-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
