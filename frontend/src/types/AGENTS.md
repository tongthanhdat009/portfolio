<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/types/` docs

Purpose: Shared domain model for all content, props, and admin actions. Single source of truth for CMS shapes.

Key Files:

| File | Role |
| --- | --- |
| `index.ts` | All interfaces: `SiteSettings`, `HeroData`, `Project`, `Experiment`, `Note`, `Technology`, `ExperienceItem`, `CapabilityItem`, `ColorAccent` |

Subdirectories: none.

For AI Agents:

- Import types with `import { X } from '@/types'`; never redefine a CMS shape locally.
- `ColorAccent` constrains all accent props — reuse it for new color-coded UI.
- Changing an interface requires updating `src/content/*`, `src/lib/cms`, and `src/app/admin/actions.ts` together.
- Test with `pnpm typecheck` from repo root.

Dependencies: internal none; external none.

<!-- MANUAL: -->
