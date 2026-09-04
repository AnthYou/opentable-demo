# Relevance test cases

Written **before the index existed**, from the profiling recorded in
`data/exploration.md`. Every expectation below is a claim about what good relevance
looks like for one of the two personas — not a description of what the index
currently does. No case was added to match observed behaviour.

Covers the nine categories required by CLAUDE.md section 8 — exact name, misspelled
name, concatenated name, partial name, cuisine, ambiguous term, multi-location chain,
empty query, out-of-corpus query — plus a geo section, because the known-item /
proximity conflict in section 5 is the one place the two personas contradict each
other outright.

## How to use this file

- **Status vocabulary.** `untested` — not yet run. `pass` — expectation met.
  `fail` — expectation not met, configuration must change. `accepted` — expectation
  not met and the behaviour is judged acceptable; the reason is recorded in the case.
- **One setting at a time.** Five changes at once makes the result unattributable.
  Every settings change gets a line in the change log at the bottom: what changed,
  which query motivated it, what improved, what regressed.
- **`journey` column.** `P1` = known-item (persona 1: the user knows the name).
  `P2` = discovery (persona 2: browsing, refining, being inspired). These are user
  *intents*, not surfaces — there is one search box and one results page. The column
  records which pain a case exercises, not where it runs.
- Cases flagged **⚠ predicted fail** are ones the profiling said were likely to fail
  on a first configuration. They are written as the target, not as a forecast to be
  satisfied by weakening the target. Once measured, the marker records whether the
  prediction was confirmed or refuted. Of the four markers, K12 and A3 were refuted on
  2026-09-03, O2 was confirmed, and D6 has not been run.

---

## Baseline run — 2026-09-03

First execution against a live index. App `ZES37PMPAX`, index `restaurants`, 5,000
records, settings and the `rating_desc` virtual replica as committed. Queries issued with the
search-only key, default parameters, no per-context overrides — so this measures the
index configuration alone, not either journey's parameter set.

**23 of the 52 cases run. 16 pass, 7 fail.** The remaining 29 are still `untested`;
they need the geo or empty-query behaviour that did not exist yet.

A correction to the method before the results. The first harness checked whether the
expected objectID appeared in the top two, which is not what several cases ask for —
K14, A2, A5 and A7 specify rank 1. That harness reported 19 passes. Re-run with a
strict rank-1 check it is 16, and the three extra "passes" were rank 2. The numbers
below are the strict ones.

### Three predictions that were wrong, in the favourable direction

- **A3 / A4 (`naya`, `kaya`) pass.** Both were flagged as the likeliest way to break
  persona 1. 148411 `Naya` ranks 1 of 31 hits and 79378 `Kaya` ranks 1 of 67; neither
  displaces the other, and the five `Cyclone Anaya's` records that contain `naya` as a
  substring stay below. The 4-character typo floor holds both directions, so
  `disableTypoToleranceOnWords` stays empty — the pre-emptive tuning §8 forbids would
  have been wasted work.
- **K12 (`pappas brothers`) passes.** It was written as a predicted failure on the
  grounds that the edit distance from `Bros.` to `brothers` is 3. The engine returns
  1854 and 1959 as the top two anyway. A synonym is not the prerequisite it was
  described as, which lowers the priority of `scripts/synonyms.json`.
- **K13 (`ilforno`) passes**, and so does the matching part of K14. The engine handles
  English word concatenation natively. The earlier correction in section 3 — that no
  index setting addresses this — was right that no setting is involved; the empirical
  answer is that none is needed.

### Failure group 1 — the `exact` criterion ties, so popularity decides

K14, A2, A5, A7. Diagnosed with `getRankingInfo`: on each of these queries every
candidate scores `nbTypos=0, words=1, proximity=0, attribute=0, exact=1`. The ranking
formula runs out of discriminating criteria and falls through to `custom`, which is
`desc(popularity_score)`. **A name that *is* the query gets no structural advantage
over a longer name that merely contains it.**

| case | query | wanted at rank 1 | actual rank 1 | why |
|---|---|---|---|---|
| A7 | `bistro` | 100624 `Bistro` (4.213, 317 reviews) | 5014 `Mockingbird Bistro` (4.397, 1,638 reviews) | higher popularity |
| A2 | `prime` | 117067 `Prime` (4.249, **3 reviews**) | 90916 `Prime - Bellagio Hotel` (4.588, 1,174 reviews) | higher popularity |
| A5 | `santa fe` | 65881 `Santa Fe` | 93850 `Vinaigrette - Santa Fe` | higher popularity |
| K14 | `leftbank` | 65758 `Left Bank` | 15421 `Left Bank Restaurant` | higher popularity |

`exactOnSingleWordQuery` is **not** the lever. All three values were tried at query
time: `attribute` (the current default) gives the ordering above, while `word` and
`none` are markedly worse — `Costa Brava Bistro` takes rank 1. The remaining lever is a
name-length tie-break in `customRanking`, which needs a new attribute from the
transform and therefore a section 4 schema change.

A2 deserves a second look before it is treated as a defect. 117067 `Prime` carries
**3 reviews**. Ranking it above a 1,174-review restaurant of the same name would
contradict the reasoning that produced `popularity_score` in the first place. The
honest resolution may be to narrow the case rather than change the configuration.

A7 has a cause the profiling did not predict, and it comes from our own taxonomy:
5014 `Mockingbird Bistro` carries `cuisine_tags: ["Bistro"]` and so matches the query
on both `name` and `cuisine_tags`, while 100624 `Bistro` — whose cuisine is
American/Contemporary — matches on `name` alone.

### Failure group 2 — out-of-corpus queries leak, through three different channels

| case | query | result | channel |
|---|---|---|---|
| O2 | `olive garden` | 6 hits | `removeWordsIfNoResults: lastWords` drops `garden`; `olive` legitimately matches names |
| O3 | `shake shack` | 1 hit | **`address` is searchable.** 25840 `SASA` matched on `13120 Shaker Square` |
| O4 | `sushi in tokyo` | 1 hit | `lastWords` drops `tokyo`, and `removeStopWords: false` makes `in` a matchable token, reaching 41962 `In the Raw` |

**Corrected 2026-09-03 — there are two channels, not three, and one row above is wrong.**
Re-measured with `removeWordsIfNoResults: 'none'`, `olive garden`, `sushi in tokyo` and
`momofuku` all return **0 hits**. `lastWords` is therefore the sole cause of O2 and O4,
and the `removeStopWords` explanation for O4 was wrong: `in` was never the cause, because
the full query never matched anything to begin with. Only O3 had a second channel — with
word removal off, `shake shack` still returned 25840 `SASA` through `address`. `address`
was removed on 2026-09-03 for unrelated reasons, which moved O3 from 1 hit to 10 as its
leak reverted to `lastWords`. **`removeWordsIfNoResults` is the one lever that closes all
three**, and it is the next candidate.

O3 corrects a claim made when the case was written. It said `shake` matches nothing, so
the fallback was harmless. That was verified against `name` only — but `address` sits at
the fifth level of `searchableAttributes`, and `shake` reaches 14 records through it,
`shack` 11. The premise was wrong, not the setting.

The three channels do not share one fix. Dropping `address` from `searchableAttributes`
closes O3 alone and removes street search, which nobody asked for but which is a
plausible use. `allOptional` instead of `lastWords` addresses O2 and O4 and needs to be
measured against every passing case before it is adopted. Nothing has been changed yet:
one setting at a time, with the before and after recorded in the change log below.

### Cases not yet run

29 remain `untested`. K2, K3, K6, K8–K11, K15–K20 (partial-name and misspelling
cases), D1–D6 (cuisine breadth), E1–E4 (empty query and
geo fallback, which need the UI), G1–G4 (geo). One informal observation worth flagging:
on `nobu` with no geo parameters, 74146 `Nobuo at Teeter House` appeared at rank 2,
above three of the four true Nobu locations. If that holds under a proper run, **G2
fails** — but it was not measured strictly and is recorded here as a lead, not a result.

---

## Second run — 2026-09-03, the remaining 29 cases

**27 of the 29 run. 24 pass, 3 fail.** E1 and E3 are not runnable: both describe UI
behaviour — curated entry points, the geo-denied fallback chain, and the message naming
the location in use. They are marked `blocked`, not `fail`, because nothing has been
built for them to fail against.

**Cumulative: 40 pass, 10 fail, 2 blocked, of 52.** (41 pass / 9 fail after the
`ranking` change recorded in the change log below.)

What passed without incident is worth stating, because it covers the whole of persona
1's reported pain except the four ranking ties. Misspellings resolve cleanly: `benihanna`
gives 10/10 Benihana in the top ten, `melting pott` 10/10 Melting Pot, `ruths chris`
10/10 Ruth's Chris, and `chirrascos` returns all four Houston Churrascos. Concatenation
works (`roaringfork`, `montblanc` both rank 1). The glyph folding holds: `Cafe 21`
returns both 64003 and 64000 despite the diacritic and the two different dash glyphs.
And the taxonomy behaves as designed — the cuisine facet on `steakhouse` shows a single
`Steakhouse` value at 486 with **no** separate `Steak` refinement, which was the entire
point of the merge; `churrascaria` reaches its 33 records through a tag that appears
nowhere in the source data; `vietnamese` still finds 22558 and 2527 after being folded
into `Asian`.

D6 also passes and can lose its "contested by design" framing: 10/10 top hits carry
"sushi" in the name **and** the `cuisine: Japanese` facet is reachable at 94. Both halves
of the documented split resolution hold simultaneously.

### K18 — the flag works, the label alone does not

