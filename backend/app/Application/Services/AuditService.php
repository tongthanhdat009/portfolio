<?php

namespace App\Application\Services;

use App\Models\Cms\CmsAuditLog;
use Illuminate\Http\Request;

/**
 * Append-only audit writer (spec 4.4, 10.3). Never logs full content text,
 * passwords, tokens, or URIs with credentials — callers pass summaries.
 */
class AuditService
{
    public function record(
        string $event,
        string $resourceType,
        ?string $resourceId,
        array $metadata = [],
        ?Request $request = null,
    ): void {
        CmsAuditLog::query()->create([
            'actorId' => $request?->user()?->getKey() ? (string) $request->user()->getKey() : null,
            'event' => $event,
            'resourceType' => $resourceType,
            'resourceId' => $resourceId,
            'requestId' => $request?->header('X-Request-ID'),
            'ip' => $request?->ip(),
            'metadata' => $metadata,
            'createdAt' => now(),
        ]);
    }
}
