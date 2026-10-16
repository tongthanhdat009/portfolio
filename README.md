# Modern Neo-Brutal Developer Portfolio

A high-performance developer portfolio built according to [`modern-neobrutal-dev-portfolio-spec.md`](./modern-neobrutal-dev-portfolio-spec.md).

**Theme:** Clean Neo-Brutalism ("BUILD LOUD. THINK CLEAR.")  
**Stack:** Next.js (App Router) · Tailwind CSS v4 · TypeScript · Headless CMS architecture

---

## 🚀 Key Features

1. **Asymmetric Poster Hero:** Non-standard, high-impact 12-column canvas with multi-line typography (`I BUILD / THINGS THAT / WORK.`), micro-status sticker, SVG starburst mark, and featured build ticker.
2. **Accessible Neo-Brutalism:** Pure hard shadows (`5px 5px 0 #111111`), tactile button press shifts (`2px 2px`), high-contrast ink on warm paper palette, and strict WCAG 2.2 AA compliance.
3. **Capability-First Architecture:** Eliminates rigid job titles in favor of actionable engineering vectors: Web Products, Backend & APIs, Intelligent Workflows, Systems & Architecture, Developer Tools, and Lab Experiments.
4. **Comprehensive Case Studies:** Deep dives into problem contexts, architectural trade-offs, engineering contributions, verified production metrics, and lessons learned.
5. **Headless CMS & Content Adapter:** Fully decoupled data layer (`src/lib/cms/index.ts` and `src/content/`) allowing non-technical editors to update content, toggle sections, reorder projects, and configure announcements without touching layout code.
6. **Zero-Overhead Static Generation:** All pages and dynamic routes pre-rendered with `generateStaticParams`.

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
```

---

## 📝 Editor Guide (Updating Content)

To update content without modifying React components:
- **Hero & Manifesto:** Edit `src/content/homePage.ts`
- **Announcement Strip:** Edit `src/content/announcements.ts`
- **Site Metadata & Socials:** Edit `src/content/siteSettings.ts`
- **Projects & Case Studies:** Add or edit items in `src/content/projects.ts`
- **Engineering Tools:** Edit `src/content/technologies.ts`
- **Timeline Milestones:** Edit `src/content/experience.ts`
- **Lab Experiments:** Edit `src/content/experiments.ts`
- **Field Notes:** Edit `src/content/notes.ts`
