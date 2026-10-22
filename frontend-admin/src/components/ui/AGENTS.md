<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# ui

## Purpose
The neo-brutalist primitive set shared by every admin screen: Card, Button, Input/Textarea/Select, Badge/StatusBadge, Modal and Pagination. They are the only place where the design tokens are translated into Tailwind classes.

## Key Files
| File | Description |
|------|-------------|
| `Button.tsx` | `forwardRef` button. Variants `primary` (sun), `sun`, `sky`, `lime`, `secondary`, `danger` (coral), `ghost`, `outline`; sizes `sm`/`md`/`lg`; `isLoading` renders an inline SVG spinner and disables the button. Classes are merged with `clsx` + `tailwind-merge`; variants use a translate-on-press neo-brutalist interaction. |
| `Card.tsx` | `forwardRef` container. Variants `surface` / `paper` / `sun` / `sky`, shadows `sm`/`md`/`lg`/`none`, borders `2`/`3`/`4` (all `border-[var(--color-ink)]`). |
| `Input.tsx` | Three exported components — `Input`, `Textarea`, `Select` — sharing `label`, `helperText` and `error` props. Each generates an id from `useId()` (colons stripped) unless one is passed, renders the label with a `*REQ` marker when `required`, and shows the error (`⚠ …`) in place of the helper text when both are present. `Select` accepts either `options: {value,label}[]` or children. |
| `Badge.tsx` | `Badge` (variants `sun`, `sky`, `coral`, `lime`, `pink`, `paper`, `surface`, `neutral`; sizes `sm`/`md`) and `StatusBadge`, which renders `Archived` (neutral), `Live (Draft Changes)` (sun, pulsing dot) when `status === 'published' && hasUnpublishedChanges`, `Live` (lime) and `Draft` (paper). |
| `Modal.tsx` | Client dialog. Registers a `keydown` listener so Escape closes it, renders a fixed overlay with a blurred backdrop, a header (title + optional description + close button with `aria-label`), a body capped at `max-h-[75vh]` with `overflow-y-auto`, and an optional footer slot. Renders `null` when closed. |
| `Pagination.tsx` | Client pager built on `next/link`. Shows a window of page numbers around the current page with ellipses, prev/next links (disabled pages render a `aria-hidden` span instead), and a "Showing X–Y of Z" summary. Writes the page into the query param named by `param` (default `page`) while preserving the rest of the current query. Renders nothing when `totalPages <= 1`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Use `clsx` + `tailwind-merge` for every class merge, and read colors/shadows through `var(--color-*)` and `var(--shadow-neo-*)`. Never hardcode hex values.
- Every component accepts and forwards `className` so callers can adjust layout without a new prop.
- The design language: 2–3 px solid `var(--color-ink)` borders, hard offset shadows, `rounded-[var(--radius-sm|md)]`, uppercase `font-display` labels and `font-mono` for numeric/metadata text.
- Extend an existing primitive instead of adding a near-duplicate. A new variant belongs in the existing `variants` map, not in a new file.
- Accessibility basics already in place: labelled inputs via `useId`, `aria-label` on icon-only buttons, `aria-hidden` on disabled pager controls. Keep them when adding variants.

### Testing Requirements
- No test runner. `pnpm -C frontend-admin typecheck`, then a visual pass in `pnpm dev` (`:3001`): check each variant, the Modal Escape behaviour, the `Select` with `options`, and the pager with more than one page.

### Common Patterns
- Variant maps are plain objects keyed by the variant name, typed via a union in the props interface.
- Icons come from `lucide-react`; never inline SVG unless it is the loading spinner in `Button`.

## Dependencies

### Internal
- `@/styles/globals.css` for the design tokens (no import needed — Tailwind v4 `@theme`).

### External
- clsx, tailwind-merge, next 16 (`next/link`, `next/navigation`), react 19, lucide-react.

<!-- MANUAL: -->
