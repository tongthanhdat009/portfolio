<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# resources

## Purpose
Stock Laravel frontend scaffold only. The CMS has no Blade UI — admin is a separate frontend, delivery is JSON.

## Key Files
| File | Role |
|------|------|
| `views/welcome.blade.php` | Default landing for `/`; untouched placeholder |
| `js/app.js` / `css/app.css` | Default Vite scaffold; unused by the API |

## Subdirectories
Batched: `views/`, `js/`, `css/` — no separate AGENTS.md files.

## For AI Agents
- Do not build CMS screens here. API responses go through `App\Http\Resources\Api\V1\*`.
- Leave scaffold files as-is unless replacing the landing page itself.

## Dependencies
- Internal: `routes/web.php` (`/` → welcome).
- External: none (Vite scaffold only).

<!-- MANUAL: -->
