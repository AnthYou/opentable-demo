# OpenTable — search & discovery prototype

A search and discovery experience for OpenTable's extract of 5,000 restaurants, built on
Algolia with Vite and React InstantSearch. It covers two journeys: finding a restaurant by
name, and browsing without one in mind. Relevance is evaluated against 52 cases in
[`test-queries.md`](test-queries.md).

---

## Live

**<https://opentable-demo-anthyous-projects.vercel.app>**

Vercel builds from `main`. App `ZES37PMPAX`, index `restaurants`. Support Access is enabled
on the Algolia dashboard, so the team can open the index configuration and analytics
directly.

---

## The two journeys

One search box and one results page serve both personas.

**Known-item.** The user knows the name. Reported pains: names are hard to spell, typos and
partial names return poor results, and chains with several locations in one city are hard to
tell apart. Hence name-first relevance, typo tolerance, and location labels that fall
through to distance when the neighbourhood repeats.

**Discovery.** No restaurant in mind. The empty query renders curated occasion and cuisine
entry points, a cuisine facet of 37 values, place facets with search boxes, three sort
replicas and proximity ordering. An autocomplete dropdown was built and removed — it showed
the same records as the page, one keystroke earlier.

---

## What the data contained

The join on `objectID` is 1:1 across the two source files — 5,000 matches, no orphans. The
fields disagree. Full record in [`data/exploration.md`](data/exploration.md).

| Defect | Records | Resolution |
|---|---|---|
| `phone` disagrees between the two files | 160 (3.2%) | CSV wins, normalised to E.164. The JSON field carries a stray `x` suffix |
| `price` int contradicts the `price_range` label | 220 (4.4%) | The label wins; `price_tier` derives from it |
| `neighborhood` equals `city` | 2,500 (50%) | `location_label` falls back to city, then to distance |
| `area` has no ` / ` separator | 2,103 (42%) | Kept as an opaque `market` facet, never split into city + state |
| `food_type` holds 114 overlapping values | all 5,000 | Mapped by hand to 37 cuisines and 102 tags |

Same-city chains are reproducible here. 1,086 records carry a ` - <location>` suffix, and
grouping on the folded base name gives **213 chains, 44 with two or more locations in one
city** — 51 clusters, 113 records. Folding diacritics, apostrophes and dashes finds the
213th: `Big Daddy's`, two New York locations differing only by a curly apostrophe and an en
dash. On 9 clusters the siblings share a neighbourhood too, so 18 records carry
`location_label_ambiguous` and the front end appends distance.

59 pairs of distinct names sit one edit apart, including `Kaya` and `Naya`, both in
Pittsburgh. At `minWordSizefor1Typo: 4` each ranks 1 on its own query.

---

## Configuration decisions

**`searchableAttributes` is name-first:** `unordered(name)`, then cuisine, then the place
fields. `chain_name` and `address` were removed. All 722 chained records have a name
beginning with their `chain_name`, so it reached nothing new while handing every chain member
a whole-attribute exact match that cancelled the real name match. `address` added noise:
`kaya` returned 27 Waikiki restaurants on Kalakaua Avenue among 67 hits, 40 without it.

**Geo is always sent, and `aroundPrecision` is the dial.** A category query gets a 5 km
bucket, so proximity orders the results and `popularity_score` breaks ties inside each
bucket. A name-like query gets 20,000 km, where the ranking is byte-identical to sending no
geo, so `Ocean Prime - Denver` (2 km) cannot displace `Prime` (1,062 km).

**`popularity_score` is a Bayesian average over `stars_count`, `m = 50`.** 21 records hold a
5.0 and 18 of those have under 50 reviews; the prior puts `Ellen's Cafe` (5.0, one review) at
rank 2414 of 5000.

