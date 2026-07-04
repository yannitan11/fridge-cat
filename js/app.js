// Hash router + views: #/pantry, #/results, #/recipe/<id>
import { CATEGORIES, INGREDIENTS, RECIPES } from './data.js';
import { MATCH, TIMING } from './config.js';
import { matchRecipes, ingredientById, normalize } from './match.js';
import { store } from './store.js';
import { createCat } from './cat.js';

const app = document.getElementById('app');
const dock = document.getElementById('dock');

const esc = (s) => s.replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const ICONS = {
  check: '<svg class="chip-check" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  checkSmall: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.8V8l2.2 1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  flame: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.8c.5 2.4 3.8 3.8 3.8 7a3.8 3.8 0 0 1-7.6 0c0-1.2.5-2.2 1.1-3 .2 1 .7 1.6 1.4 1.9C6.4 5.6 7 3.6 8 1.8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  bowl: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 7.5h12A6 6 0 0 1 8 13.5 6 6 0 0 1 2 7.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5.5 5c1-1.4 0-2 .8-3M9.5 5c1-1.4 0-2 .8-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  back: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.8"/><path d="m12.5 12.5 3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  nose: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 8h8l-4 5Z" fill="currentColor"/><path d="M3 5c2-2.5 4-2 4-2M17 5c-2-2.5-4-2-4-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
};

