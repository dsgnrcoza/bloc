/* Bloc: house essentials, same day. Pitch demo: sign-in is real, payments are not. */
import * as auth from './auth.js';
import { I, WM, DEFS, ART } from './art.js';

/* ---------- business rules: every price and rule lives here ---------- */
const CONFIG = {
  plus: { fee: 27, discount: 0.15, bogo: 'breadW' }, // Bloc+: R27 a month, 15% off every item, 2-for-1 white bread
  delivery: { member: 7, standard: 25 },           // same-day delivery; the R25 non-member fee is a placeholder
  etaMins: 45,                                     // same-day ETA quoted before checkout
  calcBasket: 60,                                  // basket the Bloc+ savings calculator assumes
  products: {
    eggs6:  { cat: 'eggs', name: '6 Pack', short: '6 eggs', sub: '6 large eggs', price: 17, art: 'eggs', n: 6, tag: 'Most popular' },
    eggs12: { cat: 'eggs', name: '12 Pack', short: '12 eggs', sub: '12 large eggs', price: 32, art: 'eggs', n: 12 },
    eggs18: { cat: 'eggs', name: '18 Tray', short: '18 eggs', sub: '18 large eggs', price: 46, art: 'eggs', n: 18 },
    eggs30: { cat: 'eggs', name: '30 Tray', short: '30 eggs', sub: 'Split it with your floor', price: 72, art: 'eggs', n: 30, tag: 'Res share' },
    breadW: { cat: 'bread', name: 'White loaf', short: 'White loaf', sub: '700g, sliced', price: 18, art: 'bread', v: 'w', tag: '2-for-1 on Bloc+' },
    breadB: { cat: 'bread', name: 'Brown loaf', short: 'Brown loaf', sub: '700g, sliced', price: 17, art: 'bread', v: 'b' },
    breadS: { cat: 'bread', name: 'Seeded loaf', short: 'Seeded loaf', sub: '600g wholewheat', price: 26, art: 'bread', v: 's', soldOut: true },
    milk2:  { cat: 'milk', name: 'Fresh milk 2L', short: 'Milk 2L', sub: 'Full cream', price: 34, art: 'milk', v: 'f', tag: 'Most popular' },
    milk1:  { cat: 'milk', name: 'Fresh milk 1L', short: 'Milk 1L', sub: 'Full cream', price: 19, art: 'milk', v: 's' },
    milkL:  { cat: 'milk', name: 'Low fat 2L', short: 'Low fat 2L', sub: '2% fat', price: 34, art: 'milk', v: 'l' },
    bBreak: { cat: 'bundles', name: 'Breakfast', short: 'Breakfast bundle', sub: '6 eggs and a white loaf', price: 32, was: 35, art: 'bundle' },
    bBloc:  { cat: 'bundles', name: 'The Bloc', short: 'The Bloc bundle', sub: '6 eggs, a loaf and 2L milk', price: 62, was: 69, art: 'bundle', tag: 'Best value' },
    bRes:   { cat: 'bundles', name: 'Res Pack', short: 'Res Pack', sub: '18 eggs, 2 loaves, 2 × 2L milk', price: 125, was: 150, art: 'bundle' },
  },
};
const { plus: PLUS, delivery: DEL, products: P } = CONFIG;
const CATS = { eggs: ['Eggs', 'Choose eggs'], bread: ['Bread', 'Choose bread'], milk: ['Milk', 'Choose milk'], bundles: ['Bundles', 'Choose a bundle'] };
const PAY = { visa: ['<span class="pm visa">VISA</span>', '•••• 4417', 'Personal card'], apple: ['<span class="pm apay">Pay</span>', 'Apple Pay', 'Face ID at checkout'], eft: ['<span class="pm eft">EFT</span>', 'Instant EFT', 'Pay from your bank app'] };
const COURIER = { name: 'Sipho M.', first: 'Sipho', initials: 'SM', rating: '4.9', ride: 'Scooter · GP 214 563' };

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const r2 = n => Math.round(n * 100) / 100, R = n => 'R' + n.toFixed(2);
const mp = n => r2(n * (1 - PLUS.discount));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const buzz = () => { try { if (navigator.vibrate && navigator.userActivation?.isActive) navigator.vibrate(8); } catch {} };
const DAY = 864e5;
const fmtT = d => { let h = d.getHours(); const m = d.getMinutes(), ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')}${ap}`; };
const etaT = mins => { const d = new Date(Date.now() + mins * 6e4); d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0); return fmtT(d); };
const dstr = d => (Date.now() - d < DAY && new Date().getDate() === d.getDate()) ? 'Today' : d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
const when = () => S.when === 'today' ? `Arrives by ${etaT(CONFIG.etaMins)}` : 'Tomorrow, 8–10am';

const art = spec => { const p = P[spec]; if (p) return ART[p.art](p.v); const [k, v] = spec.split(':'); return ART[k](v); };

