
# Most recent design file

The single standard for any UI work. It merges K.md (motion, anti-patterns, copy), CLAUDE.md (tokens, grid, type, accessibility) and the user's own direction from October 2026: "like Uber, Bolt, inDrive and Apple: white space and spacing matter most. Nothing should feel tight. Everything should breathe. Not all text the same size."

Read it fully before writing CSS. When a rule here conflicts with an older file, this file wins.

## 1. The feeling to hit

- iPhone-smooth and spacious. If a screen feels busy, the fix is more space and fewer things, never smaller text.
- One clear focal point per screen, one filled primary button, everything else quieter.
- References to study before designing: Uber (home, ride sheet, tracking), Bolt (option rows), inDrive (big type, generous rows), Apple (Large Titles, grouped lists, sheets).

## 2. Space (the most important section)

4pt grid. Every margin, padding and gap is a multiple of 4.

| Token | px | Use |
|---|---|---|
| --s-1 | 4 | icon to label, title to subtitle inside a row |
| --s-2 | 8 | chip gaps, tight inline groups |
| --s-3 | 12 | between related controls (payment row and button) |
| --s-4 | 16 | card padding, gaps between list items in a grid |
| --s-5 | 20 | screen side gutter (phones) |
| --s-6 | 24 | between a section title and its content |
| --s-8 | 32 | between sections |
| --s-10 | 40 | above the first heading on a screen, below hero art |

Rules:
- **Top air.** The first element on any screen starts at least 16px below the safe area (status bar, notch or browser bar). A web app in a browser has a 0px safe area, so add the 16px yourself. Never let a title touch the top.
- **Rows.** List rows are at least 64px tall (72px when there is a subtitle). Title and subtitle have 4px between them. Hairline dividers start at the text, not the icon.
- **Buttons and the row above them.** A primary button never sits directly on the element above it: at least 12px between a payment row (or any row) and the button, 16px from the button to the screen's bottom safe area.
- **Sections** are 32px apart. A grey 8px band can separate major groups (Uber), with 24px above and below it.
- **Sheets** rest high enough that their content feels free: about 40% down the screen on a phone, with the top 2–3 options fully visible above the footer. The map gets smaller rather than the options getting cramped.
- **Gutter** 20px on phones, clamp(20px, 5vw, 80px) on the web. Nothing touches a screen edge except full-bleed maps, hero art and horizontal scrollers.
- Test: remove every border and shadow. If the layout is still clear from spacing alone, the spacing is right.

## 3. Type hierarchy

One family (Figtree, Instrument Sans or a system grotesk), at most two. Real size contrast: each level is visibly bigger than the next, not just bolder.

| Role | Size / line-height | Weight | Notes |
|---|---|---|---|
| Large title | 34 / 1.1 | 700 | screen titles, greetings; -0.03em |
| Title | 24 / 1.2 | 700 | sheet and modal titles, big numbers in cards |
| Section | 20 / 1.25 | 700 | section headers; -0.02em |
| Headline | 17 / 1.3 | 600 | row titles, buttons, prices |
| Body | 15 / 1.5 | 400 | descriptions |
| Subhead | 14 / 1.4 | 400–500 | row subtitles, muted |
| Caption | 12–13 / 1.35 | 500–600 | tile labels, tags, meta |

- Only the large title and prices go above 24px. Never 900 weight in UI (800 only for logo and hero numbers).
- Muted text is a colour step (#5F6672-ish, at least 4.5:1), not a size step alone.
- Line length under 75 characters for body copy.

## 4. Colour

- Neutral foundation: white (or #0E1116 in dark mode), near-black ink, one grey surface, one hairline colour.
- One brand colour for the primary button, active states and the map route. One accent (e.g. yellow) only for membership, savings and promos.
- 4–5 colours in active use at most, all as CSS custom properties on :root. Dark mode redefines the same tokens.
- Contrast: 4.5:1 for text, 3:1 for large text and icons. Check button text on brand colour, and links on grey surfaces.

## 5. Icons

- Solid and clear at a glance (Uber and Apple style). Use filled glyphs for navigation, list-row leading icons and state. Line icons only where a fill would be heavy (search, chevrons, close), at a 2.25px stroke with round caps.
- One grid (24px), one weight across the whole set. 24px in tab bars, 20–22px in rows, inside a 40–44px grey circle for leading row icons.
- Every icon-only button has an aria-label and a 44×44px hit area.

## 6. Components

- **Primary button:** full width, 56px tall, 12–14px radius, 17px/600 label naming the action and price ("Place order · R63.75"). One per screen.
- **Bottom sheet:** grabber, centred title, follows the finger 1:1, rubber-bands past limits, snaps on a velocity-aware spring. Rows: art left, title + ETA + one-line description, price right; selected row gets a 2px ink outline.
- **Sticky footer:** payment row (badge, label, chevron) above the primary button, with 12px between them.
- **Maps:** pinch, scroll and double-tap zoom with clamped limits (out to about 0.7× the fitted view, in to about 3×), drag to pan inside the map's bounds, and a recenter button that springs back to the route. Vector maps zoom by changing the SVG viewBox so lines stay sharp.
- **Search pill:** 56px, fully rounded, grey surface, bold placeholder in ink.
- **Cards:** radius 16–24px, generous padding (20–24px), no heavy shadows (ultra-diffuse only).
- **Tab bar:** 4 items, filled icons, 11–12px labels, active in ink.
- **Notifications:** frosted lock-screen style (blur 24px, rounded 22px), slide in from the top.

## 7. Motion (K.md + CLAUDE.md)

- Animate transform and opacity only. 60fps minimum, aim for 120Hz smoothness.
- Springs for anything the finger moves (sheets, maps). Standard ease cubic-bezier(.32,.72,0,1) for screens, cubic-bezier(.22,1,.36,1) for entrances, cubic-bezier(.34,1.45,.64,1) for press release.
- Enter 300–500ms, exit 150–250ms. Taps scale to 0.97 in 80ms and spring back.
- Never linear or plain ease-in-out. No backdrop blur on scrolling containers. One orchestrated load moment, not fades on every card.
- Respect prefers-reduced-motion: cut to instant states.

## 8. Anti-patterns (instant fail)

- Text crammed under a title with no gap; rows under 56px; a button glued to the row above it.
- Every text the same size; hierarchy carried only by bold.
- Generic 3-card grids, gradient text, random accent colours, heavy drop shadows, emojis in UI.
- Clichés in copy: "Elevate", "Seamless", "Unleash", "Next-gen", "Game-changer".
- Placeholder names (John Doe, Lorem ipsum). Use real, contextual content.

## 9. Copy

Sentence case, active voice, short CTAs that name the action ("Add 6 Pack · R17.00"). Errors say what happened and how to fix it.

## 10. Accessibility

Visible :focus-visible rings, labels on icon buttons, 44px targets, colour never the only signal, reduced motion honoured.

## 11. Final check before calling it done

- [ ] Does the top of every screen have air under the status/browser bar?
- [ ] Is there one obvious biggest thing on each screen, and do the sizes step down clearly?
- [ ] Are rows at least 64–72px with a 4px title/subtitle gap?
- [ ] Is there 12px+ between the payment row and the button?
- [ ] Do sheets rest high enough that the options feel free?
- [ ] Can the map zoom and pan within limits, and recenter?
- [ ] Are icons solid, consistent and readable at a glance?
- [ ] Light and dark both look intentional; contrast passes; reduced motion works.
- [ ] Screenshots at 390×844 compared side by side with Uber references, two passes.
