#!/usr/bin/env node
/**
 * Section shots — per-section crops across the width grid + an HTML contact
 * sheet (board.html: sections as rows, widths as columns) for block-by-block
 * review. Usage: node section-shots.js [outDir]   (server on :4323)
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = process.argv[2] || path.join(__dirname, 'section-shots');
const URL = 'http://localhost:4323';

const WIDTHS = [2560, 1920, 1440, 1280, 1200, 1100, 1024, 946, 810, 760, 560, 390];
const HEIGHT_FOR = (w) => (w >= 947 ? 900 : w >= 760 ? 1080 : 844);

// [name, how to capture]
const SECTIONS = [
  ['fold', 'fold'],           // first screen as loaded (nav + hero + strip)
  ['scene', 'scene-settle'],  // scroll scene at its settle state
  ['features', '#features'],
  ['cta-band', '.cta'],
  ['compare-top', '#compare'],
  ['compare-docked', 'compare-docked'], // sticky header engaged mid-table
  ['footer', 'footer'],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'],
  });

  for (const w of WIDTHS) {
    const h = HEIGHT_FOR(w);
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    });

    for (const [name, target] of SECTIONS) {
      if (target === 'fold') {
        await page.evaluate(() => (document.documentElement.scrollTop = 0));
      } else if (target === 'scene-settle') {
        await page.evaluate(() => {
          const s = document.querySelector('[data-scene="one-platform"]');
          document.documentElement.scrollTop =
            window.scrollY + s.getBoundingClientRect().bottom - innerHeight;
        });
      } else if (target === 'compare-docked') {
        await page.evaluate(() => {
          const s = document.querySelector('#compare');
          document.documentElement.scrollTop =
            window.scrollY + s.getBoundingClientRect().top + Math.min(500, s.offsetHeight / 3);
        });
      } else {
        await page.evaluate((sel) => {
          document.querySelector(sel).scrollIntoView({ block: 'start' });
          document.documentElement.scrollTop -= 110; // keep the fixed menu context
        }, target);
      }
      await new Promise((r) => setTimeout(r, 700)); // scrub/lazy settle
      await page.screenshot({ path: path.join(OUT, `${name}-${w}.png`) });
    }
    console.log(`${w} done`);
    await page.close();
  }
  await browser.close();

  // contact sheet
  const rows = SECTIONS.map(([name]) => `
    <h2>${name}</h2>
    <div class="row">${WIDTHS.map((w) =>
      `<figure><img src="${name}-${w}.png" loading="lazy"><figcaption>${w}</figcaption></figure>`
    ).join('')}</div>`).join('');
  fs.writeFileSync(path.join(OUT, 'board.html'), `<!doctype html>
<meta charset="utf-8"><title>Reply Anywhere — adaptive board</title>
<style>
  body{background:#111;color:#ddd;font:13px/1.4 system-ui;margin:16px}
  h2{margin:24px 0 8px;font-size:15px;position:sticky;left:0}
  .row{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px}
  figure{margin:0;flex:0 0 auto}
  img{height:300px;display:block;border:1px solid #333;border-radius:4px}
  figcaption{text-align:center;color:#888;padding-top:2px}
</style>${rows}`);
  console.log('BOARD →', path.join(OUT, 'board.html'));
})();
