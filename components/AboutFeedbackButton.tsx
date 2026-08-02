'use client';

import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

/**
 * Client wrapper so the (server-rendered) About page can open the shared
 * FeedbackModal from its "Send Feedback" button instead of navigating away.
 */
export default function AboutFeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold bg-white/10 hover:bg-white/[0.16] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        Send Feedback
      </button>
      <FeedbackModal isOpen={open} onClose={() => setOpen(false)} pageContext="about" />
    </>
  );
}
