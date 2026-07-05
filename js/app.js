// Hash router + views: #/home, #/pantry, #/results, #/recipe/<id>, #/log
import { CATEGORIES, INGREDIENTS, RECIPES } from './data.js';
import { MATCH, TIMING } from './config.js';
import { matchRecipes, ingredientById, normalize } from './match.js';
import { store } from './store.js';
import { createCat } from './cat.js';
import { dishArt } from './food-art.js';
import { NUTRITION } from './nutrition.js';
import { photos, fileToDataUrl } from './photos.js';

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
  bolt: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9 1.5 3.5 9H7l-1 5.5L11.5 7H8l1-5.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  camera: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.5" y="4" width="13" height="9.5" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 4 6.8 2h2.4L10.5 4" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8" cy="8.6" r="2.6" stroke="currentColor" stroke-width="1.6"/></svg>',
  back: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.8"/><path d="m12.5 12.5 3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  nose: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 8h8l-4 5Z" fill="currentColor"/><path d="M3 5c2-2.5 4-2 4-2M17 5c-2-2.5-4-2-4-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  cross: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
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

// Open fridge for the loading scene, same line-art style.
const FRIDGE_SVG = `
<svg class="fridge-svg" viewBox="0 0 150 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
     fill="none" stroke="var(--cat-line)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
  <rect x="14" y="10" width="100" height="168" rx="10" fill="var(--cat-fill)"/>
  <path d="M114 14 L 142 26 V 172 L 114 174" fill="var(--cat-fill)"/>
  <path d="M134 92 v 18" stroke-width="5"/>
  <path d="M14 60 h 100 M14 108 h 100" stroke-width="3"/>
  <g stroke-width="3" class="fridge-items">
    <g class="fi fi-1">
      <rect x="28" y="32" width="14" height="26" rx="3" fill="var(--cat-fill)"/>
      <path d="M32 32 v -6 h 6 v 6"/>
    </g>
    <g class="fi fi-2">
      <rect x="54" y="38" width="22" height="20" rx="4" fill="var(--cat-fill)"/>
      <path d="M54 46 h 22" stroke-width="2.4"/>
    </g>
    <g class="fi fi-3">
      <path d="M28 104 l 26 -14 v 14 Z" fill="var(--cat-fill)"/>
      <circle cx="42" cy="99" r="1.6" fill="var(--cat-line)" stroke="none"/>
    </g>
    <g class="fi fi-4">
      <circle cx="76" cy="94" r="11" fill="var(--cat-fill)"/>
      <path d="M76 83 q 3 -4 6 -5" stroke-width="2.4"/>
    </g>
    <g class="fi fi-5">
      <rect x="30" y="128" width="18" height="30" rx="4" fill="var(--cat-fill)"/>
      <path d="M30 138 h 18" stroke-width="2.4"/>
    </g>
    <g class="fi fi-6">
      <ellipse cx="76" cy="146" rx="14" ry="9" fill="var(--cat-fill)"/>
      <path d="M66 140 q 10 -6 20 0" stroke-width="2.4"/>
    </g>
  </g>
</svg>`;

// ---------- module state (not persisted) ----------
let searchQuery = '';
let sniffOffset = 0;      // rotates results on "sniff again"
let dockCat = null;
let bubbleTimer = null;
const cats = [];          // per-view cats, destroyed on route change

