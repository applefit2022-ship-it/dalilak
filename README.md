# Dalilak (دليلك الحكومي)

Bilingual (Arabic RTL / English LTR) guide to Egyptian government services. React + Vite + TypeScript + Tailwind + GSAP, deployed to GitHub Pages, with Supabase (auth, Postgres, RLS) for accounts, favorites and the admin panel. Without Supabase the public site still works from bundled seed JSON.

> Informational guide only. Not a government website. All seed content is a draft flagged **needs review**; verify every fee, duration and requirement before publishing.

## Quick start

```bash
npm install
cp .env.example .env.local      # optional: add Supabase keys
npm run dev                      # http://localhost:5173
npm run build                    # seed → typecheck → vite build → prerender
npm run preview
```

## Supabase setup

1. Create a free project at supabase.com.
2. SQL Editor → run `supabase/schema.sql` (tables, triggers, RLS, grants), then `supabase/seed.sql` (15 categories, 50 services; idempotent).
3. Project Settings → API: copy the **Project URL** and the **anon public** key. Never use or commit the `service_role` key.
4. Authentication → URL Configuration: set Site URL to your Pages URL and add `https://<user>.github.io/<repo>/**` to Redirect URLs (needed for email confirmation and password reset).
5. Optional Google sign-in: enable the provider in Supabase, then set the repo variable `VITE_GOOGLE_AUTH=true`.

### Make the first admin
Sign up on the site, then in the SQL editor:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```
Roles can only be changed this way (no client policy writes `profiles`), so users cannot promote themselves.

### Row Level Security summary
| Table | Public / anon | Signed-in user | Admin |
|---|---|---|---|
| categories | read | read | write |
| services | read **published** only | read published | read all, write |
| favorites, checklist_state | none | own rows only | own rows only |
| profiles | none | read own row | none via client |

## GitHub Pages deployment

1. Push to `main`. Settings → Pages → Source: **GitHub Actions**.
2. Settings → Secrets and variables → Actions:
   - Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public values, but kept out of the repo)
   - Variables (optional): `VITE_GOOGLE_AUTH`, `VITE_CONTACT_EMAIL`, `CUSTOM_DOMAIN`
3. `.github/workflows/deploy.yml` computes the base path (`/repo/`, `/` for `user.github.io` repos or a custom domain) and the site URL for canonical links and the sitemap.

**Routing on refresh / deep links:** the app uses `BrowserRouter` with localized URLs (`/ar/...`, `/en/...`). The build prerenders every public route (home, services, 15 categories, 50 services, static pages, both languages) to real `index.html` files, and copies the shell to `404.html` so any other deep link (admin, login, favorites) loads the SPA via GitHub Pages' 404 fallback.

## SEO
Per-page title/description, canonical, hreflang (ar/en/x-default), Open Graph, `HowTo` + `FAQPage` JSON-LD on service pages, `sitemap.xml` and `robots.txt` (admin disallowed). Prerendered HTML also contains crawlable text (documents, steps, fees, duration, location). Services added later in Supabase are rendered client-side (their pages work, but only seed services are prerendered). To prerender new content, export JSON from the admin, replace `scripts/seed-source.mjs` data (or `src/data/seed.json` directly after adapting `build-seed.mjs`) and rebuild.

## Editing content
- **Admin panel** (`/ar/admin`, `/en/admin`): dashboard counts, services and categories CRUD, every text field in Arabic and English, reorder documents/steps/links and categories, publish/unpublish, "last verified" date, "needs review" flag, search, JSON import/export.
- **JSON format** (export = import): `{ "categories": [...], "services": [{ "slug": "...", "category": "<category slug>", "title_ar": "...", ... }] }`. Import upserts by `slug`.
- **Seed source:** `scripts/seed-source.mjs` → `node scripts/build-seed.mjs` regenerates `src/data/seed.json` and `supabase/seed.sql`.

## Design
Follows the Impeccable approach: OKLCH tokens with neutrals tinted toward the brand blue, restrained gold accent, modular type scale, 4px rhythm, list rows rather than nested cards, ease-out motion only, strong AA contrast in light and dark. Tokens live in `src/index.css` and are mapped in `tailwind.config.js`. Fonts: IBM Plex Sans Arabic (Arabic) and IBM Plex Sans (English), self-hosted via Fontsource, latin/arabic subsets only.

## Animation (GSAP)
Core + ScrollTrigger only (both free), dynamically imported so they never block first paint. Route transitions, hero timeline, staggered reveals, scroll-triggered sections, scrubbed step timeline, favorite/checkbox/theme/language/menu/modal micro-interactions, search-result stagger, admin counters. Horizontal offsets use `inlineStart()` so motion mirrors in RTL. Everything runs in `gsap.context` and is reverted on unmount; `prefers-reduced-motion` disables animation entirely (content is never left hidden).

## Printing
`Print / Save as PDF` uses an A4 `@media print` stylesheet: header/footer/buttons hidden, black-on-white, empty checkboxes (or ticked state), steps, fees, official URLs written out, and the disclaimer. Works in both directions.

## Adding monetization later
`src/components/AdSlot.tsx` is rendered in the home page, services list, service sidebar and footer, and returns nothing while `config.adsEnabled` (in `src/lib/config.ts`) is `false`. To monetize: set the flag, render your network tag inside `AdSlot`, and update the Privacy Policy. No ad network is integrated.

## Assumptions
- Domain-neutral name "Dalilak"; contact via `mailto:` (set `VITE_CONTACT_EMAIL`).
- Impeccable's website could not be fetched directly, so its principles were applied from its public documentation summaries (OKLCH palette, tinted neutrals, anti-patterns: no bounce easing, no nested cards, no generic template look).
- Palette: calm blue + gold, as specified. Font pair: IBM Plex Sans Arabic / IBM Plex Sans.
- Localized URLs via `/ar` and `/en` path prefix; unprefixed paths redirect to the saved language (default Arabic).
- Seed content is best-effort knowledge, **not verified**. Fees and durations are deliberately written as "approximate – verify"; every service is `needs_review = true` with last-verified set to the build date as a placeholder, not a real verification.
- Official links are the main ministry/authority sites (e.g. digital.gov.eg); deep links to specific service pages were not guessed.
- Favorites: guests get a sign-in prompt when Supabase is configured; localStorage is used only when Supabase is not configured. Checklist ticks use localStorage for guests and the database for signed-in users.
- Password reset sends users back to the site; a dedicated "set new password" form is not included (Supabase's hosted flow signs them in, after which they can use account tools).
- Newly created services are rendered client-side; only seed services are prerendered (see SEO).
- Lighthouse: not run in this build environment. Expected scores are high (small critical path, lazy routes, self-hosted subset fonts, lazy GSAP), but measure on the deployed URL; unmeasured deviations should be treated as open.
- No automated tests are included beyond the type-check and build.
