// Line-art dish illustrations, same ink style as the cat mascot.
// One doodle per dish family, mapped to every recipe. Swap in photos or
// richer art later by replacing only this file.
const S = (inner) => `
<svg class="dish-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
     fill="none" stroke="var(--cat-line)" stroke-width="3.2"
     stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const steam = (x) => `<path d="M${x} 18 q 3 -5 0 -9 M${x + 9} 20 q 3 -5 0 -10" opacity="0.7"/>`;

export const DISH_ART = {
  pasta: S(`
    <ellipse cx="40" cy="54" rx="26" ry="9" fill="var(--cat-fill)"/>
    <path d="M20 50 q 10 -9 19 -3 q 10 6 21 -2" />
    <path d="M24 44 q 9 -7 16 -2 q 9 5 16 -1" />
    <circle cx="33" cy="45" r="2" fill="var(--cat-line)"/>
    <circle cx="47" cy="47" r="2" fill="var(--cat-line)"/>
    ${steam(34)}`),
  noodles: S(`
    <path d="M14 42 h 52 a 26 22 0 0 1 -52 0 Z" fill="var(--cat-fill)"/>
    <path d="M24 42 q 2 -14 6 -22 M60 34 l 12 -18" />
    <path d="M30 42 q 4 -8 10 -8 q 8 0 10 8 M42 42 q 2 -6 8 -7" />
    ${steam(30)}`),
  rice: S(`
    <path d="M16 44 h 48 a 24 20 0 0 1 -48 0 Z" fill="var(--cat-fill)"/>
    <path d="M22 44 a 18 12 0 0 1 36 0" fill="var(--cat-fill)"/>
    <path d="M30 38 h 6 M42 34 h 6 M36 42 h 6" stroke-width="2.4"/>
    ${steam(32)}`),
  wok: S(`
    <path d="M18 40 h 44 a 22 16 0 0 1 -44 0 Z" fill="var(--cat-fill)"/>
    <path d="M18 42 H 6 M62 42 h 12" />
    <path d="M28 34 q 5 -8 12 -4 M44 32 q 6 -4 10 2" />
    <circle cx="34" cy="38" r="2.4" fill="var(--cat-line)"/>
    <path d="M46 20 q 3 -5 0 -9" opacity="0.7"/>`),
  taco: S(`
    <path d="M12 56 a 28 28 0 0 1 56 0 Z" fill="var(--cat-fill)"/>
    <path d="M18 56 a 22 22 0 0 1 44 0" />
    <path d="M22 52 q 4 -6 8 0 q 4 -6 8 0 q 4 -6 8 0 q 4 -6 8 0 q 4 -6 6 2" />
    <circle cx="34" cy="42" r="2" fill="var(--cat-line)"/>
    <circle cx="48" cy="44" r="2" fill="var(--cat-line)"/>`),
  sandwich: S(`
    <path d="M16 34 h 48 l -6 -10 h -36 Z" fill="var(--cat-fill)"/>
    <path d="M14 40 q 8 6 16 0 q 8 6 16 0 q 8 6 16 0" />
    <path d="M16 46 h 48 l -4 10 h -40 Z" fill="var(--cat-fill)"/>
    <path d="M58 22 l 4 -8" stroke-width="2.4"/>`),
  toast: S(`
    <path d="M20 26 q -8 0 -8 9 q 0 7 6 8 v 18 h 44 v -18 q 6 -1 6 -8 q 0 -9 -8 -9 q -2 -6 -20 -6 q -18 0 -20 6 Z" fill="var(--cat-fill)"/>
    <path d="M30 44 q 5 6 10 0 q 5 6 10 0" stroke-width="2.6"/>`),
  soup: S(`
    <path d="M14 36 h 52 v 6 a 26 20 0 0 1 -52 0 Z" fill="var(--cat-fill)"/>
    <path d="M14 38 H 6 M66 38 h 8" />
    <path d="M28 30 q 6 -6 24 0" stroke-width="2.6"/>
    ${steam(34)}`),
  curry: S(`
    <path d="M14 44 h 52 a 26 18 0 0 1 -52 0 Z" fill="var(--cat-fill)"/>
    <path d="M18 44 q 8 -8 14 0 q 8 -8 14 0 q 8 -8 16 0" stroke-width="2.6"/>
    <circle cx="30" cy="52" r="2" fill="var(--cat-line)"/>
    <circle cx="46" cy="54" r="2" fill="var(--cat-line)"/>
    ${steam(34)}`),
  pancakes: S(`
    <ellipse cx="40" cy="32" rx="20" ry="7" fill="var(--cat-fill)"/>
    <path d="M20 32 v 8 a 20 7 0 0 0 40 0 v -8" fill="var(--cat-fill)"/>
    <path d="M20 40 v 8 a 20 7 0 0 0 40 0 v -8" fill="var(--cat-fill)"/>
    <rect x="35" y="24" width="10" height="7" rx="1.5" fill="var(--cat-fill)"/>
    <path d="M30 34 v 5 M50 35 v 5" stroke-width="2.4"/>
    <ellipse cx="40" cy="60" rx="27" ry="6"/>`),
  eggs: S(`
    <circle cx="36" cy="40" r="22" fill="var(--cat-fill)"/>
    <path d="M56 32 l 16 -6" />
    <path d="M26 40 q 0 -12 12 -11 q 11 1 10 12 q -1 10 -12 10 q -10 0 -10 -11 Z" stroke-width="2.6"/>
    <circle cx="37" cy="40" r="5" fill="var(--cat-line)"/>`),
  fish: S(`
    <path d="M14 42 q 14 -16 34 -14 q 6 -8 14 -10 q -2 8 0 14 q 2 6 0 14 q -8 -2 -14 -10 q -20 2 -34 -14 Z"
          fill="var(--cat-fill)" transform="translate(0 8)"/>
    <circle cx="26" cy="46" r="2" fill="var(--cat-line)"/>
    <path d="M38 40 q 4 8 0 16 M48 40 q 3 7 0 14" stroke-width="2.4"/>`),
  chicken: S(`
    <path d="M22 24 q 16 -12 30 2 q 12 12 0 24 q -10 10 -22 4 l -8 8 q -4 4 -8 0 q -4 -4 0 -8 l 8 -8 q -8 -12 0 -22 Z" fill="var(--cat-fill)"/>
    <circle cx="18" cy="62" r="3.4" fill="var(--cat-fill)"/>
    <path d="M40 32 q 6 2 8 8" stroke-width="2.4"/>`),
  salad: S(`
    <path d="M14 42 h 52 a 26 18 0 0 1 -52 0 Z" fill="var(--cat-fill)"/>
    <path d="M26 40 q -2 -12 8 -16 q 2 10 -4 16 M40 40 q 0 -10 10 -12 q 0 9 -7 12 M52 40 q 6 -8 12 -6" />
    <circle cx="34" cy="36" r="2" fill="var(--cat-line)"/>`),
  parfait: S(`
    <path d="M26 16 h 28 l -4 44 q -1 6 -10 6 q -9 0 -10 -6 Z" fill="var(--cat-fill)"/>
    <path d="M28 34 h 24 M29 46 h 22" stroke-width="2.4"/>
    <circle cx="36" cy="26" r="2.2" fill="var(--cat-line)"/>
    <circle cx="45" cy="24" r="2.2" fill="var(--cat-line)"/>
    <path d="M58 12 l 8 -4" stroke-width="2.4"/>`),
  mug: S(`
    <path d="M22 28 h 32 v 26 q 0 8 -16 8 q -16 0 -16 -8 Z" fill="var(--cat-fill)"/>
    <path d="M54 34 q 10 0 10 8 q 0 8 -11 7" />
    <circle cx="32" cy="44" r="2" fill="var(--cat-line)"/>
    <circle cx="42" cy="50" r="2" fill="var(--cat-line)"/>
    <circle cx="44" cy="38" r="2" fill="var(--cat-line)"/>
    ${steam(32)}`),
  potato: S(`
    <ellipse cx="40" cy="44" rx="26" ry="17" fill="var(--cat-fill)"/>
    <path d="M26 40 q 14 10 28 0" stroke-width="2.6"/>
    <path d="M34 44 v 5 M40 45 v 6 M46 44 v 5" stroke-width="2.4"/>
    ${steam(34)}`),
};

const MAP = {
  'garlic-butter-pasta': 'pasta', 'aglio-e-olio': 'pasta', 'weeknight-tomato-pasta': 'pasta',
  'creamy-mushroom-pasta': 'pasta', 'tuna-lemon-pasta': 'pasta', 'bacon-egg-pasta': 'pasta',
  'stovetop-mac': 'pasta', 'simple-bolognese': 'pasta',
  'egg-fried-rice': 'rice', 'kimchi-fried-rice': 'rice', 'chicken-fried-rice': 'rice',
  'one-pot-chicken-rice': 'rice', 'burrito-bowl': 'rice', 'garlic-butter-rice': 'rice',
  'chicken-congee': 'rice', 'roast-veg-couscous': 'rice',
  'upgraded-ramen': 'noodles', 'peanut-noodles': 'noodles', 'pad-thai-ish': 'noodles',
  'chicken-stir-fry': 'wok', 'beef-and-broccoli': 'wok', 'crispy-tofu-stir-fry': 'wok',
  'bacon-cabbage': 'wok', 'sheet-pan-sausage': 'wok',
  'beef-tacos': 'taco', 'fish-tacos': 'taco', 'cheese-quesadillas': 'taco',
  'blt': 'sandwich', 'tuna-melt': 'sandwich', 'chickpea-salad-sandwich': 'sandwich',
  'grilled-cheese': 'sandwich',
  'scrambled-egg-toast': 'toast', 'avocado-toast': 'toast', 'pb-banana-toast': 'toast',
  'french-toast': 'toast',
  'egg-drop-soup': 'soup', 'tomato-soup': 'soup', 'lentil-soup': 'soup', 'miso-soup': 'soup',
  'chicken-noodle-soup': 'soup', 'weeknight-chili': 'soup',
  'chickpea-coconut-curry': 'curry', 'easy-chicken-curry': 'curry', 'red-lentil-dal': 'curry',
  'fluffy-pancakes': 'pancakes', 'banana-oat-pancakes': 'pancakes', 'zucchini-fritters': 'pancakes',
  'cheesy-omelette': 'eggs', 'shakshuka': 'eggs', 'breakfast-hash': 'eggs',
  'baked-salmon-potatoes': 'fish', 'honey-garlic-salmon': 'fish', 'garlic-butter-shrimp': 'fish',
  'honey-soy-chicken': 'chicken', 'gochujang-chicken': 'chicken',
  'caprese-salad': 'salad', 'greek-ish-salad': 'salad', 'smashed-cucumber-salad': 'salad',
  'overnight-oats': 'parfait', 'yogurt-parfait': 'parfait',
  'mug-cookie': 'mug',
  'loaded-baked-potato': 'potato',
};

export function dishArt(recipeId) {
  return DISH_ART[MAP[recipeId]] ?? DISH_ART.soup;
}
