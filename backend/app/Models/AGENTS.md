<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# Models

## Purpose
MongoDB documents (`mongodb/laravel-mongodb`) for users, drafts, publications, media, and ops collections. `CmsEntry` is the draft/lifecycle source; public reads use `CmsPublication`.

## Key Files
| File | Role |
|------|------|
| `User.php` | `cms_users`, `MongoDB\Laravel\Auth\User`; roles `owner/editor/viewer` + `can_publish`; `HasApiTokens` |
| `Cms/CmsEntry.php` | `cms_entries` drafts; `TYPE_*`/`STATUS_*` consts; never read by public routes |
| `Cms/CmsPublication.php` | Published snapshots read by `DeliveryController` |
| `Cms/CmsRevision.php` | Immutable per-save snapshots for history/restore |
| `Cms/CmsMedia.php` | Upload metadata (S3 key, mime, size) |
| `Cms/CmsOutbox.php` | `next.revalidate` ops: `pending/delivered/failed`, `attempts`, `nextAttemptAt` |
| `Cms/CmsGlobal.php` / `CmsRedirect.php` / `CmsAuditLog.php` | Globals, redirects, append-only audit |
| `Cms/CmsPersonalAccessToken.php` | Sanctum token model wired in `AppServiceProvider` |

## Subdirectories
| Dir | Notes |
|-----|-------|
| `Cms/` | All CMS documents; no separate AGENTS.md |

## For AI Agents
- Every model sets `protected $connection = 'mongodb'` and explicit `$table`. Never cast BSON arrays to `array` (persists JSON strings); cast only scalars/dates (`boolean`, `integer`, `datetime`).
- Status/type strings: use the `CmsEntry::STATUS_*/TYPE_*` consts, not literals.
- No query logic in models; lifecycle stays in `Application\Services`.

## Dependencies
- Internal: `AppServiceProvider` (Sanctum token model, gates), consumed by services/controllers/jobs.
- External: `mongodb/laravel-mongodb`, Sanctum.

<!-- MANUAL: -->
