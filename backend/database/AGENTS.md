<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# database

## Purpose
Relational-side scaffolding (users/cache/jobs tables, PAT tokens, test seeder). CMS content itself lives in MongoDB collections, not here.

## Key Files
| File | Role |
|------|------|
| `migrations/0001_01_01_000000_create_users_table.php` | Stock users/password-resets/sessions tables |
| `migrations/0001_01_01_000001_create_cache_table.php` / `000002_create_jobs_table.php` | Cache + queue tables |
| `migrations/2026_10_17_061826_create_personal_access_tokens_table.php` | Sanctum PAT table |
| `factories/UserFactory.php` | Test user factory |
| `seeders/DatabaseSeeder.php` | Seeds `test@example.com`; production owner via `cms:create-owner`, not seeder |

## Subdirectories
Batched: `factories/`, `migrations/`, `seeders/` — no separate AGENTS.md files. `database.sqlite` is local dev artifact.

## For AI Agents
- CMS collections (`cms_entries`, `cms_publications`, `cms_revisions`, `cms_outbox`, …) are schemaless MongoDB — indexes via `cms:bootstrap-indexes`, not migrations.
- Do not add migrations for CMS document fields. Migrations cover only relational/auth/infra tables.
- Seeder stays minimal; test data is built inline in `tests/Feature/*Test.php` with `@cms-test.local` users.

## Dependencies
- Internal: `App\Models\User`, `cms:create-owner` command.
- External: SQLite (dev default), MongoDB (CMS data).

<!-- MANUAL: -->
