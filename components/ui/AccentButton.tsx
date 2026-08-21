'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * AccentButton — the amber call-to-action used for Archives and other primary
 * actions (design foundation: radiordle-core.jsx `AccentButton`).
 *
 * Amber gradient + soft glow, bold black display text. Renders as a Next
 * `<Link>` when `href` is given, otherwise a `<button>`. The gradient is wired
 * to the `--color-accent*` tokens so it stays in sync with the palette.
 */
interface AccentButtonProps {
  icon?: ReactNode;
  label?: string;
  /** Smaller, tighter sizing for compact/mobile placements. */
  compact?: boolean;
  /** When set, renders as a navigation link instead of a button. */
  href?: string;
  onClick?: () => void;
  /** Falls back to `label` for `title` / `aria-label`. */
  title?: string;
  className?: string;
}

const ACCENT_STYLE = {
  background: 'linear-gradient(to bottom, var(--color-accent-light), var(--color-accent))',
  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
};

export default function AccentButton({
  icon,
  label,
  compact = false,
  href,
  onClick,
  title,
  className = '',
}: AccentButtonProps) {
  const sizeCls = compact ? 'gap-1.5 px-3.5 h-9 text-sm' : 'gap-2 px-4 h-11 text-base';
  const cls =
    'inline-flex items-center justify-center font-baloo-2 font-bold text-black ' +
    `rounded-xl transition-transform active:scale-95 ${sizeCls} ${className}`.trim();
  const accessibleTitle = title ?? label;

  const inner = (
    <>
      {icon}
      {label && <span>{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} title={accessibleTitle} className={cls} style={ACCENT_STYLE}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} title={accessibleTitle} className={cls} style={ACCENT_STYLE}>
      {inner}
    </button>
  );
}
