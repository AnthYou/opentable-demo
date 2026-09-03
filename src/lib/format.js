/**
 * Shared formatters. Pure functions, no React, no Algolia — so they can be reasoned
 * about and tested on their own.
 */

/** Miles, not kilometres: `country` is constant `US` across all 5,000 records. */
const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (deg) => (deg * Math.PI) / 180;

/**
 * Great-circle distance in miles. Used for *display only* on the known-item journey,
 * which deliberately sends no geo parameter to Algolia — see `searchParams.js`. Computing
 * it here is what lets distance reach the dropdown without letting proximity into the
 * ranking.
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
