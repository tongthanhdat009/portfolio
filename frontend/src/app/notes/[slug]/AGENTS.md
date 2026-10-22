<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# [slug]

## Purpose
The `/notes/[slug]` route — the article reader. It renders a poster header (category chip, publish date, read time, title, excerpt, tags), an optional table of contents built from `note.toc`, the article body as a sequence of paragraphs with headings interleaved from the TOC, and a footer linking to the next note.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component. `generateStaticParams()` returns one `{ slug }` per `getNotes()` entry. `generateMetadata()` builds `title: '<title> — Field Note'` and `description: note.excerpt`, falling back to `title: 'Article Not Found'`. The page calls `getNoteBySlug(slug)`, calls `notFound()` when null, then computes the next note from the list index (wrapping to the first item). The body loop maps `note.content` paragraphs and, for each index, inserts the matching `note.toc[idx]` heading with `id={matchingHeading.id}` as the anchor target |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Next 16 async `params`: `params` is a `Promise<{ slug: string }>` and must be awaited in both `generateMetadata` and the page component.
- `notFound()` must stay right after the null check — TypeScript narrowing depends on it.
- The TOC and the body are coupled **by array index**: `note.toc[idx]` is treated as the heading that precedes `note.content[idx]`. That is a fragile contract — if the CMS returns a TOC whose length differs from `content.length`, headings and paragraphs misalign. Fix it at the source (keep `toc` and `content` aligned in `src/content/notes.ts` and in the CMS record) rather than reordering in the renderer.
- The TOC block only renders when `note.toc && note.toc.length > 0`.
- The table of contents is an `<aside aria-label="Table of Contents">` with anchor links `#<toc id>`; the heading `id` must match the TOC `id` exactly.
- The body uses Tailwind `prose prose-lg` classes, but the site defines no `@tailwindcss/typography` plugin — the prose classes have no effect. The visual styling comes from the explicit classes on the `<div>` and `<p>` elements. Do not assume typography styles apply.
- The next-note link wraps to the first note when the current one is last.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` is required — `generateStaticParams` and `generateMetadata` only run at build time.
- Manual: open a note with a TOC and click a TOC entry to confirm the anchor scrolls; open a bogus slug and confirm the 404 page renders.

### Common Patterns
- Same detail-page template as `/work/[slug]` and `/lab/[slug]`: back link → poster header → content → footer with "all" and "next" links.
- Tags are rendered as `ui/Badge` with `accent="paper"` and a small `Tag` icon.
- `getNoteBySlug` prefers the CMS publication and falls back to the local `src/content/notes.ts` record.

## Dependencies

### Internal
- `@/lib/cms` — `getNoteBySlug()`, `getNotes()`
- `@/components/ui/Badge`
- `@/types` — `Note`

### External
- `next` (`next/navigation` `notFound`, `next/link`, `Metadata`), `lucide-react` (`ArrowLeft`, `Clock`, `Calendar`, `Tag`, `ArrowUpRight`)

<!-- MANUAL: -->
