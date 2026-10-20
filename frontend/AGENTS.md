<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# Frontend — deepinit docs

Purpose: Next.js 16 App Router neo-brutalist portfolio with a local `/admin` PIN console and static generation. Content lives in `src/content/*.ts`; `src/lib/cms` may override it with Laravel CMS API data at fetch time.

Key Files:

| File | Role |
| --- | --- |
| `package.json` | Scripts (`dev`, `build`, `typecheck`, `sync:github`) and deps |
| `next.config.mjs` | Next.js config |
| `scripts/sync-github.mjs` | Regenerates project content from GitHub |

Subdirectories:

| Dir | Docs |
| --- | --- |
| `src/` | `src/AGENTS.md` |
| `scripts/` | `scripts/AGENTS.md` |
| `public/` | `public/AGENTS.md` |

For AI Agents:

- Path alias `@/*` maps to `src/*`.
- Server components fetch via `get*` helpers in `src/lib/cms`; client components (`'use client'`) are the exception: contact page, `ContactSection`, `ToolboxSection`, `Header`, `AdminClient`.
- Typecheck from repo root: `pnpm typecheck`.
- Never edit `node_modules/` or `.next/`.

Dependencies: internal `src/*`; external `next`, `react`, `tailwindcss` v4, `lucide-react`, `clsx`, `tailwind-merge`.

<!-- MANUAL: -->
