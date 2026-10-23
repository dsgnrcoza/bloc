# Bloc design brief

What makes the Uber references (README/1–12) feel clean. Every decision in `app/` follows from this.

## Spacing
- 4pt grid. 20px side gutter on every screen; nothing touches the edge except the map and the 8px grey section bands.
- Sections are split by an 8px surface-coloured band (ref 6), not by cards or borders. Inside a section, rows are split by a 1px hairline that starts at the text, not the icon.
- Rows are tall (56–72px) with one line of bold text and one line of grey text. Tiles are square, light grey, art centred, label underneath.

## Type
- One family, three weights: 700 for titles, 600 for row titles and buttons, 400–500 for body. No 900.
- Big, confident size contrast: large title 32/1.1, section 20, row 16, meta 13–14 grey. Tight tracking (-0.02em) only on 20px and up.

## Colour
- Uber uses black, white and two greys. Colour only comes from illustrations and state (selected row, route, savings).
- Bloc: white surfaces, near-black ink, `#F3F4F6` surface, one brand blue for the primary button, map route and active states. Yellow appears only on Bloc+ and savings. Green only for "you saved".

## Bottom sheet (refs 2, 3, 7, 9)
- Map fills the top; a white sheet with a grabber sits over it, title centred.
- Options are rows: art left, name + ETA + one-line description, price right. The selected row gets a 2px ink outline (ref 7) — no fill colour.
- Sticky footer: payment row (card badge, last four, chevron) above one full-width primary button that names the action and the price.
- The sheet follows the finger 1:1, rubber-bands past its limits and snaps to the nearest stop using release velocity.

## One primary action per screen
- Exactly one filled button per screen, full width, 56px, at the bottom. Everything else is a row, a chip or a text link.

## Icons
- Solid, slightly heavy glyphs (2px stroke, round caps) at 24px. Tab bar: icon over a small label, active in ink, inactive grey.

## Illustration
- Soft 3D objects (ref 1, 6): gentle top-left light, no outlines, rounded forms, a soft contact shadow, sitting on a light grey tile. One consistent light source and palette across eggs, bread, milk and bundles.

## Motion
- Screens push from the right with the old one parallaxing left and dimming; modals rise from the bottom. Springs, not linear.
- The route draws in; the courier glides along it and turns with the road. A live-activity card (ref 4, right) shows the delivery when you leave the tracking screen.
- Transform and opacity only. Reduced motion turns it all into instant cuts.

## Account (ref 5)
- Name large on the left, avatar on the right, three square shortcut tiles, then a plain list of rows with leading icons.
