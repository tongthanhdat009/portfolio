<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `public/` docs

Purpose: Static assets served verbatim at site root (favicons, images, `robots.txt`-style files).

Key Files: none — directory is currently empty; add files here to expose them at `/<name>`.

Subdirectories: none.

For AI Agents:

- Reference as absolute paths (`/og-image.png`); never import from `public/` in code.
- Keep assets small; no build processing applies.
- `seoDefaults.ogImage` in `src/content/siteSettings.ts` should point at a file placed here.

Dependencies: internal none; external none.

<!-- MANUAL: -->
