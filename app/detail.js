// Trophy detail panel: the full guide for one trophy — official name and
// description, the guide in our own words, its named sources, and the
// missable / unconfirmed warnings. Spoiler-hidden trophies show nothing
// but their grade until they are earned.

import { isSpoilerHidden } from './checklist.js';

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Render one trophy's guide into the detail panel.
 * onToggleEarned(slug, earned) fires from the Mark as earned button.
 */
export function renderTrophyDetail(panel, trophy, state, onToggleEarned) {
  panel.replaceChildren();
  if (!trophy) {
    panel.classList.add('detailEmpty');
    panel.innerHTML =
      '<h2>Pick a trophy to see its guide</h2>' +
      '<p>Click any trophy in the list and its guide opens here: what to do, where and how, when it can be missed — with the sources each fact comes from.</p>' +
      '<p>Start with the roadmap if you are new: it puts the story, the one possibly-missable trophy and the free-roam mop-up in order.</p>';
    return;
  }
  panel.classList.remove('detailEmpty');
  const hidden = isSpoilerHidden(trophy, state);
  const earned = state.earned.has(trophy.slug);

  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  panel.append(title);

  const desc = document.createElement('p');
  desc.className = 'officialDesc';
  desc.textContent = hidden
    ? 'This trophy is part of the story. Turn off “Hide story spoilers”, or earn it, to see its name, description and guide.'
    : `Official description: “${trophy.description}”`;
  panel.append(desc);

  const meta = document.createElement('div');
  meta.className = 'trophyMeta';
  meta.innerHTML =
    `<span class="chip grade-${trophy.grade}">${trophy.grade}</span>` +
    (hidden
      ? ''
      : `<span class="chip kind">${trophy.kind}</span>` +
        (trophy.target ? `<span class="chip target">${escapeHtml(trophy.target)}</span>` : '') +
        (trophy.missable ? '<span class="chip missable">⚠ Missable</span>' : '') +
        (trophy.unconfirmed ? '<span class="chip unconfirmed">Method unconfirmed</span>' : ''));
  panel.append(meta);

  if (!hidden) {
    if (trophy.missable) {
      const warn = document.createElement('p');
      warn.className = 'warnBox';
      warn.innerHTML =
        '<strong>⚠ Possibly missable.</strong> ' +
        escapeHtml(trophy.missableNote ?? 'This trophy can be missed — read the guide before you pass the point of no return.');
      panel.append(warn);
    }
    if (trophy.unconfirmed) {
      const warn = document.createElement('p');
      warn.className = 'warnBox unconfirmedBox';
      warn.innerHTML =
        '<strong>Method unconfirmed.</strong> No reliable guide has confirmed how this trophy unlocks yet. ' +
        'The guide below says what is known and does not present a guess as a fact.';
      panel.append(warn);
    }
    const guide = document.createElement('div');
    guide.className = 'guideText';
    const paragraph = document.createElement('p');
    paragraph.textContent = trophy.guide;
    guide.append(paragraph);
    panel.append(guide);

    const sources = document.createElement('div');
    sources.className = 'sourcesBox';
    sources.innerHTML = '<h3>Sources for this guide</h3>';
    const list = document.createElement('ul');
    for (const source of trophy.sources ?? []) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
      list.append(item);
    }
    sources.append(list);
    panel.append(sources);
  }

  const actions = document.createElement('div');
  actions.className = 'detailActions';
  const earnButton = document.createElement('button');
  earnButton.type = 'button';
  earnButton.className = 'earnBtn' + (earned ? ' earned' : '');
  earnButton.textContent = earned ? '✓ Earned — unmark' : 'Mark as earned';
  earnButton.addEventListener('click', () => onToggleEarned(trophy.slug, !earned));
  actions.append(earnButton);
  panel.append(actions);
}
