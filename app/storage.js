// Progress storage for the Leonida Trophy Guide.
// Earned trophies and the spoiler setting live in localStorage; export and
// import move them as a JSON file so progress survives a new browser.

export const PROGRESS_KEY = 'leonida-trophy-guide-progress-v1';
export const SETTINGS_KEY = 'leonida-trophy-guide-settings-v1';

/** Read the earned trophy slugs back from localStorage. */
export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((x) => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

/** Persist the earned trophy slugs to localStorage. */
export function saveProgress(earnedSlugs) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earnedSlugs]));
}

/** Read the saved settings (spoiler mode) back from localStorage. */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { spoilers: true };
    const parsed = JSON.parse(raw);
    return { spoilers: parsed.spoilers !== false };
  } catch {
    return { spoilers: true };
  }
}

/** Persist the settings to localStorage. */
export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Download the earned slugs as a JSON file. */
export function exportProgress(earnedSlugs) {
  const payload = {
    app: 'leonida-trophy-guide',
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedAt: new Date().toISOString(),
    earned: [...earnedSlugs].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Parse an imported progress file. Returns the earned slugs that match
 * trophies in this guide, or null when the file is not a progress file.
 */
export function parseImportedProgress(text, knownSlugs) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) return null;
  const known = new Set(knownSlugs);
  return new Set(list.filter((slug) => typeof slug === 'string' && known.has(slug)));
}
