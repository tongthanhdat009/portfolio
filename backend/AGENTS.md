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
<!-- Generated: 2026-10-18 -->
# backend (Laravel CMS API)

## Purpose
JSON-only headless CMS API over MongoDB (`mongodb/laravel-mongodb`) with S3 media (Moto mock locally) and Sanctum auth. Drafts live in `cms_entries`; public delivery reads `cms_publications` snapshots; publish fans out via outbox → HMAC-signed Next.js revalidation.

## Key Files
| File | Role |
|------|------|
| `routes/api.php` | v1 contract: `auth/*`, `admin/*` (Sanctum), `public/*` |
| `config/cms.php` | Locales, upload limits, media prefixes, revalidate URL/secret |
| `composer.json` | PHP deps incl. `mongodb/laravel-mongodb`, Sanctum |
| `phpunit.xml` | Test suites; run via `make test` (docker) |
| `Dockerfile` | Backend image (MongoDB + Moto S3 expected alongside) |

## Subdirectories
| Dir | Notes |
|-----|-------|
| `app/AGENTS.md` | Controllers, services, models, jobs, policies, providers |
| `bootstrap/AGENTS.md` | App wiring, Sanctum middleware, JSON exceptions |
| `config/AGENTS.md` | Env-driven settings, `cms.php` reference |
| `database/AGENTS.md` | Relational scaffolding; CMS data is MongoDB |
| `routes/AGENTS.md` | API contract, scheduler |
| `resources/AGENTS.md` | Stock scaffold only, no CMS UI |
| `tests/AGENTS.md` | Docker-backed Feature acceptance |

Skipped: `vendor/`, `storage/`, `node_modules/`, `public/build`, `bootstrap/cache/` (generated/dependencies).

## For AI Agents
- Spec source of truth: repo-root `*.md` (sections cited in code as `spec X.Y`).
- Test via `make test` from repo root (docker). Bare-host artisan test fails (no MongoDB/S3 mock).
- Conventions: FormRequest validates → controller authorizes → service mutates → Resource renders; `readonly` promoted DI; `spec` refs in docblocks; `XxxService`/`*Test.php` naming.
- Gates in `AppServiceProvider`, matrix in `EntryPolicy`; public routes never touch drafts.
- BSON arrays: no `'array'` casts on document models.

## Dependencies
- Internal: `../frontend/` (Next.js consumer via revalidate + public API), repo-root specs.
- External: MongoDB, S3 (Moto locally), Redis queue (or `sync`), Sanctum SPA frontend.

<!-- MANUAL: -->
