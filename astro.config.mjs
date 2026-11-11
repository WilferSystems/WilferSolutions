import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL,
  output: 'server',
  adapter: vercel(),
  integrations: process.env.SITE_URL ? [sitemap()] : [],
  build: { format: 'directory' },
});
