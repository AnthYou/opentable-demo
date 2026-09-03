/**
 * searchParams.js — the search parameters, and the geo fallback chain.
 *
 * There is one search surface and one parameter set. Every query carries the user's
 * position with `aroundRadius: "all"` and `aroundPrecision: 5 km`, so proximity orders
 * the results and `popularity_score` breaks ties inside each bucket.
 *
 * Proximity leading does not cost the known-item journey anything, because `exact` sits
 * above `geo` in the index `ranking`. A single-word query equal to a whole attribute
 * value wins on `exact` whatever its distance — 117067 `Prime` at 1,062 km still ranks
 * above `Ocean Prime - Denver` at 2 km. Records that tie on `exact`, which is every
 * member of a chain, are then ordered by distance. That is the disambiguation persona 1
 * asked for: `cyclone` from Houston returns the five Cyclone Anaya's at 2, 2, 3, 4 and
 * 7 mi, and `pappas bros` from Dallas puts Dallas above Houston.
 *
 * `aroundRadius` stays `"all"` so a result is never lost to distance. The corpus is a
 * sparse national sample — 5,000 restaurants across 916 cities — and a bounded radius
 * returns nothing for most positions: `italian` from Denver gives 31 records inside
 * 50 km against 895 unbounded.
 *
 * Distance display is independent of ranking. `lib/format.js` computes it client-side
 * from the browser position and each record's `_geoloc`, which is what `_geoloc` is
 * retrieved for.
 *
 * Earlier designs — two parameter sets switched by a name-versus-category heuristic, and
 * geo gated on the query being empty — are recorded in DECISIONS.md.
 */

/**
 * The distance bucket. Records inside one bucket count as equidistant and the next
 * ranking criterion decides, so 5 km is what stops a marginally closer mediocre
 * restaurant from outranking an excellent one two streets further. Measured on the empty
 * query from Denver: the top eight are all Denver restaurants rated 4.7 to 4.8 with 290
 * to 3,481 reviews, so `popularity_score` orders them inside the bucket.
 */
export const PRECISION_METRES = 5000;

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
 * `within25km` is what justifies curating this list rather than generating it from all
 * 51 markets, and it is deliberately **not shown in the UI**: a number beside a city in
 * a search interface reads as a result count, which it is not.
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
 * Neighbourhood positions.
 *
 * A second zoom level on the markets above. Markets move you between cities; these move
 * you inside one, which is the only way to watch the `geo` criterion reorder a result set
 * that is already entirely local.
 *
 * Three constraints, and the third is the one that is easy to get wrong:
 *
 * - **A real neighbourhood, never the city fallback.** `neighborhood` equals `city` on
 *   2,500 records (§3), so half the corpus has no neighbourhood at all. Those pairs are
 *   excluded: "Columbus, Columbus" is not a neighbourhood, it is a missing value.
 * - **Enough records for the centroid to mean something.** Every entry below is backed by
 *   at least 10, so the anchor is a district rather than one restaurant standing for one.
 * - **Separated by more than the bucket.** `aroundPrecision` is 5 km, and two positions
 *   closer than that fall into the *same* bucket, where `geo` declares
 *   them tied and the later criteria return an identical order. Measured the wrong way
 *   round first: Houston Downtown and Midtown / Montrose sit 2.3 km apart and shared 7 of
 *   their top 10 with the same first hit, so Midtown / Montrose was dropped. Every
 *   intra-city pair kept below exceeds 5 km — Houston's minimum is 9.5 km, San Antonio's
 *   6.8, New York's 5.7.
 *
 * What that buys, measured:
 *
 * - **San Antonio is the clearest.** On `mexican` all three anchors return a *different*
 *   first hit, each one in the selected neighbourhood — La Fonda on Main downtown, Paloma
 *   Blanca in Alamo Heights, Pericos in North San Antonio — while 9 of the top 10 are the
 *   same restaurants throughout. Same results, different order, which is precisely what a
 *   ranking criterion does and what a filter does not.
 * - **Houston is the most dramatic.** On `italian`, Downtown and West Side share **0 of
 *   their top 10**: far enough apart that the pages have nothing in common.
 * - **New York is the weakest of the three** and worth knowing before demoing it: two
 *   distinct first hits out of three anchors, because Manhattan is small relative to a
 *   5 km bucket.
 *
 * `records` is the sample size behind each centroid, and like `within25km` above it is
 * deliberately not shown in the UI, for the same reason — a number beside a place in a
 * search interface reads as a result count.
 *
 * These reorder any query whose records tie on `exact`, which is every category query and
 * every partial name. A single-word query equal to a whole attribute value wins on `exact`
 * before `geo` is consulted, so moving the anchor leaves it at rank 1.
 *
 * Derived from `data/records.json`; re-derive if the transform changes.
 */
