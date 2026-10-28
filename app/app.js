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
    eggs6:  { cat: 'eggs', name: '6 Pack', opt: '6', short: '6 eggs', sub: '6 large eggs', price: 17, art: 'eggs', n: 6, tag: 'Most popular' },
    eggs12: { cat: 'eggs', name: '12 Pack', opt: '12', short: '12 eggs', sub: '12 large eggs', price: 32, art: 'eggs', n: 12 },
    eggs18: { cat: 'eggs', name: '18 Tray', opt: '18', short: '18 eggs', sub: '18 large eggs', price: 46, art: 'eggs', n: 18 },
    eggs30: { cat: 'eggs', name: '30 Tray', opt: '30', short: '30 eggs', sub: '30 large eggs. Split it with your floor', price: 72, art: 'eggs', n: 30, tag: 'Res share' },
    breadW: { cat: 'bread', name: 'White loaf', opt: 'White', short: 'White loaf', sub: '700g, sliced', price: 18, art: 'bread', v: 'w', tag: '2-for-1 on Bloc+' },
    breadB: { cat: 'bread', name: 'Brown loaf', opt: 'Brown', short: 'Brown loaf', sub: '700g, sliced', price: 17, art: 'bread', v: 'b' },
    breadS: { cat: 'bread', name: 'Seeded loaf', opt: 'Seeded', short: 'Seeded loaf', sub: '600g wholewheat', price: 26, art: 'bread', v: 's', soldOut: true },
    milk2:  { cat: 'milk', name: 'Fresh milk 2L', opt: '2L', short: 'Milk 2L', sub: 'Full cream, 2 litres', price: 34, art: 'milk', v: 'f', tag: 'Most popular' },
    milk1:  { cat: 'milk', name: 'Fresh milk 1L', opt: '1L', short: 'Milk 1L', sub: 'Full cream, 1 litre', price: 19, art: 'milk', v: 's' },
    milkL:  { cat: 'milk', name: 'Low fat 2L', opt: 'Low fat', short: 'Low fat 2L', sub: '2% fat, 2 litres', price: 34, art: 'milk', v: 'l' },
    bBreak: { cat: 'bundles', name: 'Breakfast', opt: 'Breakfast', short: 'Breakfast bundle', sub: '6 eggs and a white loaf', price: 32, was: 35, art: 'bundle' },
    bBloc:  { cat: 'bundles', name: 'The Bloc', opt: 'The Bloc', short: 'The Bloc bundle', sub: '6 eggs, a loaf and 2L milk', price: 62, was: 69, art: 'bundle', tag: 'Best value' },
    bRes:   { cat: 'bundles', name: 'Res Pack', opt: 'Res Pack', short: 'Res Pack', sub: '18 eggs, 2 loaves, 2 × 2L milk', price: 125, was: 150, art: 'bundle' },
  },
};
const { plus: PLUS, delivery: DEL, products: P } = CONFIG;
// the four blocs on home: the size quick-add puts in the basket, and the art on the bloc
const CATS = { eggs: { name: 'Eggs', def: 'eggs6', art: 'eggs', cap: '6 large eggs' }, bread: { name: 'Bread', def: 'breadW', art: 'bread:w', cap: 'White loaf' }, milk: { name: 'Milk', def: 'milk2', art: 'milk:f', cap: 'Full cream, 2L' }, bundles: { name: 'Bundles', def: 'bBloc', art: 'bundle', cap: 'The Bloc' } };
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
const whenLine = () => S.when === 'today' ? `Today, at your door by ${etaT(CONFIG.etaMins)}` : 'Tomorrow, 8–10am';
// write markup only when it changed, so re-renders don't restart animations or steal focus
const setHTML = (n, html) => { if (n.__h === html) return false; n.innerHTML = html; n.__h = html; return true; };
const bump = n => { if (!n || reduced.matches) return; n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); };

const art = spec => { const p = P[spec]; if (p) return ART[p.art](p.v); const [k, v] = spec.split(':'); return ART[k](v); };
const tint = id => `--tint:var(--t-${P[id].cat})`;
const idsOf = cat => Object.keys(P).filter(k => P[k].cat === cat);
// a small progress ring, drawn like the O in the wordmark; live ones follow the delivery
const miniRing = live => `<svg class="mr" viewBox="0 0 40 40" aria-hidden="true"><circle class="m0" cx="20" cy="20" r="16"/><circle class="m1"${live ? ' data-live' : ''} cx="20" cy="20" r="16" pathLength="100"/></svg>`;

