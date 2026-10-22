<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# admin

## Purpose
Authentication for the local `/admin` content console. A single PIN is exchanged for an HTTP-only cookie whose value is a SHA-256 hash of that PIN; every subsequent request compares the cookie against the same hash to decide whether the session is valid.

## Key Files
| File | Description |
|------|-------------|
| `auth.ts` | Exports `verifyAdminPassword(inputPin)`, `setAdminSession()`, `clearAdminSession()`, `isAuthenticated()`. Internals: `COOKIE_NAME = 'portfolio_admin_auth'`, `DEFAULT_PIN = 'neo2026'`, and `getSecretHash(password)` = SHA-256 of `password + '_salt_neo_brutal_2026'`. The cookie is httpOnly, `secure` only in production, `sameSite: 'lax'`, `maxAge` 7 days, `path: '/'` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- The PIN comes from `process.env.ADMIN_PIN`; `DEFAULT_PIN` is the fallback when it is unset. Set `ADMIN_PIN` in `frontend/.env.local` for anything beyond local development.
- The session token is derived from the PIN, not random — changing `ADMIN_PIN` invalidates every existing session immediately, and two installs with the same PIN share the same token value.
- `cookies()` is awaited (Next 16 async request APIs). Keep the `await` when touching these functions.
- `isAuthenticated()` reads the cookie and compares it to the expected hash with `===`. Do not add logging of the token.
- `verifyAdminPassword` compares the trimmed input against the trimmed expected PIN. The comparison is a plain string equality — acceptable for a local console, but do not reuse this pattern for a real credential store.
- This module is only used by `src/app/admin/*` and the server actions. It is not referenced by any public page.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after changing exports.
- Manual in `next dev`: log in at `/admin`, confirm the cookie is set (httpOnly, path `/`), reload to confirm the session survives, log out and confirm the cookie is deleted.
- Changing `ADMIN_PIN` requires restarting the dev server — Next does not hot-reload `.env.local`.

### Common Patterns
- Server-only module: it imports `next/headers`, so it must never be imported from a `'use client'` component.
- All four functions are `async` even though only the cookie helpers need to be — keep the signatures stable, `actions.ts` calls them with `await`.

## Dependencies

### Internal
- `src/app/admin/actions.ts` — the only caller (`loginAction`, `logoutAction`, and the auth guard on every mutation)
- `src/app/admin/page.tsx` — calls `isAuthenticated()` during render

### External
- `next` — `next/headers` (`cookies`)
- `node:crypto` — `createHash` (SHA-256)

<!-- MANUAL: -->
