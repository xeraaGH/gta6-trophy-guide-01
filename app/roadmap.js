// Roadmap to the Platinum: the order to earn the 55 trophies in — the
// story chapters first, then the free-roam mop-up — with the missable
// warning and the 100% checklist broken down into its counts.

const STAGES = [
  {
    number: 1,
    title: 'Before you start',
    intro:
      'Set the run up right: turn cheats off (cheats disable trophies and saving), and keep a manual save at the start and end of each chapter — there is no mission replay, and you have 15 save slots. Roughly 200 hours to the Platinum at about 4/10 difficulty, one playthrough, all offline.',
    trophies: [],
  },
  {
    number: 2,
    title: 'Chapter 1 — and the one trophy to protect',
    intro:
      'Play the story. Two trophies land here on their own. The important job is the warning: after the mission Down to Earth, Lucia may bring up meditating in the kitchen at Jason’s house — follow her to the balcony and say yes. It is not yet confirmed that this meditation is required for Positive Mental Attitude, but it may be missable, so do it in Chapter 1 to be safe.',
    trophies: ['just-like-paradise', 'paradise-lost', 'positive-mental-attitude'],
  },
  {
    number: 3,
    title: 'Chapters 2–3 — open up the world',
    intro:
      'Chapter trophies and story missions keep landing on their own. From Chapter 2, start the long jobs in the background: rob the Kingpin Bowling alley (Let’s Go Bowling — the site restocks, so it is not missable), train Jason and Lucia together for Personal Best once Coffee Break unlocks partner workouts, and visit the UFO event after 2 AM near the Starlet Motel.',
    trophies: ['tits-ass-drug-money', 'trust', 'vice-city-baby', 'break-the-bank', 'lets-go-bowling', 'personal-best', 'the-truth-is-out-there'],
  },
  {
    number: 4,
    title: 'Chapter 4 and the finale',
    intro:
      'Finish the story. The last chapter trophies and the gold for the final mission, Starting From Zero, all land here. Once the credits roll, free-roam stays open — everything left can be done after the story.',
    trophies: ['top-of-the-world-ma', 'family-matters', 'dwnfall', 'hi-jacked', 'snow-storm', 'you-gotta-know-when-to-get-off'],
  },
  {
    number: 5,
    title: 'Free-roam mop-up — strangers, collectibles, 100%',
    intro:
      'Work the open world in this order: finish the stranger strands (8 count for Strangers & Freaks), then activities and races, then collectibles (cards, WAiNK It spots, vehicles, garages), then the crime and combat trophies, then Challenges. The 100% checklist is the last grind: 8 bank vaults, 39 gang operations, all Shooting Range golds, all drone races, Bret’s 15 Target Decks, any 100 Optional Missions, 300 stunts and any 70 of 80 Challenges. When it is done, A Long Road pops — and the Platinum with it.',
    trophies: [
      'road-to-rehabilitation', 'this-was-no-boat-accident', 'the-lone-rider', 'supply-and-demand', 'spin-on-this', 'fair-game', 'strangers-and-freaks',
      'cunning-stunts', 'master-of-none', 'the-shootist', 'top-fun', 'earn-cash-not-kudos', 'baited-my-tackle', 'stick-fiddler',
      'dont-touch-my-deck', 'you-wainker', 'whip-it-good', 'little-boxes', 'on-the-spot',
      'the-goodtime-state', 'hot-together', 'gunslinger', 'challenging-tank',
      'retail-therapy', 'sneakthief', 'maximum-withdrawal', 'a-classic-blitz-play', 'pest-control', 'dime-on-the-dollar', 'treat-yo-self',
      'one-last-thing', 'actions-speak-louder',
      'in-the-beginning', 'capital-offense', 'bad-luck-i-guess', 'ten-pin',
      'a-long-road', 'vice-got-a-price',
    ],
  },
];

/** Render the roadmap intro, facts and stage cards into the container. */
export function renderRoadmap(container, trophies, state, onSelect) {
  const bySlug = new Map(trophies.map((trophy) => [trophy.slug, trophy]));
  container.replaceChildren();

  const intro = document.createElement('div');
  intro.className = 'roadmapIntro';
  intro.innerHTML =
    '<h2>Roadmap to the Platinum — Vice Got a Price!</h2>' +
    '<p>Five stages, in order. The story first (12 trophies, all automatic), then the free-roam mop-up. Only one trophy is possibly missable, and it is flagged in stage 2 — everything else can be finished after the story.</p>' +
    '<div class="roadmapFacts">' +
    '<span class="fact"><strong>~200 hours</strong> to Platinum</span>' +
    '<span class="fact"><strong>4/10</strong> difficulty</span>' +
    '<span class="fact"><strong>1</strong> playthrough</span>' +
    '<span class="fact"><strong>0</strong> online trophies</span>' +
    '<span class="fact"><strong>1</strong> possibly missable</span>' +
    '<span class="fact"><strong>4</strong> methods unconfirmed</span>' +
    '</div>';
  container.append(intro);

  for (const stage of STAGES) {
    const card = document.createElement('section');
    card.className = 'stageCard';
    const heading = document.createElement('h3');
    heading.innerHTML = `<span class="stageNo">Stage ${stage.number} —</span> ${stage.title}`;
    card.append(heading);
    const text = document.createElement('p');
    text.textContent = stage.intro;
    card.append(text);
    if (stage.trophies.length > 0) {
      const chips = document.createElement('div');
      chips.className = 'stageTrophies';
      for (const slug of stage.trophies) {
        const trophy = bySlug.get(slug);
        if (!trophy) continue;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'stageChip' + (state.earned.has(slug) ? ' earned' : '');
        chip.innerHTML =
          `<span class="miniGrade g-${trophy.grade}">${trophy.grade === 'platinum' ? '★' : '●'}</span> ${trophy.name}` +
          (trophy.missable ? ' ⚠' : '') +
          (trophy.unconfirmed ? ' ?' : '');
        chip.addEventListener('click', () => onSelect(slug));
        chips.append(chip);
      }
      card.append(chips);
    }
    container.append(card);
  }
}
