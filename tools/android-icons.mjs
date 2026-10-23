// Renders the Android launcher, round, splash and notification assets from the real Bloc wordmark.
// usage: node android-icons.mjs <appDir> <resDir>
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [appDir, res] = process.argv.slice(2);
const { WM } = await import(pathToFileURL(join(appDir, 'art.js')).href);
const css = `html,body{margin:0;background:transparent}.c{display:grid;place-items:center}.wm{display:block}.wm .wa{stroke:#F6C915}.wm .wo{stroke:#fff}.wm .wc{stroke:#fff}.wm .warc{stroke:#F6C915;stroke-dasharray:56 44;transform-box:fill-box;transform-origin:center;transform:rotate(130deg)}`;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, userDataDir: process.env.TEMP + '/bloc-pptr-profile' });
const page = await browser.newPage();
async function render(file, size, { bg = 'transparent', w = .6, radius = 0 } = {}) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(`<style>${css}</style><div class="c" style="width:${size}px;height:${size}px;background:${bg};border-radius:${radius}px"><div style="width:${size * w}px">${WM()}</div></div>`);
  mkdirSync(join(res, file, '..'), { recursive: true });
  await page.screenshot({ path: join(res, file), omitBackground: true });
}
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(dens)) {
  await render(`mipmap-${d}/ic_launcher_foreground.png`, Math.round(108 * k), { w: .58 });            // adaptive icon layer (safe zone 66%)
  await render(`mipmap-${d}/ic_launcher.png`, Math.round(48 * k), { bg: '#22A6F2', w: .74, radius: Math.round(48 * k * .22) }); // pre-Android 8
  await render(`mipmap-${d}/ic_launcher_round.png`, Math.round(48 * k), { bg: '#22A6F2', w: .66, radius: Math.round(24 * k) });
}
await render('drawable-xxxhdpi/splash_icon.png', 1152, { w: .52 });                                     // Android 12+ splash
await browser.close();
console.log('android icons done');