export const DEMO_NEIGHBOURHOODS = [
  { label: 'New York — Midtown West', city: 'New York', neighborhood: 'Midtown West', lat: 40.75879, lng: -73.98397, records: 80 },
  { label: 'New York — Harlem', city: 'New York', neighborhood: 'Harlem', lat: 40.80398, lng: -73.95101, records: 13 },
  { label: 'New York — Financial District', city: 'New York', neighborhood: 'Financial District', lat: 40.70633, lng: -74.00846, records: 14 },
  { label: 'Houston — Downtown', city: 'Houston', neighborhood: 'Downtown', lat: 29.75775, lng: -95.36978, records: 31 },
  { label: 'Houston — Galleria / Uptown', city: 'Houston', neighborhood: 'Galleria / Uptown', lat: 29.74477, lng: -95.4673, records: 44 },
  { label: 'Houston — West Side', city: 'Houston', neighborhood: 'West Side', lat: 29.77495, lng: -95.56667, records: 26 },
  { label: 'San Antonio — Downtown', city: 'San Antonio', neighborhood: 'Downtown', lat: 29.42934, lng: -98.48837, records: 34 },
  { label: 'San Antonio — Alamo Heights', city: 'San Antonio', neighborhood: 'Alamo Heights', lat: 29.4887, lng: -98.47029, records: 10 },
  { label: 'San Antonio — North San Antonio', city: 'San Antonio', neighborhood: 'North San Antonio', lat: 29.58191, lng: -98.52614, records: 14 },
];

/**
 * Resolves a selector label to a position. One lookup rather than two searches in the
 * caller, so adding a third group later cannot leave `App.jsx` silently missing it.
 */
export function findDemoPosition(label) {
  if (!label) return null;
  return (
    DEMO_LOCATIONS.find((l) => l.label === label) ??
    DEMO_NEIGHBOURHOODS.find((l) => l.label === label) ??
    null
  );
}

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
 * `image_url` is **not** retrieved. Every value in the extract 302-redirects to the same
 * 207x207 grey PNG — verified by hashing five of them, identical SHA-256 — so the photos
 * are gone and retrieving the field would ship 24 dead URLs per page for nothing. The
 * card renders a local placeholder instead. `reserve_url` is kept because it still
 * works: it resolves to opentable.com/restaurant/profile/{id}/reserve.
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
    'reserve_url',
    'phone',
  ],

  attributesToHighlight: ['name', 'cuisine', 'cuisine_tags'],

  clickAnalytics: true,
};

/**
 * `facets` is deliberately **not** declared here, and the reason is a bug this file
 * caused.
 *
 * It was listed for a while on the grounds that stating the request shape in one place
 * makes it reviewable. That was wrong: `facets` in `<Configure>` is not documentation,
 * it is a competing declaration. It replaced the facet list that the `RefinementList`
 * widgets build for themselves, and Algolia then silently dropped every facet filter —
 * measured, a refinement of `cuisine: ["Italian"]` returned 5,000 hits instead of 890.
 * The whole filter panel was inert.
 *
 * Each widget declares the facet it needs. Nothing else should.
 */

/**
 * The search parameters. One set, applied to every query.
 *
 * `aroundPrecision` is the only geo knob here; the coordinates come from `geoParams`
 * below and are merged in by the caller.
 */
export const searchParams = {
  ...baseParams,
  aroundPrecision: PRECISION_METRES,
};

/**
 * The geo half: coordinates and radius. Applied whenever a position is resolvable, which
 * is always — browser, then IP, then the default metro.
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
 * `PRECISION_METRES` is the one setting that decides whether proximity ranks at all, so
 * it fails at boot rather than degrading silently. Above ~10,000 km the ranking was
 * measured identical to sending no geo; a value that large means the demo has quietly
 * stopped being location-aware.
 */
if (!(PRECISION_METRES > 0) || PRECISION_METRES >= 10000000) {
  throw new Error(
    `PRECISION_METRES is ${PRECISION_METRES} m. Below 1 it is not a bucket; at or above 10,000,000 m the whole corpus ` +
      'falls into one bucket and the geo criterion decides nothing, which removes proximity from every journey. ' +
      'See test-queries.md and DECISIONS.md.'
  );
}
