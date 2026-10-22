<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Unit

## Purpose
The isolated unit-test suite. It currently holds only the untouched Laravel skeleton placeholder — the CMS's real acceptance coverage lives in `tests/Feature/`, which drives the HTTP routes against live MongoDB.

## Key Files
| File | Description |
|------|-------------|
| `ExampleTest.php` | Skeleton placeholder extending `PHPUnit\Framework\TestCase` directly (not `Tests\TestCase` — no Laravel container is booted), asserting `true === true` |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- The suite is registered in `backend/phpunit.xml` as the `Unit` testsuite pointing at this directory.
- Unit tests here extend `PHPUnit\Framework\TestCase`, so there is no application container, no database, and no HTTP layer available. Extend `Tests\TestCase` instead if the test needs the framework booted — and put it in `tests/Feature/` if it needs the database.
- The CMS's meaningful test coverage is in `tests/Feature/` (auth, entries and publish, media, pages and globals). Add a unit test only for logic that is genuinely worth isolating from the framework — currently there is none.
- Do not add a unit test that duplicates a Feature assertion; the Feature test already covers the behaviour end to end.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. There is no `make test` target in the root Makefile. Bare-host `php artisan test` fails because the host lacks the MongoDB PHP extension — the full suite, including this placeholder, runs in Docker.
- `phpunit.xml` sets `DB_CONNECTION=sqlite` with `DB_DATABASE=:memory:` and array cache/session drivers for the test environment.

### Common Patterns
- Plain PHPUnit assertions, no Laravel helpers, no fixtures, no database.
- Test method naming mirrors the skeleton: `test_that_true_is_true`.

## Dependencies

### Internal
- `backend/phpunit.xml` — registers this directory as the `Unit` suite
- `backend/composer.json` — the `test` script and the `Tests\` PSR-4 autoload-dev prefix

### External
- `phpunit/phpunit` — the runner and `PHPUnit\Framework\TestCase`

<!-- MANUAL: -->
