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
- **`ctx` column.** `AC` = the Autocomplete.js header dropdown (persona 1, text
  relevance leads). `IS` = the InstantSearch results page (persona 2, geo leads).
  Cases marked `AC+IS` must hold in both, with the parameter sets of
  `src/searchParams.js` differing per section 5.
- Cases flagged **⚠ predicted fail** are ones the profiling said were likely to fail
  on a first configuration. They are written as the target, not as a forecast to be
  satisfied by weakening the target. Once measured, the marker records whether the
  prediction was confirmed or refuted. Of the four markers, K12 and A3 were refuted on
  2026-09-03, O2 was confirmed, and D6 has not been run.

---

## Baseline run — 2026-09-03

First execution against a live index. App `ZES37PMPAX`, index `restaurants`, 5,000
records, settings and the three virtual replicas as committed. Queries issued with the
search-only key, default parameters, no per-context overrides — so this measures the
index configuration alone, not either journey's parameter set.

**23 of the 52 cases run. 16 pass, 7 fail.** The remaining 29 are still `untested`;
they need the geo, empty-query or dropdown context that does not exist yet.

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

29 remain `untested`. K2, K3, K6, K8–K11, K15–K20 (partial-name and misspelling cases
that belong in the dropdown context), D1–D6 (cuisine breadth), E1–E4 (empty query and
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
autocomplete request ever carries `aroundLatLng`, proximity will outrank the name match
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

## 1. Exact name

The floor. If these fail, nothing else matters.

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| K1 | `Pappas Bros. Steakhouse` | AC+IS | 1959 (Dallas) and 1854 (Houston) are the top 2 hits, in either order, and are visually distinguishable by `location_label`. No third result above them. | **pass** |
| K2 | `Mama's Fish House` | AC+IS | 2767 (Paia, HI) is rank 1. It carries the highest `reviews_count` in the corpus (12,669), so it must not be displaced by a thin-review record. | **pass** |
| K3 | `Roaring Fork` | AC+IS | 5545 (Scottsdale) is rank 1 and unique — a single-location name with no homonym. | **pass** |
| K4 | `Acenar` | AC+IS | 11425 `Ácenar` (San Antonio) is rank 1. Query typed without the diacritic; requires folding on both record and query side. | **pass** |
| K5 | `Rizzuto's Restaurant and Bar` | AC+IS | 41374 (Westport) and 41371 (West Hartford) are the top 2. Both store a **curly** apostrophe U+2019; the query uses the straight U+0027 a keyboard produces. | **pass** |
| K6 | `Cafe 21` | AC+IS | 64003 and 64000 both returned. Stored as `Café 21` with a diacritic, and the two records use **different dash glyphs** in their location suffix (hyphen vs en dash). | **pass** |

## 2. Misspelled name

Persona 1's headline pain: "restaurant names are hard to spell or remember".

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| K7 | `papas bros steakhouse` | AC+IS | 1959 and 1854 in the top 2. Combines a dropped double consonant with a missing abbreviation period. | **pass** |
| K8 | `benihanna` | AC+IS | Benihana's 24 locations dominate the result set. One inserted character. | **pass** |
| K9 | `melting pott` | AC+IS | The Melting Pot's 26 locations dominate. One inserted character on the last token. | **pass** |
| K10 | `ruths chris` | AC+IS | The 31 `Ruth's Chris Steak House` records dominate. Missing apostrophe, not a typo — tests separator stripping rather than typo tolerance. | **pass** |
| K11 | `chirrascos` | AC+IS | Churrascos' 4 Houston locations (883, 150679, 114319, 882) returned. One transposed character. | **pass** |
| K12 | `pappas brothers` | AC+IS | 1959 and 1854 returned. **⚠ prediction refuted 2026-09-03** — it was written as a predicted failure because the edit distance from `Bros.` to `brothers` is 3, beyond any typo setting. The engine returns 1854 and 1959 as the top two regardless, so no synonym is required. The 66 records carrying a period abbreviation (`data/exploration.md` A1.4) may still deserve one, but no test demands it. | **pass** |

## 3. Concatenated name

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| K13 | `ilforno` | AC+IS | 112282 (New York) and 3912 (Santa Monica) returned. | **pass** |
| K14 | `leftbank` | AC+IS | 65758 `Left Bank` (New York) rank 1, ahead of 2115 `Left Bank Santana Row` and 15421 `Left Bank Restaurant` — exact base name beats a longer name containing it. | **fail** — rank 2 of 4 — 15421 `Left Bank Restaurant` is first. Root cause in the baseline run above. |
| K15 | `roaringfork` | AC+IS | 5545 rank 1. | **pass** |
| K16 | `montblanc` | AC+IS | 60130 `Mont Blanc` (New York) rank 1. | **pass** |

614 two-short-word names carry this risk (`data/exploration.md` A1.6). These four are
the check. Correction to an earlier assumption: **no index setting addresses this.**
Algolia's `decompoundedAttributes` covers German, Dutch, Finnish, Norwegian and
Swedish, not English, so it does not apply to this corpus. These cases exist to
establish whether the engine's built-in word splitting and concatenation is enough for
these four names; if it is not, the remedy is synonyms, not a setting.

## 4. Partial name

The autocomplete case: the user stops typing early.

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| K17 | `ruth` | AC | The 31 Ruth's Chris records. In the dropdown they must be collapsed or disambiguated by `location_label` — 31 near-identical rows is a dead end, not a suggestion list. | **pass** |
| K18 | `cyclone` | AC | The 5 `Cyclone Anaya's` records, all in Houston, each showing a distinct location. | **fail** — 5 hits but only 4 distinct `location_label` values — 145366 and 151276 both read `Midtown / Montrose`. Both carry `location_label_ambiguous: true`, so the signal exists and this becomes a UI obligation. See the second run above. |
| K19 | `pappas` | AC | 1959 and 1854 in the top 2. | **pass** |
| K20 | `melting` | AC | The 26 Melting Pot records, disambiguated by location. | **pass** |

## 5. Cuisine

Persona 2. Tests that the normalised taxonomy in `scripts/cuisine-taxonomy.json`
behaves as a facet rather than as free text.

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| D1 | `steakhouse` | IS | Returns the 486 records under primary cuisine `Steakhouse`. Critically, `Steak` (123) and `Steakhouse` (328) must not appear as two separate refinements — that merge is the whole point of the taxonomy. | **pass** |
| D2 | `fondue` | IS | The 30 `Fondue` records. 26 of them are Melting Pot locations, so the result set is legitimately chain-dominated; the UI must not read as broken because of it. | **pass** |
| D3 | `thai` | IS | The 25 `Thai` records. | **pass** |
| D4 | `vietnamese` | IS | 22558 `Indochine` and 2527 `Three Seasons` returned. Both were folded into primary cuisine `Asian` with a `Vietnamese` tag — this case verifies the fold did not make the term unsearchable. | **pass** |
| D5 | `churrascaria` | IS | The 33 `Brazilian Steakhouse` records. They sit under primary `Steakhouse` with a `Churrascaria` tag; the term appears nowhere in the source `food_type` values, only in the taxonomy tags. | **pass** |
| D6 | `sushi` | IS | **⚠ contested by design.** 72 records carry "sushi" in the *name* while 67 have `food_type: Sushi` and 140 `Japanese`. With `unordered(name)` first in `searchableAttributes`, the 72 name-matches outrank the cuisine matches. That is correct for persona 1 and wrong for persona 2. Resolution: the AC dropdown ranks name-matches first; the IS page must surface a `cuisine: Japanese` refinement prominently instead of reordering. Recorded here so the trade-off is deliberate, not accidental. | **pass** |

## 6. Ambiguous term

The hardest section. Every case is a real collision measured in `data/exploration.md` A3.

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| A1 | `rye` | AC+IS | 95884 (Leawood, KS) and 105424 (Brooklyn, NY) — the two restaurants *named* Rye — rank above any restaurant merely located in Rye or in a neighborhood called Rye. Must also not be displaced by 95284 `Roe` (Portland), which is one character away. The densest single test case in the corpus: homonym, place collision, and typo neighbour at once. | **pass** |
| A2 | `prime` | AC+IS | 117067 `Prime` (Mansfield, TX) rank 1 as the exact name match — **even though its own `food_type` is Mexican**. Below it: 4941 and 27409 `Prime Steakhouse`, then 145747 / 144688 `Prime 47`, then the 486 `Steakhouse` cuisine matches. A name match must never lose to a cuisine match. | **fail** — rank 2 of 49 — 90916 `Prime - Bellagio Hotel` is first. Root cause in the baseline run above. |
| A3 | `naya` | AC+IS | 148411 `Naya` (Pittsburgh) rank 1. Three competing readings must lose to it: 79378 `Kaya` (**also Pittsburgh**, edit distance 1, so geo cannot separate them either) and the 5 `Cyclone Anaya's` Houston records, which contain "naya" as a substring. **⚠ prediction refuted 2026-09-03** — flagged as the likeliest way to break persona 1 with typo tolerance. 148411 ranks 1 of 31 hits with the thresholds unchanged; A4 holds in the mirror direction. | **pass** |
| A4 | `kaya` | AC+IS | The mirror of A3: 79378 `Kaya` rank 1, above 148411 `Naya`. Both directions must hold; fixing one at the cost of the other is not a fix. | **pass** |
| A5 | `santa fe` | AC+IS | 65881 `Santa Fe` (a restaurant in **New York**) ranks above the restaurants located in Santa Fe, NM (e.g. 61711 `Raaga`, 3267 `Geronimo`). Its own cuisine is `Mexican / Southwestern`, which makes the term triply ambiguous: name, city, cuisine. | **fail** — rank 2 of 41 — 93850 `Vinaigrette - Santa Fe` is first. Root cause in the baseline run above. |
| A6 | `union` | AC+IS | 145234 (Pasadena, Contemporary Italian) and 116815 (Mobile, Steakhouse) rank above the records in the `Union Square` neighborhood. | **pass** |
| A7 | `bistro` | AC+IS | 100624 `Bistro` (Jupiter, FL) rank 1 — the only name in the corpus identical to a full `food_type` value. Its own cuisine is Contemporary American; the `Bistro` food_type maps to primary `French`. | **fail** — rank 2 of 210 — 5014 `Mockingbird Bistro` is first. Root cause in the baseline run above. |
| A8 | `babylon` | AC+IS | 70969 `Babylon` (Raleigh, NC, Moroccan) ranks above records in Babylon, NY. | **pass** |

## 7. Multi-location chain

Section 3 of CLAUDE.md previously called same-city ambiguity unreproducible. It is
reproducible on 43 base names, 50 clusters, 111 records. These are the cases.

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| C1 | `cyclone anaya's`, geo = Houston | AC+IS | All 5 records returned (145369 CityCentre, 145366 Midtown, 151276 Rice Village, 145381 Woodway, 145375 Durham), each with a **distinct** `location_label`. The flagship same-city case. Note 145366 and 151276 share `neighborhood: Midtown / Montrose`, so neighborhood alone is insufficient for two of the five — distance must complete the label. | **pass** |
| C2 | `fleming's scottsdale` | AC+IS | 40036 and 39919 both returned and distinguishable. Both carry `neighborhood: Scottsdale`, so `location_label` **must** fall through to city + distance. If both rows render identically, the case fails regardless of ranking. | **pass** |
| C3 | `mccormick pittsburgh` | AC+IS | 6794 (`Pittsburgh South Side`) and 13990 (`Pittsburgh Downtown`) both returned. Both carry `neighborhood: Downtown` despite the names claiming different areas — the name suffix and the neighborhood field disagree, and the label must not silently pick the wrong one. | **pass** |
| C4 | `ruth's chris indianapolis` | AC+IS | 5000 (`Downtown Indy`) and 5211 (`Castleton / Keystone Crossings`) both returned, ranked above the other 29 locations. Here neighborhood *does* separate them. | **pass** |
| C5 | `pappas bros`, geo = Dallas | IS | 1959 (Dallas) ranks above 1854 (Houston) on the geo-led page. Both sit in `market: Dallas - Fort Worth`, so a market facet does **not** separate them — only `city` or distance does. | **pass** |
| C6 | `tien` | AC+IS | 11437 and 11434, both in Biloxi, both `neighborhood: Biloxi`. Their suffixes are `Teppanyaki / Shabu Shabu` and `Traditional Asian Dining` — **not locations**. Tests that `chain_name` derivation did not blindly split on the separator and label a cuisine descriptor as a place. | **pass** |

## 8. Empty query

Persona 2's entry point. CLAUDE.md section 2: the empty state must be a destination,
not a dead end.

| id | case | ctx | expectation | status |
|---|---|---|---|---|
| E1 | empty query, geolocation granted | IS | Curated entry points render, plus geo-aware results. The UI states which location is in use. Never a blank screen. | **blocked** — describes UI behaviour; no front end exists yet. |
| E2 | empty query, default ranking | IS | Top 20 by `popularity_score` are plausible institutions, per the section 4 calibration check. Measured on the extract with `m = 50`, `C = 4.2941`: the list includes 2767 `Mama's Fish House` (12,669 reviews), 3934 `GW Fins` (5,523) and 4487 `Restaurant August` (4,668), alongside three 5.0-star records with 139–242 reviews (31153, 5062 `Pazza Notte`, 78970 `Embers Steakhouse`). Those three are not thin-review artefacts — E4 shows the prior handles that tail correctly — so whether they belong in a top 20 is a judgment call on `m`, not a defect. Raising `m` is a settings change and gets a change-log line. | **pass** |
| E3 | empty query, geolocation denied | IS | Falls back to `aroundLatLngViaIP`, then to a default metro, and **tells the user which** — per section 5, never leave the user geo-blocked or the results unexplained. | **blocked** — describes UI behaviour; no front end exists yet. |
| E4 | empty query, ranking sanity | IS | 154318 `Ellen's Cafe` (5.0 stars, **1 review**) must not appear on the first screen. Exactly 21 records hold a 5.0, of which **18 have fewer than 50 reviews and 8 fewer than 10** — so `desc(stars_count)` alone would fill the entire first page from that pool, whatever the tie-break. With `m = 50` the Bayesian average drops 154318 to rank 2414 of 5000 and the other seven thin records to ranks 1523–2404. That gap is the justification for the prior. | **pass** |

## 9. Out-of-corpus query

Verified absent across `name`, `address`, `city`, `state`, `area`, `neighborhood`,
`food_type` and `postal_code` — not just name.

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| O1 | `momofuku` | AC+IS | 0 results, with an empty state that says so and offers a route back to browsing. Silent junk is worse than zero. | **pass** |
| O2 | `olive garden` | AC+IS | **⚠ predicted fail, confirmed 2026-09-03 (6 hits).** Truly absent, but under `removeWordsIfNoResults: lastWords` dropping `garden` leaves `olive`, which matches 6 records (100042 `Olive Press`, 56608 `Olivette`, 111679 `Olive Lucy's Kitchen Table`, 5292 `Bleu Olive`, …). The user asked for a chain and gets unrelated restaurants presented as answers. This is the motivating case for evaluating `allOptional` versus `lastWords` per section 5. | **fail** — 6 hits, not 0 — 110344 `Olive B's Big Sky`, 5292 `Bleu Olive`, 111679 `Olive Lucy's Kitchen Table`. Root cause in the baseline run above. |
| O3 | `shake shack` | AC+IS | 0 results. Also absent, but the fallback is harmless here: `shake` matches 0 names, so stripping the last word still yields nothing. Contrast with O2 — the same setting is safe on one query and harmful on the other, which is why the choice needs a case, not a preference. | **fail** — 1 hit, not 0 — 25840 `SASA`, matched on its address `13120 Shaker Square`. Root cause in the baseline run above. |
| O4 | `sushi in tokyo` | IS | Must not silently return every sushi restaurant in the US. `tokyo` is absent from the corpus entirely; the response must make clear the location constraint could not be honoured. | **fail** — 1 hit, not 0 — 41962 `In the Raw - Bricktown`, matched on the token `in`. Root cause in the baseline run above. |

## 10. Geo — the known-item / proximity conflict

Section 5's resolution, tested on real records. `Nobu` **is** in the corpus (5
locations) and **none is in Denver**, which makes CLAUDE.md's own example directly
testable rather than hypothetical.

