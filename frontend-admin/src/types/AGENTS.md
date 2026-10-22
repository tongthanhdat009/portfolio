<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# types

## Purpose
The single TypeScript domain model for the whole admin. Every layer — the CMS service, the server actions, the editors and the UI primitives — imports its types from here, so this file defines the contract between the backend payloads and the screens.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Core types: `ColorAccent` (`sun`/`sky`/`coral`/`lime`/`pink`/`paper`/`surface`), `ContentType` (`page`/`project`/`capability`/`skill`/`experience`/`experiment`/`note`), `EntryStatus` (`draft`/`published`/`archived`), `SeoMetadata`, `CmsEntry<T>`, `CmsPublication<T>`, `CmsRevision`, `MediaAsset`, `AuditLog`, `NavLink`, `SiteSettings` (identity, contact copy, journey chapters, social links, SEO defaults), `Announcement`, `RedirectRule`, `CmsGlobals` (`siteSettings` + `announcement` + `navigation` + `appearance` + `redirects`). Page-builder types: `PageSectionType` (11 block types), `PageSectionItem`, `HomePageData`. Content models: `ProjectCaseStudy`, `ProjectData`, `CapabilityData`, `TechCategory`, `TechnologyData`, `ExperienceData`, `ExperimentData`, `NoteData`. Plus `ContentHealthIssue` with its `blocker`/`warning`/`suggestion` levels. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Add a new content type in three places: the `ContentType` union, a `<Type>Data` interface, and (if it needs its own editor) a `content/<type>/` route. The `ContentType` union is also what `getEntriesPaged` filters on and what the sidebar link points at.
- `CmsEntry<T = any>` is generic over its payload; editors narrow it with `CmsEntry<ProjectData>` and the service casts on the way out. `data` is intentionally untyped by default.
- Enum-like unions are closed sets: `ColorAccent`, `ContentType`, `EntryStatus`, `TechCategory`, `ProjectData['category']`, `ProjectData['status']`, `ExperimentData['status']`, `ExperienceData['type']`, `PageSectionType`. The UI `<Select>` option lists mirror these unions; changing one means updating the matching select options (or the options will fail to typecheck).
- `CmsEntry.key` marks the singleton page entries (`home`, `about`, `contact`); `CmsEntry.slug` is the public route segment (`/work/<slug>` for projects).
- `CmsRevision.snapshot` is typed `any` and is currently always `undefined` in the service mapping.
- Keep `data` payload interfaces serialisable — they travel to the Laravel API as JSON.

### Testing Requirements
- `pnpm -C frontend-admin typecheck` is the real test for this file: every editor's `<Select>` options and every payload literal must still match the unions. No test runner is configured.

### Common Patterns
- Interfaces for entities, string unions for closed value sets, `T = any` generics for entry payloads.
- Field names mirror the backend model (snake_case is not used; the API already speaks camelCase), except the deliberate `seo.ogImage` ↔ `seo.ogMediaId` translation handled in `lib/cms/service.ts`.

## Dependencies

### Internal
- Imported by `@/lib/cms/service`, `@/app/admin/actions`, `@/app/admin/(dashboard)/*`, `@/components/ui/*`. This directory imports nothing local.

### External
- None — plain TypeScript.

<!-- MANUAL: -->
