// Renders the static ads: three concepts (today, track, plus) in four sizes, as JPEGs.
// usage: node ads.mjs [outDir]   (SCREENS=<dir> picks the app screenshots)
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, WM, ART, I, LINK, phone, art, page, chrome, load } from './brand.mjs';

const out = process.argv[2] || join(ROOT, 'marketing/ads');
mkdirSync(out, { recursive: true });

const SIZES = { square: [1080, 1080], portrait: [1080, 1350], story: [1080, 1920], banner: [1200, 628] };

const cta = (fs, dark) => `<div class="cta" style="font-size:${fs}px"><span class="btn${dark ? ' y' : ''}">Try the demo</span><span class="url">${LINK}</span></div>`;
const COMMON = `
h1{font-weight:700;letter-spacing:-.04em;line-height:1.02;text-wrap:balance}
.sub{font-weight:500;line-height:1.38;color:var(--muted);letter-spacing:-.005em;text-wrap:pretty}
.cta{display:flex;align-items:center;gap:.8em}
.cta .btn{height:2.6em;padding:0 1.15em}
.cta .btn.y{background:var(--yellow);color:#231A00}
.cta .url{font-weight:600;color:var(--ink-2);letter-spacing:-.01em}
.abs{position:absolute}`;

/* ---------- A. today: the welcome screen as an ad (blue hero with floating art, white sheet with the promise) ---------- */
function today(f, W, H) {
  const L = {
    square:   { hero: [0, 0, W, 560], sheet: [0, 500, W, H - 500], r: 56, pad: [64, 72], ring: [540, 268, 300, 52], wm: 240,
                a: { eggs: [200, 64, 70, -8], milk: [150, 860, 66, 8], bread: [220, 70, 318, 0], bundle: [190, 820, 312, 0] }, h1: 74, sub: 31, cta: 30, gap: [24, 44] },
    portrait: { hero: [0, 0, W, 780], sheet: [0, 720, W, H - 720], r: 64, pad: [72, 72], ring: [540, 372, 400, 64], wm: 290,
                a: { eggs: [250, 70, 96, -8], milk: [180, 830, 110, 8], bread: [270, 80, 460, 0], bundle: [230, 780, 452, 0] }, h1: 84, sub: 34, cta: 32, gap: [28, 52] },
    story:    { hero: [0, 0, W, 1000], sheet: [0, 930, W, H - 930], r: 72, pad: [80, 80], ring: [540, 520, 440, 70], wm: 320,
                a: { eggs: [270, 70, 250, -8], milk: [190, 820, 270, 8], bread: [290, 76, 640, 0], bundle: [250, 760, 630, 0] }, h1: 100, sub: 38, cta: 34, gap: [32, 56] },
    banner:   { hero: [640, 0, W - 640, H], sheet: [0, 0, 700, H], r: 48, pad: [72, 64], ring: [920, 314, 230, 42], wm: 190, rside: true,
                a: { eggs: [160, 720, 50, -8], milk: [120, 1050, 70, 8], bread: [180, 700, 420, 0], bundle: [160, 1010, 410, 0] }, h1: 54, sub: 23, cta: 22, gap: [20, 40] },
  }[f];
  const [hx, hy, hw, hh] = L.hero, [sx, sy, sw, sh] = L.sheet, [rx, ry, rr, rw] = L.ring;
  const pieces = Object.entries(L.a).map(([k, [w, x, y, rot]]) => art(k, { w, x, y, rot })).join('');
  const radius = L.rside ? `0 ${L.r}px ${L.r}px 0` : `${L.r}px ${L.r}px 0 0`;
  const body = `
<div class="abs" style="left:${hx}px;top:${hy}px;width:${hw}px;height:${hh}px;background:var(--blue)"></div>
<div class="ring" style="left:${rx - rr}px;top:${ry - rr}px;width:${rr * 2}px;height:${rr * 2}px;border-width:${rw}px;border-color:rgba(255,255,255,.14)"></div>
${pieces}
<div class="abs" style="width:${L.wm}px;left:${rx - L.wm / 2}px;top:${ry - L.wm * 68 / 212 / 2}px">${WM()}</div>
<div class="abs sheet" style="left:${sx}px;top:${sy}px;width:${sw}px;height:${sh}px;border-radius:${radius};padding:${L.pad[0]}px ${L.pad[1]}px">
  ${L.wmInk ? `<div style="width:${L.wmInk}px;margin-bottom:40px">${WM('ink')}</div>` : ''}
  <h1 style="font-size:${L.h1}px">Eggs, bread and milk, at your res today.</h1>
  <p class="sub" style="font-size:${L.sub}px;margin-top:${L.gap[0]}px">Same-day delivery for students. Bloc+ takes 15% off everything.</p>
  <div style="margin-top:${L.gap[1]}px">${cta(L.cta)}</div>
</div>`;
  return page(body, COMMON + `.sheet{display:flex;flex-direction:column;justify-content:center;background:#fff;box-shadow:0 -30px 60px -40px rgba(6,30,52,.35)}`);
}

