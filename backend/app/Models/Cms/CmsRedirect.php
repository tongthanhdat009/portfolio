<?php

namespace App\Models\Cms;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Slug history / URL migrations (spec 4.4). Unique (locale, fromPath).
 */
class CmsRedirect extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'cms_redirects';

    public $timestamps = false;

    protected $fillable = ['locale', 'fromPath', 'toPath', 'entryId', 'createdAt'];

    protected $guarded = ['_id'];

    protected function casts(): array
    {
        return ['createdAt' => 'datetime'];
    }
}
