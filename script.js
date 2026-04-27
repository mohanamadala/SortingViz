/* ════════════════════════════════════════════════════════════
   ALGOVIZ — script.js
   Dashboard Sorting Visualizer · Vanilla JS
   ════════════════════════════════════════════════════════════

   STRUCTURE:
   1. State & Config
   2. DOM references
   3. Algorithm metadata
   4. UI setup & event binding
   5. Array generation & rendering
   6. Animation helpers
   7. Sorting algorithms (Bubble, Selection, Insertion)
   8. Finish sequence
*/

/* ══════════════════════════════════════════════
   1. STATE & CONFIG
   ══════════════════════════════════════════════ */

const state = {
  array:         [],          // Current array of numbers
  isSorting:     false,       // Is a sort running?
  stopFlag:      false,       // User requested stop
  comparisons:   0,           // Total comparisons
  swaps:         0,           // Total swaps
  selectedAlgo:  'bubble',    // Currently selected algorithm
};

/* ══════════════════════════════════════════════
   2. DOM REFERENCES
   ══════════════════════════════════════════════ */

const DOM = {
  vizCanvas:      document.getElementById('viz-canvas'),
  btnGenerate:    document.getElementById('btn-generate'),
  btnSort:        document.getElementById('btn-sort'),
  btnStop:        document.getElementById('btn-stop'),
  speedSlider:    document.getElementById('speed-slider'),
  sizeSlider:     document.getElementById('size-slider'),
  speedVal:       document.getElementById('speed-val'),
  sizeVal:        document.getElementById('size-val'),
  statComp:       document.getElementById('stat-comparisons'),
  statSwaps:      document.getElementById('stat-swaps'),
  statSize:       document.getElementById('stat-size'),
  statusBadge:    document.getElementById('status-badge'),
  statusText:     document.getElementById('stat-status'),
  topbarTitle:    document.getElementById('topbar-title'),
  vizHint:        document.getElementById('viz-hint'),
  infoName:       document.getElementById('info-name'),
  infoDesc:       document.getElementById('info-desc'),
  tcBest:         document.getElementById('tc-best'),
  tcAvg:          document.getElementById('tc-avg'),
  tcWorst:        document.getElementById('tc-worst'),
  tcSpace:        document.getElementById('tc-space'),
  propsList:      document.getElementById('props-list'),
  algoNav:        document.getElementById('algo-nav'),
  sidebarToggle:  document.getElementById('sidebar-toggle'),
  sidebar:        document.getElementById('sidebar'),
};

/* ══════════════════════════════════════════════
   3. ALGORITHM METADATA
   ══════════════════════════════════════════════ */

const ALGO_META = {
  bubble: {
    name:    'Bubble Sort',
    desc:    'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. After each pass, the next largest element rises to its correct position — like bubbles floating to the surface.',
    best:    'O(n)',
    avg:     'O(n²)',
    worst:   'O(n²)',
    space:   'O(1)',
    props:   [
      { label: 'Stable',       yes: true },
      { label: 'In-Place',     yes: true },
      { label: 'Not Adaptive', yes: false },
    ],
  },
  selection: {
    name:    'Selection Sort',
    desc:    'Selection Sort divides the list into a sorted and an unsorted region. In each pass, it scans the unsorted region to find the minimum element and moves it to the front of the unsorted region. It makes at most O(n) swaps.',
    best:    'O(n²)',
    avg:     'O(n²)',
    worst:   'O(n²)',
    space:   'O(1)',
    props:   [
      { label: 'Not Stable',   yes: false },
      { label: 'In-Place',     yes: true },
      { label: 'Not Adaptive', yes: false },
    ],
  },
  insertion: {
    name:    'Insertion Sort',
    desc:    'Insertion Sort builds a sorted sequence one element at a time. It takes each element from the unsorted part and inserts it at the correct position in the sorted part — similar to how you sort playing cards in your hand.',
    best:    'O(n)',
    avg:     'O(n²)',
    worst:   'O(n²)',
    space:   'O(1)',
    props:   [
      { label: 'Stable',       yes: true },
      { label: 'In-Place',     yes: true },
      { label: 'Adaptive',     yes: true },
    ],
  },
};

