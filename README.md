# OpenTable — search & discovery prototype

A working search and discovery experience built on Algolia, on OpenTable's own extract of
5,000 restaurants. Scope is deliberately narrow: two user journeys, each traceable to a
pain surfaced in discovery, measured against relevance cases written before the index
existed.

The point is not that it searches. It is that every ranking decision in it can be
defended with a number, and the ones that are still wrong are written down.

---

## Running it

Node 24 is required — the toolchain needs `^20.19 || >=22.12` and the Node 20 line went
end-of-life on 2026-04-30.

```bash
nvm use                  # reads .nvmrc
npm install
cp .env.example .env     # then fill in the four values
node scripts/1-transform.js   # 5,000 records -> data/records.json
node scripts/2-index.js       # push records, settings and replicas
npm run dev
```

`.env` needs four values. The prefix is not cosmetic: Vite compiles only
`VITE_`-prefixed variables into the browser bundle, which is the mechanical guarantee the
write key cannot leak client-side.

```
VITE_ALGOLIA_APP_ID           # browser — public
VITE_ALGOLIA_SEARCH_API_KEY   # browser — search-only, public by design
VITE_ALGOLIA_INDEX_NAME       # browser
ALGOLIA_WRITE_API_KEY         # scripts only — NEVER prefixed with VITE_
```

Both scripts fail loudly rather than degrade: a join below 100%, an unknown price label,
an unmapped cuisine, a phone that does not yield ten digits, a settings attribute that
does not exist on the records, or a `VITE_`-prefixed write key all abort the run with the
reason. `node scripts/2-index.js --dry-run` validates everything and touches no network.

**Not yet deployed.** CLAUDE.md §7 asks for deployment from the first commit precisely
because environment variables and build config fail in ways local development hides, and
that has not been done. Treat it as an open item, not a finished one.

---

## The two journeys

The personas are **intents, not surfaces**. There is one search box and one results page.

**Known-item.** The user knows the restaurant name and wants to book. Reported pains:
names are hard to spell, typos and partial names return poor results, and chains with
several locations in the same city are impossible to tell apart. So: name-first
relevance, typo tolerance, and location labels that actually disambiguate.

**Discovery.** No specific restaurant in mind. Reported pains: few ways to browse or get
inspired, and an experience that feels dated. So: an empty state that is a destination,
a cuisine taxonomy a user can reason about, meaningful sorts, and proximity.

An autocomplete dropdown was built and then removed. It showed the same records the page
already showed, one keystroke earlier — noise rather than help — and nothing in the
brief asked for it.

---

## What the data actually contained

Everything below was measured on the extract, not assumed. The full record is in
[`data/exploration.md`](data/exploration.md) with every objectID.

The join is clean — 5,000/5,000 on `objectID`, no orphans. The data is not.

| Defect | Records | Resolution |
|---|---|---|
| `phone` disagrees between the two files | 160 (3.2%) | CSV wins, normalised to E.164. The JSON field carries a stray `x` suffix — a broken export, not a fresher value |
| `price` int contradicts `price_range` label | 220 (4.4%) | The label wins; `price_tier` derives from it. The int runs on a 2/3/4 scale, which is how the 220 was confirmed |
| `neighborhood` equals `city` | 2,500 (50%) | `location_label` falls back to city. Only a trimmed, case-insensitive comparison finds all 2,500 |
| `area` has no ` / ` separator | 2,103 (42%) | Kept as an opaque `market` facet. Never split into city + state |
| `food_type` is 114 overlapping values | all | Mapped by hand to 37 cuisines + 102 tags |

Three findings changed the plan rather than confirming it.

**Same-city chain ambiguity is real, and the brief said it was not.** Chains are encoded
two ways and only one is visible to string equality: 23 names are byte-identical
duplicates, but 1,086 records carry a ` - <location>` suffix. Group on the base name and
**213 chains** appear, 44 with two or more locations in the same city. Glyph folding is
load-bearing, not cosmetic — grouping on the raw lowercased name finds 212; folding
apostrophes and dashes finds `Big Daddy's`, whose two New York locations differ only by a
curly apostrophe and an en dash.

**Neighborhood alone cannot disambiguate 9 of those clusters.** Fleming's Steakhouse
40036 and 39919 both read "Scottsdale". 18 records are flagged
`location_label_ambiguous` so the front end knows distance is required, not decorative.

**Typo tolerance cuts both ways.** 59 pairs of distinct restaurant names sit one
character apart. The sharpest is `Kaya` against `Naya` — **both in Pittsburgh**, so no geo
signal separates them either. The inverse risk is the short-name tail: `Q`, `B4`, `AOC`,
`Coi` fall under the 4-character floor and get no tolerance at all.

---

## Decisions, and what measured them

Every settings change has a line in [`test-queries.md`](test-queries.md) naming the query
that motivated it, what improved and what regressed. Twelve rows so far, including four
changes evaluated and **rejected** on measurement.

**`geo` sits second in `ranking`, and `aroundPrecision` is the dial.** The brief warned
that a user searching "Nobu" from Denver would get the nearest bistro. Measured, that
cannot happen: geo reorders records that already match the text, and a bistro does not
match `nobu`. The real harm is narrower — on a short ambiguous name the nearer record
that *also* matches the word wins, so `Ocean Prime - Denver` (2 km) displaces `Prime`
(1,062 km). So coordinates are always sent, and only the bucket size varies: 5 km for a
category query, 20,000 km for a name-like one, where measurement shows the ranking becomes
byte-identical to sending no geo. Sending fine precision everywhere costs 42/50 → 38/50.

