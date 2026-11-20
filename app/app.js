// Leonida Trophy Guide — bootstrap: loads the trophy data, holds the
// tracker state, wires the controls, and renders the checklist, detail
// panel and roadmap. The app's state is also reachable from the address
// bar: #view=checklist|roadmap, #trophy=<slug>, #filter=<kind>,
// #spoilers=on|off, and #demo=progress seeds sample progress in memory
// only (for screenshots; it never touches localStorage).

import { loadProgress, saveProgress, loadSettings, saveSettings, exportProgress, parseImportedProgress } from './storage.js';
import { renderTrophyList, renderFilterButtons } from './checklist.js';
import { renderTrophyDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';

/** Sample earned trophies for screenshots: in memory only, never saved. */
const DEMO_EARNED = [
  'just-like-paradise', 'paradise-lost', 'tits-ass-drug-money', 'trust',
  'vice-city-baby', 'break-the-bank', 'top-fun', 'stick-fiddler',
  'baited-my-tackle', 'master-of-none', 'whip-it-good', 'the-goodtime-state',
  'lets-go-bowling',
];

const listElement = document.getElementById('trophyList');
const countElement = document.getElementById('resultCount');
const detailPanel = document.getElementById('detailPanel');
const roadmapView = document.getElementById('roadmapView');
const checklistView = document.getElementById('checklistView');
const mainElement = document.getElementById('main');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const gradeBreakdown = document.getElementById('gradeBreakdown');
const searchInput = document.getElementById('search');
const spoilerToggle = document.getElementById('spoilerToggle');

const savedSettings = loadSettings();
const state = {
  earned: loadProgress(),
  filter: 'all',
  search: '',
  spoilers: savedSettings.spoilers,
  view: 'checklist',
  selected: null,
  demo: false,
};

let trophies = [];
const bySlug = new Map();

/** Read the view, filter, spoiler and demo state out of the URL hash. */
function applyHashState() {
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('view') === 'roadmap' || hash.get('view') === 'checklist') state.view = hash.get('view');
  if (hash.get('filter')) state.filter = hash.get('filter');
  if (hash.get('spoilers') === 'off') state.spoilers = false;
  if (hash.get('spoilers') === 'on') state.spoilers = true;
  if (hash.get('trophy') && bySlug.has(hash.get('trophy'))) state.selected = hash.get('trophy');
  if (hash.get('demo') === 'progress') {
    state.demo = true;
    for (const slug of DEMO_EARNED) state.earned.add(slug);
  }
}

/** Write the current view and selection back into the URL hash. */
function syncHash() {
  const hash = new URLSearchParams();
  hash.set('view', state.view);
  if (state.filter !== 'all') hash.set('filter', state.filter);
  if (!state.spoilers) hash.set('spoilers', 'off');
  if (state.selected) hash.set('trophy', state.selected);
  if (state.demo) hash.set('demo', 'progress');
  history.replaceState(null, '', `#${hash.toString()}`);
}

/** Update the progress bar, the counts and the grade breakdown. */
function renderProgress() {
  const earnedCount = state.earned.size;
  const total = trophies.length;
  progressText.textContent = `${earnedCount} of ${total} earned`;
  progressFill.style.width = total ? `${Math.round((earnedCount / total) * 100)}%` : '0%';
  const earnedByGrade = {};
  for (const trophy of trophies) {
    if (state.earned.has(trophy.slug)) earnedByGrade[trophy.grade] = (earnedByGrade[trophy.grade] ?? 0) + 1;
  }
  gradeBreakdown.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => `${earnedByGrade[grade] ?? 0} ${grade}`)
    .join(' · ');
}

/** Render the active view (checklist or roadmap) and the detail panel. */
function render() {
  spoilerToggle.checked = state.spoilers;
  searchInput.value = state.search;
  renderFilterButtons(document.getElementById('filters'), state, (filter) => {
    state.filter = filter;
    syncHash();
    render();
  });
  document.getElementById('tabChecklist').classList.toggle('active', state.view === 'checklist');
  document.getElementById('tabRoadmap').classList.toggle('active', state.view === 'roadmap');
  checklistView.hidden = state.view !== 'checklist';
  roadmapView.hidden = state.view !== 'roadmap';
  mainElement.classList.toggle('roadmapMode', state.view === 'roadmap');
  if (state.view === 'checklist') {
    renderTrophyList(listElement, countElement, trophies, state, toggleEarned, selectTrophy);
  } else {
    renderRoadmap(roadmapView, trophies, state, selectTrophy);
  }
  renderTrophyDetail(detailPanel, state.selected ? bySlug.get(state.selected) : null, state, toggleEarned);
  renderProgress();
}

function toggleEarned(slug, earned) {
  if (earned) state.earned.add(slug);
  else state.earned.delete(slug);
  if (!state.demo) saveProgress(state.earned);
  render();
}

function selectTrophy(slug) {
  state.selected = slug;
  state.view = 'checklist';
  syncHash();
  render();
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function switchView(view) {
  state.view = view;
  syncHash();
  render();
}

document.getElementById('tabChecklist').addEventListener('click', () => switchView('checklist'));
document.getElementById('tabRoadmap').addEventListener('click', () => switchView('roadmap'));
searchInput.addEventListener('input', () => {
  state.search = searchInput.value;
  renderTrophyList(listElement, countElement, trophies, state, toggleEarned, selectTrophy);
});
spoilerToggle.addEventListener('change', () => {
  state.spoilers = spoilerToggle.checked;
  saveSettings({ spoilers: state.spoilers });
  syncHash();
  render();
});
document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned));
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const imported = parseImportedProgress(await file.text(), trophies.map((trophy) => trophy.slug));
  if (imported === null) {
    alert('That file is not a Leonida Trophy Guide progress export.');
    return;
  }
  state.earned = imported;
  saveProgress(state.earned);
  render();
});

window.addEventListener('hashchange', () => {
  applyHashState();
  render();
});

const data = await (await fetch('data/trophies.json')).json();
trophies = data.trophies;
for (const trophy of trophies) bySlug.set(trophy.slug, trophy);
applyHashState();
render();