| id | query | ctx | expectation | status |
|---|---|---|---|---|
| G1 | `nobu`, geo = Denver (39.7343, -104.9794) | AC | 4524 `Nobu Fifty Seven` (New York), 13129 `Nobu Waikiki`, 16927 `Nobu San Diego` and 99796 `Nobu Lanai` rank above **every** Denver restaurant. Text relevance leads; geo is display and tie-break only. If a Denver bistro outranks Nobu, the known-item journey is broken. | **pass** |
| G2 | `nobu`, geo = Denver | AC | 74146 `Nobuo at Teeter House` (Phoenix) and 75256 `Mitsunobu` (Menlo Park) rank **below** the four true Nobu locations. Tests that prefix and substring matches do not outrank the exact brand. | **fail** — 74146 `Nobuo at Teeter House` at rank 2, above three of the four true Nobu. Same root cause as failure group 1. See the second run above. |
| G3 | `italian`, geo = Denver | IS | Geo leads. Denver-area Italian restaurants first, but `aroundPrecision` buckets must be coarse enough that `popularity_score` breaks ties inside a bucket — a marginally closer mediocre restaurant must not outrank an excellent one two streets further. | **pass** — after restoring `geo` to position 2 on 2026-09-03. All 10 top hits in Denver, first Denver record at position 1 (was 89 of 895), and popularity strictly decreasing inside the bucket: 4.688, 4.590, 4.589, 4.589, 4.497. |
| G4 | `cyclone anaya's`, geo = Pittsburgh (40.4491, -79.9939) | AC | All 5 Houston records still returned, ~1,900 km away. A known-item query must not be filtered by proximity, only ordered by it as a tie-break. | **pass** |

