<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# database

## Purpose
Relational-side scaffolding only. The CMS's actual content lives in MongoDB collections (`cms_entries`, `cms_publications`, `cms_revisions`, `cms_globals`, `cms_media`, `cms_outbox`, `cms_audit_logs`, `cms_redirects`, `cms_users`) and is schemaless — those collections are indexed by the `cms:bootstrap-indexes` command, not by migrations. What lives here is the Laravel skeleton's SQL schema, which the CMS uses for the personal-access-token collection and which remains available for session, cache, and queue tables.

## Key Files
| File | Description |
|------|-------------|
| `.gitignore` | Ignores `*.sqlite*` so the local SQLite file is never committed |
| `database.sqlite` | Local development artifact, git-ignored; the app itself runs with `DB_CONNECTION=mongodb` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `factories/` | Eloquent model factories — see `factories/AGENTS.md` |
| `migrations/` | SQL-schema migrations for auth and infrastructure tables — see `migrations/AGENTS.md` |
| `seeders/` | Seeders — see `seeders/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Do not add migrations for CMS document fields. CMS collections are schemaless MongoDB; field changes are code changes in the models and the content schema registry (`App\Domain\Content\SchemaRegistry`).
- Migrations here cover only relational/infra tables: personal access tokens, and the skeleton's users, cache, jobs, and sessions tables.
- The CMS `User` model points at the MongoDB collection `cms_users` and its `password` is hashed by the `hashed` cast — never pre-hash in a seeder or factory.
- Production owner accounts are created by the `cms:create-owner` artisan command, not by the seeder. The seeder only creates a single `test@example.com` user.
- Test data is built inline in the Feature tests (`@cms-test.local` users) and the `cms_*` collections are wiped in each test's `tearDown()` — not by factories or seeders.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension, so the suite runs in Docker only.
- `phpunit.xml` sets `DB_CONNECTION=sqlite` with `DB_DATABASE=:memory:` for the SQL side, while the CMS tests talk to the `mongodb` connection explicitly through `DB::connection('mongodb')`.

### Common Patterns
- Migrations use the anonymous-class style (`return new class extends Migration`).
- Collections are named with a `cms_` prefix; the model `$table` property carries that name because the MongoDB driver v5 does not read `$collection`.
- MongoDB model fields are not cast to `array` — casting stores JSON strings and breaks queries.

## Dependencies

### Internal
- `App\Models\User` and `App\Models\Cms\*` — the MongoDB models these tables/collections back
- `App\Console\Commands\BootstrapIndexesCommand` (`cms:bootstrap-indexes`) and `CreateOwnerCommand` (`cms:create-owner`)
- `config/database.php` — the `mongodb` connection and the SQL default

### External
- `mongodb/laravel-mongodb` — the `mongodb` connection driver
- SQLite — the SQL default in `config/database.php` and the test in-memory database
- `fakerphp/faker` — used by the factory

<!-- MANUAL: -->
