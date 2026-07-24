/* =========================================================
   Radiordle — screens: TopBar, GameScreen, About, Archive
   ========================================================= */
const { useState: sUseState, useEffect: sUseEffect, useRef: sUseRef, useMemo: sUseMemo } = React;

/* ====================== Top Bar ====================== */
function TopBar({ variant, onHome, onArchive, onAbout, onFeedback, onStats, onInstall }) {
  const [menu, setMenu] = sUseState(false);
  const mobile = variant === 'mobile';
  const barStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(22px) saturate(160%)',
    WebkitBackdropFilter: 'blur(22px) saturate(160%)',
    borderBottom: '1px solid rgba(255,255,255,0.14)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.16)',
  };
  const Wordmark = ({ icon, text }) => (
    <button onClick={onHome} className="flex items-center gap-1.5" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
      <img src="assets/radle_icon.png" alt="Radiordle" style={{ width: icon, height: icon, objectFit: 'contain' }} />
      <span className="font-baloo font-extrabold text-white tracking-tight" style={{ fontSize: text, lineHeight: 1 }}>Radiordle</span>
    </button>
  );

  if (mobile) {
    return (
      <div className="relative flex-shrink-0 z-[60]">
        <div className="flex items-center justify-between px-3 h-14" style={barStyle}>
          <GlassIconButton label="Menu" size={40} onClick={() => setMenu((m) => !m)}><HamburgerIcon size={22} /></GlassIconButton>
          <Wordmark icon={34} text="1.45rem" />
          <AccentButton icon={<ArchiveIcon size={17} />} label="Archive" mobile onClick={onArchive} />
        </div>
        {menu && (
          <>
            <div className="absolute inset-0" style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setMenu(false)} />
            <div className="absolute left-3 top-[60px] z-[61] rounded-xl overflow-hidden" style={{ ...GLASS, minWidth: 190 }}>
              <button onClick={() => { setMenu(false); onInstall(); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left font-baloo font-bold transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.10)', color: '#fbbf24' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(251,191,36,0.10)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <InstallIcon size={19} />Install App
              </button>
              {[['About', <AboutIcon size={18} />, onAbout], ['Feedback', <FeedbackIcon size={18} />, onFeedback], ['Stats', <StatsIcon size={18} />, onStats]].map(([label, icon, fn]) => (
                <button key={label} onClick={() => { setMenu(false); fn(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-white font-baloo font-semibold transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <span className="text-white/80">{icon}</span>{label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center px-8 h-[84px] flex-shrink-0 z-[60]" style={barStyle}>
      <div className="flex-1 flex items-center justify-start gap-1">
        <button onClick={onStats} title="Stats" aria-label="Stats"
          className="flex items-center gap-2 rounded-xl transition-all font-baloo font-bold h-11 px-3.5 text-base"
          style={{ color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}>
          <StatsIcon size={20} /><span>Stats</span>
        </button>
        <GlassIconButton label="About" onClick={onAbout}><AboutIcon size={22} /></GlassIconButton>
        <GlassIconButton label="Feedback" onClick={onFeedback}><FeedbackIcon size={21} /></GlassIconButton>
      </div>
      <Wordmark icon={46} text="1.9rem" />
      <div className="flex-1 flex items-center justify-end">
        <AccentButton icon={<ArchiveIcon size={19} />} label="Archives" onClick={onArchive} />
      </div>
    </div>
  );
}

/* ====================== X-ray card ====================== */
function XrayCard({ result, onZoom }) {
  const map = { correct: C.ringSuccess, partial: C.ringWarning, incorrect: C.ringError };
  const bc = result ? map[result] : 'rgba(255,255,255,0.12)';
  return (
    <button onClick={onZoom} className="relative w-full bg-black rounded-lg overflow-hidden block"
      style={{ aspectRatio: '16 / 9', border: `2px solid ${bc}`, boxShadow: '0 10px 34px rgba(0,0,0,0.5)', transition: 'border-color 0.3s' }}>
      <img src={PUZZLE.image} alt="Radiology case" className="w-full h-full object-contain" />
      <div className="absolute bottom-3 right-3 rounded-full p-1.5 text-white/80" style={{ background: 'rgba(0,0,0,0.5)' }}><ZoomIcon size={20} /></div>
    </button>
  );
}

/* ====================== Hint card ====================== */
function HintCard({ index, text, result, mobile }) {
  const map = {
    correct: { bg: C.success, color: '#fff' },
    partial: { bg: C.warning, color: '#000' },
    incorrect: { bg: C.error, color: '#fff' },
  };
  const c = result ? map[result] : { bg: 'rgba(107,137,184,0.7)', color: '#fff' };
  return (
    <div className="relative rounded-xl border border-white/10 shadow-md" style={{ background: c.bg, color: c.color, padding: mobile ? '14px 18px' : '14px 20px', animation: 'hintReveal 0.4s ease-out' }}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 rounded-full flex items-center justify-center font-baloo font-bold"
          style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.20)', fontSize: 14, color: result === 'partial' ? '#1a1a1a' : '#fff' }}>{index}</span>
        <p className="leading-snug pt-0.5" style={{ fontSize: 18 }}>{text}</p>
      </div>
    </div>
  );
}

/* ====================== Guess Bar (autocomplete) ====================== */
function GuessBar({ current, total, previousGuesses, onSubmit, mobile }) {
  const [value, setValue] = sUseState('');
  const [open, setOpen] = sUseState(false);
  const [sel, setSel] = sUseState(-1);
  const [error, setError] = sUseState(null);
  const containerRef = sUseRef(null);
  const inputRef = sUseRef(null);
  const listRef = sUseRef(null);

  const nameMap = sUseMemo(() => {
    const m = new Map(); CONDITIONS.forEach((n) => m.set(n.toLowerCase().trim(), n)); return m;
  }, []);
  const filtered = sUseMemo(() => {
    const t = value.toLowerCase().trim(); if (!t) return [];
    return CONDITIONS.filter((c) => c.toLowerCase().includes(t)).slice(0, 40);
  }, [value]);

  const wasGuessed = (n) => previousGuesses.some((g) => g.toLowerCase().trim() === n.toLowerCase().trim());
  const choose = (n) => { if (wasGuessed(n)) return; setValue(n); setOpen(false); setSel(-1); setError(null); inputRef.current && inputRef.current.focus(); };
  const submit = () => {
    const t = value.trim(); if (!t) return;
    const exact = nameMap.get(t.toLowerCase());
    if (!exact) { setError('Please select a diagnosis from the list'); return; }
    if (wasGuessed(exact)) { setError('You have already guessed this diagnosis'); return; }
    setValue(''); setOpen(false); setSel(-1); setError(null);
    onSubmit(exact);
  };
  const onKey = (e) => {
    if (!open || filtered.length === 0) { if (e.key === 'Enter') { e.preventDefault(); submit(); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); let n = sel + 1; while (n < filtered.length && wasGuessed(filtered[n])) n++; if (n < filtered.length) setSel(n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); let p = sel - 1; while (p >= 0 && wasGuessed(filtered[p])) p--; setSel(p); }
    else if (e.key === 'Enter') { e.preventDefault(); if (sel >= 0 && sel < filtered.length && !wasGuessed(filtered[sel])) choose(filtered[sel]); else submit(); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); setSel(-1); }
  };
  sUseEffect(() => { if (sel >= 0 && listRef.current) { const el = listRef.current.children[sel]; if (el) el.scrollIntoView({ block: 'nearest' }); } }, [sel]);
  sUseEffect(() => {
    const onDown = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) { setOpen(false); setSel(-1); } };
    document.addEventListener('mousedown', onDown); return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const showDropdown = open && filtered.length > 0;
  return (
    <div ref={containerRef} className="relative w-full">
      {showDropdown && (
        <div className="absolute left-0 right-0 overflow-hidden" style={{ bottom: '100%', marginBottom: 10, background: 'rgba(17,27,52,0.92)', backdropFilter: 'blur(22px) saturate(160%)', WebkitBackdropFilter: 'blur(22px) saturate(160%)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, boxShadow: '0 16px 44px rgba(0,0,0,0.55)' }}>
          <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: mobile ? 220 : 256 }}>
            {filtered.map((name, i) => {
              const dis = wasGuessed(name);
              return (
                <button key={name} onClick={() => choose(name)} onMouseEnter={() => !dis && setSel(i)} disabled={dis}
                  className="w-full text-left transition-colors font-baloo"
                  style={{ padding: mobile ? '11px 18px' : '12px 20px', fontSize: mobile ? 15 : 16, borderBottom: '1px solid rgba(255,255,255,0.06)', color: dis ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.9)', background: i === sel && !dis ? 'rgba(255,255,255,0.10)' : 'transparent', cursor: dis ? 'not-allowed' : 'pointer' }}>
                  {name}{dis && <span className="ml-2 text-xs opacity-70">(Previously selected)</span>}
                </button>
              );
            })}
          </div>
          {filtered.length === 40 && (
            <div className="text-center font-baloo" style={{ padding: '8px 16px', fontSize: 12, color: 'rgba(255,255,255,0.45)', borderTop: '1px solid rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.18)' }}>Showing first 40 results. Type more to narrow down.</div>
          )}
        </div>
      )}
      <div className="flex items-center w-full" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)', border: error ? '1px solid rgba(196,115,107,0.8)' : '1px solid rgba(255,255,255,0.14)', borderRadius: 16, boxShadow: '0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)', padding: mobile ? '7px 7px 7px 14px' : '8px 8px 8px 18px', gap: mobile ? 10 : 14 }}>
        <span className="font-mono uppercase select-none flex-shrink-0" style={{ color: 'rgba(255,255,255,0.55)', fontSize: mobile ? 11 : 12, letterSpacing: '0.12em', fontWeight: 600 }}>Guess {current}/{total}</span>
        <span className="flex-shrink-0" style={{ width: 1, height: mobile ? 22 : 26, background: 'rgba(255,255,255,0.16)' }}></span>
        <input ref={inputRef} type="text" value={value} placeholder="Type a diagnosis..." autoComplete="off"
          onChange={(e) => { setValue(e.target.value); setOpen(e.target.value.trim().length > 0); setSel(-1); if (error) setError(null); }}
          onKeyDown={onKey} onFocus={() => { if (value.trim()) setOpen(true); }}
          className="flex-1 bg-transparent outline-none font-baloo font-medium min-w-0" style={{ color: '#fff', fontSize: mobile ? 16 : 18 }} />
        <button onClick={submit} className="flex items-center gap-2 font-baloo font-bold text-black flex-shrink-0 transition-transform active:scale-95"
          style={{ background: 'linear-gradient(to bottom, #fbbf24, #f59e0b)', boxShadow: '0 4px 14px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.4)', borderRadius: 11, padding: mobile ? '9px 16px' : '11px 22px', fontSize: mobile ? 15 : 17 }}>
          Submit<SendIcon size={mobile ? 16 : 18} />
        </button>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 font-baloo" style={{ padding: '8px 12px', borderRadius: 10, fontSize: 13, color: '#ffd9d4', background: 'rgba(196,115,107,0.18)', border: '1px solid rgba(196,115,107,0.45)' }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="flex-shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}
        </div>
      )}
    </div>
  );
}

/* ====================== Completion message ====================== */
function CompletionMsg({ isWon, answer, onView }) {
  return (
    <div className="text-center text-white font-baloo">
      <p className="text-xl">{isWon ? 'Congratulations! The answer was:' : 'Game Over. The answer was:'}</p>
      <p className="text-2xl mt-1 font-bold" style={{ color: C.accent }}>{answer}</p>
      <button onClick={onView} className="mt-4 px-6 py-2.5 font-bold text-black rounded-xl shadow-lg transition-transform active:scale-95"
        style={{ background: 'linear-gradient(to right, #f59e0b, #fbbf24)' }}>View Results</button>
    </div>
  );
}

/* ====================== Game Screen ====================== */
function GameScreen({ variant, game, isArchive, onSubmit, onZoom, onViewResults }) {
  const mobile = variant === 'mobile';
  const visibleHints = game.isComplete ? PUZZLE.hints : PUZZLE.hints.slice(0, game.revealedHints);
  const firstResult = game.guessResults[0];

  const hintsBlock = visibleHints.length > 0 && (
    <div className="w-full mx-auto space-y-2.5 mb-4 sm:mb-6" style={{ maxWidth: 672 }}>
      {visibleHints.map((text, i) => (
        <HintCard key={i} index={i + 1} text={text} result={game.guessResults[i + 1]} mobile={mobile} />
      ))}
    </div>
  );

  if (mobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-3" style={{ paddingBottom: game.isComplete ? 24 : 110 }}>
          <div className="w-full mb-3"><XrayCard result={firstResult} onZoom={onZoom} /></div>
          <h2 className="text-white font-bold font-baloo mb-2 w-full text-center" style={{ fontSize: '1.25rem', textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>What's the Diagnosis?</h2>
          {hintsBlock}
          {game.isComplete && <CompletionMsg isWon={game.isWon} answer={PUZZLE.answer} onView={onViewResults} />}
        </div>
        {!game.isComplete && (
          <div className="flex-shrink-0 px-4 pt-4 pb-4" style={{ background: 'linear-gradient(to top, #0b1228 0%, rgba(11,18,40,0.85) 65%, rgba(11,18,40,0) 100%)' }}>
            <GuessBar current={game.guesses.length + 1} total={MAX_GUESSES} previousGuesses={game.guesses} onSubmit={onSubmit} mobile />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col items-center px-4 pt-4 pb-6">
        <div className="w-full mb-5" style={{ maxWidth: 660 }}><XrayCard result={firstResult} onZoom={onZoom} /></div>
        <h2 className="text-white font-bold font-baloo mb-4 w-full text-center" style={{ fontSize: '1.6rem', textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>What's the Diagnosis?</h2>
        {hintsBlock}
        <div className="w-full mx-auto" style={{ maxWidth: 672 }}>
          {game.isComplete
            ? <CompletionMsg isWon={game.isWon} answer={PUZZLE.answer} onView={onViewResults} />
            : <GuessBar current={game.guesses.length + 1} total={MAX_GUESSES} previousGuesses={game.guesses} onSubmit={onSubmit} />}
        </div>
      </div>
    </div>
  );
}

/* ====================== About Screen ====================== */
function AboutCard({ title, children }) {
  return (
    <section className="rounded-2xl p-6 sm:p-7" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.10)' }}>
      <h2 className="text-2xl text-white font-baloo font-bold mb-4">{title}</h2>
      <div className="space-y-3 text-white/85 leading-relaxed">{children}</div>
    </section>
  );
}
function AboutScreen({ variant, onBack, onFeedback }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex justify-between items-center p-4 sm:p-6">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-colors font-baloo font-bold" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}><BackIcon size={18} />Back to Game</button>
        <div className="flex items-center gap-1" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
          <img src="assets/radle_icon.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          <span className="text-white font-baloo font-extrabold tracking-tight" style={{ fontSize: variant === 'mobile' ? '1.5rem' : '2rem' }}>Radiordle</span>
        </div>
      </div>
      <div className="flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-5">
          <AboutCard title="About Radiordle">
            <p className="text-lg">Radiordle is a daily radiology puzzle game inspired by Wordle. Each day, players are presented with a medical imaging case and must guess the correct diagnosis.</p>
            <p>The game is designed to be both educational and entertaining, helping medical students, radiology residents, and healthcare professionals sharpen their diagnostic skills in a fun, gamified format.</p>
            <p>New puzzles are released daily at midnight EST, featuring a variety of imaging modalities including X-rays, CT scans, MRIs, and ultrasounds.</p>
          </AboutCard>
          <AboutCard title="How to Play">
            <ol className="space-y-3">
              {['View the medical image and make your best diagnosis guess', 'After each incorrect guess, a new hint is revealed to help narrow down the diagnosis', 'You have 5 attempts to guess the correct diagnosis', 'Share your results and compare with colleagues!'].map((t, i) => (
                <li key={i} className="flex items-start gap-3"><span className="font-bold" style={{ color: C.accent }}>{i + 1}.</span><span>{t}</span></li>
              ))}
            </ol>
          </AboutCard>
          <AboutCard title="Educational Purpose">
            <p>Radiordle serves as a supplementary educational tool for medical students, radiology residents preparing for board exams, healthcare professionals maintaining diagnostic skills, and anyone interested in medical imaging education.</p>
            <p className="text-sm text-white/60 italic">Note: Radiordle is designed for entertainment and educational purposes only. It does not provide medical advice and should not be used for clinical decision-making.</p>
          </AboutCard>
          <AboutCard title="Meet the Team">
            <div className={`grid gap-5 ${variant === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {[
                { role: 'Founder & Puzzle Creator', job: 'MS4 at McGovern', bio: 'Curates the daily cases and writes the hints that make each puzzle click.' },
                { role: 'Tech & Development', job: 'Dev @ X', bio: 'Builds and maintains the app, from the guessing engine to the daily release pipeline.' },
              ].map((m, i) => (
                <div key={i} className="flex flex-col items-center text-center rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-center rounded-full mb-3.5" style={{ width: 104, height: 104, background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.22)' }}>
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                  </div>
                  <h3 className="font-baloo font-extrabold text-white leading-tight" style={{ fontSize: 18 }}>{m.role}</h3>
                  <p className="font-baloo font-semibold mb-2.5" style={{ color: C.accentLight, fontSize: 13.5 }}>{m.job}</p>
                  <p className="text-white/70 text-sm leading-relaxed">{m.bio}</p>
                </div>
              ))}
            </div>
          </AboutCard>
          <AboutCard title="Contact & Contribute">
            <p>Have feedback, suggestions, or found a bug? We would love to hear from you!</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <a href="https://github.com/kishanasokan/Radwordle" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold transition-colors" style={{ background: '#24292e' }}><GithubIcon size={20} />GitHub Repository</a>
              <button onClick={onFeedback} className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold transition-colors" style={{ background: 'rgba(255,255,255,0.10)' }}><FeedbackIcon size={18} />Send Feedback</button>
            </div>
          </AboutCard>
          <section className="rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}>
            <h2 className="text-xl text-white font-baloo font-bold mb-3">Disclaimer</h2>
            <p className="text-white/60 text-sm leading-relaxed">Radiordle is designed for entertainment and general educational interest only and does not provide medical advice. All images used are sourced from open-source or free-use collections and are used in accordance with their licenses.</p>
          </section>
          <p className="text-white/45 text-center text-xs font-baloo py-4">© 2026 Radiordle. For educational and entertainment purposes only.</p>
        </div>
      </div>
    </div>
  );
}

/* ====================== Archive Screen ====================== */
function ArchiveScreen({ variant, statuses, onBack, onSelectDay }) {
  const today = getDayNumber();
  const days = sUseMemo(() => {
    const arr = [];
    for (let i = today; i >= 0; i--) {
      arr.push({ dayNumber: i, date: dayNumberToDate(i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), status: statuses[i] || 'not_played' });
    }
    return arr;
  }, [today, statuses]);
  const mobile = variant === 'mobile';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex justify-between items-center p-4 sm:p-6">
        <button onClick={onBack} className="flex items-center justify-center rounded-xl text-white transition-colors" style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}><BackIcon /></button>
        <button onClick={onBack} className="flex items-center gap-1" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
          <img src="assets/radle_icon.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          <span className="text-white font-baloo font-extrabold tracking-tight" style={{ fontSize: mobile ? '1.5rem' : '2rem' }}>Radiordle</span>
        </button>
        <div style={{ width: 44 }} />
      </div>
      <div className="text-center mb-7">
        <h2 className="text-3xl text-white font-bold font-baloo">Archive</h2>
        <p className="text-white/60 mt-1 font-baloo">Play any past puzzle!</p>
      </div>
      <div className="px-4 pb-12">
        <div className="w-full max-w-2xl mx-auto grid gap-2.5" style={{ gridTemplateColumns: `repeat(${mobile ? 4 : 5}, minmax(0,1fr))` }}>
          {days.map((d) => {
            const isToday = d.dayNumber === today, won = d.status === 'won', lost = d.status === 'lost';
            const bg = won ? 'rgba(64,119,99,0.8)' : lost ? 'rgba(158,74,74,0.6)' : 'rgba(61,77,104,0.85)';
            return (
              <button key={d.dayNumber} onClick={() => onSelectDay(d.dayNumber)}
                className="relative flex flex-col items-center justify-center rounded-xl p-3 transition-transform active:scale-95"
                style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)' }}>
                {isToday && <span className="absolute -top-1.5 left-1/2 px-1.5 py-0.5 text-black text-[9px] font-bold font-baloo rounded leading-none" style={{ transform: 'translateX(-50%)', background: C.warning }}>TODAY</span>}
                <span className="text-white font-bold font-baloo text-sm sm:text-base leading-tight inline-flex items-center gap-1">
                  Day {d.dayNumber + 1}
                  {won && <svg className="w-3.5 h-3.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  {lost && <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                </span>
                <span className="text-white/50 text-[10px] sm:text-xs leading-tight mt-0.5">{d.date}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TopBar, GameScreen, AboutScreen, ArchiveScreen });
