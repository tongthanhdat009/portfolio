<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# css

## Purpose
The Vite stylesheet entrypoint for the Laravel scaffold. It is a Tailwind CSS v4 stylesheet with no component styles of its own — the CMS backend renders no themed UI, so this file exists only so the welcome page has a built stylesheet.

## Key Files
| File | Description |
|------|-------------|
| `app.css` | `@import 'tailwindcss'`; `@source` globs pointing at the framework's pagination Blade views and the compiled views in `storage/framework/views`; a `@theme` block setting `--font-sans` to Instrument Sans with system-ui and emoji fallbacks |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- Do not add CMS or admin styles here. The visual design of the portfolio lives in the Next.js apps (`frontend/`, `frontend-admin/`), which have their own CSS pipelines.
- Tailwind v4 is configured in CSS via `@theme`, not through a `tailwind.config.js` — there is no config file in this project.
- The `@source` globs must stay in sync with wherever Blade views are rendered from; without them, classes used only inside compiled Blade output would be purged.
- The built output goes to `backend/public/build` and is git-ignored. Do not commit build artifacts.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host lacks the MongoDB PHP extension.
- There is no CSS-level test. The only indirect check is `tests/Feature/ExampleTest.php`, which asserts `GET /` returns 200.

### Common Patterns
- One stylesheet entrypoint, referenced by name in `backend/vite.config.js` and loaded from `resources/views/welcome.blade.php` via `@vite(['resources/css/app.css', 'resources/js/app.js'])`.

## Dependencies

### Internal
- `backend/vite.config.js` — builds this file
- `backend/resources/views/welcome.blade.php` — the only consumer
- `backend/public/build` — build output directory (git-ignored)

### External
- Tailwind CSS v4 — CSS engine imported by this file
- Vite — the bundler configured in `backend/vite.config.js`

<!-- MANUAL: -->
