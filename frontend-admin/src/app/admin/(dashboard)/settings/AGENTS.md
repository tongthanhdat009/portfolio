<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# settings

## Purpose
Editor for the site globals: identity and contact copy, the journey chapter definitions, the announcement strip, navigation links, the appearance accent preset, SEO defaults and the redirect table. Saving writes the globals snapshot and publishes it immediately.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Fetches with `getGlobals()` and renders `<SettingsClient initialGlobals={globals} />`. |
| `SettingsClient.tsx` | `'use client'` tabbed globals editor (29 KB). Tabs: `identity`, `contact`, `journey`, `announcement`, `navigation`, `appearance`, `seo`, `export`. Holds local state for site title, owner name, tagline, description, logo text, contact email, resume URL, contact copy (eyebrow/heading/intro), social links, journey copy plus a `journeyChapters` array (defaulted to `DEFAULT_JOURNEY_CHAPTERS`: Work, Education, Research, Community, Milestone), the announcement fields, `navLinks` with up/down reordering, `accentPreset`, and the SEO template + keywords. `handleSave` posts the assembled globals through `updateGlobalsAction`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- `updateGlobals` in `@/lib/cms/service` does three things: it merges the payload into the globals resource under key `site` (PATCH with `expectedRevision`), it immediately POSTs `/admin/globals/site/publish` so the public site picks the change up (there is no separate publish step in the UI), and it diff-syncs the redirect table — deleting rules that were removed, recreating changed ones and adding new ones.
- Because globals are published on every save, a mis-typed setting goes live immediately. There is no draft step to fall back on.
- `getGlobals()` reads the resource and then unwraps the payload one more level (`site = data?.data ?? {}`) because the API nests the editable object under `data`. `updateGlobals` mirrors that with `current?.data ?? {}`. If the API envelope changes, both must change together.
- The journey chapters default to five fixed entries with accents (`lime`, `sky`, `coral`, `sun`, `pink`); `JOURNEY_ACCENTS` lists the allowed accent values and must stay a subset of `ColorAccent` in `@/types`.
- The navigation reorder buttons only change the array order locally; the array is persisted as part of the globals payload, so order is preserved by the backend as sent.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check per tab: change a value, save, reload the public site and confirm it updated without a separate publish action.
- Redirects: add one, change one and delete one, then confirm the API's redirect list matches exactly (the diff-sync deletes and recreates on change).

### Common Patterns
- Long tabbed client editor seeded from a single `initialGlobals` prop; the local `globals` state is the working copy and the server is the source of truth on reload.
- Reorderable lists (navigation, journey chapters) use ArrowUp / ArrowDown buttons that swap array entries rather than drag-and-drop.

## Dependencies

### Internal
- `@/lib/cms/service` (`getGlobals`), `@/app/admin/actions` (`updateGlobalsAction`), `@/components/ui/{Card,Button,Input,Badge}`, `@/types` (`CmsGlobals`, `ColorAccent`, `NavLink`).

### External
- next 16, react 19, lucide-react.

<!-- MANUAL: -->
