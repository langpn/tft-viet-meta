import type { RequestHandler } from './$types';
import compsData from '$data/academy-comps.json';

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://tft.langpn.xyz';
  const lastmod = new Date().toISOString().split('T')[0];

  const comps = (compsData || []) as any[];

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/tierlist/comps`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/tierlist/items`, priority: '0.8', changefreq: 'daily' },
    { loc: `${baseUrl}/tierlist/augments`, priority: '0.8', changefreq: 'daily' },
    { loc: `${baseUrl}/explorer`, priority: '0.8', changefreq: 'daily' },
    { loc: `${baseUrl}/learn/new-set`, priority: '0.7', changefreq: 'weekly' }
  ];

  const compUrls = comps.map((comp) => {
    const slug = (comp.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
      loc: `${baseUrl}/tierlist/comps?comp=${slug || comp.slug || comp.id}`,
      priority: '0.8',
      changefreq: 'daily'
    };
  });

  const allUrls = [...staticUrls, ...compUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
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
