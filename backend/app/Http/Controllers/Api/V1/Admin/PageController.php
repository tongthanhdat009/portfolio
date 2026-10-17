<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Application\Services\ContentService;
use App\Domain\Content\SchemaRegistry;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\EntryResource;
use App\Models\Cms\CmsEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Page-builder aliases over page entries (spec 7.4): load/save ordered
 * section blocks by page key. Canonical block types enforced by the registry.
 */
class PageController extends Controller
{
    public function __construct(private readonly ContentService $content) {}

    public function show(Request $request, string $key): JsonResponse
    {
        $this->authorize('viewAny', CmsEntry::class);
        $this->assertPageKey($key);

        return response()->json(['data' => new EntryResource($this->findPage($key, $this->locale($request)))]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $this->assertPageKey($key);

        $data = $request->validate([
            'expectedRevision' => ['required', 'integer', 'min:1'],
            'changeSummary' => ['nullable', 'string', 'max:500'],
            'title' => ['sometimes', 'string', 'max:255'],
            'blocks' => ['sometimes', 'required', 'array', 'max:40'],
            'blocks.*.id' => ['required', 'string', 'max:64'],
            'blocks.*.type' => ['required', 'string', 'in:'.implode(',', SchemaRegistry::BLOCK_TYPES)],
            'blocks.*.enabled' => ['nullable', 'boolean'],
            'blocks.*.order' => ['nullable', 'integer', 'min:0'],
            'blocks.*.props' => ['nullable', 'array'],
            'blocks.*.references' => ['nullable', 'array'],
            'blocks.*.references.*' => ['string', 'max:64'],
            'blocks.*.visualVariant' => ['nullable', 'string', 'max:60'],
            'blocks.*.schemaVersion' => ['nullable', 'integer', 'min:1'],
        ]);

        $entry = $this->findPage($key, $this->locale($request));
        $this->authorize('update', $entry);

        $expectedRevision = (int) $data['expectedRevision'];
        unset($data['expectedRevision']);

        $payload = [];

        if (array_key_exists('title', $data)) {
            $payload['title'] = $data['title'];
        }

        if (array_key_exists('blocks', $data)) {
            $payload['data'] = array_merge($entry->data ?? [], ['blocks' => $data['blocks']]);
        }

        $entry = $this->content->saveDraft(
            $entry,
            $payload,
            $expectedRevision,
            (string) $request->user()->getKey(),
            $request,
        );

        return response()->json(['data' => new EntryResource($entry)]);
    }

    private function assertPageKey(string $key): void
    {
        if (! in_array($key, SchemaRegistry::PAGE_KEYS, true)) {
            abort(404);
        }
    }

    private function findPage(string $key, string $locale): CmsEntry
    {
        return CmsEntry::query()
            ->where('type', CmsEntry::TYPE_PAGE)
            ->where('key', $key)
            ->where('locale', $locale)
            ->firstOrFail();
    }

    private function locale(Request $request): string
    {
        $locale = (string) ($request->input('locale') ?? config('cms.default_locale', 'en'));

        return $locale !== '' ? $locale : 'en';
    }
}
