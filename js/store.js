// Selection state + custom ingredients + persistence. Tiny pub/sub so
// views re-render on change (same pattern as Design Idea Tracker).
import { STORAGE_KEY } from './config.js';
import { resolveAlias, normalize } from './match.js';

const defaults = () => ({
  selectedIngredientIds: [],
  customIngredients: [],   // {id, name} added by the user, category 'other'
  assumeStaples: true,
  makes: [],               // kitchen log: {id, recipeId, date ISO, hasPhoto}, newest first
  favoriteIds: [],         // hearted recipe ids
  shopping: [],            // {id (ingredient id), name, done}
  onboarded: false,        // welcome slides seen
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    return defaults();
  }
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function emit() {
  persist();
  for (const fn of listeners) fn(state);
}

export const store = {
  get: () => state,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  toggle(id) {
    const set = new Set(state.selectedIngredientIds);
    set.has(id) ? set.delete(id) : set.add(id);
    state = { ...state, selectedIngredientIds: [...set] };
    emit();
  },

  clearSelection() {
    state = { ...state, selectedIngredientIds: [] };
    emit();
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
    if (!state.selectedIngredientIds.includes(id)) {
      state = { ...state, selectedIngredientIds: [...state.selectedIngredientIds, id] };
    }
    emit();
    return id;
  },

  removeCustom(id) {
    state = {
      ...state,
      customIngredients: state.customIngredients.filter((c) => c.id !== id),
      selectedIngredientIds: state.selectedIngredientIds.filter((s) => s !== id),
    };
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
