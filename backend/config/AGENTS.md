<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# config

## Purpose
Environment-driven settings. Only `cms.php` is CMS-specific; the rest are stock Laravel tuned for MongoDB + Sanctum SPA + S3 media.

## Key Files
| File | Role |
|------|------|
| `cms.php` | `default_locale`, `max_upload_mb` (15), `max_pdf_upload_mb` (20), `preview_ttl_minutes`, `public_base_url`, media prefixes (`private/published/tmp`), `revisions_retention_days`, `revalidate.{url,secret,timeout_seconds}` |
| `database.php` | Default `sqlite`; `mongodb` connection used explicitly by all CMS models |
| `filesystems.php` | S3 disk for media (Moto mock locally via `CMS_*`/`AWS_*` env) |
| `auth.php` / `sanctum.php` | Sanctum SPA + `CmsPersonalAccessToken` model |
| `queue.php` | `sync` locally, Redis with workers for outbox delivery |
| `cors.php` | First-party SPA origins |

## Subdirectories
None.

## For AI Agents
- Add CMS settings to `cms.php` with `env('CMS_*', default)` + cast, never hardcode. Read via `config('cms.key')`.
- Secrets (`NEXT_REVALIDATE_SECRET`, S3 keys) come from env/`.env.example` — never commit values.
- Upload limits: `max_upload_mb` is generic, PDFs have separate fixed `max_pdf_upload_mb`.

## Dependencies
- Internal: consumed by `Application\Services\*`, `Jobs\RevalidateNextSite`, `Models\*`.
- External: MongoDB, S3/Moto, Redis (queue), Next.js revalidate endpoint.

<!-- MANUAL: -->
