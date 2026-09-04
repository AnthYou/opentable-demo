# Decisions

Why the prototype is configured the way it is. `CLAUDE.md` states the rules in force;
this file records how they were reached, what was measured, and what was tried and
rejected. `test-queries.md` holds the case-level detail and the settings change log.

Every figure here was measured on the delivered extract. Where a decision was later
reversed, both the original reasoning and the measurement that overturned it are kept —
a reversed decision with no record invites the same mistake again.

---

## 1. Data and transform

### The corpus

Join on `objectID` is 1:1 and complete: 5,000 matches, no orphans either side. No missing
`_geoloc`, no blank `food_type`, `stars_count` or `neighborhood`. `country` is constant
(`US`, 5,000/5,000). `image_url` follows a single pattern across all 5,000.
`stars_count` min 1.00, mean 4.29, max 5.00, no zeros. `reviews_count` min 1, median 336,
max 12,669, with 70 records under 10 reviews.

`dining_style`: Casual Dining 2,203, Casual Elegant 2,130, Fine Dining 641, Home Style 26.
`price_range`: $30 and under 3,125, $31 to $50 1,567, $50 and over 308.

### Phone — CSV wins

160 records (3.2%) disagree between the two files. The JSON `phone` carries a stray `x`
suffix and sometimes a different number: `7134181000x` against `(713) 418-1104`,
`317-421-8282x` against `(317) 421-8280`. A systematic suffix indicates a broken export
rather than a fresher value, so the CSV `phone_number` is the source of truth, normalised
to E.164.

### Price — the label wins

220 records (4.4%) contradict each other. The cross-tab of `price` (int) against
`price_range` (label) is not diagonal: `price=2` with "$50 and over" on 6 records,
`price=3` with "$30 and under" on 70, `price=4` with "$30 and under" on 2. `price_range`
is what the user sees and filters on, so `price_tier` derives from the label and the JSON
int is dropped.

### `area` stays opaque

2,103 records (42%) have no `" / "` separator. The field mixes granularities: metro
(`Houston`, `Columbus`), state (`Idaho`, `Iowa`, `Indiana`), multi-city aggregate
(`Dallas - Fort Worth`), macro-region (`Coastal North Carolina`), across 51 distinct
values. Splitting it into city and state is not possible, so it is carried through as
`market` and `market_state` is derived only where the separator exists. Of 2,897 derived
`market_state` values only 922 are actual US state names, which is why `market_state` is
not searchable.

### `location_label` and the ambiguity flag

`neighborhood` equals `city` on 2,500 records (50%), and only a trimmed, case-insensitive
comparison finds all of them. The transform computes neighborhood-when-distinct-from-city,
otherwise city, and flags the 18 records where that is insufficient — the 9 same-city
chain clusters whose siblings share a neighborhood.

**Corrected 2026-09-03.** The original reason for the flag read "or those rows render
identically". They do not: all 18 flagged records have distinct `name` values, because
each carries a distinguishing suffix — `- Midtown` beside `- Rice Village`, `- DC Ranch`
beside `- Old Town`, `- 18 Oaks` beside `- Cibolo Moon`. The name is the most prominent
element on the card, so no two rows are indistinguishable. What the flag buys is a
location line that stops repeating itself.

**Corrected 2026-09-03 — distance resolves five of the nine clusters, not nine.** Four
carry byte-identical `_geoloc`, so distance is the same on both rows: Tien Biloxi
(11437 / 11434, both `850 Bayview Ave`), Jia Biloxi (96121 / 91042), JW Marriott San
Antonio (39706 / 39703), The Westgate Hotel San Diego (72961 / 72964). These are two
dining concepts at one address — `Teppanyaki / Shabu Shabu` beside `Traditional Asian
Dining`, `18 Oaks` beside `Cibolo Moon` — rather than two locations. The distance rung is
load-bearing on the other five: Fleming's Steakhouse Scottsdale (40036 / 39919, both
`Scottsdale`), The Herb Box Scottsdale (99511 / 99508), McCormick & Schmick's Pittsburgh
(6794 / 13990, both `Downtown`), Churrascos Houston (883 / 114319, both `West Side`),
Cyclone Anaya's Houston (145366 / 151276, both `Midtown / Montrose`).

**Amended 2026-09-04.** The card no longer reads `location_label`. It renders
neighbourhood, city and state directly, plus distance on every row, because
`location_label` carries only one of neighbourhood or city and so tells the reader where a
restaurant is on half the corpus. `location_label` is still computed and retrieved;
`location_label_ambiguous` still drives the address fallback for the 18 flagged records
when no position is known. The chain is therefore four rungs, and the last two live in
`src/lib/format.js`: neighbourhood → city → distance → address.

