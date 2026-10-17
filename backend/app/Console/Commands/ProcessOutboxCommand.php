<?php

namespace App\Console\Commands;

use App\Jobs\RevalidateNextSite;
use App\Models\Cms\CmsOutbox;
use Illuminate\Console\Command;

/**
 * Claim due pending outbox rows and dispatch their workers (spec 8.2).
 * With QUEUE_CONNECTION=sync this delivers inline; with Redis a real
 * worker pool picks the jobs up. Idempotent: delivered rows are skipped.
 */
class ProcessOutboxCommand extends Command
{
    protected $signature = 'cms:process-outbox {--limit=10 : Max rows to claim per run}';

    protected $description = 'Dispatch due pending outbox operations';

    public function handle(): int
    {
        $due = CmsOutbox::query()
            ->where('status', CmsOutbox::STATUS_PENDING)
            ->where('nextAttemptAt', '<=', now())
            ->orderBy('nextAttemptAt')
            ->limit((int) $this->option('limit'))
            ->get();

        foreach ($due as $operation) {
            if ($operation->kind === 'next.revalidate') {
                RevalidateNextSite::dispatch((string) $operation->getKey());
                $this->line("  dispatched {$operation->getKey()}");
            } else {
                $this->warn("  unknown kind {$operation->kind} ({$operation->getKey()})");
            }
        }

        $this->info("Processed {$due->count()} operation(s).");

        return self::SUCCESS;
    }
}
