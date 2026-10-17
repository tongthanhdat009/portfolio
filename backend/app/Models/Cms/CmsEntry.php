<?php

namespace App\Models\Cms;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Draft + lifecycle source (spec 4.2). Never read directly by public routes.
 */
class CmsEntry extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'cms_entries';

    public const TYPE_PAGE = 'page';

    public const TYPE_PROJECT = 'project';

    public const TYPE_CAPABILITY = 'capability';

    public const TYPE_SKILL = 'skill';

    public const TYPE_EXPERIENCE = 'experience';

    public const TYPE_EXPERIMENT = 'experiment';

    public const TYPE_NOTE = 'note';

    public const TYPE_GLOBAL = 'global';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'type', 'key', 'locale', 'slug', 'title', 'status',
        'data', 'seo', 'references', 'featured', 'sortOrder',
        'schemaVersion', 'revision',
        'createdBy', 'updatedBy', 'publishedAt', 'lastPublishedRevision',
        'archivedAt',
    ];

    protected $guarded = ['_id'];

    protected function casts(): array
    {
        // Document models store native BSON arrays — never cast them to
        // `array` (that would persist JSON-encoded strings instead).
        return [
            'featured' => 'boolean',
            'sortOrder' => 'integer',
            'schemaVersion' => 'integer',
            'revision' => 'integer',
            'lastPublishedRevision' => 'integer',
            'publishedAt' => 'datetime',
            'archivedAt' => 'datetime',
        ];
    }

    public function hasUnpublishedChanges(): bool
    {
        return $this->revision !== $this->lastPublishedRevision;
    }

    public function routePath(): ?string
    {
        $prefix = match ($this->type) {
            self::TYPE_PROJECT => '/work',
            self::TYPE_NOTE => '/notes',
            self::TYPE_EXPERIMENT => '/lab',
            default => null,
        };

        if ($prefix === null || $this->slug === null) {
            return null;
        }

        return $prefix.'/'.$this->slug;
    }
}