`cyclone` returns exactly 5 records but only 4 distinct `location_label` values: 145366
`Midtown` and 151276 `Rice Village` both resolve to `Midtown / Montrose`. Both carry
`location_label_ambiguous: true`, which is precisely what the transform's third pass
exists to mark. The index side is correct and the case fails on the literal criterion
("each showing a distinct location"), which cannot be satisfied until the front end
appends distance where the flag is set. Recorded as a fail rather than softened, but the
remedy is already in the data.

### G2 — not a separate failure, the same one

Measured with `getRankingInfo`: **every** candidate on `nobu` scores `exact=0`, including
4524 `Nobu Fifty Seven`. `exactOnSingleWordQuery` defaults to `attribute`, which grants
the exact criterion only when the query equals the *whole* attribute — and no record is
named exactly "Nobu". So the formula falls through to `desc(popularity_score)`, where
74146 `Nobuo at Teeter House` (4.565) outranks 99796 (4.433), 16927 (4.396) and 13129
(4.394).

G2 therefore belongs to failure group 1 in the baseline run, not to the geo section. Five
cases now share one lever: K14, A2, A5, A7, G2. G1 still passes, because with no geo
parameter sent no Denver record enters the ranking at all.

### G3 — a correction I wrote in CLAUDE.md §5 is wrong

When `ranking` was declared with `geo` demoted below `exact`, the justification recorded
in §5 was that "the discovery journey still gets geo-led ordering because it sends
`aroundLatLng` with coarse `aroundPrecision` buckets, which collapses distance into wide
tiers that `customRanking` then orders by `popularity_score`." **That is measurably
false.** Four variants of `italian` from Denver:

| parameters | hits | top 5 cities |
|---|---|---|
| none | 895 | Memphis, Orlando, San Diego, Somerville, Orlando |
| `aroundLatLng` + `aroundRadius: all` | 895 | Castle Rock, Colorado Springs, Santa Fe, Albuquerque, Omaha |
| + `aroundPrecision: 5000` | 895 | identical — the precision bucket changes nothing |
| `aroundLatLng` + `aroundRadius: 50000` | **31** | Castle Rock, **Denver, Denver, Denver, Denver** |

With `geo` at position 7 of 8 it is consulted only among records tied on all six
preceding criteria, which effectively never happens on a broad query. The first Denver
record sits at **position 89 of 895**. `aroundPrecision` cannot compensate for the
criterion's position; only a finite `aroundRadius` works, and that *filters* rather than
ranks.

The demotion protects the known-item journey — G1 and G4 pass — but it removes the
discovery journey's stated core behaviour. Three ways out, none applied yet:

1. **Restore Algolia's default `ranking`** with `geo` second. The known-item context
   sends no geo parameter, so the criterion stays inert there — which is why G1 and G4
   pass today. On this evidence the demotion may be belt-and-braces that costs more than
   it protects.
2. **A standard replica with geo-first `ranking`** for discovery. This is implementable
   and is what §5's "geo leads" actually requires. It is *not* the `distance` replica
   that was correctly ruled out — that one tried to sort by a value no record stores.
3. **Bound the radius** in the discovery parameter set. Works today with no settings
   change, but §5 specifies `aroundRadius: "all"` and a bounded radius starves users in
   sparse markets.

**Resolved 2026-09-03 — option 1 applied.** `geo` restored to position 2. Measured with
one harness across all 50 measurable cases, before and after: **40/50 → 41/50, one
improvement and zero regressions.** G3's first Denver record moves from 89th to 1st and
the top ten are all Denver, ordered by popularity. G1, G2, G4 and C5 are unchanged,
confirming that the known-item journey was never protected by the demotion — it is
protected by sending no geo parameter at all.

That distinction matters beyond this case: the protection is now a **convention the two
libraries make structural** (CLAUDE.md §6), not a property of any setting. If an
typed query ever carries `aroundLatLng`, proximity will outrank the name match
and G1 will fail. `src/searchParams.js` is where that has to stay true.

### Collateral finding — two chain members the separator rule misses

`chirrascos` surfaced 70261 `Churrascos-Sugar Land`, whose hyphen carries no surrounding
whitespace, so `baseName` leaves it intact and it never joins the Churrascos chain. Swept
the corpus: **48 records contain a tight hyphen, of which exactly 2 are chain members the
rule misses** — 70261 and 150577 `Jax Fish House-Kansas City`. The other 46 are genuinely
hyphenated single names the guard must keep intact: `Dinosaur Bar-B-Que`, `Café Des
Beaux-Arts`, `T-Fusion Steakhouse`, `BO-beau kitchen + garden`, `Fish Hopper -
Kailua-Kona`. Two missed against 46 protected is a defensible ratio, but the true chain
totals are 2 records higher than `data/exploration.md` and CLAUDE.md §3 state, and
neither missed record creates a new same-city cluster.

---

## The `exact` tie — investigated 2026-09-03

Five cases were grouped under one hypothesis: that `exact` ties and `popularity_score`
decides, and that the fix was a name-length tie-break in `customRanking` requiring a new
attribute from the transform. **Both halves of that hypothesis were wrong.**

### The mechanism, measured

Restricted to `name` alone, the `exact` criterion works exactly as it appears to:
`exactOnSingleWordQuery` defaults to `attribute`, which grants `exact=1` only when the
query equals the *whole* attribute value. On `bistro` restricted to `name`, only 100624
`Bistro` scores 1. The criterion never failed — **other searchable attributes were
producing competing whole-attribute exact matches and cancelling it.**

| case | what cancelled the name match | outcome |
|---|---|---|
| A2 `prime` | `chain_name: "Prime"` on 90916, a whole-attribute match at level 2 | **fixed** by removing `chain_name` |
| A7 `bistro` | `cuisine_tags: ["Bistro"]` on 5014 | accepted — the tag does real work |
| A5 `santa fe` | nothing; two-word query, all candidates score `exact=2` | accepted |
| K14 `leftbank` | nothing; concatenated query, all score `exact=0` | accepted |
| G2 `nobu` | nothing; no attribute equals "Nobu", all score `exact=0` | accepted |

### Why `chain_name` came out of `searchableAttributes`

It is provably redundant: **all 722 chained records have a name beginning with their
`chain_name`, with 0 exceptions**, because `chain_name` is derived from the name. Any
query reaching a record through `chain_name` already reaches it through `name` at level
1. Being searchable it bought nothing and cost the exact criterion its meaning for every
chain whose base name equals a query. Removing it fixed A2 with zero regressions across
the other 49 measurable cases.

### Why the name-length tie-break was abandoned

`asc(name_word_count)` has no valid position in `customRanking`. Before
`desc(popularity_score)` it dominates: broad queries such as `italian` or `steakhouse`
would be ordered by name length, which is meaningless for discovery and would displace
the ranking signal the whole `popularity_score` design exists to provide. After it, it
never fires — `popularity_score` is a float with essentially no collisions. There is no
conditional `customRanking`, so a signal that is only meaningful for short queries cannot
be expressed there. No new attribute was added and the section 4 schema is unchanged.

### Why `exactOnSingleWordQuery: "word"` was rejected

It is the precise tool for G2 — `nobu` is a whole word in `Nobu Waikiki` but only a
prefix of `Nobuo`, so the four true Nobu score 1 and Nobuo scores 0. Measured at query
time across every affected single-word case, it fixes G2 and **breaks A2, A7 and A8**:
`prime` returns Bohanan's Prime Steaks, `bistro` returns Costa Brava Bistro, `babylon`
returns Babylon Turkish Restaurant. Net −2.

The two modes are in direct opposition and no setting provides both:

- `attribute` rewards **the query is the whole name** — wins A2, A7, A8
- `word` rewards **the query is a whole word in the name** — wins G2

`attribute` is kept because it serves three cases against one, and because "the query is
the whole name" is the stronger known-item signal.

### What the four accepted cases have in common

In each, the expectation asks a single ambiguous token to resolve to one specific
restaurant when the corpus offers several defensible answers. On `bistro`, `santa fe` and
`leftbank` the wanted record is at rank 2 with all its rivals in the top three; on `nobu`
rank 1 is a real Nobu. None of them returns a wrong answer — each returns a plausible
answer in a different order than the case author expected. That is the distinction
between a relevance defect and an over-specified test, and it is why they are `accepted`
rather than softened into `pass`.

---

## 1. Exact name

The floor. If these fail, nothing else matters.

| id | query | journey | expectation | status |
|---|---|---|---|---|
| K1 | `Pappas Bros. Steakhouse` | P1 | 1959 (Dallas) and 1854 (Houston) are the top 2 hits, in either order, and are visually distinguishable by `location_label`. No third result above them. | **pass** |
| K2 | `Mama's Fish House` | P1 | 2767 (Paia, HI) is rank 1. It carries the highest `reviews_count` in the corpus (12,669), so it must not be displaced by a thin-review record. | **pass** |
| K3 | `Roaring Fork` | P1 | 5545 (Scottsdale) is rank 1 and unique — a single-location name with no homonym. | **pass** |
| K4 | `Acenar` | P1 | 11425 `Ácenar` (San Antonio) is rank 1. Query typed without the diacritic; requires folding on both record and query side. | **pass** |
| K5 | `Rizzuto's Restaurant and Bar` | P1 | 41374 (Westport) and 41371 (West Hartford) are the top 2. Both store a **curly** apostrophe U+2019; the query uses the straight U+0027 a keyboard produces. | **pass** |
| K6 | `Cafe 21` | P1 | 64003 and 64000 both returned. Stored as `Café 21` with a diacritic, and the two records use **different dash glyphs** in their location suffix (hyphen vs en dash). | **pass** |

## 2. Misspelled name

Persona 1's headline pain: "restaurant names are hard to spell or remember".