### Chains — two encodings

**Exact duplicates: 23 names**, each at exactly 2 locations, always in different cities
(`Town`, `Sienna`, `Pappas Bros. Steakhouse`, `Cocotte`, `Grange`, …). One shares a
market: `Rafain Brazilian Steakhouse` (68527 Dallas / 144949 Fort Worth), both in
`Dallas - Fort Worth`, so `market` does not separate them. Two differ only by case:
`Range` (4221) / `range` (141001), `Eleven` (150715) / `ELEVEN` (3204).

**Suffixed locations: 1,086 records** carry a ` - <location>` suffix. Grouping on the
folded base name gives 213 chains covering 722 records, 44 of them with two or more
locations in the same city — 51 clusters, 113 records. Largest: Cyclone Anaya's ×5 in
Houston (145369, 145366, 151276, 145381, 145375), Churrascos ×4 in Houston (883, 150679,
114319, 882), then ×3 for Perry's Steakhouse (Houston), Atria's (Pittsburgh), Sushi Zushi
(San Antonio), The Wine Bistro (Columbus), Stone Werks (San Antonio), BRAVO Cucina
Italiana (Columbus).

Same-city ambiguity is reproducible on this extract, and `prospect-context.md` names it
explicitly as a reported pain. An early profiling pass concluded the dataset did not
reproduce it; a second pass contradicted that. No synthetic case is needed and none was
introduced.

**Glyph folding earns its place.** Grouping on the raw lowercased base name finds 212
chains. Folding diacritics and unifying apostrophe and dash glyphs finds a 213th:
`Big Daddy's` — 30991 `Big Daddy's - Gramercy Park` (straight apostrophe, hyphen) and
42784 `Big Daddy's – Upper West Side` (curly apostrophe, en dash), both in New York. A
chain and a same-city cluster are invisible without the fold, so `foldName` is the single
definition of chain identity and the profiling script uses the same one.

**`chain_name` cannot be a blind split on the separator.** 406 of the 1,086 suffixes match
no city or neighborhood in the corpus: `Tien - Teppanyaki / Shabu Shabu` (11437) is a
cuisine descriptor, `The Westgate Hotel - The Westgate Room` (72961) is a room,
`Sixth & Pine - Nordstrom Green Hills Nashville` (67003) is a department store, and
`Bocca Di Bacco (Theatre District - 45th St.)` (4478) carries the separator inside
parentheses. The glyph is also inconsistent within one brand on 5 chains — `Café 21` uses
a hyphen on 64003 and an en dash on 64000, and the same holds for `BD's Mongolian Grill`,
`Merriman's`, `Zodiac at Neiman Marcus` and `Big Daddy's`.

**Two chain members the separator rule misses.** `Churrascos-Sugar Land` (70261) and
`Jax Fish House-Kansas City` (150577) use a hyphen with no surrounding whitespace, so
`baseName` leaves it intact. A corpus sweep found 48 records with a tight hyphen, of which
exactly these 2 are chain members; the other 46 are genuinely hyphenated single names the
guard must keep intact — `Dinosaur Bar-B-Que`, `Café Des Beaux-Arts`, `T-Fusion
Steakhouse`, `BO-beau kitchen + garden`, `Fish Hopper - Kailua-Kona`. Two missed against
46 protected is the accepted ratio, so the true chain totals are 2 records higher than the
figures above, and neither missed record creates a new same-city cluster.

### `food_type` → 37 cuisines

114 distinct values, overlapping and competing: `Steak` (123) against `Steakhouse` (328),
`American` (865) against `Contemporary American` (649) against `Californian` (96). Mapped
by hand to 37 primary cuisines plus 102 tags in `scripts/cuisine-taxonomy.json`.

`American` is the largest bucket at 1,763 records (35%), which `cuisine_tags` partitions
into Traditional (865), Contemporary (745) and a remainder of 153 under narrower tags
(Californian, Gastropub, Comfort Food, Burgers, Organic and others). The merge only works
because the UI exposes the second level.

### `popularity_score` — the prior is calibrated, not guessed

`m = 50`, `C = 4.2941`. Exactly 21 records hold a 5.0, of which 18 have fewer than 50
reviews and 8 fewer than 10, so `desc(stars_count)` alone would fill the entire first page
from that pool whatever the tie-break. With the prior, 154318 `Ellen's Cafe` (5.0 stars,
**1 review**) drops to rank 2414 of 5000 and the other seven thin records to ranks
1523–2404. That gap is the justification for the prior.

