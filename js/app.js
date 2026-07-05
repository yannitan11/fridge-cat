// Hash router + views: #/home, #/pantry, #/results, #/recipe/<id>, #/log
import { CATEGORIES, INGREDIENTS, RECIPES } from './data.js';
import { MATCH, TIMING } from './config.js';
import { matchRecipes, ingredientById, normalize } from './match.js';
import { store } from './store.js';
import { createCat } from './cat.js';
import { dishArt } from './food-art.js';
import { NUTRITION, scaleAmount } from './nutrition.js';
import { photos, fileToDataUrl } from './photos.js';
import { pantryHealth, itemStatus, daysLeft, daysLeftLabel, MOOD_STATE } from './freshness.js';

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
  heart: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 17S3 12.5 3 7.8C3 5.2 5 3.5 7.2 3.5c1.2 0 2.2.6 2.8 1.6.6-1 1.6-1.6 2.8-1.6C15 3.5 17 5.2 17 7.8 17 12.5 10 17 10 17Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  heartFill: '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17S3 12.5 3 7.8C3 5.2 5 3.5 7.2 3.5c1.2 0 2.2.6 2.8 1.6.6-1 1.6-1.6 2.8-1.6C15 3.5 17 5.2 17 7.8 17 12.5 10 17 10 17Z" fill="currentColor"/></svg>',
  cart: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1.5 2h2l1.8 8.5h7.2l1.6-6H4.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="13.5" r="1.2" fill="currentColor"/><circle cx="11.5" cy="13.5" r="1.2" fill="currentColor"/></svg>',
  book: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3.5C6.5 2 4 2 2 2.7V13c2-.7 4.5-.7 6 .8 1.5-1.5 4-1.5 6-.8V2.7C12 2 9.5 2 8 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 3.5V13.8" stroke="currentColor" stroke-width="1.6"/></svg>',
  sort: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 2.5v11M5 13.5 2.5 11M5 13.5 7.5 11M11 13.5v-11M11 2.5 8.5 5M11 2.5l2.5 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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
  const { makes, shopping, pantry, rescuedCount } = store.get();
  const recent = makes.slice(0, 3);
  const toBuy = shopping.filter((s) => !s.done).length;
  const health = pantryHealth(pantry);
  const streak = store.streakDays();
  const statBits = [];
  if (rescuedCount > 0) statBits.push(`${rescuedCount} ingredient${rescuedCount === 1 ? '' : 's'} rescued`);
  if (streak >= 1) statBits.push(`fresh streak: ${streak} day${streak === 1 ? '' : 's'}`);

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
      ${statBits.length ? `<p class="home-stats">${statBits.join(' &middot; ')}</p>` : ''}
      <div class="home-actions">
        <a class="btn-primary" href="#/pantry">${ICONS.nose} Open the fridge</a>
        <div class="home-links">
          <a class="btn-outline small" href="#/cookbook">${ICONS.book} Cookbook</a>
          <a class="btn-outline small" href="#/log">Log${makes.length ? ` (${makes.length})` : ''}</a>
          <a class="btn-outline small" href="#/shopping">${ICONS.cart} List${toBuy ? ` (${toBuy})` : ''}</a>
        </div>
      </div>
    </div>
    ${recentHtml}`;

  trackCat(document.getElementById('home-cat')).set(MOOD_STATE[health.mood]);
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
  const { selectedIngredientIds, pantry } = store.get();
  const n = selectedIngredientIds.length;
  const health = pantryHealth(pantry);
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
  dockCat.set(n === 0 ? 'hungry' : MOOD_STATE[health.mood]);

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

// Quick freshness adjust: 3 options, no date picker, anchored to the chip.
function closeAdjustMenu() {
  document.querySelector('.adjust-menu')?.remove();
}

function openAdjustMenu(anchor, ingId) {
  closeAdjustMenu();
  const menu = document.createElement('div');
  menu.className = 'adjust-menu';
  menu.innerHTML = `
    <button data-adj="fresh">Fresh today</button>
    <button data-adj="aged">A few days in</button>
    <button data-adj="soon">Going bad soon</button>`;
  document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect();
  menu.style.top = `${r.bottom + window.scrollY + 6}px`;
  menu.style.left = `${Math.max(8, Math.min(r.left + window.scrollX, window.innerWidth - 180))}px`;
  menu.querySelectorAll('[data-adj]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      store.adjustItem(ingId, b.dataset.adj);
      closeAdjustMenu();
      renderPantry();
    }));
  setTimeout(() => document.addEventListener('click', closeAdjustMenu, { once: true }), 0);
}

const STATUS_COPY = {
  expired: 'past its best',
  urgent: 'best used today',
  useSoon: 'use in a day or two',
};

function fridgeCheckHtml(health) {
  const atRisk = [...health.expired, ...health.urgent, ...health.useSoon];
  if (atRisk.length === 0) return '';
  return `
    <section class="fridge-check">
      <h2 class="section-label">Fridge check</h2>
      ${atRisk.map((item) => {
        const ing = ingredientById.get(item.ingredientId);
        const name = ing?.name
          ?? store.get().customIngredients.find((c) => c.id === item.ingredientId)?.name
          ?? item.ingredientId;
        const s = itemStatus(item);
        return `
          <div class="check-row">
            <div class="check-info">
              <strong>${esc(name)}</strong>
              <span class="check-status s-${s}">${STATUS_COPY[s]}</span>
            </div>
            <div class="check-actions">
              <button class="check-btn primary" data-resolve="used:${item.ingredientId}">Used it</button>
              <button class="check-btn" data-resolve="extend:${item.ingredientId}">Still good</button>
              <button class="check-btn" data-resolve="toss:${item.ingredientId}">Tossed</button>
            </div>
          </div>`;
      }).join('')}
    </section>`;
}

let freshBubbleShown = false;

function renderPantry() {
  const { selectedIngredientIds, customIngredients, pantry } = store.get();
  const selected = new Set(selectedIngredientIds);
  const q = normalize(searchQuery);
  const health = pantryHealth(pantry);

  const matchesQuery = (ing) =>
    !q ||
    normalize(ing.name).includes(q) ||
    ing.aliases.some((a) => normalize(a).includes(q));

  const chipHtml = (ing, removable = false) => {
    let hint = '';
    if (selected.has(ing.id)) {
      const item = store.itemFor(ing.id);
      // hint only inside a one-week horizon: long-life items stay quiet
      if (item && item.shelfLifeDays != null && daysLeft(item) <= 7) {
        const s = itemStatus(item);
        hint = `<span class="chip-days s-${s}" data-adjust="${ing.id}"
                 title="Tap to adjust freshness" role="button">${daysLeftLabel(item)}</span>`;
      }
    }
    return `
    <button class="chip" data-id="${ing.id}" aria-pressed="${selected.has(ing.id)}">
      ${ICONS.check}${esc(ing.name)}${hint}${removable
        ? `<span class="chip-remove" data-remove="${ing.id}" title="Remove" aria-label="Remove ${esc(ing.name)}">&times;</span>`
        : ''}
    </button>`;
  };

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
    ${q ? '' : fridgeCheckHtml(health)}
    ${anyVisible ? sections : `<p class="no-hits">Nothing in the pantry matches. Add it and the cat will keep it in mind.</p>`}
  `;

  // one-tap resolves from the fridge check: no friction, no judgment
  app.querySelectorAll('[data-resolve]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const [action, ingId] = btn.dataset.resolve.split(':');
      const wasExpired = itemStatus(store.itemFor(ingId)) === 'expired';
      const { rescued } = store.resolveItem(ingId, action);
      renderPantry();
      if (rescued) {
        showBubble(`Rescue! That makes ${store.get().rescuedCount} saved.`);
        dockCat?.set('found', { revertTo: 'idle' });
      } else if (action === 'toss' && wasExpired) {
        showBubble('No stress. A fresh streak starts right now.');
        dockCat?.set('sad', { revertTo: 'idle' });
      } else if (action === 'extend') {
        showBubble('Good to know. I gave it a couple more days.');
      }
    }));

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
      const adjustId = e.target.closest?.('[data-adjust]')?.dataset.adjust;
      if (adjustId) {
        e.stopPropagation();
        openAdjustMenu(e.target.closest('[data-adjust]'), adjustId);
        return;
      }
      const removeId = e.target.closest?.('[data-remove]')?.dataset.remove;
      if (removeId) { store.removeCustom(removeId); renderPantry(); return; }
      store.toggle(chip.dataset.id);
      renderPantry();
    });
  });

  renderDock();

  // passive nudge: one gentle line when something wants cooking today
  if (!freshBubbleShown && health.urgent.length > 0) {
    freshBubbleShown = true;
    const names = health.urgent
      .map((p) => (ingredientById.get(p.ingredientId)?.name ?? p.ingredientId).toLowerCase());
    const label = names.length === 1 ? `The ${names[0]} wants` : `The ${names.join(' and the ')} want`;
    showBubble(`${label} to be cooked today.`, 4200);
  }
}