**One cuisine facet with a second level.** `American`, `Contemporary American` and
`Californian` competed for the same intent, so they merged into one predictable bucket —
35% of the corpus — that partitions via `cuisine_tags` into Traditional (865) against
Contemporary (745). That only works if the UI exposes the second level, which is a
constraint on the front end, not just the transform.

**Two attributes were removed from `searchableAttributes`.** `chain_name` was provably
redundant — all 722 chained records have a name beginning with it — and being searchable
it gave every chain member a spurious whole-attribute exact match, which is what made
`prime` return the wrong restaurant. `address` had no stated pain behind it and injected
real noise: `kaya` returned 27 Waikiki restaurants on *Kalakaua* Avenue among 67 hits.

**`ignorePlurals` and `removeStopWords` stay off**, measured rather than reasoned.
Plurals buy nothing — `steakhouses` returns 513 hits either way, because typo tolerance
already absorbs a trailing plural — and cost two known-item regressions. Stop words
break the sharpest case in the corpus: `the smith` goes from 4 hits to 16 and
`The Smith - East Village` falls out of the top three.

**`popularity_score` is a Bayesian average, not the raw rating.** 21 records hold a 5.0
and 18 of those have fewer than 50 reviews, so `desc(stars_count)` would fill the first
screen from that pool. With `m = 50`, `Ellen's Cafe` — 5.0 stars, one review — sits at
rank 2414 of 5000.

**`occasions` is derived, not observed**, and says so wherever it appears. It is a
heuristic over dining style, price tier and cuisine. Two vocabulary terms stay thin and
20.6% of records get none; forcing rules to fill those would be fabrication.

---

## Trade-offs and what is still wrong

**52 relevance cases: 40 pass, 6 accepted, 4 fail, 2 blocked.** Written before the index
existed, from real records. `accepted` means the expectation is not met and the behaviour
is judged acceptable, with the reason recorded.

The four failures:

- **O2, O3, O4** — out-of-corpus queries leak. `olive garden` is absent but
  `removeWordsIfNoResults: lastWords` drops `garden` and returns six restaurants matching
  `olive`. One setting closes all three: with word removal off, all four out-of-corpus
  queries return 0. Its cost is unmeasured and that is the whole question, because `none`
  means one unmatched word returns nothing — the opposite of the forgiveness the
  known-item journey needs.
- **K18** — `cyclone` returns five records but four distinct labels. The index side is
  correct and both colliding records carry the ambiguity flag; the card must append
  distance where it is set.

The accepted six are more interesting than the failures. **A5, A7, K14 and G2** each ask
one ambiguous token to resolve to a specific restaurant when the corpus offers several
defensible answers — on `bistro`, `santa fe` and `leftbank` the wanted record sits at
rank 2 with its rivals in the top three; on `nobu` rank 1 *is* a real Nobu. None returns
a wrong answer. That is the line between a relevance defect and an over-specified test.

**C5 is a genuine conflict with no setting that resolves it.** It wants proximity to
separate two Pappas Bros locations 360 km apart; A2 wants proximity not to let a
restaurant 2 km away displace an exact name 1,062 km away. Measured, the windows do not
overlap and at 500 km both fail.

Two limitations that would matter in front of a client:

**The name-versus-category classifier is a heuristic, and labelled as one.** It asks
whether the query is exactly a taxonomy facet value. `italian restaurant` and
`sushi near me` match nothing and are treated as names, so a naturally phrased discovery
query gets no proximity. Real query categorisation is on the roadmap, not in this build.

**The corpus has metro-sized holes.** Chicago holds **zero** records — nothing in the
city, nothing in its market, nearest restaurant 116 km away. Boston, Atlanta and Seattle
are the same. A demo driven only by the browser's position looks broken from any of them
while behaving perfectly, which is why there is a location selector offering the ten
best-covered markets.

---

## Next steps

In rough order of value:

1. **Deploy.** §7 asks for it from the first commit and it has not happened.
2. **Resolve `removeWordsIfNoResults`** against all 42 passing cases, not just the three
   failures it fixes.
3. **Append distance in the hit card where `location_label_ambiguous` is set**, which
   closes K18 and is the only hard requirement the UI inherits from the data model.
4. **Run the remaining relevance work as measured single changes.** The loop exists and
   has caught three bad ideas already; the discipline is worth more than any single fix.
5. **Synonyms** for the abbreviation tail — 66 records carry a period abbreviation. Lower
   priority than it looked: `pappas brothers` already passes without one.

Beyond the prototype, and the reason the event stream is instrumented from the start:
personalization on the collected events, Recommend for related restaurants, A/B testing
ranking strategies against booking conversion, semantic querying for open-ended intent,
and replacing derived `occasions` with observed behaviour. None of these requires
reworking the data model or the instrumentation.

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

Index configuration lives in the repo and is pushed by script. It is never edited in the
dashboard: a dashboard-only change is a change nobody can review in a diff.

**Stack:** Vite + React InstantSearch. Six runtime dependencies, 143 KB gzipped.
The index is `restaurants` plus three virtual replicas for the sort control.
