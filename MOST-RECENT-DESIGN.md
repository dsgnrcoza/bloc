# Most recent design file

This is the single standard for any UI work. Read it fully before writing CSS. When a rule here conflicts with an older file, this file wins. `DESIGN.md` explains the idea behind the identity.

The user's latest direction (October 2026): the app had an "Uber/Bolt/InDrive vibe". It must stay "just as clean and simple", but be "unique, super smooth and high level like Uber". Their earlier direction still holds: "white space and spacing matter most. Nothing should feel tight. Everything should breathe. Not all text the same size."

## 1. The feeling to hit

- Calm, premium and unmistakably Bloc. Someone who uses Uber every day should not think of it.
- One clear focal point per screen and one filled primary button. Everything else is quieter.
- If a screen feels busy, the fix is more space and fewer things, never smaller text.
- Never reach for ride-app patterns: no map-first home, no option rows with a black outline, no full-width black tab bar, no black promo cards.

## 2. Space

4pt grid. Every margin, padding and gap is a multiple of 4.

| Token | px | Use |
|---|---|---|
| --s-1 | 4 | icon to label, title to subtitle inside a row |
| --s-2 | 8 | chip gaps, tight inline groups |
| --s-3 | 12 | between cards in a stack, between blocs, payment row to button |
| --s-4 | 16 | card padding, row padding |
| --s-5 | 20 | screen side gutter |
| --s-6 | 24 | between a title and its content |
| --s-8 | 32 | above a large title |
| --s-10 | 40 | between sections |

- **Top air.** The first element on any screen starts at least 12px below the safe area. Large titles get 20–32px.
- **Rows** are at least 64px tall (68px with a subtitle), with 4px between title and subtitle. Hairlines start at the text, not the icon.
- **Cards, not bands.** Group related rows on a white card (22px radius) sitting on the milk background, iOS style. Cards in a stack are 12px apart.
- **Floating island** sits 8px above the bottom safe area. Scroll views end with 150px of space so nothing hides under it.
- **Gutter** is 20px on phones. Nothing touches a screen edge except full-bleed heroes, the map and horizontal scrollers.
- Test: remove every shadow. If the layout still reads from spacing and card edges alone, the spacing is right.

## 3. Type

Two families, no more:
- **Bricolage Grotesque** (`--display`) for large titles, sheet titles, section headers, prices and big numbers. Always `font-stretch: 92%` with tight tracking.
- **Figtree** (`--font`) for everything else.

| Role | Size / line-height | Weight | Family |
|---|---|---|---|
| Hero | 42–44 / 0.98 | 700 | display, -0.04em |
| Large title | 36–40 / 1.0 | 700 | display, -0.035em |
| Countdown number | 84 / 0.86 | 700 | display, -0.05em |
| Title | 30–32 / 1.0 | 700 | display, -0.035em |
| Section | 24 / 1.1 | 700 | display, -0.025em |
| Headline | 16–17 / 1.3 | 600 | Figtree, rows and buttons |
| Body | 15 / 1.5 | 400 | Figtree |
| Subhead | 13–14 / 1.4 | 400–500 | Figtree, muted |
| Caption | 12–13 / 1.35 | 600–700 | Figtree, tags and labels |

- Never 900. Use 800 only for the Bloc+ price.
- Muted text is a colour step (`--muted`, at least 4.5:1 on milk and on white), not just a smaller size.

## 4. Colour

All colours are custom properties on `:root`, and dark mode redefines the same tokens.

| Token | Light | Use |
|---|---|---|
| --bg | #F3F1EB | milk: the background of every screen |
| --card | #FFFFFF | cards, fields, sheets |
| --surface | #EAE7DF | segmented tracks, steppers, icon circles |
| --ink | #15161A | text, the island |
| --act | #0A72D1 | the one action blue: primary buttons, the route, progress |
| --blue | #22A6F2 | brand sky, only in the brand gradient (splash, welcome, icons) |
| --yellow | #FFC530 | yolk: Bloc+, the ring's arc and savings highlights only |
| --green | #0A7F50 | "you saved" amounts and "delivered" |
| --t-eggs, --t-bread, --t-milk, --t-bundles | warm tints | product backgrounds only |

