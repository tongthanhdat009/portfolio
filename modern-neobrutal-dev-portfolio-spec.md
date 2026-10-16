# Modern Neo-Brutal Developer Portfolio

**Tài liệu đặc tả bố cục, thiết kế và triển khai frontend**  
**Phiên bản:** 1.0 · **Ngày:** 16/10/2026  
**Stack định hướng:** Next.js (App Router) · Tailwind CSS v4 · SCSS có kiểm soát · Headless CMS  
**Tham chiếu thị giác:** [neobrutalism.dev/docs](https://www.neobrutalism.dev/docs)

> **Mục tiêu:** Xây dựng portfolio có cá tính thị giác mạnh, dễ đọc với nhà tuyển dụng và cộng tác viên, dễ cập nhật bằng CMS, ưu tiên hiệu năng; định vị chủ sở hữu là **developer / builder đa năng**, không khóa nội dung vào một chức danh như Frontend, Backend hay AI Engineer.

**Phạm vi tài liệu:** Chỉ mô tả wireframe, thông số thiết kế, cấu trúc nội dung và tiêu chí triển khai. **Không bao gồm mã nguồn hoặc code mẫu.** Mọi tên dự án, con số và trạng thái trong ví dụ phải được thay bằng dữ liệu thực tế trước khi xuất bản.

---

# 1. Wireframe chi tiết từng section

## 1.1. Ngôn ngữ thiết kế và nguyên tắc bố cục

**Concept:** **BUILD LOUD. THINK CLEAR.** — một *interactive poster / digital playground* với tinh thần neo-brutalism: chữ lớn, khung viền đen rõ, đổ bóng cứng lệch, màu nổi có chủ đích và chuyển động ngắn, dứt khoát.

**Điểm khác biệt:** Không làm Hero theo mẫu ảnh chân dung bên phải / giới thiệu bên trái. Dùng **Poster Canvas bất đối xứng**: headline nhiều dòng là trục chính, các “sticker card” được gắn lệch theo lưới, thêm một ô project teaser và thanh chỉ dẫn hướng cuộn. Bố cục phải **trông tự do nhưng được kiểm soát bằng grid**.

**Nguyên tắc thị giác:**

1. **1 điểm nhấn chính mỗi viewport.** Hero ưu tiên headline; khu vực Projects ưu tiên sản phẩm; Contact ưu tiên CTA.
2. **Đậm nhưng không hỗn loạn.** Không tô một màu khác nhau cho mọi card; giới hạn tối đa 2 màu accent lớn trong cùng một màn hình.
3. **Đọc được trước, tương tác sau.** Nội dung tồn tại trong HTML và sử dụng được khi JS, animation hoặc hiệu ứng cuộn chưa chạy.
4. **Định vị bằng hành động thay vì job title.** Dùng “I build…”, “Things I ship…”, “How I work…”; role cụ thể đặt tại các mục kinh nghiệm khi thực sự cần.
5. **Không giả lập dữ liệu.** Chỉ hiện số liệu, trạng thái việc làm, thời gian hoặc kết quả dự án có thể xác minh.
6. **CMS-first.** Tên section, thứ tự project, thẻ kỹ năng, nội dung card, CTA và hình ảnh phải đổi được mà không cần sửa mã giao diện.

## 1.2. Information architecture và điều hướng

### Trang chính và trang chi tiết

| Route | Vai trò | Nội dung chính |
|---|---|---|
| `/` | Landing / portfolio overview | Hero, About, Capabilities, Featured Work, Stack, Journey, Lab, Notes, Contact |
| `/work` | Tất cả dự án | Danh sách, phân loại, dự án nổi bật, bộ lọc |
| `/work/[slug]` | Project case study | Vấn đề → phạm vi → giải pháp → đóng góp → kết quả → liên kết |
| `/lab` | Thử nghiệm | Prototype, demo, ý tưởng kỹ thuật, WIP thực tế |
| `/lab/[slug]` | Chi tiết thử nghiệm | Mục tiêu, cách hoạt động, giới hạn, bài học |
| `/notes` | Bài viết | Technical notes, bài học, hướng dẫn và nhật ký xây dựng |
| `/notes/[slug]` | Bài viết chi tiết | Nội dung dài, hình minh họa, TOC, liên kết liên quan |
| `/about` | Thông tin mở rộng | Câu chuyện, hành trình, cách làm việc, sở thích chuyên môn |
| `/contact` | Liên hệ | Email, mạng xã hội, biểu mẫu nếu thực sự cần |

**Header chính:** `Work · About · Lab · Notes · Contact` cùng nút `Resume` tùy chọn. `Skills/Stack` và `Journey` có thể nằm ở homepage, tránh đưa quá nhiều mục lên navigation. Nếu điều hướng chỉ gồm anchor tại homepage vẫn giữ các route riêng cho nội dung dài.

**Quy tắc hành trình:** Mọi card Project dẫn tới case study khi có nội dung; nếu chỉ có demo hoặc repository thì thể hiện rõ loại liên kết. Trang chi tiết phải luôn có đường về danh sách và đường sang dự án tiếp theo.

## 1.3. Khung kích thước tổng thể

| Thông số | Desktop ≥ 1280px | Tablet 768–1279px | Mobile < 768px |
|---|---|---|---|
| Container | Tối đa 1280px | Chiếm chiều rộng với gutter 32px | Gutter 16–20px |
| Grid | 12 cột, gap 24px | 8 cột, gap 20px | 4 cột, gap 12px |
| Section vertical padding | 104–128px | 72–88px | 56–72px |
| Header | 72–80px | 68–76px | 60–68px |
| Hero minimum visual height | ~680–820px, không cắt nội dung | Theo nội dung | Theo nội dung, không ép full-screen |
| Project gap | 24px | 20px | 16px |

**Mô hình responsive:** Ưu tiên *reflow* và thay đổi thứ tự nội dung, **không chỉ thu nhỏ** desktop. Các card trang trí ở Hero không được che headline hoặc nút CTA trên màn hình hẹp.

## 1.4. Section 00 — Announcement Strip (tùy chọn)

**Mục đích:** Một câu trạng thái ngắn, tạo năng lượng từ đầu trang mà không chiếm quá nhiều diện tích.

- **Desktop:** thanh toàn chiều ngang, cao khoảng 36–40px; nền vàng; border đen phía dưới; bên trái là nhãn `CURRENTLY / …`, bên phải là một liên kết hành động.
- **Mobile:** chỉ một dòng có thể rút gọn; không dùng ticker chạy vô hạn khiến người dùng bị phân tâm.
- **Nội dung CMS:** `enabled`, `message`, `linkLabel`, `linkUrl`, `statusType`.
- **Ví dụ trung tính:** “Exploring ideas. Building useful things.” Không mặc định ghi “Available for hire” trừ khi đúng.

## 1.5. Section 01 — Header / Floating Utility Navigation

**Desktop:**

| Trái (2/12) | Giữa (7/12) | Phải (3/12) |
|---|---|---|
| Logo chữ / monogram | Work · About · Lab · Notes · Contact | Resume hoặc Say Hello |

- Header nền giấy sáng, viền dưới 3px; sticky khi cuộn qua Hero, không tạo hiệu ứng blur giả kính.
- Logo là wordmark ngắn; không bắt buộc avatar hay hình cá nhân.
- Active link được thể hiện bằng gạch chân dày hoặc nhãn màu, **không chỉ** bằng màu chữ.
- Hover nav: underline bật lên nhanh, không di chuyển các mục xung quanh.

**Mobile:** logo bên trái, menu trigger bên phải; menu mở thành panel full-width dưới header hoặc drawer có border đậm. Có nút đóng, trap focus đúng cách, Escape để thoát và không khóa người dùng vào animation.

## 1.6. Section 02 — Hero: ASYMMETRIC POSTER CANVAS (trọng tâm)

### Ý tưởng chủ đạo

**Không chia hero thành 2 cột 50/50.** Coi hero như một tờ poster thiết kế nhiều lớp với lưới 12 cột; các khối có thứ tự rõ nhưng không đối xứng. Headline chiếm phần lớn khung nhìn, các nhãn và thẻ nằm xung quanh tạo nhịp điệu.

**Copy mặc định (có thể thay trong CMS):**

- Eyebrow: `INDEPENDENT DEVELOPER / DIGITAL BUILDER`
- Headline: `I BUILD` / `THINGS THAT` / `WORK.`
- Subline: `Products, tools, systems & experiments — from idea to something people can use.`
- CTA chính: `Explore My Work ↗`
- CTA phụ: `More About Me`
- Sticker phụ: `BUILD / LEARN / SHIP`
- Teaser: `Featured build →` + thumbnail + tên một dự án thật

### Wireframe theo tọa độ logic desktop (12 cột)

| Vùng | Vị trí gợi ý | Nội dung | Xử lý đồ họa |
|---|---|---|---|
| H01 — Eyebrow | Hàng 1, cột 1–5 | Nhãn danh tính trung tính | Tag viền đen trên nền xanh |
| H02 — Micro-status | Hàng 1, cột 10–12 | “Building / Exploring / Open to ideas” | Sticker vàng xoay rất nhẹ |
| H03 — Headline poster | Hàng 2–4, cột 1–11 | 3 dòng headline cực lớn | Typography display màu đen, line-height chặt |
| H04 — Decorative mark | Hàng 2–3, cột 9–12 | Dấu sao / mũi tên / vòng tròn hình học | Đồ họa SVG, không cần WebGL |
| H05 — Short intro | Hàng 5, cột 1–6 | 1–2 câu mô tả khái quát | Body size lớn, thẳng hàng grid |
| H06 — Featured sticker | Hàng 4–6, cột 8–12 | Project teaser ngắn | Card nền xanh hoặc coral, shadow offset |
| H07 — CTA rail | Hàng 6, cột 1–7 | Primary + Secondary CTA | Button đậm, dễ nhấn |
| H08 — Bottom index | Hàng 7, cột 1–12 | `01 / Work`, scroll cue, các từ khóa | Border-top, chữ mono nhỏ |

**Phân tầng:** H02/H04/H06 là lớp hỗ trợ; H03 là trọng tâm. Được phép overlap vùng trống hoặc vùng trang trí, **không overlap chữ chính**. Project teaser không được dùng hình lớn cạnh tranh với headline.

**Đề xuất desktop:** Headline cao khoảng 3 dòng; khối featured sticker rộng 280–340px; CTA xuất hiện trong lần nhìn đầu ở màn hình laptop phổ biến (không đợi người dùng scroll mới thấy). Nếu nội dung dài, tăng chiều cao Hero theo nội dung.

**Tablet:** headline giảm kích thước; project sticker thành card nằm dưới/chéo nhẹ cạnh intro, không phủ lên chữ; thanh CTA giữ nguyên thứ tự.

**Mobile:** trình tự dọc **eyebrow → headline → intro → CTA → featured mini-card → scroll cue**. Không xoay các card lớn, không dùng absolute position cho nội dung chính; decorative mark thu nhỏ hoặc ẩn nếu thiếu không gian. CTA tối thiểu cao 44px và có thể đặt full-width.

### Tương tác được phép

- Headline xuất hiện theo dòng bằng reveal rất ngắn; trạng thái ban đầu vẫn đọc được nếu JS tắt.
- Sticker chỉ nghiêng/nhấc 2–4px khi hover; không tự di chuyển liên tục.
- Primary CTA có **press effect**: shadow giảm độ lệch và vị trí nút dịch theo đúng hướng shadow.
- Có thể thay đổi chữ micro-status bằng lựa chọn do chủ sở hữu quản lý, **không** xoay role liên tục gây giật layout.
- Không dùng hiệu ứng typing kéo dài, particle canvas toàn trang, custom cursor bắt buộc hoặc preloader dài.

### Yêu cầu CMS cho Hero

`eyebrow`, `headlineLines` (tối đa 3 dòng), `intro`, `primaryCta`, `secondaryCta`, `statusLabel`, `decorativeVariant`, `featuredProjectId`, `featuredProjectEnabled`, `heroAccent`.

**Ràng buộc biên tập:** xem trước ít nhất 320px, 390px, 768px và 1440px; headline quá dài phải cảnh báo overflow thay vì âm thầm cắt chữ.

## 1.7. Section 03 — Skill / Capability Marquee (dải nối)

**Mục đích:** Chuyển nhịp từ Hero sang nội dung, làm rõ tính đa nhiệm mà không tuyên bố một job title cụ thể.

- Dải nằm sát chân Hero, cao 68–84px; nền vàng hoặc xanh; border trên và dưới 3px.
- Nội dung là chuỗi ngắn: `WEB APPS ✳ BACKEND SYSTEMS ✳ AI WORKFLOWS ✳ AUTOMATION ✳ EXPERIMENTS`.
- Nếu có marquee, chỉ animating khi cần, pause khi hover/focus và hỗ trợ `prefers-reduced-motion`; fallback là danh sách wrap tĩnh.
- CMS quản lý danh sách từ khóa, thứ tự và bật/tắt chuyển động.

## 1.8. Section 04 — About / Short Manifesto

**Desktop:** grid bất đối xứng 4/8: bên trái một nhãn section khổ lớn `WHO I AM`, bên phải là tuyên ngôn 2–3 câu, bên dưới có 3 chip giá trị cốt lõi.

- Tiêu đề gợi ý: `Curious by default. Practical by design.`
- Nội dung: “I like turning complicated problems into useful digital things. I move between interfaces, services, data, and experiments depending on what the problem needs.”
- Chip gợi ý: `Think in systems` · `Make it usable` · `Keep learning`.
- Mobile: nhãn → headline → đoạn văn → chip, không căn giữa toàn bộ text.
- CTA nhỏ: `Read my story →` dẫn `/about`.

**Không nên:** viết một đoạn tiểu sử quá dài, lặp lại nội dung CV hoặc đưa hàng loạt logo công nghệ vào phần About.

## 1.9. Section 05 — What I Build / Capability Board

**Desktop:** grid 3 cột × 2 hàng, mỗi card cao tương đối đồng nhất (~250–300px); card hàng thứ hai có thể dịch nhẹ 12–20px để tạo nhịp, nhưng lưới vẫn thẳng về mặt đọc.

| Card | Heading | Mô tả trung tính | Accent |
|---|---|---|---|
| 01 | Web Products | Experiences and applications built for real users | Blue |
| 02 | Backend & APIs | Services, integrations and reliable data flows | Yellow |
| 03 | Intelligent Workflows | Applied AI, assistants and task automation | Lime |
| 04 | Systems & Architecture | Turning requirements into maintainable structures | Paper |
| 05 | Developer Tools | Utilities that remove friction and improve workflows | Coral |
| 06 | Experiments | Trying ideas, measuring outcomes and iterating | Paper |

**Nội dung card:** số thứ tự lớn ở góc trên; icon line-art nhỏ; title; mô tả 1–2 dòng; nhãn `Explore related work ↗` nếu có project phù hợp. Card không nhất thiết có link nếu không có trang đích.

**Responsive:** tablet 2 cột; mobile 1 cột hoặc 2 cột chỉ khi nội dung đủ ngắn và rộng. Không ép card chiều cao bằng nhau trên mobile.

**CMS:** CRUD category, description, icon variant, order, featured flag, accent, related projects. Không cho CMS nhập CSS tùy ý.

## 1.10. Section 06 — Featured Work / The Work Wall

**Mục tiêu:** Biến Projects thành nơi chứng minh năng lực thông qua giải pháp và quá trình thực hiện, không biến thành bảng liệt kê tech stack.

### Bố cục desktop

- Header section: trái `SELECTED WORK`, phải `View all projects ↗`.
- **Hàng đầu:** 1 *feature project* rộng 12 cột, bố cục bên trong 7/5: vùng ảnh/product mockup chiếm khoảng 7 cột; bên phải tên, một câu giải quyết vấn đề, vai trò đã thực hiện trong **dự án** (không phải định vị toàn website), tags và CTA.
- **Hàng sau:** 2 cột × 2 hàng project cards. Mỗi card dùng thumbnail với tỉ lệ 16:10 hoặc 4:3; vùng title và mô tả nằm bên dưới ảnh.
- Mỗi card: `Index / Year` → cover → tên → loại sản phẩm/giải pháp → 2–4 tags → `Read case study`.
- Accent xen kẽ tối đa 3 màu trong một nhóm project; chọn qua CMS nhưng giao diện phải tự kiểm tra tính dễ đọc.

**Mobile:** feature project đổi thành ảnh trên / nội dung dưới; tất cả card thành 1 cột, ảnh không bị crop nội dung quan trọng; nút truy cập demo/repository phân biệt với case study.

**Nội dung bắt buộc ở case study:**

1. Overview: sản phẩm là gì, ai sử dụng, năm và tình trạng.
2. Problem / Context: vấn đề được giải quyết.
3. Contribution: chủ sở hữu thực hiện chính xác phần nào.
4. Approach: sơ đồ hoặc các quyết định kiến trúc quan trọng.
5. Implementation highlights: những điểm kỹ thuật có ý nghĩa.
6. Outcome: kết quả có căn cứ; không tự tạo số liệu.
7. Challenges / Lessons: điều rút ra và các đánh đổi.
8. Links: demo, repository, bài viết hoặc tài liệu (nếu công khai được).

**CMS:** thứ tự thủ công cho featured projects, tự động tạo fallback card khi thiếu ảnh, hỗ trợ draft để không lộ project chưa công khai.

## 1.11. Section 07 — Toolbox / Technology Playground

**Bố cục:** Một *tool shelf* có nhóm thay vì đám mây logo.

- Desktop: thanh chọn category ở trên (`Languages`, `Frontend`, `Backend`, `Data`, `AI`, `Tools`); dưới là grid badge/card 5–6 cột. Có thể sử dụng tabs nếu mỗi nhóm có nhiều item.
- Mỗi technology chỉ gồm tên/icon + ngữ cảnh sử dụng nếu hữu ích; **không dùng điểm % kỹ năng thiếu cơ sở**.
- Tối đa 12–18 item hiển thị đầu tiên; phần còn lại xem bằng `Show all` hoặc trang About.
- Mobile: category list cuộn ngang có dấu hiệu còn nội dung, badges wrap 2–3 cột.
- CMS: tên, nhóm, icon, order, featured, link tùy chọn. Không bắt buộc icon cho mọi công nghệ.

## 1.12. Section 08 — Journey / Experience Timeline

**Desktop:** một trục timeline thẳng đứng dọc cột 3; cột 1–2 hiển thị năm; cột 4–12 hiển thị các thẻ milestone xen kẽ nhẹ màu nền.

**Một milestone gồm:** khoảng thời gian, loại hoạt động (`Work`, `Education`, `Research`, `Community`, `Milestone`), tên tổ chức/sự kiện, vai trò tại thời điểm đó nếu có, 1–3 dòng về đóng góp hoặc kết quả.

**Mobile:** timeline sát trái, mọi card nằm bên phải; không đặt card xen kẽ hai bên gây hẹp bề ngang.

**Nguyên tắc:** Nội dung quá khứ được ghi chính xác; sự kiện đang diễn ra phải có trạng thái rõ. Không tự tạo thành tích hoặc gắn “Senior”/“Lead” khi không có căn cứ.

## 1.13. Section 09 — Lab / Experiments Grid

**Bố cục:** cảm giác một bảng ghim thử nghiệm; desktop grid 4 cột với card kích thước biến thiên có kiểm soát (1 card rộng 2 cột + 2 card nhỏ); tablet 2 cột; mobile 1 cột.

**Nội dung:** prototype, demo giao diện, nghiên cứu, công cụ cá nhân, ý tưởng có bản chạy thử. Card hiển thị nhãn trạng thái `Prototype`, `Exploring`, `Archived`, `Shipped` có ý nghĩa thực tế.

**Khác biệt so với Work:** Work là case study tương đối hoàn chỉnh; Lab ưu tiên quá trình khám phá và điều chưa hoàn thiện. Không gộp tất cả project vào cả hai collection nếu không có lý do biên tập.

**Tương tác:** hover có thể đổi background của card, hiện mũi tên hoặc preview ngắn; không tự bật âm thanh/video.

## 1.14. Section 10 — Notes / Field Notes

**Desktop:** header lớn `NOTES FROM THE BUILD`; grid 3 bài gần đây. Mỗi card gồm category, ngày xuất bản, tiêu đề, tóm tắt ngắn và thời lượng đọc nếu được tính chính xác.

**Mobile:** 1 cột; giữ các heading rõ ràng, không dùng horizontal carousel bắt buộc.

**Trang bài viết:** chiều rộng dòng 65–75 ký tự, typography tối ưu đọc dài, TOC khi đủ nhiều heading, code blocks chỉ ở bài viết kỹ thuật (không ảnh hưởng yêu cầu **tài liệu spec này không có code**), hình có caption và heading đúng thứ tự.

**CMS:** Markdown/rich-text editor, ảnh, tags, canonical URL nếu cần, trạng thái draft/published và ngày cập nhật.

## 1.15. Section 11 — Contact: FINAL POSTER

**Bố cục:** một mảng nền vàng full-width có viền trên và dưới dày; chữ cực lớn nhưng ít nội dung, như trang cuối của một tờ poster.

- Nhãn nhỏ: `GOT SOMETHING IN MIND?`
- Headline: `LET'S MAKE` / `IT REAL.`
- Dòng giải thích: “Questions, collaborations, opportunities, or just a good idea — reach out.”
- Primary CTA: `Send an email ↗`; secondary: `GitHub`, `LinkedIn`, `Resume` (chỉ hiển thị khi có URL).
- Góc phải dưới có hình học nhẹ (mũi tên to / dấu sao), không che text.
- Mobile: headline 2–3 dòng; CTA rõ ràng, full-width nếu cần; email có thể sao chép bằng nút phụ có trạng thái xác nhận accessible.

**Không nên:** biểu mẫu phức tạp trên homepage. Nếu có form ở `/contact`, chỉ hỏi Name, Email, Message và có anti-spam/rate limiting phù hợp.

## 1.16. Section 12 — Footer

- Hàng đầu: logo/wordmark, một câu giới thiệu ngắn, nhóm link sitemap/social.
- Hàng cuối: copyright theo năm hiện tại, liên kết privacy nếu có thu thập dữ liệu, back-to-top.
- Màu nền paper hoặc ink; nếu dùng nền tối, toàn bộ typography và icon phải đổi sang màu tương phản tương ứng.
- Có focus states và kích thước tương tác tối thiểu như các phần khác.

## 1.17. Nguyên tắc chuyển cảnh giữa các section

1. **Hero → Capability Marquee:** có border ngăn rõ ràng, không cần hiệu ứng scroll cinematic.
2. **About → Capability Board:** tăng khoảng trắng để chuyển từ đọc sang khám phá.
3. **Capabilities → Projects:** dùng một heading rất lớn làm điểm dừng thị giác.
4. **Projects → Toolbox:** giảm mật độ hình ảnh, đổi sang hệ thống badge gọn.
5. **Timeline → Lab:** đổi nền hoặc dùng đường kẻ ngang và section counter.
6. **Notes → Contact:** Contact phải đủ mạnh để kết thúc trải nghiệm, không bị footer át đi.

---

# 2. Design tokens hoàn chỉnh

## 2.1. Palette chính — Clean Neo-Brutal

Bảng màu dưới đây là **đề xuất riêng cho website này**, không phải khẳng định đây là bộ màu mặc định của thư viện tham khảo.

| Token đề xuất | Hex | Vai trò | Quy tắc |
|---|---|---|---|
| `color.ink` | `#111111` | Chữ chính, border, hard shadow | Dùng nhất quán ở giao diện sáng |
| `color.paper` | `#FFF9E9` | Nền website | Giữ diện tích lớn, giảm chói |
| `color.surface` | `#FFFFFF` | Card trung tính, nội dung dài | Tạo vùng nghỉ thị giác |
| `color.sun` | `#FFDB58` | Primary action, Contact, marquee | Một mảng vàng lớn / viewport là đủ |
| `color.sky` | `#89CFF0` | Featured work, sticker, card | Accent lạnh cân bằng vàng |
| `color.coral` | `#FF7661` | Nhấn chủ động, card chọn lọc | Không dùng làm màu lỗi hệ thống mặc định |
| `color.lime` | `#C6F56A` | Lab, experiments, capability | Dùng tiết chế |
| `color.pink` | `#F9A8D4` | Accent phụ hiếm gặp | Không bắt buộc ở MVP |
| `color.warm-line` | `#E9DFC9` | Phân tách nhẹ trong vùng văn bản | Không thay thế border đen của card |
| `color.muted-text` | `#5B5751` | Metadata phụ trên nền sáng | Kiểm tra tương phản theo nền thực tế |
| `color.focus` | `#0A54E8` | Focus indicator có độ nhận biết tốt | Không phụ thuộc duy nhất vào thay đổi màu |
| `color.negative` | `#B42318` | Thông báo lỗi text | Không dùng màu coral trang trí cho lỗi |
| `color.positive` | `#176B3A` | Trạng thái thành công | Luôn đi kèm text/icon |

**Phân bổ màu trên homepage (mục tiêu):** paper/surface ~65–75%, ink ~15–20% (chữ, border, shadow), các accent ~10–20%. Đây là tỷ lệ thị giác gợi ý, không phải thuật toán áp dụng cứng.

**Các phối hợp ưu tiên:** chữ `ink` trên `paper`, `surface`, `sun`, `sky`, `coral`, `lime`, `pink`; hạn chế chữ trắng trên các accent sáng. Card accent vẫn dùng border và shadow `ink`.

**Dark theme:** không nằm trong MVP. Nếu triển khai sau, cần **bộ semantic tokens riêng**, không đơn giản đảo nền sang đen rồi giữ nguyên text màu đen.

## 2.2. Semantic color roles

| Role | Token màu |
|---|---|
| App background | `paper` |
| Default text | `ink` |
| Default card background | `surface` |
| Strong separator / border | `ink` |
| Hard shadow | `ink` |
| Primary CTA | `sun` + text `ink` |
| Secondary CTA | `surface` + text `ink` |
| Hero status / eyebrow | `sky` + text `ink` |
| Featured project accent | `sky` hoặc `coral` |
| Experiment card accent | `lime` |
| Contact panel | `sun` + text `ink` |
| Metadata | `muted-text` trên nền sáng |
| Focus ring | `focus` với viền phụ phù hợp để nhìn rõ trên nền xanh |

CMS **không nhận giá trị hex tùy ý** cho từng card; chỉ nhận lựa chọn semantic preset (`default`, `sun`, `sky`, `coral`, `lime`, `pink`) để tránh phá hệ thống.

## 2.3. Typography

**Bộ font đề xuất:**

- **Display:** Space Grotesk (Bold 700) hoặc một grotesk display có hỗ trợ glyph cần thiết; dùng ở hero/section heading.
- **Body:** Manrope (Regular 400 / Medium 500 / Semibold 600) hoặc một sans dễ đọc; dùng cho mô tả và bài viết.
- **Mono:** IBM Plex Mono (Regular 400 / Medium 500); dùng cho index, metadata, label kỹ thuật, không dùng cả đoạn văn dài.

**Font phải được kiểm thử với ngôn ngữ nội dung thực tế, đặc biệt dấu tiếng Việt.** Nếu font display thiếu glyph tiếng Việt hoặc metrics không ổn định, chọn font thay thế có hỗ trợ đầy đủ thay vì trộn glyph tùy tiện.

| Style token | Desktop | Mobile | Weight | Line-height | Dùng cho |
|---|---|---|---|---|---|
| `type.hero` | 96–144px | 48–72px | 700 | 0.90–0.98 | Headline poster |
| `type.display` | 64–88px | 40–56px | 700 | 0.95–1.02 | Contact CTA |
| `type.h1` | 56–72px | 36–48px | 700 | 1.0–1.08 | Page title |
| `type.h2` | 40–52px | 28–36px | 700 | 1.08–1.15 | Section heading |
| `type.h3` | 24–30px | 22–26px | 700 | 1.15–1.25 | Card / subheading |
| `type.lead` | 20–24px | 18–20px | 500 | 1.45 | Intro đoạn ngắn |
| `type.body` | 16–18px | 16px | 400–500 | 1.55–1.7 | Nội dung thường |
| `type.small` | 14px | 14px | 500 | 1.45–1.6 | Meta / caption |
| `type.label` | 12–14px | 12px | 500–600 | 1.3–1.5 | Badge / counter |

- **Tracking:** headline lớn từ -0.04em đến -0.055em sau khi kiểm tra thực tế; body dùng mặc định hoặc rất gần mặc định; mono label có thể +0.02em.
- **Viết hoa:** chỉ dành cho label, section index và một số headline ngắn; tránh viết hoa cả body.
- **Giới hạn dòng:** body dài 65–75 ký tự; caption 40–55 ký tự; intro không quá 2–3 dòng desktop.
- **Fluid type:** scale mượt theo kích thước viewport và có min/max; không để chữ Hero gây horizontal overflow ở 320px.

## 2.4. Spacing scale

**Base unit:** 4px; ưu tiên bội số 4/8, dùng số lẻ chỉ khi có lý do thị giác cụ thể.

| Token | Kích thước | Ví dụ |
|---|---|---|
| `space.1` | 4px | Khoảng giữa icon và label nhỏ |
| `space.2` | 8px | Icon + text / chip gap |
| `space.3` | 12px | Khoảng cách tags |
| `space.4` | 16px | Card gap trên mobile |
| `space.5` | 20px | Padding card nhỏ |
| `space.6` | 24px | Grid desktop gap / padding card |
| `space.8` | 32px | Khoảng cách khối nội dung |
| `space.10` | 40px | Subsection gap |
| `space.12` | 48px | Heading đến grid |
| `space.16` | 64px | Khoảng dọc mobile section |
| `space.20` | 80px | Khoảng dọc tablet |
| `space.24` | 96px | Khoảng dọc desktop vừa |
| `space.28` | 112px | Section desktop tiêu chuẩn |
| `space.32` | 128px | Section desktop lớn |

**Gutters:** desktop 40–64px tùy viewport đến khi container đạt max-width; tablet 32px; mobile 16–20px. Không để hard shadow tạo thanh cuộn ngang.

## 2.5. Border, shadow, radius

| Nhóm | Token | Giá trị | Ứng dụng |
|---|---|---|---|
| Border | `border.hairline` | 1px solid ink | Đường chia nội dung ít nhấn |
| Border | `border.default` | 2px solid ink | Badge, nav, input nhỏ |
| Border | `border.strong` | 3px solid ink | Card, button, section frame |
| Border | `border.poster` | 4px solid ink | Hero sticker, featured card |
| Shadow | `shadow.none` | Không đổ bóng | Text block, ảnh dài |
| Shadow | `shadow.sm` | 3px 3px 0 ink | Badge và card nhỏ |
| Shadow | `shadow.md` | 5px 5px 0 ink | Button và card thường |
| Shadow | `shadow.lg` | 8px 8px 0 ink | Featured project / special poster |
| Shadow | `shadow.xl` | 12px 12px 0 ink | Chỉ một điểm nhấn lớn |
| Radius | `radius.none` | 0px | Divider / poster line |
| Radius | `radius.sm` | 6px | Badge |
| Radius | `radius.md` | 10px | Button / input |
| Radius | `radius.lg` | 14px | Project card |
| Radius | `radius.xl` | 20px | Hero sticker / special CTA |

**Quy tắc:** shadow cứng, không blur; hover “nhấc” lên và giữ bóng hoặc press “đẩy” nút xuống cùng hướng bóng. Không dùng blur glassmorphism hay đổ bóng mềm cho card Neo-Brutal.

## 2.6. Layout, layering, breakpoints

| Token | Giá trị đề xuất | Ghi chú |
|---|---|---|
| `layout.max-width` | 1280px | Khu vực nội dung chính |
| `layout.text-width` | 720px | Trang Notes / case study body |
| `layout.grid-desktop` | 12 columns, gap 24px | Bắt đầu từ ≥1280px |
| `layout.grid-tablet` | 8 columns, gap 20px | 768–1279px |
| `layout.grid-mobile` | 4 columns, gap 12px | <768px |
| `breakpoint.sm` | 640px | Điều chỉnh nội dung mobile lớn |
| `breakpoint.md` | 768px | Chuyển mobile/tablet |
| `breakpoint.lg` | 1024px | Grid nội dung phức tạp |
| `breakpoint.xl` | 1280px | Poster desktop đầy đủ |
| `breakpoint.2xl` | 1536px | Giữ max-width để tránh quá giãn |

**Z-index tiers:** nền/decorative < nội dung < floating sticker < sticky header < menu/dialog < toast. Không dùng z-index tùy ý ở từng component; nhất quán theo tên tầng.

## 2.7. Components và trạng thái tương tác

| Thành phần | Default | Hover | Focus / Active | Disabled |
|---|---|---|---|---|
| Primary button | Sun, viền 3px, shadow 5px | Dịch nhẹ / shadow thay đổi | Outline rõ, press tactile | Độ tương phản phù hợp, không thể bấm |
| Secondary button | Surface, viền 3px | Nền sky hoặc underline | Outline rõ | Có nhãn trạng thái |
| Link text | Ink + underline rõ ở nơi cần | Underline dày/mũi tên lệch | Focus không phụ thuộc màu | Không áp dụng nếu là text thường |
| Project card | Surface/accent + border/shadow | Nhấc 3px, không đổi kích thước ảnh | Focus toàn card nếu card là một link | Không có hover giả cho card không click |
| Tag/chip | Border 2px, radius sm | Chỉ hover nếu tương tác | Selected có nhãn/icon rõ | Muted nhưng đọc được |
| Input | Surface, border 2px | Border giữ ổn định | Focus ring rõ, lỗi mô tả bằng text | Có label |
| Tabs/filters | Nhóm button có selected state | Hover nhẹ | Arrow keys/focus tùy pattern | Có fallback không-JS nếu cần |

**Hit target:** mục tiêu ít nhất 44×44px cho action quan trọng trên mobile; các target nhỏ có khoảng cách đủ rộng, không làm shadow cản thao tác.

## 2.8. Motion tokens và mức sử dụng

| Token | Thời lượng | Easing định hướng | Dùng cho |
|---|---|---|---|
| `motion.fast` | 120–160ms | Ease-out nhanh | Button press, icon |
| `motion.base` | 180–240ms | Ease-out / snappy | Hover card, menu nhỏ |
| `motion.enter` | 320–450ms | Decelerate | Section reveal có kiểm soát |
| `motion.page` | 400–600ms tối đa | Ease-in-out | Chuyển trạng thái nhẹ, không chặn navigation |
| `motion.stagger` | 40–70ms / item | Theo nhóm | Headline lines, card list giới hạn |
| `motion.distance-small` | 2–4px | — | Hover/press |
| `motion.distance-enter` | 12–24px | — | Reveal |
| `motion.rotate-sticker` | ±2–4° | — | Poster decoration |

**Quy định bắt buộc:**

- Animate ưu tiên `transform` và `opacity`; tránh animating width/height/top/left trên nhiều phần tử.
- `prefers-reduced-motion` giảm hoặc tắt marquee, parallax, stagger và auto-motion; nội dung vẫn phải hiện đầy đủ.
- Không dùng animation vô hạn cho nội dung chính, không tự phát âm thanh, không làm người dùng mất định hướng khi cuộn.
- Không dùng scroll-jacking. Smooth scroll chỉ áp dụng khi phù hợp và phải tôn trọng reduced motion.
- Nếu hero animation không tải, bố cục tĩnh vẫn **giống thiết kế hoàn chỉnh**, không để thành phần vô hình.

## 2.9. Icon, hình ảnh và đồ họa

- **Icon:** nét đồng đều khoảng 2–2.5px, tối giản, không dùng 3 bộ icon lẫn lộn; có thể dùng Lucide hoặc custom SVG nhất quán.
- **Decoration:** starburst, dấu cộng, mũi tên cong, đường gạch, sticker và hình học 2D. Tạo bằng SVG/CSS thay cho ảnh raster lớn.
- **Project thumbnail:** hình thật hoặc mockup có chú thích; giữ tỉ lệ ổn định, chủ động chọn điểm crop.
- **Ảnh đại diện:** không bắt buộc trong Hero; nếu muốn dùng, đặt tại About với khung neo-brutal riêng.
- **Illustration:** tối đa 1 minh họa lớn trong một viewport; không trang trí cạnh tranh với hình dự án.

---

# 3. Spec triển khai frontend — Next.js + Tailwind CSS / SCSS

## 3.1. Architectural goals và phạm vi

**Ưu tiên theo thứ tự:** (1) đọc nội dung tốt, (2) tốc độ tải, (3) cập nhật CMS, (4) animation có chủ đích, (5) hiệu ứng thử nghiệm tùy chọn.

**Ứng dụng:** Next.js App Router với TypeScript; trang chủ và các trang nội dung chủ yếu là render phía server; Client Components chỉ cho menu, filters, tabs, interaction, animation thực sự cần JS.

**Ranh giới quan trọng:** HTML nội dung, dự án và bài viết không được phụ thuộc client fetching để xuất hiện lần đầu. Tránh đưa toàn bộ homepage vào một Client Component chỉ để chạy animation.

## 3.2. Styling strategy: Tailwind v4 kết hợp SCSS đúng cách

**Khuyến nghị chính:** Tailwind CSS v4 là hệ thống styling chủ đạo; **global design tokens đặt trong một stylesheet CSS dành cho Tailwind** và đồng bộ bằng CSS custom properties.

- **Tailwind:** grid, flex, typography, color, spacing, border, responsive states, đa số hover/focus.
- **CSS thuần:** theme variables, global typography, reset phù hợp, keyframes nhỏ, reduced motion, các quy tắc xuyên component.
- **SCSS Modules (tùy chọn, dùng ít):** chỉ cho poster composition phức tạp hoặc trang có nhiều nét trang trí/animation riêng khó biểu đạt gọn bằng utilities.
- **Tránh:** đưa toàn bộ Tailwind pipeline vào file `.scss`; dùng Sass để điều khiển theme variables của Tailwind v4; trộn `@apply`/directives Tailwind tùy tiện trong SCSS Modules; tạo 2 nguồn token màu riêng.

**Lý do:** Tailwind v4 **không được thiết kế để dùng chung Sass như CSS preprocessor**, trong khi Next.js vẫn hỗ trợ `.module.scss` độc lập. Vì vậy dùng CSS chính cho Tailwind và chỉ dùng SCSS ở các component tách biệt nếu thực sự cần.

**Thứ tự ưu tiên triển khai:** thử Tailwind + CSS trước; chỉ bổ sung SCSS nơi chứng minh được lợi ích về tính tổ chức.

## 3.3. Frontend modules / ownership

| Module | Nội dung | Tương tác cần JS? |
|---|---|---|
| Site shell | Header, Footer, skip link, theme foundation | Mobile menu: có |
| Hero poster | Poster layout, heading, CTA, feature teaser | Tùy chọn: nhẹ |
| Section primitives | Container, section title, separator, sticker, card shell | Không |
| Capabilities | Card grid từ CMS | Không |
| Featured work | Feature card + project grid | Không; filter mở rộng: có |
| Toolbox | Nhóm technology | Tabs/filter: có nếu dùng |
| Journey | Timeline | Không |
| Lab | Experiment cards | Filter: có nếu dùng |
| Notes | Article summaries, nội dung bài | Không cho render, TOC tương tác nếu cần |
| Contact | CTA và liên kết | Copy email/form: có nếu dùng |
| CMS adapters | Query nội dung, mapping, validation, preview | Phần lớn phía server |
| SEO/metadata | Title, OG, sitemap, structured data | Không |

**Quy tắc component:** chia component theo hành vi và semantic role, không chia nhỏ vô hạn thành các wrapper không có ý nghĩa. Content-driven card dùng một data contract nhất quán để thay đổi CMS không ảnh hưởng layout.

## 3.4. Cấu trúc tổ chức dự án ở mức khái niệm (không phải code mẫu)

| Khu vực | Phạm vi trách nhiệm |
|---|---|
| `app` | Pages, layouts, routes và metadata theo App Router |
| `components/ui` | Button, card, label, icon, tooltip, modal, tabs |
| `components/sections` | Hero, Capabilities, Work, Journey, Lab, Notes, Contact |
| `components/layout` | Header, footer, navigation, section wrapper |
| `styles` | Tailwind entry CSS, token definitions, global styles, SCSS modules tùy chọn |
| `content` | Mock fixtures / MDX khi chưa kết nối CMS; không phải dữ liệu sản xuất lâu dài |
| `lib/cms` | Provider adapter, query, normalization và caching |
| `lib/seo` | Metadata, canonical, OG và structured-data mapping |
| `lib/validation` | Schema validation, xử lý dữ liệu thiếu |
| `public` | Hình ảnh tĩnh, icon, resume public được chủ sở hữu duyệt |
| `tests` | Unit, component, integration, accessibility và E2E checks |

## 3.5. Content architecture: thiết kế để CMS chỉnh dễ

### Quy tắc chung

- Tách **layout config** khỏi **editorial content**; người quản lý thay text, ảnh, tag, section order trong giới hạn cho phép.
- CMS có draft/publish, preview, scheduled publish nếu nền tảng hỗ trợ, version history và media library.
- CMS xử lý lỗi trường bắt buộc, slug trùng, URL hỏng, màu sai preset, headline quá dài và ảnh thiếu alt text.
- Ảnh, video và file đính kèm phải có ownership rõ ràng; không tự động công khai bản CV riêng tư chưa được duyệt.
- Chọn CMS theo vận hành: **Payload / Sanity / Strapi** hoặc nền tảng tương đương; đặc tả này không phụ thuộc nhà cung cấp cụ thể.

### Collections và fields tối thiểu

| Content type | Trường dữ liệu quan trọng | Ghi chú |
|---|---|---|
| `siteSettings` | siteTitle, description, logo, socialLinks, resumeUrl, contactEmail, seoDefaults | Singleton |
| `homePage` | hero, sectionOrder, enabledSections, selectedProjects, contactCopy | Singleton; không cần deploy khi đổi copy |
| `capabilities` | title, description, iconKey, accentPreset, order, relatedProjectIds | Item list |
| `projects` | slug, title, year, summary, cover, problem, contribution, approach, outcomes, stack, links, status, featured, order, seo | Collection |
| `technologies` | name, group, icon, featured, order | Collection |
| `experience` | organization, titleAtTime, category, startDate, endDate, description, highlights, order | Collection |
| `experiments` | slug, title, summary, cover, status, links, content, tags, seo | Collection |
| `notes` | slug, title, excerpt, body, cover, tags, publishedAt, updatedAt, seo | Collection |
| `navigation` | label, href, placement, order, external | Singleton hoặc menu schema |
| `announcements` | enabled, message, href, label, dates | Optional |

**Quan hệ dữ liệu:** Project có thể liên kết tới capability và technology; Home chỉ lưu ID của project được ghim, không sao chép toàn bộ nội dung. Khi xóa project, trang chủ có fallback an toàn.

**Field có giới hạn biên tập gợi ý:** hero headline tối đa 3 dòng; project excerpt 80–150 ký tự; capability description 1–2 câu; card title tối đa 2 dòng; mỗi tag 1–3 từ; tối đa 2 CTA quan trọng trong Hero.

### Biên tập mà không sửa code

- Sửa Hero text/CTA/accent preset.
- Sắp xếp hoặc bật/tắt section.
- Đổi Project featured và thứ tự card.
- Tạo project, experiment, note mới với preview.
- Đổi social links, resume, contact email.
- Quản lý metadata SEO và OG image.
- Tắt announcement, Lab hoặc Notes nếu chưa đủ nội dung mà không để vùng trống.

## 3.6. Rendering, caching và publish workflow

- **Trang chủ, Work, Lab, Notes:** ưu tiên server rendering và caching phù hợp với tần suất cập nhật. Dữ liệu công khai tương đối ổn định nên phục vụ từ cache khi có thể.
- **Trang chi tiết:** tạo trang SEO-friendly theo slug, metadata riêng, 404 hợp lệ khi slug không tồn tại/không được xuất bản.
- **CMS publish:** webhook đáng tin cậy có xác thực để làm mới nội dung liên quan; có cơ chế preview cho nội dung draft; phân biệt preview và public cache.
- **Cache invalidation:** làm mới đúng trang/listing/section bị ảnh hưởng khi cập nhật thay vì luôn làm mới toàn site. Chi tiết API phụ thuộc cấu hình Next.js caching được chọn.
- **Media:** dùng ảnh kích thước phù hợp, tối ưu định dạng, cache/CDN có chiến lược rõ.
- **External embeds:** GitHub widget, video, mạng xã hội, chart nặng chỉ tải khi cần; ưu tiên link thường nếu embed không tạo đủ giá trị.

## 3.7. Performance budgets và đo lường

**Ngân sách mục tiêu (không phải cam kết tự động đạt):**

| Chỉ số | Mục tiêu | Cách đánh giá |
|---|---|---|
| LCP | ≤ 2.5 giây (p75 thực tế) | Field RUM / CrUX khi có dữ liệu |
| INP | ≤ 200 ms (p75 thực tế) | Field RUM / CrUX |
| CLS | ≤ 0.1 (p75 thực tế) | Field RUM / CrUX |
| Lighthouse Performance | ≥ 90 trên các cấu hình thử nghiệm đã thống nhất | Lab/CI, không thay thế field data |
| Lượng JS gửi tới mobile | Tối thiểu theo tính năng; thiết lập budget sau đo bundle | Bundle analyzer / build report |
| Ảnh LCP | Đúng kích thước, không lazy-load hero asset trọng yếu | Lighthouse/network waterfall |
| Web fonts | Không phụ thuộc nhiều font variants; tránh layout shift | Network + visual regression |

**Quy tắc triển khai:**

1. Dùng Server Components mặc định; đánh dấu client boundary hẹp.
2. Ưu tiên CSS/SVG animation; không đưa GSAP/Framer Motion vào toàn bộ site nếu vài hover dùng CSS là đủ.
3. Load ảnh theo viewport và kích thước card; khai báo kích thước/aspect ratio; không lazy-load asset quyết định LCP.
4. Load font được tối ưu bằng Next.js, có fallback hợp lý, không tải quá nhiều weights/subsets.
5. Tách phần tương tác nặng (demo, visualization, editor) sang route Lab và lazy-load khi người dùng chủ động mở.
6. Không để analytics, chat widgets hoặc thư viện icon nặng chạy trước nội dung quan trọng.
7. Đo trên mobile network và thiết bị tầm trung, không chỉ desktop mạnh.

## 3.8. Animation architecture

| Nhóm animation | Công nghệ ưu tiên | Nguyên tắc |
|---|---|---|
| Hover / press | CSS / Tailwind | Không cần JavaScript |
| Entrance reveal | CSS hoặc JS nhẹ theo intersection | Chỉ chạy một lần, không ẩn nội dung khi JS thất bại |
| Marquee | CSS khi cần | Pause và reduced motion |
| Header behavior | CSS sticky + trạng thái tối thiểu | Không cần lắng nghe scroll liên tục nếu tránh được |
| Complex hero motion | Chỉ dùng motion library cho tương tác thực sự tạo giá trị | Dynamic import, không làm blocker |
| Demo/WebGL | Chỉ trong Lab nếu dự án yêu cầu | Fallback tĩnh, lazy-load, giới hạn frame/battery |

**Không triển khai:** animation ở mọi chữ/card, smooth-scroll override, screen transition chặn điều hướng, parallax mạnh gây say chuyển động.

## 3.9. Accessibility và responsive specification

- Chuẩn mục tiêu: **WCAG 2.2 AA** cho nội dung và tác vụ chính; kiểm tra bằng máy **và** bàn phím/đọc màn hình.
- Semantic headings đúng cấp, landmark hợp lý, skip-to-content, alt text cho ảnh có ý nghĩa, decoration ẩn với assistive tech.
- Tất cả action có thể sử dụng bằng bàn phím; focus visible; dialog/menu có quản lý focus và Escape.
- Màu không phải dấu hiệu duy nhất cho selected/status/error; kiểm tra tương phản thực tế của text trên accent.
- Hỗ trợ zoom 200–400%, responsive reflow ở viewport nhỏ, font scaling và nội dung tiếng Việt/tiếng Anh dài ngắn khác nhau.
- Target tương tác đủ rộng; hover không phải cách duy nhất xem nội dung; tooltip không che CTA.
- `prefers-reduced-motion` là yêu cầu chấp nhận được test, không phải nâng cấp tùy chọn.
- Kiểm tra form/contact cho thông báo lỗi gắn đúng field, trạng thái gửi, thông báo thành công và chống spam phù hợp.

### Responsive acceptance matrix

| Thành phần | 320–430px | 768–1023px | ≥1280px |
|---|---|---|---|
| Hero | Stack dọc; không chồng chữ; CTA rõ | Poster nén, sticker tách dòng | Poster 12 cột hoàn chỉnh |
| Header | Mobile menu accessible | Menu tùy không gian | Navbar đầy đủ |
| Capabilities | 1 cột | 2 cột | 3 cột |
| Featured work | 1 cột | 2 cột cho card nhỏ | Feature 12 cột + 2 cột card |
| Toolbox | Grid nhỏ / wrap | 3–4 cột | 5–6 cột |
| Timeline | Trục bên trái | Trục bên trái | Trục năm + nội dung trải rộng |
| Lab | 1 cột | 2 cột | 4 cột biến thiên |
| Notes | 1 cột | 2 cột | 3 cột |
| Contact | CTA stack, text không tràn | Type scale vừa | Typography poster lớn |

## 3.10. SEO, chia sẻ và nội dung đa ngôn ngữ

- Từng route có title và description riêng; dự án/bài viết dùng metadata từ CMS với fallback an toàn.
- URL slug ngắn, ổn định; canonical thích hợp; sitemap, robots và redirect nếu đổi slug.
- OG image 1200×630 hoặc tỉ lệ phù hợp cho link preview; tên dự án và hình rõ ở kích thước thu nhỏ.
- Structured data tùy loại nội dung: Person/ProfilePage trên giới thiệu, Article/BlogPosting cho bài viết, CreativeWork/SoftwareApplication khi khớp loại dự án và có thông tin thật.
- Ảnh có alt text, heading có ngữ nghĩa; không ép mọi chữ thành ảnh hoặc canvas vì SEO.
- Nếu hỗ trợ VI/EN: có cấu trúc locale rõ, nội dung dịch riêng trong CMS, hreflang/canonical đúng; không trộn hai ngôn ngữ trong cùng block thiếu kiểm soát.

## 3.11. Security / quản trị nội dung

- Public website chỉ đọc dữ liệu đã publish. Không lộ CMS tokens, preview secret hoặc private draft qua frontend.
- Webhook cache invalidation xác thực và giới hạn phạm vi; các liên kết ngoài được rà soát.
- Rich text có pipeline render/sanitize an toàn; không cho editor chèn script tùy ý.
- Form liên hệ: validate phía server, rate limiting / anti-spam, không hiển thị thông tin lỗi nội bộ cho người dùng.
- CMS phân quyền editor/admin; media được kiểm tra định dạng, dung lượng và quyền sử dụng trước khi xuất bản.

## 3.12. Kế hoạch thực hiện theo pha

| Pha | Phạm vi | Điều kiện hoàn thành |
|---|---|---|
| **P0 — Foundation** | IA, semantic tokens, typography, primitives, responsive grid | Có style guide và các component cơ sở thống nhất |
| **P1 — Homepage** | Header, Hero, About, Capabilities, Work, Toolbox, Journey, Lab, Notes, Contact, Footer | Responsive hoàn chỉnh, copy đọc tốt, liên kết hoạt động |
| **P2 — Content pages** | Work list/detail, Lab list/detail, Notes list/detail, About, Contact | Trang chi tiết có nội dung, metadata, empty/404 states |
| **P3 — CMS** | Collections, editor validation, preview, publish hook, media, featured ordering | Editor thay nội dung phổ biến mà không sửa frontend |
| **P4 — Motion & Polish** | Hover, press, limited reveal, sticker behavior | Reduced motion hoạt động, không gây CLS đáng kể |
| **P5 — Quality Gate** | SEO, accessibility, E2E, performance, browser test, deploy | Đạt checklist nghiệm thu, không có lỗi nghiêm trọng |

**MVP không cần:** dark mode, 3D/WebGL toàn trang, AI chatbot portfolio, multilingual nếu chưa có nội dung dịch chuẩn, blog editor tự phát triển từ đầu.

## 3.13. Acceptance criteria — checklist bàn giao

### Visual / content

- [ ] Giao diện đúng tinh thần Neo-Brutal: viền rõ, shadow cứng, màu accent nhất quán, typography lớn nhưng đọc được.
- [ ] Hero là **poster bất đối xứng**, không biến về layout text-trái/ảnh-phải thông thường.
- [ ] Headline, intro và navigation định vị “developer / builder” tổng quát, không gắn cứng một role.
- [ ] CTA đầu trang và cuối trang dễ nhận biết và dẫn đúng đích.
- [ ] Projects kể được bối cảnh, đóng góp, quyết định và kết quả; không có dữ liệu giả.
- [ ] Trang không bị trống hoặc vỡ khi collection thiếu item/ảnh hoặc một section bị tắt.

### Technical

- [ ] Tối ưu Server Components; chỉ tương tác thực sự cần mới sử dụng Client Components.
- [ ] Tailwind v4 và SCSS (nếu có) được tách trách nhiệm; không có nguồn design token cạnh tranh.
- [ ] Không có horizontal overflow tại 320, 375, 390, 768, 1024, 1280, 1440px.
- [ ] Content, images, fonts có chiến lược tải phù hợp; performance được đo, không tự nhận đạt ngưỡng khi chưa có số liệu.
- [ ] Nội dung quan trọng hiển thị khi animation bị tắt; menu và form vẫn usable bằng keyboard.
- [ ] Metadata, OG, sitemap, canonical và 404 hoạt động theo route.

### CMS / operations

- [ ] Có thể sửa Hero, card, thứ tự project, skills, notes, social links và CTA qua CMS mà không sửa source.
- [ ] Preview và publish không làm lộ draft ra site công khai.
- [ ] Dữ liệu được validation; project slug duy nhất; ảnh có alt khi là nội dung có ý nghĩa.
- [ ] Khi xuất bản nội dung, cache tương ứng được cập nhật theo chiến lược đã chọn.
- [ ] Có hướng dẫn editor ngắn: thay text, upload ảnh, đổi featured item, preview, publish, rollback.

### Accessibility / responsive

- [ ] Hero và card không che nhau ở mobile, màn hình zoom cao hoặc khi copy dài hơn mẫu.
- [ ] Tương phản, focus, menu, reduced motion và keyboard navigation được kiểm thử thủ công.
- [ ] Tất cả controls có accessible labels và trạng thái tương tác rõ ràng.

---

## Kết luận triển khai

**Hướng chốt:** `Clean Neo-Brutal` + `Asymmetric Poster Hero` + `Capability-first Content` + `CMS-driven Project Stories`.

**Thông điệp chủ đạo:** **“I build things that work.”** — đủ rộng để trình bày web applications, backend, AI workflows, tools, systems và các hướng phát triển trong tương lai, không khóa portfolio vào bất kỳ vị trí tuyển dụng nào.

**Quy tắc thành công:** Hero tạo dấu ấn trong vài giây; Work chứng minh năng lực; CMS làm nội dung sống lâu; hiệu năng và accessibility giữ trải nghiệm thực dụng.

### Tài liệu kỹ thuật tham chiếu

1. Neobrutalism components — [Introduction](https://www.neobrutalism.dev/docs). Tham chiếu tinh thần thiết kế và hệ component, **không** sao chép palette mặc định.
2. Tailwind CSS — [Theme variables](https://tailwindcss.com/docs/theme): design tokens và CSS-first themes.
3. Tailwind CSS — [Compatibility](https://tailwindcss.com/docs/compatibility): lưu ý Sass/Less trong Tailwind v4.
4. Next.js — [Sass guide](https://nextjs.org/docs/app/guides/sass): khả năng dùng `.module.scss` khi có yêu cầu độc lập.
5. Next.js — [Font optimization](https://nextjs.org/docs/app/getting-started/fonts), [Metadata & OG](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), [Caching and revalidation](https://nextjs.org/docs/app/getting-started/revalidating).

*Các kích thước, khoảng cách, màu sắc và motion values là đề xuất thiết kế để triển khai; cần tinh chỉnh sau khi có mockup và kiểm thử với nội dung thật.*
