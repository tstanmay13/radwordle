/* =========================================================
   Radiordle — app: state, routing, device frames
   ========================================================= */
const { useState: aUseState, useEffect: aUseEffect, useRef: aUseRef } = React;

function freshGame(dayNumber, isArchive) {
  return { dayNumber, isArchive, guesses: [], guessResults: [], revealedHints: 0, isComplete: false, isWon: false };
}
function freshStats() {
  return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, guessDistribution: {} };
}

function RadiordleApp({ variant, bg }) {
  const today = getDayNumber();
  const [route, setRoute] = aUseState('game');
  const [game, setGame] = aUseState(() => freshGame(today, false));
  const [stats, setStats] = aUseState(freshStats);
  const [statuses, setStatuses] = aUseState({});
  const [modal, setModal] = aUseState(null);
  const [toast, setToast] = aUseState(null);
  const toastTimer = aUseRef(null);

  const showToast = (type) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(type);
    toastTimer.current = setTimeout(() => setToast(null), type === 'correct' ? 2500 : 2000);
  };

  const applyStats = (won, guessCount, isArchive) => {
    if (isArchive) return; // archive excluded from streak stats
    setStats((s) => {
      const n = { ...s, guessDistribution: { ...s.guessDistribution } };
      n.gamesPlayed += 1;
      if (won) {
        n.gamesWon += 1;
        n.currentStreak += 1;
        n.maxStreak = Math.max(n.maxStreak, n.currentStreak);
        n.guessDistribution[guessCount] = (n.guessDistribution[guessCount] || 0) + 1;
      } else {
        n.currentStreak = 0;
      }
      return n;
    });
  };

  const handleSubmit = (diagnosis) => {
    if (game.isComplete) return;
    const result = checkAnswer(diagnosis, PUZZLE.answer);
    const guesses = [...game.guesses, diagnosis];
    const guessResults = [...game.guessResults, result];
    showToast(result);

    if (result === 'correct') {
      const next = { ...game, guesses, guessResults, isComplete: true, isWon: true };
      setGame(next);
      applyStats(true, guesses.length, game.isArchive);
      setStatuses((m) => ({ ...m, [game.dayNumber]: 'won' }));
      setTimeout(() => setModal('results'), 600);
    } else if (guesses.length >= MAX_GUESSES) {
      const next = { ...game, guesses, guessResults, isComplete: true, isWon: false };
      setGame(next);
      applyStats(false, guesses.length, game.isArchive);
      setStatuses((m) => ({ ...m, [game.dayNumber]: 'lost' }));
      setTimeout(() => setModal('results'), 600);
    } else {
      setGame({ ...game, guesses, guessResults, revealedHints: game.revealedHints + 1 });
    }
  };

  const selectDay = (day) => {
    setGame(freshGame(day, day !== today));
    setRoute('game');
  };

  return (
    <div className="relative overflow-hidden" style={{ height: '100%', width: '100%' }}>
      <PageBackground bg={route === 'game' ? bg : 'navy'} variant={variant} />
      <div className="relative z-10 flex flex-col" style={{ height: '100%' }}>
        {route === 'game' && (
          <>
            <TopBar variant={variant}
              onHome={() => setRoute('game')}
              onArchive={() => setRoute('archive')}
              onAbout={() => setRoute('about')}
              onFeedback={() => setModal('feedback')}
              onStats={() => setModal('stats')}
              onInstall={() => setRoute('install')} />
            <div className="flex-1 min-h-0 flex flex-col">
              <GameScreen variant={variant} game={game} isArchive={game.isArchive}
                onSubmit={handleSubmit}
                onZoom={() => setModal('zoom')}
                onViewResults={() => setModal('results')} />
            </div>
          </>
        )}
        {route === 'about' && <AboutScreen variant={variant} onBack={() => setRoute('game')} onFeedback={() => setModal('feedback')} />}
        {route === 'archive' && <ArchiveScreen variant={variant} statuses={statuses} onBack={() => setRoute('game')} onSelectDay={selectDay} />}
        {route === 'install' && <InstallScreen onBack={() => setRoute('game')} />}
      </div>

      <Toast type={toast} />

      {modal === 'results' && (
        <ResultsModal isWon={game.isWon} guessCount={game.guesses.length} guesses={game.guesses}
          answer={PUZZLE.answer} citation={PUZZLE.citation} learnLink={PUZZLE.learnLink}
          dayNumber={game.dayNumber} isArchive={game.isArchive} stats={stats}
          description={PUZZLE.description}
          mobile={variant === 'mobile'} onClose={() => setModal(null)} onCopied={() => showToast('copied')} />
      )}
      {modal === 'stats' && <StatsModal stats={stats} mobile={variant === 'mobile'} onClose={() => setModal(null)} />}
      {modal === 'feedback' && <FeedbackModal onClose={() => setModal(null)} />}
      {modal === 'zoom' && <ZoomModal image={PUZZLE.image} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ====================== Device frames ====================== */
function DesktopFrame({ bg }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="font-baloo font-semibold text-white/40 text-sm tracking-wide">Desktop · 1180×800</span>
      <div className="rounded-xl overflow-hidden" style={{ width: 1180, height: 800, boxShadow: '0 40px 120px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 flex-shrink-0" style={{ height: 44, background: '#1b2540', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex gap-2">
            <span style={{ width: 12, height: 12, borderRadius: 99, background: '#ff5f57' }}></span>
            <span style={{ width: 12, height: 12, borderRadius: 99, background: '#febc2e' }}></span>
            <span style={{ width: 12, height: 12, borderRadius: 99, background: '#28c840' }}></span>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.07)', minWidth: 280 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              <span className="font-sans text-white/55" style={{ fontSize: 13 }}>radiordle.org</span>
            </div>
          </div>
          <div style={{ width: 52 }}></div>
        </div>
        {/* Viewport */}
        <div style={{ height: 756, position: 'relative', background: '#0b1228' }}>
          <RadiordleApp variant="desktop" bg={bg} />
        </div>
      </div>
    </div>
  );
}

function MobileFrame({ bg }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="font-baloo font-semibold text-white/40 text-sm tracking-wide">Mobile · 390×844</span>
      <div className="relative" style={{ width: 412, height: 866, background: '#05080f', borderRadius: 52, padding: 11, boxShadow: '0 40px 120px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.06)' }}>
        <div className="relative overflow-hidden" style={{ width: 390, height: 844, borderRadius: 42, background: '#0b1228' }}>
          {/* Notch */}
          <div className="absolute left-1/2 z-[80]" style={{ top: 0, transform: 'translateX(-50%)', width: 150, height: 30, background: '#05080f', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}></div>
          <RadiordleApp variant="mobile" bg={bg} />
        </div>
      </div>
    </div>
  );
}

const BG_OPTIONS = [
  { id: 'annotated', label: 'Classic' },
];

function BgSwitcher({ bg, setBg }) {
  return (
    <div className="fixed left-1/2 z-[500] flex items-center justify-center flex-nowrap gap-1 p-1.5 rounded-2xl"
      style={{ bottom: 20, transform: 'translateX(-50%)', maxWidth: '96vw', background: 'rgba(14,22,46,0.78)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
      <span className="font-baloo font-bold text-white/45 px-2.5 hidden sm:block" style={{ fontSize: 12, letterSpacing: '0.04em' }}>BACKGROUND</span>
      {BG_OPTIONS.map((o) => {
        const active = bg === o.id;
        return (
          <button key={o.id} onClick={() => setBg(o.id)}
            className="font-baloo font-semibold rounded-xl transition-all active:scale-95"
            style={{
              padding: '7px 12px', fontSize: 13, whiteSpace: 'nowrap',
              color: active ? '#0a1430' : 'rgba(255,255,255,0.7)',
              background: active ? 'linear-gradient(to bottom, #fbbf24, #f59e0b)' : 'transparent',
              boxShadow: active ? '0 3px 12px rgba(245,158,11,0.4)' : 'none',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Stage() {
  const [scale, setScale] = aUseState(1);
  const [bg, setBgState] = aUseState('annotated');
  const setBg = (v) => { setBgState(v); try { localStorage.setItem('radiordle-bg', v); } catch (e) {} };
  const wrapRef = aUseRef(null);
  aUseEffect(() => {
    const W = 1180 + 412 + 64; // frames + gap
    const H = 900; // tallest frame + label
    const fit = () => {
      const s = Math.min(1, (window.innerWidth - 48) / W, (window.innerHeight - 48) / H);
      setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className="w-full min-h-screen flex items-center justify-center" style={{ background: '#0a0f1f' }}>
      <div ref={wrapRef} className="flex items-start justify-center gap-16" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <DesktopFrame bg={bg} />
        <MobileFrame bg={bg} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Stage />);