/* ══════════════════════════════════════════════
   4. UI SETUP & EVENT BINDING
   ══════════════════════════════════════════════ */

/** Runs once when the page loads */
function init() {
  generateArray();
  updateInfoCard('bubble');
  bindEvents();
  updateSliderFill(DOM.speedSlider);
  updateSliderFill(DOM.sizeSlider);
}

function bindEvents() {
  // Algorithm sidebar nav
  DOM.algoNav.querySelectorAll('.algo-nav__item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.isSorting) return;
      selectAlgorithm(btn.dataset.algo);
    });
  });

  // Generate new array
  DOM.btnGenerate.addEventListener('click', () => {
    if (!state.isSorting) generateArray();
  });

  // Start sort
  DOM.btnSort.addEventListener('click', startSort);

  // Stop sort
  DOM.btnStop.addEventListener('click', () => {
    state.stopFlag = true;
    setStatus('stopped', 'Stopped');
    DOM.vizHint.textContent = 'Sorting stopped.';
  });

  // Speed slider
  DOM.speedSlider.addEventListener('input', () => {
    DOM.speedVal.textContent = DOM.speedSlider.value;
    updateSliderFill(DOM.speedSlider);
  });

  // Size slider
  DOM.sizeSlider.addEventListener('input', () => {
    DOM.sizeVal.textContent = DOM.sizeSlider.value;
    DOM.statSize.textContent = DOM.sizeSlider.value;
    updateSliderFill(DOM.sizeSlider);
    if (!state.isSorting) generateArray();
  });

  // Mobile sidebar toggle
  DOM.sidebarToggle.addEventListener('click', () => {
    DOM.sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', e => {
    if (
      window.innerWidth <= 900 &&
      DOM.sidebar.classList.contains('open') &&
      !DOM.sidebar.contains(e.target) &&
      !DOM.sidebarToggle.contains(e.target)
    ) {
      DOM.sidebar.classList.remove('open');
    }
  });
}

/** Selects an algorithm — highlights it in sidebar and updates info card */
function selectAlgorithm(algo) {
  state.selectedAlgo = algo;

  // Update sidebar active state
  DOM.algoNav.querySelectorAll('.algo-nav__item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.algo === algo);
  });

  // Update info card and title
  updateInfoCard(algo);
  DOM.topbarTitle.textContent = ALGO_META[algo].name;
}

/** Fills the info panel with the selected algorithm's data */
function updateInfoCard(algo) {
  const meta = ALGO_META[algo];
  DOM.infoName.textContent  = meta.name;
  DOM.infoDesc.textContent  = meta.desc;
  DOM.tcBest.textContent    = meta.best;
  DOM.tcAvg.textContent     = meta.avg;
  DOM.tcWorst.textContent   = meta.worst;
  DOM.tcSpace.textContent   = meta.space;

  // Rebuild property tags
  DOM.propsList.innerHTML = meta.props.map(p => `
    <div class="prop-tag ${p.yes ? 'prop-tag--yes' : 'prop-tag--no'}">${p.label}</div>
  `).join('');
}

/** Updates the slider track gradient to show filled portion */
function updateSliderFill(input) {
  const min = +input.min, max = +input.max, val = +input.value;
  const pct = ((val - min) / (max - min)) * 100;
  input.style.setProperty('--pct', pct);
  // The CSS uses --pct via a linear-gradient background
  input.style.background = `linear-gradient(
    to right,
    var(--accent) 0%,
    var(--accent) ${pct}%,
    rgba(56,189,248,0.12) ${pct}%,
    rgba(56,189,248,0.12) 100%
  )`;
}

/** Sets the status badge state: 'ready' | 'sorting' | 'stopped' | 'done' */
function setStatus(type, label) {
  const badge = DOM.statusBadge;
  badge.className = 'status-badge';
  badge.classList.add(type);
  document.getElementById('status-text').textContent = label;
}

