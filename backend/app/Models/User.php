<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Auth\User as Authenticatable;

/**
 * CMS identity (spec 4.1 `cms_users`, 9.2 role matrix).
 * MVP seeds Owner via `php artisan cms:create-owner`; no public registration.
 */
class User extends Authenticatable
{
    use HasApiTokens;
    protected $connection = 'mongodb';

    protected $table = 'cms_users';

    public const ROLE_OWNER = 'owner';

    public const ROLE_EDITOR = 'editor';

    public const ROLE_VIEWER = 'viewer';

    #[Fillable(['name', 'email', 'password', 'role', 'can_publish', 'can_preview'])]
    #[Hidden(['password', 'remember_token'])]
    protected $guarded = ['_id'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'can_publish' => 'boolean',
            'can_preview' => 'boolean',
        ];
    }

    public function isOwner(): bool
    {
        return $this->role === self::ROLE_OWNER;
    }

    public function isEditor(): bool
    {
        return $this->role === self::ROLE_EDITOR;
    }

    public function canEditContent(): bool
    {
        return $this->isOwner() || $this->isEditor();
    }

    public function canPublish(): bool
    {
        return $this->isOwner() || ($this->isEditor() && (bool) $this->can_publish);
    }

    public function canPreview(): bool
    {
        return $this->canEditContent() || (bool) $this->can_preview;
    }

    /**
     * Capability strings exposed to the admin UI (server is source of truth).
     *
     * @return string[]
     */
    public function capabilities(): array
    {
        $caps = ['view-admin'];

        if ($this->canEditContent()) {
            $caps[] = 'edit-content';
            $caps[] = 'upload-media';
        }

        if ($this->canPreview()) {
            $caps[] = 'preview-draft';
        }

        if ($this->canPublish()) {
            $caps[] = 'publish';
        }

        if ($this->isOwner()) {
            $caps[] = 'purge-asset';
            $caps[] = 'manage-users';
            $caps[] = 'view-audit';
        }

        return $caps;
    }
}
