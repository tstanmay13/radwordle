/**
 * PlainBackground — a plain dark radial base for the secondary screens
 * (About / Archive / Install). No PACS annotations, no teal glow — just the
 * same dark base color the game screen uses, so those pages stay clean and
 * cheap to scroll. Single element, no filters or animation.
 *
 * Purely decorative: aria-hidden + pointer-events-none.
 */
const BASE =
  'radial-gradient(120% 100% at 50% 34%, #0f1c3a 0%, #0a1226 60%, #070c18 100%)';

export default function PlainBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ background: BASE }}
    />
  );
}
