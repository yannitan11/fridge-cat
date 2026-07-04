// Fridge Cat, the mascot. Hand-drawn ink line-art style: cream fill +
// ink outlines, one inline SVG, states driven by data-state + CSS in
// styles.css. Swap art later by replacing this file.
//
// States: idle | hungry | sniffing | found | shrug | kiss
import { TIMING } from './config.js';

const CAT_SVG = `
<svg class="cat-svg" viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- tail: ink outline stroke with a fill-colored stroke inside -->
  <path class="cat-tail" d="M176 150 C 206 146 215 120 200 104" fill="none"
        stroke="var(--cat-line)" stroke-width="15" stroke-linecap="round"/>
  <path class="cat-tail-tip" d="M176 150 C 206 146 215 120 200 104" fill="none"
        stroke="var(--cat-fill)" stroke-width="7" stroke-linecap="round"/>

  <!-- body -->
  <g class="cat-body">
    <path d="M60 161 C 58 118 82 100 110 100 C 138 100 162 118 160 161 Z"
          fill="var(--cat-fill)" stroke="var(--cat-line)" stroke-width="4.5"
          stroke-linejoin="round"/>
    <path d="M84 120 q 8 -7 16 0 M120 114 q 8 -7 16 0" fill="none"
          stroke="var(--cat-line)" stroke-width="3.5" stroke-linecap="round"/>
    <!-- front paws -->
    <path d="M80 161 q 6 -8 13 -1 M107 161 q 6 -8 13 -1" fill="none"
          stroke="var(--cat-line)" stroke-width="3.5" stroke-linecap="round"/>
    <!-- raised paw, kiss state only -->
    <g class="cat-kiss-paw">
      <ellipse cx="147" cy="117" rx="11" ry="9" fill="var(--cat-fill)"
               stroke="var(--cat-line)" stroke-width="4"/>
    </g>
  </g>

  <!-- head -->
  <g class="cat-head">
    <g class="cat-ear-l">
      <path d="M62 54 L 68 15 L 96 39 Z" fill="var(--cat-fill)"
            stroke="var(--cat-line)" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M72 40 L 74 30" stroke="var(--cat-line)" stroke-width="3" stroke-linecap="round"/>
    </g>
    <g class="cat-ear-r">
      <path d="M156 54 L 150 15 L 122 39 Z" fill="var(--cat-fill)"
            stroke="var(--cat-line)" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M146 40 L 144 30" stroke="var(--cat-line)" stroke-width="3" stroke-linecap="round"/>
    </g>
    <ellipse cx="109" cy="68" rx="53" ry="44" fill="var(--cat-fill)"
             stroke="var(--cat-line)" stroke-width="4.5"/>
    <!-- forehead stripes -->
    <path d="M97 31 v11 M109 28 v13 M121 31 v11" stroke="var(--cat-line)"
          stroke-width="3.5" stroke-linecap="round"/>
    <!-- cheeks -->
    <ellipse class="cat-blush" cx="74" cy="82" rx="8" ry="5" fill="var(--cat-blush)"/>
    <ellipse class="cat-blush" cx="144" cy="82" rx="8" ry="5" fill="var(--cat-blush)"/>
    <!-- eyes: open / happy-closed pair, toggled by state -->
    <g class="cat-eyes-open">
      <circle cx="88" cy="66" r="6" fill="var(--cat-line)"/>
      <circle cx="130" cy="66" r="6" fill="var(--cat-line)"/>
      <circle cx="90.3" cy="63.7" r="1.9" fill="var(--cat-fill)"/>
      <circle cx="132.3" cy="63.7" r="1.9" fill="var(--cat-fill)"/>
    </g>
    <g class="cat-eyes-happy">
      <path d="M81 66 q 7 -7 14 0 M123 66 q 7 -7 14 0" fill="none"
            stroke="var(--cat-line)" stroke-width="4" stroke-linecap="round"/>
    </g>
    <!-- nose + muzzle -->
    <g class="cat-muzzle">
      <path class="cat-nose" d="M104 78 h 10 l -5 6 Z" fill="var(--cat-line)"/>
      <path class="cat-mouth-happy" d="M103 89 q 3 4 6 0 q 3 4 6 0" fill="none"
            stroke="var(--cat-line)" stroke-width="3" stroke-linecap="round"/>
      <path class="cat-mouth-flat" d="M104 90 h 11" fill="none"
            stroke="var(--cat-line)" stroke-width="3" stroke-linecap="round"/>
      <ellipse class="cat-mouth-o" cx="109" cy="91" rx="4" ry="5" fill="var(--cat-line)"/>
    </g>
    <!-- whiskers -->
    <g stroke="var(--cat-line)" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.85">
      <path d="M60 74 H 38 M61 82 L 40 88"/>
      <path d="M158 74 H 180 M157 82 L 178 88"/>
    </g>
  </g>

  <!-- reaction props -->
  <g class="cat-hearts" fill="var(--cat-heart)">
    <path class="h1" d="M168 60 c 3 -6 12 -3 9 4 c -2 5 -9 8 -9 8 c 0 0 -7 -3 -9 -8 c -3 -7 6 -10 9 -4 Z"/>
    <path class="h2" d="M186 84 c 2 -5 10 -2 7 3 c -1 4 -7 7 -7 7 c 0 0 -6 -3 -7 -7 c -3 -5 5 -8 7 -3 Z"/>
  </g>
  <text class="cat-question" x="170" y="42" font-size="30" font-weight="700"
        font-family="var(--font-display)" fill="var(--cat-line)">?</text>
  <g class="cat-sparkles" fill="var(--accent)">
    <path class="s1" d="M178 40 l 3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z"/>
    <path class="s2" d="M40 48 l 2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 Z"/>
  </g>
  <g class="cat-sniff-lines" stroke="var(--cat-line)" stroke-width="3"
     stroke-linecap="round" fill="none" opacity="0">
    <path d="M170 66 q 6 -3 0 -7 M180 74 q 7 -3 0 -8"/>
  </g>
</svg>`;

export function createCat(mount) {
  mount.classList.add('cat');
  mount.dataset.state = 'idle';
  mount.innerHTML = CAT_SVG;

  let fidgetTimer = null;
  let reactionTimer = null;

  function scheduleFidget() {
    clearTimeout(fidgetTimer);
    const wait = TIMING.idleFidgetMinMs +
      Math.random() * (TIMING.idleFidgetMaxMs - TIMING.idleFidgetMinMs);
    fidgetTimer = setTimeout(() => {
      if (mount.dataset.state === 'idle') {
        mount.classList.add('cat-grooming');
        setTimeout(() => mount.classList.remove('cat-grooming'), 1300);
      }
      scheduleFidget();
    }, wait);
  }
  scheduleFidget();

  return {
    // set('found', {revertTo: 'idle'}) plays a reaction then falls back.
    set(state, { revertTo = null } = {}) {
      clearTimeout(reactionTimer);
      mount.classList.remove('cat-grooming');
      mount.dataset.state = state;
      if (revertTo) {
        reactionTimer = setTimeout(() => { mount.dataset.state = revertTo; }, TIMING.reactionMs);
      }
    },
    destroy() {
      clearTimeout(fidgetTimer);
      clearTimeout(reactionTimer);
    },
  };
}
