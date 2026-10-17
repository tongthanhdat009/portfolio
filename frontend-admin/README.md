# Modern Neo-Brutal Developer Portfolio — Admin CMS (`frontend-admin`)

Bảng điều khiển quản trị CMS theo phong cách Clean Neo-Brutalism, tuân thủ đặc tả kỹ thuật tại [`modern-neobrutal-portfolio-admin-cms-spec.md`](../modern-neobrutal-portfolio-admin-cms-spec.md).

---

## 1. Stack & Kiến trúc

- **Framework:** Next.js 16 (App Router, Turbopack, Server Components & Server Actions)
- **Runtime:** Node.js v24+ / React 19
- **Styling:** Tailwind CSS v4 với design tokens Neo-Brutalism (`--color-ink`, `--color-sun`, `--color-sky`, `--color-coral`, `--color-lime`, hard drop shadows).
- **Data Layer:** MongoDB client native với cơ chế fallback tự động lưu persistent JSON store (`data/cms-store.json`) khi không có MongoDB trực tiếp.
- **Security:** HttpOnly encrypted session cookie (`admin_session`), kiểm tra phân quyền tại server trên mọi mutation.

---

## 2. Hướng dẫn khởi chạy

### Cài đặt dependencies (tại root repo)
```bash
pnpm install
```

### Chạy ứng dụng Admin CMS (Port 3001)
```bash
# Từ root repo:
pnpm dev:admin

# Hoặc từ thư mục frontend-admin:
cd frontend-admin
pnpm dev
```
Truy cập: [http://localhost:3001/admin](http://localhost:3001/admin)

### Thông tin đăng nhập mặc định
- **Passkey:** `admin123` (Cấu hình qua biến môi trường `ADMIN_PASSWORD`)

### Build & Typecheck
```bash
pnpm build:admin
pnpm -C frontend-admin typecheck
```

---

## 3. Bản đồ tính năng đã triển khai

| Màn hình / Chức năng | Route | Tính năng chính |
|---|---|---|
| **Login** | `/admin/login` | Neo-Brutal form xác thực session an toàn, chống brute-force |
| **Overview Dashboard** | `/admin` | Metrics thời gian thực (Published, Drafts, Warnings), Quick actions, Content health audit, Activity stream |
| **Home Page Builder** | `/admin/content/pages/home` | 3 cột: Outline sections (reorder, toggle), Viewport preview (Desktop/Tablet/Mobile), Block inspector |
| **Projects Manager** | `/admin/content/projects` | Lọc theo tab (All/Published/Draft/Archived), tìm kiếm, phân loại category, nhân bản draft |
| **Project Universal Editor** | `/admin/content/projects/[id]` & `/new` | 5 tabs (Overview, Story, Media, Links, SEO), autosave state, concurrency control `rev #`, Publish modal với preflight |
| **Capabilities Board** | `/admin/content/capabilities` | CRUD What I Build: code, accent, title, description, icon |
| **Toolbox & Skills** | `/admin/content/skills` | CRUD phân nhóm Languages, Frontend, Backend, Data, AI, Tools; featured highlight |
| **Journey / Experience** | `/admin/content/experience` | CRUD mốc sự nghiệp, học vấn, research, timeline highlights |
| **Lab & Prototypes** | `/admin/content/experiments` | CRUD thí nghiệm kỹ thuật: status Prototype/Exploring/Shipped, objective, how it works |
| **Notes & Articles** | `/admin/content/notes` | Quản lý bài viết chuyên sâu: markdown content, reading time, tags, SEO |
| **Media Library** | `/admin/media` | Thumbnail grid, inspector, kiểm tra bắt buộc Alt text, safe delete chống xóa ảnh đang dùng |
| **Publishing Hub** | `/admin/publishing` | Quản lý hàng đợi xuất bản, unpublish, kích hoạt purge cache Next.js ISR |
| **History & Rollback** | `/admin/history` | Timeline lịch sử theo entry, diff snapshot viewer, rollback phiên bản thành draft mới |
| **Global Settings** | `/admin/settings` | Identity, Announcement strip, Navigation links reorder, Appearance palette presets, SEO defaults, JSON backup |
| **Account** | `/admin/account` | Thông tin người vận hành, session attributes, đăng xuất |
