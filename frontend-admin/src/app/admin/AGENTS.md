<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# admin

## Purpose
Auth boundary and mutation layer of the CMS. `actions.ts` exposes every write operation as a server action guarded by `checkAuth()`, and `login/` is the only route reachable without a session. Everything else lives in the `(dashboard)` route group.

## Key Files
| File | Description |
|------|-------------|
| `actions.ts` | `'use server'` module with every mutation: `loginAction`, `logoutAction`, `saveDraftAction`, `createEntryAction`, `publishEntryAction`, `unpublishEntryAction`, `archiveEntryAction`, `deleteEntryAction`, `restoreEntryAction`, `restoreRevisionAction`, `seedHomeAction`, `addMediaAction`, `deleteMediaAction`, `updateGlobalsAction`, `revalidatePublicCacheAction`, `syncGithubAction`, `importCvAction`. Every mutating action except login/logout starts with `await checkAuth()`, delegates to `lib/cms/service` (or `lib/github` / `lib/cv-import`) and then calls `revalidatePath` for the affected routes. The actor string is hardcoded `'owner'`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `login/` | Unauthenticated sign-in screen (see `login/AGENTS.md`) |
| `(dashboard)/` | Authenticated shell, overview and all editors (see `(dashboard)/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- New mutations go in `actions.ts`: `await checkAuth()`, delegate to `lib/cms/service`, then `revalidatePath` the affected routes. Never bypass `checkAuth`.
- `deleteEntryAction` only archives — there is no hard-delete path in the CMS service (`deleteEntry` calls `archiveEntry`). Keep it that way.
- Login failures return `{ success: false }` instead of throwing, and the UI shows generic text, to avoid user enumeration. Keep that.
- The `(dashboard)` group is a Next.js route group: it adds no URL segment, so routes inside it are `/admin/...`, not `/admin/(dashboard)/...`.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check is sign in → `/admin` renders, sign out → redirect to `/admin/login`.
- Any new action must be exercised with the Laravel API running at `:9000`.

### Common Patterns
- One action per CMS operation, named `<verb><Noun>Action`, returning the service result so the client can update local state.
- `revalidatePath` calls are grouped per affected domain (`/admin`, `/admin/content`, `/admin/publishing`, `/admin/media`, `/admin/settings`, `/admin/history`).

## Dependencies

### Internal
- `@/lib/auth` (`isAuthenticated`, `login`, `logout`), `@/lib/cms/service`, `@/lib/page-blocks` (`defaultHomeBlocks`), `@/lib/github`, `@/lib/cv-import`, `@/types`.

### External
- `next/cache` (`revalidatePath`), `next/headers` (cookies, used indirectly by `@/lib/auth`).

<!-- MANUAL: -->