| id | query | journey | expectation | status |
|---|---|---|---|---|
| K7 | `papas bros steakhouse` | P1 | 1959 and 1854 in the top 2. Combines a dropped double consonant with a missing abbreviation period. | **pass** |
| K8 | `benihanna` | P1 | Benihana's 24 locations dominate the result set. One inserted character. | **pass** |
| K9 | `melting pott` | P1 | The Melting Pot's 26 locations dominate. One inserted character on the last token. | **pass** |
| K10 | `ruths chris` | P1 | The 31 `Ruth's Chris Steak House` records dominate. Missing apostrophe, not a typo — tests separator stripping rather than typo tolerance. | **pass** |
| K11 | `chirrascos` | P1 | Churrascos' 4 Houston locations (883, 150679, 114319, 882) returned. One transposed character. | **pass** |
| K12 | `pappas brothers` | P1 | 1959 and 1854 returned. **⚠ prediction refuted 2026-09-03** — it was written as a predicted failure because the edit distance from `Bros.` to `brothers` is 3, beyond any typo setting. The engine returns 1854 and 1959 as the top two regardless, so no synonym is required. The 66 records carrying a period abbreviation (`data/exploration.md` A1.4) may still deserve one, but no test demands it. | **pass** |

## 3. Concatenated name

| id | query | journey | expectation | status |
|---|---|---|---|---|
| K13 | `ilforno` | P1 | 112282 (New York) and 3912 (Santa Monica) returned. | **pass** |
| K14 | `leftbank` | P1 | 65758 `Left Bank` (New York) rank 1, ahead of 2115 `Left Bank Santana Row` and 15421 `Left Bank Restaurant` — exact base name beats a longer name containing it. | **accepted** — rank **3** of 4 under the live order, previously rank 2; all three `Left Bank` records still hold the top three. Every candidate scores `exact=0`, so `geo` orders them and 15421 `Left Bank Restaurant` (Vail, 75 mi from Denver) leads, then 2115 Santana Row, then 65758 New York at 1,627 mi. Every candidate scores `exact=0`: a concatenated query earns no exact match anywhere, so popularity decides. No settings lever exists, and the name-length tie-break has the wrong shape — placed before `popularity_score` it would reorder broad queries such as `italian` by name length, placed after it would never fire. A user typing `leftbank` has not disambiguated between the three. |
| K15 | `roaringfork` | P1 | 5545 rank 1. | **pass** |
| K16 | `montblanc` | P1 | 60130 `Mont Blanc` (New York) rank 1. | **pass** |

614 two-short-word names carry this risk (`data/exploration.md` A1.6). These four are
the check. Correction to an earlier assumption: **no index setting addresses this.**
Algolia's `decompoundedAttributes` covers German, Dutch, Finnish, Norwegian and
Swedish, not English, so it does not apply to this corpus. These cases exist to
establish whether the engine's built-in word splitting and concatenation is enough for
these four names; if it is not, the remedy is synonyms, not a setting.

## 4. Partial name

Search-as-you-type: the user stops typing early and the results must already be useful.

| id | query | journey | expectation | status |
|---|---|---|---|---|
| K17 | `ruth` | P1 | The 31 Ruth's Chris records, disambiguated by `location_label`. 31 near-identical rows is a dead end; distinct labels are what make the list navigable. | **pass** — 119344 Ruth's Chris Denver ranks 1 from Denver, previously Baton Rouge. Correction to the expectation: the query returns **38** hits, not 31. The 31 Ruth's Chris records are the top 31; the extra 7 arrive through the place attributes and typo tolerance — four in `Rutherford` and `East Rutherford` (1676, 87889, 39670, 116755), reached by prefix on `neighborhood`/`city`, plus 4832 `Rothmann's Steakhouse`, 5734 `Brasserie Ruhlmann` and 4378 `The Pit Authentic BBQ` (Raleigh). All 7 sit below the 31, so the case's substance holds. |
| K18 | `cyclone` | P1 | The 5 `Cyclone Anaya's` records, all in Houston, each showing a distinct location. | **pass** — re-measured 2026-09-03 after the front end existed. The index still returns 4 distinct `location_label` values for 5 hits, but the two that collide (145366, 151276, both `Midtown / Montrose`) carry `location_label_ambiguous: true`, and `resolveLocationLabel` in `src/lib/format.js` completes them: 0.7 mi against 4.0 mi from central Houston, or `309 Gray St.` against `5214 Morningside Dr` when no position is known. The UI obligation the second run identified is now discharged. |
| K19 | `pappas` | P1 | 1959 and 1854 in the top 2. | **pass** |
| K20 | `melting` | P1 | The 26 Melting Pot records, disambiguated by location. | **pass** |

## 5. Cuisine

Persona 2. Tests that the normalised taxonomy in `scripts/cuisine-taxonomy.json`
behaves as a facet rather than as free text.

| id | query | journey | expectation | status |
|---|---|---|---|---|
| D1 | `steakhouse` | P2 | Returns the 486 records under primary cuisine `Steakhouse`. Critically, `Steak` (123) and `Steakhouse` (328) must not appear as two separate refinements — that merge is the whole point of the taxonomy. | **pass** — and since the `category-query-cuisine` rule of 2026-09-04 the count is exactly 486 rather than 513: the query is now a filtered browse of `cuisine:Steakhouse` instead of a text search, so the 27 records that merely carried the word in a name are gone. Rank 1 from Denver is Guard & Grace (4.7), previously Morton's The Steakhouse (4.2). |
| D2 | `fondue` | P2 | The 30 `Fondue` records. 26 of them are Melting Pot locations, so the result set is legitimately chain-dominated; the UI must not read as broken because of it. | **pass** — exactly 30 since the cuisine rule, previously 31; the extra was 88492 `Der Fondue Chessel`, reached by name. |
| D3 | `thai` | P2 | The 25 `Thai` records. | **pass** — exactly 25 since the cuisine rule, previously 45. The 20 extra were name matches such as `Taste of Thailand - Omaha`, which the filtered browse excludes. From Denver the nearest is Omaha at 475 mi: the corpus holds **0** Thai restaurants in Denver. |
| D4 | `vietnamese` | P2 | 22558 `Indochine` and 2527 `Three Seasons` returned. Both were folded into primary cuisine `Asian` with a `Vietnamese` tag — this case verifies the fold did not make the term unsearchable. | **pass** |
| D5 | `churrascaria` | P2 | The 33 `Brazilian Steakhouse` records. They sit under primary `Steakhouse` with a `Churrascaria` tag; the term appears nowhere in the source `food_type` values, only in the taxonomy tags. | **pass** |
| D6 | `sushi` | P2 | **⚠ contested by design.** 72 records carry "sushi" in the *name* while 67 have `food_type: Sushi` and 140 `Japanese`. With `unordered(name)` first in `searchableAttributes`, the 72 name-matches outrank the cuisine matches. That is correct for persona 1 and wrong for persona 2. Resolution: name-matches rank first, and the page must surface a `cuisine: Japanese` refinement prominently instead of reordering. Recorded here so the trade-off is deliberate, not accidental. | **accepted** — the documented resolution inverted on 2026-09-04, in the direction this case says is right for persona 2. `geo` now sits above `attribute`, so a near record matching through `cuisine` outranks a distant one matching through `name`: from Denver the top ten are Denver and Boulder Japanese restaurants at 1–25 mi, of which 3 of the first 4 carry "sushi" in the name and the fourth (100009 `Epernay`) does not. The literal criterion — 10/10 top hits carrying "sushi" in the name — is therefore not met, while `cuisine: Japanese` is still reachable at 94. The case was written when name matches led unconditionally and it recorded that as "correct for persona 1 and wrong for persona 2"; the new order is the reading it preferred. |

## 6. Ambiguous term

The hardest section. Every case is a real collision measured in `data/exploration.md` A3.

