import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { katexPlugin } from './src/lib/katex-plugin.mjs';

export default defineConfig({
  site: 'https://ahmedkishki.github.io',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  markdown: {
    // $inline$ and $$display$$ maths in project pages, rendered with KaTeX at build time.
    processor: satteri({ features: { math: true }, mdastPlugins: [katexPlugin] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
