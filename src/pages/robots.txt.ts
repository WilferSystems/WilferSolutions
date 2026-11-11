import type { APIRoute } from 'astro';
export const prerender = true;
export const GET: APIRoute = () => {
  const site = (import.meta.env.SITE_URL || '').replace(/\/$/, '');
  const sitemap = site ? `Sitemap: ${site}/sitemap-index.xml\n` : '';
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
