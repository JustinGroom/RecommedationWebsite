import { mkdir, readFile, writeFile } from 'node:fs/promises';

const [productsRaw, seedsRaw, trendsRaw] = await Promise.all([
  readFile('data/products.json', 'utf8'),
  readFile('data/editorial-seeds.json', 'utf8'),
  readFile('data/trending-topics.json', 'utf8').catch(() => '[]')
]);

const products = JSON.parse(productsRaw);
const seeds = JSON.parse(seedsRaw);
const trends = JSON.parse(trendsRaw);

const posts = [...seeds, ...trends].slice(0, 14);

function articleBody(post, picks) {
  const productCards = picks
    .map(
      (item, index) => `
      <article class="product-card" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <meta itemprop="position" content="${index + 1}" />
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <div>
          <h3 itemprop="name">${item.brand} ${item.name}</h3>
          <p>${item.reason}</p>
          <p class="price">${item.price}</p>
          <a rel="sponsored nofollow" href="${item.affiliateUrl}" class="cta">Check price</a>
        </div>
      </article>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${post.title}</title>
  <meta name="description" content="${post.hook}" />
  <link rel="canonical" href="https://example.com/articles/${post.slug}.html" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.hook}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://example.com/articles/${post.slug}.html" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="../styles.css" />
  <script type="application/ld+json">{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${post.title}",
    "description": "${post.hook}",
    "datePublished": "2026-04-28",
    "dateModified": "2026-04-28",
    "author": {"@type": "Organization", "name": "Recco Editorial"}
  }</script>
</head>
<body>
  <header class="site-header"><a href="../index.html">← Recco Home</a></header>
  <main class="article-container">
    <p class="disclosure"><strong>Disclosure:</strong> We may earn a commission when you buy through our links. This does not affect our testing process or rankings.</p>
    <h1>${post.title}</h1>
    <p class="lede">${post.hook}</p>
    <section>
      <h2>Quick Picks</h2>
      ${productCards}
    </section>
    <section class="ad-slot">Ad placement (728x90)</section>
    <section>
      <h2>How we choose</h2>
      <ul>
        <li>First-hand testing criteria and buyer-intent match.</li>
        <li>Transparent pricing checks and product availability.</li>
        <li>Affiliate links are labeled and separated from editorial judgment.</li>
      </ul>
    </section>
  </main>
</body>
</html>`;
}

await mkdir('public/articles', { recursive: true });

const cards = [];
for (const post of posts) {
  const picks = products[post.category] ?? products.tech;
  const html = articleBody(post, picks);
  await writeFile(`public/articles/${post.slug}.html`, html);
  cards.push(`<article class="story-card"><h3><a href="articles/${post.slug}.html">${post.title}</a></h3><p>${post.hook}</p><p class="keyword">Keyword: ${post.targetKeyword}</p></article>`);
}

const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recco — Smart Product Recommendations</title>
  <meta name="description" content="Automated buying guides and trend-powered recommendations for fashion, fragrances, and tech." />
  <meta property="og:title" content="Recco — Smart Product Recommendations" />
  <meta property="og:description" content="Trend-powered affiliate editorial built for SEO and conversions." />
  <meta property="og:type" content="website" />
  <link rel="stylesheet" href="styles.css" />
  <script type="application/ld+json">{
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Recco",
    "url": "https://example.com"
  }</script>
</head>
<body>
  <header class="hero">
    <nav><span class="logo">RECCO</span><a href="#latest">Latest</a><a href="#strategy">SEO Strategy</a></nav>
    <div class="hero-content">
      <h1>Automated recommendation journalism for maximum affiliate revenue.</h1>
      <p>GQ-style editorial design + Wirecutter-style intent targeting.</p>
      <a class="cta" href="#latest">Explore articles</a>
    </div>
  </header>

  <main>
    <section id="latest" class="grid">${cards.join('')}</section>
    <section class="ad-slot">Ad placement (970x250)</section>
    <section id="strategy" class="strategy">
      <h2>Monetization + SEO stack</h2>
      <ol>
        <li>Publish trend-reactive and evergreen buying guides daily using scripts.</li>
        <li>Add product + article schema for rich results and better crawl understanding.</li>
        <li>Use clear affiliate disclosures for FTC compliance and trust.</li>
        <li>Optimize for fast loading (lazy images, static HTML) to protect conversions.</li>
      </ol>
      <p><a href="seo-playbook.html">View full SEO playbook →</a></p>
    </section>
  </main>
</body>
</html>`;

await writeFile('public/index.html', indexHtml);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${posts
  .map((post) => `  <url><loc>https://example.com/articles/${post.slug}.html</loc><lastmod>2026-04-28</lastmod></url>`)
  .join('\n')}\n  <url><loc>https://example.com/</loc><lastmod>2026-04-28</lastmod></url>\n</urlset>`;

await writeFile('public/sitemap.xml', sitemap);
await writeFile('public/robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n');

console.log(`Built ${posts.length} articles.`);
