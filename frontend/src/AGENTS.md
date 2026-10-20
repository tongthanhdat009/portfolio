<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/` docs

Purpose: Application source for the portfolio. Routes in `app/`, presentational components in `components/`, typed local content in `content/`, data-access and helpers in `lib/`, Tailwind v4 theme in `styles/`, shared domain types in `types/`.

Key Files: none at this level; everything lives in subdirectories.

Subdirectories:

| Dir | Docs |
| --- | --- |
| `app/` | `app/AGENTS.md` |
| `components/` | `components/AGENTS.md` |
| `content/` | `content/AGENTS.md` |
| `lib/` | `lib/AGENTS.md` |
| `styles/` | `styles/AGENTS.md` |
| `types/` | `types/AGENTS.md` |

For AI Agents:

- Import via `@/` prefix (maps to `src/`).
- Default to React Server Components; add `'use client'` only for interactivity (state, event handlers, navigation hooks).
- Validate changes with `pnpm typecheck` from repo root.

Dependencies: internal cross-imports between subdirs (see each file); external `next`, `react`, `lucide-react`.

<!-- MANUAL: -->