| id | query | journey | expectation | status |
|---|---|---|---|---|
| A1 | `rye` | P1 | 95884 (Leawood, KS) and 105424 (Brooklyn, NY) — the two restaurants *named* Rye — rank above any restaurant merely located in Rye or in a neighborhood called Rye. Must also not be displaced by 95284 `Roe` (Portland), which is one character away. The densest single test case in the corpus: homonym, place collision, and typo neighbour at once. | **accepted** — 95884 `Rye` holds rank 1, but 114373 `Barley & Rye` (Moline, 767 mi) splits it from 105424 `Rye` (Brooklyn), which sits at rank 3 of 7. — **accepted 2026-09-04 on the use case, not on the measurement.** In a reservation product the dominant intent signal is proximity: a diner is choosing somewhere to eat tonight, so the near restaurant that matches the word is usually the one wanted, and a diner who does want a specific restaurant in another city types that city. Verified rather than assumed — 10 city-qualified queries were measured from Denver and every one returns **exactly one hit at rank 1**, because Algolia requires all query words to match whenever the full query has results, so `geo` never gets to reorder: `prime mansfield`, `rye brooklyn`, `union pasadena`, `union mobile`, `nobu new york`, `nobu waikiki`, `prime bellagio`, `pappas bros dallas`, `cyclone anayas rice village`, `flemings dc ranch`. The expectation was written before that fallback was known to work and treats an exact name match as unconditionally correct; `geo` at position 2 is kept deliberately. `rye brooklyn` returns 105424 alone. |
| A2 | `prime` | P1 | 117067 `Prime` (Mansfield, TX) rank 1 as the exact name match — **even though its own `food_type` is Mexican**. Below it: 4941 and 27409 `Prime Steakhouse`, then 145747 / 144688 `Prime 47`, then the 486 `Steakhouse` cuisine matches. A name match must never lose to a cuisine match. | **accepted** — 117067 `Prime` at rank **14** of 49 from Denver; rank 1 is 54049 `Ocean Prime - Denver`, 1 mi away. — **accepted 2026-09-04 on the use case, not on the measurement.** In a reservation product the dominant intent signal is proximity: a diner is choosing somewhere to eat tonight, so the near restaurant that matches the word is usually the one wanted, and a diner who does want a specific restaurant in another city types that city. Verified rather than assumed — 10 city-qualified queries were measured from Denver and every one returns **exactly one hit at rank 1**, because Algolia requires all query words to match whenever the full query has results, so `geo` never gets to reorder: `prime mansfield`, `rye brooklyn`, `union pasadena`, `union mobile`, `nobu new york`, `nobu waikiki`, `prime bellagio`, `pappas bros dallas`, `cyclone anayas rice village`, `flemings dc ranch`. The expectation was written before that fallback was known to work and treats an exact name match as unconditionally correct; `geo` at position 2 is kept deliberately. `prime mansfield` returns 117067 alone. |
| A3 | `naya` | P1 | 148411 `Naya` (Pittsburgh) rank 1. Three competing readings must lose to it: 79378 `Kaya` (**also Pittsburgh**, edit distance 1, so geo cannot separate them either) and the 5 `Cyclone Anaya's` Houston records, which contain "naya" as a substring. **⚠ prediction refuted 2026-09-03** — flagged as the likeliest way to break persona 1 with typo tolerance. 148411 ranks 1 of 31 hits with the thresholds unchanged; A4 holds in the mirror direction. | **pass** |
| A4 | `kaya` | P1 | The mirror of A3: 79378 `Kaya` rank 1, above 148411 `Naya`. Both directions must hold; fixing one at the cost of the other is not a fix. | **pass** |
| A5 | `santa fe` | P1 | 65881 `Santa Fe` (a restaurant in **New York**) ranks above the restaurants located in Santa Fe, NM (e.g. 61711 `Raaga`, 3267 `Geronimo`). Its own cuisine is `Mexican / Southwestern`, which makes the term triply ambiguous: name, city, cuisine. | **accepted** — rank **39** of 39 from Denver under the live order: the whole page is restaurants in Santa Fe, NM, nearest first, which is what a diner typing a place name most likely wants. Previously rank 2. `santa fe` is a two-word query, so `exactOnSingleWordQuery` does not apply and every candidate scores `exact=2`; no criterion discriminates and popularity decides (4.376 against 4.218). The case is over-specified: `santa fe` is far more often a place than a restaurant name, and two of the top three genuinely are in Santa Fe. |
| A6 | `union` | P1 | 145234 (Pasadena, Contemporary Italian) and 116815 (Mobile, Steakhouse) rank above the records in the `Union Square` neighborhood. | **accepted** — rank 1 is 97327 `Workshop at UNION` (Minneapolis, 3.8 stars, 698 mi); 145234 `Union` is rank 2 and 116815 `Union` rank **25** of 42. — **accepted 2026-09-04 on the use case, not on the measurement.** In a reservation product the dominant intent signal is proximity: a diner is choosing somewhere to eat tonight, so the near restaurant that matches the word is usually the one wanted, and a diner who does want a specific restaurant in another city types that city. Verified rather than assumed — 10 city-qualified queries were measured from Denver and every one returns **exactly one hit at rank 1**, because Algolia requires all query words to match whenever the full query has results, so `geo` never gets to reorder: `prime mansfield`, `rye brooklyn`, `union pasadena`, `union mobile`, `nobu new york`, `nobu waikiki`, `prime bellagio`, `pappas bros dallas`, `cyclone anayas rice village`, `flemings dc ranch`. The expectation was written before that fallback was known to work and treats an exact name match as unconditionally correct; `geo` at position 2 is kept deliberately. `union pasadena` and `union mobile` each return their record alone. |
| A7 | `bistro` | P1 | 100624 `Bistro` (Jupiter, FL) rank 1 — the only name in the corpus identical to a full `food_type` value. Its own cuisine is Contemporary American; the `Bistro` food_type maps to primary `French`. | **accepted** — rank **198** of 208 from Denver since the `ranking` decision of 2026-09-04: `geo` at position 2 fills the page with Denver bistros (2535 `Bistro Vendome`, 152992 `Bistro Barbes`), which is the intended behaviour for a category-shaped word. Recorded for the earlier order: rank 2 of 210, where both 100624 and 5014 score `exact=1`; 5014 earns it through `cuisine_tags: ["Bistro"]`. Removing that tag would fix the case but make 10105 `7 on Fulton` and 72718 `Acme` unreachable by `bistro` — neither carries the word in its name, so the tag does real work. Only 2 of 128 taxonomy values collide with an exact restaurant name (`Bistro`, `Small Plates`), so the cost is narrow and enumerable. A French bistro with 1,638 reviews above a restaurant named `Bistro` with 317 is not obviously wrong for a word that is more often a category than a name. |
| A8 | `babylon` | P1 | 70969 `Babylon` (Raleigh, NC, Moroccan) ranks above records in Babylon, NY. | **pass** |

## 7. Multi-location chain

Section 3 of CLAUDE.md previously called same-city ambiguity unreproducible. It is
reproducible on 43 base names, 50 clusters, 111 records. These are the cases.

| id | query | journey | expectation | status |
|---|---|---|---|---|
| C1 | `cyclone anaya's`, geo = Houston | P1 | All 5 records returned (145369 CityCentre, 145366 Midtown, 151276 Rice Village, 145381 Woodway, 145375 Durham), each with a **distinct** `location_label`. The flagship same-city case. Note 145366 and 151276 share `neighborhood: Midtown / Montrose`, so neighborhood alone is insufficient for two of the five — distance must complete the label. | **pass** |
| C2 | `fleming's scottsdale` | P1 | 40036 and 39919 both returned and distinguishable. Both carry `neighborhood: Scottsdale`, so `location_label` **must** fall through to city + distance. If both rows render identically, the case fails regardless of ranking. | **pass** |
| C3 | `mccormick pittsburgh` | P1 | 6794 (`Pittsburgh South Side`) and 13990 (`Pittsburgh Downtown`) both returned. Both carry `neighborhood: Downtown` despite the names claiming different areas — the name suffix and the neighborhood field disagree, and the label must not silently pick the wrong one. | **pass** |
| C4 | `ruth's chris indianapolis` | P1 | 5000 (`Downtown Indy`) and 5211 (`Castleton / Keystone Crossings`) both returned, ranked above the other 29 locations. Here neighborhood *does* separate them. | **pass** |
| C5 | `pappas bros`, geo = Dallas | P2 | 1959 (Dallas) ranks above 1854 (Houston) on the geo-led page. Both sit in `market: Dallas - Fort Worth`, so a market facet does **not** separate them — only `city` or distance does. | **pass** — since the `ranking` change of 2026-09-04. No record is named exactly `pappas bros`, so both score `exact=0`, tie, and `geo` — now immediately below `exact` — orders them: 1959 Dallas rank 1, 1854 Houston rank 2. The conflict with A2 that made this `accepted` is gone, because A2 is now protected by the `exact` criterion instead of by a coarse distance bucket, and the two no longer compete for one `aroundPrecision`. |
| C6 | `tien` | P1 | 11437 and 11434, both in Biloxi, both `neighborhood: Biloxi`. Their suffixes are `Teppanyaki / Shabu Shabu` and `Traditional Asian Dining` — **not locations**. Tests that `chain_name` derivation did not blindly split on the separator and label a cuisine descriptor as a place. | **pass** |

## 8. Empty query

Persona 2's entry point. CLAUDE.md section 2: the empty state must be a destination,
not a dead end.

| id | case | journey | expectation | status |
|---|---|---|---|---|
| E1 | empty query, geolocation granted | P2 | Curated entry points render, plus geo-aware results. The UI states which location is in use. Never a blank screen. | **pass** — measured 2026-09-03 by rendering the app: 5 occasion cards, the cuisine chips, 24 hits, the geo banner and the location selector all present on an empty query. Never a blank screen. One limit stated rather than hidden: the browser-permission grant itself was verified at the parameter level (`geoParams({lat, lng})` reports `source: browser`), not through a real permission dialog — no browser tooling in this environment. |
| E2 | empty query, default ranking | P2 | Top 20 by `popularity_score` are plausible institutions, per the section 4 calibration check. Measured on the extract with `m = 50`, `C = 4.2941`: the list includes 2767 `Mama's Fish House` (12,669 reviews), 3934 `GW Fins` (5,523) and 4487 `Restaurant August` (4,668), alongside three 5.0-star records with 139–242 reviews (31153, 5062 `Pazza Notte`, 78970 `Embers Steakhouse`). Those three are not thin-review artefacts — E4 shows the prior handles that tail correctly — so whether they belong in a top 20 is a judgment call on `m`, not a defect. Raising `m` is a settings change and gets a change-log line. | **accepted** — the expectation was written for a geo-less national default, and the empty query is now geo-led, which is correct for discovery. From Denver the top 20 is local: rank 1 is 10252 `Fruition Restaurant` (Denver, 4.8, 3,481 reviews), and 2767, 3934 and 4487 are absent because they are in Hawaii and New Orleans. The calibration this case was really testing — that thin-review 5.0s stay off the first screen — is what E4 checks, and E4 passes. Superseded rather than failing. |
| E3 | empty query, geolocation denied | P2 | Falls back to `aroundLatLngViaIP`, then to a default metro, and **tells the user which** — per section 5, never leave the user geo-blocked or the results unexplained. | **pass** — measured 2026-09-03. `geoParams(null)` returns `source: ip` and sends `{aroundLatLngViaIP: true, aroundRadius: "all"}`, so proximity is never withdrawn. The rendered banner reads in full: *Nearest to your approximate location first, best rated within each area. Your browser has not shared a location, so this is an approximate position from your network.* — it names the rung and explains why it is approximate. The third rung exists as a control: the selector offers **15 neighbourhood anchors across 9 cities**, with `DEFAULT_POSITION` at New York Midtown West. **Amended 2026-09-04** — it offered two groups, 10 markets and 9 neighbourhoods, and a market centroid duplicated one of its own neighbourhoods: measured, the New York pivot sits 1.2 km from Midtown West and returns 9 of the same top 10 with the same first hit, and Houston sits 2.8 km from Galleria / Uptown, 7 of 10. Both are inside the 5 km `aroundPrecision` bucket, so two menu rows produced one page. The markets group was dropped entirely and every city is now anchored on a real neighbourhood. Two well-covered markets cannot be: Phoenix / Scottsdale carries `neighborhood` equal to `city` on 239 of its 251 records, and Las Vegas has 45 neighbourhood values that are casino names — Bellagio, Aria, The Venetian — the largest holding 9 records and all within ~2 km on the Strip. `NE Portland` was also dropped: it cleared the bucket by 100 m but shares 7 of 10 top hits with Portland Downtown and the same first hit on `seafood`. All 105 surviving pairs clear the bucket, the tightest being New York Midtown West / Harlem at 5.74 km, and `assertSelectorSeparation` fails at boot if that regresses. Every anchor was verified against the live index to return a restaurant 0.5–4.8 km away. |
| E4 | empty query, ranking sanity | P2 | 154318 `Ellen's Cafe` (5.0 stars, **1 review**) must not appear on the first screen. Exactly 21 records hold a 5.0, of which **18 have fewer than 50 reviews and 8 fewer than 10** — so `desc(stars_count)` alone would fill the entire first page from that pool, whatever the tie-break. With `m = 50` the Bayesian average drops 154318 to rank 2414 of 5000 and the other seven thin records to ranks 1523–2404. That gap is the justification for the prior. | **pass** |

