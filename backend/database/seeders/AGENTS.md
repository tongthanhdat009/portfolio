<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# seeders

## Purpose
Seed data for a fresh local environment. The CMS deliberately keeps seeding minimal: the seeder creates one development user, while real owner accounts come from the `cms:create-owner` artisan command and CMS content comes from the admin API.

## Key Files
| File | Description |
|------|-------------|
| `DatabaseSeeder.php` | Creates a single user via `User::factory()` with name `Test User` and email `test@example.com`. The bulk `User::factory(10)->create()` line is present but commented out. Uses the `WithoutModelEvents` trait |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- Do not seed CMS content (entries, publications, globals, media, redirects). There is no seed path for those by design — content enters through the admin API so that revisions, the audit trail, and the outbox are populated correctly.
- Do not seed a production owner here. `php artisan cms:create-owner <email>` is the supported path; it applies the right role and flags.
- The `User::factory()` password is plaintext because the model's `hashed` cast hashes it on write. Never pre-hash.
- `WithoutModelEvents` is applied, so model observers and events do not fire during seeding. Keep that trait if you extend the seeder.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension, so seeding against the `cms_users` collection fails outside Docker.
- Seeders are not covered by the test suite; the Feature tests build their own `@cms-test.local` users instead of depending on the seeder.

### Common Patterns
- The class is namespaced `Database\Seeders` and autoloaded via the `Database\Seeders\` PSR-4 prefix in `composer.json`.
- Seeders run through `php artisan db:seed`; `db:seed` is not part of the Docker bring-up documented in `backend/README.md`.

## Dependencies

### Internal
- `App\Models\User` — the MongoDB `cms_users` model
- `Database\Factories\UserFactory` — the factory that builds the user
- `App\Console\Commands\CreateOwnerCommand` — the supported owner-creation path

### External
- `laravel/framework` — `Seeder`, `WithoutModelEvents`
- `fakerphp/faker` — used through the factory

<!-- MANUAL: -->
