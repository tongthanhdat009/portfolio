# Modern Neo-Brutal Developer Portfolio

A high-performance developer portfolio built according to [`modern-neobrutal-dev-portfolio-spec.md`](./modern-neobrutal-dev-portfolio-spec.md).

**Theme:** Clean Neo-Brutalism ("BUILD LOUD. THINK CLEAR.")  
**Stack:** Next.js (App Router) · Tailwind CSS v4 · TypeScript · Headless CMS & Local Admin Dashboard

---

## 🚀 Key Features

1. **Asymmetric Poster Hero:** Non-standard, high-impact 12-column canvas with multi-line typography (`I BUILD / THINGS THAT / WORK.`), micro-status sticker, SVG starburst mark, and featured build ticker.
2. **Accessible Neo-Brutalism:** Pure hard shadows (`5px 5px 0 #111111`), tactile button press shifts (`2px 2px`), high-contrast ink on warm paper palette, and strict WCAG 2.2 AA compliance.
3. **Capability-First Architecture:** Eliminates rigid job titles in favor of actionable engineering vectors: Web Products, Backend & APIs, Intelligent Workflows, Systems & Architecture, Developer Tools, and Lab Experiments.
4. **Comprehensive Case Studies:** Deep dives into problem contexts, architectural trade-offs, engineering contributions, verified production metrics, and lessons learned.
5. **Local Neo-Brutal Admin Dashboard (`/admin`):**
   - Protected with Security PIN/Password authentication (`portfolio_admin_auth` cookie session).
   - Real-time management interface to create, edit, and delete **Projects**, **Lab Experiments**, **Field Notes**, and the **Header Announcement**.
   - One-click GitHub synchronization button directly on the dashboard.
   - Live visual preview of components inside the admin panel.
6. **Zero-Overhead Static Generation:** All public pages and dynamic routes pre-rendered with `generateStaticParams`.

---

## 🔐 Admin Console (`/admin`)

Access the management dashboard at `/admin`.

- **Default PIN:** `neo2026`
- **Custom PIN configuration:** Set the `ADMIN_PIN` environment variable:
  ```bash
  # .env.local
  ADMIN_PIN=your_custom_secure_pin_or_password
  ```

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router with Server Components default)
- **Styling:** Tailwind CSS v4 with CSS-first design tokens (`src/styles/globals.css`)
- **Typography:** Space Grotesk (Display) · Manrope (Body) · IBM Plex Mono (Technical Meta) via `next/font/google`
- **Icons:** Minimal line-art SVG icons and Lucide React (uniform 2–2.5px stroke)

---

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages and metadata
│   ├── layout.tsx        # Global shell: SkipLink, Announcement, Header, Footer
│   ├── page.tsx          # Assembled 12-section homepage
│   ├── admin/            # Local Admin Console (/admin) with Server Actions & PIN protection
│   ├── work/             # All projects listing and [slug] case study details
│   ├── lab/              # Digital laboratory listing and [slug] breakdown
│   ├── notes/            # Field logs listing and [slug] reader with TOC
│   ├── about/            # Extended background, principles & timeline
│   ├── contact/          # Accessible inquiry form & copyable inbox
│   └── not-found.tsx     # Neo-brutal 404 page
├── components/
│   ├── layout/           # Header, Footer, AnnouncementStrip, SkipLink
│   ├── sections/         # Hero, Marquee, About, Capabilities, Work, Toolbox, Journey, Lab, Notes, Contact
│   └── ui/               # Button (tactile press), Badge, Card, Icons
├── content/              # Content fixtures & schemas (siteSettings, homePage, projects, etc.)
├── lib/
│   ├── admin/            # Auth session & PIN verification helpers
│   ├── cms/              # CMS query and data normalization adapter
│   └── validation/       # Schema validators for slugs and contact form
├── styles/               # globals.css with Tailwind v4 @theme design tokens
└── types/                # Complete TypeScript domain models
```

---

## 💻 Development & Build

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Check TypeScript types
pnpm typecheck

# Build optimized static production bundle
pnpm build

# Start production server
pnpm start

# Sync GitHub repositories via CLI
pnpm sync:github
```
