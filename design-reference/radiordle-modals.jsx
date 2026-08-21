/* =========================================================
   Radiordle — modals: Results, Stats, Feedback, Zoom
   ========================================================= */
const { useState: mUseState, useEffect: mUseEffect, useRef: mUseRef, useCallback: mUseCallback } = React;

const PANEL = {
  background: 'linear-gradient(to bottom, #16224a, #0b1228)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
};

function ModalShell({ onClose, children, maxWidth = 520, showClose }) {
  return (
    <div className="absolute inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', animation: 'fadeIn 0.18s ease-out' }}
      onClick={onClose}>
      <div className="relative w-full rounded-2xl p-5 sm:p-7 overflow-y-auto font-baloo"
        style={{ ...PANEL, maxWidth, maxHeight: '92%', animation: 'modalEnter 0.22s cubic-bezier(0.2,0.8,0.3,1)' }}
        onClick={(e) => e.stopPropagation()}>
        {showClose && (
          <button onClick={onClose} aria-label="Close"
            className="absolute z-10 flex items-center justify-center rounded-full transition-colors"
            style={{ top: 14, right: 14, width: 34, height: 34, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
            <CloseIcon size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

function StatCard({ value, label, accent, icon }) {
  return (
    <div className="relative rounded-xl px-1 flex flex-col items-center justify-center overflow-hidden"
      style={{ paddingTop: 11, paddingBottom: 10, background: `linear-gradient(155deg, ${accent}26 0%, rgba(255,255,255,0.025) 74%)`, border: `1px solid ${accent}4d` }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.7 }} />
      <div style={{ color: accent, marginBottom: 5 }}>{icon}</div>
      <p className="font-extrabold leading-none" style={{ fontSize: 22, color: accent }}>{value}</p>
      <p style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 5 }}>{label}</p>
    </div>
  );
}
const STAT_ICONS = {
  played: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>,
  win: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></svg>,
  streak: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1.5.7-2.8 1.4-3.8C9 8 9.5 9 10.5 9 11 6 12 2 12 2z" /></svg>,
  max: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v3a6 6 0 0 1-12 0V4z" /><path d="M6 5H4a2 2 0 0 0 2 2M18 5h2a2 2 0 0 1-2 2" /><line x1="12" y1="13" x2="12" y2="17" /><path d="M9 20h6M10 20l.5-3h3l.5 3" /></svg>,
};
const STAT_DEFS = [
  { key: 'played', label: 'Played', accent: '#8fb3e6' },
  { key: 'win', label: 'Win %', accent: '#74cdab' },
  { key: 'streak', label: 'Streak', accent: '#fbbf24' },
  { key: 'max', label: 'Max Streak', accent: '#c4a7ef' },
];
function StatRow({ stats, winRate }) {
  const vals = { played: stats.gamesPlayed, win: winRate, streak: stats.currentStreak, max: stats.maxStreak };
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {STAT_DEFS.map((d) => <StatCard key={d.key} value={vals[d.key]} label={d.label} accent={d.accent} icon={STAT_ICONS[d.key]} />)}
    </div>
  );
}
function CompareBox({ winRate, className = '' }) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ background: 'linear-gradient(155deg, rgba(245,158,11,0.12), rgba(61,77,104,0.42))', border: '1px solid rgba(255,255,255,0.10)' }}>
      <h3 className="text-base font-bold text-white text-center mb-3">How You Compare</h3>
      <div className="text-center">
        <p className="text-3xl font-extrabold" style={{ color: '#fbbf24' }}>Top {Math.max(5, 100 - winRate)}%</p>
        <p className="text-sm text-white/70 mt-1">You beat <span className="font-semibold text-white/90">{Math.min(95, winRate)}%</span> of players on this puzzle</p>
      </div>
    </div>
  );
}

