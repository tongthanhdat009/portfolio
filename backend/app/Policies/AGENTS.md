<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Policies

## Purpose
Server-side enforcement of the spec 9.2 authorization matrix. The policy is the authority on who may view, create, edit, archive, publish, or preview an entry — hiding buttons in the admin UI is never sufficient.

## Key Files
| File | Description |
|------|-------------|
| `EntryPolicy.php` | The only policy in the app: `viewAny`/`view` require `view-admin`, `create`/`update`/`archive` require `edit-content`, `publish` requires `publish`, `preview` requires `preview-draft`. Bound to `CmsEntry` via `Gate::policy()` in `AppServiceProvider` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| _(none)_ | Leaf directory under `app/` — `EntryPolicy` sits directly under it. |

## For AI Agents

### Working In This Directory
- A policy method must never rely on the UI. Every check is a gate name checked with `$user->can(...)`, so the gate definitions in `AppServiceProvider` are the single source of truth.
- The gate-to-role mapping lives in `AppServiceProvider` (`view-admin`, `edit-content`, `preview-draft`, `upload-media`, `publish`, `purge-asset`, `manage-users`, `view-audit`). The policy only names gates; it never inspects `role` directly.
- Gate names here must match the `Gate::define()` names exactly. `EntryPolicy::archive()` uses `edit-content` — archiving is an edit, not a publish-level action.
- Adding an ability means adding the policy method, then calling it from the controller (`$this->authorize(...)` or `$request->user()->can(...)`), then adding the route in `routes/api.php`.
- Model methods that shadow policy names (`User::canEditContent()`, `User::canPublish()`) are the underlying role logic; the policy stays a thin gate-name mapping.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Role behaviour is exercised in `tests/Feature/AuthTest.php` and `tests/Feature/EntriesTest.php`, which create users with each role (`owner`, `editor`, `viewer`) and assert on the admin endpoints.

### Common Patterns
- Policy methods are typed `public function <ability>(User $user, CmsEntry $entry): bool` and return the result of a single `$user->can('gate')` call.
- The class has no constructor and no injected dependencies — authorization rules are read from the user object.
- Docblocks cite the spec (`spec 9.2`) — preserve that convention.

## Dependencies

### Internal
- `App\Providers\AppServiceProvider` — defines the gates and binds `EntryPolicy` to `CmsEntry`.
- `App\Models\User` — supplies `can()`, `role`, and the `isOwner()`/`canEditContent()`/`canPublish()` helpers the gates call.
- `App\Models\Cms\CmsEntry` — the policy's subject model.

### External
- Laravel's `Illuminate\Auth\Access\Gate` — gate resolution and policy discovery.

<!-- MANUAL: -->
