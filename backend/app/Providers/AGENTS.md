<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Providers

## Purpose
Application service providers. The single provider here wires the authorization gates, the login rate limiter, the Sanctum token model, and the entry policy — everything the CMS needs before any request can be authorized.

## Key Files
| File | Description |
|------|-------------|
| `AppServiceProvider.php` | `register()` is empty; `boot()` calls `Sanctum::usePersonalAccessTokenModel(CmsPersonalAccessToken::class)`, registers the `login` rate limiter (5 per minute keyed by lowercased email plus IP), defines the eight gates (`view-admin`, `edit-content`, `preview-draft`, `upload-media`, `publish`, `purge-asset`, `manage-users`, `view-audit`), and binds `EntryPolicy` to `CmsEntry` via `Gate::policy()` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| _(none)_ | Leaf directory under `app/` — `AppServiceProvider` sits directly under it. |

## For AI Agents

### Working In This Directory
- This provider is registered in `bootstrap/providers.php`. Adding a new provider means editing that manifest, not the kernel.
- Gate names defined here are the contract consumed by `App\Policies\EntryPolicy` and by `->can(...)` calls on routes. Renaming a gate breaks authorization in two places at once — update both.
- `view-admin` is granted to all three roles (`owner`, `editor`, `viewer`); `edit-content` and `upload-media` map to `User::canEditContent()`; `preview-draft` to `User::canPreview()`; `publish` to `User::canPublish()`; `purge-asset`, `manage-users`, and `view-audit` to `User::isOwner()` only.
- The `login` limiter is keyed by `strtolower(email)|ip`. Keep the lowercase normalization — without it the same address can burn five attempts per casing.
- `Sanctum::usePersonalAccessTokenModel()` must point at `CmsPersonalAccessToken`; the default Sanctum model is SQL-backed and this project is MongoDB-only.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Gate behaviour is asserted in `tests/Feature/AuthTest.php` (login throttle, token issue/revoke, profile, password change) and in `tests/Feature/EntriesTest.php` (per-role access to admin endpoints).

### Common Patterns
- Extend `Illuminate\Support\ServiceProvider`; `register()` for bindings, `boot()` for gates and rate limiters.
- Use the `Gate::define('name', fn (User $user) => ...)` closure form with an explicit `User` type hint so the gate cannot be called unauthenticated.
- `RateLimiter::for('name', fn (Request $request) => Limit::perMinute(n)->by($key))` is the limiter pattern.

## Dependencies

### Internal
- `App\Policies\EntryPolicy` — bound here to `CmsEntry`.
- `App\Models\User` — the role and capability helpers every gate delegates to.
- `App\Models\Cms\CmsPersonalAccessToken` — the Sanctum token model registered here.
- `bootstrap/providers.php` — the provider manifest listing this class.

### External
- Laravel Sanctum — `Sanctum::usePersonalAccessTokenModel()`.
- Laravel's `Gate` and `RateLimiter` facades.
- `mongodb/laravel-mongodb` — the connection the token model relies on.

<!-- MANUAL: -->
