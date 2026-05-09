'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Send, Loader2, Trash2, Bot, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STARTER_PROMPTS, type AppSection } from './build-system-prompt';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date }

interface Props {
  section: AppSection;
  dataSnapshot?: string;
  onClose: () => void;
}

export function AskAIPanel({ section, dataSnapshot, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: 'user', content, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ask-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          section,
          dataSnapshot,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      setMessages((prev) => [...prev, { role: 'assistant', content: data.content, timestamp: new Date() }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [messages, loading, section, dataSnapshot]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const starters = STARTER_PROMPTS[section] || STARTER_PROMPTS.general;
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <div className="fixed inset-0 z-[79] bg-black/20 sm:hidden" onClick={onClose} />

      <div className="fixed bottom-20 right-4 z-[80] w-full max-w-sm sm:max-w-md h-[70vh] sm:h-[600px] flex flex-col bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="font-semibold text-sm">Ask AI</span>
            <span className="text-xs text-indigo-200 capitalize bg-white/20 px-2 py-0.5 rounded-full">
              {section.replace(/-/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMessages([])} title="Clear chat"
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">How can I help?</p>
              <p className="text-xs text-gray-400 mb-6">Ask anything about your job search.</p>
              <div className="space-y-2 w-full">
                {starters.map((prompt) => (
                  <button key={prompt} onClick={() => sendMessage(prompt)}
                    className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700')}>
                {msg.role === 'user'
                  ? <User className="w-3.5 h-3.5 text-white" />
                  : <Bot className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />}
              </div>
              <div className={cn('max-w-[85%] space-y-1', msg.role === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn(
                  'rounded-2xl px-3 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
                <p className="text-[10px] text-gray-400 px-1">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2.5">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs border border-red-200 dark:border-red-800">
              ⚠ {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
              disabled={loading}
              className="input flex-1 resize-none min-h-[40px] max-h-[120px] py-2.5 text-sm"
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
            />
            <button onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="btn-primary p-2.5 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
