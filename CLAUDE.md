# OpenTable — Search & Discovery Prototype

Working context for the restaurant search and discovery prototype built for OpenTable on
Algolia.

This file states the rules in force, in the present tense. **How they were reached, what
was measured, and what was tried and rejected are in [`DECISIONS.md`](DECISIONS.md).**
Case-level relevance results and the settings change log are in
[`test-queries.md`](test-queries.md). When a rule here turns out to be wrong, fix this
file and record the reversal in `DECISIONS.md`.

## 1. Engagement context

OpenTable runs a large restaurant reservation platform. Search and discovery is an
in-house build on Elasticsearch, around ten years old and hard to evolve.

Stated goals: higher search quality, a more modern experience, better support for
discovery and inspiration, increased platform usage, and **increased conversion from
search and browse sessions into bookings**.

Scope is two user journeys, each traceable to a pain surfaced in discovery. A feature that
cannot be tied to a stated pain is out of scope however cheap it is to add.

## 2. The two personas

**Persona 1 — known-item search.** Arrives knowing the restaurant name, wants to book
quickly. Reported pains: names are hard to spell or remember; typos, concatenated words,
partial names and alternate spellings return poor results; chains with several locations
in the same city are impossible to tell apart.

Requirements: name-first relevance, typo tolerance, visible disambiguation of locations.
Alternative spellings are served by typo tolerance and glyph folding;
`scripts/synonyms.json` does not exist and no test demands it.

**Persona 2 — open-ended discovery.** No specific restaurant in mind. Reported pains: few
ways to browse, refine or get inspired; it feels dated next to other consumer platforms.

Requirements: the empty-query state must be a destination. Curated entry points, a facet
taxonomy users can reason about, meaningful sort options, location awareness.

The personas are **intents**. One search box, one results page, search-as-you-type, no
suggestion dropdown.

## 3. The data

Two source files, joined on `objectID` — 5,000 records, 1:1 and complete:

- `resources/dataset/restaurants_list.json` — 5,000 records, JSON array
- `resources/dataset/restaurants_info.csv` — 5,000 rows, **semicolon-delimited**

All figures were measured on the extract. Do not re-derive them and do not assume anything
beyond them. `data/exploration.md` holds the full profiling record.

| Defect | Records | Rule |
|---|---|---|
| `phone` disagrees between the two files | 160 (3.2%) | CSV `phone_number` wins, normalised to E.164 |
| `price` int contradicts the `price_range` label | 220 (4.4%) | The label wins; `price_tier` derives from it, never from `price` |
| `neighborhood` equals `city` | 2,500 (50%) | `location_label` falls back to city; see the chain below |
| `area` has no `" / "` separator | 2,103 (42%) | Carried through as an opaque `market` facet. Never split into city + state. `market_state` only where the separator exists |
| `food_type` holds 114 overlapping values | all 5,000 | 37 primary cuisines + 102 tags, mapped by hand in `scripts/cuisine-taxonomy.json`. Never generated inline |

`dining_style` (4 values) and `price_range` (3 values) are usable as facets as delivered.

**Chains are encoded two ways.** 23 names are byte-identical duplicates; 1,086 records
carry a ` - <location>` suffix. Grouping on the folded base name gives **213 chains
covering 722 records, 44 of them with two or more locations in one city** — 51 clusters,
113 records. Same-city ambiguity is reproducible here and must be demonstrated on real
records; no synthetic case may be introduced. `foldName` is the single definition of chain
identity, shared by the transform and the profiling script. `chain_name` is never a blind
split on the separator — 406 of the 1,086 suffixes are not places.

**The location fallback chain has four rungs**, split across the transform and the front
end: `neighborhood` when it differs from `city` (trimmed, case-insensitive) → `city` →
**distance**, computed client-side in `src/lib/format.js` → `address`. The transform
computes the first two into `location_label` and flags the 18 records where they are
insufficient — the 9 same-city clusters whose siblings share a neighborhood. The card
renders neighbourhood, city and state directly plus distance on every row, and uses
`address` on a flagged record when no position is known.

**`occasions` is derived, not observed** — a heuristic over `dining_style` + `price_tier` +
`cuisine`, constrained to seven values: `date night, business lunch, family friendly,
special occasion, group dinner, solo friendly, late night`. This provenance must be stated
wherever the attribute is presented. Enrichment is cached on disk by `objectID`.

