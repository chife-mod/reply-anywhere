// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Reply Anywhere — production landing.
// Pure static SSG (`output: 'static'` is the Astro default) → deployed to
// Cloudflare Workers Static Assets (see wrangler.jsonc). No CMS: content lives
// in typed data files under src/data/, edited via git. Swap `site` to the final
// domain at launch — every canonical/OG/sitemap/robots URL derives from it.
// PREVIEW_NOINDEX=1 (the default `npm run deploy`) gates the workers.dev preview
// from indexing: every page gets <meta noindex> + robots.txt flips to Disallow.
// The go-live deploy (`npm run deploy:live`, real domain) omits the flag.
const previewNoindex = process.env.PREVIEW_NOINDEX === '1';

export default defineConfig({
  site: 'https://www.replyanywhere.com',
  // Off so the floating toolbar chip never shows up in client demos off `astro dev`.
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  vite: {
    define: {
      'import.meta.env.PREVIEW_NOINDEX': JSON.stringify(previewNoindex ? '1' : ''),
    },
    // Pre-bundle GSAP at dev-server start so Vite never lazily re-optimizes it
    // mid-session. That lazy re-optimize is what triggers a 504 "Outdated
    // Optimize Dep" → failed `import('gsap')` → every scroll animation silently
    // dying. Listing them here = deterministic, stable deps. (Lesson from Verifly.)
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger'],
    },
  },
});
