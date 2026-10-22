<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# factories

## Purpose
Eloquent model factories. The CMS has exactly one factory: the `User` factory that the seeder and any test needing a quick user can pull from. Content models (entries, publications, media, globals, revisions, outbox, audit logs, redirects) have no factories — their documents are schemaless and test fixtures are written inline in each Feature test.

## Key Files
| File | Description |
|------|-------------|
| `UserFactory.php` | Defines `App\Models\User`: fake name, unique safe email, verified timestamp, plaintext `password` (the model's `hashed` cast hashes on write — never pre-hash), `role` defaults to `User::ROLE_VIEWER`, random remember token. Provides the `unverified()` state |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- The factory password is the plaintext string `password`; the `User` model's `hashed` cast hashes it on save. Setting an already-hashed value here would double-hash it and break logins.
- The default role is `viewer`, the lowest privilege. A test that needs owner or editor must pass the role explicitly.
- `User` is a MongoDB model on the `cms_users` collection, so the factory writes to MongoDB, not to the SQL `users` table.
- Do not add factories for CMS content models without a concrete need — the Feature tests build those documents inline with explicit fields, which keeps the fixture and the assertion visible together.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host lacks the MongoDB PHP extension, so factory-backed tests fail outside Docker.
- A factory change needs a test that exercises it — currently `tests/Feature/ExampleTest.php` and the `DatabaseSeeder` path are the only consumers.

### Common Patterns
- `definition(): array` returns the default state; extra states are `static` methods returning `$this->state(fn (array $attributes) => [...])`.
- The class is namespaced `Database\Factories` and autoloaded via the `Database\Factories\` PSR-4 prefix in `composer.json`.

## Dependencies

### Internal
- `App\Models\User` — the factory target, with `ROLE_VIEWER` and the `hashed` cast
- `Database\Seeders\DatabaseSeeder` — the primary consumer

### External
- `fakerphp/faker` — `fake()` generator
- `laravel/framework` — `Illuminate\Database\Eloquent\Factories\Factory`

<!-- MANUAL: -->
