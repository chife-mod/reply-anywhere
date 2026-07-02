// Reply Anywhere — API Worker. Runs in the SAME Cloudflare deployment as the
// static assets: Cloudflare serves matching files first, so this code only runs
// for paths that aren't a static asset (i.e. /api/*). This is the concrete reason
// we chose Workers Static Assets over Pages/GH Pages — the form backend lives in
// the same deploy, no extra infra.
//
// POST /api/demo — demo-request handler:
//   1. parse + validate the payload (JSON or form-encoded)
//   2. verify Cloudflare Turnstile (spam) — skipped only if TURNSTILE_SECRET is
//      unset, so local `wrangler dev` works without keys
//   3. deliver the lead to LEAD_WEBHOOK_URL (ideal target: the Semantic Force
//      Omnichannel HelpDesk — the demo request becomes a message in the very
//      product being sold). Until wired, we accept + log so the pipeline is testable.
//
// Secrets/vars (set via `wrangler secret put`, NEVER committed):
//   TURNSTILE_SECRET   — Turnstile secret key (pairs with PUBLIC_TURNSTILE_SITEKEY)
//   LEAD_WEBHOOK_URL   — where verified leads are POSTed

interface Env {
  ASSETS: Fetcher;
  TURNSTILE_SECRET?: string;
  LEAD_WEBHOOK_URL?: string;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const out = (await res.json()) as { success?: boolean };
  return out.success === true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/demo') {
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

      let data: Record<string, string>;
      try {
        const ct = request.headers.get('content-type') ?? '';
        if (ct.includes('application/json')) {
          data = (await request.json()) as Record<string, string>;
        } else {
          const form = await request.formData();
          data = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
        }
      } catch {
        return json({ error: 'bad_request' }, 400);
      }

      const email = (data.email ?? '').trim();
      const name = (data.name ?? '').trim();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return json({ error: 'invalid_email' }, 422);
      }

      // Spam gate — enforced whenever a secret is configured (prod). Skipped in
      // local dev (no secret) so the happy path stays testable.
      if (env.TURNSTILE_SECRET) {
        const token = data['cf-turnstile-response'];
        const ok = token
          ? await verifyTurnstile(token, env.TURNSTILE_SECRET, request.headers.get('cf-connecting-ip'))
          : false;
        if (!ok) return json({ error: 'turnstile_failed' }, 403);
      }

      const lead = { name, email, message: (data.message ?? '').trim(), source: 'replyanywhere.com' };
      if (env.LEAD_WEBHOOK_URL) {
        try {
          const res = await fetch(env.LEAD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(lead),
          });
          if (!res.ok) return json({ error: 'delivery_failed' }, 502);
        } catch {
          return json({ error: 'delivery_failed' }, 502);
        }
      } else {
        console.log('[demo lead]', lead);
      }

      return json({ ok: true });
    }

    // Non-API path with no matching asset → let the assets binding return the
    // configured 404. (CF serves assets first, so this is a defensive fallback.)
    return env.ASSETS.fetch(request);
  },
};
