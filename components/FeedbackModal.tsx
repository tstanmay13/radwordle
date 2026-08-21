'use client';

import { useState } from 'react';
import Link from 'next/link';
import ModalShell from './ui/ModalShell';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext?: string;
}

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'content', label: 'Content Issue' },
  { value: 'other', label: 'Other' },
];

const COOLDOWN_KEY = 'radiordle_feedback_cooldown';
const COOLDOWN_MS = 60000; // 1 minute between submissions

// Dark-glass field styling shared by the select + textarea. Native <option>
// list items get explicit dark text so they stay readable in the OS dropdown.
const FIELD_CLASS =
  'w-full px-4 py-3 rounded-xl font-medium outline-none transition-colors ' +
  'bg-white/[0.05] text-white border border-white/[0.14] focus:border-white/35';
const LABEL_CLASS = 'block text-white/60 mb-2 text-[11px] tracking-[0.1em] uppercase font-semibold';

export default function FeedbackModal({ isOpen, onClose, pageContext }: FeedbackModalProps) {
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check client-side cooldown
    const lastSubmit = localStorage.getItem(COOLDOWN_KEY);
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < COOLDOWN_MS) {
      setStatus('error');
      setErrorMessage('Please wait a moment before submitting again.');
      return;
    }

    if (!category) {
      setStatus('error');
      setErrorMessage('Please select a category.');
      return;
    }

    if (message.trim().length < 10) {
      setStatus('error');
      setErrorMessage('Message must be at least 10 characters.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          pageContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to submit feedback.');
        return;
      }

      // Success
      localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
      setStatus('success');
      setCategory('');
      setMessage('');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  return (
    <ModalShell onClose={handleClose} maxWidthClass="max-w-[460px]" ariaLabel="Send feedback">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-5">Send Feedback</h2>

      {status === 'success' ? (
        <div className="text-center">
          <div className="rounded-xl p-6 mb-5 bg-success">
            <p className="text-xl font-bold text-white mb-1">Thank you!</p>
            <p className="text-white/85">Your feedback has been submitted.</p>
          </div>
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 font-bold text-white rounded-xl transition-colors bg-white/10 hover:bg-white/[0.16]"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Category Select */}
          <label className={LABEL_CLASS}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${FIELD_CLASS} mb-4`}
            disabled={status === 'submitting'}
          >
            <option value="" className="text-gray-800">Select a category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="text-gray-800">
                {cat.label}
              </option>
            ))}
          </select>

          {/* Message Textarea */}
          <label className={LABEL_CLASS}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
            placeholder="Describe your feedback..."
            rows={5}
            className={`${FIELD_CLASS} resize-none placeholder:text-white/35`}
            disabled={status === 'submitting'}
          />
          <p className="text-white/40 text-xs mt-1 text-right mb-3">{message.length}/1000</p>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div
              className="rounded-lg p-3 mb-4"
              style={{ background: 'rgba(196,115,107,0.18)', border: '1px solid rgba(196,115,107,0.5)' }}
            >
              <p className="text-sm" style={{ color: '#ffd9d4' }}>{errorMessage}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 font-bold text-white/80 rounded-xl transition-colors bg-white/[0.07] hover:bg-white/[0.13] border border-white/10"
              disabled={status === 'submitting'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 font-bold text-black rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, var(--color-accent), var(--color-accent-light))' }}
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Submit'}
            </button>
          </div>

          {/* About Link */}
          <div className="mt-6 pt-4 border-t border-white/20 text-center">
            <Link
              href="/about"
              className="text-white/60 hover:text-white/90 text-sm transition-colors"
              onClick={handleClose}
            >
              Learn more about Radiordle
            </Link>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
