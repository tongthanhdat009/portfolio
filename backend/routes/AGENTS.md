<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# routes

## Purpose
All HTTP + schedule definitions. `api.php` is the CMS v1 contract (spec 7); `console.php` wires the scheduler; `web.php` is a placeholder welcome view.

## Key Files
| File | Role |
|------|------|
| `api.php` | `v1/auth/*` (login/token/me/profile/password), `v1/admin/*` under `auth:sanctum` (entries, globals, pages, media, redirects, publish-operations, audit-logs, system/health), `v1/public/*` (pages, projects, notes, experiments, capabilities, skills, experiences, globals, redirect resolve) |
| `console.php` | `cms:process-outbox --limit=50` every minute; `CleanupOrphanUploads` weekly |
| `web.php` | Single `/` welcome view; no CMS UI here |

## Subdirectories
None.

## For AI Agents
- New admin routes go inside the `auth:sanctum` + `admin` group with `->name('api.v1.admin.*')`. Public routes read publications only.
- Name every route; controllers are referenced by class (`[EntryController::class, 'index']`), health check is invokable (`SystemHealthController::class`).
- Keep `web.php` empty of API logic; JSON rendering is keyed off `api/*` in `bootstrap/app.php`.

## Dependencies
- Internal: `App\Http\Controllers\Api\V1\*\*`, `App\Jobs\CleanupOrphanUploads`, `App\Console\Commands\ProcessOutboxCommand`.
- External: Sanctum, `throttle:login` limiter (defined in `AppServiceProvider`).

<!-- MANUAL: -->
