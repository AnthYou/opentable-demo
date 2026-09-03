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
  "unordered(cuisine,cuisine_tags)",
  "unordered(neighborhood,city,market)"
]                             # chain_name and address both removed — see below
indexLanguages / queryLanguages: ["en"]
attributesForFaceting: [
  "searchable(cuisine)", "cuisine_tags", "dining_style",
  "price_range", "price_tier", "occasions", "city", "market", "neighborhood",
  "filterOnly(is_chain)"
]
customRanking: ["desc(popularity_score)", "desc(reviews_count)"]
typoTolerance: minWordSizefor1Typo 4, minWordSizefor2Typos 8,
               allowTyposOnNumericTokens false
exactOnSingleWordQuery: "attribute"   # measured against "word" — see below
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

**`exactOnSingleWordQuery` is declared at `attribute`, not left to the default.** The
value equals Algolia's default, but the choice is now a measured one and must be visible
in a diff. `attribute` grants the `exact` criterion only when a single-word query equals
the whole attribute value; `word` grants it when the query matches any whole word. The
two are in direct opposition and no setting provides both. Measured on this corpus,
`word` fixes `nobu` (`Nobuo` stops outranking three real Nobu locations) and breaks
`prime`, `bistro` and `babylon`. Net −2, so `attribute` stays. See `test-queries.md`,
the `exact` tie investigation.

**`address` is not searchable either, and this one overrides section 5 as written.**
Section 1 puts features with no stated pain out of scope however cheap they are, and no
reported pain asks for street search. It also cost precision on the journeys that *are*
in scope: matching typo-plus-prefix against street names, `kaya` returned 27 Waikiki
restaurants on Kalakaua Avenue among its 67 hits, `thai` returned 31 restaurants on
Third Street or Third Avenue among 76, and `Cafe 21` returned 5 spurious hits on top of
the 2 real ones. Removed 2026-09-03: no case status changed, and those tails collapsed —
kaya to 40, thai to 45, `Cafe 21` to exactly the two Café 21 records. It is still
returned for display; it is simply not searched.

**Languages are pinned, because two other settings depend on them.** `indexLanguages`
and `queryLanguages` are both `["en"]`. `ignorePlurals` and `removeStopWords` are
dictionary-driven, and with no language declared they resolve against every supported
language — a far wider plural and stop-word set than a corpus where `country` is
constant `US`. The declaration itself changes nothing (measured across 11
representative queries); it exists so the two settings below rest on a stated basis
rather than an implicit one.

**`chain_name` is not searchable, and that is deliberate.** It was listed here
originally. It is provably redundant — all 722 chained records have a name beginning
with their `chain_name`, 0 exceptions, because it is derived from the name — so any
query reaching a record through it already reaches it through `name` at level 1. Worse,
being searchable it produced a whole-attribute exact match for every member of a chain
whose base name equalled the query, which cancelled the real name match: on `prime`,
90916 `Prime - Bellagio Hotel` scored `exact=1` through `chain_name` and beat 117067
`Prime`, whose name *is* the query. Removed 2026-09-03; `test-queries.md` A2 went from
fail to pass with zero regressions. It stays in the record as a returned attribute for display and grouping; it is not in `attributesForFaceting` and never was.

**`ranking` is declared explicitly, at Algolia's default order.** Declaring it matters
even when the value matches the default: the order is a consequential choice, and an
implicit default is invisible in a diff.

`geo` sits second, ahead of `words`, `attribute` and `exact`. It was briefly demoted
below `exact` on the theory that proximity must never outrank text relevance, with the
justification that discovery would still get geo-led ordering from coarse
`aroundPrecision` buckets. **That was measured and it was wrong.** At position 7 the
criterion is consulted only among records tied on all six preceding criteria, which
never happens on a broad query: on `italian` from Denver the first Denver record ranked
89th of 895, and `aroundPrecision` changed nothing. The demotion cost the discovery
journey its stated core behaviour and bought nothing. Restored 2026-09-03 — first Denver
record now ranks 1st, the top ten are all Denver, and `popularity_score` breaks ties
inside the bucket as intended. Zero regressions across the other 49 measurable cases.
See `test-queries.md` G3 and the change log.

**The known-item journey is protected by the parameter separation, not by the ranking
order.** It sends no geo parameter at all and computes distance client-side from
`_geoloc` for display, so the `geo` criterion is inert there whichever position it
holds — which is why the Nobu cases behaved identically before and after. That makes the
protection a convention the two libraries make structural (§6), not a property of any
setting: **if a typed query ever carries `aroundLatLng`, proximity outranks the name
match.** `src/searchParams.js` is where that has to stay true.

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

