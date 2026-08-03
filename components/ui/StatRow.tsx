'use client';

import { ReactNode } from 'react';

/**
 * StatRow — the four accent-tinted stat cards (Played / Win% / Streak / Max)
 * shared by the Results and Stats modals (design foundation:
 * radiordle-modals.jsx `StatCard` / `StatRow`).
 *
 * Each card is a flat accent-tinted gradient with a thin top hairline — all
 * static paints, no blur or animation. Per-card accent colors are applied via
 * inline style since they're dynamic per card.
 */
interface StatRowStats {
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
}

interface StatRowProps {
  stats: StatRowStats;
  /** Whole-number win percentage (already computed by the caller). */
  winRate: number;
}

function StatCard({
  value,
  label,
  accent,
  icon,
}: {
  value: number | string;
  label: string;
  accent: string;
  icon: ReactNode;
}) {
  return (
    <div
      className="relative rounded-xl px-1 pt-[11px] pb-2.5 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(155deg, ${accent}26 0%, rgba(255,255,255,0.025) 74%)`,
        border: `1px solid ${accent}4d`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div style={{ color: accent }} className="mb-[5px]">
        {icon}
      </div>
      <p className="font-extrabold leading-none text-[22px]" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-[5px] text-[9px] tracking-[0.1em] uppercase text-white/50">{label}</p>
    </div>
  );
}

// Design SVG icons, inlined so the row has no external icon-name dependency.
const ICON = {
  played: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  ),
  win: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  ),
  streak: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1.5.7-2.8 1.4-3.8C9 8 9.5 9 10.5 9 11 6 12 2 12 2z" />
    </svg>
  ),
  max: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v3a6 6 0 0 1-12 0V4z" /><path d="M6 5H4a2 2 0 0 0 2 2M18 5h2a2 2 0 0 1-2 2" /><line x1="12" y1="13" x2="12" y2="17" /><path d="M9 20h6M10 20l.5-3h3l.5 3" />
    </svg>
  ),
};

export default function StatRow({ stats, winRate }: StatRowProps) {
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <StatCard value={stats.gamesPlayed} label="Played" accent="#8fb3e6" icon={ICON.played} />
      <StatCard value={winRate} label="Win %" accent="#74cdab" icon={ICON.win} />
      <StatCard value={stats.currentStreak} label="Streak" accent="#fbbf24" icon={ICON.streak} />
      <StatCard value={stats.maxStreak} label="Max Streak" accent="#c4a7ef" icon={ICON.max} />
    </div>
  );
}
