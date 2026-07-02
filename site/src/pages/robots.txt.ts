import type { APIRoute } from 'astro';

// Dynamic robots.txt — the Sitemap line is built from `site` in astro.config, so
// it stays correct when the domain is swapped at launch (no hardcoded host).
//
// Explicit allow-list for retrieval / AI-answer crawlers — these are what drive
// citeability in Google, ChatGPT, Perplexity and Claude. Training-only bots
// (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended) intentionally fall
// through to the final `*: Allow`; flip those to `Disallow` if the client opts out
// of model training (orthogonal to answer-engine citeability).
export const GET: APIRoute = ({ site }) => {
  // Preview builds (PREVIEW_NOINDEX=1 → workers.dev) close the whole host:
  // belt (robots Disallow) + braces (per-page <meta noindex> from Layout).
  if (import.meta.env.PREVIEW_NOINDEX === '1') {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  const sitemapUrl = new URL('sitemap-index.xml', site).href;
  const allowAll = (ua: string) => [`User-agent: ${ua}`, 'Allow: /', ''];
  const body = [
    ...allowAll('Googlebot'),
    ...allowAll('OAI-SearchBot'),
    ...allowAll('ChatGPT-User'),
    ...allowAll('PerplexityBot'),
    ...allowAll('Perplexity-User'),
    ...allowAll('Claude-SearchBot'),
    ...allowAll('Claude-User'),
    ...allowAll('Applebot'),
    ...allowAll('*'),
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
