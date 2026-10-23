// Renders the animated logo and the animated ad frame by frame, then encodes GIF and MP4 with ffmpeg.
// usage: node anim.mjs [logo|ad|all] [outDir]
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, WM, LINK, screen, art, page, chrome, load } from './brand.mjs';

const [what = 'all', out = join(ROOT, 'marketing/motion')] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const TMP = join(process.env.TEMP || '.', 'bloc-frames');

// Easing and timing helpers that run inside the page. frame(t) sets every style from the time alone, so each render is exact.
const RUNTIME = `
const bez = (x1, y1, x2, y2) => t => { if (t <= 0) return 0; if (t >= 1) return 1; let lo = 0, hi = 1, u = t;
  for (let i = 0; i < 30; i++) { u = (lo + hi) / 2; const x = 3*(1-u)*(1-u)*u*x1 + 3*(1-u)*u*u*x2 + u*u*u; if (x < t) lo = u; else hi = u; }
  return 3*(1-u)*(1-u)*u*y1 + 3*(1-u)*u*u*y2 + u*u*u; };
const OUT = bez(.22, 1, .36, 1), STD = bez(.32, .72, 0, 1), INOUT = bez(.55, .1, .45, .9), BACK = bez(.34, 1.3, .64, 1);
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const lerp = (a, b, p) => a + (b - a) * p;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
function drawWM(root, t, t0) {
  ['.b1', '.b2', '.b3', '.b5'].forEach((sel, i) => { const p = OUT(seg(t, t0 + i * .09, t0 + i * .09 + .8)), el = root.querySelector(sel);
    el.style.strokeDasharray = '100'; el.style.strokeDashoffset = 100 * (1 - p); el.style.opacity = Math.min(1, p * 12); });
  const p = OUT(seg(t, t0 + .45, t0 + 1.3)), arc = root.querySelector('.b4');
  arc.style.strokeDasharray = (56 * p) + ' ' + (100 - 56 * p); arc.style.opacity = p > 0 ? 1 : 0; return { arc, p };
}`;

async function render(tab, html, W, H, dur, fps, name, { gifW, gifFps = 15, mp4 = true } = {}) {
  await load(tab, html, W, H);
  const dir = join(TMP, name); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const n = Math.round(dur * fps);
  for (let i = 0; i < n; i++) {
    await tab.evaluate(t => window.frame(t), i / fps);
    await tab.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) });
  }
  const src = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(dir, 'f%04d.png')];
  if (mp4) execFileSync('ffmpeg', [...src, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(out, name + '.mp4')]);
  if (gifW) execFileSync('ffmpeg', [...src, '-vf', `fps=${gifFps},scale=${gifW}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`, '-loop', '0', join(out, name + '.gif')]);
  rmSync(dir, { recursive: true, force: true });
  console.log('saved', name, n, 'frames');
}

/* ---------- logo: the wordmark draws in, the yellow arc spins once, then it clears for the loop ---------- */
const logo = (bg, cls) => page(`<div id="wm" style="position:absolute;left:50%;top:50%;width:62%;transform:translate(-50%,-50%)">${WM(cls)}</div>
<script>{${RUNTIME}
window.frame = t => {
  const { arc } = drawWM($('#wm'), t, .15);
  const spin = INOUT(seg(t, 1.9, 2.9));
  arc.style.transform = 'rotate(' + (130 - 200 * (1 - OUT(seg(t, .6, 1.45))) + 360 * spin) + 'deg)';
  const fade = seg(t, 3.25, 3.6);
  $('#wm').style.opacity = 1 - fade; $('#wm').style.transform = 'translate(-50%,-50%) scale(' + (1 - .04 * STD(fade)) + ')';
};}</script>`, '', bg);

