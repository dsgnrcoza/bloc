// Renders the one-page A4 PDF that presents Bloc: what it is, four screens, the link, a QR code and install steps.
// usage: node pdf.mjs [outFile]
import { join } from 'node:path';
import QRCode from 'qrcode';
import { ROOT, WM, LINK, phone, art, page, chrome, load } from './brand.mjs';

const out = process.argv[2] || join(ROOT, 'marketing/Bloc-one-pager.pdf');
const qr = await QRCode.toString('https://' + LINK, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0E1116', light: '#FFFFFF' } });

const SCREENS = [['08-home', 'Order to your room'], ['10-choose-eggs', 'See when it lands'], ['16-tracking', 'Track it live'], ['22-bloc-plus', 'Pay less with Bloc+']];
const steps = (title, items) => `<div class="how"><h3>${title}</h3><ol>${items.map(([b, s]) => `<li><b>${b}</b><span>${s}</span></li>`).join('')}</ol></div>`;

const html = page(`
<header>
  <div class="ring" style="left:460px;top:-150px;width:420px;height:420px;border-width:40px;border-color:rgba(255,255,255,.14)"></div>
  ${art('eggs', { w: 140, x: 450, y: 34, rot: -8 })}${art('milk', { w: 84, x: 690, y: 22, rot: 8 })}${art('bread', { w: 130, x: 600, y: 92 })}
  <div class="wm-box">${WM()}</div>
  <p class="kicker">Same-day essentials for res</p>
</header>
<section class="intro">
  <h1>Eggs, bread and milk, at your res today.</h1>
  <p>Bloc is a delivery app for students in residence. Order house essentials from your room or the library, follow the courier on a live map, and meet them with a delivery PIN. Bloc+ takes 15% off everything and drops delivery to R7, for R27 a month.</p>
</section>
<section class="shots">
  ${SCREENS.map(([s, c]) => `<figure><div class="ph">${phone(s, { w: 136 })}</div><figcaption>${c}</figcaption></figure>`).join('')}
</section>
<section class="get">
  <div class="try">
    <div class="qr">${qr}</div>
    <div><h2>Try it on your phone</h2><p class="url">${LINK}</p><p class="note">Scan the code or type the link. The page picks the right install for your phone.</p></div>
  </div>
  <div class="hows">
    ${steps('Android', [['Download the app', 'Tap “Download for Android” on the page.'], ['Allow the install', 'Let your browser install apps if asked.'], ['Install, then open', 'Choose Install anyway if Play Protect asks.']])}
    ${steps('iPhone', [['Open the link in Safari', 'Then tap Open Bloc.'], ['Tap Share', 'The square with an arrow.'], ['Add to Home Screen', 'Bloc opens full screen, like an app.']])}
  </div>
</section>
<footer>A working demo: no real orders or payments, and accounts stay on your phone. · getbloc.vercel.app</footer>`, `
@page{size:A4;margin:0}
html,body{width:794px;height:1123px}
body{position:relative;overflow:hidden}
header{position:relative;height:200px;background:var(--blue);overflow:hidden}
.wm-box{position:absolute;left:56px;top:56px;width:190px}
.kicker{position:absolute;left:56px;top:132px;font-size:14px;font-weight:700;color:var(--ink);background:#fff;padding:7px 14px;border-radius:999px}
.intro{padding:36px 56px 0}
h1{font-size:38px;line-height:1.08;font-weight:700;letter-spacing:-.035em;max-width:600px;text-wrap:balance}
.intro p{margin-top:14px;font-size:14.5px;line-height:1.6;color:var(--ink-2);max-width:640px}
.shots{display:flex;justify-content:space-between;padding:28px 64px 0}
figure{width:136px}
.ph{position:relative;height:295px}
.ph .phone{box-shadow:inset 0 0 0 1px #3B424D,0 18px 30px -16px rgba(6,30,52,.4)}
figcaption{margin-top:12px;font-size:13px;font-weight:600;text-align:center;color:var(--ink)}
.get{margin:28px 56px 0;padding:24px;border-radius:20px;background:var(--surface);display:grid;grid-template-columns:200px 1fr;gap:28px}
.try{display:flex;flex-direction:column;gap:14px}
.qr{width:112px;height:112px;padding:8px;border-radius:12px;background:#fff}
.qr svg{display:block;width:100%;height:100%}
h2{font-size:20px;line-height:1.25;font-weight:700;letter-spacing:-.02em}
.url{margin-top:4px;font-size:15px;font-weight:700;color:var(--link)}
.note{margin-top:8px;font-size:12.5px;line-height:1.45;color:var(--muted)}
.hows{display:grid;grid-template-columns:1fr 1fr;gap:20px}
h3{font-size:15px;font-weight:700;margin-bottom:10px}
ol{list-style:none;counter-reset:s}
li{position:relative;padding:0 0 12px 32px;counter-increment:s}
li::before{content:counter(s);position:absolute;left:0;top:0;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#fff;font-size:11.5px;font-weight:700}
li b{display:block;font-size:13px;line-height:1.35;font-weight:600}
li span{display:block;margin-top:2px;font-size:12px;line-height:1.4;color:var(--muted)}
footer{position:absolute;left:56px;right:56px;bottom:28px;font-size:11.5px;color:var(--muted)}`);

const { browser, tab } = await chrome();
await load(tab, html, 794, 1123);
await tab.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await tab.screenshot({ path: out.replace(/\.pdf$/, '.png') });
await browser.close();
console.log('saved', out);