const LOGO_FACE = `
<svg class="logo-face" viewBox="0 0 64 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M10 26 L14 6 L28 18 Z" fill="var(--cat-fill)" stroke="var(--cat-line)" stroke-width="3" stroke-linejoin="round"/>
  <path d="M54 26 L50 6 L36 18 Z" fill="var(--cat-fill)" stroke="var(--cat-line)" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="32" cy="34" rx="26" ry="22" fill="var(--cat-fill)" stroke="var(--cat-line)" stroke-width="3"/>
  <path d="M25 16 v6 M32 14 v7 M39 16 v6" stroke="var(--cat-line)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="22" cy="33" r="3.2" fill="var(--cat-line)"/>
  <circle cx="42" cy="33" r="3.2" fill="var(--cat-line)"/>
  <path d="M29 40 h6 l-3 4 Z" fill="var(--cat-line)"/>
  <path d="M28 48 q 4 3 8 0" fill="none" stroke="var(--cat-line)" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

// ---------- module state (not persisted) ----------
let searchQuery = '';
let sniffOffset = 0;      // rotates results on "sniff again"
let lastMatches = null;   // cache between results + detail views
let dockCat = null;
let bubbleTimer = null;

// ---------- dock (pantry screen only) ----------

function renderDock() {
  const { selectedIngredientIds } = store.get();
  const n = selectedIngredientIds.length;
  dock.innerHTML = `
    <div class="dock-inner">
      <div class="cat-bubble" id="cat-bubble" role="status"></div>
      <div class="dock-bar">
        <div class="dock-cat" id="dock-cat"></div>
        <div class="dock-count">
          <strong>${n === 0 ? 'Fridge Cat is waiting' : `${n} ingredient${n === 1 ? '' : 's'}`}</strong>
          <span class="dock-hint">${n === 0 ? 'Tap what you have on hand' : 'Salt, oil, and sugar are assumed'}</span>
        </div>
        <button class="sniff-btn" id="sniff-btn" ${n === 0 ? 'disabled' : ''}>
          ${ICONS.nose} Sniff it out
        </button>
      </div>
    </div>`;
  dock.hidden = false;

  dockCat?.destroy();
  dockCat = createCat(document.getElementById('dock-cat'));
  dockCat.set(n === 0 ? 'hungry' : 'idle');

  document.getElementById('sniff-btn').addEventListener('click', () => {
    sniffOffset = 0;
    location.hash = '#/results';
  });
}

function showBubble(text, ms = 3200) {
  const el = document.getElementById('cat-bubble');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// ---------- pantry ----------

function renderPantry() {
  const { selectedIngredientIds, customIngredients } = store.get();
  const selected = new Set(selectedIngredientIds);
  const q = normalize(searchQuery);

  const matchesQuery = (ing) =>
    !q ||
    normalize(ing.name).includes(q) ||
    ing.aliases.some((a) => normalize(a).includes(q));

  const chipHtml = (ing, removable = false) => `
    <button class="chip" data-id="${ing.id}" aria-pressed="${selected.has(ing.id)}">
      ${ICONS.check}${esc(ing.name)}${removable
        ? `<span class="chip-remove" data-remove="${ing.id}" title="Remove" aria-label="Remove ${esc(ing.name)}">&times;</span>`
        : ''}
    </button>`;

  const sections = CATEGORIES.map((cat) => {
    let items = INGREDIENTS.filter((i) => i.category === cat.id && matchesQuery(i));
    let extra = '';
    if (cat.id === 'other') {
      const customs = customIngredients.filter((c) => !q || normalize(c.name).includes(q));
      extra = customs.map((c) => chipHtml({ ...c, aliases: [] }, true)).join('');
    }
    if (items.length === 0 && !extra) return '';
    const count = items.filter((i) => selected.has(i.id)).length +
      (cat.id === 'other'
        ? customIngredients.filter((c) => selected.has(c.id)).length : 0);
    return `
      <section class="category">
        <h2>${cat.label}${count ? `<span class="cat-count">${count} picked</span>` : ''}</h2>
        <div class="chip-grid">${items.map((i) => chipHtml(i)).join('')}${extra}</div>
      </section>`;
  }).join('');

  const anyVisible = sections.trim() !== '';
  const exactExists = q && [...INGREDIENTS, ...customIngredients]
    .some((i) => normalize(i.name) === q || (i.aliases || []).some((a) => normalize(a) === q));

  app.innerHTML = `
    <header class="app-header">
      ${LOGO_FACE}
      <div>
        <h1 class="app-title">Fridge Cat</h1>
        <p class="app-tag">Tap what you have. The cat finds dinner.</p>
      </div>
    </header>
    <div class="search-wrap">
      <div class="search-bar">
        ${ICONS.search}
        <input id="search" type="search" placeholder="Find or add an ingredient"
               value="${esc(searchQuery)}" autocomplete="off" aria-label="Search ingredients">
        ${q && !exactExists ? `<button class="search-add" id="add-custom">Add "${esc(searchQuery.trim())}"</button>` : ''}
      </div>
    </div>
    ${anyVisible ? sections : `<p class="no-hits">Nothing in the pantry matches. Add it and the cat will keep it in mind.</p>`}
  `;

  const input = document.getElementById('search');
  input.addEventListener('input', () => {
    searchQuery = input.value;
    const pos = input.selectionStart;
    renderPantry();
    const el = document.getElementById('search');
    el.focus();
    el.setSelectionRange(pos, pos);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      store.addCustom(input.value);
      searchQuery = '';
      renderPantry();
      renderDock();
      showBubble('Noted. I will keep an eye out for it.');
    }
  });

  document.getElementById('add-custom')?.addEventListener('click', () => {
    store.addCustom(searchQuery);
    searchQuery = '';
    renderPantry();
    renderDock();
    showBubble('Noted. I will keep an eye out for it.');
  });

  app.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      const removeId = e.target.closest?.('[data-remove]')?.dataset.remove;
      if (removeId) { store.removeCustom(removeId); renderPantry(); renderDock(); return; }
      store.toggle(chip.dataset.id);
      chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') !== 'true');
      renderDock();
    });
  });

  renderDock();
}

// ---------- results ----------

const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

function cardHtml(m) {
  const req = m.recipe.requiredIngredientIds.length;
  const missNames = m.missing.map((id) => (ingredientById.get(id)?.name ?? id).toLowerCase());
  const badge = m.status === 'ready'
    ? `<span class="match-badge ready">Ready to cook</span>`
    : `<span class="match-badge almost">You have ${m.ownedRequired}/${req}</span>`;
  const missingLine = m.missing.length === 0
    ? `<p class="card-missing">Everything is in your fridge already.</p>`
    : `<p class="card-missing">Just missing ${missNames.map((n) => `<span class="miss">${esc(n)}</span>`).join(' and ')}.</p>`;
  return `
    <a class="recipe-card reveal" href="#/recipe/${m.recipe.id}">
      <div class="card-top">
        <h3 class="card-name">${esc(m.recipe.name)}</h3>
        ${badge}
      </div>
      ${missingLine}
      <div class="card-meta">
        <span>${ICONS.clock} ${m.recipe.timeMinutes} min</span>
        <span>${ICONS.flame} ${difficultyLabel[m.recipe.difficulty]}</span>
        <span>${ICONS.bowl} Serves ${m.recipe.servings}</span>
      </div>
    </a>`;
}

function renderResults() {
  const { selectedIngredientIds, assumeStaples } = store.get();
  if (selectedIngredientIds.length === 0) { location.hash = '#/pantry'; return; }
  dock.hidden = true;
  dockCat?.destroy(); dockCat = null;

  lastMatches = matchRecipes(selectedIngredientIds, { assumeStaples });
  const pool = lastMatches;
  const start = sniffOffset % pool.length;
  const picks = [];
  for (let i = 0; i < Math.min(MATCH.resultsPerSniff, pool.length); i++) {
    picks.push(pool[(start + i) % pool.length]);
  }
  const best = picks[0];
  const strong = best && (best.status === 'ready' || best.status === 'almost');

  // Phase 1: sniffing
  app.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/pantry">${ICONS.back} Pantry</a>
    </div>
    <div class="results-stage">
      <div class="cat" id="results-cat"></div>
      <h2 class="results-title">Sniffing around</h2>
      <p class="results-sub">Something is definitely in there.</p>
      <div id="results-list" aria-live="polite"></div>
    </div>`;

  const cat = createCat(document.getElementById('results-cat'));
  cat.set('sniffing');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    if (!document.getElementById('results-cat')) { cat.destroy(); return; }
    const title = document.querySelector('.results-title');
    const sub = document.querySelector('.results-sub');

    if (strong) {
      cat.set('found', { revertTo: 'idle' });
      const ready = picks.filter((p) => p.status === 'ready').length;
      title.textContent = ready > 0 ? 'Found it!' : 'So close to dinner';
      sub.textContent = ready > 0
        ? `You can cook ${ready === 1 ? 'this' : 'these'} right now.`
        : 'One tiny shopping trip away.';
    } else {
      cat.set('shrug', { revertTo: 'idle' });
      title.textContent = 'Hmm. Slim pickings';
      const near = best?.missing?.length === 1
        ? ingredientById.get(best.missing[0])?.name : null;
      sub.textContent = near
        ? `You are just ${near.toLowerCase()} away from ${best.recipe.name}.`
        : 'Here is the closest thing to dinner.';
    }

    document.getElementById('results-list').innerHTML =
      picks.map(cardHtml).join('') + `
      <div class="results-actions">
        <button class="sniff-again" id="sniff-again">${ICONS.nose} Sniff again</button>
      </div>`;

    document.getElementById('sniff-again').addEventListener('click', () => {
      sniffOffset += MATCH.resultsPerSniff;
      renderResults();
    });
  }, reduce ? 150 : TIMING.sniffMs);
}

