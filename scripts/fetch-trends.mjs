import { writeFile } from 'node:fs/promises';

const endpoint = 'https://trends.google.com/trending/rss?geo=US';

const fallbackTrends = [
  {
    slug: 'ai-wearables-2026',
    title: 'AI Wearables in 2026: What to Buy, Watch, and Know',
    category: 'tech',
    hook: 'AI wearables continue to trend globally. This guide maps hype to useful product picks.',
    targetKeyword: 'best ai wearables 2026'
  },
  {
    slug: 'summer-travel-style-2026',
    title: 'Summer Travel Style 2026: What to Buy, Watch, and Know',
    category: 'fashion',
    hook: 'Travel-ready fashion essentials built for heat, comfort, and polished looks.',
    targetKeyword: 'summer travel style essentials'
  }
];

function pickCategory(title) {
  const t = title.toLowerCase();
  if (/(fashion|style|fragrance|cologne|runway|designer)/.test(t)) return 'fashion';
  if (/(iphone|android|ai|apple|google|openai|nvidia|tesla|tech|gaming)/.test(t)) return 'tech';
  return 'tech';
}

function toSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

function parseRss(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 12);
  return items.map((match) => {
    const block = match[1];
    const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? 'Trending topic').trim();
    const traffic = (block.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1] ?? 'N/A').trim();

    return {
      slug: `${toSlug(title)}-2026`,
      title: `${title}: What to Buy, Watch, and Know`,
      category: pickCategory(title),
      hook: `This topic is surging in U.S. search right now (approx. traffic: ${traffic}). We connect the trend to practical buying recommendations.`,
      targetKeyword: `${title} recommendations`
    };
  });
}

async function main() {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; RecommendationBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trends: ${response.status}`);
    }

    const xml = await response.text();
    const trends = parseRss(xml);
    await writeFile('data/trending-topics.json', JSON.stringify(trends, null, 2));
    console.log(`Saved ${trends.length} trending topics to data/trending-topics.json`);
  } catch (error) {
    await writeFile('data/trending-topics.json', JSON.stringify(fallbackTrends, null, 2));
    console.warn('Trend fetch failed; wrote fallback topics instead.');
    console.warn(String(error));
  }
}

main();
