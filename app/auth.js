// Accounts. Uses Firebase Auth when firebase-config.js holds a config; otherwise keeps
// demo accounts on this device, so the pitch works before Firebase is connected.
import { firebaseConfig } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
export const mode = firebaseConfig && firebaseConfig.apiKey ? 'firebase' : 'local';

const fail = code => Object.assign(new Error(code), { code });
const wait = ms => new Promise(r => setTimeout(r, ms));
const clean = email => String(email || '').trim().toLowerCase();
const fromFirebase = u => u && { uid: u.uid, name: u.displayName || '', email: u.email || '' };

/* ---------- Firebase ---------- */
let fb;
function firebase() {
  fb ??= (async () => {
    const [{ initializeApp }, m] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js')]);
    const auth = m.getAuth(initializeApp(firebaseConfig));
    auth.useDeviceLanguage();
    return { auth, m };
  })();
  return fb;
}

/* ---------- demo accounts on this device ---------- */
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
async function hash(password, salt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const accounts = () => read('bloc:accounts', {});
const pub = a => ({ uid: a.uid, name: a.name, email: a.email });

/* ---------- public API ---------- */
export async function current() {
  if (mode === 'local') {
    const uid = read('bloc:session', null), a = Object.values(accounts()).find(x => x.uid === uid);
    return a ? pub(a) : null;
  }
  const { auth } = await firebase();
  await auth.authStateReady();
  return fromFirebase(auth.currentUser);
}

export async function signUp({ name, email, password }) {
  email = clean(email);
  if (mode === 'local') {
    await wait(650);
    const all = accounts();
    if (all[email]) throw fail('auth/email-already-in-use');
    const salt = crypto.randomUUID(), uid = 'local-' + salt.slice(0, 8);
    all[email] = { uid, name, email, salt, hash: await hash(password, salt) };
    write('bloc:accounts', all); write('bloc:session', uid);
    return pub(all[email]);
  }
  const { auth, m } = await firebase();
  const { user } = await m.createUserWithEmailAndPassword(auth, email, password);
  await m.updateProfile(user, { displayName: name });
  return { ...fromFirebase(user), name };
}

export async function logIn({ email, password }) {
  email = clean(email);
  if (mode === 'local') {
    await wait(550);
    const a = accounts()[email];
    if (!a || a.hash !== await hash(password, a.salt)) throw fail('auth/invalid-credential');
    write('bloc:session', a.uid);
    return pub(a);
  }
  const { auth, m } = await firebase();
  return fromFirebase((await m.signInWithEmailAndPassword(auth, email, password)).user);
}

export async function google() {
  if (mode === 'local') throw fail('auth/operation-not-allowed');
  const { auth, m } = await firebase();
  return fromFirebase((await m.signInWithPopup(auth, new m.GoogleAuthProvider())).user);
}

export async function resetPassword(email) {
  email = clean(email);
  if (mode === 'local') { await wait(500); return; }
  const { auth, m } = await firebase();
  await m.sendPasswordResetEmail(auth, email);
}

export async function logOut() {
  if (mode === 'local') return write('bloc:session', null);
  const { auth, m } = await firebase();
  await m.signOut(auth);
}

const MESSAGES = {
  'auth/email-already-in-use': 'That email already has a Bloc account. Log in instead.',
  'auth/invalid-email': 'That email doesn’t look right. Check it and try again.',
  'auth/weak-password': 'Use at least 8 characters for your password.',
  'auth/invalid-credential': 'That email and password don’t match. Try again or reset your password.',
  'auth/wrong-password': 'That email and password don’t match. Try again or reset your password.',
  'auth/user-not-found': 'That email and password don’t match. Try again or reset your password.',
  'auth/too-many-requests': 'Too many tries. Wait a minute, then try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups and try again.',
  'auth/unauthorized-domain': 'Google sign-in isn’t switched on for this web address yet.',
  'auth/operation-not-allowed': 'That sign-in method isn’t switched on yet. Use email instead.',
};
export const message = err => MESSAGES[err && err.code] || 'Something went wrong. Try again in a moment.';
