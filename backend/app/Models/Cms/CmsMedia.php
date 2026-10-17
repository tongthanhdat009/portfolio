<?php

namespace App\Models\Cms;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Asset metadata (spec 4.4). Binary bytes live in object storage, never here.
 */
class CmsMedia extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'cms_media';

    public const STATUS_PENDING = 'pending';

    public const STATUS_READY = 'ready';

    public const STATUS_DELETED = 'deleted';

    protected $fillable = [
        'filename', 'storageKey', 'disk', 'bucket', 'mimeType', 'size',
        'width', 'height', 'alt', 'caption', 'tags',
        'visibility', 'status', 'checksum', 'uploadedBy', 'usedByCount',
        'deletedAt',
    ];

    protected $guarded = ['_id'];

    protected function casts(): array
    {
        // Native BSON tags — no `array` cast (see CmsEntry).
        return [
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'usedByCount' => 'integer',
            'deletedAt' => 'datetime',
        ];
    }
}
