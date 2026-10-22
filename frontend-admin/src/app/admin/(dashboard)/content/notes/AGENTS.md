<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# notes

## Purpose
Editor for the Notes & Articles section: long-form markdown writing with a category, reading time, excerpt, tags and SEO metadata. Entries are of type `note`.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Parses `?page=`, calls `getEntriesPaged({ type: 'note', sort: 'updated', page, perPage: 10 })` and renders `<NotesClient key={page} initialBundle={bundle} />`. |
| `NotesClient.tsx` | `'use client'` list of note cards with an edit/create `Modal`. The body is edited as one markdown textarea (`markdownBody`); on save it is also split on blank lines into `content: string[]` (`markdownBody.split('\n\n').filter(Boolean)`). On edit, the textarea is seeded from `data.markdownBody` or, failing that, `data.content.join('\n\n')`. Tags are a comma-separated input. SEO is derived automatically: `seo: { title: data.title, description: data.excerpt }`. Save = `saveDraftAction` / `createEntryAction`, then `publishEntryAction`, then `window.location.reload()`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The note body is stored twice on purpose: `data.markdownBody` (raw text) and `data.content` (paragraph array). The public site may read either; keep both in sync when saving.
- `data.tags` is a `string[]` in the model but edited as one comma-separated string; split on `,`, trim, drop empties.
- Notes are sorted by `updated`, so editing an entry moves it to the top of the list.
- SEO title/description are not edited directly — they are derived from the note title and excerpt on every save.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: create a note with markdown → publish → confirm the rendered body and paragraph split on the public note page.
- Verify the round-trip: open an existing note, edit one word, save, reopen — the textarea must show the markdown, not a re-split paragraph list.

### Common Patterns
- Same list + modal + publish-on-save shape as `experiments/` and `skills/`; only the data model and the markdown textarea differ.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntriesPaged`), `@/app/admin/actions` (`saveDraftAction`, `createEntryAction`, `deleteEntryAction`, `publishEntryAction`), `@/components/ui/{Card,Button,Input,Modal,Badge,Pagination}`, `@/types` (`NoteData`).

### External
- next 16, react 19, lucide-react (`Plus`, `Edit2`, `Trash2`, `BookOpen`, `Clock`, `FileText`).

<!-- MANUAL: -->