The calibration check is the top 20 by `popularity_score`. Measured on the extract it
includes 2767 `Mama's Fish House` (12,669 reviews), 3934 `GW Fins` (5,523) and 4487
`Restaurant August` (4,668), alongside three 5.0-star records with 139–242 reviews (31153,
5062 `Pazza Notte`, 78970 `Embers Steakhouse`). Those three are not thin-review artefacts,
so whether they belong in a top 20 is a judgment call on `m` rather than a defect. Raising
`m` is a settings change and would get a change-log line.

### `occasions`

Derived from `dining_style` + `price_tier` + `cuisine`, and constrained to a controlled
vocabulary of seven values. Free-form generation produced an unusable long-tail facet.
Two vocabulary terms stay thin and 20.6% of records receive none; adding rules to fill
those would be fabrication. Provenance is stated wherever the attribute appears.

---

## 2. Index configuration

### `ranking` — five orders, in sequence

| date | order | outcome |
|---|---|---|
| 2026-09-03 | Algolia default, `geo` second | baseline |
| 2026-09-03 | `geo` demoted to position 7, below `exact` | **reverted** |
| 2026-09-03 | Algolia default restored | 40/50 → 41/50 |
| 2026-09-04 | `exact` promoted above `geo`, `geo` above `attribute` | **reverted** |
| 2026-09-04 | `custom` promoted above `attribute` | **reverted** |
| 2026-09-04 | Algolia default, and now a decision rather than an inheritance | in force |

**The demotion of `geo` to position 7** was made on the theory that proximity must never
outrank text relevance, with the justification that discovery would still get geo-led
ordering from coarse `aroundPrecision` buckets. That was measured and it was false. At
position 7 the criterion is consulted only among records tied on all six preceding
criteria, which never happens on a broad query. Four variants of `italian` from Denver:

| parameters | hits | top 5 cities |
|---|---|---|
| none | 895 | Memphis, Orlando, San Diego, Somerville, Orlando |
| `aroundLatLng` + `aroundRadius: all` | 895 | Castle Rock, Colorado Springs, Santa Fe, Albuquerque, Omaha |
| + `aroundPrecision: 5000` | 895 | identical — the precision bucket changes nothing |
| `aroundLatLng` + `aroundRadius: 50000` | **31** | Castle Rock, **Denver, Denver, Denver, Denver** |

The first Denver record sat at position 89 of 895. Restoring the default moved it to 1st
with all ten top hits in Denver and `popularity_score` decreasing inside the bucket
(4.688, 4.590, 4.589, 4.589, 4.497), with zero regressions across the other 49 measurable
cases.

**Promoting `exact` above `geo`** was measured on 2026-09-04 against 44 cases from three
anchors and scored 39/44 against 36/44 for the default. It recovered A1 `rye`, A2 `prime`
and A6 `union` — a single-word query equal to a whole attribute value wins on `exact`
before distance is consulted — while leaving chain queries ordered by distance, since no
record is named exactly `cyclone`, `pappas` or `ruth`. `geo` had to stay above `attribute`
for it to work: with `attribute` first, `italian` from Denver returned Castle Rock,
Colorado Springs, Santa Fe, Albuquerque and Omaha, because a distant restaurant whose
*name* contains the query outranks a near one whose *cuisine* is the query.

**It was reverted on the use case.** In a reservation product proximity is the dominant
intent signal: a diner is choosing somewhere to eat, so the near restaurant matching the
query is usually the one wanted, and a diner who wants a specific restaurant in another
city names that city. That fallback was verified rather than assumed — ten city-qualified
queries from Denver each return **exactly one hit at rank 1**, because Algolia requires all
query words to match whenever the full query has results, so `geo` never reorders them:
`prime mansfield`, `rye brooklyn`, `union pasadena`, `union mobile`, `nobu new york`,
`nobu waikiki`, `prime bellagio`, `pappas bros dallas`, `cyclone anayas rice village`,
`flemings dc ranch`.

The cost is recorded on the cases. From Denver, `prime` puts 117067 `Prime` at rank 14 of
49 behind `Ocean Prime - Denver`; `rye` puts 105424 `Rye` at rank 3 of 7 behind
`Barley & Rye`; `union` puts 116815 at rank 25 of 42 behind `Workshop at UNION` (3.8
stars); `bistro` puts 100624 at rank 198 of 208; `santa fe` puts 65881 last of 39. A1, A2
and A6 are `accepted` on this basis rather than passing.

