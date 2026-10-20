<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# bootstrap

## Purpose
Application wiring: route file registration, Sanctum stateful API middleware, JSON exception rendering for `/api/*`.

## Key Files
| File | Role |
|------|------|
| `app.php` | `Application::configure`: web/api/commands/health (`/up`), appends `EnsureFrontendRequestsAreStateful`, `shouldRenderJsonWhen` for `api/*` |
| `providers.php` | Provider manifest (`AppServiceProvider`) |

## Subdirectories
None. `cache/` holds generated `packages.php`/`services.php` — never edit, never document.

## For AI Agents
- Middleware/exception changes go in `app.php` closures, not a kernel class. Keep `api/*` JSON-only.
- Do not hand-edit `cache/*`; rebuild via `php artisan optimize:clear` / boost install.

## Dependencies
- Internal: `routes/{api,web,console}.php`, `App\Providers\AppServiceProvider`.
- External: Sanctum `EnsureFrontendRequestsAreStateful`.

<!-- MANUAL: -->
