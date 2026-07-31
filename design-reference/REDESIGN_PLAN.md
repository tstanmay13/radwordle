# Radiordle UI Redesign — Iterative Plan

Source: Claude Design project `Radiordle Redesign` (project id `6993c25c-f566-4d40-b0ab-891d78d4b4de`).
The imported prototype lives in this folder (`design-reference/`). It is a throwaway
React-UMD + Babel-standalone + Tailwind-CDN mockup — **reference only, never shipped**.
The real app is Next.js + TypeScript + Tailwind v4 with its own components.

## Branch strategy (why this exists)

```
main  (live / Vercel)  ──────────────────────────────────── final PR ──▶ merges here LAST
  └── feature/ui-redesign   (integration branch — never live until the end)
        ├── ui/01-design-tokens      → PR into feature/ui-redesign
        ├── ui/02-animated-bg        → PR into feature/ui-redesign
        ├── ui/03-glass-primitives   → PR into feature/ui-redesign
        └── … one branch + PR per chunk below
```

- Each chunk is a short-lived branch off `feature/ui-redesign`, opened as a PR **targeting
  `feature/ui-redesign`** (NOT `main`). Test + tweak, then merge.
- `main` stays untouched — the live site does not change — until every chunk is merged and
  the whole redesign is reviewed. Then one final `feature/ui-redesign → main` PR ships it all.

## How to work ONE chunk (per-session recipe — keeps context small)

1. `git checkout feature/ui-redesign && git pull`
2. `git checkout -b ui/<NN>-<slug>`
3. Read ONLY: this plan's row for the chunk + the named design file section + the target app file(s).
4. Port the design into the real component. Match existing app conventions, not the prototype's inline styles.
5. `pnpm dev`, verify in browser (desktop + mobile widths), tweak to taste.
6. `pnpm lint && pnpm test` — keep green.
7. Commit, push, open PR into `feature/ui-redesign`.
8. Check the box below.

> Tip: you rarely need more than one design file per chunk. Fetch a fresh copy of any design
> file with the DesignSync MCP (`get_file`, project id above) if the on-disk copy is missing.

## Design → app file mapping

| Design piece | Design file · component | Target app file(s) |
|---|---|---|
| Color tokens, glass, fonts, keyframes | `radiordle-core.jsx` (`C`, `GLASS`, styles in the HTML) | `app/globals.css`, `app/layout.tsx` |
| Animated background (aurora + DICOM overlays) | `radiordle-core.jsx` `PageBackground`, `Blob`, `Grain`, `Vignette` | new `components/PageBackground.tsx`, used in `GamePage.tsx` |
| Glass primitives / accent button | `radiordle-core.jsx` `GlassIconButton`, `AccentButton` | new `components/ui/` shared bits |
| Top navbar | `radiordle-screens.jsx` `TopBar` | `components/GamePage.tsx` |
| X-ray card + result border | `radiordle-screens.jsx` `XrayCard` | `components/GameBoard.tsx` |
| Hint cards | `radiordle-screens.jsx` `HintCard` | `components/HintPanel.tsx` |
| Guess bar + autocomplete | `radiordle-screens.jsx` `GuessBar` | `components/GuessInput.tsx`, `components/DiagnosisAutocomplete.tsx` |
| Toast | `radiordle-core.jsx` `Toast` | `components/GameClient.tsx` |
| Results modal | `radiordle-modals.jsx` `ResultsModal` + helpers | `components/GameClient.tsx` (results) |
| Stats modal | `radiordle-modals.jsx` `StatsModal`, `StatRow`, `Distribution` | `components/StatsModal.tsx` |
| Feedback modal | `radiordle-modals.jsx` `FeedbackModal` | `components/FeedbackModal.tsx` |
| Zoom modal | `radiordle-modals.jsx` `ZoomModal` | `components/ImageZoomModal.tsx` |
| About screen | `radiordle-screens.jsx` `AboutScreen` | `app/about/` |
| Archive screen | `radiordle-screens.jsx` `ArchiveScreen` | `components/ArchiveBrowser.tsx`, `app/archive/` |
| Install / PWA screen (new) | `radiordle-install.jsx` | new route + component |

## Chunks (do in order — later ones build on the foundation)

### Foundation (do first — everything depends on these)
- [x] **01 · Design tokens & fonts** — port `C`/`GLASS` values + Baloo 2 / Inter fonts + the
  `@keyframes` (toastIn, fadeIn, modalEnter, hintReveal, bgDriftA/B) into `globals.css` and
  `layout.tsx`. Low risk, little visual change on its own; unblocks the rest.
- [x] **02 · Animated background** — new `PageBackground.tsx` (aurora blobs + grain + vignette;
  start with the `annotated` "Classic" DICOM variant which the mockup ships). High visual impact,
  self-contained. Wire into `GamePage.tsx` behind the content.
- [x] **03 · Glass primitives** — shared `GlassIconButton` + `AccentButton` (amber gradient).
  Used by the navbar and modals; build once, reuse.

### Core game screen
- [x] **04 · Top navbar** — glass bar, centered wordmark, Stats/About/Feedback on the left,
  Archives accent button right; mobile hamburger menu with Install/About/Feedback/Stats.
- [x] **05 · X-ray card** — 16:9 black card, result-colored border (green/yellow/red ring),
  zoom affordance bottom-right.
- [x] **06 · Hint cards** — colored-by-next-guess cards, numbered badge, reveal animation.
- [x] **07 · Guess bar + autocomplete** — glass input with "Guess N/5" label, amber Submit,
  dropdown styling, disabled "previously selected" rows, inline error state.
- [x] **08 · Toasts** — correct/partial/incorrect/copied toast styling + timing.

### Modals
- [ ] **09 · Results modal** — biggest one: header w/ result tiles + gradient answer, collapsible
  "About this condition", stat row, guess distribution, "How You Compare", Share/Copy/Learn More.
- [ ] **10 · Stats modal** — stat cards (played/win%/streak/max) + distribution.
- [ ] **11 · Feedback modal** — category select + message + validation + success state.
- [ ] **12 · Zoom modal** — scroll-to-zoom / drag-to-pan overlay.

### Secondary screens
- [ ] **13 · About page** — glass cards, How to Play, team, disclaimer.
- [ ] **14 · Archive page** — day grid with won/lost/today badges.
- [ ] **15 · Install / PWA screen** (optional / new feature) — Safari + Chrome step cards.

### Ship
- [ ] **16 · Final review** — open `feature/ui-redesign → main`, full regression (tests, e2e,
  build), then merge to go live.

## Notes / gotchas when porting

- The prototype hardcodes one `PUZZLE` and a local `CONDITIONS` array; the real app pulls these
  from Supabase. Only port the **presentation**, keep the real data flow.
- Prototype uses inline `style={{}}` heavily. Prefer the app's existing Tailwind-class conventions
  and the `--color-*` CSS variables already in `globals.css`.
- Prototype fonts: Baloo 2 (display) + Inter (body). Confirm `layout.tsx` font wiring.
- `checkAnswer`, `getDayNumber`, day/epoch logic in the prototype are copied from the real
  `lib/` — do NOT re-port them, the app already owns them.
- Keep every chunk green on `pnpm lint && pnpm test` before opening its PR.
