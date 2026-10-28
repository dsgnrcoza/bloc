// Icons, the Bloc wordmark and the soft-3D product illustrations. Shared by the app, the share image and the app icons.

/* ---------- icons: solid glyphs for navigation, rows and state; 2.25px strokes only for search, arrows and controls ---------- */
const ic = d => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d.startsWith('<') ? d : `<path d="${d}"/>`}</svg>`;
const solid = d => `<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${d}</svg>`;
const I = {
  tHome: solid('<path d="M11.3 2.7a1.1 1.1 0 0 1 1.4 0l8.4 7.1c.3.2.4.5.4.9V20a1.5 1.5 0 0 1-1.5 1.5h-4.6v-6.3H8.6v6.3H4A1.5 1.5 0 0 1 2.5 20v-9.3c0-.4.1-.7.4-.9z"/>'),
  tShop: solid([5, 12, 19].map(y => [5, 12, 19].map(x => `<circle cx="${x}" cy="${y}" r="2.3"/>`).join('')).join('')),
  tAct: solid('<path fill-rule="evenodd" d="M6 2.5h12a1 1 0 0 1 1 1V21l-3.5-2-3.5 2-3.5-2L5 21V3.5a1 1 0 0 1 1-1zM8.5 7.2v2h7v-2zm0 4.2v2h7v-2z"/>'),
  tUser: solid('<circle cx="12" cy="7.5" r="4.5"/><path d="M3.5 20.2C4.3 15.9 7.7 13.5 12 13.5s7.7 2.4 8.5 6.7c.1.7-.4 1.3-1.1 1.3H4.6c-.7 0-1.2-.6-1.1-1.3z"/>'),
  home: solid('<path d="M11.3 2.7a1.1 1.1 0 0 1 1.4 0l8.4 7.1c.3.2.4.5.4.9V20a1.5 1.5 0 0 1-1.5 1.5h-4.6v-6.3H8.6v6.3H4A1.5 1.5 0 0 1 2.5 20v-9.3c0-.4.1-.7.4-.9z"/>'),
  book: solid('<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H7.5a1 1 0 0 0 0 2H19a1 1 0 1 1 0 2H7.5A2.5 2.5 0 0 1 5 20z"/>'),
  pin: solid('<path fill-rule="evenodd" d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.2 6 11 6.7 11.6a1.2 1.2 0 0 0 1.6 0c.7-.6 6.7-6.4 6.7-11.6A7.5 7.5 0 0 0 12 2zm0 10.3a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z"/>'),
  search: ic('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  clock: solid('<path fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zM11 7v5.6l4.2 2.5 1-1.7-3.2-1.9V7z"/>'),
  chev: ic('m9.5 6 6 6-6 6'),
  down: ic('m6 9.5 6 6 6-6'),
  back: ic('M19 12H5.5M11 6l-6 6 6 6'),
  close: ic('M6.5 6.5l11 11M17.5 6.5l-11 11'),
  expand: ic('M14 4.5h5.5V10M10 19.5H4.5V14M19.5 4.5l-6 6M4.5 19.5l6-6'),
  plus: ic('M12 5.5v13M5.5 12h13'),
  minus: ic('M5.5 12h13'),
  trash: ic('M5 7h14M9.5 7V5h5v2M7 7l1 12.5h8L17 7'),
  phone: solid('<path d="M5 2.8h2.6a1 1 0 0 1 1 .74l.95 3.6a1 1 0 0 1-.35 1.05L7.6 9.4a12 12 0 0 0 7 7l1.2-1.6a1 1 0 0 1 1.05-.35l3.6.95a1 1 0 0 1 .74 1V19a2.2 2.2 0 0 1-2.4 2.2A17 17 0 0 1 2.8 5.2 2.2 2.2 0 0 1 5 2.8z"/>'),
  chat: solid('<path d="M6 4h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 17H9.5l-4.1 3.3a.9.9 0 0 1-1.4-.7V6.5A2.5 2.5 0 0 1 6 4z"/>'),
  check: ic('m5 12.5 4.5 4.5L19 7.5'),
  bolt: solid('<path d="M13.6 2.2a.6.6 0 0 1 1 .5L13.4 10h5.4a.6.6 0 0 1 .5 1l-8.9 10.8a.6.6 0 0 1-1-.5l1.2-7.3H5.2a.6.6 0 0 1-.5-1z"/>'),
  tag: solid('<path fill-rule="evenodd" d="M3 3.8a.8.8 0 0 1 .8-.8h7.6a1 1 0 0 1 .7.3l8.8 8.8a1 1 0 0 1 0 1.4l-7.6 7.6a1 1 0 0 1-1.4 0L3.3 12.3a1 1 0 0 1-.3-.7zM8 9.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z"/>'),
  star: solid('<path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/>'),
  moon: solid('<path d="M20.4 14.6a.8.8 0 0 0-1.1-.9A7 7 0 0 1 10.3 4.7a.8.8 0 0 0-.9-1.1A9 9 0 1 0 20.4 14.6z"/>'),
  sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
  device: ic('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  gift: solid('<path d="M7.8 3.2c1.6-.6 3.2.4 4.2 2.1 1-1.7 2.6-2.7 4.2-2.1 1.5.6 1.7 2.6.6 3.8h3.7a1 1 0 0 1 1 1V10a1 1 0 0 1-1 1H13V7h-2v4H3.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3.7c-1.1-1.2-.9-3.2.6-3.8zM4 12.5h7V21H5a1 1 0 0 1-1-1zm9 0h7V20a1 1 0 0 1-1 1h-6z"/>'),
  help: solid('<path fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zm0 13.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm.1-9.6c-2 0-3.5 1.2-3.7 3.1l2 .3c.1-.9.7-1.5 1.6-1.5 1 0 1.6.6 1.6 1.4 0 .7-.4 1.1-1.2 1.6-.9.6-1.4 1.2-1.4 2.4v.6h2v-.4c0-.6.3-.9 1-1.4 1-.6 1.7-1.4 1.7-2.8 0-2-1.5-3.3-3.6-3.3z"/>'),
  reset: ic('M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15'),
  card: solid('<path fill-rule="evenodd" d="M4.5 4.5h15A2.5 2.5 0 0 1 22 7v1.5H2V7a2.5 2.5 0 0 1 2.5-2.5zM2 10.5h20V17a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17zm3 4.5v2h5v-2z"/>'),
  wallet: solid('<path fill-rule="evenodd" d="M5.5 3.5H17a1.5 1.5 0 0 1 1.5 1.5v1.5h1A2.5 2.5 0 0 1 22 9v9.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5V7a3.5 3.5 0 0 1 3.5-3.5zm0 2A1.5 1.5 0 0 0 4 7v.1c.4-.4 1-.6 1.6-.6h10.9V5.5zM16.5 12a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z"/>'),
  receipt: solid('<path fill-rule="evenodd" d="M6 2.5h12a1 1 0 0 1 1 1V21l-3.5-2-3.5 2-3.5-2L5 21V3.5a1 1 0 0 1 1-1zM8.5 7.2v2h7v-2zm0 4.2v2h7v-2z"/>'),
  sparkle: solid('<path d="M12 2.5c.4 0 .7.3.8.6l1.6 5.3 5.3 1.6a.8.8 0 0 1 0 1.6l-5.3 1.6-1.6 5.3a.8.8 0 0 1-1.6 0l-1.6-5.3-5.3-1.6a.8.8 0 0 1 0-1.6l5.3-1.6 1.6-5.3c.1-.3.4-.6.8-.6z"/>'),
  bag: solid('<path fill-rule="evenodd" d="M8 7.5V7a4 4 0 0 1 8 0v.5h2.6a1 1 0 0 1 1 .92l1 12A1.5 1.5 0 0 1 19.1 22H4.9a1.5 1.5 0 0 1-1.5-1.62l1-12a1 1 0 0 1 1-.88zm2 0h4V7a2 2 0 0 0-4 0z"/>'),
  logout: ic('M14 4.5h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H14M10 8l-4 4 4 4M6 12h10'),
  eye: ic('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: ic('M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.6 3.4M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2'),
  wifiOff: ic('M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.6a10 10 0 0 1 4-2.3M14.9 10.3A10 10 0 0 1 19 12.6M2 9a15 15 0 0 1 4.2-2.6M10.5 5.6A15 15 0 0 1 22 9M12 20h.01'),
  scooter: ic('<circle cx="6" cy="17" r="2.6"/><circle cx="18.5" cy="17" r="2.6"/><path d="M8.6 17h6.8l2.4-8.5H20M3 13.5h7l1.2 3.5"/><path d="M3.5 7h6v4.5h-6z"/>'),
  locate: solid('<path d="M20.6 3.4a.8.8 0 0 1 .2.9l-7 16.3a.8.8 0 0 1-1.5-.1l-1.6-6.3-6.3-1.6a.8.8 0 0 1-.1-1.5l16.3-7a.8.8 0 0 1 .9.2z"/>'),
  google: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>',
};

/* ---------- wordmark: B L (ring) C, rebuilt as strokes so it can draw in ---------- */
const WM = (c = '') => `<svg class="wm ${c}" viewBox="6 6 212 68" role="img" aria-label="Bloc"><g fill="none" stroke-width="11"><path class="wa b1" pathLength="100" stroke-linecap="square" d="M18 62.5V17.5H34A11.25 11.25 0 0 1 34 40H18M18 40H36A11.25 11.25 0 0 1 36 62.5H18"/><path class="wa b2" pathLength="100" stroke-linecap="square" d="M66.5 17.5V62.5H86"/><circle class="wo b3" pathLength="100" cx="127.5" cy="40" r="22.5"/><circle class="warc b4" pathLength="100" cx="127.5" cy="40" r="22.5"/><path class="wc b5" pathLength="100" d="M207.4 24.1A22.5 22.5 0 1 0 207.4 55.9"/></g></svg>`;

/* ---------- illustrations: soft 3D, one light source (top left), shared gradients ---------- */
const CRUST = { w: ['#F8CB88', '#DE9A52', '#C27631', '#9A5620'], b: ['#D39A68', '#A96C3B', '#8A5229', '#643716'], s: ['#E9B575', '#C88D4E', '#A86F36', '#7E4D22'] };
const lin = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const rad = (id, stops, cx = .36, cy = .3, r = .85) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;
const DEFS = `<svg class="defs" aria-hidden="true" focusable="false"><defs>
<radialGradient id="aSh"><stop offset="0" stop-color="#0B1622" stop-opacity=".26"/><stop offset=".55" stop-color="#0B1622" stop-opacity=".1"/><stop offset="1" stop-color="#0B1622" stop-opacity="0"/></radialGradient>
<radialGradient id="aGl"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
${rad('aEgg', [[0, '#FFF7EC'], [.42, '#F4D9B8'], [1, '#C8946A']], .36, .28)}
${lin('aPulp', ['#EEE5D3', '#C9B590'])}${lin('aLid', ['#F5EFE2', '#D9C9A8'])}
${lin('aBlue', ['#4FC0F9', '#1590DA'])}${lin('aBlueD', ['#1A88CC', '#0E6CAA'])}
${lin('aWhite', ['#FFFFFF', '#E4EAF1'], 1, 0)}${lin('aSide', ['#CBD6E1', '#B0BFCE'], 1, 0)}
${rad('aCapY', [[0, '#FFE98A'], [1, '#DDA800']])}${rad('aCapB', [[0, '#BCE6FC'], [1, '#3FA6E6']])}
${Object.entries(CRUST).map(([v, c]) => rad('aDome' + v, [[0, c[0]], [.55, c[1]], [1, c[2]]], .38, .18, .95) + lin('aCrust' + v, [c[1], c[3]])).join('')}
${lin('aKraft', ['#EBD3A8', '#C49A5F'], .6, 1)}${lin('aKraftIn', ['#86633A', '#AD8150'])}
${rad('aYel', [[0, '#FFE58A'], [1, '#EDB400']], .35, .3, .9)}${rad('aRed', [[0, '#FF8D7D'], [.6, '#E5483A'], [1, '#B02A22']])}
${lin('aGreen', ['#86DFA6', '#2FA866'])}${lin('aInk', ['#3D4553', '#151A22'])}
</defs></svg>`;
const svg = b => `<svg viewBox="0 0 120 96" aria-hidden="true">${b}</svg>`;
const SH = (rx = 46) => `<ellipse cx="60" cy="86.5" rx="${rx}" ry="6.5" fill="url(#aSh)"/>`;
const egg = (x, y, s = 1) => `<ellipse cx="${x}" cy="${y}" rx="${11.5 * s}" ry="${14 * s}" fill="url(#aEgg)"/><ellipse cx="${x - 3.8 * s}" cy="${y - 6 * s}" rx="${3.4 * s}" ry="${4.8 * s}" fill="url(#aGl)"/>`;
const ringMark = (x, y, r, w) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="${w}"/><path d="M${x} ${y - r}a${r} ${r} 0 0 0-${(r * .95).toFixed(1)} ${(r * 1.3).toFixed(1)}" fill="none" stroke="#F6C915" stroke-width="${w}" stroke-linecap="round"/>`;
const ART = {
  eggs: () => svg(`${SH(48)}<path d="M24 50 31.4 21.2Q32.6 16.5 37.4 16.5h45.2q4.8 0 6 4.7L96 50z" fill="url(#aLid)"/><path d="M34 22h52" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/><rect x="45" y="27" width="30" height="13" rx="6.5" fill="url(#aBlue)"/><circle cx="51.5" cy="33.5" r="2.8" fill="#F6C915"/><rect x="57" y="32" width="12" height="3" rx="1.5" fill="#fff" opacity=".92"/>${egg(60, 47.5)}${egg(36, 51)}${egg(84, 51)}<path d="M15 57h90" stroke="#6E5835" stroke-opacity=".22" stroke-width="5" stroke-linecap="round"/><path d="M12 56h96l-5.6 24.2Q101.4 84.6 96.8 84.6H23.2q-4.6 0-5.6-4.4z" fill="url(#aPulp)"/><path d="M12 56h96l-1.1 4.6H13.1z" fill="#F8F2E7"/><path d="M28 67q8 9.5 16 0M52 67q8 9.5 16 0M76 67q8 9.5 16 0" stroke="#A8916A" stroke-opacity=".5" stroke-width="2.2" fill="none" stroke-linecap="round"/>`),
  bread: (v = 'w') => svg(`${SH(48)}<path d="M13 76V52.5C13 34.5 32 24 60 24s47 10.5 47 28.5V76q0 6.5-6.5 6.5h-81Q13 82.5 13 76z" fill="url(#aCrust${v})"/><path d="M17.5 52C17.5 37.5 35.5 29 60 29s42.5 8.5 42.5 23c0 5.5-3.8 8.6-10 8.6h-65c-6.2 0-10-3.1-10-8.6z" fill="url(#aDome${v})"/><g fill="none" stroke-linecap="round"><path d="M37 34.5l8 14M56 31.5l8 15M75 33.5l8 14" stroke="${CRUST[v][3]}" stroke-opacity=".5" stroke-width="5.4"/><path d="M37.5 35.2l7 12.2M56.5 32.2l7 13.2M75.5 34.2l7 12.2" stroke="${CRUST[v][0]}" stroke-width="2.2"/></g><ellipse cx="42" cy="35.5" rx="13" ry="3.4" transform="rotate(-13 42 35.5)" fill="url(#aGl)" opacity=".55"/>${v === 's' ? `<g fill="#F5E6C9">${[[30, 46], [47, 40], [66, 42], [88, 47], [57, 53], [77, 55], [40, 54], [24, 52]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.2" transform="rotate(32 ${x} ${y})"/>`).join('')}</g>` : ''}`),
  milk: (v = 'f') => svg(`<ellipse cx="62" cy="87" rx="34" ry="6" fill="url(#aSh)"/><g${v === 's' ? ' transform="translate(62 86) scale(.84) translate(-62 -86)"' : ''}><path d="M77 37 90 30v47.5L77 84z" fill="url(#aSide)"/><path d="M77 37 90 30 81.5 16.5 68.5 22.8z" fill="#C2CFDB"/><path d="M37 37h40l-8.5-14.2H45.5z" fill="#F5F8FB"/><path d="M45.5 22.8 44.6 16h24.2l-.3 6.8z" fill="#DCE4EC"/><rect x="37" y="37" width="40" height="47" rx="2.5" fill="url(#aWhite)"/><rect x="37" y="51" width="40" height="19" fill="url(#aBlue)"/><path d="M77 51 90 44.5v19L77 70z" fill="url(#aBlueD)"/><path d="M57 54.5c3 3.6 4.6 6.2 4.6 8.2a4.6 4.6 0 0 1-9.2 0c0-2 1.6-4.6 4.6-8.2z" fill="#fff"/><rect x="40" y="39" width="2.6" height="42" rx="1.3" fill="#fff" opacity=".9"/><ellipse cx="61.5" cy="28.5" rx="4.8" ry="4.5" fill="url(#aCap${v === 'l' ? 'B' : 'Y'})"/></g>`),
  bundle: () => svg(`${SH(46)}<g transform="rotate(15 78 34)"><rect x="66" y="7" width="23" height="48" rx="11.5" fill="url(#aCrustw)"/><path d="M70.5 17.5l14-4.6M70.5 27.5l14-4.6M70.5 37.5l14-4.6" stroke="#F8CB88" stroke-width="2.4" stroke-linecap="round"/></g>${egg(64, 40, .62)}<path d="M33 50V26l6.8-10.4h13.4L60 26v24z" fill="url(#aWhite)"/><rect x="33" y="29" width="27" height="9" fill="url(#aBlue)"/><ellipse cx="46.5" cy="21.5" rx="3.2" ry="3" fill="url(#aCapY)"/><path d="M25 41h70l-2.4 7H27.4z" fill="url(#aKraftIn)"/><path d="M22 45h76l-4.4 34.8Q93 84.4 88.4 84.4H31.6q-4.6 0-5.2-4.6z" fill="url(#aKraft)"/><path d="M22 45h76l-.6 5H22.6z" fill="#F2DEB9"/>${ringMark(60, 66.5, 8.5, 3.6)}`),
  coffee: () => svg(`${SH(30)}<path d="M42 31h36l-4.6 49.6Q73 84.6 69 84.6H51q-4 0-4.4-4z" fill="url(#aWhite)"/><path d="M43.5 46h33l-1.9 21H45.4z" fill="url(#aKraft)"/><rect x="38" y="23" width="44" height="10" rx="5" fill="url(#aInk)"/><path d="M45 18.5h30l2.6 5H42.4z" fill="#2B323D"/><rect x="47" y="35" width="2.4" height="44" rx="1.2" fill="#fff" opacity=".9"/>${ringMark(60, 56.5, 5, 2.4)}`),
  fruit: () => svg(`${SH(32)}<path d="M60 34c-6-5-24-6-26 14-1.6 16 9 34 18 34 4 0 5-2 8-2s4 2 8 2c9 0 19.6-18 18-34-2-20-20-19-26-14z" fill="url(#aRed)"/><path d="M60 34c0-6 1-10 4-14" stroke="#6B4423" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M63 26c6-8 15-8 18-6-3 8-11 10-18 6z" fill="url(#aGreen)"/><ellipse cx="45" cy="47" rx="5" ry="8" transform="rotate(20 45 47)" fill="url(#aGl)" opacity=".75"/>`),
  snacks: () => svg(`${SH(32)}<path d="M36 22q24-6 48 0l-2 6q2 26 0 50l2 6q-24 6-48 0l2-6q-2-24 0-50z" fill="url(#aYel)"/><path d="M36 22q24-6 48 0l-1 4q-23-5-46 0zM36 84q24 6 48 0l-1-4q-23 5-46 0z" fill="#C98F00" opacity=".55"/><ellipse cx="60" cy="55" rx="14" ry="12" fill="#fff" opacity=".92"/><path d="M51 55q9-10 18 0q-9 10-18 0z" fill="#F0A500"/><rect x="40" y="31" width="3" height="46" rx="1.5" fill="#fff" opacity=".55"/>`),
  toiletries: () => svg(`${SH(28)}<rect x="44" y="38" width="32" height="47" rx="10" fill="url(#aBlue)"/><rect x="54" y="28" width="12" height="11" rx="2" fill="url(#aWhite)"/><path d="M57 28v-8h18v5h-4v-1H61v4z" fill="#E4EAF1"/><rect x="50" y="52" width="20" height="16" rx="3" fill="#fff" opacity=".92"/><rect x="48" y="43" width="3" height="36" rx="1.5" fill="#fff" opacity=".5"/>`),
  cleaning: () => svg(`${SH(28)}<path d="M46 44h28l2 36q0 4.6-4.6 4.6H48.6Q44 84.6 44 80z" fill="url(#aGreen)"/><rect x="52" y="34" width="16" height="11" rx="2" fill="url(#aWhite)"/><path d="M50 22h22l6 6v6H50z" fill="url(#aInk)"/><path d="M56 34l-4 9" stroke="#151A22" stroke-width="3" stroke-linecap="round"/><rect x="50" y="56" width="20" height="14" rx="3" fill="#fff" opacity=".9"/><rect x="48" y="48" width="3" height="30" rx="1.5" fill="#fff" opacity=".45"/>`),
  stationery: () => svg(`${SH(36)}<rect x="30" y="30" width="46" height="55" rx="4" fill="url(#aBlue)"/><rect x="30" y="30" width="8" height="55" rx="3" fill="url(#aBlueD)"/><rect x="45" y="41" width="22" height="8" rx="2" fill="#fff" opacity=".9"/><g transform="rotate(-35 74 56)"><rect x="68" y="24" width="11" height="50" rx="2" fill="url(#aYel)"/><path d="M68 74h11l-5.5 12z" fill="#F3D9B0"/><path d="M72 82.6h3l-1.5 3.4z" fill="#2B323D"/><rect x="68" y="19" width="11" height="7" rx="2" fill="#F4A7A1"/></g>`),
  scooter: () => svg(`${SH(48)}<circle cx="33" cy="73" r="12" fill="url(#aInk)"/><circle cx="33" cy="73" r="4.6" fill="#C9D1DA"/><circle cx="91" cy="73" r="12" fill="url(#aInk)"/><circle cx="91" cy="73" r="4.6" fill="#C9D1DA"/><path d="M24 66q2-15 19-15h24l6 15z" fill="url(#aBlue)"/><path d="M62 66h17l8-27h6l-6 31q-1 4.5-5 4.5H62z" fill="url(#aBlueD)"/><path d="M41 51q0-5 5-5h16q4.5 0 4.5 4.5v.5z" fill="url(#aInk)"/><path d="M86 38.5h11" stroke="#151A22" stroke-width="4" stroke-linecap="round"/><rect x="15" y="20" width="31" height="27" rx="5" fill="url(#aWhite)"/><circle cx="30.5" cy="33.5" r="6.2" fill="none" stroke="#22A6F2" stroke-width="2.8"/><path d="M30.5 27.3a6.2 6.2 0 0 0-5.9 8" fill="none" stroke="#F6C915" stroke-width="2.8" stroke-linecap="round"/><circle cx="95" cy="46" r="2.6" fill="#FFE27A"/>`),
  plus: () => svg(`${SH(40)}<g transform="rotate(-10 60 48)"><path d="M28 28h56l14 20-14 20H28q-6 0-6-6V34q0-6 6-6z" fill="url(#aYel)"/><path d="M28 28h56l2.8 4H27q-2 0-3.4 1.2Q25 28 28 28z" fill="#fff" opacity=".45"/><circle cx="86" cy="48" r="4.4" fill="#FFF8DB"/><text x="54" y="57" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="800" font-size="24" fill="#231A00">15%</text></g>`),
};

export { I, WM, DEFS, ART };