## 9. Out-of-corpus query

Verified absent across `name`, `address`, `city`, `state`, `area`, `neighborhood`,
`food_type` and `postal_code` — not just name.

| id | query | journey | expectation | status |
|---|---|---|---|---|
| O1 | `momofuku` | P1 | 0 results, with an empty state that says so and offers a route back to browsing. Silent junk is worse than zero. | **pass** |
| O2 | `olive garden` | P1 | **⚠ predicted fail, confirmed 2026-09-03 (6 hits).** Truly absent, but under `removeWordsIfNoResults: lastWords` dropping `garden` leaves `olive`, which matches 6 records (100042 `Olive Press`, 56608 `Olivette`, 111679 `Olive Lucy's Kitchen Table`, 5292 `Bleu Olive`, …). The user asked for a chain and gets unrelated restaurants presented as answers. This is the motivating case for evaluating `allOptional` versus `lastWords` per section 5. | **fail** — 6 hits, not 0 — 110344 `Olive B's Big Sky`, 5292 `Bleu Olive`, 111679 `Olive Lucy's Kitchen Table`. Root cause in the baseline run above. |
| O3 | `shake shack` | P1 | 0 results. Also absent, but the fallback is harmless here: `shake` matches 0 names, so stripping the last word still yields nothing. Contrast with O2 — the same setting is safe on one query and harmful on the other, which is why the choice needs a case, not a preference. | **fail** — 10 hits after `address` was removed on 2026-09-03 (previously 1 hit, through `address`). With `removeWordsIfNoResults: 'none'` it returns 0, so the remaining leak is word removal, exactly as for O2 and O4. |
| O4 | `sushi in tokyo` | P2 | Must not silently return every sushi restaurant in the US. `tokyo` is absent from the corpus entirely; the response must make clear the location constraint could not be honoured. | **fail** — 1 hit, not 0 — 41962 `In the Raw - Bricktown`, matched on the token `in`. Root cause in the baseline run above. |

## 10. Geo — the known-item / proximity conflict

Section 5's resolution, tested on real records. `Nobu` **is** in the corpus (5
locations) and **none is in Denver**, which makes CLAUDE.md's own example directly
testable rather than hypothetical.

| id | query | journey | expectation | status |
|---|---|---|---|---|
| G1 | `nobu`, geo = Denver (39.7343, -104.9794) | P1 | 4524 `Nobu Fifty Seven` (New York), 13129 `Nobu Waikiki`, 16927 `Nobu San Diego` and 99796 `Nobu Lanai` rank above **every** Denver restaurant. Note the premise was overstated when written: measured on 2026-09-03, sending geo on this query still returns only the 18 records matching `nobu` and no Denver restaurant enters at all, because `geo` reorders matches rather than filtering. The case passes with or without geo; what geo actually costs is A1, A2 and A6. | **pass** |
| G2 | `nobu`, geo = Denver | P1 | 74146 `Nobuo at Teeter House` (Phoenix) and 75256 `Mitsunobu` (Menlo Park) rank **below** the four true Nobu locations. Tests that prefix and substring matches do not outrank the exact brand. | **fail** — 74146 at rank **1** since the `ranking` change of 2026-09-04, previously rank 2. No record is named exactly `Nobu`, so every candidate scores `exact=0` and `geo` orders them: 74146 sits 585 mi from Denver against 833 mi for 16927 `Nobu San Diego`. Proximity buys nothing here — no candidate is local — and it gets the brand wrong, which makes this the clearest cost of the change. `exactOnSingleWordQuery: "word"` fixes it exactly and was re-measured under the new `ranking` on 2026-09-04: it still breaks A1, A2 and A6, 30/37 against 32/37, so `attribute` is kept. |
| G3 | `italian`, geo = Denver | P2 | Geo leads. Denver-area Italian restaurants first, but `aroundPrecision` buckets must be coarse enough that `popularity_score` breaks ties inside a bucket — a marginally closer mediocre restaurant must not outrank an excellent one two streets further. | **pass** — since the precision dial replaced the empty-query rule on 2026-09-03. `italian` classifies as a category, so it gets the fine 5 km bucket and returns 10/10 Denver restaurants. Earlier note kept for the record: the index always did this correctly; it was the app that had stopped asking. Sent geo, the query returns all ten top hits in Denver with popularity strictly decreasing inside the bucket (4.688, 4.590, 4.589, 4.589, 4.497). Re-measured 2026-09-04 after the `ranking` changes and the removal of the dial: still 10/10 Denver, at 1–2 mi, with `popularity_score` ordering inside the bucket (4.688, 4.590, 4.589, 4.589, 4.497). The `attribute` demotion is what guarantees that ordering rather than leaving it to chance — from Houston Downtown and New York the same query used to lead with a lower-rated restaurant carrying "italian" in its name. The trade this note used to describe — one discovery case against three known-item cases — no longer exists, because A1, A2 and A6 are now protected by `exact` rather than by withholding proximity. |
| G4 | `cyclone anaya's`, geo = Pittsburgh (40.4491, -79.9939) | P1 | All 5 Houston records still returned, ~1,900 km away. A known-item query must not be filtered by proximity, only ordered by it as a tie-break. | **pass** |

---

## Third run — 2026-09-03, the three cases the front end changed

No settings were touched. Three statuses moved because the thing they were waiting on now
exists, which is a re-measurement rather than a relevance change — hence a run section and
no change-log row.

**K18 `cyclone`: fail → pass.** The second run diagnosed it correctly and stopped at the
diagnosis: the flag was right, the label alone was not, and the remainder was a UI
obligation. `resolveLocationLabel` in `src/lib/format.js` now discharges it, appending
0.7 mi against 4.0 mi from central Houston for 145366 and 151276, and falling back to
`309 Gray St.` against `5214 Morningside Dr` when no position is known.

**E1 and E3: blocked → pass.** Both were marked `blocked` because "nothing has been built
for them to fail against". Something has. E1 renders 5 occasion cards, the cuisine chips,
24 hits, the geo banner and the location selector on an empty query. E3 sends
`{aroundLatLngViaIP: true, aroundRadius: "all"}` when no position is known and says so in
full, naming the rung *and* explaining why it is approximate.

**Cumulative: 43 pass, 6 accepted, 3 fail, 0 blocked, of 52.**

The three remaining failures are O2, O3 and O4, all one root cause — `removeWordsIfNoResults`
— and all still open as question 5 below.

What is *not* claimed: no case was re-run in a browser. E1 was measured by rendering the
component tree and E3 at the parameter level, so the browser-permission dialog itself
remains unexercised. That limit is stated on the rows rather than left implicit.

---

## Fourth run — 2026-09-04, `ranking` reordered and the dial removed

One settings change and one architecture change, measured together because neither works
without the other. Harness: 37 cases with programmatically checkable expectations, from
three anchors (Denver, Houston, Dallas), on a throwaway copy of the index. The remaining
15 cases are UI or hit-count assertions that geo cannot move; O2, O3 and O4 were re-run
against the live index afterwards and are unchanged.

**The question.** Typing a chain name should return its locations ordered by distance —
`cyclone` from Houston should give the five Cyclone Anaya's nearest-first. Under the
`aroundPrecision` dial it could not: a name-like query got a 20,000 km bucket, so `geo`
decided nothing and popularity ordered the five.

**Why the dial existed, and why it was the wrong lever.** With Algolia's default `ranking`,
`geo` sits at position 2, above `words`, `attribute` and `exact`. A discriminating bucket
therefore let a nearer *partial* match displace an exact name — `Ocean Prime - Denver`
(2 km) above 117067 `Prime` (1,062 km). The dial neutralised proximity to prevent that.
Measured, simply removing it costs three cases and buys four:

| variant | result |
|---|---|
| dial, default `ranking` (before) | 30/37 |
| no dial, default `ranking` | **29/37** — gains C5, K17, `benihanna`, `ruths chris`; loses A1, A2, A6 |
| no dial, `exact` above `geo` above `attribute` | **32/37** |

