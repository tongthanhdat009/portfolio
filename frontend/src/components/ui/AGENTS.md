<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# ui

## Purpose
The neo-brutalist primitives that every page and section composes from: the button (which can render as a link), the card surface, the status/tag badge, and the brand SVG icons. Extending the design system happens by adding entries to the existing maps, not by adding components.

## Key Files
| File | Description |
|------|-------------|
| `Button.tsx` | Renders a `<button>`, a `next/link` `<a>`, or an external `<a target="_blank" rel="noopener noreferrer">` depending on the `href` / `external` props. Exports `ButtonVariant` (`primary`, `secondary`, `accent-sky`, `accent-lime`, `accent-coral`, `ghost`) and `ButtonSize` (`sm`, `md`, `lg`), each with a class map. Base classes include `neo-btn-press` |
| `Card.tsx` | A `<div>` combining an `accent` background, a `border` width (`sm`/`md`/`poster` → `neo-border*`), a `shadow` size (`sm`/`md`/`lg`/`xl` → `neo-shadow-*`), and the `neo-card-hover` class when `interactive` is set |
| `Badge.tsx` | A `<span>` pill with a `ColorAccent` background, 2px ink border, `neo-shadow-sm`, and `sm`/`md` sizing |
| `Icons.tsx` | `GithubIcon` and `LinkedinIcon` — inline SVG brand marks with `size` and `className` props, `aria-hidden="true"`, `stroke="currentColor"` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Extend the design system through the maps (`variantStyles`, `sizeStyles`, `accentBgMap`, `borderMap`, `shadowMap`), not through new components.
- `Card.tsx` and `Badge.tsx` keep their own copy of `accentBgMap` — the same `Record<ColorAccent, string>` in both files. When a colour is added, update both.
- `accent` values are constrained by the `ColorAccent` union in `@/types` (`sun`, `sky`, `coral`, `lime`, `pink`, `paper`, `surface`). Adding a colour means updating `@/types`, both `accentBgMap` copies, and the `@theme` tokens in `src/styles/globals.css`.
- `Button` accepts `React.ButtonHTMLAttributes<HTMLButtonElement>`, so `type`, `disabled`, `onClick`, and `aria-*` pass through to the `<button>` branch only.
- `Button` with `href` and `external` renders a plain `<a>`; `href` without `external` renders `next/link` for client-side navigation. Use `external` for absolute URLs.
- Icons take `size` (default 16) and `className`; add new brand SVGs here rather than inlining them in pages.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after changing an export.
- Manual in `next dev`: check the press effect (`neo-btn-press` shifts the element toward the shadow on hover, back on active), the `:focus-visible` ring, and that external buttons open in a new tab with `rel="noopener noreferrer"`.

### Common Patterns
- Colours are hard-coded hex values in the maps, matching the `@theme` tokens in `src/styles/globals.css`.
- Components use `React.FC<Props>` with the props interface declared in the same file; the props interface is not exported.
- `className` is always appended last so callers can override styles.

## Dependencies

### Internal
- `@/types` — `ColorAccent`
- `src/styles/globals.css` — `neo-*` classes and `@theme` tokens

### External
- `react`, `next/link`

<!-- MANUAL: -->
