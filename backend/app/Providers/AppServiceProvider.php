<?php

namespace App\Providers;

use App\Models\Cms\CmsEntry;
use App\Models\Cms\CmsPersonalAccessToken;
use App\Models\User;
use App\Policies\EntryPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap authorization gates (spec 9.2) and login throttling.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(CmsPersonalAccessToken::class);

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(
                strtolower((string) $request->input('email')).'|'.$request->ip()
            );
        });

        Gate::define('view-admin', fn (User $user) => in_array($user->role, [
            User::ROLE_OWNER, User::ROLE_EDITOR, User::ROLE_VIEWER,
        ], true));

        Gate::define('edit-content', fn (User $user) => $user->canEditContent());

        Gate::define('preview-draft', fn (User $user) => $user->canPreview());

        Gate::define('upload-media', fn (User $user) => $user->canEditContent());

        Gate::define('publish', fn (User $user) => $user->canPublish());

        Gate::define('purge-asset', fn (User $user) => $user->isOwner());

        Gate::define('manage-users', fn (User $user) => $user->isOwner());

        Gate::define('view-audit', fn (User $user) => $user->isOwner());

        Gate::policy(CmsEntry::class, EntryPolicy::class);
    }
}
