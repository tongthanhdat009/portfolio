<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# V1

## Purpose
Version 1 of the API FormRequests. This segment is where the audience split is expressed: `Admin/` validates draft, publish, and media payloads; `Auth/` validates credential and profile payloads. There is no `Public/` segment — public endpoints validate trivial query parameters inline.

## Key Files
None — this directory contains only the audience subdirectories.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Admin/` | Entry, publish, and media validation — see `Admin/AGENTS.md` |
| `Auth/` | Login, profile, and password validation — see `Auth/AGENTS.md` |

## For AI Agents

### Working In This Directory
- A request class belongs to `Admin/` if the payload mutates content, media, or publish state, and to `Auth/` if it carries credentials or user profile data.
- `authorize()` returns `true` for requests whose real check needs the loaded model, because the route parameter is a raw id that is not resolvable during validation. The controller then applies `EntryPolicy`.
- Requests may read the route parameter (`$this->route('entry')`) to derive type-dependent rules. `UpdateEntryRequest` does this to look up the entry's type and pick the matching `SchemaRegistry::dataRules()`.
- Do not perform side effects in `rules()` or `authorize()` — no writes, no publishing, no auditing.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB extension.
- Validation changes need Feature test coverage asserting both the 422 rejection and the accepted payload.

### Common Patterns
- `rules()` returns `array<string, mixed>` with an `@return` PHPDoc annotation.
- `expectedRevision` is `required` with `integer` and `min:1` on every mutating draft request.
- Nullable text fields are bounded with `max:`; arrays are bounded with `max:` on the array and `max:` on each element.

## Dependencies

### Internal
- `App\Domain\Content\SchemaRegistry` — entry types, block types, per-type data rules
- `App\Application\Services\MediaService` — allowed mime types and usages
- `App\Models\Cms\CmsEntry` — resolved by id for type-dependent rules

### External
- `laravel/framework` — `FormRequest`, `Rule::in`, `Rule::unique`, `Illuminate\Validation\Rules\Password`

<!-- MANUAL: -->
