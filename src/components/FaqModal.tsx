import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { FAQItem } from '../data/faqDatasets';

interface FaqModalProps {
  isOpen: boolean;
  editingFaq: FAQItem | null;
  onClose: () => void;
  onSave: (data: { question: string; answer: string; intent: string; keywords: string[] }) => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({
  isOpen,
  editingFaq,
  onClose,
  onSave,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [intent, setIntent] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuestion(editingFaq?.question ?? '');
      setAnswer(editingFaq?.answer ?? '');
      setIntent(editingFaq?.intent ?? '');
      setKeywordsText(editingFaq?.keywords.join(', ') ?? '');
      setError('');
    }
  }, [isOpen, editingFaq]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError('Both a question and an answer are required.');
      return;
    }

    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    onSave({
      question: question.trim(),
      answer: answer.trim(),
      intent: intent.trim() || 'General',
      keywords,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 id="faq-modal-title" className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            {editingFaq ? 'Edit FAQ Entry' : 'Add New FAQ Entry'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="faq-q" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Question
            </label>
            <input
              id="faq-q"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How do I export my workspace audit logs?"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label htmlFor="faq-a" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Answer
            </label>
            <textarea
              id="faq-a"
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write a clear, concise answer that the chatbot will return when matched."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="faq-intent" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Intent Category
              </label>
              <input
                id="faq-intent"
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g., Account Security"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>

            <div>
              <label htmlFor="faq-keywords" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Intent Keywords (comma-separated)
              </label>
              <input
                id="faq-keywords"
                type="text"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="e.g., export, audit, logs, csv"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700"
            >
              {editingFaq ? 'Save changes' : 'Add and index FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
