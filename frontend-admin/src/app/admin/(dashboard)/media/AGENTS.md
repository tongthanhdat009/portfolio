<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# media

## Purpose
Media library: the registry of assets in object storage, with accessibility alt metadata, MIME type, dimensions and cross-entry usage. It also hosts the upload flow and a safe delete that refuses to remove assets still referenced by content.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Reads `?page=` and `?q=`, calls `getMediaPaged({ search, page, perPage: 12 })` and renders `<MediaClient key={`${page}-${q}`} initialBundle={bundle} initialSearch={search} />`. |
| `MediaClient.tsx` | `'use client'` split view (15 KB): asset grid plus an inspector panel for the selected asset, a debounced search that rewrites `?q=`, an upload modal and a delete action. `handleUploadSubmit` calls `addMediaAction` with filename, a `uploads/2026/10/<name>` storage key, a public URL, a MIME type inferred from the extension, a hardcoded size of 345000 bytes and dimensions 1200×675 — placeholders, not real probing. `handleDelete` calls `deleteMediaAction` and, when the API answers 409, surfaces `res.blockedReason` in the `blockedReason` banner. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The upload form's `storageKey`, `size` and `dimensions` are placeholders. The real three-step upload lives in `addMedia` (`@/lib/cms/service`): POST `/admin/media/uploads` to get an `uploadId` + `uploadUrl`, PUT the bytes to object storage, POST `/admin/media/uploads/{uploadId}/complete`, then PATCH alt and dimensions. The client only supplies metadata.
- Deletion is guarded by the backend: a 409 becomes `{ success: false, blockedReason }` and the reason is rendered in a banner. Never force a delete on 409 — the asset is referenced.
- `usageReferences` is typed on `MediaAsset` but the CMS service always maps it to an empty array, so the "usage" section of the inspector has no data to show today.
- The inspector is read-only for metadata: there is no alt-text edit action wired up (`updateMediaAlt` exists in the service but no action or button calls it).
- MIME type is guessed from the filename extension (`.png` → `image/png`, otherwise `image/jpeg`); no file picker or drag-and-drop exists.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: upload an asset → it appears in the grid and the inspector; try to delete a referenced asset → the 409 banner appears instead of a deletion.
- Verify search: typing in the search box rewrites `?q=` after the debounce and resets `?page=`.

### Common Patterns
- Asset selection state is local (`selectedAssetId`); the bundle is patched locally after an upload or delete.
- Search input uses `useDebouncedValue` from `@/lib/use-debounced-value` (400 ms) before syncing to the URL.

## Dependencies

### Internal
- `@/lib/cms/service` (`getMediaPaged`), `@/lib/use-debounced-value`, `@/app/admin/actions` (`addMediaAction`, `deleteMediaAction`), `@/components/ui/{Card,Button,Input,Modal,Badge,Pagination}`, `@/types` (`MediaAsset`).

### External
- next 16, react 19, lucide-react.

<!-- MANUAL: -->
