/**
 * searchParams.js — the search parameters, and the geo fallback chain.
 *
 * There is one search surface and one parameter set. Every query carries the user's
 * position with `aroundRadius: "all"` and `aroundPrecision: 5 km`, so proximity orders
 * the results and `popularity_score` breaks ties inside each bucket.
 *
 * Proximity leads deliberately. `geo` sits second in the index `ranking`, above `words`,
 * `attribute` and `exact`, because proximity is the dominant intent signal for a diner
 * choosing somewhere to eat: `cyclone` from Houston returns the five Cyclone Anaya's at
 * 2, 2, 3, 4 and 7 mi, and `pappas bros` from Dallas puts Dallas above Houston.
 *
 * It costs the exact-name cases, and that cost is accepted rather than hidden. From
 * Denver, 117067 `Prime` sits at rank 14 of 49 behind `Ocean Prime - Denver`, and
 * test-queries.md A1, A2 and A6 are `accepted` on the use case: someone who wants a
 * restaurant in another city names that city, and ten city-qualified queries each return
 * exactly one hit at rank 1. See DECISIONS.md §2 before reordering `ranking`.
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
 * geo gated on the query being empty — are recorded in DECISIONS.md §4.
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
 * Every position the demo can be run from: one flat list of neighbourhood anchors.
 *
 * Two problems are solved by the same list. The corpus is a sparse national sample with
 * gaps where nobody would look for them — **Chicago holds zero records**, nothing in the
 * city, nothing in its market, nearest restaurant 116 km away in South Bend, and Boston
 * (123 km), Atlanta (167 km) and Seattle (220 km) are the same. A demo driven only by the
 * browser looks broken from any of those while behaving perfectly. And a position between
 * cities cannot show the `geo` criterion reordering a result set that is already entirely
 * local; only a position *inside* a city can.
 *
 * So every entry is a real neighbourhood rather than a city or a market centroid. Three
 * constraints, and the third is the one that is easy to get wrong:
 *
 * - **A real neighbourhood, never the `city` fallback.** `neighborhood` equals `city` on
 *   2,500 records, so half the corpus has no neighbourhood at all. Those are excluded:
 *   "Columbus, Columbus" is a missing value, not a neighbourhood.
 * - **Enough records for the centroid to mean something.** Every anchor is backed by at
 *   least 10, so it stands for a district rather than for one restaurant.
 * - **Separated by more than the `aroundPrecision` bucket.** Two positions closer than
 *   5 km fall into the *same* bucket, where `geo` declares them tied and the later
 *   criteria return an identical order — a menu row that changes nothing.
 *   `assertSelectorSeparation` below enforces it across all 105 pairs; the tightest is
 *   New York Midtown West / Harlem at 5.74 km.
 *
 * Two well-covered markets cannot be represented and are absent, which is a property of
 * the data rather than a curation choice:
 *
 * - **Phoenix / Scottsdale.** 239 of the market's 251 records carry `neighborhood` equal
 *   to `city`. Its largest real-neighbourhood group holds 3 records.
 * - **Las Vegas.** Its 45 neighbourhood values are venues, not districts — `Bellagio
 *   Hotel & Casino`, `Aria Hotel & Casino`, `The Venetian and Palazzo` — the largest
 *   holds 9 records, and they all sit within about 2 km of each other on the Strip, so
 *   they would collide in one bucket even at 10 records each.
 *
 * Portland is represented by Downtown alone. `NE Portland` qualified on record count and
 * cleared the bucket by 100 m, but measured it shares 7 of 10 top hits with Downtown and
 * the same first hit on `seafood`, which is the evidence that dropped Midtown / Montrose
 * from an earlier version of this list.
 *
 * What the list buys, measured on a category query:
 *
 * - **San Antonio is the clearest.** On `mexican` all three anchors return a *different*
 *   first hit, each one in the selected neighbourhood — La Fonda on Main downtown, Paloma
 *   Blanca in Alamo Heights, Pericos in North San Antonio — while 9 of the top 10 are the
 *   same restaurants throughout. Same results, different order, which is what a ranking
 *   criterion does and a filter does not.
 * - **Houston is the most dramatic.** On `italian`, Downtown and West Side share **0 of
 *   their top 10**: far enough apart that the pages have nothing in common.
 * - **New York is the weakest of the three** and worth knowing before demoing it: two
 *   distinct first hits from three anchors, because Manhattan is small against a 5 km
 *   bucket.
 *
 * `records` is the sample size behind each centroid. Like the market counts this list
 * replaces, it is deliberately not shown in the UI — a number beside a place in a search
 * interface reads as a result count, and it is not one.
 *
 * Grouped by city and kept that way: the selector renders one `optgroup` per city in
 * array order, so entries for one city must stay adjacent. Cities are ordered by their
 * total records, anchors within a city by their own. Derived from `data/records.json`;
 * re-derive if the transform changes.
 */
