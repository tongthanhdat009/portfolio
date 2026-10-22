<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Admin

## Purpose
FormRequests for the authenticated admin API v1. They validate entry drafts, publish commands, and media uploads before the controller runs. Entry rules are driven by the content-type registry, so a new entry type automatically gains its field rules without touching a controller.

## Key Files
| File | Description |
|------|-------------|
| `StoreEntryRequest.php` | Creates an entry: `type` restricted to `SchemaRegistry::ENTRY_TYPES`, `title` required, plus optional `key`, `locale`, `slug`, `seo` (with nested `title`/`description`/`ogMediaId`), `references`, `featured`, `sortOrder`, `schemaVersion`; merges in `SchemaRegistry::dataRules($type)`. `authorize()` requires `can('create', CmsEntry::class)` |
| `UpdateEntryRequest.php` | Updates an entry draft: `expectedRevision` required, all other fields `sometimes`, plus per-type data rules. Resolves the entry type from the route id (24-hex id becomes a `MongoDB\BSON\ObjectId`) so unknown ids fall back to generic rules and the controller then returns 404. `authorize()` returns `true` — the model-level check happens in the controller via `EntryPolicy` |
| `PublishRequest.php` | Publish command: `expectedRevision` required, integer, `min:1`. `authorize()` returns `true` because the route holds a raw id |
| `IssueUploadRequest.php` | Presigned upload issue: `filename`, `mimeType` (from `MediaService::IMAGE_MIMES` and `DOCUMENT_MIMES`), `size` (1 byte to 100 MiB), `usage` (from `MediaService::USAGES`), `visibility` (`public`/`private`), optional `alt` and `checksum`. `authorize()` requires `can('upload-media')` |
| `UpdateMediaRequest.php` | Media metadata patch: optional `alt`, `caption`, `tags` (max 20 items of max 60 chars), `width`, `height`. `authorize()` requires `can('upload-media')` |

## Subdirectories
None — this is a leaf request segment.

## For AI Agents

### Working In This Directory
- Keep `authorize()` honest: either return a real capability check, or return `true` with a comment saying the model-level check happens in the controller. Never authorize on a model that is not loaded yet.
- Entry field rules come from `SchemaRegistry::dataRules($type)`, not from hard-coded lists here. To change what a type accepts, edit the registry.
- `UpdateEntryRequest` reads the route parameter to look up the entry's type. If you rename the route parameter in `backend/routes/api.php`, update `$this->route('entry')` to match.
- `StoreEntryRequest` calls `dataRules()` with the type from the request body; an unknown type yields no extra rules but is already rejected by the `Rule::in(ENTRY_TYPES)` check on `type`.
- `IssueUploadRequest` enforces a 100 MiB hard ceiling on `size`; `config('cms.max_upload_mb')` and `cms.max_pdf_upload_mb` are the softer runtime limits enforced elsewhere.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension, so the suite runs in Docker only.
- Coverage lives in `tests/Feature/EntriesTest.php` (draft CRUD, stale revision 409, publish/unpublish, revisions) and `tests/Feature/MediaTest.php` (upload issue/complete, validation gates).
- A rule change needs a test asserting the 422 with the offending field plus the accepted payload.

### Common Patterns
- `rules()` returns `array<string, mixed>` with an `@return` PHPDoc block.
- Optional fields use `nullable` or `sometimes`; required fields use `required`.
- Bounded input everywhere: `max:` on strings and arrays, `max:` per array element, `min:`/`max:` on integers, and `regex:` on slugs and keys.

## Dependencies

### Internal
- `App\Domain\Content\SchemaRegistry` — `ENTRY_TYPES`, `dataRules($type)`
- `App\Application\Services\MediaService` — `IMAGE_MIMES`, `DOCUMENT_MIMES`, `USAGES`
- `App\Models\Cms\CmsEntry` — resolved by id to derive the entry type

### External
- `laravel/framework` — `FormRequest`, `Rule::in`, `Rule::unique`
- `mongodb/laravel-mongodb` — `MongoDB\BSON\ObjectId` for the route-id lookup

<!-- MANUAL: -->
