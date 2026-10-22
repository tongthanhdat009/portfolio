<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Auth

## Purpose
FormRequests for the auth API v1: credential payloads, profile updates, and password changes. They are the trust boundary between untrusted input and the MongoDB `cms_users` document, so the rules here are deliberately tight — bounded lengths, a confirmed password, and a uniqueness check on email.

## Key Files
| File | Description |
|------|-------------|
| `LoginRequest.php` | `email` required, valid email, max 255; `password` required, min 1, max 1024. Shared by `login` and `issueToken` |
| `UpdateProfileRequest.php` | Optional `name` (max 255) and `email` (valid email, max 255, unique against the `cms_users` collection while ignoring the current user's `_id`). `authorize()` returns `true` — the route already requires `auth:sanctum` |
| `ChangePasswordRequest.php` | `current_password` required and checked against the `web` guard, `password` required, `confirmed`, and bounded by `Password::min(8)->max(1024)` |

## Subdirectories
None — this is a leaf request segment.

## For AI Agents

### Working In This Directory
- `LoginRequest` is used by two endpoints (`login` for the session flow, `issueToken` for the stateless flow). Changing its rules changes both; keep the shape compatible.
- `UpdateProfileRequest` queries the `cms_users` collection directly because the MongoDB driver is not SQL. The unique rule ignores the current user by `_id`, so saving an unchanged email does not fail.
- `ChangePasswordRequest` requires `current_password` — the user must prove the old password. Keep that requirement; do not "simplify" it away.
- `authorize()` returns `true` here because the routes themselves carry `auth:sanctum` (or are pre-authentication by nature). There is no role requirement at this tier.
- Never echo a password value into a validation message or an audit metadata array.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host lacks the MongoDB extension.
- Coverage lives in `tests/Feature/AuthTest.php` — login, logout, token issue/revoke, profile update, password change, and the 401/403 guards.
- The SPA flow must be mirrored in tests: fetch `/sanctum/csrf-cookie`, replay the `XSRF-TOKEN` cookie as `X-XSRF-TOKEN`, and refresh it after each mutation because login/logout regenerate the session.

### Common Patterns
- `rules()` returns `array<string, mixed>` with an `@return` PHPDoc block.
- Bounded input on every field; `Password::min(8)->max(1024)` for the new password.
- The `current_password:web` rule names the guard explicitly so the check hits the right credential store.

## Dependencies

### Internal
- `App\Models\User` — the `cms_users` MongoDB collection
- `App\Http\Controllers\Api\V1\Auth\AuthController` — the consumer of these requests

### External
- `laravel/framework` — `FormRequest`, `Illuminate\Validation\Rules\Password`, `Rule::unique`
- `mongodb/laravel-mongodb` — unique rule support over the `cms_users` collection

<!-- MANUAL: -->
