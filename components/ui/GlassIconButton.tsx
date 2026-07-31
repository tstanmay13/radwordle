'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * GlassIconButton — a square, icon-only control used across the navbar and
 * modals (design foundation: radiordle-core.jsx `GlassIconButton`).
 *
 * Transparent by default, a soft white wash on hover. Renders as a Next
 * `<Link>` when `href` is given, otherwise a `<button>`. Colors/hover come
 * from Tailwind utilities (no per-frame JS state), keeping it a static paint.
 */
interface GlassIconButtonProps {
  children: ReactNode;
  /** Used for both `title` and `aria-label` (icon-only, so a label is required). */
  label: string;
  /** Square size in px. */
  size?: number;
  /** When set, renders as a navigation link instead of a button. */
  href?: string;
  onClick?: () => void;
  className?: string;
}

const BASE =
  'flex items-center justify-center rounded-xl transition-colors ' +
  'text-white/80 hover:text-white hover:bg-white/10';

export default function GlassIconButton({
  children,
  label,
  size = 44,
  href,
  onClick,
  className = '',
}: GlassIconButtonProps) {
  const cls = `${BASE} ${className}`.trim();
  const style = { width: size, height: size };

  if (href) {
    return (
      <Link href={href} title={label} aria-label={label} className={cls} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={cls} style={style}>
      {children}
    </button>
  );
}
