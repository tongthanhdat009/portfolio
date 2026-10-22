<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# config

## Purpose
Environment-driven settings. Only `cms.php` is CMS-specific; the rest are stock Laravel files tuned for a MongoDB-backed, Sanctum-SPA, S3-media deployment. Every value is read at runtime through the `config()` helper.

## Key Files
| File | Description |
|------|-------------|
| `cms.php` | CMS settings: `default_locale` (`CMS_DEFAULT_LOCALE`, default `en`), `max_upload_mb` (`CMS_MAX_UPLOAD_MB`, default 15), `max_pdf_upload_mb` (fixed 20), `preview_ttl_minutes` (15), `public_base_url`, `media.{private_prefix,public_prefix,temp_prefix}` (`private`/`published`/`tmp`), `revisions_retention_days` (365), `revalidate.{url,secret,timeout_seconds}` from `NEXT_REVALIDATE_*` |
| `database.php` | The `mongodb` connection (`MONGODB_URI`, `MONGODB_DATABASE` = `portfolio_cms`) that every CMS model uses; the default connection is `sqlite` and is only the stock Laravel scaffold |
| `filesystems.php` | The `s3` disk used for media — `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_ENDPOINT`, `AWS_USE_PATH_STYLE_ENDPOINT`, `AWS_ROOT`, `S3_PUBLIC_BASE_URL` |
| `auth.php` | Eloquent user provider pointing at `App\Models\User` via `AUTH_MODEL`; there is no `users` SQL table in this project |
| `sanctum.php` | `stateful` domains from `SANCTUM_STATEFUL_DOMAINS` (default `localhost,localhost:3000,127.0.0.1,127.0.0.1:9000,::1`) and token expiration settings |
| `queue.php` | Queue connections; `default` comes from `QUEUE_CONNECTION` (`sync` locally, Redis in production) |
| `cors.php` | CORS for `api/*` and `sanctum/csrf-cookie`, with `supports_credentials` enabled and origins from `CORS_ALLOWED_ORIGINS` |
| `cache.php`, `logging.php`, `mail.php`, `session.php`, `services.php` | Stock Laravel configuration — `CACHE_STORE=file`, `SESSION_DRIVER=file`, and the standard log channels |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| _(none)_ | Flat config directory — every setting lives in a top-level `*.php` file. |

## For AI Agents

### Working In This Directory
- Add new CMS settings to `cms.php` using `env('CMS_*', default)` with an explicit cast (`(int)`, `(string)`, `rtrim(...)`) — never a raw `env()` value. Read them back with `config('cms.key')`.
- Never call `env()` outside this directory. Once config is cached, `env()` returns null.
- Secrets (`NEXT_REVALIDATE_SECRET`, AWS keys, `MONGODB_URI` credentials, `APP_KEY`) come from the environment and `.env.example`. Never commit real values — `backend/.env` is gitignored.
- `max_upload_mb` is the generic image limit; PDFs have their own fixed `max_pdf_upload_mb` of 20. Both are enforced in `MediaService::maxBytes()`.
- The media prefixes in `cms.php` (`private`, `published`, `tmp`) are concatenated into S3 keys by `MediaService::finalKey()` and checked by `CleanupOrphanUploads` — changing them changes the storage layout and the cleanup sweep.
- `config('database.default')` is `sqlite`, but that is not the CMS store. Every CMS model sets `protected $connection = 'mongodb'` explicitly, so changing the default connection does not move CMS data.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- `phpunit.xml` overrides the environment for the test suite (`DB_CONNECTION=sqlite`, `QUEUE_CONNECTION=sync`, `CACHE_STORE=array`, `SESSION_DRIVER=array`), so config changes must not assume a Redis or file session backend.
- `composer test` runs `php artisan config:clear` first — if a config change appears to have no effect, clear the cached config.

### Common Patterns
- Settings follow the Laravel `env()`-in-config convention with a safe default so the app boots without a populated `.env`.
- Values are cast once at the config boundary, never re-cast at the call site.
- Dot notation for access: `config('cms.media.temp_prefix', 'tmp')`, `config('cms.revalidate.timeout_seconds', 5)`.
- Keep CMS-specific keys under the `cms` namespace with a `CMS_` env prefix, so they are greppable and clearly separate from framework config.

## Dependencies

### Internal
- `App\Application\Services\MediaService` — reads upload limits and media prefixes.
- `App\Application\Services\PublishService` and `App\Jobs\RevalidateNextSite` — read the revalidate URL, secret, and timeout.
- `App\Console\Commands\*` — read the MongoDB DSN and the S3 bucket.
- `App\Models\*` — set `protected $connection = 'mongodb'` to bind to the `mongodb` connection defined here.

### External
- MongoDB — the `mongodb` connection and its `MONGODB_URI`.
- S3-compatible object storage — the `s3` disk and its `AWS_*` credentials.
- Redis — the production queue and cache backend (`sync` and `file` locally).
- Laravel Sanctum — stateful domain list for the SPA.

<!-- MANUAL: -->
