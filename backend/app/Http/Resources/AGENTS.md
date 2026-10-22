<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Resources

## Purpose
Root of the JSON rendering tier. ApiResource classes define the exact shape of every payload the CMS API returns, so the admin SPA and the public site both parse a stable contract. The `Api/` subtree holds the versioned resources.

## Key Files
None — this directory contains only the `Api/` subdirectory.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Api/` | Versioned ApiResource classes — see `Api/AGENTS.md` |

## For AI Agents

### Working In This Directory
- A resource is the only place that decides what a model looks like on the wire. Controllers wrap it as `['data' => new SomeResource($model)]`; never hand-build the same payload inline in a controller.
- Resources must be side-effect free: no queries, no writes, no external calls. If a payload needs a computed field, derive it from the already-loaded model.
- Adding a field to a resource changes the public contract. The Next.js frontends (`frontend/`, `frontend-admin/`) read these payloads directly — check they tolerate the new field, and prefer additive changes over renames.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension.
- Resource shape changes are asserted indirectly by the Feature tests that read `data.<field>` from the JSON response.

### Common Patterns
- BSON ids are string-cast: `(string) $this->getKey()`. Never expose a raw `ObjectId` — it does not JSON-encode cleanly.
- Timestamps are ISO-8601 strings via `?->toISOString()`.
- A resource names the model it wraps with an `@mixin` PHPDoc annotation.

## Dependencies

### Internal
- `App\Models\Cms\*` and `App\Models\User` — the models being rendered
- `App\Http\Controllers\Api\V1\*` — the consumers

### External
- `laravel/framework` — `Illuminate\Http\Resources\Json\JsonResource`

<!-- MANUAL: -->
