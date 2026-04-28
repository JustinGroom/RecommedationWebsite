# Recco: automated recommendation website for affiliate + ad revenue

Recco is a static, automation-first content site that publishes high-intent product recommendations (fashion, fragrances, and tech) with a professional editorial design.

## Goals
- Capture organic traffic from evergreen buying queries + trend spikes.
- Monetize with affiliate links and ad placements.
- Stay compliant with Google/FTC guidance.

## Run locally

```bash
npm run fetch:trends
npm run build
npm run start
```

Then open `http://localhost:8080`.

## How automation works
- `scripts/fetch-trends.mjs` fetches Google Trends RSS (US) and stores normalized topics in `data/trending-topics.json`.
- `scripts/build-site.mjs` renders:
  - `public/index.html`
  - `public/categories/*.html`
  - `public/articles/*.html`
  - `public/disclosure.html`
  - `public/sitemap.xml` + `public/robots.txt`

## Revenue architecture
- **Affiliate:** in-content product cards with `rel="sponsored nofollow"` links.
- **Ads:** dedicated ad-slot containers separated from editorial blocks.
- **SEO:** content clustering + metadata + schema + sitemap.

## Content quality guardrails
- Trend automation drafts pages, but templates require real comparison criteria and update timestamps.
- Every article includes methodology, author context, and FAQ answers.
- Disclosure is visible and explicit.

## Source research
See `docs/seo-research-notes.md` for the latest source list and rationale.
