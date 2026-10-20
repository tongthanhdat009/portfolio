SHELL := /bin/bash
.DEFAULT_GOAL := help

# ── Paths ────────────────────────────────────────────────────────
PUBLIC_DIR := frontend
ADMIN_DIR  := frontend-admin
COMPOSE    := docker compose

# pnpm tự reinstall khi node_modules lệch lockfile và cần xác nhận
# xóa modules — nhưng dưới `make` không có TTY nên abort. CI=true
# cho phép nó làm việc đó non-interactive (khuyến nghị của pnpm).
PNPM := CI=true pnpm

# ── Help ─────────────────────────────────────────────────────────
.PHONY: help
help: ## Hiện tất cả lệnh
	@echo "Portfolio — make aliases (dev only)"
	@echo ""
	@grep -E '^[a-zA-Z0-9_.-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?##"} {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Ví dụ:"
	@echo "  make install          # cài deps 2 Next.js app (chạy 1 lần / khi đổi deps)"
	@echo "  make dev              # API (9000) + public (3000) + admin (3001)"
	@echo ""
	@echo "Backend API chạy trong docker (host thiếu ext-mongodb),"
	@echo "S3/Mongo đọc cấu hình trong backend/.env. Chi tiết: backend/README.md."

# ── Install ──────────────────────────────────────────────────────
.PHONY: install install-public install-admin
install: install-public install-admin ## Cài deps 2 Next.js app

install-public: ## pnpm install public site
	pnpm -C $(PUBLIC_DIR) install

install-admin: ## pnpm install admin dashboard
	pnpm -C $(ADMIN_DIR) install

# ── Dev — chạy lẻ ────────────────────────────────────────────────
.PHONY: dev-backend dev-public dev-admin dev-front
dev-backend: ## Chạy backend API trong docker (http://localhost:9000)
	$(COMPOSE) up -d mongo backend
	$(COMPOSE) logs -f backend

dev-public: ## Chạy public site (http://localhost:3000)
	$(PNPM) -C $(PUBLIC_DIR) dev

dev-admin: ## Chạy admin dashboard (http://localhost:3001)
	$(PNPM) -C $(ADMIN_DIR) dev

dev-front: dev-public ## Alias của dev-public

# ── Dev — chạy full ──────────────────────────────────────────────
.PHONY: dev dev-bg dev-stop urls open
dev: ## Chạy API (9000) + public (3000) + admin (3001) song song (Ctrl+C dừng tất cả)
	@echo "==> api         http://localhost:9000/up"
	@echo "==> public      http://localhost:3000"
	@echo "==> admin       http://localhost:3001/admin"
	@$(MAKE) -j3 dev-backend dev-public dev-admin

dev-bg: ## Chạy dev ở background (log ra .make-dev-*.log)
	@echo "→ Chạy background..."
	$(COMPOSE) up -d mongo backend
	nohup $(PNPM) -C $(PUBLIC_DIR) dev > .make-dev-public.log 2>&1 & echo $$! > .make-dev-public.pid; \
	nohup $(PNPM) -C $(ADMIN_DIR) dev > .make-dev-admin.log 2>&1 & echo $$! > .make-dev-admin.pid; \
	echo "✓ PID: $$(cat .make-dev-public.pid) (public) $$(cat .make-dev-admin.pid) (admin)"; \
	echo "  log: .make-dev-*.log  |  dừng: make dev-stop  |  urls: make urls"

dev-stop: ## Dừng dev-bg (2 app + backend, giữ mongo)
	@for f in .make-dev-public.pid .make-dev-admin.pid; do \
		if [ -f "$$f" ]; then pid=$$(cat $$f); kill $$pid 2>/dev/null && echo "✓ killed $$pid ($$f)" || echo "- $$f ($$pid) đã dừng"; rm -f $$f; fi; \
	done
	@rm -f .make-dev-*.log
	$(COMPOSE) stop backend
	@echo "→ Đã dừng dev-bg (mongo vẫn chạy, down hẳn: docker compose down)"

urls: ## In URLs dev
	@echo "  API:    http://localhost:9000/up"
	@echo "  Public: http://localhost:3000"
	@echo "  Admin:  http://localhost:3001/admin"
	@echo "  Mongo:  127.0.0.1:27017  (db: portfolio_cms)"

open: ## Mở API + public + admin bằng xdg-open/open
	@(command -v xdg-open >/dev/null && xdg-open http://localhost:9000/up & xdg-open http://localhost:3000 & xdg-open http://localhost:3001/admin &) || \
	 (command -v open >/dev/null && open http://localhost:9000/up & open http://localhost:3000 & open http://localhost:3001/admin &) || \
	 echo "Không tìm thấy xdg-open/open — dùng 'make urls' để xem URL"
