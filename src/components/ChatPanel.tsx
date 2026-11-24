import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Check,
  Copy,
  MessageSquareText,
  RotateCcw,
  SlidersHorizontal,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { FAQItem, TopicDataset } from '../data/faqDatasets';
import type { MatchResult, MatchingStrategy } from '../nlp/engine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  queryText?: string;
  matchResult?: MatchResult;
  feedback?: 'up' | 'down' | null;
}

interface ChatPanelProps {
  dataset: TopicDataset;
  messages: ChatMessage[];
  strategy: MatchingStrategy;
  threshold: number;
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onFeedback: (id: string, vote: 'up' | 'down') => void;
  onOpenMobileSettings: () => void;
}

const STRATEGY_LABELS: Record<MatchingStrategy, string> = {
  hybrid: 'Hybrid (Cosine + Intent)',
  cosine: 'TF-IDF Cosine Similarity',
  intent: 'Intent & Keyword Match',
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  dataset,
  messages,
  strategy,
  threshold,
  selectedMessageId,
  onSelectMessage,
  onSendMessage,
  onClearChat,
  onFeedback,
  onOpenMobileSettings,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
    } catch {
      // Clipboard fallback ignored silently
    }
  };

  const getSuggestedFollowUps = (matchedFaq?: FAQItem | null): FAQItem[] => {
    if (!matchedFaq) return dataset.faqs.slice(0, 2);
    return dataset.faqs.filter((f) => f.id !== matchedFaq.id).slice(0, 2);
  };

  return (
    <section
      aria-label="FAQ Chat Conversation"
      className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-slate-900"
    >
      {/* Context bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <div className="min-w-0">
          <h1 className="truncate font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            {dataset.name}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="tabular-nums">{dataset.faqs.length} indexed FAQs</span>
            <span aria-hidden="true">·</span>
            <span>{STRATEGY_LABELS[strategy]}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Min threshold {Math.round(threshold * 100)}%</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileSettings}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Config</span>
          </button>
          <button
            type="button"
            onClick={onClearChat}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="whitespace-nowrap">Reset chat</span>
          </button>
        </div>
      </div>

      {/* Chat message stream */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-end"
                >
                  <div className="max-w-[85%] rounded-xl rounded-br-sm bg-blue-600 px-4 py-3 text-[15px] leading-relaxed text-white">
                    {msg.text}
                  </div>
                  <span className="mt-1.5 text-xs text-slate-400 tabular-nums dark:text-slate-500">
                    You · {msg.timestamp}
                  </span>
                </motion.div>
              );
            }

            const result = msg.matchResult;
            const isSelected = selectedMessageId === msg.id;
            const best = result?.bestMatch ?? null;
            const isFallback = result?.isFallback ?? false;
            const followUps = result ? getSuggestedFollowUps(best?.faq) : [];

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-start"
              >
                <div
                  className={`w-full max-w-[92%] rounded-xl rounded-bl-sm border p-4 transition-colors ${
                    isSelected
                      ? 'border-blue-400 bg-slate-50/90 dark:border-blue-500/70 dark:bg-slate-800/80'
                      : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  {best && (
                    <div className="mb-2 border-b border-slate-200/80 pb-2 text-xs text-slate-500 dark:border-slate-700/80 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        Matched FAQ:
                      </span>{' '}
                      {best.faq.question}
                    </div>
                  )}

                  <p className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">
                    {msg.text}
                  </p>

                  {/* Fallback suggestions when similarity is below threshold */}
                  {isFallback && result && result.candidates.length > 0 && (
                    <div className="mt-4 border-t border-slate-200/80 pt-3 dark:border-slate-700/80">
                      <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        Closest topics in {dataset.name}:
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {result.candidates.slice(0, 3).map((candidate) => (
                          <button
                            key={candidate.faq.id}
                            type="button"
                            onClick={() => onSendMessage(candidate.faq.question)}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                          >
                            <span className="truncate">{candidate.faq.question}</span>
                            <span className="shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
                              {Math.round(candidate.finalScore * 100)}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related follow-up questions on successful match */}
                  {best && followUps.length > 0 && (
                    <div className="mt-3.5 border-t border-slate-200/70 pt-3 dark:border-slate-700/70">
                      <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                        Related questions
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {followUps.map((faq) => (
                          <button
                            key={faq.id}
                            type="button"
                            onClick={() => onSendMessage(faq.question)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                          >
                            {faq.question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean metadata + action bar */}
                  {result && (
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-2.5 text-xs text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>
                          {best ? best.faq.intent : 'Below threshold'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Score{' '}
                          {Math.round(
                            (best?.finalScore ?? result.topCandidate?.finalScore ?? 0) * 100
                          )}
                          %
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Cosine{' '}
                          {(
                            best?.cosineSimilarity ??
                            result.topCandidate?.cosineSimilarity ??
                            0
                          ).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectMessage(msg.id)}
                          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          {isSelected ? 'Inspecting' : 'Inspect NLP'}
                        </button>
                        <button
                          type="button"
                          aria-label="Copy answer"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          aria-label="Mark answer helpful"
                          onClick={() => onFeedback(msg.id, 'up')}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                            msg.feedback === 'up'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Mark answer not helpful"
                          onClick={() => onFeedback(msg.id, 'down')}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                            msg.feedback === 'down'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className="mt-1.5 text-xs text-slate-400 tabular-nums dark:text-slate-500">
                  Nitha · {msg.timestamp}
                </span>
              </motion.div>
            );
          })}

          {/* Starter sample questions shown cleanly when conversation only has greeting */}
          {messages.length <= 1 && (
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <MessageSquareText className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>Try a sample question to test NLP matching</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {dataset.sampleQueries.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => onSendMessage(sample)}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-medium leading-snug text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Message composer */}
      <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-center gap-3">
          <label htmlFor="faq-chat-input" className="sr-only">
            Ask Nitha a question about {dataset.name}
          </label>
          <input
            ref={inputRef}
            id="faq-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Nitha about ${dataset.name}...`}
            className="h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>Send</span>
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
};
