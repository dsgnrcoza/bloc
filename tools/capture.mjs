// Walks the Bloc app like a user and saves every main screen at iPhone resolution (390x844 @3x).
// usage: node capture.mjs <url> <outDir>
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [url = 'http://localhost:5173/', out = 'screens'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe', userDataDir: (process.env.TEMP || '.') + '/bloc-pptr-profile', dumpio: !!process.env.DUMPIO,
  headless: true, args: ['--hide-scrollbars', '--no-first-run'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: false },
});
const page = await browser.newPage();
// CLOCK=17:40 pins the page's time of day so greetings and ETAs read naturally in marketing shots.
if (process.env.CLOCK) await page.evaluateOnNewDocument(([h, m]) => {
  const Real = Date, t = new Real(); t.setHours(h, m, 0, 0); const off = t - Real.now();
  globalThis.Date = class extends Real { constructor(...a) { super(...(a.length ? a : [Real.now() + off])); } static now() { return Real.now() + off; } };
}, process.env.CLOCK.split(':').map(Number));
page.on('pageerror', e => console.log('PAGE ERROR', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });

const shot = async (name, wait = 700) => {
  await sleep(wait);
  if (!name.includes('live-activity')) { const had = await page.evaluate(() => { const n = document.getElementById('note'); const on = n && n.classList.contains('show'); if (on) n.classList.remove('show'); return on; }); if (had) await sleep(650); }
  await page.screenshot({ path: join(out, name + '.png') }); console.log('saved', name);
};
const click = async sel => { await page.waitForSelector(sel, { visible: true }); await page.click(sel); };
const run = fn => page.evaluate(fn);

async function walk(scheme) {
  const d = scheme === 'dark' ? 'dark-' : '';
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }, { name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await run(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await shot(d + '01-welcome', 2400);

  await click('[data-act="signup"]');
  await sleep(700);
  await page.type('#suForm [name="first"]', 'Keanu', { delay: 20 });
  await page.type('#suForm [name="last"]', 'Mokoena', { delay: 20 });
  await shot(d + '02-sign-up-name', 300);
  await click('#suNext'); await sleep(650);
  await page.type('#suForm [name="email"]', 'keanu@example.com', { delay: 10 });
  await shot(d + '03-sign-up-email', 300);
  await click('#suNext'); await sleep(650);
  await page.type('#suForm [name="password"]', 'bloc-demo-2026', { delay: 5 });
  await click('#suNext'); await sleep(650);
  await page.type('#suForm [name="res"]', 'Kollege', { delay: 10 });
  await page.type('#suForm [name="room"]', '214', { delay: 10 });
  await shot(d + '04-sign-up-place', 300);
  await click('#suNext');
  await shot(d + '05-onboarding-1', 1500);
  await click('#obBtn'); await shot(d + '06-onboarding-bloc-plus', 900);
  await click('#obBtn'); await shot(d + '07-onboarding-delivery', 900);
  await click('#obBtn');
  await shot(d + '08-home', 1400);
  await run(() => document.getElementById('homeScroll').scrollTo(0, 560)); await shot(d + '09-shop', 600);
  await run(() => document.getElementById('homeScroll').scrollTo(0, 0)); await sleep(400);

  await click('#blocs [data-cat="eggs"]'); await shot(d + '10-choose-eggs', 1000);
  await click('#psCta'); await sleep(900);
  await click('#blocs [data-quick="breadW"]'); await shot(d + '11-cart-added', 1100);
  await click('#ictx'); await shot(d + '12-checkout', 1000);
  await click('[data-act="joinToggle"]'); await sleep(300);
  await run(() => { const s = document.getElementById('coBody'); s.scrollTop = s.scrollHeight; });
  await shot(d + '13-checkout-bloc-plus', 600);
  await click('#s-checkout .payrow'); await shot(d + '14-pay-with', 800);
  await click('#pscrim'); await sleep(500);
  await click('#coCta'); await shot(d + '15-placing-order', 600);
  await sleep(9000); await shot(d + '16-tracking', 0);
  await click('#s-track .nhead [data-back]'); await shot(d + '17-live-activity', 1300);
  await click('#island [data-tab="orders"]'); await shot(d + '18-activity', 700);
  await click('#ordUp [data-act="track"]'); await sleep(800);
  await page.waitForFunction(() => document.getElementById('trkBody').innerText.includes('Delivered'), { timeout: 40000 });
  await click('[data-star="5"]'); await shot(d + '19-delivered', 900);
  await click('[data-act="done"]'); await sleep(700);
  await run(() => document.getElementById('homeScroll').scrollTo(0, 700)); await shot(d + '20-home-go-again', 600);
  await run(() => document.getElementById('homeScroll').scrollTo(0, 0));
  await click('#island [data-tab="account"]'); await shot(d + '21-account', 700);
  await click('#accBody [data-act="plus"]'); await shot(d + '22-bloc-plus', 1400);
}

await walk('light');
await walk('dark');
await browser.close();