**Promoting `custom` above `attribute`** was measured and set aside in favour of query
rules. `attribute` ranks by which searchable attribute matched, so inside one distance
bucket a name match outranks a better-rated cuisine match: `steakhouse` from Denver led
with Morton's The Steakhouse (4.2) above Guard & Grace (4.7), `french` from Midtown West
with French Roast Bar & Bistro (4.1) above Le Bernardin (4.7), `pizza` with Lazzara's
Pizza Cafe (4.1) above Delizia 92 (5.0), and `downtown` from Houston with four records
carrying "Downtown" in the name above Andalucia Tapas (4.7). The demotion fixed all of
them at 39/44, neutral on the case suite, with `midtown`, `fish house`, `tavern` and
`sushi` byte-identical. Algolia's default carries the same flaw, so reverting `ranking`
does not address it — the rules in section 3 do, which keeps the ranking formula at the
default.

### `searchableAttributes` — two attributes removed

**`chain_name`, removed 2026-09-03.** Provably redundant: all 722 chained records have a
name beginning with their `chain_name`, 0 exceptions, because it is derived from the name,
so any query reaching a record through it already reaches it through `name` at level 1.
Being searchable it also produced a whole-attribute exact match for every member of a
chain whose base name equalled the query, cancelling the real name match — on `prime`,
90916 `Prime - Bellagio Hotel` scored `exact=1` through `chain_name` and beat 117067
`Prime`. A2 went from fail to pass with zero regressions across the other 49 cases. It
remains a retrieved attribute for display and grouping, and was never in
`attributesForFaceting`.

**`address`, removed 2026-09-03.** No reported pain asks for street search, and it injected
measurable noise through typo-plus-prefix matching on street names: `kaya` returned 27
Waikiki restaurants on Kalakaua Avenue among 67 hits, `thai` 31 restaurants on Third Street
or Third Avenue among 76, `Cafe 21` 5 spurious hits on top of the 2 real ones. Removal
changed no case status and collapsed those tails — kaya 67 → 40, thai 76 → 45, union
57 → 42, tien 47 → 38, `Cafe 21` 7 → exactly the two Café 21 records. It also moved O3 from
1 hit to 10, because the leak was word removal rather than `address`. Street search is
gone: 110 records were reachable only via `address` on `Main Street`, 92 on `Broadway`, 139
on `park`. The attribute is still retrieved, and is the fallback discriminator on the 18
ambiguous records when no position is known.

### `attributesForFaceting` — `searchable()` on the three place facets

Added 2026-09-04 as a bug fix. `city`, `market` and `neighborhood` were plain facets while
`App.jsx` rendered a search box on each, so all three boxes were dead — the API answers
*Cannot search in `city` attribute* and returns nothing. Cardinality is why they need
search rather than a longer `showMore` list: 916 distinct cities and 1,062 distinct
neighborhoods behind a `limit` of 6, so no amount of scrolling reaches a named place.
`market` is included at only 51 values because it is opaque at inconsistent granularity —
a user looking for Fort Worth cannot guess it lives inside `Dallas - Fort Worth`. The
modifier enables facet-value search only and never enters `searchableAttributes`, and that
was re-measured after the push rather than assumed: kaya 40, thai 45, `Cafe 21` 2, union
42, tien 38 all unchanged, A2 still ranks 117067 first, A1 still puts 95884 and 105424
above 30385, G3 still returns Denver first from Denver.

### Languages pinned to `["en"]`

`indexLanguages` and `queryLanguages` both declared, changing nothing behaviourally — 0 of
50 cases moved, not even a hit count. They exist because `ignorePlurals` and
`removeStopWords` are dictionary-driven, and with no language declared they resolve against
every supported language, a far wider plural and stop-word set than a corpus where
`country` is constant `US`.

### Measured and rejected

