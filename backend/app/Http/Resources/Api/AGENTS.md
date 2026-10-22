<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Api

## Purpose
Namespace root for versioned ApiResource classes. It carries no PHP files of its own; it exists so resources are namespaced in parallel with the controllers and requests that return them (`App\Http\Resources\Api\V1\...`).

## Key Files
None — this directory contains only the `V1/` subdirectory.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `V1/` | Version 1 resource classes — see `V1/AGENTS.md` |

## For AI Agents

### Working In This Directory
- Do not add resource classes at this level; they belong to a version segment.
- The namespace must match the API version the payload belongs to. A shape that changes incompatibly gets a new version, not an in-place edit to the old one.

### Testing Requirements
- No code of its own to test. Run the suite with `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`.

### Common Patterns
- One resource per payload kind, reused across endpoints. `EntryResource` serves both the admin entry endpoints and the admin page-builder alias.

## Dependencies

### Internal
- `backend/routes/api.php` — the endpoints whose responses these resources produce
- `frontend/` and `frontend-admin/` — the consumers of these payloads

### External
- `laravel/framework` — `Illuminate\Http\Resources\Json\JsonResource`

<!-- MANUAL: -->
