/**
 * Shared formatters. Pure functions, no React, no Algolia — so they can be reasoned
 * about and tested on their own.
 */

/** Miles, not kilometres: `country` is constant `US` across all 5,000 records. */
const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (deg) => (deg * Math.PI) / 180;

/**
 * Great-circle distance in miles. Used for *display only*: a typed query deliberately
 * sends no geo parameter to Algolia (see `searchParams.js`), so computing distance here
 * is what lets it reach the result card without letting proximity into the ranking.
 */
export function distanceMiles(from, to) {
  if (!from || !to) return null;
  if (![from.lat, from.lng, to.lat, to.lng].every(Number.isFinite)) return null;

  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Round to something a human reads at a glance rather than a float. */
export function formatDistance(miles) {
  if (miles === null || !Number.isFinite(miles)) return null;
  if (miles < 0.1) return 'here';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/**
 * The third rung of the `location_label` fallback chain (CLAUDE.md §3).
 *
 * The transform computes the first two — neighborhood when it differs from city,
 * otherwise city — and sets `location_label_ambiguous` on the 18 records where they are
 * insufficient: 9 same-city chain clusters whose siblings share a neighborhood, so both
 * rows read identically. Fleming's Steakhouse 40036 and 39919 both resolve to
 * "Scottsdale".
 *
 * Distance completes it when the user's position is known. When it is not, the address
 * is the only remaining discriminator, which is why `address` is retrieved on both
 * journeys.
 */
export function resolveLocationLabel(hit, userPosition) {
  const base = hit.location_label || hit.city || '';
  if (!hit.location_label_ambiguous) return base;

  const distance = formatDistance(distanceMiles(userPosition, hit._geoloc));
  if (distance) return `${base} · ${distance}`;
  if (hit.address) return `${base} · ${hit.address}`;
  return base;
}

/**
 * `price_range` is the canonical, user-facing label from the CSV; `price_tier` is derived
 * from it and never from the JSON `price` int, which contradicts it on 220 records
 * (CLAUDE.md §3). The glyphs are a compact restatement of the tier, not a second source.
 */
export function formatPrice(hit) {
  const tier = Number(hit.price_tier);
  const glyphs = Number.isInteger(tier) && tier >= 1 && tier <= 3 ? '$'.repeat(tier) : '';
  return { glyphs, label: hit.price_range ?? '' };
}

/** `stars_count` has no zeros in the corpus (min 1.00, mean 4.29, max 5.00). */
export function formatRating(hit) {
  const stars = Number(hit.stars_count);
  const reviews = Number(hit.reviews_count);
  if (!Number.isFinite(stars)) return null;
  return {
    stars: stars.toFixed(1),
    reviews: Number.isFinite(reviews) ? reviews.toLocaleString('en-US') : null,
  };
}

/**
 * Initials for the placeholder tile.
 *
 * The extract's `image_url` values are a decade old. Every one of them 302-redirects to
 * the same 207x207 grey PNG — verified by hashing five of them, identical SHA-256 — so
 * there are no restaurant photos to show and fetching 5,000 copies of one placeholder
 * would be pure waste. The card keeps its left-hand block, because that is what gives
 * the row its rhythm, and fills it locally instead of faking a photograph.
 */
export function initials(name) {
  const words = String(name ?? '')
    .replace(/^(the|le|la|il|el|a)\s+/i, '')
    .split(/[\s\-–—/&']+/)
    .filter((w) => /[a-z0-9]/i.test(w));
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * A stable hue per restaurant, so the tiles read as a palette rather than noise and a
 * given restaurant always looks the same. Derived from the objectID, which never
 * changes; deriving it from the name would reshuffle on a re-index.
 */
export function tileHue(objectID) {
  const s = String(objectID ?? '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) % 360;
  return hash;
}

/**
 * Percentage fill for a five-star row. Kept here rather than in the component so the
 * rounding is testable: `stars_count` runs 1.00 to 5.00 with no zeros.
 */
export function starFillPercent(stars) {
  const value = Number(stars);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, (value / 5) * 100));
}

/**
 * Title-cases a controlled-vocabulary value for display.
 *
 * `occasions` is the only facet stored lowercase — the vocabulary in CLAUDE.md §4 is
 * written that way — while `cuisine`, `cuisine_tags`, `dining_style` and `price_range` all
 * arrive capitalised, so the panel read as inconsistent. Capitalising happens at display
 * time and never in the data, because the stored value is load-bearing: it is what
 * `filters` sends to Algolia and what the name-versus-category heuristic in
 * `searchParams.js` matches a lowercased query against. Rewriting it would mean a
 * re-transform and a re-index to change nothing but letter case.
 */
export function titleCase(value) {
  return String(value ?? '').replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
