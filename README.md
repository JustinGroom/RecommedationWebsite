# Recco: Automated Product Recommendation Website

A fast static website designed to maximize passive income via:
- Display ads (ad slots ready for AdSense / Mediavine / Raptive)
- Affiliate product links with disclosure blocks
- Trend-powered article generation + evergreen buying guides

## Quick start

```bash
npm run fetch:trends
npm run build
npm run start
```

Open http://localhost:8080.

## Architecture

- `scripts/fetch-trends.mjs`: Pulls fresh topics from Google Trends RSS and stores normalized topics in `data/trending-topics.json`.
- `scripts/build-site.mjs`: Generates homepage, article pages, sitemap, and robots file from JSON content data.
- `data/products.json`: Monetization inventory with affiliate URLs.
- `data/editorial-seeds.json`: Evergreen high-intent article templates.

## SEO/Monetization approach

1. People-first buyer-intent content (comparison + recommendations).
2. Structured data (`WebSite`, `Article`) to improve rich result eligibility.
3. Lightweight static pages for speed and crawl efficiency.
4. Clear affiliate disclosure near recommendation content.
5. Daily trend-reactive article generation.

For detailed notes and sources, see `docs/seo-research-notes.md`.
