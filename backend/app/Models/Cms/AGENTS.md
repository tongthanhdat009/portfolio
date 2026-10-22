<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Cms

## Purpose
The nine MongoDB document models that make up the CMS: drafts, published snapshots, revision history, media metadata, the outbox, globals, redirects, the audit trail, and the Sanctum token store. All of them live on the `mongodb` connection and use explicit `$table` names.

## Key Files
| File | Description |
|------|-------------|
| `CmsEntry.php` | `cms_entries` — the draft and lifecycle source; `TYPE_*` constants (page, project, capability, skill, experience, experiment, note, global) and `STATUS_*` constants (draft, published, archived); `routePath()` maps type+slug to `/work`, `/notes`, or `/lab`; `hasUnpublishedChanges()` compares `revision` to `lastPublishedRevision`. Never read by public routes |
| `CmsPublication.php` | `cms_publications` — the immutable public snapshot per source revision (`publicData`, `publicSeo`, `sourceRevision`, `referencedIds`, `active`). The only collection public delivery reads; never written from admin forms |
| `CmsRevision.php` | `cms_revisions` — immutable per-save snapshots (`entryId`, `revision`, `snapshot`, `actorId`, `changeSummary`) used for history and restore-as-new-draft |
| `CmsMedia.php` | `cms_media` — asset metadata only (`storageKey`, `disk`, `bucket`, `mimeType`, `size`, `visibility`, `status`, `checksum`); bytes live in object storage. `STATUS_PENDING`/`READY`/`DELETED` |
| `CmsOutbox.php` | `cms_outbox` — revalidation/webhook delivery rows: `kind`, `payload`, `status` (`pending`/`delivered`/`failed`), `attempts`, `nextAttemptAt`, `lastErrorCode`, `idempotencyKey` |
| `CmsGlobal.php` | `cms_globals` — singleton site-configuration drafts (`key`, `locale`, `data`, `revision`); takes public effect only through published `type=global` snapshots |
| `CmsRedirect.php` | `cms_redirects` — slug history and URL migrations (`locale`, `fromPath`, `toPath`, `entryId`); unique on (locale, fromPath) |
| `CmsAuditLog.php` | `cms_audit_logs` — append-only trail (`actorId`, `event`, `resourceType`, `resourceId`, `requestId`, `ip`, `metadata`); summaries and diff metadata only, never full content text |
| `CmsPersonalAccessToken.php` | `personal_access_tokens` — Sanctum's token model on MongoDB, mirroring the SQL model's `{id}\|{secret}` format with sha256 hashing; implements `HasAbilities`; wired via `Sanctum::usePersonalAccessTokenModel()` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| _(none)_ | Leaf directory for `Models/` — all nine CMS document models sit directly under it. |

## For AI Agents

### Working In This Directory
- Every model sets `protected $connection = 'mongodb'` and an explicit `protected $table`. The MongoDB package v5 reads the collection name from `$table`, not `$collection`.
- Never cast a BSON array field to `array` — that persists a JSON-encoded string and silently breaks `where`/`exists` queries. Cast only scalars and dates (`boolean`, `integer`, `datetime`). Every model here repeats this as a comment.
- Use `CmsEntry::STATUS_*` and `CmsEntry::TYPE_*` constants instead of literals; `SchemaRegistry::ENTRY_TYPES` is the other source of truth for type names.
- Models hold no query logic. Cross-document rules (publish, archive, reference checks) live in `App\Application\Services`.
- `$guarded = ['_id']` prevents mass-assignment of the primary key — keep it on every model.
- `CmsOutbox`, `CmsPublication`, `CmsRevision`, `CmsRedirect`, and `CmsAuditLog` set `public $timestamps = false` because they manage their own `createdAt`/`publishedAt` fields.
- `CmsPersonalAccessToken::findToken()` mirrors Sanctum's SQL implementation — if you change the token format, the Next.js admin client breaks too.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Feature tests wipe these collections in `tearDown()` (`cms_entries`, `cms_publications`, `cms_revisions`, `cms_globals`, `cms_media`, `cms_audit_logs`, `cms_redirects`, `cms_outbox`); leftover rows cause false failures.

### Common Patterns
- Extend `MongoDB\Laravel\Eloquent\Model`; `User` (in the parent directory) uses `MongoDB\Laravel\Auth\User` instead.
- `protected function casts(): array` returns only scalar and date casts.
- `protected $fillable` lists exactly the writable fields; `protected $guarded = ['_id']` protects the key.
- Constants are declared first in the class, then `$fillable`, then `$guarded`, then `casts()`, then helper methods.
- Docblocks cite the spec (`spec 4.2`, `spec 4.3`, `spec 4.4`) — preserve that convention.

## Dependencies

### Internal
- `App\Providers\AppServiceProvider` — binds `CmsPersonalAccessToken` as the Sanctum model and `EntryPolicy` to `CmsEntry`.
- `App\Application\Services\*` — the only layer that mutates these documents.
- `App\Jobs\RevalidateNextSite` and `CleanupOrphanUploads` — read and update outbox and media rows.
- `App\Http\Resources\Api\V1\*` — render documents as API responses.

### External
- `mongodb/laravel-mongodb` — document driver, `MongoDB\BSON\ObjectId`, and the `mongodb` connection.
- Laravel Sanctum — `HasAbilities` contract and token lifecycle.
- Laravel Eloquent — model base classes and casting.

<!-- MANUAL: -->
