<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\PublicationResource;
use App\Models\Cms\CmsPublication;
use App\Models\Cms\CmsRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only delivery over `cms_publications` only (spec 7.6).
 * Never sessions, never drafts, never revisions.
 */
class DeliveryController extends Controller
{
    public function page(Request $request, string $key): JsonResponse
    {
        return $this->one('page', null, $key, $request);
    }

    public function projects(Request $request): JsonResponse
    {
        return $this->many('project', $request);
    }

    public function project(Request $request, string $slug): JsonResponse
    {
        return $this->one('project', $slug, null, $request);
    }

    public function notes(Request $request): JsonResponse
    {
        return $this->many('note', $request);
    }

    public function note(Request $request, string $slug): JsonResponse
    {
        return $this->one('note', $slug, null, $request);
    }

    public function experiments(Request $request): JsonResponse
    {
        return $this->many('experiment', $request);
    }

    public function capabilities(Request $request): JsonResponse
    {
        return $this->many('capability', $request);
    }

    public function skills(Request $request): JsonResponse
    {
        return $this->many('skill', $request);
    }

    public function experiences(Request $request): JsonResponse
    {
        return $this->many('experience', $request);
    }

    public function globals(Request $request): JsonResponse
    {
        $locale = $this->locale($request);

        $globals = CmsPublication::query()
            ->where('type', 'global')
            ->where('locale', $locale)
            ->where('active', true)
            ->orderBy('key')
            ->get();

        return response()->json([
            'data' => $globals->mapWithKeys(fn (CmsPublication $p) => [
                $p->key => (new PublicationResource($p))->toArray($request),
            ]),
        ]);
    }

    public function resolveRedirect(Request $request): JsonResponse
    {
        $data = $request->validate(['path' => ['required', 'string', 'max:500']]);

        $redirect = CmsRedirect::query()
            ->where('locale', $this->locale($request))
            ->where('fromPath', $data['path'])
            ->firstOrFail();

        return response()->json(['data' => ['toPath' => $redirect->toPath]]);
    }

    private function one(string $type, ?string $slug, ?string $key, Request $request): JsonResponse
    {
        $query = CmsPublication::query()
            ->where('type', $type)
            ->where('locale', $this->locale($request))
            ->where('active', true);

        if ($slug !== null) {
            $query->where('slug', $slug);
        } else {
            $query->where('key', $key);
        }

        return response()->json(['data' => new PublicationResource($query->firstOrFail())]);
    }

    private function many(string $type, Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 20), 100);

        $publications = CmsPublication::query()
            ->where('type', $type)
            ->where('locale', $this->locale($request))
            ->where('active', true)
            ->orderBy('publishedAt', 'desc')
            ->paginate($limit);

        return PublicationResource::collection($publications)->response();
    }

    private function locale(Request $request): string
    {
        $locale = (string) $request->input('locale', config('cms.default_locale', 'en'));

        return $locale !== '' ? $locale : 'en';
    }
}
