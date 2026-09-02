# OpenTable — Search & Discovery Prototype

Working context for the restaurant search and discovery prototype built for
OpenTable on Algolia.

## 1. Engagement context

OpenTable runs a large restaurant reservation platform. Their current search and
discovery experience is an in-house build on top of Elasticsearch, originally
developed around ten years ago. It is now considered hard to evolve and no
longer aligned with the experience they want to offer.

Stated goals, from discovery with the account team:

- higher search quality
- a more modern user experience
- better support for discovery and inspiration, not just retrieval
- increased platform usage
- **increased conversion from search and browse sessions into bookings**

This prototype exists to show, on their own data, what that experience could
look like. Scope is deliberately narrow: two user journeys, done well, each
traceable to a pain surfaced in discovery. Features that cannot be tied to a
stated pain are out of scope, however cheap they are to add.

## 2. The two personas — these drive the whole build

**Persona 1 — known-item search.** Arrives knowing the restaurant name, wants to
book quickly.

Pains reported today: restaurant names are hard to spell or remember; typos,
concatenated words, partial names and alternate spellings return poor results;
chains with several locations in the same city are impossible to tell apart in
the result list.

→ Requirements: forgiving *and* precise. Name-first relevance, typo tolerance,
synonyms and alternative spellings, and visible disambiguation of locations.

**Persona 2 — open-ended discovery.** No specific restaurant in mind. Wants to
browse, compare and get inspired.

Pains reported today: the current experience does not support discovery; few
ways to browse, refine or get inspired; feels dated next to other consumer
discovery platforms.

→ Requirements: the empty-query state must be a destination, not a dead end.
Curated entry points, a facet taxonomy users can actually reason about,
meaningful sort options, location awareness.

These two journeys pull relevance in opposite directions in places. Where they
conflict, the resolution is recorded in section 5 rather than averaged away.

## 3. Data profiling results

Two source files:

- `resources/dataset/restaurants_list.json` — 5,000 records, JSON array
- `resources/dataset/restaurants_info.csv` — 5,000 rows, **semicolon-delimited**

Fields in the JSON file: `objectID, name, address, area, city, country,
image_url, mobile_reserve_url, payment_options[], phone, postal_code,
price (int 1-4), reserve_url, state, _geoloc{lat,lng}`

Fields in the CSV file: `objectID, food_type, stars_count, reviews_count,
neighborhood, phone_number, price_range, dining_style`

All figures below were measured on the extract. **Do not re-derive them, and do
not assume anything beyond them.**

### The join is clean — the data is not

- join on `objectID` is **1:1 and complete**: 5,000 matches, no orphans either side
- no missing `_geoloc`, no blank `food_type`, `stars_count` or `neighborhood`
- `country` is constant (`US`, 5,000/5,000)
- `image_url` follows a single pattern for all 5,000 records
- `stars_count`: min 1.00, mean 4.29, max 5.00 — no zeros
- `reviews_count`: min 1, median 336, max 12,669 — **70 records under 10 reviews**

### Measured defects — this is the actual transform work

**Phone — 160 records (3.2%) disagree between files.** The JSON `phone` field is
corrupted: a stray `x` suffix and, in some cases, a different number
(`7134181000x` vs `(713) 418-1104`; `317-421-8282x` vs `(317) 421-8280`).
The systematic suffix points to a broken export rather than a fresher value.
→ CSV `phone_number` is the source of truth. Normalise to E.164.

**Price — 220 records (4.4%) contradict each other across files.** Cross-tab of
`price` (int) against `price_range` (label) is not diagonal: `price=2` with
"$50 and over" (6 records), `price=3` with "$30 and under" (70), `price=4` with
"$30 and under" (2), and so on.
→ `price_range` wins: it is what the user sees and filters on. `price_tier` is
derived from the label, not from `price`. Count and report the conflicts.

