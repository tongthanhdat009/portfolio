<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# src

## Purpose
Application source for the public portfolio site. `app/` holds the App Router routes and the server-side revalidation webhook, `components/` holds presentational React components grouped by role, `content/` holds the typed local data modules that double as the admin console's persistence target, `lib/` holds the CMS adapter and helpers, `styles/` holds the Tailwind v4 design system, and `types/` holds the shared domain model.

## Key Files
| File | Description |
|------|-------------|
| None at this level | Everything lives in the subdirectories below |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `app/` | App Router routes, root layout, and the CMS revalidation endpoint (see `app/AGENTS.md`) |
| `components/` | Layout shell, homepage sections, and UI primitives (see `components/AGENTS.md`) |
| `content/` | Typed local content modules (`projects.ts`, `notes.ts`, …) used as the CMS fallback (see `content/AGENTS.md`) |
| `lib/` | CMS adapter, HTTP client, admin auth, and form validation (see `lib/AGENTS.md`) |
| `styles/` | Tailwind v4 theme tokens and neo-brutalist utility classes (see `styles/AGENTS.md`) |
| `types/` | Shared interfaces for all CMS content (see `types/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Import via the `@/` prefix (maps to `src/`); never write relative `../../..` chains.
- Default to React Server Components. `'use client'` is required only for state, event handlers, or browser APIs.
- Server components fetch data through `@/lib/cms` accessors only. Do not call `fetch` to the CMS API directly from a page.
- UI primitives live in `components/ui/` — reuse `Button`, `Card`, `Badge` instead of writing new ones.
- Colours come from the `@theme` tokens in `styles/globals.css`; hard-coded hex values are used throughout the existing components, so match the file you are editing.
- Validate changes with `pnpm typecheck` from the repo root (or `pnpm -C frontend typecheck`).

### Testing Requirements
- No unit test runner exists in this app. `pnpm typecheck` (`tsc --noEmit`) and `pnpm build` are the checks.
- `pnpm build` is required for anything touching routes, `generateStaticParams`, or metadata, because `tsc` does not evaluate route handlers.
- Manual checks run against `next dev` on :3000.

### Common Patterns
- Content pipeline: `content/*.ts` → `lib/cms` (CMS API overrides local values when reachable) → page → `components/sections` (props only, no fetching inside components).
- Local content files are written back by the admin server actions as `JSON.stringify`-formatted TypeScript, so their formatting is machine-generated — hand-formatting fights the round-trip.
- Types in `types/index.ts` are shared with the Laravel backend; keep both sides in sync.

## Dependencies

### Internal
- `app/` → `lib/cms` → `lib/api` → `lib/content`
- `components/` → `types/` and `components/ui/`
- `app/admin/actions.ts` → `lib/admin/auth.ts`, `lib/validation`

### External
- `next` (App Router, `next/cache`, `next/navigation`, `next/font/google`), `react` 19, `lucide-react`

<!-- MANUAL: -->
