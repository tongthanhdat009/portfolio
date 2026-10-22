<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# components

## Purpose
Presentational React components, grouped by role: `layout/` is the site shell chrome, `sections/` are the homepage blocks, `ui/` are the reusable primitives every page composes from. No component fetches data — the CMS layer hands them props.

## Key Files
| File | Description |
|------|-------------|
| None at this level | Everything lives in the subdirectories below |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `layout/` | Site shell: skip link, announcement strip, header, footer (see `layout/AGENTS.md`) |
| `sections/` | Homepage blocks composed by `src/app/page.tsx` (see `sections/AGENTS.md`) |
| `ui/` | Neo-brutalist primitives: `Button`, `Card`, `Badge`, brand icons (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Components are typed with `React.FC<Props>` and the props interface is declared in the same file. Keep that pattern; do not introduce default-export components or a separate `types.ts` per component.
- Section and layout components receive data as props and never call `get*` from `@/lib/cms` themselves. The single exception is the admin client, which is a separate app area.
- Server Component by default. `'use client'` is only on components that need state, event handlers, or browser APIs: `Header`, `ToolboxSection`, `ContactSection`, `JourneySection`, and the admin client.
- Reuse `ui/Button`, `ui/Card`, `ui/Badge` instead of writing raw bordered/`<a>` elements — the primitives carry the neo-brutalist border, shadow, and press behaviour.
- Icons: brand SVGs live in `ui/Icons.tsx`; everything else comes from `lucide-react`.
- Colours are hard-coded hex throughout, matching `src/styles/globals.css` tokens (`#FFF9E9` paper, `#111111` ink, `#FFDB58` sun, `#89CFF0` sky, `#FF7661` coral, `#C6F56A` lime, `#F9A8D4` pink, `#5B5751` muted, `#E9DFC9` warm line).

### Testing Requirements
- `pnpm typecheck` from the repo root — the only automated check; there is no unit test runner.
- `pnpm build` after adding or renaming an export, since page imports are resolved at build.
- Manual: check the affected route in `next dev`, including keyboard focus order and the `:focus-visible` ring.

### Common Patterns
- `accent` props take values from the `ColorAccent` union in `@/types` and map to a class via a local `Record<ColorAccent, string>`.
- `neo-border*`, `neo-shadow-*`, `neo-btn-press`, and `neo-card-hover` are plain CSS classes from `src/styles/globals.css` — use them instead of new shadow utilities.
- The layout classes are consistently `max-w-[1280px] mx-auto px-4 md:px-8` for wide pages and `max-w-[900px]`/`max-w-[1000px]` for reading pages.

## Dependencies

### Internal
- `@/types` — `SiteSettings`, `ColorAccent`, and the per-content interfaces
- `@/components/ui/*` — primitives used by sections and layout
- `@/lib/cms` — never imported by components; data arrives as props

### External
- `react`, `next/link`, `next/navigation`, `lucide-react`

<!-- MANUAL: -->