/* ══════════════════════════════════════════════
   5. ARRAY GENERATION & RENDERING
   ══════════════════════════════════════════════ */

/** Generates a random array and renders bars */
function generateArray() {
  const size  = +DOM.sizeSlider.value;
  state.array = [];

  for (let i = 0; i < size; i++) {
    // Values 8–100 give a nice spread
    state.array.push(Math.floor(Math.random() * 93) + 8);
  }

  resetCounters();
  renderBars();
  setStatus('ready', 'Ready');
  DOM.vizHint.textContent = 'Press Sort to begin';
}

/** Resets comparison and swap counters */
function resetCounters() {
  state.comparisons = 0;
  state.swaps       = 0;
  updateCounterDisplay();
}

function updateCounterDisplay() {
  DOM.statComp.textContent  = state.comparisons.toLocaleString();
  DOM.statSwaps.textContent = state.swaps.toLocaleString();
}

/**
 * Renders the array as bars inside the canvas.
 * @param {Object} highlights - { index: 'class-name', ... }
 *   e.g. { 3: 'comparing', 7: 'swapping' }
 */
function renderBars(highlights = {}) {
  const canvas = DOM.vizCanvas;
  canvas.innerHTML = '';

  const maxVal   = Math.max(...state.array);
  const canvasH  = canvas.clientHeight || 200;

  state.array.forEach((val, i) => {
    const bar = document.createElement('div');
    bar.classList.add('bar');

    // Height as a percentage of canvas height
    const heightPx = Math.max(4, Math.round((val / maxVal) * (canvasH - 4)));
    bar.style.height = heightPx + 'px';

    // Apply highlight class if specified
    if (highlights[i]) bar.classList.add(highlights[i]);

    canvas.appendChild(bar);
  });
}

/* ══════════════════════════════════════════════
   6. ANIMATION HELPERS
   ══════════════════════════════════════════════ */

/**
 * Calculates the animation delay from the speed slider.
 * speed 1 = 480ms (slow), speed 10 = 8ms (fast)
 */
function getDelay() {
  const spd = +DOM.speedSlider.value; // 1–10
  return Math.round(488 - spd * 48);
}

/** Async sleep — use `await sleep(ms)` to pause between animation frames */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Renders a frame with highlights, then waits for the delay.
 * @param {Object} highlights - { index: 'css-class' }
 */
async function frame(highlights) {
  renderBars(highlights);
  updateCounterDisplay();
  await sleep(getDelay());
}

/** Swaps two elements in the array and increments the swap counter */
function swap(i, j) {
  [state.array[i], state.array[j]] = [state.array[j], state.array[i]];
  state.swaps++;
}

/* ══════════════════════════════════════════════
   7. SORTING ALGORITHMS
   ══════════════════════════════════════════════ */

/** Entry point: locks UI, runs selected algorithm, then finishes */
async function startSort() {
  if (state.isSorting) return;

  state.isSorting = true;
  state.stopFlag  = false;
  resetCounters();

  // Lock controls
  DOM.btnSort.disabled     = true;
  DOM.btnGenerate.disabled = true;
  DOM.btnStop.disabled     = false;

  setStatus('sorting', 'Sorting…');
  DOM.vizHint.textContent = 'Sorting in progress…';

  // Run the selected algorithm
  if      (state.selectedAlgo === 'bubble')    await bubbleSort();
  else if (state.selectedAlgo === 'selection') await selectionSort();
  else if (state.selectedAlgo === 'insertion') await insertionSort();

  // Sweep all bars green if completed
  if (!state.stopFlag) {
    await finishSequence();
    setStatus('done', 'Done ✓');
    DOM.vizHint.textContent = `Finished in ${state.comparisons.toLocaleString()} comparisons · ${state.swaps.toLocaleString()} swaps`;
  }

  // Unlock controls
  state.isSorting          = false;
  DOM.btnSort.disabled     = false;
  DOM.btnGenerate.disabled = false;
  DOM.btnStop.disabled     = true;
}

