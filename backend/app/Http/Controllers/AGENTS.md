<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Controllers

## Purpose
Root of the controller namespace for the CMS API. Holds the abstract base class every API controller extends, and the `Api/` subtree that splits controllers by API version and audience.

## Key Files
| File | Description |
|------|-------------|
| `Controller.php` | Abstract base class; `use AuthorizesRequests, ValidatesRequests` so controllers can call `$this->authorize(...)` and `$request->validate(...)` — no shared helpers, no constructor |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Api/` | Versioned API controllers — see `Api/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Extend `App\Http\Controllers\Controller`, never a bare class — the traits are what give you `$this->authorize()`.
- Controllers stay thin: parse the request, authorize, call a service, wrap the result in a Resource. No queries, no mutation logic, no business rules.
- Do not add shared behaviour to the base class yet; there is none. If two controllers genuinely need the same helper, put it in a service under `app/Application/Services/` instead.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host lacks the MongoDB extension and cannot run the suite.
- New controller behaviour needs a Feature test under `tests/Feature/` asserting both the success path and the authorization/validation failure path.

### Common Patterns
- Service injection is `readonly` promoted constructor properties, one per service, named for the service (`private readonly ContentService $content`).
- Return types are `JsonResponse` (or `Response` for `noContent()` deletes); resources are wrapped as `['data' => new SomeResource($model)]`.
- `spec X.Y` in a class docblock points at the repo-root `*-spec.md` contract, not at a local file.

## Dependencies

### Internal
- `App\Application\Services\*` — the mutation layer controllers delegate to
- `App\Http\Requests\Api\V1\*` — validation tier
- `App\Http\Resources\Api\V1\*` — rendering tier
- `App\Policies\EntryPolicy` and gates in `App\Providers\AppServiceProvider`

### External
- `laravel/framework` — controller base, `AuthorizesRequests`, `ValidatesRequests`
- `laravel/sanctum` — `auth:sanctum` guard

<!-- MANUAL: -->