Distance must not dominate ranking on the known-item journey — but the reason
originally given here was wrong, and wrong in a way that made the risk untestable.

The claim was that a user searching "Nobu" from Denver would get the nearest bistro.
**Measured, that cannot happen.** `geo` is a ranking criterion, not a filter: it
reorders records that already match the text, and a bistro does not match `nobu`. With
geo parameters sent on every query, `nobu` still returns only the 18 records matching
it and no Denver restaurant enters at all — test-queries.md G1 passes either way.

The real harm is narrower and sharper: on a short ambiguous name, the nearer record
that *also* matches the word wins. `Ocean Prime - Denver` (2 km) displaces 117067
`Prime` (1,062 km); `Barley & Rye` displaces `Rye`; `Workshop at UNION` displaces
`Union`. That is a testable failure, and it is what the parameter separation prevents.

Note the inverse, also measured: geo *helps* chain queries. From Denver, `ruths chris`
puts Ruth's Chris Denver first, `benihanna` puts Benihana Denver first, `pappas bros`
puts Dallas ahead of Houston. Proximity is exactly the disambiguation persona 1 asked
for on a chain. So this is not a blanket harm, which is why the answer is per-context
parameters rather than a global choice.

Resolution, per journey:

**Geo is always sent, and never withdrawn.** `aroundLatLng` (browser, then
`aroundLatLngViaIP`, then the default metro) with `aroundRadius: "all"`, on every
request. A result is never lost to distance: 5,000 restaurants across 916 cities is a
sparse national sample, and a bounded radius returns nothing for most positions —
`italian` from Denver gives 31 records inside 50 km against 895 unbounded.

**What varies is `aroundPrecision`, and it varies on what the query means.** The axis is
name versus category, and both are text — an earlier version gated geo on whether the
query was empty, which denied proximity to `italian` from Chicago, a discovery query.

- **Category query, or none yet** — fine bucket, 5 km. Proximity genuinely orders the
  results, and 5 km is coarse enough that `popularity_score` breaks ties inside a
  bucket: without that, a marginally closer mediocre restaurant outranks an excellent
  one two streets further.
- **Name-like query** — coarse bucket, 20,000 km. The whole corpus falls in one bucket
  and geo decides nothing. Measured: at 10,000 km the ranking is already byte-identical
  to sending no geo, so `Ocean Prime - Denver` (2 km) stops displacing 117067 `Prime`
  (1,062 km).

Distance display is independent of all of this — it is computed client-side from
`_geoloc`, which is why that attribute is retrieved. The dial changes ranking only.

Never leave the user geo-blocked. If geolocation is denied: fall back to IP, then
to a default metro area, and tell the user in the UI which location is in use so
the results are never unexplained.

**Including while the permission prompt is open.** The dialog has no timeout the app
controls, so an implementation that waits for an answer sends the first request — and
everything typed until the user responds — with no geo at all. `aroundLatLngViaIP` needs
no permission and is resolved server-side, so it carries proximity from the very first
request and is upgraded to precise coordinates if and when the browser answers. The same
path covers a denial and a browser with no geolocation API.

**The third rung is now a control, not a silent default.** A location selector offers the
ten best-covered markets alongside "use my location", because the corpus has gaps where
nobody would look for them: **Chicago holds zero records** — nothing in the city, nothing
in its market, nearest restaurant 116 km away in South Bend — and Boston (123 km),
Atlanta (167 km) and Seattle (220 km) are the same. A demo driven only by the browser
looks broken from any of those while behaving perfectly.

The record counts that justify curating the list are deliberately not shown: a number
beside a city in a search interface reads as a result count, and it is not one. And when
"use my location" is chosen but the browser has not shared a position, the banner says so
in full — "your approximate location" alone names the rung without explaining why it is
approximate.

Making it a choice serves "tell the user which location is in use" better than a default
ever could, and it means the fallback chain no longer has an unreachable rung.

What remains a genuine limitation: with `aroundLatLngViaIP` the client cannot know where
Algolia placed it. Measured — the response does not echo a resolved `aroundLatLng`, so
the banner can only say "your approximate location" without naming it, and a failed
lookup is indistinguishable from results that are simply not geo-ordered. From outside
the US the ordering is also meaningless: tested from this machine, the nearest record
came back 5,609 km away. The selector is the answer to both.

## 6. Stack and repo layout

Front end: **Vite + React InstantSearch, and nothing else.** One search box, one
results page, search-as-you-type. No suggestion dropdown.

