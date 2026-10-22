<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# public

## Purpose
The web server document root. It holds the front controller that boots Laravel and the small set of static files the API serves directly. The CMS has no admin UI here — the admin and the public site are separate Next.js applications — so this directory stays at the Laravel default.

## Key Files
| File | Description |
|------|-------------|
| `index.php` | Laravel front controller: defines `LARAVEL_START`, requires the Composer autoloader, boots `bootstrap/app.php`, and hands the request to `$app->handleRequest()` |
| `.htaccess` | Apache rewrite rules for the `public/` docroot: disables multi-views and indexes, passes the `Authorization` and `X-XSRF-Token` headers through, strips trailing slashes with a 301, and sends everything else to `index.php` |
| `robots.txt` | `User-agent: *` / `Disallow:` — allows all crawlers |
| `favicon.ico` | Zero-byte placeholder favicon |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- Never put uploaded media here. Media lives in S3-compatible object storage; the API issues presigned URLs through `MediaService` and never proxies file bytes.
- Never put secrets, `.env`, or credentials in a file served from this directory — everything here is publicly fetchable.
- Do not add Blade views or HTML pages for the CMS. Delivery is JSON from `/api/v1`; the only rendered page in the project is the `/` welcome view from `resources/views/`.
- `index.php` and `.htaccess` are framework defaults. Change them only when the deployment topology requires it (for example swapping to Nginx + PHP-FPM).
- Note that `public/build` and `public/hot` are Vite artifacts referenced by `resources/views/welcome.blade.php`; they are build output, not source.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension.
- `tests/Feature/ExampleTest.php` asserts that `GET /` returns 200, which exercises the front controller and the welcome view end to end.

### Common Patterns
- The document root must be this directory; `backend/` itself must never be served directly.
- Static assets are committed; compiled assets are not — the `.gitignore` in `backend/` covers `public/build` and `public/hot`.

## Dependencies

### Internal
- `backend/bootstrap/app.php` — the application factory `index.php` boots
- `backend/composer.json` — the autoloader `index.php` requires (`vendor/autoload.php`)
- `backend/resources/views/welcome.blade.php` — the view rendered by the `/` route

### External
- `laravel/framework` — `Illuminate\Foundation\Application`, `Illuminate\Http\Request`
- Apache `mod_rewrite` — for the `.htaccess` rules (only when running under Apache)

<!-- MANUAL: -->
