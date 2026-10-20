<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# frontend-admin

## Purpose
CMS admin dashboard (Next.js 16, port :3001). Owner login → entry/media/page/global editors under `/admin/(dashboard)` → saves via Laravel API :9000. Public site at `frontend/` stays read-only.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Scripts, dev port 3001 |
| `src/app/layout.tsx` | Root shell |
| `src/app/page.tsx` | Root redirect to `/admin` |
| `src/app/api/` | Proxy routes to backend API |
| `src/lib/api/client.ts` | API client, `API_BASE_URL` default `http://localhost:9000` |
| `src/lib/auth.ts` + `src/lib/auth/` | Session helpers |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/app/` | Routes incl. `/admin` dashboard (see `src/app/AGENTS.md`) |
| `src/components/` | cms/layout/ui components (see `src/components/AGENTS.md`) |
| `src/lib/` | API, auth, cms adapters (see `src/lib/AGENTS.md`) |
| `src/types/` | Domain models |
| `src/styles/` | Global CSS |
| `data/` | Local fixtures/seeds |

## For AI Agents

### Working In This Directory
- Auth via backend Sanctum; seed owner `owner@example.com / ownerpass123` (`make owner`).
- Mutations go through `src/lib/api` + `src/app/api` proxies, not direct DB.
- Keep editor shapes in sync with backend `SchemaRegistry` and `frontend/src/types`.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`, `pnpm -C frontend-admin build`.

## Dependencies

### Internal
- `backend/` API (`http://localhost:9000`) for all data/auth

### External
- Next.js 16, Tailwind v4

<!-- MANUAL: -->