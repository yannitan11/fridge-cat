// All the feel knobs in one place.

export const MATCH = {
  // Coverage below this is hidden from results...
  minCoverage: 0.6,
  // ...unless the user selected fewer than this many ingredients, in which
  // case we always surface the closest few so the screen is never empty.
  sparseSelectionCount: 3,
  // How many recipe cards per sniff.
  resultsPerSniff: 3,
  // "Almost there" = missing at most this many required items.
  almostMissingMax: 2,
  // Small ranking reward for recipes that clear more of the user's fridge:
  // fraction of the user's selected items the recipe uses, weighted.
  fridgeClearWeight: 0.15,
};

export const TIMING = {
  sniffMs: 2100,       // fridge-search loading scene before results reveal
  reactionMs: 1500,    // found-it / shrug / chef's-kiss reactions
  idleFidgetMinMs: 6000,   // random grooming / tail flicks while idle
  idleFidgetMaxMs: 14000,
};

export const STORAGE_KEY = 'fridge-cat-v1';