## 4. Record schema

Canonical attribute names, identical across the transform script, the index settings and
the front end.

```
objectID            string
name                string
chain_name          string | null   # set when the same folded base name has >1 location
is_chain            boolean
address             string          # retrieved, not searchable
neighborhood        string          # raw; equals city on 50% of records
city                string
state               string
postal_code         string
location_label      string          # rungs 1-2 of the fallback chain
location_label_ambiguous boolean     # true on 18 records; the front end must complete them
market              string          # raw `area` value, opaque facet
market_state        string | null   # only when `area` contains " / "; not searchable
_geoloc             { lat, lng }
cuisine             string          # normalised primary, single value
cuisine_tags        string[]        # secondary / related tags
dining_style        string
price_range         string          # canonical, from CSV; user-facing
price_tier          int (1-3)       # derived from price_range; facet + occasions input
stars_count         float
reviews_count       int
popularity_score    float           # Bayesian average, see below
occasions           string[]        # derived
image_url           string          # indexed, NOT retrieved — every value is dead
reserve_url         string
phone               string          # from CSV phone_number, E.164
```

Deliberately absent: `country` (constant), `mobile_reserve_url` (redundant),
`payment_options` (used in no journey), `price` (superseded by `price_range`).

**`popularity_score` is a Bayesian average** rather than raw `stars_count`:

```
score = (v / (v + m)) * R + (m / (v + m)) * C
  R = stars_count, v = reviews_count, m = 50, C = 4.2941 (global mean)
```

70 records have fewer than 10 reviews while the median is 336, so `desc(stars_count)`
alone would fill the first screen from that pool. Calibration check: inspect the top 20.
If unrecognisable restaurants surface, `m` is too low.

## 5. Index configuration

`scripts/settings.json` and `scripts/rules.json` live in the repo and are pushed by
`scripts/2-index.js`. Neither is edited in the dashboard: a dashboard-only change is a
change nobody can review in a diff. Rules are pushed with `clearExistingRules`, so the
file is the whole rule set.

```
searchableAttributes: [
  "unordered(name)",                  # persona 1: name outranks everything else
  "unordered(cuisine,cuisine_tags)",
  "unordered(neighborhood,city,market)"
]
ranking: ["typo","geo","words","filters","proximity","attribute","exact","custom"]
customRanking: ["desc(popularity_score)", "desc(reviews_count)"]
indexLanguages / queryLanguages: ["en"]
attributesForFaceting: [
  "searchable(cuisine)", "cuisine_tags", "dining_style",
  "price_range", "price_tier", "occasions",
  "searchable(city)", "searchable(market)", "searchable(neighborhood)",
  "filterOnly(is_chain)"
]
typoTolerance: minWordSizefor1Typo 4, minWordSizefor2Typos 8,
               allowTyposOnNumericTokens false
exactOnSingleWordQuery: "attribute"
queryType: "prefixLast"
ignorePlurals: false
removeStopWords: false
removeWordsIfNoResults: "lastWords"    # the one open relevance question
replicas (virtual): rating_desc          # relevancyStrictness 50, see below
```

Every setting is declared explicitly, including those matching Algolia's default: an
implicit default is invisible in a diff, and each is a measured choice.

**Attribute order is the main lever for persona 1** — a name match must beat a cuisine or
neighborhood match — and `unordered()` on `name` because word position inside a restaurant
name carries no meaning. `chain_name` and `address` are retrieved for display and never
searched.

**`geo` sits second, above `words`, `attribute` and `exact`, and that is a decision about
the use case.** Proximity is the dominant intent signal for a diner choosing somewhere to
eat, and someone wanting a restaurant in another city names that city — ten city-qualified
queries each return exactly one hit at rank 1. The cost is recorded on `test-queries.md`
A1, A2 and A6, which are `accepted` rather than passing. **Do not reorder `ranking`
without reading those three cases and the five previous orders in `DECISIONS.md`.**

**One sort replica, and its `relevancyStrictness: 50` is what makes it local.** `geo` is
second in `ranking` and is sent on every request, so the relevance band a virtual replica
preserves is the band of records near the user; `popularity_score` orders them inside it.
That is the sort a diner wants — best rated *around me*. At `0` the replica sorts on
`customRanking` alone and the geo dimension disappears: from Denver the empty query leads
with Scottsdale and Santa Fe, 4 of 24 records in Denver against 24 of 24 at `50`. Do not
set it to `0`.

