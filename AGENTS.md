<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# portfolio

## Purpose
Monorepo for a developer portfolio: a headless Laravel CMS API over MongoDB + S3, a public Next.js site, and a Next.js admin dashboard that edits CMS content. Behaviour is defined by the three root-level `*-spec.md` files; code cites them as `spec X.Y` in docblocks.

## Key Files
| File | Description |
|------|-------------|
| `Makefile` | Dev aliases: `install`, `dev`, `dev-bg`, `dev-stop`, `urls`, `open`. No `test` or `owner` target. |
| `compose.yaml` | Local infra: `mongo` :27017, `backend` :9000, `s3` (Moto mock) :5000 |
| `package.json` | Root script forwarder into the two Next.js apps (`pnpm -C <app> ...`) |
| `pnpm-workspace.yaml` | Workspace members: `frontend`, `frontend-admin` |
| `pnpm-lock.yaml` | Lockfile for both frontends |
| `README.md` | Public-site feature overview, project tree, dev commands |
| `backend/README.md` | Backend setup, Docker commands, outbox worker, spec §12 roadmap |
| `.gitignore` | Ignores `node_modules/`, `.next/`, `backend/.env`, `.env*.local`, tooling dirs |
| `modern-neobrutal-dev-portfolio-spec.md` | Spec for the public portfolio site (Neo-brutalist design system, routes, content model) |
| `modern-neobrutal-portfolio-admin-cms-spec.md` | Spec for the admin CMS dashboard (content types, editors, publishing) |
| `laravel-mongodb-s3-portfolio-cms-backend-architecture.md` | Backend spec (API contract, MongoDB schema, publish/outbox, media) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `backend/` | Laravel CMS API (see `backend/AGENTS.md`) |
| `frontend/` | Public portfolio site, Next.js App Router :3000 (see `frontend/AGENTS.md`) |
| `frontend-admin/` | Admin dashboard, Next.js App Router :3001 (see `frontend-admin/AGENTS.md`) |

Tooling scratch dirs (`.omc/`, `.omo/`, `.freebuff/`, `.playwright-mcp/`) and `backend/vendor/`, `backend/storage/`, `**/node_modules/`, `**/.next/` are intentionally not documented.

## For AI Agents

### Working In This Directory
- Ports: API :9000 · public :3000 · admin :3001 · Mongo :27017 · S3 mock :5000.
- Full stack: `make dev` (parallel) or `make dev-bg` (background, logs to `.make-dev-*.log`, PIDs in `.make-dev-*.pid`) or `make dev-stop`.
- The API runs inside Docker — host PHP lacks `ext-mongodb`, so `artisan serve` on the host is not an option. Frontends run on the host.
- Never commit `backend/.env` or `frontend*/.env.local`; both are gitignored.
- Bootstrap the backend owner inside Docker: `docker compose exec backend php artisan cms:create-owner owner@example.com` (then `cms:bootstrap-indexes` for Mongo indexes).
- The public site's local `/admin` console is PIN-guarded by `ADMIN_PIN` (default `neo2026`) via the `portfolio_admin_auth` cookie — this is separate from the CMS dashboard in `frontend-admin/`.
- Composer on the host needs `--ignore-platform-req=ext-mongodb`.

### Testing Requirements
- Backend: `docker compose exec backend php artisan test` from the repo root (27 tests: Auth 8, entries/publish 9, pages+globals 3, media 5, skeleton 2). Bare-host `php artisan test` fails without the MongoDB extension.
- Frontends: `pnpm typecheck` (runs both apps) and `pnpm build` / `pnpm build:admin` at the root. No unit test runner is wired up.

### Common Patterns
- Root `*-spec.md` files are the source of truth for behaviour disputes; code references them as `spec X.Y`.
- CMS data flows backend → both frontends through adapter modules (`frontend/src/lib/cms`, `frontend-admin/src/lib/cms`, `frontend-admin/src/lib/api`); keep shared types in sync across the three apps.
- Publishing is a two-stage flow: drafts in `cms_entries` → published snapshots in `cms_publications` → outbox worker signs an HMAC request to the frontend revalidate endpoint.
- MongoDB models use `$table` (package v5 does not read `$collection`) and must not cast BSON array fields to `'array'`.

## Dependencies

### Internal
- `frontend/` and `frontend-admin/` → `backend/` API at `http://localhost:9000`
- `backend/` → `frontend/` revalidate endpoint after publish

### External
- Docker (mongo:7, motoserver/moto), pnpm workspaces, Next.js 16, Tailwind CSS v4, Laravel + `mongodb/laravel-mongodb` + Sanctum

<!-- MANUAL: -->
