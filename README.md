# Portfolio — Modern Neo-Brutalist Developer Portfolio + CMS

Hồ sơ kỹ năng của một developer, xây theo phong cách **Neo-Brutalism** ("BUILD LOUD. THINK CLEAR."), kèm một **headless CMS** để quản lý nội dung thay vì sửa code.

Monorepo gồm 3 app: một API Laravel (MongoDB + S3), một site công khai Next.js, và một dashboard quản trị Next.js.

---

## 1. Tổng quan kiến trúc

```
                  ┌───────────────────────────────────────┐
                  │      frontend-admin  :3001            │
                  │  Next.js 16 · RSC + server actions    │
                  │  /admin → login → (dashboard)          │
                  └───────────────────┬───────────────────┘
                                      │ Sanctum token (cookie httpOnly `admin_api_token`)
                                      │ REST  /api/v1/auth/*  /api/v1/admin/*
                                      ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     backend  (Laravel 13)  :9000                      │
 │                                                                        │
 │   cms_entries (draft) ──publish──▶ cms_publications (snapshot) ──▶ GET │
 │   cms_revisions · cms_globals · cms_media · cms_redirects             │
 │   cms_audit_logs · cms_outbox ──HMAC──▶ revalidate endpoint           │
 └───────────┬──────────────────────────────────┬───────────────────────┘
             │ MongoDB :27017                    │ S3 :5000 (Moto mock, local)
             ▼                                  ▼
      portfolio_cms                    bucket portfolio-media

                  ┌───────────────────────────────────────┐
                  │       frontend  (public site) :3000   │
                  │  Next.js 16 · SSG + ISR                │
                  │  đọc ONLY /api/v1/public/*             │
                  │  ◀── revalidate (HMAC) ◀── cms_outbox  │
                  └───────────────────────────────────────┘
```

**Luồng nội dung:** Admin sửa draft → `POST /api/v1/admin/entries/{id}/publish` → backend tạo snapshot `cms_publications` + ghi `cms_outbox` → worker `cms:process-outbox` ký HMAC và gọi `NEXT_REVALIDATE_URL` → site công khai revalidate cache → visitor thấy nội dung mới.

Site công khai **không bao giờ** đọc `cms_entries`. Endpoint `public/*` chỉ đọc `cms_publications` (bộ lọc `active = true` + locale). Lọt draft ra public API là bug lộ dữ liệu — có test bảo vệ.

---

## 2. Ba app

| App | Thư mục | Cổng | Stack | Vai trò |
|-----|---------|------|-------|---------|
| CMS API | `backend/` | 9000 | PHP ^8.3, Laravel ^13.17, `mongodb/laravel-mongodb` ^5.11, Sanctum ^4.3 | Nguồn sự thật cho nội dung. JSON-only, không render HTML. |
| Site công khai | `frontend/` | 3000 | Next.js ^16.4.1, React ^19.3.1, Tailwind v4, TypeScript ^7 | Portfolio cho người đọc. Static generation + ISR. |
| Dashboard CMS | `frontend-admin/` | 3001 | Next.js ^16.4.1, React ^19.3.1, Tailwind v4 | Nơi duy nhất **ghi** nội dung. Đăng nhập email/password qua Laravel. |

Hạ tầng local (`compose.yaml`): MongoDB `:27017` · Moto S3 `:5000`.

> **Lưu ý:** `frontend/src/app/admin/` là một **console local cũ** (PIN `neo2026`, cookie `portfolio_admin_auth`) nằm trong site công khai. Console thật là `frontend-admin/` (`:3001/admin`) — dùng Sanctum token + API Laravel. Không nhầm hai cái.

---

## 3. Cây thư mục

