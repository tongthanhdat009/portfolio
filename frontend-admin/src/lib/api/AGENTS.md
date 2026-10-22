<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# api

## Purpose
The single HTTP layer to the Laravel CMS API. Every backend call from the admin goes through `apiFetch`, which builds the URL, attaches the bearer token from the session cookie, unwraps the Laravel response envelope and converts failures into a typed `ApiError`.

## Key Files
| File | Description |
|------|-------------|
| `client.ts` | Exports `API_BASE` (`process.env.API_BASE_URL` or `http://localhost:9000`), `TOKEN_COOKIE` (`admin_api_token`), the `ApiError` class (`status`, `message`, optional `errorCode`) and `apiFetch<T>(path, opts)`. `opts` accepts `method`, `body`, `query`, `token` (override the cookie token) and `raw` (return the whole payload instead of unwrapping `data`). The URL is `new URL('/api/v1' + path, API_BASE)` with `query` entries appended as search params. Requests send `Content-Type`/`Accept: application/json`, `Authorization: Bearer <token>` when a token exists, and `cache: 'no-store'`. `204` → `null`; a body that is not JSON → `ApiError(status, ...)`; a non-OK response → `ApiError` with Laravel's `message`, else the flattened `errors` map, else a generic message. `getApiToken()` reads the token from `next/headers` cookies. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Do not add a second fetch layer here. `lib/auth.ts` calls the auth endpoints with plain `fetch` because no token exists yet; that is the only sanctioned exception.
- `raw: true` is required whenever the response carries pagination `meta` — `getEntriesPaged`, `getRevisionsPaged` and `getMediaPaged` depend on it. Without `raw`, the `meta` object is stripped by the envelope unwrap and pagination silently breaks.
- `path` is relative to `/api/v1` and must start with `/` (e.g. `'/admin/entries'`). Do not include the `/api/v1` prefix yourself.
- The token is read from cookies, so `apiFetch` only works in a server context (server component or server action). Calling it from a `'use client'` component will fail on `next/headers`.
- `cache: 'no-store'` is deliberate: admin reads must always hit the API.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: with the API running, open `/admin` and confirm entries load; with the API down, confirm an `ApiError` with the connection failure is raised rather than a silent empty list.

### Common Patterns
- Callers pass a `query` object of `string | number | undefined` values; `undefined` entries are skipped, so optional filters need no branching.
- Error handling at the call site is by status: `service.ts` checks `e?.status === 404` (not found) and `=== 409` (conflict) explicitly.

## Dependencies

### Internal
- None — this layer sits above the service layer and below `@/lib/auth`.

### External
- `next/headers` (`cookies`), the Laravel CMS API at `API_BASE_URL` (`/api/v1`).

<!-- MANUAL: -->
