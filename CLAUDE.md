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

The third rung needs the user's position, so the transform computes the first two and
sets `location_label_ambiguous` on the 18 records where they are insufficient — the 9
same-city clusters whose siblings share a neighborhood. The front end must append
distance whenever that flag is true, or those rows render identically.

**`food_type` — 114 distinct values, overlapping and competing.** `Steak` (123)
against `Steakhouse` (328); `American` (865) against `Contemporary American`
(649) against `Californian` (96). A user refining by cuisine has to guess which
bucket a restaurant landed in.
→ Normalised taxonomy: one primary `cuisine` plus secondary `cuisine_tags`. The
mapping lives in `scripts/cuisine-taxonomy.json`, reviewed by hand — never
generated inline in the transform script.

### Chains — two encodings, and same-city ambiguity is real

Chains appear in the data two different ways, and only one of them is visible to
an exact-string comparison.

**Exact duplicates — 23 names.** 23 names occur at more than one location with
byte-identical `name` values, always exactly 2 locations, always in different
cities (`Town`, `Sienna`, `Pappas Bros. Steakhouse`, `Cocotte`, `Grange`, …).
One of the 23 shares a market: `Rafain Brazilian Steakhouse` (68527 Dallas /
144949 Fort Worth), both in `Dallas - Fort Worth`, so filtering on `market` does
not separate them — only `city` or distance does. Two more differ only by case:
`Range` (4221) / `range` (141001) and `Eleven` (150715) / `ELEVEN` (3204).

**Suffixed locations — the real chain encoding.** 1,086 records carry a
` - <location>` suffix in `name`. Grouping on the base name (suffix stripped, glyph
variants folded — see below):
**213 distinct base names have more than one location, covering 722 records, and
44 of them have two or more locations in the same city** — 51 distinct
(base name, city) clusters, 113 records. Largest: Cyclone Anaya's ×5 in Houston
(145369, 145366, 151276, 145381, 145375), Churrascos ×4 in Houston (883, 150679,
114319, 882), then ×3 clusters for Perry's Steakhouse (Houston), Atria's
(Pittsburgh), Sushi Zushi (San Antonio), The Wine Bistro (Columbus), Stone Werks
(San Antonio), BRAVO Cucina Italiana (Columbus).

**Same-city ambiguity is therefore reproducible on this extract and must be
demonstrated on real records.** No synthetic case is needed, and none may be
introduced.

Two consequences for the transform:

- **Glyph folding is load-bearing, not cosmetic.** Grouping on the raw lowercased
  base name finds only 212 chains. Folding diacritics and unifying the apostrophe and
  dash glyphs finds a 213th: `Big Daddy's` — 30991 `Big Daddy's - Gramercy Park`
  (straight apostrophe, hyphen) and 42784 `Big Daddy's – Upper West Side` (curly
  apostrophe, en dash), **both in New York**. A chain and a same-city cluster are
  invisible without the fold, which is why `foldName` in the transform is the single
  definition of chain identity and the profiling script uses the same one.
- **`chain_name` cannot be a blind split on the separator.** 406 of the 1,086
  suffixes match no city or neighborhood in the corpus: `Tien - Teppanyaki /
  Shabu Shabu` (11437) is a cuisine descriptor, `The Westgate Hotel - The
  Westgate Room` (72961) is a room, `Sixth & Pine - Nordstrom Green Hills
  Nashville` (67003) is a department store, and `Bocca Di Bacco (Theatre
  District - 45th St.)` (4478) carries the separator inside parentheses. The
  separator glyph is also inconsistent *within* a single brand on 5 chains —
  `Café 21` uses a hyphen on 64003 and an en dash on 64000; same for `BD's Mongolian
  Grill`, `Merriman's`, `Zodiac at Neiman Marcus` and `Big Daddy's`.