/* ---------- ad: welcome hero, the promise, four app screens, then the link ---------- */
function ad(W, H) {
  const tall = H > 1600;
  const L = tall
    ? { sheet: 930, ring: [540, 500, 440, 70], wm: 340, a: { eggs: [270, 70, 230, -8], milk: [190, 820, 250, 8], bread: [290, 76, 620, 0], bundle: [250, 760, 610, 0] }, h1: 100, sub: 38, pad: 80, cap: 84, capY: 250, ph: [180, 520, 720] }
    : { sheet: 720, ring: [540, 372, 400, 64], wm: 300, a: { eggs: [250, 70, 96, -8], milk: [180, 830, 110, 8], bread: [270, 80, 450, 0], bundle: [230, 780, 442, 0] }, h1: 84, sub: 34, pad: 72, cap: 72, capY: 96, ph: [230, 290, 620] };
  const [rx, ry, rr, rw] = L.ring, [px, py, pw] = L.ph;
  const shots = ['08-home', '10-choose-eggs', '13-checkout-bloc-plus', '16-tracking'];
  const caps = ['Pick what you need.', 'Choose your pack.', 'Bloc+ takes 15% off.', 'Track it to your door.'];
  const pieces = Object.entries(L.a).map(([k, [w, x, y, rot]], i) => art(k, { w, x, y, rot, cls: 'pc' }).replace('class="art pc"', `class="art pc" data-i="${i}" data-r="${rot}"`)).join('');
  const body = `
<div id="hero" class="abs" style="inset:0;background:var(--blue)">
  <div id="ring" class="ring" style="left:${rx - rr}px;top:${ry - rr}px;width:${rr * 2}px;height:${rr * 2}px;border-width:${rw}px;border-color:#fff"></div>
  ${pieces}
  <div id="wm" class="abs" style="width:${L.wm}px;left:${rx - L.wm / 2}px;top:${ry - L.wm * 68 / 424}px">${WM()}</div>
</div>
<div id="sheet" class="abs" style="left:0;top:0;width:${W}px;height:${H + 200}px;border-radius:64px 64px 0 0;background:#fff;box-shadow:0 -30px 60px -40px rgba(6,30,52,.35);padding:${L.pad}px ${L.pad}px 0">
  <div id="intro" class="abs" style="left:${L.pad}px;right:${L.pad}px;top:${L.pad}px">
    <h1 style="font-size:${L.h1}px"><span class="ln">Eggs, bread and milk,</span><span class="ln">at your res today.</span></h1>
    <p class="sub" style="font-size:${L.sub}px;margin-top:28px">Same-day delivery for students. Bloc+ takes 15% off everything.</p>
  </div>
  <div id="outro" class="abs" style="left:${L.pad}px;right:${L.pad}px;top:${L.pad}px">
    <h1 style="font-size:${L.h1}px"><span class="ln">Try the demo</span><span class="ln">on your phone.</span></h1>
    <p class="sub" style="font-size:${L.sub}px;margin-top:28px">Android and iPhone. No real orders or payments.</p>
    <div class="go" style="font-size:${L.sub + 4}px;margin-top:${tall ? 56 : 44}px">${LINK}</div>
  </div>
</div>
${caps.map((c, i) => `<h2 class="cap abs" data-i="${i}" style="font-size:${L.cap}px;top:${L.capY}px">${c}</h2>`).join('')}
<div id="ph" class="phone" style="--pw:${pw}px;left:${px}px;top:${py}px"><div class="scr">${shots.map(s => `<img src="${screen(s)}" alt="">`).join('')}</div></div>
<script>{${RUNTIME}
const H = ${H}, REST = ${L.sheet};
const SCR = [[4.6, 0], [6.2, 1], [7.8, 2], [9.4, 3]];
window.frame = t => {
  // 1. hero: ring, art and wordmark
  const ringP = OUT(seg(t, 0, .9));
  $('#ring').style.opacity = .14 * ringP; $('#ring').style.transform = 'scale(' + lerp(.86, 1, ringP) + ')';
  drawWM($('#wm'), t, .2);
  $('#wm .b4').style.transform = 'rotate(' + (130 - 200 * (1 - OUT(seg(t, .65, 1.5)))) + 'deg)';
  $$('.pc').forEach(el => { const i = +el.dataset.i, p = BACK(seg(t, .35 + i * .12, 1.05 + i * .12)), bob = Math.sin((t + i * .8) * 2 * Math.PI / 3.4) * 8;
    el.style.opacity = Math.min(1, p * 1.6); el.style.transform = 'translateY(' + (lerp(40, 0, p) + bob) + 'px) rotate(' + el.dataset.r + 'deg) scale(' + lerp(.7, 1, p) + ')'; });
  // 2. the sheet rises, covers the canvas for the screens, then settles back for the link; everything clears for the loop
  const up = STD(seg(t, 1.5, 2.2)), cover = STD(seg(t, 4.0, 4.7)), back = STD(seg(t, 11.2, 11.9)), away = STD(seg(t, 14.0, 14.5));
  let y = lerp(H + 40, REST, up); y = lerp(y, -140, cover); y = lerp(y, REST, back); y = lerp(y, H + 40, away);
  $('#sheet').style.transform = 'translateY(' + y + 'px)';
  $('#wm').style.opacity = 1 - seg(t, 14.0, 14.4); $$('.pc').forEach(el => el.style.opacity *= 1 - seg(t, 14.0, 14.4));
  $('#ring').style.opacity *= 1 - seg(t, 14.0, 14.4);
  $$('#intro .ln, #intro .sub').forEach((el, i) => { const p = OUT(seg(t, 1.85 + i * .1, 2.55 + i * .1)), o = seg(t, 3.9, 4.2);
    el.style.opacity = p * (1 - o); el.style.transform = 'translateY(' + lerp(36, 0, p) + 'px)'; });
  $$('#outro .ln, #outro .sub, #outro .go').forEach((el, i) => { const p = OUT(seg(t, 11.6 + i * .1, 12.3 + i * .1));
    el.style.opacity = p; el.style.transform = 'translateY(' + lerp(36, 0, p) + 'px)'; });
  // 3. phone rises; screens push from the right like the app; captions swap with them
  const rise = BACK(seg(t, 4.5, 5.3)), drop = STD(seg(t, 11.05, 11.6));
  $('#ph').style.transform = 'translateY(' + (lerp(H * .7, 0, rise) + drop * H * .8) + 'px)';
  $('#ph').style.opacity = t < 4.4 || t > 11.7 ? 0 : 1;
  $$('#ph img').forEach((el, i) => { const s = SCR[i][0], pIn = i === 0 ? 1 : STD(seg(t, s, s + .55)), next = SCR[i + 1], pOut = next ? STD(seg(t, next[0], next[0] + .55)) : 0;
    el.style.transform = 'translateX(' + (lerp(100, 0, pIn) - 28 * pOut) + '%)'; el.style.filter = 'brightness(' + (1 - .18 * pOut) + ')'; el.style.zIndex = i; });
  $$('.cap').forEach((el, i) => { const s = SCR[i][0], next = SCR[i + 1], pIn = OUT(seg(t, s + (i ? .1 : 0), s + .6)), pOut = next ? STD(seg(t, next[0] - .05, next[0] + .3)) : STD(seg(t, 11.0, 11.4));
    el.style.opacity = pIn * (1 - pOut); el.style.transform = 'translateY(' + (lerp(30, 0, pIn) - 24 * pOut) + 'px)'; });
};}</script>`;
  return page(body, `
.abs{position:absolute}
h1{font-weight:700;letter-spacing:-.04em;line-height:1.04}
.ln{display:block}
.sub{display:block;font-weight:500;line-height:1.38;color:var(--muted);text-wrap:pretty}
.cap{left:0;right:0;text-align:center;font-weight:700;letter-spacing:-.035em;line-height:1.05;color:var(--ink)}
.go{display:flex;align-items:center;justify-content:center;height:2.7em;border-radius:.5em;background:var(--blue-600);color:#fff;font-weight:700;letter-spacing:-.01em}
#ph .scr{position:relative;overflow:hidden;aspect-ratio:1170/2532;border-radius:calc(var(--pw)*.135);background:#fff}
#ph .scr img{position:absolute;inset:0;width:100%;height:100%;border-radius:0}
.wm .b4{transform-box:fill-box;transform-origin:center}`, '#22A6F2');
}

