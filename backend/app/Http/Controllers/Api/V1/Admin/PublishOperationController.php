<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Application\Services\AuditService;
use App\Http\Controllers\Controller;
use App\Models\Cms\CmsOutbox;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Publish-operation tracking and idempotent retry (spec 7.7).
 * The queue worker (P8) claims pending rows; until then retry only
 * re-arms them — delivery state is never faked as done.
 */
class PublishOperationController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user()->cannot('view-audit')) {
            abort(403);
        }

        $operations = CmsOutbox::query()->orderBy('createdAt', 'desc')->paginate(50);

        return response()->json([
            'data' => collect($operations->items())->map(fn (CmsOutbox $o) => [
                'id' => (string) $o->getKey(),
                'kind' => $o->kind,
                'status' => $o->status,
                'attempts' => $o->attempts,
                'lastErrorCode' => $o->lastErrorCode,
                'nextAttemptAt' => $o->nextAttemptAt?->toISOString(),
                'createdAt' => $o->createdAt?->toISOString(),
            ]),
            'meta' => [
                'current_page' => $operations->currentPage(),
                'last_page' => $operations->lastPage(),
                'total' => $operations->total(),
            ],
        ]);
    }

    public function retry(Request $request, string $id): JsonResponse
    {
        if ($request->user()->cannot('view-audit')) {
            abort(403);
        }

        $operation = CmsOutbox::query()->findOrFail($id);
        $operation->status = CmsOutbox::STATUS_PENDING;
        $operation->nextAttemptAt = now();
        $operation->lastErrorCode = null;
        $operation->save();

        $this->audit->record('outbox.retried', 'outbox', $id, [
            'attempts' => $operation->attempts,
        ], $request);

        return response()->json(['data' => ['id' => $id, 'status' => $operation->status]]);
    }
}
