import type { RequestHandler } from './$types';
import { SITE_URL, compUrl, escapeXml } from '$lib/comp-pages';
import { ARCHIVED_SET, getComps } from '$server/site-meta';

export const GET: RequestHandler = async () => {
  const lastmod = new Date().toISOString().split('T')[0];
  const comps = getComps();

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE_URL}/tierlist/comps`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_URL}/tierlist/items`, priority: '0.8', changefreq: 'daily' },
    { loc: `${SITE_URL}/tierlist/augments`, priority: '0.8', changefreq: 'daily' },
    { loc: `${SITE_URL}/explorer`, priority: '0.8', changefreq: 'daily' },
    { loc: `${SITE_URL}/learn/new-set`, priority: '0.7', changefreq: 'weekly' }
  ];

  const compUrls = [...comps.map((comp) => compUrl(comp)), ...getComps(ARCHIVED_SET).map((comp) => `${compUrl(comp)}&set=${ARCHIVED_SET}`)].map((loc) => ({
    loc,
    priority: '0.8',
    changefreq: 'daily'
  }));

  const allUrls = [...staticUrls, ...compUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${escapeXml(u.changefreq)}</changefreq>
    <priority>${escapeXml(u.priority)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400'
    }
  });
};
