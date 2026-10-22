<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# tests

## Purpose
Docker-backed acceptance suite for the CMS contract. The Feature tests are the primary acceptance layer — they exercise the real MongoDB collections, the real auth guards, the real publish pipeline, and the public-delivery isolation that the admin and public frontends depend on. The Unit suite is still the untouched Laravel skeleton placeholder.

## Key Files
| File | Description |
|------|-------------|
| `TestCase.php` | Abstract base extending `Illuminate\Foundation\Testing\TestCase`; empty on purpose — each test class owns its own setup and cleanup in `setUp()`/`tearDown()` |
| `Feature/AuthTest.php` | P1 acceptance (spec 13.3): 401 for a guest, 403 for a forbidden role, login/logout, profile update, password change, owner-only health; mirrors the SPA CSRF flow |
| `Feature/EntriesTest.php` | P2–P4 acceptance (spec 13.1): draft CRUD with optimistic revisions, 409 on a stale revision, publish/unpublish, revision list and restore, public delivery isolation, redirects, idempotency |
| `Feature/MediaTest.php` | P6 acceptance (spec 13.2): presigned upload issue/complete against the S3-compatible service, validation gates, reference-guarded delete |
| `Feature/PagesGlobalsTest.php` | P5 + P7 acceptance (spec 7.4, 7.7): page-builder alias flow, globals publish, owner-only audit reads |
| `Feature/ExampleTest.php` | Skeleton placeholder asserting `GET /` returns 200 |
| `Unit/ExampleTest.php` | Skeleton placeholder asserting `true === true` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Feature/` | Acceptance tests against the HTTP API — see `Feature/AGENTS.md` |
| `Unit/` | Isolated unit tests — see `Unit/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Run the suite with `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/` (which runs `artisan config:clear` then `artisan test`). There is no `make test` target in the root Makefile. Bare-host `php artisan test` fails because the host has no MongoDB PHP extension — the API only runs inside Docker.
- Create `@cms-test.local` users per test with an explicit role; do not reuse the seeder's `test@example.com`.
- Every test that touches MongoDB wipes the `cms_*` collections it used in its own `tearDown()` via `DB::connection('mongodb')->table($collection)->delete()`, then deletes the `@cms-test.local` users. Tests do not share state and do not rely on a database transaction.
- For the browser SPA flow, fetch `/sanctum/csrf-cookie` first, replay the `XSRF-TOKEN` cookie as the `X-XSRF-TOKEN` header, and refresh it after every mutation because login and logout regenerate the session.
- New lifecycle behaviour needs a Feature test asserting both the happy path and its guard — 409 on a stale revision, 403 on the wrong role, or public invisibility of a draft.

### Testing Requirements
- `phpunit.xml` defines two suites, `Unit` and `Feature`, and sets `DB_CONNECTION=sqlite` with `DB_DATABASE=:memory:` for the SQL side, `CACHE_STORE=array`, `SESSION_DRIVER=array`, and `QUEUE_CONNECTION=sync`. The CMS data path is MongoDB regardless of these settings.
- `backend/composer.json` exposes the `test` script; `backend/README.md` documents the Docker command. Both are the canonical way to run the suite.

### Common Patterns
- Test classes extend `Tests\TestCase`; the base class holds no shared helpers — helpers live as private methods on each test class (`makeUser()`, `projectPayload()`, `withSpaCsrf()`).
- `makeUser()` uses a static counter to produce unique emails per call.
- Assertions read the JSON envelope directly: `->json('data')`, `->assertCreated()`, `->assertStatus(403)`.
- `spec X.Y` references in class docblocks point at the repo-root `*-spec.md` files.

## Dependencies

### Internal
- `App\Models\{User,Cms\*}` — the MongoDB models under test
- `backend/routes/api.php` — the endpoints under test
- `config/cms.php` — locale, upload, preview, and revalidation settings
- `backend/phpunit.xml`, `backend/composer.json` — suite definition and the `test` script

### External
- MongoDB (`mongodb/laravel-mongodb`, `ext-mongodb`) — the CMS datastore
- S3-compatible storage (Moto mock in Docker) — media upload tests
- `phpunit/phpunit` — the test runner

<!-- MANUAL: -->