```
portfolio/
├── Makefile                  # alias dev: install, dev, dev-bg, dev-stop, urls, open
├── compose.yaml              # mongo · backend · s3 (Moto)
├── package.json              # script forwarder sang 2 app Next.js
├── pnpm-workspace.yaml       # workspace: frontend, frontend-admin
├── README.md
│
├── modern-neobrutal-dev-portfolio-spec.md            # spec site công khai
├── modern-neobrutal-portfolio-admin-cms-spec.md      # spec dashboard CMS
├── laravel-mongodb-s3-portfolio-cms-backend-architecture.md  # spec backend
│
├── backend/                  # Laravel CMS API
│   ├── app/
│   │   ├── Application/Services/   # ContentService, MediaService, PublishService, OutboxService…
│   │   ├── Console/Commands/       # cms:bootstrap-indexes, cms:create-owner, cms:make-bucket, cms:process-outbox
│   │   ├── Domain/Content/         # SchemaRegistry — nguồn validate cho mọi entry type
│   │   ├── Http/Controllers/Api/V1/{Auth,Admin,Public}/
│   │   ├── Http/Requests/Api/V1/{Admin,Auth}/   # FormRequest validate
│   │   ├── Http/Resources/Api/V1/                # Resource render
│   │   ├── Jobs/                  # RevalidateNextSite (HMAC)
│   │   ├── Models/Cms/            # 9 model MongoDB
│   │   ├── Policies/              # EntryPolicy — ma trận gate
│   │   └── Providers/             # AppServiceProvider — bind service
│   ├── config/cms.php        # locale, upload limit, media prefix, revalidate secret
│   ├── database/              # migrations/factories/seeders (CMS data nằm ở MongoDB, không phải SQL)
│   ├── routes/api.php        # hợp đồng API v1
│   ├── routes/console.php    # scheduler: outbox mỗi phút, cleanup weekly
│   └── tests/                # 29 test (Auth 10 · Entries 9 · Pages+Globals 3 · Media 5 · skeleton 2)
│
├── frontend/                 # site công khai :3000
│   ├── scripts/sync-github.mjs   # đồng bộ repo GitHub vào content (dùng `gh` CLI, fallback REST)
│   └── src/
│       ├── app/              # / · /work · /lab · /notes · /about · /contact · /admin(local) · /api/internal/revalidate
│       ├── components/{layout,sections,ui}/
│       ├── content/          # dữ liệu TS: projects, notes, capabilities, siteSettings, homePage…
│       ├── lib/              # api.ts · cms/index.ts · admin/auth.ts · validation/index.ts
│       ├── styles/globals.css   # Tailwind v4 @theme design tokens
│       └── types/            # domain model TS
│
└── frontend-admin/           # dashboard CMS :3001
    ├── data/cms-store.json   # snapshot seed cũ — hiện KHÔNG code nào đọc
    └── src/
        ├── app/admin/        # login + (dashboard): content/*, history, media, publishing, settings, account
        ├── components/{cms,layout,ui}/
        ├── lib/              # api/client.ts · auth.ts · cms/service.ts · github.ts · cv-import.ts · page-blocks.ts
        └── styles/globals.css
```

Mỗi thư mục đều có `AGENTS.md` riêng mô tả vai trò, file chính, quy ước và cách test — dùng làm context khi làm việc với AI agent. Xem [`AGENTS.md`](./AGENTS.md) ở root.

---

## 4. Yêu cầu

| Công cụ | Phiên bản | Ghi chú |
|---------|-----------|---------|
| Docker + Compose | v2 | Bắt buộc — host thiếu `ext-mongodb` nên API **phải** chạy trong container |
| PHP | 8.3+ (khuyến nghị 8.4) | Cần `ext-mongodb` ở runtime thật. Host chỉ dùng để `composer install` (`--ignore-platform-req=ext-mongodb`) |
| Composer | 2.x | |
| Node.js | 20+ | |
| pnpm | 9+ | Workspace root |

---

## 5. Chạy lần đầu

```bash
# 1. Cài dependency 2 app Next.js
make install                # hoặc: pnpm install

# 2. Tạo file env cho backend (KHÔNG commit)
cp backend/.env.example backend/.env

# 3. Bật hạ tầng + API
docker compose up -d --build

# 4. Tạo index MongoDB + bucket S3
docker compose exec backend php artisan cms:bootstrap-indexes
docker compose exec backend php artisan cms:make-bucket

# 5. Tạo tài khoản owner (nhập email khi hỏi)
docker compose exec backend php artisan cms:create-owner owner@example.com

# 6. Chạy cả 3 app (Ctrl+C để dừng tất cả)
make dev
```

`make dev` mở song song:

| | |
|---|---|
| API | http://localhost:9000/up |
| Site công khai | http://localhost:3000 |
| Dashboard CMS | http://localhost:3001/admin |
| MongoDB | 127.0.0.1:27017 (db `portfolio_cms`) |

