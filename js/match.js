// Recipe matching: forgiving, gap-aware scoring per the build spec.
import { INGREDIENTS, RECIPES } from './data.js';
import { MATCH } from './config.js';

// ---- Normalization ----------------------------------------------------

export const normalize = (s) =>
  s.toLowerCase().trim().replace(/\s+/g, ' ');

// name/alias (normalized) -> canonical ingredient id
const aliasMap = new Map();
for (const ing of INGREDIENTS) {
  aliasMap.set(normalize(ing.name), ing.id);
  for (const a of ing.aliases) aliasMap.set(normalize(a), ing.id);
}

export const ingredientById = new Map(INGREDIENTS.map((i) => [i.id, i]));

// Resolve free text ("green onion") to a seeded id, or null.
export function resolveAlias(text) {
  return aliasMap.get(normalize(text)) ?? null;
}

export const STAPLE_IDS = INGREDIENTS.filter((i) => i.isStaple).map((i) => i.id);

// ---- Scoring ----------------------------------------------------------

// Returns [{recipe, coverage, ownedRequired, missing, usedSelected, status}]
// sorted best-first. `selectedIds` are canonical ids the user tapped
// (may include custom-* ids, which never match seeded recipes).
export function matchRecipes(selectedIds, { assumeStaples = true } = {}) {
  const owned = new Set(selectedIds);
  if (assumeStaples) for (const id of STAPLE_IDS) owned.add(id);
  const selected = new Set(selectedIds);

  const scored = RECIPES.map((recipe) => {
    const req = recipe.requiredIngredientIds;
    const missing = req.filter((id) => !owned.has(id));
    const ownedRequired = req.length - missing.length;
    const coverage = req.length === 0 ? 1 : ownedRequired / req.length;

    // Fridge-clearing reward: how many of the user's actual selections
    // does this recipe put to work (required or optional)?
    const usable = [...req, ...recipe.optionalIngredientIds];
    const usedSelected = usable.filter((id) => selected.has(id)).length;
    const clearRatio = selected.size === 0 ? 0 : usedSelected / selected.size;

    const score = coverage + clearRatio * MATCH.fridgeClearWeight;

    let status = 'far';
    if (missing.length === 0) status = 'ready';
    else if (missing.length <= MATCH.almostMissingMax && coverage >= MATCH.minCoverage) status = 'almost';
    else if (coverage >= MATCH.minCoverage) status = 'close';

    return { recipe, coverage, ownedRequired, missing, usedSelected, score, status };
  });

  scored.sort((a, b) =>
    b.score - a.score ||
    a.missing.length - b.missing.length ||
    b.usedSelected - a.usedSelected ||
    a.recipe.timeMinutes - b.recipe.timeMinutes
  );

  // Visibility: hide weak matches unless selection is sparse.
  const sparse = selected.size <= MATCH.sparseSelectionCount;
  const visible = scored.filter((m) => sparse || m.status !== 'far');

  // Never an empty screen: fall back to the closest few near-misses.
  return visible.length > 0 ? visible : scored.slice(0, MATCH.resultsPerSniff);
}
