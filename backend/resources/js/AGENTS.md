<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# js

## Purpose
The Vite JavaScript entrypoint for the Laravel scaffold. The CMS backend is a JSON API with no client-side behaviour of its own, so this file is intentionally empty — it exists only because `backend/vite.config.js` references it and `resources/views/welcome.blade.php` loads it through `@vite`.

## Key Files
| File | Description |
|------|-------------|
| `app.js` | A single comment line and nothing else — no imports, no application code |

## Subdirectories
None — this is a leaf directory.

## For AI Agents

### Working In This Directory
- Do not add frontend behaviour here. The admin console is the Next.js app in `frontend-admin/` and the public site is `frontend/`; both talk to `/api/v1` over HTTP.
- Keep `app.js` as the single Vite entrypoint referenced in `backend/vite.config.js`. If you add a second entry, update `vite.config.js` and the `@vite` call in the welcome view together.
- Do not import npm packages into this file — the backend has no client-side dependency tree to justify one.

### Testing Requirements
- `docker compose exec backend php artisan test` from the repo root, or `composer test` inside `backend/`. The bare host has no MongoDB PHP extension.
- No JavaScript test exists for this scaffold. The only indirect check is `tests/Feature/ExampleTest.php` asserting `GET /` returns 200.

### Common Patterns
- The file is a comment-only placeholder, matching the stock Laravel skeleton.

## Dependencies

### Internal
- `backend/vite.config.js` — builds this entrypoint
- `backend/resources/views/welcome.blade.php` — loads it via `@vite`
- `backend/package.json` — the build scripts (`npm run build`)

### External
- Vite — the bundler configured in `backend/vite.config.js`

<!-- MANUAL: -->
