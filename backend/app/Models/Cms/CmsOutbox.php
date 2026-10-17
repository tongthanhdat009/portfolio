<?php

namespace App\Models\Cms;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Revalidation / webhook delivery outbox (spec 4.4). Worker claims pending
 * rows idempotently; unique idempotencyKey per event.
 */
class CmsOutbox extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'cms_outbox';

    public $timestamps = false;

    public const STATUS_PENDING = 'pending';

    public const STATUS_DELIVERED = 'delivered';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'kind', 'payload', 'status', 'attempts',
        'nextAttemptAt', 'lastErrorCode', 'idempotencyKey', 'createdAt',
    ];

    protected $guarded = ['_id'];

    protected function casts(): array
    {
        // Native BSON payload — no `array` cast (see CmsEntry).
        return [
            'attempts' => 'integer',
            'nextAttemptAt' => 'datetime',
            'createdAt' => 'datetime',
        ];
    }
}