| setting | change tried | why not |
|---|---|---|
| `exactOnSingleWordQuery` | `attribute` → `word` | Fixes G2 `nobu` exactly: the four true Nobu score `exact=1` as a whole word, 74146 `Nobuo` scores 0. Breaks A2 `prime` (Bohanan's Prime Steaks), A7 `bistro` (Costa Brava Bistro) and A8 `babylon` (Babylon Turkish). Net −2. Re-measured under the promoted `ranking` on 2026-09-04: still −2, 30/37 against 32/37. `attribute` rewards "the query is the whole name"; `word` rewards "the query is a whole word in the name"; the two are in direct opposition and no setting provides both. |
| `ignorePlurals` | `false` → `true` | Buys nothing: `steakhouses` 513 hits either way, `bistros` 210, `tapas` 55, `pizzas` 36, `noodles` 3, all identical, because typo tolerance already absorbs a trailing plural on any word of 4+ characters. Costs two known-item regressions: `maya` drops 23845 `Maya` from rank 1 to 2 behind 77980 `Mayas`, `vita` drops 10015 `Vita` from rank 1 to 2 behind 77257 `Vitae`. An earlier note named Cata/Catas as the risk; measurement shows that pair is unaffected. |
| `removeStopWords` | `false` → `true` | Buys nothing: O4 `sushi in tokyo` returns 0 with word removal disabled, so the token `in` was never its cause. Regresses the sharpest case in the corpus: `the smith` goes from 4 hits to 16 and 19258 `The Smith - East Village` falls out of the top 3, displaced by `Smithfields` and `Butera's Restaurant of Smithtown`. Adds tail noise on `in the raw` (1 → 2) and `the capital grille` (11 → 12). |
| `customRanking` | add `asc(name_word_count)` | No valid position. Before `desc(popularity_score)` it dominates, so broad queries such as `italian` or `steakhouse` would be ordered by name length. After it, it never fires, because `popularity_score` is a float with essentially no collisions. There is no conditional `customRanking`, so a signal meaningful only for short queries cannot be expressed there. No new attribute was added and the schema is unchanged. |
| `replicas` | a `distance` replica | Not implementable. A replica's order comes from stored attributes and distance depends on the user's position at query time, so there is nothing to store and nothing to pre-sort. Distance ordering comes from sending `aroundLatLng` to the primary index. This rules out sorting by a stored distance, and does not rule out a standard replica whose `ranking` places `geo` first. |

### Typo tolerance — the thresholds cut both ways

59 pairs of distinct restaurant names sit at edit distance 1. At `minWordSizefor1Typo: 4`
they become mutually reachable, so tolerance can turn an exact known-item query into the
wrong restaurant. The sharpest is `Kaya` (79378) against `Naya` (148411), both in
Pittsburgh, so no geo signal separates them either. Others: `Uva` (60163) / `Yuva` (6666) /
`Yuba` (141115), all three in New York; `Range` (4221) / `Grange` (26626, 111739);
`Soto` (36775) / `Soco` (63832, 150973) / `Moto` (118249) / `SATO` (151987); `Silo` (88030)
/ `LILO` (95068) / `kilo` (108610) / `Lido` (63250); and a tail of singular/plural or
final-vowel pairs — `Cata`/`Catas`, `Maya`/`Mayas`, `Azur`/`Azure`, `Vita`/`Vitae`,
`Savor`/`Savore`, `Luca`/`LUCCA`, `Prime`/`Primo`, `Beast`/`Feast`, `Venue`/`Avenue`.

The inverse risk is the short-name tail: `Q` (106741), `B4` (116248), `AOC` (49894),
`TE'` (7855), `Coi` (11065), `Oba` (3512), `Uva` (60163) fall under the 4-character floor
and get no tolerance at all. 36 names are affected. The floor protects them from the
collisions above at the cost of returning nothing on a misspelling.

`disableTypoToleranceOnWords` stays empty. A3 / A4 (`naya` / `kaya`) were flagged as the
likeliest way to break persona 1, and both rank 1 on their own query with the thresholds
unchanged, so the pre-emptive exception would have been wasted work.

---

## 3. Query rules

Added 2026-09-04. A query equal to a category name is a browse rather than a text search.
Ranked as text it passes through `attribute` before `custom`, which is the flaw described
in section 2. Removing the query words and applying the value as a facet filter takes the
text criteria out of the comparison, leaving `geo` then `popularity_score`.

One rule per attribute using the `{facet:<attribute>}` placeholder, so 3 rules cover 48
values. The measured rule quota on this application is at least 4, and the four taxonomy
attributes hold 150 values between them, so one rule per value was never available.

`dining_style` and `occasions` matter more than `cuisine`, because neither is in
`searchableAttributes` and those queries were failing outright:

| query | before | after | rank 1 from Denver |
|---|---|---|---|
| `casual elegant` | **0 hits** | 2,130 | Fruition Restaurant (4.8) |
| `fine dining` | 1 hit | 641 | Kevin Taylor's At The Opera House (4.7) |
| `family friendly` | 1 hit | 1,858 | the plimoth (4.7) |
| `date night` | 6 hits | 1,639 | Mizuna (4.7) |
| `business lunch` | 8 hits | 1,627 | Mizuna (4.7) |
| `late night` | 68 hits | 73 | — |
| `steakhouse` | 513 hits, Morton's (4.2) | 486 | Guard & Grace (4.7) |
| `italian` | 895 hits | 890 | Barolo Grill (4.7) |
| `thai` | 45 hits | 25 | — |

`date night` had been returning `Dante Ristorante Pizzeria` first, reached by typo
tolerance on `Dante`. `casual elegant` returned nothing at all. Zero regressions: 39
mechanically checkable cases pass 39/39, and `anchoring: is` means no rule fires on a name
query, so `prime`, `rye`, `cyclone`, `bistro`, `nobu`, `pappas` and every K case are
byte-identical.

Three cases now return exactly the counts their expectations name for the first time — D1
`steakhouse` 486 (was 513), D2 `fondue` 30 (was 31), D3 `thai` 25 (was 45). Those numbers
came from the transform report when the cases were written, and a text search never
reproduced them because names carrying the category word inflated every count.

**`cuisine_tags` has no rule, deliberately.** `automaticFacetFilters` is a hard filter, and
for 12 of its 102 values the tag covers far fewer records than the word reaches, so a rule
would shrink the result set rather than reorder it: `American` marks 32 records against
1,763 text matches, `Bar` 4 against 373, `Bistro` 4 against 208, `Vegan` 1 against 94,
`Spanish` 13 against 86, `Sushi` 67 against 106. 75 of the 102 values sit within ±5 and
would be harmless — `churrascaria` 33 to 33, `farm to table` 149 to 149 — but the ones that
would break are the most likely queries. Two of its values are also restaurant names,
`Bistro` (100624) and `Small Plates` (112537), and a hard filter would make those records
unreachable by their own name. `cuisine_tags` is already searchable, so those queries work
without a rule.

Of the 150 facet values across the four attributes, exactly 2 collide with a restaurant
name, both in `cuisine_tags`. `cuisine`, `dining_style` and `occasions` have none.

---

## 4. Geo strategy

### The original claim was wrong

The risk was first stated as: a user searching "Nobu" from Denver would get the nearest
bistro. Measured, that cannot happen. `geo` is a ranking criterion rather than a filter —
it reorders records that already match the text, and a bistro does not match `nobu`. With
geo sent on every query, `nobu` still returns only the 18 records matching it and no Denver
restaurant enters at all.

The real harm is narrower: on a short ambiguous name, the nearer record that *also* matches
the word wins. `Ocean Prime - Denver` (2 km) displaces 117067 `Prime` (1,062 km),
`Barley & Rye` displaces `Rye`, `Workshop at UNION` displaces `Union`. That is testable,
and it is the cost accepted in section 2.

The inverse is also measured: geo helps chain queries. From Denver, `ruths chris` puts
Ruth's Chris Denver first, `benihanna` puts Benihana Denver first, `pappas bros` puts
Dallas ahead of Houston. Proximity is exactly the disambiguation persona 1 asked for on a
chain.

### `aroundRadius: "all"`, permanently

A bounded radius returns nothing for most positions in a sparse national sample of 5,000
restaurants across 916 cities: `italian` from Denver gives 31 records inside 50 km against
895 unbounded. A result is never lost to distance.

### The `aroundPrecision` dial — built, then removed

Between 2026-09-03 and 2026-09-04 the app carried two parameter sets differing in exactly
one key, with a boot assertion enforcing that. A name-like query got a 20,000 km bucket, so
the whole corpus fell into one bucket and `geo` decided nothing; a category query got 5 km.
At 10,000 km the ranking was measured byte-identical to sending no geo, verified on
`prime`, `rye`, `union` and `nobu`.

Which set applied was decided by a heuristic — whether the whole lowercased query was
exactly a value of one of the four taxonomy facets. Places were excluded because `city`,
`neighborhood` and `market` hold 1,269 values and eight are also restaurant names (`rye`,
`union`, `babylon`, `santa fe`, `acme`, `lafayette`, `meridian`, `riverside`), so including
them would misclassify precisely the known-item queries the split existed to protect.

It had two measured failure modes. `bistro` and `small plates` are `cuisine_tags` values
*and* restaurant names, so they classified as categories and 100624 and 112537 lost their
place. And matching was exact only, so `italian restaurant`, `cheap italian` and
`sushi near me` matched nothing and were treated as names, denying proximity to naturally
phrased discovery queries.

It also could not resolve one conflict: chain disambiguation and exact-name protection pull
`aroundPrecision` in opposite directions. C5 wanted proximity to separate two Pappas Bros
locations 360 km apart, A2 wanted it not to let a restaurant 2 km away displace an exact
name 1,062 km away. The windows do not overlap and at 500 km both fail. C5 was `accepted`
for as long as the dial existed.

**Removed 2026-09-04.** One parameter set, 5 km on every query. The `exact` promotion that
shipped with it was itself reverted the same day, so the known-item cases are now
`accepted` rather than protected — but the heuristic and its two failure modes are gone,
and C5 passes. An earlier version of the dial gated geo on whether the query was empty,
which denied proximity to `italian` from Chicago, a discovery query.

### The fallback chain

Browser position, then `aroundLatLngViaIP`, then `DEFAULT_POSITION`. The IP rung matters
while the permission dialog is open: the dialog has no timeout the app controls, so an
implementation that waits for an answer sends the first request — and everything typed
until the user responds — with no geo at all. `aroundLatLngViaIP` needs no permission and
resolves server-side, so it carries proximity from the first request and is upgraded if the
browser answers. The same path covers a denial and a browser with no geolocation API.

**A genuine limitation.** With `aroundLatLngViaIP` the client cannot know where Algolia
placed it — the response does not echo a resolved `aroundLatLng` — so the banner can only
say "your approximate location" without naming it, and a failed lookup is indistinguishable
from results that are simply not geo-ordered. From outside the US the ordering is
meaningless: tested from this machine, the nearest record came back 5,609 km away. The
selector is the answer to both.

### The location selector

The corpus has gaps where nobody would look for them. **Chicago holds zero records** —
nothing in the city, nothing in its market, nearest restaurant 116 km away in South Bend —
and Boston (123 km), Atlanta (167 km) and Seattle (220 km) are the same. A demo driven only
by the browser looks broken from any of those while behaving perfectly.

**Two groups became one, 2026-09-04.** The selector offered 10 markets and 9
neighbourhoods, and a market centroid duplicated one of its own neighbourhoods: the New
York pivot sits 1.2 km from Midtown West and returns 9 of the same top 10 with the same
first hit, Houston 2.8 km from Galleria / Uptown, 7 of 10. Both are inside the 5 km bucket,
where `geo` declares two positions tied, so two menu rows produced one page. The markets
group was dropped entirely.

**15 neighbourhood anchors across 9 cities.** Three constraints: a real neighbourhood
rather than the `city` fallback that covers 2,500 records; at least 10 records so the
centroid stands for a district; and separation greater than the 5 km bucket.
`assertSelectorSeparation` fails at boot on any pair closer than the bucket. The tightest
surviving pair is New York Midtown West / Harlem at 5.74 km, out of 105 pairs. Every anchor
was verified against the live index to return a restaurant 0.5 to 4.8 km away.

Two anchors were dropped on the separation rule. Houston Downtown and Midtown / Montrose
sit 2.3 km apart and shared 7 of their top 10 with the same first hit. `NE Portland`
cleared the bucket by 100 m but shares 7 of 10 with Portland Downtown and the same first
hit on `seafood`.

**Two well-covered markets cannot be represented**, which is a property of the data.
Phoenix / Scottsdale carries `neighborhood` equal to `city` on 239 of its 251 records and
its largest real-neighbourhood group holds 3. Las Vegas has 45 neighbourhood values that
are venues rather than districts — `Bellagio Hotel & Casino`, `Aria Hotel & Casino`, `The
Venetian and Palazzo` — the largest holding 9 records, all within about 2 km on the Strip,
so they would collide in one bucket even at 10 records each. Losing Scottsdale means the
Fleming's and Herb Box same-city clusters can no longer be demoed from nearby; Houston and
San Antonio still cover that story.

**What the anchors demonstrate.** On `mexican` from San Antonio, all three anchors return a
different first hit, each in the selected neighbourhood — La Fonda on Main downtown, Paloma
Blanca in Alamo Heights, Pericos in North San Antonio — while 9 of the top 10 are the same
restaurants throughout. Same results, different order, which is what a ranking criterion
does and a filter does not. On `italian` from Houston, Downtown and West Side share 0 of
their top 10. New York is the weakest of the three, with two distinct first hits from three
anchors, because Manhattan is small against a 5 km bucket.

Record counts behind each anchor are deliberately not shown in the UI: a number beside a
place in a search interface reads as a result count.

---

## 5. Front end

### One surface

The original plan paired InstantSearch with Autocomplete.js for a header dropdown. That
pairing was dropped once `react-instantsearch@7.48` was found to ship its own
`<Autocomplete>` widget. The dropdown was then dropped too, for a better reason: it showed
the same records the results page already showed, one keystroke earlier. Nothing in the
brief asks for it, and neither does the recent-searches feature that came with the widget.

The starter shipped with the dataset is pinned to Node 9 and `parcel-bundler@1.9.7`, both
unmaintained and carrying critical transitive advisories, and it exposes only the low-level
search client. From the original bundle the prototype keeps the dataset,
`resources/current-experience.png` and selected styling cues.

### Two bugs

**The whole filter panel was inert.** `facets` was declared in `<Configure>` on the
reasoning that stating the request shape in one place makes it reviewable. It is a
competing declaration: it replaces the facet list the `RefinementList` widgets build for
themselves, and Algolia then silently drops every facet filter. A refinement of
`cuisine: ["Italian"]` returned 5,000 hits instead of 890, while the sidebar still showed
correct counts. Removing it restored refinement — Italian 890, Steakhouse 486, `date night`
1,639, all matching the transform report. The curated entry points had the same root cause:
they set the refinement correctly and the refinement was being dropped.

**Three searchable facet boxes were dead**, covered in section 2.

### Images

Every `image_url` in the extract 302-redirects to the same 207×207 grey PNG, verified by
hashing five of them — identical SHA-256. The photographs are gone, so the attribute is
indexed but not retrieved, and the card renders initials on a hue derived from the objectID.
`reserve_url` still resolves, to `opentable.com/restaurant/profile/{id}/reserve`.

The curated entry points do carry photographs: thirteen Unsplash images committed to
`public/img/`, 232 kB for all thirteen, occasion banners at 480×260 and cuisine thumbnails
at 96×96. They illustrate a category rather than a record. Local files rather than hotlinks
for the same reason `image_url` is dead — a decade-old dependency on another host is what
rotted in the first place, and a demo is judged live. Each was opened and inspected at its
final crop before being committed; a URL returning HTTP 200 says nothing about whether the
photograph shows sushi.

### The result card

The composition follows the codes of the experience being replaced: a block on the left,
the name, the rating, then place, cuisine and price. Highlighting on the name is
load-bearing — with typo tolerance active a query for `naya` can return `Kaya`, and the row
only makes sense if the matched characters are marked.

The whole card opens `reserve_url` through a real anchor on the name whose hit area is
expanded over the card in CSS. A click handler calling `window.open` would have been fewer
lines and would have lost keyboard activation, middle-click, cmd-click, the context menu
and link semantics for a screen reader. Wrapping the card in an anchor is not available,
because `Book` is an anchor too and nesting them is invalid HTML. `Book` is raised above
the overlay so a booking stays its own target.

`occasions` is deliberately absent from the card. Its provenance must be stated wherever it
appears, and a disclaimer on every row is noise; it appears on the curated entry points and
its facet, each carrying the note once.

### The geo banner claimed an exactness guarantee the ranking does not give

**Removed 2026-09-04.** The banner read *"Nearest to {label} first, best rated within each
area. An exact name match ranks first wherever it is."* The second sentence was false.
`geo` sits at position 2 of `ranking`, above `words`, `attribute` and `exact`, so the
proximity bucket decides before the `exact` criterion is consulted. Measured from Denver:
`prime` puts 117067 `Prime` at rank 14 of 49 behind `Ocean Prime - Denver`, `rye` puts
105424 at rank 3 of 7, `union` puts 116815 at rank 25 of 42, and `bistro` puts 100624 at
rank 198 of 208. `test-queries.md` A1, A2 and A6 are `accepted` rather than `pass` for
exactly this reason.

The banner renders on every query, so the false sentence was permanently on screen. The
clause was deleted rather than rewritten: UI copy does not have to teach the order of the
ranking criteria, and any reformulation reopens the same surface for error. The banner now
reads *"Nearest to {label} first, best rated within each area."*

### Insights

`clickedObjectIDsAfterSearch` named `Restaurant Clicked` and
`convertedObjectIDsAfterSearch` named `Table Booked`, both carrying the same `queryID` as
the search that produced the hit, plus the position for the click. Verified by capturing the
built payloads. `viewedObjectIDs` comes free from the middleware and carries no `queryID`,
which is correct — Algolia has no after-search variant of a view event.

The Insights client uses the search key. Insights is a separate endpoint from indexing and
needs no write permission; a write key here would land in the browser bundle.

The `userToken` is an anonymous value in `localStorage` with `useCookie: false`, so the demo
sets no cookie nobody consented to. This is demo-grade. In production that token is where
consent handling belongs — none until the visitor agrees, and the account identifier once
there is one so events survive across devices.

---

## 6. Deployment

Vercel builds from `main` through the Git integration. Node comes from `engines.node` at
`24.x` in `package.json`, which is the only repo-side override Vercel reads — it does not
read `.nvmrc`, which exists for local shells. Netlify does read `.nvmrc`.

Three environment variables are set in Project Settings, and only three:
`VITE_ALGOLIA_APP_ID`, `VITE_ALGOLIA_SEARCH_API_KEY`, `VITE_ALGOLIA_INDEX_NAME`. Vercel
does not read `.env`. `ALGOLIA_WRITE_API_KEY` is absent from the deployment.

Vercel asked for an explicit choice on the search key, because the name looks like a
credential and `VITE_` publishes it. It was allowed through as a public `config` value only
after its permissions were verified rather than assumed: `PUT /settings`, an object `POST`
and an index `DELETE` all return **403**, while search and `listIndexes` return 200. The
built bundle was then checked directly and anonymously, and the write key appears in none
of the served assets.

The production alias is `https://opentable-demo-anthyous-projects.vercel.app`.
`opentable-demo.vercel.app` is a different project belonging to someone else.
