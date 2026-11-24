import React from 'react';
import { ArrowRight, CheckCircle2, Filter, Layers, Scissors } from 'lucide-react';
import type { MatchResult } from '../nlp/engine';

interface NlpInspectorPanelProps {
  queryText: string | null;
  matchResult: MatchResult | null;
  onSelectQuerySuggestion?: (question: string) => void;
}

export const NlpInspectorPanel: React.FC<NlpInspectorPanelProps> = ({
  queryText,
  matchResult,
  onSelectQuerySuggestion,
}) => {
  if (!matchResult || !queryText) {
    return (
      <aside
        aria-label="NLP Pipeline Inspector"
        className="flex h-full flex-col justify-center border-l border-slate-200 bg-slate-50/70 p-6 text-center dark:border-slate-800 dark:bg-slate-950/60"
      >
        <div className="mx-auto max-w-xs">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            NLP Pipeline Inspector
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Send any question in the chat to inspect tokenization, stopword removal, stemming, and TF-IDF cosine similarity scores in real time.
          </p>
        </div>
      </aside>
    );
  }

  const { pipeline, candidates, bestMatch, threshold, processingTimeMs } = matchResult;
  const topCandidates = candidates.slice(0, 4);

  return (
    <aside
      aria-label="NLP Pipeline Inspector"
      className="custom-scrollbar flex h-full flex-col overflow-y-auto border-l border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/60"
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
        <div>
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            NLP Pipeline Inspector
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {pipeline.tokens.length} tokens · {pipeline.stems.length} stems · {processingTimeMs} ms
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            bestMatch
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-amber-700 dark:text-amber-400'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{bestMatch ? 'Matched' : 'Fallback'}</span>
        </span>
      </div>

      {/* Step 1: Raw & Cleaned Text */}
      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Scissors className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>01. Normalization & Cleaning</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="text-slate-400 dark:text-slate-500">Raw query</div>
            <div className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
              “{pipeline.raw}”
            </div>
            <div className="mt-2.5 text-slate-400 dark:text-slate-500">
              Lowercased, expanded & cleaned
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              {pipeline.cleaned || '(empty after cleaning)'}
            </div>
          </div>
        </div>

        {/* Step 2: Tokenization & Stopword Filtering */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>02. Tokens & Stopword Removal</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              {pipeline.removedStopwords.length} dropped
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            {pipeline.tokens.length === 0 ? (
              <p className="text-xs text-slate-400">No tokens extracted.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {pipeline.tokens.map((tok, idx) => {
                  const isStop = pipeline.removedStopwords.includes(tok);
                  return (
                    <span
                      key={`${tok}-${idx}`}
                      className={`rounded border px-2 py-0.5 font-mono text-[11px] ${
                        isStop
                          ? 'border-slate-200 bg-slate-50 text-slate-400 line-through dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'
                          : 'border-blue-200 bg-blue-50/70 text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300'
                      }`}
                    >
                      {tok}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Stemming / Lemmatization */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
            <span>03. Lemmas, Stems & Bigrams</span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              {pipeline.stems.length} features
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            {pipeline.filteredTokens.length === 0 ? (
              <p className="text-xs text-slate-400">No meaningful stems remaining.</p>
            ) : (
              <div className="space-y-1.5">
                {pipeline.filteredTokens.map((tok, idx) => {
                  const stem = pipeline.stems[idx] ?? tok;
                  return (
                    <div
                      key={`${tok}-${idx}`}
                      className="flex items-center justify-between font-mono text-[11px]"
                    >
                      <span className="text-slate-500 dark:text-slate-400">{tok}</span>
                      <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                        <span className="font-medium text-blue-700 dark:text-blue-400">
                          {stem}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {pipeline.bigrams.length > 0 && (
              <div className="mt-2.5 border-t border-slate-100 pt-2 dark:border-slate-800">
                <div className="mb-1 text-[11px] text-slate-400">Extracted bigrams</div>
                <div className="flex flex-wrap gap-1.5">
                  {pipeline.bigrams.map((bg) => (
                    <span
                      key={bg}
                      className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {bg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Top Candidate Cosine Ranking */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
            <span>04. Candidate Similarity Ranking</span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              Min {Math.round(threshold * 100)}%
            </span>
          </div>
          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {topCandidates.map((cand, index) => {
              const pct = Math.round(cand.finalScore * 100);
              const passes = cand.finalScore >= threshold && index === 0 && !matchResult.isFallback;
              return (
                <div key={cand.faq.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectQuerySuggestion?.(cand.faq.question)}
                      className="text-left text-xs font-medium leading-snug text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                    >
                      {index + 1}. {cand.faq.question}
                    </button>
                    <span
                      className={`shrink-0 font-mono text-xs font-semibold tabular-nums ${
                        passes
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Visual similarity bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        passes ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    <span>Cosine {cand.cosineSimilarity.toFixed(2)}</span>
                    <span aria-hidden="true">·</span>
                    <span>Intent {cand.intentScore.toFixed(2)}</span>
                    {cand.matchedTerms.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate font-sans">
                          Hits: {cand.matchedTerms.slice(0, 4).join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
