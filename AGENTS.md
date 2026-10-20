<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

# portfolio

## Purpose
Monorepo portfolio: Laravel CMS API (MongoDB + S3 mock) + public Next.js site + admin Next.js dashboard. Specs in root `*.md`.

## Key Files
| File | Description |
|------|-------------|
| `Makefile` | Dev/test/build shortcuts (`dev`, `test`, `bootstrap`, `owner`) |
| `compose.yaml` | Local infra: mongo :27017, S3 Moto :5000, backend API :9000 |
| `package.json` | Root script forwarder to frontends |
| `pnpm-workspace.yaml` | Workspace: `frontend`, `frontend-admin` |
| `*-spec.md` | Source specs for portfolio, admin CMS, backend architecture |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `backend/` | Laravel CMS API (see `backend/AGENTS.md`) |
| `frontend/` | Public portfolio site :3000 (see `frontend/AGENTS.md`) |
| `frontend-admin/` | Admin dashboard :3001 (see `frontend-admin/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Ports: API :9000 · public :3000 · admin :3001 · mongo :27017 · s3 :5000.
- Full stack: `make dev-infra` then `make dev` (frontends run on host, API in docker — host PHP lacks ext-mongodb).
- Never commit `.env`; backend uses `backend/.env`, frontends `.env.local`.
- Admin seed login: `owner@example.com / ownerpass123` via `make owner`.

### Testing Requirements
- Backend: `make test` (docker `php artisan test`).
- Frontends: root `pnpm typecheck`; per-app `pnpm build`.

### Common Patterns
- CMS data flows backend → both frontends via API adapter (`lib/cms`, `lib/api`); keep types in sync.
- Specs (`*-spec.md`) are source of truth for behavior disputes.

## Dependencies

### Internal
- `frontend/` + `frontend-admin/` → `backend/` API (`http://localhost:9000`)

### External
- Docker (mongo:7, motoserver/moto), pnpm workspaces, Next.js 16, Laravel + mongodb/laravel-mongodb

<!-- MANUAL: -->
