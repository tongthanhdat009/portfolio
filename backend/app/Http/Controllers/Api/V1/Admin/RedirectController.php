<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Application\Services\AuditService;
use App\Http\Controllers\Controller;
use App\Models\Cms\CmsRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Slug-history management (spec 7.4). Guards against self-links and
 * two-node circular chains at write time.
 */
class RedirectController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user()->cannot('edit-content')) {
            abort(403);
        }

        $redirects = CmsRedirect::query()->orderBy('createdAt', 'desc')->paginate(50);

        return response()->json([
            'data' => collect($redirects->items())->map(fn (CmsRedirect $r) => [
                'id' => (string) $r->getKey(),
                'locale' => $r->locale,
                'fromPath' => $r->fromPath,
                'toPath' => $r->toPath,
            ]),
            'meta' => [
                'current_page' => $redirects->currentPage(),
                'last_page' => $redirects->lastPage(),
                'total' => $redirects->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->cannot('edit-content')) {
            abort(403);
        }

        $data = $request->validate([
            'locale' => ['nullable', 'string', 'max:12'],
            'fromPath' => ['required', 'string', 'max:500', 'starts_with:/'],
            'toPath' => ['required', 'string', 'max:500', 'starts_with:/', 'different:fromPath'],
        ]);

        $locale = $data['locale'] ?? config('cms.default_locale', 'en');

        $circular = CmsRedirect::query()
            ->where('locale', $locale)
            ->where('fromPath', $data['toPath'])
            ->where('toPath', $data['fromPath'])
            ->exists();

        if ($circular) {
            abort(422, 'Redirect would create a circular chain.');
        }

        $redirect = CmsRedirect::query()->firstOrCreate(
            ['locale' => $locale, 'fromPath' => $data['fromPath']],
            ['toPath' => $data['toPath'], 'createdAt' => now()],
        );

        $this->audit->record('redirect.created', 'redirect', (string) $redirect->getKey(), [
            'fromPath' => $redirect->fromPath,
            'toPath' => $redirect->toPath,
        ], $request);

        return response()->json(['data' => [
            'id' => (string) $redirect->getKey(),
            'locale' => $redirect->locale,
            'fromPath' => $redirect->fromPath,
            'toPath' => $redirect->toPath,
        ]], 201);
    }

    public function destroy(Request $request, string $id): Response
    {
        if ($request->user()->cannot('edit-content')) {
            abort(403);
        }

        $redirect = CmsRedirect::query()->findOrFail($id);
        $redirect->delete();

        $this->audit->record('redirect.deleted', 'redirect', $id, [], $request);

        return response()->noContent();
    }
}
