<?php

namespace App\Models\Cms;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Singleton site configuration drafts (spec 4.1). Public effect only via
 * published snapshots in `cms_publications` (type=global).
 */
class CmsGlobal extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'cms_globals';

    protected $fillable = [
        'key', 'locale', 'data', 'revision', 'updatedBy',
    ];

    protected $guarded = ['_id'];

    protected function casts(): array
    {
        // Native BSON data — no `array` cast (see CmsEntry).
        return [
            'revision' => 'integer',
        ];
    }
}
