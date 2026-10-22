<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# experiments

## Purpose
Editor for the Lab section: technical experiments and prototypes, each with a status (`Prototype` / `Exploring` / `Archived` / `Shipped`), a summary, an objective, how it works, limitations and takeaways. Entries are of type `experiment`.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Parses `?page=`, calls `getEntriesPaged({ type: 'experiment', sort: 'updated', page, perPage: 10 })` and renders `<ExperimentsClient key={page} initialBundle={bundle} />`. |
| `ExperimentsClient.tsx` | `'use client'` list of experiment cards (status badge, summary, external demo/repo links) with an edit/create `Modal`. Tags are edited as one comma-separated input and split into `string[]` on save. Save = `saveDraftAction` or `createEntryAction` (`status: 'published'`, `seo: { title, description: summary }`), then `publishEntryAction`, then `window.location.reload()`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Entries are sorted by `updated` (not `order`) — experiments have no `sortOrder` concept in the UI even though the CMS entry carries one.
- `data.status` (Prototype/Exploring/Archived/Shipped) is a content field, distinct from the CMS entry `status` (draft/published/archived). Do not conflate them.
- `data.title` and `data.slug` are edited separately and both are written to the payload; the CMS `title` is kept in sync with `data.title`.
- New entries are created with the CMS status `draft` in the local draft object but posted with `status: 'published'` and then explicitly published.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: create an experiment → it appears in the list → publish → the public Lab grid shows it with the right status badge.
- Verify the external links (demo / repo) render and open when set.

### Common Patterns
- Same list + modal + publish-on-save shape as `notes/` and `skills/`; the only type-specific part is the data model in `@/types`.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntriesPaged`), `@/app/admin/actions` (`saveDraftAction`, `createEntryAction`, `deleteEntryAction`, `publishEntryAction`), `@/components/ui/{Card,Button,Input,Modal,Badge,Pagination}`, `@/types` (`ExperimentData`, `ColorAccent`).

### External
- next 16, react 19, lucide-react (`Plus`, `Edit2`, `Trash2`, `FlaskConical`, `ExternalLink`).

<!-- MANUAL: -->