**`area` — 2,103 records (42%) have no `" / "` separator.** The field is a market
label at inconsistent granularity: metro (`Houston`, `Columbus`), state
(`Idaho`, `Iowa`, `Indiana`), multi-city aggregate (`Dallas - Fort Worth`),
macro-region (`Coastal North Carolina`). 51 distinct values.
→ Do **not** attempt to split it into city + state. Treat it as an opaque
navigation facet named `market`. Derive `market_state` only where the separator
exists, and leave it null otherwise.

**`neighborhood` — equal to `city` on 2,500 records (50%).** Half the corpus has
no real neighborhood. This breaks any UI that relies on neighborhood to
disambiguate locations.
→ Compute a single `location_label` at transform time with an explicit fallback
chain: neighborhood (when distinct from city) → city → city + distance.

**`food_type` — 114 distinct values, overlapping and competing.** `Steak` (123)
against `Steakhouse` (328); `American` (865) against `Contemporary American`
(649) against `Californian` (96). A user refining by cuisine has to guess which
bucket a restaurant landed in.
→ Normalised taxonomy: one primary `cuisine` plus secondary `cuisine_tags`. The
mapping lives in `scripts/cuisine-taxonomy.json`, reviewed by hand — never
generated inline in the transform script.

### Known limitation — chains

23 names occur at more than one location, but **zero have two locations in the
same city**. The same-city ambiguity reported in discovery is therefore **not
reproducible on this extract**.

What is demonstrable: cross-city disambiguation across those 23 names
(`Town`, `Sienna`, `Pappas Bros. Steakhouse`, `Cocotte`, `Grange`, …). Model
`chain_name` / `is_chain` and surface `location_label` on every row so the
mechanism is in place, but do not present same-city disambiguation as something
this dataset shows. If a same-city case is needed for demonstration, it must be
introduced explicitly and labelled as such.

Low-cardinality fields, usable as facets as delivered:

- `dining_style` — Casual Dining (2,203), Casual Elegant (2,130), Fine Dining
  (641), Home Style (26)
- `price_range` — $30 and under (3,125), $31 to $50 (1,567), $50 and over (308)

## 4. Record schema

Canonical attribute names. Keep them identical across the transform script, the
index settings and the front end.

```
objectID            string
name                string
chain_name          string | null   # set when the same name has >1 location
is_chain            boolean
address             string
neighborhood        string          # raw; equals city on 50% of records
city                string
state               string
postal_code         string
location_label      string          # computed display value, see fallback chain
market              string          # raw `area` value, opaque facet
market_state        string | null   # only when `area` contains " / "
_geoloc             { lat, lng }
cuisine             string          # normalised primary, single value
cuisine_tags        string[]        # secondary / related tags
dining_style        string
price_range         string          # canonical, from CSV; user-facing
price_tier          int (1-3)       # derived from price_range, for sorting
stars_count         float
reviews_count       int
popularity_score    float           # see below
occasions           string[]        # derived, see below
image_url           string
reserve_url         string
phone               string          # from CSV phone_number, E.164
```

Deliberately **not** indexed, with reasons: `country` (constant, useless as a
facet), `mobile_reserve_url` (redundant with `reserve_url`),
`payment_options` (used in no journey), `price` (the JSON int — superseded by
`price_range`, see the conflict above). Knowing what to leave out matters as
much as what to include.

### popularity_score

Bayesian average rather than raw `stars_count`:

```
score = (v / (v + m)) * R + (m / (v + m)) * C
  R = stars_count, v = reviews_count
  m = 50 (prior weight), C = global mean of stars_count (4.29)
```

Justification is in the measured distribution: 70 records have fewer than 10
reviews while the median is 336. Ranking on `desc(stars_count)` alone would put
a 5.0 backed by 3 reviews above an institution with 12,669. On a booking
platform that reads as broken relevance on the first screen, which is where
conversion is won or lost.

Calibration check: inspect the top 20 by `popularity_score`. If unrecognisable
restaurants surface, `m` is too low.

### occasions

