<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# lib

## Purpose
All backend communication. `api/client.ts` is the only fetch layer, `auth.ts` owns the session cookie, `cms/service.ts` maps backend payloads to `@/types` and implements every read plus the API half of every write (the server actions in `app/admin/actions.ts` wrap these with the auth check and revalidation). `github.ts` and `cv-import.ts` are one-shot importers that create CMS drafts; `page-blocks.ts` converts homepage blocks to and from the editor's shape.

## Key Files
| File | Description |
|------|-------------|
| `api/client.ts` | `apiFetch(path, { method, body, query, token, raw })`: base `API_BASE_URL` (default `http://localhost:9000`) with the `/api/v1` prefix, `Bearer` token taken from the `admin_api_token` cookie, `cache: 'no-store'`. Unwraps `payload.data ?? payload` unless `raw: true` (needed for paginated endpoints that keep `meta`); `204` returns `null`; a non-OK response throws `ApiError(status, message, errorCode)` with the message taken from Laravel's `message` or flattened `errors` map. Also exports `API_BASE` and `TOKEN_COOKIE`. |
| `auth.ts` | Session helpers: `login` (POST `/auth/token`, stores the token as an httpOnly cookie `admin_api_token`, 7-day max age, `secure` in production, `sameSite: 'lax'`, `path: '/'`), `logout` (DELETE the token best-effort, always clears the cookie), `isAuthenticated` (GET `/auth/me`, `res.ok` only) and `getCurrentUser` (returns the `{ id, name, email, role, capabilities }` user or `null`). |
| `cms/service.ts` (~660 lines) | The CMS adapter. `toEntry` / `toApiPayload` map backend fields both ways (notably `seo.ogImage` ↔ `seo.ogMediaId`); `getEntries` / `getEntriesPaged` (paginated, `PagedResult`), `getEntryById`, `getEntryByKey` (page keys `home`/`about`/`contact` hit `/admin/pages/:key`), `saveDraft`, `createEntry`, `publishEntry`, `unpublishEntry`, `archiveEntry`, `restoreEntry`, `deleteEntry` (archive only), `getRevisions` / `getRevisionsPaged` / `restoreRevision`, `getMedia` / `getMediaPaged` / `addMedia` (three-step upload: issue → PUT to `uploadUrl` → complete → PATCH alt) / `updateMediaAlt` / `deleteMedia` (409-guarded), `getGlobals` / `updateGlobals` (site key `site` + redirect diff-sync + immediate publish), `getContentHealth` (missing cover alt, short SEO description, homepage hero referencing an unpublished project), `getDashboardMetrics` and `getAuditLogs` (event → action map). |
| `github.ts` (36.9 KB) | GitHub → CMS sync. Fetches public repos (or the authenticated `user/repos` list when `GITHUB_TOKEN` is set), creates missing ones as `draft` project entries, backfills existing entries only where a field is missing or still holds the generic filler this sync writes, and uploads repository covers. Returns `GithubSyncResult` (created/updated/skipped/privateSkipped/coversUploaded/failed plus the created and updated entries). |
| `cv-import.ts` (15.4 KB) | One-shot CV import. Locates the sibling `cv/` repo (via `CV_DIR` or a relative search), parses `cv-en/roles/ai/sections/*.tex` with a small LaTeX stripper, and creates draft projects, experience entries and skills plus fills missing site settings. Rerun-safe: existing entries are matched by slug/title/name. |
| `page-blocks.ts` | Homepage block shape shared with the backend (`data.blocks`, validated against `SchemaRegistry::BLOCK_TYPES`). `blocksToSections` (backend blocks → editor sections, adds the display-only `name`), `sectionsToBlocks` (editor sections → backend blocks, drops `name`), `defaultHomeBlocks()` (the 11 canonical block types, all enabled, empty props) and the `SECTION_NAMES` / `DEFAULT_ORDER` tables. |
| `use-debounced-value.ts` | `useDebouncedValue(value, delay = 400)` hook used by the search inputs to avoid a URL rewrite per keystroke. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `api/` | The HTTP layer (see `api/AGENTS.md`) |
| `auth/` | Empty placeholder directory — the implementation is the sibling file `auth.ts` (see `auth/AGENTS.md`) |
| `cms/` | The CMS service adapter (see `cms/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Never `fetch` the API outside `apiFetch`. The only exemptions are the login/me/logout calls in `auth.ts`, which run before a token exists.
- New backend fields must be added to `toEntry` **and** `toApiPayload` together, or reads and writes silently diverge.
- `resolveRevision` refetches the entry before a PATCH when no `expectedRevision` is supplied. Pass `expectedRevision` from the loaded entry to avoid clobbering a concurrent edit.
- `getContentHealth` is computed client-side (server-side in Next terms) from `getEntries()` — heuristics, not a backend endpoint. It is cheap at the current volume; revisit if the entry count grows.
- `actor` parameters on the service functions exist for the audit trail but are currently `void actor` — the backend derives the actor from the token. Do not rely on the passed string.
- `lib/auth/` and `lib/api/` are directories, but the auth implementation is the file `lib/auth.ts` next to them. Do not create `lib/auth/index.ts` — imports use `@/lib/auth` and would resolve to the file.

### Testing Requirements
- No test runner. `pnpm -C frontend-admin typecheck`; exercise the layer against the dev backend (`compose.yaml` brings up Mongo + S3 at the repo root, the Laravel API listens on `:9000`).
- A useful manual check for `apiFetch`: hit any admin route with the API down and confirm the error surfaces as an `ApiError` with the HTTP status rather than an unhandled rejection.

### Common Patterns
- Service functions take plain arguments and return typed models from `@/types` — no React types, no Next types, no request/response objects.
- Read helpers are named `getX`, write helpers are named as the operation (`saveDraft`, `publishEntry`, `deleteMedia`); the server actions in `app/admin/actions.ts` mirror those names with an `Action` suffix.

## Dependencies

### Internal
- `@/types` (every model), `@/lib/api/client` (`apiFetch`, `API_BASE`, `TOKEN_COOKIE`), `@/lib/page-blocks` (imported by `actions.ts`).

### External
- `next/headers` (`cookies`). Backend: Laravel `/api/v1` (`/admin/*`, `/auth/*`), GitHub REST API (`api.github.com`), local filesystem for the CV import.

<!-- MANUAL: -->
