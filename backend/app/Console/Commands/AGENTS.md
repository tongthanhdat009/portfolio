<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Commands

## Purpose
The four `cms:*` Artisan commands: MongoDB index bootstrap, owner account creation, S3 bucket creation, and outbox processing. Each is a thin wrapper that queries state, performs one action, and returns an exit code — the actual delivery work happens in `App\Jobs\RevalidateNextSite`.

## Key Files
| File | Description |
|------|-------------|
| `BootstrapIndexesCommand.php` | `cms:bootstrap-indexes` — creates the CMS MongoDB indexes idempotently using a raw `MongoDB\Client`; unique indexes on `cms_entries` (type+locale+slug, type+locale+key), `cms_publications`, `cms_revisions` (entryId+revision), `cms_media` (disk+bucket+storageKey), `cms_redirects` (locale+fromPath), and `cms_outbox` (idempotencyKey); skips any index whose name already exists |
| `CreateOwnerCommand.php` | `cms:create-owner {email} {--name=Administrator} {--password=} {--force}` — creates or promotes an Owner; prompts securely with `secret()` when `--password` is omitted, rejects passwords under 8 characters, and refuses to overwrite an existing user without `--force` |
| `MakeBucketCommand.php` | `cms:make-bucket` — creates the S3 media bucket from `config('filesystems.disks.s3.bucket')` if missing; errors when the bucket name is empty or still starts with `CHANGE_ME`, and catches any provider throwable into a clean failure |
| `ProcessOutboxCommand.php` | `cms:process-outbox {--limit=10}` — selects `pending` outbox rows with `nextAttemptAt <= now()` ordered by `nextAttemptAt`, dispatches `RevalidateNextSite` for `next.revalidate` rows, and warns on unknown kinds |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| _(none)_ | Leaf directory for `Console/` — all four `cms:*` commands sit directly under it. |

## For AI Agents

### Working In This Directory
- Keep commands thin. Query due rows, dispatch the job, return `self::SUCCESS`/`self::FAILURE`. Retry and backoff logic belongs in the job (`RevalidateNextSite`), not here.
- `cms:process-outbox` only selects `pending` rows, which makes it idempotent — `delivered` and `failed` rows are never redispatched.
- New `cms:*` commands must keep the `cms:` prefix and declare both `protected $signature` and `protected $description`.
- `cms:create-owner` assigns the plaintext password to `$user->password`; the `User` model's `hashed` cast hashes it on write. Never pre-hash and never print the password.
- `cms:bootstrap-indexes` uses the native `MongoDB\Client` because index options (`partialFilterExpression`, `name`) cannot be expressed through the Eloquent schema builder. Keep index names stable — they are the idempotency key for re-runs.
- The commands are wired into the scheduler in `routes/console.php`: `cms:process-outbox --limit=50` every minute, `CleanupOrphanUploads` weekly. Change the schedule there, not in the command.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- These commands need MongoDB (and the S3 mock for `cms:make-bucket`), so exercise them inside the container: `docker compose exec backend php artisan cms:bootstrap-indexes`, `docker compose exec backend php artisan cms:process-outbox --limit=50`.
- There is no `make` target for any of these commands — the root `Makefile` only covers the Next.js frontends and `docker compose` dev flows.

### Common Patterns
- Extend `Illuminate\Console\Command`; `handle(): int` always returns an exit code rather than calling `exit()`.
- Use `$this->line()` for per-item progress and `$this->info()`, `$this->warn()`, `$this->error()` for summaries and failures.
- Read configuration through `config('...')` helpers, never `env()` — the config layer is cached.
- Command classes carry a docblock citing the spec (`spec 7.2`, `spec 4.6`, `spec 8.2`); preserve that convention.

## Dependencies

### Internal
- `App\Models\Cms\CmsOutbox` — the outbox rows `cms:process-outbox` claims.
- `App\Jobs\RevalidateNextSite` — the worker the command dispatches.
- `App\Models\User` — the owner account created by `cms:create-owner`.
- `routes/console.php` — scheduler registration for the outbox command.

### External
- MongoDB PHP driver (`MongoDB\Client`, `MongoDB\Model\IndexInfo`) for index bootstrap.
- AWS S3 client via Flysystem (`Storage::disk('s3')->getClient()`) for bucket creation.
- Laravel scheduler and queue infrastructure.

<!-- MANUAL: -->
