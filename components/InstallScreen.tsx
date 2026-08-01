'use client';

import { useState, ReactNode, CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Install (PWA) instructions screen (design foundation: radiordle-install.jsx).
 *
 * A mobile-first "Add to Home Screen" walkthrough with a Safari / Chrome tab
 * switcher and three illustrated step cards per browser. The browser chrome,
 * menus and pointer arrows are static mock illustrations (inline-styled to stay
 * pixel-precise); nothing here animates continuously.
 */

type Browser = 'safari' | 'chrome';

const AMBER_GRADIENT = 'linear-gradient(to bottom, #fbbf24, #f59e0b)';

/* ---- Red hand-drawn pointer arrow ---- */
function RedArrow({ style, flip = false, width = 70 }: { style?: CSSProperties; flip?: boolean; width?: number }) {
  return (
    <svg
      viewBox="0 0 100 60"
      width={width}
      style={{ position: 'absolute', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    >
      <defs>
        <marker id="rh" markerWidth="7" markerHeight="7" refX="4" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#ef4444" />
        </marker>
      </defs>
      <path d="M4 30 Q 45 8, 88 28" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" markerEnd="url(#rh)" />
    </svg>
  );
}

/* ---- Mock UI pieces ---- */
function MockStatusBar() {
  return (
    <div className="flex items-center justify-between px-3.5 text-white h-[26px] text-[11px] font-semibold">
      <span className="flex items-center gap-1">
        10:32
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M3 11l18-8-8 18-2-8-8-2z" /></svg>
      </span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="11" viewBox="0 0 24 16" fill="#fff"><rect x="0" y="10" width="3" height="6" rx="1" /><rect x="5" y="7" width="3" height="9" rx="1" /><rect x="10" y="4" width="3" height="12" rx="1" /><rect x="15" y="1" width="3" height="15" rx="1" opacity="0.4" /></svg>
        <svg width="15" height="11" viewBox="0 0 24 18" fill="#fff"><path d="M12 3C7 3 3 6 1 9l11 9 11-9c-2-3-6-6-11-6z" opacity="0.95" /></svg>
        <span className="inline-block w-5 h-[11px] border border-white rounded-[3px] relative mr-0.5">
          <span className="absolute inset-[1px] w-[70%] bg-[#37d67a] rounded-[1px]" />
        </span>
      </div>
    </div>
  );
}

function MockShareIcon({ highlight }: { highlight?: boolean }) {
  return (
    <span
      className="flex items-center justify-center rounded-md w-[30px] h-[30px]"
      style={{ background: highlight ? 'rgba(245,158,11,0.25)' : 'transparent', outline: highlight ? '2px solid #f59e0b' : 'none' }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#cfd8e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4" /><path d="m8 8 4-4 4 4" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /></svg>
    </span>
  );
}

function MockBrowser({ browser, highlightShare, highlightMenu }: { browser: Browser; highlightShare?: boolean; highlightMenu?: boolean }) {
  return (
    <div className="overflow-hidden rounded-t-xl bg-[#0c1733]">
      <MockStatusBar />
      {/* address bar */}
      <div className="flex items-center gap-2 mx-3 mb-2 px-3 rounded-lg h-[34px] bg-white/10">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        <span className="flex-1 text-center text-white/70 text-[12px]">radiordle.org</span>
        {browser === 'safari' ? (
          <MockShareIcon highlight={highlightShare} />
        ) : (
          <span
            className="flex items-center justify-center rounded-md w-7 h-7"
            style={{ background: highlightMenu ? 'rgba(245,158,11,0.25)' : 'transparent', outline: highlightMenu ? '2px solid #f59e0b' : 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>
          </span>
        )}
      </div>
      {/* radiordle mini top bar */}
      <div className="flex items-center justify-between px-3 h-10 bg-white/[0.05] border-t border-white/[0.08]">
        <div className="flex items-center gap-1">
          <Image src="/radle_icon.svg" alt="" width={20} height={20} className="object-contain" />
          <span className="font-baloo-2 font-extrabold text-white text-[13px]">Radiordle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-md text-white/80 text-[10px] px-[7px] py-1 bg-white/[0.12]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 12 5 5 5-5" /><path d="M5 21h14" /></svg>
            Install
          </span>
          <span className="flex items-center justify-center rounded-md w-[22px] h-[22px]" style={{ background: AMBER_GRADIENT }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
          </span>
        </div>
      </div>
      <div className="h-9 bg-[#0c1733]" />
    </div>
  );
}

type MenuRow = [string, string, boolean?];

function MenuIcon({ k }: { k: string }) {
  const c = { stroke: 'rgba(255,255,255,0.65)', strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (k === 'plus') return <svg width="18" height="18" viewBox="0 0 24 24" {...c} stroke="#fff"><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
  if (k === 'desktop') return <svg width="18" height="18" viewBox="0 0 24 24" {...c}><rect x="2" y="4" width="20" height="13" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /></svg>;
  if (k === 'doc') return <svg width="18" height="18" viewBox="0 0 24 24" {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>;
  return <svg width="18" height="18" viewBox="0 0 24 24" {...c}><circle cx="12" cy="12" r="9" /></svg>;
}

function MockMenu({ browser }: { browser: Browser }) {
  const rows: MenuRow[] = browser === 'safari'
    ? [['Find on Page', 'doc'], ['Request Desktop Site', 'desktop'], ['Add to Home Screen', 'plus', true], ['Add to Reading List', 'glasses'], ['Open in Chrome', 'chrome']]
    : [['Downloads', 'down'], ['Bookmarks', 'star'], ['Recent tabs', 'clock'], ['Add to Home screen', 'plus', true], ['Settings', 'gear']];
  return (
    <div className="rounded-xl overflow-hidden bg-[#1d2433] border border-white/[0.08]">
      {rows.map(([label, k, hl], i) => (
        <div
          key={i}
          className="relative flex items-center justify-between px-4 h-11"
          style={{ background: hl ? 'rgba(255,255,255,0.08)' : 'transparent', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
        >
          <span className="text-white text-sm" style={{ fontWeight: hl ? 700 : 400 }}>{label}</span>
          <MenuIcon k={k} />
          {hl && <RedArrow width={64} style={{ right: 44, top: -4 }} flip />}
        </div>
      ))}
    </div>
  );
}

function MockHomeIcon() {
  return (
    <div className="flex flex-col items-center justify-center py-5" style={{ background: 'linear-gradient(160deg,#4a5578,#2d3550)' }}>
      <div className="flex items-center justify-center w-[70px] h-[70px] rounded-[17px] bg-[#0c1733] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
        <Image src="/radle_icon.svg" alt="" width={46} height={46} className="object-contain" />
      </div>
      <span className="text-white mt-2 text-[12px] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Radiordle</span>
    </div>
  );
}

/* ---- Step card ---- */
function StepCard({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl p-4 sm:p-5 bg-white/[0.05] border border-white/10">
      <div className="flex items-center gap-3 mb-3.5">
        <span
          className="flex items-center justify-center rounded-full font-baloo-2 font-extrabold text-black flex-shrink-0 w-[34px] h-[34px] text-[17px]"
          style={{ background: AMBER_GRADIENT, boxShadow: '0 3px 10px rgba(245,158,11,0.4)' }}
        >
          {n}
        </span>
        <h3 className="font-baloo-2 font-extrabold text-white leading-tight text-[19px]">{title}</h3>
      </div>
      <div className="rounded-xl overflow-hidden border border-white/[0.08]">{children}</div>
    </section>
  );
}

/* ---- Steps per browser ---- */
function SafariSteps() {
  return (
    <>
      <StepCard n="1" title="Tap the Share icon">
        <div className="relative"><MockBrowser browser="safari" highlightShare /><RedArrow width={78} style={{ right: 36, top: 30 }} /></div>
      </StepCard>
      <StepCard n="2" title="Tap “Add to Home Screen”">
        <div className="p-3 bg-[#11182b]"><MockMenu browser="safari" /></div>
      </StepCard>
      <StepCard n="3" title="Tap the icon to launch">
        <MockHomeIcon />
      </StepCard>
    </>
  );
}

function ChromeSteps() {
  return (
    <>
      <StepCard n="1" title="Tap the menu (⋮)">
        <div className="relative"><MockBrowser browser="chrome" highlightMenu /><RedArrow width={70} style={{ right: 38, top: 30 }} /></div>
      </StepCard>
      <StepCard n="2" title="Tap “Add to Home screen”">
        <div className="p-3 bg-[#11182b]"><MockMenu browser="chrome" /></div>
      </StepCard>
      <StepCard n="3" title="Tap the icon to launch">
        <MockHomeIcon />
      </StepCard>
    </>
  );
}

function TabBtn({ label, icon, active, onClick }: { label: string; icon: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 font-baloo-2 font-bold rounded-xl h-11 text-[15px] transition-all"
      style={{
        color: active ? '#000' : 'rgba(255,255,255,0.75)',
        background: active ? AMBER_GRADIENT : 'rgba(255,255,255,0.06)',
        border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
        boxShadow: active ? '0 4px 14px rgba(245,158,11,0.4)' : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default function InstallScreen() {
  const [tab, setTab] = useState<Browser>('safari');

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Link
          href="/"
          aria-label="Back to game"
          className="flex items-center justify-center rounded-xl text-white w-11 h-11 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </Link>
        <Link href="/" className="flex items-center gap-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <Image src="/radle_icon.svg" alt="" width={36} height={36} className="object-contain" />
          <span className="text-white font-baloo-2 font-extrabold tracking-tight text-[1.4rem]">Radiordle</span>
        </Link>
        <div className="w-11" />
      </div>

      {/* Hero */}
      <div className="px-4 pb-2 text-center">
        <div
          className="mx-auto mb-3 flex items-center justify-center rounded-2xl w-[62px] h-[62px]"
          style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24' }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 12 5 5 5-5" /><path d="M5 21h14" /></svg>
        </div>
        <h2 className="text-2xl text-white font-baloo-2 font-extrabold">Install Radiordle</h2>
        <p className="text-white/60 mt-1 font-baloo-2 text-sm px-4">
          Add Radiordle to your home screen for a full-screen, app-like experience.
        </p>
      </div>

      {/* Sticky tab switcher */}
      <div className="px-4 py-4 sticky top-0 z-10" style={{ background: 'linear-gradient(to bottom,#0d1631,rgba(13,22,49,0.92) 70%,transparent)' }}>
        <div className="flex gap-2.5">
          <TabBtn label="Safari" active={tab === 'safari'} onClick={() => setTab('safari')} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9.5" /><path d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor" stroke="none" /></svg>} />
          <TabBtn label="Chrome" active={tab === 'chrome'} onClick={() => setTab('chrome')} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="3.2" /><path d="M12 8.8h8.5M8.8 13.6 4.6 6.7M15.2 13.6l-4.2 7.3" /></svg>} />
        </div>
      </div>

      {/* Steps (key re-mounts to replay the fade on tab switch) */}
      <div key={tab} className="px-4 pb-12 space-y-4" style={{ animation: 'fadeIn 0.25s ease-out' }}>
        {tab === 'safari' ? <SafariSteps /> : <ChromeSteps />}
        <p className="text-white/40 text-center text-xs font-baloo-2 pt-2">
          Once installed, open Radiordle right from your home screen — no browser bars.
        </p>
      </div>
    </div>
  );
}
