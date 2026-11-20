// Trophy checklist rendering: rows, kind filters, search, spoiler masking.
// A story trophy stays masked while spoilers are on and it is not earned yet:
// its name, description and guide are hidden until the player earns it.

export const FILTERS = [
  { id: 'all', label: 'All 55' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'combat', label: 'Combat' },
  { id: 'crime', label: 'Crime' },
  { id: 'strangers', label: 'Strangers' },
  { id: 'exploration', label: 'Exploration' },
  { id: 'completion', label: 'Completion' },
  { id: 'online', label: 'Online' },
  { id: 'earned', label: 'Earned' },
  { id: 'todo', label: 'Not earned' },
];

const KIND_LABELS = {
  story: 'Story',
  activities: 'Activities',
  collectibles: 'Collectibles',
  combat: 'Combat',
  crime: 'Crime',
  strangers: 'Strangers',
  exploration: 'Exploration',
  completion: 'Completion',
  misc: 'Other',
};

/** True when this trophy's name and description must stay hidden. */
export function isSpoilerHidden(trophy, state) {
  return state.spoilers && trophy.story && !state.earned.has(trophy.slug);
}

/** The trophies that pass the active filter and search text, in list order. */
export function filterTrophies(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.filter === 'online') return false;
    if (state.filter === 'missable' && !trophy.missable) return false;
    if (state.filter === 'earned' && !state.earned.has(trophy.slug)) return false;
    if (state.filter === 'todo' && state.earned.has(trophy.slug)) return false;
    if (state.filter !== 'all' && !['missable', 'earned', 'todo'].includes(state.filter) && trophy.kind !== state.filter) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function gradeChip(trophy) {
  return `<span class="chip grade-${trophy.grade}">${trophy.grade}</span>`;
}

function metaChips(trophy) {
  const chips = [gradeChip(trophy), `<span class="chip kind">${KIND_LABELS[trophy.kind] ?? trophy.kind}</span>`];
  if (trophy.target) chips.push(`<span class="chip target">${escapeHtml(trophy.target)}</span>`);
  if (trophy.missable) chips.push('<span class="chip missable">⚠ Missable</span>');
  if (trophy.unconfirmed) chips.push('<span class="chip unconfirmed">Method unconfirmed</span>');
  return chips.join(' ');
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Render the filtered trophy list into the list element.
 * onToggle(slug, earned) fires when a checkbox flips; onSelect(slug) when a
 * row is clicked to open its guide.
 */
export function renderTrophyList(listElement, countElement, trophies, state, onToggle, onSelect) {
  const visible = filterTrophies(trophies, state);
  listElement.replaceChildren();
  if (state.filter === 'online') {
    const note = document.createElement('li');
    note.className = 'emptyNote';
    note.textContent = 'No online trophies — all 55 trophies are earned offline. Nothing to track here.';
    listElement.append(note);
  } else if (visible.length === 0) {
    const note = document.createElement('li');
    note.className = 'emptyNote';
    note.textContent = 'No trophies match this filter and search. Clear the search or pick another filter.';
    listElement.append(note);
  }
  for (const trophy of visible) {
    const earned = state.earned.has(trophy.slug);
    const hidden = isSpoilerHidden(trophy, state);
    const row = document.createElement('li');
    row.className = 'trophyRow' + (earned ? ' earned' : '') + (state.selected === trophy.slug ? ' selected' : '');
    row.dataset.slug = trophy.slug;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => onToggle(trophy.slug, box.checked));
    row.append(box);

    const main = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophyName';
    name.innerHTML = hidden ? '<span class="hiddenTag">Hidden story trophy — earn it to reveal</span>' : escapeHtml(trophy.name);
    main.append(name);
    const desc = document.createElement('div');
    desc.className = 'trophyDesc';
    desc.textContent = hidden ? 'Story spoiler hidden until earned.' : trophy.description;
    main.append(desc);
    const meta = document.createElement('div');
    meta.className = 'trophyMeta';
    meta.innerHTML = hidden ? gradeChip(trophy) : metaChips(trophy);
    main.append(meta);
    row.append(main);

    const grade = document.createElement('div');
    grade.className = 'gradeDot';
    grade.innerHTML = `<span class="g-${trophy.grade}">${trophy.grade.toUpperCase()}</span>`;
    row.append(grade);

    row.addEventListener('click', () => onSelect(trophy.slug));
    listElement.append(row);
  }
  countElement.textContent =
    state.filter === 'online'
      ? 'Online: 0 trophies — the whole list is offline.'
      : `Showing ${visible.length} of ${trophies.length} trophies`;
}

/** Render the filter buttons and wire them to onFilter(filterId). */
export function renderFilterButtons(container, state, onFilter) {
  container.replaceChildren();
  for (const filter of FILTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filterBtn' + (state.filter === filter.id ? ' active' : '');
    button.textContent = filter.label;
    button.addEventListener('click', () => onFilter(filter.id));
    container.append(button);
  }
}
