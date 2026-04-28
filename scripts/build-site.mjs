import { mkdir, readFile, writeFile } from 'node:fs/promises';

const today = '2026-04-28';

const [configRaw, productsRaw, seedsRaw, trendsRaw] = await Promise.all([
  readFile('data/site-config.json', 'utf8'),
  readFile('data/products.json', 'utf8'),
  readFile('data/editorial-seeds.json', 'utf8'),
  readFile('data/trending-topics.json', 'utf8').catch(() => '[]')
]);

const config = JSON.parse(configRaw);
const products = JSON.parse(productsRaw);
const seeds = JSON.parse(seedsRaw);
const trends = JSON.parse(trendsRaw);
const posts = [...seeds, ...trends].slice(0, 24);
const categories = ['fashion', 'fragrance', 'tech'];

function esc(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function layout({ title, description, canonical, body, jsonLd = [] }) {
  const scripts = jsonLd
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="/styles.css" />
  ${scripts}
</head>
<body>
${body}
</body>
</html>`;
}

function renderPick(item, idx) {
  return `<article class="product-card" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <meta itemprop="position" content="${idx + 1}" />
      <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" />
      <div>
        <h3 itemprop="name">${esc(item.brand)} ${esc(item.name)}</h3>
        <p>${esc(item.reason)}</p>
        <p class="price">${esc(item.price)} · ⭐ ${item.rating}</p>
        <ul><li><strong>Pros:</strong> ${esc(item.pros.join(', '))}</li><li><strong>Cons:</strong> ${esc(item.cons.join(', '))}</li></ul>
        <a rel="sponsored nofollow" href="${esc(item.affiliateUrl)}" class="cta">Check price</a>
      </div>
    </article>`;
}

function articlePage(post) {
  const picks = products[post.category] ?? products.tech;
  const author = config.authors.find((entry) => entry.expertise.includes(post.category)) ?? config.authors[0];

  const body = `<header class="site-header"><a href="/index.html">← ${config.siteName}</a><a href="/categories/${post.category}.html">${post.category}</a></header>
  <main class="article-container">
    <p class="disclosure"><strong>Affiliate disclosure:</strong> We may earn a commission from qualifying purchases. We do not sell rankings.</p>
    <h1>${esc(post.title)}</h1>
    <p class="lede">${esc(post.hook)}</p>
    <div class="meta-row"><span>Updated ${today}</span><span>Keyword: ${esc(post.targetKeyword)}</span><span>Intent: ${esc(post.searchIntent ?? 'commercial')}</span></div>
    <section>
      <h2>Top picks right now</h2>
      ${picks.map(renderPick).join('')}
    </section>
    <section class="comparison">
      <h2>Quick comparison</h2>
      <table>
        <thead><tr><th>Product</th><th>Price</th><th>Rating</th><th>Best for</th></tr></thead>
        <tbody>${picks
          .map((item) => `<tr><td>${esc(item.brand)} ${esc(item.name)}</td><td>${esc(item.price)}</td><td>${item.rating}</td><td>${esc(item.reason)}</td></tr>`)
          .join('')}</tbody>
      </table>
    </section>
    <section class="ad-slot">${config.adSlots[1]}</section>
    <section>
      <h2>How we test and rank</h2>
      <ul>
        <li>Hands-on evaluation of comfort, durability, and fit-for-purpose outcomes.</li>
        <li>Price-to-performance scoring and availability checks across major retailers.</li>
        <li>Editorial and monetization separation to protect ranking integrity.</li>
      </ul>
    </section>
    <section>
      <h2>FAQ</h2>
      <details><summary>How often do you update this guide?</summary><p>We refresh pricing and picks weekly, and after major launches.</p></details>
      <details><summary>Are cheaper options included?</summary><p>Yes. We include value picks when they pass our minimum quality threshold.</p></details>
    </section>
    <section class="author-box"><h3>About the author</h3><p><strong>${esc(author.name)}</strong> — ${esc(author.role)}. ${esc(author.bio)}</p></section>
  </main>`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.hook,
      datePublished: today,
      dateModified: today,
      author: { '@type': 'Person', name: author.name },
      about: post.category,
      mainEntityOfPage: `${config.baseUrl}/articles/${post.slug}.html`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How often do you update this guide?',
          acceptedAnswer: { '@type': 'Answer', text: 'We refresh pricing and picks weekly, and after major launches.' }
        },
        {
          '@type': 'Question',
          name: 'Are cheaper options included?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes. We include value picks when they pass our minimum quality threshold.' }
        }
      ]
    }
  ];

  return layout({
    title: post.title,
    description: post.hook,
    canonical: `${config.baseUrl}/articles/${post.slug}.html`,
    body,
    jsonLd
  });
}

function card(post) {
  return `<article class="story-card">
    <p class="chip">${post.category}</p>
    <h3><a href="/articles/${post.slug}.html">${esc(post.title)}</a></h3>
    <p>${esc(post.hook)}</p>
    <p class="keyword">${esc(post.targetKeyword)}</p>
  </article>`;
}

function buildHome() {
  const hero = `<header class="hero">
    <nav><span class="logo">${config.siteName}</span><a href="#latest">Latest</a><a href="/seo-playbook.html">SEO playbook</a><a href="/disclosure.html">Disclosure</a></nav>
    <div class="hero-content">
      <p class="eyebrow">${esc(config.tagline)}</p>
      <h1>Automated recommendation publishing built for passive income.</h1>
      <p>${esc(config.primaryGoal)}.</p>
      <a class="cta" href="#latest">Explore revenue-ready guides</a>
    </div>
  </header>`;

  const topStories = posts.slice(0, 9).map(card).join('');
  const body = `${hero}
  <main>
    <section id="latest" class="grid">${topStories}</section>
    <section class="ad-slot">${config.adSlots[0]}</section>
    <section class="strategy">
      <h2>Revenue system</h2>
      <ol>
        <li>Evergreen money pages targeting high purchase intent terms.</li>
        <li>Trend-reactive pages published from daily interest spikes.</li>
        <li>Schema + internal links + category clustering for crawl depth.</li>
        <li>Compliance-first disclosures to keep ad and affiliate accounts healthy.</li>
      </ol>
    </section>
  </main>`;

  return layout({
    title: `${config.siteName} — Product Recommendations That Convert`,
    description: 'Professional buying guides optimized for affiliate conversion and organic growth.',
    canonical: `${config.baseUrl}/index.html`,
    body,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: config.siteName, url: config.baseUrl },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: config.siteName,
        url: config.baseUrl,
        sameAs: ['https://example.com/social/x', 'https://example.com/social/instagram']
      }
    ]
  });
}

function buildCategoryPage(category) {
  const filtered = posts.filter((post) => post.category === category);
  const body = `<header class="site-header"><a href="/index.html">← ${config.siteName}</a></header>
  <main class="article-container">
    <h1>${category[0].toUpperCase() + category.slice(1)} guides</h1>
    <p class="lede">Topic cluster page for stronger internal linking and topical authority.</p>
    <section class="grid">${filtered.map(card).join('')}</section>
  </main>`;

  return layout({
    title: `${config.siteName} ${category} recommendations`,
    description: `Best ${category} buying guides and trend-driven recommendations.`,
    canonical: `${config.baseUrl}/categories/${category}.html`,
    body
  });
}

function buildDisclosure() {
  const body = `<header class="site-header"><a href="/index.html">← ${config.siteName}</a></header>
  <main class="article-container">
    <h1>Affiliate & advertising disclosure</h1>
    <p>Last updated: ${today}</p>
    <ul>
      <li>Some links are affiliate links and may pay us a commission.</li>
      <li>Commissions do not affect editorial rankings.</li>
      <li>Sponsored placements are labeled as ad units.</li>
      <li>We do not encourage accidental ad clicks or incentivized clicks.</li>
    </ul>
  </main>`;

  return layout({
    title: 'Disclosure policy',
    description: 'How Recco handles affiliate links, advertising, and editorial independence.',
    canonical: `${config.baseUrl}/disclosure.html`,
    body
  });
}

await mkdir('public/articles', { recursive: true });
await mkdir('public/categories', { recursive: true });

for (const post of posts) {
  await writeFile(`public/articles/${post.slug}.html`, articlePage(post));
}
for (const category of categories) {
  await writeFile(`public/categories/${category}.html`, buildCategoryPage(category));
}
await writeFile('public/index.html', buildHome());
await writeFile('public/disclosure.html', buildDisclosure());

const sitemapEntries = [
  `${config.baseUrl}/index.html`,
  `${config.baseUrl}/seo-playbook.html`,
  `${config.baseUrl}/disclosure.html`,
  ...categories.map((category) => `${config.baseUrl}/categories/${category}.html`),
  ...posts.map((post) => `${config.baseUrl}/articles/${post.slug}.html`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries
  .map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}\n</urlset>`;

await writeFile('public/sitemap.xml', sitemap);
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${config.baseUrl}/sitemap.xml\n`);

console.log(`Built ${posts.length} articles, ${categories.length} category pages.`);