---

## Settings change log

One line per settings change. One setting at a time — five at once makes the result
unattributable. A change with no motivating case does not belong here.

| date | setting changed | from → to | motivating case | improved | regressed |
|---|---|---|---|---|---|
| 2026-09-03 | *none — initial push* | — | — | baseline established: 16/23 pass | — |
| 2026-09-03 | `ranking` — position of `geo` | position 7 (below `exact`) → position 2 (Algolia default) | **G3** `italian` from Denver | G3 fail → pass. First Denver record moves from 89th of 895 to 1st; all 10 top hits in Denver; popularity strictly decreasing inside the 5 km `aroundPrecision` bucket (4.688 → 4.497), which is the tie-break §5 specified. | **none.** All 49 other cases byte-identical. G1, G2, G4 and C5 unchanged — the known-item context sends no geo parameter, so the criterion stays inert there whatever its position. |

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

1. **The `exact` tie — one lever, five cases.** K14, A2, A5, A7 and now **G2** all fail
   for the same measured reason: `exactOnSingleWordQuery` defaults to `attribute`, so the
   exact criterion is granted only when the query equals the whole attribute value. On
   `nobu`, `bistro`, `prime`, `santa fe` and `leftbank` every candidate scores `exact=0`
   or every candidate scores `exact=1`, the formula runs out of criteria, and
   `desc(popularity_score)` decides. The remaining lever is a length or word-count
   tie-break in `customRanking`, which means a new attribute from the transform and a
   section 4 schema change. Highest value on G2 and K14; questionable on A2, where the
   "correct" answer has 3 reviews.
