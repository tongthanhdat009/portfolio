<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# src/app/admin/(dashboard)/content/

Purpose: One editor per content type plus the homepage section builder and the project editor with its own sub-routes. Every leaf follows the same shape: `page.tsx` fetches with a `getEntries({ type })` filter, `*Client.tsx` edits and saves via `saveDraftAction` / `createEntryAction`.

## Key Files

| File | Role |
|------|------|
| `projects/ProjectsClient.tsx` (350 lines) | Project list with category filter, search, featured toggle, publish/unpublish/archive actions |
| `projects/ProjectEditorClient.tsx` (856 lines) | Full project form incl. nested `caseStudy` (overview/problem/contribution/approach/highlights/outcomes/lessons), SEO tab, media picker tab; shared by `new/` and `[id]/` routes via `isNew` prop |
| `projects/[id]/page.tsx` | `getEntryById(id)` (note: no type check — any entry id renders in the project form); `notFound()` on miss |
| `projects/new/page.tsx` | Renders `ProjectEditorClient isNew` with no fetch |
| `pages/home/HomePageBuilderClient.tsx` (600 lines) | Section list editor: reorder, enable/disable, per-section props, `hero_poster.featuredProjectId` validated by `getContentHealth` against unpublished projects; receives `allProjects` options from its page |
| `skills/SkillsClient.tsx` (254 lines) | Technology entries (`TechnologyData`: name/category/context/featured/order) |
| `capabilities/CapabilitiesClient.tsx` (215 lines) | Capability entries (`CapabilityData`: code/title/description/accent/iconKey/relatedWorkLink/order), `sort: 'order'` |
| `experience/ExperienceClient.tsx` | Journey entries (`ExperienceData`), `notes/NotesClient.tsx` markdown notes (`NoteData`), `experiments/ExperimentsClient.tsx` lab entries (`ExperimentData`) — same list+form shape as skills/capabilities |

No per-leaf guides: leaf dirs contain only `page.tsx` + `*Client.tsx` and differ only by content-type model from `@/types`.

## For AI Agents

- New content type: add model to `types/index.ts`, sidebar link in `AdminSidebar.tsx`, `content/<type>/page.tsx` (`getEntries({ type: '<type>' })`) + `<Type>Client.tsx` cloned from `SkillsClient.tsx` (smallest full example), wire `saveDraftAction`/`createEntryAction` with `expectedRevision` for optimistic-concurrency safety.
- Homepage `key` routing uses `getEntryByKey` (`home`/`about`/`contact` hit `/admin/pages/:key`, others scan entries); keep `PageSectionItem.props` schemaless — section rendering lives in the public frontend, not here.
- Testing: `pnpm typecheck`; manual check is create → edit → publish round-trip per type against dev backend.

## Dependencies

Internal: `@/lib/cms/service`, `@/app/admin/actions`, `@/components/ui/*`, `@/types`. External: `lucide-react`, `next`.

<!-- MANUAL: -->
