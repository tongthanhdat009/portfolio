<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Feature

## Purpose
The acceptance layer for the CMS API. These tests drive the real HTTP routes against real MongoDB collections and real auth guards, covering the behaviour the admin SPA and the public site depend on: authentication, draft CRUD with optimistic revisions, the publish pipeline, media uploads, pages and globals, audit reads, and the isolation between drafts and public delivery.

## Key Files
| File | Description |
|------|-------------|
| `AuthTest.php` | P1 acceptance (spec 13.3) — guest 401, forbidden 403, login/logout, profile update, password change, owner-only health. Sets `Referer`/`Origin` headers so Sanctum treats the request as first-party, and mirrors the SPA CSRF flow via `/sanctum/csrf-cookie` + the `X-XSRF-TOKEN` header, refreshing the token after every mutation |
| `EntriesTest.php` | P2–P4 acceptance (spec 13.1) — draft CRUD, revision increments, 409 on a stale revision, publish/unpublish, revision list and restore, preview session and preview data, public delivery isolation, redirect creation, idempotency. `makeUser()` builds users with a role plus `can_publish`/`can_preview` flags |
| `MediaTest.php` | P6 acceptance (spec 13.2) — presigned upload issue/complete against the S3-compatible service, mime/size/usage validation gates, reference-guarded delete, restore. Points `filesystems.disks.s3.bucket` at a test bucket and creates it in `setUp()` |
| `PagesGlobalsTest.php` | P5 + P7 acceptance (spec 7.4, 7.7) — page-builder alias flow (load/save ordered blocks by page key), globals draft and publish, owner-only audit reads |
| `ExampleTest.php` | Skeleton placeholder asserting `GET /` returns 200 |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- Run with `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. There is no `make test` target in the root Makefile. Bare-host runs fail because the host lacks the MongoDB PHP extension.
- Every test class wipes the `cms_*` collections it touched in its own `tearDown()` via `DB::connection('mongodb')->table($collection)->delete()`, then deletes `@cms-test.local` users. There is no shared transaction and no database refresh — cleanup is explicit and per class.
- Create users inline with a role, never through the seeder or the factory defaults. `User::ROLE_OWNER`, `ROLE_EDITOR`, and `ROLE_VIEWER` gate different abilities, and `can_publish`/`can_preview` refine the editor role.
- Use unique emails. The `makeUser()` helpers use a static counter for exactly this reason.
- Assert both the happy path and the guard. The guards under test are: 401 without a token, 403 for the wrong role, 409 for a stale `expectedRevision`, and public invisibility of a draft.
- For endpoints that require the browser session flow, call the CSRF helper before any mutation and refresh the token afterwards — login and logout regenerate the session.
- Media tests need a reachable S3-compatible service. In Docker that is the Moto mock configured by `compose.yaml`; the bucket name is overridden per test via `config([...])`.

### Testing Requirements
- `phpunit.xml` registers `tests/Feature` as the `Feature` suite and sets `DB_CONNECTION=sqlite` / `DB_DATABASE=:memory:` for the SQL side, `CACHE_STORE=array`, `SESSION_DRIVER=array`, `QUEUE_CONNECTION=sync`. The CMS data path is MongoDB regardless.
- Run the whole suite after a change; there is no per-class seeding step, so a run of one file still needs the MongoDB and S3 services up.

### Common Patterns
- Tests extend `Tests\TestCase`; helpers are private methods on the test class (`makeUser()`, `projectPayload()`, `withSpaCsrf()`, `refreshSpaCsrf()`).
- Responses are asserted through the JSON envelope: `->assertCreated()`, `->assertStatus(409)`, `->json('data')`, `->json('data.revision')`.
- Test method names describe the behaviour, e.g. `test_project_vertical_slice`, `test_page_builder_alias_flow`.
- `spec X.Y` references in class docblocks point at the repo-root `*-spec.md` files.

## Dependencies

### Internal
- `App\Models\{User,Cms\*}` — the MongoDB models under test
- `backend/routes/api.php` — the endpoints under test
- `config/cms.php` — locale, upload size, preview TTL, and revalidation settings
- `backend/phpunit.xml` — suite definition and environment overrides

### External
- MongoDB (`ext-mongodb`, `mongodb/laravel-mongodb`) — the CMS datastore
- S3-compatible object storage (Moto mock in the Docker compose stack) — media upload tests
- `phpunit/phpunit` — the runner

<!-- MANUAL: -->
