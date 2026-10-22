<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Api

## Purpose
Namespace root for versioned API controllers. It exists only to hold the `V1/` subtree and carries no PHP files of its own; the API version segment is part of the PHP namespace (`App\Http\Controllers\Api\V1\...`) and of the URL prefix (`/api/v1`).

## Key Files
None — this directory contains only the `V1/` subdirectory.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `V1/` | Version 1 controllers, split by audience into `Admin/`, `Auth/`, `Public/` — see `V1/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Do not add files at this level. Every controller belongs under a version segment, and within a version under an audience segment.
- The URL prefix `/api/v1` is applied in `backend/routes/api.php` via `Route::prefix('v1')` inside the framework's `api` route group (which itself adds `/api`). Controllers do not hard-code URL paths.

### Testing Requirements
- No code of its own to test. Run the whole suite with `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`.

### Common Patterns
- Namespace segments are singular (`Api`, `V1`) except the audience segment `Public`, which is singular here to match its `Public` controller class and the `public.` route-name prefix.

## Dependencies

### Internal
- `backend/routes/api.php` — the only place that binds a controller to a URL and a route name
- `backend/bootstrap/app.php` — registers the `api` route file and makes `api/*` return JSON on errors

### External
- None beyond the Laravel framework's routing layer.

<!-- MANUAL: -->