**Derived, not observed.** A heuristic enrichment from `dining_style` +
`price_tier` + `cuisine` — not customer data. It exists because users think in
occasions ("date night", "business lunch") long before they think in cuisines,
and it is what makes persona 2's curated entry points possible. In production it
would be replaced by observed behaviour: event streams, content, reviews.

This provenance must be stated up front wherever the attribute is presented.

Constrain output to a controlled vocabulary: `date night, business lunch,
family friendly, special occasion, group dinner, solo friendly, late night`.
Free-form generation produces an unusable long-tail facet.

Process: run on 100 records, inspect the distribution, then run the full 5,000.
Cache results on disk keyed by `objectID` — never re-enrich on every transform
run.

## 5. Index configuration

`settings.json` lives in the repo and is pushed by the index script. Settings are
not edited in the dashboard: the index configuration is part of the codebase, it
gets reviewed in diffs, and a dashboard-only change is a change nobody can trace.

```
searchableAttributes: [
  "unordered(name)",          # persona 1: name outranks everything else
  "chain_name",
  "unordered(cuisine,cuisine_tags)",
  "unordered(neighborhood,city,market)",
  "address"
]
attributesForFaceting: [
  "searchable(cuisine)", "cuisine_tags", "dining_style",
  "price_range", "price_tier", "occasions", "city", "market", "neighborhood",
  "filterOnly(is_chain)"
]
customRanking: ["desc(popularity_score)", "desc(reviews_count)"]
typoTolerance: minWordSizefor1Typo 4, minWordSizefor2Typos 8,
               allowTyposOnNumericTokens false
queryType: "prefixLast"
removeWordsIfNoResults: "lastWords"   # evaluate "allOptional" on discovery
replicas (virtual): rating_desc, price_asc, price_desc, distance
```

Attribute order in `searchableAttributes` is the main lever for persona 1: a
query matching a restaurant name must beat a query matching a cuisine or a
neighborhood, always. `unordered()` on `name` because word position inside a
restaurant name carries no meaning.

### Geo strategy — the known-item / proximity conflict

Distance must not dominate ranking on the known-item journey. A user searching
"Nobu" from Denver wants Nobu, not the nearest bistro. Ranking geo first is the
single easiest way to make search feel worse than the experience it replaces.

Resolution, per journey:

- **Known-item / autocomplete** — text relevance leads. Geo is used for
  *display* (distance in `location_label`, which is what separates chain
  locations) and as a tie-breaker only.
- **Discovery / browse** — geo leads. `aroundLatLng` from the browser,
  `aroundLatLngViaIP` as fallback, `aroundRadius: "all"`, and `aroundPrecision`
  buckets coarse enough that `popularity_score` breaks ties inside a bucket.
  Without precision buckets, a marginally closer mediocre restaurant outranks an
  excellent one two streets further.

Never leave the user geo-blocked. If geolocation is denied: fall back to IP, then
to a default metro area, and tell the user in the UI which location is in use so
the results are never unexplained.

## 6. Stack and repo layout

Front end: **Vite + React InstantSearch**. The starter shipped with the dataset
is pinned to Node 9 and `parcel-bundler@1.9.7`, both unmaintained and carrying
critical transitive advisories, and it exposes only the low-level search client —
rebuilding autocomplete, refinement, geo and sorting widgets by hand would cost
days that belong to the experience itself. From the original bundle we keep the
dataset, `resources/current-experience.png` as a reference for the experience
being replaced, and selected styling cues.