- White text sits on the deep end of the brand gradient or on `--act`, never on `--blue`.
- Check button text on `--act` (4.8:1) and yellow (ink text only).

## 5. Icons

- Solid glyphs for navigation, row icons and state. Line icons, at a 2.25px stroke with round caps, only where a fill would be heavy: search, chevrons, close, plus.
- 24px in the island, 19–20px in rows, inside a 40px circle for row icons.
- Every icon-only button has an aria-label and a 44×44px hit area.

## 6. Components

- **Primary button:** full width, 58px tall, fully rounded (29px), 17px/600. Its label names the action and the price ("Place order · R63.75"). One per screen.
- **Bloc:** a product block with a 28px radius, 226px tall, on its product tint. Art on top, then the name in display type, a muted caption and the price. A 44px white + sits bottom right. The basket count sits top right in an ink badge.
- **Product sheet:** a bottom sheet with a tinted hero holding the art, a title with a tag, then sizes on a segmented track (a white card springs between them). Below that: the delivery line, the Bloc+ price, and a footer with a quantity pill and the add button. Drag the hero down to dismiss.
- **Island:** a 64px ink capsule. Its tabs are 52px circles, with a white pill marking the active one. The context button is blue for the basket and ink-light with a mini ring for a live order.
- **Checkout:** a modal sheet on milk with white cards: place and time, items, add-ons, Bloc+ upsell, summary. The total is in display type, and a sticky payment row sits above the button.
- **Tracking:** a countdown ring, the steps on a card, then the map card (it opens full screen), then cards for the courier, the PIN and the order.
- **Compact bar:** on tab screens the large title scrolls away, and a 52px bar with the title fades in.
- **Notifications:** frosted lock-screen style (24px blur, 24px radius), sliding in from the top.

## 7. Motion

- Animate transform and opacity only, plus clip-path for the map reveal. Aim for 120Hz smoothness.
- Use springs for anything the finger moves. Screens use cubic-bezier(.32,.72,0,1), entrances use cubic-bezier(.22,1,.36,1), and press releases use cubic-bezier(.34,1.45,.64,1).
- Enters take 300–600ms and exits 150–250ms. Taps scale to 0.96–0.97 in 80ms and spring back.
- Allow one orchestrated load moment (the blocs rise in turn), not fades on every card.
- Respect prefers-reduced-motion with instant states. That includes no fly-to-basket and no orbit.

## 8. Anti-patterns (instant fail)

- Ride-app layouts (section 1).
- Text crammed under a title, rows under 56px, or a button glued to the row above it.
- Every text the same size, or hierarchy carried only by bold.
- Gradient text, random accent colours, heavy drop shadows, or emojis in UI.
- Clichés in copy: "Elevate", "Seamless", "Unleash", "Next-gen", "Game-changer".
- Placeholder names (John Doe, Lorem ipsum).

## 9. Copy

Sentence case, active voice, short CTAs that name the action ("Add · R17.00"). Errors say what happened and how to fix it.

## 10. Accessibility

Visible :focus-visible rings, labels on icon buttons, 44px targets, and colour never as the only signal. The size track is a radio group that arrow keys move along. Reduced motion is honoured.

## 11. Final check before calling it done

- [ ] Would someone who uses Uber every day mistake any screen for a ride app?
- [ ] Is there air under the status bar, and one obvious biggest thing on each screen?
- [ ] Are rows 64–68px, with cards 12px apart and 150px of space under the island?
- [ ] Do the ring, the blocs and the island all still read as one system?
- [ ] Do light and dark both look intentional, does contrast pass, and does reduced motion work?
- [ ] Run `tools/capture.mjs` and look at every screen at 390×844 in both themes.
