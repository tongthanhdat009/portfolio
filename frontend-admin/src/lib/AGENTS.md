<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# src/lib/

Purpose: All backend communication. `api/client.ts` is the only fetch layer, `auth.ts` owns the session cookie, `cms/service.ts` maps backend payloads to `@/types` and implements every read plus the API half of every write (server actions in `app/admin/actions.ts` wrap these with auth + revalidation). `auth/` exists but is empty.

## Key Files

| File | Role |
|------|------|
| `api/client.ts` | `apiFetch(path, { method, body, query, token })`: base `API_BASE_URL` (default `http://localhost:9000`) + `/api/v1` prefix, Bearer from `admin_api_token` cookie, `cache: 'no-store'`; unwraps `payload.data ?? payload`; throws `ApiError(status, message, errorCode)` joining Laravel `errors` map. `204` → `null` |
| `auth.ts` | `login` (POST `/auth/token` → httpOnly cookie, 7d, `secure` in prod), `logout` (DELETE token best-effort, always clears cookie), `isAuthenticated` / `getCurrentUser` (GET `/auth/me`) |
| `cms/service.ts` (~540 lines) | `toEntry`/`toApiPayload` field mapping (incl. `seo.ogImage` ↔ `seo.ogMediaId`); entries CRUD + `publish`/`unpublish`/`archive` (delete = archive); `getEntryByKey` (page keys → `/admin/pages/:key`); revisions + `restoreRevision`; media three-step upload (issue → PUT to `uploadUrl` → complete → PATCH alt) and 409-guarded delete; `getGlobals`/`updateGlobals` (site key `site` + redirect diff-sync); `getContentHealth` (alt-text, SEO, unpublished-hero rules); `getDashboardMetrics`; `getAuditLogs` (event → action map) |

## For AI Agents

- Never `fetch` the API outside `apiFetch` (only `auth.ts` login/me/logout are exempt — they run before a token exists).
- New backend fields: extend `toEntry` AND `toApiPayload` together, or reads/writes silently diverge.
- `resolveRevision` refetches before PATCH; pass `expectedRevision` from the loaded entry to avoid clobbering concurrent edits.
- `getContentHealth` is client-computed heuristics over `getEntries()`, not a backend endpoint — cheap for current volume, revisit if entry count grows.
- Testing: no test runner. `pnpm typecheck`; exercise against dev backend (`compose.yaml` Mongo+S3 at repo root, API `:9000`).

## Dependencies

Internal: `@/types` (all models). External: `next/headers` (cookies). Backend: Laravel `/api/v1` (`/admin/*`, `/auth/*`).

<!-- MANUAL: -->
