<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Public

## Purpose
Read-only delivery surface for anonymous visitors. Every endpoint reads published snapshots from `cms_publications` (plus `cms_redirects` for slug resolution) and never touches drafts, revisions, or sessions. This is the only controller in the API that has no authentication middleware at all.

## Key Files
| File | Description |
|------|-------------|
| `DeliveryController.php` | `page`, `projects`, `project`, `notes`, `note`, `experiments`, `capabilities`, `skills`, `experiences`, `globals`, and `resolveRedirect`; every read filters `CmsPublication` by type, locale, and `active = true` |

## Subdirectories
None — this is a leaf controller segment.

## For AI Agents

### Working In This Directory
- Read `CmsPublication` only. Never query `CmsEntry`, `CmsGlobal`, or `CmsRevision` here — a draft leaking into the public API is a data-exposure bug, and `tests/Feature/EntriesTest.php` asserts that isolation.
- Every query is scoped by locale (`?locale=`, defaulting to `config('cms.default_locale', 'en')`) and by `active = true`, so an unpublished or deactivated publication is invisible.
- The `page` endpoint resolves by `key`; the `project` and `note` endpoints resolve by `slug`. The shared `one()` helper picks the right column.
- `globals` returns a map keyed by the global key (`site`, `navigation`, `footer`, `seo`) rather than a list.
- `resolveRedirect` takes a required `path` query parameter and returns `{"data": {"toPath": ...}}`; a missing redirect is a 404 from `firstOrFail()`.
- List endpoints cap `limit` at 100 (default 20) and order by `publishedAt` descending.
- Do not add authentication or authorization checks here; if an endpoint needs a token, it belongs in `Admin/` instead.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host lacks the MongoDB extension, so the suite runs in Docker only.
- Public isolation is asserted in `tests/Feature/EntriesTest.php`: a draft must not be retrievable through any public endpoint.
- If you change the delivery shape, update the consuming Next.js frontends (`frontend/`, `frontend-admin/`) — they parse these payloads directly.

### Common Patterns
- Single reads return `{"data": new PublicationResource($publication)}`; lists use `PublicationResource::collection(...)->response()`.
- `PublicationResource` exposes only published fields — `publicData` as `data`, `publicSeo` as `seo`, plus `schemaVersion`, `sourceRevision`, and `publishedAt`. Draft-only fields never appear.

## Dependencies

### Internal
- `App\Http\Resources\Api\V1\PublicationResource`
- `App\Models\Cms\{CmsPublication,CmsRedirect}`
- `config/cms.php` — `default_locale`
- `backend/routes/api.php` — the `public` route group

### External
- `mongodb/laravel-mongodb` — MongoDB Eloquent models and pagination
- `laravel/framework` — validation and resource collection response

<!-- MANUAL: -->
