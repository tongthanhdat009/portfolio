<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Models

## Purpose
Eloquent documents on the `mongodb` connection covering CMS identity and every CMS collection. `CmsEntry` is the draft and lifecycle source of truth; public reads use `CmsPublication`, which is written only by the publish pipeline.

## Key Files
| File | Description |
|------|-------------|
| `User.php` | `cms_users` on `MongoDB\Laravel\Auth\User`; roles `owner`/`editor`/`viewer` plus `can_publish` and `can_preview` flags; `HasApiTokens`; `isOwner()`, `isEditor()`, `canEditContent()`, `canPublish()`, `canPreview()`, and `capabilities()` which emits the gate strings the admin UI reads |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Cms/` | All nine CMS document models (see `Cms/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Every model sets `protected $connection = 'mongodb'` and an explicit `protected $table`. The MongoDB package v5 reads the collection from `$table`, not `$collection`.
- Never cast BSON arrays to `array` — that persists a JSON-encoded string and breaks queries. Cast only scalars and dates (`boolean`, `integer`, `datetime`).
- Use the `CmsEntry::STATUS_*` and `CmsEntry::TYPE_*` constants rather than string literals.
- No query logic in models. Lifecycle and cross-document rules belong in `App\Application\Services`.
- The `User` model's `password` cast is `hashed`; assign a plaintext password and let the cast hash it. Never pre-hash.
- `$guarded = ['_id']` is the id guard on every model — keep it so `_id` cannot be mass-assigned.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Feature tests create users through the model and clean up in `tearDown()` — a stale `cms_users` row can break role assertions.

### Common Patterns
- Models extend `MongoDB\Laravel\Eloquent\Model` (or `MongoDB\Laravel\Auth\User` for `User`).
- Constants are declared at the top of the class; `casts()` returns a plain array.
- Small helper methods that derive state from the document (`CmsEntry::routePath()`, `CmsEntry::hasUnpublishedChanges()`) are acceptable; anything that queries another collection is not.

## Dependencies

### Internal
- `App\Providers\AppServiceProvider` — wires the Sanctum token model and the authorization gates these models feed.
- `App\Application\Services\*` — the only callers that drive document mutations.
- `App\Http\Resources\Api\V1\*` — render the documents as API responses.

### External
- `mongodb/laravel-mongodb` — the document driver and connection.
- Laravel Sanctum (`HasApiTokens`) — personal access tokens on `User`.

<!-- MANUAL: -->
