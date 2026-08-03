'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * ModalShell — the shared dark-glass modal frame used by the Results, Stats,
 * and Feedback modals (design foundation: radiordle-modals.jsx `ModalShell`).
 *
 * Renders a dimmed backdrop + a rounded navy-gradient panel that scrolls its
 * own overflow. Clicking the backdrop closes; clicks inside the panel don't
 * propagate. Body scroll is locked while mounted (the shell only mounts when a
 * modal is open), so individual modals no longer need their own lock effect.
 *
 * Backdrop is a flat translucent black (no backdrop-blur) — a static paint,
 * kept cheap per the redesign's "prefer static over animated blur" rule.
 */
interface ModalShellProps {
  onClose: () => void;
  children: ReactNode;
  /** Tailwind max-width class controlling panel width (default `max-w-[460px]`). */
  maxWidthClass?: string;
  /** Show the circular close (X) button in the top-right corner. */
  showClose?: boolean;
  /** Accessible label for the dialog when there's no visible labelled heading. */
  ariaLabel?: string;
  /** Optional test id applied to the backdrop element. */
  testId?: string;
}

const PANEL_STYLE = {
  background: 'linear-gradient(to bottom, var(--color-modal-bg), var(--color-page-bg-dark))',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
};

export default function ModalShell({
  onClose,
  children,
  maxWidthClass = 'max-w-[460px]',
  showClose = false,
  ariaLabel,
  testId,
}: ModalShellProps) {
  // Lock background scroll while the modal is mounted.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      data-testid={testId}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/55 animate-backdrop-fade"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`relative w-full ${maxWidthClass} rounded-2xl p-5 sm:p-7 overflow-y-auto max-h-[92vh] font-baloo-2 animate-modal-enter`}
        style={PANEL_STYLE}
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3.5 right-3.5 z-10 flex items-center justify-center w-[34px] h-[34px] rounded-full text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.12] transition-colors"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
