<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# app

## Purpose
Laravel CMS API application code: service-orchestrated draft/publish flow over MongoDB, Sanctum-guarded admin routes, public delivery reads, S3 media, and outbox revalidation jobs.

## Key Files
| File | Role |
|------|------|
| `Providers/AppServiceProvider.php` | Gates (`view-admin`, `edit-content`, `preview-draft`, `upload-media`, `publish`, `purge-asset`, `manage-users`, `view-audit`), `EntryPolicy` binding, login throttle (5/min), Sanctum token model |
| `Policies/EntryPolicy.php` | Spec 9.2 matrix: view→`view-admin`, create/update/archive→`edit-content`, publish→`publish`, preview→`preview-draft` |
| `Jobs/RevalidateNextSite.php` | HMAC-signed Next.js revalidate, 8 tries with backoff, dead-letter to `failed` |
| `Jobs/CleanupOrphanUploads.php` | Weekly orphan-upload sweep (scheduled in `routes/console.php`) |

## Subdirectories
| Dir | Notes |
|-----|-------|
| `Application/AGENTS.md` | Services: content, publish, media, audit |
| `Console/AGENTS.md` | Artisan commands (`cms:*`) |
| `Domain/AGENTS.md` | `SchemaRegistry` content-type registry |
| `Http/AGENTS.md` | Controllers, requests, resources (batched) |
| `Models/AGENTS.md` | User + `Cms/*` documents |
| `Jobs/` | Two jobs, documented above — no separate file |
| `Policies/` | `EntryPolicy`, documented above — no separate file |
| `Providers/` | `AppServiceProvider`, documented above — no separate file |

## For AI Agents
- Flow: FormRequest validates → controller authorizes → service mutates → resource renders. Keep each layer in its lane.
- Constructor property promotion + `readonly` (e.g. `private readonly ContentService $content`); strict return types (`JsonResponse`, `void`).
- Spec references in docblocks (`spec 8.2`) are convention — preserve them when touching lifecycle code.
- Test via `make test` (docker, needs MongoDB); bare-host `php artisan test` fails on DB.

## Dependencies
- Internal: `config/cms.php` (locales, prefixes, revalidate), `routes/api.php`, `bootstrap/app.php` middleware.
- External: `mongodb/laravel-mongodb`, Sanctum, S3 (Moto mock locally), Redis queue (or `sync`).

<!-- MANUAL: -->
