<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Relations\MorphTo;
use Laravel\Sanctum\Contracts\HasAbilities;
use MongoDB\Laravel\Eloquent\Model;

/**
 * Sanctum personal access tokens on MongoDB (spec 4.1 `cms_*` stores).
 * Mirrors Sanctum's SQL model 1:1 minus migrations: same token format
 * (`{id}|{secret}`, sha256), same lookup, abilities stored as native BSON.
 */
class CmsPersonalAccessToken extends Model implements HasAbilities
{
    protected $connection = 'mongodb';

    protected $table = 'personal_access_tokens';

    protected $fillable = [
        'name',
        'token',
        'abilities',
        'expires_at',
    ];

    protected $hidden = [
        'token',
    ];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function tokenable(): MorphTo
    {
        return $this->morphTo('tokenable');
    }

    public static function findToken($token)
    {
        if (strpos($token, '|') === false) {
            return static::where('token', hash('sha256', $token))->first();
        }

        [$id, $secret] = explode('|', $token, 2);

        if ($instance = static::query()->where('_id', self::keyFor($id))->first()) {
            return hash_equals((string) $instance->token, hash('sha256', $secret)) ? $instance : null;
        }

        return null;
    }

    public function can($ability)
    {
        return in_array('*', (array) $this->abilities, true) ||
            in_array($ability, (array) $this->abilities, true);
    }

    public function cant($ability)
    {
        return ! $this->can($ability);
    }

    private static function keyFor(string $id): mixed
    {
        if (preg_match('/^[0-9a-f]{24}$/i', $id)) {
            return new \MongoDB\BSON\ObjectId($id);
        }

        return $id;
    }
}
