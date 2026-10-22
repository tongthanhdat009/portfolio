<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# types

## Purpose
The shared domain model for the whole site: the shapes of every CMS record, the props the components accept, and the colour accent union. It is the single source of truth for the data contract between `src/content/*`, the CMS API, the adapters in `src/lib/cms`, and the admin console — and it is mirrored by the Laravel backend models.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | All types in one module: `ColorAccent` (`'sun' \| 'sky' \| 'coral' \| 'lime' \| 'pink' \| 'paper' \| 'surface'`), `SiteSettings` (including `journeyChapters`, `socialLinks`, `seoDefaults`), `Announcement`, `HeroData`, `ManifestoData`, `CapabilityItem`, `ProjectCaseStudy` (the seven-field case study: `overview`, `problem`, `contribution`, `approach`, `highlights`, `outcomes`, `lessons`), `Project`, `TechCategory`, `Technology`, `ExperienceItem`, `Experiment`, `Note` (with the optional `toc`) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Import with `import { Project } from '@/types'` — there is no per-type file and no default export.
- Never redefine a CMS shape locally in a page or component. If a field seems missing, add it here and fix the producers.
- `ColorAccent` constrains every `accent` prop in `ui/Card`, `ui/Badge`, and the content interfaces. Adding a colour means updating this union, the `accentBgMap` copies in `src/components/ui/Card.tsx` and `src/components/ui/Badge.tsx`, the `@theme` tokens in `src/styles/globals.css`, and the backend.
- The union types on `Project.category`, `Project.status`, `Experiment.status`, `ExperienceItem.type`, and `TechCategory` are closed sets. A CMS value outside the set is a type error, not a runtime surprise — add the value to the union when the backend introduces it.
- `ProjectCaseStudy.overview` has five fields (`product`, `targetUsers`, `timeline`, `role`, `status`); the detail page reads four of them (`product` is unused there).
- These types are shared with the Laravel backend. Change an interface and the corresponding backend model, the CMS payload shape, and the `to*` converters in `src/lib/cms/index.ts` together.
- `HeroData.headlineLines` is a fixed-length tuple of three strings, not `string[]` — the hero renders exactly three lines.
- `SiteSettings` fields for contact and journey copy (`contactEyebrow`, `journeyIntro`, `journeyChapters`, …) are optional; `src/lib/cms` and the components supply fallbacks.

### Testing Requirements
- `pnpm typecheck` from the repo root is the check that catches a drift between these types and `src/content/*`.
- `pnpm build` when adding a required field — every content module must be updated in the same change or the build fails.

### Common Patterns
- Every interface is exported explicitly; there are no default exports and no namespace barrels.
- Optional fields use `?`; arrays are `Array<{ … }>` inline rather than named sub-interfaces.
- `src/lib/validation/index.ts` imports `Project`, `Experiment`, and `Note` but does not use them — the import is currently dead.

## Dependencies

### Internal
- `src/content/*` — annotated with these types
- `src/lib/cms/index.ts` — maps API payloads onto these types
- `src/components/*` — props typed from here
- `src/app/admin/actions.ts` — serialises records typed by these interfaces

### External
- None — pure TypeScript, no runtime dependencies

<!-- MANUAL: -->
