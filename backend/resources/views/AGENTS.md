<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# views

## Purpose
Blade view templates for the Laravel scaffold. The CMS backend has no server-rendered admin or public pages — those are separate Next.js applications — so the only template here is the default welcome page returned by the `/` route.

## Key Files
| File | Description |
|------|-------------|
| `welcome.blade.php` | Stock Laravel welcome page: `@fonts`, an `@vite` block that loads `resources/css/app.css` and `resources/js/app.js` when `public/build/manifest.json` or `public/hot` exists, and an inlined Tailwind v4 stylesheet as the no-build fallback; the title comes from `config('app.name')` |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- Do not add CMS or admin screens here. Public content is served as JSON from `/api/v1/public/*` and rendered by `frontend/`; the admin is rendered by `frontend-admin/`.
- The only route that renders a view is `GET /` in `backend/routes/web.php`. Adding a Blade route means adding an HTML surface the project does not otherwise support.
- The `@vite` guard on the manifest means the page still renders without a build; keep that fallback intact.
- If you replace this view, also check `tests/Feature/ExampleTest.php`, which asserts `GET /` returns 200.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension.
- `tests/Feature/ExampleTest.php` is the only test that touches a view.

### Common Patterns
- Blade is used only for the static landing page; everything else is JSON built by `App\Http\Resources\Api\V1\*`.
- Compiled views are written to `storage/framework/views` (git-ignored) and are also scanned by the Tailwind `@source` globs in `resources/css/app.css`.

## Dependencies

### Internal
- `backend/routes/web.php` — the `/` route returning `view('welcome')`
- `backend/resources/css/app.css`, `backend/resources/js/app.js` — the Vite assets this view loads
- `backend/public/build/manifest.json` — the presence check that switches on the built assets

### External
- Laravel Blade — template engine
- Vite — `@vite` directive for asset resolution

<!-- MANUAL: -->
