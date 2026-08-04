/**
 * Deterministic random source.
 *
 * A demo that reshuffles on every refresh is a demo you can't rehearse. Every
 * generator in this folder pulls from a seeded PRNG, so the numbers on screen
 * are identical on your laptop, in the sales deck, and on Vercel.
 *
 * Replace this whole folder with API calls when the backend is ready; nothing
 * in src/pages imports anything other than the exported datasets.
 */
export function createRandom(seed = 20250130) {
  let state = seed >>> 0;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (random, list) => list[Math.floor(random() * list.length)];

export const between = (random, min, max, decimals = 0) => {
  const value = min + random() * (max - min);
  return decimals === 0 ? Math.round(value) : Number(value.toFixed(decimals));
};

export const weighted = (random, entries) => {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = random() * total;
  for (const entry of entries) {
    threshold -= entry.weight;
    if (threshold <= 0) return entry.value;
  }
  return entries[entries.length - 1].value;
};

export const id = (random, length = 10) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[Math.floor(random() * alphabet.length)];
  return out;
};

/** The demo's "today". Fixed so date ranges never drift out from under the data. */
export const TODAY = new Date('2026-08-04T00:00:00Z');

export const daysAgo = (days) => {
  const date = new Date(TODAY);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

export const monthsAgo = (months) => {
  const date = new Date(TODAY);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
};

export const isoDate = (date) => date.toISOString().slice(0, 10);

/** A trend that reads like real volume: seasonal wave + noise + occasional spike. */
export function trendSeries(random, { points, base, amplitude, noise = 0.18, spikeAt = null }) {
  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin((index / points) * Math.PI * 2.2) * amplitude;
    const drift = (index / points) * amplitude * 0.35;
    const jitter = (random() - 0.5) * base * noise;
    const spike = spikeAt !== null && index === spikeAt ? base * 1.9 : 0;
    return Math.max(0, Math.round(base + wave + drift + jitter + spike));
  });
}
