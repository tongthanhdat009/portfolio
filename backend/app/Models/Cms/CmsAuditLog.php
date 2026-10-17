<?php

namespace App\Models\Cms;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Append-only audit trail (spec 4.4). Full content text never lands here —
 * summaries and diff metadata only, secrets redacted by callers.
 */
class CmsAuditLog extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'cms_audit_logs';

    public $timestamps = false;

    protected $fillable = [
        'actorId', 'event', 'resourceType', 'resourceId',
        'requestId', 'ip', 'metadata', 'createdAt',
    ];

    protected $guarded = ['_id'];

    protected function casts(): array
    {
        // Native BSON metadata — no `array` cast (see CmsEntry).
        return [
            'createdAt' => 'datetime',
        ];
    }
}
