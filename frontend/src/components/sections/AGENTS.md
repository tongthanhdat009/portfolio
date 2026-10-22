<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# sections

## Purpose
The homepage blocks, rendered in order by `src/app/page.tsx`: a poster hero, a keyword marquee, the manifesto, capabilities, featured work, the toolbox shelf, the journey timeline, the lab grid, the notes grid, and the contact finale. Each block is bound to one CMS content type and receives it as props.

## Key Files
| File | Description |
|------|-------------|
| `HeroSection.tsx` | Server component. The 12-column asymmetric poster canvas: eyebrow tag, status sticker, oversized three-line headline (`data.headlineLines`), intro, primary/secondary CTAs, bottom keyword strip, and an optional "Featured Build // 01" card for `featuredProject` |
| `MarqueeSection.tsx` | Server component. CSS-only keyword ribbon. Triples `items` and animates `translateX(-50%)` via the `animate-neo-marquee` class; pauses on hover/focus through the `.marquee-container` rules |
| `AboutSection.tsx` | Server component. Manifesto block — section label, headline, body, value chips as `ui/Badge`s, and a CTA to `data.ctaHref`. `id="about"` |
| `CapabilitiesSection.tsx` | Server component. 3-column grid of `ui/Card`s. A local `iconMap` maps `CapabilityItem.iconKey` to a lucide icon (`layout`, `server`, `bot`, `cpu`, `wrench`, `flask`). `id="capabilities"` |
| `FeaturedWorkSection.tsx` | Server component. One hero project card (first `featured`, else the first project) plus up to four more in a grid; each links to `/work/<slug>` with demo/repo links. `id="work"` |
| `ToolboxSection.tsx` | `'use client'`. Category filter (`All` + the six `TechCategory` values) over `technologies`, with client-side pagination at 8 items per page. `id="toolbox"` |
| `JourneySection.tsx` | `'use client'`. The experience timeline grouped into chapters. A local `CHAPTER_META` map provides the default title/subtitle/accent per experience `type`; `settings.journeyChapters` overrides them. A chapter jump group (`role="group"`, `aria-label="Jump to chapter"`) filters the list. `id="journey"` |
| `LabSection.tsx` | Server component. Grid of experiment cards with a local `statusBadgeStyles` map, linking to `/lab/<slug>`. Header text comes from the `header` prop. `id="lab"` |
| `NotesSection.tsx` | Server component. Three-column grid of the first three notes, linking to `/notes/<slug>`. Header text comes from the `header` prop. `id="notes"` |
| `ContactSection.tsx` | `'use client'`. The closing poster: headline, email copy-to-clipboard with a `copied` confirmation, social links, and the resume link. `id="contact"` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Props-only: no section fetches data. All CMS values arrive from `src/app/page.tsx`.
- Three sections are client components — `ToolboxSection`, `JourneySection`, `ContactSection`. The rest are server components; do not add `'use client'` to them.
- `ToolboxSection` keeps its own `page` state and resets it to 1 whenever the category changes. Changing the filter without resetting the page can show an empty grid.
- `JourneySection` validates an override accent against a local `VALID_ACCENTS` array and falls back to `paper` for unknown values — keep that guard if you add accent handling.
- Icon maps are local per file (`iconMap` in `CapabilitiesSection`, `typeIconMap` and `CHAPTER_META` in `JourneySection`). Add new keys there, not inline in JSX.
- `LabSection` duplicates the status style map that also exists in `src/app/lab/page.tsx`. Keep both in sync.
- Section anchors (`id`) are used by in-page links and by `Header`/`Footer` navigation — they must stay unique.
- Rendered eyebrow numbering runs 01–09 (`Hero` 01, `Marquee` unnumbered, `Manifesto` 02, `Capabilities` 03, `Case Studies` 04, `Toolbox` 05, `Timeline` 06, `Experiments` 07, `Field Logs` 08, `Final Poster` 09). The `page.tsx` comments number them 02–11 — trust the rendered eyebrows.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after changing a section's props or exports.
- Manual in `next dev` on `/`: check each anchor link scrolls to its section, the marquee pauses on hover, the toolbox filter and pagination work, and the contact copy button reports success.

### Common Patterns
- Wide layout is `max-w-[1280px] mx-auto px-4 md:px-8`; every section has a `border-b-4 border-[#111111]` separator and a `py-16 md:py-24` rhythm.
- Section headers use a `font-mono` eyebrow (`// 0X. NAME`) plus an uppercase `font-display` headline, separated by `border-b-3 border-[#111111]`.
- Cards reuse `ui/Card` with `accent` / `border` / `shadow` / `interactive`.

## Dependencies

### Internal
- `@/types` — `HeroData`, `ManifestoData`, `CapabilityItem`, `Project`, `Technology`, `TechCategory`, `ExperienceItem`, `Experiment`, `Note`, `SiteSettings`, `ColorAccent`
- `@/components/ui/Card`, `@/components/ui/Badge`, `@/components/ui/Button`, `@/components/ui/Icons`
- Composed by `src/app/page.tsx`

### External
- `react`, `next/link`, `lucide-react`

<!-- MANUAL: -->
