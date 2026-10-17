.PHONY: dev dev-infra dev-front dev-admin down ps logs test bootstrap owner build

# Full local stack: Mongo + S3 mock + Laravel API (docker) and both Next.js apps (host).
# Ports — API :8000 · public :3000 · admin :3001 · mongo :27017 · s3 :5000.
dev: dev-infra
	@echo "==> public      http://localhost:3000"
	@echo "==> admin       http://localhost:3001/admin  (owner@example.com / ownerpass123)"
	@echo "==> api         http://localhost:8000/up"
	pnpm -C frontend dev & \
	pnpm -C frontend-admin dev & \
	wait

# Infra only (mongo + s3 + backend API).
dev-infra:
	docker compose up -d --build

# Frontends only (assumes infra already up).
dev-front:
	pnpm -C frontend dev

dev-admin:
	pnpm -C frontend-admin dev

down:
	docker compose down

ps:
	docker compose ps

logs:
	docker compose logs -f --tail=100

test:
	docker compose exec -T backend php artisan test

bootstrap:
	docker compose exec -T backend php artisan cms:bootstrap-indexes

owner:
	docker compose exec backend php artisan cms:create-owner owner@example.com --force

build:
	docker compose build backend
	pnpm -C frontend build
	pnpm -C frontend-admin build
