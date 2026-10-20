<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# tests

## Purpose
Docker-backed acceptance for the CMS contract: auth, draft CRUD with optimistic revisions, publish pipeline, media, pages/globals, public-delivery isolation.

## Key Files
| File | Role |
|------|------|
| `TestCase.php` | Stock Laravel base; per-test cleanup lives in each `tearDown()` |
| `Feature/AuthTest.php` | Login, token issue/revoke, profile, password change |
| `Feature/EntriesTest.php` | Draft CRUD, 409 on stale revision, publish/unpublish, revisions, public isolation, redirects, idempotency |
| `Feature/MediaTest.php` | Presigned upload issue/complete against S3 mock |
| `Feature/PagesGlobalsTest.php` | Page-block and global-key reads/writes/publish |
| `Feature/ExampleTest.php` / `Unit/ExampleTest.php` | Scaffold placeholders |

## Subdirectories
Batched: `Feature/`, `Unit/` — no separate AGENTS.md files.

## For AI Agents
- Run with `make test` (docker: MongoDB + Moto S3). Bare-host runs fail — `EntriesTest` header states this.
- Pattern: create `@cms-test.local` users per role in-test; wipe `cms_*` collections + test users in `tearDown()` via `DB::connection('mongodb')`.
- New lifecycle behavior needs a Feature test asserting both the happy path and the guard (409, auth gate, or public invisibility).

## Dependencies
- Internal: `App\Models\{User,Cms\*}`, `routes/api.php`, `config/cms.php`.
- External: MongoDB, S3 Moto mock, PHPUnit.

<!-- MANUAL: -->