function trackCat(el) {
  const cat = createCat(el);
  cats.push(cat);
  return cat;
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

// ---------- home ----------

function renderHome() {
  dock.hidden = true;
  const { makes } = store.get();
  const recent = makes.slice(0, 3);

  const recentHtml = recent.length === 0 ? '' : `
    <section class="home-recent">
      <h2 class="section-label">Recently cooked</h2>
      ${recent.map((m) => {
        const r = RECIPES.find((x) => x.id === m.recipeId);
        if (!r) return '';
        return `
          <a class="log-row" href="#/recipe/${r.id}">
            <div class="log-thumb" data-photo="${m.hasPhoto ? m.id : ''}">${dishArt(r.id)}</div>
            <div class="log-main">
              <strong>${esc(r.name)}</strong>
              <span>${fmtDate(m.date)}</span>
            </div>
          </a>`;
      }).join('')}
      <a class="see-all" href="#/log">See the full log</a>
    </section>`;

  app.innerHTML = `
    <div class="home-hero">
      <div class="cat home-cat" id="home-cat"></div>
      <h1 class="home-title">Fridge Cat</h1>
      <p class="home-tag">Tap what's in your fridge. The cat finds dinner.</p>
      <div class="home-actions">
        <a class="btn-primary" href="#/pantry">${ICONS.nose} Open the fridge</a>
        <a class="btn-outline" href="#/log">Kitchen log${makes.length ? ` (${makes.length})` : ''}</a>
      </div>
    </div>
    ${recentHtml}`;

  trackCat(document.getElementById('home-cat')).set('idle');
  loadPhotoThumbs();
}

// Fill .log-thumb elements that have a photo id with the stored image.
function loadPhotoThumbs() {
  app.querySelectorAll('.log-thumb[data-photo]').forEach(async (el) => {
    const id = el.dataset.photo;
    if (!id) return;
    try {
      const dataUrl = await photos.get(id);
      if (dataUrl && el.isConnected) {
        el.innerHTML = `<img src="${dataUrl}" alt="Your photo of this meal">`;
      }
    } catch { /* keep the dish art */ }
  });
}

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
    <div class="screen-head">
      <a class="back-btn" href="#/home">${ICONS.back} Home</a>
    </div>
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
      showBubble('Noted. I will keep an eye out for it.');
    }
  });

  document.getElementById('add-custom')?.addEventListener('click', () => {
    store.addCustom(searchQuery);
    searchQuery = '';
    renderPantry();
    showBubble('Noted. I will keep an eye out for it.');
  });

  app.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      const removeId = e.target.closest?.('[data-remove]')?.dataset.remove;
      if (removeId) { store.removeCustom(removeId); renderPantry(); return; }
      store.toggle(chip.dataset.id);
      chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') !== 'true');
      renderDock();
    });
  });

  renderDock();
}

// ---------- results ----------

function cardHtml(m) {
  const req = m.recipe.requiredIngredientIds.length;
  const missNames = m.missing.map((id) => (ingredientById.get(id)?.name ?? id).toLowerCase());
  const kcal = NUTRITION[m.recipe.id]?.kcal;
  const badge = m.status === 'ready'
    ? `<span class="match-badge ready">Ready to cook</span>`
    : `<span class="match-badge almost">You have ${m.ownedRequired}/${req}</span>`;
  const missingLine = m.missing.length === 0
    ? `<p class="card-missing">Everything is in your fridge already.</p>`
    : `<p class="card-missing">Just missing ${missNames.map((n) => `<span class="miss">${esc(n)}</span>`).join(' and ')}.</p>`;
  return `
    <a class="recipe-card reveal" href="#/recipe/${m.recipe.id}">
      <div class="card-grid">
        <div class="dish-thumb">${dishArt(m.recipe.id)}</div>
        <div class="card-main">
          <div class="card-top">
            <h3 class="card-name">${esc(m.recipe.name)}</h3>
            ${badge}
          </div>
          ${missingLine}
          <div class="card-meta">
            <span>${ICONS.clock} ${m.recipe.timeMinutes} min</span>
            <span>${ICONS.flame} ${difficultyLabel[m.recipe.difficulty]}</span>
            ${kcal ? `<span>${ICONS.bolt} ~${kcal} kcal</span>` : ''}
          </div>
        </div>
      </div>
    </a>`;
}