**The three place facets are `searchable()`** because `App.jsx` renders a search box on
each, and 916 cities and 1,062 neighborhoods cannot be reached by scrolling a `limit` of 6.

**Typo thresholds are a measured compromise**: 59 pairs of distinct names sit at edit
distance 1, and 36 names fall under the 4-character floor and get no tolerance. Do not
move them without a `test-queries.md` case naming the pair the change fixes and the pair
it puts at risk.

### Query rules

Three rules turn a category-shaped query into a filtered browse: a query equal to a value
of `cuisine`, `dining_style` or `occasions` has its words removed and the value applied as
a facet filter, so ordering falls to `geo` then `popularity_score`. One rule per attribute
via the `{facet:<attribute>}` placeholder covers 48 values. `dining_style` and `occasions`
are absent from `searchableAttributes`, so those queries need a rule to work at all;
`cuisine_tags` deliberately has none. `anchoring: is` means no rule fires unless the whole
query equals a facet value, so name queries are untouched — and so is
`italian restaurant`, the query-categorisation gap in section 9.

### Geo

**Geo is always sent, on every request**, with `aroundRadius: "all"` and
`aroundPrecision: 5 km` — one parameter set, `searchParams` in `src/searchParams.js`. The
radius stays unbounded because a bounded one returns nothing for most positions in a sparse
national sample. The 5 km bucket is coarse enough that `popularity_score` breaks ties
inside it. Distance display is independent of ranking, computed client-side from `_geoloc`.

**Never leave the user geo-blocked.** The automatic chain has two rungs: browser position,
then `aroundLatLngViaIP`. The UI states which one is in use. The IP rung covers a denial, a
browser with no geolocation API, **and the period while the permission dialog is open** —
the dialog has no timeout the app controls, so waiting would send the first request with no
geo.

There is no automatic third rung, and there cannot be one client-side. `aroundLatLngViaIP`
is resolved server-side and the resolved position is never returned to the client, so the
front end cannot detect that the IP lookup failed and fall through to a default.
`geoParams` can return `DEFAULT_POSITION` when called with `{ ipFallback: false }`, and the
app never calls it that way. The third path is the location selector, which is an explicit
user choice rather than a fallback.

**Under the IP rung the card shows no distance.** `userPosition` is `null` on the client,
so `formatPlace` in `src/lib/format.js` omits the distance and falls back to `address` on
the records flagged `location_label_ambiguous`. Distance appears only when the browser
grants geolocation or the user picks an anchor.

**The location selector is 15 neighbourhood anchors across 9 cities**, grouped by city,
alongside "use my location". Anchors rather than markets, because a market centroid and one
of its own neighbourhoods land in the same bucket and return the same page. Each anchor is
a real neighbourhood backed by at least 10 records and clears the 5 km bucket against every
other — `assertSelectorSeparation` fails at boot otherwise. Record counts are deliberately
not shown: a number beside a place in a search interface reads as a result count.

## 6. Stack and repo layout

**Vite + React InstantSearch, and nothing else.** Flat `components/`, one component per
custom widget; with a single surface and a single library there is no second axis to split
on.

```
CLAUDE.md                    # rules in force
DECISIONS.md                 # how they were reached; measurements; what was rejected
README.md                    # approach, decisions, trade-offs, next steps
test-queries.md              # relevance cases + settings change log
.env                         # not committed
.env.example                 # committed: the four variable names, no values
index.html  vite.config.js  package.json
resources/
  current-experience.png     # the experience being replaced — a reference, never a target
  dataset/                   # the two source files; never written to
scripts/
  1-transform.js             # join + normalise + enrich -> data/records.json
  2-index.js                 # push records, settings and rules
  cuisine-taxonomy.json      # hand-reviewed food_type -> cuisine mapping
  settings.json              # versioned index configuration
  rules.json                 # versioned query rules
data/
  records.json               # generated, gitignored
  enrichment-cache.json      # generated, gitignored
  transform-report.md        # generated: counts, conflicts resolved, mapping applied
  exploration.md             # committed: full profiling record behind section 3
src/
  main.jsx  App.jsx          # Vite entry, then the <InstantSearch> tree
  searchClient.js            # single Algolia client, search-only key
  searchParams.js            # the parameter set, the geo chain, the selector anchors
  insights.js                # queryID propagation, click + conversion events
  components/                # custom widgets (Hit, Facets, SortBy, …)
  lib/                       # shared formatters (place, distance, price)
public/img/                   # thirteen Unsplash category images, committed
```

