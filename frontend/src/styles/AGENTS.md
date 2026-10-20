<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/styles/` docs

Purpose: Single Tailwind v4 stylesheet defining the neo-brutalist design system consumed by every route.

Key Files:

| File | Role |
| --- | --- |
| `globals.css` | `@theme` tokens, `.neo-*` utilities, marquee keyframes, focus/reduced-motion rules |

Subdirectories: none.

For AI Agents:

- Tokens live in `@theme` (`--color-*`, `--shadow-neo-*`, `--font-*`); reference as `bg-sun`, `shadow-neo-md`, `font-display`, etc.
- Custom classes (`.neo-border`, `.neo-shadow-*`, `.neo-btn-press`) are plain CSS — extend there, not in components.
- Keep the `prefers-reduced-motion` block and `:focus-visible` ring on any change.
- Test by running `next dev` and eyeballing one page; `pnpm typecheck` does not cover CSS.

Dependencies: internal none (imported once by `src/app/layout.tsx`); external `tailwindcss` v4.

<!-- MANUAL: -->
