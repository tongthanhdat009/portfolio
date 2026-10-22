<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# [slug]

## Purpose
The `/work/[slug]` route — a full project case study. It renders the project poster header (category, year, status, title, summary, tags, demo and repo CTAs) followed by seven numbered sections of the `caseStudy` record: specification/overview table, problem and context, key contributions, approach and architecture, implementation highlights, verified outcomes, and challenges and lessons. It ends with a footer linking to the next project.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component. `generateStaticParams()` returns one `{ slug }` per `getProjects()` entry. `generateMetadata()` builds `title: '<title> — Case Study'`, `description: project.summary`, and an `openGraph` block with `type: 'article'`, falling back to `title: 'Project Not Found'`. The page calls `getProjectBySlug(slug)`, calls `notFound()` when null, computes the next project from the list index (wrapping to the first item), and destructures `const { caseStudy } = project` to render the sections |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Next 16 async `params`: `params` is a `Promise<{ slug: string }>` and must be awaited in both `generateMetadata` and the page component.
- `notFound()` must stay immediately after the null check — TypeScript narrows `project` to non-null only because of it.
- Every case-study section dereferences `caseStudy.<field>` directly (no optional chaining): `overview`, `problem`, `contribution[]`, `approach.summary`, `approach.architecturePoints[]`, `highlights[]`, `outcomes[]`, `lessons[]`. A CMS project missing `caseStudy` would break the page — `src/lib/cms/index.ts` guards this with `EMPTY_CASE_STUDY` for API records, but the local fallback in `src/content/projects.ts` always has it.
- The next-project link wraps to the first project when the current one is last.
- Section headings use the `// 01. …` mono-eyebrow convention for the overview block and icon-led headings for the rest.
- The colour rhythm per section: overview on paper, problem on white, contributions on sky, approach on white, highlights on sun, outcomes on lime, lessons on white.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` is required — `generateStaticParams` and `generateMetadata` only run at build time.
- Manual: open a valid slug in `next dev` and confirm all seven sections render; open a bogus slug and confirm the 404 page.

### Common Patterns
- Same detail-page template as `/lab/[slug]` and `/notes/[slug]`: back link → poster header → content sections → footer with "all" and "next" links.
- Metadata is per-slug via `generateMetadata`, including an `openGraph` article block.
- External CTAs go through `ui/Button` with `external`, which renders an `<a target="_blank" rel="noopener noreferrer">`.

## Dependencies

### Internal
- `@/lib/cms` — `getProjectBySlug()`, `getProjects()`
- `@/components/ui/Badge`, `@/components/ui/Button`, `@/components/ui/Icons` (`GithubIcon`)
- `@/types` — `Project`, `ProjectCaseStudy`

### External
- `next` (`next/navigation` `notFound`, `next/link`, `Metadata`), `lucide-react` (`ArrowLeft`, `ArrowUpRight`, `ExternalLink`, `CheckCircle2`, `AlertTriangle`, `Layers`)

<!-- MANUAL: -->
