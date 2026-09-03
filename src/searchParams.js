/**
 * searchParams.js — the search parameters, and the one rule that governs geo.
 *
 * There is a single search surface: one box, search-as-you-type, results below. One
 * surface means one parameter set — a base set that never carries a geo parameter, plus
 * a geo half applied under one condition.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────
 * THE RULE: geo applies only when the query is empty.
 *
 * With no query typed, proximity is the only ranking signal the user has given us, and
 * §5 asks discovery to lead with it. Once they type, their words outrank their location.
 *
 * This is measured, not chosen. `geo` sits second in `ranking`, ahead of `words`,
 * `attribute` and `exact`, so a geo parameter on a typed query lets the nearer record
 * that merely *also* matches the word displace the exact name: `Ocean Prime - Denver`
 * (2 km) beats 117067 `Prime` (1,062 km) on `prime`, `Barley & Rye` beats `Rye` on
 * `rye`, `Workshop at UNION` beats `Union` on `union`. Sending geo on every query takes
 * the suite from 42/50 to 38/50.
 *
 * The known cost of the rule is the reverse case: `italian` from Denver returns Memphis
 * and Orlando rather than Denver. See `test-queries.md` G3.
 *
 * The assertion at the bottom enforces that the base set stays geo-free.
 * ─────────────────────────────────────────────────────────────────────────────────────
 */

/**
 * Every parameter that hands proximity to the engine. Listed explicitly so a new geo
 * parameter in Algolia's API does not slip past the guard unnoticed.
 */
const GEO_PARAMS = [
  'aroundLatLng',
  'aroundLatLngViaIP',
  'aroundRadius',
  'aroundPrecision',
  'minimumAroundRadius',
  'insideBoundingBox',
  'insidePolygon',
];

/**
 * Coarse enough that `popularity_score` breaks ties inside a bucket, per §5 — "without
 * precision buckets, a marginally closer mediocre restaurant outranks an excellent one
 * two streets further". 5 km is the measured value: on the empty query from Denver the
 * top eight are all Denver restaurants rated 4.7 to 4.8 with 290 to 3,481 reviews, so
 * popularity is doing the ordering inside the bucket rather than raw distance.
 */
export const AROUND_PRECISION_METRES = 5000;

/**
 * Last rung of the geo fallback chain. §5: never leave the user geo-blocked — browser
 * position, then IP, then a default metro, and tell the user which is in use.
 *
 * New York because it is the densest part of the corpus by a wide margin: 695 records in
 * the city and 1,414 in the `New York / Tri-State Area` market, 28% of all 5,000. A
 * default metro with thin coverage would make the fallback look broken. Coordinates are
 * the measured centroid of those 695 records, not a landmark.
 */
export const DEFAULT_METRO = {
  label: 'New York',
  lat: 40.7484,
  lng: -73.9854,
};

/**
 * The base set. Never carries a geo parameter — see the rule above.
 *
 * `hitsPerPage: 24` fills a grid without paging on the first screen.
 *
 * `attributesToHighlight` includes `name` because highlighting is load-bearing rather
 * than decorative: with typo tolerance active a query for `naya` can return `Kaya`, and
 * the result is only comprehensible if the matched characters are marked.
 *
 * `location_label_ambiguous` is retrieved because the UI is obliged to append distance
 * wherever it is true — on 18 records across 9 same-city chain clusters the label alone
 * renders identically (Fleming's Scottsdale 40036 and 39919 both read "Scottsdale").
 * `address` is retrieved as the fallback discriminator for the same records when
 * geolocation has been declined and no distance can be computed. Both are retrieved,
 * not searched; `address` was dropped from `searchableAttributes` on 2026-09-03 for
 * injecting typo-plus-prefix noise.
 *
 * `clickAnalytics` returns a queryID so a click or a booking can be attributed.
 * Conversion from search into bookings is the stated business goal (§1), so the
 * prototype has to be able to measure it.
 */
export const searchParams = {
  hitsPerPage: 24,

  attributesToRetrieve: [
    'objectID',
    'name',
    'chain_name',
    'is_chain',
    'address',
    'neighborhood',
    'city',
    'state',
    'location_label',
    'location_label_ambiguous',
    'market',
    '_geoloc',
    'cuisine',
    'cuisine_tags',
    'dining_style',
    'price_range',
    'price_tier',
    'stars_count',
    'reviews_count',
    'occasions',
    'image_url',
    'reserve_url',
    'phone',
  ],

  attributesToHighlight: ['name', 'cuisine', 'cuisine_tags'],

  facets: [
    'cuisine',
    'cuisine_tags',
    'dining_style',
    'price_range',
    'occasions',
    'city',
    'market',
    'neighborhood',
  ],

  clickAnalytics: true,
};

/**
 * The geo half, and the §5 fallback chain in one place. Applied by the caller **only
 * when the query is empty** — the rule at the top of this file.
 *
 * Returns the parameters **and** the label to show the user, because §5 requires the
 * location in use to be stated: "tell the user which location is in use so the results
 * are never unexplained". A caller that ignores `label` leaves the results unexplained,
 * which is the failure the requirement exists to prevent.
 *
 * `aroundRadius: 'all'` throughout, per §5. A finite radius would filter rather than
 * rank and would starve users in sparse markets — measured: `italian` from Denver with a
 * 50 km radius returns 31 records against 895 unbounded.
 *
 * @param {{lat: number, lng: number} | null} position Browser geolocation, or null when
 *   it was denied, unavailable or still pending.
 * @param {{ipFallback?: boolean}} [options] Set `ipFallback: false` to skip straight to
 *   the default metro — for the case where the IP lookup itself returned nothing usable.
 */
export function browseGeoParams(position, options = {}) {
  const { ipFallback = true } = options;

  if (position && Number.isFinite(position.lat) && Number.isFinite(position.lng)) {
    return {
      source: 'browser',
      label: 'your location',
      params: {
        aroundLatLng: `${position.lat},${position.lng}`,
        aroundRadius: 'all',
        aroundPrecision: AROUND_PRECISION_METRES,
      },
    };
  }

  if (ipFallback) {
    return {
      source: 'ip',
      label: 'your approximate location',
      params: {
        aroundLatLngViaIP: true,
        aroundRadius: 'all',
        aroundPrecision: AROUND_PRECISION_METRES,
      },
    };
  }

  return {
    source: 'default-metro',
    label: DEFAULT_METRO.label,
    params: {
      aroundLatLng: `${DEFAULT_METRO.lat},${DEFAULT_METRO.lng}`,
      aroundRadius: 'all',
      aroundPrecision: AROUND_PRECISION_METRES,
    },
  };
}

/**
 * Mechanical enforcement of the rule above.
 *
 * A comment saying "geo never belongs in the base set" is a convention someone has to
 * police. This is a check that fails at boot. It runs unconditionally rather than under
 * a dev-only guard, because shipping a base set that ranks typed queries by proximity is
 * worse than a visible failure on first load — the failure is at least visible.
 */
const leakedGeo = GEO_PARAMS.filter((p) => p in searchParams);
if (leakedGeo.length > 0) {
  throw new Error(
    `searchParams must never carry a geo parameter, found: ${leakedGeo.join(', ')}. ` +
    'Geo belongs in browseGeoParams and applies only to the empty query. With `geo` at ' +
    'position 2 in ranking, a geo parameter on a typed query lets a nearer partial match ' +
    'displace the exact name. See test-queries.md A1, A2 and A6.'
  );
}
