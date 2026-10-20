<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# Console

## Purpose
Artisan commands for local bootstrap and outbox delivery. Scheduled via `routes/console.php` (outbox every minute, orphan cleanup weekly).

## Key Files
| File | Role |
|------|------|
| `Commands/ProcessOutboxCommand.php` | `cms:process-outbox {--limit=10}`: claim due `pending` rows, dispatch `RevalidateNextSite`; skips `delivered` (idempotent) |
| `Commands/CreateOwnerCommand.php` | `cms:create-owner`: seed initial owner; no public registration exists |
| `Commands/MakeBucketCommand.php` | Create S3 media bucket/prefixes (works against Moto mock locally) |
| `Commands/BootstrapIndexesCommand.php` | Create MongoDB indexes for CMS collections |

## Subdirectories
None — `Commands/` holds all four commands, no separate AGENTS.md.

## For AI Agents
- Keep commands thin: query due rows, dispatch jobs, exit code `int`. Delivery logic belongs in the job, not the command.
- With `QUEUE_CONNECTION=sync` outbox delivers inline; with Redis a worker pool picks jobs up. Preserve both paths.
- Test via `make test` (docker); `cms:*` commands need MongoDB + S3 mock, not bare host.

## Dependencies
- Internal: `App\Models\Cms\CmsOutbox`, `App\Jobs\RevalidateNextSite`, `config/cms.php` (prefixes, revalidate URL/secret).
- External: MongoDB, S3 (Moto locally), Laravel scheduler/queue.

<!-- MANUAL: -->