/* ---------- state, saved per account on this device ---------- */
const blank = () => ({ member: false, join: false, cart: {}, cat: 'eggs', sel: 'eggs6', addr: 'res', places: {}, pay: 'visa', when: 'today', saved: 0, active: null, orders: [], onboarded: false });
let S = blank(), user = null;
const KEY = () => 'bloc:u:' + user.uid;
function load(u) {
  user = u;
  const d = read(KEY(), {});
  S = { ...blank(), ...d, join: false };
  S.orders = (S.orders || []).map(o => ({ ...o, date: new Date(o.date) }));
  if (S.active) { S.orders.unshift({ ...S.active, date: new Date(S.active.date) }); S.active = null; }
  for (const id of Object.keys(S.cart)) if (!P[id]) delete S.cart[id];
}
function save() { if (!user) return; const { join, cat, sel, ...keep } = S; write(KEY(), keep); }
const firstName = () => (user?.name || user?.email || '').split(/[\s@]/)[0] || 'there';
const initials = () => { const p = (user?.name || user?.email || '?').trim().split(/\s+/); return ((p[0][0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); };
const unit = (id, m = S.member) => m ? mp(P[id].price) : P[id].price;
const cartCount = () => Object.values(S.cart).reduce((a, b) => a + b, 0);
const label = items => Object.entries(items).map(([id, q]) => P[id].short + (q > 1 ? ` ×${q}` : '')).join(', ');
const title = id => { const p = P[id]; return p.cat === 'eggs' ? `${p.name} eggs` : p.cat === 'bundles' ? p.short : p.name; };

function totals(m) {
  let sub = 0, disc = 0, bogo = 0, n = 0;
  for (const [id, q] of Object.entries(S.cart)) {
    const p = P[id].price; sub += p * q; n += q;
    if (m) { disc += p * q * PLUS.discount; if (id === PLUS.bogo) bogo += Math.floor(q / 2) * mp(p); }
  }
  const del = n ? (m ? DEL.member : DEL.standard) : 0;
  return { sub: r2(sub), disc: r2(disc), bogo: r2(bogo), del, n, total: r2(sub - disc - bogo + del) };
}

/* ---------- phone frame scale (desktop) + keyboard-safe height (phone) ---------- */
const mq = matchMedia('(max-width:520px)');
let SCALE = 1;
function fit() {
  if (mq.matches) { SCALE = 1; document.documentElement.style.removeProperty('--s'); }
  else { SCALE = Math.min(1, (innerHeight - 40) / 868, (innerWidth - 40) / 414); document.documentElement.style.setProperty('--s', SCALE.toFixed(4)); }
  selSheet?.shown && selSheet.snapIdx(selSheet.idx, false);
  trkSheet?.shown && trkSheet.snapIdx(trkSheet.idx, false);
  selMap?.fit(); trkMap?.fit();
}
const vv = window.visualViewport;
function fitKeyboard() {
  if (mq.matches && vv) document.documentElement.style.setProperty('--app-h', vv.height + 'px');
  else document.documentElement.style.removeProperty('--app-h');
  if (window.scrollY) window.scrollTo(0, 0);
}

/* ---------- navigation stack ---------- */
const TABS = ['home', 'shop', 'orders', 'account'];
const el = id => $('#s-' + id);
let stack = [];
const top = () => stack[stack.length - 1];
const onTabs = () => stack.length === 1 && TABS.includes(stack[0]);
function chrome() {
  $('#tabbar').classList.toggle('hide', !onTabs());
  $$('#tabbar [data-tab]').forEach(b => { const on = b.dataset.tab === stack[0]; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
  $$('.screen').forEach(s => { const live = s.id === 's-' + top(); s.inert = !live; s.setAttribute('aria-hidden', String(!live)); });
  renderDock(); statusBar();
}
function statusBar() {
  const sp = $('#splash');
  const light = (sp && !sp.classList.contains('out')) || $('#proc').classList.contains('show') || ['welcome', 'plus'].includes(top());
  $('#sbar').classList.toggle('light', !!light);
}
function hardStack(ids) {
  $$('.screen').forEach(s => { s.style.transition = 'none'; s.classList.remove('on', 'under'); s.style.zIndex = ''; });
  $('#scrim').classList.remove('show');
  ids.forEach((id, i) => { const s = el(id); s.classList.add('on'); if (i < ids.length - 1) s.classList.add('under'); if (i) s.style.zIndex = 10 + 2 * i; });
  stack = [...ids];
  void app.offsetHeight;
  $$('.screen').forEach(s => { s.style.transition = ''; });
  if (!ids.includes('select')) selSheet.hide();
  if (!ids.includes('track')) trkSheet.hide();
  try { history.replaceState(null, ''); } catch {}
  chrome(); onEnter(top());
}
/* swap the whole stack with a quick fade-through, for moves between auth, onboarding and the app */
function replace(ids) {
  hardStack(ids);
  if (!reduced.matches) el(top()).animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
}
function push(id) {
  if (stack.includes(id)) return;
  const s = el(id), z = 10 + 2 * stack.length;
  s.style.zIndex = z;
  if (s.classList.contains('modal')) { const sc = $('#scrim'); sc.style.zIndex = z - 1; sc.classList.add('show'); }
  else el(top()).classList.add('under');
  stack.push(id);
  requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('on')));
  try { history.pushState({ bloc: stack.length }, ''); } catch {}
  chrome(); onEnter(id);
}
function pop() {
  if (stack.length < 2) return;
  const id = stack.pop(), s = el(id);
  s.classList.remove('on');
  if (s.classList.contains('modal')) $('#scrim').classList.remove('show');
  else el(top()).classList.remove('under');
  if (id === 'select') setTimeout(() => { if (!stack.includes('select')) selSheet.hide(); }, 560);
  if (id === 'track') { setTimeout(() => { if (!stack.includes('track')) trkSheet.hide(); }, 560); if (S.active) setTimeout(() => liveNote(), 450); }
  chrome(); onEnter(top());
}
function back() {
  if (pk) return closePicker();
  if (history.state && history.state.bloc) history.back(); else pop();
}
addEventListener('popstate', () => { if (pk) return closePicker(); if (stack.length > 1) pop(); });
function setTab(t) {
  stack.slice(1).forEach(id => { el(id).classList.remove('on', 'under'); if (id === 'select') setTimeout(() => { if (!stack.includes('select')) selSheet.hide(); }, 560); if (id === 'track') setTimeout(() => { if (!stack.includes('track')) trkSheet.hide(); }, 560); });
  if (!TABS.includes(stack[0])) return replace([t]);
  TABS.forEach(x => { el(x).classList.toggle('on', x === t); el(x).classList.remove('under'); });
  stack = [t]; $('#scrim').classList.remove('show');
  chrome(); onEnter(t);
}
function onEnter(id) {
  statusBar();
  if (id === 'home') renderHome();
  if (id === 'orders') renderOrders(true);
  if (id === 'account') renderAccount();
  if (id === 'select' && !selSheet.shown) { selMap.fit(); requestAnimationFrame(() => { selSheet.snapIdx(1); drawRoute(); }); }
  if (id === 'track' && !trkSheet.shown) { trkMap.fit(); requestAnimationFrame(() => trkSheet.snapIdx(1)); }
  if (id === 'checkout') renderCheckout();
  if (id === 'plus') renderPlus();
  if (id === 'track') hideNote();
}

/* ---------- bottom sheet: follows the finger 1:1, rubber-bands, snaps on a velocity-aware spring ---------- */
function Sheet(sheet, { snaps, list, foot }) {
  const grab = $('.grab', sheet), H = () => sheet.parentElement.clientHeight;
  let y = null, idx = 1, raf = 0, drag = null;
  const set = t => { y = t; sheet.style.transform = `translate3d(0,${t.toFixed(2)}px,0)`; };
  const padFor = t => { if (list) list.style.paddingBottom = Math.max(16, (foot ? foot.offsetHeight : 0) + t + 16) + 'px'; };
  const rubber = d => 70 * (1 - Math.exp(-d / 140));
  function spring(to, v = 0) {
    cancelAnimationFrame(raf);
    if (reduced.matches) return set(to);
    let x = y, last = performance.now();
    const k = 430, c = 2 * Math.sqrt(k) * .9;
    const step = now => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      v += (-k * (x - to) - c * v) * dt; x += v * dt;
      if (Math.abs(v) < 6 && Math.abs(x - to) < .4) return set(to);
      set(x); raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function snapIdx(i, anim = true) {
    idx = i; const to = snaps(H())[i]; padFor(to);
    if (!anim) { cancelAnimationFrame(raf); return set(to); }
    if (y == null) set(H());
    spring(to);
  }
  function hide() { cancelAnimationFrame(raf); sheet.style.transform = 'translate3d(0,100%,0)'; y = null; idx = 1; }
  const begin = (cy, id) => { cancelAnimationFrame(raf); drag = { id, sy: cy, st: y, pts: [[performance.now(), cy]], moved: false }; };
  const move = cy => {
    const s = snaps(H()), mn = s[0], mx = s[s.length - 1];
    let t = drag.st + (cy - drag.sy) / SCALE;
    if (t < mn) t = mn - rubber(mn - t);
    if (t > mx) t = mx + rubber(t - mx);
    set(t);
    const now = performance.now(); drag.pts.push([now, cy]);
    while (drag.pts.length > 2 && now - drag.pts[0][0] > 90) drag.pts.shift();
  };
  const release = d => {
    const [a, b] = [d.pts[0], d.pts[d.pts.length - 1]], v = b[0] > a[0] ? ((b[1] - a[1]) / SCALE) / ((b[0] - a[0]) / 1000) : 0;
    const s = snaps(H()), proj = y + v * .18;
    let bi = 0; s.forEach((p, i) => { if (Math.abs(p - proj) < Math.abs(s[bi] - proj)) bi = i; });
    idx = bi; padFor(s[bi]); spring(s[bi], v);
  };
  grab.addEventListener('pointerdown', e => { if (y != null && !e.button) begin(e.clientY, e.pointerId); });
  addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.moved) { if (Math.abs(e.clientY - drag.sy) < 4) return; drag.moved = true; try { grab.setPointerCapture(e.pointerId); } catch {} }
    move(e.clientY);
  });
  const up = e => {
    if (!drag || drag.id !== e.pointerId) return;
    const d = drag; drag = null;
    if (d.moved) return release(d);
    snapIdx(idx === 0 ? 1 : 0); // a tap on the handle toggles between expanded and half
  };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  // touch on the list: the sheet takes the gesture when the list can't scroll that way (native sheet behaviour)
  if (list) {
    let t = null;
    list.addEventListener('touchstart', e => { t = y == null ? null : { sy: e.touches[0].clientY, take: false, decided: false }; }, { passive: true });
    list.addEventListener('touchmove', e => {
      if (!t) return;
      const cy = e.touches[0].clientY, dy = cy - t.sy;
      if (!t.decided) {
        if (Math.abs(dy) < 6) return;
        t.decided = true;
        const atTop = y <= snaps(H())[0] + 1;
        t.take = (dy > 0 && list.scrollTop <= 0) || (dy < 0 && !atTop);
        if (t.take) begin(cy, 'touch');
      }
      if (t.take && drag) { e.preventDefault(); move(cy); }
    }, { passive: false });
    const end = () => { if (t && t.take && drag) { const d = drag; drag = null; release(d); } t = null; };
    list.addEventListener('touchend', end); list.addEventListener('touchcancel', end);
  }
  return { snapIdx, hide, get idx() { return idx; }, get shown() { return y != null; } };
}
let selSheet, trkSheet;

