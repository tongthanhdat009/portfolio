<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# src/app/admin/

Purpose: Auth boundary and mutation layer for the CMS. `actions.ts` exposes every write operation as a server action guarded by `checkAuth()`; `login/` is the only route reachable without a session.

## Key Files

| File | Role |
|------|------|
| `actions.ts` | All server actions: `loginAction`, `logoutAction`, `saveDraftAction`, `createEntryAction`, `publishEntryAction`, `unpublishEntryAction`, `archiveEntryAction`, `deleteEntryAction` (= archive, soft-only), `restoreRevisionAction`, `addMediaAction`, `deleteMediaAction`, `updateGlobalsAction`, `revalidatePublicCacheAction`. Actor is hardcoded `'owner'`; each action calls `revalidatePath` for its domain |
| `login/page.tsx` | Client login form (`owner@example.com` placeholder; dev default `owner@example.com` / `ownerpass123` shown in UI). Calls `loginAction`, pushes `/admin` on success |

## Subdirectories

| Dir | Guide |
|-----|-------|
| `(dashboard)/AGENTS.md` | Authenticated shell, overview, ops pages, content editors |

## For AI Agents

- New mutations go in `actions.ts`: `await checkAuth()`, delegate to `lib/cms/service`, then `revalidatePath` the affected routes. Never bypass `checkAuth`.
- `deleteEntryAction` returns `{ success }` and only archives; there is no hard delete path. Keep it that way.
- Login failures return `{ success: false }` (no throw); keep error text generic to avoid user enumeration.
- Testing: `pnpm typecheck`; manual check is login → `/admin` renders, logout → redirect to `/admin/login`.

## Dependencies

Internal: `@/lib/auth` (session), `@/lib/cms/service` (API calls), `@/types`. External: `next/cache`, `next/navigation`.

<!-- MANUAL: -->
