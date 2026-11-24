import React, { useMemo, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import type { TopicDataset } from '../data/faqDatasets';
import {
  matchUserQuery,
  type FaqVectorIndex,
  type MatchingStrategy,
} from '../nlp/engine';

interface NlpWorkbenchViewProps {
  dataset: TopicDataset;
  vectorIndex: FaqVectorIndex;
  strategy: MatchingStrategy;
  threshold: number;
  onRunInChat: (query: string) => void;
}

export const NlpWorkbenchView: React.FC<NlpWorkbenchViewProps> = ({
  dataset,
  vectorIndex,
  strategy,
  threshold,
  onRunInChat,
}) => {
  const [sandboxQuery, setSandboxQuery] = useState(
    dataset.sampleQueries[0] ?? 'How do I recover deleted files?'
  );

  const analysis = useMemo(
    () => matchUserQuery(sandboxQuery, vectorIndex, strategy, threshold),
    [sandboxQuery, vectorIndex, strategy, threshold]
  );

  const topVocab = useMemo(() => vectorIndex.vocabulary.slice(0, 28), [vectorIndex.vocabulary]);

  return (
    <section
      aria-label="NLP Workbench & Cosine Matrix"
      className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              NLP Preprocessing & TF-IDF Cosine Workbench
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Test how raw natural language is tokenized, cleaned, stemmed, and scored against{' '}
              {dataset.name} ({vectorIndex.vocabulary.length} unique stems indexed).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRunInChat(sandboxQuery)}
            disabled={!sandboxQuery.trim()}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-45"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="whitespace-nowrap">Send query in Chat</span>
          </button>
        </div>

        {/* Live query test input */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30">
          <label
            htmlFor="workbench-query-input"
            className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Test Query Input
          </label>
          <input
            id="workbench-query-input"
            type="text"
            value={sandboxQuery}
            onChange={(e) => setSandboxQuery(e.target.value)}
            placeholder="Type any user question to watch the NLP pipeline live..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />

          {/* 4-stage horizontal pipeline */}
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                1. Contraction & Clean
              </div>
              <div className="mt-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                {analysis.pipeline.cleaned || '—'}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                2. Word Tokens ({analysis.pipeline.tokens.length})
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {analysis.pipeline.tokens.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                3. Stopwords Removed ({analysis.pipeline.removedStopwords.length})
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {analysis.pipeline.removedStopwords.length === 0 ? (
                  <span className="text-xs text-slate-400">None</span>
                ) : (
                  analysis.pipeline.removedStopwords.map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-400 line-through dark:border-slate-800 dark:text-slate-500"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                4. Normalized Stems ({analysis.pipeline.stems.length})
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {analysis.pipeline.stems.map((stem, i) => (
                  <span
                    key={`${stem}-${i}`}
                    className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50/70 px-1.5 py-0.5 font-mono text-[11px] font-medium text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300"
                  >
                    {stem}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full FAQ Similarity Matrix Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              All FAQ Candidate Scores
            </h2>
            <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
              Computed in {analysis.processingTimeMs} ms
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Rank</th>
                  <th className="px-4 py-2.5 font-medium">FAQ Question</th>
                  <th className="px-4 py-2.5 font-medium">Intent</th>
                  <th className="px-4 py-2.5 font-medium">Matched Terms</th>
                  <th className="px-4 py-2.5 text-right font-medium">Cosine</th>
                  <th className="px-4 py-2.5 text-right font-medium">Intent</th>
                  <th className="px-4 py-2.5 text-right font-medium">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {analysis.candidates.map((cand, idx) => {
                  const isWinner = idx === 0 && !analysis.isFallback;
                  return (
                    <tr
                      key={cand.faq.id}
                      className={
                        isWinner
                          ? 'bg-blue-50/50 dark:bg-blue-950/20'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                      }
                    >
                      <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="max-w-xs px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {cand.faq.question}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {cand.faq.intent}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {cand.matchedTerms.length > 0 ? cand.matchedTerms.join(', ') : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums dark:text-slate-300">
                        {cand.cosineSimilarity.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums dark:text-slate-300">
                        {cand.intentScore.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                        <span
                          className={
                            isWinner
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }
                        >
                          {(cand.finalScore * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Corpus TF-IDF Vocabulary Snapshot */}
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Indexed Corpus Vocabulary (Top IDF Terms)
            </h2>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Higher IDF = stronger topic specificity</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {topVocab.map((entry) => (
              <div
                key={entry.term}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <span className="truncate font-mono text-[11px] text-slate-800 dark:text-slate-200">
                  {entry.term}
                </span>
                <span className="ml-1.5 shrink-0 font-mono text-[11px] text-slate-500 tabular-nums">
                  {entry.idf.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