const { browser, tab } = await chrome();
if (what === 'logo' || what === 'all') {
  await render(tab, logo('#22A6F2', ''), 600, 600, 3.6, 30, 'bloc-logo-blue', { gifW: 480, gifFps: 30 });
  await render(tab, logo('#FFFFFF', 'ink'), 600, 600, 3.6, 30, 'bloc-logo-white', { gifW: 480, gifFps: 30 });
}
if (what === 'ad' || what === 'all') {
  await render(tab, ad(1080, 1350), 1080, 1350, 14.5, 30, 'bloc-ad-1080x1350', { gifW: 480, gifFps: 15 });
  await render(tab, ad(1080, 1920), 1080, 1920, 14.5, 30, 'bloc-ad-story-1080x1920');
}
if (what === 'stills') {  // quick review: a few moments of each piece as PNGs in %TEMP%/bloc-frames/stills
  const dir = join(TMP, 'stills'); mkdirSync(dir, { recursive: true });
  const takes = [['logo', logo('#22A6F2', ''), 600, 600, [.5, 1, 1.6, 2.4]], ['ad', ad(1080, 1350), 1080, 1350, [1.2, 3, 4.4, 5.6, 6.5, 8.6, 10.5, 12.8]], ['story', ad(1080, 1920), 1080, 1920, [3, 5.6, 12.8]]];
  for (const [k, html, W, H, ts] of takes) { await load(tab, html, W, H); for (const t of ts) { await tab.evaluate(t => window.frame(t), t); await tab.screenshot({ path: join(dir, `${k}-${t}.png`) }); } }
  console.log(dir);
}
await browser.close();
