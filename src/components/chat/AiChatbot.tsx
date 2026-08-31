import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Zap,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { useRole } from '../../hooks/useRole';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  {
    icon: AlertTriangle,
    label: 'Triage Critical Issues',
    prompt: 'Please summarize all open critical and high priority eCommerce issues, and give me a prioritized remediation checklist.',
  },
  {
    icon: Zap,
    label: 'RCA Payment 504 Timeout',
    prompt: 'Conduct a root cause analysis for Stripe webhook 504 gateway timeouts during flash sales. What architectural mitigations should we apply?',
  },
  {
    icon: FileCode,
    label: 'Deployment Rollback Plan',
    prompt: 'Provide a step-by-step production deployment rollback checklist for Kubernetes pods and database schema migrations.',
  },
  {
    icon: ShieldCheck,
    label: 'Role Permissions Matrix',
    prompt: 'What are the exact differences in capabilities between Business Owner, Operations Admin, and Store Manager in this portal?',
  },
];

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentProject = useProjectStore((s) => s.currentProject);
  const user = useAuthStore((s) => s.user);
  const { role } = useRole();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      role: 'model',
      content: `👋 **Welcome to CommerceOps AI Copilot** (Gemini 3.7 Flash).

I'm connected to your eCommerce operations portal for **${currentProject?.name || 'Apex Storefront'}**.

You can ask me to:
- 🔍 **Diagnose incident root causes** (e.g. checkout errors, Redis latency, webhook drops)
- 📊 **Analyze telemetry logs** and deployment metrics
- 📋 **Generate action plans** for store issues and SLA triage
- 👥 **Clarify role-based permissions** for your team

How can I assist your operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            currentProject: currentProject
              ? {
                  id: currentProject.id,
                  name: currentProject.name,
                  clientName: currentProject.clientName,
                  code: currentProject.code,
                  clientDomain: currentProject.clientDomain,
                }
              : null,
            currentUser: user
              ? {
                  name: user.name,
                  role: user.role,
                  department: user.department,
                }
              : null,
            activeRole: role,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.text || data.fallbackText || 'I processed your request, but received no response.';

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `⚠️ **Unable to fetch response from Gemini API**\n\n*Error: ${err.message || 'Connection timeout'}*\n\nPlease make sure your server is running and the Gemini API key is configured.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `cleared_${Date.now()}`,
        role: 'model',
        content: `Conversation reset. How can I assist you with **${currentProject?.name || 'CommerceOps'}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          id="btn-open-gemini-ai"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow-xl hover:shadow-2xl hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer ring-2 ring-white/20"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          </div>
          <span className="font-bold text-xs tracking-wide">Ask CommerceOps AI</span>
        </motion.button>
      )}

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="gemini-ai-chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all ${
              isMinimized ? 'h-14 w-80' : 'h-[580px] w-[95vw] sm:w-[460px] md:w-[500px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-xs">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold truncate">CommerceOps AI Copilot</h3>
                    <span className="rounded bg-blue-500/20 px-1 py-0.2 text-[9px] font-mono font-medium text-blue-300 border border-blue-400/30">
                      gemini-3.7-flash
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Context: {currentProject?.name} ({role})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!isMinimized && (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear Chat History"
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expand' : 'Minimize'}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                >
                  {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Body (when not minimized) */}
            {!isMinimized && (
              <>
                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
                  {messages.map((msg) => {
                    const isBot = msg.role === 'model';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                      >
                        {isBot && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-2xs mt-0.5">
                            <Sparkles className="h-3 w-3 text-amber-300" />
                          </div>
                        )}

                        <div
                          className={`group relative max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                            isBot
                              ? 'border border-slate-200 bg-white text-slate-800 rounded-tl-xs'
                              : 'bg-blue-600 text-white rounded-tr-xs'
                          }`}
                        >
                          {isBot ? (
                            <div className="space-y-1.5 prose prose-xs max-w-none text-slate-800 dark:prose-invert">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}

                          <div
                            className={`mt-1.5 flex items-center justify-between gap-2 text-[10px] ${
                              isBot ? 'text-slate-400' : 'text-blue-200'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isBot && (
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.content, msg.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                                title="Copy message"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                                    <span className="text-[9px] text-emerald-600 font-semibold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-2.5 w-2.5" />
                                    <span className="text-[9px]">Copy</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {!isBot && (
                          <img
                            src={
                              user?.avatarUrl ||
                              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                            }
                            alt="User"
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                        )}
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white mt-0.5">
                        <Sparkles className="h-3 w-3 text-amber-300 animate-spin" />
                      </div>
                      <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white p-3 shadow-2xs">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                          <span className="text-[11px] text-slate-500 font-medium ml-1.5">
                            Gemini reasoning...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Carousel */}
                {messages.length < 3 && (
                  <div className="border-t border-slate-200/80 bg-white px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Quick Operations Prompts:
                    </p>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {QUICK_PROMPTS.map((qp, idx) => {
                        const Icon = qp.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(qp.prompt)}
                            disabled={loading}
                            className="flex items-center gap-1.5 shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Icon className="h-3 w-3 text-blue-600" />
                            <span>{qp.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Input Bar */}
                <div className="border-t border-slate-200 bg-white p-3">
                  <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Gemini about eCommerce errors, telemetry, root-causes..."
                      rows={1}
                      disabled={loading}
                      className="max-h-24 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <span>AI Studio Build Engine</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
