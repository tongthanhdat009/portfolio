<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Application

## Purpose
Stateless orchestration layer between HTTP and MongoDB. Every draft-lifecycle, publish, media, and audit rule lives here; controllers only authorize, validate, and delegate. Services hold no request state and make no HTTP calls except through explicitly injected clients.

## Key Files
| File | Description |
|------|-------------|
| `Services/ContentService.php` | Draft CRUD, compare-and-set save (409 on stale `expectedRevision`), archive/restore, restore-revision-as-new-draft, revision snapshots, redirect creation on slug change |
| `Services/PublishService.php` | Idempotent publish/unpublish: validate → snapshot revision → upsert `CmsPublication` → enqueue `next.revalidate` outbox row → entry bookkeeping → audit |
| `Services/MediaService.php` | Presigned-PUT upload issue → complete validates the stored object → `cms_media` metadata; the backend never proxies bytes |
| `Services/AuditService.php` | Append-only audit writer; callers pass summaries only — never passwords, tokens, or full content text |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Services/` | The four CMS services; no further nesting (see `Services/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Put lifecycle logic in services, not controllers. Controllers call `ContentService`/`PublishService`/`MediaService` and never touch multiple models for a multi-step flow.
- `PublishService` assumes standalone MongoDB with no multi-document transactions. Keep every step idempotent and retry-safe; never claim joint atomicity. The `idempotencyKey` on the outbox row is the dedupe point.
- `ContentService::saveDraft()` and `PublishService::publish()` both enforce optimistic concurrency against `expectedRevision` and throw `ConflictHttpException` on mismatch.
- BSON arrays: do not add `'field' => 'array'` casts on document models.
- Reference spec numbers in docblocks (`spec 8.1`) the way the existing classes do.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Service changes here are exercised through `tests/Feature/EntriesTest.php`, `PagesGlobalsTest.php`, and `MediaTest.php`; these need a live MongoDB.

### Common Patterns
- Services are plain classes with constructor injection of collaborators (`public function __construct(private readonly AuditService $audit) {}`).
- Domain failures are raised as Symfony HTTP exceptions (`ConflictHttpException`, `UnprocessableEntityHttpException`) rather than custom exception types, so `bootstrap/app.php` renders them as JSON.
- Audit writes go through `AuditService::record($event, $resourceType, $resourceId, $metadata, $request)`; pass the `Request` so actor, IP, and request ID are captured.

## Dependencies

### Internal
- `App\Domain\Content\SchemaRegistry` — entry types, required slug/key rules, and `data` validation shapes.
- `App\Models\Cms\*` — `CmsEntry`, `CmsPublication`, `CmsRevision`, `CmsRedirect`, `CmsMedia`, `CmsOutbox`, `CmsAuditLog`.
- `App\Jobs\RevalidateNextSite` — dispatched from the outbox, not directly by these services.

### External
- `mongodb/laravel-mongodb` — document queries and `updateOrCreate`.
- Laravel `Storage` facade (Flysystem S3) — presigned URLs and object validation.
- Laravel queue — `RevalidateNextSite::dispatch()`.

<!-- MANUAL: -->
