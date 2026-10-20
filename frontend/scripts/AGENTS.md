<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `scripts/` docs

Purpose: One-off maintenance scripts run via `pnpm` from `frontend/`.

Key Files:

| File | Role |
| --- | --- |
| `sync-github.mjs` | Fetches public repos for `tongthanhdat009`, categorizes them, rewrites `src/content/projects.ts` |

Subdirectories: none.

For AI Agents:

- Run with `pnpm sync:github`; requires network + GitHub API access, no auth token coded in.
- Script overwrites `projects.ts` — commit before running so the diff is reviewable.
- Category heuristic is keyword-based (`getCategoryByRepo`); tune keywords there, not downstream.

Dependencies: internal `src/content/projects.ts`, `src/content/homePage.ts`; external `node:child_process`, GitHub REST API.

<!-- MANUAL: -->
