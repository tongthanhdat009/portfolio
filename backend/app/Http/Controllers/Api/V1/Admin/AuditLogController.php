<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cms\CmsAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Owner-only audit trail reads (spec 7.7). Summaries only — full content
 * text is never stored here (see AuditService).
 */
class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->user()->cannot('view-audit')) {
            abort(403);
        }

        $query = CmsAuditLog::query()->orderBy('createdAt', 'desc');

        foreach (['event', 'resourceType', 'resourceId', 'actorId'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        $logs = $query->paginate(50);

        return response()->json([
            'data' => collect($logs->items())->map(fn (CmsAuditLog $log) => [
                'id' => (string) $log->getKey(),
                'actorId' => $log->actorId,
                'event' => $log->event,
                'resourceType' => $log->resourceType,
                'resourceId' => $log->resourceId,
                'requestId' => $log->requestId,
                'metadata' => $log->metadata ?? [],
                'createdAt' => $log->createdAt?->toISOString(),
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
