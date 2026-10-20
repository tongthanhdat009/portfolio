<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/components/sections/` docs

Purpose: Homepage blocks rendered in order by `src/app/page.tsx` (hero poster through contact finale), each bound to one CMS content type.

Key Files:

| File | Role |
| --- | --- |
| `HeroSection.tsx` | Poster hero with featured project card |
| `FeaturedWorkSection.tsx` | Filtered featured-projects grid |
| `ToolboxSection.tsx` | Client-side category filter over technologies |
| `ContactSection.tsx` | Client email copy + form; mirrors `/contact` validation |
| `MarqueeSection.tsx` | CSS-marquee keyword ribbon (pauses on hover/focus) |

Subdirectories: none.

Other sections (`About`, `Capabilities`, `Journey`, `Lab`, `Notes`) are thin server-rendered mappers from props to `ui/Card` + `ui/Badge`; read the file directly — props match the `@/types` interface of the same name.

For AI Agents:

- Props-only: no data fetching inside sections; add new homepage blocks in `page.tsx` composition order.
- `ToolboxSection` and `ContactSection` are `'use client'`; keep the rest server components.
- Reuse `accent` prop values from `ColorAccent`; icon maps are local per file (`iconMap`, `typeIconMap`).

Dependencies: internal `@/types`, `@/components/ui/*`; external `react`, `next/link`, `lucide-react`.

<!-- MANUAL: -->