/* ---------- map: Hatfield, Pretoria (stylised) ---------- */
const ROUTE_PTS = [[310, 100], [310, 220], [210, 220], [210, 335], [105, 335]]; // Bloc hub → your res
const ROUTE = 'M' + ROUTE_PTS.map(p => p.join(' ')).join('L');
const WORLD = [-200, -160, 620, 900]; // drawable map, in svg units: panning and zooming out stop at its edges
const FOCUS = [90, 78, 330, 352];    // hub, route, res and their labels: what "recenter" frames
function mapSVG(k, track) {
  const Hs = [[-140, 7], [-80, 7], [-20, 7], [40, 7], [100, 7], [160, 7], [220, 12], [280, 7], [335, 12], [400, 7], [470, 7], [530, 7], [590, 7], [650, 7], [710, 12], [770, 7], [830, 7]];
  const Vs = [[-170, 7], [-115, 7], [-60, 12], [-5, 7], [50, 7], [105, 12], [160, 7], [210, 12], [260, 7], [310, 7], [370, 7], [430, 7], [490, 12], [550, 7]];
  const ln = (x1, y1, x2, y2, w) => `<path class="mroad" d="M${x1} ${y1}L${x2} ${y2}" stroke-width="${w}"/>`;
  const roads = maj => [...Hs.filter(h => (h[1] > 9) === maj).map(([y, w]) => ln(-220, y, 640, y, w)), ...Vs.filter(v => (v[1] > 9) === maj).map(([x, w]) => ln(x, -180, x, 920, w))].join('');
  const blocks = [];
  for (let i = 0; i < Vs.length - 1; i++) for (let j = 0; j < Hs.length - 1; j++) if ((i * 7 + j * 3) % 5 === 0) blocks.push(`<rect class="mblock" x="${Vs[i][0] + 9}" y="${Hs[j][0] + 9}" width="${Vs[i + 1][0] - Vs[i][0] - 18}" height="${Hs[j + 1][0] - Hs[j][0] - 18}" rx="3"/>`);
  const chip = (x, y, w, t) => `<g class="mchip" transform="translate(${x} ${y})"><rect width="${w}" height="24" rx="5" filter="url(#sh${k})"/><text x="10" y="16">${t}</text></g>`;
  return `<svg viewBox="${FOCUS.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of Hatfield showing the route from the Bloc hub to your res. Pinch or scroll to zoom, drag to move.">
  <defs><filter id="sh${k}" x="-30%" y="-60%" width="160%" height="240%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.8" flood-color="#0B1622" flood-opacity=".22"/></filter></defs>
  <rect class="mbg" x="-260" y="-220" width="940" height="1180"/>${blocks.join('')}
  <path class="mroad" d="M150 920C250 620 345 462 640 380" stroke-width="9"/>${roads(false)}
  <rect class="mpark" x="219" y="229" width="84" height="99" rx="10"/>
  <ellipse class="mpark" cx="335" cy="500" rx="56" ry="36"/><ellipse class="mwater" cx="345" cy="503" rx="20" ry="10"/>
  <rect class="mpark" x="20" y="410" width="72" height="50" rx="8"/>
  <rect class="mpark" x="-160" y="-72" width="96" height="74" rx="10"/><ellipse class="mpark" cx="470" cy="760" rx="70" ry="44"/><ellipse class="mwater" cx="478" cy="764" rx="30" ry="14"/>${roads(true)}
  <text class="ml area" x="-110" y="190" text-anchor="middle">SUNNYSIDE</text><text class="ml area" x="420" y="640" text-anchor="middle">MENLO PARK</text>
  <text class="ml pk" x="-112" y="-38" text-anchor="middle">Jan Cilliers Park</text>
  <text class="ml area" x="342" y="192" text-anchor="middle">ARCADIA</text><text class="ml area" x="160" y="440" text-anchor="middle">HATFIELD</text><text class="ml area" x="232" y="508" text-anchor="middle">BROOKLYN</text>
  <text class="ml pk" x="261" y="282" text-anchor="middle">UP Campus</text><text class="ml pk" x="335" y="482" text-anchor="middle">Magnolia Dell</text><text class="ml pk" x="56" y="438" text-anchor="middle">LC de Villiers</text>
  <text class="ml" x="74" y="222.7" text-anchor="middle">Lynnwood Rd</text><text class="ml" x="258" y="337.7" text-anchor="middle">Burnett St</text>
  <text class="ml" transform="translate(212.7 440) rotate(-90)" text-anchor="middle">Jan Shoba St</text><text class="ml" transform="translate(107.7 165) rotate(-90)" text-anchor="middle">Hilda St</text>
  ${track ? `<path class="route base" d="${ROUTE}"/>` : ''}<path class="route" d="${ROUTE}"/>
  <rect class="pin-o" x="303" y="93" width="14" height="14"/><rect class="pin-i" x="307.5" y="97.5" width="5" height="5"/>
  <circle class="halo" cx="105" cy="335" r="16"/><circle class="pin-o" cx="105" cy="335" r="8"/><circle class="pin-i" cx="105" cy="335" r="3"/>
  ${chip(214, 88, 82, 'Bloc Hub ›')}${chip(119, 323, 78, 'Your res ›')}
  ${track ? `<g id="rider" transform="translate(310 100)"><g id="riderNose"><path class="rnose" d="M0-19 5-12.5H-5z"/></g><circle class="rbg" r="13" filter="url(#sh${k})"/><circle class="rdot" r="10"/><g transform="translate(-6 -6) scale(.5)" stroke="#fff" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 8h13l-1 12.5h-11zM9 8V6.5a3 3 0 0 1 6 0V8"/></g></g>` : ''}
  </svg>`;
}
function drawRoute() {
  const p = $('#mapSel .route'), L = p.getTotalLength();
  if (reduced.matches) return;
  p.animate([{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }], { duration: 1100, delay: 250, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'backwards' });
}

/* ---------- map camera: pinch, scroll and double-tap zoom within limits, drag to pan with momentum, recenter.
   Zooming rewrites the svg viewBox, so roads and labels stay sharp at every level. ---------- */
const ZOOM = [.7, 3]; // how far out and in you can go, relative to the fitted route view
function MapView(host, visibleH) {
  const svg = $('svg', host), pts = new Map();
  let s = 1, s0 = 1, vx = 0, vy = 0, frame = 0, glide = 0, pinch = null, last = null, moved = false, tapAt = 0, vel = [0, 0], lt = 0;
  const size = () => [host.clientWidth || 390, host.clientHeight || 844];
  const draw = () => { const [W, H] = size(); svg.setAttribute('viewBox', `${vx.toFixed(2)} ${vy.toFixed(2)} ${(W / s).toFixed(2)} ${(H / s).toFixed(2)}`); };
  const apply = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; draw(); }); };
  function clamp() {
    const [W, H] = size(), w = W / s, h = H / s, [x0, y0, x1, y1] = WORLD;
    vx = w >= x1 - x0 ? x0 - (w - (x1 - x0)) / 2 : Math.min(Math.max(vx, x0), x1 - w);
    vy = h >= y1 - y0 ? y0 - (h - (y1 - y0)) / 2 : Math.min(Math.max(vy, y0), y1 - h);
  }
  // frame the route inside the strip of map the sheet leaves visible, clear of the floating buttons
  function home() {
    const fab = $('.fab', host.parentElement), top = fab ? fab.offsetTop + fab.offsetHeight + 12 : 64;
    const [W, H] = size(), vis = Math.min(H, visibleH()), [x0, y0, x1, y1] = FOCUS;
    const k = Math.min((W - 24) / (x1 - x0), (vis - top - 16) / (y1 - y0));
    return { s: k, vx: (x0 + x1) / 2 - W / 2 / k, vy: (y0 + y1) / 2 - (top + (vis - top) / 2) / k };
  }
  const minS = () => { const [W, H] = size(); return Math.max(s0 * ZOOM[0], W / (WORLD[2] - WORLD[0]), H / (WORLD[3] - WORLD[1])); };
  const zoomAt = (px, py, ns) => {
    ns = Math.min(s0 * ZOOM[1], Math.max(minS(), ns));
    const wx = vx + px / s, wy = vy + py / s; s = ns; vx = wx - px / s; vy = wy - py / s; clamp(); apply();
  };
  function animateTo(t, ms = 480) {
    cancelAnimationFrame(glide);
    if (reduced.matches) { ({ s, vx, vy } = t); clamp(); return draw(); }
    const f = { s, vx, vy }, t0 = performance.now(), ease = x => 1 - Math.pow(1 - x, 4);
    const step = now => { const p = Math.min(1, (now - t0) / ms), e = ease(p); s = f.s + (t.s - f.s) * e; vx = f.vx + (t.vx - f.vx) * e; vy = f.vy + (t.vy - f.vy) * e; draw(); if (p < 1) glide = requestAnimationFrame(step); };
    glide = requestAnimationFrame(step);
  }
  const local = e => { const r = host.getBoundingClientRect(); return [(e.clientX - r.left) / SCALE, (e.clientY - r.top) / SCALE]; };
  host.addEventListener('pointerdown', e => {
    if (e.button) return;
    cancelAnimationFrame(glide); try { host.setPointerCapture(e.pointerId); } catch {}
    const p = local(e); pts.set(e.pointerId, p); last = p; moved = false; vel = [0, 0]; lt = performance.now();
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, s, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; }
  });
  host.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const p = local(e); pts.set(e.pointerId, p);
    if (pinch && pts.size >= 2) {
      const [a, b] = [...pts.values()], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      vx -= (m[0] - pinch.m[0]) / s; vy -= (m[1] - pinch.m[1]) / s; pinch.m = m; moved = true;
      return zoomAt(m[0], m[1], pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d);
    }
    const dx = p[0] - last[0], dy = p[1] - last[1], now = performance.now();
    if (Math.abs(dx) + Math.abs(dy) > 1) moved = true;
    vel = [dx / Math.max(1, now - lt), dy / Math.max(1, now - lt)]; lt = now;
    vx -= dx / s; vy -= dy / s; last = p; clamp(); apply();
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size === 1) { last = [...pts.values()][0]; pinch = null; return; }
    if (pts.size) return;
    const wasPinch = !!pinch; pinch = null;
    if (!moved) { // double tap zooms in on the spot
      const now = performance.now();
      if (now - tapAt < 320) { const [px, py] = local(e), ns = Math.min(s0 * ZOOM[1], s * 1.8), wx = vx + px / s, wy = vy + py / s; tapAt = 0; return animateTo({ s: ns, vx: wx - px / ns, vy: wy - py / ns }, 360); }
      tapAt = now; return;
    }
    if (wasPinch || reduced.matches || performance.now() - lt > 80) return;
    let [gx, gy] = vel, prev = performance.now(); // fling: keep moving and slow down
    const step = now => { const dt = now - prev; prev = now; vx -= gx * dt / s; vy -= gy * dt / s; const f = Math.pow(.994, dt); gx *= f; gy *= f; clamp(); draw(); if (Math.hypot(gx, gy) > .02) glide = requestAnimationFrame(step); };
    glide = requestAnimationFrame(step);
  };
  host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
  host.addEventListener('wheel', e => { e.preventDefault(); cancelAnimationFrame(glide); const [px, py] = local(e); zoomAt(px, py, s * Math.exp(-e.deltaY * (e.ctrlKey ? .012 : .0018))); }, { passive: false });
  return {
    fit() { cancelAnimationFrame(glide); const h = home(); s0 = h.s; ({ s, vx, vy } = h); draw(); },
    recenter() { const h = home(); s0 = h.s; animateTo(h); },
  };
}
let selMap, trkMap;

/* ---------- renderers ---------- */
const ESS = [['eggs', 'eggs', 'Eggs'], ['bread', 'bread:w', 'Bread'], ['milk', 'milk:f', 'Milk'], ['bundles', 'bundle', 'Bundles']];
const placeRow = (k, a, attr = 'data-addr', cls = 'place') => `<button class="${cls} tap" ${attr}="${k}"><span class="pi">${I[a.i] || I.pin}</span><span class="ptx pt2"><span class="pxt"><b>${esc(a.t)}</b><small>${esc(a.s)}</small></span>${k === S.addr ? `<span class="pck">${I.check}<span class="sr">Selected</span></span>` : ''}</span></button>`;
function renderPlaces() { $('#places').innerHTML = Object.entries(S.places).map(([k, a]) => placeRow(k, a)).join(''); }
function renderHome() {
  const hr = new Date().getHours();
  $('#greet').textContent = `${hr < 12 ? 'Morning' : hr < 17 ? 'Afternoon' : 'Evening'}, ${firstName()}`;
  $('#pchip').innerHTML = S.member ? `${I.check}Bloc+` : `${I.sparkle}Get Bloc+`;
  $('#whenBtn').innerHTML = `${I.clock}${S.when === 'today' ? 'Today' : 'Tomorrow'}`;
  renderPlaces();
  $('#plusCard').innerHTML = S.member
    ? `<div class="pcard mem"><div class="pt"><span class="badge-y">${I.sparkle}Bloc+ member</span><h3>You’ve saved ${R(S.saved)}</h3><p>15% off everything and R${DEL.member} delivery on every order.</p></div><div class="pa">${ART.plus()}</div></div>`
    : `<button class="pcard tap" data-act="plus"><div class="pt"><span class="badge-y">${I.sparkle}Bloc+</span><h3>15% off. R${DEL.member} delivery.</h3><p>Every order, every day, for R${PLUS.fee} a month.</p><span class="go">Try Bloc+${I.chev}</span></div><div class="pa">${ART.plus()}</div></button>`;
  const recent = S.orders.slice(0, 3);
  $('#goAgainWrap').hidden = !recent.length;
  $('#goAgain').innerHTML = recent.map(o => `<div class="grow"><span class="gi">${art(Object.keys(o.items)[0])}</span><span class="gt"><b>${label(o.items)}</b><span>${dstr(o.date)} · ${R(o.total)}</span></span><button class="pill tap" data-reorder="${o.id}">Reorder</button></div>`).join('');
}
function renderStatic() {
  document.body.insertAdjacentHTML('afterbegin', DEFS);
  $$('[data-wm]').forEach(n => { n.outerHTML = WM(n.dataset.wm); });
  $$('[data-i]').forEach(n => { n.outerHTML = I[n.dataset.i]; });
  $('#whero').innerHTML = `<svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="6"/></svg><div class="float f1">${ART.eggs()}</div><div class="float f2">${ART.milk()}</div>${WM()}<div class="float f3">${ART.bread()}</div><div class="float f4">${ART.bundle()}</div>`;
  $('#ess').innerHTML = ESS.map(([c, a, l]) => `<button class="tile" data-cat="${c}"><span class="art">${art(a)}</span>${l}</button>`).join('');
  $('#deals').innerHTML = [
    ['bogo', 'y', `<em class="badge-y">${I.sparkle}Bloc+</em>${art('bread:w')}`, '2-for-1 white bread', 'For members, all week'],
    ['break', 'b', art('bundle'), `Breakfast bundle, R${P.bBreak.price}`, 'Six eggs and a loaf, sorted'],
    ['tray', '', art('eggs'), 'Split a 30 tray', 'Go halves with your floor'],
  ].map(([k, c, a, t, s]) => `<button class="deal" data-deal="${k}"><span class="dimg ${c}">${a}</span><span class="dt">${t}${I.chev}</span><span class="ds">${s}</span></button>`).join('');
  const from = c => Math.min(...Object.values(P).filter(p => p.cat === c).map(p => p.price));
  const most = Math.max(...Object.values(P).filter(p => p.was).map(p => p.was - p.price));
  const soon = (a, l) => `<button class="tile soon" data-act="soon"><span class="art"><em>Soon</em>${ART[a]()}</span>${l}</button>`;
  $('#shopBody').innerHTML = `<div class="sgrid2"><button class="sbig tap" data-cat="eggs"><b>Eggs</b><span>From R${from('eggs')}</span>${ART.eggs()}</button><button class="sbig tap" data-cat="bundles"><b>Bundles</b><span>Save up to R${most}</span>${ART.bundle()}</button></div>
    <div class="sgrid4"><button class="tile" data-cat="bread"><span class="art">${ART.bread('b')}</span>Bread</button><button class="tile" data-cat="milk"><span class="art">${ART.milk('l')}</span>Milk</button>${soon('coffee', 'Coffee')}${soon('fruit', 'Fruit')}</div>
    <div class="band"></div><div class="sech"><h2>Coming soon</h2></div>
    <div class="sgrid4">${soon('snacks', 'Snacks')}${soon('toiletries', 'Toiletries')}${soon('cleaning', 'Cleaning')}${soon('stationery', 'Stationery')}</div>`;
  $('#plusFee').textContent = 'R' + PLUS.fee;
  $('#plusBen').innerHTML = [
    [I.tag, `${Math.round(PLUS.discount * 100)}% off everything`, `Six eggs drop to ${R(mp(P.eggs6.price))}.`],
    [I.bolt, `R${DEL.member} same-day delivery`, `Instead of R${DEL.standard}, on every order.`],
    [I.gift, 'Weekly 2-for-1 deals', 'This week: white bread.'],
    [I.check, 'No contract', 'Cancel in two taps, any time.'],
  ].map(([i, b, s]) => `<div><span class="bi">${i}</span><span><b>${b}</b><small>${s}</small></span></div>`).join('');
  $('#calcNote').textContent = `Based on a R${CONFIG.calcBasket} basket: ${Math.round(PLUS.discount * 100)}% off plus R${DEL.standard - DEL.member} cheaper delivery on each order, minus the R${PLUS.fee} fee.`;
  $('#ob').innerHTML = [
    ['bundle', 'Eggs, bread and milk, today.', 'Order from your room and it’s at your door the same day.'],
    ['plus', `Bloc+ takes ${Math.round(PLUS.discount * 100)}% off everything.`, `Six eggs drop from R${P.eggs6.price} to ${R(mp(P.eggs6.price))}.`],
    ['scooter', `R${DEL.member} delivery, every order.`, `Members skip the R${DEL.standard} delivery fee. Cancel anytime.`],
  ].map(([a, h, p], i) => `<div class="slide" role="group" aria-label="${i + 1} of 3"><div class="art"><div>${ART[a]()}</div></div><h2>${h}</h2><p>${p}</p></div>`).join('');
  $('#mapSel').innerHTML = mapSVG('s', false);
  $('#mapTrk').innerHTML = mapSVG('t', true);
}
function priceHTML(id) {
  const p = P[id], now = unit(id), orig = p.was || p.price;
  return `<b>${R(now)}</b>${(S.member || p.was) ? `<s>${R(orig)}</s>` : ''}${S.member ? '' : `<span class="mp">${R(mp(p.price))} Bloc+</span>`}`;
}
const firstOf = cat => Object.keys(P).find(k => P[k].cat === cat && !P[k].soldOut);
const seenCat = new Set();
function renderSelect(animate) {
  $('#selTitle').textContent = CATS[S.cat][1];
  $('#catChips').innerHTML = Object.entries(CATS).map(([k, [l]]) => `<button class="chip ${k === S.cat ? 'on' : ''}" role="tab" aria-selected="${k === S.cat}" data-cat="${k}">${l}</button>`).join('');
  const ids = Object.keys(P).filter(k => P[k].cat === S.cat), list = $('#selList');
  const rows = () => ids.map((id, i) => {
    const p = P[id], n = S.cart[id];
    const tag = p.soldOut ? '<span class="tag r">Sold out</span>' : p.tag ? `<span class="tag ${p.tag.includes('Bloc+') ? 'y' : 'b'}">${p.tag}</span>` : '';
    return `<button class="opt ${id === S.sel ? 'on' : ''} ${p.soldOut ? 'out' : ''} ${animate ? 'rise' : ''}" style="--i:${i}" data-pick="${id}" aria-pressed="${id === S.sel}">
      <span class="oart">${art(id)}${p.n ? `<b class="cnt">${p.n}</b>` : ''}${n ? `<span class="incart">${I.check}${n}</span>` : ''}</span>
      <span class="otxt"><span class="o1">${p.name}${tag}</span><span class="o2">${p.soldOut ? 'Back tomorrow morning' : when()}</span><span class="o3">${p.sub}</span></span>
      <span class="oprice">${priceHTML(id)}</span></button>`;
  }).join('');
  if (animate && !seenCat.has(S.cat)) {
    seenCat.add(S.cat);
    list.innerHTML = [0, 1, 2].map(() => '<div class="skrow"><i class="sk a"></i><span class="t"><i class="sk" style="width:55%"></i><i class="sk" style="width:80%"></i></span></div>').join('');
    clearTimeout(renderSelect.t); renderSelect.t = setTimeout(() => { list.innerHTML = rows(); }, 420);
  } else { clearTimeout(renderSelect.t); list.innerHTML = rows(); }
  selCta();
}
function selCta() {
  const p = P[S.sel], b = $('#selCta'), n = cartCount();
  b.disabled = !!p.soldOut;
  b.innerHTML = p.soldOut ? 'Sold out today'
    : S.cart[S.sel] ? `<span>Go to checkout</span><span class="sep">·</span><span>${n} item${n > 1 ? 's' : ''}</span>`
    : `<span>Add ${p.name}</span><span class="sep">·</span><span>${R(unit(S.sel))}</span>`;
  const f = $('#cartFab');
  f.innerHTML = I.bag + (n ? `<span class="badge">${n}</span>` : '');
  f.setAttribute('aria-label', n ? `Cart, ${n} item${n > 1 ? 's' : ''}` : 'Cart is empty');
}
function renderPayrows() {
  const [b, l] = PAY[S.pay];
  $$('.payrow').forEach(r => { r.innerHTML = `${b}<span class="pl">${l}</span><span class="pc">${I.chev}</span>`; });
}
function renderCheckout() {
  const joining = S.join && !S.member, eff = S.member || joining;
  const t = totals(eff), base = totals(false), fee = joining ? PLUS.fee : 0, grand = r2(t.total + fee), a = S.places[S.addr] || Object.values(S.places)[0];
  const rows = Object.entries(S.cart).map(([id, q]) => {
    let note = `${R(unit(id, eff))} each`;
    if (eff && id === PLUS.bogo) note = q % 2 ? '<span class="free">Add one more, it’s free</span>' : '<span class="free">Buy one, get one free</span>';
    return `<div class="item"><span class="ia">${art(id)}</span><span class="it"><b>${title(id)}</b><span>${note}</span></span><span class="stepper"><button class="tap" data-dec="${id}" aria-label="${q === 1 ? 'Remove' : 'One less'} ${title(id)}">${q === 1 ? I.trash : I.minus}</button><span aria-label="Quantity">${q}</span><button class="tap" data-inc="${id}" aria-label="One more ${title(id)}">${I.plus}</button></span></div>`;
  }).join('');
  const quick = ['eggs6', 'breadW', 'milk2', 'bBreak'].filter(id => !S.cart[id]).map(id => `<button class="tap" data-add="${id}">${I.plus}<span>${title(id)}</span><span class="qp">${R(unit(id, eff))}</span></button>`).join('');
  let up;
  if (S.member) up = `<div class="upsell"><span class="badge-y">${I.sparkle}Bloc+</span><b class="ubig">You’re saving ${R(r2(base.total - t.total))} on this order</b><p>${Math.round(PLUS.discount * 100)}% off every item and R${DEL.member} same-day delivery.</p></div>`;
  else {
    const tm = totals(true), saveAmt = r2(base.total - tm.total);
    const pitch = saveAmt >= PLUS.fee ? `Your R${PLUS.fee} comes back on this order alone.` : `Pays for itself in ${Math.ceil(PLUS.fee / saveAmt)} orders.`;
    up = `<div class="upsell"><div class="uh"><div><span class="badge-y">${I.sparkle}Bloc+</span><b class="ubig">${joining ? `Nice. You’re saving ${R(saveAmt)} on this order` : `With Bloc+ you’d pay ${R(tm.total)}`}</b></div><button class="switch ${joining ? 'on' : ''}" role="switch" aria-checked="${joining}" aria-label="Add Bloc+ membership to this order" data-act="joinToggle"></button></div><p>${joining ? `Your first month (R${PLUS.fee}) is added below. ${Math.round(PLUS.discount * 100)}% off everything, R${DEL.member} delivery, cancel anytime.` : `That’s ${R(saveAmt)} less today: ${Math.round(PLUS.discount * 100)}% off every item plus R${DEL.member} delivery. ${pitch}`}</p></div>`;
  }
  const L = [`<div><span>Subtotal</span><span>${R(t.sub)}</span></div>`];
  if (eff) L.push(`<div class="save"><span>Bloc+ ${Math.round(PLUS.discount * 100)}% off</span><span>−${R(t.disc)}</span></div>`);
  if (t.bogo) L.push(`<div class="save"><span>2-for-1 bread</span><span>−${R(t.bogo)}</span></div>`);
  L.push(`<div><span>Same-day delivery</span><span>${eff ? `<s>${R(DEL.standard)}</s>` : ''}${R(t.del)}</span></div>`);
  if (fee) L.push(`<div><span>Bloc+ first month</span><span>${R(fee)}</span></div>`);
  L.push(`<div class="tot"><span>Total</span><span>${R(grand)}</span></div>`);
  $('#coBody').innerHTML = `<div class="co"><div class="card"><button class="addr" data-act="addr"><span class="ai">${I[a?.i] || I.pin}</span><span class="atx"><b>${esc(a?.t || 'Add a delivery place')}</b><span>${esc(a?.s || '')}</span></span><span class="chg">Change</span></button><div class="eta">${I.bolt}${S.when === 'today' ? `Same day, arrives by ${etaT(CONFIG.etaMins)}` : 'Tomorrow, 8–10am'}</div></div>
    <div class="items">${rows}</div>${quick ? `<div class="qh">Add to your order</div><div class="hs qadd">${quick}</div>` : ''}${up}<div class="sum">${L.join('')}</div><p class="fine">Demo checkout. No real payment is taken.</p></div>`;
  $('#coCta').innerHTML = `<span>Place order</span><span class="sep">·</span><span>${R(grand)}</span>`;
}
function renderOrders(first) {
  const a = S.active, up = $('#ordUp'), past = $('#ordPast');
  up.innerHTML = a
    ? `<button class="acard tap" data-act="track"><span class="ach"><i class="live"></i>On the way</span><b>${label(a.items)}</b><span>Arriving by ${a.eta} · ${R(a.total)}</span><span class="amini" style="display:block"><i id="actBar"></i></span><span class="ago">Track order${I.chev}</span></button>`
    : `<div class="empty"><span class="ei">${I.bag}</span><b>No orders on the way</b><p>Your next delivery shows up here, live.</p><button class="pill tap" data-tab="home">Order essentials</button></div>`;
  const rows = () => S.orders.length
    ? S.orders.map((o, i) => `<div class="orow rise" style="--i:${i}"><span class="oi">${art(Object.keys(o.items)[0])}</span><span class="ot"><b>${label(o.items)}</b><span>${dstr(o.date)} · ${R(o.total)}</span></span><button class="pill tap" data-reorder="${o.id}">Reorder</button></div>`).join('')
    : `<div class="empty"><span class="ei">${I.receipt}</span><b>No past orders yet</b><p>Once something’s delivered, you can reorder it in one tap.</p></div>`;
  if (first && !renderOrders.seen && S.orders.length) {
    renderOrders.seen = true;
    past.innerHTML = [0, 1].map(() => '<div class="skrow" style="padding:10px 20px"><i class="sk a" style="width:58px;height:50px"></i><span class="t"><i class="sk" style="width:70%"></i><i class="sk" style="width:40%"></i></span></div>').join('');
    setTimeout(() => { past.innerHTML = rows(); }, 450);
  } else past.innerHTML = rows();
  $('#actDot').hidden = !a;
}
const THEMES = { system: 'Match this device', light: 'Light', dark: 'Dark' };
let theme = 'system';
try { theme = localStorage.getItem('bloc-theme') || 'system'; } catch {}
function applyTheme() {
  const r = document.documentElement;
  if (theme === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', theme);
  try { localStorage.setItem('bloc-theme', theme); } catch {}
}
function renderAccount() {
  if (!user) return;
  const names = Object.values(S.places).map(p => p.label).join(' and ') || 'None yet';
  const rows = [
    [I.sparkle, 'Bloc+ membership', S.member ? `Active, R${PLUS.fee} a month` : 'Not a member yet', 'plus'],
    [I.pin, 'Saved places', names, 'places'],
    [I.card, 'Payment methods', PAY[S.pay][1], 'pay'],
    [I.gift, 'Invite friends', 'You both get R20 off', 'invite'],
    [I.moon, 'Appearance', THEMES[theme], 'theme'],
    [I.help, 'Help', 'Chat to the Bloc team', 'help'],
    [I.logout, 'Sign out', user.email, 'signout'],
    [I.reset, 'Reset demo data', 'Clear orders and savings on this device', 'reset'],
  ];
  $('#accBody').innerHTML = `<div class="prof"><div style="min-width:0"><h1>${esc(user.name || firstName())}</h1><span class="plan">${S.member ? `<span class="badge-y">${I.sparkle}Bloc+</span>` : 'Free plan'}</span></div><div class="av lg" aria-hidden="true">${esc(initials())}</div></div>
    <div class="qtiles"><button class="tap" data-act="help">${I.help}Help</button><button class="tap" data-act="pay">${I.wallet}Wallet</button><button class="tap" data-tab="orders">${I.receipt}Activity</button></div>
    <button class="lrow tap" data-act="plus"><span>Saved with Bloc+</span><b class="${S.saved ? 'g' : ''}">${R(S.saved)}</b></button>
    <div class="band"></div>
    ${rows.map(([i, t, s, a]) => `<button class="arow tap" data-act="${a}">${i}<span class="at"><b>${t}</b><span>${esc(s)}</span></span></button>`).join('')}
    <p class="mode">${auth.mode === 'firebase' ? 'Signed in with Firebase' : 'Demo account, stored on this device'}</p><div class="spacer"></div>`;
}
function renderPlus() {
  const c = $('#plusCta');
  c.textContent = S.member ? 'You’re on Bloc+' : `Join Bloc+ for R${PLUS.fee} a month`;
  c.className = 'cta ' + (S.member ? 'soft' : 'y');
  $('#plusLeave').hidden = !S.member;
  calc();
}
function calc() {
  const n = +$('#calcN').value, per = r2(CONFIG.calcBasket * PLUS.discount + (DEL.standard - DEL.member)), net = r2(n * per - PLUS.fee);
  $('#calcOut').textContent = (net < 0 ? '−R' : 'R') + Math.abs(net).toFixed(0);
  $('#calcLab').textContent = `${n} order${n > 1 ? 's' : ''} a month`;
}
function renderDock() {
  const d = $('#dock'), n = cartCount(), a = S.active;
  let html = '';
  if (n) html = `<button class="tap" data-act="cart"><span class="di">${I.bag}</span><span class="dx"><b>View cart</b><span>${n} item${n > 1 ? 's' : ''} · ${esc(S.places[S.addr]?.label || 'Res')}</span></span><span class="dp">${R(totals(S.member).sub - totals(S.member).disc)}</span></button>`;
  else if (a && stack[0] !== 'orders') html = `<button class="tap" data-act="track"><span class="di">${I.bag}</span><span class="dx"><b><i class="live"></i>On the way</b><span class="mini"><i id="dockBar"></i></span></span><span class="dp">${a.eta}</span></button>`;
  if (html !== d.dataset.html) { d.innerHTML = html; d.dataset.html = html; }
  d.classList.toggle('show', !!html && onTabs() && stack[0] !== 'account');
}
function renderAll() {
  if (!user) return;
  renderHome(); renderOrders(); renderAccount(); renderPayrows(); chrome();
  if (stack.includes('select')) renderSelect();
  if (stack.includes('checkout')) renderCheckout();
  save();
}

/* ---------- pickers: address, payment, time, appearance, confirm ---------- */
let pk = null, pkConfirm = null, adding = false;
function openPicker(kind, opts) { pk = kind; pkConfirm = opts || null; adding = false; renderPicker(); $('#pscrim').classList.add('show'); $('#picker').classList.add('show'); setTimeout(() => $('#picker button, #picker input')?.focus({ preventScroll: true }), 60); }
function closePicker() { pk = null; $('#pscrim').classList.remove('show'); const p = $('#picker'); p.classList.remove('show'); p.style.transform = ''; }
function renderPicker() {
  const head = (t, s = '') => `<h3 id="pkTitle">${t}</h3>${s ? `<p>${s}</p>` : ''}`;
  const row = (attr, k, icon, b, s, on) => `<button class="prow tap" ${attr}="${k}"><span class="pi">${icon}</span><span class="pt2"><span><b>${b}</b>${s ? `<small>${s}</small>` : ''}</span>${on ? `<span class="pck">${I.check}<span class="sr">Selected</span></span>` : ''}</span></button>`;
  let h = '', b = '';
  if (pk === 'addr') {
    h = head('Deliver to');
    b = Object.entries(S.places).map(([k, a]) => placeRow(k, a, 'data-addr', 'prow')).join('')
      + (adding
        ? `<form id="placeForm" novalidate><label class="field"><span>Name this place</span><input name="label" placeholder="e.g. Library, Gym" autocapitalize="words"></label><label class="field"><span>Address or meeting point</span><input name="addr" placeholder="Building, entrance or room" autocapitalize="words"></label><p class="ferr" id="placeErr" role="alert" style="margin:0"></p><button class="cta" type="submit">Save place</button></form>`
        : row('data-act', 'addPlace', I.plus, 'Add a place', 'Library, a friend’s res, the gym', false));
  } else if (pk === 'pay') {
    h = head('Pay with', 'Demo mode. No real payments are made.');
    b = Object.entries(PAY).map(([k, [badge, l, s]]) => row('data-pay', k, badge, l, s, k === S.pay)).join('');
  } else if (pk === 'when') {
    h = head('When should it arrive?');
    b = row('data-when', 'today', I.bolt, 'Today, same day', `Arrives by ${etaT(CONFIG.etaMins)}`, S.when === 'today') + row('data-when', 'tomorrow', I.clock, 'Tomorrow morning', 'Between 8 and 10am, before class', S.when === 'tomorrow');
  } else if (pk === 'theme') {
    h = head('Appearance');
    b = Object.entries(THEMES).map(([k, l]) => row('data-theme', k, k === 'dark' ? I.moon : k === 'light' ? I.sun : I.device, l, '', k === theme)).join('');
  } else if (pk === 'confirm') {
    h = head(pkConfirm.title, pkConfirm.body);
    b = `<button class="cta ${pkConfirm.danger ? 'danger' : ''}" data-act="pkok">${pkConfirm.ok}</button><button class="cta soft" data-act="pkclose">${pkConfirm.cancel || 'Cancel'}</button>`;
  }
  $('#pkHead').innerHTML = h; $('#pkBody').innerHTML = b;
  $('#placeForm')?.addEventListener('submit', savePlace);
}
function savePlace(e) {
  e.preventDefault();
  const f = e.target, lab = f.label.value.trim(), ad = f.addr.value.trim();
  if (!lab || !ad) { $('#placeErr').textContent = 'Add a name and an address for this place.'; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); return; }
  const k = 'p' + Date.now().toString(36);
  S.places[k] = { label: lab, t: ad, s: lab + ' · Hatfield, Pretoria', i: 'pin' };
  S.addr = k; buzz(); renderAll(); closePicker(); toast(`Delivering to ${lab}.`);
}
// drag the picker down to dismiss
(() => {
  const p = $('#picker'); let d = null;
  p.addEventListener('pointerdown', e => { if (!e.target.closest('.gr,.pkh')) return; d = { id: e.pointerId, sy: e.clientY, t: performance.now(), dy: 0 }; p.style.transition = 'none'; });
  addEventListener('pointermove', e => { if (!d || d.id !== e.pointerId) return; d.dy = Math.max(0, (e.clientY - d.sy) / SCALE); p.style.transform = `translate3d(0,${d.dy}px,0)`; });
  const up = e => { if (!d || d.id !== e.pointerId) return; const v = d.dy / Math.max(1, performance.now() - d.t); p.style.transition = ''; p.style.transform = ''; if (d.dy > 90 || (d.dy > 24 && v > .5)) closePicker(); d = null; };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
})();

/* ---------- notification banner + live activity (lock-screen style) ---------- */
let noteT, noteLive = false;
function note({ msg, live, ms = 3400 }) {
  const n = $('#note');
  noteLive = !!live;
  n.innerHTML = `<div class="nrow"><span class="ni">${WM()}</span><div class="nx"><b>Bloc<em>now</em></b>${msg ? `<p>${esc(msg)}</p>` : ''}</div></div>${live ? `<div class="nlive"><div class="nl1"><span id="nlEta"></span><span>${S.active ? 'by ' + S.active.eta : ''}</span></div><div class="nbar"><i id="nlBar"></i><b id="nlKnob">${I.bag}</b></div></div>` : ''}`;
  n.classList.add('show');
  if (live) updateLive(trk.t || 0);
  clearTimeout(noteT); noteT = setTimeout(hideNote, ms);
}
function hideNote() { $('#note').classList.remove('show'); noteLive = false; }
const toast = msg => note({ msg });
const liveNote = msg => { if (S.active && top() !== 'track') note({ msg, live: true, ms: 4600 }); else if (msg) toast(msg); };
$('#note').addEventListener('click', () => { hideNote(); if (S.active && user && !stack.includes('track')) openTrack(); });

/* ---------- shopping flows ---------- */
function openSelect(cat, sel) {
  if (!user) return;
  S.cat = cat; S.sel = sel && !P[sel].soldOut ? sel : firstOf(cat);
  const again = stack.includes('select');
  renderSelect(true);
  if (again) return;
  push('select');
}
function pick(id) {
  if (P[id].soldOut) { buzz(); return toast(`${P[id].name} is sold out today. It’s back tomorrow morning.`); }
  if (id === S.sel) return choose();
  S.sel = id; buzz();
  $$('#selList .opt').forEach(o => { const on = o.dataset.pick === id; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on); });
  selCta();
}
function choose() {
  if (S.cart[S.sel]) return push('checkout');
  S.cart[S.sel] = 1; buzz(); save();
  renderSelect(); renderDock();
  const b = $('#selCta'); if (!reduced.matches) b.animate([{ transform: 'scale(.97)' }, { transform: 'scale(1.02)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.34,1.45,.64,1)' });
  const fab = $('#cartFab'); if (!reduced.matches) fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.34,1.45,.64,1)' });
}
function openCart() { if (!cartCount()) return toast('Your cart is empty. Pick something from the sheet.'); push('checkout'); }
function deal(k) {
  if (k === 'break') return openSelect('bundles', 'bBreak');
  if (k === 'tray') return openSelect('eggs', 'eggs30');
  if (!S.member) { push('plus'); return toast('Join Bloc+ to unlock 2-for-1 white bread.'); }
  S.cart[PLUS.bogo] = (S.cart[PLUS.bogo] || 0) + 2; save(); push('checkout');
}
function reorder(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return;
  const items = Object.fromEntries(Object.entries(o.items).filter(([k]) => P[k] && !P[k].soldOut));
  if (!Object.keys(items).length) return toast('Those items are sold out today.');
  S.cart = items; buzz(); save();
  if (stack.includes('track')) { replace(['home']); setTimeout(() => push('checkout'), 60); } else push('checkout');
}
let confT;
function confetti(from) {
  if (reduced.matches) return;
  const r = app.getBoundingClientRect(), b = from.getBoundingClientRect();
  const x = (b.left + b.width / 2 - r.left) / SCALE, y = (b.top - r.top) / SCALE, cols = ['#F6C915', '#22A6F2', '#0B78C2', '#F6C915'];
  for (let i = 0; i < 34; i++) {
    const c = document.createElement('i'), a = -Math.PI * Math.random(), v = 110 + Math.random() * 230;
    c.className = 'cf';
    c.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % 4]};--dx:${(Math.cos(a) * v).toFixed(0)}px;--dy:${(Math.sin(a) * v + 120).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg;animation-delay:${(Math.random() * 90).toFixed(0)}ms`;
    app.appendChild(c); setTimeout(() => c.remove(), 1500);
  }
}
function join(btn) {
  if (S.member) return;
  S.member = true; S.join = false; buzz(); confetti(btn); renderAll(); renderPlus();
  toast(`Welcome to Bloc+. ${Math.round(PLUS.discount * 100)}% off is now on everything.`);
  clearTimeout(confT); confT = setTimeout(() => { if (top() === 'plus') back(); }, 1200);
}
function proc(on, msg) { if (msg) $('#procMsg').textContent = msg; $('#proc').classList.toggle('show', on); statusBar(); }
function placeOrder() {
  if (!cartCount()) return;
  if (!navigator.onLine) return note({ msg: 'You’re offline, so the order wasn’t placed. Check your connection and try again.' });
  if (!Object.keys(S.places).length) return openPicker('addr');
  const joining = S.join && !S.member, eff = S.member || joining;
  const t = totals(eff), base = totals(false), total = r2(t.total + (joining ? PLUS.fee : 0));
  if (eff) S.saved = r2(S.saved + base.total - t.total);
  if (joining) { S.member = true; S.join = false; }
  S.active = { id: 'o' + Date.now(), items: { ...S.cart }, total, date: new Date(), eta: etaT(14), pin: String(1000 + Math.floor(Math.random() * 9000)), addr: S.addr };
  S.cart = {}; buzz(); save(); proc(true, 'Placing your order');
  setTimeout(() => {
    hardStack(['home', 'track']); renderAll(); renderTrack(); startTrack();
    setTimeout(() => proc(false), 60);
    if (joining) setTimeout(() => toast('Welcome to Bloc+. Your discount is already applied.'), 700);
  }, 1500);
}
function openTrack() { if (top() === 'track') return; if (!onTabs()) replace(['home']); push('track'); }