/* ---------- state, saved per account on this device ---------- */
const blank = () => ({ member: false, join: false, cart: {}, addr: 'res', places: {}, pay: 'visa', when: 'today', saved: 0, active: null, orders: [], onboarded: false });
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
function save() { if (!user) return; const { join, ...keep } = S; write(KEY(), keep); }
const firstName = () => (user?.name || user?.email || '').split(/[\s@]/)[0] || 'there';
const initials = () => { const p = (user?.name || user?.email || '?').trim().split(/\s+/); return ((p[0][0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); };
const unit = (id, m = S.member) => m ? mp(P[id].price) : P[id].price;
const cartCount = () => Object.values(S.cart).reduce((a, b) => a + b, 0);
const catCount = c => Object.entries(S.cart).reduce((a, [id, q]) => a + (P[id].cat === c ? q : 0), 0);
const label = items => Object.entries(items).filter(([id]) => P[id]).map(([id, q]) => P[id].short + (q > 1 ? ` ×${q}` : '')).join(', ');
const title = id => { const p = P[id]; return p.cat === 'eggs' ? `${p.name} eggs` : p.cat === 'bundles' ? p.short : p.name; };
const place = () => S.places[S.addr] || Object.values(S.places)[0];

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
  trkMap?.fit();
}
const vv = window.visualViewport;
function fitKeyboard() {
  if (mq.matches && vv) document.documentElement.style.setProperty('--app-h', vv.height + 'px');
  else document.documentElement.style.removeProperty('--app-h');
  if (window.scrollY) window.scrollTo(0, 0);
}
// an element's box inside another, in the app's own pixels (the desktop frame is scaled)
const rel = (n, to) => { const a = n.getBoundingClientRect(), b = to.getBoundingClientRect(); return { x: (a.left - b.left) / SCALE, y: (a.top - b.top) / SCALE, w: a.width / SCALE, h: a.height / SCALE }; };

/* ---------- navigation stack ---------- */
const TABS = ['home', 'orders', 'account'];
const el = id => $('#s-' + id);
let stack = [];
const top = () => stack[stack.length - 1];
const onTabs = () => stack.length === 1 && TABS.includes(stack[0]);
function chrome() {
  const isl = $('#island');
  isl.classList.toggle('hide', !onTabs());
  isl.style.setProperty('--ti', Math.max(0, TABS.indexOf(stack[0])));
  $$('#island [data-tab]').forEach(b => { const on = b.dataset.tab === stack[0]; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
  $$('.screen').forEach(s => { const live = s.id === 's-' + top(); s.inert = !live; s.setAttribute('aria-hidden', String(!live)); });
  renderIsland(); statusBar();
}
function statusBar() {
  const sp = $('#splash');
  const brand = (sp && !sp.classList.contains('out')) || $('#proc').classList.contains('show') || top() === 'welcome';
  $('#sbar').classList.toggle('light', brand || top() === 'plus');
  app.classList.toggle('light-bar', brand);
}
function hardStack(ids) {
  closeProduct(true); mapClose(true);
  $$('.screen').forEach(s => { s.style.transition = 'none'; s.classList.remove('on', 'under', 'behind'); s.style.zIndex = ''; });
  $('#scrim').classList.remove('show');
  ids.forEach((id, i) => { const s = el(id); s.classList.add('on'); if (i < ids.length - 1) s.classList.add(el(ids[i + 1]).classList.contains('modal') ? 'behind' : 'under'); if (i) s.style.zIndex = 10 + 2 * i; });
  stack = [...ids];
  void app.offsetHeight;
  $$('.screen').forEach(s => { s.style.transition = ''; });
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
  if (s.classList.contains('modal')) { const sc = $('#scrim'); sc.style.zIndex = z - 1; sc.classList.add('show'); el(top()).classList.add('behind'); }
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
  if (s.classList.contains('modal')) { $('#scrim').classList.remove('show'); el(top()).classList.remove('behind'); }
  else el(top()).classList.remove('under');
  if (id === 'track') { mapClose(true); if (S.active) setTimeout(() => liveNote(), 450); }
  chrome(); onEnter(top());
}
// sheets and the full-screen map sit on the browser history too, so the Android back button closes them first
let skipPop = false;
const ovPush = () => { try { history.pushState({ bloc: stack.length, ov: 1 }, ''); } catch {} };
const ovPop = () => { if (history.state && history.state.ov) { skipPop = true; history.back(); } };
function back() {
  if (pk) return closePicker();
  if (ps) return closeProduct();
  if (mapFull) return mapClose();
  if (history.state && history.state.bloc) history.back(); else pop();
}
addEventListener('popstate', () => {
  if (skipPop) { skipPop = false; return; }
  if (pk) return closePicker(true);
  if (ps) return closeProduct(true);
  if (mapFull) return mapClose(false, true);
  if (stack.length > 1) pop();
});
function setTab(t) {
  if (stack.includes('track')) mapClose(true);
  stack.slice(1).forEach(id => el(id).classList.remove('on', 'under', 'behind'));
  if (!TABS.includes(stack[0])) return replace([t]);
  TABS.forEach(x => { el(x).classList.toggle('on', x === t); el(x).classList.remove('under', 'behind'); });
  stack = [t]; $('#scrim').classList.remove('show');
  chrome(); onEnter(t);
}
function onEnter(id) {
  statusBar();
  if (id === 'home') renderHome();
  if (id === 'orders') renderOrders(true);
  if (id === 'account') renderAccount();
  if (id === 'track') { if (!mapFull) requestAnimationFrame(() => trkMap.fit()); hideNote(); }
  if (id === 'checkout') renderCheckout();
  if (id === 'plus') renderPlus();
}

/* ---------- drag a sheet down to dismiss it: follows the finger, rubber-bands upward, flicks closed ---------- */
function dismissable(sheet, handle, close) {
  let d = null;
  sheet.addEventListener('pointerdown', e => { if (e.button || !e.target.closest(handle)) return; d = { id: e.pointerId, sy: e.clientY, pts: [[performance.now(), 0]], dy: 0 }; sheet.style.transition = 'none'; });
  addEventListener('pointermove', e => {
    if (!d || d.id !== e.pointerId) return;
    const raw = (e.clientY - d.sy) / SCALE;
    d.dy = raw > 0 ? raw : -24 * (1 - Math.exp(raw / 80));
    sheet.style.transform = `translate3d(0,${d.dy.toFixed(1)}px,0)`;
    const now = performance.now(); d.pts.push([now, raw]); while (d.pts.length > 2 && now - d.pts[0][0] > 90) d.pts.shift();
  });
  const up = e => {
    if (!d || d.id !== e.pointerId) return;
    const [a, b] = [d.pts[0], d.pts[d.pts.length - 1]], v = b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0;
    sheet.style.transition = ''; sheet.style.transform = '';
    if (d.dy > 110 || (d.dy > 24 && v > .5)) close();
    d = null;
  };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
}

/* ---------- map: Hatfield, Pretoria (stylised) ---------- */
const ROUTE_PTS = [[310, 100], [310, 220], [210, 220], [210, 335], [105, 335]]; // Bloc hub → your res
const ROUTE = 'M' + ROUTE_PTS.map(p => p.join(' ')).join('L');
const WORLD = [-200, -160, 620, 900]; // drawable map, in svg units: panning and zooming out stop at its edges
const FOCUS = [90, 78, 330, 352];    // hub, route, res and their labels: what "recenter" frames
function mapSVG() {
  const Hs = [[-140, 7], [-80, 7], [-20, 7], [40, 7], [100, 7], [160, 7], [220, 12], [280, 7], [335, 12], [400, 7], [470, 7], [530, 7], [590, 7], [650, 7], [710, 12], [770, 7], [830, 7]];
  const Vs = [[-170, 7], [-115, 7], [-60, 12], [-5, 7], [50, 7], [105, 12], [160, 7], [210, 12], [260, 7], [310, 7], [370, 7], [430, 7], [490, 12], [550, 7]];
  const ln = (x1, y1, x2, y2, w) => `<path class="mroad" d="M${x1} ${y1}L${x2} ${y2}" stroke-width="${w}"/>`;
  const roads = maj => [...Hs.filter(h => (h[1] > 9) === maj).map(([y, w]) => ln(-220, y, 640, y, w)), ...Vs.filter(v => (v[1] > 9) === maj).map(([x, w]) => ln(x, -180, x, 920, w))].join('');
  const blocks = [];
  for (let i = 0; i < Vs.length - 1; i++) for (let j = 0; j < Hs.length - 1; j++) if ((i * 7 + j * 3) % 5 === 0) blocks.push(`<rect class="mblock" x="${Vs[i][0] + 9}" y="${Hs[j][0] + 9}" width="${Vs[i + 1][0] - Vs[i][0] - 18}" height="${Hs[j + 1][0] - Hs[j][0] - 18}" rx="3"/>`);
  const chip = (x, y, w, t) => `<g class="mchip" transform="translate(${x} ${y})"><rect width="${w}" height="24" rx="12" filter="url(#mapsh)"/><text x="11" y="16">${t}</text></g>`;
  return `<svg viewBox="${FOCUS.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of Hatfield showing the route from the Bloc hub to your res. Pinch or scroll to zoom, drag to move.">
  <defs><filter id="mapsh" x="-30%" y="-60%" width="160%" height="240%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.8" flood-color="#15120A" flood-opacity=".2"/></filter></defs>
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
  <path class="route base" d="${ROUTE}"/><path class="route" d="${ROUTE}"/>
  <rect class="pin-o" x="303" y="93" width="14" height="14" rx="3"/><rect class="pin-i" x="307.5" y="97.5" width="5" height="5" rx="1"/>
  <circle class="halo" cx="105" cy="335" r="16"/><circle class="pin-res" cx="105" cy="335" r="8"/><circle class="pin-i" cx="105" cy="335" r="3"/>
  ${chip(210, 88, 86, 'Bloc hub ›')}${chip(119, 323, 82, 'Your res ›')}
  <g id="rider" transform="translate(310 100)"><g id="riderNose"><path class="rnose" d="M0-19 5-12.5H-5z"/></g><circle class="rbg" r="13" filter="url(#mapsh)"/><circle class="rdot" r="10"/><g transform="translate(-6 -6) scale(.5)" stroke="#fff" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 8h13l-1 12.5h-11zM9 8V6.5a3 3 0 0 1 6 0V8"/></g></g>
  </svg>`;
}

/* ---------- map camera: pinch, scroll and double-tap zoom within limits, drag to pan with momentum, recenter.
   Zooming rewrites the svg viewBox, so roads and labels stay sharp at every level. ---------- */
const ZOOM = [.7, 3]; // how far out and in you can go, relative to the fitted route view
function MapView(host, pad) {
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
  // the camera that frames the route inside a W×H box, clear of whatever floats over its edges
  function frameFor(W, H, p) {
    const [x0, y0, x1, y1] = FOCUS, k = Math.min((W - p.l - p.r) / (x1 - x0), (H - p.t - p.b) / (y1 - y0));
    return { s: k, vx: (x0 + x1) / 2 - (p.l + (W - p.l - p.r) / 2) / k, vy: (y0 + y1) / 2 - (p.t + (H - p.t - p.b) / 2) / k };
  }
  const home = () => { const [W, H] = size(); return frameFor(W, H, pad()); };
  const minS = () => { const [W, H] = size(); return Math.max(s0 * ZOOM[0], W / (WORLD[2] - WORLD[0]), H / (WORLD[3] - WORLD[1])); };
  const zoomAt = (px, py, ns) => {
    ns = Math.min(s0 * ZOOM[1], Math.max(minS(), ns));
    const wx = vx + px / s, wy = vy + py / s; s = ns; vx = wx - px / s; vy = wy - py / s; clamp(); apply();
  };
  function animateTo(t, ms = 480) {
    cancelAnimationFrame(glide);
    if (reduced.matches) { ({ s, vx, vy } = t); return draw(); }
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
    recenter(ms) { const h = home(); s0 = h.s; animateTo(h, ms); },
    // the host moved by (dx, dy): keep every street where it was on screen
    shift(dx, dy) { cancelAnimationFrame(glide); vx -= dx / s; vy -= dy / s; draw(); },
    frameFor, animateTo,
  };
}
let trkMap;

/* the map card opens to full screen: the full-size map starts clipped to the card, showing exactly what the card showed, then the clip opens */
let mapFull = false;
const CARD_PAD = { t: 18, r: 18, b: 18, l: 18 };
const mapPad = () => {
  if (!mapFull) return CARD_PAD;
  const f = $('#s-track .mapui .fab'), eta = $('#mapEta'), H = el('track').clientHeight;
  return { t: f.offsetTop + f.offsetHeight + 20, r: 28, b: H - eta.offsetTop + 20, l: 28 };
};
const clipTo = (r, scr) => `inset(${r.y.toFixed(1)}px ${(scr.clientWidth - r.x - r.w).toFixed(1)}px ${(scr.clientHeight - r.y - r.h).toFixed(1)}px ${r.x.toFixed(1)}px round 22px)`;
const FULL_CLIP = 'inset(0px 0px 0px 0px round 0px)';
function mapOpen() {
  if (mapFull || !S.active) return;
  const scr = el('track'), host = $('#mapTrk'), r = rel($('#mapCard'), scr);
  mapFull = true; scr.classList.add('mapfull', 'mapshow');
  trkMap.shift(r.x, r.y);
  paintLive();
  if (!reduced.matches) host.animate([{ clipPath: clipTo(r, scr) }, { clipPath: FULL_CLIP }], { duration: 560, easing: 'cubic-bezier(.32,.72,0,1)' });
  trkMap.recenter(640);
  ovPush();
}
function mapClose(instant, fromPop) {
  if (!mapFull) return;
  const scr = el('track'), host = $('#mapTrk');
  if (!fromPop && !instant) ovPop();
  scr.classList.remove('mapshow');
  const done = () => { mapFull = false; scr.classList.remove('mapfull'); trkMap.fit(); };
  if (instant || reduced.matches) return done();
  const r = rel($('#mapCard'), scr), f = trkMap.frameFor(r.w, r.h, CARD_PAD);
  trkMap.animateTo({ s: f.s, vx: f.vx - r.x / f.s, vy: f.vy - r.y / f.s }, 500);
  const a = host.animate([{ clipPath: FULL_CLIP }, { clipPath: clipTo(r, scr) }], { duration: 500, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' });
  a.onfinish = () => { done(); a.cancel(); };
}

/* ---------- a copy of the art arcs from where you tapped into the basket ---------- */
function basketPoint() {
  const isl = $('#island'), b = rel(isl, app), W = app.clientWidth / 1, w = Math.min(420, W - 32);
  return { x: (W - w) / 2 + 182 + 8 + 17, y: b.y + b.h / 2 };
}
function fly(from, to) {
  if (reduced.matches || !from) return bump($('#ictx'));
  const f = rel(from, app), g = document.createElement('div');
  g.className = 'fly'; g.style.cssText = `left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px`;
  g.innerHTML = `<div>${from.innerHTML}</div>`;
  app.appendChild(g);
  const dx = to.x - (f.x + f.w / 2), dy = to.y - (f.y + f.h / 2), k = Math.max(.12, 34 / f.w), ms = 680;
  g.animate([{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(${dx}px,0,0)` }], { duration: ms, easing: 'cubic-bezier(.4,.1,.5,1)', fill: 'forwards' });
  const a = g.firstChild.animate([
    { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
    { transform: `translate3d(0,${dy}px,0) scale(${k})`, opacity: 1, offset: .88 },
    { transform: `translate3d(0,${dy}px,0) scale(${k * .5})`, opacity: 0 },
  ], { duration: ms, easing: 'cubic-bezier(.55,-0.5,.8,.55)', fill: 'forwards' });
  a.onfinish = () => { g.remove(); bump($('#ictx')); buzz(); };
}

/* ---------- renderers ---------- */
let homeIntro = false;
// the ring from the wordmark as a seal, with the number that matters inside
const seal = t => `<span class="seal" aria-hidden="true"><svg class="pr" viewBox="0 0 100 100"><circle class="a" cx="50" cy="50" r="42"/><circle class="b" cx="50" cy="50" r="42" pathLength="100"/></svg><b>${t}</b></span>`;
function renderHome() {
  const hr = new Date().getHours(), a = place();
  $('#greet').textContent = `${hr < 12 ? 'Morning' : hr < 17 ? 'Afternoon' : 'Evening'}, ${firstName()}`;
  setHTML($('#where'), `<small>Deliver to</small><b><span>${esc(a?.t || 'Add a place')}</span>${I.down}</b>`);
  $('#homeBarT').textContent = a ? a.t : 'Bloc';
  const pc = $('#pchip'); pc.classList.toggle('mem', S.member);
  setHTML(pc, S.member ? `${I.check}Bloc+` : `${I.sparkle}Get Bloc+`);
  setHTML($('#promise'), `${S.when === 'today' ? I.bolt : I.clock}<span>${whenLine()}</span>${I.down}`);
  const blocs = $('#blocs');
  setHTML(blocs, Object.entries(CATS).map(([c, k], i) => {
    const id = k.def, n = catCount(c);
    return `<div class="bloc" style="--i:${i};--tint:var(--t-${c})"><button class="bopen" data-cat="${c}" aria-label="${k.name}: see every size"><span class="bart">${art(k.art)}</span><span class="btx"><b>${k.name}</b><small>${k.cap}</small><em>${R(unit(id))}</em></span></button>${n ? `<span class="bcount" aria-label="${n} in your basket">${n}</span>` : ''}<button class="badd tap" data-quick="${id}" aria-label="Add ${title(id)}, ${R(unit(id))}">${I.plus}</button></div>`;
  }).join(''));
  if (homeIntro) { homeIntro = false; $$('.bloc', blocs).forEach(b => { b.classList.remove('rise'); void b.offsetWidth; b.classList.add('rise'); }); }
  setHTML($('#plusCard'), S.member
    ? `<div class="pcard mem">${seal('R' + DEL.member)}<span class="pk">${I.sparkle}Bloc+ member</span><h3>You’ve saved ${R(S.saved)}</h3><p>${Math.round(PLUS.discount * 100)}% off everything and R${DEL.member} delivery, every order.</p></div>`
    : `<button class="pcard tap" data-act="plus">${seal(Math.round(PLUS.discount * 100) + '%')}<span class="pk">${I.sparkle}Bloc+</span><h3>Pay less on every order.</h3><p>${Math.round(PLUS.discount * 100)}% off everything and R${DEL.member} delivery, for R${PLUS.fee} a month.</p><span class="go">Try Bloc+${I.chev}</span></button>`);
  const recent = S.orders.slice(0, 4);
  $('#againWrap').hidden = !recent.length;
  setHTML($('#again'), recent.map(o => `<div class="again"><span class="ga">${Object.keys(o.items).filter(id => P[id]).slice(0, 3).map(art).join('')}</span><b>${label(o.items)}</b><span>${dstr(o.date)} · ${R(o.total)}</span><button class="pill tap" data-reorder="${o.id}">Reorder</button></div>`).join(''));
}
function renderStatic() {
  document.body.insertAdjacentHTML('afterbegin', DEFS);
  $$('[data-wm]').forEach(n => { n.outerHTML = WM(n.dataset.wm); });
  $$('[data-i]').forEach(n => { n.outerHTML = I[n.dataset.i]; });
  const sats = [['eggs', -150, 118, '0s'], ['milk', -38, 92, '-1.6s'], ['bread', 32, 108, '-3.1s'], ['bundle', 148, 110, '-4.4s']];
  $('#orbit').innerHTML = `<div class="hub"><svg class="oring" viewBox="-150 -150 300 300"><circle class="o1" r="96"/><circle class="o0" r="148"/><circle class="o2" r="148" pathLength="100"/></svg>${WM()}${sats.map(([a, deg, w, d]) => `<div class="arm" style="--a:${deg}deg"><div class="sat" style="--w:${w}px"><div style="--d:${d}">${ART[a]()}</div></div></div>`).join('')}</div>`;
  $('#deals').innerHTML = [
    ['bogo', 'bread', `<em class="badge-y">${I.sparkle}Bloc+</em>${art('bread:w')}`, '2-for-1 white bread', 'For members, all week'],
    ['break', 'bundles', art('bundle'), `Breakfast bundle, R${P.bBreak.price}`, 'Six eggs and a loaf, sorted'],
    ['tray', 'eggs', art('eggs'), 'Split a 30 tray', 'Go halves with your floor'],
  ].map(([k, c, a, t, s]) => `<button class="deal" data-deal="${k}"><span class="dimg" style="--tint:var(--t-${c})">${a}</span><span class="dt">${t}${I.chev}</span><span class="ds">${s}</span></button>`).join('');
  $('#soon').innerHTML = [['coffee', 'Coffee'], ['fruit', 'Fruit'], ['snacks', 'Snacks'], ['toiletries', 'Toiletries'], ['cleaning', 'Cleaning'], ['stationery', 'Stationery']]
    .map(([a, l]) => `<button class="tile tap" data-act="soon"><span class="art">${ART[a]()}</span>${l}</button>`).join('');
  $('#plusFee').textContent = 'R' + PLUS.fee;
  $('#plusBen').innerHTML = [
    [I.tag, `${Math.round(PLUS.discount * 100)}% off everything`, `Six eggs drop to ${R(mp(P.eggs6.price))}.`],
    [I.bolt, `R${DEL.member} same-day delivery`, `Instead of R${DEL.standard}, on every order.`],
    [I.gift, 'Weekly 2-for-1 deals', 'This week: white bread.'],
    [I.check, 'No contract', 'Cancel in two taps, any time.'],
  ].map(([i, b, s]) => `<div class="row"><span class="bi">${i}</span><span class="rx"><b>${b}</b><small>${s}</small></span></div>`).join('');
  $('#calcNote').textContent = `Based on a R${CONFIG.calcBasket} basket: ${Math.round(PLUS.discount * 100)}% off plus R${DEL.standard - DEL.member} cheaper delivery on each order, minus the R${PLUS.fee} fee.`;
  $('#ob').innerHTML = [
    ['bundle', 'bundles', 'Eggs, bread and milk, today.', 'Tap + on anything and it’s at your door the same day.'],
    ['plus', 'plus', `Bloc+ takes ${Math.round(PLUS.discount * 100)}% off everything.`, `Six eggs drop from R${P.eggs6.price} to ${R(mp(P.eggs6.price))}.`],
    ['scooter', 'milk', `R${DEL.member} delivery, every order.`, `Members skip the R${DEL.standard} delivery fee. Cancel anytime.`],
  ].map(([a, t, h, p], i) => `<div class="slide" role="group" aria-label="${i + 1} of 3"><div class="art"><div style="--tint:var(--t-${t})">${ART[a]()}</div></div><h2>${h}</h2><p>${p}</p></div>`).join('');
  $('#mapTrk').innerHTML = mapSVG();
}
const tagHTML = p => p.soldOut ? '<span class="tag r">Sold out</span>' : p.tag ? `<span class="tag ${p.tag.includes('Bloc+') ? 'y' : p.tag === 'Best value' ? 'g' : 'b'}">${p.tag}</span>` : '';

/* ---------- product sheet: sizes on a segmented track, quantity, add ---------- */
let ps = null;
function openProduct(cat, sel) {
  if (!user) return;
  const pre = sel && !P[sel].soldOut ? sel : CATS[cat].def;
  ps = { cat, sel: pre, qty: 1 };
  const ids = idsOf(cat), sz = $('#psSizes');
  $('#psheet').style.setProperty('--tint', `var(--t-${cat})`);
  sz.style.setProperty('--n', ids.length);
  sz.innerHTML = '<i class="ind" aria-hidden="true"></i>' + ids.map(id => `<button class="size" role="radio" data-pick="${id}"><b>${P[id].opt}</b><small>${P[id].soldOut ? 'Sold out' : R(unit(id))}</small></button>`).join('');
  $('#psArt').innerHTML = art(pre); $('#psArt').style.visibility = '';
  renderProduct();
  $('#psScrim').classList.add('show'); $('#psheet').classList.add('show');
  if (!reduced.matches) $('#psArt').animate([{ transform: 'translate3d(0,40px,0) scale(.82)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 640, delay: 90, easing: 'cubic-bezier(.34,1.3,.64,1)', fill: 'backwards' });
  ovPush();
  setTimeout(() => { if (ps) $('#psSizes .size.on')?.focus({ preventScroll: true }); }, 80);
}
function closeProduct(fromPop) {
  if (!ps) return;
  if (fromPop !== true) ovPop();
  ps = null; $('#psScrim').classList.remove('show');
  const s = $('#psheet'); s.classList.remove('show'); s.style.transform = '';
}
function renderProduct() {
  if (!ps) return;
  const { cat, sel, qty } = ps, p = P[sel], ids = idsOf(cat), have = S.cart[sel];
  $('#psTitle').textContent = CATS[cat].name;
  $('#psTag').innerHTML = tagHTML(p);
  $('#psSub').textContent = p.was ? `${p.sub}. You save ${R(p.was - p.price)}.` : p.sub;
  $('#psSizes').style.setProperty('--i', ids.indexOf(sel));
  $$('#psSizes .size').forEach(b => { const on = b.dataset.pick === sel, q = P[b.dataset.pick]; b.classList.toggle('on', on); b.classList.toggle('out', !!q.soldOut); b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; b.setAttribute('aria-label', `${q.name}, ${q.soldOut ? 'sold out' : R(unit(b.dataset.pick))}`); $('small', b).textContent = q.soldOut ? 'Sold out' : R(unit(b.dataset.pick)); });
  $('#psMeta').innerHTML = `<span>${S.when === 'today' ? I.bolt : I.clock}${whenLine()}</span>`
    + `<span class="y">${I.sparkle}${S.member ? `Bloc+ price, ${Math.round(PLUS.discount * 100)}% off already taken` : `<span><b>${R(mp(p.price))}</b> with Bloc+</span>`}</span>`
    + (have ? `<span>${I.bag}<span><b>${have}</b> already in your basket</span></span>` : '');
  $('#psQty').textContent = qty;
  const c = $('#psCta'); c.disabled = !!p.soldOut;
  c.innerHTML = p.soldOut ? 'Sold out today' : `<span>Add${qty > 1 ? ' ' + qty : ''}</span><span class="sep">·</span><span>${R(r2(unit(sel) * qty))}</span>`;
  c.setAttribute('aria-label', p.soldOut ? 'Sold out today' : `Add ${qty} ${title(sel)} to your basket, ${R(r2(unit(sel) * qty))}`);
}
function psPick(id) {
  if (!ps) return;
  if (P[id].soldOut) { buzz(); return toast(`${P[id].name} is sold out today. It’s back tomorrow morning.`); }
  if (id === ps.sel) return;
  const same = art(id) === art(ps.sel), box = $('#psArt');
  ps.sel = id; ps.qty = 1; buzz();
  if (!same) box.innerHTML = art(id);
  if (!reduced.matches) box.animate(same ? [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }] : [{ transform: 'scale(.86) rotate(-5deg)', opacity: .3 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.34,1.45,.64,1)' });
  renderProduct();
}
function psAdd() {
  if (!ps || P[ps.sel].soldOut) return;
  const { sel, qty } = ps, from = $('#psArt');
  S.cart[sel] = (S.cart[sel] || 0) + qty; save();
  fly(from, basketPoint());
  if (!reduced.matches) from.style.visibility = 'hidden'; // the art lifts out of the sheet rather than leaving with it
  closeProduct(); renderAll();
}
function quickAdd(id, b) {
  if (P[id].soldOut) return toast(`${P[id].name} is sold out today.`);
  S.cart[id] = (S.cart[id] || 0) + 1; buzz(); save();
  fly(b.closest('.bloc')?.querySelector('.bart'), basketPoint());
  renderAll();
  bump($(`.bloc .badd[data-quick="${id}"]`)?.parentElement.querySelector('.bcount'));
}

function renderPayrows() {
  const [b, l] = PAY[S.pay];
  $$('.payrow').forEach(r => { r.innerHTML = `${b}<span class="pl">${l}</span><span class="pc">${I.chev}</span>`; });
}
function renderCheckout() {
  const joining = S.join && !S.member, eff = S.member || joining;
  const t = totals(eff), base = totals(false), fee = joining ? PLUS.fee : 0, grand = r2(t.total + fee), a = place();
  const rows = Object.entries(S.cart).map(([id, q]) => {
    let note = `${R(unit(id, eff))} each`;
    if (eff && id === PLUS.bogo) note = q % 2 ? '<span class="free">Add one more, it’s free</span>' : '<span class="free">Buy one, get one free</span>';
    return `<div class="item"><span class="ia" style="${tint(id)}">${art(id)}</span><span class="it"><b>${title(id)}</b><span>${note}</span></span><span class="stepper"><button class="tap" data-dec="${id}" aria-label="${q === 1 ? 'Remove' : 'One less'} ${title(id)}">${q === 1 ? I.trash : I.minus}</button><span aria-label="Quantity">${q}</span><button class="tap" data-inc="${id}" aria-label="One more ${title(id)}">${I.plus}</button></span></div>`;
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
  L.push(`<div class="tot"><span>Total</span><b>${R(grand)}</b></div>`);
  $('#coBody').innerHTML = `<div class="co">
    <div class="card"><button class="row" data-act="addr"><span class="ri">${I[a?.i] || I.pin}</span><span class="rx"><b>${esc(a?.t || 'Add a delivery place')}</b><small>${esc(a?.s || '')}</small></span><span class="chg">Change</span></button><button class="row" data-act="when"><span class="ri">${S.when === 'today' ? I.bolt : I.clock}</span><span class="rx"><b>${S.when === 'today' ? `Today, by ${etaT(CONFIG.etaMins)}` : 'Tomorrow, 8–10am'}</b><small>${S.when === 'today' ? 'Same-day delivery' : 'Before your first class'}</small></span><span class="chg">Change</span></button></div>
    <div class="card">${rows}</div>${quick ? `<div class="qh">Add to your basket</div><div class="hs qadd">${quick}</div>` : ''}${up}
    <div class="card sum">${L.join('')}</div><p class="fine">Demo checkout. No real payment is taken.</p></div>`;
  $('#coCta').innerHTML = `<span>Place order</span><span class="sep">·</span><span>${R(grand)}</span>`;
}
function renderOrders(first) {
  const a = S.active, past = $('#ordPast');
  setHTML($('#ordUp'), a
    ? `<button class="livecard tap" data-act="track">${miniRing(true)}<span class="lx"><small class="lt">On the way</small><b class="lel">Arriving soon</b><span>${label(a.items)} · ${R(a.total)}</span></span>${I.chev}</button>`
    : `<div class="empty"><span class="ei">${I.bag}</span><b>Nothing on the way</b><p>Your next delivery shows up here, live.</p><button class="pill tap" data-tab="home">Order essentials</button></div>`);
  if (a) paintLive();
  const rows = () => S.orders.length
    ? `<div class="card olist">${S.orders.map((o, i) => { const f = Object.keys(o.items).find(id => P[id]); return `<div class="row orow rise" style="--i:${i}"><span class="oi" style="${f ? tint(f) : ''}">${f ? art(f) : ''}</span><span class="rx"><b>${label(o.items)}</b><small>${dstr(o.date)} · ${R(o.total)}</small></span><button class="pill tap" data-reorder="${o.id}">Reorder</button></div>`; }).join('')}</div>`
    : `<div class="empty"><span class="ei">${I.receipt}</span><b>No past orders yet</b><p>Once something’s delivered, you can reorder it in one tap.</p></div>`;
  if (first && !renderOrders.seen && S.orders.length) {
    renderOrders.seen = true;
    past.__h = null;
    past.innerHTML = `<div class="card olist">${[0, 1].map(() => '<div class="row"><i class="sk" style="width:52px;height:52px;border-radius:16px"></i><span class="rx" style="display:grid;gap:8px"><i class="sk" style="height:12px;width:70%"></i><i class="sk" style="height:12px;width:40%"></i></span></div>').join('')}</div>`;
    setTimeout(() => setHTML(past, rows()), 450);
  } else setHTML(past, rows().replace(/ rise"/g, '"'));
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
  const names = Object.values(S.places).map(p => p.label).join(' and ') || 'None yet', name = user.name || firstName();
  const groups = [
    [[I.sparkle, 'Bloc+ membership', S.member ? `Active, R${PLUS.fee} a month` : 'Not a member yet', 'plus'], [I.pin, 'Saved places', names, 'places'], [I.card, 'Payment methods', PAY[S.pay][1], 'pay']],
    [[I.gift, 'Invite friends', 'You both get R20 off', 'invite'], [I.moon, 'Appearance', THEMES[theme], 'theme'], [I.help, 'Help', 'Chat to the Bloc team', 'help']],
    [[I.logout, 'Sign out', user.email, 'signout'], [I.reset, 'Reset demo data', 'Clear orders and savings on this device', 'reset', 'danger']],
  ];
  $('#accBarT').textContent = name;
  setHTML($('#accBody'), `<div class="prof"><div class="avatar ${S.member ? 'plus' : ''}" aria-hidden="true">${esc(initials())}</div><h1>${esc(name)}</h1><span class="plan">${S.member ? `<span class="badge-y">${I.sparkle}Bloc+</span>` : 'Free plan'}</span></div>
    <div class="stats"><button class="stat tap" data-act="plus"><small>Saved with Bloc+</small><b class="${S.saved ? 'g' : ''}">${R(S.saved)}</b></button><button class="stat tap" data-tab="orders"><small>Orders</small><b>${S.orders.length + (S.active ? 1 : 0)}</b></button></div>
    ${groups.map(g => `<div class="glist">${g.map(([i, t, s, a, cls]) => `<button class="row ${cls || ''}" data-act="${a}"><span class="ri">${i}</span><span class="rx"><b>${t}</b><small>${esc(s)}</small></span><span class="rc">${I.chev}</span></button>`).join('')}</div>`).join('')}
    <p class="mode">${auth.mode === 'firebase' ? 'Signed in with Firebase' : 'Demo account, stored on this device'}</p><div class="spacer"></div>`);
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
/* the island: three tabs, and on the right whatever matters now, the basket or the order on its way */
function renderIsland() {
  const isl = $('#island'), c = $('#ictx'), n = cartCount(), a = S.active;
  const mode = n ? 'cart' : a ? 'live' : '';
  let html = '';
  if (mode === 'cart') { const t = totals(S.member); html = `<span class="n">${n}</span><span class="t"><small>Basket</small><b>${R(r2(t.sub - t.disc))}</b></span>${I.chev}`; }
  else if (mode === 'live') html = `${miniRing(true)}<span class="t"><small class="lt">On the way</small><b class="le">Soon</b></span>${I.chev}`;
  if (html) setHTML(c, html);
  c.classList.toggle('live', mode === 'live');
  c.dataset.act = mode === 'cart' ? 'cart' : 'track';
  c.tabIndex = mode ? 0 : -1;
  c.setAttribute('aria-hidden', String(!mode));
  c.setAttribute('aria-label', mode === 'cart' ? `Basket, ${n} item${n > 1 ? 's' : ''}` : 'Track your order');
  isl.classList.toggle('wide', !!mode);
  if (mode === 'live') paintLive();
}
function renderAll() {
  if (!user) return;
  renderHome(); renderOrders(); renderAccount(); renderPayrows(); chrome();
  if (ps) renderProduct();
  if (stack.includes('checkout')) renderCheckout();
  save();
}

/* ---------- pickers: address, payment, time, appearance, confirm ---------- */
let pk = null, pkConfirm = null, adding = false;
function openPicker(kind, opts) { const was = pk; pk = kind; pkConfirm = opts || null; adding = false; renderPicker(); $('#pscrim').classList.add('show'); $('#picker').classList.add('show'); if (!was) ovPush(); setTimeout(() => $('#picker button, #picker input')?.focus({ preventScroll: true }), 60); }
function closePicker(fromPop) { if (!pk) return; if (fromPop !== true) ovPop(); pk = null; $('#pscrim').classList.remove('show'); const p = $('#picker'); p.classList.remove('show'); p.style.transform = ''; }
function renderPicker() {
  const head = (t, s = '') => `<h3 id="pkTitle">${t}</h3>${s ? `<p>${s}</p>` : ''}`;
  const row = (attr, k, icon, b, s, on) => `<button class="row" ${attr}="${k}"><span class="ri">${icon}</span><span class="rx"><b>${b}</b>${s ? `<small>${s}</small>` : ''}</span>${on ? `<span class="rk">${I.check}<span class="sr">Selected</span></span>` : ''}</button>`;
  let h = '', b = '';
  if (pk === 'addr') {
    h = head('Deliver to');
    b = `<div class="group">${Object.entries(S.places).map(([k, a]) => row('data-addr', k, I[a.i] || I.pin, esc(a.t), esc(a.s), k === S.addr)).join('')}${adding ? '' : row('data-act', 'addPlace', I.plus, 'Add a place', 'Library, a friend’s res, the gym', false)}</div>`
      + (adding ? `<form id="placeForm" novalidate><label class="field"><span>Name this place</span><input name="label" placeholder="e.g. Library, Gym" autocapitalize="words"></label><label class="field"><span>Address or meeting point</span><input name="addr" placeholder="Building, entrance or room" autocapitalize="words"></label><p class="ferr" id="placeErr" role="alert" style="margin:0"></p><button class="cta" type="submit">Save place</button></form>` : '');
  } else if (pk === 'pay') {
    h = head('Pay with', 'Demo mode. No real payments are made.');
    b = `<div class="group">${Object.entries(PAY).map(([k, [badge, l, s]]) => row('data-pay', k, badge, l, s, k === S.pay)).join('')}</div>`;
  } else if (pk === 'when') {
    h = head('When should it arrive?');
    b = `<div class="group">${row('data-when', 'today', I.bolt, 'Today, same day', `At your door by ${etaT(CONFIG.etaMins)}`, S.when === 'today')}${row('data-when', 'tomorrow', I.clock, 'Tomorrow morning', 'Between 8 and 10am, before class', S.when === 'tomorrow')}</div>`;
  } else if (pk === 'theme') {
    h = head('Appearance');
    b = `<div class="group">${Object.entries(THEMES).map(([k, l]) => row('data-theme', k, k === 'dark' ? I.moon : k === 'light' ? I.sun : I.device, l, '', k === theme)).join('')}</div>`;
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
function openCart() { if (!cartCount()) return toast('Your basket is empty. Tap + on something to add it.'); push('checkout'); }
function deal(k) {
  if (k === 'break') return openProduct('bundles', 'bBreak');
  if (k === 'tray') return openProduct('eggs', 'eggs30');
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
  const b = rel(from, app), x = b.x + b.w / 2, y = b.y, cols = ['#FFC530', '#22A6F2', '#15161A', '#FFC530'];
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
    renderTrack(); hardStack(['home', 'track']); renderAll(); startTrack();
    setTimeout(() => proc(false), 60);
    if (joining) setTimeout(() => toast('Welcome to Bloc+. Your discount is already applied.'), 700);
  }, 1500);
}
function openTrack() { if (top() === 'track') return; if (!onTabs()) replace(['home']); push('track'); }

/* ---------- live tracking: the ring fills as the order travels ---------- */
const DUR = 30000, PACK = .12, NEAR = .8;
let trk = { raf: 0, t: 0 };
const minsLeft = t => Math.max(1, Math.round(14 * (1 - t)));
function renderTrack() {
  const o = S.active; if (!o) return;
  const a = S.places[o.addr] || place() || { t: 'Your res', s: '' };
  el('track').classList.remove('done');
  $('#trkScroll').scrollTop = 0;
  $('#trkBody').innerHTML = `<div class="thero">
      <div class="ring pack" id="tRing"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="rt0" cx="60" cy="60" r="52"/><circle class="rt1" id="tArc" cx="60" cy="60" r="52" pathLength="100"/><g id="tHead"><circle class="rhead" cx="112" cy="60" r="6.5"/></g></svg>
        <div class="rin"><b id="tMin">14</b><span>min</span></div></div>
      <h1 id="tEta">Packing your order</h1><p id="tSub">At your door by ${o.eta}</p></div>
    <ol class="tsteps" id="tSteps">
      <li class="done"><i></i><span><b>Order placed</b><small>${fmtT(o.date)} · ${R(o.total)}</small></span></li>
      <li class="now"><i></i><span><b>Packed at the Bloc hub</b><small>Hatfield, 1.2 km away</small></span></li>
      <li><i></i><span><b>On the way</b><small>${COURIER.first}, by scooter</small></span></li>
      <li><i></i><span><b>At your door</b><small>${esc(a.t)}</small></span></li>
    </ol>`;
  $('#trkMore').innerHTML = `<div class="tcard courier"><div class="av">${COURIER.initials}<small>${I.star}${COURIER.rating}</small></div><div class="ct"><b>${COURIER.name}</b><span>${COURIER.ride}</span></div><button class="rbtn tap" data-act="msg" aria-label="Message ${COURIER.first}">${I.chat}</button><button class="rbtn tap" data-act="call" aria-label="Call ${COURIER.first}">${I.phone}</button></div>
    <div class="tcard pinrow"><span>Delivery PIN<small>Share it with ${COURIER.first} at the door</small></span><span class="pinbox" aria-label="PIN ${o.pin.split('').join(' ')}">${[...o.pin].map(d => `<b>${d}</b>`).join('')}</span></div>
    <div class="tcard"><div class="osh"><span>Your order</span><span>${R(o.total)}</span></div><div class="osi">${label(o.items)}</div><div class="osa">${I.pin}${esc(a.t)}${a.s ? ', ' + esc(a.s) : ''}</div></div>
    <div style="height:48px"></div>`;
}
function startTrack() {
  cancelAnimationFrame(trk.raf);
  const rp = $('#mapTrk .route:not(.base)'), L = rp.getTotalLength();
  // distance to each corner, so the courier slows into a turn and speeds out of it
  const cuts = [0]; ROUTE_PTS.slice(1).forEach((p, i) => cuts.push(cuts[i] + Math.hypot(p[0] - ROUTE_PTS[i][0], p[1] - ROUTE_PTS[i][1])));
  trk = { t0: performance.now(), raf: 0, t: 0, stage: -1, mins: -1, rp, L, cuts, ang: 180 };
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
// the words for where the order is: short for the island, long for the screens
const liveWords = t => t < PACK ? ['Packing', 'Packing your order'] : t < NEAR ? ['On the way', `${COURIER.first} is on the way`] : ['Almost there', `${COURIER.first} is almost there`];
function paintLive(t = trk.t || 0) {
  const pct = (t * 100).toFixed(2) + ' 100', m = minsLeft(t), [short] = liveWords(t);
  $$('.m1[data-live]').forEach(c => { c.style.strokeDasharray = pct; });
  $$('.le').forEach(n => { n.textContent = `${m} min`; });
  $$('.lel').forEach(n => { n.textContent = `Arriving in ${m} min`; });
  $$('.lt').forEach(n => { n.textContent = short; });
  const me = $('#mapEta');
  if (mapFull && me) setHTML(me, `<b>${m} min</b><span>${liveWords(t)[1]}<br>At your door by ${S.active?.eta || ''}</span>`);
}
function updateTrack(t) {
  const u = Math.max(0, (t - PACK) / (1 - PACK)), { rp, L } = trk, d = distAt(u), pt = rp.getPointAtLength(d), ahead = rp.getPointAtLength(Math.min(L, d + 3));
  if (d < L - 1) { const target = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI + 90; let diff = ((target - trk.ang + 540) % 360) - 180; trk.ang += diff * .18; }
  $('#rider').setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
  $('#riderNose').setAttribute('transform', `rotate(${trk.ang.toFixed(1)})`);
  rp.style.strokeDasharray = `${L} ${L}`; rp.style.strokeDashoffset = -d;
  const arc = $('#tArc');
  if (arc) { arc.style.strokeDasharray = `${(t * 100).toFixed(2)} 100`; $('#tHead').style.transform = `rotate(${(t * 360).toFixed(1)}deg)`; }
  $$('.m1[data-live]').forEach(c => { c.style.strokeDasharray = `${(t * 100).toFixed(2)} 100`; });
  const stage = t < PACK ? 0 : t < NEAR ? 1 : 2, mins = minsLeft(t);
  if (mins !== trk.mins || stage !== trk.stage) {
    trk.mins = mins;
    const m = $('#tMin'); if (m) m.textContent = mins;
    paintLive(t);
  }
  if (stage !== trk.stage) {
    const first = trk.stage < 0; trk.stage = stage;
    $('#tRing')?.classList.toggle('pack', !stage);
    const e = $('#tEta'); if (e) e.textContent = liveWords(t)[1];
    const sb = $('#tSub'); if (sb && stage === 2) sb.textContent = 'Meet them at the res entrance';
    $$('#tSteps li').forEach((li, i) => { li.classList.toggle('done', i < stage + 1); li.classList.toggle('now', i === stage + 1); });
    if (!first && stage === 1) liveNote(`${COURIER.first} picked up your order.`);
    if (!first && stage === 2) liveNote(`${COURIER.first} is 2 minutes away. Meet at the res entrance.`);
  }
  if (noteLive) updateLive(t);
}
function updateLive(t) {
  const u = Math.max(0, (t - PACK) / (1 - PACK)), e = $('#nlEta'), bar = $('#nlBar'), knob = $('#nlKnob');
  if (!e) return;
  e.textContent = t < PACK ? 'Packing your order' : `Arriving in ${minsLeft(t)} min`;
  bar.style.transform = `scaleX(${u})`;
  knob.style.transform = `translateX(${(u * (bar.offsetWidth || 0)).toFixed(1)}px)`;
}
function finishTrack() {
  const o = S.active; if (!o) return;
  S.orders.unshift({ ...o }); S.active = null;
  const a = S.places[o.addr] || { t: 'your res' };
  mapClose(true);
  el('track').classList.add('done');
  $('#trkBody').innerHTML = `<div class="thero"><div class="ring done"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="rt0" cx="60" cy="60" r="52"/><circle class="rt1" cx="60" cy="60" r="52" pathLength="100" style="stroke-dasharray:100 100"/></svg><div class="rin">${I.check}</div></div><h1>Delivered</h1><p>${COURIER.first} left it at ${esc(a.t)}. Enjoy.</p></div>
    <p class="rq">How was ${COURIER.first}?</p><div class="stars" role="radiogroup" aria-label="Rate ${COURIER.first}">${[1, 2, 3, 4, 5].map(i => `<button role="radio" aria-checked="false" data-star="${i}" aria-label="${i} star${i > 1 ? 's' : ''}">${I.star}</button>`).join('')}</div>
    <div class="dbtns"><button class="cta" data-act="done">Done</button><button class="tlink" data-reorder="${o.id}">Order this again</button></div>`;
  $('#trkScroll').scrollTop = 0;
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
  // progress is the ring from the wordmark, filling a quarter per question
  $('#suRing').innerHTML = n > 1 ? '<svg viewBox="0 0 44 44"><circle class="s0" cx="22" cy="22" r="19"/><circle class="s1" cx="22" cy="22" r="19" pathLength="100" style="stroke-dasharray:0 100"/></svg><b></b>' : '';
  $('#suFine').hidden = mode !== 'signup';
  $('#s-signup [data-back]').style.visibility = mode === 'place' ? 'hidden' : '';
  renderSu();
}
function renderSu() {
  const n = su.steps.length, cur = su.steps[su.i];
  $('#suTrack').style.transform = `translate3d(${-su.i * (100 / n)}%,0,0)`;
  const ring = $('#suRing .s1');
  if (ring) { requestAnimationFrame(() => { ring.style.strokeDasharray = `${((su.i + 1) / n * 100).toFixed(1)} 100`; }); $('#suRing b').textContent = su.i + 1; }
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
  homeIntro = true; replace(['home']); renderAll();
}
async function signOut() {
  cancelAnimationFrame(trk.raf);
  if (S.active) { S.orders.unshift(S.active); S.active = null; }
  save(); await auth.logOut().catch(() => {});
  user = null; S = blank(); hideNote(); closePicker(true);
  liForm.reset(); replace(['welcome']);
}
// onboarding slides
const ob = $('#ob');
let obI = 0;
function obGo(i) { obI = i; ob.scrollTo({ left: i * ob.clientWidth, behavior: reduced.matches || !i ? 'auto' : 'smooth' }); obUI(); }
function obUI() { $$('#obDots i').forEach((d, i) => d.classList.toggle('on', i === obI)); $('#obBtn').textContent = obI === 2 ? 'Start shopping' : 'Next'; }
ob.addEventListener('scroll', () => { const i = Math.round(ob.scrollLeft / ob.clientWidth); if (i !== obI) { obI = i; obUI(); } }, { passive: true });
function obDone() { S.onboarded = true; save(); homeIntro = true; replace(['home']); renderAll(); }

/* ---------- events ---------- */
app.addEventListener('click', e => {
  const b = e.target.closest('button,[data-act]');
  if (!b || !app.contains(b) || b.disabled) return;
  const d = b.dataset;
  if ('back' in d) return top() === 'signup' ? suBack() : back();
  if (d.tab) return setTab(d.tab);
  if (d.cat) return openProduct(d.cat);
  if (d.pick) return psPick(d.pick);
  if (d.quick) return quickAdd(d.quick, b);
  if (d.addr) { S.addr = d.addr; buzz(); renderAll(); if (pk) { renderPicker(); setTimeout(closePicker, 180); } return; }
  if (d.inc) { S.cart[d.inc]++; buzz(); return renderAll(); }
  if (d.dec) {
    if (--S.cart[d.dec] <= 0) delete S.cart[d.dec];
    buzz();
    if (!cartCount()) { back(); toast('Your basket is empty.'); }
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
    case 'psclose': return closeProduct();
    case 'psadd': return psAdd();
    case 'qinc': if (ps) { ps.qty = Math.min(9, ps.qty + 1); buzz(); renderProduct(); } return;
    case 'qdec': if (ps && ps.qty > 1) { ps.qty--; buzz(); renderProduct(); } return;
    case 'cart': return openCart();
    case 'place': return placeOrder();
    case 'track': return openTrack();
    case 'mapOpen': return mapOpen();
    case 'mapClose': return mapClose();
    case 'recenter': return trkMap.recenter();
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
    case 'reset': return openPicker('confirm', { title: 'Reset demo data?', body: 'This clears your basket, orders, savings and Bloc+ status on this device. Your account stays.', ok: 'Reset', danger: true, run: () => { cancelAnimationFrame(trk.raf); const keep = { places: S.places, addr: S.addr, onboarded: true }; S = { ...blank(), ...keep }; renderAll(); setTab('home'); toast('Demo data cleared.'); } });
  }
});
// arrow keys move between sizes, like any radio group
$('#psSizes').addEventListener('keydown', e => {
  if (!ps || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const ids = idsOf(ps.cat).filter(id => !P[id].soldOut), i = ids.indexOf(ps.sel), n = ids[(i + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
  e.preventDefault(); psPick(n); $(`#psSizes [data-pick="${n}"]`).focus();
});
suForm.addEventListener('submit', suNext);
liForm.addEventListener('submit', doLogin);
$$('.field input').forEach(i => i.addEventListener('input', () => i.closest('.field').classList.remove('bad')));
$('#calcN').addEventListener('input', calc);
// large titles scroll away and a compact bar takes over
$$('.screen.tab').forEach(s => { const sc = $('.scroll', s); sc.addEventListener('scroll', () => s.classList.toggle('scrolled', sc.scrollTop > 64), { passive: true }); });
addEventListener('keydown', e => { if (e.key === 'Escape' && stack.length) back(); });
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
  s.onload = () => { const g = window.qrcode(0, 'M'); g.addData('https://getbloc.vercel.app/get'); g.make(); $('#qr').innerHTML = g.createSvgTag({ cellSize: 3, margin: 2, scalable: true }); };
  document.head.appendChild(s);
}

renderStatic();
trkMap = MapView($('#mapTrk'), mapPad);
dismissable($('#picker'), '.gr,.pkh', closePicker);
dismissable($('#psheet'), '.pshero', closeProduct);
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
if (who) { load(who); if (!Object.keys(S.places).length) { hardStack(['signup']); startSignup('place'); } else if (!S.onboarded) { hardStack(['onboard']); } else { homeIntro = true; hardStack(['home']); renderAll(); } }
else hardStack(['welcome']);
await minSplash;
hideSplash();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
