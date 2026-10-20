<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/components/ui/` docs

Purpose: Neo-brutalist primitives shared by every page and section: buttons, cards, badges, and brand icons.

Key Files:

| File | Role |
| --- | --- |
| `Button.tsx` | Link-or-button with `variant`/`size` maps; use for all CTAs |
| `Card.tsx` | Bordered surface with `accent`/`shadow`/`interactive` props |
| `Badge.tsx` | Status and tag pill keyed by `ColorAccent` |
| `Icons.tsx` | `GithubIcon`, `LinkedinIcon` SVG brand icons |

Subdirectories: none.

For AI Agents:

- Extend via new `variant`/`accent` map entries, not new components.
- Colors come from `@theme` tokens in `src/styles/globals.css`; hardcode hex only to match existing files.
- Icons take `size` + `className`; add brand SVGs here, not inline in pages.

Dependencies: internal `@/types` (`ColorAccent`); external `react`, `next/link`, `clsx`/`tailwind-merge` where used.

<!-- MANUAL: -->
