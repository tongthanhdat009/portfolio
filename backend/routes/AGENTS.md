<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# routes

## Purpose
All HTTP entry points and the scheduler for the CMS backend. `api.php` is the v1 contract (spec section 7) and is the only file that maps a URL to a controller; `console.php` wires the artisan scheduler and the outbox worker; `web.php` is a placeholder landing route with no CMS logic.

## Key Files
| File | Description |
|------|-------------|
| `api.php` | The CMS v1 API. `Route::prefix('v1')` + `Route::name('api.v1.')` wraps three groups: `auth/` (login, token issue, token revoke, logout, me, profile, password change), `admin/` (all under `auth:sanctum`: system health, content types, entries CRUD plus archive/restore/revisions/restore-revision/publish/unpublish/preview-session/preview-data, globals, pages, audit logs, media, redirects, publish operations), and `public/` (pages, projects, notes, experiments, capabilities, skills, experiences, globals, redirect resolve) |
| `console.php` | Defines the `inspire` artisan command, schedules `CleanupOrphanUploads` weekly and `cms:process-outbox --limit=50` every minute |
| `web.php` | A single `GET /` route returning the `welcome` view |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- Name every route. Route names are the contract the admin SPA uses: `api.v1.auth.*`, `api.v1.admin.*`, `api.v1.public.*`. The admin group's prefix and name come from `Route::prefix('admin')->name('admin.')` inside the `api.v1` group.
- Reference controllers by class (`[EntryController::class, 'index']`), not by string. The health check is invokable and uses the class name directly (`SystemHealthController::class`).
- New admin routes go inside the `auth:sanctum` group. Public routes stay outside every auth middleware — putting a draft-reading route in `public/` is a data leak.
- `throttle:login` guards `auth/login` and `auth/token`. Keep it on any credential-checking endpoint.
- `bootstrap/app.php` registers this file under the framework's `api` route group, which supplies the `/api` prefix. Controllers must not hard-code `/api/v1`.
- The admin group already relies on per-action authorization inside the controllers; the route file is not the authorization layer.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension, so the suite runs in Docker only.
- Feature tests hit the routes by URL (`/api/v1/admin/entries`, `/api/v1/public/...`). A route rename without updating the test is a broken endpoint.
- Adding a route needs a Feature test asserting the response and its auth guard.

### Common Patterns
- Route groups are nested: version → audience → individual routes, each level contributing both a URL segment and a name segment.
- Parameters are ids in the path (`{id}`, `{key}`, `{slug}`, `{revision}`); controllers convert the string id into a `MongoDB\BSON\ObjectId` when the target is a MongoDB document.
- The outbox worker is scheduled here, not in a supervisor: `cms:process-outbox --limit=50` every minute.

## Dependencies

### Internal
- `App\Http\Controllers\Api\V1\*` — the controllers bound here
- `App\Jobs\CleanupOrphanUploads` — the weekly scheduled job
- `App\Console\Commands\ProcessOutboxCommand` (`cms:process-outbox`) — the per-minute scheduled command
- `backend/bootstrap/app.php` — route-file registration, `EnsureFrontendRequestsAreStateful` middleware, and JSON error rendering for `api/*`

### External
- `laravel/sanctum` — `auth:sanctum` middleware and the Sanctum PAT model
- `laravel/framework` — routing, route model binding, scheduling (`Schedule::job`, `Schedule::command`)

<!-- MANUAL: -->
