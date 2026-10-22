<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Auth

## Purpose
Authentication controller for the first-party admin SPA and for cross-origin admin clients. It handles cookie-session login/logout for same-origin browser clients and issues or revokes per-user API tokens for clients that cannot use sessions. There is no public registration: owner accounts are created with the `cms:create-owner` artisan command.

## Key Files
| File | Description |
|------|-------------|
| `AuthController.php` | `login` (web-guard attempt, session regenerate), `logout` (guard logout plus session invalidate and token regenerate), `me`, `updateProfile`, `changePassword`, `issueToken` (stateless, returns `id|plainTextToken`), `revokeToken` (deletes the caller's own `CmsPersonalAccessToken`) |

## Subdirectories
None — this is a leaf controller segment.

## For AI Agents

### Working In This Directory
- Two authentication mechanisms live side by side and must not be confused: `login`/`logout`/`me` use the `web` guard and a session cookie (Sanctum's `EnsureFrontendRequestsAreStateful` middleware makes `/api/*` stateful for first-party requests), while `issueToken`/`revokeToken` are stateless and return a bearer token.
- `issueToken` verifies credentials with `Hash::check` against the MongoDB `cms_users` document and stores only `hash('sha256', $plainTextToken)`; the plaintext is returned to the caller once and never persisted.
- A token is always bound to the user who logged in. Never mint a shared or service-wide token.
- Failed login returns HTTP 401 with a stable machine-readable body: `{"message", "errorCode": "INVALID_CREDENTIALS", "requestId"}`. `requestId` echoes the `X-Request-ID` header when present, otherwise a fresh UUID. Keep that shape — the admin UI keys off `errorCode`.
- `login` and `token.issue` routes carry the `throttle:login` middleware (limiter defined in `AppServiceProvider`). Do not add unprotected credential-check endpoints.
- `revokeToken` aborts 404 when the caller's current access token is not a `CmsPersonalAccessToken`.
- Password and profile writes are protected by the dedicated FormRequests in `App\Http\Requests\Api\V1\Auth`, not inline rules.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. Bare-host runs fail without the MongoDB PHP extension.
- Coverage lives in `tests/Feature/AuthTest.php` (401 for a guest, 403 for a forbidden role, login/logout, profile, password change, owner-only health).
- The SPA flow must be mirrored in tests: fetch `/sanctum/csrf-cookie`, then replay the `XSRF-TOKEN` cookie as the `X-XSRF-TOKEN` header, and refresh it after every mutation because login/logout regenerate the session.

### Common Patterns
- Single-resource responses are wrapped as `{"data": new UserResource($user)}`; `changePassword` returns a plain `{"message": ...}`.
- `UserResource` never exposes the password or remember token.
- Route names are `api.v1.auth.*` — `login`, `token.issue`, `token.revoke`, `logout`, `me`, `profile.update`, `password.change`.

## Dependencies

### Internal
- `App\Http\Requests\Api\V1\Auth\{LoginRequest,ChangePasswordRequest,UpdateProfileRequest}`
- `App\Http\Resources\Api\V1\UserResource`
- `App\Models\User` (MongoDB `cms_users`) and `App\Models\Cms\CmsPersonalAccessToken`
- `App\Providers\AppServiceProvider` — Sanctum PAT model registration and the `login` rate limiter

### External
- `laravel/sanctum` — `HasApiTokens`, `EnsureFrontendRequestsAreStateful`
- `mongodb/laravel-mongodb` — MongoDB-backed `User` model

<!-- MANUAL: -->
