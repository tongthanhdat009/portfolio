<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Api

## Purpose
Namespace root for versioned FormRequest classes. It carries no PHP files of its own; it exists so requests are namespaced alongside the controllers and resources they serve (`App\Http\Requests\Api\V1\...`).

## Key Files
None — this directory contains only the `V1/` subdirectory.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `V1/` | Version 1 requests, split into `Admin/` and `Auth/` — see `V1/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Do not add request classes at this level; they belong to a version segment.
- Keep the request namespace parallel to the controller namespace: `Api\V1\Admin\StoreEntryRequest` serves `Api\V1\Admin\EntryController::store`.
- Form requests are resolved by type-hint injection in the controller method signature, so the class name and namespace are part of the public contract of the endpoint.

### Testing Requirements
- No code of its own to test. Run the suite with `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`.

### Common Patterns
- One request class per payload shape, not one per controller. Reuse a request when two endpoints accept the same body (for example `LoginRequest` serves both `login` and `issueToken`).

## Dependencies

### Internal
- `backend/routes/api.php` — determines which request class each endpoint receives
- `backend/bootstrap/app.php` — JSON error rendering for `api/*`

### External
- `laravel/framework` — `Illuminate\Foundation\Http\FormRequest`

<!-- MANUAL: -->
