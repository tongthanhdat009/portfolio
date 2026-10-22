<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# migrations

## Purpose
Schema migrations for the relational side of the application: the personal access token collection used by Sanctum, plus the Laravel skeleton's users, cache, and jobs tables. CMS content documents are schemaless MongoDB and are **not** managed here — their indexes are created by the `cms:bootstrap-indexes` artisan command.

## Key Files
| File | Description |
|------|-------------|
| `2026_10_17_061826_create_personal_access_tokens_table.php` | Creates `personal_access_tokens` (id, morphs `tokenable`, name, unique 64-char token hash, abilities, `last_used_at`, `expires_at`, timestamps). Backs `App\Models\Cms\CmsPersonalAccessToken`, which Sanctum is pointed at in `AppServiceProvider` |
| `0001_01_01_000000_create_users_table.php` | Stock skeleton schema: `users` (id, name, unique email, `email_verified_at`, password, remember token, timestamps), `password_reset_tokens`, and `sessions` (string id, nullable `user_id`, ip, user agent, payload, `last_activity`) |
| `0001_01_01_000001_create_cache_table.php` | Stock `cache` (key, value, expiration) and `cache_locks` (key, owner, expiration) tables |
| `0001_01_01_000002_create_jobs_table.php` | Stock `jobs` (queue, payload, attempts, reserved/available/created timestamps) and `job_batches` tables |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- Do not add migrations for CMS content fields. `cms_entries`, `cms_publications`, `cms_globals`, `cms_media`, `cms_revisions`, `cms_outbox`, `cms_audit_logs`, `cms_redirects`, and `cms_users` are MongoDB documents with an application-level schema, not SQL tables. Change the model and `App\Domain\Content\SchemaRegistry` instead.
- The `users` table from the stock migration is not where CMS identities live — `App\Models\User` uses the MongoDB `cms_users` collection. The stock table remains only as part of the Laravel skeleton.
- `personal_access_tokens` is used through the MongoDB-backed `CmsPersonalAccessToken` model, so the collection is created by this migration even though the app runs on MongoDB.
- Migrations use the anonymous-class style: `return new class extends Migration`. Both `up()` and `down()` must be implemented.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host lacks the MongoDB PHP extension.
- `phpunit.xml` points the SQL connection at SQLite `:memory:`; the MongoDB connection is used explicitly by the CMS tests via `DB::connection('mongodb')`.
- A migration change must not break the suite: the auth tests exercise the personal-access-token path end to end.

### Common Patterns
- Timestamped tables use `->timestamps()`; nullable audit columns use `->nullable()`.
- The `sessions` table is the database session driver's schema — the default `SESSION_DRIVER` is `file`, so it is currently unused but kept for the Redis/session-hardening roadmap item.

## Dependencies

### Internal
- `App\Models\Cms\CmsPersonalAccessToken` — the model backed by the `personal_access_tokens` collection
- `App\Models\User` — MongoDB `cms_users`, not the SQL `users` table
- `config/database.php` — the `mongodb` connection and the SQL default

### External
- `laravel/framework` — `Migration`, `Blueprint`, `Schema`
- `mongodb/laravel-mongodb` — MongoDB schema builder for the token collection
- SQLite — the SQL driver used for the stock tables

<!-- MANUAL: -->
