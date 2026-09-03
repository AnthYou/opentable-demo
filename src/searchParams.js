/**
 * searchParams.js — the two parameter sets, side by side.
 *
 * There is one search surface: one box, search-as-you-type, results below. What varies
 * between the two journeys is **not whether geo is sent** — it always is, as soon as a
 * position is resolvable — but how much power proximity has over the ranking.
 *
 * ---------------------------------------------------------------------------------
 * THE AXIS IS NAME versus CATEGORY, AND BOTH ARE TEXT
 *
 *   "Nobu", "Pappas Bros."      -> known-item. Geo must not dominate.
 *   "italian", "steakhouse"     -> discovery. Geo must lead.
 *
 * An earlier version of this file gated geo on whether the query was empty. That was
 * wrong: a user in Chicago typing `italian` is discovering, not looking up a name, and
 * the empty/non-empty axis denied them proximity. The axis is what the query *means*.
 *
 * THE DIAL IS `aroundPrecision`, NOT ON/OFF
 *
 * `aroundLatLng` and `aroundRadius: "all"` are permanent. A result is never lost to
 * distance — the corpus is a sparse national sample, 5,000 restaurants across 916
 * cities, so a bounded radius returns nothing for most positions. Measured: `italian`
 * from Denver returns 31 records inside 50 km against 895 unbounded.
 *
 * `aroundPrecision` groups records into distance buckets; inside a bucket they count as
 * equidistant and the next ranking criterion decides. So the bucket size *is* the dial:
 *
 *   fine   (5 km)      -> proximity genuinely orders the results
 *   coarse (20,000 km) -> the whole corpus is one bucket, geo decides nothing
 *
 * Both ends are measured. At 10,000 km the ranking is already byte-identical to sending
 * no geo at all, verified on `prime`, `rye`, `union` and `nobu`. At 5 km, `italian`,
 * `steakhouse` and `sushi` all return Denver restaurants from Denver.
 *
 * Why the dial rather than on/off: it is *not* to preserve the distance display.
 * Distance is computed client-side in `lib/format.js` from the browser position and each
 * record's `_geoloc`, so it survives either way — that is what `_geoloc` is retrieved
 * for. The dial is better because it is one code path with a continuous parameter rather
 * than two branches, and because it degrades gracefully: a misclassified query gets
 * weaker or stronger proximity, never a different feature set.
 * ---------------------------------------------------------------------------------
 */

import taxonomy from '../scripts/cuisine-taxonomy.json' with { type: 'json' };

/** Measured: proximity genuinely orders results at this bucket size. */
export const PRECISION_FINE_METRES = 5000;

/**
 * Measured: at 10,000 km the ranking is already identical to sending no geo, so
 * 20,000 km — more than half the Earth's circumference — is unambiguously one bucket.
 */
export const PRECISION_COARSE_METRES = 20000000;

/** The threshold at which geo was measured to stop discriminating at all. */
const PRECISION_NEUTRAL_THRESHOLD_METRES = 10000000;

/**
 * Positions the demo can be run from, and the only ones worth running it from.
 *
 * The corpus is a sparse national sample and the gaps are not where you would guess.
 * Measured: **Chicago has zero records** — nothing in the city, nothing in its market,
 * nearest restaurant 116 km away in South Bend. Boston (123 km), Atlanta (167 km) and
 * Seattle (220 km) are equally empty. A "near me" demo run from any of those looks
 * broken while behaving perfectly.
 *
 * So the position is a user choice, not only a browser reading. Each entry is a `market`
 * — the corpus's own navigation facet — with the centroid of its densest city as the
 * pivot, and the count of records within 25 km of that pivot. Ordered by coverage.
 *
 * Derived from `data/records.json`; re-derive if the transform changes. 21 of the 51
 * markets hold fewer than 20 records within 25 km of their pivot, which is why this list
 * is curated rather than generated from all of them.
 */
export const DEMO_LOCATIONS = [
  { label: 'New York', market: 'New York / Tri-State Area', lat: 40.7484, lng: -73.9854, within25km: 903 },
  { label: 'San Diego', market: 'San Diego', lat: 32.763, lng: -117.1734, within25km: 211 },
  { label: 'Houston', market: 'Houston', lat: 29.7578, lng: -95.443, within25km: 176 },
  { label: 'Denver', market: 'Denver / Colorado', lat: 39.7343, lng: -104.9794, within25km: 175 },
  { label: 'San Francisco', market: 'San Francisco Bay Area', lat: 37.7837, lng: -122.4211, within25km: 164 },
  { label: 'Phoenix / Scottsdale', market: 'Phoenix / Arizona', lat: 33.5712, lng: -111.9183, within25km: 156 },
  { label: 'Portland', market: 'Portland / Oregon', lat: 45.5231, lng: -122.6693, within25km: 147 },
  { label: 'Indianapolis', market: 'Indiana', lat: 39.8155, lng: -86.1498, within25km: 87 },
  { label: 'Las Vegas', market: 'Las Vegas', lat: 36.1226, lng: -115.1788, within25km: 87 },
  { label: 'Nashville', market: 'Nashville', lat: 36.1503, lng: -86.7869, within25km: 86 },
];

