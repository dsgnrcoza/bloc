# Bloc design brief

Bloc should feel as calm and sure of itself as Uber, without looking like Uber, Bolt or inDrive. Every decision in `app/` comes from Bloc's own pieces: the ring in the wordmark, the products, and the res-life tone. The rules and tokens are in `MOST-RECENT-DESIGN.md`.

## What makes it Bloc, not a ride app

| Ride apps | Bloc |
|---|---|
| Map first, with options in a sheet over it | The shop is the home screen: four product blocs you can add from in one tap |
| Rows of options with a black outline | Sizes on a segmented track, with a white card that springs between them |
| Full-width tab bar | A floating ink island: three tabs on the left, and on the right the basket or the order on its way |
| Full-screen map with a sheet while you wait | A countdown ring (the O from the wordmark) with the time inside it. The map sits in a card that opens to full screen |
| White, black and grey | Warm milk background, white cards, one blue for actions and the route, yolk yellow for Bloc+ |
| One neutral grotesk | Bricolage Grotesque for titles, prices and numbers. Figtree for everything else |

## The ring
The O in the wordmark is a ring with a yellow arc. It is the one motif, and it appears wherever something fills up or counts down:
- the delivery countdown on the tracking screen, and the small live rings in the island and on Orders
- sign-up progress, a quarter per question
- the Bloc+ seal and the ring behind the Bloc+ page
- the welcome screen, where the products orbit it

## Blocs
The four products are rounded blocks (28px radius), each tinted after its product: eggshell, crust, milk blue and kraft. The art sits on top, then the name, a short caption and the price. The + adds the most popular size. Tapping anywhere else on the bloc opens the product sheet.

## Signature motion
- **Add to basket.** A copy of the product art is tossed in an arc into the island. The basket count pops when it lands.
- **The island.** It widens to make room for the basket or the live order, and the white tab pill springs between tabs.
- **Product sheet.** It rises on the screen's ease. The art lands with a little overshoot, and changing size slides the white card along the track.
- **Checkout.** It rises as a card, and the screen behind it shrinks back like a stack of cards.
- **Map.** The card's map opens to full screen without a jump. The full map starts clipped to the card's shape, then the clip opens.
- **Tracking.** The ring fills, its head dot travels round, and the courier glides along the route and turns with the road.

Everything else stays still. Transform and opacity only, springs over linear, and reduced motion turns it all into instant cuts.

## Illustration
Keep the soft 3D objects: light from the top left, no outlines, a soft contact shadow, sitting on the product's tint.