// ---------- recipe detail ----------

function renderRecipe(id) {
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) { location.hash = '#/pantry'; return; }
  dock.hidden = true;
  dockCat?.destroy(); dockCat = null;

  const { selectedIngredientIds, assumeStaples } = store.get();
  const owned = new Set(selectedIngredientIds);
  if (assumeStaples) {
    for (const ing of INGREDIENTS) if (ing.isStaple) owned.add(ing.id);
  }

  const pill = (ingId, optional = false) => {
    const ing = ingredientById.get(ingId);
    const has = owned.has(ingId);
    return `
      <li class="ing-pill ${has ? 'owned' : 'missing'} ${optional ? 'optional' : ''}">
        ${has ? ICONS.checkSmall : ''}${esc(ing?.name ?? ingId)}${optional ? ' (optional)' : ''}
      </li>`;
  };

  app.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/results">${ICONS.back} Back</a>
    </div>
    <article class="detail-card">
      <h2 class="detail-name">${esc(recipe.name)}</h2>
      <div class="detail-meta">
        <span>${ICONS.clock} ${recipe.timeMinutes} min</span>
        <span>${ICONS.flame} ${difficultyLabel[recipe.difficulty]}</span>
        <span>${ICONS.bowl} Serves ${recipe.servings}</span>
      </div>
      <h3 class="detail-section">Ingredients</h3>
      <ul class="ing-list">
        ${recipe.requiredIngredientIds.map((i) => pill(i)).join('')}
        ${recipe.optionalIngredientIds.map((i) => pill(i, true)).join('')}
      </ul>
      <h3 class="detail-section">Steps</h3>
      <ol class="steps">
        ${recipe.steps.map((s) => `<li>${esc(s)}</li>`).join('')}
      </ol>
      <button class="made-btn" id="made-btn">I made it</button>
      <div class="detail-cat" id="detail-cat" hidden></div>
    </article>`;

  document.getElementById('made-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.classList.contains('done')) return;
    store.markMade(recipe.id);
    btn.classList.add('done');
    btn.textContent = 'Chef’s kiss. Nice work!';
    const mountEl = document.getElementById('detail-cat');
    mountEl.hidden = false;
    const cat = createCat(mountEl);
    cat.set('kiss');
  });
}

// ---------- router ----------

function route() {
  const hash = location.hash || '#/pantry';
  window.scrollTo(0, 0);
  const recipeMatch = hash.match(/^#\/recipe\/(.+)$/);
  if (recipeMatch) return renderRecipe(recipeMatch[1]);
  if (hash === '#/results') return renderResults();
  searchQuery = '';
  renderPantry();
}

window.addEventListener('hashchange', route);
route();