/**
 * §5's third rung. It is no longer a silent automatic fallback: the selector makes it a
 * user choice, which serves "tell the user which location is in use" better than any
 * default could. It stays as the densest market, for a caller that wants a position
 * without asking.
 */
export const DEFAULT_METRO = DEMO_LOCATIONS[0];

/**
 * The half both journeys share: everything except `aroundPrecision`.
 *
 * `attributesToHighlight` includes `name` because highlighting is load-bearing rather
 * than decorative: with typo tolerance active a query for `naya` can return `Kaya`, and
 * the result is only comprehensible if the matched characters are marked.
 *
 * `location_label_ambiguous` is retrieved because the UI is obliged to append distance
 * wherever it is true — on 18 records across 9 same-city chain clusters the label alone
 * renders identically (Fleming's Scottsdale 40036 and 39919 both read "Scottsdale").
 * `address` is the fallback discriminator for those records when geolocation has been
 * declined. Both are retrieved, not searched: `address` was dropped from
 * `searchableAttributes` on 2026-09-03 for injecting typo-plus-prefix noise.
 *
 * `_geoloc` is retrieved so `lib/format.js` can compute distance client-side.
 *
 * `clickAnalytics` returns a queryID so a click or a booking can be attributed.
 * Conversion from search into bookings is the stated business goal (§1), so the
 * prototype has to be able to measure it.
 */
