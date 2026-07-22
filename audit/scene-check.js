#!/usr/bin/env node
/* Scene overlap check: at given timeline beats, measure every visible pill's
   rect vs the headline/body/chips rects. Zero intersections = «гарантированно
   не налазят». Runs its own headless Chrome (same stack as shoot.js). */
const puppeteer = require('puppeteer-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:4323/';
const TOTAL_BEATS = 7.2;
const BEATS = [4.6, 7.0]; // part2+body+chips landed · settle (pills must STAY visible)
const VIEWPORTS = [
  { name: 'desktop1440', width: 1440, height: 900 },
  { name: 'ipadv810', width: 810, height: 1080 },
  { name: 'iphone390', width: 390, height: 844 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-first-run', '--hide-scrollbars'],
  });
  let failures = 0;
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1200));
    for (const beat of BEATS) {
      const res = await page.evaluate(async (beat, TOTAL) => {
        const scene = document.querySelector('[data-scene="one-platform"]');
        const vh = innerHeight;
        const sceneTop = scene.getBoundingClientRect().top + scrollY;
        const sceneH = scene.getBoundingClientRect().height;
        const target = sceneTop - vh + (beat / TOTAL) * sceneH;
        window.scrollTo({ top: target, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 1400)); // scrub 0.6 catch-up
        const R = (el) => el.getBoundingClientRect();
        const texts = [
          ['headline', document.querySelector('[data-scene-el="headline"]')],
          ['body', document.querySelector('[data-scene-el="body"]')],
          ['chips', document.querySelector('[data-scene-el="chips"]')],
        ].map(([n, el]) => ({ n, r: R(el), op: +getComputedStyle(el).opacity }));
        const pills = [...document.querySelectorAll('[data-scene-el="pill"]')].map((p) => {
          const r = R(p);
          return { name: p.textContent.trim().slice(0, 24), r, op: +getComputedStyle(p).opacity,
            visible: r.right > 0 && r.left < innerWidth };
        });
        const hits = [];
        for (const p of pills) {
          if (p.op < 0.15 || !p.visible) continue;
          for (const t of texts) {
            if (t.op < 0.15) continue;
            const ix = Math.min(p.r.right, t.r.right) - Math.max(p.r.left, t.r.left);
            const iy = Math.min(p.r.bottom, t.r.bottom) - Math.max(p.r.top, t.r.top);
            if (ix > 4 && iy > 4) hits.push(`${p.name} ∩ ${t.n} (${Math.round(ix)}×${Math.round(iy)})`);
          }
        }
        return {
          scrollY: Math.round(scrollY),
          bodyOp: texts[1].op, chipsOp: texts[2].op,
          visiblePills: pills.filter((p) => p.op >= 0.15 && p.visible).length,
          hits,
        };
      }, beat, TOTAL_BEATS);
      const ok = res.hits.length === 0;
      if (!ok) failures++;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${vp.name} beat=${beat} scrollY=${res.scrollY} body=${res.bodyOp} chips=${res.chipsOp} pillsVisible=${res.visiblePills}${res.hits.length ? ' HITS: ' + res.hits.join('; ') : ''}`);
    }
    await page.close();
  }
  await browser.close();
  console.log(failures === 0 ? 'DONE — no pill/text overlaps at any checked beat/viewport' : `DONE — ${failures} failing combos`);
  process.exit(failures === 0 ? 0 : 1);
})();
