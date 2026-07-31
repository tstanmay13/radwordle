'use client';

import { CSSProperties } from 'react';

/**
 * Ambient page background — the "Classic" annotated DICOM/PACS treatment from
 * the redesign prototype (radiordle-core.jsx `PageBackground`, `bg='annotated'`).
 * Soft aurora glows sit behind a subtle PACS overlay (corner metadata, R/L
 * orientation markers, couch curve, scale ruler), finished with film grain +
 * a center-focusing vignette.
 *
 * Purely decorative: pointer-events-none, aria-hidden. The whole thing renders
 * as a single static paint — the prototype's animated blur blobs were replaced
 * with static radial-gradient glows (no blur filters, no animation, no promoted
 * layers) so the background stays cheap and never re-rasterizes.
 * Sizing/position values that differed between the prototype's desktop and
 * mobile frames are expressed here as responsive Tailwind classes.
 */

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const RADBG =
  'radial-gradient(120% 100% at 50% 34%, #0a1428 0%, #060b1a 62%, #03060f 100%)';
const TICK = 'rgba(160,195,255,0.20)';

// Ambient aurora glows, baked into the background paint. These reproduce the
// prototype's two heavily-blurred color blobs (blue top, teal lower-right) as
// static radial gradients — same soft light field, but with no blur filter,
// no animation, and no extra compositing layers, so the whole background
// paints once and stays cheap. (Positions/alphas track the original blobs:
// blue rgba(56,130,230) centered ~56%/30%, teal rgba(45,212,191) ~85%/73%.)
const AURORA_A =
  'radial-gradient(46% 42% at 56% 30%, rgba(56,130,230,0.20) 0%, rgba(56,130,230,0) 72%)';
const AURORA_B =
  'radial-gradient(42% 40% at 85% 73%, rgba(45,212,191,0.10) 0%, rgba(45,212,191,0) 72%)';

// Fine film grain — the detail that separates premium dark UIs from flat ones.
function Grain({ opacity = 0.05 }: { opacity?: number }) {
  const n = encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"
  );
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,${n}")`,
        backgroundSize: '180px 180px',
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

// Center-focusing vignette so content stays legible over any texture.
function Vignette({ strength = 0.66 }: { strength?: number }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 115% 90% at 50% 42%, transparent 46%, rgba(3,6,15,${strength}) 100%)`,
      }}
    />
  );
}

export default function PageBackground() {
  // Constant portions of the corner-metadata / orientation styles (font size is
  // applied responsively via className below).
  const meta: CSSProperties = {
    fontFamily: MONO,
    lineHeight: 1.7,
    letterSpacing: '0.04em',
    color: 'rgba(170,200,255,0.17)',
    whiteSpace: 'pre',
  };
  const orient: CSSProperties = {
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'rgba(170,200,255,0.22)',
  };
  const ruler = Array.from({ length: 31 });

  return (
    <div
      aria-hidden="true"
      className="absolute sm:fixed inset-0 overflow-hidden pointer-events-none"
      style={{ background: `${AURORA_A}, ${AURORA_B}, ${RADBG}` }}
    >
      {/* Framing rule */}
      <div
        className="absolute"
        style={{ inset: '5%', border: '1px solid rgba(150,185,255,0.10)', borderRadius: 3 }}
      />

      {/* Corner metadata — authentic PACS/DICOM fields */}
      <div className="absolute text-[8.5px] sm:text-[11px]" style={{ top: '7%', left: '6%', ...meta }}>
        {'Im: 24/512\nSe: 3\nJPEG Lossy 20:1'}
      </div>
      <div
        className="absolute text-[8.5px] sm:text-[11px] text-right"
        style={{ top: '7%', right: '6%', ...meta }}
      >
        {'Study ID: 100482\nCT ABDOMEN W/CONTRAST\nAXIAL 2.0MM SOFT TISSUE\nFlip H'}
      </div>
      <div className="absolute text-[8.5px] sm:text-[11px]" style={{ bottom: '24%', left: '6%', ...meta }}>
        {'X: 256  Y: 198   HU: 42\nWL: 40  WW: 400   [Soft Tissue]\nThk: 2.0mm   Loc: -84.5mm'}
      </div>
      <div
        className="absolute text-[8.5px] sm:text-[11px] text-right"
        style={{ bottom: '24%', right: '6%', ...meta }}
      >
        {'1.5T\nTR: 500  TE: 14\n2024-03-12  14:22:05'}
      </div>

      {/* R / L orientation markers */}
      <div className="absolute" style={{ top: '49%', left: '6.5%', ...orient }}>
        R
      </div>
      <div className="absolute" style={{ top: '49%', right: '6.5%', ...orient }}>
        L
      </div>

      {/* Curved couch line, like a real CT table edge */}
      <svg
        className="absolute bottom-[18%] sm:bottom-[11%]"
        style={{ left: '20%', width: '60%', height: '5%', overflow: 'visible' }}
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0 44 Q400 6 800 44"
          fill="none"
          stroke="rgba(160,195,255,0.22)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Scale ruler with hash ticks */}
      <div
        className="absolute bottom-[15%] sm:bottom-[8%]"
        style={{ left: '20%', width: '60%', height: 1, background: TICK }}
      />
      {ruler.map((_, i) => (
        <div
          key={i}
          className="absolute bottom-[15%] sm:bottom-[8%]"
          style={{
            left: 20 + i * 2 + '%',
            width: 1,
            height: i % 5 === 0 ? 11 : 6,
            background: TICK,
          }}
        />
      ))}

      <Grain opacity={0.05} />
      <Vignette strength={0.66} />
    </div>
  );
}
