<?php

namespace App\Domain\Content;

/**
 * Canonical content-type and block registry (spec 4.5).
 * Canonical page-block names from admin spec 5.5; legacy aliases map here
 * for migrating old content only — new data must use canonical keys.
 */
class SchemaRegistry
{
    public const ENTRY_TYPES = [
        'page', 'project', 'capability', 'skill',
        'experience', 'experiment', 'note', 'global',
    ];

    public const BLOCK_TYPES = [
        'announcement', 'hero_poster', 'marquee', 'about_manifesto',
        'capability_grid', 'featured_work', 'toolbox', 'journey',
        'experiment_grid', 'notes_grid', 'contact_poster',
    ];

    public const LEGACY_BLOCK_ALIASES = [
        'hero' => 'hero_poster',
        'featuredWork' => 'featured_work',
        'capabilityMarquee' => 'marquee',
    ];

    public const PAGE_KEYS = ['home', 'about', 'contact'];

    public const GLOBAL_KEYS = ['site', 'navigation', 'footer', 'seo'];

    public const STATUSES = ['draft', 'published', 'archived'];

    /**
     * Validation rules for the `data` payload of each entry type.
     * Unknown types fall back to a generic array shape.
     *
     * @return array<string, mixed>
     */
    public static function dataRules(string $type): array
    {
        return match ($type) {
            'project' => [
                'data.summary' => ['nullable', 'string', 'max:2000'],
                'data.body' => ['nullable', 'string'],
                'data.coverMediaId' => ['nullable', 'string', 'max:64'],
                'data.galleryMediaIds' => ['nullable', 'array', 'max:20'],
                'data.galleryMediaIds.*' => ['string', 'max:64'],
                'data.links' => ['nullable', 'array'],
                'data.links.*.label' => ['required_with:data.links', 'string', 'max:120'],
                'data.links.*.url' => ['required_with:data.links', 'string', 'max:2048'],
                'data.techStack' => ['nullable', 'array', 'max:30'],
                'data.techStack.*' => ['string', 'max:60'],
                // Admin project editor + GitHub sync payload (spec: editor owns
                // these keys; parent `array` rules pass each subtree through).
                'data.title' => ['nullable', 'string', 'max:255'],
                'data.slug' => ['nullable', 'string', 'max:180'],
                'data.year' => ['nullable', 'string', 'max:12'],
                'data.index' => ['nullable', 'string', 'max:12'],
                'data.category' => ['nullable', 'string', 'max:60'],
                'data.accent' => ['nullable', 'string', 'max:20'],
                'data.tags' => ['nullable', 'array', 'max:30'],
                'data.tags.*' => ['string', 'max:60'],
                'data.status' => ['nullable', 'string', 'max:30'],
                'data.featured' => ['nullable', 'boolean'],
                'data.demoUrl' => ['nullable', 'string', 'max:2048'],
                'data.repoUrl' => ['nullable', 'string', 'max:2048'],
                'data.coverImage' => ['nullable', 'string', 'max:2048'],
                'data.coverAlt' => ['nullable', 'string', 'max:255'],
                'data.caseStudy' => ['nullable', 'array'],
            ],
            'page' => [
                'data.blocks' => ['present', 'array', 'max:40'],
                'data.blocks.*.id' => ['required', 'string', 'max:64'],
                'data.blocks.*.type' => ['required', 'string', 'in:'.implode(',', self::BLOCK_TYPES)],
                'data.blocks.*.enabled' => ['nullable', 'boolean'],
                'data.blocks.*.order' => ['nullable', 'integer', 'min:0'],
                'data.blocks.*.props' => ['nullable', 'array'],
                'data.blocks.*.references' => ['nullable', 'array'],
                'data.blocks.*.references.*' => ['string', 'max:64'],
                'data.blocks.*.visualVariant' => ['nullable', 'string', 'max:60'],
                'data.blocks.*.schemaVersion' => ['nullable', 'integer', 'min:1'],
            ],
            default => [
                'data' => ['nullable', 'array'],
            ],
        };
    }

    public static function requiresSlug(string $type): bool
    {
        return in_array($type, ['project', 'note', 'experiment'], true);
    }

    public static function requiresKey(string $type): bool
    {
        return in_array($type, ['page', 'global'], true);
    }
}
