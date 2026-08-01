'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BarChart3, Info, MessageCircle, Archive, Menu, Download } from 'lucide-react';
import GlassIconButton from './ui/GlassIconButton';
import AccentButton from './ui/AccentButton';

/**
 * Glass top navigation bar (design: radiordle-screens.jsx `TopBar`).
 *
 * Renders two layouts side by side and lets CSS pick one — matching the app's
 * existing dual-layout convention so SSR and the `:visible` e2e selectors keep
 * working:
 *   - Desktop (>= sm): Stats / About / Feedback on the left, centered wordmark,
 *     Archives accent button on the right.
 *   - Mobile (< sm): hamburger menu (Install / About / Feedback / Stats),
 *     centered wordmark, compact Archive accent button.
 *
 * The bar uses the shared glass tokens. Its `backdrop-filter` blur sits over the
 * static (non-animated) page background, so it only re-rasterizes on scroll.
 */
interface TopBarProps {
  onStats: () => void;
  onFeedback: () => void;
}

const barStyle = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  borderBottom: 'var(--glass-border)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
};

const menuStyle = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: 'var(--glass-border)',
  boxShadow: 'var(--glass-shadow)',
  minWidth: 190,
};

function Wordmark({ iconSize, textClass }: { iconSize: number; textClass: string }) {
  return (
    <Link
      href="/"
      aria-label="Radiordle home"
      className="flex items-center gap-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
    >
      <span className="relative block flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
        <Image src="/radle_icon.svg" alt="Radiordle" fill className="object-contain" />
      </span>
      <span className={`font-baloo-2 font-extrabold text-white tracking-tight leading-none ${textClass}`}>
        Radiordle
      </span>
    </Link>
  );
}

export default function TopBar({ onStats, onFeedback }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ---- Desktop bar ---- */}
      <div className="hidden sm:flex items-center px-8 h-[84px] flex-shrink-0 z-[60]" style={barStyle}>
        <div className="flex-1 flex items-center justify-start gap-1">
          <button
            type="button"
            onClick={onStats}
            title="Stats"
            aria-label="Stats"
            className="flex items-center gap-2 h-11 px-3.5 rounded-xl text-base font-baloo-2 font-bold
                       text-white/85 hover:text-white bg-white/[0.06] hover:bg-white/[0.13]
                       border border-white/[0.12] transition-colors"
          >
            <BarChart3 size={20} />
            <span>Stats</span>
          </button>
          <GlassIconButton label="About" href="/about">
            <Info size={22} />
          </GlassIconButton>
          <GlassIconButton label="Feedback" onClick={onFeedback}>
            <MessageCircle size={21} />
          </GlassIconButton>
        </div>

        <Wordmark iconSize={46} textClass="text-[1.9rem]" />

        <div className="flex-1 flex items-center justify-end">
          <AccentButton icon={<Archive size={19} />} label="Archives" href="/archive" />
        </div>
      </div>

      {/* ---- Mobile bar ---- */}
      <div className="relative flex sm:hidden flex-col flex-shrink-0 z-[60]">
        <div className="flex items-center justify-between px-3 h-14" style={barStyle}>
          <GlassIconButton label="Menu" size={40} onClick={() => setMenuOpen((m) => !m)}>
            <Menu size={22} />
          </GlassIconButton>
          <Wordmark iconSize={34} textClass="text-[1.45rem]" />
          <AccentButton icon={<Archive size={17} />} label="Archive" compact href="/archive" />
        </div>

        {menuOpen && (
          <>
            {/* Click-away layer */}
            <div className="fixed inset-0 z-[55]" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <div className="absolute left-3 top-[60px] z-[61] rounded-xl overflow-hidden" style={menuStyle}>
              <Link
                href="/install"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-white font-baloo-2 font-semibold
                           border-b border-white/10 transition-colors hover:bg-white/10"
              >
                <span className="text-white/80">
                  <Download size={18} />
                </span>
                Install
              </Link>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-white font-baloo-2 font-semibold
                           border-b border-white/10 transition-colors hover:bg-white/10"
              >
                <span className="text-white/80">
                  <Info size={18} />
                </span>
                About
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onFeedback();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-white font-baloo-2 font-semibold
                           border-b border-white/10 transition-colors hover:bg-white/10"
              >
                <span className="text-white/80">
                  <MessageCircle size={18} />
                </span>
                Feedback
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onStats();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-white font-baloo-2 font-semibold
                           transition-colors hover:bg-white/10"
              >
                <span className="text-white/80">
                  <BarChart3 size={18} />
                </span>
                Stats
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