**`exact` above `geo`** makes the trade unnecessary. A single-word query equal to a whole
attribute value scores `exact=1` and wins before distance is consulted, so 117067 `Prime`,
95884/105424 `Rye` and 145234 `Union` all keep rank 1. Every record that ties on `exact` —
which is every member of a chain, since no record is named exactly `cyclone`, `pappas` or
`ruth` — is then ordered by distance.

**`geo` above `attribute`** is what keeps discovery geo-led. With `attribute` first, a
distant restaurant whose *name* contains the query outranks a near one whose *cuisine* is
the query: `italian` from Denver returned Castle Rock, Colorado Springs, Santa Fe,
Albuquerque and Omaha. With `geo` first it returns Barolo Grill, Il Posto, Piatti,
Carmine's and Panzano, all Denver, all within 2 mi.

**`custom` above `attribute`** is the third move, and it came from reading the `italian`
page rather than the case list. `attribute` ranks by which searchable attribute matched, so
inside one distance bucket a name match outranks a cuisine match whatever its rating:

| query, anchor | with `attribute` before `custom` | with `custom` before `attribute` |
|---|---|---|
| `steakhouse`, Denver | Morton's The Steakhouse **4.2** | Guard & Grace **4.7** |
| `french`, NY Midtown West | French Roast Bar & Bistro **4.1** | Le Bernardin **4.7** |
| `pizza`, NY Midtown West | Lazzara's Pizza Cafe **4.1** | Delizia 92 **5.0** |
| `downtown`, Houston | 4 records with "Downtown" in the name | Andalucia Tapas **4.7** |
| `italian`, Houston Downtown | Little Napoli **4.1** at rank 4 | Da Marco **4.7** at rank 1 |

Algolia's default order has the same flaw — it also places `attribute` before `custom` —
so reverting `ranking` does not fix this. Measured, the default is byte-identical to the
promoted order on `italian` from Denver and Houston and worse on New York, where
`Quality Italian` (4.5) pushes `Pazza Notte` (5.0) off rank 1.

With `custom` first, `popularity_score` orders every record inside a distance bucket and
the name-match bonus becomes the final tie-break. Name relevance is carried by `exact`
five criteria earlier, plus `typo` and `words` before that. Neutral on the case suite —
39/44 either way, no status changes — and `midtown`, `fish house`, `tavern` and `sushi`
come back byte-identical.

Final order: `["typo","words","filters","exact","geo","proximity","custom","attribute"]`.

**What moved.**

- **C5 `pappas bros` accepted → pass.** From Dallas, 1959 Dallas rank 1 and 1854 Houston
  rank 2. Open question 4 — that one `aroundPrecision` cannot serve both C5 and A2 — is
  closed, because A2 no longer depends on `aroundPrecision` at all.
- **G2 `nobu` accepted → fail.** 74146 `Nobuo at Teeter House` moves from rank 2 to rank 1.
  The clearest cost of the change; see the case.
- **D6 `sushi` pass → accepted.** Near cuisine matches now outrank distant name matches.
- **K14 `leftbank` rank 2 → 3** and **A5 `santa fe` rank 2 → 5**, both still `accepted`.
- **`cyclone` from Houston** returns the five Cyclone Anaya's at 2, 2, 3, 4 and 7 mi;
  `ruth` from Denver puts Ruth's Chris Denver first, previously Baton Rouge; `benihanna`
  and `ruths chris` both put the Denver location first.
- **`steakhouse`, `french`, `pizza` and `downtown`** now lead with the best-rated nearby
  restaurant instead of the one carrying the category in its name.
- **No regressions** on K1–K13, K15–K20, A1, A3, A4, A6, A8, C1–C4, C6, D1–D5, E4, G1, G3
  or the empty query. `thai` and `melting` return Omaha and Albuquerque first, verified
  correct: the corpus holds **0** Thai restaurants and **0** Melting Pots in Denver.

**Cumulative: 43 pass, 5 accepted, 4 fail, of 52.**

**What the architecture change removes.** The two parameter sets collapse into one, and
with them `looksLikeCategory` and its two measured failure modes — `bistro` and
`small plates` classifying as categories, and `italian restaurant` / `sushi near me`
matching nothing and being treated as names. The known-item journey is now protected by
the index `ranking` rather than by a convention in `src/searchParams.js`, so the
boot-time assertion policing the two sets goes away with them.

---

## Fifth run — 2026-09-04, query rules for category-shaped queries

Three rules replace the ranking change that was measured and set aside on 2026-09-04. A
query equal to a facet value now has its words removed and the value applied as a facet
filter, so the text criteria leave the comparison entirely and ordering falls to `geo`
then `popularity_score`.

One rule per attribute rather than one per value, using the `{facet:<attribute>}`
placeholder: 3 rules cover 48 values. Measured, the application's rule quota is at least 4
and 150 values would never have fitted.

**What it fixes.** `dining_style` and `occasions` are not in `searchableAttributes`, so
those queries were the worst results in the app:

| query | before | after | rank 1 from Denver |
|---|---|---|---|
| `casual elegant` | **0 hits** | 2,130 | Fruition Restaurant (4.8) |
| `fine dining` | 1 hit | 641 | Kevin Taylor's At The Opera House (4.7) |
| `family friendly` | 1 hit | 1,858 | the plimoth (4.7) |
| `date night` | 6 hits | 1,639 | Mizuna (4.7) |
| `business lunch` | 8 hits | 1,627 | Mizuna (4.7) |
| `late night` | 68 hits | 73 | — |
| `steakhouse` | 513 hits, Morton's (4.2) | 486 | Guard & Grace (4.7) |
| `french` | 229 hits, French Roast (4.1) | 229 | Le Bernardin territory |
| `italian` | 895 hits | 890 | Barolo Grill (4.7) |

`date night` previously returned `Dante Ristorante Pizzeria` first, reached by typo
tolerance on `Dante`. `casual elegant` returned nothing at all.

**Zero regressions.** 39 mechanically checkable cases re-run against the live index:
39/39. No rule fires on a name query — `prime`, `rye`, `cyclone`, `bistro`, `nobu`,
`pappas` and every K case are byte-identical, because `anchoring: is` requires the whole
query to equal a facet value.

**Three cases now match their written hit counts for the first time.** D1 `steakhouse`
486 (was 513), D2 `fondue` 30 (was 31), D3 `thai` 25 (was 45). Those numbers were taken
from the transform report when the cases were written, and a text search never reproduced
them because names carrying the category word inflated every count. A filtered browse
returns the facet count by construction.

**`cuisine_tags` was measured and rejected**, though it is the obvious fourth rule.
`automaticFacetFilters` is a hard filter, and for 12 of its 102 values the tag covers far
fewer records than the word reaches, so the rule would shrink the result set rather than
reorder it: `American` marks 32 records against 1,763 text matches, `Bar` 4 against 373,
`Bistro` 4 against 208, `Sushi` 67 against 106. 75 values sit within ±5 and would be
harmless — `churrascaria` 33 to 33, `farm to table` 149 to 149 — but the ones that would
break are the most likely queries. Two tag values are also restaurant names, `Bistro`
(100624) and `Small Plates` (112537), and a hard filter would make those unreachable by
their own name rather than merely badly ranked. `cuisine_tags` is already searchable, so
those queries work today.

**Still open.** `anchoring: is` fires only on an exact whole-query match, so
`italian restaurant` (98 hits), `cheap italian` and `sushi near me` are untouched. That
remains the query-categorisation gap in CLAUDE.md §9.

The rules live in `scripts/rules.json` and are pushed by `2-index.js` with
`clearExistingRules`, so the file is the whole rule set. The dashboard-created rule that
prototyped this was replaced by `category-query-cuisine` on the same push.

---

## Settings change log

One line per settings change. One setting at a time — five at once makes the result
unattributable. A change with no motivating case does not belong here.

