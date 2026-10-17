<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Application\Services\AuditService;
use App\Domain\Content\SchemaRegistry;
use App\Http\Controllers\Controller;
use App\Models\Cms\CmsGlobal;
use App\Models\Cms\CmsOutbox;
use App\Models\Cms\CmsPublication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Singleton site-configuration drafts (spec 7.4). Drafts here never affect
 * the public site until published into `cms_publications` (type=global).
 */
class GlobalController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function show(Request $request, string $key): JsonResponse
    {
        $this->authorizeGlobal($request, $key);

        $global = $this->findGlobal($key, $this->locale($request));

        if (! $global) {
            abort(404);
        }

        return response()->json(['data' => $this->present($global)]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $this->authorizeGlobal($request, $key, 'edit-content');

        $data = $request->validate([
            'data' => ['required', 'array'],
            'expectedRevision' => ['required', 'integer', 'min:0'],
        ]);

        $global = $this->findGlobal($key, $this->locale($request));

        if ($global && $global->revision !== (int) $data['expectedRevision']) {
            abort(409, 'Stale revision. Reload and retry.');
        }

        if (! $global) {
            $global = new CmsGlobal([
                'key' => $key,
                'locale' => $this->locale($request),
                'revision' => 0,
            ]);
        }

        $global->data = $data['data'];
        $global->revision = $global->revision + 1;
        $global->updatedBy = (string) $request->user()->getKey();
        $global->save();

        $this->audit->record('global.saved_draft', 'global', $key, [
            'revision' => $global->revision,
        ], $request);

        return response()->json(['data' => $this->present($global->fresh())]);
    }

    public function publish(Request $request, string $key): JsonResponse
    {
        $this->authorizeGlobal($request, $key, 'publish');

        $data = $request->validate([
            'expectedRevision' => ['required', 'integer', 'min:1'],
        ]);

        $locale = $this->locale($request);
        $global = CmsGlobal::query()->where('key', $key)->where('locale', $locale)->firstOrFail();

        if ($global->revision !== (int) $data['expectedRevision']) {
            abort(409, 'Stale revision. Reload and retry.');
        }

        $operationId = $request->header('Idempotency-Key') ?: 'op_'.Str::uuid()->toString();

        if (! CmsOutbox::query()->where('idempotencyKey', $operationId)->exists()) {
            CmsPublication::query()->updateOrCreate(
                ['type' => 'global', 'locale' => $locale, 'key' => $key],
                [
                    'entryId' => null,
                    'type' => 'global',
                    'key' => $key,
                    'slug' => null,
                    'locale' => $locale,
                    'publicData' => $global->data ?? [],
                    'publicSeo' => [],
                    'sourceRevision' => $global->revision,
                    'schemaVersion' => 1,
                    'publishedAt' => now(),
                    'referencedIds' => [],
                    'active' => true,
                ],
            );

            CmsOutbox::query()->create([
                'kind' => 'next.revalidate',
                'payload' => [
                    'operationId' => $operationId,
                    'type' => 'global',
                    'locale' => $locale,
                    'key' => $key,
                    'revision' => $global->revision,
                    'event' => 'published',
                ],
                'status' => CmsOutbox::STATUS_PENDING,
                'attempts' => 0,
                'nextAttemptAt' => now(),
                'lastErrorCode' => null,
                'idempotencyKey' => $operationId,
                'createdAt' => now(),
            ]);
        }

        $this->audit->record('global.published', 'global', $key, [
            'revision' => $global->revision,
            'operationId' => $operationId,
        ], $request);

        return response()->json(['data' => [
            'operationId' => $operationId,
            'publishedRevision' => $global->revision,
            'status' => CmsOutbox::STATUS_PENDING,
        ]], 202);
    }

    private function authorizeGlobal(Request $request, string $key, string $ability = 'view-admin'): void
    {
        if (! in_array($key, SchemaRegistry::GLOBAL_KEYS, true)) {
            abort(404);
        }

        if ($request->user()->cannot($ability)) {
            abort(403);
        }
    }

    private function findGlobal(string $key, string $locale): ?CmsGlobal
    {
        return CmsGlobal::query()->where('key', $key)->where('locale', $locale)->first();
    }

    private function locale(Request $request): string
    {
        $locale = (string) ($request->input('locale') ?? config('cms.default_locale', 'en'));

        return $locale !== '' ? $locale : 'en';
    }

    /**
     * @return array<string, mixed>
     */
    private function present(CmsGlobal $global): array
    {
        return [
            'key' => $global->key,
            'locale' => $global->locale,
            'data' => $global->data ?? [],
            'revision' => $global->revision,
            'updatedAt' => $global->updated_at?->toISOString(),
        ];
    }
}