Two-step pipeline, each step independently re-runnable. `1-transform.js` is deterministic
and never talks to Algolia; `2-index.js` never transforms data. Generated artefacts go to
`data/` only.

**Never declare `facets` in `<Configure>`.** It is a competing declaration that makes
Algolia silently drop every facet filter. Each widget declares the facet it needs.

**`image_url` is indexed but not retrieved** — every value in the extract is dead, so the
card renders initials on a hue derived from the objectID. The curated entry points carry
thirteen Unsplash photographs from `public/img/`, named by convention from the facet value
(`date night` → `/img/occasion-date-night.jpg`). They illustrate a category, never a
record.

`transform-report.md` must report at minimum: record counts in and out, phone and price
conflicts resolved, `area` values without a separator, records where
`neighborhood == city`, and the full cuisine mapping applied.

### Environment variables

Vite compiles only `VITE_`-prefixed variables into the bundle. That is the mechanical
guarantee the write key cannot leak client-side.

```
VITE_ALGOLIA_APP_ID          # browser — public
VITE_ALGOLIA_SEARCH_API_KEY  # browser — search-only, public by design
VITE_ALGOLIA_INDEX_NAME      # browser
ALGOLIA_WRITE_API_KEY        # scripts only — NEVER prefixed with VITE_
```

Nothing in `src/` may read a non-prefixed variable, and that holds: it reads only the
three `VITE_` names plus `import.meta.env.DEV`. `2-index.js` reads those three as
fallbacks so one `.env` serves both halves of the repo — the direction that cannot leak.

## 7. Hard constraints

- **The write API key never reaches the front end.** Enforced by the `VITE_` prefix. Check
  the full git history before publishing, not just `HEAD`.
- `.env` and `.env.local` are gitignored, alongside `data/records.json` and
  `data/enrichment-cache.json`.
- Default branch is `main`. Keep it deployable and deploy from the first commit —
  environment variables, build config and asset paths fail in ways local development hides.
- Both scripts fail loudly rather than degrade: a join below 100%, an unknown price label,
  an unmapped cuisine, a settings attribute absent from the records, a missing
  `rules.json`, a dashboard-generated rule id, a rule filtering on a non-facet, or a
  `VITE_`-prefixed write key. `--dry-run` validates without a network call.
- **Node 24 is required.** `nvm use` before `npm run dev`; `.nvmrc` pins 24 locally and
  `engines.node` at `"24.x"` is the only repo-side override Vercel reads.

## 8. Working conventions

- Relevance is evaluated against `test-queries.md`, written before the index existed and
  covering the nine required query shapes plus geo. Cases are chosen by hand from real
  data. **Do not add a case to match current behaviour.** When one fails, either change
  the configuration or record why the behaviour is acceptable.
- Every settings or rules change gets one line in the `test-queries.md` change log: what
  changed, which query motivated it, what improved, what regressed. **Change one thing at
  a time** — five at once makes the result unattributable.
- Algolia Insights is instrumented from the start: `queryID` propagation, a
  `Restaurant Clicked` click and a `Table Booked` conversion, both carrying the `queryID`
  of the search that produced the hit. Conversion is the stated business goal, so the
  prototype can measure it. The Insights client uses the **search** key. The `userToken`
  is anonymous, in `localStorage`, `useCookie: false` — demo-grade, and in production that
  token is where consent handling belongs.

## 9. Roadmap beyond this prototype

Out of scope, and the data model and instrumentation are built so none requires rework:
personalization on the collected event stream; Recommend; A/B testing ranking strategies
against booking conversion; semantic and natural-language querying; **query
categorisation**, which is what would close `italian restaurant` and `sushi near me`; and
replacing derived `occasions` with observed behavioural signals.

## 10. Explicitly not in scope

Reproducing `resources/current-experience.png`. It documents the experience being
replaced, so it is a reference for what to beat.