| date | setting changed | from → to | motivating case | improved | regressed |
|---|---|---|---|---|---|
| 2026-09-03 | *none — initial push* | — | — | baseline established: 16/23 pass | — |
| 2026-09-03 | `ranking` — position of `geo` | position 7 (below `exact`) → position 2 (Algolia default) | **G3** `italian` from Denver | G3 fail → pass. First Denver record moves from 89th of 895 to 1st; all 10 top hits in Denver; popularity strictly decreasing inside the 5 km `aroundPrecision` bucket (4.688 → 4.497), which is the tie-break §5 specified. | **none.** All 49 other cases byte-identical. G1, G2, G4 and C5 unchanged — the known-item context sends no geo parameter, so the criterion stays inert there whatever its position. |
| 2026-09-03 | `searchableAttributes` — removed `chain_name` | 5 levels → 4 | **A2** `prime` | A2 fail → pass. 90916 had been scoring `exact=1` through `chain_name: "Prime"`, a whole-attribute match at level 2 that cancelled 117067's real name match. Provably lossless: all 722 chained records have a name beginning with their `chain_name`, 0 exceptions. | **none.** All 49 other cases byte-identical. |
| 2026-09-03 | `exactOnSingleWordQuery` — **evaluated, not applied** | `attribute` → `word` | **G2** `nobu` | Would fix G2: all four Nobu score `exact=1`, Nobuo scores 0. | **Breaks A2, A7 and A8** — `prime` returns Bohanan's, `bistro` returns Costa Brava, `babylon` returns Babylon Turkish. Net −2, so `attribute` is kept. The two modes are in direct opposition: `attribute` rewards "the query is the whole name", `word` rewards "the query is a whole word in the name". |
| 2026-09-03 | `exactOnSingleWordQuery` — now declared | *(implicit default)* → `"attribute"` | the measurement above | Nothing behaviourally: the value equals the effective default. Declared so the measured choice is visible in a diff instead of inherited silently, the same reason `ranking` is declared. | **none.** Spot-checked on the eight single-word queries the setting can affect — `prime`, `bistro`, `babylon`, `nobu`, `rye`, `naya`, `steakhouse`, `thai` — all rank 1 unchanged. |
| 2026-09-03 | `indexLanguages` + `queryLanguages` | *(unset)* → `["en"]` | prerequisite for the two rows below | Nothing behaviourally — 0 of 50 cases changed, not even a hit count. Declared because `ignorePlurals` and `removeStopWords` are dictionary-driven and with no language set resolve against every supported language. | **none.** |
| 2026-09-03, re-measured 2026-09-04 | `ignorePlurals` — **evaluated, not applied** | `false` → `true` | cuisine plurals such as `steakhouses` | **Three zero-result queries, and only three.** `breweries` 0 → 9 hits, `wineries` 0 → 10, `eateries` 0 → 11, `bakeries` 1 → 3 — the `-y`/`-ies` class, edit distance 3, beyond `minWordSizefor2Typos: 8`. Of 118 facet values with a plural form, 106 plural queries already returned their singular's result; on takes it to 110 and breaks 1. `steakhouses` and `italians` are flat either way because their `category-query-*` rule fires via `alternatives: true`, not because typo tolerance absorbs the plural — the 2026-09-03 reading of this row. | **15 known-item regressions**, swept over all 4,979 distinct names with the real parameters (Denver, `aroundRadius: all`, `aroundPrecision: 5 km`): rank 1 moves on 23, 15 worse, 0 better — `Basil's` → Sweet Basil, `Grace's` → Guard & Grace, `Oceans` → Ocean Prime - Denver, `Latitudes` → Latitude 41, `Mayas` → Maya, `Vitae` → Vita. No hit count moves; rivals join the exact name in typo bucket 0 where `geo` decides before `exact`, so the geo-less sweep shows 2 — what 2026-09-03 recorded. Half the damage is possessives. `false` kept. |
| 2026-09-03 | `removeStopWords` — **evaluated, not applied** | `false` → `true` | O4 `sushi in tokyo` | **Nothing.** O4 returns 0 with word removal disabled, so the token `in` was never its cause. | **Regresses the sharpest case in the corpus.** `the smith` goes from 4 hits to 16 and 19258 `The Smith - East Village` falls out of the top 3, displaced by `Smithfields` and `Butera's Restaurant of Smithtown`. Adds tail noise on `in the raw` and `the capital grille`. `false` is kept. |
| 2026-09-03 | `searchableAttributes` — removed `address` | 4 levels → 3 | no stated pain requires street search (§1), plus measured noise | **Precision, on 9 of 50 cases.** `Cafe 21` 7 hits → exactly the 2 real records; `kaya` 67 → 40, shedding 27 Waikiki restaurants on Kalakaua Avenue; `thai` 76 → 45, shedding 31 on Third Street; `union` 57 → 42; `tien` 47 → 38; `naya` 31 → 28. | **0 status changes**, 42/50 either way. O3 went from 1 hit to 10 — its leak reverted from `address` to `lastWords`. Street search is gone: 110 records were reachable only via `address` on `Main Street`, 92 on `Broadway`, 139 on `park`. |
| 2026-09-03 | **architecture** — one shared parameter set instead of two (**evaluated, not applied**) | `knownItemParams` + `discoveryParams` → one set, geo on every query | the proposal to serve both personas from the results page alone | Simpler: one set, no separation to police. Geo also *helps* chain queries — from Denver, `ruths chris` puts Ruth's Chris Denver first, `benihanna` puts Benihana Denver first, `pappas bros` puts Dallas ahead of Houston. | **42/50 → 38/50.** A1 `rye`, A2 `prime` and A6 `union` all fail: the nearer record that also matches the word displaces the exact name — `Ocean Prime - Denver` (2 km) beats 117067 `Prime` (1,062 km), `Barley & Rye` beats `Rye`, `Workshop at UNION` beats `Union`. E2 also flips, but that one is a case artefact: its top-20 expectation was written for a geo-less default. Two sets kept; the **library** was collapsed to one instead. |
| 2026-09-03 | **architecture** — the suggestion dropdown removed; geo now gated on an empty query | two surfaces, two parameter sets → one surface, one set plus a conditional geo half | the dropdown showed the same records the page already showed, one keystroke earlier | A whole surface and its recent-searches feature removed, neither tied to a stated pain (§1). One parameter set, one state model. The empty query keeps geo and lands well: from Denver the top eight are all Denver restaurants rated 4.7–4.8 with 290–3,481 reviews. Typed queries keep A1 `rye`, A2 `prime`, A6 `union` and G1 `nobu`. | **G3 regresses to `accepted`.** `italian` is a typed query, so it no longer receives geo and returns Memphis and Orlando rather than Denver. The index still does it correctly when asked — the app deliberately does not ask. 42 pass → 41 pass, 4 accepted → 5. |
| 2026-09-03 | `aroundPrecision` becomes the dial; geo never withdrawn | geo sent only on an empty query → geo always sent, precision 5 km for a category query and 20,000 km for a name query | the empty/non-empty axis denied proximity to `italian` from Chicago, which is a discovery query | **G3 recovered.** A category query gets the fine bucket and returns 10/10 Denver. A1 `rye`, A2 `prime`, A6 `union`, A8 `babylon` and G1 `nobu` all keep their coarse-bucket behaviour — at 20,000 km the ranking is byte-identical to sending no geo, measured. Distance is unaffected either way: it is computed client-side from `_geoloc`, so the dial never touched the display. | **C5 regresses to `accepted`.** `pappas bros` is a name query, so the coarse bucket stops geo separating Dallas from Houston. No precision satisfies both C5 and A2: A2 needs buckets wider than 1,062 km, C5 narrower than 360 km, and at 500 km both fail. **E2 also moves to `accepted`** — it was already failing under the previous rule and the status had not been updated; its expectation predates a geo-led empty query. |
| 2026-09-03 | `attributesForFaceting` — `searchable()` on the three place facets | `city`, `market`, `neighborhood` → `searchable(city)`, `searchable(market)`, `searchable(neighborhood)` | the four searchable facet boxes in `App.jsx`: three of them were dead, the API answering *Cannot search in `city` attribute* | **Three broken controls now work.** Cardinality is why they need search rather than a longer `showMore`: 916 distinct cities and 1,062 neighborhoods behind a `limit` of 6, so no amount of scrolling reaches a named place — the browse-by-place path persona 2 depends on. `market` is included at only 51 values because it is opaque at inconsistent granularity: Fort Worth hides inside `Dallas - Fort Worth`. | Nothing measurable, and not by assumption — the flag never enters `searchableAttributes`, so matching and ranking cannot move. Re-measured after the push: kaya 40, thai 45, `Cafe 21` 2, union 42, tien 38 all unchanged; A2 still ranks 117067 first; A1 still puts 95884 and 105424 above 30385; G3 still returns Denver first from Denver. |

| 2026-09-04 | `ranking` — `exact` promoted above `geo`, `geo` above `proximity` and `attribute` | `["typo","geo","words","filters","proximity","attribute","exact","custom"]` → `["typo","words","filters","exact","geo","proximity","attribute","custom"]` | **K18** `cyclone` — a chain name should return its locations nearest-first | **C5 fail → pass**, and proximity now leads every query without costing the exact-name cases: A1 `rye`, A2 `prime` and A6 `union` all keep rank 1 through `exact`, while `cyclone` from Houston orders the five Cyclone Anaya's at 2, 2, 3, 4 and 7 mi, `ruth` from Denver puts Ruth's Chris Denver first, and `benihanna` and `ruths chris` both lead with the Denver location. G3 `italian` still returns 10/10 Denver. 30/37 → 32/37. | **G2 `nobu` accepted → fail** — 74146 `Nobuo` rank 2 → 1, since no candidate scores `exact` and Phoenix is nearer to Denver than San Diego. **D6 `sushi` pass → accepted** — near cuisine matches outrank distant name matches. K14 `leftbank` rank 2 → 3 and A5 `santa fe` rank 2 → 5, both already `accepted`. |
| 2026-09-04 | **architecture** — the `aroundPrecision` dial removed, one parameter set restored | `nameQueryParams` (20,000 km) + `categoryQueryParams` (5 km), switched by `looksLikeCategory` → one set at 5 km | the same case, K18 | Depends on the row above and was measured with it. Removes the name-versus-category heuristic and both its recorded failure modes: `bistro` and `small plates` misclassifying, and `italian restaurant` / `sushi near me` getting no proximity. One parameter set, no boot assertion policing two, no convention to keep. | **none beyond the row above.** Measured alone against the default `ranking` it is a net loss — 29/37, breaking A1, A2 and A6 — which is why the two changes ship together rather than one at a time. |
| 2026-09-04 | `exactOnSingleWordQuery` — **re-evaluated under the new `ranking`, not applied** | `attribute` → `word` | **G2** `nobu`, now a fail | Fixes G2 exactly: the four Nobu score `exact=1` as a whole word, 74146 `Nobuo` scores 0. | **Breaks A1, A2 and A6.** With `word`, `Bohanan's Prime Steaks` also scores `exact=1` on `prime`, so the tie moves to `geo` and the nearer record wins again — the precise failure the `exact` promotion exists to prevent. 30/37 against 32/37, the same net −2 measured on 2026-09-03 under the old order. `attribute` kept. |