// ---------- results ----------

function cardHtml(m) {
  const req = m.recipe.requiredIngredientIds.length;
  const kcal = NUTRITION[m.recipe.id]?.kcal;
  const inList = new Set(store.get().shopping.map((s) => s.id));
  const badge = m.status === 'ready'
    ? `<span class="match-badge ready">Ready to cook</span>`
    : `<span class="match-badge almost">You have ${m.ownedRequired}/${req}</span>`;
  const missingLine = m.missing.length === 0
    ? `<p class="card-missing">Everything is in your fridge already.</p>`
    : `<p class="card-missing">Just missing ${m.missing.map((id) => {
        const name = (ingredientById.get(id)?.name ?? id).toLowerCase();
        return `<span class="miss ${inList.has(id) ? 'in-list' : ''}" data-shop="${id}"
                 role="button" tabindex="0"
                 title="Tap to add to your shopping list">${esc(name)}</span>`;
      }).join(' and ')}.</p>`;
  const rescueNames = (m.rescueIds ?? [])
    .map((id) => (ingredientById.get(id)?.name ?? id).toLowerCase());
  const rescueLine = rescueNames.length === 0 ? '' :
    `<p class="card-rescue">${ICONS.nose} Uses your ${rescueNames.join(' and ')} before ${rescueNames.length === 1 ? 'it goes' : 'they go'}.</p>`;
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
          ${rescueLine}
          <div class="card-meta">
            <span>${ICONS.clock} ${m.recipe.timeMinutes} min</span>
            <span>${ICONS.flame} ${difficultyLabel[m.recipe.difficulty]}</span>
            ${kcal ? `<span>${ICONS.bolt} ~${kcal} kcal</span>` : ''}
          </div>
        </div>
      </div>
    </a>`;
}

const TIME_FILTERS = [
  { id: 'any', label: 'Any time', max: Infinity },
  { id: 't20', label: 'Under 20 min', max: 20 },
  { id: 't40', label: 'Under 40 min', max: 40 },
];
const KCAL_FILTERS = [
  { id: 'any', label: 'Any kcal', max: Infinity },
  { id: 'k400', label: 'Under 400 kcal', max: 400 },
  { id: 'k600', label: 'Under 600 kcal', max: 600 },
];
const MATCH_FILTERS = [
  { id: 'any',    label: 'Any match' },
  { id: 'ready',  label: 'Ready to cook' },
  { id: 'almost', label: 'Missing 1 or 2' },
];
const SORTS = [
  { id: 'best',        label: 'Best match' },
  { id: 'ingredients', label: 'Fewest ingredients' },
  { id: 'missing',     label: 'Fewest missing' },
];
let timeFilter = 'any';
let kcalFilter = 'any';
let matchFilter = 'any';
let sortBy = 'best';

function filteredPool() {
  const { selectedIngredientIds, assumeStaples, pantry } = store.get();
  const health = pantryHealth(pantry);
  const atRiskIds = new Set([...health.urgent, ...health.useSoon].map((p) => p.ingredientId));
  const pool = matchRecipes(selectedIngredientIds, { assumeStaples, atRiskIds });
  const tMax = TIME_FILTERS.find((f) => f.id === timeFilter).max;
  const kMax = KCAL_FILTERS.find((f) => f.id === kcalFilter).max;
  const out = pool.filter((m) => {
    if (m.recipe.timeMinutes > tMax) return false;
    if ((NUTRITION[m.recipe.id]?.kcal ?? 0) > kMax) return false;
    if (matchFilter === 'ready' && m.status !== 'ready') return false;
    if (matchFilter === 'almost' && m.status !== 'ready' && m.status !== 'almost') return false;
    return true;
  });
  // pool arrives sorted by match score; re-sort only for the other modes
  if (sortBy === 'ingredients') {
    out.sort((a, b) =>
      a.recipe.requiredIngredientIds.length - b.recipe.requiredIngredientIds.length ||
      b.score - a.score);
  } else if (sortBy === 'missing') {
    out.sort((a, b) => a.missing.length - b.missing.length || b.score - a.score);
  }
  return out;
}

function renderResults() {
  const { selectedIngredientIds } = store.get();
  if (selectedIngredientIds.length === 0) { location.hash = '#/pantry'; return; }
  dock.hidden = true;

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
    document.querySelector('.loading-dots')?.remove();
    document.getElementById('fridge-scene').classList.add('fridge-done');
    revealResults(cat, true);
  }, reduce ? 150 : TIMING.sniffMs);
}

// Phase 2: ranked cards + time/kcal filters. Re-runs instantly on filter
// taps (no re-sniff); `react` animates the cat only on the first reveal.
function revealResults(cat, react) {
  const list = document.getElementById('results-list');
  const title = document.querySelector('.results-title');
  const sub = document.querySelector('.results-sub');
  if (!list) return;

  const pool = filteredPool();
  const picks = [];
  if (pool.length > 0) {
    const start = sniffOffset % pool.length;
    for (let i = 0; i < Math.min(MATCH.resultsPerSniff, pool.length); i++) {
      picks.push(pool[(start + i) % pool.length]);
    }
  }
  const best = picks[0];
  const strong = best && (best.status === 'ready' || best.status === 'almost');
  const ready = picks.filter((p) => p.status === 'ready').length;

  if (picks.length === 0) {
    if (react) cat.set('shrug', { revertTo: 'idle' });
    title.textContent = 'Nothing fits those filters';
    sub.textContent = 'Loosen one, or sniff again later.';
  } else if (strong) {
    if (react) cat.set('found', { revertTo: 'idle' });
    title.textContent = ready > 0 ? 'Found it!' : 'So close to dinner';
    const rescueName = best.rescueIds?.length
      ? (ingredientById.get(best.rescueIds[0])?.name ?? '').toLowerCase() : null;
    sub.textContent = rescueName
      ? `The top one rescues your ${rescueName}!`
      : ready > 0
        ? `You can cook ${ready === 1 ? 'this' : 'these'} right now.`
        : 'One tiny shopping trip away.';
  } else {
    if (react) cat.set('shrug', { revertTo: 'idle' });
    title.textContent = 'Hmm. Slim pickings';
    const near = best?.missing?.length === 1
      ? ingredientById.get(best.missing[0])?.name : null;
    sub.textContent = near
      ? `You are just ${near.toLowerCase()} away from ${best.recipe.name}.`
      : 'Here is the closest thing to dinner.';
  }

  const dropdown = (id, icon, filters, active, label, activeWhen = 'any') => `
    <label class="select-pill ${active !== activeWhen ? 'active' : ''}">
      ${icon}
      <select id="${id}" aria-label="${label}">
        ${filters.map((f) => `<option value="${f.id}" ${f.id === active ? 'selected' : ''}>${f.label}</option>`).join('')}
      </select>
      <svg class="select-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </label>`;

  list.innerHTML = `
    <div class="results-filters">
      ${dropdown('filter-match', ICONS.checkSmall, MATCH_FILTERS, matchFilter, 'Filter by match')}
      ${dropdown('filter-time', ICONS.clock, TIME_FILTERS, timeFilter, 'Filter by time')}
      ${dropdown('filter-kcal', ICONS.bolt, KCAL_FILTERS, kcalFilter, 'Filter by calories')}
      ${dropdown('filter-sort', ICONS.sort, SORTS, sortBy, 'Sort results', 'best')}
    </div>
    ${picks.map(cardHtml).join('')}
    <div class="results-actions">
      <button class="sniff-again" id="sniff-again">${ICONS.nose} Sniff again</button>
    </div>`;

  const onFilterChange = (id, apply) =>
    document.getElementById(id).addEventListener('change', (e) => {
      apply(e.target.value);
      sniffOffset = 0;
      revealResults(cat, false);
    });
  onFilterChange('filter-match', (v) => { matchFilter = v; });
  onFilterChange('filter-time', (v) => { timeFilter = v; });
  onFilterChange('filter-kcal', (v) => { kcalFilter = v; });
  onFilterChange('filter-sort', (v) => { sortBy = v; });

  document.getElementById('sniff-again').addEventListener('click', () => {
    sniffOffset += MATCH.resultsPerSniff;
    revealResults(cat, false);
  });

  // missing-ingredient chips inside cards: toggle shopping list, don't navigate
  list.querySelectorAll('.miss[data-shop]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ingId = el.dataset.shop;
      const name = ingredientById.get(ingId)?.name ?? ingId;
      const added = store.toggleShopping(ingId, name);
      el.classList.toggle('in-list', added);
    });
  });
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
  const { favoriteIds, shopping } = store.get();
  const inList = new Set(shopping.map((s) => s.id));
  const isFav = favoriteIds.includes(recipe.id);
  const cooked = store.timesMade(recipe.id);
  let servings = recipe.servings;

  const pill = (ingId, optional = false) => {
    const ing = ingredientById.get(ingId);
    const has = owned.has(ingId);
    const amt = !optional && info?.amounts?.[ingId];
    const amtSpan = amt ? `<span class="amt" data-base="${esc(amt)}">${esc(amt)}</span>` : '';
    if (!has && !optional) {
      return `
        <li class="ing-wrap"><button class="ing-pill missing ${inList.has(ingId) ? 'listed' : ''}"
            data-shop="${ingId}" aria-pressed="${inList.has(ingId)}">
          ${esc(ing?.name ?? ingId)}${amtSpan}<span class="shop-state"></span>
        </button></li>`;
    }
    return `
      <li class="ing-pill ${has ? 'owned' : 'missing'} ${optional ? 'optional' : ''}">
        ${has ? ICONS.checkSmall : ''}${esc(ing?.name ?? ingId)}${amtSpan}${optional ? ' (optional)' : ''}
      </li>`;
  };

  app.innerHTML = `
    <div class="screen-head">
      <button class="back-btn" id="detail-back">${ICONS.back} Back</button>
    </div>
    <article class="detail-card">
      <button class="fav-btn ${isFav ? 'on' : ''}" id="fav-btn"
              aria-label="${isFav ? 'Remove from' : 'Add to'} favorites" aria-pressed="${isFav}">
        ${isFav ? ICONS.heartFill : ICONS.heart}
      </button>
      <div class="detail-head">
        <div class="dish-hero">${dishArt(recipe.id)}</div>
        <div>
          <h2 class="detail-name">${esc(recipe.name)}</h2>
          <div class="detail-meta">
            <span>${ICONS.clock} ${recipe.timeMinutes} min</span>
            <span>${ICONS.flame} ${difficultyLabel[recipe.difficulty]}</span>
            ${info ? `<span>${ICONS.bolt} ~${info.kcal} kcal / serving</span>` : ''}
          </div>
          ${cooked > 0 ? `<p class="made-count">You have made this ${cooked === 1 ? 'once' : cooked + ' times'}.</p>` : ''}
        </div>
      </div>
      <div class="section-row">
        <h3 class="detail-section">Ingredients</h3>
        <div class="stepper" role="group" aria-label="Servings">
          <button class="step-btn" id="serv-minus" aria-label="Fewer servings">&minus;</button>
          <span class="step-label" id="serv-label">${servings} serving${servings === 1 ? '' : 's'}</span>
          <button class="step-btn" id="serv-plus" aria-label="More servings">+</button>
        </div>
      </div>
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

  document.getElementById('detail-back').addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.hash = '#/home';
  });

  document.getElementById('fav-btn').addEventListener('click', (e) => {
    const on = store.toggleFavorite(recipe.id);
    e.currentTarget.classList.toggle('on', on);
    e.currentTarget.setAttribute('aria-pressed', on);
    e.currentTarget.innerHTML = on ? ICONS.heartFill : ICONS.heart;
  });

  // servings stepper: rescale every amount from its base string
  const applyServings = () => {
    document.getElementById('serv-label').textContent =
      `${servings} serving${servings === 1 ? '' : 's'}`;
    const factor = servings / recipe.servings;
    app.querySelectorAll('.amt[data-base]').forEach((el) => {
      el.textContent = scaleAmount(el.dataset.base, factor);
    });
  };
  document.getElementById('serv-minus').addEventListener('click', () => {
    if (servings > 1) { servings -= 1; applyServings(); }
  });
  document.getElementById('serv-plus').addEventListener('click', () => {
    if (servings < 8) { servings += 1; applyServings(); }
  });

  // missing required ingredients: tap to toggle on the shopping list
  app.querySelectorAll('[data-shop]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ingId = btn.dataset.shop;
      const name = ingredientById.get(ingId)?.name ?? ingId;
      const added = store.toggleShopping(ingId, name);
      btn.classList.toggle('listed', added);
      btn.setAttribute('aria-pressed', added);
    });
  });

  let makeEntry = null;
  document.getElementById('made-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.classList.contains('done')) return;
    makeEntry = store.markMade(recipe.id);
    // cooking consumes the perishable ingredients; at-risk ones are rescues
    const { rescues } = store.consumeForRecipe(recipe.requiredIngredientIds);
    btn.classList.add('done');
    btn.textContent = 'Chef’s kiss. Nice work!';
    const photoWrap = document.getElementById('made-photo');
    photoWrap.hidden = false;
    if (rescues > 0) {
      document.querySelector('.made-note').textContent =
        `Rescue! ${rescues === 1 ? 'One ingredient' : rescues + ' ingredients'} saved from the bin. Show it off?`;
    }
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

// ---------- welcome (first run) ----------

const SLIDES = [
  {
    title: 'Tap what you have',
    body: 'No accounts, no meal plans. Just tell the cat what is in your fridge.',
    script: 'the whole fridge, chip by chip',
  },
  {
    title: 'The cat finds dinner',
    body: 'A quick sniff turns your ingredients into 1 to 3 recipes you can cook right now.',
    script: 'trust the nose',
  },
  {
    title: 'Cook it. Log it.',
    body: 'Every meal you make lands in your kitchen log, with a photo if you are proud of it.',
    script: 'chef’s kiss',
  },
];

function renderWelcome() {
  dock.hidden = true;
  let step = 0;

  function draw() {
    const s = SLIDES[step];
    const last = step === SLIDES.length - 1;
    app.innerHTML = `
      <div class="welcome">
        <div class="welcome-art">
          ${step === 1 ? FRIDGE_SVG : `<div class="cat welcome-cat" id="welcome-cat"></div>`}
        </div>
        <p class="welcome-script">${s.script}</p>
        <h1 class="welcome-title">${s.title}</h1>
        <p class="welcome-body">${s.body}</p>
        <div class="welcome-dots" aria-hidden="true">
          ${SLIDES.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}
        </div>
        <div class="welcome-actions">
          <button class="welcome-skip" id="welcome-skip">Skip</button>
          <button class="btn-primary" id="welcome-next">${last ? 'Open the fridge' : 'Next'}</button>
        </div>
      </div>`;

    const catEl = document.getElementById('welcome-cat');
    if (catEl) trackCat(catEl).set(step === 2 ? 'kiss' : 'idle');

    const finish = () => { store.setOnboarded(); location.hash = '#/home'; };
    document.getElementById('welcome-skip').addEventListener('click', finish);
    document.getElementById('welcome-next').addEventListener('click', () => {
      if (last) finish();
      else { step += 1; draw(); }
    });
  }
  draw();
}

// ---------- cookbook ----------

const COOKBOOK_FILTERS = [
  { id: 'all',       label: 'All',       test: () => true },
  { id: 'faves',     label: 'Faves',     test: (r, favs) => favs.includes(r.id) },
  { id: 'veggie',    label: 'Veggie',    test: (r) => r.tags.includes('vegetarian') || r.tags.includes('vegan') },
  { id: 'quick',     label: 'Quick',     test: (r) => r.timeMinutes <= 20 },
  { id: 'breakfast', label: 'Breakfast', test: (r) => r.tags.includes('breakfast') },
  { id: 'soup',      label: 'Soups',     test: (r) => r.tags.includes('soup') },
  { id: 'one-pan',   label: 'One-pan',   test: (r) => r.tags.includes('one-pan') },
  { id: 'dessert',   label: 'Sweet',     test: (r) => r.tags.includes('dessert') },
];

let cookbookFilter = 'all';

function renderCookbook() {
  dock.hidden = true;
  const { favoriteIds } = store.get();
  const filter = COOKBOOK_FILTERS.find((f) => f.id === cookbookFilter) ?? COOKBOOK_FILTERS[0];
  const list = RECIPES.filter((r) => filter.test(r, favoriteIds))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  app.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/home">${ICONS.back} Home</a>
    </div>
    <h1 class="page-title">Cookbook</h1>
    <p class="page-sub">${list.length} recipe${list.length === 1 ? '' : 's'} the cat knows.</p>
    <div class="chip-grid filter-row">
      ${COOKBOOK_FILTERS.map((f) => `
        <button class="chip" data-filter="${f.id}" aria-pressed="${f.id === cookbookFilter}">${f.label}</button>`).join('')}
    </div>
    ${list.length === 0
      ? `<p class="no-hits">Nothing hearted yet. Tap the heart on any recipe.</p>`
      : list.map((r) => {
          const kcal = NUTRITION[r.id]?.kcal;
          const fav = favoriteIds.includes(r.id);
          return `
            <a class="log-row" href="#/recipe/${r.id}">
              <div class="log-thumb">${dishArt(r.id)}</div>
              <div class="log-main">
                <strong>${esc(r.name)}</strong>
                <span>${r.timeMinutes} min${kcal ? ` &middot; ~${kcal} kcal` : ''}</span>
              </div>
              <button class="fav-toggle ${fav ? 'on' : ''}" data-fav="${r.id}"
                      aria-label="${fav ? 'Remove from' : 'Add to'} favorites" aria-pressed="${fav}">
                ${fav ? ICONS.heartFill : ICONS.heart}
              </button>
            </a>`;
        }).join('')}`;

  app.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      cookbookFilter = btn.dataset.filter;
      renderCookbook();
    });
  });

  app.querySelectorAll('[data-fav]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      store.toggleFavorite(btn.dataset.fav);
      renderCookbook();
    });
  });
}