/* ---------- live tracking ---------- */
const DUR = 30000, PACK = .12, NEAR = .8;
let trk = { raf: 0, t: 0 };
function renderTrack() {
  const o = S.active; if (!o) return;
  const a = S.places[o.addr] || Object.values(S.places)[0] || { t: 'Your res', s: '' };
  $('#trkBody').innerHTML = `<div class="thead"><div class="eta-big" id="tEta">Packing your order</div><div class="sub" id="tSub">Arrives by ${o.eta}</div></div>
    <div class="prog" aria-hidden="true"><i><b id="pb0"></b></i><i><b id="pb1"></b></i><i><b id="pb2"></b></i></div>
    <div class="plabels"><span class="on">Packed</span><span id="pl1">On the way</span><span id="pl2">Delivered</span></div>
    <div class="courier"><div class="av">${COURIER.initials}<small>${I.star}${COURIER.rating}</small></div><div class="ct"><b>${COURIER.name}</b><span>${COURIER.ride}</span></div><button class="rbtn tap" data-act="msg" aria-label="Message ${COURIER.first}">${I.chat}</button><button class="rbtn tap" data-act="call" aria-label="Call ${COURIER.first}">${I.phone}</button></div>
    <div class="pinrow"><span>Delivery PIN<small>Share it with ${COURIER.first} at the door</small></span><span class="pinbox" aria-label="PIN ${o.pin.split('').join(' ')}">${[...o.pin].map(d => `<b>${d}</b>`).join('')}</span></div>
    <div class="osum"><div class="osh"><span>Your order</span><span>${R(o.total)}</span></div><div class="osi">${label(o.items)}</div><div class="osa">${I.pin}${esc(a.t)}${a.s ? ', ' + esc(a.s) : ''}</div></div>`;
}
function startTrack() {
  cancelAnimationFrame(trk.raf);
  const rp = $('#mapTrk .route:not(.base)'), L = rp.getTotalLength();
  // distance to each corner, so the courier slows into a turn and speeds out of it
  const cuts = [0]; ROUTE_PTS.slice(1).forEach((p, i) => cuts.push(cuts[i] + Math.hypot(p[0] - ROUTE_PTS[i][0], p[1] - ROUTE_PTS[i][1])));
  trk = { t0: performance.now(), raf: 0, t: 0, stage: 0, mins: -1, rp, L, cuts, ang: 180 };
  const step = now => {
    const t = Math.min(1, (now - trk.t0) / DUR);
    trk.t = t; updateTrack(t);
    if (t < 1) trk.raf = requestAnimationFrame(step); else finishTrack();
  };
  trk.raf = requestAnimationFrame(step);
}
function distAt(u) {
  const { cuts, L } = trk; if (u <= 0) return 0; if (u >= 1) return L;
  const at = u * L;
  for (let i = 0; i < cuts.length - 1; i++) if (at <= cuts[i + 1]) {
    const a = cuts[i], b = cuts[i + 1], s = (at - a) / (b - a);
    return a + (b - a) * (s - Math.sin(2 * Math.PI * s) / (2 * Math.PI) * .45);
  }
  return L;
}
function updateTrack(t) {
  const u = Math.max(0, (t - PACK) / (1 - PACK)), { rp, L } = trk, d = distAt(u), pt = rp.getPointAtLength(d), ahead = rp.getPointAtLength(Math.min(L, d + 3));
  if (d < L - 1) { const target = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI + 90; let diff = ((target - trk.ang + 540) % 360) - 180; trk.ang += diff * .18; }
  $('#rider').setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
  $('#riderNose').setAttribute('transform', `rotate(${trk.ang.toFixed(1)})`);
  rp.style.strokeDasharray = `${L} ${L}`; rp.style.strokeDashoffset = -d;
  const set = (id, v) => { const x = document.getElementById(id); if (x) x.style.transform = `scaleX(${v})`; };
  set('pb0', Math.min(1, t / PACK)); set('pb1', u); set('actBar', t); set('dockBar', t);
  const mins = t < PACK ? 0 : Math.max(1, Math.round(14 * (1 - t)));
  if (mins !== trk.mins) {
    trk.mins = mins;
    if (mins) { const e = $('#tEta'); if (e) { e.textContent = `Arriving in ${mins} min`; $('#tSub').textContent = `${COURIER.first} is on the way`; $('#pl1').classList.add('on'); } }
  }
  if (t >= PACK && trk.stage < 1) { trk.stage = 1; liveNote(`${COURIER.first} picked up your order.`); }
  if (t >= NEAR && trk.stage < 2) { trk.stage = 2; liveNote(`${COURIER.first} is 2 minutes away. Meet at the res entrance.`); }
  if (noteLive) updateLive(t);
}
function updateLive(t) {
  const u = Math.max(0, (t - PACK) / (1 - PACK)), e = $('#nlEta'), bar = $('#nlBar'), knob = $('#nlKnob');
  if (!e) return;
  e.textContent = t < PACK ? 'Packing your order' : `Arriving in ${Math.max(1, Math.round(14 * (1 - t)))} min`;
  bar.style.transform = `scaleX(${u})`;
  knob.style.transform = `translateX(${(u * (bar.offsetWidth || 0)).toFixed(1)}px)`;
}
function finishTrack() {
  const o = S.active; if (!o) return;
  S.orders.unshift({ ...o }); S.active = null;
  const a = S.places[o.addr] || { t: 'your res' };
  $('#trkBody').innerHTML = `<div class="thead"><div class="dchk">${I.check}</div><div class="eta-big">Delivered</div><div class="sub">${COURIER.first} left it at ${esc(a.t)}. Enjoy.</div></div>
    <p class="rq">How was ${COURIER.first}?</p><div class="stars" role="radiogroup" aria-label="Rate ${COURIER.first}">${[1, 2, 3, 4, 5].map(i => `<button role="radio" aria-checked="false" data-star="${i}" aria-label="${i} star${i > 1 ? 's' : ''}">${I.star}</button>`).join('')}</div>
    <div class="dbtns"><button class="cta" data-act="done">Done</button><button class="tlink" data-reorder="${o.id}">Order this again</button></div>`;
  trkSheet.snapIdx(1);
  renderAll();
  if (top() !== 'track') note({ msg: `Delivered. ${COURIER.first} left your order at ${a.t}.` });
}