Biến thể:

```bash
make dev-bg      # chạy nền, log ra .make-dev-*.log, PID lưu .make-dev-*.pid
make dev-stop    # dừng 2 app + backend (giữ mongo)
make urls        # in URL
make open        # mở trình duyệt
```

---

## 6. Lệnh thường dùng

### Make

| Lệnh | Việc |
|------|------|
| `make install` | cài deps cả 2 app |
| `make dev` | chạy API + public + admin song song |
| `make dev-backend` | chỉ chạy API trong Docker (kèm log) |
| `make dev-public` / `make dev-admin` | chỉ chạy 1 frontend |
| `make dev-bg` / `make dev-stop` | chạy nền / dừng |
| `make urls` / `make open` | in URL / mở trình duyệt |

> Không có target `make test` hay `make owner`. Xem mục [Test](#9-test) và [Tạo owner](#7-artisan).

### pnpm (chạy được ở root hoặc trong từng app)

| Lệnh | Việc |
|------|------|
| `pnpm dev` / `pnpm dev:admin` | chạy site công khai / dashboard |
| `pnpm build` / `pnpm build:admin` | build production |
| `pnpm start` / `pnpm start:admin` | chạy production server |
| `pnpm typecheck` | `tsc --noEmit` cho **cả hai** app |
| `pnpm sync:github` | đồng bộ repo GitHub vào content (`frontend/scripts/sync-github.mjs`) |

### Artisan (trong container)

```bash
docker compose exec backend php artisan cms:bootstrap-indexes   # tạo index MongoDB
docker compose exec backend php artisan cms:create-owner <email> # tạo tài khoản owner
docker compose exec backend php artisan cms:make-bucket         # tạo bucket S3
docker compose exec backend php artisan cms:process-outbox --limit=50
docker compose exec backend php artisan schedule:run             # chạy scheduler 1 lần
```

### Worker outbox

Publish không gọi thẳng Next.js — nó ghi vào `cms_outbox`, worker ký HMAC rồi gọi `NEXT_REVALIDATE_URL`. Thất bại → backoff + dead-letter, retry tay qua `POST /api/v1/admin/publish-operations/{id}/retry`.

Ở production, chạy `schedule:run` mỗi phút bằng cron.

---

## 7. Artisan / admin

### Tạo tài khoản owner

```bash
docker compose exec backend php artisan cms:create-owner owner@example.com
```

Lệnh hỏi email + mật khẩu. Đăng nhập ở `http://localhost:3001/admin/login` bằng email/password đó. Token được lưu trong cookie httpOnly `admin_api_token` (7 ngày).

### CMS command

| Command | Việc |
|---------|------|
| `cms:bootstrap-indexes` | tạo index MongoDB cho các collection `cms_*` |
| `cms:create-owner <email>` | tạo user owner + token Sanctum |
| `cms:make-bucket` | tạo bucket S3 cho media |
| `cms:process-outbox --limit=N` | xử lý outbox: ký HMAC → gọi revalidate → retry/dead-letter |

---

## 8. Mô hình nội dung & API

### Collection MongoDB

| Collection | Chứa |
|-----------|------|
| `cms_entries` | bản nháp — nguồn chỉnh sửa |
| `cms_publications` | snapshot đã publish — nguồn đọc của site công khai |
| `cms_revisions` | lịch sử version (giữ `revisions_retention_days`, mặc định 365) |
| `cms_globals` | `site`, `navigation`, `footer`, `seo` |
| `cms_media` | metadata media + trạng thái upload |
| `cms_redirects` | map path cũ → path mới |
| `cms_outbox` | hàng đợi publish/revalidate |
| `cms_audit_logs` | nhật ký ai sửa gì |
| `cms_users` | user admin (không phải SQL `users`) |

### Entry type

`page` · `project` · `capability` · `skill` · `experience` · `experiment` · `note` · `global`

Trạng thái: `draft` · `published` · `archived`.

Block type dùng cho page: `announcement` · `hero_poster` · `marquee` · `about_manifesto` · `capability_grid` · `featured_work` · `toolbox` · `journey` · `experiment_grid` · `notes_grid` · `contact_poster`.

Page key: `home` · `about` · `contact`. Global key: `site` · `navigation` · `footer` · `seo`.

Mọi rule validate định nghĩa tại `backend/app/Domain/Content/SchemaRegistry.php` — không hard-code ràng buộc ở controller.

### API v1

| Nhóm | Auth | Route |
|------|------|-------|
| `auth/*` | public / Sanctum | `POST /login`, `POST /token`, `DELETE /token`, `POST /logout`, `GET /me`, `PATCH /profile`, `POST /change-password` |
| `admin/*` | `auth:sanctum` | `GET /system/health`, `GET /content-types`, CRUD `entries` + `revisions` + `publish`/`unpublish` + `preview`, `globals/{key}`, `pages/{key}`, `GET /audit-logs`, `media` + `uploads`, `redirects`, `publish-operations` + `retry` |
| `public/*` | không | `GET /pages/{key}`, `/projects`, `/projects/{slug}`, `/notes`, `/notes/{slug}`, `/experiments`, `/capabilities`, `/skills`, `/experiences`, `/globals`, `/redirects/resolve` |

Base URL: `http://localhost:9000/api/v1`.

Luồng chuẩn trong backend: **FormRequest validate → controller authorize → service mutate → Resource render**.

---

## 9. Test

```bash
# Backend — 29 test
docker compose exec backend php artisan test
# hoặc trong backend/: composer test

# Frontend — chưa có test runner, dùng typecheck + build
pnpm typecheck      # tsc --noEmit cho cả 2 app
pnpm build
pnpm build:admin
```

Test backend **phải** chạy trong Docker — host không có `ext-mongodb`.

```
backend/tests/
├── Feature/
│   ├── AuthTest.php         10 test — login, token, profile, đổi mật khẩu, ma trận role
│   ├── EntriesTest.php      9 test — CRUD entry, publish, cô lập draft/public
│   ├── PagesGlobalsTest.php 3 test — page block + global
│   └── MediaTest.php        5 test — upload, complete, alt text, xoá
├── Unit/ExampleTest.php
└── TestCase.php
```

---

## 10. Biến môi trường

Không bao giờ commit `.env` — `backend/.env` và `frontend*/.env.local` đã nằm trong `.gitignore`.

### Backend (`backend/.env`)

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `MONGODB_URI` | — | URI MongoDB (compose override sang hostname `mongo`) |
| `AWS_ENDPOINT` / `AWS_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | — | S3-compatible storage cho media |
| `CMS_DEFAULT_LOCALE` | `en` | locale mặc định |
| `CMS_MAX_UPLOAD_MB` | `15` | giới hạn upload |
| `CMS_PUBLIC_BASE_URL` | `http://localhost:3000` | base URL dùng khi dựng link media |
| `CMS_MEDIA_PRIVATE_PREFIX` / `_PUBLIC_PREFIX` / `_TEMP_PREFIX` | `private` / `published` / `tmp` | prefix object key |
| `CMS_REVISIONS_RETENTION_DAYS` | `365` | giữ revision bao lâu |
| `NEXT_REVALIDATE_URL` | `http://localhost:3000/api/internal/revalidate` | endpoint revalidate |
| `NEXT_REVALIDATE_SECRET` | — | khoá HMAC — **bắt buộc** |
| `SANCTUM_STATEFUL_DOMAINS` | — | domain được phép dùng cookie Sanctum |
| `CORS_ALLOWED_ORIGINS` | — | origin CORS |
| `QUEUE_CONNECTION` | `sync` | dùng `redis` ở production |

### Frontend (`frontend/.env.local`)

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `API_BASE_URL` | `http://localhost:9000` | API backend |
| `NEXT_REVALIDATE_SECRET` | — | dùng để verify HMAC ở route `/api/internal/revalidate` |
| `ADMIN_PIN` | `neo2026` | PIN của console local cũ `/admin` (cookie `portfolio_admin_auth`) |

### Dashboard (`frontend-admin/.env.local`)

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `API_BASE_URL` | `http://localhost:9000` | API backend |
| `GITHUB_OWNER` / `GITHUB_TOKEN` | — | nút sync GitHub |
| `CV_DIR` | — | thư mục lưu CV |

---

## 11. Quy ước & cái bẫy

**Backend**
- Model MongoDB dùng `$table` — package v5 **không** đọc `$collection`.
- **Không** cast field BSON array thành `'array'` — sẽ lưu thành JSON string và query sai.
- Public route không bao giờ đụng `CmsEntry`; muốn auth thì endpoint đó phải nằm ở `Admin/`.
- `expectedRevision` là bắt buộc (`required`, `integer`, `min:1`) trên mọi request mutate draft — chống ghi đè mất cập nhật.
- Không side-effect trong `rules()` / `authorize()` của FormRequest.
- Spec là nguồn sự thật; code trích dẫn bằng docblock `spec X.Y`.

**Frontend**
- Tailwind v4 dùng CSS-first token trong `src/styles/globals.css` (`@theme`) — không có file `tailwind.config.js`.
- Đọc nội dung qua adapter `src/lib/cms`, không gọi API trực tiếp từ component.
- Type dùng chung giữa backend và 2 frontend — đổi một bên thì phải sửa bên kia.
- Component server (`'use server'` action) không được import vào `'use client'`.

---

## 12. Spec — nguồn sự thật

| File | Phạm vi |
|------|---------|
| [`modern-neobrutal-dev-portfolio-spec.md`](./modern-neobrutal-dev-portfolio-spec.md) | Site công khai: design system, route, content model, a11y WCAG 2.2 AA |
| [`modern-neobrutal-portfolio-admin-cms-spec.md`](./modern-neobrutal-portfolio-admin-cms-spec.md) | Dashboard CMS: content type, editor, publishing, media |
| [`laravel-mongodb-s3-portfolio-cms-backend-architecture.md`](./laravel-mongodb-s3-portfolio-cms-backend-architecture.md) | Backend: hợp đồng API, schema MongoDB, publish/outbox, media |

Khi hành vi mâu thuẫn với code, **spec thắng** — sửa code hoặc sửa spec, đừng để hai thứ lệch nhau.

---

## 13. Bảo mật

- Không commit `.env`, `APP_KEY`, secret S3, hay URI MongoDB có mật khẩu.
- `NEXT_REVALIDATE_SECRET` phải set — không set thì route revalidate từ chối mọi lời gọi.
- Admin API dùng Sanctum token (cookie httpOnly, `sameSite: 'lax').
- Login bị throttle (`throttle:login`).
- Phân quyền nằm ở `EntryPolicy` + gate trong `AppServiceProvider` — không tự kiểm tra trong controller.
- Media upload: giới hạn mime + kích thước (`CMS_MAX_UPLOAD_MB`), prefix tách riêng `private` / `published` / `tmp`.
- Audit log ghi lại mọi thay đổi nội dung.

---

## 14. Tình trạng hiện tại

Theo spec §12: **P0–P7 xong** (foundation, auth, content, publish, public API, pages, media, content types, globals, redirects, audit). Còn lại cho production:

- Redis cho session + queue (hiện `sync` / file)
- Nginx + PHP-FPM thay `php -S`
- MongoDB Atlas / replica set
- Kịch bản backup & restore
- Checklist hardening (spec §9.3, §13.3)

Một vài nợ kỹ thuật đã biết, ghi trong `AGENTS.md` tương ứng:

- `frontend/src/lib/validation/` chưa có caller nào — contact form tự validate lại (bản yếu hơn).
- `frontend/public/` rỗng, nhưng `ogImage` (`/og-image.png`) và `resumeUrl` (`/resume.pdf`) trỏ tới file không tồn tại.
- `frontend-admin`: `revalidatePublicCacheAction` chỉ invalidate layout của chính app admin, **không** invalidate ISR cache của site công khai `:3000`.
- `frontend-admin`: tab drafts lọc `status === 'draft'` nên entry đang published nhưng có sửa chưa publish thì không publish lại được từ queue.
- `frontend-admin/data/cms-store.json` không còn code nào đọc — là snapshot seed cũ.
- `backend/README.md` còn mô tả `compose.yaml` set `AWS_ENDPOINT`/`AWS_BUCKET`, nhưng compose thực tế chỉ set `MONGODB_URI`, `SANCTUM_STATEFUL_DOMAINS`, `CORS_ALLOWED_ORIGINS`.

---

## 15. License

Private — không cấp phép sử dụng lại.