2. **Is A2 a defect or a bad case?** 117067 `Prime` carries 3 reviews. Ranking it above
   a 1,174-review restaurant of the same name contradicts the reasoning behind
   `popularity_score`. Narrowing the case may be more honest than changing ranking.
3. **`address` in `searchableAttributes`.** It is the sole cause of O3 and it is listed
   in CLAUDE.md §5. Removing it closes the leak and removes street search, which no
   stated pain requires but which is a plausible expectation.
4. **`lastWords` or `allOptional`?** Reframed by the baseline: O2 and O4 both leak
   through word removal, O3 does not. `allOptional` must be measured against all 16
   passing cases before adoption, not just the three failures.
5. **D6 (`sushi`)** — not yet run. Confirm the split resolution holds: name-first in the
   dropdown, cuisine refinement on the page. If persona 2 users still cannot reach the
   67 `Sushi` records, the answer is a UI change, not a ranking change.
6. **E2** — not yet run. Is `m = 50` right? Three of the top 20 are 5.0-star records
   with 139–242 reviews. The thin tail is handled (E4), so this is a calibration
   judgment, not a bug.
7. ~~**Where does `geo` belong in `ranking`?**~~ **Answered and applied 2026-09-03:**
   position 2, Algolia's default. Restoring it fixed G3 with zero regressions across the
   other 49 measurable cases. The geo-first standard replica is no longer needed. What
   replaces this as a live risk is narrower: the known-item journey is now protected only
   by sending no geo parameter, so `src/searchParams.js` must keep the two contexts'
   parameters apart or G1 regresses.
8. **K18 and the ambiguous label.** The index side is correct and both colliding records
   carry `location_label_ambiguous: true`. The case cannot pass until the front end
   appends distance where the flag is set, which makes it the first hard requirement the
   UI inherits from the data model rather than from a design preference.
9. **The two missed chain members.** 70261 and 150577 carry a hyphen with no surrounding
   whitespace and never join their chains. Relaxing the whitespace guard would catch them
   and wrongly split 46 genuinely hyphenated names, so the guard stays; the question is
   whether to special-case two records or accept the gap and correct the documented
   totals.
