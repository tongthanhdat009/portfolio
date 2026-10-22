<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# styles

## Purpose
The global stylesheet. It holds the entire neo-brutalist design system as Tailwind v4 theme tokens, so every component can reference `var(--color-*)`, `var(--shadow-neo-*)`, `var(--radius-*)` and the font stacks instead of hardcoded values.

## Key Files
| File | Description |
|------|-------------|
| `globals.css` | `@import "tailwindcss"` followed by an `@theme` block defining: `--color-ink` (#111111), `--color-paper` (#FFF9E9), `--color-surface` (#FFFFFF), `--color-sun` (#FFDB58), `--color-sky` (#89CFF0), `--color-coral` (#FF7661), `--color-lime` (#C6F56A), `--color-pink` (#F9A8D4), `--color-warm-line` (#E9DFC9), `--color-muted-text` (#5B5751), `--color-focus` (#0A54E8), `--color-negative` (#B42318), `--color-positive` (#176B3A); the hard-shadow scale `--shadow-neo-sm|md|lg|xl|active` (2/4/6/10/1 px offsets in `#111111`); the radius scale `--radius-sm|md|lg|xl` (4/8/12/16 px); and the font stacks `--font-display` (Space Grotesk), `--font-body` (Manrope), `--font-mono` (IBM Plex Mono). Below that: `:root` page variables (`--bg-paper`, `--text-ink`), a `box-sizing: border-box` reset, the `body` rules, and custom `::-webkit-scrollbar` styling in the neo-brutalist palette. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- This is the only stylesheet; Tailwind v4 is configured CSS-first through `postcss.config.mjs` (`@tailwindcss/postcss`) — there is no `tailwind.config.js`. Add new design tokens inside the `@theme` block so Tailwind generates the matching utilities.
- The fonts are declared as system-font stacks with a web-font name first; no font files are bundled and no `<link>` to Google Fonts exists in the layout. The named faces only resolve if the user has them locally — do not assume the web fonts load.
- Component classes must use the tokens (`bg-[var(--color-sun)]`, `shadow-[var(--shadow-neo-md)]`, `rounded-[var(--radius-sm)]`), never raw hex or px shadows. New tokens are welcome; hardcoded values in components are not.
- `globals.css` is imported once, in `src/app/layout.tsx`. Do not import it anywhere else.
- The scrollbar rules are global and affect the whole app, including the public site if it ever imports this file (it does not).

### Testing Requirements
- `pnpm -C frontend-admin build` (a broken `@theme` block or an invalid CSS value fails the Tailwind/PostCSS pipeline); `pnpm -C frontend-admin typecheck` for the import in `layout.tsx`.
- Visual check in `pnpm dev` (`:3001`): the page background, one card, one button and one badge should show the intended palette and hard shadows.

### Common Patterns
- Token names are semantic (`--color-ink`, `--color-muted-text`, `--color-negative`), not literal (`--color-yellow`); pick a semantic name when adding a colour.
- The neo-brutalist look is: solid dark border, hard offset shadow (no blur), no gradients, flat fills.

## Dependencies

### Internal
- Imported by `@/app/layout.tsx`. Consumed by every component through Tailwind arbitrary-value classes.

### External
- tailwindcss 4, `@tailwindcss/postcss`, postcss 8.

<!-- MANUAL: -->
