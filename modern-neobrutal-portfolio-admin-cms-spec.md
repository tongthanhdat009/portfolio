# Modern Neo-Brutal Portfolio — Admin CMS Design & Implementation Specification

**Phiên bản:** 1.1 (bổ sung Execution Blueprint, phần 14–19)  
**Ngày:** 17/10/2026  
**Stack chính:** Next.js App Router · TypeScript · Tailwind CSS v4 · MongoDB  
**Phạm vi:** Thiết kế giao diện admin, trải nghiệm biên tập nội dung và đặc tả triển khai CMS JSON-based.  
**Tài liệu liên quan:** `modern-neobrutal-dev-portfolio-spec.md` — đặc tả website công khai.  
**Tham chiếu phong cách:** [neobrutalism.dev/docs](https://www.neobrutalism.dev/docs)

> **Mục tiêu:** Cung cấp bảng quản trị gọn, nhanh, an toàn, cho phép chủ sở hữu cập nhật portfolio developer đa lĩnh vực mà không cần sửa mã giao diện. Admin có bản sắc Neo-Brutalism như trang công khai, nhưng **ít màu, ít animation, ưu tiên đọc và nhập liệu**. Đây là bản đặc tả triển khai; **không có code mẫu**.

---

# 0. Quyết định sản phẩm và phạm vi

## 0.1. Nguyên tắc cốt lõi

1. **Content-first, không role-first.** Nội dung tổ chức theo Pages, Projects, Capabilities, Skills, Experience, Lab, Notes, Navigation và Settings; không tạo một hệ CMS chỉ dành cho Frontend/Backend/AI.
2. **Structured JSON CMS.** Editor thao tác qua form, danh sách và block controls; MongoDB lưu document có cấu trúc. Raw JSON chỉ là công cụ nâng cao tùy chọn, không phải giao diện biên tập mặc định.
3. **Publish có kiểm soát.** Người dùng được Save Draft → Preview → Publish → Rollback. Bản nháp không xuất hiện trên site công khai.
4. **Một nguồn dữ liệu thật.** Text, thứ tự section, CTA, link, ảnh, SEO và featured item đều xuất phát từ CMS. Frontend không duy trì thêm bản dữ liệu tĩnh có thể mâu thuẫn.
5. **UI dành cho người viết nội dung.** Phân loại rõ từng trường, preview theo kích thước màn hình, validation tại chỗ, thông báo lỗi đủ nghĩa.
6. **Hiệu năng và bảo mật là yêu cầu nền tảng.** Không coi việc ẩn nút trên frontend là kiểm tra quyền; mọi thao tác ghi dữ liệu phải được xác thực và phân quyền phía server.
7. **MVP ưu tiên chủ sở hữu duy nhất.** Kiến trúc hỗ trợ Editor/Viewer sau này nhưng không cần workflow duyệt nhiều cấp ở phiên bản đầu.

## 0.2. Chức năng trong và ngoài MVP

| Nhóm | MVP | Giai đoạn sau |
|---|---|---|
| Dashboard | Tổng quan nội dung, cập nhật gần đây, cảnh báo | Analytics thực nếu kết nối provider |
| Content Manager | Projects, Skills/Toolbox, Capabilities, Journey, Lab, Notes | Custom content types |
| Pages | Home/Pages, bật tắt section, đổi thứ tự, sửa nội dung | Visual page builder tùy biến nhiều template |
| Editor | Form editor, rich text/Markdown, autosave | Collaborative editing |
| Publishing | Draft, preview, publish, unpublish, revisions, rollback | Scheduled publishing, approval workflow |
| Media | Upload, chọn ảnh, alt, metadata, xóa có kiểm tra tham chiếu | Image crops, transformation presets nâng cao |
| Settings | Profile, nav, social, SEO defaults, appearance presets | Multi-site, đầy đủ đa ngôn ngữ |
| Admin users | Owner và xác thực an toàn | Multi-user RBAC chi tiết |
| JSON inspection | Read-only JSON viewer; import/export có giới hạn | Advanced schema editor / block type creator |

**Không đưa vào MVP:** WYSIWYG kéo thả từng pixel, truy cập sửa CSS tùy ý, AI tự viết toàn bộ nội dung, custom page scripts, widget 3D trên màn admin, dashboard traffic giả lập.

## 0.3. Kiến trúc triển khai được chọn

**Khuyến nghị MVP:** Một ứng dụng Next.js với hai không gian UI tách biệt:

- **Public:** `/`, `/work`, `/work/[slug]`, `/lab`, `/notes`, `/about`, `/contact`.
- **Admin:** `/admin` và các route con có bảo vệ bằng session + authorization phía server.
- **Data access:** Server-side service/data layer truy cập MongoDB; không kết nối MongoDB trực tiếp từ trình duyệt.
- **Media:** file ảnh/video lưu ở dịch vụ object storage hoặc image CDN; MongoDB lưu metadata và URL/key có kiểm soát.
- **Cache:** các route public dùng dữ liệu đã publish; khi publish thực hiện revalidation theo route/tag phù hợp với cấu hình Next.js hiện hành.

Không tách thêm backend framework riêng khi chưa có nhu cầu tích hợp bên thứ ba hoặc khối lượng nghiệp vụ đủ lớn. `/admin` cùng codebase giúp dùng chung content schema, renderer, UI tokens và preview. Nếu cần chạy trên admin subdomain trong tương lai, vẫn giữ lớp service độc lập để dễ tách deployment.

---

# 1. Information Architecture — cấu trúc màn hình quản trị

## 1.1. Navigation chính

| Nhóm Sidebar | Route | Chức năng |
|---|---|---|
| **Overview** | `/admin` | Dashboard, content status, quick actions |
| **Content** | `/admin/content` | Danh sách nội dung tổng hợp |
| ↳ Pages | `/admin/content/pages` | Home, About, Contact; cấu trúc trang và section |
| ↳ Projects | `/admin/content/projects` | Case studies, featured project, links |
| ↳ Capabilities | `/admin/content/capabilities` | What I Build — nhóm năng lực |
| ↳ Toolbox | `/admin/content/skills` | Languages, Frontend, Backend, Data, AI, Tools |
| ↳ Journey | `/admin/content/experience` | Work, Education, Research, Milestones |
| ↳ Lab | `/admin/content/experiments` | Prototype, explorations, technical experiments |
| ↳ Notes | `/admin/content/notes` | Technical notes, bài viết và nhật ký |
| **Assets** | `/admin/media` | Thư viện file, ảnh, metadata |
| **Publishing** | `/admin/publishing` | Drafts, published, recently changed, publication failures |
| **History** | `/admin/history` | Revision timeline, diff, rollback |
| **Settings** | `/admin/settings` | Site identity, navigation, links, visual presets, SEO |
| **Account** | `/admin/account` | Profile, session, bảo mật |

**Không mở quá nhiều menu cấp một.** Sidebar mặc định hiển thị `Overview`, `Content`, `Media`, `Publishing`, `Settings`; Content có thể mở rộng. History nằm trong khu Publishing hoặc entry-specific tùy mức sử dụng.

## 1.2. Đối chiếu admin với website công khai

| Vị trí trên portfolio | Nguồn admin | Loại chỉnh sửa |
|---|---|---|
| Announcement Strip | Site Settings → Announcement | Bật/tắt, thông điệp, link |
| Header/Nav | Settings → Navigation | Danh sách, label, target, thứ tự |
| Hero Poster | Pages → Home → Hero | Headline lines, intro, CTA, sticker, teaser |
| Capability Marquee | Pages → Home → Marquee | Keywords, thứ tự, animation toggle |
| About Manifesto | Pages → Home → About | Heading, đoạn giới thiệu, value chips |
| Capability Board | Content → Capabilities | Card CRUD, description, accent, related work |
| Featured Work | Content → Projects + Home → Featured Work | Project CRUD, danh sách featured, thứ tự |
| Toolbox | Content → Skills | Category, technology, icon, thứ tự |
| Journey | Content → Experience | Loại mốc, thời gian, đóng góp |
| Lab | Content → Experiments | Card, status, detail page |
| Notes | Content → Notes | Article, tags, thumbnail, SEO |
| Contact Poster | Pages → Home → Contact | Heading, intro, CTA, social |
| Footer | Settings → Site Identity / Navigation | Logo, copy, link, copyright |
| Các trang detail | Content → Projects/Lab/Notes | Slug, structured body, media, metadata |

Mọi section homepage có `enabled` và `order`, nhưng các section thiết yếu như Contact/Footer chỉ được ẩn khi layout có phương án điều hướng thay thế, tránh xuất bản website không thể liên hệ.

---

# 2. Global Admin Layout — bố cục tổng thể

## 2.1. Thiết kế: Neo-Brutal Workspace

Khác với **Asymmetric Poster Canvas** ở homepage, admin theo hướng **Structured Brutalism**:

- Khối điều hướng rõ ràng; viền đen 2–3px; shadow cứng ở card và action cần nhấn.
- Nền giấy sáng, vùng làm việc trắng; chỉ dùng vàng/xanh để dẫn mắt.
- Tiêu đề mạnh, nhưng không sử dụng display headline cỡ 100px trong form.
- Dữ liệu trong table và trường input phải là lớp thị giác ưu tiên.
- Hạn chế sticker xoay, marquee, large decorative mark trong admin.

### Desktop ≥ 1280px

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ADMIN TOP BAR · Breadcrumbs          ⌕ Search        Preview ↗   Account    │
├───────────────────┬─────────────────────────────────────────────────────────┤
│  MONOGRAM / CMS   │  PAGE TITLE                       CONTEXT ACTIONS        │
│                   │  Short description / route                               │
│  Overview         │─────────────────────────────────────────────────────────│
│  Content      ▾   │                                                         │
│    Pages          │                   ACTIVE WORKSPACE                       │
│    Projects       │        dashboards / tables / forms / preview             │
│    Capabilities   │                                                         │
│    Skills         │                                                         │
│    Experience     │                                                         │
│    Lab            │                                                         │
│    Notes          │                                                         │
│  Media            │                                                         │
│  Publishing       │                                                         │
│  Settings         │                                                         │
├───────────────────┴─────────────────────────────────────────────────────────┤
│ System status · Last publish · Help / Documentation                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Kích thước đề xuất:**

| Vùng | Giá trị | Ghi chú |
|---|---|---|
| Sidebar expanded | 244px | Có thể thu về 72px ở desktop |
| Top bar | 64px | Sticky nếu nội dung cuộn |
| Main content max-width | 1560px | Dashboard/table có thể tận dụng màn hình lớn |
| Workspace gutter | 32px desktop, 24px tablet, 16px mobile | Shadow không tràn viewport |
| Content header | 88–112px | Heading + mô tả + actions |
| Card gap | 20–24px | Không dày đặc như dashboard tài chính |
| Panel inner padding | 20–28px | Form nhiều trường dùng 24px |

**Responsive:**

- **1024–1279px:** Sidebar collapsed khi thiếu chỗ; table giảm cột; editor inspector dùng panel trượt.
- **768–1023px:** Sidebar dạng drawer; main full-width; chuyển editor 2 cột → 1 cột tùy không gian.
- **<768px:** Topbar chỉ giữ menu, tên màn hình và action trọng yếu; mobile ưu tiên đọc/sửa thông tin đơn giản; page builder/JSON inspection cung cấp chế độ simplified chứ không ép 3 panel ngang.

## 2.2. Top Bar

**Trái:** menu toggle, breadcrumb `Content / Projects / Edit`.  
**Giữa hoặc phải:** global search / command palette; `View site ↗`; trạng thái kết nối nếu cần.  
**Phải:** avatar/initial, account menu, logout.

**Quy tắc:** `Publish` là action theo từng editor, không đặt nút Publish toàn cục ở mọi màn hình. Nếu một entry đang có thay đổi chưa lưu, Top Bar/Editor phải thông báo rõ.

## 2.3. Sidebar

- Có icon line đơn giản và label đầy đủ khi expanded.
- Active: nền `sky`, border trái mạnh hoặc indicator hình vuông, text đen.
- Badge số lượng draft chỉ xuất hiện nếu dữ liệu đúng và hữu ích.
- Không dùng chữ viết tắt khó hiểu khi collapsed; hover/focus hiện tooltip.
- Footer sidebar hiển thị environment (`Production`/`Staging`) và shortcut `View portfolio`.

---

# 3. Wireframe chi tiết từng màn hình

## 3.1. Screen A — Login `/admin/login`

**Mục tiêu:** Rõ ràng, tin cậy, không lộ thông tin quản trị.

**Bố cục desktop:** nền `paper`; ở giữa là panel rộng 400–460px màu `surface`, viền 3px, shadow 8px; góc trên có wordmark, headline `WELCOME BACK.` và dòng phụ `Manage your portfolio content.`

**Form:** email/credential theo auth provider; password hoặc SSO; submit button nền `sun`; thông báo lỗi chung đủ rõ nhưng không phân biệt tài khoản tồn tại hay không. Có link khôi phục quyền truy cập nếu provider hỗ trợ.

**Bảo mật trải nghiệm:** không có public registration; hạn chế lần thử đăng nhập; session timeout hợp lý; sau logout quay về login; redirect an toàn chỉ về internal path hợp lệ.

## 3.2. Screen B — Dashboard `/admin`

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ OVERVIEW                                      [Add project] [Add note]      │
│ Your portfolio, at a glance.                                              │
├──────────────────┬──────────────────┬──────────────────┬──────────────────┤
│ Published items  │ Drafts           │ Recent changes   │ Media warnings   │
├──────────────────────────────────────────────┬─────────────────────────────┤
│ QUICK ACTIONS                                │ CONTENT HEALTH              │
│ + New Project                                │ • Missing cover alt         │
│ + New Note                                   │ • Broken/dead links         │
│ Edit Homepage                                │ • Unpublished linked entry  │
│ Manage Navigation                            │ • Missing SEO description   │
├──────────────────────────────────────────────┴─────────────────────────────┤
│ RECENT CONTENT                              │ ACTIVITY                     │
│ Name / Type / Status / Updated / Edit       │ Recently saved/published    │
└────────────────────────────────────────────────────────────────────────────┘
```

**Mục tiêu:** Hiện các vấn đề cần hành động, không giả định có website analytics.

- **Metric row:** số lượng document `Published`, `Draft`, `Updated this week`, `Content warnings`; dữ liệu thật từ CMS.
- **Quick actions:** tạo project/note, sửa Home, upload media, xem website.
- **Recent content:** 5–8 entry mới sửa, trạng thái và người sửa.
- **Content health:** link thiếu, cover thiếu alt, project featured chưa publish, slug trùng/không hợp lệ, SEO chưa đủ.
- **Recent activity:** ai Save/Publish/Rollback gần đây; có link tới revision.
- **Empty state:** khi site chưa có nội dung, hiện onboarding 3 bước thay vì metric 0 đầy trang.

**Màu:** card metrics neutral/surface; chỉ một metric accent `sun` và một cảnh báo semantic khi có vấn đề thật.

## 3.3. Screen C — Content Manager `/admin/content/[type]`

**Dành cho:** Projects, Notes, Lab, Skills, Experience, Capabilities.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ PROJECTS                                [Import?] [+ New Project]          │
│ Manage case studies and featured work.                                     │
│                                                                            │
│ [All] [Published] [Drafts] [Archived]        Search...    Filter ▾  Sort ▾ │
├─────┬───────────────────────┬────────────┬─────────┬──────────┬────────────┤
│ □   │ TITLE / THUMBNAIL     │ CATEGORY   │ STATUS  │ UPDATED  │ ACTIONS    │
├─────┼───────────────────────┼────────────┼─────────┼──────────┼────────────┤
│ □   │ Example Project       │ Web App    │ Draft   │ Date     │ Edit  ⋯    │
│ □   │ Another Project       │ Tool       │ Live    │ Date     │ Edit  ⋯    │
└─────┴───────────────────────┴────────────┴─────────┴──────────┴────────────┘
  Pagination / page size / selection count
```

**Chức năng:**

- Các tabs: `All`, `Published`, `Draft`, `Archived` (không phân loại nhầm `Unpublished` với `Archived`).
- Search theo title/slug/tags; lọc category, status, featured; sort recent, alphabetical, manual order.
- List mặc định: thumbnail nhỏ, title, type/category, status, updated time, featured marker, actions.
- Bulk action MVP chỉ gồm Archive/Restore, Toggle featured hoặc chỉnh thứ tự khi phù hợp; thao tác nguy hiểm phải confirm.
- Item menu: Edit, Preview, Duplicate as Draft, Copy public link, Archive. `Delete permanently` nằm trong danger zone và có quyền riêng.
- Khi danh sách rỗng: CTA `Create first project`; khi search rỗng: gợi ý reset filter.
- Chế độ mobile: rows chuyển sang card-list có title/status/updated, không ép horizontal table overflow.

## 3.4. Screen D — Universal Content Editor `/admin/content/[type]/[id]`

**Đây là màn hình quan trọng nhất của CMS.** Có cấu trúc 3 vùng trên desktop:

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ ← Projects / EDIT PROJECT      Draft • Saved 11:20   [Preview] [Publish]       │
├─────────────────┬───────────────────────────────────────┬──────────────────────┤
│ SECTION INDEX   │ MAIN EDITOR                           │ INSPECTOR            │
│                 │                                       │                      │
│ • Overview      │ Title                                │ Status: Draft        │
│ • Details       │ Slug                                 │ URL / Visibility     │
│ • Content       │ Summary                              │ Featured / Order     │
│ • Media         │ Main body / structured sections      │ Publish history      │
│ • Links         │ Technologies / references            │ SEO score/checks     │
│ • SEO           │ Media picker                          │ Revision info        │
│                 │                                       │                      │
├─────────────────┴───────────────────────────────────────┴──────────────────────┤
│ Validation / Save status / Last edited by...                                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Đề xuất tỉ lệ:** section index 180–208px, editor min 560px, inspector 280–320px. Khi hẹp, index thành tabs/anchor và inspector thành drawer.

**Editor header:** Back, tên content type, `Draft / Published / Unsaved changes`, timestamp, Preview, `Save Draft`, `Publish` (chỉ enabled khi hợp lệ). Tránh nhầm `Save Draft` với `Publish`.

**Field layout:** label ở trên, helper text dưới, error text ngay sát field. Đặt fields theo logic biên tập thay vì cấu trúc kỹ thuật MongoDB. Biểu mẫu dài tách thành nhóm và có sticky local navigation.

**Inspector:** status, permalink preview, featured toggle, related entries, visibility, SEO checklist, last published, revision shortcut.

**Form state bắt buộc:** pristine, edited, saving, saved, invalid, save failed, publish pending, published. Khi đóng trang có thay đổi chưa lưu phải cảnh báo, kể cả khi autosave đang chạy.

## 3.5. Screen E — Home Page Builder `/admin/content/pages/home`

**Mục tiêu:** Điều chỉnh bố cục homepage theo danh sách section đã được khai báo, không phải công cụ kéo-thả pixel tự do.

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ HOME PAGE BUILDER                       [Desktop▾] [Preview] [Publish Page]    │
├───────────────────┬────────────────────────────────────┬───────────────────────┤
│ SECTION STACK     │ BLOCK CONFIGURATION                │ LIVE PREVIEW          │
│                   │                                    │                       │
│ ≡ Hero       [ON] │ HERO BLOCK                         │ [Scaled portfolio]    │
│ ≡ Marquee    [ON] │ Eyebrow                            │                       │
│ ≡ About      [ON] │ Headline line 1/2/3                │                       │
│ ≡ Capabilities[ON]│ Description                        │                       │
│ ≡ Work       [ON] │ Primary CTA                        │                       │
│ ≡ Toolbox    [ON] │ Featured project picker             │                       │
│ ≡ Journey    [ON] │ Accent preset                      │                       │
│ ≡ Lab        [ON] │                                    │                       │
│ ≡ Notes      [ON] │                                    │                       │
│ ≡ Contact    [ON] │                                    │                       │
└───────────────────┴────────────────────────────────────┴───────────────────────┘
```

**Section stack:** mỗi dòng có drag handle, type icon, tên section, trạng thái on/off, cảnh báo nội dung. Có tùy chọn di chuyển bằng bàn phím và nút `Move up/down` để không phụ thuộc drag-and-drop.

**Cấu hình block:** chỉ lộ fields hợp lệ cho type đã chọn; các section tham chiếu collections dùng entity picker (ví dụ Hero `featuredProjectId`, Work `featuredProjectIds`). Có tùy chọn `Auto latest` hoặc `Manual selected` rõ ràng.

**Preview:** desktop/tablet/mobile, kiểm tra text overflow và image crop. Preview có thể mở tab riêng để xem đúng kích thước; embedded preview là bản hỗ trợ, **không** thay thế preview full tab. Toggle highlight section để đối chiếu UI với config.

**Guardrails:**

- Block type được định nghĩa trong hệ thống, admin không thêm arbitrary HTML/JS.
- Không cho kéo section vào slot không hỗ trợ.
- Có thể tắt/đổi thứ tự phần lớn section; Header/Footer thuộc Site Layout/Settings riêng.
- Mỗi block có ID ổn định, `type`, `enabled`, `order`, `props` đã validate và references hợp lệ.
- Nếu một project được gắn teaser nhưng chưa publish, hiển thị warning và ngăn publish nếu gây lỗi public.
- Không sửa content trực tiếp trong preview iframe nếu chưa có cơ chế đồng bộ trạng thái và validation rõ ràng.

## 3.6. Screen F — Project Editor

**Tabs/sections:**

| Nhóm | Trường quản lý | Hiển thị trên public |
|---|---|---|
| Overview | Title, slug, tagline, summary, category, year/status | Work card + case study hero |
| Cover | Cover asset, thumbnail variant, alt text | Featured Work / list |
| Story | Problem, context, contribution, approach, highlights, outcome, challenges, lessons | Case study detail |
| Technologies | Skills references, technology tags | Case study metadata |
| Links | Demo, repository, writeup, external docs; mỗi link có label/type | CTA theo loại link |
| Relations | Related projects, capabilities, featured setting | Recommendations / homepage |
| SEO | SEO title, description, canonical (nếu cần), OG image | Metadata |
| Publish | Draft status, visibility, history | Published route |

**Điểm nhấn:** Người dùng có thể xây dựng Project Story theo cấu trúc `Problem → Solution → Contribution → Outcome`; không bắt buộc ghi chỉ một role. Role nếu có là **vai trò thực tế trong dự án**.

## 3.7. Screen G — Notes / Rich Content Editor

- Header: title, slug, excerpt, category/tags, cover.
- Main editor: hỗ trợ Markdown hoặc rich-text JSON có schema rõ; headings, paragraph, list, code block, quote, image, link. Quyết định **một canonical editor format** ở MVP để không tạo hai nguồn dữ liệu.
- Outline bên trái; preview tab bên phải; inspector SEO/draft.
- Thời gian đọc chỉ hiển thị nếu được tính nhất quán theo nội dung hiện tại.
- Paste từ nguồn ngoài phải sanitize; không cho script/embed tùy ý.
- Autosave không làm cursor nhảy; tránh autosave mất nội dung khi mạng chập chờn.

## 3.8. Screen H — Skills, Capabilities, Experience, Lab

**Skills / Toolbox:** quản lý groups (Languages, Frontend, Backend, Data, AI, Tools), item name, icon reference, short usage context, priority, visibility; danh sách reorder theo nhóm.

**Capabilities:** 6 card gợi ý `Web Products`, `Backend & APIs`, `Intelligent Workflows`, `Systems & Architecture`, `Developer Tools`, `Experiments`; chỉ là nội dung mặc định, không khóa hệ thống vào 6 loại vĩnh viễn.

**Experience / Journey:** type (`work`, `education`, `research`, `milestone`, `community`), title, organization, start/end, `isCurrent`, summary, highlights, links; public sort theo thời gian. Ngày tháng và trạng thái được validate hợp lý.

**Lab:** tên, slug, teaser, objective, process, outcome/limitations, status (`exploring`, `prototype`, `shipped`, `archived`), demo, repository; có thể attach project liên quan nhưng không tạo duplicate publication.

## 3.9. Screen I — Media Library `/admin/media`

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ MEDIA LIBRARY                                       [Upload files]          │
│ Search...  [All types ▾] [Used / Unused ▾] [Recent ▾]                      │
├──────────────────────────────────────────────────────┬──────────────────────┤
│ GRID THUMBNAILS                                      │ FILE INSPECTOR       │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │ Preview              │
│ │image│ │image│ │image│ │image│                       │ Filename             │
│ └─────┘ └─────┘ └─────┘ └─────┘                       │ Alt text             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │ Dimensions / type    │
│ │image│ │image│ │image│ │image│                       │ Usage references     │
│ └─────┘ └─────┘ └─────┘ └─────┘                       │ Replace / Remove     │
└──────────────────────────────────────────────────────┴──────────────────────┘
```

**Upload flow:** select/drop → validate type/size → upload progress → metadata → insert to entry. Image/file names phải được chuẩn hóa trước khi tạo storage key; không tin MIME type từ client; ảnh cần alt khi mang thông tin.

**Bảo vệ:** không xóa file đang dùng trên trang published mà không cảnh báo; phân biệt `Remove from entry` và `Delete from storage`; file nhạy cảm/không muốn công khai không dùng public CDN URL.

**Lưu trữ:** Binary nằm object storage; MongoDB giữ `storageKey`, asset type, dimensions, size, alt, checksum khi thích hợp, ownership, createdAt, usageReferences. Không nhét ảnh base64 vào CMS JSON.

## 3.10. Screen J — Publishing & History

**Publishing queue:** các draft cần publish; các entry có thay đổi kể từ phiên bản published; trạng thái revalidation lỗi; lựa chọn View diff / Preview / Publish.

**Publish dialog:** hiển thị bản tóm tắt: content title, route, locale, changed fields, related reference warnings; xác nhận rõ nội dung sẽ public ngay. Publish không sửa được dữ liệu lỗi.

**History timeline:** ngày, người thao tác, action (`saved`, `published`, `unpublished`, `restored`), revision number, summary. Compare version theo field; đối với rich text có unified hoặc side-by-side diff; restore tạo **bản draft mới từ revision cũ**, không tự động publish ngay.

**Unpublish:** có xác nhận; xử lý link liên quan, sitemap, cache và trạng thái route public; không chỉ sửa flag trong database.

## 3.11. Screen K — Site Settings

| Tab | Nội dung | Lưu ý |
|---|---|---|
| Identity | Display name, short bio, tagline, locale default, favicon/OG defaults | Nội dung chung cho developer/builder |
| Contact & Social | Email, GitHub, LinkedIn, other links, labels | Không bắt buộc public mọi trường |
| Navigation | Header/footer links, order, external/internal flag | Validate URL và orphan routes |
| Announcement | Toggle, message, CTA | Dùng text trung tính, không trạng thái job giả |
| Appearance | Preset accent colors, optional section palette variant | **Không** sửa CSS raw; dùng token presets |
| SEO | Site title template, description, OG fallback, robots policy | Không cho publish nhầm staging |
| Redirects | Old slug → new slug, status code | Tránh loop/chains |
| Backup / Export | JSON export có scope, audit, confirmation | Không xuất secrets/passwords |
| Security | Session overview, password/2FA via auth provider | Owner-only |

---

# 4. Design Tokens — kế thừa Clean Neo-Brutal

## 4.1. Color foundation

Admin **tái sử dụng token màu** của portfolio công khai, nhưng phân bổ tiết chế hơn. Các màu dưới đây là **đề xuất riêng của project**, không phải palette chính thức neobrutalism.dev.

| Token | Hex | Vai trò ở admin |
|---|---|---|
| `color.ink` | `#111111` | Text, main border, hard shadow |
| `color.paper` | `#FFF9E9` | App background, sidebar backdrop |
| `color.surface` | `#FFFFFF` | Form, modal, bảng, card |
| `color.sun` | `#FFDB58` | Primary action, selected important action |
| `color.sky` | `#89CFF0` | Active sidebar, tab, information card |
| `color.coral` | `#FF7661` | Decorative accent giới hạn; **không phải lỗi** |
| `color.lime` | `#C6F56A` | Accents và successful workflow nhẹ |
| `color.pink` | `#F9A8D4` | Optional accent hiếm gặp |
| `color.warm-line` | `#E9DFC9` | Row dividers, muted borders |
| `color.muted-text` | `#5B5751` | Secondary labels, helper text |
| `color.focus` | `#0A54E8` | Keyboard focus outline |
| `color.negative` | `#B42318` | Validation errors, destructive action text |
| `color.positive` | `#176B3A` | Success text, confirmed publish |

**Màu trạng thái phải khác màu trang trí về ngữ nghĩa**: Draft dùng neutral label, Published dùng chữ/icon thành công, Error dùng semantic negative. Không chỉ dựa vào màu để phân biệt trạng thái.

**Tỉ lệ phân bố ở admin (ước lượng mục tiêu):** surface/paper 80–90%, ink và separators 8–15%, accent 5–10%. Ưu tiên cảm giác sạch và có trật tự hơn trang public.

## 4.2. Typography

**Thống nhất font với portfolio:** Space Grotesk (display), Manrope (body), IBM Plex Mono (metadata); kiểm tra hỗ trợ dấu tiếng Việt đầy đủ.

| Token | Desktop | Mobile | Dùng cho |
|---|---|---|---|
| `admin.page-title` | 32–36px / 700 | 26–30px | Tên màn hình |
| `admin.section-title` | 22–26px / 700 | 20–22px | Heading trong workspace |
| `admin.card-title` | 17–20px / 700 | 16–18px | Card label |
| `admin.body` | 15–16px / 400–500 | 15–16px | Form và mô tả |
| `admin.field-label` | 14px / 600 | 14px | Label input |
| `admin.metadata` | 12–13px / 500 | 12–13px | Time, badge, revision |
| `admin.table` | 14px / 500 | 14px | Row content |
| `admin.mono` | 12–13px | 12–13px | Slug, ID, route, diagnostics |

Không ép toàn bộ text thành uppercase; chữ hoa chỉ dành cho section marker và một số micro-label.

## 4.3. Spacing, shape và elevation

| Nhóm | Giá trị đề xuất | Áp dụng |
|---|---|---|
| Spacing scale | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px | Dùng cùng site public |
| Input height | 42–44px | Field cơ bản |
| Button height | 40–44px, primary action 44–48px | Thao tác editor |
| Table row | 56–64px | Table thông dụng |
| Sidebar group gap | 8–12px | Nav items |
| Card border | 2px solid ink | UI admin tiêu chuẩn |
| Action border | 2–3px solid ink | Button, modal, callout |
| Input border | 2px solid ink; error semantic outline | Field rõ ràng |
| Shadow small | 3px 3px 0 ink | Selected control |
| Shadow default | 5px 5px 0 ink | Feature card / dialog |
| Shadow strong | 8px 8px 0 ink | Login card, publish modal |
| Radius sm/md/lg | 6px / 10px / 14px | Chip / input / panel |
| Focus ring | 2–3px focus blue + offset phù hợp | Bàn phím |

**Không áp dụng shadow cứng cho mỗi table row**. Dùng line divider mỏng cho dữ liệu dày; shadow dành cho card nổi và nút hành động.

## 4.4. Motion

| Interaction | Khoảng thời gian mục tiêu | Cảm giác |
|---|---|---|
| Button hover/press | 90–160ms | Dứt khoát, tactile |
| Sidebar expand/collapse | 140–220ms | Không giật layout |
| Drawer/dialog | 160–240ms | Nhanh, dễ theo dõi |
| Tab / menu | 100–160ms | Không dùng overshoot lớn |
| Save status | 0ms hoặc subtle fade | Không làm mất tập trung |
| Sort/reorder | 120–200ms | Giữ vị trí vật thể dễ nhận biết |

Hỗ trợ `prefers-reduced-motion`, hiển thị mọi thông tin cần thiết dù animation tắt.

---

# 5. MongoDB JSON CMS — mô hình dữ liệu đề xuất

## 5.1. Vì sao dùng BSON documents thay vì một JSON file lớn?

MongoDB lưu **BSON** (có thể hiểu là dạng document JSON-like có kiểu dữ liệu mở rộng). Mỗi entry là document độc lập với `type`, metadata và `data` theo schema. Các trường có cấu trúc cho phép query, index, validation, versioning và cập nhật cục bộ.

**Không nên:**

- Lưu một chuỗi JSON khổng lồ chứa toàn bộ homepage, projects, media và posts.
- Để trang public đọc nguyên bản nháp trực tiếp.
- Cho editor tùy ý nhập `className`, JavaScript hoặc màu HEX trên mỗi block.
- Base64 encode ảnh và nhúng vào document MongoDB.

## 5.2. Các collection chính

| Collection | Mục tiêu | Đối tượng ghi/đọc |
|---|---|---|
| `cms_entries` | Entry **đang chỉnh sửa**: project, note, experience, skill, page, lab, capability | Admin ghi/đọc |
| `cms_publications` | Snapshot **đã publish** được làm sạch dữ liệu riêng cho public | Publish service ghi; public chỉ đọc |
| `cms_revisions` | Các snapshot lịch sử để compare/restore | Admin; server-only |
| `cms_globals` | Cấu hình singleton: site identity, nav, social, appearance, footer | Admin chỉnh; publish snapshot tương ứng |
| `cms_media` | Metadata và liên kết file tới storage | Admin; public đọc phần an toàn |
| `cms_audit_logs` | Dấu vết hành động có actor/action/time/target | Admin owner |
| `cms_redirects` | URL redirects khi đổi slug | Owner cấu hình; public route logic |
| `cms_users` | Metadata người có quyền CMS (khi dùng nhiều người) | Auth/admin service |
| `cms_sessions` | Nếu chọn DB-backed sessions | Auth service; có TTL khi phù hợp |

**Ranh giới:** Public DAL **chỉ truy vấn `cms_publications` và global settings đã publish**. UI public không đọc `cms_entries` hoặc `cms_revisions`. Draft preview đi bằng đường được xác thực riêng.

## 5.3. Schema khái niệm của `cms_entries` (không phải code)

| Field | Kiểu logic | Chức năng / ràng buộc |
|---|---|---|
| `_id` | ObjectId | Định danh nội bộ |
| `type` | Enum string | `page`, `project`, `capability`, `skill`, `experience`, `experiment`, `note` |
| `key` | String / optional | Định danh singleton như `home`, `about`, `contact` |
| `slug` | String / optional | URL segment; normalize và validate |
| `locale` | String | Ví dụ `en` hoặc `vi`, MVP 1 locale |
| `title` | String | Admin label / public title theo loại |
| `status` | Enum | `draft`, `published`, `archived`; hiểu đây là lifecycle state của entry |
| `data` | Typed object | Nội dung JSON-like riêng cho từng content type |
| `seo` | Object | Title, description, OG asset, canonical option |
| `references` | Array of IDs | Link tới media, projects, skills, categories |
| `featured` | Boolean | Khi type hỗ trợ |
| `sortOrder` | Number | Thứ tự thủ công ở những list yêu cầu |
| `schemaVersion` | Integer | Migrate khi contract thay đổi |
| `revision` | Integer | Optimistic concurrency / compare-and-swap |
| `createdAt`, `updatedAt` | Timestamp | Audit nội dung |
| `createdBy`, `updatedBy` | User reference | Người thao tác |
| `publishedAt`, `lastPublishedRevision` | Timestamp / Number | Trạng thái xuất bản gần nhất |
| `archivedAt`, `deletedAt` | Timestamp / nullable | Soft delete / archive |

**Lưu ý:** Khi một entry đã publish được chỉnh sửa, `status` không đủ mô tả cả bản public và draft. UI dùng thêm chỉ dấu `hasUnpublishedChanges`, xác định bằng sự khác nhau giữa draft revision và last published revision. `status = published` không đồng nghĩa mọi thay đổi gần nhất đã public.

## 5.4. Schema khái niệm của `cms_publications`

| Field | Mô tả |
|---|---|
| `entryId` | ID gốc từ `cms_entries` |
| `type`, `slug`, `locale`, `key` | Routing và tra cứu |
| `publicData` | Snapshot dữ liệu đã sanitize/validate để render |
| `publicSeo` | Metadata hợp lệ cho website |
| `publishedAt`, `sourceRevision` | Phiên bản và thời gian nguồn |
| `referencedIds` | Hỗ trợ kiểm tra phụ thuộc và revalidation |
| `schemaVersion` | Tương thích renderer |

**Publish = chuyển snapshot hợp lệ từ `cms_entries` sang `cms_publications`.** Nếu publication cho slug cũ chuyển sang slug mới, đồng bộ redirect/index/cache trong cùng publishing workflow. Thiết kế thao tác idempotent, có ghi nhận lỗi và retry an toàn.

## 5.5. Home Page — Section-based JSON Contract

Một `page` có `data.sections` là danh sách các block theo thứ tự. Mỗi block mang:

| Field | Vai trò |
|---|---|
| `id` | Stable section ID, không đổi theo reorder |
| `type` | Key trong registry đã được lập trình trước |
| `enabled` | Bật/tắt hiển thị |
| `order` | Vị trí mong muốn trên trang |
| `props` | Các fields của section, validate theo type |
| `references` | ID của project/collection/media liên quan |
| `visualVariant` | Chỉ nhận các preset hỗ trợ, không nhận CSS tùy ý |
| `schemaVersion` | Version riêng của block nếu cần migrate |

### Block registry của homepage

| Block type | Nội dung JSON chính | Thành phần public tương ứng |
|---|---|---|
| `announcement` | enabled, message, link | Announcement Strip |
| `hero_poster` | eyebrow, headlineLines, intro, CTAs, featuredProjectId, accent | Asymmetric Poster Hero |
| `marquee` | keywords, speedPreset, enabled | Capability Marquee |
| `about_manifesto` | heading, body, values, CTA | About |
| `capability_grid` | selected capability IDs, displayCount, order | What I Build |
| `featured_work` | mode, selected project IDs, item count | Work Wall |
| `toolbox` | selected categories, grouping options | Toolbox |
| `journey` | filters/types, maxItems | Timeline |
| `experiment_grid` | selection mode, IDs, maxItems | Lab |
| `notes_grid` | category filter, maxItems | Notes |
| `contact_poster` | eyebrow, headline, message, CTA references | Contact |

Header/Footer thuộc global layout, **không** là section di chuyển tùy ý trong `sections`.

**Renderer rules:** type lạ, version không tương thích hoặc props thiếu required fields phải được báo lỗi ở admin; public renderer có fallback an toàn, không crash toàn bộ trang. Preview và public dùng chung hệ component renderer, chỉ khác nguồn dữ liệu.

## 5.6. Content type contracts

### Project (`project.data`)

- Identity: title, subtitle/tagline, short summary, slug, year, status, category.
- Story: problem, context, contribution, architecture/approach, highlights, results, challenges, lessons.
- Assets: coverMediaId, galleryMediaIds, OG override.
- Relations: technologyIds, capabilityIds, relatedProjectIds.
- Links: type (`demo`, `repository`, `article`, `documentation`), label, URL, visibility.
- Display: featured, sortOrder, accentPreset, cardVariant.

### Note (`note.data`)

- title, excerpt, content document, category, tag list, coverMediaId, readingTime policy.
- Slug/SEO riêng; cấm nhúng script tùy ý.

### Experience (`experience.data`)

- roleLabel, organization, type, startDate/endDate, isCurrent, summary, highlights, links, sortOrder.

### Skill (`skill.data`)

- name, group, iconMediaId/iconKey, usageContext, visibility, sortOrder.

### Capability (`capability.data`)

- title, summary, iconPreset, accentPreset, relatedProjectIds, sortOrder.

### Experiment (`experiment.data`)

- title, slug, summary, objective, process, outcomes, limitations, status, media, demo, repo, sortOrder.

### Global settings (`cms_globals`)

- `siteIdentity`, `navigation`, `socialLinks`, `announcement`, `footer`, `seoDefaults`, `themePreset`, `resumeAssetId`.

Các reference phải resolve được và public-safe; tránh lưu cùng thông tin công nghệ dưới dạng text lặp khắp nơi khi đã có Skill collection. Với trường hiển thị đặc biệt, cho phép snapshot label nhưng phải có quy tắc đồng bộ rõ.

## 5.7. Indexes và validation

**Indexes tối thiểu:**

- `cms_entries`: `(type, locale, slug)` unique khi slug có giá trị và type yêu cầu; `(type, updatedAt)`; `(type, status, sortOrder)`.
- `cms_publications`: `(type, locale, slug)` unique cho content có route; `(type, locale, publishedAt)`; `(type, locale, key)` cho singleton pages.
- `cms_revisions`: `(entryId, revision)` unique; `(entryId, createdAt)`.
- `cms_audit_logs`: `(actorId, createdAt)` và `(targetId, createdAt)`.
- `cms_media`: `(createdAt)`, `storageKey` unique, index cho tìm metadata nếu cần.
- `cms_sessions`: TTL chỉ nếu lưu session với expiration thật.

**Validation hai lớp:**

1. Ứng dụng: schema validation theo content type và block type; kiểm tra domain/URL, slug, maxlength, refs, access rights.
2. Database: MongoDB schema validation/indexes cho các quy tắc cốt lõi. Không phụ thuộc chỉ vào form validation phía client.

**Dữ liệu dài:** MongoDB có giới hạn kích thước mỗi BSON document; không nhúng tệp nhị phân hoặc revision history vô hạn vào entry. `cms_revisions` lưu riêng, có retention policy do sản phẩm quyết định.

## 5.8. Publication consistency & resilience

Đề xuất quy trình publish theo thứ tự:

1. Kiểm tra quyền Publish và server-side content validation.
2. Kiểm tra tất cả references dùng trên public; media URL và slug hợp lệ.
3. Ghi snapshot revision, tạo/cập nhật bản published; lưu publish operation ID.
4. Đồng bộ các thay đổi có ảnh hưởng route/slug/redirect.
5. Invalidate cache cho route bị ảnh hưởng, các danh sách liên quan và sitemap; nếu thất bại ghi `needsRevalidation` để retry.
6. Trả trạng thái publish kèm thời gian và revision; nếu lỗi phải chỉ rõ bước lỗi, tránh báo thành công mơ hồ.

Nếu có nhiều collection cần được ghi nhất quán, đánh giá MongoDB transaction trong deployment hỗ trợ; không dựa vào giả định rằng việc ghi nhiều document luôn nguyên tử. Cache invalidation là bước sau database commit và cần retry/idempotency.

---

# 6. Luồng biên tập và trạng thái CMS

## 6.1. Vòng đời một entry

| State | Ý nghĩa | Cho phép |
|---|---|---|
| New | Chưa lưu lần nào | Điền form, Save Draft |
| Draft | Có draft, chưa public | Edit, Preview, Publish, Archive |
| Published (clean) | Bản draft trùng revision đã public | Edit, Preview, Unpublish |
| Published (dirty) | Đã public nhưng có thay đổi chưa xuất bản | Save Draft, Preview Draft, Publish Updates |
| Archived | Không xuất bản mới theo mặc định | Restore, permanent delete theo quyền |
| Publish failed | Thất bại trong quy trình publication/revalidation | Inspect error, Retry, Rollback |

**Đừng dùng một status badge duy nhất để mô tả đồng thời `public visibility` và `draft changes`.** Trong editor hiển thị 2 dòng/indicator nếu cần: `Live` và `Unpublished changes`.

## 6.2. Save Draft

- Debounced autosave đề xuất 1–2 giây sau khi người dùng dừng nhập (điều chỉnh qua thử nghiệm), với manual Save dự phòng.
- Chỉ gửi fields thay đổi khi hợp lý, nhưng server luôn validate toàn bộ state liên quan.
- Optimistic concurrency dựa vào revision; khi hai phiên chỉnh sửa xung đột, hiển thị modal lựa chọn reload/compare, **không ghi đè im lặng**.
- Mất kết nối: chỉ rõ `Offline / Changes not saved`, tránh báo saved sai.

## 6.3. Preview Draft

- Nút `Preview` mở route public ở chế độ draft có session/token ngắn hạn phù hợp; không mở preview bằng URL đoán được.
- Preview hiển thị banner cố định `DRAFT PREVIEW — NOT PUBLIC`, phiên bản draft và Exit Preview.
- Preview có thể chuyển desktop/tablet/mobile từ Admin Preview tools.
- Cache của draft phải tách rõ public cache; ngăn index/crawl draft bằng cấu hình phù hợp.
- Preview route **không** làm lộ nội dung chỉ vì người dùng copy URL; cần kiểm tra session/entitlement liên tục.

## 6.4. Publish / Unpublish / Rollback

- **Publish:** kiểm tra required fields, references, route collision và SEO warnings; warning nhẹ có thể cho override theo quyền, lỗi nghiêm trọng chặn publish.
- **Unpublish:** cập nhật public snapshot, đường dẫn và cache; đảm bảo card featured liên quan được thay thế hoặc báo lỗi trước khi gỡ.
- **Rollback:** chọn revision cũ → tạo draft mới từ snapshot → preview → publish thủ công.
- **Delete:** mặc định archive; hard delete chỉ trong Settings/Danger zone với confirm rõ ràng và kiểm tra phụ thuộc.

---

# 7. Next.js + Tailwind CSS v4 — frontend/admin implementation spec

## 7.1. Module boundaries đề xuất

| Layer | Nhiệm vụ | Quy tắc |
|---|---|---|
| Public App | Các route portfolio và renderer đã publish | Chỉ server-read từ publications |
| Admin App | Shell, dashboard, form editor, page builder, preview UI | Bảo vệ route và server actions |
| CMS Domain | Content models, block registry, publishing rules | Độc lập với form JSX |
| Validation | Schemas theo type/block + field constraints | Chia sẻ giữa client UX và server enforcement |
| Data Access | MongoDB queries, authorization, DTO/projections | Server-only |
| Publishing Service | Revisions, snapshots, dependency validation, cache invalidation | Idempotent operation + audit |
| Media Service | Upload signing, metadata, deletion checks | Storage credentials server-only |
| UI Kit | Form primitives, tables, buttons, status, cards, modal | Cùng tokens, admin variants riêng |

**App Router:** sử dụng route groups/layouts để public và admin có shell riêng; public page không inherit admin navigation/scripts. Server Components cho đọc dữ liệu, Client Components giới hạn cho form, drag-and-drop, media picker, page builder, dialog.

## 7.2. Data access & mutations

- Server-render nội dung danh sách/dashboard ở nơi phù hợp; data table filters/sort được phản ánh trong URL search params để dễ chia sẻ/trở lại.
- Thao tác mutation có thể dùng **Server Actions** cho form nội bộ; **Route Handlers** phù hợp với API upload, integrations, import/export, webhooks hoặc client flows cần endpoints. Không bắt buộc biến mọi field update thành public REST API.
- Mọi mutation đều kiểm tra session, role, entity-level permission, validation và ghi audit.
- Trả về lỗi có cấu trúc phục vụ field error; không rò database error, stack trace, connection strings cho client.
- Sử dụng DTO/projection cho cả admin/public để tránh trả secrets và metadata không cần thiết.

## 7.3. Auth & permissions

**MVP:** account owner duy nhất; sử dụng auth library/provider được duy trì thay vì tự viết cơ chế mã hóa session/password từ đầu. Sessions dùng secure + HttpOnly + SameSite cookies; hạn chế đăng nhập thử, quản lý logout và hết hạn phiên.

**RBAC cho tương lai:**

| Role | View | Edit Draft | Publish | Settings | Users/Security |
|---|---|---|---|---|---|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Editor | ✓ | ✓ | Tùy phân quyền | Giới hạn | — |
| Viewer | ✓ | — | — | — | — |

Admin layout redirect chỉ là trải nghiệm; **service / Server Action / Route Handler luôn kiểm tra quyền tại điểm truy cập dữ liệu**. Không lưu secret trong `NEXT_PUBLIC_*` hoặc đưa Mongo URI tới client.

## 7.4. Tailwind UI architecture

- Tailwind CSS v4 quản lý theme/tokens và utility classes; thiết lập các semantic variants admin như `admin-surface`, `admin-border`, `admin-primary` ở một nguồn duy nhất.
- Dùng UI primitives thống nhất: Button, Input, Textarea, Select, Checkbox, Tabs, Dialog, Drawer, Popover, Toast, Badge, Tooltip, Table, Sortable List, MediaPicker, RichTextField, FormField.
- Tách **visual tokens** khỏi **content data**; admin appearance settings chỉ chọn preset an toàn, không build Tailwind classes từ JSON tùy ý.
- **Không cần SCSS trong admin MVP.** Tailwind v4 không thiết kế để đưa Sass vào cùng pipeline; nếu phần public đã có SCSS độc lập, giữ ranh giới rõ và không tạo một bộ token thứ hai.
- Component library từ neobrutalism.dev có thể dùng làm tham khảo thị giác; kiểm tra dependency, accessibility và phiên bản Next/React trước khi dùng, không gắn toàn bộ hệ thống vào library khi chỉ cần một phần primitives.

## 7.5. Routing và dữ liệu URL

| Route mẫu | Ý nghĩa |
|---|---|
| `/admin` | Dashboard |
| `/admin/content/projects?status=draft&sort=updated` | List lưu filter trên URL |
| `/admin/content/projects/new` | Create form |
| `/admin/content/projects/[id]` | Edit existing draft |
| `/admin/content/pages/home` | Page builder |
| `/admin/media` | Media library |
| `/admin/publishing` | Publishing manager |
| `/admin/history/[entryId]` | Revision timeline |
| `/admin/settings/appearance` | Theme presets |
| `/admin/account/security` | Session/security |

Editor nội bộ dùng **stable ID**, không dùng slug làm khóa chính. Slug chỉ phục vụ public URL và phải xử lý redirect khi đổi.

## 7.6. Preview & cache integration

- Public access đến publication snapshots chỉ. Preview có authenticated read path cho drafts.
- Khi publish: invalidate đúng cache dependencies của `home`, `work list`, detail slug, featured lists, `notes`, sitemap… theo nội dung thay đổi.
- Cơ chế revalidation theo tài liệu chính thức tương ứng với cache model của phiên bản Next.js đang chọn; **không giả định tất cả project dùng cùng chế độ caching**.
- Không cache response admin theo kiểu có thể trộn dữ liệu nhiều người; tắt shared caching trên routes chứa draft/private.

## 7.7. File media và rendering

- Image transformations nếu có nên thực hiện ở CDN/storage; trả kích thước thích hợp cho UI public.
- Asset card có thumbnail, intrinsic dimensions và alt; UI editor báo alt thiếu với ảnh informative.
- Không tự động render HTML từ rich-text JSON mà không whitelist nodes/attributes và sanitize.
- Định nghĩa timeout, retry và thông báo khi upload thất bại; upload trực tiếp tới storage qua cơ chế được cấp quyền ngắn hạn khi phù hợp.

## 7.8. Performance

- Không client-render toàn bộ admin chỉ vì có vài widget tương tác.
- Data tables có server paging/filter hoặc virtualization khi thật sự vượt quy mô nhỏ; tránh tải tất cả notes/projects nếu collection lớn.
- Editor lớn lazy-load rich text, media picker, diff viewer và drag-drop tools.
- Debounce search/input; giữ focus và scroll position khi save.
- Dashboard không phụ thuộc chart library nặng nếu chỉ cần vài số liệu content health.
- Admin có thể chấp nhận JS cao hơn public, nhưng không ảnh hưởng bundle của public routes.

## 7.9. Accessibility & responsive

- Mục tiêu WCAG 2.2 AA cho tác vụ chính; keyboard support cho nav, dialogs, sortable list và editor controls.
- Validation dùng field descriptions/aria associations; toast không thay thế field errors.
- Khi keyboard focus xuất hiện, dùng `color.focus` rõ ràng trên nền vàng/xanh.
- Cần thao tác thay thế drag/drop; không ép editor dùng màn hình desktop để thực hiện cập nhật text đơn giản.
- Kiểm thử ở 320px, 390px, 768px, 1024px, 1280px, 1440px; zoom 200–400%, tiếng Việt có dấu và headline dài.

---

# 8. Thiết kế component-level

## 8.1. Admin primitives

| Component | Visual spec | Behavior |
|---|---|---|
| SidebarItem | 44px min height, active `sky`, 2px border active | Keyboard, tooltip when collapsed |
| Button Primary | `sun` + ink border 2–3px, hard shadow 3px | Press giảm shadow, loading state |
| Button Secondary | White + ink border 2px | Hover subtle sky |
| Button Danger | White/neutral + negative text/icon | Confirm destructive action |
| StatusBadge | Compact, text + icon; status colors semantic | Không chỉ dựa vào màu |
| ContentCard | White, border 2px, shadow 3–5px cho card nổi | Hover có link rõ |
| DataTable | Row 56–64px, hairline dividers | Sort, filter, paginate |
| FormField | Label + control + helper + error | Required marker, describedby |
| TextInput | 44px min height, white surface | Focus ring, invalid state |
| MediaPicker | Thumbnail/empty placeholder, Select/Replace/Remove | Safe selection/confirmation |
| SectionListItem | Handle, label, enabled toggle, warning | Reorder with keyboard fallback |
| PreviewPanel | Framed preview with viewport switcher | Auth-only draft preview |
| RevisionRow | Time, actor, action, diff/restore actions | Compare, restore into draft |
| PublishDialog | Clear summary, warnings, confirm | Prevent double-submit |
| Toast | Bottom-right desktop; mobile bottom | Announce success/error accessible |
| EmptyState | Neutral illustration/icon, description + CTA | Không giả dữ liệu |

## 8.2. States cần thiết cho mọi màn hình

**Loading**, **Empty**, **Error**, **Success**, **Unauthorized**, **Offline**, **Stale data / Conflict**. Không dùng một toast `Something went wrong` chung cho mọi trường hợp.

**Unsaved indicator:** luôn hiển thị gần editor header (`Unsaved` / `Saving…` / `Saved at ...` / `Save failed`). Khi publish xong cần hiển thị `Published at ...` và liên kết xem public page.

## 8.3. Content quality checker

Bộ kiểm tra nội dung không phải AI; dùng rule deterministic:

- Project title/tagline quá dài so với card preview.
- Slug trống/trùng/ký tự không hợp lệ.
- Ảnh informative thiếu alt.
- CTA/link không hợp lệ hoặc thiếu URL.
- Featured item trỏ tới unpublished entry.
- SEO title/description thiếu hoặc quá dài theo target biên tập.
- Section tắt nhưng đang được nav trỏ anchor tới.
- Note body không có heading structure phù hợp.
- Media đang dùng bị đánh dấu xóa.

Phân mức `Blocker` / `Warning` / `Suggestion`. Chỉ blocker mới bắt buộc dừng publish; warning có thể được phép override với lý do rõ ràng.

---

# 9. Security, operations và khả năng bảo trì

## 9.1. Security baseline

- Không public registration; xác thực và authorization cả server-side.
- CSRF protection theo auth/mutation flow đã chọn; giới hạn origin nếu cần, không giả định cookie tự đủ an toàn.
- Validate input và HTML/rich-text allowlist; xử lý URL nguy hiểm (`javascript:` và dạng tương đương).
- Rate limit auth, media upload, preview token và mutation endpoints.
- Secrets trong environment manager; Mongo connection chỉ server-side, quyền database tối thiểu.
- Audit log cho login, publish, unpublish, delete, restore, settings change.
- Preview links không phải public sharing links; short-lived/revocable tùy cơ chế.
- Không ghi password, session token hoặc secret vào activity log/export.
- Các response admin/private không bị CDN/shared cache nhầm.

## 9.2. Backup, export, migration

- Có lịch backup database/asset và **thử restore thực tế** trên staging, không coi việc có backup là đã an toàn.
- Export nội dung dưới dạng JSON theo loại entry/collection; bỏ secrets và private account fields.
- Import hỗ trợ dry-run: schema validation, duplicate slug check, media reference check, preview diff; không ghi đè tự động dữ liệu live.
- `schemaVersion` được dùng khi thay đổi cấu trúc section/block; có migration plan và fallback renderer.
- Khi đưa thêm block type mới, update schema, editor form, preview renderer, public renderer và fixtures/test cùng nhau.

## 9.3. Deployment

| Environment | Mục đích | Điều kiện |
|---|---|---|
| Local | Phát triển CMS và UI | Dữ liệu giả/anonymized |
| Staging | Test preview, publish, rollback và migrations | DB riêng, robots noindex |
| Production | Website + Admin | HTTPS, auth, backups, monitoring |

Nếu dùng MongoDB Atlas thì cân nhắc network access, least-privilege DB user và connection pooling phù hợp Next.js runtime. Không chạy Mongo driver ở Edge runtime nếu driver/runtime không tương thích; chọn Node.js runtime cho phần DB khi phù hợp.

## 9.4. Observability

- Log có request ID và publish operation ID; không chứa nội dung nhạy cảm ngoài phạm vi cần thiết.
- Theo dõi login failures, DB availability, media upload failures, publish/revalidation failure rates, client editor crashes.
- Cho admin xem `Last publish status` và retry nếu publish commit thành công nhưng invalidation bị lỗi.

---

# 10. Kế hoạch triển khai theo pha

| Pha | Mục tiêu | Sản phẩm đầu ra |
|---|---|---|
| **P0 — Foundation** | Auth, Mongo connection, content schemas, design tokens, admin shell | Protected `/admin`, token kit, 1 content type đọc/ghi thử |
| **P1 — Content CRUD** | Projects, Notes, Skills, Experience, Capabilities, Lab | List/create/edit/archive, validation, media picker tối thiểu |
| **P2 — Page Builder** | Sections JSON, reorder/toggle, Home editor | Home chỉnh từ CMS, preview desktop/mobile |
| **P3 — Publishing** | Drafts, publication snapshots, revision, rollback, cache | Public chỉ đọc published data; publish có audit/retry |
| **P4 — Settings & SEO** | Nav, contact, links, theme presets, metadata, redirects | Có thể quản lý site cơ bản hoàn toàn trong admin |
| **P5 — Hardening** | Security, accessibility, performance, backup/restore test, E2E | Checklist nghiệm thu, staging → production |

**Thứ tự ưu tiên MVP nếu thời gian hạn chế:** Login → Admin Shell → Project CRUD → Home Sections → Media → Publish/Preview → Settings → Notes → Revision/Rollback → các module còn lại.

---

# 11. Acceptance criteria — Checklist nghiệm thu

## 11.1. UI/UX

- [ ] Admin và public nhận diện cùng một hệ Clean Neo-Brutal qua màu/border/typography; admin không rối do quá nhiều accent.
- [ ] Sidebar, topbar, dashboard và editor rõ điều hướng; không có menu depth quá 2–3 cấp.
- [ ] Table có search/filter/sort, pagination/empty/loading/error states.
- [ ] Editor thông báo chính xác Draft, Live, Unpublished Changes, Saving và Save Failed.
- [ ] Page Builder reorder/toggle section bằng chuột **và** bàn phím, có responsive preview.
- [ ] Có confirm trước Publish/Unpublish/Delete; diff/rollback dễ tìm.
- [ ] Mobile xem/đổi text cơ bản được, không overflow nghiêm trọng; workflow phức tạp được hướng dẫn rõ.

## 11.2. CMS Data

- [ ] Nội dung lưu MongoDB theo JSON-like documents có schema/type rõ; không lưu website như một string JSON khổng lồ.
- [ ] Có các type `page`, `project`, `skill`, `capability`, `experience`, `experiment`, `note` cùng global settings.
- [ ] Slug/locale/type unique khi cần; references và media được validate.
- [ ] Reorder section không làm thay đổi `id` block; block unknown không làm crash toàn trang.
- [ ] Có `schemaVersion`, `revision`, audit fields và migration strategy.
- [ ] Bản nháp và bản published tách đường đọc; public không lấy data từ `cms_entries`.

## 11.3. Publishing & Security

- [ ] Người không đăng nhập không thể đọc API admin, draft, settings hoặc revisions.
- [ ] Mọi mutation được authorization ở server (không chỉ bảo vệ `/admin` layout).
- [ ] Preview chỉ cho phiên hợp lệ; preview không public index/crawl.
- [ ] Publish có validate references, ghi revision, publish snapshot, cache revalidation và audit.
- [ ] Rollback tạo lại draft để kiểm tra trước khi xuất bản; không ghi đè live im lặng.
- [ ] Có cơ chế chống double-submit, optimistic revision conflict và retry idempotent.
- [ ] Media không được xóa khi đang dùng mà thiếu cảnh báo/kiểm tra phụ thuộc.
- [ ] Dữ liệu public không chứa secret, session, private draft hoặc internal audit notes.

## 11.4. Operations & Quality

- [ ] Có staging database độc lập, backup, restore drill và monitoring errors.
- [ ] Admin flow được test trên mobile, keyboard, zoom và trình duyệt mục tiêu.
- [ ] Public LCP/INP/CLS không bị ảnh hưởng chỉ vì triển khai admin.
- [ ] Người quản trị có thể tạo 1 Project, thêm ảnh, sửa Hero, preview và publish **không chỉnh source code**.
- [ ] Đổi slug project có redirect hoặc chính sách URL phù hợp, không gây broken links/sitemap cũ.
- [ ] Nội dung public cập nhật đúng sau Publish; khi revalidation lỗi có trạng thái và retry.

---

# 12. Hành trình người dùng chuẩn để test E2E

**Scenario A — Ra mắt một project mới**

1. Owner đăng nhập Admin → Content → Projects → New Project.
2. Nhập thông tin cơ bản, case study, technologies, links; upload cover và alt text.
3. Save Draft; CMS báo trạng thái `Saved`.
4. Preview bản nháp tại desktop/mobile và sửa nội dung gây overflow.
5. Publish; CMS kiểm tra metadata, references và đưa project ra trang `/work/[slug]`.
6. Vào Home Page Builder → Featured Work → chọn project vừa publish → Publish Home.
7. Kiểm tra `/work`, homepage, sitemap và public route.

**Scenario B — Đổi Hero và thứ tự các section**

1. Owner vào Pages → Home.
2. Chỉnh headline `I BUILD / THINGS THAT / WORK.`, CTA và chọn featured project.
3. Kéo Lab lên trước Journey; tắt Notes tạm thời.
4. Xem preview mobile/desktop; CMS hiển thị warnings khi một anchor nav trỏ section đã tắt.
5. Save Draft → Publish; kiểm tra public renderer và điều hướng.

**Scenario C — Khôi phục sau chỉnh sửa sai**

1. Owner phát hiện một project description đã publish sai.
2. Mở History, compare phiên bản live mới với revision cũ.
3. Restore revision cũ thành draft mới; preview để xác nhận.
4. Publish restored draft; CMS log đầy đủ người thao tác và thời điểm.

**Scenario D — Bị mất mạng khi đang viết Note**

1. Người dùng đang soạn bài, mất kết nối.
2. Editor báo `Offline / Unsaved`, không hiện `Saved` sai.
3. Khi kết nối lại, kiểm tra revision trên server và giải quyết conflict nếu có.
4. Save thành công, nội dung không mất và vị trí con trỏ được duy trì hợp lý.

---

# 13. Kết luận và quyết định cần cố định trước khi bắt đầu

**Concept chốt:** **Neo-Brutal Workspace CMS** — một công cụ biên tập nghiêm túc với ngôn ngữ trực quan vui, đậm nét nhưng có kỷ luật.

**5 quyết định kỹ thuật cần giữ ổn định trong MVP:**

1. Admin trong cùng Next.js App Router app với public, route `/admin` được bảo vệ.
2. MongoDB lưu **structured BSON documents**; dùng `cms_entries` cho draft, `cms_publications` cho public, `cms_revisions` cho lịch sử.
3. Page Builder dựa vào registry section định sẵn, quản lý thông qua form/reorder/toggle — **không** dùng free-form HTML/CSS editor.
4. Tailwind CSS v4 quản lý design tokens; không đặt Sass trong cùng pipeline CSS.
5. Luồng xuất bản Save Draft → Authenticated Preview → Validate → Publish Snapshot → Revalidate → Audit, có rollback.

**Điều làm CMS này phù hợp portfolio developer đa năng:** CMS phân chia nội dung theo **những gì đã xây dựng** và **nhóm năng lực**, không theo một role duy nhất. Khi chủ sở hữu thay đổi định hướng nghề nghiệp, website cập nhật bằng nội dung, featured work và cách sắp section, không phải xây lại giao diện.

### Nguồn tham chiếu kỹ thuật

- [Neobrutalism.dev — Introduction](https://www.neobrutalism.dev/docs) — tinh thần visual, component inspiration.
- [Next.js — Authentication](https://nextjs.org/docs/app/guides/authentication) — authentication, session, authorization, DAL và security tại mutation endpoints.
- [Next.js — Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) — request handlers ở App Router.
- [Next.js — Draft Mode](https://nextjs.org/docs/app/api-reference/functions/draft-mode) — khả năng preview draft trong App Router.
- [Next.js — Revalidating](https://nextjs.org/docs/app/getting-started/revalidating) — on-demand tag/path revalidation; xem đúng cache model đã chọn.
- [MongoDB — Schema Validation](https://www.mongodb.com/docs/rapid/core/schema-validation/) — kiểu dữ liệu, constraints cho document.
- [MongoDB — Compound Indexes](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/) — index hỗ trợ query theo type, slug, locale, sort.
- [MongoDB — Limits and Thresholds](https://www.mongodb.com/docs/manual/reference/limits/) — giới hạn BSON document và yêu cầu thiết kế dữ liệu hợp lý.
- [Tailwind CSS v4 — Compatibility](https://tailwindcss.com/docs/compatibility) — Sass/Less không phù hợp dùng trong cùng pipeline Tailwind v4.

*Ghi chú:* Đây là **spec thiết kế + triển khai**, không phải mã nguồn triển khai thực tế. Các giá trị UI và kiến trúc đề xuất cần được kiểm thử ở staging trước khi đưa lên production.

---

# 14. Execution Blueprint — triển khai từ bản spec sang sản phẩm

**Mục đích của phần mở rộng:** Chuyển các yêu cầu UI/CMS ở phần 0–13 thành những hạng mục có thể giao cho developer hoặc AI coding agent. Đây là **đặc tả đầu việc và tiêu chí nghiệm thu**, không phải code mẫu.

## 14.1. Nguyên tắc ưu tiên và định nghĩa MVP

**MVP phải hoàn thành trọn một vòng quản lý nội dung:** đăng nhập → tạo/sửa project → lưu nháp → xem trước → xuất bản → nội dung xuất hiện trên site → khôi phục bản cũ khi cần. Không coi việc có đủ menu nhưng các chức năng chưa liên thông là MVP hoàn chỉnh.

**Lựa chọn thực thi cố định:**

- Ứng dụng duy nhất, Next.js App Router; public và admin có layout tách biệt, nhưng sử dụng chung schema, media resolver và section renderer.
- MongoDB là nguồn dữ liệu; document ở `cms_entries` dành cho authoring, `cms_publications` dành cho public, `cms_revisions` dành cho lịch sử.
- Form controls là cách nhập liệu chính; chỉ hỗ trợ JSON viewer read-only ở giai đoạn đầu.
- Section homepage được phép **ẩn/hiện, đổi thứ tự, chỉnh nội dung, chọn accent từ preset**. Không thêm editor CSS/HTML/JavaScript tùy ý.
- Thiết kế **desktop-first cho không gian biên tập**, nhưng mọi chức năng thiết yếu trên mobile vẫn thực hiện được.
- Xây dựng đầy đủ trạng thái Empty / Loading / Success / Validation Error / Network Error / Permission Denied / Conflict.

**Definition of Done cho mọi feature:** có loading/empty/error states, server-side validation, kiểm tra quyền, keyboard accessibility, test chức năng, dữ liệu không giả lập trong production.

## 14.2. Dependency map

| Thứ tự | Nền tảng hoặc module | Phải hoàn thành trước | Mở khóa |
|---|---|---|---|
| 1 | Project scaffold + design tokens | — | Tất cả giao diện |
| 2 | MongoDB data access + schemas | 1 | CRUD, publish, history |
| 3 | Auth/session + server authorization | 1–2 | Toàn bộ mutation admin |
| 4 | Admin Shell + primitives | 1, 3 | Toàn bộ màn quản trị |
| 5 | Project CRUD + media selection | 2–4 | Work page, Featured Work |
| 6 | Home Section Editor + renderer registry | 2–5 | Live preview homepage |
| 7 | Publication service + revision service | 2–6 | Publish/rollback an toàn |
| 8 | Public DAL + cache strategy | 5–7 | Đồng bộ website công khai |
| 9 | Các content types còn lại | 5–8 | CMS đầy đủ |
| 10 | SEO, settings, backup, observability | 2–9 | Production launch |

**Phụ thuộc then chốt:** Không bắt đầu xây “live preview” theo cách dựng UI thứ hai trong admin. Preview và public phải dùng **cùng renderer** để tránh thấy một kiểu trong admin nhưng public hiển thị kiểu khác.

## 14.3. Work packages có thể giao việc

### Package F0 — Foundation, Auth, Admin Shell

| Ticket | Việc cần làm | Kết quả nghiệm thu |
|---|---|---|
| `ADM-001` | Khởi tạo public/admin layouts và tách route groups | `/admin` không dùng header/footer public; public không tải JS của editor |
| `ADM-002` | Đồng bộ Tailwind theme và Neo-Brutal tokens | Màu, shadow, spacing đúng tài liệu; không hardcode biến thể tùy hứng |
| `ADM-003` | Dựng app shell: sidebar, topbar, breadcrumb, responsive | Menu thu gọn trên màn nhỏ; focus và active state rõ |
| `ADM-004` | Tạo UI primitives: button, input, select, table, modal, status, toast | Mọi form và action tái sử dụng; lỗi/trạng thái nhất quán |
| `AUTH-001` | Login/logout, session, protected routes | Người chưa xác thực không đọc được admin hoặc xem dữ liệu nháp |
| `AUTH-002` | Authorization tại server cho mọi mutation | Từ chối request không có quyền dù tự gọi endpoint |
| `DATA-001` | Mongo connection management + môi trường tách biệt | Dev/staging/prod độc lập; không lộ connection string ra client |
| `DATA-002` | Chuẩn hóa schema / content type registry | Cùng bộ ràng buộc dùng cho form, DAL và publish |
| `DATA-003` | Indexes, migration versioning, seed đầu tiên | Dữ liệu mẫu tải được trong admin; index hoạt động như thiết kế |

**Gate F0:** Đăng nhập admin thành công; điều hướng qua màn dashboard; một entry test có thể được đọc/ghi qua data layer với authorization, không cần public UI hoàn chỉnh.

### Package F1 — Content Manager và Project CRUD

| Ticket | Việc cần làm | Kết quả nghiệm thu |
|---|---|---|
| `CMS-101` | Danh sách content: tìm kiếm, lọc type/status, phân trang | Đường dẫn bộ lọc phản ánh trên URL; refresh không mất trạng thái |
| `CMS-102` | Tạo, chỉnh sửa, lưu nháp, archive Project | Lưu đúng `cms_entries`; không ảnh hưởng bản published |
| `CMS-103` | Form Project chia `Overview / Content / Media / Links / SEO` | Editor không dồn toàn bộ field vào một màn dài |
| `CMS-104` | Validation slug, URL, required field, length, references | Error hiển thị ngay tại field; server từ chối payload sai |
| `CMS-105` | Autosave có debounce và trạng thái dirty | Rõ `Saving`, `Saved`, `Unsaved`, `Failed`; không mất nội dung khi lỗi |
| `CMS-106` | Cảnh báo rời trang khi còn thay đổi chưa lưu | Không phá luồng bằng cảnh báo nếu đã lưu thành công |
| `CMS-107` | Optimistic concurrency bằng `revision` | Người mở hai tab không ghi đè âm thầm dữ liệu mới hơn |
| `CMS-108` | Hiển thị thumbnail, links, technical tags của Project | Danh sách dễ scan; không cần mở chi tiết để nhận biết nội dung |

**Gate F1:** Người quản trị có thể tạo Project đầy đủ, reload để tiếp tục biên tập, archive và phục hồi theo quyền; dữ liệu nháp chưa xuất hiện ở trang `/work`.

### Package F2 — Home Page Builder (JSON Sections)

| Ticket | Việc cần làm | Kết quả nghiệm thu |
|---|---|---|
| `PAGE-201` | Section registry cố định theo frontend spec | Section `hero`, `about`, `capabilities`, `featuredWork`, `toolbox`, `journey`, `lab`, `notes`, `contact` được nhận diện |
| `PAGE-202` | Outline panel với section list, reorder, enable/disable | Có keyboard-friendly reorder, không phụ thuộc chỉ drag-and-drop |
| `PAGE-203` | Hero form với heading lines, intro, CTA, visual stickers | Không cho CMS sửa vị trí pixel tự do gây vỡ bố cục |
| `PAGE-204` | Featured project picker lọc project hợp lệ | Chỉ chọn reference tồn tại; lỗi rõ nếu project bị unpublish |
| `PAGE-205` | Section settings: heading, density preset, accent preset | Chỉ chọn giá trị trong hệ thống tokens đã duyệt |
| `PAGE-206` | Chuyển preview desktop/tablet/mobile | Cùng nội dung draft render bằng component public thật |
| `PAGE-207` | Link/anchor checker cho navbar và Home | Cảnh báo menu trỏ tới section bị tắt hoặc không tồn tại |

**Gate F2:** Chủ sở hữu sửa Hero, đảo thứ tự các khối, tắt Notes và xem trước ở mobile mà không thay đổi code.

### Package F3 — Publish, History và Cache

| Ticket | Việc cần làm | Kết quả nghiệm thu |
|---|---|---|
| `PUB-301` | Publish preflight: schema + media + URLs + references | Không publish snapshot có dữ liệu bắt buộc thiếu hoặc broken reference |
| `PUB-302` | Tạo publication snapshot độc lập với draft | Sau publish tiếp tục edit không làm thay đổi public |
| `PUB-303` | Revision snapshot + actor/time/change summary | Có history theo entry, xem trước phiên bản cũ |
| `PUB-304` | Restore revision thành **draft mới** | Rollback không ghi đè lịch sử và cần publish lại |
| `PUB-305` | Unpublish/archive rules | Route public không còn công khai entry bị unpublish; xử lý liên kết liên quan |
| `PUB-306` | Cache invalidation sau publish | Home, listing, detail, sitemap nhận đúng dữ liệu mới |
| `PUB-307` | Operation ID + retry khi revalidation lỗi | Không báo publish thành công hoàn toàn khi còn lỗi đồng bộ public |
| `PUB-308` | Draft preview protection | URL preview không cấp quyền cho người lạ và không bị index bởi search engine |

**Gate F3:** Hoàn thành kịch bản “tạo → preview → publish → xem public → sửa draft → rollback”. Khi lỗi mạng hoặc lỗi revalidation, trạng thái của hệ thống vẫn minh bạch.

### Package F4 — Media, Settings, Types mở rộng

| Ticket | Việc cần làm | Kết quả nghiệm thu |
|---|---|---|
| `MED-401` | Upload ảnh lên object storage, ghi metadata MongoDB | Mongo không chứa ảnh base64; trả asset ID và public URL an toàn |
| `MED-402` | Media picker, preview, alt, dimensions, file size | Chọn và sử dụng lại ảnh cho nhiều entry; bắt buộc alt khi là ảnh nội dung |
| `MED-403` | Kiểm tra references trước khi xóa asset | Không xóa ảnh vẫn được dùng bởi bài viết hoặc project published |
| `SET-401` | Site identity, links, social, resume, footer | Chỉnh thông tin chung qua form; có URL validation |
| `SET-402` | Navigation editor | Cho đổi label, order, URL; không cho route nguy hiểm hoặc javascript URLs |
| `SET-403` | SEO defaults, metadata, OG assets | Public metadata được resolve theo entry rồi mới fallback global |
| `CMS-401` | CRUD Capabilities, Skills, Experience | Theo form riêng của từng content type, không lạm dụng universal freeform editor |
| `CMS-402` | CRUD Experiments và Notes | Support tags, published visibility, detail views, drafts |
| `CMS-403` | Redirects sau đổi slug | Link cũ điều hướng theo chính sách 301/308 đã chọn; không sinh redirect loop |

**Gate F4:** Chủ sở hữu tự quản trị được homepage, toàn bộ nội dung cơ bản, ảnh, social và SEO mà không phải sửa source code.

### Package F5 — Hardening và Release

| Ticket | Việc cần làm | Kết quả nghiệm thu |
|---|---|---|
| `SEC-501` | Audit authentication và write endpoints | Không có anonymous mutation; cookies/session đúng secure policy |
| `SEC-502` | Kiểm tra input sanitization, unsafe URLs, rich content | Không thực thi JS từ nội dung CMS; HTML output được xử lý an toàn |
| `OPS-501` | Backup/restore drill và retention revisions | Có thể khôi phục dữ liệu Mongo cùng media theo hướng dẫn |
| `OPS-502` | Logs và alert cho publish errors | Phân biệt validation, database, storage, cache failures |
| `QA-501` | Cross-device QA, accessibility, keyboard | Form, table, drag order, modal, preview đều dùng được |
| `QA-502` | E2E cho 5 luồng nghiệp vụ quan trọng | Test lặp lại được trên staging độc lập |
| `QA-503` | Regression test public Core Web Vitals | Admin không khiến trang public tải thư viện form/editor không cần thiết |
| `REL-501` | Staging checklist + rollout + rollback plan | Có checklist rõ và checkpoint trước release production |

**Gate F5:** Có thể vận hành CMS mỗi ngày với dữ liệu thật; lỗi có thông báo dễ hiểu, bản backup kiểm tra được và quy trình phục hồi xác định.

---

# 15. Data & UI Contract — bảng chuyển từ nội dung sang field

## 15.1. Cấu trúc JSON cấp entry

CMS dùng document BSON dạng đối tượng JSON-like. Tất cả content types nên có các **nhóm trường khái niệm** sau:

| Nhóm | Trường | Chủ sở hữu chỉnh? | Ghi chú |
|---|---|---|---|
| Identity | `type`, `key`, `locale` | Hạn chế | `type` và singleton key khóa sau khi tạo |
| Route | `slug` | Có kiểm soát | Kiểm tra unique theo type + locale; giữ redirect nếu thay đổi |
| Display | `title`, `summary`, `data` | Có | Form schema theo content type |
| Relations | `references`, `mediaIds` | Qua picker | Chỉ lưu ID/reference, không copy toàn bộ document liên quan |
| Publishing | `status`, `publishedAt`, `lastPublishedRevision` | Qua action | Không cho sửa trực tiếp từ raw form |
| Concurrency | `revision`, `updatedAt`, `updatedBy` | Server-only | Đối chiếu revision ở lúc save |
| SEO | `seo.title`, `seo.description`, `seo.ogAssetId` | Có | Có fallback từ global settings |
| Internal | `_id`, `schemaVersion`, audit fields | Server-only | Không đưa vào public JSON payload |

**Nguyên tắc schema evolution:** trường mới phải có default hợp lý hoặc migration. Không giả định content cũ luôn chứa mọi field mới.

## 15.2. Homepage block contracts

| Block ID | Trường được phép chỉnh | Giới hạn/validation | Mapping giao diện |
|---|---|---|---|
| `announcement` | enabled, message, href, tone preset | Text ngắn, URL hợp lệ | Thanh thông báo đầu trang |
| `hero` | eyebrow, heading lines, intro, primary/secondary CTA, sticker presets | Heading 2–4 dòng; CTA có text+URL; không nhập arbitrary class | Asymmetric Poster Canvas |
| `capabilityMarquee` | enabled, items, speed preset | Không quá nhiều nhãn trùng; reduced motion fallback | Dải capability |
| `about` | heading, body, value chips | Body có độ dài hợp lý; hỗ trợ line breaks có kiểm soát | About Manifesto |
| `capabilities` | title, entryIds, density preset | ID tồn tại, item đã publish khi ra public | Capability Board |
| `featuredWork` | heading, projectIds, layout preset | Reference project hợp lệ; tối đa theo component | Project Work Wall |
| `toolbox` | heading, groupIds, display preset | Không trùng group ID | Technology Playground |
| `journey` | heading, entryIds, order | Thứ tự theo date hoặc manual | Experience Timeline |
| `lab` | heading, experimentIds, maxItems | Chỉ public entries ra public | Experiment Grid |
| `notes` | heading, noteIds, maxItems | Có fallback khi chưa có bài publish | Field Notes |
| `contact` | heading, description, cta, socialIds | Phải luôn có cách liên hệ công khai hợp lệ | Contact Poster |

**Render contract:** Mỗi block nhận `kind`, `enabled`, `order`, `preset` và `content` (cấu trúc theo block); registry xác nhận `kind` hợp lệ. Block lạ không được tùy tiện render HTML; CMS báo schema mismatch và giữ dữ liệu để migration thay vì làm hỏng trang.

## 15.3. Contract nội dung theo type

| Type | Form sections | Field nổi bật | Public destination |
|---|---|---|---|
| Project | Overview, Story, Gallery, Technologies, Links, SEO | title, slug, summary, role label tùy chọn, period, challenge, solution, outcomes, cover, gallery, technologies, links | `/work`, `/work/[slug]` |
| Capability | Basics, Examples, Display | label, description, icon, accent preset, relatedProjects | Home Capability Board |
| Skill | Basics, Classification, Display | name, category, icon, proficiency label tùy chọn, order | Toolbox/Skills |
| Experience | Basics, Contributions, Period | organization, title, timeline start/end, highlights, source/link | Journey |
| Experiment | Basics, Technical Notes, Media | title, summary, category, status, demo, repository, cover | `/lab`, detail nếu bật |
| Note | Metadata, Editor, Links, SEO | title, slug, summary, tags, blocks/Markdown, toc preference, cover | `/notes`, `/notes/[slug]` |
| Page | Page Settings, Ordered Sections, SEO | key, heading, blocks, enabled, order | Home/About/Contact |
| Global Settings | Identity, Navigation, Social, SEO, Footer | site name, nav, social, resume, default metadata | Mọi route public |

**Không bắt buộc role label ở Project.** Một dự án có thể mô tả scope như “Product Engineering”, “Automation”, “Research” mà không phải gắn Frontend/Backend/AI vào profile chung.

## 15.4. Xử lý media ở mức sản phẩm

- Chọn object storage/CDN và danh sách loại file cho phép. MongoDB chỉ lưu key, mime, size, width, height, alt, createdAt, owner, usage refs.
- Ảnh dùng trong bài viết phải có alt hoặc đánh dấu decorative nếu đúng ngữ cảnh; ảnh logo và ảnh cover có quy tắc khác nhau.
- Cần giới hạn file size, loại MIME được thực sự xác minh, quyền upload, thời hạn signed URL (nếu có) và cơ chế cleanup upload lỗi.
- Nếu một asset đang được dùng bởi revision/published snapshot, thao tác xóa cần cảnh báo ảnh hưởng và chính sách retention, không xóa ngay chỉ vì current draft bỏ chọn.

## 15.5. Query, index và consistency checks

- List queries giới hạn pagination và sort được whitelist; search và filter chỉ dựa trên field đã index khi cần.
- Uniqueness áp dụng theo quy tắc route: slug chỉ được coi là trùng khi **public route scope** xung đột; cấu trúc index phải phù hợp quy tắc thực tế, không dựa riêng vào frontend validation.
- Publish phải xác thực mọi reference ở thời điểm publish, không chỉ ở thời điểm chọn từ picker.
- Nội dung `cms_publications` là snapshot immutable theo revision về mặt logic. Một publication mới thay thế bản public hiện tại có kiểm soát và vẫn giữ lịch sử đầy đủ.

---

# 16. End-to-End Interaction Specifications

## 16.1. Kịch bản Save Draft

| Bước | Phản hồi UI | Hành vi server |
|---|---|---|
| Người dùng sửa field | Field dirty; hiển thị thay đổi | Chưa ghi database ngay từng keystroke |
| Autosave bắt đầu | `Saving…`, không khóa toàn form | Validate, authorize, compare revision |
| Thành công | `All changes saved` + thời gian cập nhật | Tăng revision và lưu actor/updatedAt |
| Validation fail | Highlight field sai, mô tả lỗi ngắn | Không ghi dữ liệu không hợp lệ |
| Revision conflict | Dialog so sánh version local/server | Không overwrite âm thầm |
| Network fail | `Couldn't save — Retry` + giữ local state | Có thể retry, tránh duplicate operations |

Không sử dụng toast `Saved` nếu server chưa xác nhận. Với notes dài, dự phòng bản soạn cục bộ chỉ là hỗ trợ, không thay thế dữ liệu chính trên MongoDB.

## 16.2. Kịch bản Preview Draft

1. Owner bấm Preview từ entry hoặc Homepage Builder.
2. Server xác minh session, quyền xem draft, entry ID và revision mong muốn.
3. Preview route dùng **draft DAL** tách khỏi public DAL và dùng cùng UI renderer.
4. Thanh preview hiển thị `Draft Preview`, nguồn dữ liệu, revision, thao tác quay lại editor.
5. Giao diện chỉ người được phép truy cập; response không index, không lộ secret qua URL hoặc HTML.
6. Khi thoát preview, không làm thay đổi trạng thái publish.

## 16.3. Kịch bản Publish

1. Admin bấm Publish → modal tóm tắt danh sách thay đổi, ảnh hưởng đến Home/list/detail và broken references.
2. Server recheck session + publish permission, schema, slug, references và revision.
3. Persist publication snapshot và audit operation; cập nhật trạng thái bản nháp sau khi bước ghi nhất quán hoàn tất.
4. Thực hiện invalidation theo cache strategy đã quyết định cho phiên bản Next.js đang dùng.
5. Nếu hoàn tất: UI hiển thị revision, publishedAt, link public; nếu invalidation thất bại: hiển thị `Published in database — Site refresh pending` và có cơ chế retry.
6. Đường dẫn public không tiết lộ draft dù người dùng đã logout khỏi admin.

**Lưu ý về Next.js:** Tài liệu Next.js hiện hành phân biệt cấu hình **Cache Components** và mô hình cache cũ. Phải xác định cache mode của dự án trước khi thiết kế invalidation. Với Cache Components, `revalidateTag` thiên về stale-while-revalidate, `updateTag` có thể phục vụ read-your-own-writes trong Server Actions và `revalidatePath` nhắm vào đường dẫn. Không cam kết “lập tức hiện ở mọi node” nếu chưa thử nghiệm trên môi trường deploy thật.

## 16.4. Kịch bản đổi slug

- Khi một Project đã publish được đổi slug, editor hiển thị tác động tới URL hiện tại và các internal links.
- Không kích hoạt redirect trước khi bản mới publish thành công.
- Sau publish, tạo redirect từ URL cũ tới URL mới và cập nhật sitemap/canonical phù hợp.
- Ngăn redirect loop, redirect tới domain không hợp lệ hoặc chồng chéo với route đang tồn tại.

## 16.5. Kịch bản Content Reference bị hỏng

- Khi Project được featured bị unpublish, CMS cảnh báo Home sẽ hiển thị item thiếu.
- Owner chọn thay item, bỏ item hoặc chấp nhận cơ chế fallback; tất cả được validate trước Publish Home.
- Public renderer không crash nếu dữ liệu cũ không còn reference hợp lệ; đưa ra UI fallback có kiểm soát và phát cảnh báo vận hành.

---

# 17. Chi tiết UX theo màn và responsive

## 17.1. Dashboard `/admin`

- **Above the fold:** tên workspace, current publication status, nút `New Project`, `Edit Home`, `View Site`.
- **Card hàng đầu:** Drafts, Published, Recently Edited, Broken Links/Warnings. Không hiển thị biểu đồ traffic nếu chưa có dữ liệu analytics thật.
- **Main region:** bảng `Recent Content` với type icon, title, last update, draft/published indicator, quick edit.
- **Side region:** `Publishing Activity`, `Content Health`, `Shortcuts`.
- **Mobile:** các card xếp một cột; Recent Content chuyển sang list; action quan trọng vẫn truy cập được.

## 17.2. Content Manager `/admin/content/[type]`

- **Toolbar:** search, status filter, tag/type filter, sort, create button; advanced filters trong drawer.
- **Table:** select row (nếu batch có trong scope), thumbnail, title, status, updatedAt, overflow actions.
- **Row actions:** Edit, Preview, Duplicate Draft, Archive. Publish phải có confirm nếu có ảnh hưởng public.
- **Empty state:** `No projects yet` + CTA `Create Project`; phân biệt rõ empty search với empty collection.
- **Small screens:** row card có title/metadata/actions; không ép table ngang khó dùng.

## 17.3. Editor `/admin/content/[type]/[id]`

- **Top sticky:** breadcrumb, title, trạng thái lưu, Preview, Save Draft, Publish. Không che field khi keyboard mobile mở.
- **Center:** form theo tabs/sections; lỗi field hiển thị ngay bên dưới field.
- **Right inspector (desktop):** preview thumbnail, metadata, publish checklist, linked pages, recent revisions.
- **Mobile:** right inspector chuyển thành drawer `Details`; action Save/Preview/Publish có mặt trong overflow khi thiếu không gian.
- **Không đóng modal nếu dữ liệu đang lưu chưa hoàn thành** hoặc có xung đột version.

## 17.4. Home Page Builder

- **Left:** danh sách block có drag handles + move up/down; section status; tiện ích tìm section.
- **Middle:** preview viewport, có zoom fit nhưng không thay đổi tỷ lệ nội dung một cách tùy tiện.
- **Right:** field config cho block đang chọn; scroll độc lập trên desktop.
- **Mobile:** chuyển thành hai tab `Sections` / `Edit Block`; Preview mở toàn màn; không cố duy trì 3 cột.
- **Dấu hiệu thay đổi:** section đang dirty có marker, section đang disabled có nền trung tính, section thiếu dữ liệu có lỗi rõ.

## 17.5. Neo-Brutal interaction rules cho admin

| Element | Normal | Hover / focus | Active / disabled |
|---|---|---|---|
| Primary button | Vàng + border ink + hard shadow | Translate nhẹ, focus ring rõ | Press giảm shadow; disabled không dùng chỉ opacity |
| Card | Surface trắng, border 2px | Shadow mạnh hơn với interactive card | Selected nền sky nhạt hoặc viền focus |
| Input | White, border 2px ink | Không tạo animation gây khó đọc | Error dùng message và symbol, không chỉ đỏ |
| Sidebar link | Neutral text | Nền cream/sky nhạt | Active rõ vị trí, `aria-current` |
| Publish status | Text + icon + time | Tooltip/tooltip accessible | Draft/Published/Pending là trạng thái khác nhau |
| Modal | Surface + shadow cứng | Focus trap, ESC xử lý có kiểm soát | Destructive action có xác nhận tường minh |

---

# 18. QA Matrix và Release Gates

## 18.1. Các tình huống test bắt buộc

| ID | Nhóm | Tình huống | Expected result |
|---|---|---|---|
| `T-01` | Auth | Guest mở `/admin/content/projects` | Chặn truy cập, điều hướng login phù hợp |
| `T-02` | Auth | Guest cố gọi mutation trực tiếp | Trả lỗi authorization, DB không đổi |
| `T-03` | CRUD | Tạo Project mới hợp lệ | Entry được tạo, status Draft |
| `T-04` | Validation | Trùng slug trong cùng route scope | Không save/publish, field báo lỗi |
| `T-05` | Conflict | Cùng một entry sửa tại hai tab | Tab cũ nhận conflict, không overwrite |
| `T-06` | Preview | Owner preview draft | Thấy bản mới, public vẫn bản cũ |
| `T-07` | Preview | Khách có link preview nhưng không có quyền | Không xem được draft |
| `T-08` | Publish | Publish Project đã đủ dữ liệu | Public detail và listing cập nhật |
| `T-09` | Publish | Publish với media ref không tồn tại | Publish chặn, lý do hiển thị rõ |
| `T-10` | History | Restore revision rồi publish lại | Nội dung quay về bản chọn; history không mất |
| `T-11` | Home | Reorder/disable section | Preview và public sau publish giống nhau |
| `T-12` | Navigation | Menu trỏ tới section disabled | Warning / preflight hướng dẫn sửa |
| `T-13` | Media | Xóa asset đang dùng bởi published content | Bị chặn hoặc yêu cầu xử lý references |
| `T-14` | URL | Đổi slug của Project đã publish | Route mới hoạt động; route cũ redirect |
| `T-15` | Cache | Cache invalidation lỗi sau DB publish | Có trạng thái pending retry, không mất snapshot |
| `T-16` | Mobile | Tạo và publish qua điện thoại | Không có horizontal clipping; action dùng được |
| `T-17` | A11y | Keyboard-only thao tác editor | Focus, dialog, reorder đều hoạt động |
| `T-18` | SEO | Publish Note mới | Metadata/canonical/sitemap đúng |
| `T-19` | Security | Nhập nội dung có JS/unsafe URL | Không chạy script trên public/admin |
| `T-20` | Ops | Restore backup trên môi trường thử nghiệm | Khôi phục đúng publications, drafts, refs, media metadata |

## 18.2. Gate trước khi đưa lên production

**G0 — Data integrity:** unique indexes và schema validation đã áp dụng; database production không dùng credentials của staging; có migration plan.

**G1 — Public correctness:** website chỉ truy vấn publication data, không phát tán draft hoặc admin metadata; preview được bảo vệ riêng.

**G2 — Security:** session management, authorization trên mutation, rate limit phù hợp, secret management, upload validation và safe rendering đã kiểm tra.

**G3 — UX:** không có màn trắng khi lỗi; form có retry; hỗ trợ keyboard; responsive không mất thao tác quan trọng.

**G4 — Operations:** backup tự động, restore drill, publish audit, log tìm theo operation ID, có đường rollback ứng dụng và dữ liệu.

**G5 — Performance:** public route không import editor bundle, images được tối ưu và các trang dự án/bài viết có navigation ổn định.

## 18.3. Out-of-scope cho đợt MVP đầu

- Nhiều site trong một admin, nhiều tenant và RBAC đa cấp phức tạp.
- Freeform page builder kéo-thả pixel, cho nhập arbitrary CSS, custom script injection.
- Collaborative editing real-time, AI content generation và scheduled publishing.
- Analytics dashboard giả lập hoặc marketing automation không liên quan quản lý portfolio.
- Rich text engine quá phức tạp khi Markdown hoặc structured blocks đã đủ.

## 18.4. Bản bàn giao tối thiểu từ nhóm triển khai

1. Admin chạy được trên staging với một tài khoản Owner.
2. MongoDB collections và indexes đã được tạo, có migration hoặc bootstrap có thể lặp lại.
3. Ít nhất một Project demo + một homepage có dữ liệu publish thực.
4. Hướng dẫn thêm/sửa/xóa nội dung bằng admin; hướng dẫn revalidate, backup và restore.
5. Checklist E2E và log kiểm thử các luồng `T-01` đến `T-20`.
6. Danh sách cấu hình môi trường cần có, không chứa secret thật.
7. Danh sách giới hạn MVP và các rủi ro kỹ thuật còn tồn đọng.

---

# 19. Quyết định chốt trước khi bắt đầu viết chức năng

| ID | Quyết định | Khuyến nghị mặc định |
|---|---|---|
| `D-01` | Một codebase hay tách admin? | Một Next.js app, route `/admin` riêng |
| `D-02` | Có thư viện CMS ngoài không? | Custom CMS nhỏ, typed JSON schema, không cần full headless CMS package |
| `D-03` | Data model? | Draft `cms_entries` + public `cms_publications` + `cms_revisions` |
| `D-04` | Có raw JSON editor không? | Read-only viewer; không cho nhập raw JSON đại trà |
| `D-05` | Có page builder tự do không? | Không; section registry + presets + reorder/toggle |
| `D-06` | Chọn storage nào? | Một dịch vụ object storage/CDN, Mongo chỉ metadata |
| `D-07` | Publishing consistency? | Snapshot có revision, idempotent operation, retry cache invalidation |
| `D-08` | Dùng Tailwind và SCSS ra sao? | Tailwind v4 là styling chính; SCSS tách module cho animation chuyên biệt nếu cần |
| `D-09` | Có preview công khai không? | Không; preview bảo vệ bằng xác thực và noindex |
| `D-10` | CMS có nhiều ngôn ngữ không? | MVP một locale; schema giữ `locale` để có thể mở rộng |

**Điểm bắt đầu thực tế:** Triển khai `ADM-001 → ADM-004 → AUTH-001/002 → DATA-001/002/003`, sau đó hoàn thành một luồng Project (`CMS-101 → CMS-108`) trước khi phát triển đầy đủ các content types khác. Cách này kiểm nghiệm kiến trúc với dữ liệu thật sớm, giảm nguy cơ xây nhiều màn hình đẹp nhưng không thể publish.

### Tài liệu kỹ thuật dùng để xác nhận khi triển khai

- [Next.js Revalidating](https://nextjs.org/docs/app/getting-started/revalidating) — xác định Cache Components mode, behavior của tag/path invalidation.
- [Next.js Authentication](https://nextjs.org/docs/app/guides/authentication) — authorization tại server.
- [MongoDB Schema Validation](https://www.mongodb.com/docs/manual/core/schema-validation/) — validate cấu trúc BSON theo collection.
- [Tailwind Compatibility](https://tailwindcss.com/docs/compatibility) — ranh giới tích hợp với Sass.

> **Tổng kết:** Phụ lục 14–19 là phần tiếp nối có thể dùng làm backlog triển khai. Thiết kế giao diện và content contracts vẫn lấy các phần 0–13 làm nguồn chuẩn. Không có code mẫu.
