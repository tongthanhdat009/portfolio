<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# [slug]

## Purpose
The `/lab/[slug]` route — the detail page for a single experiment. It renders the experiment log header (status chip, title, summary, tags, demo and repo CTAs) followed by four conditional content blocks: objective, how it works, limitations, and takeaways, then a footer linking to the next experiment.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component. `generateStaticParams()` returns one `{ slug }` per `getExperiments()` entry. `generateMetadata()` builds `title: '<title> — Lab Experiment'` and `description: exp.summary`, falling back to `title: 'Experiment Not Found'`. The page calls `getExperimentBySlug(slug)`, calls `notFound()` when it is null, then computes the next experiment from the list index (wrapping to the first item) and renders the article |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Next 16 async `params`: `params` is a `Promise<{ slug: string }>` and must be awaited — both in `generateMetadata` and in the page component. Do not destructure it synchronously.
- The `notFound()` call must stay immediately after the null check — TypeScript narrows `exp` to non-null only because of it.
- The four content blocks are conditional (`exp.objective &&`, `exp.howItWorks &&`, `exp.limitations &&`, `exp.takeaways &&`), so a CMS record with empty strings silently omits that section.
- `getExperimentBySlug` returns the API publication when the CMS has one, otherwise falls back to the local `src/content/experiments.ts` record — both paths must produce the same shape.
- The "next experiment" link wraps to the first experiment when the current one is last; keep that wrap-around behaviour.
- Layout classes: `neo-border-poster` header, then `neo-border neo-shadow-md` section cards, with the limitations card on coral (`#FF7661`) and takeaways on lime (`#C6F56A`).

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` is required here — `generateStaticParams` and `generateMetadata` are only evaluated during a build, not by `tsc`.
- Manual: navigate to a valid slug and to a bogus one; the bogus one must render `src/app/not-found.tsx`.

### Common Patterns
- Follows the same detail-page template as `/work/[slug]` and `/notes/[slug]`: back link → poster header → content sections → footer with "all" and "next" links.
- Metadata is per-slug via `generateMetadata`, with a fallback title for unknown slugs.
- External CTAs go through `ui/Button` with `external`, which renders an `<a target="_blank" rel="noopener noreferrer">`.

## Dependencies

### Internal
- `@/lib/cms` — `getExperimentBySlug()`, `getExperiments()`
- `@/components/ui/Badge`, `@/components/ui/Button`, `@/components/ui/Icons` (`GithubIcon`)
- `@/types` — `Experiment`

### External
- `next` (`next/navigation` `notFound`, `next/link`, `Metadata`), `lucide-react` (`ArrowLeft`, `ArrowUpRight`, `ExternalLink`, `Target`, `Cpu`, `AlertTriangle`, `Lightbulb`)

<!-- MANUAL: -->
