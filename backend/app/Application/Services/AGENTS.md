<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Services

## Purpose
The four CMS services that carry all business rules: draft lifecycle (`ContentService`), publish pipeline (`PublishService`), media upload lifecycle (`MediaService`), and audit trail (`AuditService`). They sit between the HTTP layer and the MongoDB document models, and they are the only place multi-step content mutations happen.

## Key Files
| File | Description |
|------|-------------|
| `ContentService.php` | Create draft (slug/key uniqueness, required-field checks), compare-and-set save with 409 on stale revision, archive/restore, restore an old revision as a new draft, write `CmsRevision` snapshots, and create a `CmsRedirect` when a published entry's route path changes |
| `PublishService.php` | Idempotent `publish()`/`unpublish()`: refresh + revision check → reject archived → upsert `CmsPublication` → insert a `next.revalidate` outbox row keyed by `idempotencyKey` → flip entry status/`publishedAt`/`lastPublishedRevision` → audit |
| `MediaService.php` | Presigned direct upload: `issueUpload()` validates MIME/size and creates a `pending` `CmsMedia` plus a 5-minute presigned PUT URL; `completeUpload()` re-checks the stored object's existence, size, and MIME, then copies it to its final key; `softDelete()`/`restore()`/`publicUrl()` manage visibility |
| `AuditService.php` | Single `record()` method that inserts an append-only `CmsAuditLog` row with actor ID, event, resource, request ID, IP, metadata, and timestamp |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| _(none)_ | Leaf directory for `Application/` — the four services sit directly under it. |

## For AI Agents

### Working In This Directory
- Never call a model directly from a controller for a multi-step flow; add the method to the matching service instead.
- `PublishService` runs on standalone MongoDB (no multi-document transactions). Every step must stay idempotent and retry-safe — the `CmsOutbox.idempotencyKey` is the dedupe anchor. Do not describe publish as atomic.
- `ContentService::saveDraft()` and `PublishService::publish()` both compare `revision` against `expectedRevision` and throw `ConflictHttpException('Stale revision. Reload and retry.')` on mismatch.
- `MediaService::completeUpload()` must delete the stored object and throw when size or MIME validation fails — do not silently mark it ready.
- `MediaService::softDelete()` refuses to delete an asset still referenced by a publication or a live draft (`ConflictHttpException`).
- `AuditService::record()` must never receive passwords, tokens, or full content text — pass summaries and diff metadata only.
- BSON arrays: never add `'field' => 'array'` casts to the document models these services write.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Coverage maps to `tests/Feature/EntriesTest.php` (draft CRUD, publish, outbox), `PagesGlobalsTest.php` (globals/pages), and `MediaTest.php` (upload issue/complete/delete). All need a live MongoDB; the feature tests wipe the CMS collections in `tearDown()`.

### Common Patterns
- Plain classes with constructor injection: `public function __construct(private readonly AuditService $audit) {}`.
- Domain failures are Symfony HTTP exceptions (`ConflictHttpException`, `UnprocessableEntityHttpException`) so `bootstrap/app.php` renders them as JSON for `api/*`.
- `AuditService::record($event, $resourceType, $resourceId, $metadata, $request)` — always pass the `Request` so actor, IP, and `X-Request-ID` are captured.
- Service methods return models (`->fresh()`) or plain arrays (`['operationId' => ..., 'publishedRevision' => ..., 'status' => ...]`), never responses.
- Docblocks cite the spec (`spec 8.2`, `spec 6.2`) — preserve that convention.

## Dependencies

### Internal
- `App\Domain\Content\SchemaRegistry` — `requiresSlug()`, `requiresKey()`, and entry-type rules.
- `App\Models\Cms\*` — `CmsEntry`, `CmsPublication`, `CmsRevision`, `CmsRedirect`, `CmsMedia`, `CmsOutbox`, `CmsAuditLog`.
- `App\Jobs\RevalidateNextSite` — the worker the outbox dispatches to.
- `config/cms.php` — upload limits, media prefixes, default locale.

### External
- `mongodb/laravel-mongodb` — document queries, `updateOrCreate`, `exists()`.
- Laravel `Storage` facade (Flysystem S3) — `temporaryUploadUrl`, `exists`, `size`, `mimeType`, `copy`, `delete`, `temporaryUrl`.
- Laravel queue — `RevalidateNextSite::dispatch()`.

<!-- MANUAL: -->
