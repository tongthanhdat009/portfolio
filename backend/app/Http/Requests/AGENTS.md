<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Requests

## Purpose
Root of the FormRequest tier. FormRequests own all input validation for the CMS API: they run before the controller method body, so an invalid payload is rejected with a 422 before any authorization or mutation happens. The `Api/` subtree holds one request class per endpoint shape, versioned and split by audience.

## Key Files
None — this directory contains only the `Api/` subdirectory.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Api/` | Versioned FormRequest classes — see `Api/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Every new endpoint that accepts a body gets a FormRequest here. Inline `$request->validate()` calls in controllers are the exception and are already used in a few places (`PageController::update`, `GlobalController`, `RedirectController::store`, `EntryController::restoreRevision`); prefer a FormRequest for anything non-trivial.
- `authorize()` decides whether the request may proceed. Return `true` only when the check is genuinely deferred to the controller — the admin entry requests do this because the route carries a raw id and the model-level check happens in the controller via `EntryPolicy`.
- Validation rules must not contain business logic. Draft-vs-published rules, revision arithmetic, and publishing side effects belong in services.
- Error responses are Laravel's standard 422 JSON with field-keyed messages; the framework renders JSON for `api/*` (configured in `backend/bootstrap/app.php`).

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension, so the suite cannot run outside Docker.
- A new validation rule needs a Feature test asserting the 422 and the offending field, plus the happy path.

### Common Patterns
- `rules()` returns `array<string, mixed>` and is documented with an `@return` PHPDoc block.
- `expectedRevision` is required on every draft write that can conflict.
- Slugs and keys are constrained by regex (`/^[a-z0-9\-\/]+$/` for slugs, `/^[a-z0-9_\-]+$/` for keys), not only by length.

## Dependencies

### Internal
- `App\Domain\Content\SchemaRegistry` — per-type data rules and allowed enum values
- `App\Application\Services\MediaService` — allowed mime types and usages
- `App\Models\Cms\CmsEntry` — resolved by id when rules depend on the entry type

### External
- `laravel/framework` — `FormRequest`, `Rule::in`, `Rule::unique`, `Password` rule

<!-- MANUAL: -->
