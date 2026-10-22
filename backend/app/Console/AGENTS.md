<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Console

## Purpose
Artisan commands for local bootstrap and outbox delivery, plus the scheduler entry points registered in `routes/console.php`. Commands are thin: they query due rows, dispatch workers, and return an exit code — the delivery logic itself lives in the job.

## Key Files
| File | Description |
|------|-------------|
| `Commands/ProcessOutboxCommand.php` | `cms:process-outbox {--limit=10}` — claims due `pending` `cms_outbox` rows ordered by `nextAttemptAt` and dispatches `RevalidateNextSite` for `next.revalidate` kinds; warns on unknown kinds |
| `Commands/CreateOwnerCommand.php` | `cms:create-owner {email} {--name=} {--password=} {--force}` — creates or promotes the Owner account; prompts for the password via `secret()` when `--password` is omitted |
| `Commands/MakeBucketCommand.php` | `cms:make-bucket` — creates the configured S3 bucket if the provider allows it; fails cleanly when `AWS_BUCKET` is unset or still `CHANGE_ME` |
| `Commands/BootstrapIndexesCommand.php` | `cms:bootstrap-indexes` — idempotently creates the MongoDB indexes for every CMS collection, skipping any index whose name already exists |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Commands/` | All four `cms:*` commands (see `Commands/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Keep commands thin: query due rows, dispatch jobs, return `self::SUCCESS` or `self::FAILURE`. Delivery and retry logic belongs in the job, not the command.
- `cms:process-outbox` is idempotent — `delivered` rows are never re-dispatched because the command only selects `pending` rows whose `nextAttemptAt` has passed.
- With `QUEUE_CONNECTION=sync` (the local default) the outbox delivers inline; with Redis a worker pool picks the jobs up. Preserve both paths.
- `cms:create-owner` writes a plaintext password and relies on the model's `hashed` cast to hash on write — never pre-hash, and never echo the password.
- `cms:bootstrap-indexes` talks to MongoDB through the raw `MongoDB\Client` (not Eloquent) because index options like `partialFilterExpression` are not expressible through the ORM.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- The `cms:*` commands need MongoDB (and the S3 mock for `cms:make-bucket`); run them inside the container, e.g. `docker compose exec backend php artisan cms:bootstrap-indexes`.

### Common Patterns
- Commands extend `Illuminate\Console\Command` with a `protected $signature` and `protected $description`; `handle(): int` returns an exit code.
- Command names are namespaced `cms:*` — keep the prefix for anything CMS-related.
- Use `$this->line()` for per-item progress and `$this->info()`/`$this->error()`/`$this->warn()` for summary and failures.

## Dependencies

### Internal
- `App\Models\Cms\CmsOutbox` — the pending-row source for `cms:process-outbox`.
- `App\Jobs\RevalidateNextSite` — the worker the command dispatches.
- `App\Models\User` — owner creation target.
- `config/cms.php`, `config/database.php`, `config/filesystems.php` — connection, bucket, and prefix sources.

### External
- MongoDB driver (`MongoDB\Client`) for index bootstrap.
- AWS S3 client via Flysystem for bucket creation.
- Laravel scheduler and queue infrastructure.

<!-- MANUAL: -->
