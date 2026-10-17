<?php

namespace App\Policies;

use App\Models\Cms\CmsEntry;
use App\Models\User;

/**
 * Server-side enforcement of the spec 9.2 matrix. UI hiding is not enough.
 */
class EntryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view-admin');
    }

    public function view(User $user, CmsEntry $entry): bool
    {
        return $user->can('view-admin');
    }

    public function create(User $user): bool
    {
        return $user->can('edit-content');
    }

    public function update(User $user, CmsEntry $entry): bool
    {
        return $user->can('edit-content');
    }

    public function archive(User $user, CmsEntry $entry): bool
    {
        return $user->can('edit-content');
    }

    public function publish(User $user, CmsEntry $entry): bool
    {
        return $user->can('publish');
    }

    public function preview(User $user, CmsEntry $entry): bool
    {
        return $user->can('preview-draft');
    }
}