- **Neighborhood alone does not disambiguate.** On 9 of the 51 same-city
  clusters, two locations share the same `neighborhood`: Fleming's Steakhouse
  Scottsdale (40036 / 39919, both `Scottsdale`), The Herb Box Scottsdale (99511 /
  99508), McCormick & Schmick's Pittsburgh (6794 / 13990, both `Downtown`),
  Churrascos Houston (883 / 114319, both `West Side`), Cyclone Anaya's Houston
  (145366 / 151276, both `Midtown / Montrose`), plus Tien Biloxi, Jia Biloxi, JW
  Marriott San Antonio and The Westgate Hotel San Diego. Distance is what
  resolves these nine, which makes the last link of the `location_label`
  fallback chain load-bearing rather than decorative.

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
location_label_ambiguous boolean     # true when a same-city chain sibling shares the
                                     # identical label, so distance must complete it
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
replicas (virtual): rating_desc, price_asc, price_desc
ranking: geo demoted below exact — see below
```

Attribute order in `searchableAttributes` is the main lever for persona 1: a
query matching a restaurant name must beat a query matching a cuisine or a
neighborhood, always. `unordered()` on `name` because word position inside a
restaurant name carries no meaning.

**Correction — there is no `distance` replica.** A replica's order comes from stored
attributes, and distance depends on the user's position at query time, so there is
nothing to store and nothing to pre-sort. Distance ordering is produced by sending
`aroundLatLng` to the primary index, where the `geo` ranking criterion applies. The
sort control therefore offers the primary index as its geo-aware default plus the
three replicas above.

**Correction — `ranking` must be declared, not defaulted.** Algolia's default order
puts `geo` second, ahead of `words`, `attribute` and `exact`, so any query carrying
`aroundLatLng` ranks proximity above text relevance — the exact failure the geo
strategy below is written to prevent. `scripts/settings.json` demotes `geo` below
`exact`. The discovery journey still gets geo-led ordering because it sends
`aroundLatLng` with coarse `aroundPrecision` buckets, which collapses distance into
wide tiers that `customRanking` then orders by `popularity_score`; the known-item
journey sends no geo parameter at all and computes distance client-side from
`_geoloc` for display. Leaving `ranking` implicit would have hidden this in a default
nobody reviews.

### Typo tolerance cuts both ways — measured

**59 pairs of distinct restaurant names sit at edit distance 1 of each other.**
At `minWordSizefor1Typo: 4` these become mutually reachable, so typo tolerance
can turn an exact known-item query into the wrong restaurant. The sharpest case
is `Kaya` (79378) against `Naya` (148411) — **both in Pittsburgh**, so no geo
signal separates them either. Others: `Uva` (60163) / `Yuva` (6666) / `Yuba`
(141115), all three in New York; `Range` (4221) / `Grange` (26626, 111739);
`Soto` (36775) / `Soco` (63832, 150973) / `Moto` (118249) / `SATO` (151987);
`Silo` (88030) / `LILO` (95068) / `kilo` (108610) / `Lido` (63250); and a long
tail of singular/plural or final-vowel pairs — `Cata`/`Catas`, `Maya`/`Mayas`,
`Azur`/`Azure`, `Vita`/`Vitae`, `Savor`/`Savore`, `Luca`/`LUCCA`,
`Prime`/`Primo`, `Beast`/`Feast`, `Venue`/`Avenue`.

The inverse risk is the short-name tail: `Q` (106741), `B4` (116248), `AOC`
(49894), `TE'` (7855), `Coi` (11065), `Oba` (3512), `Uva` (60163) fall under the
4-character floor and get **no** tolerance at all. The floor protects them from
the collisions above at the cost of returning nothing on a misspelling.

Do not raise or lower these thresholds without a `test-queries.md` case naming
the specific pair the change is meant to fix, and the pair it puts at risk.

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

Front end: **Vite + React InstantSearch, with Autocomplete.js for the search
box.** This is Algolia's documented reference integration for a header search
box with instant suggestions sitting above a results experience — the two
personas map onto it directly, and it is worth more than a bespoke structure
because it is the pattern a reviewer already knows.

The starter shipped with the dataset is pinned to Node 9 and
`parcel-bundler@1.9.7`, both unmaintained and carrying critical transitive
advisories, and it exposes only the low-level search client — rebuilding
autocomplete, refinement, geo and sorting widgets by hand would cost days that
belong to the experience itself. From the original bundle we keep the dataset,
`resources/current-experience.png` as a reference for the experience being
replaced, and selected styling cues.

### One application, two search contexts

This is a single app with a single search box, not two experiences the user has
to choose between. The same box serves both personas, which is the point of the
demo:

- **The header box and its dropdown** — Autocomplete.js. Persona 1: known-item.
  Text relevance leads, few hits, distance shown for disambiguation.
- **The page below** — InstantSearch. Persona 2: discovery. Curated entry points
  on an empty query, then results with facets, sorts and geo-aware ranking.

Selecting a suggestion in the dropdown goes straight to the restaurant;
submitting the query lands in the results grid.

The two contexts **must not share search parameters** — geo weighting,
`aroundRadius`, `hitsPerPage` and returned attributes differ per section 5.
Using two libraries makes that separation structural rather than a convention
to police. Declare both parameter sets side by side in `src/searchParams.js`,
with the reasoning inline, so they can be compared at a glance.

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
  synonyms.json              # abbreviation + alternative-spelling synonyms
data/
  records.json               # generated, gitignored
  enrichment-cache.json      # generated, gitignored
  transform-report.md        # generated: counts, conflicts resolved, mapping applied
  exploration.md             # committed: full profiling record behind sections 3 and 5
src/
  main.jsx                   # Vite/React entry
  App.jsx                    # the <InstantSearch> tree
  searchClient.js            # single Algolia client, search-only key
  searchParams.js            # both parameter sets, declared side by side
  insights.js                # queryID propagation, click + conversion events
  autocomplete/              # Autocomplete.js instance and its sources
  components/                # custom InstantSearch widgets (Hit, Facets, SortBy, …)
  lib/                       # shared formatters (location_label, distance, price)
public/                      # static assets served as-is
```

Flat `components/` is the InstantSearch convention — one component per custom
widget. Resist inventing a deeper taxonomy: the only separation that carries
meaning here is autocomplete versus InstantSearch, and the libraries already
provide it.

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
- **Node 24 is required.** The toolchain (Vite, `@vitejs/plugin-react`, oxlint)
  demands `^20.19 || >=22.12`, and the Node 20 line went end-of-life on
  2026-04-30. Run `nvm use` before `npm run dev` or `npm run build` — `.nvmrc`
  pins 24 for local shells. Alignment with CI comes from `engines.node`, set to
  `"24.x"`: Vercel takes its Node version from Project Settings and
  `engines.node` in `package.json` is the only repo-side override — it does not
  read `.nvmrc` (Netlify does).

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
