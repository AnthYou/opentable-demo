/**
 * searchParams.js — the two parameter sets, side by side.
 *
 * The header Autocomplete.js box and the InstantSearch page below it share one client
 * (`searchClient.js`) and must **not** share parameters (CLAUDE.md §6). Geo weighting,
 * `aroundRadius`, `hitsPerPage` and returned attributes all differ per journey. They are
 * declared in one file so the difference can be read at a glance instead of being
 * reconstructed from two component trees.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────
 * THE LOAD-BEARING RULE
 *
 * The known-item set sends **no geo parameter at all**. That is not a stylistic
 * preference — it is the only thing protecting the known-item journey since `geo` was
 * restored to position 2 in `ranking` (measured: `test-queries.md` G3 and the change log
 * entry for 2026-09-03).
 *
 * With `geo` second, ahead of `words`, `attribute` and `exact`, any request carrying
 * `aroundLatLng` ranks proximity above text relevance. A user searching `nobu` from
 * Denver would get the nearest bistro instead of Nobu. Cases G1, G2 and G4 pass today
 * only because this set is geo-free; they were byte-identical before and after the
 * ranking change for exactly that reason.
 *
 * Distance still reaches the known-item dropdown — computed client-side from `_geoloc`,
 * which is why that attribute is retrieved here. Display, never ranking.
 *
 * The assertion at the bottom of this file enforces the rule mechanically.
 * ─────────────────────────────────────────────────────────────────────────────────────
 */

/**
 * Every parameter that hands proximity to the engine. Used by the guard below, and
 * listed explicitly so adding a new geo parameter to Algolia's API does not silently
 * slip past it — an unknown geo parameter is a deliberate review moment.
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
 * two streets further". 5 km is the measured value: on `italian` from Denver it puts all
 * ten top hits in Denver with popularity strictly decreasing inside the bucket
 * (4.688, 4.590, 4.589, 4.589, 4.497). Do not lower it without re-running G3.
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
 * PERSONA 1 — known-item, the header dropdown.
 *
 * Text relevance leads. Few hits: `test-queries.md` K17 shows a query for `ruth`
 * matching 31 near-identical Ruth's Chris rows, which is a dead end rather than a
 * suggestion list, so the dropdown shows five and the page below carries the rest.
 *
 * `attributesToHighlight: ['name']` is not decoration. With typo tolerance active a
 * query for `naya` can return `Kaya`, and the result is only comprehensible if the
 * matched characters are marked.
 *
 * `location_label_ambiguous` is retrieved because the UI is obliged to append distance
 * wherever it is true — on 18 records across 9 same-city chain clusters the label alone
 * renders identically (Fleming's Scottsdale 40036 and 39919 both read "Scottsdale").
 * `test-queries.md` K18 and C2 fail until that happens.
 *
 * `address` is retrieved for the same reason, and was added after writing the consumer:
 * distance completes the label only when the user's position is known, and geolocation
 * can be declined. With no position the address is the only remaining discriminator
 * between two ambiguous chain siblings. It is retrieved, not searched — it was removed
 * from `searchableAttributes` on 2026-09-03 for injecting typo-plus-prefix noise.
 */
export const knownItemParams = {
  hitsPerPage: 5,

  attributesToRetrieve: [
    'objectID',
    'name',
    'chain_name',
    'location_label',
    'location_label_ambiguous',
    'address',
    'city',
    'state',
    '_geoloc',
    'cuisine',
    'price_range',
    'image_url',
    'reserve_url',
  ],

  attributesToHighlight: ['name'],

  // queryID propagation, so a click or a booking from the dropdown can be attributed.
  // Conversion from search into bookings is the stated business goal (§1), so the
  // prototype has to be able to measure it.
  clickAnalytics: true,
};

/**
 * PERSONA 2 — discovery, the results page.
 *
 * Geo leads here, which is the whole reason the two sets exist. The geo half is not in
 * this object: it depends on the user's position at query time and is produced by
 * `discoveryGeoParams()` below.
 *
 * `hitsPerPage: 24` fills a grid without paging on the first screen. Facets are listed
 * explicitly rather than left to the widgets so the request shape is reviewable in one
 * place; `cuisine_tags` is present because it is the second-level refinement that makes
 * the `American` merge defensible — 35% of the corpus in one first-level bucket only
 * works if it partitions into Traditional (865) against Contemporary (745).
 */
export const discoveryParams = {
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
 * The geo half of the discovery set, and the §5 fallback chain in one place.
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
export function discoveryGeoParams(position, options = {}) {
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
 * Mechanical enforcement of the load-bearing rule above.
 *
 * A comment saying "never send geo here" is a convention someone has to police. This is
 * a check that fails at boot. It runs unconditionally rather than under a dev-only guard
 * because shipping a known-item set that ranks by proximity is worse than a hard failure
 * on the first page load — the failure is at least visible.
 */
const leakedGeo = GEO_PARAMS.filter((p) => p in knownItemParams);
if (leakedGeo.length > 0) {
  throw new Error(
    `knownItemParams must never carry a geo parameter, found: ${leakedGeo.join(', ')}. ` +
    'With `geo` at position 2 in ranking, proximity outranks text relevance and a search ' +
    'for a restaurant by name returns the nearest one instead. See test-queries.md G1.'
  );
}