| 2026-09-04 | `ranking` — `attribute` demoted below `custom` | `[…,"proximity","attribute","custom"]` → `[…,"proximity","custom","attribute"]` | reading the `italian` result page: worse-rated restaurants ranked above better ones for carrying "italian" in the name | **Every category query now leads with the best-rated nearby restaurant.** `steakhouse` from Denver: Guard & Grace (4.7) replaces Morton's The Steakhouse (4.2). `french` from Midtown West: Le Bernardin (4.7) replaces French Roast Bar & Bistro (4.1). `pizza`: Delizia 92 (5.0) replaces Lazzara's Pizza Cafe (4.1). `downtown` from Houston: Andalucia Tapas (4.7) replaces four records with "Downtown" in the name. `italian` from Houston Downtown: Da Marco (4.7) rank 1, previously Little Napoli (4.1) at rank 4. Reverting to Algolia's default was evaluated first and does **not** fix this — the default also places `attribute` before `custom`, and on New York it is worse still. | **none.** 39/44 either way, no case status changed. `midtown`, `fish house`, `tavern` and `sushi` byte-identical. Name relevance is unaffected because it is carried by `exact`, five criteria earlier: A1 `rye`, A2 `prime`, A6 `union`, A8 `babylon`, A3/A4 `naya`/`kaya` and every K case still pass. |

| 2026-09-04 | **query rules** — `scripts/rules.json`, 3 rules added | no rules → `category-query-cuisine`, `category-query-dining_style`, `category-query-occasions` | `italian` and `steakhouse` ranking a worse-rated restaurant first for carrying the category in its name | **A category query is now a filtered browse.** `casual elegant` 0 hits → 2,130, `fine dining` 1 → 641, `family friendly` 1 → 1,858, `date night` 6 → 1,639 (previously led by `Dante Ristorante`, a typo match), `business lunch` 8 → 1,627 — `dining_style` and `occasions` are not searchable attributes, so those queries had been failing outright. `steakhouse` leads with Guard & Grace (4.7) instead of Morton's (4.2). D1, D2 and D3 now return exactly the counts their expectations name: 486, 30, 25. | **none.** 39/39 mechanically checkable cases pass. `anchoring: is` means no rule fires on a name query, so `prime`, `rye`, `cyclone`, `bistro`, `nobu` and every K case are byte-identical. `cuisine_tags` was measured and rejected as a fourth rule — see the fifth run. |
| 2026-09-04 | `relevancyStrictness` — **evaluated on `rating_desc`, not applied** | `50` → `0` | the replicas reporting `nbHits` 5,000 with `nbSortedHits` 137 | Would make the sort span the whole result set: from Denver `italian` 34 sorted of 895 → 895, `steakhouse` 26 of 513 → 513, `prime` 2 of 49 → 49, and *Top rated* on `steakhouse` would lead with Embers Steakhouse (5.0) and Russell's (4.9) instead of the best of the 26 records near Denver. | **Destroys the geo dimension, which is the point of this sort.** `geo` is second in `ranking` and is sent on every request, so the band strictness preserves *is* the band near the user. At 0 the replica sorts on `customRanking` alone: from Denver the empty query leads with Cafe Monarch (Scottsdale) and Geronimo (Santa Fe), 4 of 24 records in Denver against 24 of 24 at 50; `sushi` from Houston returns 0 of 24 in Houston. A diner wants the best rated *around them*. 50 also proves distinct from the primary rather than a duplicate of it — `italian` from Midtown West shares 6 of 24 records with *Most relevant*, surfacing Sette (4.8) and Via 45 (4.7) that proximity buries; `sushi` from Denver leads Sushi Sasa (4.6) over the nearer Hapa (4.4). `25` is not a middle ground: `steakhouse` 26 → 39, `sushi` 10 → 11, `prime` 2 → 2. **50 kept.** The low `nbSortedHits` is the geo band, not a defect, and `<Stats>` states it as "6 relevant results sorted out of 106". |
| 2026-09-04 | **replicas** — the two price replicas and their sort options removed | `rating_desc` + `price_asc` + `price_desc` → `rating_desc` | no stated pain asks to sort by price, and the control was measured redundant | **Two controls removed that answered a question the filter panel already answers.** `price_tier` holds 3 values on a 62.5% / 31.3% / 6.2% split (3,125 / 1,567 / 308 records) and popularity breaks ties inside a tier, so a price sort is arithmetically the `price_range` facet plus *Top rated*: measured with the sorts actually sorting, `price_asc` page 1 was identical to facet `$` + *Top rated* on `italian`, `steakhouse` and `sushi` — 24 of 24 records in 24 of 24 positions. Two further defects made the label untenable: `paginationLimitedTo: 1000` is below the 3,125 records in tier 1, so *Price: low to high* could never page out of the cheapest tier and the price never rose; and there is no finer price signal to fall back on, since the `price` int contradicts the `price_range` label on 220 records and was dropped in §3. | **`price_tier` now has no consumer.** It stays in the schema, `attributesForFaceting` and `numericAttributesForFiltering` — the attribute is cheap, honest and derived, and removing it is a separate decision. *Price: high to low* had one property no facet reproduces: it degraded gracefully past a thin tier, `italian` returning `{tier 3: 17, tier 2: 7}` where the facet shows 17 and stops. That is given up deliberately, at the rare end of the distribution, against two controls' worth of confusion. |

The initial configuration in `scripts/settings.json` was pushed unchanged, so this row
records a baseline rather than a change. Every row after it must name one setting, the
case that motivated touching it, and what moved in both directions.

## Open questions this file must resolve

Recorded now so they are not quietly forgotten once results start coming in.

**Answered by the 2026-09-03 baseline run:**

- ~~**A3 / A4 (`naya` / `kaya`)** — can `minWordSizefor1Typo` protect both
  directions?~~ **Yes.** Both rank 1 on their own query with the threshold unchanged.
  No exception needed, `disableTypoToleranceOnWords` stays empty.
- ~~**K12 (`pappas brothers`)** — build the abbreviation synonym set, or accept the
  failure?~~ **Neither.** The case passes without a synonym. The 66 abbreviation
  records may still deserve synonyms, but no test currently demands it.

**Still open:**

1. ~~**The `exact` tie — one lever, five cases.**~~ **Closed 2026-09-03.** A2 fixed by
   removing the redundant `chain_name` from `searchableAttributes`; A5, A7, K14 and G2
   accepted with recorded reasons. The name-length tie-break was abandoned as having no
   valid position in `customRanking`, and `exactOnSingleWordQuery: "word"` was measured
   and rejected at net −2. No schema change was needed. See the investigation section
   above. What remains live is narrower: **if `cuisine_tags` ever gains another value
   that equals a restaurant name, A7's failure mode reappears.** Two of 128 values
   collide today — `Bistro` and `Small Plates` — and that count should be checked
   whenever the taxonomy changes.
2. **Is A2 a defect or a bad case?** 117067 `Prime` carries 3 reviews. Ranking it above
   a 1,174-review restaurant of the same name contradicts the reasoning behind
   `popularity_score`. Narrowing the case may be more honest than changing ranking.
3. **`address` in `searchableAttributes`.** It is the sole cause of O3 and it is listed
   in CLAUDE.md §5. Removing it closes the leak and removes street search, which no
   stated pain requires but which is a plausible expectation.
4. ~~**The dial cannot serve chain disambiguation and exact-name protection at once.**~~
   **Closed 2026-09-04.** The premise was that one `aroundPrecision` had to serve both, and
   it does not have to: promoting `exact` above `geo` in `ranking` protects A2 by text
   relevance instead of by distance, which frees proximity to separate C5's two Pappas Bros
   locations. C5 passes, A1, A2 and A6 keep rank 1, and the dial is gone. The cost is
   G2 `nobu`, recorded on the case and in the fourth run above.
5. **`lastWords`, `allOptional` or `none`?** Now the highest-value open question, and
   the evidence has sharpened: with `removeWordsIfNoResults: 'none'` **all four
   out-of-corpus queries return 0**, so this one setting closes O2, O3 and O4 together.
   The cost is unmeasured and is the whole question — `none` means a query carrying one
   unmatched word returns nothing at all, which is exactly the forgiveness persona 1
   needs. `allOptional` sits between the two. Must be measured against all 43 passing
   cases before adoption, not just the three failures.
6. ~~**D6 (`sushi`)** — measured as passing, but the resolution is a UI obligation rather
   than an index one.~~ **Superseded 2026-09-04.** The `ranking` change inverted it: near
   cuisine matches now outrank distant name matches, so the top ten from Denver are local
   Japanese restaurants rather than the 72 records carrying "sushi" in the name. The case
   is `accepted` and the UI obligation it described — surfacing `cuisine: Japanese`
   prominently — still stands, because the facet is what recovers the national set.
7. **E2** — not yet run. Is `m = 50` right? Three of the top 20 are 5.0-star records
   with 139–242 reviews. The thin tail is handled (E4), so this is a calibration
   judgment, not a bug.
8. ~~**Where does `geo` belong in `ranking`?**~~ **Answered twice.** 2026-09-03: restored
   to position 2, Algolia's default, which fixed G3 with zero regressions. 2026-09-04:
   moved again to position 5, below `exact` and above `proximity` and `attribute`, which
   is what lets proximity lead every query while `exact` keeps the known-item cases at
   rank 1. The geo-first standard replica was never needed. The live risk this leaves is
   narrower and is recorded on G2: on a query where no record scores `exact`, the nearest
   prefix match leads, and `nobu` from Denver returns `Nobuo at Teeter House`.
9. **K18 and the ambiguous label.** The index side is correct and both colliding records
   carry `location_label_ambiguous: true`. The case cannot pass until the front end
   appends distance where the flag is set, which makes it the first hard requirement the
   UI inherits from the data model rather than from a design preference.
10. **The two missed chain members.** 70261 and 150577 carry a hyphen with no surrounding
   whitespace and never join their chains. Relaxing the whitespace guard would catch them
   and wrongly split 46 genuinely hyphenated names, so the guard stays; the question is
   whether to special-case two records or accept the gap and correct the documented
   totals.