/* ---------- accounts: welcome, sign up, log in, onboarding ---------- */
const SU_ALL = ['name', 'email', 'password', 'place'];
let su = { steps: SU_ALL, i: 0, mode: 'signup' };
const suForm = $('#suForm'), liForm = $('#liForm');
function startSignup(mode = 'signup') {
  su = { steps: mode === 'place' ? ['place'] : SU_ALL, i: 0, mode };
  if (mode === 'signup') suForm.reset();
  const n = su.steps.length;
  $$('.step', suForm).forEach(f => { f.hidden = !su.steps.includes(f.dataset.step); f.style.width = (100 / n) + '%'; });
  $('#suTrack').style.width = n * 100 + '%';
  $('#suSteps').innerHTML = n > 1 ? su.steps.map(() => '<i></i>').join('') : '';
  $('#suFine').hidden = mode !== 'signup';
  $('#s-signup [data-back]').style.visibility = mode === 'place' ? 'hidden' : '';
  renderSu();
}
function renderSu() {
  const n = su.steps.length, cur = su.steps[su.i];
  $('#suTrack').style.transform = `translate3d(${-su.i * (100 / n)}%,0,0)`;
  $$('#suSteps i').forEach((b, i) => b.classList.toggle('on', i <= su.i));
  $$('.step', suForm).forEach(f => { f.inert = f.dataset.step !== cur; });
  $(`.step[data-step="${cur}"]`).appendChild($('#suErr')); // keep the error right under this step's fields
  const last = su.i === n - 1;
  $('#suNext span').textContent = !last ? 'Next' : su.mode === 'place' ? 'Save and continue' : 'Create account';
  setErr('suErr', '');
  setTimeout(() => { if (top() === 'signup') $(`.step[data-step="${cur}"] input`)?.focus({ preventScroll: true }); }, mq.matches ? 420 : 80);
}
function setErr(id, msg, ok) {
  const e = $('#' + id); e.textContent = msg; e.classList.toggle('ok', !!ok);
  if (msg && !ok) { e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); buzz(); }
}
function bad(input, msg, errId) { input.closest('.field').classList.add('bad'); setErr(errId, msg); input.focus({ preventScroll: true }); return false; }
function validStep(step) {
  const f = suForm.elements;
  $$('.field.bad', suForm).forEach(x => x.classList.remove('bad'));
  if (step === 'name' && !f.first.value.trim()) return bad(f.first, 'Add your first name.', 'suErr');
  if (step === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) return bad(f.email, 'That email doesn’t look right. Check it and try again.', 'suErr');
  if (step === 'password' && f.password.value.length < 8) return bad(f.password, 'Use at least 8 characters.', 'suErr');
  if (step === 'place' && !f.res.value.trim()) return bad(f.res, 'Add the name of your res so we know where to go.', 'suErr');
  return true;
}
function placesFromForm() {
  const f = suForm.elements, res = f.res.value.trim(), room = f.room.value.trim();
  return {
    res: { label: 'Res', t: room ? `${res}, Room ${room}` : res, s: 'Hatfield, Pretoria', i: 'home' },
    lib: { label: 'Library', t: 'Merensky Library', s: 'Hatfield campus, front steps', i: 'book' },
  };
}
async function suNext(e) {
  e && e.preventDefault();
  const step = su.steps[su.i];
  if (!validStep(step)) return;
  if (su.i < su.steps.length - 1) { su.i++; buzz(); return renderSu(); }
  const f = suForm.elements, btn = $('#suNext');
  if (su.mode === 'place') { S.places = placesFromForm(); S.addr = 'res'; save(); return enterApp(); }
  btn.classList.add('busy');
  try {
    const name = [f.first.value.trim(), f.last.value.trim()].filter(Boolean).join(' ');
    const u = await auth.signUp({ name, email: f.email.value, password: f.password.value });
    load(u); S.places = placesFromForm(); S.addr = 'res'; S.onboarded = false; save();
    replace(['onboard']); obGo(0);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use' || err.code === 'auth/invalid-email') { su.i = su.steps.indexOf('email'); renderSu(); }
    if (err.code === 'auth/weak-password') { su.i = su.steps.indexOf('password'); renderSu(); }
    setTimeout(() => setErr('suErr', auth.message(err)), 30);
  } finally { btn.classList.remove('busy'); }
}
function suBack() { if (su.i > 0) { su.i--; return renderSu(); } back(); }
async function doLogin(e) {
  e && e.preventDefault();
  const f = liForm.elements, btn = $('#liBtn');
  $$('.field.bad', liForm).forEach(x => x.classList.remove('bad'));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) return bad(f.email, 'Enter the email you signed up with.', 'liErr');
  if (!f.password.value) return bad(f.password, 'Enter your password.', 'liErr');
  btn.classList.add('busy'); setErr('liErr', '');
  try { afterAuth(await auth.logIn({ email: f.email.value, password: f.password.value })); }
  catch (err) { setErr('liErr', auth.message(err)); }
  finally { btn.classList.remove('busy'); }
}
async function google() {
  try { afterAuth(await auth.google()); }
  catch (err) { const id = top() === 'login' ? 'liErr' : null; id ? setErr(id, auth.message(err)) : toast(auth.message(err)); }
}
async function forgot() {
  const f = liForm.elements, email = f.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad(f.email, 'Enter your email first, then tap Forgot password.', 'liErr');
  if (auth.mode === 'local') return setErr('liErr', 'Demo accounts live on this device, so there’s no reset email. Create a new account instead.');
  try { await auth.resetPassword(email); setErr('liErr', `If ${email} has a Bloc account, a reset link is on its way.`, true); }
  catch (err) { setErr('liErr', auth.message(err)); }
}
function afterAuth(u) {
  load(u);
  if (!Object.keys(S.places).length) { replace(['signup']); startSignup('place'); return; }
  enterApp();
}
function enterApp() {
  if (!S.onboarded) { replace(['onboard']); return obGo(0); }
  replace(['home']); renderAll();
}
async function signOut() {
  cancelAnimationFrame(trk.raf);
  if (S.active) { S.orders.unshift(S.active); S.active = null; }
  save(); await auth.logOut().catch(() => {});
  user = null; S = blank(); hideNote(); closePicker();
  liForm.reset(); replace(['welcome']);
}
// onboarding slides
const ob = $('#ob');
let obI = 0;
function obGo(i) { obI = i; ob.scrollTo({ left: i * ob.clientWidth, behavior: reduced.matches || !i ? 'auto' : 'smooth' }); obUI(); }
function obUI() { $$('#obDots i').forEach((d, i) => d.classList.toggle('on', i === obI)); $('#obBtn').textContent = obI === 2 ? 'Start shopping' : 'Next'; }
ob.addEventListener('scroll', () => { const i = Math.round(ob.scrollLeft / ob.clientWidth); if (i !== obI) { obI = i; obUI(); } }, { passive: true });
function obDone() { S.onboarded = true; save(); replace(['home']); renderAll(); }

