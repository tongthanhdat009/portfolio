<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# Application

## Purpose
Stateless orchestration layer between HTTP and MongoDB models. All draft-lifecycle, publish, media, and audit rules live here; controllers only authorize, validate, and delegate.

## Key Files
| File | Role |
|------|------|
| `Services/ContentService.php` | Draft CRUD, compare-and-set save (409 on stale `expectedRevision`), archive/restore, revision snapshots |
| `Services/PublishService.php` | Idempotent publish: validate → snapshot → upsert `CmsPublication` → outbox `next.revalidate` → audit |
| `Services/MediaService.php` | Presigned PUT issue → complete/validate object → `cms_media` metadata; backend never proxies bytes |
| `Services/AuditService.php` | Append-only audit writer; callers pass summaries, never passwords/tokens/full text |

## Subdirectories
| Dir | Notes |
|-----|-------|
| `Services/` | All four services; no further nesting, no separate AGENTS.md |

## For AI Agents
- Put lifecycle logic in services, not controllers. Controllers call `ContentService`/`PublishService`, never models directly for multi-step flows.
- `PublishService` assumes standalone MongoDB (no multi-doc transactions): keep every step idempotent and retry-safe, never claim joint atomicity.
- BSON arrays: do not add `'field' => 'array'` casts on document models.
- Reference spec numbers in docblocks (`spec 8.1`) as existing code does.

## Dependencies
- Internal: `App\Domain\Content\SchemaRegistry`, `App\Models\Cms\*`, `App\Jobs\RevalidateNextSite` (via outbox).
- External: `mongodb/laravel-mongodb`, S3 client (media), Laravel queue.

<!-- MANUAL: -->
