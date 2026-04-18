# ORIGIN WEBSITE — CLAUDE CODE ORIENTATION

Next.js App Router site for origindao.ai. Deployed to Vercel.

## Stack
- Next.js (App Router, TypeScript)
- Tailwind v4 (`@theme` tokens in `src/app/globals.css`)
- RainbowKit + wagmi for wallet connect
- Railway Postgres via `src/lib/db` (Supabase fully removed — do not reintroduce)
- Base Mainnet contracts via viem

## Homepage Direction (decided 2026-04-18)

The old `HOMEPAGE-SPEC.md` (now in `docs/archive/HOMEPAGE-SPEC-v1.md`) is retired.

**Three-state one-page experience** driven by wallet connection:

- **State A** (Disconnected) — Hero + `LiveStats` + ghosted `WorkshopPreview` + minimal footer. The preview *is* the pitch — no feature grid.
- **State B** (Connected, no BC) — `$100 Mint` CTA + 7-step "what happens when you mint" panel. Concierge-style onboarding.
- **State C** (Connected, has BC) — Functional `Workshop` component: agent card, The Book activity feed, open quests, Arena leaderboard, IRC link.

## Phase Plan

- **Phase 1 (shipped 2026-04-18)** — States A+B complete, State C is a functional MVP (no embedded chat)
- **Phase 2** — Embed IRC chat directly in State C workshop center panel
- **Phase 3** — PressBot integration, Feed Data modal, Dispute panel with ThoughtProof

## Design Language — Terminal-Futurist

- Dark default: `bg-o-bg` (#0a0a0a)
- Monospace throughout (IBM Plex Mono preferred when loaded)
- Custom `o-*` color tokens defined in `globals.css`:
  - `o-green` — signal green (primary accent)
  - `o-text`, `o-text-secondary`, `o-text-dim`, `o-text-vdim` (4-level hierarchy)
  - `o-border`, `o-border-active`
  - `o-yellow`, `o-red`, `o-teal` — semantic highlights
- 🔴🟢🟡 reserved for casino token — subtle usage only
- Reference aesthetic: bankr.bot, Linear, Rave terminal

## Key Files

- `src/app/page.tsx` — three-state router
- `src/components/Workshop.tsx` — State C (BC holder workshop MVP)
- `src/components/WorkshopPreview.tsx` — State A ghosted preview
- `src/components/LiveStats.tsx` — protocol stats (polls `/api/stats` every 30s)
- `src/app/api/stats/route.ts` — returns `{ agents_online, quests_open, bcs_issued, birth_certificates, faucet, registry, jobs, ... }`
- `src/middleware.ts` — The Origin Hotel middleware (emoji headers URL-encoded via `safeSet`)

## State C Data Sources

Workshop component fetches in parallel, each with safe fallback:
- `/api/agents/:address` — agent dossier
- `/api/activity?limit=10` — The Book events
- `/api/quests` — open quest list
- `/api/arena/leaderboard` — Arena ranks

All endpoints degrade gracefully (empty state + placeholder copy).

## Rules

- Do not reintroduce Supabase
- Do not add emojis outside 🔴🟢🟡
- HTTP header values must be ISO-8859-1 safe — use `safeSet()` in middleware.ts for anything that can contain emoji/em-dash
- `layout.tsx` is stable; keep Web3Provider wrapping at the root
- Run `npm run build` before any commit that touches middleware, config, or API routes