function renderResults() {
  const { selectedIngredientIds, assumeStaples } = store.get();
  if (selectedIngredientIds.length === 0) { location.hash = '#/pantry'; return; }
  dock.hidden = true;

  const pool = matchRecipes(selectedIngredientIds, { assumeStaples });
  const start = sniffOffset % pool.length;
  const picks = [];
  for (let i = 0; i < Math.min(MATCH.resultsPerSniff, pool.length); i++) {
    picks.push(pool[(start + i) % pool.length]);
  }
  const best = picks[0];
  const strong = best && (best.status === 'ready' || best.status === 'almost');

  // Phase 1: the loading scene — cat nose-deep in the open fridge
  app.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/pantry">${ICONS.back} Pantry</a>
    </div>
    <div class="results-stage">
      <div class="fridge-scene" id="fridge-scene">
        ${FRIDGE_SVG}
        <div class="cat fridge-cat" id="results-cat"></div>
      </div>
      <h2 class="results-title">Sniffing the shelves</h2>
      <p class="results-sub">Something is definitely in there...</p>
      <div class="loading-dots" aria-hidden="true"><i></i><i></i><i></i></div>
      <div id="results-list" aria-live="polite"></div>
    </div>`;

  const cat = trackCat(document.getElementById('results-cat'));
  cat.set('sniffing');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    if (!document.getElementById('results-cat')) return;
    const title = document.querySelector('.results-title');
    const sub = document.querySelector('.results-sub');
    document.querySelector('.loading-dots')?.remove();
    document.getElementById('fridge-scene').classList.add('fridge-done');

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
  if (!recipe) { location.hash = '#/home'; return; }
  dock.hidden = true;

  const { selectedIngredientIds, assumeStaples } = store.get();
  const owned = new Set(selectedIngredientIds);
  if (assumeStaples) {
    for (const ing of INGREDIENTS) if (ing.isStaple) owned.add(ing.id);
  }
  const info = NUTRITION[recipe.id];

  const pill = (ingId, optional = false) => {
    const ing = ingredientById.get(ingId);
    const has = owned.has(ingId);
    const amt = !optional && info?.amounts?.[ingId];
    return `
      <li class="ing-pill ${has ? 'owned' : 'missing'} ${optional ? 'optional' : ''}">
        ${has ? ICONS.checkSmall : ''}${esc(ing?.name ?? ingId)}${amt ? `<span class="amt">${esc(amt)}</span>` : ''}${optional ? ' (optional)' : ''}
      </li>`;
  };

  app.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/results">${ICONS.back} Back</a>
    </div>
    <article class="detail-card">
      <div class="detail-head">
        <div class="dish-hero">${dishArt(recipe.id)}</div>
        <div>
          <h2 class="detail-name">${esc(recipe.name)}</h2>
          <div class="detail-meta">
            <span>${ICONS.clock} ${recipe.timeMinutes} min</span>
            <span>${ICONS.flame} ${difficultyLabel[recipe.difficulty]}</span>
            <span>${ICONS.bowl} Serves ${recipe.servings}</span>
            ${info ? `<span>${ICONS.bolt} ~${info.kcal} kcal / serving</span>` : ''}
          </div>
        </div>
      </div>
      <h3 class="detail-section">Ingredients</h3>
      <ul class="ing-list">
        ${recipe.requiredIngredientIds.map((i) => pill(i)).join('')}
        ${recipe.optionalIngredientIds.map((i) => pill(i, true)).join('')}
      </ul>
      <h3 class="detail-section">How to cook</h3>
      <ol class="steps">
        ${recipe.steps.map((s) => `<li>${esc(s)}</li>`).join('')}
      </ol>
      <button class="made-btn" id="made-btn">I made it</button>
      <div class="made-photo" id="made-photo" hidden>
        <div class="cat detail-cat-inline" id="detail-cat"></div>
        <p class="made-note">Logged for today. Show it off?</p>
        <label class="photo-btn" for="photo-input">${ICONS.camera} Add a photo</label>
        <input type="file" id="photo-input" accept="image/*" hidden>
        <div class="photo-preview" id="photo-preview" hidden></div>
      </div>
    </article>`;

  let makeEntry = null;
  document.getElementById('made-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.classList.contains('done')) return;
    makeEntry = store.markMade(recipe.id);
    btn.classList.add('done');
    btn.textContent = 'Chef’s kiss. Nice work!';
    const photoWrap = document.getElementById('made-photo');
    photoWrap.hidden = false;
    trackCat(document.getElementById('detail-cat')).set('kiss');
  });

  document.getElementById('photo-input').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file || !makeEntry) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      await photos.save(makeEntry.id, dataUrl);
      store.setMakePhoto(makeEntry.id, true);
      const prev = document.getElementById('photo-preview');
      prev.hidden = false;
      prev.innerHTML = `<img src="${dataUrl}" alt="Your photo of this meal">`;
      document.querySelector('.photo-btn').textContent = 'Photo saved to your log';
    } catch {
      document.querySelector('.made-note').textContent = 'That photo would not load. Try another one?';
    }
  });
}

