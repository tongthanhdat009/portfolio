<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Content\SchemaRegistry;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Content-type / block registry for admin form generation (spec 7.3).
 */
class ContentTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('view-admin', \App\Models\Cms\CmsEntry::class);

        return response()->json(['data' => [
            'entryTypes' => SchemaRegistry::ENTRY_TYPES,
            'blockTypes' => SchemaRegistry::BLOCK_TYPES,
            'legacyBlockAliases' => SchemaRegistry::LEGACY_BLOCK_ALIASES,
            'pageKeys' => SchemaRegistry::PAGE_KEYS,
            'globalKeys' => SchemaRegistry::GLOBAL_KEYS,
            'statuses' => SchemaRegistry::STATUSES,
            'defaultLocale' => config('cms.default_locale', 'en'),
        ]]);
    }
}