const baseParams = {
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
 * PERSONA 1 — the query looks like a restaurant name.
 *
 * Proximity is neutralised. `geo` sits second in `ranking`, ahead of `words`,
 * `attribute` and `exact`, so a discriminating bucket lets a nearer *partial* match
 * displace an exact name: at 5 km, `Ocean Prime - Denver` (2 km) beats 117067 `Prime`
 * (1,062 km), `Barley & Rye` beats `Rye`, `Workshop at UNION` beats `Union`. At the
 * coarse bucket all three come back in the right order.
 *
 * Distance is still computed and still shown — it is what separates the 18 ambiguous
 * chain siblings. Display, never ranking.
 */
export const nameQueryParams = {
  ...baseParams,
  aroundPrecision: PRECISION_COARSE_METRES,
};

/**
 * PERSONA 2 — the query looks like a category, or there is no query yet.
 *
 * Proximity leads, which is what §5 asks of discovery. 5 km is coarse enough that
 * `popularity_score` breaks ties inside a bucket — "without precision buckets, a
 * marginally closer mediocre restaurant outranks an excellent one two streets further".
 * Measured on the empty query from Denver: the top eight are all Denver restaurants
 * rated 4.7 to 4.8 with 290 to 3,481 reviews, so popularity is doing the ordering
 * inside the bucket rather than raw distance.
 */
export const categoryQueryParams = {
  ...baseParams,
  aroundPrecision: PRECISION_FINE_METRES,
};

/**
 * The category vocabulary: every value of the four taxonomy facets.
 *
 * Places are deliberately excluded. `city`, `neighborhood` and `market` hold 1,269
 * values and eight of them are also restaurant names — `rye`, `union`, `babylon`,
 * `santa fe`, `acme`, `lafayette`, `meridian`, `riverside` — so including them would
 * misclassify exactly the known-item queries this file exists to protect.
 *
 * Excluding them is right on the merits, not only convenient: a place query is already
 * constrained geographically by its own text match. A user in Chicago typing `denver`
 * matches only records whose city or market is Denver, so proximity from Chicago has
 * nothing meaningful left to reorder inside that set.
 *
 * Derived from `scripts/cuisine-taxonomy.json` rather than duplicated, so the two cannot
 * drift. `dining_style` and `occasions` are closed vocabularies of 4 and 7 values.
 */
const DINING_STYLES = ['casual dining', 'casual elegant', 'fine dining', 'home style'];
const OCCASIONS = ['date night', 'business lunch', 'family friendly', 'special occasion', 'group dinner', 'solo friendly', 'late night'];

const CATEGORY_VOCABULARY = new Set(
  [
    ...Object.values(taxonomy.mapping).flatMap((entry) => [entry.cuisine, ...(entry.cuisine_tags ?? [])]),
    ...DINING_STYLES,
    ...OCCASIONS,
  ].map((value) => value.toLowerCase())
);

/**
 * Does this query look like a category rather than a restaurant name?
 *
 * **This is a heuristic and a stated limitation of the prototype, not a reliable
 * classifier.** It tests one thing: whether the whole query, lowercased, is exactly a
 * value of one of the four taxonomy facets. Two known failure modes, both measured:
 *
 * 1. **One residual collision.** `bistro` is a `cuisine_tags` value *and* the name of
 *    100624 in Jupiter, so it classifies as a category and 100624 loses the top spot.
 *    That case is already recorded as `accepted` in test-queries.md A7 for an unrelated
 *    reason. `small plates` collides the same way (112537 in Syracuse) and no test
 *    covers it.
 * 2. **Exact match only.** `italian restaurant`, `cheap italian` and `sushi near me`
 *    match nothing and are treated as names, so a naturally phrased discovery query gets
 *    no proximity. Closing that needs real query categorisation, which CLAUDE.md §9
 *    lists as out of scope for this prototype.
 *
 * An empty query counts as a category: browsing is discovery, and proximity is the only
 * signal the user has given.
 */
export function looksLikeCategory(query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (q === '') return true;
  return CATEGORY_VOCABULARY.has(q);
}

/**
 * Picks the parameter set for a query. A single entry point, so the choice cannot be
 * made in two places and drift.
 */
export function paramsForQuery(query) {
  return looksLikeCategory(query) ? categoryQueryParams : nameQueryParams;
}

/**
 * The geo half: coordinates and radius, never precision. Applied whenever a position is
 * resolvable, which per §5 is always — browser, then IP, then the default metro.
 *
 * Returns the parameters **and** the label to show the user, because §5 requires the
 * location in use to be stated: "tell the user which location is in use so the results
 * are never unexplained". A caller that ignores `label` leaves the results unexplained,
 * which is the failure the requirement exists to prevent.
 *
 * @param {{lat: number, lng: number} | null} position Browser geolocation, or null when
 *   it was denied, unavailable or still pending.
 * @param {{ipFallback?: boolean}} [options] Set `ipFallback: false` to skip straight to
 *   the default metro — for the case where the IP lookup returned nothing usable.
 */
export function geoParams(position, options = {}) {
  const { ipFallback = true } = options;

  if (position && Number.isFinite(position.lat) && Number.isFinite(position.lng)) {
    // A position carrying its own label came from the selector; one without came from
    // the browser. Keeping the label here rather than in the caller is what stops §5's
    // "tell the user which location is in use" from being skippable.
    return {
      source: position.label ? 'selected' : 'browser',
      label: position.label ?? 'your location',
      params: { aroundLatLng: `${position.lat},${position.lng}`, aroundRadius: 'all' },
    };
  }

  if (ipFallback) {
    return {
      source: 'ip',
      label: 'your approximate location',
      params: { aroundLatLngViaIP: true, aroundRadius: 'all' },
    };
  }

  return {
    source: 'default-metro',
    label: DEFAULT_METRO.label,
    params: { aroundLatLng: `${DEFAULT_METRO.lat},${DEFAULT_METRO.lng}`, aroundRadius: 'all' },
  };
}

/**
 * Mechanical enforcement of the two invariants that make the dial work. Comments are a
 * convention someone has to police; these fail at boot.
 *
 * They run unconditionally rather than under a dev-only guard, because a demo that
 * silently ranks name lookups by proximity is worse than a visible failure on first
 * load — the failure is at least visible.
 */
const differingKeys = [...new Set([...Object.keys(nameQueryParams), ...Object.keys(categoryQueryParams)])].filter(
  (k) => JSON.stringify(nameQueryParams[k]) !== JSON.stringify(categoryQueryParams[k])
);

if (differingKeys.length !== 1 || differingKeys[0] !== 'aroundPrecision') {
  throw new Error(
    `The two parameter sets must differ in aroundPrecision and nothing else, but differ in: ${differingKeys.join(', ')}. ` +
      'Anything else diverging means the two journeys have quietly become two feature sets.'
  );
}

if (PRECISION_COARSE_METRES < PRECISION_NEUTRAL_THRESHOLD_METRES) {
  throw new Error(
    `PRECISION_COARSE_METRES is ${PRECISION_COARSE_METRES} m, below the ${PRECISION_NEUTRAL_THRESHOLD_METRES} m at ` +
      'which geo was measured to stop discriminating. Above that threshold a name query ranks as if no geo were ' +
      'sent; below it, a nearer partial match displaces the exact name. See test-queries.md A1, A2 and A6.'
  );
}
