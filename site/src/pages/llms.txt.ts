import type { APIRoute } from 'astro';

// llms.txt — a concise, LLM-facing map of the site (the emerging convention for
// AI agents / answer engines). Plain markdown, kept in sync with the landing's
// real content. Directly serves the "top SEO for AI agents" goal.
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://www.replyanywhere.com/').replace(/\/?$/, '/');
  const body = `# Reply Anywhere

> One inbox for every review and message — marketplaces, app stores, Google Maps and e-commerce reviews, plus social comments and DMs (Instagram, TikTok, Messenger, WhatsApp). Built on the Semantic Force omnichannel stack.

## What it is
Reply Anywhere is an omnichannel review- and message-management tool. Where most tools handle only reviews, Reply Anywhere also handles social comments and direct messages, because it runs on the Semantic Force platform (50+ channels, 500+ e-commerce sites, review sites, maps, app stores, social).

## Why it's different
Competitors (e.g. gominga) manage reviews only. Reply Anywhere manages reviews AND social/DMs from one window.

## Key pages
- [Home](${base}): product overview, supported channels, request a demo.

## Contact
- Request a demo: ${base}#demo
- Company: Semantic Force — https://semanticforce.ai
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
