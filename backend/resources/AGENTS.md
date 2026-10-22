<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# resources

## Purpose
The stock Laravel frontend scaffold, kept but effectively unused. The CMS backend has no Blade UI and no client-side JavaScript of its own: the admin console is the separate Next.js app in `frontend-admin/`, the public site is `frontend/`, and every API response is JSON. What remains here is the skeleton Vite entrypoints plus the single welcome view served at `/`.

## Key Files
| File | Description |
|------|-------------|
| `views/welcome.blade.php` | Default Laravel landing page returned by the `/` route in `routes/web.php`; mostly an inlined Tailwind v4 stylesheet with a Laravel welcome layout |
| `js/app.js` | Vite entrypoint — a comment only, no application code |
| `css/app.css` | Tailwind v4 entrypoint — `@import 'tailwindcss'`, `@source` globs for Blade views, and a `--font-sans` theme override using Instrument Sans |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `css/` | Tailwind/Vite stylesheet entrypoint — see `css/AGENTS.md` |
| `js/` | Vite JavaScript entrypoint — see `js/AGENTS.md` |
| `views/` | Blade views — see `views/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Do not build CMS screens here. The admin UI lives in `frontend-admin/` (Next.js) and talks to `/api/v1`; the public site lives in `frontend/`. Adding Blade pages would create a third surface nobody consumes.
- API response shapes are owned by `App\Http\Resources\Api\V1\*`, not by templates.
- Leave the scaffold files as they are unless you are deliberately replacing the landing page itself. `resources/js/app.js` and `resources/css/app.css` exist only because `vite.config.js` references them and `welcome.blade.php` loads them via `@vite`.
- The `@source` globs in `css/app.css` point at `vendor/laravel/framework/.../Pagination/*.blade.php` and `storage/framework/views/*.php` so compiled Blade classes are scanned for Tailwind classes.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension, so the suite runs in Docker only.
- `tests/Feature/ExampleTest.php` asserts `GET /` returns 200 — that is the only test touching this scaffold.

### Common Patterns
- Vite entrypoints are named `resources/{css,js}/app.{css,js}` and referenced from `backend/vite.config.js`.
- Blade views use the `@fonts` directive and `config('app.name')` for the page title.

## Dependencies

### Internal
- `backend/routes/web.php` — the `/` route that returns `view('welcome')`
- `backend/vite.config.js` — the Vite configuration that builds these entrypoints
- `backend/public/` — the compiled assets land in `public/build`

### External
- Tailwind CSS v4 (`@import 'tailwindcss'`) — CSS pipeline
- Laravel Blade — the `welcome.blade.php` template engine

<!-- MANUAL: -->
