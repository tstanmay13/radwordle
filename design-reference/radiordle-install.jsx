/* =========================================================
   Radiordle — Install instructions screen (mobile only)
   ========================================================= */
const { useState: iUseState } = React;

/* ---- Red hand-drawn pointer arrow ---- */
function RedArrow({ style, rotate = 0, flip = false, width = 70 }) {
  return (
    <svg viewBox="0 0 100 60" width={width} style={{ position: 'absolute', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', transform: `rotate(${rotate}deg) ${flip ? 'scaleX(-1)' : ''}`, ...style }}>
      <defs><marker id="rh" markerWidth="7" markerHeight="7" refX="4" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#ef4444" /></marker></defs>
      <path d="M4 30 Q 45 8, 88 28" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" markerEnd="url(#rh)" />
    </svg>
  );
}

/* ---- Mock UI pieces ---- */
function MockStatusBar() {
  return (
    <div className="flex items-center justify-between px-3.5 text-white" style={{ height: 26, fontSize: 11, fontWeight: 600 }}>
      <span className="flex items-center gap-1">10:32 <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M3 11l18-8-8 18-2-8-8-2z" /></svg></span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="11" viewBox="0 0 24 16" fill="#fff"><rect x="0" y="10" width="3" height="6" rx="1" /><rect x="5" y="7" width="3" height="9" rx="1" /><rect x="10" y="4" width="3" height="12" rx="1" /><rect x="15" y="1" width="3" height="15" rx="1" opacity="0.4" /></svg>
        <svg width="15" height="11" viewBox="0 0 24 18" fill="#fff"><path d="M12 3C7 3 3 6 1 9l11 9 11-9c-2-3-6-6-11-6z" opacity="0.95" /></svg>
        <span className="flex items-center" style={{ fontSize: 9 }}><span style={{ display: 'inline-block', width: 20, height: 11, border: '1px solid #fff', borderRadius: 3, position: 'relative', marginRight: 2 }}><span style={{ position: 'absolute', inset: 1, width: '70%', background: '#37d67a', borderRadius: 1 }}></span></span></span>
      </div>
    </div>
  );
}

function MockShareIcon({ highlight }) {
  return (
    <span className="flex items-center justify-center rounded-md" style={{ width: 30, height: 30, background: highlight ? 'rgba(245,158,11,0.25)' : 'transparent', outline: highlight ? '2px solid #f59e0b' : 'none' }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#cfd8e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4" /><path d="m8 8 4-4 4 4" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /></svg>
    </span>
  );
}

function MockBrowser({ browser, highlightShare, highlightMenu }) {
  return (
    <div className="overflow-hidden rounded-t-xl" style={{ background: '#0c1733' }}>
      <MockStatusBar />
      {/* address bar */}
      <div className="flex items-center gap-2 mx-3 mb-2 px-3 rounded-lg" style={{ height: 34, background: 'rgba(255,255,255,0.10)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        <span className="flex-1 text-center text-white/70" style={{ fontSize: 12 }}>radiordle.org</span>
        {browser === 'safari'
          ? <MockShareIcon highlight={highlightShare} />
          : <span className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: highlightMenu ? 'rgba(245,158,11,0.25)' : 'transparent', outline: highlightMenu ? '2px solid #f59e0b' : 'none' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg></span>}
      </div>
      {/* radiordle mini top bar */}
      <div className="flex items-center justify-between px-3" style={{ height: 40, background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-1">
          <img src="assets/radle_icon.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          <span className="font-baloo font-extrabold text-white" style={{ fontSize: 13 }}>Radiordle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-md text-white/80" style={{ fontSize: 10, padding: '4px 7px', background: 'rgba(255,255,255,0.12)' }}><InstallIcon size={11} />Install</span>
          <span className="flex items-center justify-center rounded-md" style={{ width: 22, height: 22, background: 'linear-gradient(to bottom,#fbbf24,#f59e0b)' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg></span>
        </div>
      </div>
      <div style={{ height: 36, background: '#0c1733' }}></div>
    </div>
  );
}

function MockMenu({ browser }) {
  const rows = browser === 'safari'
    ? [['Find on Page', 'doc'], ['Request Desktop Site', 'desktop'], ['Add to Home Screen', 'plus', true], ['Add to Reading List', 'glasses'], ['Open in Chrome', 'chrome']]
    : [['Downloads', 'down'], ['Bookmarks', 'star'], ['Recent tabs', 'clock'], ['Add to Home screen', 'plus', true], ['Settings', 'gear']];
  const Icon = ({ k }) => {
    const c = { stroke: 'rgba(255,255,255,0.65)', strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (k === 'plus') return <svg width="18" height="18" viewBox="0 0 24 24" {...c} stroke="#fff"><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
    if (k === 'desktop') return <svg width="18" height="18" viewBox="0 0 24 24" {...c}><rect x="2" y="4" width="20" height="13" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /></svg>;
    if (k === 'doc') return <svg width="18" height="18" viewBox="0 0 24 24" {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>;
    return <svg width="18" height="18" viewBox="0 0 24 24" {...c}><circle cx="12" cy="12" r="9" /></svg>;
  };
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#1d2433', border: '1px solid rgba(255,255,255,0.08)' }}>
      {rows.map(([label, k, hl], i) => (
        <div key={i} className="relative flex items-center justify-between px-4" style={{ height: 44, background: hl ? 'rgba(255,255,255,0.08)' : 'transparent', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <span className="text-white" style={{ fontSize: 14, fontWeight: hl ? 700 : 400 }}>{label}</span>
          <Icon k={k} />
          {hl && <RedArrow width={64} style={{ right: 44, top: -4 }} flip />}
        </div>
      ))}
    </div>
  );
}

function MockHomeIcon() {
  return (
    <div className="flex flex-col items-center justify-center py-5" style={{ background: 'linear-gradient(160deg,#4a5578,#2d3550)' }}>
      <div className="flex items-center justify-center" style={{ width: 70, height: 70, borderRadius: 17, background: '#0c1733', boxShadow: '0 8px 20px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <img src="assets/radle_icon.png" alt="" style={{ width: 46, height: 46, objectFit: 'contain' }} />
      </div>
      <span className="text-white mt-2" style={{ fontSize: 12, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Radiordle</span>
    </div>
  );
}

/* ---- Step card ---- */
function StepCard({ n, title, children }) {
  return (
    <section className="rounded-2xl p-4 sm:p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
      <div className="flex items-center gap-3 mb-3.5">
        <span className="flex items-center justify-center rounded-full font-baloo font-extrabold text-black flex-shrink-0" style={{ width: 34, height: 34, fontSize: 17, background: 'linear-gradient(to bottom,#fbbf24,#f59e0b)', boxShadow: '0 3px 10px rgba(245,158,11,0.4)' }}>{n}</span>
        <h3 className="font-baloo font-extrabold text-white leading-tight" style={{ fontSize: 19 }}>{title}</h3>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>{children}</div>
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
        <div className="p-3" style={{ background: '#11182b' }}><MockMenu browser="safari" /></div>
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
        <div className="p-3" style={{ background: '#11182b' }}><MockMenu browser="chrome" /></div>
      </StepCard>
      <StepCard n="3" title="Tap the icon to launch">
        <MockHomeIcon />
      </StepCard>
    </>
  );
}

/* ---- Install screen ---- */
function InstallScreen({ onBack }) {
  const [tab, setTab] = iUseState('safari');
  const TabBtn = ({ id, label, icon }) => {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id)} className="flex-1 flex items-center justify-center gap-2 font-baloo font-bold rounded-xl transition-all"
        style={{ height: 44, fontSize: 15, color: active ? '#000' : 'rgba(255,255,255,0.75)', background: active ? 'linear-gradient(to bottom,#fbbf24,#f59e0b)' : 'rgba(255,255,255,0.06)', border: active ? 'none' : '1px solid rgba(255,255,255,0.12)', boxShadow: active ? '0 4px 14px rgba(245,158,11,0.4)' : 'none' }}>
        {icon}{label}
      </button>
    );
  };
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex justify-between items-center p-4">
        <button onClick={onBack} className="flex items-center justify-center rounded-xl text-white" style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}><BackIcon /></button>
        <button onClick={onBack} className="flex items-center gap-1" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
          <img src="assets/radle_icon.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span className="text-white font-baloo font-extrabold tracking-tight" style={{ fontSize: '1.4rem' }}>Radiordle</span>
        </button>
        <div style={{ width: 44 }} />
      </div>

      <div className="px-4 pb-2 text-center">
        <div className="mx-auto mb-3 flex items-center justify-center rounded-2xl text-amber-400" style={{ width: 62, height: 62, background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24' }}>
          <InstallIcon size={30} />
        </div>
        <h2 className="text-2xl text-white font-baloo font-extrabold">Install Radiordle</h2>
        <p className="text-white/60 mt-1 font-baloo text-sm px-4">Add Radiordle to your home screen for a full-screen, app-like experience.</p>
      </div>

      <div className="px-4 py-4 sticky top-0 z-10" style={{ background: 'linear-gradient(to bottom,#0d1631,rgba(13,22,49,0.92) 70%,transparent)' }}>
        <div className="flex gap-2.5">
          <TabBtn id="safari" label="Safari" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9.5" /><path d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor" stroke="none" /></svg>} />
          <TabBtn id="chrome" label="Chrome" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="3.2" /><path d="M12 8.8h8.5M8.8 13.6 4.6 6.7M15.2 13.6l-4.2 7.3" /></svg>} />
        </div>
      </div>

      <div className="px-4 pb-12 space-y-4" style={{ animation: 'fadeIn 0.25s ease-out' }} key={tab}>
        {tab === 'safari' ? <SafariSteps /> : <ChromeSteps />}
        <p className="text-white/40 text-center text-xs font-baloo pt-2">Once installed, open Radiordle right from your home screen — no browser bars.</p>
      </div>
    </div>
  );
}

Object.assign(window, { InstallScreen });
