<?php

namespace App\Models\Cms;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Immutable per-revision snapshot (spec 4.4). Unique (entryId, revision).
 */
class CmsRevision extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'cms_revisions';

    public $timestamps = false;

    protected $fillable = [
        'entryId', 'revision', 'snapshot', 'actorId', 'changeSummary', 'createdAt',
    ];

    protected $guarded = ['_id'];

    protected function casts(): array
    {
        // Native BSON snapshot — no `array` cast (see CmsEntry).
        return [
            'revision' => 'integer',
            'createdAt' => 'datetime',
        ];
    }
}
