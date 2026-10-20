<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Application\Services\MediaService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\IssueUploadRequest;
use App\Http\Requests\Api\V1\Admin\UpdateMediaRequest;
use App\Http\Resources\Api\V1\MediaResource;
use App\Models\Cms\CmsMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use MongoDB\BSON\ObjectId;

/**
 * Media library over presigned direct uploads (spec 7.5, 6.2).
 */
class MediaController extends Controller
{
    public function __construct(private readonly MediaService $media) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user()->cannot('upload-media')) {
            abort(403);
        }

        $limit = min((int) $request->input('limit', 20), 100);

        $query = CmsMedia::query()
            ->where('status', '!=', CmsMedia::STATUS_DELETED)
            ->orderBy('created_at', 'desc');

        if ($request->filled('mimeType')) {
            $query->where('mimeType', 'like', $request->input('mimeType').'%');
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($inner) use ($q) {
                $inner->where('alt', 'like', "%{$q}%")
                    ->orWhere('filename', 'like', "%{$q}%");
            });
        }

        $items = $query->paginate($limit);

        $items->getCollection()->transform(fn (CmsMedia $media) => array_merge(
            (new MediaResource($media))->toArray($request),
            ['url' => $media->status === CmsMedia::STATUS_READY ? $this->media->publicUrl($media) : null],
        ));

        return response()->json([
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function issueUpload(IssueUploadRequest $request): JsonResponse
    {
        $result = $this->media->issueUpload(
            $request->validated(),
            (string) $request->user()->getKey(),
        );

        return response()->json(['data' => [
            'uploadId' => (string) $result['media']->getKey(),
            'uploadUrl' => $result['uploadUrl'],
            'uploadHeaders' => $result['uploadHeaders'],
            'expiresAt' => $result['expiresAt'],
            'asset' => new MediaResource($result['media']),
        ]], 201);
    }

    public function complete(Request $request, string $id): JsonResponse
    {
        if ($request->user()->cannot('upload-media')) {
            abort(403);
        }

        $media = $this->findMedia($id);
        $media = $this->media->completeUpload($media, (string) $request->user()->getKey(), $request);

        return response()->json(['data' => [
            'asset' => new MediaResource($media),
            'url' => $this->media->publicUrl($media),
        ]]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        if ($request->user()->cannot('upload-media')) {
            abort(403);
        }

        $media = $this->findMedia($id);

        return response()->json(['data' => [
            'asset' => new MediaResource($media),
            'url' => $media->status === CmsMedia::STATUS_READY ? $this->media->publicUrl($media) : null,
        ]]);
    }

    public function update(UpdateMediaRequest $request, string $id): JsonResponse
    {
        $media = $this->findMedia($id);
        $media->fill($request->validated());
        $media->save();

        return response()->json(['data' => new MediaResource($media->fresh())]);
    }

    public function destroy(Request $request, string $id): Response
    {
        if ($request->user()->cannot('upload-media')) {
            abort(403);
        }

        $media = $this->findMedia($id);
        $this->media->softDelete($media, (string) $request->user()->getKey(), $request);

        return response()->noContent();
    }

    public function restore(Request $request, string $id): JsonResponse
    {
        if ($request->user()->cannot('upload-media')) {
            abort(403);
        }

        $media = $this->media->restore($this->findMedia($id));

        return response()->json(['data' => new MediaResource($media)]);
    }

    private function findMedia(string $id): CmsMedia
    {
        $key = preg_match('/^[0-9a-f]{24}$/i', $id) ? new ObjectId($id) : $id;

        return CmsMedia::query()->where('_id', $key)->firstOrFail();
    }
}
