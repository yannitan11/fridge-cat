# Fridge Cat

A cat that sniffs out something you can cook from whatever's in your fridge.
Tap the ingredients you have, hit "Sniff it out", and Fridge Cat returns 1 to 3
recipes you can actually make right now, with what's covered, what's missing,
and how close each one is. Part of the cat-mascot utility suite.

## Run locally

```bash
cd "Fridge Cat"
python3 -m http.server 8000
```

Then open http://localhost:8000 (ES modules need http, not `file://`).

## How it works

- **No backend, no account.** ~120 ingredients and ~58 recipes are bundled as
  local data in `js/data.js`. Your selection, custom ingredients, and "made it"
  history persist in `localStorage`.
- **Screens** (hash routes): `#/pantry` (chip grid grouped by category, search
  + custom add, sniff button), `#/results` (sniff animation, ranked recipe
  cards), `#/recipe/<id>` (full ingredients owned vs missing, steps, "I made it").
- **Matching** (`js/match.js`): aliases collapse ("scallion" = "green onion"),
  staples (salt, pepper, oil, sugar) are assumed owned, and missing an item
  never hard-fails. Recipes are ranked by required-ingredient coverage, then
  fewest missing, then how much of your fridge they clear, then speed. 100%
  coverage = "Ready to cook"; 1-2 missing = "Almost there"; weak matches are
  hidden unless you've barely selected anything.
- **The cat** (`js/cat.js`): one inline SVG with behavior states: idle
  (blinking, tail sway, occasional grooming), hungry (droops at zero
  ingredients), sniffing, found-it, shrug, and chef's kiss. All animation is
  CSS-driven off `data-state`, honors `prefers-reduced-motion`, and every
  reaction stays under ~1.5s so it never gates the answer. Swap in richer art
  by replacing only `cat.js`.
- **Feel knobs** live in `js/config.js` (match thresholds, animation timing).

## Files

```
index.html      shell + fonts
styles.css      theme (light/dark), chips, cards, cat state animations
js/app.js       hash router + the three views + dock
js/data.js      seed ingredients + recipes
js/match.js     normalization, aliases, scoring
js/store.js     state + localStorage + pub/sub
js/cat.js       the mascot (SVG + state machine)
js/config.js    tuning knobs
```
