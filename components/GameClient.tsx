'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Condition, getGlobalStats, getPuzzleGuessDistribution, calculatePuzzlePercentile, GlobalStats } from '@/lib/supabase';
import { Share2, Copy, Info, ChevronDown } from 'lucide-react';
import { getCookieConsent } from './CookieConsent';
import DiagnosisAutocomplete from './DiagnosisAutocomplete';
import ModalShell from './ui/ModalShell';
import StatRow from './ui/StatRow';
import GuessDistribution from './ui/GuessDistribution';
import { checkAnswer } from '@/lib/gameLogic';
import { MAX_GUESSES } from '@/lib/gameLogic';
import {
  getGameState,
  saveGameState,
  updateStatistics,
  updateArchiveStatistics,
  getStatistics,
  updateGuessTimeStatistics,
  type GameState,
} from '@/lib/localStorage';
import { getOrCreatePlayerHash } from '@/lib/playerIdentity';
import { submitGameResult } from '@/lib/supabase';

// Toast feedback types
type ToastType = 'correct' | 'partial' | 'incorrect' | 'copied' | null;

interface ToastConfig {
  message: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

interface GameClientProps {
  conditions: Condition[];
  dayNumber: number;
  puzzleNumber: number;
  correctAnswer: string;
  citation?: string | null;
  learnLink?: string | null;
  /** Optional "About this condition" blurb for the results modal. */
  description?: string | null;
  isArchive: boolean;
  onGameStateChange: (state: GameState) => void;
  onTypingStateChange?: (isTyping: boolean) => void;
}

// Toast configuration for different result types
const TOAST_CONFIG: Record<Exclude<ToastType, null>, ToastConfig> = {
  correct: {
    message: 'Correct!',
    bgColor: 'bg-success',
    textColor: 'text-white',
    icon: '✓',
  },
  partial: {
    message: "Close! You're on the right track",
    bgColor: 'bg-warning',
    textColor: 'text-black',
    icon: '◐',
  },
  incorrect: {
    message: 'Not quite - try again',
    bgColor: 'bg-error',
    textColor: 'text-white',
    icon: '✗',
  },
  copied: {
    message: 'Results copied to clipboard!',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    icon: '📋',
  },
};

export default function GameClient({
  conditions,
  dayNumber,
  puzzleNumber,
  correctAnswer,
  citation,
  learnLink,
  description,
  isArchive,
  onGameStateChange,
  onTypingStateChange,
}: GameClientProps) {
  // Lazy initialize game state from localStorage
  const [gameState, setGameState] = useState<GameState | null>(() => {
    const savedState = getGameState(dayNumber);
    if (savedState) {
      return savedState;
    }
    // Initialize new game state
    return {
      dayNumber,
      guesses: [],
      guessResults: [],
      revealedHints: 0,
      isComplete: false,
      isWon: false,
      hasPartialMatch: false,
    };
  });
  const [showModal, setShowModal] = useState(() => gameState?.isComplete || false);
  const [toast, setToast] = useState<ToastType>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Always start false to avoid SSR/client hydration mismatch, then check localStorage after mount
  const [consentGiven, setConsentGiven] = useState(false);
  const consentFallbackFired = useRef(false);

  // Check consent after hydration, then poll for changes
  useEffect(() => {
    // Immediate check after mount (avoids hydration mismatch since useState always starts false)
    if (getCookieConsent() === 'accepted') {
      setConsentGiven(true);
      return;
    }
    // Poll for consent changes (banner dismissal)
    const interval = setInterval(() => {
      if (getCookieConsent() === 'accepted') {
        setConsentGiven(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [consentGiven]);

  // Separate one-shot fallback that survives effect re-runs (strict mode, hydration)
  useEffect(() => {
    if (consentGiven || consentFallbackFired.current) return;
    const fallbackTimeout = setTimeout(() => {
      consentFallbackFired.current = true;
      setConsentGiven(true);
    }, 5000);
    return () => clearTimeout(fallbackTimeout);
  }, [consentGiven]);
  const guessStartTime = useRef<number>(0);
  const gameStartTime = useRef<number>(0);
  const playerHashRef = useRef<string | null>(null);

  // Initialize timing refs and player hash on mount
  useEffect(() => {
    const now = Date.now();
    guessStartTime.current = now;
    gameStartTime.current = now;

    getOrCreatePlayerHash().then((hash) => {
      playerHashRef.current = hash;
    });
  }, []);

  // Notify parent of initial game state
  useEffect(() => {
    Promise.resolve().then(() => {
      if (gameState) {
        onGameStateChange(gameState);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount, intentionally excluding gameState/onGameStateChange

  // Clear toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Show toast notification
  const showToast = useCallback((type: ToastType) => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast(type);

    // Auto-dismiss after 2 seconds (longer for correct to let celebration sink in)
    const duration = type === 'correct' ? 2500 : 2000;
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  const handleSubmit = useCallback(
    (diagnosis: string) => {
      if (!gameState || gameState.isComplete) return;

      // Track guess time (time since last guess or game start)
      const guessTimeSeconds = (Date.now() - guessStartTime.current) / 1000;
      updateGuessTimeStatistics(guessTimeSeconds);
      // Reset timer for next guess
      guessStartTime.current = Date.now();

      const result = checkAnswer(diagnosis, correctAnswer);
      const newGuesses = [...gameState.guesses, diagnosis];
      const newGuessResults = [...gameState.guessResults, result];

      // Show toast feedback for the guess result
      showToast(result);

      let newState: GameState;

      if (result === 'correct') {
        // Win condition
        newState = {
          ...gameState,
          guesses: newGuesses,
          guessResults: newGuessResults,
          isComplete: true,
          isWon: true,
        };
        if (isArchive) {
          updateArchiveStatistics(true, newGuesses.length);
        } else {
          updateStatistics(true, newGuesses.length, dayNumber);
        }
        // Submit to global analytics
        const totalSolveTime = (Date.now() - gameStartTime.current) / 1000;
        submitGameResult({
          puzzle_number: puzzleNumber,
          won: true,
          guess_count: newGuesses.length,
          hints_used: gameState.revealedHints,
          guesses: newGuesses,
          player_hash: playerHashRef.current,
          solve_time_seconds: totalSolveTime,
        }).then((submitResult) => {
          // Save the first solver status to localStorage (data still tracked, UI hidden)
          const updatedState: GameState = {
            ...newState,
            isFirstSolver: submitResult.isFirstSolver,
          };
          saveGameState(updatedState);
          setGameState(updatedState);
        });
        setShowModal(true);
      } else if (newGuesses.length >= MAX_GUESSES) {
        // Loss condition
        newState = {
          ...gameState,
          guesses: newGuesses,
          guessResults: newGuessResults,
          isComplete: true,
          isWon: false,
        };
        if (isArchive) {
          updateArchiveStatistics(false, newGuesses.length);
        } else {
          updateStatistics(false, newGuesses.length, dayNumber);
        }
        // Submit to global analytics
        submitGameResult({
          puzzle_number: puzzleNumber,
          won: false,
          guess_count: newGuesses.length,
          hints_used: gameState.revealedHints,
          guesses: newGuesses,
          player_hash: playerHashRef.current,
        });
        setShowModal(true);
      } else {
        // Incorrect or partial - reveal next hint
        const isPartial = result === 'partial';
        newState = {
          ...gameState,
          guesses: newGuesses,
          guessResults: newGuessResults,
          revealedHints: gameState.revealedHints + 1,
          hasPartialMatch: gameState.hasPartialMatch || isPartial,
        };
      }

      setGameState(newState);
      saveGameState(newState);
      onGameStateChange(newState);
    },
    [gameState, correctAnswer, onGameStateChange, isArchive, dayNumber, puzzleNumber, showToast]
  );

  const handleDropdownStateChange = useCallback((isOpen: boolean) => {
    onTypingStateChange?.(isOpen);
  }, [onTypingStateChange]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  if (!gameState) return null;

  return (
    <>
      {/* Toast notification for guess feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-20 left-1/2 z-[200] px-6 py-3 rounded-lg shadow-lg
            ${TOAST_CONFIG[toast].bgColor} ${TOAST_CONFIG[toast].textColor}
            animate-toast-in
            font-baloo-2 font-semibold text-lg flex items-center gap-2`}
        >
          <span className="text-xl">{TOAST_CONFIG[toast].icon}</span>
          {TOAST_CONFIG[toast].message}
        </div>
      )}

      {/* Desktop layout - normal flow */}
      <div className="hidden sm:block w-full pb-[220px]">
        {gameState.isComplete ? (
          <div className="text-center text-white text-xl font-baloo-2 font-bold">
            {gameState.isWon ? (
              <>
                <p>Congratulations! The answer was:</p>
                <p className="text-2xl mt-1 text-accent">{correctAnswer}</p>
              </>
            ) : (
              <>
                <p>Game Over. The answer was:</p>
                <p className="text-2xl mt-1 text-accent">{correctAnswer}</p>
              </>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-accent to-accent-light hover:from-accent hover:to-accent text-black font-bold font-baloo-2 rounded-lg transition-all shadow-lg"
            >
              View Results
            </button>
          </div>
        ) : (
          <DiagnosisAutocomplete
            conditions={conditions}
            onSubmit={handleSubmit}
            onDropdownStateChange={handleDropdownStateChange}
            previousGuesses={gameState.guesses}
            disabled={!consentGiven}
            current={gameState.guesses.length + 1}
            total={MAX_GUESSES}
          />
        )}
      </div>

      {/* Mobile layout — pinned to the bottom of GamePage's locked column via
          mt-auto (shrink-0 keeps it from being squeezed). No fixed positioning:
          with interactive-widget=resizes-content the keyboard shrinks the column
          and the bar rides up above it, while the image stays pinned at the top. */}
      <div className="sm:hidden w-full mt-auto shrink-0">
        {gameState.isComplete ? (
          <div className="text-center text-white text-xl font-baloo-2 font-bold pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {gameState.isWon ? (
              <>
                <p>Congratulations! The answer was:</p>
                <p className="text-2xl mt-1 text-accent">{correctAnswer}</p>
              </>
            ) : (
              <>
                <p>Game Over. The answer was:</p>
                <p className="text-2xl mt-1 text-accent">{correctAnswer}</p>
              </>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-accent to-accent-light hover:from-accent hover:to-accent text-black font-bold font-baloo-2 rounded-lg transition-all shadow-lg"
            >
              View Results
            </button>
          </div>
        ) : (
          /* Full-bleed gradient scrim (-mx-4 cancels the parent's px-4) fades the
             scrolling hints out behind the pill; the bottom padding lifts the bar
             off the edge and clears the safe-area inset. */
          <div className="-mx-4 px-4 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-page-bg-dark via-page-bg-dark/80 to-transparent">
            <DiagnosisAutocomplete
              conditions={conditions}
              onSubmit={handleSubmit}
              onDropdownStateChange={handleDropdownStateChange}
              previousGuesses={gameState.guesses}
              isMobile={true}
              disabled={!consentGiven}
              current={gameState.guesses.length + 1}
              total={MAX_GUESSES}
            />
          </div>
        )}
      </div>

      {showModal && (
        <ResultsModal
          isWon={gameState.isWon}
          guessCount={gameState.guesses.length}
          guesses={gameState.guesses}
          correctAnswer={correctAnswer}
          citation={citation}
          learnLink={learnLink}
          description={description}
          dayNumber={dayNumber}
          puzzleNumber={puzzleNumber}
          isArchive={isArchive}
          onClose={handleCloseModal}
          onCopied={() => showToast('copied')}
        />
      )}
    </>
  );
}

interface ResultsModalProps {
  isWon: boolean;
  guessCount: number;
  guesses: string[];
  correctAnswer: string;
  citation?: string | null;
  learnLink?: string | null;
  /** Optional plain-language blurb about the condition (collapsible section). */
  description?: string | null;
  dayNumber: number;
  puzzleNumber: number;
  isArchive: boolean;
  onClose: () => void;
  onCopied: () => void;
}

/** Colored squares — one per guess, tinted by that guess's result. */
function ResultTiles({ guesses, correctAnswer }: { guesses: string[]; correctAnswer: string }) {
  return (
    <div className="flex justify-center gap-1.5 mb-2.5">
      {Array.from({ length: MAX_GUESSES }).map((_, i) => {
        const guess = guesses[i];
        let background = 'rgba(255,255,255,0.05)';
        let boxShadow: string | undefined;
        if (guess) {
          const r = checkAnswer(guess, correctAnswer);
          background =
            r === 'correct'
              ? 'var(--color-success)'
              : r === 'partial'
                ? 'var(--color-warning)'
                : 'var(--color-error)';
          if (r === 'correct') boxShadow = '0 0 12px rgba(64,119,99,0.65)';
        }
        return (
          <div
            key={i}
            className="w-[26px] h-[26px] rounded-[7px] border border-white/[0.14] transition-all"
            style={{ background, boxShadow }}
          />
        );
      })}
    </div>
  );
}

/** Collapsible "About this condition" blurb. Only rendered when text exists. */
function ConditionAbout({ text }: { text: string }) {
  // Collapsed by default on mobile, open on wider screens — approximated with a
  // simple default-open state (users can toggle on any width).
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl mb-4 overflow-hidden bg-white/[0.04] border border-white/[0.08]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
      >
        <span className="font-semibold text-white/85 text-sm flex items-center gap-2">
          <Info size={15} className="text-accent-light" />
          About this condition
        </span>
        <ChevronDown
          size={16}
          className="text-white/60 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div className="px-4 pb-3.5">
          <p className="text-white/70 text-sm leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}

function ResultsModal({
  isWon,
  guessCount,
  guesses,
  correctAnswer,
  citation,
  learnLink,
  description,
  dayNumber,
  puzzleNumber,
  isArchive,
  onClose,
  onCopied,
}: ResultsModalProps) {
  const stats = getStatistics();
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [percentileBeat, setPercentileBeat] = useState<number | null>(null);

  // Fetch puzzle-specific guess distribution and calculate percentile for this puzzle
  useEffect(() => {
    // Fetch global stats for the summary row (win rate, avg guess, avg time)
    getGlobalStats().then((global) => {
      setGlobalStats(global);
    });

    // Percentile: compare user's guess count on THIS puzzle vs this puzzle's distribution
    if (isWon) {
      getPuzzleGuessDistribution(puzzleNumber).then((result) => {
        if (result) {
          const percentile = calculatePuzzlePercentile(guessCount, result.distribution, result.totalAttempts);
          setPercentileBeat(percentile);
        }
      });
    }
  }, [puzzleNumber, guessCount, isWon]);

  // Calculate user's average guesses (only counting wins)
  const userAvgGuesses = (() => {
    let totalGuesses = 0;
    let totalWins = 0;
    for (const [guessNum, count] of Object.entries(stats.guessDistribution)) {
      totalGuesses += parseInt(guessNum) * count;
      totalWins += count;
    }
    return totalWins > 0 ? totalGuesses / totalWins : 0;
  })();

  // Calculate average guess time
  const avgGuessTime = stats.totalGuessCount && stats.totalGuessCount > 0
    ? (stats.totalGuessTime || 0) / stats.totalGuessCount
    : 0;

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  // Build the shareable emoji-grid text (used by both Share and Copy).
  const buildShareText = useCallback(() => {
    const emojiGrid = guesses
      .map((guess) => {
        const result = checkAnswer(guess, correctAnswer);
        if (result === 'correct') return '🟩';
        if (result === 'partial') return '🟨';
        return '🟥'; // Red for incorrect guesses
      })
      .join('');
    const unusedBoxes = '⬛'.repeat(MAX_GUESSES - guesses.length);
    const fullGrid = emojiGrid + unusedBoxes;
    const displayDay = dayNumber + 1;
    const prefix = isArchive ? '🩻 Radiordle Archive Day' : '🩻 Radiordle Day';
    return `${prefix} ${displayDay} ${isWon ? guessCount : 'X'}/${MAX_GUESSES}\n${fullGrid}\nhttps://radiordle.org`;
  }, [guesses, correctAnswer, dayNumber, isWon, guessCount, isArchive]);

  // Copy to clipboard with a resilient fallback for iOS Safari / older browsers.
  const copyResults = useCallback(() => {
    const shareText = buildShareText();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText).then(
        () => { onCopied(); },
        () => { onCopied(); }
      );
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        onCopied();
      } catch {
        // Silent fail
      }
    }
  }, [buildShareText, onCopied]);

  // Native share sheet where available (mobile), otherwise fall back to copy.
  const shareResults = useCallback(() => {
    const shareText = buildShareText();
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Radiordle', text: shareText }).catch(() => {});
    } else {
      copyResults();
    }
  }, [buildShareText, copyResults]);

  // "How You Compare" — amber glass box with real puzzle-specific percentile.
  // Rendered on desktop (in the distribution grid) and again on mobile (below
  // the action buttons); className controls which one is visible.
  const renderCompareBox = (className: string) => (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{
        background: 'linear-gradient(155deg, rgba(245,158,11,0.12), rgba(61,77,104,0.42))',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <h3 className="text-base font-bold text-white text-center mb-3">How You Compare</h3>
      {percentileBeat !== null ? (
        <div className="text-center">
          <p className="text-3xl font-extrabold" style={{ color: '#fbbf24' }}>
            Top {100 - percentileBeat}%
          </p>
          <p className="text-sm text-white/70 mt-1">
            You beat <span className="font-semibold text-white/90">{percentileBeat}%</span> of
            players on this puzzle
          </p>
        </div>
      ) : globalStats === null ? (
        <p className="text-center text-white/50 text-sm">Loading stats...</p>
      ) : (
        <p className="text-center text-white/50 text-sm">Not enough data yet</p>
      )}
      <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
        <div>
          <p className="text-white/60">Win Rate</p>
          <p className="font-bold text-white">{winRate}%</p>
        </div>
        <div>
          <p className="text-white/60">Avg Guess #</p>
          <p className="font-bold text-white">{userAvgGuesses > 0 ? userAvgGuesses.toFixed(1) : '-'}</p>
        </div>
        <div>
          <p className="text-white/60">Avg Time</p>
          <p className="font-bold text-white">{avgGuessTime > 0 ? `${avgGuessTime.toFixed(1)}s` : '-'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <ModalShell
      onClose={onClose}
      maxWidthClass="max-w-[460px] sm:max-w-[640px]"
      showClose
      ariaLabel="Game results"
      testId="results-modal"
    >
      {/* Header: title, result tiles, gradient answer */}
      <div className="text-center mb-5">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {isWon ? '🎉 Congratulations!' : '😔 Game Over'}
        </h2>
        <ResultTiles guesses={guesses} correctAnswer={correctAnswer} />
        <p className="text-sm sm:text-base text-white/55 mb-1">The correct answer was</p>
        <p
          className="font-extrabold leading-tight text-[22px] sm:text-[27px]"
          style={{
            backgroundImage: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textWrap: 'balance',
          }}
        >
          {correctAnswer}
        </p>
        {citation && <p className="text-xs mt-2 italic text-white/45">{citation}</p>}
      </div>

      {/* About this condition (only when a description is supplied) */}
      {description && <ConditionAbout text={description} />}

      {/* Stat cards */}
      <div className="mb-4">
        {isArchive && (
          <p className="text-xs italic text-white/40 text-center mb-2">
            Archive puzzles are not included in your statistics.
          </p>
        )}
        <StatRow stats={stats} winRate={winRate} />
      </div>

      {/* Guess Distribution + How You Compare (side-by-side on desktop when won) */}
      <div className={isWon ? 'sm:grid sm:grid-cols-2 sm:gap-4 mb-4' : 'mb-4'}>
        <div className="rounded-xl p-3 sm:p-4 mb-3 sm:mb-0 bg-white/[0.04] border border-white/[0.08]">
          <h3 className="text-base font-bold text-white text-center mb-3">Guess Distribution</h3>
          <GuessDistribution
            distribution={stats.guessDistribution}
            highlight={isWon ? guessCount : null}
          />
        </div>
        {isWon && renderCompareBox('hidden sm:block')}
      </div>

      {/* Share + Copy actions */}
      <div className="flex gap-3 mb-3">
        <button
          onClick={shareResults}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-black text-base rounded-xl shadow-lg transition-transform active:scale-95"
          style={{ background: 'linear-gradient(to right, var(--color-accent), var(--color-accent-light))' }}
        >
          <Share2 size={17} />
          Share
        </button>
        <button
          onClick={copyResults}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-white/85 text-base rounded-xl transition-colors bg-white/[0.07] hover:bg-white/[0.13] border border-white/[0.14]"
        >
          <Copy size={16} />
          Copy
        </button>
      </div>

      {/* Learn More */}
      {learnLink?.startsWith('http') && (
        <a
          href={learnLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-6 py-2.5 font-bold text-center text-base rounded-xl shadow-lg transition-transform active:scale-95"
          style={{ background: 'linear-gradient(to right, #8fb3e6, #6f97d6)', color: '#10203f' }}
        >
          Learn More
        </a>
      )}

      {/* How You Compare — mobile only (below actions) */}
      {isWon && renderCompareBox('sm:hidden mt-4')}
    </ModalShell>
  );
}
