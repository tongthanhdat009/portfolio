<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# contact

## Purpose
The `/contact` route — an inquiry page with a direct-email card, a channels/profiles rail (social links and the resume), and an accessible contact form. The page itself is a thin Server Component; all interactivity lives in a separate client component so the split keeps the data fetch on the server and the form state on the client.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component. Fetches `getSiteSettings()` and renders `<ContactContent settings={settings} />`. No metadata export — the root layout's title template applies |
| `ContactContent.tsx` | `'use client'` component. Local state for `copied`, `formData` (`name`, `email`, `message`, `honeypot`), `submitted`, `error`. Copy-to-clipboard for the email address, honeypot anti-spam field, inline required-field validation, and a success panel with a "Send Another Note" reset. Also defines a local `SocialIcon` helper that maps a platform name to `GithubIcon` / `LinkedinIcon` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- `ContactContent.tsx` must stay `'use client'`. `page.tsx` stays a Server Component — do not merge them.
- The form does **not** send anything anywhere. `handleSubmit` only checks the honeypot and that the three fields are non-empty, then flips to the success state. There is no backend endpoint for it.
- The honeypot input is hidden (`className="hidden"`, `aria-hidden`, `tabIndex={-1}`, `autoComplete="off"`). If it is filled, the submit silently returns — keep that behaviour.
- The local validation duplicates `validateContactForm` in `@/lib/validation`, but with different rules (that helper requires ≥2-char name, an email regex, ≥10-char message; the component only checks non-empty). If you unify them, both call sites must still pass `pnpm typecheck`.
- Field labels use `htmlFor`/`id` pairs (`contact-name`, `contact-email`, `contact-message`) — keep them wired for screen readers.
- The error banner uses `role="alert"`.
- All copy is overridable through `SiteSettings`: `contactEmail`, `contactEyebrow`, `contactHeading`, `contactIntro`, `socialLinks`, `resumeUrl`. The component falls back to hard-coded defaults when a setting is missing.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after changing the page or adding an import.
- Manual in `next dev`: submit empty (expect the inline error), fill the honeypot via devtools (expect no visible change), fill all fields (expect the success panel), click "Copy Email Address" (expect the clipboard confirmation for 2.5 s).

### Common Patterns
- Copy-to-clipboard uses `navigator.clipboard.writeText` — browser-only, which is why this file is a client component.
- Layout is a 12-column grid: 5 columns for direct info, 7 for the form, stacking to one column below `lg`.
- The clipboard confirmation resets itself with `setTimeout(..., 2500)`; the notification toast in the admin console uses a similar pattern.

## Dependencies

### Internal
- `@/lib/cms` — `getSiteSettings()`
- `@/components/ui/Icons` (`GithubIcon`, `LinkedinIcon`), `@/components/ui/Card`, `@/components/ui/Button`
- `@/types` — `SiteSettings`

### External
- `next` (`next/link`), `react` (`useState`), `lucide-react` (`ArrowLeft`, `Mail`, `Copy`, `Check`, `Send`, `FileText`, `Sparkles`)

<!-- MANUAL: -->
