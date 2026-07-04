// Selection state + custom ingredients + persistence. Tiny pub/sub so
// views re-render on change (same pattern as Design Idea Tracker).
import { STORAGE_KEY } from './config.js';
import { resolveAlias, normalize } from './match.js';

const defaults = () => ({
  selectedIngredientIds: [],
  customIngredients: [],   // {id, name} added by the user, category 'other'
  assumeStaples: true,
  madeRecipeIds: [],       // history of "Made it" taps, newest first
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

  markMade(recipeId) {
    state = { ...state, madeRecipeIds: [recipeId, ...state.madeRecipeIds].slice(0, 50) };
    emit();
  },
};