function Distribution({ stats, highlight }) {
  const maxD = Math.max(...Object.values(stats.guessDistribution), 1);
  return (
    <div className="space-y-1.5">
      {Array.from({ length: MAX_GUESSES }, (_, i) => i + 1).map((g) => {
        const count = stats.guessDistribution[g] || 0;
        const pct = (count / maxD) * 100;
        const isHi = highlight === g;
        return (
          <div key={g} className="flex items-center gap-2">
            <span className="w-4 text-sm font-semibold text-white/60">{g}</span>
            <div className="flex-1 h-6 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded flex items-center justify-end px-2"
                style={{ width: `${Math.max(pct, count > 0 ? 10 : 0)}%`, background: count > 0 ? (isHi ? C.success : 'rgba(255,255,255,0.32)') : 'transparent', transition: 'width 0.5s ease-out' }}>
                {count > 0 && <span className="text-white text-sm font-bold">{count}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConditionAbout({ text, mobile }) {
  const [open, setOpen] = mUseState(!mobile);
  return (
    <div className="rounded-xl mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full px-4 py-2.5 text-left transition-colors"
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
        <span className="font-baloo font-semibold text-white/85 text-sm flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.accentLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          About this condition
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="px-4 pb-3.5" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <p className="text-white/70 text-sm leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}

function ResultTiles({ guesses, answer }) {
  return (
    <div className="flex justify-center gap-1.5 mb-2.5">
      {Array.from({ length: MAX_GUESSES }).map((_, i) => {
        const g = guesses[i];
        let bg = 'rgba(255,255,255,0.05)', border = '1px solid rgba(255,255,255,0.14)', glow = 'none';
        if (g) {
          const r = checkAnswer(g, answer);
          bg = r === 'correct' ? C.success : r === 'partial' ? C.warning : C.error;
          border = '1px solid rgba(255,255,255,0.14)';
          if (r === 'correct') glow = '0 0 12px rgba(64,119,99,0.65)';
        }
        return <div key={i} style={{ width: 26, height: 26, borderRadius: 7, background: bg, border, boxShadow: glow, transition: 'all 0.3s' }} />;
      })}
    </div>
  );
}

function ResultHeader({ isWon, guessCount, guesses, answer, citation, dayNumber, isArchive, mobile }) {
  return (
    <div className="text-center mb-5">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{isWon ? '🎉 Congratulations!' : '😔 Game Over'}</h2>
      <ResultTiles guesses={guesses} answer={answer} />
      <p className="text-sm sm:text-base text-white/55 mb-1">The correct answer was</p>
      <p className="font-extrabold leading-tight" style={{ fontSize: mobile ? 22 : 27, backgroundImage: 'linear-gradient(90deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textWrap: 'balance' }}>{answer}</p>
      {citation && <p className="text-xs mt-2 italic text-white/45">{citation}</p>}
    </div>
  );
}

/* ====================== Results Modal ====================== */
function ResultsModal({ isWon, guessCount, guesses, answer, citation, learnLink, dayNumber, isArchive, stats, onClose, onCopied, mobile, description }) {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const buildText = () => {
    const grid = guesses.map((g) => {
      const r = checkAnswer(g, answer);
      return r === 'correct' ? '🟩' : r === 'partial' ? '🟨' : '🟥';
    }).join('');
    const full = grid + '⬛'.repeat(MAX_GUESSES - guesses.length);
    const day = dayNumber + 1;
    const prefix = isArchive ? '🩻 Radiordle Archive Day' : '🩻 Radiordle Day';
    return `${prefix} ${day} ${isWon ? guessCount : 'X'}/${MAX_GUESSES}\n${full}\nhttps://radiordle.org`;
  };
  const copyResults = () => {
    const text = buildText();
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(onCopied, onCopied);
    else onCopied();
  };
  const shareResults = () => {
    const text = buildText();
    if (navigator.share) navigator.share({ title: 'Radiordle', text }).catch(() => {});
    else copyResults();
  };

  return (
    <ModalShell onClose={onClose} maxWidth={mobile ? 460 : 640} showClose>
      <ResultHeader isWon={isWon} guessCount={guessCount} guesses={guesses} answer={answer} citation={citation} dayNumber={dayNumber} isArchive={isArchive} mobile={mobile} />

      {description && <ConditionAbout text={description} mobile={mobile} />}

      <div className="mb-4">
        {isArchive && <p className="text-xs italic text-white/40 text-center mb-2">Archive puzzles are not included in your statistics.</p>}
        <StatRow stats={stats} winRate={winRate} />
      </div>

      <div className={isWon && !mobile ? 'grid grid-cols-2 gap-4 mb-4' : 'mb-4'}>
        <div className="rounded-xl p-3 sm:p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-base font-bold text-white text-center mb-3">Guess Distribution</h3>
          <Distribution stats={stats} highlight={isWon ? guessCount : null} />
        </div>
        {isWon && !mobile && <CompareBox winRate={winRate} />}
      </div>

      <div className="flex gap-3 mb-3">
        <button onClick={shareResults} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-black rounded-xl shadow-lg transition-transform active:scale-95"
          style={{ background: 'linear-gradient(to right, #f59e0b, #fbbf24)', fontSize: 16 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" /></svg>
          Share
        </button>
        <button onClick={copyResults} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-white/85 rounded-xl transition-colors"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', fontSize: 16 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          Copy
        </button>
      </div>
      {learnLink && (
        <a href={learnLink} target="_blank" rel="noopener noreferrer"
          className="block w-full px-6 py-2.5 font-bold rounded-xl text-center shadow-lg transition-transform active:scale-95"
          style={{ background: 'linear-gradient(to right, #8fb3e6, #6f97d6)', color: '#10203f', fontSize: 16 }}>Learn More</a>
      )}

      {isWon && mobile && <CompareBox winRate={winRate} className="mt-4" />}
    </ModalShell>
  );
}

/* ====================== Stats Modal ====================== */
function StatsModal({ stats, onClose, mobile }) {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  return (
    <ModalShell onClose={onClose} maxWidth={460}>
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-5">Your Statistics</h2>
      <div className="mb-4">
        <StatRow stats={stats} winRate={winRate} />
      </div>
      <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-lg font-bold text-white text-center mb-3">Guess Distribution</h3>
        {stats.gamesPlayed > 0 ? <Distribution stats={stats} /> : <p className="text-center text-white/50 text-sm py-2">Play a game to see your distribution!</p>}
      </div>
      <button onClick={onClose} className="w-full px-6 py-3 font-bold text-white rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.10)' }}>Close</button>
    </ModalShell>
  );
}

/* ====================== Feedback Modal ====================== */
const FB_CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'content', label: 'Content Issue' },
  { value: 'other', label: 'Other' },
];
function FeedbackModal({ onClose }) {
  const [category, setCategory] = mUseState('');
  const [message, setMessage] = mUseState('');
  const [status, setStatus] = mUseState('idle');
  const [err, setErr] = mUseState('');

  const submit = (e) => {
    e.preventDefault();
    if (!category) { setStatus('error'); setErr('Please select a category.'); return; }
    if (message.trim().length < 10) { setStatus('error'); setErr('Message must be at least 10 characters.'); return; }
    setStatus('submitting');
    setTimeout(() => { setStatus('success'); setCategory(''); setMessage(''); }, 700);
  };

  const inputStyle = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)' };

  return (
    <ModalShell onClose={onClose} maxWidth={460}>
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-5">Send Feedback</h2>
      {status === 'success' ? (
        <div className="text-center">
          <div className="rounded-xl p-6 mb-5" style={{ background: C.success }}>
            <p className="text-xl font-bold text-white mb-1">Thank you!</p>
            <p className="text-white/85">Your feedback has been submitted.</p>
          </div>
          <button onClick={onClose} className="w-full px-6 py-3 font-bold text-white rounded-xl" style={{ background: 'rgba(255,255,255,0.10)' }}>Close</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label className="block text-white/60 mb-2" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl font-medium outline-none mb-4 transition-colors focus:border-white/35" style={inputStyle}>
            <option value="" style={{ color: '#1f2937' }}>Select a category...</option>
            {FB_CATEGORIES.map((c) => <option key={c.value} value={c.value} style={{ color: '#1f2937' }}>{c.label}</option>)}
          </select>
          <label className="block text-white/60 mb-2" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
            placeholder="Describe your feedback..." rows={5}
            className="w-full px-4 py-3 rounded-xl font-medium outline-none resize-none transition-colors focus:border-white/35 placeholder:text-white/35" style={inputStyle} />
          <p className="text-white/40 text-xs mt-1 text-right mb-3">{message.length}/1000</p>
          {status === 'error' && err && (
            <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(196,115,107,0.18)', border: '1px solid rgba(196,115,107,0.5)' }}>
              <p className="text-sm" style={{ color: '#ffd9d4' }}>{err}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 font-bold text-white/80 rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }} disabled={status === 'submitting'}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>Cancel</button>
            <button type="submit" className="flex-1 px-6 py-3 font-bold text-black rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50" style={{ background: 'linear-gradient(to right, #f59e0b, #fbbf24)' }} disabled={status === 'submitting'}>{status === 'submitting' ? 'Sending...' : 'Submit'}</button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

/* ====================== Image Zoom Modal ====================== */
function ZoomModal({ image, onClose }) {
  const [scale, setScale] = mUseState(1);
  const [tx, setTx] = mUseState(0);
  const [ty, setTy] = mUseState(0);
  const drag = mUseRef(null);
  const ref = mUseRef(null);

  mUseEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setScale((s) => {
        const ns = Math.min(Math.max(s + (e.deltaY > 0 ? -0.2 : 0.2), 1), 4);
        if (ns <= 1) { setTx(0); setTy(0); }
        return ns;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { el.removeEventListener('wheel', onWheel); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const down = (e) => { if (scale > 1) drag.current = { x: e.clientX, y: e.clientY, tx, ty }; };
  const move = (e) => {
    if (!drag.current) return;
    setTx(drag.current.tx + (e.clientX - drag.current.x) / scale);
    setTy(drag.current.ty + (e.clientY - drag.current.y) / scale);
  };
  const up = () => { drag.current = null; };

  return (
    <div className="absolute inset-0 z-[140]" style={{ background: 'rgba(0,0,0,0.8)', animation: 'fadeIn 0.18s ease-out' }}>
      <button onClick={onClose} className="absolute top-4 right-4 z-[141] w-10 h-10 flex items-center justify-center rounded-full text-white/80 hover:text-white"
        style={{ background: 'rgba(0,0,0,0.5)' }} aria-label="Close"><CloseIcon /></button>
      <div ref={ref} className="w-full h-full flex items-center justify-center p-6"
        style={{ touchAction: 'none', cursor: scale > 1 ? 'grab' : 'default' }}
        onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onClick={(e) => { if (e.target === e.currentTarget && scale <= 1) onClose(); }}>
        <img src={image} alt="Zoomed" draggable={false}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transform: `scale(${scale}) translate(${tx}px, ${ty}px)`, transition: drag.current ? 'none' : 'transform 0.15s ease-out' }} />
      </div>
      <div className="absolute bottom-6 left-1/2 z-[141] pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
        <div className="text-white/80 text-xs px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.6)' }}>Scroll to zoom · Drag to pan</div>
      </div>
    </div>
  );
}

Object.assign(window, { ResultsModal, StatsModal, FeedbackModal, ZoomModal });
