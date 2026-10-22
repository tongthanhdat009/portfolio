<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# V1

## Purpose
Version 1 of the API resources — the four JsonResource classes that define the wire format for entries, publications, media, and users. Every JSON body the CMS API emits in v1 is produced by one of these four.

## Key Files
| File | Description |
|------|-------------|
| `EntryResource.php` | Draft entry payload: id, type, key, locale, slug, title, status, `data`, `seo`, `references`, featured, sortOrder, schemaVersion, revision, `hasUnpublishedChanges()`, lastPublishedRevision, publishedAt, createdAt, updatedAt |
| `PublicationResource.php` | Published snapshot payload: id, type, key, slug, locale, `data` (from `publicData`), `seo` (from `publicSeo`), schemaVersion, sourceRevision, publishedAt |
| `MediaResource.php` | Media asset payload: id, filename, storageKey, mimeType, size, width, height, alt, caption, tags, visibility, status, createdAt |
| `UserResource.php` | CMS user payload: id, name, email, role, and the `capabilities()` list the admin UI uses to decide which actions to offer, createdAt, updatedAt |

## Subdirectories
None — this is a leaf resource segment.

## For AI Agents

### Working In This Directory
- `EntryResource` and `PublicationResource` are deliberately different. Entries carry draft state (`status`, `revision`, `hasUnpublishedChanges`); publications carry only what a visitor may see, sourced from `publicData` and `publicSeo`. Do not merge them or add draft fields to the publication payload.
- `PublicationResource` is the only resource the public API uses. Anything added to it becomes world-readable.
- `UserResource` relies on the `#[Hidden]` attribute on `App\Models\User` to keep the password and remember token out of the payload — never add a raw model dump alongside it.
- `capabilities()` on the user model is the server's own answer to "what may this user do"; the admin UI renders from it, but the server re-checks every action. Keep the two in sync when roles change.
- The wire format is consumed directly by `frontend/` and `frontend-admin/`. Prefer additive changes; a rename breaks both.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension, so the suite runs in Docker only.
- Shape is asserted through the Feature tests in `tests/Feature/` — they read `data.id`, `data.revision`, `data.hasUnpublishedChanges`, and similar keys from the JSON response.
- If you change a payload shape, run the suite and confirm the frontends still parse it.

### Common Patterns
- `toArray(Request $request): array` returns `array<string, mixed>` with an `@return` PHPDoc block.
- BSON ids are string-cast: `(string) $this->getKey()`.
- Timestamps are ISO-8601 via `?->toISOString()`.
- Each class declares the model it wraps with an `@mixin` PHPDoc annotation.

## Dependencies

### Internal
- `App\Models\Cms\{CmsEntry,CmsPublication,CmsMedia}` and `App\Models\User`
- `App\Http\Controllers\Api\V1\*` — the consumers
- `frontend/`, `frontend-admin/` — the Next.js clients that parse these payloads

### External
- `laravel/framework` — `Illuminate\Http\Resources\Json\JsonResource`, resource collections

<!-- MANUAL: -->
