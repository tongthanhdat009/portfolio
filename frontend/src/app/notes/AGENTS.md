<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# notes

## Purpose
The `/notes` route — the index of written field notes and technical articles. Each note is rendered as a card with its category chip, read time, title, excerpt, publish date, and a "Read Article" link. This directory holds the index; the detail pages live in `[slug]/`.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component. Static `metadata` (`title: 'Field Notes & Writing'`). Fetches `getNotes()` and renders a 1/2/3-column responsive grid of `ui/Card`s. Each card shows the `note.category` chip, a `Clock` icon with `note.readTime`, the title linked to `/notes/<slug>`, the excerpt, `note.publishedAt`, and a "Read Article" link |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `[slug]/` | `/notes/[slug]` — article reader page (see `[slug]/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Server Component — no `'use client'`. Data comes from `getNotes()` only.
- The card grid is `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`; the homepage `NotesSection` shows only the first three notes, so this index is the full list.
- The card uses `accent="surface"` (white) with `interactive={true}`; the title colour shifts to coral on group hover.
- External links are not used here — a note links only to its own detail page.
- The header block (eyebrow `// TECHNICAL NOTES & WRITING`, oversized title `NOTES FROM THE BUILD`, intro paragraph) is hard-coded in the page, not driven by CMS content. The CMS-backed equivalent for the homepage is `homePage.notes` (`SectionHeader`), see `src/lib/cms/index.ts`.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` — the index is statically generated and `[slug]`'s `generateStaticParams` reads the same accessor.
- Manual: load `/notes` in `next dev`, open one card, confirm the detail page renders.

### Common Patterns
- Same shell as `/work` and `/lab`: breadcrumb → eyebrow + oversized uppercase title with `border-b-4` → card grid.
- `getNotes(category?)` accepts an optional category filter; this page calls it without one.
- Dates are pre-formatted strings (`publishedAt: '2026-03-12'`) and read times are strings (`'7 min read'`) — there is no date formatting logic in the page.

## Dependencies

### Internal
- `@/lib/cms` — `getNotes()`
- `@/components/ui/Card`
- `@/types` — `Note`

### External
- `next` (`next/link`, `Metadata`), `lucide-react` (`ArrowLeft`, `ArrowUpRight`, `BookOpen`, `Clock`)

<!-- MANUAL: -->
