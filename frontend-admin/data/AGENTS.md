<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# data

## Purpose
Holds the legacy local CMS store snapshot `cms-store.json` — a full JSON dump of the CMS collections that predates the Laravel backend. Nothing in `src/` reads it at runtime; the live admin talks exclusively to the Laravel API at `:9000`. It is kept as a seed/fixture of realistic portfolio content.

## Key Files
| File | Description |
|------|-------------|
| `cms-store.json` | ~65 KB JSON object with seven arrays mirroring the backend collection names: `cms_entries` (42 entries — 22 skill, 6 capability, 4 project, 4 experience, 3 experiment, 2 note, 1 page), `cms_publications` (2), `cms_revisions` (0), `cms_globals` (1), `cms_media` (3), `cms_audit_logs` (1), `cms_redirects` (0). Entry objects use the same field names as `CmsEntry` in `src/types/index.ts` (`_id`, `type`, `key`, `slug`, `locale`, `title`, `status`, `revision`, `lastPublishedRevision`, `hasUnpublishedChanges`, `sortOrder`, `featured`, `references`, timestamps, `seo`, `data`); `cms_globals[0]` holds `siteSettings` / `announcement` / `navigation` / `appearance` / `redirects`. Statuses: 39 published, 3 draft. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Treat this file as a read-only reference/seed. The admin dashboard does not load it, so editing it changes nothing at runtime.
- The only mention of it in the repo is `frontend-admin/README.md`, which describes it as a MongoDB fallback store — that mechanism no longer exists in the code.
- To use it as seed data, convert entries through the `toEntry` mapping in `src/lib/cms/service.ts` or POST them to the Laravel API; the field names already line up with `@/types`.

### Testing Requirements
- No build or test step touches this directory. If you change the file, validate it parses as JSON and that entry counts still match the dashboard's expectations.

### Common Patterns
- Keep the top-level collection names aligned with the backend (`cms_*`), so a dump/restore script can round-trip the file unchanged.

## Dependencies

### Internal
- Shape mirrors `@/types` (`src/types/index.ts`) and the Laravel CMS collection names.

### External
- None.

<!-- MANUAL: -->
