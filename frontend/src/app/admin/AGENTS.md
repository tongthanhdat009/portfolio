<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# admin

## Purpose
Local, PIN-protected content console at `/admin`. This is *not* the CMS dashboard — that is the separate `frontend-admin/` app on :3001. Here, a single PIN unlocks an HTTP-only cookie and the console lets an editor CRUD the announcement, projects, experiments, and notes. Every mutation is written straight back into the `src/content/*.ts` modules and the affected routes are revalidated.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component. `export const dynamic = 'force-dynamic'` so file edits and the auth cookie are picked up immediately; `metadata.robots` sets `index: false, follow: false`. Loads `isAuthenticated()` plus `getAnnouncement()`, `getProjects()`, `getExperiments()`, `getNotes()` and hands them to `AdminClient` as props |
| `AdminClient.tsx` | `'use client'` dashboard (~1.6k lines). Local state for the PIN field, active tab (`projects` \| `experiments` \| `notes` \| `announcement` \| `github`), the four content collections, search query, category filter, edit modals, and a notification toast. Calls the server actions through `useTransition` |
| `actions.ts` | `'use server'` module. Exports `loginAction`, `logoutAction`, `saveAnnouncementAction`, `saveProjectAction`, `deleteProjectAction`, `saveExperimentAction`, `deleteExperimentAction`, `saveNoteAction`, `deleteNoteAction`, `triggerGithubSyncAction`. Every write re-serialises the whole collection as `JSON.stringify(data, null, 2)` into a TypeScript module header (`import { Project } from '@/types'; …`) and calls `revalidatePath` for each affected route |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Auth lives in `@/lib/admin/auth`: the PIN comes from `ADMIN_PIN` (default fallback `neo2026`), the session cookie is `portfolio_admin_auth` holding a SHA-256 hash of the PIN + salt, httpOnly, `sameSite: 'lax'`, 7-day maxAge, `secure` in production.
- Every server action re-checks `isAuthenticated()` before mutating — keep that guard on any new action.
- `getContentFilePath()` in `actions.ts` resolves `src/content/<file>` relative to `process.cwd()` and falls back to `frontend/src/content/<file>`, so the console works whether the process was started from the repo root or from `frontend/`. Do not "simplify" that dual path.
- After any mutation, call `revalidatePath` for every route whose content changed (`/`, `/work`, `/work/<slug>`, `/lab`, `/lab/<slug>`, `/notes`, `/notes/<slug>`, `/admin`).
- `triggerGithubSyncAction()` shells out to `scripts/sync-github.mjs` with the same dual-path resolution and returns stdout/stderr as the message.
- The written files are machine-formatted. Hand-editing `src/content/*.ts` after a console save will be overwritten on the next save.
- Never log or surface the PIN; keep `robots` set to noindex on this route.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after changing `actions.ts` (server actions and `revalidatePath` are not exercised by `tsc` alone).
- Manual: start `next dev`, open `/admin`, log in with the PIN, save one record of each type, confirm the file under `src/content/` changed and the public route reflects it after a refresh.

### Common Patterns
- Server actions return `{ success: boolean; error?: string }` (or `{ success, message }` for the GitHub sync) — the client checks `res.success` and surfaces `res.error`.
- The client never mutates content directly; it always calls a server action and then updates local state from the result.
- Slug uniqueness is enforced server-side on create (`Project`/`Experiment`/`Note` slug already exists → error).

## Dependencies

### Internal
- `@/lib/admin/auth` — PIN verification and cookie session
- `@/lib/cms` — `getAnnouncement`, `getProjects`, `getExperiments`, `getNotes`
- `@/lib/validation` — available but not currently called by the admin console
- `src/content/*.ts` — the write target
- `scripts/sync-github.mjs` — invoked by `triggerGithubSyncAction`
- `@/components/ui/Button`, `@/components/ui/Badge`, `@/components/ui/Card`, `@/types`

### External
- `next` — `next/cache` (`revalidatePath`), `next/headers` (via `lib/admin/auth`), `next/link`
- `node:fs`, `node:path`, `node:child_process` — file writes and script execution
- `lucide-react` — dashboard icons

<!-- MANUAL: -->
