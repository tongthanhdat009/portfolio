<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# app

## Purpose
Laravel CMS API application code: a service-orchestrated draft/publish flow over MongoDB, Sanctum-guarded admin routes, public delivery reads, S3-hosted media, and outbox revalidation jobs. Controllers validate and authorize; `Application\Services` owns the lifecycle rules; `Models\Cms` owns persistence.

## Key Files
| File | Description |
|------|-------------|
| `Providers/AppServiceProvider.php` | Authorization gates (`view-admin`, `edit-content`, `preview-draft`, `upload-media`, `publish`, `purge-asset`, `manage-users`, `view-audit`), `EntryPolicy` binding, `login` rate limiter (5/min by email+IP), Sanctum token model |
| `Policies/EntryPolicy.php` | Server-side spec 9.2 matrix: view→`view-admin`, create/update/archive→`edit-content`, publish→`publish`, preview→`preview-draft` |
| `Jobs/RevalidateNextSite.php` | HMAC-signed Next.js revalidation, 8 tries with exponential backoff, dead-letter to `failed` |
| `Jobs/CleanupOrphanUploads.php` | Sweeps expired pending uploads and unreferenced soft-deleted assets (scheduled weekly) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Application/` | Stateless orchestration layer — content, publish, media, audit services (see `Application/AGENTS.md`) |
| `Console/` | Artisan commands `cms:*` (see `Console/AGENTS.md`) |
| `Domain/` | Framework-free content-type registry (see `Domain/AGENTS.md`) |
| `Http/` | Controllers, FormRequests, API Resources for API v1 (see `Http/AGENTS.md`) |
| `Jobs/` | Queued workers: revalidation and orphan-upload cleanup (see `Jobs/AGENTS.md`) |
| `Models/` | Eloquent documents for the `mongodb` connection (see `Models/AGENTS.md`) |
| `Policies/` | `EntryPolicy` — the spec 9.2 authorization matrix (see `Policies/AGENTS.md`) |
| `Providers/` | `AppServiceProvider` — gates, limiter, Sanctum wiring (see `Providers/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Flow: FormRequest validates → controller authorizes → service mutates → Resource renders. Keep each layer in its lane; lifecycle logic does not belong in controllers.
- Use constructor property promotion with `readonly` for injected services (`private readonly ContentService $content`) and explicit strict return types (`JsonResponse`, `void`).
- Spec references in docblocks (`spec 8.2`) are a house convention — preserve them when touching lifecycle code.
- Public delivery controllers read `CmsPublication` only; they must never touch `CmsEntry` drafts.
- MongoDB models must never cast BSON arrays to `array`; cast only scalars and dates.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Feature tests wipe the CMS collections in `tearDown()`; a dirty MongoDB will produce false failures.

### Common Patterns
- `readonly` promoted constructor injection; services are resolved through the container, never `new`-ed inline.
- Services throw `Symfony\Component\HttpKernel\Exception\*` (`ConflictHttpException`, `UnprocessableEntityHttpException`) so the JSON exception handler renders them correctly.
- Naming: `XxxService` in `Application/Services`, `*Test.php` under `tests/Feature` and `tests/Unit`.
- Job classes implement `ShouldQueue` and use the `Dispatchable, InteractsWithQueue, Queueable, SerializesModels` trait set.

## Dependencies

### Internal
- `config/cms.php` — locales, upload limits, media prefixes, revalidate URL/secret.
- `routes/api.php` — the v1 route contract these classes implement.
- `bootstrap/app.php` — middleware and JSON exception rendering.
- `App\Domain\Content\SchemaRegistry` — canonical content-type rules consumed by services and requests.

### External
- `mongodb/laravel-mongodb` — the persistence layer for every CMS document.
- Laravel Sanctum — SPA session and personal-access-token auth.
- Laravel queue (`sync` locally, Redis in production) — job dispatch.
- S3-compatible object storage via Flysystem — media bytes.

<!-- MANUAL: -->