// ---------- shopping list ----------

function renderShopping() {
  dock.hidden = true;
  const { shopping } = store.get();
  const toBuy = shopping.filter((s) => !s.done).length;
  const anyDone = shopping.some((s) => s.done);

  if (shopping.length === 0) {
    app.innerHTML = `
      <div class="screen-head">
        <a class="back-btn" href="#/home">${ICONS.back} Home</a>
      </div>
      <div class="results-stage">
        <div class="cat" id="shop-cat" style="width:150px;margin:20px auto 0"></div>
        <h2 class="results-title">Shopping list</h2>
        <p class="results-sub">Empty. Tap a missing ingredient on any recipe to add it here.</p>
        <div class="results-actions">
          <a class="btn-primary" href="#/pantry">${ICONS.nose} Open the fridge</a>
        </div>
      </div>`;
    trackCat(document.getElementById('shop-cat')).set('idle');
    return;
  }

  app.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/home">${ICONS.back} Home</a>
    </div>
    <h1 class="page-title">Shopping list</h1>
    <p class="page-sub">${toBuy === 0 ? 'All grabbed. Go cook!' : `${toBuy} thing${toBuy === 1 ? '' : 's'} to grab.`}</p>
    ${shopping.map((s) => `
      <div class="shop-row ${s.done ? 'done' : ''}">
        <button class="shop-check" data-check="${s.id}" role="checkbox" aria-checked="${s.done}"
                aria-label="${esc(s.name)}">${s.done ? ICONS.checkSmall : ''}</button>
        <span class="shop-name">${esc(s.name)}</span>
        <button class="log-remove" data-unshop="${s.id}" aria-label="Remove ${esc(s.name)}">${ICONS.cross}</button>
      </div>`).join('')}
    ${anyDone ? `<div class="results-actions"><button class="sniff-again" id="clear-done">Clear checked</button></div>` : ''}`;

  app.querySelectorAll('[data-check]').forEach((btn) =>
    btn.addEventListener('click', () => { store.toggleShoppingDone(btn.dataset.check); renderShopping(); }));
  app.querySelectorAll('[data-unshop]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const item = store.get().shopping.find((s) => s.id === btn.dataset.unshop);
      if (item) store.toggleShopping(item.id, item.name);
      renderShopping();
    }));
  document.getElementById('clear-done')?.addEventListener('click', () => {
    store.clearShoppingDone();
    renderShopping();
  });
}

// ---------- router ----------

function route() {
  const hash = location.hash || '#/home';
  window.scrollTo(0, 0);
  for (const c of cats.splice(0)) c.destroy();
  dockCat?.destroy(); dockCat = null;
  if (!store.get().onboarded && hash !== '#/welcome') {
    location.hash = '#/welcome';
    return;
  }
  const recipeMatch = hash.match(/^#\/recipe\/(.+)$/);
  if (recipeMatch) return renderRecipe(recipeMatch[1]);
  if (hash === '#/welcome') return renderWelcome();
  if (hash === '#/results') return renderResults();
  if (hash === '#/log') return renderLog();
  if (hash === '#/cookbook') return renderCookbook();
  if (hash === '#/shopping') return renderShopping();
  if (hash === '#/pantry') { searchQuery = ''; return renderPantry(); }
  renderHome();
}

window.addEventListener('hashchange', route);
route();