/* ---------- events ---------- */
app.addEventListener('click', e => {
  const b = e.target.closest('button,[data-act]');
  if (!b || !app.contains(b) || b.disabled) return;
  const d = b.dataset;
  if ('back' in d) return top() === 'signup' ? suBack() : back();
  if (d.tab) return setTab(d.tab);
  if (d.cat) return openSelect(d.cat);
  if (d.pick) return pick(d.pick);
  if (d.res) { $('#q').value = ''; $('#results').hidden = true; return openSelect(P[d.res].cat, d.res); }
  if (d.addr) { S.addr = d.addr; buzz(); renderAll(); if (pk) { renderPicker(); setTimeout(closePicker, 180); } return; }
  if (d.inc) { S.cart[d.inc]++; buzz(); return renderAll(); }
  if (d.dec) {
    if (--S.cart[d.dec] <= 0) delete S.cart[d.dec];
    buzz();
    if (!cartCount()) { back(); toast('Your cart is empty.'); }
    return renderAll();
  }
  if (d.add) { S.cart[d.add] = (S.cart[d.add] || 0) + 1; buzz(); return renderAll(); }
  if (d.reorder) return reorder(d.reorder);
  if (d.deal) return deal(d.deal);
  if (d.pay) { S.pay = d.pay; buzz(); renderAll(); renderPicker(); return setTimeout(closePicker, 180); }
  if (d.when) { S.when = d.when; buzz(); renderAll(); renderPicker(); return setTimeout(closePicker, 180); }
  if (d.theme) { theme = d.theme; applyTheme(); renderAccount(); renderPicker(); return setTimeout(closePicker, 220); }
  if (d.star) { $$('[data-star]').forEach(s => { const on = +s.dataset.star <= +d.star; s.classList.toggle('on', on); s.setAttribute('aria-checked', String(s === b)); }); buzz(); return toast(+d.star >= 4 ? `Thanks. We’ll tell ${COURIER.first}.` : 'Thanks. The Bloc team will look into it.'); }
  switch (d.act) {
    case 'signup': startSignup(); return push('signup');
    case 'login': setErr('liErr', ''); push('login'); return setTimeout(() => liForm.elements.email.focus({ preventScroll: true }), mq.matches ? 420 : 80);
    case 'google': return google();
    case 'forgot': return forgot();
    case 'eye': { const i = b.parentElement.querySelector('input'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.innerHTML = show ? I.eyeOff : I.eye; b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); return; }
    case 'obNext': return obI >= 2 ? obDone() : obGo(obI + 1);
    case 'obDone': return obDone();
    case 'plus': return push('plus');
    case 'join': return join(b);
    case 'leave': return openPicker('confirm', { title: 'Cancel Bloc+?', body: `You’ll go back to R${DEL.standard} delivery and full prices on your next order.`, ok: 'Cancel membership', cancel: 'Keep Bloc+', danger: true, run: () => { S.member = false; renderAll(); renderPlus(); toast('Bloc+ cancelled. You can rejoin any time.'); } });
    case 'joinToggle': S.join = !S.join; buzz(); return renderCheckout();
    case 'pay': return openPicker('pay');
    case 'addr': case 'places': return openPicker('addr');
    case 'addPlace': adding = true; renderPicker(); return setTimeout(() => $('#placeForm input')?.focus({ preventScroll: true }), 50);
    case 'when': return openPicker('when');
    case 'theme': return openPicker('theme');
    case 'pkclose': return closePicker();
    case 'pkok': { const run = pkConfirm?.run; closePicker(); return run && run(); }
    case 'choose': return choose();
    case 'cart': return openCart();
    case 'place': return placeOrder();
    case 'track': return openTrack();
    case 'recenter': return (top() === 'track' ? trkMap : selMap).recenter();
    case 'scrim': return back();
    case 'soon': return toast('Coming soon. Bloc is starting with eggs, bread and milk.');
    case 'call': return toast(`Calling ${COURIER.first}…`);
    case 'msg': return toast(`Sent to ${COURIER.first}: “Coming down now.”`);
    case 'done': return setTab('home');
    case 'invite': {
      const url = location.origin;
      if (navigator.share) return navigator.share({ title: 'Bloc', text: 'Eggs, bread and milk to your res, same day. We both get R20 off.', url }).catch(() => {});
      navigator.clipboard?.writeText(url).catch(() => {});
      return toast('Invite link copied. You both get R20 off.');
    }
    case 'help': return toast('The Bloc team replies on WhatsApp within minutes.');
    case 'signout': return openPicker('confirm', { title: 'Sign out of Bloc?', body: 'Your orders and savings stay saved to your account on this device.', ok: 'Sign out', run: signOut });
    case 'reset': return openPicker('confirm', { title: 'Reset demo data?', body: 'This clears your cart, orders, savings and Bloc+ status on this device. Your account stays.', ok: 'Reset', danger: true, run: () => { cancelAnimationFrame(trk.raf); const keep = { places: S.places, addr: S.addr, onboarded: true }; S = { ...blank(), ...keep }; renderAll(); setTab('home'); toast('Demo data cleared.'); } });
  }
});
suForm.addEventListener('submit', suNext);
liForm.addEventListener('submit', doLogin);
$$('.field input').forEach(i => i.addEventListener('input', () => i.closest('.field').classList.remove('bad')));
const q = $('#q'), res = $('#results');
q.addEventListener('input', () => {
  const v = q.value.trim().toLowerCase();
  if (!v) { res.hidden = true; res.innerHTML = ''; return; }
  const hits = Object.entries(P).filter(([, p]) => `${p.name} ${p.short} ${p.sub} ${p.cat}`.toLowerCase().includes(v)).slice(0, 5);
  res.hidden = false;
  res.innerHTML = hits.length
    ? hits.map(([id, p]) => `<button class="rrow tap" data-res="${id}"><span class="ra">${art(id)}</span><span class="rt"><b>${title(id)}</b><span>${p.soldOut ? 'Sold out today' : p.sub}</span></span><b>${R(unit(id))}</b></button>`).join('')
    : `<div class="rnone">Nothing for “${esc(q.value.trim())}” yet. Bloc starts with eggs, bread and milk.</div>`;
});
q.addEventListener('keydown', e => { if (e.key === 'Enter') { $('.rrow', res)?.click(); q.blur(); } if (e.key === 'Escape') { q.value = ''; q.dispatchEvent(new Event('input')); } });
$('#calcN').addEventListener('input', calc);
addEventListener('keydown', e => { if (e.key === 'Escape' && document.activeElement !== q && stack.length) back(); });
addEventListener('offline', () => toast('You’re offline. You can browse, but orders need a connection.'));
addEventListener('online', () => toast('Back online.'));
app.addEventListener('scroll', () => { app.scrollTop = 0; app.scrollLeft = 0; });