This corrects two earlier decisions in sequence. The original plan paired
InstantSearch with Autocomplete.js for a header dropdown; that pairing was dropped
once `react-instantsearch@7.48` was found to ship its own `<Autocomplete>` widget.
The dropdown itself was then dropped too, and for a better reason: **it adds a
second surface showing the same records the page already shows.** Nothing in
section 2 asks for it. Neither does the recent-searches feature that came with the
widget — no reported pain mentions returning to a previous query, and section 1 puts
features with no stated pain out of scope however cheap they are.

The starter shipped with the dataset is pinned to Node 9 and
`parcel-bundler@1.9.7`, both unmaintained and carrying critical transitive
advisories, and it exposes only the low-level search client — rebuilding
autocomplete, refinement, geo and sorting widgets by hand would cost days that
belong to the experience itself. From the original bundle we keep the dataset,
`resources/current-experience.png` as a reference for the experience being
replaced, and selected styling cues.

### One surface, two intents

The personas are **intents, not surfaces**. There is one box and one results page,
and the same keystroke serves both:

- **Persona 1, known-item.** Text relevance leads. The user types a name, possibly
  misspelled or concatenated, and the exact match has to win.
- **Persona 2, discovery.** The empty query is a destination — curated entry points,
  then results with facets, sorts and proximity.

A second dropdown surface was tried and removed. It showed the same records the page
already showed, one keystroke earlier, which is noise rather than help.

**One surface, two parameter sets, differing in exactly one key.** `src/searchParams.js`
declares them side by side with the reasoning inline, and a boot-time assertion fails if
they ever diverge in anything other than `aroundPrecision` — anything else diverging
means the two journeys have quietly become two feature sets.

Which set applies is decided by a heuristic, and it is **documented as a prototype
limitation, not a reliable classifier**: is the whole query, lowercased, exactly a value
of one of the four taxonomy facets — `cuisine`, `cuisine_tags`, `dining_style`,
`occasions`? Places are excluded on purpose. `city`, `neighborhood` and `market` hold
1,269 values and eight are also restaurant names — `rye`, `union`, `babylon`,
`santa fe`, `acme`, `lafayette`, `meridian`, `riverside` — so including them would
misclassify precisely the known-item queries the split exists to protect. Excluding them
also stands on its own: a place query is already constrained geographically by its own
text match, so proximity has nothing left to reorder inside that set.

Two measured failure modes, recorded rather than hidden:

- **One residual collision.** `bistro` is a `cuisine_tags` value *and* the name of
  100624, so it classifies as a category and 100624 loses its place. `small plates`
  collides the same way. Ten facet values collide with restaurant names in total; these
  two are the ones the taxonomy contributes.
- **Exact match only.** `italian restaurant`, `cheap italian` and `sushi near me` match
  nothing and are treated as names, so a naturally phrased discovery query gets no
  proximity. Closing that needs real query categorisation — section 9, out of scope.

And one conflict the dial cannot resolve: **chain disambiguation and exact-name
protection pull it in opposite directions.** `test-queries.md` C5 wants proximity to
separate two Pappas Bros locations 360 km apart; A2 wants it not to let a restaurant
2 km away displace an exact name 1,062 km away. No single value does both — measured,
the windows do not overlap, and at 500 km both fail. C5 is accepted, mitigated by
`location_label` still telling the two apart.

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
  components/                # custom InstantSearch widgets (Hit, Facets, SortBy, …)
  lib/                       # shared formatters (location_label, distance, price)
public/                      # static assets served as-is
```

Flat `components/` is the InstantSearch convention — one component per custom
widget. Resist inventing a deeper taxonomy: with a single surface and a single
library there is no second axis to split on.

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

  What `src/insights.js` emits, verified by capturing the built payloads:
  `clickedObjectIDsAfterSearch` named `Restaurant Clicked` and
  `convertedObjectIDsAfterSearch` named `Table Booked`, **both carrying the same
  `queryID`** as the search that produced the hit, plus the position for the click.
  `viewedObjectIDs` comes free from the middleware and carries no `queryID`, which
  is correct — Algolia has no after-search variant of a view event.

  The Insights client uses the **search** key. Insights is a separate endpoint from
  indexing and needs no write permission; a write key here would land in the browser
  bundle, which is the one thing §7 exists to prevent.

  The `userToken` is an anonymous value written to `localStorage`, with
  `useCookie: false` so the demo sets no cookie nobody consented to. **This is
  demo-grade.** In production that token is where consent handling belongs — none
  until the visitor agrees, and the account identifier once there is one so events
  survive across devices. Persisting an identifier without asking is what a privacy
  review stops.
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