export const DEMO_POSITIONS = [
  // New York — 107 records across three anchors
  { label: 'New York — Midtown West', city: 'New York', neighborhood: 'Midtown West', lat: 40.75879, lng: -73.98397, records: 80 },
  { label: 'New York — Financial District', city: 'New York', neighborhood: 'Financial District', lat: 40.70633, lng: -74.00846, records: 14 },
  { label: 'New York — Harlem', city: 'New York', neighborhood: 'Harlem', lat: 40.80398, lng: -73.95101, records: 13 },
  // Houston — 101
  { label: 'Houston — Galleria / Uptown', city: 'Houston', neighborhood: 'Galleria / Uptown', lat: 29.74477, lng: -95.4673, records: 44 },
  { label: 'Houston — Downtown', city: 'Houston', neighborhood: 'Downtown', lat: 29.75775, lng: -95.36978, records: 31 },
  { label: 'Houston — West Side', city: 'Houston', neighborhood: 'West Side', lat: 29.77495, lng: -95.56667, records: 26 },
  // Denver — 70
  { label: 'Denver — Downtown / LoDo', city: 'Denver', neighborhood: 'Downtown / LoDo', lat: 39.74831, lng: -104.99666, records: 70 },
  // San Diego — 64
  { label: 'San Diego — Downtown / Gaslamp', city: 'San Diego', neighborhood: 'Downtown / Gaslamp', lat: 32.71295, lng: -117.16381, records: 64 },
  // San Antonio — 58
  { label: 'San Antonio — Downtown', city: 'San Antonio', neighborhood: 'Downtown', lat: 29.42934, lng: -98.48837, records: 34 },
  { label: 'San Antonio — North San Antonio', city: 'San Antonio', neighborhood: 'North San Antonio', lat: 29.58191, lng: -98.52614, records: 14 },
  { label: 'San Antonio — Alamo Heights', city: 'San Antonio', neighborhood: 'Alamo Heights', lat: 29.4887, lng: -98.47029, records: 10 },
  // Indianapolis — 43
  { label: 'Indianapolis — Downtown Indy', city: 'Indianapolis', neighborhood: 'Downtown Indy', lat: 39.79216, lng: -86.15169, records: 43 },
  // Portland — 37
  { label: 'Portland — Downtown', city: 'Portland', neighborhood: 'Downtown', lat: 45.51821, lng: -122.67944, records: 37 },
  // San Francisco — 16
  { label: 'San Francisco — SOMA', city: 'San Francisco', neighborhood: 'SOMA', lat: 37.78356, lng: -122.39851, records: 16 },
  // Nashville — 15
  { label: 'Nashville — West End', city: 'Nashville', neighborhood: 'West End', lat: 36.14795, lng: -86.80255, records: 15 },
];


/** Resolves a selector label to a position. */
export function findDemoPosition(label) {
  if (!label) return null;
  return DEMO_POSITIONS.find((l) => l.label === label) ?? null;
}

/**
 * A default position, reachable only through `geoParams(position, { ipFallback: false })`.
 *
 * **The app never calls it that way**, so this is unused by the front end. It cannot be
 * wired up client-side: `aroundLatLngViaIP` is resolved server-side and the resolved
 * position is never returned, so the client cannot detect that the IP lookup failed and
 * fall through. The user-facing third path is the location selector. Kept for a caller
 * that wants a position without asking, and for tests.
 *
 * Midtown West, the densest anchor in the corpus at 80 records. Resolved by label rather
 * than by index so reordering the list cannot silently move it, and asserted below so a
 * rename fails at boot instead of leaving this undefined.
 */
export const DEFAULT_POSITION = DEMO_POSITIONS.find((p) => p.label === 'New York — Midtown West');
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
 *   `DEFAULT_POSITION`. **Unused by the app** — see the note on `DEFAULT_POSITION`: the
 *   client cannot tell that an IP lookup failed, so nothing can decide to pass this.
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
    source: 'default-position',
    label: DEFAULT_POSITION.label,
    params: { aroundLatLng: `${DEFAULT_POSITION.lat},${DEFAULT_POSITION.lng}`, aroundRadius: 'all' },
  };
}

/**
 * `PRECISION_METRES` is the one setting that decides whether proximity ranks at all, so
 * it fails at boot rather than degrading silently. Above ~10,000 km the ranking was
 * measured identical to sending no geo; a value that large means the demo has quietly
 * stopped being location-aware.
 */
/**
 * No two selector entries may fall inside the same distance bucket. Two positions closer
 * than `PRECISION_METRES` are declared tied by `geo`, so they return the same order and
 * the menu offers the user a choice that changes nothing. The closest surviving pair is
 * New York Midtown West / Harlem at 5.7 km.
 */
function assertSelectorSeparation() {
  const R = 6371000;
  const rad = (deg) => (deg * Math.PI) / 180;
  const metres = (a, b) => {
    const h =
      Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const all = DEMO_POSITIONS;
  if (!DEFAULT_POSITION) {
    throw new Error(
      'DEFAULT_POSITION did not resolve: no entry in DEMO_POSITIONS is labelled "New York — Midtown West". ' +
        'The app does not read it, but a caller passing { ipFallback: false } would get an undefined position rather ' +
        'than coordinates. Point it at another anchor rather than leaving it undefined.'
    );
  }
  for (let i = 0; i < all.length; i += 1) {
    for (let j = i + 1; j < all.length; j += 1) {
      const d = metres(all[i], all[j]);
      if (d <= PRECISION_METRES) {
        throw new Error(
          `Location selector entries "${all[i].label}" and "${all[j].label}" are ${Math.round(d)} m apart, inside the ` +
            `${PRECISION_METRES} m aroundPrecision bucket. Two positions in one bucket are tied by the geo criterion and ` +
            'return the same order, so the menu would offer a choice that changes nothing. Remove one or move it further out.'
        );
      }
    }
  }
}

assertSelectorSeparation();

if (!(PRECISION_METRES > 0) || PRECISION_METRES >= 10000000) {
  throw new Error(
    `PRECISION_METRES is ${PRECISION_METRES} m. Below 1 it is not a bucket; at or above 10,000,000 m the whole corpus ` +
      'falls into one bucket and the geo criterion decides nothing, which removes proximity from every journey. ' +
      'See test-queries.md and DECISIONS.md.'
  );
}
