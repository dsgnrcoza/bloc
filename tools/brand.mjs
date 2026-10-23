// Shared pieces for the marketing renders: brand tokens, the wordmark and art from app/art.js, a phone frame and a Chrome page.
import puppeteer from 'puppeteer-core';
import { readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const { WM, ART, DEFS, I } = await import(pathToFileURL(join(ROOT, 'app/art.js')).href);
export const SITE = 'getbloc.vercel.app';
export const LINK = SITE + '/get';
export const sleep = ms => new Promise(r => setTimeout(r, ms));

const SCREENS = process.env.SCREENS || join(ROOT, 'marketing/screens');
const cache = {};
export const screen = name => (cache[name] ??= `data:image/png;base64,${readFileSync(join(SCREENS, name + '.png')).toString('base64')}`);
export const dataURI = (file, type = 'image/png') => `data:${type};base64,${readFileSync(file).toString('base64')}`;

// A plain phone: dark slab, thin bezel, the screenshot inside. No notch, so nothing covers the app's own top bar.
export const phone = (shot, { w, x = 0, y = 0, rot = 0, cls = '', style = '' } = {}) =>
  `<div class="phone ${cls}" style="--pw:${w}px;left:${x}px;top:${y}px;${rot ? `transform:rotate(${rot}deg);` : ''}${style}"><img src="${screen(shot)}" alt=""></div>`;

export const art = (name, { w, x, y, rot = 0, cls = '', arg } = {}) =>
  `<div class="art ${cls}" style="width:${w}px;left:${x}px;top:${y}px;${rot ? `transform:rotate(${rot}deg)` : ''}">${ART[name](arg)}</div>`;

export const CSS = `
@font-face{font-family:Figtree;font-weight:400 800;font-display:block;src:url(${dataURI(join(ROOT, 'tools/fonts/Figtree-latin.woff2'), 'font/woff2')}) format('woff2')}
:root{--blue:#22A6F2;--blue-600:#0B78C2;--blue-700:#09649F;--blue-50:#EAF6FE;--blue-100:#D3ECFC;--yellow:#F6C915;--yellow-50:#FFF8DB;--yellow-ink:#765800;
  --ink:#0E1116;--ink-2:#3C434D;--muted:#5F6672;--surface:#F3F4F6;--hair:#E6E8EC;--link:#0A6DB0;--green:#14804A}
*{box-sizing:border-box;margin:0;padding:0}
html,body{margin:0;overflow:hidden}
body{font-family:Figtree,system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink);text-rendering:geometricPrecision}
.defs{position:absolute;width:0;height:0;overflow:hidden}
.wm{display:block;--wa:var(--yellow);--wo:#fff;--warc:var(--yellow);--wc:#fff}
.wm.ink{--wa:var(--link);--wo:var(--blue-100);--wc:var(--link)}
.wm.night{--wa:#fff;--wo:#3A414C;--warc:var(--yellow);--wc:#fff}
.wm .wa{stroke:var(--wa)}.wm .wo{stroke:var(--wo)}.wm .wc{stroke:var(--wc)}
.wm .warc{stroke:var(--warc);stroke-dasharray:56 44;transform-box:fill-box;transform-origin:center;transform:rotate(130deg)}
.phone{position:absolute;width:var(--pw);padding:calc(var(--pw)*.03);border-radius:calc(var(--pw)*.165);background:#0C0F14;transform-origin:50% 50%;
  box-shadow:inset 0 0 0 calc(var(--pw)*.005) #3B424D,0 calc(var(--pw)*.1) calc(var(--pw)*.2) calc(var(--pw)*-.07) rgba(6,30,52,.45),0 calc(var(--pw)*.03) calc(var(--pw)*.06) calc(var(--pw)*-.03) rgba(6,30,52,.25)}
.phone img{display:block;width:100%;border-radius:calc(var(--pw)*.135)}
.art{position:absolute}.art svg{display:block;width:100%;height:auto;overflow:visible}
.ring{position:absolute;border-radius:50%;border-style:solid}
.pill{display:inline-flex;align-items:center;gap:.35em;border-radius:999px;font-weight:700;white-space:nowrap}
.pill svg{width:1em;height:1em}
.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:.42em;background:var(--blue-600);color:#fff;font-weight:600;white-space:nowrap}
`;

export const page = (body, extraCSS = '', bg = '#fff') =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}body{background:${bg}}${extraCSS}</style></head><body>${DEFS}${body}</body></html>`;

export async function chrome() {
  const profile = join(process.env.TEMP || '.', 'bloc-pptr-' + process.pid);  // one profile per run, so renders can run side by side
  const browser = await puppeteer.launch({
    executablePath: process.env.BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    userDataDir: profile, headless: true, args: ['--hide-scrollbars', '--no-first-run', '--force-color-profile=srgb'],
  });
  const close = browser.close.bind(browser);
  browser.close = async () => { await close(); rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); };
  const tab = await browser.newPage();
  tab.on('pageerror', e => console.log('PAGE ERROR', e.message));
  return { browser, tab };
}

export async function load(tab, html, width, height, scale = 1) {
  await tab.setViewport({ width, height, deviceScaleFactor: scale });
  await tab.setContent(html, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
}
