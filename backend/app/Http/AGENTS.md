<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Http

## Purpose
The JSON-only HTTP layer of the CMS API v1. It holds three parallel tiers that mirror the request pipeline exactly: `Controllers/` (thin HTTP adapters), `Requests/` (FormRequest validation), and `Resources/` (JsonResource response shapes). The controller tree is split by audience — `Admin/` (Sanctum-guarded draft management), `Auth/` (login, token, profile), `Public/` (published reads only). Nothing here renders HTML; every route under `/api/v1` returns JSON.

## Key Files
| File | Description |
|------|-------------|
| `Controllers/Controller.php` | Abstract base for every controller; only pulls in the `AuthorizesRequests` and `ValidatesRequests` traits — no shared behaviour to override |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Controllers/` | Controller classes for the API — see `Controllers/AGENTS.md` |
| `Requests/` | FormRequest classes that own input validation — see `Requests/AGENTS.md` |
| `Resources/` | JsonResource classes that own output shape — see `Resources/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Follow the fixed pipeline: FormRequest validates → controller authorizes → service mutates → Resource renders. Business rules belong in `App\Application\Services\*`, never in a controller.
- Controllers inject services with `readonly` promoted constructor properties (`ContentService`, `PublishService`, `MediaService`, `AuditService`).
- Authorize server-side: `$this->authorize('update', $entry)` for policies, or `$request->user()->cannot('view-audit')` for gates. Hiding a UI button is not authorization.
- Route parameters carry MongoDB ids as strings. Convert a 24-hex id to `new MongoDB\BSON\ObjectId($id)` before querying `_id` (see `EntryController::findEntry`, `MediaController::findMedia`).
- Adding an endpoint means: FormRequest → controller method → Resource → route in `routes/api.php` → gate in `AppServiceProvider` → Feature test. Missing any one is an incomplete change.

### Testing Requirements
- Run the suite with `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/` (runs `artisan config:clear` then `artisan test`). Bare-host `php artisan test` fails because the host has no MongoDB PHP extension — the API only runs inside Docker.
- Feature tests under `tests/Feature/` are the acceptance layer for this tree. A change here needs a test asserting the happy path *and* its guard (403 on the wrong role, 409 on a stale revision, or public invisibility of a draft).

### Common Patterns
- Response envelope is `{"data": ...}` for a single record and `{"data": [...], "meta": {current_page, last_page, total}}` for lists.
- Resources string-cast BSON ids: `(string) $this->getKey()`.
- Publish, unpublish, and global publish return HTTP 202 because delivery is asynchronous through the outbox; they honour an `Idempotency-Key` request header.
- `spec X.Y` docblock references point at the repo-root `*-spec.md` files, not at code in this directory.

## Dependencies

### Internal
- `App\Application\Services\{ContentService,PublishService,MediaService,AuditService}`
- `App\Models\Cms\*` (MongoDB documents), `App\Models\User`, `App\Policies\EntryPolicy`, `App\Domain\Content\SchemaRegistry`
- Gates defined in `App\Providers\AppServiceProvider`; route table in `backend/routes/api.php`

### External
- `laravel/sanctum` — `auth:sanctum` guard and `EnsureFrontendRequestsAreStateful` middleware for the SPA
- `mongodb/laravel-mongodb` — `MongoDB\BSON\ObjectId`, MongoDB Eloquent models
- `league/flysystem-aws-s3-v3` — presigned direct uploads issued by `MediaService`

<!-- MANUAL: -->
