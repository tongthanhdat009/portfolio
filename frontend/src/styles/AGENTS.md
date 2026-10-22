<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# styles

## Purpose
The single stylesheet for the whole site. It defines the Tailwind v4 design tokens (colour, shadow, radius, font) and the plain-CSS neo-brutalist utility classes that every component uses — hard borders, hard offset shadows, and the press/hover tactile behaviour.

## Key Files
| File | Description |
|------|-------------|
| `globals.css` | `@import "tailwindcss"` then an `@theme` block with the design tokens: colours `--color-ink` `#111111`, `--color-paper` `#FFF9E9`, `--color-surface` `#FFFFFF`, `--color-sun` `#FFDB58`, `--color-sky` `#89CFF0`, `--color-coral` `#FF7661`, `--color-lime` `#C6F56A`, `--color-pink` `#F9A8D4`, `--color-warm-line` `#E9DFC9`, `--color-muted-text` `#5B5751`, `--color-focus` `#0A54E8`, `--color-negative` `#B42318`, `--color-positive` `#176B3A`; shadows `--shadow-neo-sm/md/lg/xl/active`; radii `--radius-sm/md/lg/xl`; fonts `--font-display` (Space Grotesk), `--font-body` (Manrope), `--font-mono` (IBM Plex Mono). Then base rules (box-sizing, `html`/`body` colours, heading defaults) and the utility classes: `.neo-border-sm/-/-poster`, `.neo-shadow-sm/md/lg/xl`, `.neo-btn-press`, `.neo-card-hover`, the `:focus-visible` ring, the `@keyframes neo-marquee` animation with `.animate-neo-marquee` and the `.marquee-container` pause rules, and the `prefers-reduced-motion` block |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- This is the only stylesheet; there is no `tailwind.config.js`. Tailwind v4 reads the design system from the `@theme` block via the `@tailwindcss/postcss` plugin configured in `postcss.config.mjs`.
- Tokens are referenced as Tailwind utilities: `bg-sun`, `text-ink`, `shadow-neo-md`, `rounded-md`, `font-display`, `font-mono`. Add a token in `@theme` to make a new utility available everywhere.
- The `.neo-*` classes are plain CSS, not Tailwind utilities. Extend them here rather than adding new one-off shadow or border classes to components.
- The site uses hard-coded hex values in components too (e.g. `bg-[#FFDB58]`); both refer to the same palette. When changing a colour, change the `@theme` token and the matching hex occurrences.
- Keep the `:focus-visible` rule and the `prefers-reduced-motion` block intact on any change — they are the accessibility floor for the whole site.
- `html { scroll-behavior: smooth; }` is disabled under `prefers-reduced-motion`, and the marquee animation is replaced by a static wrapped list.
- This file is imported once, by `src/app/layout.tsx` (`import '@/styles/globals.css'`).

### Testing Requirements
- `pnpm typecheck` and `pnpm build` do not validate CSS. Run `next dev` and load `/` plus one index page to confirm the tokens still resolve.
- Check that no class was renamed or removed: `grep -r "neo-" src/` should show every usage still matching a definition here.
- Verify the focus ring is visible on every interactive element and that the marquee is static under reduced motion.

### Common Patterns
- Tokens first, raw hex only when matching an existing file.
- Hard shadows are solid offsets (`5px 5px 0 #111111`), never blurs — that is the neo-brutalist signature.
- The press interaction moves the element toward its shadow on hover and back on `:active`.

## Dependencies

### Internal
- `src/app/layout.tsx` — the only importer
- `src/components/ui/*` — the accent maps mirror the `@theme` colours

### External
- `tailwindcss` ^4.3.3 via `@tailwindcss/postcss`

<!-- MANUAL: -->
