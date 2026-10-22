<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# frontend-admin

## Purpose
Neo-brutalist CMS admin dashboard for the portfolio (Next.js 16 App Router, port :3001). It is the only writer of portfolio content: the owner logs in at `/admin/login`, edits entries, media and site globals through the editors under `/admin/(dashboard)`, and every mutation is a server action that lands in the Laravel CMS API at `:9000`. The public site (`frontend/`, port :3000) only reads published snapshots and is never edited from here.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Next 16 / React 19 / Tailwind v4 scripts: `dev` (`next dev -p 3001`), `build`, `start` (`next start -p 3001`), `typecheck` (`tsc --noEmit`). `mongodb` is declared as a dependency but nothing in `src/` imports it — there is no DB driver here. |
| `next.config.mjs` | Only `reactStrictMode: true`. No rewrites, no `images` config, no env injection. |
| `tsconfig.json` | `strict: true`, `moduleResolution: bundler`, `noEmit`, path alias `@/* -> ./src/*`. |
| `postcss.config.mjs` | Single plugin `@tailwindcss/postcss` (Tailwind v4 CSS-first config, no `tailwind.config.js` exists). |
| `.env.local` | Runtime vars: `API_BASE_URL` (Laravel API base, defaults to `http://localhost:9000`) and `GITHUB_TOKEN` (optional; raises the GitHub API rate limit for the repo sync). |
| `next-env.d.ts` | Next-generated type references; do not edit. |
| `README.md` | Vietnamese feature/route map. Partly stale: it still describes a native MongoDB layer with a `data/cms-store.json` fallback store, an `admin_session` cookie and an `ADMIN_PASSWORD` passkey. The live code uses the Laravel API, the `admin_api_token` cookie and email/password login. |
| `data/cms-store.json` | Legacy CMS store snapshot — see `data/AGENTS.md`. Not read by any code in the repo. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | All application code (see `src/AGENTS.md`) |
| `data/` | Legacy CMS store snapshot (see `data/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Run with `pnpm dev:admin` from the repo root (or `pnpm dev` here) → `http://localhost:3001/admin`. The Laravel API must be up on `:9000`; every read fails without it.
- Never touch a database from this app. All persistence goes through `src/lib/api/client.ts` → Laravel `/api/v1`.
- Content only reaches the public site after a publish: the dashboard edits drafts, the public site reads published snapshots.
- `README.md`, the hardcoded `localhost:3000` / `:3001` URLs and the `DN` avatar are stale placeholders, not configuration.

### Testing Requirements
- `pnpm -C frontend-admin typecheck` (`tsc --noEmit`) is the only automated check — this package has no test runner.
- `pnpm -C frontend-admin build` catches App Router / server-action problems that typecheck misses.
- Manual smoke: log in → create an entry → edit it → publish → confirm it on the public site.

### Common Patterns
- Server/client split is strict: `page.tsx` fetches on the server, `*Client.tsx` mutates through server actions inside `useTransition`.
- All server actions live in `src/app/admin/actions.ts`; each one calls `checkAuth()` first, then `revalidatePath` for the routes it affects.
- Neo-brutal styling: Tailwind utility classes that read `var(--color-*)` / `var(--shadow-neo-*)` tokens from `src/styles/globals.css`. Never hardcode hex or shadow values in components.

## Dependencies

### Internal
- `backend/` — Laravel CMS API on `:9000` (`/api/v1/admin/*`, `/api/v1/auth/*`); source of truth for entries, media, globals and audit logs.
- `frontend/` — public portfolio site on `:3000`; consumes published snapshots. Read-only from here.

### External
- next 16, react 19, react-dom 19, typescript 7, tailwindcss 4 + `@tailwindcss/postcss`, lucide-react, clsx, tailwind-merge.

<!-- MANUAL: -->
