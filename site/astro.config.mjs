// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Reply Anywhere — production landing.
// Pure static SSG (`output: 'static'` is the Astro default) → deployed to
// Cloudflare Workers Static Assets (see wrangler.jsonc). No CMS: content lives
// in typed data files under src/data/, edited via git. Swap `site` to the final
// domain at launch — every canonical/OG/sitemap/robots URL derives from it.
export default defineConfig({
  site: 'https://www.replyanywhere.com',
  // Off so the floating toolbar chip never shows up in client demos off `astro dev`.
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  vite: {
    // Pre-bundle GSAP at dev-server start so Vite never lazily re-optimizes it
    // mid-session. That lazy re-optimize is what triggers a 504 "Outdated
    // Optimize Dep" → failed `import('gsap')` → every scroll animation silently
    // dying. Listing them here = deterministic, stable deps. (Lesson from Verifly.)
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger'],
    },
  },
});