```
CLAUDE.md
README.md                    # approach, decisions, trade-offs, next steps
test-queries.md              # relevance test cases + before/after results
.env                         # not committed — see the key convention below
index.html                   # Vite entry point
vite.config.js
package.json
resources/
  current-experience.png     # screenshot of the experience being replaced
  dataset/
    restaurants_list.json    # 5,000 records, source
    restaurants_info.csv     # 5,000 rows, semicolon-delimited, source
scripts/
  1-transform.js             # join + normalise + enrich -> data/records.json
  2-index.js                 # push records + push settings.json
  cuisine-taxonomy.json      # hand-reviewed food_type -> cuisine mapping
  settings.json              # versioned index configuration
data/
  records.json               # generated, gitignored
  enrichment-cache.json      # generated, gitignored
  transform-report.md        # generated: counts, conflicts resolved, mapping applied
src/
  main.jsx                   # Vite/React entry
  App.jsx
  searchClient.js            # single Algolia client, search-only key
  known-item/                # persona 1 surface: autocomplete
  discovery/                 # persona 2 surface: browse, facets, sorts, geo
  insights/                  # queryID propagation, click + conversion events
  lib/                       # formatters (location_label, distance, price)
public/                      # static assets served as-is
```

`resources/` is source material and is never written to. Generated artefacts go
to `data/` only; the transform reads from `resources/dataset/` and writes to
`data/`.

Two-step pipeline, each step independently re-runnable. `1-transform.js` is
deterministic and never talks to Algolia; `2-index.js` never transforms data.
Both are Node scripts run outside Vite, reading unprefixed variables from `.env`.

### Environment variable convention

Vite exposes only `VITE_`-prefixed variables to the browser bundle. This is the
mechanical guarantee that the write key cannot leak client-side:

```
VITE_ALGOLIA_APP_ID          # browser — public
VITE_ALGOLIA_SEARCH_API_KEY  # browser — search-only, public by design
VITE_ALGOLIA_INDEX_NAME      # browser
ALGOLIA_WRITE_API_KEY        # scripts only — NEVER prefixed with VITE_
```

Adding `VITE_` to the write key would ship it in the bundle. Nothing in `src/`
may read a non-prefixed variable, and nothing in `scripts/` needs a prefixed one.

`transform-report.md` must report, at minimum: record counts in/out, phone
conflicts resolved, price conflicts resolved, `area` values without a separator,
records where `neighborhood == city`, and the full cuisine mapping applied. These
are the numbers that justify every decision in section 3.

## 7. Hard constraints

- **The write API key never reaches the front end.** Search-only key in the
  client, write key in scripts only, enforced by the `VITE_` prefix convention
  above. Check the full git history before publishing, not just `HEAD`.
- `.env` and `.env.local` are gitignored from the first commit, alongside
  `data/records.json` and `data/enrichment-cache.json`.
- Default branch is `main`.
- The transform script fails loudly if the join match rate is below 100% — the
  current extract guarantees it, a production pipeline would not.
- Keep `main` deployable and deploy from the first commit rather than at the
  end — environment variables, build config and asset paths fail in ways local
  development hides.

## 8. Working conventions

- Relevance is evaluated against `test-queries.md`, written before the index
  existed: exact name, misspelled name, concatenated name, partial name,
  cuisine, ambiguous term, multi-location chain, empty query, out-of-corpus
  query. Test cases are chosen by hand from real data; do not add a case to
  match current behaviour. When a case fails, either change the configuration or
  record why the behaviour is acceptable.
- Every settings change gets one line in `test-queries.md`: what changed, which
  query motivated it, what improved, what regressed. Change one setting at a
  time — five at once makes the result unattributable.
- Instrument Algolia Insights from the start — `queryID` propagation, click
  events, and a `book a table` conversion event. Conversion is the stated
  business goal, so the prototype should be able to measure it, and the event
  stream is the prerequisite for everything in the next section.
- When a decision in this file turns out to be wrong, fix the file. A stale
  context file is worse than none.

## 9. Roadmap beyond this prototype

Out of scope here, but the data model and event instrumentation are built so
that none of these require rework:

- Personalization on the collected event stream
- Recommend — related restaurants, frequently booked together
- A/B testing of ranking strategies against booking conversion
- Semantic / natural-language querying for open-ended discovery intent
- Query categorization to route intent between the two journeys automatically
- Replacing derived `occasions` with observed behavioural signals

## 10. Explicitly not in scope

Reproducing `resources/current-experience.png`. It documents the experience being
replaced, and the objective is a better one — it is a reference for what to beat,
not a target.
