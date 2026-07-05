// Pantry + selection state, custom ingredients, kitchen log, favorites,
// shopping list, freshness loop. Tiny pub/sub so views re-render on change.
//
// The pantry is the source of truth: PantryItem = {ingredientId, addedAt,
// shelfLifeDays}. Expiry and status are derived at read time (freshness.js).
// selectedIngredientIds is kept in sync for the matching code.
import { STORAGE_KEY } from './config.js';
import { resolveAlias, normalize, ingredientById } from './match.js';
import { DAY_MS, itemStatus } from './freshness.js';

const CUSTOM_SHELF_LIFE_DAYS = 7; // user-added items: assume perishable-ish

function shelfLifeFor(ingredientId) {
  if (ingredientId.startsWith('custom-')) return CUSTOM_SHELF_LIFE_DAYS;
  return ingredientById.get(ingredientId)?.defaultShelfLifeDays ?? null;
}

const newItem = (ingredientId) => ({
  ingredientId,
  addedAt: Date.now(),
  shelfLifeDays: shelfLifeFor(ingredientId),
});

const defaults = () => ({
  pantry: [],              // PantryItem[]
  selectedIngredientIds: [],
  customIngredients: [],   // {id, name} added by the user, category 'other'
  assumeStaples: true,
  makes: [],               // kitchen log: {id, recipeId, date ISO, hasPhoto}, newest first
  favoriteIds: [],         // hearted recipe ids
  shopping: [],            // {id (ingredient id), name, done}
  onboarded: false,        // welcome slides seen
  rescuedCount: 0,         // ingredients cooked/eaten while at risk
  streakBrokeAt: null,     // last time an expired item was tossed
  firstRunAt: Date.now(),
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const parsed = { ...defaults(), ...JSON.parse(raw) };
    // migrate pre-freshness selections into stamped pantry items
    if (parsed.pantry.length === 0 && parsed.selectedIngredientIds.length > 0) {
      parsed.pantry = parsed.selectedIngredientIds.map(newItem);
    }
    return parsed;
  } catch {
    return defaults();
  }
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function syncSelection(next) {
  return { ...next, selectedIngredientIds: next.pantry.map((p) => p.ingredientId) };
}

function emit() {
  persist();
  for (const fn of listeners) fn(state);
}

export const store = {
  get: () => state,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  itemFor(ingredientId) {
    return state.pantry.find((p) => p.ingredientId === ingredientId) ?? null;
  },

  toggle(id) {
    const has = state.pantry.some((p) => p.ingredientId === id);
    state = syncSelection({
      ...state,
      pantry: has
        ? state.pantry.filter((p) => p.ingredientId !== id)
        : [...state.pantry, newItem(id)],
    });
    emit();
  },

  clearSelection() {
    state = syncSelection({ ...state, pantry: [] });
    emit();
  },

  // Quick adjust, no date picker: 'fresh' (bought today), 'aged' (a few
  // days in), 'soon' (going bad: ~1 day left).
  adjustItem(ingredientId, mode) {
    state = syncSelection({
      ...state,
      pantry: state.pantry.map((p) => {
        if (p.ingredientId !== ingredientId || p.shelfLifeDays == null) return p;
        const now = Date.now();
        let addedAt = now;
        if (mode === 'aged') addedAt = now - p.shelfLifeDays * 0.6 * DAY_MS;
        if (mode === 'soon') addedAt = now - (p.shelfLifeDays - 1) * DAY_MS;
        return { ...p, addedAt };
      }),
    });
    emit();
  },

  // One-tap resolves. 'used' = cooked or eaten (a rescue if it was at
  // risk); 'extend' = still good; 'toss' = gone (breaks the fresh streak
  // only if it was already expired). No judgment either way.
  resolveItem(ingredientId, action) {
    const item = this.itemFor(ingredientId);
    if (!item) return { rescued: false };
    const status = itemStatus(item);
    if (action === 'extend') {
      state = syncSelection({
        ...state,
        pantry: state.pantry.map((p) => (p.ingredientId === ingredientId
          ? { ...p, addedAt: p.addedAt + 2 * DAY_MS }
          : p)),
      });
      emit();
      return { rescued: false };
    }
    const rescued = action === 'used' && (status === 'urgent' || status === 'useSoon');
    state = syncSelection({
      ...state,
      pantry: state.pantry.filter((p) => p.ingredientId !== ingredientId),
      rescuedCount: state.rescuedCount + (rescued ? 1 : 0),
      streakBrokeAt: action === 'toss' && status === 'expired' ? Date.now() : state.streakBrokeAt,
    });
    emit();
    return { rescued };
  },

  // Cooking a recipe consumes its perishable required items from the
  // pantry; the ones that were at risk count as rescues.
  consumeForRecipe(requiredIds) {
    const req = new Set(requiredIds);
    const consumed = [];
    let rescues = 0;
    for (const p of state.pantry) {
      if (!req.has(p.ingredientId) || p.shelfLifeDays == null) continue;
      const s = itemStatus(p);
      if (s === 'urgent' || s === 'useSoon') rescues += 1;
      consumed.push(p.ingredientId);
    }
    if (consumed.length > 0) {
      const gone = new Set(consumed);
      state = syncSelection({
        ...state,
        pantry: state.pantry.filter((p) => !gone.has(p.ingredientId)),
        rescuedCount: state.rescuedCount + rescues,
      });
      emit();
    }
    return { consumed, rescues };
  },

  streakDays(now = Date.now()) {
    const from = state.streakBrokeAt ?? state.firstRunAt;
    return Math.max(0, Math.floor((now - from) / DAY_MS));
  },

  // Add a custom ingredient from free text. If it aliases to a seeded
  // ingredient, select that instead of creating a duplicate.
  addCustom(text) {
    const name = text.trim();
    if (!name) return null;
    const aliased = resolveAlias(name);
    if (aliased) {
      if (!state.selectedIngredientIds.includes(aliased)) this.toggle(aliased);
      return aliased;
    }
    const id = 'custom-' + normalize(name).replace(/[^a-z0-9]+/g, '-');
    if (!state.customIngredients.some((c) => c.id === id)) {
      state = { ...state, customIngredients: [...state.customIngredients, { id, name }] };
    }
    if (!state.pantry.some((p) => p.ingredientId === id)) {
      state = syncSelection({ ...state, pantry: [...state.pantry, newItem(id)] });
    }
    emit();
    return id;
  },

  removeCustom(id) {
    state = syncSelection({
      ...state,
      customIngredients: state.customIngredients.filter((c) => c.id !== id),
      pantry: state.pantry.filter((p) => p.ingredientId !== id),
    });
    emit();
  },

  // Log a cooked meal. Returns the new entry so the UI can attach a photo.
  markMade(recipeId) {
    const entry = {
      id: 'make-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      recipeId,
      date: new Date().toISOString(),
      hasPhoto: false,
    };
    state = { ...state, makes: [entry, ...state.makes].slice(0, 500) };
    emit();
    return entry;
  },

  setMakePhoto(makeId, hasPhoto) {
    state = {
      ...state,
      makes: state.makes.map((m) => (m.id === makeId ? { ...m, hasPhoto } : m)),
    };
    emit();
  },

  removeMake(makeId) {
    state = { ...state, makes: state.makes.filter((m) => m.id !== makeId) };
    emit();
  },

  timesMade(recipeId) {
    return state.makes.filter((m) => m.recipeId === recipeId).length;
  },

  toggleFavorite(recipeId) {
    const has = state.favoriteIds.includes(recipeId);
    state = {
      ...state,
      favoriteIds: has
        ? state.favoriteIds.filter((id) => id !== recipeId)
        : [recipeId, ...state.favoriteIds],
    };
    emit();
    return !has;
  },

  // Shopping list: toggle an ingredient on/off the list by id.
  toggleShopping(ingId, name) {
    const has = state.shopping.some((s) => s.id === ingId);
    state = {
      ...state,
      shopping: has
        ? state.shopping.filter((s) => s.id !== ingId)
        : [...state.shopping, { id: ingId, name, done: false }],
    };
    emit();
    return !has;
  },

  toggleShoppingDone(ingId) {
    state = {
      ...state,
      shopping: state.shopping.map((s) => (s.id === ingId ? { ...s, done: !s.done } : s)),
    };
    emit();
  },

  clearShoppingDone() {
    state = { ...state, shopping: state.shopping.filter((s) => !s.done) };
    emit();
  },

  setOnboarded() {
    state = { ...state, onboarded: true };
    emit();
  },
};
