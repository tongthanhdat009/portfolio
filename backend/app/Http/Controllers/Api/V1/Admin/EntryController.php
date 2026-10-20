<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Application\Services\ContentService;
use App\Application\Services\PublishService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\PublishRequest;
use App\Http\Requests\Api\V1\Admin\StoreEntryRequest;
use App\Http\Requests\Api\V1\Admin\UpdateEntryRequest;
use App\Http\Resources\Api\V1\EntryResource;
use App\Models\Cms\CmsEntry;
use App\Models\Cms\CmsRevision;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use MongoDB\BSON\ObjectId;

/**
 * Draft CRUD, revisions, publish pipeline, auth-only preview (spec 7.3).
 */
class EntryController extends Controller
{
    public function __construct(
        private readonly ContentService $content,
        private readonly PublishService $publisher,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CmsEntry::class);

        $limit = min((int) $request->input('limit', 20), 100);

        $query = CmsEntry::query();

        if ($request->input('sort') === 'order') {
            $query->orderBy('sortOrder', 'asc')->orderBy('updated_at', 'desc');
        } else {
            $query->orderBy('updated_at', 'desc');
        }

        foreach (['type', 'locale'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        $status = $request->input('status');
        if (is_array($status)) {
            $query->whereIn('status', array_values($status));
        } elseif ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $cat = (string) $request->input('category');
            $query->where(function ($inner) use ($cat) {
                $inner->where('data.category', $cat)->orWhere('data.type', $cat);
            });
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($inner) use ($q) {
                $inner->where('title', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhere('data.tags', 'regexp', '/'.preg_quote($q, '/').'/i');
            });
        }

        $entries = $query->paginate($limit);

        return EntryResource::collection($entries)->response();
    }

    public function store(StoreEntryRequest $request): JsonResponse
    {
        $entry = $this->content->create(
            $request->validated(),
            (string) $request->user()->getKey(),
        );

        return response()->json(['data' => new EntryResource($entry)], 201);
    }

    public function show(string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('view', $entry);

        return response()->json(['data' => new EntryResource($entry)]);
    }

    public function update(UpdateEntryRequest $request, string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('update', $entry);

        $validated = $request->validated();
        $expectedRevision = (int) $validated['expectedRevision'];
        unset($validated['expectedRevision']);

        $entry = $this->content->saveDraft(
            $entry,
            $validated,
            $expectedRevision,
            (string) $request->user()->getKey(),
            $request,
        );

        return response()->json(['data' => new EntryResource($entry)]);
    }

    public function archive(Request $request, string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('archive', $entry);

        $entry = $this->content->archive($entry, (string) $request->user()->getKey(), $request);

        return response()->json(['data' => new EntryResource($entry)]);
    }

    public function restore(Request $request, string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('archive', $entry);

        $entry = $this->content->restore($entry, (string) $request->user()->getKey(), $request);

        return response()->json(['data' => new EntryResource($entry)]);
    }

    public function revisions(string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('view', $entry);

        $revisions = CmsRevision::query()
            ->where('entryId', (string) $entry->getKey())
            ->orderBy('revision', 'desc')
            ->paginate(50);

        return response()->json([
            'data' => collect($revisions->items())->map(fn (CmsRevision $r) => [
                'revision' => $r->revision,
                'actorId' => $r->actorId,
                'changeSummary' => $r->changeSummary,
                'createdAt' => $r->createdAt?->toISOString(),
            ]),
            'meta' => [
                'current_page' => $revisions->currentPage(),
                'last_page' => $revisions->lastPage(),
                'total' => $revisions->total(),
            ],
        ]);
    }

    public function showRevision(string $id, int $revision): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('view', $entry);

        $snapshot = CmsRevision::query()
            ->where('entryId', (string) $entry->getKey())
            ->where('revision', $revision)
            ->firstOrFail();

        return response()->json(['data' => [
            'revision' => $snapshot->revision,
            'snapshot' => $snapshot->snapshot,
            'actorId' => $snapshot->actorId,
            'changeSummary' => $snapshot->changeSummary,
            'createdAt' => $snapshot->createdAt?->toISOString(),
        ]]);
    }

    public function restoreRevision(Request $request, string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('update', $entry);

        $data = $request->validate(['revision' => ['required', 'integer', 'min:1']]);

        $entry = $this->content->restoreRevision(
            $entry,
            (int) $data['revision'],
            (string) $request->user()->getKey(),
            $request,
        );

        return response()->json(['data' => new EntryResource($entry)]);
    }

    public function publish(PublishRequest $request, string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('publish', $entry);

        $result = $this->publisher->publish(
            $entry,
            (int) $request->validated('expectedRevision'),
            (string) $request->user()->getKey(),
            $request->header('Idempotency-Key'),
            $request,
        );

        return response()->json(['data' => $result], 202);
    }

    public function unpublish(Request $request, string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('publish', $entry);

        $result = $this->publisher->unpublish(
            $entry,
            (string) $request->user()->getKey(),
            $request->header('Idempotency-Key'),
            $request,
        );

        return response()->json(['data' => $result], 202);
    }

    public function previewSession(Request $request, string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('preview', $entry);

        $token = Str::random(64);
        $ttl = (int) config('cms.preview_ttl_minutes', 15);

        Cache::put("preview:{$token}", [
            'entryId' => (string) $entry->getKey(),
            'revision' => $entry->revision,
            'userId' => (string) $request->user()->getKey(),
        ], now()->addMinutes($ttl));

        return response()->json(['data' => [
            'token' => $token,
            'expiresAt' => now()->addMinutes($ttl)->toISOString(),
        ]], 201);
    }

    public function previewData(Request $request, string $id): JsonResponse
    {
        $entry = $this->findEntry($id);
        $this->authorize('preview', $entry);

        $ticket = Cache::get('preview:'.(string) $request->input('token'));

        if (! is_array($ticket) || ($ticket['entryId'] ?? null) !== (string) $entry->getKey()) {
            abort(403, 'Invalid or expired preview token.');
        }

        return response()->json(['data' => new EntryResource($entry)]);
    }

    private function findEntry(string $id): CmsEntry
    {
        $key = preg_match('/^[0-9a-f]{24}$/i', $id) ? new ObjectId($id) : $id;

        return CmsEntry::query()->where('_id', $key)->firstOrFail();
    }
}
