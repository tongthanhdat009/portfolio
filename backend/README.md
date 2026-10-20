# Portfolio CMS API (Laravel 13 · MongoDB · S3-compatible)

Headless JSON CMS cho portfolio — xem `../laravel-mongodb-s3-portfolio-cms-backend-architecture.md` (spec).

## Yêu cầu

- PHP 8.4+ với `ext-mongodb` ở **runtime thật**. Code chạy bằng Docker
  (đúng topology 11.1 của spec); không chạy `artisan serve` trên host để serve
  vì nó strip env (dùng `php -S` hoặc FPM + Nginx).
- MongoDB 7 (`compose.yaml` root, container `portfolio-mongo`).
- Moto S3 mock cho media dev (cổng 5000, bucket `portfolio-media`).

## Chạy local (Docker)

```bash
cd /home/dat/run/media/dat/NVME/repo/portfolio
cp backend/.env.example backend/.env   # backend/.env đã gitignore
docker compose up -d --build
docker compose exec backend php artisan cms:bootstrap-indexes
docker compose exec backend php artisan cms:create-owner owner@example.com
curl http://localhost:9000/up
```

`backend` trong compose override `MONGODB_URI` sang hostname `mongo`,
`AWS_ENDPOINT` sang `http://s3:5000` và `AWS_BUCKET` sang `portfolio-media`.

## Test

```bash
docker compose exec backend php artisan test
```

27 tests: Auth (8) · Entries/publish (9) · Pages+Globals (3) · Media (5) · skeleton (2).

## Outbox worker / scheduler

```bash
docker compose exec backend php artisan cms:process-outbox --limit=50
docker compose exec backend php artisan schedule:run   # + cron mỗi phút khi deploy
```

`RevalidateNextSite` ký HMAC (timestamp + nonce + body) gọi `NEXT_REVALIDATE_URL`;
thất bại thì backoff + dead-letter, retry qua `POST /api/v1/admin/publish-operations/{id}/retry`.

## Lộ trình (spec §12)

P0 foundation ✓ · P1 auth ✓ · P2–P4 content + publish + public API ✓ ·
P5 pages ✓ · P6 media ✓ · P7 content types + globals + redirects + audit ✓ ·
P8 còn lại khi production: Redis sessions/queue, Nginx + PHP-FPM thay `php -S`,
MongoDB Atlas/replica-set, backup/restore drill, hardening checklist (spec 9.3/13.3).

## Lưu ý

- Composer trên host cần `--ignore-platform-req=ext-mongodb`.
- Model Mongo dùng `$table` (package v5 không đọc `$collection`) và KHÔNG cast
  `array` cho field BSON (sẽ lưu thành JSON string, query sai).
- Không commit `backend/.env`, key S3, MongoDB URI có mật khẩu, `APP_KEY`.
