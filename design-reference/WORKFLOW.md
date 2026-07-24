# Radiordle Redesign — Working Workflow

Companion to `REDESIGN_PLAN.md`. This is the process for shipping the redesign
piece by piece without ever touching the live site until the end.

## Mental model

- **One chunk = one new chat = one PR.** Fresh chat per chunk keeps context clean.
- Every chunk PR merges into **`feature/ui-redesign`** (safe — not live).
- Only the final PR (chunk 16) merges into **`main`** — that is the go-live.

```
main (live) ─────────────────────────────── chunk 16 PR ──▶ GO LIVE (last)
  └── feature/ui-redesign (integration, not live)
        ├── ui/01-design-tokens   → PR → merge into feature/ui-redesign
        ├── ui/02-animated-bg      → PR → merge into feature/ui-redesign
        └── … one branch + PR per chunk
```

## The loop (repeat for chunks 01 → 15)

1. Open a **new chat** in this project.
2. Paste the **kickoff message** (below) with the chunk number + name.
3. Claude branches off `feature/ui-redesign` as `ui/NN-slug`, ports that one piece,
   runs the dev server, and shows it.
4. Review & tweak in that same chat until it looks right.
5. Say **"open the PR"** → Claude pushes and opens a PR **targeting `feature/ui-redesign`**.
6. Merge that PR on GitHub (or ask Claude to). Safe — updates integration branch only.
7. Close the chat. Start a new one for the next chunk (it branches off the updated integration branch).

## Kickoff message (paste into each new chat)

```
We're doing the Radiordle UI redesign iteratively.
Read design-reference/REDESIGN_PLAN.md and design-reference/WORKFLOW.md first.

Start chunk <NN> — <name>.
Branch off feature/ui-redesign as ui/<NN>-<slug>, port just this chunk,
run the dev server so I can review, then wait for my OK before opening the PR.
```

## Tracking progress

The checklist in `REDESIGN_PLAN.md` is the source of truth. Each chunk PR checks its
box, so any new chat can see what's left. You don't need to track state yourself.

## Going live (chunk 16)

Only after chunks 01–15 are merged into `feature/ui-redesign` and reviewed:
open the final `feature/ui-redesign → main` PR, run full regression (lint, tests,
e2e, build), review, then merge. This is the only step that changes the live site.

## Rules of thumb

- Chunk PRs target `feature/ui-redesign`, never `main`.
- Keep each chunk green: `pnpm lint && pnpm test` before opening its PR.
- Port presentation only — keep the real Supabase data flow and `lib/` logic.
- If a chunk gets big or messy, it's fine to split it into two PRs.
