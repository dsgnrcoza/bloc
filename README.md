# Bloc

Same-day eggs, bread and milk for students in res. Order from your room or the library, follow the courier on a live map, and meet them with a delivery PIN. Bloc+ takes 15% off everything and drops delivery to R7, for R27 a month.

This is a working demo: there are no real orders or payments, and accounts are stored on your phone.

**Try it:** [getbloc.vercel.app/get](https://getbloc.vercel.app/get) picks the right install for your phone.

- **Android:** download the APK from the page or from the [demo release](https://github.com/dsgnrcoza/bloc/releases/tag/demo), allow the install, then open Bloc.
- **iPhone:** open [getbloc.vercel.app](https://getbloc.vercel.app) in Safari, tap Share, then Add to Home Screen. The release also has a `Bloc.mobileconfig` profile that adds the same icon.

## What's here

| Folder | What it is |
|---|---|
| `app/` | The web app: plain HTML, CSS and JavaScript modules, no build step. Deployed to Vercel from this folder. |
| `android/` | A native Android WebView shell that opens the web app full screen (package `app.getbloc`). |
| `tools/` | Node scripts that capture screenshots and render the ads, animations, Play Store assets and the one-page PDF. |
| `DESIGN.md`, `MOST-RECENT-DESIGN.md` | The design brief and the spacing, type and motion rules the app follows. |

## Run it locally

```bash
python -m http.server 5173 --directory app
```

Then open http://localhost:5173. Accounts stay in the browser until `app/firebase-config.js` is given a Firebase config.

## Build the Android app

Needs JDK 17 and the Android SDK. Signing reads `android/keystore.properties`, which is not in this repo; without it, build a debug APK instead.

```bash
cd android && ./gradlew assembleDebug
```

## Render the marketing assets

```bash
cd tools && npm install
node capture.mjs https://getbloc.vercel.app/ ../marketing/screens
node ads.mjs && node anim.mjs && node play.mjs && node pdf.mjs && node get-assets.mjs
```

The scripts drive a local Chrome through `puppeteer-core` and use `ffmpeg` for the GIFs and MP4s. Set `CLOCK=17:40` on `capture.mjs` to pin the time shown in the screenshots.
