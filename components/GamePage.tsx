'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { Puzzle, Hint, Condition } from '@/lib/supabase';
import GameClient from './GameClient';
import PageBackground from './PageBackground';
import TopBar from './TopBar';
import StatsModal from './StatsModal';
import FeedbackModal from './FeedbackModal';
import ImageZoomModal from './ImageZoomModal';
import { GameState, getStatistics, Statistics } from '@/lib/localStorage';

interface GamePageProps {
  puzzle: Puzzle;
  hints: Hint[];
  conditions: Condition[];
  dayNumber: number;
  isArchive: boolean;
}

export default function GamePage({ puzzle, hints, conditions, dayNumber, isArchive }: GamePageProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomKey, setZoomKey] = useState(0);
  const zoomClosedAt = useRef(0);
  const handleZoomClose = useCallback(() => {
    zoomClosedAt.current = Date.now();
    setShowZoom(false);
  }, []);
  const [stats, setStats] = useState<Statistics>({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
  });

  // Load stats on mount and when game state changes
  useEffect(() => {
    // Wrap in Promise to avoid synchronous setState in effect
    Promise.resolve().then(() => {
      setStats(getStatistics());
    });
  }, [gameState?.isComplete]);

  // Track initial hint count so only newly revealed hints animate (not restored from save)
  const [baseHintCount, setBaseHintCount] = useState<number | null>(null);
  const baseHintCaptured = useRef(false);
  // The mobile hints scroll region — auto-scrolled to the newest hint on reveal.
  const hintsScrollRef = useRef<HTMLDivElement>(null);

  // Track whether the image border has appeared (for pulse animation)
  const [showImagePulse, setShowImagePulse] = useState(false);
  const prevHadBorder = useRef(false);

  const handleGameStateChange = useCallback((state: GameState) => {
    setGameState(state);

    // Capture the hint count on first game state load (one-shot)
    if (!baseHintCaptured.current) {
      setBaseHintCount(state.revealedHints);
      baseHintCaptured.current = true;
    }

    // Trigger pulse animation when image border first appears
    const hasBorder = !!(state.guessResults[0]);
    if (hasBorder && !prevHadBorder.current) {
      setShowImagePulse(true);
      prevHadBorder.current = true;
    }
  }, []);

  // When a new hint is revealed during play, scroll the mobile hints region to
  // the newest one so a hint that lands below the fold isn't missed. The
  // baseHintCount guard keeps it from firing on initial load of a restored
  // mid-game. No-op on desktop, where this container isn't the scroll parent
  // (sm:overflow-visible), so scrollTo has no range.
  useEffect(() => {
    if (baseHintCount === null) return;
    const revealed = gameState?.revealedHints ?? 0;
    if (revealed <= baseHintCount) return;
    const el = hintsScrollRef.current;
    // scrollTo is unimplemented in jsdom — call defensively to keep tests green.
    el?.scrollTo?.({ top: el.scrollHeight, behavior: 'smooth' });
  }, [gameState?.revealedHints, baseHintCount]);

  // Determine which hints to show based on game state
  // Show all hints when game is complete, otherwise only show revealed hints
  const visibleHints = gameState
    ? (gameState.isComplete ? hints : hints.slice(0, gameState.revealedHints))
    : [];

  // Determine image border color based on first guess result
  // The first guess is made with only the image, so it reflects how helpful the image was
  const firstGuessResult = gameState?.guessResults[0];
  // Result-colored border on the X-ray card (design: XrayCard). A subtle neutral
  // border shows before the first guess, then transitions to the softer
  // success/warning/error ring color. Border-color only — a static paint with no
  // glow filter — so the feedback stays cheap.
  let imageBorderColor = 'border-white/[0.12]';
  if (firstGuessResult === 'correct') {
    imageBorderColor = 'border-ring-success';
  } else if (firstGuessResult === 'partial') {
    imageBorderColor = 'border-ring-warning';
  } else if (firstGuessResult === 'incorrect') {
    imageBorderColor = 'border-ring-error';
  }

  // Annotated image: show after first guess if a valid URL is provided
  const annotatedImageUrl = puzzle.annotated_image_url?.startsWith('http')
    ? puzzle.annotated_image_url
    : null;
  const showAnnotated = !!annotatedImageUrl && (gameState?.guesses.length ?? 0) >= 1;

  // Active image URL for zoom modal — show whichever version is currently displayed
  const activeImageUrl = showAnnotated && annotatedImageUrl
    ? annotatedImageUrl
    : puzzle.image_url;

  return (
    <div
      className="relative overflow-x-hidden h-[100dvh] overflow-y-hidden sm:h-auto sm:min-h-screen-safe sm:overflow-y-auto"
      style={{ minHeight: 'var(--full-vh)' }}
    >
      {/* Animated DICOM/PACS background (fixed on desktop so it doesn't scroll) */}
      <PageBackground />

      {/* Content. On mobile this is a locked viewport-height flex column (image
          pinned top, input in-flow at bottom, hints scroll between) so the
          keyboard can't push the image out of frame; desktop keeps its natural
          scrolling min-height layout. */}
      <div className="relative z-10 flex flex-col h-full sm:h-auto sm:min-h-screen-safe" style={{ minHeight: 'var(--full-vh)' }}>
        {/* Glass top navigation bar */}
        <TopBar
          onStats={() => setShowStats(true)}
          onFeedback={() => setShowFeedback(true)}
        />

        {/* Main Content — mobile: the locked flex column (min-h-0 lets the hints
            region below scroll instead of pushing the input off-screen). */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 pt-2 pb-0 sm:pb-4 sm:pt-4">

          {/* Medical Image Display — pinned at the top of the mobile column
              (shrink-0 keeps it full-size; it never scrolls away). */}
          <div className="w-full max-w-3xl lg:max-w-4xl mb-3 sm:mb-6 shrink-0 pb-2">
            <div
              className={`relative w-full aspect-[16/9] bg-black rounded-lg overflow-hidden border-2 ${imageBorderColor} shadow-[0_10px_34px_rgba(0,0,0,0.5)] transition-colors duration-300 cursor-pointer${showImagePulse ? ' animate-image-pulse' : ''}`}
              onClick={() => { if (puzzle.image_url && Date.now() - zoomClosedAt.current > 300) { setZoomKey(k => k + 1); setShowZoom(true); } }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && puzzle.image_url) { e.preventDefault(); setZoomKey(k => k + 1); setShowZoom(true); } }}
              aria-label="Click to zoom image"
            >
              {puzzle.image_url ? (
                <Image
                  src={puzzle.image_url}
                  alt={`Puzzle ${puzzle.puzzle_number}`}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>No image available</p>
                </div>
              )}
              {/* Annotated image overlay — fades in after first guess */}
              {annotatedImageUrl && (
                <div className={`absolute inset-0 transition-opacity duration-300 ${showAnnotated ? 'opacity-100' : 'opacity-0'}`}>
                  <Image
                    src={annotatedImageUrl}
                    alt={`Puzzle ${puzzle.puzzle_number} annotated`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                  />
                </div>
              )}
              {/* Zoom indicator icon */}
              {puzzle.image_url && (
                <div className="absolute bottom-3 right-3 bg-black/50 rounded-full p-1.5 text-white/80 pointer-events-none">
                  <ZoomIn size={20} />
                </div>
              )}
            </div>
          </div>

          {/* Question */}
          <h2 className="shrink-0 text-xl sm:text-2xl md:text-[1.75rem] text-white font-bold font-baloo-2 mb-2 sm:mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            What&apos;s the Diagnosis?
          </h2>

          {/* Hints Display — only show revealed hints. On mobile this is the
              flex-1 scroll region: it takes the slack between the pinned image
              and the bottom input, and scrolls internally once the revealed
              hints outgrow that space (keeping image + input fixed in frame).
              Desktop keeps its natural page-scrolling flow via the sm: resets. */}
          {visibleHints.length > 0 && (
            <div ref={hintsScrollRef} className="w-full max-w-2xl mx-auto space-y-2.5 mb-4 sm:mb-6 flex-1 min-h-0 overflow-y-auto sm:flex-none sm:overflow-visible">
              {visibleHints.map((hint, index) => {
                // Hints are revealed after a guess. The guess that revealed this hint is at index.
                // To color the hint based on the NEXT guess after it was revealed, we look at index + 1.
                // If there's no next guess yet, the hint stays blue.
                const nextGuessResult = gameState?.guessResults[index + 1];

                // Determine the color and text color based on the next guess result
                let hintStyle = '';
                let textColor = 'text-white';

                if (nextGuessResult === 'correct') {
                  // Green for correct guess
                  hintStyle = 'bg-success';
                  textColor = 'text-white';
                } else if (nextGuessResult === 'partial') {
                  // Yellow for partial match
                  hintStyle = 'bg-warning';
                  textColor = 'text-black';
                } else if (nextGuessResult === 'incorrect') {
                  // Red for incorrect guess
                  hintStyle = 'bg-error';
                  textColor = 'text-white';
                } else {
                  // Default blue if no next guess yet
                  hintStyle = 'bg-hint-default/70';
                  textColor = 'text-white';
                }

                // Only animate hints that were revealed after the initial load
                const isNewHint = baseHintCount !== null && index >= baseHintCount;

                return (
                  <div
                    key={hint.id}
                    className={`relative ${hintStyle} ${textColor} rounded-xl px-5 py-3.5 transition-colors duration-300 border border-white/10 shadow-md${isNewHint ? ' animate-hint-reveal' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold font-baloo-2">
                        {index + 1}
                      </span>
                      <p className="text-base sm:text-lg leading-snug pt-0.5">
                        {hint.hint_text || hint.image_caption || `Hint ${index + 1}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Input and Submit */}
          <GameClient
            conditions={conditions}
            dayNumber={dayNumber}
            puzzleNumber={puzzle.puzzle_number}
            correctAnswer={puzzle.answer}
            citation={puzzle.citation}
            learnLink={puzzle.learn_link}
            description={puzzle.condition_description}
            isArchive={isArchive}
            onGameStateChange={handleGameStateChange}
          />
        </div>
      </div>


      {/* Stats Modal - Rendered outside z-10 content container to ensure it overlays everything */}
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        pageContext={isArchive ? `archive/day-${dayNumber}` : `day-${dayNumber}`}
      />

      {/* Image Zoom Modal — key forces fresh remount on each open */}
      {showZoom && activeImageUrl && (
        <ImageZoomModal
          key={zoomKey}
          onClose={handleZoomClose}
          imageUrl={activeImageUrl}
          altText={`Puzzle ${puzzle.puzzle_number}${showAnnotated ? ' annotated' : ''}`}
        />
      )}
    </div>
  );
}
