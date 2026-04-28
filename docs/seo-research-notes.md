# SEO + monetization research notes (updated April 28, 2026)

## Primary sources reviewed
1. Google Search Central, **Creating helpful, reliable, people-first content** (page shows recent update timing in 2025/2026 crawl snapshots):
   - https://developers.google.com/search/docs/fundamentals/creating-helpful-content
2. Google Search Central, **SEO starter guide**:
   - https://developers.google.com/search/docs/fundamentals/seo-starter-guide
3. Google Search Central, **Spam policies** (scaled content abuse):
   - https://developers.google.com/search/docs/essentials/spam-policies
4. Google Search Central, **Product structured data**:
   - https://developers.google.com/structured-data/rich-snippets/products
5. FTC, **Endorsements, Influencers, and Reviews** and Endorsement Guides (revised in 2023):
   - https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews
   - https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides
6. Google AdSense Help, **invalid traffic and policy violations**:
   - https://support.google.com/adsense/answer/2660562

## Practical implementation in this repo
- Added clear affiliate disclosures site-wide and on article templates.
- Kept ad placeholders visually separate from editorial recommendation sections.
- Added category hubs for stronger internal linking and crawl pathways.
- Added richer on-page sections (comparison tables, FAQ, author boxes) to increase uniqueness and utility.
- Added structured data for `WebSite`, `Organization`, `Article`, and `FAQPage`.
- Added resilient trend ingestion: if live trend feed is unavailable, fallback topics still let the daily publish job run.

## Trend-capture workflow
1. `npm run fetch:trends` each morning to pull US trend headlines.
2. Map headlines to buyer-intent angles (gear, gifts, style, upgrades).
3. Publish one reactive article + one evergreen update per day.
4. Refresh top money pages weekly (price, stock, alternatives).
