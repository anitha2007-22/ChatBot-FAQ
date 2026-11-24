import React, { useMemo, useState } from 'react';
import { Edit3, MessageSquare, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import type { FAQItem, TopicDataset } from '../data/faqDatasets';

interface KnowledgeBasePanelProps {
  dataset: TopicDataset;
  onAddFaq: () => void;
  onEditFaq: (faq: FAQItem) => void;
  onDeleteFaq: (faqId: string) => void;
  onTestFaqInChat: (question: string) => void;
  onResetDataset: () => void;
}

export const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({
  dataset,
  onAddFaq,
  onEditFaq,
  onDeleteFaq,
  onTestFaqInChat,
  onResetDataset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<string>('All');

  const intents = useMemo(() => {
    const unique = Array.from(new Set(dataset.faqs.map((f) => f.intent)));
    return ['All', ...unique];
  }, [dataset.faqs]);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dataset.faqs.filter((faq) => {
      const intentMatches = selectedIntent === 'All' || faq.intent === selectedIntent;
      if (!intentMatches) return false;
      if (!q) return true;
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.intent.toLowerCase().includes(q) ||
        faq.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [dataset.faqs, searchQuery, selectedIntent]);

  return (
    <section
      aria-label="Knowledge Base Manager"
      className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-slate-900"
    >
      {/* Header toolbar */}
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              {dataset.name} Knowledge Base
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {dataset.subtitle} ·{' '}
              <span className="tabular-nums">{dataset.faqs.length} FAQ entries indexed</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onResetDataset}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">Restore defaults</span>
            </button>
            <button
              type="button"
              onClick={onAddFaq}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="whitespace-nowrap">Add FAQ</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter questions, answers, or keywords..."
              aria-label="Filter FAQs"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {intents.map((intent) => (
              <button
                key={intent}
                type="button"
                onClick={() => setSelectedIntent(intent)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedIntent === intent
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {intent}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ list */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5">
        {filteredFaqs.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md rounded-xl border border-slate-200 bg-slate-50/70 p-8 text-center dark:border-slate-800 dark:bg-slate-800/30">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              No matching FAQs found
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Adjust your search terms or intent filter, or create a new FAQ entry to index it immediately.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {(searchQuery || selectedIntent !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIntent('All');
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  Clear filters
                </button>
              )}
              <button
                type="button"
                onClick={onAddFaq}
                className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                Add FAQ
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {filteredFaqs.map((faq) => (
              <article key={faq.id} className="p-5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-blue-700 dark:text-blue-400">
                        {faq.intent}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {faq.updatedAt}</span>
                      {faq.keywords.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                            {faq.keywords.slice(0, 5).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                      {faq.question}
                    </h2>
                    <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onTestFaqInChat(faq.question)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                    >
                      <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="whitespace-nowrap">Test</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${faq.question}`}
                      onClick={() => onEditFaq(faq)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${faq.question}`}
                      onClick={() => onDeleteFaq(faq.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
