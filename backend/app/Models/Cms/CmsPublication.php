<?php

namespace App\Models\Cms;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Immutable public snapshot per source revision (spec 4.3).
 * Sole source for public delivery; never written from admin forms.
 */
class CmsPublication extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'cms_publications';

    public $timestamps = false;

    protected $fillable = [
        'entryId', 'type', 'key', 'slug', 'locale',
        'publicData', 'publicSeo', 'sourceRevision', 'schemaVersion',
        'publishedAt', 'referencedIds', 'active',
    ];

    protected $guarded = ['_id'];

    protected function casts(): array
    {
        // Native BSON arrays — no `array` casts (see CmsEntry).
        return [
            'sourceRevision' => 'integer',
            'schemaVersion' => 'integer',
            'publishedAt' => 'datetime',
            'active' => 'boolean',
        ];
    }
}
