import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Layers,
  MessageSquare,
  Moon,
  Plus,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react';
import { ChatPanel, type ChatMessage } from './components/ChatPanel';
import { FaqModal } from './components/FaqModal';
import { KnowledgeBasePanel } from './components/KnowledgeBasePanel';
import { NlpInspectorPanel } from './components/NlpInspectorPanel';
import { NlpWorkbenchView } from './components/NlpWorkbenchView';
import { INITIAL_DATASETS, type FAQItem, type TopicDataset } from './data/faqDatasets';
import {
  buildFaqIndex,
  matchUserQuery,
  type MatchingStrategy,
} from './nlp/engine';

type ActiveView = 'chat' | 'kb' | 'workbench';

const STORAGE_KEY_DATASETS = 'nitha_faq_datasets_v2';
const STORAGE_KEY_THEME = 'nitha_theme_v1';

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createGreetingMessage(dataset: TopicDataset): ChatMessage {
  return {
    id: `greet-${dataset.id}-${Date.now()}`,
    role: 'assistant',
    text: dataset.greeting,
    timestamp: formatTime(),
  };
}

export default function App() {
  const [datasets, setDatasets] = useState<TopicDataset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATASETS);
      if (saved) {
        const parsed = JSON.parse(saved) as TopicDataset[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial datasets
    }
    return INITIAL_DATASETS;
  });

  const [activeDatasetId, setActiveDatasetId] = useState<string>(datasets[0].id);
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const [strategy, setStrategy] = useState<MatchingStrategy>('hybrid');
  const [threshold, setThreshold] = useState<number>(0.2);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_THEME) === 'dark';
    } catch {
      return false;
    }
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeDatasetId) ?? datasets[0],
    [datasets, activeDatasetId]
  );

  // Per-topic chat histories so switching topics preserves conversation
  const [chatByTopic, setChatByTopic] = useState<Record<string, ChatMessage[]>>(() => {
    const map: Record<string, ChatMessage[]> = {};
    for (const ds of datasets) {
      map[ds.id] = [createGreetingMessage(ds)];
    }
    return map;
  });

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify(datasets));
    } catch {
      // Ignore storage quota issues
    }
  }, [datasets]);

  const vectorIndex = useMemo(
    () => buildFaqIndex(activeDataset.faqs),
    [activeDataset.faqs]
  );

  const activeMessages = chatByTopic[activeDataset.id] ?? [
    createGreetingMessage(activeDataset),
  ];

  // Determine which assistant turn is displayed in the live NLP inspector
  const inspectedMessage = useMemo(() => {
    if (selectedMessageId) {
      const found = activeMessages.find(
        (m) => m.id === selectedMessageId && m.matchResult
      );
      if (found) return found;
    }
    for (let i = activeMessages.length - 1; i >= 0; i--) {
      if (activeMessages[i].role === 'assistant' && activeMessages[i].matchResult) {
        return activeMessages[i];
      }
    }
    return null;
  }, [activeMessages, selectedMessageId]);

  const handleSendMessage = (rawText: string) => {
    const query = rawText.trim();
    if (!query) return;

    const timestamp = formatTime();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      text: query,
      timestamp,
    };

    const matchResult = matchUserQuery(query, vectorIndex, strategy, threshold);

    const botText = matchResult.bestMatch
      ? matchResult.bestMatch.faq.answer
      : `I couldn't find an FAQ matching "${query}" above your ${Math.round(
          threshold * 100
        )}% confidence threshold. Try rephrasing with product keywords or pick one of the closest topics below.`;

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'assistant',
      text: botText,
      timestamp,
      queryText: query,
      matchResult,
      feedback: null,
    };

    setChatByTopic((prev) => ({
      ...prev,
      [activeDataset.id]: [...(prev[activeDataset.id] ?? []), userMsg, botMsg],
    }));
    setSelectedMessageId(botMsg.id);
    if (activeView !== 'chat') {
      setActiveView('chat');
    }
  };

  const handleClearChat = () => {
    setChatByTopic((prev) => ({
      ...prev,
      [activeDataset.id]: [createGreetingMessage(activeDataset)],
    }));
    setSelectedMessageId(null);
  };

  const handleFeedback = (msgId: string, vote: 'up' | 'down') => {
    setChatByTopic((prev) => ({
      ...prev,
      [activeDataset.id]: (prev[activeDataset.id] ?? []).map((m) =>
        m.id === msgId
          ? { ...m, feedback: m.feedback === vote ? null : vote }
          : m
      ),
    }));
  };

  const handleSaveFaq = (data: {
    question: string;
    answer: string;
    intent: string;
    keywords: string[];
  }) => {
    const todayLabel = new Date().toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    setDatasets((prev) =>
      prev.map((ds) => {
        if (ds.id !== activeDataset.id) return ds;
        if (editingFaq) {
          return {
            ...ds,
            faqs: ds.faqs.map((item) =>
              item.id === editingFaq.id
                ? { ...item, ...data, updatedAt: todayLabel }
                : item
            ),
          };
        }
        const newFaq: FAQItem = {
          id: `custom-${Date.now()}`,
          question: data.question,
          answer: data.answer,
          intent: data.intent,
          keywords: data.keywords,
          updatedAt: todayLabel,
        };
        return {
          ...ds,
          faqs: [newFaq, ...ds.faqs],
        };
      })
    );
    setEditingFaq(null);
  };

  const handleDeleteFaq = (faqId: string) => {
    setDatasets((prev) =>
      prev.map((ds) =>
        ds.id === activeDataset.id
          ? { ...ds, faqs: ds.faqs.filter((f) => f.id !== faqId) }
          : ds
      )
    );
  };

  const handleResetDataset = () => {
    const original = INITIAL_DATASETS.find((d) => d.id === activeDataset.id);
    if (!original) return;
    setDatasets((prev) =>
      prev.map((ds) => (ds.id === activeDataset.id ? original : ds))
    );
  };

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Topic selector */}
        <div>
          <h2 className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Topic Knowledge Base
          </h2>
          <div className="space-y-1.5">
            {datasets.map((ds) => {
              const active = ds.id === activeDataset.id;
              return (
                <button
                  key={ds.id}
                  type="button"
                  onClick={() => {
                    setActiveDatasetId(ds.id);
                    setSelectedMessageId(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    active
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 dark:border-blue-500/80 dark:bg-blue-950/40 dark:text-blue-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate text-xs font-semibold">{ds.name}</div>
                    <div className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {ds.faqs.length} FAQs
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* NLP Matching Strategy */}
        <div>
          <h2 className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            NLP Matching Strategy
          </h2>
          <div className="space-y-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/80">
            {(
              [
                { id: 'hybrid', label: 'Hybrid (Cosine + Intent)' },
                { id: 'cosine', label: 'TF-IDF Cosine Similarity' },
                { id: 'intent', label: 'Intent & Keyword Match' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStrategy(opt.id)}
                className={`w-full rounded-md px-2.5 py-2 text-left text-xs font-medium whitespace-nowrap transition-colors ${
                  strategy === opt.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Similarity Threshold */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="threshold-slider"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              Confidence Threshold
            </label>
            <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums dark:text-slate-200">
              {Math.round(threshold * 100)}%
            </span>
          </div>
          <input
            id="threshold-slider"
            type="range"
            min={0.1}
            max={0.6}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Queries scoring below {Math.round(threshold * 100)}% trigger a fallback response with suggested topics.
          </p>
        </div>

        {/* Quick Prompts */}
        <div>
          <h2 className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sample Questions
          </h2>
          <div className="space-y-1.5">
            {activeDataset.sampleQueries.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  handleSendMessage(q);
                  setMobileSidebarOpen(false);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-[11px] leading-snug text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Theme switch & vocabulary summary */}
      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Indexed vocabulary</span>
          <span className="font-mono font-medium text-slate-800 tabular-nums dark:text-slate-200">
            {vectorIndex.vocabulary.length} stems
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 text-slate-500" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Strict 3-zone Top Bar Contract */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-8 border-b border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('chat');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 dark:text-white"
        >
          Nitha
        </a>

        {/* Zone 2: Concise single-line navigation tabs */}
        <nav
          aria-label="Primary Workspace Views"
          className="flex items-center gap-4 text-xs font-medium sm:gap-6 sm:text-sm"
        >
          <button
            type="button"
            onClick={() => setActiveView('chat')}
            className={`relative flex h-14 items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'chat'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span className="md:hidden">Chat</span>
            <span className="hidden md:inline">Chat Assistant</span>
            {activeView === 'chat' && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('kb')}
            className={`relative flex h-14 items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'kb'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span className="md:hidden">FAQs</span>
            <span className="hidden md:inline">Knowledge Base</span>
            {activeView === 'kb' && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('workbench')}
            className={`relative flex h-14 items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'workbench'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span className="md:hidden">NLP</span>
            <span className="hidden md:inline">NLP Workbench</span>
            {activeView === 'workbench' && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setEditingFaq(null);
              setModalOpen(true);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add FAQ</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="custom-scrollbar hidden w-[268px] shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/70 lg:block dark:border-slate-800 dark:bg-slate-950/60">
          {SidebarContent}
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside className="relative z-10 h-full w-[280px] overflow-y-auto border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  <span>Workspace Configuration</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close configuration"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/60 dark:text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {SidebarContent}
            </aside>
          </div>
        )}

        {/* Active View Stage */}
        <main className="flex min-h-0 flex-1 overflow-hidden">
          {activeView === 'chat' && (
            <div className="flex h-full min-h-0 w-full">
              <ChatPanel
                dataset={activeDataset}
                messages={activeMessages}
                strategy={strategy}
                threshold={threshold}
                selectedMessageId={inspectedMessage?.id ?? null}
                onSelectMessage={(id) => setSelectedMessageId(id)}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearChat}
                onFeedback={handleFeedback}
                onOpenMobileSettings={() => setMobileSidebarOpen(true)}
              />
              <div className="hidden w-[360px] shrink-0 xl:block">
                <NlpInspectorPanel
                  queryText={inspectedMessage?.queryText ?? null}
                  matchResult={inspectedMessage?.matchResult ?? null}
                  onSelectQuerySuggestion={handleSendMessage}
                />
              </div>
            </div>
          )}

          {activeView === 'kb' && (
            <KnowledgeBasePanel
              dataset={activeDataset}
              onAddFaq={() => {
                setEditingFaq(null);
                setModalOpen(true);
              }}
              onEditFaq={(faq) => {
                setEditingFaq(faq);
                setModalOpen(true);
              }}
              onDeleteFaq={handleDeleteFaq}
              onTestFaqInChat={(question) => handleSendMessage(question)}
              onResetDataset={handleResetDataset}
            />
          )}

          {activeView === 'workbench' && (
            <NlpWorkbenchView
              dataset={activeDataset}
              vectorIndex={vectorIndex}
              strategy={strategy}
              threshold={threshold}
              onRunInChat={(q) => handleSendMessage(q)}
            />
          )}
        </main>
      </div>

      {/* Add / Edit FAQ Modal */}
      <FaqModal
        isOpen={modalOpen}
        editingFaq={editingFaq}
        onClose={() => {
          setModalOpen(false);
          setEditingFaq(null);
        }}
        onSave={handleSaveFaq}
      />
    </div>
  );
}
