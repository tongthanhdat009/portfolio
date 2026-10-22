<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Jobs

## Purpose
The two queued workers of the CMS: `RevalidateNextSite` pushes publish events to the Next.js site's cache-revalidation endpoint, and `CleanupOrphanUploads` sweeps expired pending uploads and unreferenced soft-deleted assets. Both run off the queue (`sync` locally, Redis in production) and both are designed to be retried safely.

## Key Files
| File | Description |
|------|-------------|
| `RevalidateNextSite.php` | Signs a POST to `config('cms.revalidate.url')` with `HMAC-SHA256` over `timestamp.nonce.body`, sends `X-Revalidate-Timestamp`, `X-Revalidate-Nonce`, and `X-Revalidate-Signature` headers, then marks the outbox row `delivered`; on failure it increments `attempts`, records a `REVALIDATE_*` error code, reschedules `nextAttemptAt` with backoff, and dead-letters to `failed` at the try ceiling |
| `CleanupOrphanUploads.php` | Deletes `pending` media older than one day (and its temporary bytes under the `tmp` prefix), then deletes `deleted` media older than 30 days only when no publication or live draft references it |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| _(none)_ | Leaf directory under `app/` — both queued workers sit directly under it. |

## For AI Agents

### Working In This Directory
- `RevalidateNextSite` takes only the `outboxId` (`public readonly string $outboxId`) and reloads the row, so a retry always reads current state. It returns early when the row is already `delivered`.
- The HMAC signature is computed over `timestamp . '.' . nonce . '.' . json_encode($body)` with `config('cms.revalidate.secret')`. The Next.js endpoint verifies it — changing the concatenation order breaks verification on the frontend side, so keep the three parts in that exact order.
- `RevalidateNextSite::failed()` marks the outbox row `failed` with code `REVALIDATE_FAILED`. Never let a job report success before the endpoint accepts.
- `CleanupOrphanUploads` must never delete bytes referenced by a publication or a live (non-archived) draft. Keep the `referencedIds` and `data.blocks.references` checks in place.
- Both jobs catch `\Throwable` around S3 deletes and `continue` on failure rather than aborting the whole sweep.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Outbox and publish behaviour are covered by `tests/Feature/EntriesTest.php`; with `QUEUE_CONNECTION=sync` the jobs execute inline, so the dispatch path is exercised end to end.
- The weekly cleanup job has no dedicated test file — cover changes to it with a focused feature test rather than assuming coverage.

### Common Patterns
- Jobs implement `ShouldQueue` and use `Dispatchable, InteractsWithQueue, Queueable, SerializesModels`.
- Retry policy is declared on the class (`public int $tries = 8;`) and via a `backoff(): array` method (`[10, 30, 120, 300, 900, 1800, 3600]`).
- Job state lives in the `cms_outbox` document, not in the queue backend — the queue is only the trigger.
- `CleanupOrphanUploads` is scheduled weekly in `routes/console.php` via `Schedule::job(new CleanupOrphanUploads)->weekly()`.

## Dependencies

### Internal
- `App\Models\Cms\CmsOutbox` — the delivery-state row read and updated by `RevalidateNextSite`.
- `App\Models\Cms\CmsMedia`, `CmsPublication`, `CmsEntry` — the documents swept by `CleanupOrphanUploads`.
- `config/cms.php` — `revalidate.url`, `revalidate.secret`, `revalidate.timeout_seconds`, `media.temp_prefix`.

### External
- Laravel HTTP client — the signed POST to the Next.js revalidation endpoint.
- Laravel queue and scheduler — dispatch, retries, and the weekly schedule.
- S3-compatible object storage via Flysystem — object existence, size, and deletion.

<!-- MANUAL: -->