// ---------- kitchen log ----------

function renderLog() {
  dock.hidden = true;
  const { makes } = store.get();

  if (makes.length === 0) {
    app.innerHTML = `
      <div class="screen-head">
        <a class="back-btn" href="#/home">${ICONS.back} Home</a>
      </div>
      <div class="results-stage">
        <div class="cat" id="log-cat" style="width:150px;margin:20px auto 0"></div>
        <h2 class="results-title">Kitchen log</h2>
        <p class="results-sub">Nothing cooked yet. Go make something!</p>
        <div class="results-actions">
          <a class="btn-primary" href="#/pantry">${ICONS.nose} Open the fridge</a>
        </div>
      </div>`;
    trackCat(document.getElementById('log-cat')).set('hungry');
    return;
  }

  // group by day, newest first
  const groups = [];
  for (const m of makes) {
    const day = fmtDate(m.date);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(m);
    else groups.push({ day, items: [m] });
  }

  app.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/home">${ICONS.back} Home</a>
    </div>
    <h1 class="page-title">Kitchen log</h1>
    <p class="page-sub">${makes.length} meal${makes.length === 1 ? '' : 's'} cooked with Fridge Cat.</p>
    ${groups.map((g) => `
      <section class="log-day">
        <h2 class="section-label">${g.day}</h2>
        ${g.items.map((m) => {
          const r = RECIPES.find((x) => x.id === m.recipeId);
          if (!r) return '';
          const kcal = NUTRITION[r.id]?.kcal;
          return `
            <div class="log-row" data-make="${m.id}">
              <a class="log-thumb" href="#/recipe/${r.id}" data-photo="${m.hasPhoto ? m.id : ''}">${dishArt(r.id)}</a>
              <div class="log-main">
                <strong>${esc(r.name)}</strong>
                <span>${fmtTime(m.date)}${kcal ? ` &middot; ~${kcal} kcal` : ''}</span>
                ${m.hasPhoto ? '' : `<label class="photo-btn small" for="photo-${m.id}">${ICONS.camera} Add photo</label>
                <input type="file" id="photo-${m.id}" accept="image/*" hidden data-photo-for="${m.id}">`}
              </div>
              <button class="log-remove" data-remove-make="${m.id}" title="Remove entry" aria-label="Remove ${esc(r.name)} entry">${ICONS.cross}</button>
            </div>`;
        }).join('')}
      </section>`).join('')}`;

  loadPhotoThumbs();

  app.querySelectorAll('[data-photo-for]').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const makeId = input.dataset.photoFor;
      try {
        const dataUrl = await fileToDataUrl(file);
        await photos.save(makeId, dataUrl);
        store.setMakePhoto(makeId, true);
        renderLog();
      } catch { /* leave as is */ }
    });
  });

  app.querySelectorAll('[data-remove-make]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const makeId = btn.dataset.removeMake;
      photos.remove(makeId).catch(() => {});
      store.removeMake(makeId);
      renderLog();
    });
  });
}

// ---------- router ----------

function route() {
  const hash = location.hash || '#/home';
  window.scrollTo(0, 0);
  for (const c of cats.splice(0)) c.destroy();
  dockCat?.destroy(); dockCat = null;
  const recipeMatch = hash.match(/^#\/recipe\/(.+)$/);
  if (recipeMatch) return renderRecipe(recipeMatch[1]);
  if (hash === '#/results') return renderResults();
  if (hash === '#/log') return renderLog();
  if (hash === '#/pantry') { searchQuery = ''; return renderPantry(); }
  renderHome();
}

window.addEventListener('hashchange', route);
route();