/* ── BUBBLE SORT ──────────────────────────────
   Compare adjacent pairs; bubble the max up.
   Time: O(n²)  Space: O(1)  Stable: yes
   ─────────────────────────────────────────── */
async function bubbleSort() {
  const n = state.array.length;

  for (let i = 0; i < n - 1; i++) {
    let didSwap = false;

    for (let j = 0; j < n - i - 1; j++) {
      if (state.stopFlag) return;

      state.comparisons++;

      // Show two bars being compared (yellow)
      await frame({ [j]: 'comparing', [j + 1]: 'comparing' });

      if (state.array[j] > state.array[j + 1]) {
        // Highlight swap (red)
        await frame({ [j]: 'swapping', [j + 1]: 'swapping' });
        swap(j, j + 1);
        didSwap = true;
      }
    }

    // The last i bars are now in final position — mark sorted (green)
    // We only show the latest sorted bar, the rest come from finishSequence
    await frame({ [n - i - 1]: 'sorted' });

    // Optimization: if no swaps occurred, the array is already sorted
    if (!didSwap) break;
  }
}

/* ── SELECTION SORT ───────────────────────────
   Find the min in unsorted region and place it.
   Time: O(n²)  Space: O(1)  Stable: no
   ─────────────────────────────────────────── */
async function selectionSort() {
  const n = state.array.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Scan the unsorted region for the minimum value
    for (let j = i + 1; j < n; j++) {
      if (state.stopFlag) return;

      state.comparisons++;

      // Purple = current minimum, yellow = element being examined
      await frame({ [minIdx]: 'pivot', [j]: 'comparing' });

      if (state.array[j] < state.array[minIdx]) {
        minIdx = j; // Update minimum index
      }
    }

    // Swap minimum into its final position
    if (minIdx !== i) {
      await frame({ [i]: 'swapping', [minIdx]: 'swapping' });
      swap(i, minIdx);
    }

    // Mark index i as sorted
    await frame({ [i]: 'sorted' });
  }

  // Final element is always sorted
  await frame({ [n - 1]: 'sorted' });
}

/* ── INSERTION SORT ───────────────────────────
   Pick each element and insert into sorted part.
   Time: O(n²)  Space: O(1)  Stable: yes
   ─────────────────────────────────────────── */
async function insertionSort() {
  const n = state.array.length;

  // Element at index 0 is trivially sorted
  await frame({ [0]: 'sorted' });

  for (let i = 1; i < n; i++) {
    if (state.stopFlag) return;

    const key = state.array[i]; // The element to be inserted
    let j     = i - 1;

    // Highlight the element we're about to insert (purple)
    await frame({ [i]: 'pivot' });

    // Shift elements in sorted region right until we find key's position
    while (j >= 0 && state.array[j] > key) {
      if (state.stopFlag) return;

      state.comparisons++;

      // Show the comparison and shift
      await frame({ [j]: 'comparing', [j + 1]: 'swapping' });

      state.array[j + 1] = state.array[j]; // Shift one position right
      state.swaps++;
      j--;
    }

    // Drop the key into the correct position
    state.array[j + 1] = key;

    // Show the sorted region so far (highlight all sorted elements)
    const h = {};
    for (let k = 0; k <= i; k++) h[k] = 'sorted';
    await frame(h);
  }
}

/* ══════════════════════════════════════════════
   8. FINISH SEQUENCE
   ══════════════════════════════════════════════ */

/**
 * After sorting, sweeps all bars green from left to right
 * for a satisfying visual finish.
 */
async function finishSequence() {
  const n     = state.array.length;
  const delay = Math.max(6, Math.round(280 / n)); // Faster for larger arrays
  const h     = {};

  for (let i = 0; i < n; i++) {
    h[i] = 'sorted';
    renderBars({ ...h });
    updateCounterDisplay();
    await sleep(delay);
  }
}

/* ══════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', init);
