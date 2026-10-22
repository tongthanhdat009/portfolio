<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# content

## Purpose
One editor per content type plus the homepage section builder and the project editor with its own sub-routes. Every leaf follows the same shape: a `force-dynamic` `page.tsx` that fetches a page of entries with `getEntriesPaged({ type })` and renders a `*Client.tsx` that edits and saves through `saveDraftAction` / `createEntryAction` (followed by `publishEntryAction`).

## Key Files
| File | Description |
|------|-------------|
| `projects/ProjectsClient.tsx` (482 lines) | Project list: status tabs (all/published/draft/archived), debounced search, category select, duplicate-as-draft, archive/restore, delete confirmation modal, `syncGithubAction` and `importCvAction` buttons. |
| `projects/ProjectEditorClient.tsx` (878 lines) | The 5-tab project form (Overview, Story & Architecture, Media & Assets, External Links, SEO Metadata) with the nested `caseStudy` model, `expectedRevision` concurrency handling and a preflight publish modal. Shared by `new/` and `[id]/` through the `isNew` prop. |
| `projects/[id]/page.tsx` | `getEntryById(id)` → `notFound()` on miss, then `<ProjectEditorClient initialEntry={entry} isNew={false} />`. Note: it does not check the entry type, so any entry id renders in the project form. |
| `projects/new/page.tsx` | Renders `<ProjectEditorClient isNew />` with no fetch; the client creates the entry on first save. |
| `pages/home/HomePageBuilderClient.tsx` (667 lines) | Homepage section builder: reorder, enable/disable, per-section props, viewport switcher, and `blocksToSections` / `sectionsToBlocks` conversion from `@/lib/page-blocks`. |
| `skills/SkillsClient.tsx` (269 lines) | Technology entries (`TechnologyData`: name/category/context/featured/order). |
| `capabilities/CapabilitiesClient.tsx` (227 lines) | Capability entries (`CapabilityData`: code/title/description/accent/iconKey/order). |
| `experience/ExperienceClient.tsx` (312 lines) | Journey entries (`ExperienceData`: year/type/organization/roleAtTime/highlights). |
| `notes/NotesClient.tsx` (290 lines) | Long-form notes (`NoteData`) with a markdown body, tags and read time. |
| `experiments/ExperimentsClient.tsx` (305 lines) | Lab entries (`ExperimentData`: status/objective/howItWorks/limitations/takeaways). |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `capabilities/` | "What I Build" capability board (see `capabilities/AGENTS.md`) |
| `experience/` | Journey timeline entries (see `experience/AGENTS.md`) |
| `experiments/` | Lab & prototypes (see `experiments/AGENTS.md`) |
| `notes/` | Notes & articles (see `notes/AGENTS.md`) |
| `pages/` | Page containers; only `home` exists today (see `pages/AGENTS.md`) |
| `projects/` | Project list plus `new/` and `[id]/` editor routes (see `projects/AGENTS.md`) |
| `skills/` | Toolbox / technology entries (see `skills/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- New content type: add the data model to `src/types/index.ts`, add a sidebar link in `components/layout/AdminSidebar.tsx`, then create `content/<type>/page.tsx` (`getEntriesPaged({ type: '<type>' })`) and `<Type>Client.tsx` cloned from `skills/SkillsClient.tsx` (the smallest complete example). Wire `saveDraftAction` / `createEntryAction` with `expectedRevision` for optimistic-concurrency safety.
- The list editors save and publish in the same transition (`saveDraftAction` then `publishEntryAction`) and end with `window.location.reload()`. Keep that order — publishing the pre-save revision would publish stale data.
- Homepage `key` routing uses `getEntryByKey` in `@/lib/cms/service`: `home`/`about`/`contact` hit `/admin/pages/:key`, any other key scans the entry list. `PageSectionItem.props` is intentionally schemaless — section rendering lives in the public frontend, not here.
- `getContentHealth()` validates `hero_poster.featuredProjectId` against unpublished projects and flags missing cover alt text; those warnings surface on the overview and publishing pages.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check per type is a create → edit → publish → delete round-trip against the dev backend.
- Verify pagination by loading `?page=2` — the `page.tsx` reads `searchParams` and passes `page` into `getEntriesPaged`.

### Common Patterns
- `page.tsx` computes `const page = Math.max(1, parseInt(sp.page || '1', 10) || 1)` and passes `key={page}` (or a composite key) to the client so the client remounts when the query changes.
- Editors render a `Modal` for create/edit and a `Modal` for destructive confirmation, both using the shared primitives.

## Dependencies

### Internal
- `@/lib/cms/service` (all reads), `@/app/admin/actions` (all writes), `@/lib/page-blocks`, `@/lib/use-debounced-value`, `@/components/ui/*`, `@/types`.

### External
- next 16, react 19, lucide-react.

<!-- MANUAL: -->