/* ---------- B. track: white, the live tracking screen in a phone ---------- */
function track(f, W, H) {
  const L = {
    square:   { wm: [72, 72, 170], text: [72, 300, 500], h1: 80, sub: 31, cta: 26, ph: [600, 120, 470, -4], disc: [835, 600, 400], gap: [28, 48], ctaAt: 'bottom' },
    portrait: { wm: [72, 80, 170], text: [72, 196, 936], h1: 84, sub: 32, cta: 28, ph: [280, 640, 520, 0], disc: [540, 1100, 470], gap: [24, 40], ctaAt: 'flow' },
    story:    { wm: [80, 250, 190], text: [80, 360, 920], h1: 100, sub: 38, cta: 32, ph: [200, 920, 680, 0], disc: [540, 1420, 560], gap: [28, 48], ctaAt: 'flow' },
    banner:   { wm: [64, 64, 130], text: [64, 168, 600], h1: 60, sub: 23, cta: 21, ph: [800, 56, 320, -4], disc: [960, 420, 300], gap: [20, 36], ctaAt: 'flow' },
  }[f];
  const [px, py, pw, prot] = L.ph, [dx, dy, dr] = L.disc, [tx, ty, tw] = L.text;
  const ctaHTML = L.ctaAt === 'bottom' ? `<div class="abs" style="left:${tx}px;bottom:72px">${cta(L.cta)}</div>` : '';
  const body = `
<div class="ring" style="left:${dx - dr}px;top:${dy - dr}px;width:${dr * 2}px;height:${dr * 2}px;border-width:${dr}px;border-color:var(--blue-50)"></div>
<div class="abs" style="left:${L.wm[0]}px;top:${L.wm[1]}px;width:${L.wm[2]}px">${WM('ink')}</div>
<div class="abs" style="left:${tx}px;top:${ty}px;width:${tw}px">
  <h1 style="font-size:${L.h1}px">Track every order to your door.</h1>
  <p class="sub" style="font-size:${L.sub}px;margin-top:${L.gap[0]}px">A live map, your courier's name and a delivery PIN, on every order.</p>
  ${L.ctaAt === 'flow' ? `<div style="margin-top:${L.gap[1]}px">${cta(L.cta)}</div>` : ''}
</div>
${phone('16-tracking', { w: pw, x: px, y: py, rot: prot })}
${ctaHTML}
`;
  return page(body, COMMON);
}

/* ---------- C. plus: ink, Bloc+ in yellow, the membership screen in a phone ---------- */
function plus(f, W, H) {
  const L = {
    square:   { text: [72, 96, 520], h1: 82, sub: 31, pill: 28, cta: 26, ph: [610, 110, 450, 5], ring: [1000, 140, 300, 70], tag: [250, 470, 700, -14], gap: [28, 40] },
    portrait: { text: [72, 96, 936], h1: 92, sub: 34, pill: 30, cta: 30, ph: [290, 640, 520, 0], ring: [550, 1100, 420, 80], tag: [300, 60, 940, -14], gap: [28, 44] },
    story:    { text: [80, 250, 920], h1: 104, sub: 38, pill: 32, cta: 32, ph: [220, 920, 640, 0], ring: [560, 1500, 500, 90], tag: [320, -30, 1330, -14], gap: [32, 48] },
    banner:   { text: [64, 72, 580], h1: 62, sub: 23, pill: 21, cta: 21, ph: [760, 60, 330, 5], ring: [1150, 120, 220, 54], tag: [200, 620, 330, -14], gap: [20, 32] },
  }[f];
  const [tx, ty, tw] = L.text, [px, py, pw, prot] = L.ph, [rx, ry, rr, rw] = L.ring, [aw, ax, ay, arot] = L.tag;
  const body = `
<div class="ring" style="left:${rx - rr}px;top:${ry - rr}px;width:${rr * 2}px;height:${rr * 2}px;border-width:${rw}px;border-color:rgba(246,201,21,.14)"></div>
<div class="abs" style="left:${tx}px;top:${ty}px;width:${tw}px">
  <span class="pill" style="font-size:${L.pill}px;height:1.9em;padding:0 .75em 0 .6em;background:var(--yellow);color:#231A00">${I.sparkle}Bloc+</span>
  <h1 style="font-size:${L.h1}px;margin-top:${L.gap[0] * 1.2}px;color:#fff">15% off everything.<br><span style="color:var(--yellow)">R7 delivery.</span></h1>
  <p class="sub" style="font-size:${L.sub}px;margin-top:${L.gap[0]}px;color:#A9B1BC">R27 a month. Built for res life. Cancel anytime.</p>
  <div style="margin-top:${L.gap[1]}px">${cta(L.cta, true)}</div>
</div>
${phone('22-bloc-plus', { w: pw, x: px, y: py, rot: prot, cls: 'lit' })}
${art('plus', { w: aw, x: ax, y: ay, rot: arot })}`;
  return page(body, COMMON + `.cta .url{color:#fff}.pill svg{width:.9em;height:.9em}.phone.lit{background:#1A1F27;box-shadow:inset 0 0 0 calc(var(--pw)*.006) #4A525E,0 calc(var(--pw)*.08) calc(var(--pw)*.24) calc(var(--pw)*-.04) rgba(34,166,242,.22)}`, '#0E1116');
}

const { browser, tab } = await chrome();
for (const [concept, fn] of Object.entries({ today, track, plus })) {
  for (const [f, [W, H]] of Object.entries(SIZES)) {
    if (process.env.ONLY && !`${concept}-${f}`.includes(process.env.ONLY)) continue;
    await load(tab, fn(f, W, H), W, H);
    const file = join(out, `bloc-${concept}-${f}-${W}x${H}.jpg`);
    await tab.screenshot({ path: file, type: 'jpeg', quality: 92 });
    console.log('saved', file);
  }
}
await browser.close();
