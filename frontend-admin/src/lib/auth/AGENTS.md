<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# auth

## Purpose
Empty placeholder directory. The authentication implementation is the sibling **file** `src/lib/auth.ts` — imports of `@/lib/auth` resolve to that file, not to this directory. This guide exists so the tree is navigable; it documents where the auth code actually lives and what the empty directory must not be used for.

## Key Files
| File | Description |
|------|-------------|
| — | None — the directory is empty. The implementation lives in `../auth.ts`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Do **not** create `src/lib/auth/index.ts`. TypeScript module resolution prefers the sibling file `../auth.ts` over a directory index, so adding one would create two competing modules and confuse every `@/lib/auth` import.
- The real implementation (`../auth.ts`) exposes `isAuthenticated()`, `login(email, password)`, `logout()` and `getCurrentUser()`, using the Sanctum token endpoints `/api/v1/auth/token` (POST and DELETE) and `/api/v1/auth/me` (GET), and storing the token in the httpOnly cookie `admin_api_token`.
- The session cookie name, the 7-day max age, `secure` in production and `sameSite: 'lax'` are defined in `../auth.ts` — that file is the source of truth. The account page (`/admin/account`) still displays the old `admin_session` name; treat the page as stale, not the code.

### Testing Requirements
- No code lives here. The auth helpers are covered by `pnpm -C frontend-admin typecheck` and by the manual login/logout check against the Laravel API on `:9000`.

### Common Patterns
- Auth helpers are server-only (`next/headers` cookies). They must never be imported from a `'use client'` component — the client calls the server actions in `app/admin/actions.ts` instead.

## Dependencies

### Internal
- None here. The sibling `../auth.ts` depends on `../api/client` (`API_BASE`, `TOKEN_COOKIE`).

### External
- None here. `../auth.ts` uses `next/headers` and the Laravel auth endpoints.

<!-- MANUAL: -->
