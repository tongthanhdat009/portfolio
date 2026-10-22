<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# cms

## Purpose
The CMS adapter layer: `service.ts` translates between the Laravel CMS API payloads and the domain models in `@/types`, and exposes every read and write the admin needs. This is the only place that knows the backend's field names and envelope shapes.

## Key Files
| File | Description |
|------|-------------|
| `service.ts` | ~660 lines. Field mapping (`toEntry`, `toApiPayload`, `toRevision`, `toMediaAsset`, `asList`, `toPaged`); reads (`getEntries`, `getEntriesPaged`, `getEntryById`, `getEntryByKey`, `getRevisions`, `getRevisionsPaged`, `getMedia`, `getMediaPaged`, `getGlobals`, `getAuditLogs`) and writes (`saveDraft`, `createEntry`, `publishEntry`, `unpublishEntry`, `archiveEntry`, `restoreEntry`, `deleteEntry`, `restoreRevision`, `addMedia`, `updateMediaAlt`, `deleteMedia`, `updateGlobals`); derived data (`getContentHealth`, `getDashboardMetrics`). Also exports the `PagedResult<T>` interface used by every list editor. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The backend uses `id` for the primary key and the admin uses `_id`; `toEntry` does that rename. Backend `seo.ogMediaId` becomes `seo.ogImage` and back. Extend `toEntry` and `toApiPayload` together or the round trip breaks.
- The API wraps resources in `{ data, meta }`. `apiFetch` unwraps `data`; for paginated endpoints the service calls `apiFetch(..., { raw: true })` and reads `meta.total` / `meta.current_page` / `meta.per_page` / `meta.last_page`. `toPaged` falls back to sensible defaults when `meta` is missing.
- `asList` accepts both a bare array and a `{ data: [...] }` envelope, because the API is inconsistent between endpoints. Keep that defensiveness when adding list endpoints.
- `deleteEntry` delegates to `archiveEntry` — there is no hard delete. `deleteMedia` is different: it really deletes and returns `{ success: false, blockedReason }` on a 409 (asset still referenced) or on a 404.
- `publishEntry` re-reads the entry after the publish call and synthesises a `CmsPublication` locally (`_id: pub_<entryId>`); the publication snapshot itself is written by the backend.
- `updateGlobals` merges into the globals resource under the key `site`, publishes it immediately (no draft step in the UI), and diff-syncs the redirect table by deleting removed rules and recreating changed ones.
- `getContentHealth` returns three issue levels — `blocker` (homepage hero points at an unpublished project), `warning` (cover image without alt text) and `suggestion` (missing or very short SEO description) — each with a `fixAction` deep link into the relevant editor.
- `getDashboardMetrics` counts `draftCount` as entries whose status is `draft` **or** that have `hasUnpublishedChanges`; the publishing queue filters on status only, so the two numbers can disagree.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check with the Laravel API on `:9000`: open every admin route and confirm the lists populate, then create/edit/publish one entry of each type.
- Concurrency check: open the project editor in two tabs, save in the first, then save in the second — the second save should fail with a revision conflict rather than overwrite.

### Common Patterns
- Every function is server-safe (no React/Next imports) and returns plain typed objects, so the same functions can be called from server components and from server actions.
- `actor` is accepted for API symmetry but ignored (`void actor`); the backend derives the actor from the bearer token.

## Dependencies

### Internal
- `../api/client` (`apiFetch`), `@/types` (all domain models).

### External
- Laravel CMS API `/api/v1/admin/*` (entries, pages, media, media uploads, globals, redirects, revisions, audit logs).

<!-- MANUAL: -->
