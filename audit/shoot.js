#!/usr/bin/env node
/**
 * QA Screenshot Harness — multi-viewport full-page screenshots + objective metrics.
 *
 * Usage:
 *   npm i puppeteer-core        # once, next to this script
 *   node shoot.js [config.json] # default: ./config.json
 *
 * Outputs into <outDir>:
 *   {page}-{viewport}.jpg  — full-page screenshots (after auto-scroll, so
 *                            scroll-triggered animations have played)
 *   metrics.json           — per combo: horizontal overflow px (>0 = layout
 *                            breakage), doc height, dedup'd console errors
 *
 * Caveat for GSAP/ScrollTrigger sites: pinned sections can appear as long
 * empty stretches (pin spacers) and elements mid-transform in full-page
 * captures. Treat blank zones as "verify live", not as confirmed bugs.
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const configPath = process.argv[2] || path.join(process.cwd(), 'config.json');
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const OUT = path.resolve(path.dirname(configPath), cfg.outDir || 'screens');
fs.mkdirSync(OUT, { recursive: true });

const DEFAULT_VIEWPORTS = [
  { name: 'big2560', width: 2560, height: 1305, dsf: 1, mobile: false },
  { name: 'fhd1920', width: 1920, height: 1080, dsf: 1, mobile: false },
  { name: 'mac1440', width: 1440, height: 900, dsf: 1, mobile: false },
  { name: 'surface1368', width: 1368, height: 912, dsf: 1, mobile: false },
  { name: 'ipadh1024', width: 1024, height: 768, dsf: 2, mobile: true },
  { name: 'ipadv810', width: 810, height: 1080, dsf: 2, mobile: true },
  { name: 'iphonev390', width: 390, height: 844, dsf: 2, mobile: true },
  { name: 'iphoneh844', width: 844, height: 390, dsf: 2, mobile: true },
];

const PAGES = cfg.pages; // { name: url }
const VIEWPORTS = cfg.viewports || DEFAULT_VIEWPORTS;
const CONCURRENCY = cfg.concurrency || 2;
const CHROME =
  cfg.chromePath || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const JPEG_QUALITY = cfg.jpegQuality || 55;

const metrics = [];
const consoleErrors = {};

async function autoScroll(page) {
  await page.evaluate(async () => {
    const h = () => document.documentElement.scrollHeight;
    const step = Math.max(400, Math.floor(window.innerHeight * 0.7));
    for (let y = 0; y < h(); y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, h());
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
}

async function shoot(browser, vp, pageName, url) {
  const page = await browser.newPage();
  const errs = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 300)));
  try {
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dsf || 1,
      isMobile: !!vp.mobile,
      hasTouch: !!vp.mobile,
    });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    await new Promise((r) => setTimeout(r, 1500));
    await autoScroll(page);
    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      docH: document.documentElement.scrollHeight,
    }));
    m.overflow = m.scrollW - m.innerW;
    m.page = pageName;
    m.viewport = vp.name;
    metrics.push(m);
    const file = path.join(OUT, `${pageName}-${vp.name}.jpg`);
    try {
      await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: JPEG_QUALITY });
    } catch (e) {
      await page.screenshot({ path: file, type: 'jpeg', quality: JPEG_QUALITY });
      m.note = 'viewport-only screenshot (fullPage failed: ' + String(e).slice(0, 100) + ')';
    }
    if (errs.length) consoleErrors[`${pageName}@${vp.name}`] = [...new Set(errs)];
    console.log(`OK ${pageName}-${vp.name} overflow=${m.overflow} docH=${m.docH}`);
  } catch (e) {
    console.log(`FAIL ${pageName}-${vp.name}: ${String(e).slice(0, 200)}`);
    metrics.push({ page: pageName, viewport: vp.name, error: String(e).slice(0, 200) });
  } finally {
    await page.close().catch(() => {});
  }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    // Own profile dir → never collides with chrome-devtools-mcp or the user's Chrome
    userDataDir: path.join(OUT, '.chrome-profile'),
    args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'],
  });
  for (const vp of VIEWPORTS) {
    const entries = Object.entries(PAGES);
    for (let i = 0; i < entries.length; i += CONCURRENCY) {
      await Promise.all(
        entries.slice(i, i + CONCURRENCY).map(([n, u]) => shoot(browser, vp, n, u)),
      );
    }
  }
  fs.writeFileSync(
    path.join(OUT, 'metrics.json'),
    JSON.stringify({ metrics, consoleErrors }, null, 2),
  );
  await browser.close();
  const bad = metrics.filter((m) => (m.overflow || 0) > 0 || m.error);
  console.log(`DONE — ${metrics.length} combos, ${bad.length} with overflow/errors`);
})();
