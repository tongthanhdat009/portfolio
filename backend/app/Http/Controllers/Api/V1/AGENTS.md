<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# V1

## Purpose
Version 1 of the CMS API controllers. This segment is where the audience split happens: `Admin/` for authenticated draft management, `Auth/` for session and token authentication, and `Public/` for read-only delivery of published content. Versioning is by URL prefix (`/api/v1`) and PHP namespace; there is no per-version branching inside a controller.

## Key Files
None — this directory contains only the audience subdirectories.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Admin/` | Sanctum-guarded draft management, publish pipeline, media, audit — see `Admin/AGENTS.md` |
| `Auth/` | Login, token issue/revoke, logout, profile, password — see `Auth/AGENTS.md` |
| `Public/` | Read-only delivery over published snapshots — see `Public/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Put a new controller in the audience segment that matches its authorization model: anything touching drafts goes in `Admin/`, anything issuing credentials goes in `Auth/`, anything a logged-out visitor may call goes in `Public/`.
- Controllers under `Public/` must never read draft collections (`cms_entries`, `cms_globals`, `cms_revisions`). They read `cms_publications` and `cms_redirects` only.
- Route names are built by the nested groups in `backend/routes/api.php`: `api.v1.admin.*`, `api.v1.auth.*`, `api.v1.public.*`.
- If a second API version is ever added, copy this segment as `V2/` and give it its own route group; do not add version checks inside existing controllers.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. Bare-host runs fail because the host has no MongoDB PHP extension.
- Every controller change needs a Feature test under `tests/Feature/` that covers the happy path and the authorization guard.

### Common Patterns
- One controller per domain area, injected services via `readonly` promoted constructor properties.
- All responses are JSON: `{"data": ...}` or `{"data": [...], "meta": {...}}`.
- `spec X.Y` docblock references point at the repo-root `*-spec.md` files.

## Dependencies

### Internal
- `backend/routes/api.php` — route bindings and names for every controller here
- `App\Http\Requests\Api\V1\*` — validation tier
- `App\Http\Resources\Api\V1\*` — rendering tier
- `App\Application\Services\*` — the mutation layer

### External
- `laravel/sanctum` — `auth:sanctum` on the admin and protected auth routes
- `mongodb/laravel-mongodb` — Eloquent models over MongoDB collections

<!-- MANUAL: -->
