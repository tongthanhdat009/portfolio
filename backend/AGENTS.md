<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.
</laravel-boost-guidelines>

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# backend

## Purpose
JSON-only headless CMS API over MongoDB (`mongodb/laravel-mongodb`) with S3-compatible object storage for media and Laravel Sanctum for admin auth. Drafts live in `cms_entries`; public delivery reads immutable `cms_publications` snapshots only; publishing fans out through a `cms_outbox` to an HMAC-signed Next.js revalidation endpoint.

## Key Files
| File | Description |
|------|-------------|
| `routes/api.php` | v1 HTTP contract: `auth/*`, `admin/*` (behind `auth:sanctum`), `public/*` |
| `routes/console.php` | Scheduler: `cms:process-outbox --limit=50` every minute, `CleanupOrphanUploads` weekly |
| `config/cms.php` | CMS runtime settings: locales, upload limits, media prefixes, revalidate URL/secret/timeout |
| `composer.json` | PHP deps: `laravel/framework` ^13.17, `mongodb/laravel-mongodb` ^5.11, `laravel/sanctum` ^4.3, `league/flysystem-aws-s3-v3` |
| `phpunit.xml` | PHPUnit 12 config; `Unit` and `Feature` suites over `tests/` |
| `Dockerfile` | Backend image; the API runs in Docker because the host lacks `ext-mongodb` |
| `.env.example` | Template for `DB_*`, `MONGODB_*`, `AWS_*`, `SANCTUM_*`, `CMS_*`, `NEXT_REVALIDATE_*` |
| `README.md` | Local run, test, and outbox-worker instructions (Vietnamese) |
| `CLAUDE.md` | Laravel Boost bootstrap block for this directory |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `app/` | Application code: services, models, controllers, jobs, policies, providers (see `app/AGENTS.md`) |
| `bootstrap/` | App wiring, Sanctum stateful middleware, JSON exception rendering (see `bootstrap/AGENTS.md`) |
| `config/` | Environment-driven settings, including `cms.php` (see `config/AGENTS.md`) |
| `database/` | Stock relational scaffolding; all CMS data lives in MongoDB (see `database/AGENTS.md`) |
| `routes/` | API contract and scheduler (see `routes/AGENTS.md`) |
| `resources/` | Stock Laravel scaffold only — no CMS UI lives here (see `resources/AGENTS.md`) |
| `tests/` | Feature acceptance tests (see `tests/AGENTS.md`) |
| `vendor/` | Composer dependencies — never edit or document |
| `storage/` | Framework-generated runtime state — never edit or document |

## For AI Agents

### Working In This Directory
- The API must run in Docker. The host PHP lacks the MongoDB extension, so `php artisan serve` on the host is not a valid path; use `docker compose exec backend php artisan ...` from the repo root (service name `backend` in the root `compose.yaml`).
- `mongodb/laravel-mongodb` v5 reads the collection name from `$table`, not `$collection`. Every CMS model sets `protected $table`.
- The database is MongoDB, not MySQL. The stock `database/migrations` and `seeders` are Laravel skeleton leftovers; the CMS is schema-less and index-managed by `php artisan cms:bootstrap-indexes`.
- The spec of record is the repo-root `laravel-mongodb-s3-portfolio-cms-backend-architecture.md`; code docblocks cite it as `spec <section>`.
- Never commit `backend/.env`, `APP_KEY`, AWS keys, the MongoDB URI with credentials, or `NEXT_REVALIDATE_SECRET`.

### Testing Requirements
- Run the suite from the repo root: `docker compose exec backend php artisan test`.
- Or from inside `backend/`: `composer test` (runs `php artisan config:clear` then `php artisan test`).
- Bare-host `php artisan test` fails — the host has no `ext-mongodb` and cannot talk to MongoDB.
- Baseline is 27 tests: Auth (8), Entries/publish (9), Pages+Globals (3), Media (5), skeleton (2).
- Feature tests need MongoDB and clean the CMS collections in `tearDown()`; do not assume an empty database.

### Common Patterns
- Layering: FormRequest validates → controller authorizes → service mutates → API Resource renders. Keep each layer in its lane.
- Constructor property promotion with `readonly` for injected services (`private readonly ContentService $content`); explicit strict return types (`JsonResponse`, `void`).
- Naming: `XxxService` in `app/Application/Services`, `*Test.php` under `tests/`.
- Spec references live in docblocks (`spec 8.2`) — preserve them when touching lifecycle code.
- Authorization gates are defined in `AppServiceProvider`; the permission matrix lives in `EntryPolicy`. Public routes never touch drafts.

## Dependencies

### Internal
- `../frontend/` — Next.js public site, consumes `v1/public/*` and hosts the revalidation endpoint.
- `../frontend-admin/` — Next.js admin dashboard, consumes `v1/admin/*` via Sanctum.
- `../compose.yaml` — `mongo` (27017), `backend` (9000), `s3` Moto mock (5000).
- Repo-root `laravel-mongodb-s3-portfolio-cms-backend-architecture.md` — the spec.

### External
- MongoDB 7 via `mongodb/laravel-mongodb` — the only store for CMS data.
- S3-compatible object storage via `league/flysystem-aws-s3-v3`; locally the Moto server container.
- Laravel Sanctum for SPA session/token auth.
- Laravel queue (`sync` locally, Redis in production) for outbox delivery and cleanup jobs.

<!-- MANUAL: -->
