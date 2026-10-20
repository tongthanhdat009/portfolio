<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/lib/` docs

Purpose: Data-access and helper layer. `cms/` merges Laravel API data over local `content/` fallbacks; `api.ts` is the fetch client; `admin/auth.ts` guards the console; `validation/` holds form and slug checks.

Key Files:

| File | Role |
| --- | --- |
| `cms/index.ts` | `get*` accessors (`getProjects`, `getProjectBySlug`, `getNotes`, …) — sole import for pages |
| `api.ts` | `fetchPublicationList`/`fetchPublicationOne`/`fetchGlobals`, `API_BASE_URL` based; null-on-failure |
| `admin/auth.ts` | PIN verify, SHA-256 cookie session, `isAuthenticated` |
| `validation/index.ts` | `validateContactForm`, `validateProjectSlug` |

Subdirectories (`admin/`, `cms/`, `validation/`): single-module dirs with no child docs; import via the paths above.

For AI Agents:

- Pages import only from `@/lib/cms`, never `@/lib/api` or `@/content` directly.
- `api.ts` fails soft (returns `null` → local fallback); keep that contract so the site builds offline.
- Auth cookie name is `portfolio_admin_auth`; PIN env is `ADMIN_PIN`.
- Test with `pnpm typecheck` from repo root; verify API override by setting `API_BASE_URL` and loading `/`.

Dependencies: internal `@/content/*`, `@/types`; external `next/headers`, `next/cache`, `node:crypto`.

<!-- MANUAL: -->
