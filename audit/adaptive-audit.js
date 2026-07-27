#!/usr/bin/env node
/**
 * Adaptive audit — hard numbers for the 2026-07-26 adaptive pass.
 * For each viewport: heading font sizes per section, pill visibility in the
 * scene's SETTLE state (end of the scrub track), footer brand/column geometry.
 * Usage: node adaptive-audit.js [outDir]   (server must run on :4323)
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = process.argv[2] || path.join(__dirname, 'adaptive-run');
const URL = 'http://localhost:4323';
const SHOTS = process.env.SHOTS !== '0'; // SHOTS=0 → metrics only (dense sweeps)

// Dense grid (client 2026-07-26: «нам нужен контроль на всех разрешениях»):
// 40px steps through the whole desktop→phone range, plus every breakpoint
// boundary and its ±1 neighbours. Pass a comma list to override:
//   node adaptive-audit.js out 1440,1100,390
const BREAKPOINTS = [1440, 1439, 1020, 1019, 956, 955, 941, 940, 947, 946, 851, 850, 761, 760, 561, 560];
const STEPS = [];
for (let w = 2560; w >= 1200; w -= 160) STEPS.push(w);
for (let w = 1180; w >= 320; w -= 40) STEPS.push(w);
const VIEWPORTS = (process.argv[3]
  ? process.argv[3].split(',').map(Number)
  : [...new Set([...STEPS, ...BREAKPOINTS])].sort((a, b) => b - a)
).map((w) => [w, w >= 947 ? 900 : w >= 760 ? 1080 : 844]);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'],
  });
  const report = {};

  for (const [w, h] of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    });

    // ── typography: every heading-ish element, per section ──
    const type = await page.evaluate(() => {
      const fs = (el) => el ? parseFloat(getComputedStyle(el).fontSize) : null;
      const q = (s) => document.querySelector(s);
      return {
        heroH1: fs(q('.hero__title')),
        sceneH2: fs(q('.constellation .heading')),
        featuresH2: fs(q('#features .heading')),
        compareH2: fs(q('#compare .heading')),
        ctaBandTitle: fs(q('[class*="cta"] h2, .cta-band h2, .cta-band__title')),
        cardTitle: fs(q('#features [class*="card"] h3, #features h3')),
        footerCtaTitle: fs(q('.footer__cta-title')),
        body16: fs(q('.footer__claim')),
        ui14: fs(q('.menu__item')),
        chip13: fs(q('.cta-hint')),
      };
    });

    // ── scene: scroll to settle (end of track minus one viewport) ──
    await page.evaluate(() => {
      const scene = document.querySelector('[data-scene="one-platform"]');
      const r = scene.getBoundingClientRect();
      document.documentElement.scrollTop = window.scrollY + r.bottom - innerHeight;
    });
    await new Promise((r) => setTimeout(r, 1200)); // scrub catch-up

    const pills = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      return [...document.querySelectorAll('[data-scene-el="pill"]')].map((p) => {
        // Measure the VISUAL pill: in fluid-scatter mode the li's child carries
        // the edge-compensation translateX, so the li's own rect lies.
        const r = (p.firstElementChild || p).getBoundingClientRect();
        const visX = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
        const name = p.querySelector('[class*="name"], b, strong')?.textContent?.trim()
          || p.textContent.trim().slice(0, 22);
        return {
          name,
          left: Math.round(r.left), width: Math.round(r.width),
          visiblePct: r.width ? Math.round((visX / r.width) * 100) : 0,
          opacity: +getComputedStyle(p).opacity,
        };
      });
    });
    if (SHOTS) await page.screenshot({ path: path.join(OUT, `scene-settle-${w}.png`) });

    // pills vs text overlap in settle state
    const overlaps = await page.evaluate(() => {
      const boxes = [];
      const head = document.querySelector('.constellation .heading');
      const intro = document.querySelector('[data-scene-part="intro"]');
      const body = intro?.querySelector('[data-scene-el="body"]');
      const chips = intro?.querySelector('[data-scene-el="chips"]');
      for (const [label, el] of [['heading', head], ['body', body], ['chips', chips]]) {
        if (el) boxes.push([label, el.getBoundingClientRect()]);
      }
      const hits = [];
      for (const p of document.querySelectorAll('[data-scene-el="pill"]')) {
        if (+getComputedStyle(p).opacity < 0.5) continue;
        const r = p.getBoundingClientRect();
        for (const [label, b] of boxes) {
          const ox = Math.min(r.right, b.right) - Math.max(r.left, b.left);
          const oy = Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top);
          if (ox > 8 && oy > 8) hits.push(`${p.textContent.trim().slice(0, 18)}×${label} ${Math.round(ox)}x${Math.round(oy)}`);
        }
      }
      return hits;
    });

    // ── Nav: outer paddings must be symmetric, islands inside viewport ──
    const nav = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const burger = getComputedStyle(document.querySelector('.menu__burger')).display !== 'none';
      const right = document.querySelector(burger ? '.menu__burger' : '.menu__actions').getBoundingClientRect().right;
      const left = document.querySelector('.menu__brand').getBoundingClientRect().left;
      return { burger, padL: Math.round(left), padR: Math.round(vw - right) };
    });

    // ── Hero fold: on desktop/tablet (≥947) hero + brands strip fit the
    //    first screen (the guarantee), margin ≥ 0. Must be measured at
    //    scrollTop 0 — mid-page rects made the first run's numbers garbage. ──
    const fold = await page.evaluate(() => {
      const strip = document.querySelector('.social-proof');
      if (!strip || innerWidth < 947) return null;
      document.documentElement.scrollTop = 0;
      return Math.round(innerHeight - strip.getBoundingClientRect().bottom);
    });

    // ── Compare: the table must not overflow its frame ──
    const compare = await page.evaluate(() => {
      const t = document.querySelector('.cmp-table');
      const s = document.querySelector('#compare');
      return {
        tableOverflow: t ? Math.max(0, t.scrollWidth - t.clientWidth) : null,
        sectionOverflow: s ? Math.max(0, s.scrollWidth - s.clientWidth) : null,
      };
    });

    // ── Features: card copy must never print over the orbit art, and the
    //    CTA band's two text blocks must never intersect (2026-07-26 class) ──
    const features = await page.evaluate(() => {
      const ix = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
                           Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const problems = [];
      document.querySelectorAll('#features .card').forEach((card, i) => {
        const body = card.querySelector('.card__body').getBoundingClientRect();
        // solid visual parts only (bubbles/tiles/mini-cards across all three
        // card visuals); faint rings/curves may pass under text by design
        card.querySelectorAll('.orbit__bubble, .orbit__app, .iv__slot, .iv__disc, .iv__app, .av__msg, .av__reply, .av__app').forEach((el) => {
          const o = ix(body, el.getBoundingClientRect());
          // ≤175px² is the Figma design itself (a bubble corner brushes the
          // body BOX where no glyphs are) — flag only real intrusions.
          if (o > 600) problems.push(`card${i + 1} body×orbit ${Math.round(o)}px²`);
        });
      });
      const sub = document.querySelector('.cta__sub')?.getBoundingClientRect();
      const trust = document.querySelector('.cta__trust')?.getBoundingClientRect();
      if (sub && trust && ix(sub, trust) > 0) problems.push(`cta sub×trust ${Math.round(ix(sub, trust))}px²`);
      return problems;
    });
    await page.evaluate(() => document.querySelector('#features').scrollIntoView());
    await new Promise((r) => setTimeout(r, 300));
    if (SHOTS) await page.screenshot({ path: path.join(OUT, `features-${w}.png`) });

    // ── CLIPPING: any element whose content is wider/taller than its own box,
    //    or that sticks out of its nearest card. This is the check that would
    //    have caught the footer link clipped by a nowrap (client-caught
    //    2026-07-26) — page-level overflowX stays 0 while content is cut. ──
    const clipped = await page.evaluate(() => {
      const out = [];
      const seen = new Set();
      const label = (el) => {
        const cls = (el.className || '').toString().split(' ')[0];
        return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}:"${el.textContent.trim().slice(0, 22)}"`;
      };
      // Clipping that IS the design — bleeds, crops and a11y-only text.
      // Everything else that clips is a bug (calibrated 2026-07-26 against a
      // 44-width sweep: without this list the check drowns in its own noise).
      const BY_DESIGN = [
        '.hero',            // orbit bleeds off the right edge on purpose
        '.social-proof',    // brands marquee runs past both edges
        '.constellation', '.platform-intro', // pinned scene stage
        '.av__avatar',      // round photo crops
        '.sr-only', 'caption', // screen-reader-only text is clipped by design
        '.orbit', '.iv', '.av', // illustration stages
      ];
      const byDesign = (el) => BY_DESIGN.some((s) => el.matches(s) || el.closest(s));

      // 1) self-clipping boxes
      for (const el of document.querySelectorAll('main *, footer *, header *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
        if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') continue;
        if (byDesign(el)) continue;
        if (el.scrollWidth - el.clientWidth > 1 || el.scrollHeight - el.clientHeight > 1) {
          const k = label(el);
          if (!seen.has(k)) { seen.add(k); out.push(`self-clip ${k}`); }
        }
      }
      // 2) content escaping its card/island (visual containers of the design)
      for (const card of document.querySelectorAll('.island, .card, .cmp-section, .footer__card')) {
        const cb = card.getBoundingClientRect();
        for (const el of card.querySelectorAll('a, p, h2, h3, span, li')) {
          if (!el.textContent.trim()) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0) continue;
          const over = Math.max(cb.left - r.left, r.right - cb.right);
          if (over > 1) {
            const k = label(el);
            if (!seen.has(k)) { seen.add(k); out.push(`escapes-card(${Math.round(over)}px) ${k}`); }
          }
        }
      }
      return out;
    });

    // ── footer geometry ──
    await page.evaluate(() => document.querySelector('footer').scrollIntoView({ block: 'end' }));
    await new Promise((r) => setTimeout(r, 400));
    const footer = await page.evaluate(() => {
      const g = (s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), t: Math.round(r.top) };
      };
      return {
        islands: g('.footer__islands'),
        logo: g('.footer__logo'),
        wordmark: g('.footer__wordmark'),
        claimCard: g('.footer__card--claim'),
        navCard: g('.footer__card--nav'),
        ctaCard: g('.footer__card--cta'),
        discsRow: g('.footer__channels'),
      };
    });
    if (SHOTS) await page.screenshot({ path: path.join(OUT, `footer-${w}.png`) });

    report[w] = {
      type,
      pillsFullyCut: pills.filter((p) => p.visiblePct === 0).map((p) => p.name),
      pillsPartial: pills.filter((p) => p.visiblePct > 0 && p.visiblePct < 100)
        .map((p) => `${p.name}:${p.visiblePct}%`),
      pillsVisible: pills.filter((p) => p.visiblePct === 100).length,
      pillsInvisibleOpacity: pills.filter((p) => p.opacity < 0.5).length,
      textOverlaps: overlaps,
      featuresProblems: features,
      clipped,
      nav,
      foldMargin: fold,
      compare,
      footer,
      overflowX: await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      ),
    };
    console.log(`${w}×${h} done`);
    await page.close();
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log('REPORT →', path.join(OUT, 'report.json'));
  await browser.close();
})();
