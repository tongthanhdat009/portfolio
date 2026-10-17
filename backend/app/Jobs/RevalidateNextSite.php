<?php

namespace App\Jobs;

use App\Models\Cms\CmsOutbox;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

/**
 * Next.js cache revalidation (spec 8.2, 10.2). Signed with HMAC + timestamp +
 * nonce so the endpoint can reject replays; never reports done before the
 * Next.js endpoint accepts. Exponential backoff with dead-letter ceiling.
 */
class RevalidateNextSite implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 8;

    public function __construct(public readonly string $outboxId) {}

    public function backoff(): array
    {
        return [10, 30, 120, 300, 900, 1800, 3600];
    }

    public function handle(): void
    {
        $operation = CmsOutbox::query()->findOrFail($this->outboxId);

        if ($operation->status === CmsOutbox::STATUS_DELIVERED) {
            return;
        }

        $url = (string) config('cms.revalidate.url');
        $secret = (string) config('cms.revalidate.secret');
        $timeout = (int) config('cms.revalidate.timeout_seconds', 5);

        if ($url === '' || $secret === '') {
            $this->failOperation($operation, 'REVALIDATE_UNCONFIGURED');

            return;
        }

        $timestamp = (string) time();
        $nonce = (string) \Illuminate\Support\Str::uuid();
        $body = array_merge($operation->payload ?? [], ['timestamp' => $timestamp, 'nonce' => $nonce]);
        $signature = hash_hmac('sha256', $timestamp.'.'.$nonce.'.'.json_encode($body), $secret);

        try {
            $response = Http::timeout($timeout)
                ->withHeaders([
                    'X-Revalidate-Timestamp' => $timestamp,
                    'X-Revalidate-Nonce' => $nonce,
                    'X-Revalidate-Signature' => $signature,
                ])
                ->post($url, $body);

            if (! $response->successful()) {
                $this->failOperation($operation, 'REVALIDATE_HTTP_'.$response->status());

                return;
            }
        } catch (\Throwable) {
            $this->failOperation($operation, 'REVALIDATE_TRANSPORT');

            return;
        }

        $operation->status = CmsOutbox::STATUS_DELIVERED;
        $operation->lastErrorCode = null;
        $operation->save();
    }

    public function failed(\Throwable $exception): void
    {
        $operation = CmsOutbox::query()->find($this->outboxId);

        if ($operation) {
            $this->failOperation($operation, 'REVALIDATE_FAILED');
        }
    }

    private function failOperation(CmsOutbox $operation, string $code): void
    {
        $operation->attempts = $operation->attempts + 1;
        $operation->lastErrorCode = $code;

        if ($operation->attempts >= $this->tries) {
            $operation->status = CmsOutbox::STATUS_FAILED;
        } else {
            $operation->status = CmsOutbox::STATUS_PENDING;
            $operation->nextAttemptAt = now()->addSeconds($this->backoff()[min($operation->attempts - 1, 6)]);
        }

        $operation->save();

        if ($operation->status === CmsOutbox::STATUS_FAILED) {
            throw new \RuntimeException("Revalidation dead-lettered: {$code}");
        }

        throw new \RuntimeException("Revalidation failed, will retry: {$code}");
    }
}
