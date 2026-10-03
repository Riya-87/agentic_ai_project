import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';

export const CopilotPage = ({ initialPrompt = '', onOpenDetail }) => {
  const { user, profile } = useAuth();
  const { showToast } = useAgent();

  const suggestedActions = [
    { label: '🎯 Find opportunities for me', query: 'Find the top academic opportunities that match my profile and skills.' },
    { label: '⏰ Check my deadlines', query: 'Which opportunities have urgent deadlines closing in the next 7 days?' },
    { label: '🤖 Find free AI internships', query: 'Find free AI and machine learning internships for undergraduate students.' },
    { label: '📊 Explain my matches', query: 'Explain how my academic background and skills match with current opportunities.' },
  ];

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I'm your **Academic Intelligence Copilot**.\n\nI have active context of your **${profile?.branch || 'Computer Science'}** major (${profile?.academic_year || 'Undergraduate'}) and skills (**${(profile?.skills || ['Python', 'AI/ML', 'React']).slice(0, 5).join(', ')}**).\n\nHow can I help you discover and prioritize academic opportunities today?`,
      timestamp: new Date().toISOString(),
      agent_steps: [
        'Initialized Academic Copilot agent runtime',
        `Retrieved student profile (${profile?.branch || 'CS'}, ${profile?.academic_year || 'UG'})`,
        'Connected to live opportunities knowledge base',
      ],
      references: [],
      suggested_followups: suggestedActions.map(a => a.query),
    },
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt !== input) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  const toggleSteps = (idx) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      references: [],
      agent_steps: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendAssistantMessage(query, historyPayload);

      const assistantMessage = {
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toISOString(),
        agent_steps: res.agent_steps || [
          'Understood user goal in context of student profile',
          'Searched verified opportunities database',
          'Computed match breakdown and ranked results',
          'Formulated actionable recommendations',
        ],
        references: res.references || [],
        suggested_followups: res.suggested_followups || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      console.error('Error sending copilot message:', e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an issue connecting to the AI model. Please check your network and API key settings.',
          timestamp: new Date().toISOString(),
          agent_steps: ['Encountered runtime error during inference'],
          references: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Academic Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized guidance, opportunity recommendations, and application strategies
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 no-scrollbar">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] space-y-3 ${
                  isUser
                    ? 'bg-slate-900 dark:bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm'
                }`}
              >
                {/* Message Content */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-2">
                  {msg.content}
                </div>

                {/* Agent Reasoning Steps Toggle (Assistant only) */}
                {!isUser && msg.agent_steps && msg.agent_steps.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => toggleSteps(idx)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span>{expandedSteps[idx] ? 'Hide Reasoning' : 'View AI Reasoning'}</span>
                      {expandedSteps[idx] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {expandedSteps[idx] && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 animate-fade-in">
                        {msg.agent_steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* References / Opportunities Cards */}
                {!isUser && msg.references && msg.references.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400">Referenced Opportunities:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.references.map((ref, rIdx) => (
                        <div
                          key={rIdx}
                          onClick={() => onOpenDetail && onOpenDetail({ opportunity: ref })}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-500 cursor-pointer transition-all space-y-1"
                        >
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {ref.title}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>{ref.organization}</span>
                            <span className="text-brand-600 dark:text-brand-400 font-bold">View →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons (Copy) */}
                {!isUser && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => copyToClipboard(msg.content, idx)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-[11px] flex items-center gap-1 transition-colors"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-500" />
              <span>Analyzing academic repositories and reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Action Pills */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {suggestedActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(action.query)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 whitespace-nowrap transition-colors shadow-sm shrink-0"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask anything about opportunities, deadlines, or tailored application advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-24 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