/* ---------- init ---------- */
function hideSplash() {
  const s = $('#splash'); if (!s || s.classList.contains('out')) return;
  s.classList.add('out'); statusBar(); setTimeout(() => { s.remove(); statusBar(); }, 700);
}
function tick() { $('#sbt').textContent = fmtT(new Date()).replace(/am|pm/, ''); }
let qrLoaded = false;
function qr() { // the "open on your phone" code beside the phone frame, loaded only when that panel shows
  if (qrLoaded || matchMedia('(max-width:980px)').matches) return;
  qrLoaded = true;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
  s.onload = () => { const g = window.qrcode(0, 'M'); g.addData(location.origin + '/get'); g.make(); $('#qr').innerHTML = g.createSvgTag({ cellSize: 3, margin: 2, scalable: true }); };
  document.head.appendChild(s);
}

renderStatic();
// sheet stops (distance from the top): expanded, resting, collapsed. Resting sits high so the options breathe.
const selSnaps = h => [Math.max(96, Math.round(h * .1)), Math.round(h * .4), h - ($('#selFoot').offsetHeight + 124)];
const trkSnaps = h => { const a = Math.max(120, Math.round(h * .24)); return [a, Math.max(a + 40, Math.round(h * .46)), h - 168]; };
selSheet = Sheet($('#sheetSel'), { snaps: selSnaps, list: $('#selList'), foot: $('#selFoot') });
trkSheet = Sheet($('#sheetTrk'), { snaps: trkSnaps, list: $('#trkBody') });
selMap = MapView($('#mapSel'), () => selSnaps(el('select').clientHeight)[1]);
trkMap = MapView($('#mapTrk'), () => trkSnaps(el('track').clientHeight)[1]);
if (auth.mode === 'firebase') { $('#wGoogle').hidden = false; $('#liGoogle').hidden = false; }
applyTheme(); renderPayrows(); fit(); fitKeyboard(); tick();
setInterval(tick, 15000);
addEventListener('resize', () => { fit(); fitKeyboard(); qr(); });
vv && vv.addEventListener('resize', fitKeyboard);
vv && vv.addEventListener('scroll', () => { if (window.scrollY) window.scrollTo(0, 0); });
mq.addEventListener('change', fit);
qr();

const minSplash = new Promise(r => setTimeout(r, reduced.matches ? 300 : 1700));
const who = await Promise.race([auth.current().catch(() => null), new Promise(r => setTimeout(() => r(null), 6000))]);
if (who) { load(who); if (!Object.keys(S.places).length) { hardStack(['signup']); startSignup('place'); } else if (!S.onboarded) { hardStack(['onboard']); } else { hardStack(['home']); renderAll(); } }
else hardStack(['welcome']);
await minSplash;
hideSplash();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
