<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Admin

## Purpose
Controllers behind the authenticated admin surface of API v1. They manage drafts, revisions, the publish pipeline, pages and globals, the media library, redirects, audit logs, publish operations, and the system health probe. Every route in this segment sits inside the `auth:sanctum` group in `backend/routes/api.php`; role checks (owner / editor / viewer) are then applied per action.

## Key Files
| File | Description |
|------|-------------|
| `EntryController.php` | Draft CRUD, archive/restore, revision list and restore, publish/unpublish, preview session and preview data; delegates to `ContentService` and `PublishService`, authorizes through `EntryPolicy` |
| `MediaController.php` | Media library over presigned direct uploads: list, issue upload, complete upload, show, update metadata, soft delete, restore; delegates to `MediaService` |
| `GlobalController.php` | Singleton site-configuration drafts keyed by `SchemaRegistry::GLOBAL_KEYS` (`site`, `navigation`, `footer`, `seo`); read, save draft with optimistic revision, publish into `cms_publications` plus an outbox row |
| `PageController.php` | Page-builder alias over page entries keyed by `SchemaRegistry::PAGE_KEYS` (`home`, `about`, `contact`); load and save ordered section blocks with registry-enforced block types |
| `ContentTypeController.php` | Read-only registry dump for admin form generation: entry types, block types, legacy block aliases, page keys, global keys, statuses, default locale |
| `RedirectController.php` | Slug-history CRUD; rejects self-links and two-node circular chains at write time, audits every create and delete |
| `AuditLogController.php` | Owner-only read of `cms_audit_logs` with filters on event, resource type, resource id, and actor id |
| `PublishOperationController.php` | Owner-only listing of outbox publish operations and idempotent retry, which only re-arms a pending row — it never fakes delivery as done |
| `SystemHealthController.php` | Invokable readiness probe checking MongoDB, the S3 disk, and the queue driver; reports `degraded` instead of throwing so partial outages stay visible |

## Subdirectories
None — this is a leaf controller segment.

## For AI Agents

### Working In This Directory
- Authorize every action. Either `$this->authorize('<ability>', $model)` (policy-driven, used by `EntryController` and `PageController`) or an explicit `$request->user()->cannot('<ability>')` gate check (used by `MediaController`, `RedirectController`, `AuditLogController`, `PublishOperationController`). Gates are defined in `App\Providers\AppServiceProvider`.
- Owner-only surfaces are `view-audit` (audit logs, publish operations, system health) and `manage-users`. Never widen these to editors.
- Never mutate MongoDB documents directly in a controller. Route writes through `ContentService`, `PublishService`, `MediaService`, or `AuditService`. The exceptions are `GlobalController::update` and `PageController`/`MediaController` field writes, which write draft documents directly but still go through the revision check and the audit trail.
- Enforce optimistic concurrency on every draft write: compare the client-supplied `expectedRevision` with the stored `revision` and abort 409 on mismatch.
- Route ids are strings; convert a 24-hex id to `MongoDB\BSON\ObjectId` before querying `_id`.
- Publish and unpublish return HTTP 202 because delivery is asynchronous via the outbox; they honour the `Idempotency-Key` header.
- Preview is auth-only: `previewSession` mints a random token cached under `preview:{token}` for `config('cms.preview_ttl_minutes')`, and `previewData` refuses any token that does not match the requested entry id.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB extension, so the suite cannot run outside Docker.
- Feature coverage lives in `tests/Feature/EntriesTest.php`, `tests/Feature/MediaTest.php`, `tests/Feature/PagesGlobalsTest.php`, and `tests/Feature/AuthTest.php`.
- New behaviour needs a test asserting the success path and the guard — 403 for the wrong role, 409 for a stale revision, or draft invisibility through the public API.

### Common Patterns
- Response envelope is `{"data": ...}`; lists add `{"meta": {current_page, last_page, total}}`.
- Controllers inject services with `readonly` promoted constructor properties; the property name is a short handle (`$content`, `$publisher`, `$media`, `$audit`).
- `spec X.Y` docblock references point at the repo-root `*-spec.md` files.
- `abort(404, ...)` for an unknown key or id; `abort(403)` for a failed gate; `abort(409, 'Stale revision. Reload and retry.')` for a revision conflict.

## Dependencies

### Internal
- `App\Application\Services\{ContentService,PublishService,MediaService,AuditService}`
- `App\Domain\Content\SchemaRegistry` — entry/block types, page and global keys, per-type data rules
- `App\Http\Requests\Api\V1\Admin\*` — `StoreEntryRequest`, `UpdateEntryRequest`, `PublishRequest`, `IssueUploadRequest`, `UpdateMediaRequest`
- `App\Http\Resources\Api\V1\{EntryResource,MediaResource}`
- `App\Models\Cms\{CmsEntry,CmsRevision,CmsMedia,CmsGlobal,CmsPublication,CmsOutbox,CmsRedirect,CmsAuditLog}`
- `App\Policies\EntryPolicy`; gates in `App\Providers\AppServiceProvider`
- `backend/routes/api.php` — the `admin` route group

### External
- `laravel/sanctum` — `auth:sanctum` middleware and personal access tokens
- `mongodb/laravel-mongodb` — MongoDB Eloquent models and `MongoDB\BSON\ObjectId`
- `league/flysystem-aws-s3-v3` — presigned upload URLs and public URLs from `MediaService`

<!-- MANUAL: -->
