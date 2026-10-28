// Renders the Google Play listing assets: eight 1080x1920 captioned screenshots, the 1024x500 feature graphic and the 512 icon.
// usage: node play.mjs [outDir]
import { mkdirSync, copyFileSync, renameSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, WM, phone, art, page, chrome, load } from './brand.mjs';

const out = process.argv[2] || join(ROOT, 'marketing/play');
mkdirSync(out, { recursive: true });

const SLIDES = [
  ['01-welcome', 'Eggs, bread and milk, same day.', 'Delivered to your res.'],
  ['08-home', 'Tap + and it’s in your basket.', 'Eggs, bread and milk on one screen.'],
  ['10-choose-eggs', 'Pick your size.', 'See the price and when it lands.'],
  ['13-checkout-bloc-plus', 'Bloc+ takes 15% off everything.', 'And delivery drops to R7.'],
  ['16-tracking', 'Track it live to your door.', 'A countdown ring, the map and a PIN.'],
  ['17-live-activity', 'Follow it from the home screen.', 'A live card updates as it moves.'],
  ['19-delivered', 'Delivered. Rate it in a tap.', 'Then order the same again.'],
  ['dark-08-home', 'Easy on the eyes at night.', 'Follows your phone’s dark mode.'],
];

const slide = ([shot, title, sub]) => {
  const dark = shot.startsWith('dark-');
  return page(`
<div class="cap"><h1>${title}</h1><p>${sub}</p></div>
${phone(shot, { w: 760, x: 160, y: 500, cls: dark ? 'lit' : '' })}`, `
.cap{position:absolute;left:80px;right:80px;top:128px;text-align:center}
h1{font-size:78px;line-height:1.05;font-weight:700;letter-spacing:-.04em;text-wrap:balance;color:${dark ? '#F2F4F7' : 'var(--ink)'}}
p{margin-top:24px;font-size:36px;line-height:1.35;font-weight:500;color:${dark ? '#9AA2AE' : 'var(--muted)'}}
.phone.lit{background:#1A1F27;box-shadow:inset 0 0 0 4px #3B424D,0 60px 140px -40px rgba(0,0,0,.6)}`, dark ? '#0E1116' : '#EAF6FE');
};

const feature = () => page(`
<div class="ring" style="left:520px;top:-150px;width:620px;height:620px;border-width:56px;border-color:rgba(255,255,255,.14)"></div>
<div style="position:absolute;left:72px;top:140px;width:300px">${WM()}</div>
<div class="pill" style="position:absolute;left:72px;top:276px;font-size:26px;height:60px;padding:0 26px;background:#fff;color:var(--ink);font-weight:700;letter-spacing:-.01em">Eggs, bread and milk, same day</div>
${art('eggs', { w: 170, x: 500, y: 330, rot: -8 })}
${art('milk', { w: 120, x: 905, y: 40, rot: 8 })}
${phone('08-home', { w: 250, x: 650, y: 70, rot: 6 })}`, '', '#22A6F2');

// Play wants 24-bit PNGs with no alpha channel.
const flatten = file => { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-pix_fmt', 'rgb24', file + '.tmp.png']); renameSync(file + '.tmp.png', file); };

const { browser, tab } = await chrome();
for (const [i, s] of SLIDES.entries()) {
  await load(tab, slide(s), 1080, 1920);
  const file = join(out, `play-${String(i + 1).padStart(2, '0')}-${s[0].replace(/^(dark-)?\d+-/, '$1')}.png`);
  await tab.screenshot({ path: file }); flatten(file);
  console.log('saved', file);
}
await load(tab, feature(), 1024, 500);
await tab.screenshot({ path: join(out, 'play-feature-1024x500.png') }); flatten(join(out, 'play-feature-1024x500.png'));
copyFileSync(join(ROOT, 'app/icons/icon-512.png'), join(out, 'play-icon-512.png'));
await browser.close();
console.log('play assets done');