**One cuisine facet with a second level.** `American`, `Contemporary American` and
`Californian` merged into `American` — 1,763 records, 35% of the corpus — which
`cuisine_tags` splits into Traditional (865), Contemporary (745) and a remainder under
narrower tags. The merge only works because the UI exposes that second level.

`ignorePlurals` and `removeStopWords` stay off; the measurements are in
[`test-queries.md`](test-queries.md), which also carries a line per settings change.

There are no restaurant photographs: every `image_url` in the extract redirects to the same
207×207 grey PNG, verified by hashing five of them, so cards show initials on a hue derived
from the objectID. The curated entry points use thirteen local
[Unsplash](https://unsplash.com/license) images named from the facet value (`date night` →
`/img/occasion-date-night.jpg`), each illustrating a category rather than a record.

<details>
<summary>Photo credits — Unsplash photo IDs</summary>

| entry point | photo ID | entry point | photo ID |
|---|---|---|---|
| date night | `photo-1414235077428-338989a2e8c0` | Steakhouse | `photo-1600891964092-4316c288032e` |
| business lunch | `photo-1517248135467-4c7edcad34c4` | Italian | `photo-1565299624946-b28f40a0ae38` |
| family friendly | `photo-1567620905732-2d1ec7ab7445` | Japanese | `photo-1579584425555-c3ce17fd4351` |
| special occasion | `photo-1467003909585-2f8a72700288` | Seafood | `photo-1476224203421-9ac39bcb3327` |
| group dinner | `photo-1528605248644-14dd04022da1` | Mexican | `photo-1551504734-5ee1c4a1479b` |
| French | `photo-1543826173-70651703c5a4` | Thai | `photo-1504674900247-0877df9cc836` |
| Indian | `photo-1585937421612-70a008356fbe` | | |

Each resolves at `https://images.unsplash.com/<id>`.

</details>

---

## Running it

Node 24 is required — the toolchain needs `^20.19 || >=22.12`.

```bash
nvm use                       # reads .nvmrc
npm install
cp .env.example .env          # then fill in the four values
node scripts/1-transform.js   # 5,000 records -> data/records.json
node scripts/2-index.js       # push records, settings and replicas
npm run dev
```

Vite compiles only `VITE_`-prefixed variables into the browser bundle, which keeps the write
key out of it.

```
VITE_ALGOLIA_APP_ID           # browser — public
VITE_ALGOLIA_SEARCH_API_KEY   # browser — search-only, public by design
VITE_ALGOLIA_INDEX_NAME       # browser
ALGOLIA_WRITE_API_KEY         # scripts only — NEVER prefixed with VITE_
```

The client key is search-only, verified: `PUT /settings`, an object `POST` and an index
`DELETE` all return 403. The write key is absent from the Vercel project and from the served
bundle. `node scripts/2-index.js --dry-run` validates without touching the network.

---

## Repo map

| Path | What it is |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Working context: personas, data profile, schema, index configuration, constraints |
| [`test-queries.md`](test-queries.md) | 52 relevance cases, their verdicts, and the settings change log |
| [`data/exploration.md`](data/exploration.md) | Full profiling record with every objectID |
| [`data/transform-report.md`](data/transform-report.md) | Counts, conflicts resolved, cuisine mapping applied |
| `scripts/1-transform.js` | Join, normalise, enrich. Deterministic, never talks to Algolia |
| `scripts/2-index.js` | Push records, settings and replicas. Never transforms data |
| `scripts/settings.json` | Versioned index configuration, one justification per setting |
| `scripts/cuisine-taxonomy.json` | Hand-reviewed `food_type` mapping, 52 review notes |
| `src/searchParams.js` | The two parameter sets and the geo rule, with a boot-time assertion |
| `src/insights.js` | queryID propagation, click and conversion events |

Index configuration lives in the repo and is pushed by script, never edited in the
dashboard.

**Stack:** Vite + React InstantSearch. Six runtime dependencies, 143 KB gzipped. The index
is `restaurants` plus three virtual replicas for the sort control.
