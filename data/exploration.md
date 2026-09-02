# Data exploration — restaurants extract

Findings from profiling `resources/dataset/restaurants_list.json` (5,000 records) and
`resources/dataset/restaurants_info.csv` (5,000 rows, semicolon-delimited) before any
index existed. Every objectID and name below is read from the extract, not transcribed.

Deliverable A is the name-level analysis that drives persona 1 relevance. Deliverable B is
the `food_type` taxonomy in `scripts/cuisine-taxonomy.json`.

Enumerations are complete, not sampled. Where a section covers hundreds of records the full
list is still given, in an appendix at the end of that section.

---

## 0. Join and method

- JSON records: 5000. CSV rows: 5000. Matched on `objectID`: **5000** — 1:1 and complete, no orphans on either side.
- CSV lines containing a double quote: **0**. No quoted fields, so splitting on `;` is safe and no CSV parser is required.
- `objectID` is an integer in the JSON and a string in the CSV; every comparison below normalises to string.
- Name comparisons are case-insensitive unless the section says otherwise. Two findings depend on case and say so explicitly.

---

# A. Name-level analysis (persona 1)

## A1. Names with treacherous spelling

### A1.1 — 59 pairs of distinct names at edit distance 1

**59 pairs of distinct restaurant names sit one character apart.** At the configured
`minWordSizefor1Typo: 4` these become mutually reachable, so typo tolerance can turn an exact
known-item query into a different restaurant. This is the single largest relevance risk for
persona 1 on this extract.

Same-city pairs are the worst case: no geo signal separates them either. They are marked below.

| name A | records A | name B | records B | same city |
|---|---|---|---|---|
| Q | 106741 (Los Angeles) | CQ | 93265 (Biloxi) |  |
| B4 | 116248 (New York) | B44 | 3598 (San Francisco) |  |
| AOC | 49894 (New York) | DOC | 51496 (Portland) |  |
| TE' | 7855 (Leola) | TEN | 144229 (Billings) |  |
| Coi | 11065 (San Francisco) | Noi | 99313 (Bend) |  |
| Roe | 95284 (Portland) | Rye | 95884 (Leawood), 105424 (Brooklyn) |  |
| Oba | 3512 (Portland) | Obao | 57874 (New York) |  |
| Oba | 3512 (Portland) | LOBA | 148015 (Miami) |  |
| Uva | 60163 (New York) | Yuva | 6666 (New York) | **yes** |
| Soto | 36775 (New York) | Soco | 63832 (Brooklyn), 150973 (Orlando) |  |
| Soto | 36775 (New York) | Moto | 118249 (Nashville) |  |
| Soto | 36775 (New York) | SATO | 151987 (Buffalo) |  |
| Ting | 103078 (Huntington) | Ming | 78496 (Edison) |  |
| Salu | 44134 (New Orleans) | SALT | 116863 (McAllen) |  |
| Yuva | 6666 (New York) | Yuba | 141115 (New York) | **yes** |
| Silo | 88030 (Nashville) | LILO | 95068 (Tappan) |  |
| Silo | 88030 (Nashville) | kilo | 108610 (New York) |  |
| Poco | 31843 (New York) | Soco | 63832 (Brooklyn), 150973 (Orlando) |  |
| Kaya | 79378 (Pittsburgh) | Naya | 148411 (Pittsburgh) | **yes** |
| Kaya | 79378 (Pittsburgh) | Maya | 23845 (Avon) |  |
| LILO | 95068 (Tappan) | kilo | 108610 (New York) |  |
| LILO | 95068 (Tappan) | Lido | 63250 (New York) |  |
| Yuba | 141115 (New York) | Cuba | 3434 (New York) | **yes** |
| Mint | 145051 (Chapel Hill) | Ming | 78496 (Edison) |  |
| Gato | 124642 (New York) | SATO | 151987 (Buffalo) |  |
| Naya | 148411 (Pittsburgh) | Maya | 23845 (Avon) |  |
| Lavo | 22078 (Las Vegas) | Lago | 109420 (North Brunswick) |  |
| Azur | 54496 (Key West) | Azure | 4339 (Daytona Beach Shores) |  |
| Vita | 10015 (Denver) | Vitae | 77257 (New York) |  |
| Vela | 26275 (San Diego) | Vella | 111202 (New York) |  |
| Luca | 3468 (Denver) | LUCCA | 82426 (Irvine) |  |
| Cata | 148687 (New York) | Catas | 72754 (Newark) |  |
| Maya | 23845 (Avon) | Mayas | 77980 (New Orleans) |  |
| Beast | 48292 (Portland) | Feast | 104584 (New York) |  |
| Prime | 117067 (Mansfield) | Primo | 2531 (Orlando) |  |
| Trevi | 3121 (Las Vegas) | Treva | 52555 (West Hartford) |  |
| Savor | 111808 (Dallas) | Savore | 4205 (New York) |  |
| Range | 4221 (San Francisco) | Grange | 26626 (Sacramento), 111739 (Westwood) |  |
| AVANT | 28180 (San Diego) | Avanti | 22690 (Phoenix) |  |
| Venue | 87379 (Lincoln) | Avenue | 5539 (Long Branch) |  |
| range | 141001 (Denver) | Grange | 26626 (Sacramento), 111739 (Westwood) |  |
| Local | 6539 (Dallas) | Locale | 48451 (Astoria) |  |
| Bin 14 | 44107 (Hoboken) | BIN 54 | 4458 (Chapel Hill) |  |
| Cafe B | 75886 (Metairie) | Cafe 4 | 25405 (Knoxville) |  |
| Branch | 140641 (Portland) | Branca | 145105 (Pittsford) |  |
| Bianca | 79360 (Miami Beach) | Branca | 145105 (Pittsford) |  |
| Oceana | 178 (New York) | Oceans | 151912 (Cathedral City) |  |
| La Boca | 31861 (Santa Fe) | La Bocca | 86815 (White Plains) |  |
| Grace's | 147448 (Houston) | Gracie's | 6533 (Portland) |  |
| Andrei's | 27205 (Irvine) | Andrea's | 99868 (Metairie) |  |
| Ricardo's | 36733 (Las Vegas) | Riccardo's | 92494 (Lake Oswego) |  |
| V Restaurant | 73453 (Murphys) | K restaurant | 23929 (Orlando) |  |
| V Restaurant | 73453 (Murphys) | M Restaurant | 13966 (Columbus) |  |
| K restaurant | 23929 (Orlando) | M Restaurant | 13966 (Columbus) |  |
| M Restaurant | 13966 (Columbus) | MW Restaurant | 113182 (Honolulu) |  |
| Tre Trattoria | 149101 (San Antonio) | The Trattoria | 105253 (Saint James) |  |
| The Ellington | 110455 (New York) | The Wellington | 59719 (San Diego) |  |
| Zins Restaurant | 32146 (Cedar Rapids) | Zinc Restaurant | 92470 (Ketchum) |  |
| Nello Restaurant | 83155 (New York) | Bello Restaurant | 43042 (New York) | **yes** |

### A1.2 — the inverse risk: names below the typo-tolerance floor

36 names have fewer than 4 alphanumeric characters and therefore receive **no**
typo tolerance at all. The floor protects them from the collisions in A1.1, at the cost of
returning nothing when a user misspells them.

| objectID | name | city | neighborhood |
|---|---|---|---|
| 111541 | Fu | Las Vegas, NV | Hard Rock Hotel |
| 95812 | VB3 | Jersey City, NJ | Jersey City |
| 90835 | D.B.A. | Akron, OH | Akron |
| 49894 | AOC | New York, NY | West Village |
| 7855 | TE' | Leola, PA | Leola |
| 35506 | 715 | Lawrence, KS | Lawrence |
| 19330 | RED | City of Industry, CA | San Gabriel Valley |
| 86953 | ORO | Raleigh, NC | Raleigh |
| 54868 | bb's | Aspen, CO | Aspen |
| 105019 | 44 & X | New York, NY | Hell's Kitchen |
| 74404 | Oak | Dallas, TX | Design District |
| 107797 | EVO | Scottsdale, AZ | Scottsdale |
| 51496 | DOC | Portland, OR | NE Portland |
| 20887 | Mez | Durham, NC | Durham |
| 144229 | TEN | Billings, MT | Billings |
| 4961 | Isa | San Francisco, CA | Marina / Cow Hollow / Presidio |
| 6958 | an | Cary, NC | Cary |
| 102517 | KOA | New York, NY | Gramercy / Flatiron |
| 19144 | Tre | New York, NY | Lower East Side |
| 3003 | VUE | Dana Point, CA | Dana Point / Monarch Beach |
| 28852 | TAG | Denver, CO | Downtown / LoDo |
| 11065 | Coi | San Francisco, CA | Financial District / Embarcadero |
| 76453 | Axe | Venice, CA | Venice |
| 116248 | B4 | New York, NY | East Village |
| 95284 | Roe | Portland, OR | SE Portland |
| 106741 | Q | Los Angeles, CA | Downtown |
| 95884 | Rye | Leawood, KS | Leawood |
| 3598 | B44 | San Francisco, CA | Downtown / Union Square |
| 3512 | Oba | Portland, OR | Pearl District |
| 13507 | BLD | Los Angeles, CA | Beverly / Fairfax / La Brea / Third St. |
| 93265 | CQ | Biloxi, MS | Biloxi |
| 38914 | SHI | Long Island City, NY | Long Island City |
| 99313 | Noi | Bend, OR | Bend |
| 105424 | Rye | Brooklyn, NY | Williamsburg |
| 64360 | Zio | New York, NY | Gramercy / Flatiron |
| 60163 | Uva | New York, NY | Upper East Side |

### A1.3 — punctuation a keyboard does not produce

| class | records | note |
|---|---|---|
| diacritics | 30 | full list below |
| curly apostrophe U+2019 | 19 | full list below; the corpus norm is the straight form |
| straight apostrophe U+0027 | 942 | the norm |
| en/em dash U+2013 / U+2014 | 15 | full list below; the corpus norm is the plain hyphen |
| plain hyphen | 1118 | the norm |

A user types `'` and `-`. The 34 records using the typographic forms are unreachable
without normalisation on both the record and the query side.

**Diacritics — all 30:**

| objectID | name | city | neighborhood |
|---|---|---|---|
| 62506 | Café Des Beaux-Arts | Palm Desert, CA | Palm Desert |
| 2294 | Wallsé | New York, NY | West Village |
| 95197 | Tía Pol | New York, NY | Chelsea |
| 103900 | Café 43 | Dallas, TX | Downtown |
| 49957 | Lüke San Antonio | San Antonio, TX | Downtown |
| 144457 | Ni. Do. Caffé | Miami, FL | MiMo / Upper East Side |
| 72391 | Keiko à Nob Hill | San Francisco, CA | Nob Hill |
| 95251 | Fadó Irish Pub & Restaurant-Denver | Denver, CO | Downtown / LoDo |
| 5812 | Café Sebastienne | Kansas City, MO | Kansas City |
| 21217 | Américas - The Woodlands | The Woodlands, TX | The Woodlands |
| 55837 | Olio Pizza e Più | New York, NY | West Village |
| 117379 | Despaña Princeton | Princeton, NJ | Princeton |
| 11425 | Ácenar | San Antonio, TX | Downtown |
| 1896 | SÉR Steak+Spirits | Dallas, TX | Downtown |
| 16978 | Purple Parrot Café | Hattiesburg, MS | Hattiesburg |
| 55267 | Cafe Español | New York, NY | Greenwich Village |
| 85327 | Affäre | Kansas City, MO | Kansas City |
| 2337 | Santé at the Fairmont Sonoma Mission Inn | Sonoma, CA | Sonoma |
| 48877 | Américas River Oaks | Houston, TX | River Oaks |
| 53773 | Café de France | Winter Park, FL | Winter Park |
| 136654 | Bread and Ink Café | Portland, OR | SE Portland |
| 33439 | MÁS Tapas y Vino | Albuquerque, NM | Albuquerque |
| 54547 | Le Bistro D’à Côté | New York, NY | Upper East Side |
| 5490 | Café Trio | Kansas City, MO | Plaza / Brookside |
| 78511 | Nové Italian Restaurant | Wilton, NY | Saratoga Springs |
| 64003 | Café 21 - University Heights | San Diego, CA | University Heights |
| 2704 | Café Central | El Paso, TX | El Paso |
| 78193 | Cervantes’ Oyster Shack at Café Select | New York, NY | NoLita |
| 58702 | The Diamond Café | Tucson, AZ | Tucson |
| 64000 | Café 21 – Gaslamp | San Diego, CA | Downtown / Gaslamp |

**Curly apostrophe — all 19:**

| objectID | name | city | neighborhood |
|---|---|---|---|
| 41374 | Rizzuto’s Restaurant and Bar - Westport | Westport, CT | Westport |
| 31156 | Pat LaFrieda’s Chop House at Citi Field | Flushing, NY | Flushing |
| 105745 | Ruffino’s on the River | Lafayette, LA | Lafayette |
| 65803 | Puckett’s Historic Downtown Franklin | Franklin, TN | Franklin / Brentwood |
| 41371 | Rizzuto’s Restaurant and Bar - West Hartford | West Hartford, CT | Hartford / West Hartford |
| 84277 | McCall’s Heartland Grill – Stratosphere Hotel | Las Vegas, NV | Stratosphere Hotel & Casino |
| 42784 | Big Daddy’s – Upper West Side | New York, NY | Upper West Side |
| 22957 | Charley’s Crab - Palm Beach | Palm Beach, FL | Palm Beach |
| 29917 | Brenner’s Steakhouse Katy Freeway | Houston, TX | West Side |
| 54547 | Le Bistro D’à Côté | New York, NY | Upper East Side |
| 91480 | Goodfella’s Brick Oven Pizza & Restaurant - Victory | Staten Island, NY | Staten Island |
| 4142 | T. Cook’s at Royal Palms Resort and Spa | Phoenix, AZ | Phoenix |
| 104878 | Bink’s Midtown | Phoenix, AZ | Phoenix |
| 61717 | Beecher’s – The Cellar | New York, NY | Gramercy / Flatiron |
| 106273 | Phil’s Italian Steak House | Las Vegas, NV | Treasure Island Hotel & Casino |
| 97180 | Range Steakhouse - Harrah’s Ak-Chin Casino Resort | Maricopa, AZ | Maricopa |
| 78193 | Cervantes’ Oyster Shack at Café Select | New York, NY | NoLita |
| 90364 | Wai’olu Ocean View Lounge | Honolulu, HI | Waikiki |
| 111406 | Theresa’s South | Bay Head, NJ | Bay Head |

**En/em dash — all 15:**

| objectID | name | city | neighborhood |
|---|---|---|---|
| 57604 | Zodiac at Neiman Marcus – Downtown Dallas | Dallas, TX | Downtown |
| 42862 | 801 Chophouse – Des Moines | Des Moines, IA | Downtown Des Moines |
| 52798 | Merriman's – Waimea – Big Island | Kamuela, HI | Kamuela |
| 110191 | BD's Mongolian Grill – Arena | Columbus, OH | Short North - Arena District |
| 94114 | Gennaro's Restaurant & Catering – Princeton | Princeton, NJ | Princeton |
| 57400 | The Four Seasons Restaurant – The Grill Room | New York, NY | Midtown East |
| 84277 | McCall’s Heartland Grill – Stratosphere Hotel | Las Vegas, NV | Stratosphere Hotel & Casino |
| 42784 | Big Daddy’s – Upper West Side | New York, NY | Upper West Side |
| 150487 | Harvest Organic Grille – Galleria | Houston, TX | Galleria / Uptown |
| 67369 | Oro at The Emily Morgan Hotel– a DoubleTree by Hilton | San Antonio, TX | Downtown |
| 61717 | Beecher’s – The Cellar | New York, NY | Gramercy / Flatiron |
| 64000 | Café 21 – Gaslamp | San Diego, CA | Downtown / Gaslamp |
| 110209 | BD's Mongolian Grill – Dublin | Dublin, OH | Dublin |
| 11896 | Peohe's – Coronado Waterfront Restaurant | Coronado, CA | Coronado |
| 63439 | Lasagna Restaurant – Chelsea | New York, NY | Chelsea |

**Chains mixing both dash glyphs across their own locations — all 5:**

The separator is inconsistent inside a single brand, so a chain cannot be grouped on the glyph.

*Zodiac at Neiman Marcus*

| objectID | name (raw) | city |
|---|---|---|
| 57604 | `Zodiac at Neiman Marcus – Downtown Dallas` | Dallas |
| 102688 | `Zodiac at Neiman Marcus - San Diego` | San Diego |

*Merriman's*

| objectID | name (raw) | city |
|---|---|---|
| 52798 | `Merriman's – Waimea – Big Island` | Kamuela |
| 35704 | `Merriman's - Poipu` | Koloa |
| 22207 | `Merriman's - Kapalua, Maui` | Lahaina |

*BD's Mongolian Grill*

| objectID | name (raw) | city |
|---|---|---|
| 110191 | `BD's Mongolian Grill – Arena` | Columbus |
| 110188 | `BD's Mongolian Grill - Easton` | Columbus |
| 110209 | `BD's Mongolian Grill – Dublin` | Dublin |

*Big Daddy's*

| objectID | name (raw) | city |
|---|---|---|
| 30991 | `Big Daddy's - Gramercy Park` | New York |
| 42784 | `Big Daddy’s – Upper West Side` | New York |

*Café 21*

| objectID | name (raw) | city |
|---|---|---|
| 64003 | `Café 21 - University Heights` | San Diego |
| 64000 | `Café 21 – Gaslamp` | San Diego |

### A1.4 — abbreviations with a period

66 names carry an abbreviation. Users type the expansion: "Pappas Brothers" for
`Pappas Bros.`, "Mount Fuji" for `Mt. Fuji`, "DBA" for `D.B.A.`. These need synonyms, not typo
tolerance — the edit distance between "Bros." and "Brothers" is 3.

| objectID | name | city | neighborhood |
|---|---|---|---|
| 6852 | Catalina Barbeque Co. & Sports Bar | Tucson, AZ | Tucson |
| 10858 | G. Michael's Bistro & Bar | Columbus, OH | German Village |
| 27235 | A. Michael's | Kokomo, IN | Kokomo |
| 1959 | Pappas Bros. Steakhouse | Dallas, TX | NW Dallas / Love Field Area |
| 84844 | Kamuela Provision Co. | Waikoloa, HI | Waikoloa |
| 95227 | Dragon Noodle Co. - Monte Carlo | Las Vegas, NV | Monte Carlo Hotel & Casino |
| 11284 | J. Bruner's | Osage Beach, MO | Lake of the Ozarks |
| 90835 | D.B.A. | Akron, OH | Akron |
| 45757 | Mt. Fuji Japanese Steakhouse | Westminster, CO | Westminster |
| 148765 | Rio Grande - Ft. Collins | Fort Collins, CO | Fort Collins |
| 111100 | Goode Co. Seafood - Katy Freeway | Houston, TX | West Side |
| 97210 | Atria's - Mt. Lebanon | Mount Lebanon, PA | Mt. Lebanon |
| 110467 | J. Alexander's - Denver | Englewood, CO | Englewood |
| 49108 | 12th Ave. Grill | Honolulu, HI | Honolulu |
| 106171 | Kula Lodge & Restaurant, Inc. | Kula, HI | Upcountry |
| 56527 | C.R. Gibbs American Grille | Redding, CA | Redding |
| 139147 | Mr. Adams Steakhouse | Newark, NJ | Newark |
| 104587 | Mario's Restaurant - Arthur Ave. | Bronx, NY | Bronx |
| 23257 | Salut Bar Americain - St. Paul | St. Paul, MN | St. Paul |
| 20350 | Monterey Bay Fish Grotto - Mt. Washington | Pittsburgh, PA | Mt. Washington |
| 111559 | MAX's Wine Dive Houston - Fairview St. | Houston, TX | Midtown / Montrose |
| 71659 | J. Razzo's | Carmel, IN | Carmel / Westfield |
| 144457 | Ni. Do. Caffé | Miami, FL | MiMo / Upper East Side |
| 4294 | Y.O. Ranch Steakhouse | Dallas, TX | Downtown |
| 90601 | Fleetwood's On Front St. | Lahaina, HI | Lahaina |
| 59758 | Acme Food & Beverage Co. | Carrboro, NC | Carrboro |
| 23365 | Berryhill & Co. | Boise, ID | Boise |
| 62590 | SanTan Brewing Co. | Chandler, AZ | Chandler |
| 7542 | M ST. Cafe | St. Paul, MN | St. Paul |
| 13480 | Itta Bena at B.B. King's | Memphis, TN | Downtown |
| 47158 | Hapa Sushi Grill & Sake Bar - Pearl St. Boulder | Boulder, CO | Boulder |
| 103723 | J. Coco | Omaha, NE | Midtown |
| 110488 | J. Alexander's - Jacksonville | Jacksonville, FL | Jacksonville |
| 42781 | B.B. King's Blues Club - Memphis | Memphis, TN | Memphis |
| 43015 | E.B. Green's Steakhouse | Buffalo, NY | Buffalo |
| 110464 | J. Alexander's - Columbus | Columbus, OH | Worthington |
| 2401 | St. Elmo Steak House | Indianapolis, IN | Downtown Indy |
| 76309 | T.J. Byrnes | New York, NY | Financial District |
| 4579 | Engine Co. No. 28 | Los Angeles, CA | Downtown |
| 7742 | The Oak Room - The Westin St. Francis | San Francisco, CA | Downtown / Union Square |
| 1854 | Pappas Bros. Steakhouse | Houston, TX | Galleria / Uptown |
| 84271 | Portland Seafood Co. - Washington Square | Tigard, OR | Tigard |
| 82024 | G. Foley's | Panama City, FL | Panama City Beach - Bay Point |
| 52498 | East India Co. Grill & Bar | Portland, OR | Downtown |
| 53935 | Mr. John's Steakhouse | New Orleans, LA | Garden District |
| 111412 | Washington St. Bistro | Morristown, NJ | Morristown |
| 140866 | The Land and Water Co. | Carlsbad, CA | Carlsbad |
| 4142 | T. Cook’s at Royal Palms Resort and Spa | Phoenix, AZ | Phoenix |
| 55471 | Amura - Dr. Phillips | Orlando, FL | I Drive / Sand Lake |
| 36412 | Makana Terrace - St. Regis - Hawaii | Princeville, HI | Princeville |
| 139660 | Crisp. Wine, Beer, & Eatery | Houston, TX | Heights / Washington |
| 46051 | St. Clair Winery & Bistro | Albuquerque, NM | Albuquerque |
| 118084 | J. Razzo's 2 | Westfield, IN | Westfield |
| 78766 | Tandoor & Co. Restaurant | Rego Park, NY | Rego Park |
| 61312 | St. Andrews | New York, NY | Midtown West |
| 110227 | House. Wine. & Bistro | Mcallen, TX | McAllen |
| 10045 | Steak House No. 316 | Aspen, CO | Aspen |
| 102514 | Cucina & Co. | New York, NY | Rockefeller Center Midtown |
| 86113 | Chefs Club Aspen - St. Regis Aspen | Aspen, CO | Aspen |
| 56047 | B. Cafe West | New York, NY | Upper West Side |
| 84259 | Portland Seafood Co. - Mall 205 | Portland, OR | SE Portland |
| 7114 | B.B. King's Blues Club | Nashville, TN | Downtown |
| 110485 | J. Alexander's - Houston | Houston, TX | Westchase |
| 20971 | P. F. Chang's - Waikiki | Honolulu, HI | Waikiki |
| 36415 | Kauai Grill - St. Regis - Hawaii | Princeville, HI | Princeville |
| 7705 | Black Hat Cattle Co. | Kittredge, CO | Evergreen |

### A1.5 — digits in the name

257 names contain a digit. Two distinct problems: users spell numbers out ("twelve
Baltimore" for `12 Baltimore`), and `allowTyposOnNumericTokens: false` means a mistyped digit
returns nothing. Note `Eleven` / `ELEVEN` in A2.1, where the number is spelled out instead.

| objectID | name | city | neighborhood |
|---|---|---|---|
| 145747 | Prime 47 - Carmel | Carmel, IN | Carmel / Westfield |
| 144688 | Prime 47 - Indianapolis | Indianapolis, IN | Downtown Indy |
| 79990 | Seasons 52 - Roosevelt Field | Garden City, NY | Garden City |
| 104623 | West 29th | Wheat Ridge, CO | Wheat Ridge |
| 35986 | 42nd Street Oyster Bar | Raleigh, NC | Raleigh |
| 107503 | Pier 115 Bar and Grill | Edgewater, NJ | Edgewater |
| 102619 | 1 North Steakhouse | Hampton Bays, NY | Hampton Bays |
| 92827 | 53 by the Sea | Honolulu, HI | Honolulu |
| 31141 | 12 Baltimore | Kansas City, MO | Downtown / River Market |
| 4478 | Bocca Di Bacco (Theatre District - 45th St.) | New York, NY | Theater District / Times Square |
| 70639 | Seasons 52 - Kansas City | Kansas City, MO | Plaza / Brookside |
| 90436 | 247 Craven | New Bern, NC | New Bern |
| 38473 | Local 92 | New York, NY | East Village |
| 49378 | 360 Bistro | Nashville, TN | Belle Meade |
| 95812 | VB3 | Jersey City, NJ | Jersey City |
| 26494 | Carolina 1663 | Chapel Hill, NC | Chapel Hill |
| 72937 | 40/40 Club | New York, NY | Chelsea |
| 42862 | 801 Chophouse – Des Moines | Des Moines, IA | Downtown Des Moines |
| 94843 | Seasons 52 - San Diego | San Diego, CA | University City/Golden Triangle |
| 27010 | Henry's 12th Street Tavern | Portland, OR | Pearl District |
| 33781 | Bistro 234 | Turlock, CA | Turlock |
| 109345 | Bistro 2110 - The Blackwell Hotel | Columbus, OH | Columbus |
| 55396 | 107 West | New York, NY | Upper West Side |
| 53362 | CK14 - The Crooked Knife at 14th Street | New York, NY | Chelsea |
| 3317 | KITCHEN 1540 | Del Mar, CA | Del Mar |
| 44107 | Bin 14 | Hoboken, NJ | Hoboken |
| 25435 | 333 Pacific - Steaks & Seafood | Oceanside, CA | Oceanside |
| 106258 | 1899 Bar & Grill | Flagstaff, AZ | Flagstaff |
| 28147 | 221 South Oak Bistro | Telluride, CO | Telluride |
| 20839 | Angelo's 677 Prime | Albany, NY | Albany |
| 63034 | Bistro 1051 | Clark, NJ | Clark |
| 73885 | 1 Vizio | New York, NY | Midtown West |
| 301 | 21 Club | New York, NY | Midtown West |
| 49108 | 12th Ave. Grill | Honolulu, HI | Honolulu |
| 35506 | 715 | Lawrence, KS | Lawrence |
| 20992 | Room 39 - Leawood | Leawood, KS | Leawood |
| 41683 | Bistro 44 | Northport, NY | Northport |
| 31126 | 44 1/2 Hell's Kitchen | New York, NY | Hell's Kitchen |
| 103849 | The Park 112 | New York, NY | Harlem |
| 43345 | Carpe Vino (21+ Establishment) | Auburn, CA | Auburn |
| 79963 | 900 Park Restaurant | Bronx, NY | Bronx |
| 109933 | Route 66 | New York, NY | Hell's Kitchen |
| 108235 | 350 First - Doubletree Hilton | Cedar Rapids, IA | Cedar Rapids |
| 102115 | Stella 34 Trattoria | New York, NY | Midtown West |
| 72058 | 10 Below | Bend, OR | Bend |
| 69640 | Butterfield 8 Restaurant & Lounge | New York, NY | Midtown East |
| 115387 | SEA 180 | Imperial Beach, CA | Imperial Beach |
| 51589 | Bistro 39 | San Diego, CA | Del Mar |
| 56284 | Chat 19 | Larchmont, NY | Larchmont |
| 139141 | Iris Cafe - Store #9 | Brooklyn, NY | Brooklyn Heights |
| 70954 | 801 Chophouse Leawood | Leawood, KS | Leawood |
| 103900 | Café 43 | Dallas, TX | Downtown |
| 112312 | 404 Kitchen | Nashville, TN | The Gulch |
| 90766 | Park 25 Bistro | Nashville, TN | West End |
| 62491 | ON20 | Hartford, CT | Hartford / West Hartford |
| 50173 | Seasons 52 - Phoenix | Phoenix, AZ | Phoenix |
| 49339 | Flex Mussels - 13th Street | New York, NY | West Village |
| 16609 | 1300 on Fillmore | San Francisco, CA | Pacific Heights |
| 48865 | 20nine Restaurant & Wine Bar | San Antonio, TX | Alamo Heights |
| 94402 | Andrea's 25 - Woodbury | Woodbury, NY | Woodbury |
| 110197 | 801 Fish - Leawood | Leawood, KS | Leawood |
| 117997 | Hudson 29 | Upper Arlington, OH | Upper Arlington |
| 152662 | Galatoire's 33 Bar and Steak | New Orleans, LA | French Quarter |
| 113185 | Seasons 52 San Diego - The Headquarters | San Diego, CA | Downtown / Gaslamp |
| 105988 | Salt 88 | Omaha, NE | West Omaha |
| 150913 | Bistro 60 | La Quinta, CA | La Quinta |
| 48475 | 5 Palms Restaurant | Kihei, HI | Wailea |
| 43162 | Parma 8200 | Bloomington, MN | Bloomington |
| 6075 | 1 Darbar | New York, NY | Midtown East |
| 109054 | Jean Claude 2 | New York, NY | Upper East Side |
| 32962 | Lucky 32 Southern Kitchen - Cary | Cary, NC | Cary |
| 105019 | 44 & X | New York, NY | Hell's Kitchen |
| 5341 | RARE650 | Syosset, NY | Syosset |
| 91783 | 024 Grille | Houston, TX | West Side |
| 2311 | Parallel 37 | San Francisco, CA | Nob Hill |
| 32059 | Prime 108 | Nashville, TN | The Gulch |
| 110278 | Vintage 1891 Kitchen | Larchmont, NY | Larchmont |
| 15796 | 5 fifty 5 | New Orleans, LA | Central Business District |
| 10105 | 7 on Fulton | New Orleans, LA | Warehouse District |
| 115333 | E3 Chophouse | Steamboat Springs, CO | Steamboat Springs |
| 115180 | 100 Steps Supper Club + Raw Bar | Cranford, NJ | Cranford |
| 115876 | Local 22 Kitchen and Bar | Durham, NC | Durham |
| 16861 | Vin48 Restaurant Wine Bar | Avon, CO | Avon |
| 58060 | 7M Grill | Omaha, NE | West Omaha |
| 22585 | Big 4 Restaurant | San Francisco, CA | Nob Hill |
| 29185 | Andrew's 228 | Tallahassee, FL | Tallahassee |
| 4643 | Element 47 | Aspen, CO | Aspen |
| 116917 | Ginger 108 | Kinston, NC | Kinston |
| 30547 | 94th Aero Squadron - San Diego | San Diego, CA | Kearny Mesa |
| 40687 | Five21 - The Oread Hotel | Lawrence, KS | Lawrence |
| 70606 | Table 3 Restaurant and Market | Nashville, TN | Nashville |
| 26983 | Area 31 - Epic Hotel | Miami, FL | Downtown Miami |
| 49000 | 5th and Wine | Scottsdale, AZ | Scottsdale |
| 94081 | 83 1/2 | New York, NY | Upper East Side |
| 65800 | Puckett's 5th & Church | Nashville, TN | Downtown |
| 111379 | Hiro 88 - Lincoln | Lincoln, NE | Lincoln |
| 117202 | Pub 5 | Nashville, TN | Nashville |
| 35062 | 1913 Restaurant | Indianapolis, IN | Downtown Indy |
| 21715 | 315 Restaurant & Wine Bar | Santa Fe, NM | Santa Fe |
| 71200 | SideBar 122 | Columbus, OH | Columbus |
| 10042 | 8100 Mountainside Bar & Grill | Avon, CO | Beaver Creek |
| 7367 | Latitude 41 | Columbus, OH | Columbus |
| 4458 | BIN 54 | Chapel Hill, NC | Chapel Hill |
| 3755 | TWENTY6 | La Quinta, CA | La Quinta |
| 92968 | Bocci's on 7th | Portland, OR | SE Portland |
| 111097 | number 13 | Galveston, TX | Galveston |
| 15991 | 1796 Room at Bedford Springs | Bedford, PA | Bedford |
| 37894 | Penthouse 808 at the Ravel Hotel | Long Island City, NY | Long Island City |
| 79600 | 5 Napkin Burger - Union Square | New York, NY | Union Square |
| 100660 | Seasons 52 - Sacramento | Sacramento, CA | Arden Fair |
| 96460 | Vintage 423 | Albuquerque, NM | Albuquerque |
| 6343 | 18 Seaboard | Raleigh, NC | Raleigh |
| 92539 | Cellar 49 at Tarrytown House Estate | Tarrytown, NY | Tarrytown |
| 2683 | 1500 OCEAN at the Hotel Del Coronado | Coronado, CA | Coronado |
| 71956 | The 10th | Vail, CO | Vail |
| 51721 | 1 or 8 | Brooklyn, NY | Williamsburg |
| 7079 | Kafe 421 | Minneapolis, MN | Downtown / North Loop |
| 150859 | 1884 Restaurant and Bar | Eustis, FL | Eustis |
| 93037 | Plate 38 | Pasadena, CA | Pasadena |
| 80746 | 89 Fish and Grill | Columbus, OH | Columbus |
| 108370 | Kitchen428 Restaurant | Woodland, CA | Woodland |
| 152332 | Roux 30a | Santa Rosa Beach, FL | Destin |
| 53113 | The Rail House 1449 | Rahway, NJ | Rahway |
| 106159 | 1313 Main | Napa, CA | Napa |
| 101281 | Kitchen 56 | Phoenix, AZ | Phoenix |
| 22792 | Fishermen's Grotto #9 | San Francisco, CA | Fisherman's Wharf |
| 48736 | Seasons 52 - Plano | Plano, TX | Plano |
| 39706 | JW Marriott San Antonio - 18 Oaks | San Antonio, TX | North San Antonio |
| 113188 | Seasons 52 Houston City Centre | Houston, TX | West Side |
| 48904 | Bistro 18 | Montclair, NJ | Montclair |
| 34009 | Bond 45 | New York, NY | Theater District / Times Square |
| 151189 | Seasons 52 - Princeton | Princeton, NJ | Princeton |
| 25405 | Cafe 4 | Knoxville, TN | Knoxville |
| 50104 | Cafe 501 - Classen Curve | Oklahoma City, OK | Oklahoma City |
| 79417 | FT33 | Dallas, TX | Design District |
| 62827 | Steakhouse 85 | New Brunswick, NJ | New Brunswick |
| 17887 | ONE 53 | Rocky Hill, NJ | Princeton |
| 37759 | Via 45 | Red Bank, NJ | Red Bank |
| 104458 | Chop House 88 | Vero Beach, FL | Vero Beach |
| 141181 | Max 40 | Danbury, CT | Danbury |
| 35797 | Ten22 | Sacramento, CA | Sacramento |
| 138865 | Steak 44 | Phoenix, AZ | Phoenix |
| 43765 | Bistro 245 | Key West, FL | Key West |
| 49969 | 3Vinos | Covina, CA | Covina |
| 6047 | UPSTAIRS 2 | Los Angeles, CA | West Los Angeles |
| 4579 | Engine Co. No. 28 | Los Angeles, CA | Downtown |
| 110836 | 347 Grill | Maricopa, AZ | Maricopa |
| 23059 | Ocean 60 | Atlantic Beach, FL | Jacksonville Beach |
| 7039 | 411 West | Chapel Hill, NC | Chapel Hill |
| 61447 | Hiro 88 | Omaha, NE | Downtown / Old Market |
| 79678 | Tavern 29 | New York, NY | Murray Hill |
| 140089 | 40 Steak + Seafood | Bismarck, ND | Bismarck |
| 40456 | 5 Napkin Burger - Upper West Side | New York, NY | Upper West Side |
| 10681 | Seasons 52 - Orlando | Orlando, FL | I Drive / Sand Lake |
| 74161 | Cafe 225 | Visalia, CA | Visalia |
| 28474 | 24Grille | Detroit, MI | Detroit |
| 112096 | Table 28 - Best West Governors Suites - Little Rock | Little Rock, AR | Little Rock |
| 115924 | Osteria 166 | Buffalo, NY | Buffalo |
| 31924 | Armani Ristorante 5th Avenue | New York, NY | Midtown East |
| 105211 | 38 Degrees Ale House and Grill | Alhambra, CA | Alhambra |
| 150442 | Lot 2 Restaurant & Wine Bar | Omaha, NE | Midtown |
| 6633 | BIN189 | Lake Arrowhead, CA | Redlands |
| 151906 | 47 Scott | Tucson, AZ | Tucson |
| 103780 | 12 Islands of Stirling | Stirling, NJ | Stirling |
| 106432 | East 12th Osteria | New York, NY | East Village |
| 2676 | 1515 Restaurant | Denver, CO | Downtown / LoDo |
| 77527 | Rooftop 120 | Glastonbury, CT | Glastonbury |
| 100249 | Bistro 72 At Hotel Indigo East End | Riverhead, NY | Riverhead |
| 92527 | Pennsylvania 6 | New York, NY | Midtown West |
| 31597 | Latitude 41 | Mystic, CT | Mystic |
| 129364 | Cellar 6 | Saint Augustine, FL | St. Augustine |
| 76681 | Connolly's Pub and Restaurant - 47th | New York, NY | Midtown East |
| 140854 | Table 13 | Addison, TX | North Dallas / Addison |
| 147691 | Anson11 | El Paso, TX | El Paso |
| 58438 | Alexander's on 30th | San Diego, CA | North Park |
| 118852 | 630 Park Steakhouse - Graton Resort & Casino | Rohnert Park, CA | Rohnert Park |
| 106723 | 3 Point | Akron, OH | Akron |
| 42790 | Somers 202 Restaurant and Grill | Yorktown Heights, NY | Somers, NY |
| 107158 | Delizia 92 | New York, NY | Yorkville |
| 99262 | 2 Cents | Key West, FL | Key West |
| 147829 | Union 50 | Indianapolis, IN | Downtown Indy |
| 41743 | Corridor 44 | Denver, CO | Downtown / LoDo |
| 45664 | OP 1906 | Overland Park, KS | Overland Park |
| 38941 | 1808 American Bistro | Delaware, OH | Delaware |
| 113794 | Seasons 52 - Edison | Edison, NJ | Edison |
| 85966 | The 43rd Restaurant & Lounge | Houston, TX | Downtown |
| 103933 | 709 Point Beach | Point Pleasant Beach, NJ | Point Pleasant Beach |
| 76051 | Table 100 | Flowood, MS | Jackson |
| 144529 | Tavern 245 | Pittsburgh, PA | Downtown |
| 84388 | Bistro 46 @ Holiday Inn Plainview | Plainview, NY | Plainview |
| 115708 | Seasons 52 - Memphis | Memphis, TN | Memphis |
| 139267 | 800 Maple | Williamsville, NY | Buffalo |
| 16057 | Table 6 | Denver, CO | Cherry Creek |
| 116248 | B4 | New York, NY | East Village |
| 28099 | 1808 Grille | Nashville, TN | West End |
| 116374 | Olympia Grill at Pier 21 | Galveston, TX | Galveston |
| 96604 | Stampede 66 | Dallas, TX | Uptown |
| 77263 | Barrio 47 | New York, NY | West Village |
| 5479 | 310 Park South | Winter Park, FL | Winter Park |
| 72238 | 9380 | Mt. Crested Butte, CO | Crested Butte |
| 5604 | Cafeteria 15L | Sacramento, CA | Sacramento |
| 25750 | 310 Lakeside | Orlando, FL | Downtown Orlando |
| 41908 | Cellar 58 | New York, NY | East Village |
| 7581 | Circa 1922 | Wilmington, NC | Wilmington |
| 118084 | J. Razzo's 2 | Westfield, IN | Westfield |
| 4254 | Murals on 54 | New York, NY | Midtown West |
| 5261 | Bistro 921 | Portland, OR | Downtown |
| 57103 | Wine 30 | New York, NY | Murray Hill |
| 68488 | 3 Doors Down | Portland, OR | SE Portland |
| 66199 | Rue 57 | New York, NY | Midtown West |
| 60424 | Vue on 30A | Santa Rosa Beach, FL | Santa Rosa Beach |
| 7121 | Pier 500 | Hudson, WI | Hudson |
| 37246 | Oceans 234 | Deerfield Beach, FL | Deerfield Beach |
| 74482 | Grille 39 | Carmel, IN | Carmel / Westfield |
| 109003 | Mac 24/7 Bar & Restaurant | Honolulu, HI | Waikiki |
| 59869 | Tasca Brava 607 | Raleigh, NC | Raleigh |
| 10045 | Steak House No. 316 | Aspen, CO | Aspen |
| 31360 | Boulevard Five72 | Kenilworth, NJ | Kenilworth |
| 2654 | Uncle Jack's Steakhouse - Westside 9th Avenue | New York, NY | Midtown West |
| 3598 | B44 | San Francisco, CA | Downtown / Union Square |
| 87673 | Sangria 46 | New York, NY | Theater District / Times Square |
| 72328 | 51Fifteen Restaurant & Lounge | Houston, TX | Galleria / Uptown |
| 64003 | Café 21 - University Heights | San Diego, CA | University Heights |
| 149308 | The 9th Door - Beauvallon | Denver, CO | Central |
| 107689 | 14 North Restaurant | Bozeman, MT | Bozeman |
| 28114 | Ocean2000 | Ft. Lauderdale, FL | Fort Lauderdale |
| 104785 | Seasons 52 - Westheimer | Houston, TX | Galleria / Uptown |
| 7901 | 230 Forest Avenue | Laguna Beach, CA | Laguna Beach |
| 92449 | Katz 21 Steak and Spirits | Corpus Christi, TX | Corpus Christi |
| 51841 | Tavern58 at Gibbs | Rochester, NY | Rochester |
| 55237 | Bistro 109 | Sevierville, TN | Sevierville |
| 19546 | Twenty/20 Grill & Wine Bar - Sheraton Carlsbad Resort & Spa | Carlsbad, CA | Carlsbad |
| 44110 | Taste 99 | Farmingdale, NY | Farmingdale |
| 91408 | 54 Below | New York, NY | Theater District / Times Square |
| 71791 | Cinema Cafe 34th Street | New York, NY | Murray Hill |
| 94399 | Andrea's 25 of Commack | Commack, NY | Commack |
| 84259 | Portland Seafood Co. - Mall 205 | Portland, OR | SE Portland |
| 91138 | 23Hoyt | Portland, OR | NW Portland |
| 99886 | 121 Restaurant & Bar - North Salem | North Salem, NY | North Salem |
| 11788 | Silo Elevated Cuisine - 1604 | San Antonio, TX | North San Antonio |
| 7549 | The Stockyards Restaurant & 1889 Saloon | Phoenix, AZ | Phoenix |
| 60085 | Ciao! 2 An Italian Cafe | Pittsburgh, PA | Robinson Township |
| 64000 | Café 21 – Gaslamp | San Diego, CA | Downtown / Gaslamp |
| 79363 | Paris 66 | Pittsburgh, PA | Shadyside |
| 109690 | 100% de Agave | Denver, CO | Downtown / LoDo |
| 81781 | Hiro 88 West | Omaha, NE | West Omaha |
| 33070 | 48 Lounge | New York, NY | Rockefeller Center Midtown |
| 42853 | 801 Chophouse at the Paxton | Omaha, NE | Downtown / Old Market |
| 44389 | Satchel's on 6th | Denver, CO | Central |
| 70798 | Marker 32 | Jacksonville, FL | Jacksonville |
| 76903 | Estancia 460 | New York, NY | TriBeCa - Downtown |
| 108424 | Five50 - Aria | Las Vegas, NV | Aria Hotel & Casino |
| 65662 | Restaurant Five-0-Three | West Linn, OR | West Linn |
| 104974 | Root25 Taphouse & Kitchen | Denver, CO | Tech Center / Greenwood Village |
| 20128 | eighty3 | Memphis, TN | Downtown |
| 92986 | Topo's 403 | Bloomington, IN | Bloomington |
| 65866 | Bamboo 52 | New York, NY | Midtown West |

### A1.6 — concatenation

**Distinct names that collapse to the same token when punctuation and spaces are removed — all 2:**

Both are case-only differences, which means an exact-name lookup that respects case would split
them while a normalised lookup merges them.

`eleven` ←

| objectID | name | city | neighborhood |
|---|---|---|---|
| 150715 | Eleven | Ashland, OR | Ashland |
| 3204 | ELEVEN | Pittsburgh, PA | Downtown |

`range` ←

| objectID | name | city | neighborhood |
|---|---|---|---|
| 4221 | Range | San Francisco, CA | Mission |
| 141001 | range | Denver, CO | Downtown / LoDo |

**Two short words, high glue risk — all 614:**

A user typing these without the space produces a token that matches nothing unless the index
decompounds. Listed with the glued form a user would actually type.

| objectID | name | glued form | city |
|---|---|---|---|
| 113494 | Plates Kitchen | `plateskitchen` | Raleigh |
| 11080 | Indigo Crow | `indigocrow` | Corrales |
| 65758 | Left Bank | `leftbank` | New York |
| 113719 | Taberna Tapas | `tabernatapas` | Durham |
| 41668 | Tribeca Tavern | `tribecatavern` | Cary |
| 23812 | Urban Farmer | `urbanfarmer` | Portland |
| 104071 | Red Knot | `redknot` | Kenilworth |
| 110026 | Center Bar | `centerbar` | New York |
| 50578 | Snack Taverna | `snacktaverna` | New York |
| 44743 | Chutney Masala | `chutneymasala` | Irvington |
| 113173 | Pink Pony | `pinkpony` | Scottsdale |
| 59518 | Cafe Ronda | `caferonda` | New York |
| 5545 | Roaring Fork | `roaringfork` | Scottsdale |
| 36817 | Tipsy Parson | `tipsyparson` | New York |
| 47731 | Hudson Grille | `hudsongrille` | White Plains |
| 21748 | Bistro Milano | `bistromilano` | New York |
| 113743 | La Vara | `lavara` | Brooklyn |
| 108874 | da Umberto | `daumberto` | New York |
| 32092 | Grotta Azzurra | `grottaazzurra` | New York |
| 88504 | NORTH Arcadia | `northarcadia` | Phoenix |
| 54217 | Soi Four | `soifour` | Scottsdale |
| 104986 | Ivy Kitchen | `ivykitchen` | Dallas |
| 104146 | Just Dinner | `justdinner` | Houston |
| 60130 | Mont Blanc | `montblanc` | New York |
| 50998 | Metro North | `metronorth` | Princeton |
| 68620 | Bombay Bistro | `bombaybistro` | Franklin |
| 105634 | Tala Bistro | `talabistro` | Latham |
| 149428 | Calle Dao | `calledao` | New York |
| 3730 | The Fort | `thefort` | Morrison |
| 14788 | Bar Boulud | `barboulud` | New York |
| 87946 | Union Cafe | `unioncafe` | Columbus |
| 117352 | Ceviche Arigato | `cevichearigato` | Weston |
| 63073 | Banana Cafe | `bananacafe` | Key West |
| 126853 | BXL Cafe | `bxlcafe` | New York |
| 108289 | Petit Poulet | `petitpoulet` | New York |
| 80470 | BXL East | `bxleast` | New York |
| 92467 | The Pass | `thepass` | Houston |
| 4855 | Island Prime | `islandprime` | San Diego |
| 100042 | Olive Press | `olivepress` | Pittsburgh |
| 3393 | Coco Palm | `cocopalm` | Pomona |
| 55972 | Piccolo Mondo | `piccolomondo` | Arlington |
| 56410 | Harbor Lights | `harborlights` | East Norwalk |
| 136114 | Mi Nidito | `minidito` | New York |
| 86518 | Casa Pepe | `casapepe` | Brooklyn |
| 69295 | Saiko Sushi | `saikosushi` | Coronado |
| 61933 | AG Kitchen | `agkitchen` | New York |
| 87847 | Chez Oskar | `chezoskar` | Brooklyn |
| 29929 | The Mission | `themission` | Scottsdale |
| 106828 | Bay Harbor | `bayharbor` | Sandusky |
| 95824 | Keei Cafe | `keeicafe` | Kealakekua |
| 46783 | Hefner Grill | `hefnergrill` | Oklahoma City |
| 109303 | the plimoth | `theplimoth` | Denver |
| 19276 | Sushi Sasa | `sushisasa` | Denver |
| 111574 | The Gladly | `thegladly` | Phoenix |
| 112522 | The Pines | `thepines` | Brooklyn |
| 104917 | Erie Grill | `eriegrill` | Pittsford |
| 103819 | Orange Blossom | `orangeblossom` | Miami Beach |
| 3920 | La Pastaia | `lapastaia` | San Jose |
| 1688 | The Park | `thepark` | New York |
| 49 | Le Charm | `lecharm` | San Francisco |
| 94264 | Silver Grille | `silvergrille` | Silverton |
| 115621 | Le Baratin | `lebaratin` | New York |
| 36595 | Seito Sushi | `seitosushi` | Orlando |
| 114091 | Cafe SFA | `cafesfa` | New York |
| 102958 | Adobe Rose | `adoberose` | Artesia |
| 90091 | Boca Bistro | `bocabistro` | Saratoga Springs |
| 7638 | OAKLEYS bistro | `oakleysbistro` | Indianapolis |
| 8088 | Madrona Manor | `madronamanor` | Healdsburg |
| 2128 | Midtown Cafe | `midtowncafe` | Nashville |
| 117358 | Mar Belo | `marbelo` | Long Branch |
| 25675 | Park Heights | `parkheights` | Tupelo |
| 2431 | Mercer Kitchen | `mercerkitchen` | New York |
| 51049 | MICHAEL MINA | `michaelmina` | San Francisco |
| 70129 | El Camion | `elcamion` | New York |
| 66856 | NoMa Social | `nomasocial` | New Rochelle |
| 6345 | Sea Change | `seachange` | Minneapolis |
| 74587 | Wine Dive | `winedive` | Wichita |
| 77593 | Coal Vines | `coalvines` | Kansas City |
| 2818 | Cafe Japengo | `cafejapengo` | San Diego |
| 86434 | Park Cafe | `parkcafe` | Nashville |
| 14734 | One South | `onesouth` | Indianapolis |
| 99157 | Zen Sai | `zensai` | Miami Beach |
| 33127 | Century House | `centuryhouse` | Latham |
| 66484 | La Carafe | `lacarafe` | New York |
| 66217 | Tosca Cafe | `toscacafe` | New York |
| 97048 | Boccone South | `bocconesouth` | South Orange |
| 112873 | City Grocery | `citygrocery` | Oxford |
| 111706 | Saint George | `saintgeorge` | Hastings-On-Hudson |
| 34069 | Peli Peli | `pelipeli` | Houston |
| 41530 | El Chorro | `elchorro` | Paradise Valley |
| 40807 | Piccolo Arancio | `piccoloarancio` | Farmington |
| 79240 | Little Hen | `littlehen` | Apex |
| 102634 | Gazen Izakaya | `gazenizakaya` | Honolulu |
| 91066 | Jado Sushi | `jadosushi` | New York |
| 99715 | Adega Grill | `adegagrill` | Newark |
| 141262 | North Light | `northlight` | Portland |
| 42826 | Park Kitchen | `parkkitchen` | Portland |
| 140656 | Cypress Grille | `cypressgrille` | Boerne |
| 74941 | Cajun Pacific | `cajunpacific` | San Francisco |
| 100132 | Tarla Grill | `tarlagrill` | Napa |
| 116227 | Thirsty Lion | `thirstylion` | Hillsboro |
| 34375 | Seven Bistro | `sevenbistro` | New York |
| 103111 | Fatty Crab | `fattycrab` | New York |
| 100105 | Bella Gente | `bellagente` | Verona |
| 52759 | Mozza Mia | `mozzamia` | Edina |
| 5062 | Pazza Notte | `pazzanotte` | New York |
| 35143 | Club Soda | `clubsoda` | Fort Wayne |
| 141049 | Trou Normand | `trounormand` | San Francisco |
| 96301 | ONE FORTY | `oneforty` | Lanai City |
| 37696 | La Luce | `laluce` | Orlando |
| 108907 | Oda House | `odahouse` | New York |
| 29404 | Hukilau Lanai | `hukilaulanai` | Kapaa |
| 81667 | Cafe Verona | `cafeverona` | Independence |
| 26842 | Due Amici | `dueamici` | Columbus |
| 144349 | Cafe Prague | `cafeprague` | Morrison |
| 17788 | SAII Bistro | `saiibistro` | Oklahoma City |
| 32311 | Le Jardin | `lejardin` | Edgewater |
| 110683 | Brazil Grill | `brazilgrill` | Portland |
| 73828 | Via Toscana | `viatoscana` | Louisville |
| 31861 | La Boca | `laboca` | Santa Fe |
| 7239 | Napa Cafe | `napacafe` | Memphis |
| 118693 | Square Root | `squareroot` | New Orleans |
| 30106 | Citron Bistro | `citronbistro` | Denver |
| 62710 | Omaha Prime | `omahaprime` | Omaha |
| 91429 | Wave Bistro | `wavebistro` | Omaha |
| 146830 | Garre Cafe | `garrecafe` | Livermore |
| 15907 | Coyote Cafe | `coyotecafe` | Santa Fe |
| 93460 | Tuscan Hills | `tuscanhills` | Forest Hills |
| 151840 | Fish Tales | `fishtales` | Galveston |
| 13129 | Nobu Waikiki | `nobuwaikiki` | Honolulu |
| 103009 | Bouche Bistro | `bouchebistro` | Santa Fe |
| 92401 | Darien Social | `dariensocial` | Darien |
| 66115 | Opus Too | `opustoo` | Henderson |
| 49486 | Il Lupino | `illupino` | Honolulu |
| 109780 | Bills Sydney | `billssydney` | Honolulu |
| 81952 | Corner Social | `cornersocial` | New York |
| 92554 | Pure Bistro | `purebistro` | Brooklyn |
| 4096 | Bistro Boudin | `bistroboudin` | San Francisco |
| 113161 | One Eleven | `oneeleven` | Greensburg |
| 55393 | Russian Samovar | `russiansamovar` | New York |
| 28909 | La Fontana | `lafontana` | Santa Clara |
| 112282 | Il Forno | `ilforno` | New York |
| 90760 | Bar Avignon | `baravignon` | Portland |
| 111046 | The Lobby | `thelobby` | Elizabeth |
| 84634 | City Kitchen | `citykitchen` | Chapel Hill |
| 109384 | La Mancha | `lamancha` | Fernandina Beach |
| 14902 | Midtown Grille | `midtowngrille` | Raleigh |
| 64318 | Le Pigeon | `lepigeon` | Portland |
| 124666 | Kan Zaman | `kanzaman` | Honolulu |
| 67372 | The Smile | `thesmile` | New York |
| 5606 | La Rivista | `larivista` | New York |
| 81931 | World Famous | `worldfamous` | San Diego |
| 7422 | El Meson | `elmeson` | Houston |
| 91537 | Cafe Aion | `cafeaion` | Boulder |
| 4311 | La Esquina | `laesquina` | New York |
| 7696 | Salt House | `salthouse` | San Francisco |
| 42466 | Bahrs Landing | `bahrslanding` | Highlands |
| 145018 | Shango Bistro | `shangobistro` | Buffalo |
| 68947 | della Voce | `dellavoce` | Manhattan |
| 20497 | Bleu Boheme | `bleuboheme` | San Diego |
| 144547 | Palm House | `palmhouse` | San Francisco |
| 5443 | Stephan Pyles | `stephanpyles` | Dallas |
| 15877 | Chimney Park | `chimneypark` | Windsor |
| 5206 | Sushi House | `sushihouse` | Leawood |
| 3934 | GW Fins | `gwfins` | New Orleans |
| 87889 | Cafe Matisse | `cafematisse` | Rutherford |
| 52282 | Kenichi Pacific | `kenichipacific` | Kailua-Kona |
| 23113 | Polaris Grill | `polarisgrill` | Columbus |
| 81994 | Urban Grub | `urbangrub` | Nashville |
| 145114 | Hush Bistro | `hushbistro` | Farmingdale |
| 109132 | Soul Cafe | `soulcafe` | Scottsdale |
| 117301 | Union Common | `unioncommon` | Nashville |
| 2636 | Sweet Basil | `sweetbasil` | Vail |
| 1929 | Taverna Banfi | `tavernabanfi` | Ithaca |
| 23068 | Urban Solace | `urbansolace` | San Diego |
| 150418 | Cafe Stoked | `cafestoked` | San Marcos |
| 78022 | Prime Bistro | `primebistro` | Lawrence |
| 3933 | CUCINA urbana | `cucinaurbana` | San Diego |
| 57808 | Osteria Pronto | `osteriapronto` | Indianapolis |
| 49819 | La Locanda | `lalocanda` | Miami Beach |
| 58528 | Fiat Cafe | `fiatcafe` | New York |
| 3086 | Kelly Liken | `kellyliken` | Vail |
| 17974 | La Sirene | `lasirene` | New York |
| 96436 | Honey Salt | `honeysalt` | Las Vegas |
| 6470 | Zolo Grill | `zologrill` | Boulder |
| 133999 | Cafe Monarch | `cafemonarch` | Scottsdale |
| 31873 | Walnut Brewery | `walnutbrewery` | Boulder |
| 7627 | Grant Grill | `grantgrill` | San Diego |
| 241 | Dirty Habit | `dirtyhabit` | San Francisco |
| 31216 | Redeye Grill | `redeyegrill` | New York |
| 30421 | Cafe Society | `cafesociety` | Memphis |
| 102028 | Mucca Osteria | `muccaosteria` | Portland |
| 5039 | Cucina Colore | `cucinacolore` | Denver |
| 108433 | CAMAJE Bistro | `camajebistro` | New York |
| 12691 | Il Posto | `ilposto` | Denver |
| 29383 | Marche Bacchus | `marchebacchus` | Las Vegas |
| 20050 | Cowboy Star | `cowboystar` | San Diego |
| 112855 | Cafe Nell | `cafenell` | Portland |
| 116743 | Chateau West | `chateauwest` | Nashville |
| 107464 | Palo Santo | `palosanto` | Brooklyn |
| 42640 | La Palapa | `lapalapa` | New York |
| 76144 | Fada Bistro | `fadabistro` | Brooklyn |
| 151342 | Four Points | `fourpoints` | Steamboat Springs |
| 105880 | Bar DKDC | `bardkdc` | Memphis |
| 4582 | BLT Prime | `bltprime` | New York |
| 141247 | Don Chido | `donchido` | San Diego |
| 70591 | Quattro Pazzi | `quattropazzi` | Stamford |
| 32065 | Skyline Club | `skylineclub` | Indianapolis |
| 24886 | Amber India | `amberindia` | San Francisco |
| 21916 | Urban Fondue | `urbanfondue` | Portland |
| 96028 | Don Camaron | `doncamaron` | Miami |
| 91921 | Antica Osteria | `anticaosteria` | Houston |
| 60529 | Blue Prynt | `blueprynt` | Sacramento |
| 22018 | Rainbow Lodge | `rainbowlodge` | Houston |
| 70249 | Da Silvano | `dasilvano` | New York |
| 114826 | Pacific Table | `pacifictable` | Fort Worth |
| 6572 | Paseo Grill | `paseogrill` | Oklahoma City |
| 151966 | Cafe Mercato | `cafemercato` | Denver |
| 36673 | Negril Village | `negrilvillage` | New York |
| 145870 | The Bistro | `thebistro` | Boulder City |
| 61021 | Kayne Prime | `kayneprime` | Nashville |
| 79768 | Ignite Bistro | `ignitebistro` | Carlsbad |
| 85381 | bistro sixty | `bistrosixty` | San Diego |
| 76933 | Pera Soho | `perasoho` | New York |
| 79144 | Braised Onion | `braisedonion` | Ocala |
| 2849 | Lahaina Grill | `lahainagrill` | Lahaina |
| 2003 | Vin Santo | `vinsanto` | San Jose |
| 76228 | Market Bistro | `marketbistro` | Jericho |
| 10141 | Basi Italia | `basiitalia` | Columbus |
| 64480 | Nai Tapas | `naitapas` | New York |
| 6082 | Tai Pan | `taipan` | Palo Alto |
| 48847 | Do Hwa | `dohwa` | New York |
| 104674 | Strega Bistro | `stregabistro` | Berkeley Heights |
| 30829 | Boiler Room | `boilerroom` | Omaha |
| 100873 | Red Gravy | `redgravy` | New Orleans |
| 65881 | Santa Fe | `santafe` | New York |
| 108760 | Haydens Post | `haydenspost` | Jackson |
| 38266 | Le Paris | `leparis` | New York |
| 38131 | Hour Time | `hourtime` | Lafayette |
| 72886 | Turtle Club | `turtleclub` | Hoboken |
| 114640 | Milano Inn | `milanoinn` | Indianapolis |
| 115627 | Ten Penny | `tenpenny` | Pittsburgh |
| 149200 | Clouds Brewing | `cloudsbrewing` | Raleigh |
| 108646 | Naupaka Terrace | `naupakaterrace` | Lihue |
| 70348 | Tequila Factory | `tequilafactory` | Tucson |
| 3665 | Maria Pia | `mariapia` | New York |
| 4544 | Terra Bistro | `terrabistro` | Vail |
| 1066 | Red Cat | `redcat` | New York |
| 847 | El Agave | `elagave` | San Diego |
| 88021 | Bria Bistro | `briabistro` | Nashville |
| 18367 | Ruvo West | `ruvowest` | Greenlawn |
| 68515 | Cafe Miro | `cafemiro` | Honolulu |
| 149350 | Inlet Grill | `inletgrill` | Fort Pierce |
| 95752 | Villa Mosconi | `villamosconi` | New York |
| 2195 | Chaya Venice | `chayavenice` | Venice |
| 28393 | Osteria Fasulo | `osteriafasulo` | Davis |
| 69301 | Copper Canyon | `coppercanyon` | Atlantic Highlands |
| 45505 | Cuvee Bistro | `cuveebistro` | Destin |
| 24700 | Taverna Kyma | `tavernakyma` | Boca Raton |
| 124648 | Big Fish | `bigfish` | Miami |
| 145423 | City Fire | `cityfire` | Nashville |
| 82828 | De Novo | `denovo` | Columbus |
| 28087 | Easy Bistro | `easybistro` | Chattanooga |
| 110698 | Sushi One | `sushione` | Raleigh |
| 37849 | Jai Yun | `jaiyun` | San Francisco |
| 18757 | Terra Mia | `terramia` | Livermore |
| 61348 | Pure Sushi | `puresushi` | Scottsdale |
| 30835 | Zinc Bistro | `zincbistro` | Scottsdale |
| 116473 | The Peacock | `thepeacock` | New York |
| 3424 | Barclay Prime | `barclayprime` | Philadelphia |
| 87652 | The Fourth | `thefourth` | New York |
| 111940 | Mexican Sugar | `mexicansugar` | Plano |
| 113080 | La Gare | `lagare` | Santa Rosa |
| 33856 | The Fishery | `thefishery` | San Diego |
| 23521 | Blue Plate | `blueplate` | San Francisco |
| 85117 | Bantam Bistro | `bantambistro` | Litchfield |
| 108727 | El Barzon | `elbarzon` | Detroit |
| 1906 | Foreign Cinema | `foreigncinema` | San Francisco |
| 53146 | Crave Sushi | `cravesushi` | Houston |
| 4725 | Masu Sushi | `masusushi` | Portland |
| 62167 | Favela Cubana | `favelacubana` | New York |
| 95371 | Single Barrel | `singlebarrel` | Lincoln |
| 104296 | Barn Joo | `barnjoo` | New York |
| 117709 | Jayde Fuzion | `jaydefuzion` | Henderson |
| 5265 | Porto Terra | `portoterra` | Portland |
| 2994 | The Forge | `theforge` | Miami Beach |
| 38917 | Pearl East | `pearleast` | Manhasset |
| 78586 | Latin Bites | `latinbites` | Houston |
| 96748 | Caffe Dolce | `caffedolce` | Missoula |
| 149296 | Mainly Drinks | `mainlydrinks` | La Porte |
| 33691 | Uni Sushi | `unisushi` | The Woodlands |
| 67783 | Vivo Kitchen | `vivokitchen` | Sewickley |
| 42559 | Antibes Bistro | `antibesbistro` | New York |
| 43528 | Ponty Bistro | `pontybistro` | New York |
| 76567 | Sushi Yasaka | `sushiyasaka` | New York |
| 117616 | La Caye | `lacaye` | Brooklyn |
| 140917 | Tangled Vine | `tangledvine` | New York |
| 146014 | Marla Bakery | `marlabakery` | San Francisco |
| 26521 | Prime Italian | `primeitalian` | Miami Beach |
| 74935 | MiNGO West | `mingowest` | Beaverton |
| 51826 | Mason Jar | `masonjar` | New York |
| 145558 | Bistro Maison | `bistromaison` | McMinnville |
| 112753 | Coppa Osteria | `coppaosteria` | Houston |
| 22132 | Nikai Sushi | `nikaisushi` | Jackson Hole |
| 2790 | Mangia Mangia | `mangiamangia` | Albany |
| 820 | River Cafe | `rivercafe` | Brooklyn |
| 60337 | Edoko Sushi | `edokosushi` | Frisco |
| 149275 | Cafe Grille | `cafegrille` | El Paso |
| 4057 | Mangia Tutti | `mangiatutti` | San Francisco |
| 90211 | Cafe Navarre | `cafenavarre` | South Bend |
| 57904 | Oficina Latina | `oficinalatina` | New York |
| 94117 | Gaucho Grill | `gauchogrill` | White Plains |
| 90400 | Haven Rooftop | `havenrooftop` | New York |
| 64774 | Boxing Room | `boxingroom` | San Francisco |
| 151789 | Seoul Garden | `seoulgarden` | San Francisco |
| 17617 | Ad Hoc | `adhoc` | Yountville |
| 51823 | Shandon Court | `shandoncourt` | East Islip |
| 7624 | Black Cat | `blackcat` | Boulder |
| 78148 | Asuka Sushi | `asukasushi` | New York |
| 54061 | Cafe Havana | `cafehavana` | Smithtown |
| 92833 | The Barge | `thebarge` | Perth Amboy |
| 64780 | La Pergola | `lapergola` | Millburn |
| 105058 | Anassa Taverna | `anassataverna` | New York |
| 56422 | Baci Bistro | `bacibistro` | Kailua |
| 136030 | Viceroy Grille | `viceroygrille` | Oklahoma City |
| 94087 | Publick House | `publickhouse` | Chester |
| 32104 | The Kitchen | `thekitchen` | Jackson Hole |
| 95410 | La Loma | `laloma` | Denver |
| 151339 | Western BBQ | `westernbbq` | Steamboat Springs |
| 108277 | La Thai | `lathai` | New Orleans |
| 103516 | Blind Burro | `blindburro` | San Diego |
| 27763 | Red Egg | `redegg` | New York |
| 116641 | Amalfi Grille | `amalfigrille` | Vero Beach |
| 30121 | Root Down | `rootdown` | Denver |
| 55903 | Newport Grill | `newportgrill` | Wichita |
| 8096 | Crab Catcher | `crabcatcher` | La Jolla |
| 61876 | Bocca East | `boccaeast` | New York |
| 68272 | Dark Horse | `darkhorse` | New York |
| 52537 | Caffe Luna | `caffeluna` | Raleigh |
| 29353 | Bella Aquila | `bellaaquila` | Eagle |
| 53158 | Barolo Grill | `barologrill` | Denver |
| 22453 | Bistro Aix | `bistroaix` | Jacksonville |
| 14251 | Watts Grocery | `wattsgrocery` | Durham |
| 3912 | Il Forno | `ilforno` | Santa Monica |
| 47848 | The Dutch | `thedutch` | New York |
| 117280 | Larks Medford | `larksmedford` | Medford |
| 42619 | La Fiesta | `lafiesta` | San Diego |
| 19168 | Chez Melange | `chezmelange` | Redondo Beach |
| 90154 | La Defense | `ladefense` | Brooklyn |
| 91819 | Yi Sushi | `yisushi` | El Cajon |
| 71803 | Springs Orleans | `springsorleans` | Colorado Springs |
| 118339 | Veritas Tavern | `veritastavern` | Delaware |
| 68236 | Glass Wall | `glasswall` | Houston |
| 99940 | Harbor House | `harborhouse` | San Diego |
| 59113 | Cedar Creek | `cedarcreek` | Glen Cove |
| 41890 | Dagabi Cucina | `dagabicucina` | Boulder |
| 37534 | Teresa Caffe | `teresacaffe` | Princeton |
| 78136 | Fuji Sushi | `fujisushi` | New York |
| 5292 | Bleu Olive | `bleuolive` | Durham |
| 108361 | The Veranda | `theveranda` | Starkville |
| 2535 | Bistro Vendome | `bistrovendome` | Denver |
| 63196 | Little Bird | `littlebird` | Portland |
| 117193 | Arroyo Vino | `arroyovino` | Santa Fe |
| 112963 | Royal India | `royalindia` | Raleigh |
| 67903 | EVO Italian | `evoitalian` | Tequesta |
| 103408 | London Sizzler | `londonsizzler` | Houston |
| 63154 | Kori Tribeca | `koritribeca` | New York |
| 38830 | Kenichi Aspen | `kenichiaspen` | Aspen |
| 73315 | Brindle Room | `brindleroom` | New York |
| 40933 | Bistro Rollin | `bistrorollin` | Pelham |
| 139 | Red Star | `redstar` | Portland |
| 43666 | Fresco Grill | `frescogrill` | Bonsall |
| 3496 | Three Degrees | `threedegrees` | Portland |
| 2394 | Lugo Cucina | `lugocucina` | New York |
| 20443 | Sole Mio | `solemio` | Nashville |
| 106006 | The Manship | `themanship` | Jackson |
| 5948 | Museum Cafe | `museumcafe` | Oklahoma City |
| 27427 | Ajax Tavern | `ajaxtavern` | Aspen |
| 44515 | Indus Valley | `indusvalley` | New York |
| 76126 | Cafe Bink | `cafebink` | Carefree |
| 2527 | Three Seasons | `threeseasons` | Palo Alto |
| 144679 | Saffron Table | `saffrontable` | Bozeman |
| 111319 | Craw Station | `crawstation` | San Francisco |
| 7644 | Le Zinc | `lezinc` | San Francisco |
| 7585 | Vintner Grill | `vintnergrill` | Las Vegas |
| 72796 | Monkey Cat | `monkeycat` | Auburn |
| 60298 | Thai Select | `thaiselect` | New York |
| 16648 | Da Marco | `damarco` | Houston |
| 150346 | Burma Ruby | `burmaruby` | Palo Alto |
| 60160 | La Mela | `lamela` | New York |
| 64300 | The Nest | `thenest` | Indian Wells |
| 3467 | Chez TJ | `cheztj` | Mountain View |
| 79705 | Alachi Masala | `alachimasala` | New York |
| 20011 | Panta Rei | `pantarei` | San Francisco |
| 101029 | Banc Cafe | `banccafe` | New York |
| 93154 | Tin Angel | `tinangel` | Nashville |
| 4940 | La Fondue | `lafondue` | Denver |
| 145795 | The Cabin | `thecabin` | Steamboat Springs |
| 33787 | Sapporo Grill | `sapporogrill` | Sacramento |
| 52969 | Ai Fiori | `aifiori` | New York |
| 47125 | Moderne Barn | `modernebarn` | Armonk |
| 6761 | Bella Monica | `bellamonica` | Raleigh |
| 106216 | Cafe Murano | `cafemurano` | Altamonte Springs |
| 26170 | Izakaya Den | `izakayaden` | Denver |
| 100756 | Sushi Bushido | `sushibushido` | Kapaa |
| 2657 | Garden Court | `gardencourt` | San Francisco |
| 106402 | West Cafe | `westcafe` | Portland |
| 101443 | The Heath | `theheath` | New York |
| 11263 | Liberty Tavern | `libertytavern` | Omaha |
| 5717 | Ming Court | `mingcourt` | Orlando |
| 110956 | Wild Iris | `wildiris` | Brentwood |
| 113644 | Namaste India | `namasteindia` | Arvada |
| 3696 | SOBA Lounge | `sobalounge` | Pittsburgh |
| 66946 | Forno Bistro | `fornobistro` | Saratoga Springs |
| 15751 | Market Table | `markettable` | New York |
| 6557 | Tiburon Tavern | `tiburontavern` | Tiburon |
| 39640 | LaSalle Grill | `lasallegrill` | South Bend |
| 101326 | Bella Tuscany | `bellatuscany` | Windermere |
| 18559 | Joseph Decuis | `josephdecuis` | Roanoke |
| 440 | Cafe Torre | `cafetorre` | Cupertino |
| 49723 | Rancho Pinot | `ranchopinot` | Scottsdale |
| 80734 | NYY Steak | `nyysteak` | Coconut Creek |
| 63919 | Rumours East | `rumourseast` | Nashville |
| 110392 | Kabooki Sushi | `kabookisushi` | Orlando |
| 1607 | Indigo Grill | `indigogrill` | San Diego |
| 21178 | Sekisui Midtown | `sekisuimidtown` | Memphis |
| 14722 | Cafe Ena | `cafeena` | Minneapolis |
| 149422 | Au Revoir | `aurevoir` | San Diego |
| 37666 | Nel Centro | `nelcentro` | Portland |
| 93478 | Curry Kitchen | `currykitchen` | New York |
| 96343 | Finn McCools | `finnmccools` | Santa Monica |
| 20953 | Meson Sevilla | `mesonsevilla` | New York |
| 22063 | Eno Terra | `enoterra` | Kingston |
| 11932 | Grand Met | `grandmet` | Dallas |
| 33067 | Le Gigot | `legigot` | New York |
| 7022 | London Lennies | `londonlennies` | Rego Park |
| 107137 | Joe Allen | `joeallen` | New York |
| 24079 | Mere Bulles | `merebulles` | Brentwood |
| 139639 | Kennedy Room | `kennedyroom` | Dallas |
| 57577 | Esquire Tavern | `esquiretavern` | San Antonio |
| 91096 | Lime Lite | `limelite` | Fresno |
| 70234 | Bel Posto | `belposto` | Hackensack |
| 4842 | Chef Mavro | `chefmavro` | Honolulu |
| 144466 | Cozee Cafe | `cozeecafe` | Lake Mary |
| 28636 | Bigelow Grille | `bigelowgrille` | Pittsburgh |
| 51094 | Satis Bistro | `satisbistro` | Jersey City |
| 13090 | Pasta Brioni | `pastabrioni` | Scottsdale |
| 2643 | La Tour | `latour` | Vail |
| 75583 | Sugar Bar | `sugarbar` | New York |
| 102790 | Il Portico | `ilportico` | Tappan |
| 94153 | Bistro Foufou | `bistrofoufou` | Traverse City |
| 52453 | Statler Grill | `statlergrill` | New York |
| 183 | La Folie | `lafolie` | San Francisco |
| 7463 | Hama Sushi | `hamasushi` | Venice |
| 112546 | Casa Mezcal | `casamezcal` | New York |
| 74761 | Del Alma | `delalma` | Corvallis |
| 150220 | Thai Peacock | `thaipeacock` | Portland |
| 7366 | The Carlton | `thecarlton` | Pittsburgh |
| 105823 | Sushi Den | `sushiden` | Denver |
| 149191 | Party Fowl | `partyfowl` | Nashville |
| 78730 | The NoMad | `thenomad` | New York |
| 97309 | Rich Table | `richtable` | San Francisco |
| 77143 | Il Fresco | `ilfresco` | Orangeburg |
| 48571 | Taverna Mykonos | `tavernamykonos` | Elmwood Park |
| 32716 | Ninety Acres | `ninetyacres` | Peapack and Gladstone |
| 74362 | Surfish Bistro | `surfishbistro` | Brooklyn |
| 32248 | South End | `southend` | New Canaan |
| 3035 | Park Chalet | `parkchalet` | San Francisco |
| 84007 | Lucky Strike | `luckystrike` | New York |
| 50389 | Noble Rot | `noblerot` | Portland |
| 76288 | Golden Crepes | `goldencrepes` | New York |
| 103945 | Chop Shop | `chopshop` | New York |
| 106687 | The Revelry | `therevelry` | Rochester |
| 3063 | Mille Fleurs | `millefleurs` | Rancho Santa Fe |
| 64330 | Dream Cafe | `dreamcafe` | Dallas |
| 110584 | Zeus Cafe | `zeuscafe` | Portland |
| 110224 | Quality Italian | `qualityitalian` | New York |
| 7056 | Dio Deka | `diodeka` | Los Gatos |
| 105793 | Caspian Cafe | `caspiancafe` | Colorado Springs |
| 78514 | Redd Wood | `reddwood` | Yountville |
| 11128 | Webster House | `websterhouse` | Kansas City |
| 104347 | Mi Luna | `miluna` | Houston |
| 55549 | St Jack | `stjack` | Portland |
| 3885 | Boca Tavern | `bocatavern` | Novato |
| 151243 | Bistro Daisy | `bistrodaisy` | New Orleans |
| 33718 | Nasher Cafe | `nashercafe` | Durham |
| 6160 | Rialto Cafe | `rialtocafe` | Denver |
| 52252 | The Weber | `theweber` | Denver |
| 21310 | Il Palio | `ilpalio` | Shelton |
| 111103 | Nola Grill | `nolagrill` | Frisco |
| 109123 | Great Maple | `greatmaple` | San Diego |
| 21487 | HopMonk Tavern | `hopmonktavern` | Sebastopol |
| 42610 | Ocean Room | `oceanroom` | San Diego |
| 38614 | Fusha East | `fushaeast` | New York |
| 47371 | Organic Grill | `organicgrill` | New York |
| 148354 | Sakebar SHiGURE | `sakebarshigure` | New York |
| 138835 | The Barrel | `thebarrel` | Oklahoma City |
| 4048 | Park Ave | `parkave` | Stanton |
| 100192 | The Pearl | `thepearl` | Columbus |
| 77893 | Shiraz Grill | `shirazgrill` | Orlando |
| 42196 | Della Terra | `dellaterra` | Buffalo |
| 4042 | iL Punto | `ilpunto` | New York |
| 111286 | The Izakaya | `theizakaya` | Sacramento |
| 114490 | Stones Throw | `stonesthrow` | San Francisco |
| 27202 | Dal Toro | `daltoro` | Las Vegas |
| 68803 | Philip Marie | `philipmarie` | New York |
| 45730 | Vogue Bistro | `voguebistro` | Surprise |
| 35671 | Dos Perros | `dosperros` | Durham |
| 99937 | Pier Cafe | `piercafe` | San Diego |
| 66034 | Amity Hall | `amityhall` | New York |
| 36796 | The Wright | `thewright` | New York |
| 112537 | Small Plates | `smallplates` | Syracuse |
| 91168 | La Catena | `lacatena` | Bridgewater |
| 148297 | The Barn | `thebarn` | Gahanna |
| 6426 | Pasta Pasta | `pastapasta` | Port Jefferson |
| 49129 | Bar Rosso | `barrosso` | Stamford |
| 15895 | Cowboy Ciao | `cowboyciao` | Scottsdale |
| 15403 | Le Central | `lecentral` | San Francisco |
| 100417 | Malai Marke | `malaimarke` | New York |
| 111211 | Si Bon | `sibon` | Rancho Mirage |
| 90328 | Harlan Social | `harlansocial` | Stamford |
| 4563 | Boulder Cork | `bouldercork` | Boulder |
| 24385 | Half Moon | `halfmoon` | Dobbs Ferry |
| 92416 | Cafe Soriah | `cafesoriah` | Eugene |
| 1590 | Sushi Neko | `sushineko` | Oklahoma City |
| 48142 | Axia Taverna | `axiataverna` | Tenafly |
| 15580 | Ethos Taverna | `ethostaverna` | New York |
| 81142 | Club One | `clubone` | Oklahoma City |
| 75007 | Bar Italia | `baritalia` | New York |
| 139993 | Club LeConte | `clubleconte` | Knoxville |
| 1860 | Sushi Lounge | `sushilounge` | Hoboken |
| 620 | Hundred Acres | `hundredacres` | New York |
| 36247 | Cafe Vicino | `cafevicino` | Boise |
| 50890 | Cafe Malaga | `cafemalaga` | McKinney |
| 2331 | Il Buco | `ilbuco` | New York |
| 65962 | Sushi Shiono | `sushishiono` | Kailua-Kona |
| 27370 | Antlers Lodge | `antlerslodge` | San Antonio |
| 27835 | Marina Cafe | `marinacafe` | Destin |
| 42895 | The Dhaba | `thedhaba` | Tempe |
| 116338 | Swallow East | `swalloweast` | Montauk |
| 114502 | Engine Room | `engineroom` | Mystic |
| 18571 | The Grove | `thegrove` | Houston |
| 151198 | Gallo Nero | `gallonero` | Portland |
| 104383 | Grey Lady | `greylady` | New York |
| 86815 | La Bocca | `labocca` | White Plains |
| 141184 | Marks Bistro | `marksbistro` | Omaha |
| 129358 | Laduree SOHO | `ladureesoho` | New York |
| 111139 | Il Segreto | `ilsegreto` | Bel Air |
| 106816 | the Nuaa | `thenuaa` | New York |
| 66940 | Pasta Pane | `pastapane` | Clifton Park |
| 117079 | Hubbard Grille | `hubbardgrille` | Columbus |
| 148648 | Longbow Pub | `longbowpub` | Brooklyn |
| 113335 | South End | `southend` | Venice |
| 5084 | NAAN Sushi | `naansushi` | Plano |
| 51331 | Persian Room | `persianroom` | Scottsdale |
| 141040 | Urban Kitchen | `urbankitchen` | Houston |
| 2 | Thirsty Bear | `thirstybear` | San Francisco |
| 23509 | Jacmel Inn | `jacmelinn` | Hammond |
| 24472 | Drago Centro | `dragocentro` | Los Angeles |
| 59272 | Grappa Bistro | `grappabistro` | Golden |
| 117412 | Snack Eos | `snackeos` | New York |
| 152992 | Bistro Barbes | `bistrobarbes` | Denver |
| 117403 | Little Prince | `littleprince` | New York |
| 107197 | El Cisne | `elcisne` | Tucson |
| 115873 | Il Borgo | `ilborgo` | San Francisco |
| 30628 | Minetta Tavern | `minettatavern` | New York |
| 6900 | Il Palio | `ilpalio` | Chapel Hill |
| 86116 | Euclid Hall | `euclidhall` | Denver |
| 107638 | Skye Bistro | `skyebistro` | Mentor |
| 110803 | The Cecil | `thececil` | New York |
| 53602 | Pars Cuisine | `parscuisine` | Albuquerque |
| 6601 | El Farol | `elfarol` | Santa Fe |
| 4533 | Vin Rouge | `vinrouge` | Durham |
| 30 | Campton Place | `camptonplace` | San Francisco |
| 50893 | Parlor Market | `parlormarket` | Jackson |
| 118705 | Rive Bistro | `rivebistro` | Westport |
| 108079 | Uptown Tavern | `uptowntavern` | Minneapolis |
| 144853 | Manos Nouveau | `manosnouveau` | San Francisco |
| 63181 | Brix Tavern | `brixtavern` | Portland |
| 94459 | JB Hooks | `jbhooks` | Lake Ozark |
| 147697 | Matta Donna | `mattadonna` | Boonton |
| 114172 | The Henry | `thehenry` | Phoenix |
| 30019 | Bistro Jeanty | `bistrojeanty` | Yountville |
| 31567 | Il Piatto | `ilpiatto` | Santa Fe |
| 109444 | Rock Lobster | `rocklobster` | Chandler |
| 92116 | Central Bistro | `centralbistro` | Phoenix |
| 117271 | Urban Putt | `urbanputt` | San Francisco |
| 6174 | Ketchum Grill | `ketchumgrill` | Ketchum |
| 70681 | Caffe Storico | `caffestorico` | New York |
| 41710 | Gourmet Italia | `gourmetitalia` | Temecula |
| 31759 | Ribalta Pizza | `ribaltapizza` | New York |
| 81046 | SOL Cocina | `solcocina` | Scottsdale |
| 104002 | Banzai Sushi | `banzaisushi` | Denver |
| 46483 | JJ Astor | `jjastor` | Duluth |
| 16819 | Canyon Road | `canyonroad` | New York |
| 23350 | Capitol Garage | `capitolgarage` | Sacramento |
| 73291 | Oyster Club | `oysterclub` | Mystic |
| 98293 | da Capo | `dacapo` | Avon |
| 3723 | Magic Flute | `magicflute` | San Francisco |
| 38155 | Al Bustan | `albustan` | New York |
| 96886 | Lady Mendls | `ladymendls` | New York |
| 376 | Rose Pistola | `rosepistola` | San Francisco |
| 101122 | BXL ZOUTE | `bxlzoute` | New York |
| 33850 | Casa Mia | `casamia` | Scottsdale |
| 71041 | Tuscany Tavern | `tuscanytavern` | Evergreen |
| 107104 | El Pinto | `elpinto` | Albuquerque |
| 72727 | Texas Spice | `texasspice` | Dallas |
| 11917 | Caffe Regatta | `cafferegatta` | Pelham |
| 71629 | Wild Salsa | `wildsalsa` | Dallas |
| 107536 | The Drop | `thedrop` | Kansas City |
| 103345 | The Quarter | `thequarter` | New York |
| 118198 | Agustin Kitchen | `agustinkitchen` | Tucson |
| 91990 | Bathtub Gin | `bathtubgin` | New York |
| 95425 | Zio Cecio | `ziocecio` | Dallas |

### A1.7 — ampersand

438 names contain `&`, which users type as "and". A synonym pair is required; typo
tolerance cannot bridge a one-character token to a three-character word.

| objectID | name | city | neighborhood |
|---|---|---|---|
| 48289 | La Rambla Restaurant & Bar | McMinnville, OR | McMinnville |
| 150856 | State & Allen Kitchen + Bar | Dallas, TX | Uptown |
| 147700 | Swank & Swine | Portland, OR | SW Portland |
| 6852 | Catalina Barbeque Co. & Sports Bar | Tucson, AZ | Tucson |
| 10858 | G. Michael's Bistro & Bar | Columbus, OH | German Village |
| 146278 | Florent Restaurant & Lounge | San Diego, CA | Downtown / Gaslamp |
| 139888 | Primal Food & Spirits | Durham, NC | Durham |
| 112351 | Popei's Clam Bar & Seafood Restaurant | Bethpage, NY | Bethpage |
| 15805 | Perry's Steakhouse & Grille - Clear Lake | Houston, TX | Clear Lake / Webster / Bay Area |
| 69556 | Perry's Steakhouse & Grille - San Antonio | San Antonio, TX | La Cantera |
| 67003 | Sixth & Pine - Nordstrom Green Hills Nashville | Nashville, TN | Nashville |
| 34114 | Jack's Restaurant & Bar - NYC | New York, NY | Theater District / Times Square |
| 24250 | Scott's Seafood Grill & Bar - Folsom | Folsom, CA | Folsom |
| 102016 | Chance Asian Bistro & Bar | Brooklyn, NY | Cobble Hill |
| 88048 | Steakhouse at Indiana Grand Racing & Casino | Shelbyville, IN | Shelbyville |
| 22714 | Briar Rose Chophouse & Saloon | Breckenridge, CO | Breckenridge |
| 144757 | Bluewater Bistro & Bar | Bodega Bay, CA | Bodega Bay |
| 94183 | Sixth & Pine - Nordstrom Roosevelt Field Garden City | Garden City, NY | Garden City |
| 138901 | Twiisted Bar & Grill | Medina, OH | Medina |
| 15430 | Fume Bistro & Bar | Napa, CA | Napa |
| 6730 | McCormick & Schmick's Grill - Tigard | Tigard, OR | Tigard |
| 94726 | Bolt Bistro & Bar | Raleigh, NC | Raleigh |
| 2286 | Luminaria Restaurant & Patio | Santa Fe, NM | Santa Fe |
| 50962 | Sons & Daughters | San Francisco, CA | Nob Hill |
| 78880 | Artisan's Brewery & Italian Grill | Toms River, NJ | Toms River |
| 61927 | Rosie McCann's Irish Pub & Restaurant | Santa Cruz, CA | Santa Cruz |
| 30157 | Panama Hotel & Restaurant | San Rafael, CA | San Rafael |
| 6775 | McCormick & Schmick's Seafood - San Diego | San Diego, CA | Downtown / Gaslamp |
| 22846 | McCormick & Schmick's Seafood - Raleigh - Crabtree Mall | Raleigh, NC | Raleigh |
| 87304 | Blue Hound Kitchen & Cocktails | Phoenix, AZ | Phoenix |
| 70630 | Harry & Izzy's - Northside | Indianapolis, IN | Castleton / Keystone Crossings |
| 2972 | Red & White Wine Bistro | Houston, TX | Downtown |
| 97873 | Frankie & Augie'Z | Jefferson Valley, NY | Jefferson Valley |
| 113734 | Mama's Boy Southern Table & Refuge | South Norwalk, CT | South Norwalk |
| 83218 | Ken & Cook | New York, NY | NoLita |
| 113011 | Claudio's Restaurant & Piano Bar | League City, TX | League City |
| 109555 | David's Restaurant & Lounge | Amelia Island, FL | Amelia Island |
| 76360 | Aqua Blu Kitchen & Cocktails | Toms River, NJ | Toms River |
| 68317 | Kris Bistro & Wine Lounge | Houston, TX | Downtown |
| 100705 | Andalucia Tapas Restaurant & Bar | Houston, TX | Downtown |
| 25435 | 333 Pacific - Steaks & Seafood | Oceanside, CA | Oceanside |
| 106258 | 1899 Bar & Grill | Flagstaff, AZ | Flagstaff |
| 41983 | Fivespice Seafood & Wine Bar | Lake Oswego, OR | Lake Oswego |
| 59770 | HUB Restaurant & Ice Creamery | Tucson, AZ | Tucson |
| 113170 | Vino Italian Tapas & Wine Bar | Honolulu, HI | Honolulu |
| 70231 | Stokes Grill & Bar - West | Omaha, NE | West Omaha |
| 86701 | The Bell & Anchor | Sag Harbor, NY | Sag Harbor |
| 110521 | Bill's Bar & Burger Downtown | New York, NY | Battery Park |
| 150568 | Tonto Bar & Grill | Cave Creek, AZ | Cave Creek |
| 30541 | Beatrice & Woodsley | Denver, CO | Baker |
| 147796 | Holley's Seafood Restaurant & Oyster Bar | Houston, TX | Midtown / Montrose |
| 15808 | Perry's Steakhouse & Grille - Memorial City | Houston, TX | West Side |
| 111205 | Bramble & Hare | Boulder, CO | Boulder |
| 76279 | Timber Dining Room at Lied Lodge & Conference Center | Nebraska City, NE | Nebraska City |
| 58726 | Peacock Alley American Grill & Bar | Bismarck, ND | Bismarck |
| 140893 | Ambli Gourmet Eatery & Wine | Denver, CO | Central |
| 63748 | Tutto Pazzo Restaurant & Tuscan Lounge | Huntington, NY | Huntington |
| 23776 | Nectar Restaurant & Lounge | Santa Rosa, CA | Santa Rosa |
| 145195 | French Roast Bar & Bistro - Downtown | New York, NY | Greenwich Village |
| 149584 | Luisa's Pizza & Pasta | San Francisco, CA | Russian Hill |
| 85237 | Willy & Jose's Cantina @ Sam's Town Casino | Las Vegas, NV | Boulder Highway |
| 15799 | Perry's Steakhouse & Grille - Sugar Land | Sugar Land, TX | Sugar Land / Missouri City |
| 118489 | Soko Sushi & Sake bar | Denver, CO | Downtown / LoDo |
| 111115 | Aroma Kitchen & Winebar | New York, NY | NoHo |
| 106171 | Kula Lodge & Restaurant, Inc. | Kula, HI | Upcountry |
| 56089 | Drunken Fish - Power & Light District | Kansas City, MO | Kansas City |
| 101068 | NHS Bar & Grill | Dallas, TX | Preston Hollow |
| 6681 | McCormick & Schmick's Seafood - Houston | Houston, TX | Galleria / Uptown |
| 99193 | Pig & Finch Gastropub | Leawood, KS | Leawood |
| 115399 | Restaurant & Bar KO | Kaimuki, HI | Honolulu |
| 69640 | Butterfield 8 Restaurant & Lounge | New York, NY | Midtown East |
| 93934 | The Battle House Renaissance Mobile Hotel & Spa - The Trellis Room | Mobile, AL | Mobile |
| 15811 | Perry's Steakhouse & Grille - The Woodlands | The Woodlands, TX | The Woodlands |
| 140059 | VIA UNO Cucina Italiana & Bar | Half Moon Bay, CA | Half Moon Bay |
| 50425 | EDGE Restaurant & Bar | Denver, CO | Downtown / LoDo |
| 32428 | Vic & Anthony's Steakhouse - Houston | Houston, TX | Downtown |
| 58468 | Firefly Grill & Wine Bar | Encinitas, CA | Encinitas |
| 6684 | McCormick & Schmick's Seafood - Las Vegas | Las Vegas, NV | Paradise |
| 35365 | Frank & Alberts | Phoenix, AZ | Phoenix |
| 37243 | The WineSellar & Brasserie | San Diego, CA | Sorrento Mesa |
| 81082 | Oscar's Steakhouse at the Plaza Hotel & Casino | Las Vegas, NV | Plaza |
| 41233 | Ho-Ho-Kus Inn & Tavern | Ho-Ho-Kus, NJ | Ho-Ho-Kus |
| 141607 | La Nonna Ristorante & Bar | Brooklyn, NY | Williamsburg |
| 138778 | Maximillian's Grille & Wine Bar | Cary, NC | Cary |
| 51670 | Thirst Wine Bar & Bistro | Portland, OR | Downtown |
| 71569 | Rocco's Tacos & Tequila Bar - PGA | Palm Beach Gardens, FL | Palm Beach Gardens |
| 96586 | L&W Oyster Co | New York, NY | Gramercy / Flatiron |
| 79156 | Michael Forbes Bar & Grille | Kansas City, MO | Plaza / Brookside |
| 16912 | Cork & Cow | Franklin, TN | Franklin / Brentwood |
| 48865 | 20nine Restaurant & Wine Bar | San Antonio, TX | Alamo Heights |
| 149689 | Flame & Fire | Roseville, CA | Roseville |
| 96646 | Raven & Rose | Portland, OR | Downtown |
| 92188 | The Mark Dine & Tap | South Bend, IN | South Bend |
| 38074 | Woodcliff Hotel & Spa - Horizons Restaurant | Fairport, NY | Fairport |
| 148963 | Brick & Spoon Lafayette | Lafayette, LA | Lafayette |
| 117076 | Heartwood Restaurant & Lounge - Omaha Marriott | Omaha, NE | West Omaha |
| 4155 | Boulder ChopHouse & Tavern | Boulder, CO | Boulder |
| 116512 | Green Dragon Tavern & Museum | Carlsbad, CA | Carlsbad |
| 12586 | finn & porter | Missoula, MT | Missoula |
| 137146 | Ironside Fish & Oyster | San Diego, CA | Little Italy |
| 112126 | Ocean Pool Bar & Grill - Westin Kaanapali Ocean Resort Villas | Lahaina, HI | Lahaina |
| 94114 | Gennaro's Restaurant & Catering – Princeton | Princeton, NJ | Princeton |
| 54499 | A&B Lobster House | Key West, FL | Key West |
| 64396 | Cafe Bleu Bistro & Wine Bar | San Diego, CA | Mission Hills |
| 83476 | Pounds & Ounces | New York, NY | Chelsea |
| 95806 | O'Reilly's Bar & Kitchen | New York, NY | Midtown West |
| 105019 | 44 & X | New York, NY | Hell's Kitchen |
| 6057 | Morrell Wine Bar & Cafe | New York, NY | Rockefeller Center Midtown |
| 148828 | Proof & Pantry | Dallas, TX | Uptown |
| 17158 | Limelight Supper Club & Lounge | Denver, CO | Downtown / LoDo |
| 103276 | Homestretch Steakhouse at Hoosier Park Racing & Casino | Anderson, IN | Anderson |
| 41332 | Hornblower Cruises & Events - San Diego | San Diego, CA | Downtown / Gaslamp |
| 32554 | Colt & Gray | Denver, CO | Downtown / LoDo |
| 33661 | JORY Restaurant at The Allison Inn & Spa | Newberg, OR | Newberg |
| 67744 | Solace & The Moonlight Lounge | Encinitas, CA | Encinitas |
| 89422 | Intertwined Bistro & Wine Bar | Escondido, CA | Escondido |
| 149098 | Umai Mi - Modern Asian Restaurant & Bar | San Antonio, TX | North San Antonio |
| 4385 | Reds at Sedona Rouge Hotel & Spa | Sedona, AZ | Sedona |
| 78139 | Vintry Wine & Whiskey | New York, NY | Financial District |
| 107155 | Cafe Matt & Meera | Hoboken, NJ | Hoboken |
| 101434 | Cask Bar & Kitchen | New York, NY | Murray Hill |
| 95251 | Fadó Irish Pub & Restaurant-Denver | Denver, CO | Downtown / LoDo |
| 25864 | Rudy & Paco Restaurant & Bar | Galveston, TX | Galveston |
| 145099 | Marie Gabrielle Restaurant & Gardens | Dallas, TX | Uptown |
| 75931 | Fiestas Cafe & Cantina | Edwards, CO | Edwards |
| 110173 | Dawson's Too - Sticks & Stones | Brownsburg, IN | Brownsburg |
| 59758 | Acme Food & Beverage Co. | Carrboro, NC | Carrboro |
| 114769 | Channing Tatum's Saints & Sinners | New Orleans, LA | French Quarter |
| 114373 | Barley & Rye | Moline, IL | Moline |
| 40942 | Locale Cafe & Bar - Closter | Closter, NJ | Closter |
| 23365 | Berryhill & Co. | Boise, ID | Boise |
| 148957 | Bino's Bistro & Creperie | San Diego, CA | Hillcrest |
| 151036 | BCN Taste & Tradition | Houston, TX | Midtown / Montrose |
| 94873 | Equinox Restaurant & Bar | Portland, OR | North Portland |
| 93871 | Bentley's Steak & Chop House | Encinitas, CA | Encinitas |
| 21472 | Spezia - Steaks, Italian & Seafood | Omaha, NE | Midtown |
| 54772 | Red's Bar & Grill | Litchfield Park, AZ | Litchfield Park |
| 76642 | Shizen at the JW Marriott Resort & Spa | Las Vegas, NV | JW Marriot |
| 30343 | Hapa Sushi Grill & Sake Bar - Cherry Creek | Denver, CO | Cherry Creek |
| 33382 | AYZA Wine & Chocolate Bar | New York, NY | Midtown West |
| 65275 | UNION Kitchen & Tap | Encinitas, CA | Encinitas |
| 85270 | Aoyama French Thai & Japanese | Wyckoff, NJ | Wyckoff |
| 4520 | Nakama Japanese Steakhouse & Sushi Bar | Pittsburgh, PA | Downtown |
| 51043 | PBR Rock Bar & Grill | Las Vegas, NV | Planet Hollywood Resort & Casino |
| 81529 | Farm & Table | Albuquerque, NM | Albuquerque |
| 116542 | Yesterday's Food & Spirits | Granger, IN | Granger |
| 116986 | The Post Brewing Company & GoodBird Kitchen | Lafayette, CO | Lafayette |
| 113602 | Bob's Steak & Chop House - Nashville | Nashville, TN | Downtown |
| 66175 | Monstera Noodles & Sushi | Kohala Coast, HI | Kamuela |
| 76789 | The Local Eatery & Pub | Westfield, IN | Westfield |
| 148528 | Little Napoli Italian Grill & Bar | Houston, TX | Downtown |
| 114097 | Juniper & Ivy | San Diego, CA | Little Italy |
| 149545 | Jim's Place Restaurant & Bar | Memphis, TN | Memphis |
| 48460 | Paul & Jimmy's Restaurant | New York, NY | Gramercy / Flatiron |
| 24889 | Tiki's Grill & Bar | Honolulu, HI | Waikiki |
| 26452 | Nani's Ristorante & Bar | Jackson Hole, WY | Jackson |
| 5595 | Venice Ristorante & Wine Bar | Denver, CO | Downtown / LoDo |
| 94261 | Sea Shore Restaurant & Marina | Bronx, NY | Bronx |
| 65800 | Puckett's 5th & Church | Nashville, TN | Downtown |
| 73900 | Patzeria Family & Friends | New York, NY | Midtown West |
| 115552 | Grit & Grace | Pittsburgh, PA | Downtown |
| 52027 | Tango & Malbec | Houston, TX | Galleria / Uptown |
| 47440 | Cuvee Wine & Bistro | Ocala, FL | Ocala |
| 4637 | Monti's Rotisserie & Bar | Santa Rosa, CA | Santa Rosa |
| 67936 | Chambers Walk Cafe & Catering | Lawrenceville, NJ | Lawrenceville |
| 140143 | R Bar & Grill Arlington | Arlington, TX | Arlington |
| 21715 | 315 Restaurant & Wine Bar | Santa Fe, NM | Santa Fe |
| 3034 | Beach Chalet Brewery & Restaurant | San Francisco, CA | Sunset District |
| 10042 | 8100 Mountainside Bar & Grill | Avon, CO | Beaver Creek |
| 83869 | Giovanni Rana Pastificio & Cucina | New York, NY | Chelsea |
| 7232 | Flyte World Dining & Wine | Nashville, TN | The Gulch |
| 148792 | By-Th'-Bucket Bar & Grill | Santa Clara, CA | Santa Clara |
| 89347 | Daddy Jack's Restaurant & Bar | Indianapolis, IN | Downtown Indy |
| 71998 | TENDER steak & seafood - Luxor | Las Vegas, NV | Luxor Hotel and Casino |
| 140860 | Jake's Restaurant & Saloon | Billings, MT | Billings |
| 76135 | Benjamin Restaurant & Bar | New York, NY | Murray Hill |
| 37699 | Wheatfields Restaurant & Bar | Saratoga Springs, NY | Saratoga Springs |
| 29155 | Stone Brewing World Bistro & Gardens | Escondido, CA | Escondido |
| 47158 | Hapa Sushi Grill & Sake Bar - Pearl St. Boulder | Boulder, CO | Boulder |
| 3158 | Towne House Restaurant at Wine & Roses | Lodi, CA | Lodi |
| 69334 | Insignia Prime Steak & Sushi | Smithtown, NY | Smithtown |
| 57154 | Bibi'z Restaurant & Lounge | Westwood, NJ | Westwood |
| 139657 | Union Kitchen & Tap - Gaslamp | San Diego, CA | Downtown / Gaslamp |
| 91624 | Gallerie Bar & Bistro | Columbus, OH | Columbus |
| 45427 | PAON Restaurant & Wine Bar | Carlsbad, CA | Carlsbad |
| 76048 | Harman's Eat & Drink | Denver, CO | Cherry Creek |
| 93598 | Pink Taco @ Hard Rock Hotel & Casino | Las Vegas, NV | Hard Rock Hotel |
| 144973 | Strano! Sicilian Kitchen & Bar | Memphis, TN | Memphis |
| 50728 | DaVinci Ristorante & Wine Bar | Salem, OR | Salem |
| 30673 | Mat & Naddie's | New Orleans, LA | Carrollton |
| 84262 | Epazote Kitchen & Cocktails | Tucson, AZ | Tucson |
| 21430 | Vigilucci's Seafood & Steakhouse | Carlsbad, CA | Carlsbad |
| 109615 | The Prime Rib Restaurant & Wine Cellar | Gillette, WY | Gillette |
| 5953 | Blue Canyon Kitchen & Tavern - Missoula | Missoula, MT | Missoula |
| 69763 | Helga's German Restaurant & Deli | Aurora, CO | Aurora |
| 57439 | Luce Restaurant & Enoteca | New York, NY | Upper West Side |
| 31987 | Riverside Manor Restaurant & Banquets | Paterson, NJ | Paterson |
| 30181 | Perry's Steakhouse & Grille - Cinco Ranch/Katy | Katy, TX | Katy |
| 3211 | Second Home Kitchen & Bar | Denver, CO | Cherry Creek |
| 151180 | Fado Portuguese Kitchen & Bar | Portland, OR | SE Portland |
| 64942 | Nick & Toni's Cafe Manhattan | New York, NY | Lincoln Square |
| 30367 | Galvez Bar & Grill | Galveston, TX | Galveston |
| 6908 | Acacia real food & cocktails | Tucson, AZ | Tucson |
| 2792 | Frankie & Johnnie's Steakhouse - Manhattan | New York, NY | Midtown West |
| 108634 | Portneuf Grille & Lounge at the Riverside Inn | Lava Hot Springs, ID | Lava Hot Springs |
| 141016 | Highlander Bar & Grill | Helena, MT | Helena |
| 6794 | McCormick & Schmick's Seafood - Pittsburgh South Side | Pittsburgh, PA | Downtown |
| 3982 | Solera Restaurant & Wine Bar | Denver, CO | Uptown |
| 115966 | Roy's Waikoloa Bar & Grill | Waikoloa, HI | Waikoloa |
| 118516 | Pig & Finch - Omaha | Omaha, NE | West Omaha |
| 37957 | Nellie Cashman's Monday Club Cafe at The Westin Kierland Resort & Spa | Scottsdale, AZ | Scottsdale |
| 6532 | Tommy Bahama's Restaurant & Bar - Wailea, Maui | Kihei, HI | Wailea |
| 111742 | Carolina Grill & Tap Room | Zionsville, IN | NW Indy / Zionsville |
| 144508 | Capo's Chicago Pizza & Fine Italian Dinners | San Francisco, CA | North Beach |
| 85228 | Billy Bob's Steak House & Saloon | Las Vegas, NV | Boulder Highway |
| 32917 | Max's Bistro & Bar | Fresno, CA | Fresno |
| 41485 | Greek Brothers Oyster Bar & Grill | El Campo, TX | El Campo |
| 20641 | Djon's Steak & Lobster House | Melbourne, FL | Melbourne |
| 75070 | Il Buco Alimentari & Vineria | New York, NY | NoHo |
| 149710 | Back Nine Grill & Bar | Santa Cruz, CA | Santa Cruz |
| 58861 | Hi-Life Bar & Grill | New York, NY | Upper West Side |
| 24523 | Ken & Sue's | Durango, CO | Durango |
| 106993 | The Signature Prime Steak & Seafood | Honolulu, HI | Honolulu |
| 75361 | Angelo's Prime Bar & Grill | Clifton Park, NY | Clifton Park |
| 1346 | Lou & Mickey's | San Diego, CA | Downtown / Gaslamp |
| 64252 | Bread & Tulips | New York, NY | Gramercy / Flatiron |
| 6647 | Smith & Wollensky Steakhouse - Las Vegas | Las Vegas, NV | The Strip |
| 145798 | Haymaker Patio & Grill | Steamboat Springs, CO | Steamboat Springs |
| 116452 | ENO Artisan Pizzeria & Wine Bar | Coronado, CA | Coronado |
| 52423 | Mustangs & Burros at Estancia La Jolla | San Diego, CA | La Jolla |
| 107488 | Amerigo Delicatus Restaurant & Market | Denver, CO | Downtown / LoDo |
| 1523 | Artisanal Fromagerie Bistro & Wine Bar | New York, NY | Murray Hill |
| 75088 | Espana Tapas & Wine Bar | Saint James, NY | St. James |
| 2389 | K & L Bistro | Sebastopol, CA | Sebastopol |
| 46132 | Rivershore Bar & Grill | Oregon City, OR | Oregon City |
| 75 | SOUTHGATE Bar & Restaurant | New York, NY | Midtown West |
| 4505 | Line & Lariat | Houston, TX | Downtown |
| 68572 | Tir Na Nog Irish Bar & Grill - Times Square | New York, NY | Midtown West |
| 102055 | Suzyque's BBQ & Bar | West Orange, NJ | West Orange |
| 93667 | Christie's Seafood & Steaks | Houston, TX | Galleria / Uptown |
| 1591 | Seasons Rotisserie & Grill | Albuquerque, NM | Albuquerque |
| 92797 | Mira Sushi & Izakaya Bar | New York, NY | Chelsea |
| 56839 | Mohegan Manor Restaurant & Club Sushi | Baldwinsville, NY | Baldwinsville |
| 110569 | Black Rabbit Restaurant & Bar | Troutdale, OR | Gresham / Troutdale |
| 6697 | McCormick & Schmick's Harborside - Portland | Portland, OR | South Waterfront |
| 129286 | Port-o Lounge & Restaurant | Jersey City, NJ | Jersey City |
| 78790 | Mangal Kebab & Pizza | Sunnyside, NY | Sunnyside |
| 29755 | Fire & Oak - Montvale | Montvale, NJ | Montvale |
| 115414 | Carvers Steaks & Chops | San Diego, CA | Poway / Rancho Bernardo |
| 78865 | NEPTUNE's Waterfront Grill & Bar | San Francisco, CA | Fisherman's Wharf |
| 138994 | Tiller's Kitchen & Bar | Westminster, CO | Westminster |
| 40531 | Players Sports Grill & Arcade | San Francisco, CA | Fisherman's Wharf |
| 113629 | Sansei Seafood Restaurant & Sushi Bar - WAIKIKI, Oahu | Honolulu, HI | Waikiki |
| 15508 | Blue Canyon Kitchen & Tavern - Kalispell | Kalispell, MT | Kalispell |
| 63424 | PJ Moran's Pub & Restaurant | New York, NY | Midtown East |
| 2168 | Brick & Bottle | Corte Madera, CA | Corte Madera |
| 73135 | Park Place Restaurant & Bar | Floral Park, NY | Floral Park |
| 71188 | Verde Mexican Kitchen & Cantina | Pittsburgh, PA | Downtown |
| 23581 | The Brasserie Restaurant & Bar | Santa Rosa, CA | Santa Rosa |
| 54940 | Holland House Bar & Refuge | Nashville, TN | East Nashville |
| 43663 | The Wine Bar & Restaurant | Atlantic Highlands, NJ | Atlantic Highlands |
| 135982 | Higgins Restaurant & Bar | Portland, OR | SW Portland |
| 62830 | Cassidy's Restaurant & Bar | Portland, OR | Downtown |
| 104932 | Rising Sun Sushi & Fusion Restaurant | Humble, TX | Kingwood / Humble / Atascocita |
| 141274 | Plow & Anchor | Indianapolis, IN | Downtown Indy |
| 29950 | Eolus Bar & Dining | Durango, CO | Durango |
| 144784 | Ginny Lane Bar & Grill | Orange Beach, AL | Orange Beach |
| 46750 | Dragonfly - Robata Grill & Sushi | Orlando, FL | I Drive / Sand Lake |
| 2551 | Carneros Bistro & Wine Bar | Sonoma, CA | Sonoma |
| 108232 | Runner & Stone | Brooklyn, NY | Gowanus |
| 117262 | Ichi Sushi & Ni Bar | San Francisco, CA | Mission |
| 5325 | Barcelona Restaurant & Bar | Columbus, OH | German Village |
| 95086 | Historic Broadway Hotel & Tavern | Madison, IN | Madison |
| 52498 | East India Co. Grill & Bar | Portland, OR | Downtown |
| 100405 | Le Midi Bar & Restaurant | New York, NY | Union Square |
| 110620 | Rivermarket Bar & Kitchen | Tarrytown, NY | Tarrytown |
| 17290 | Jimmy's An American Restaurant & Bar | Aspen, CO | Aspen |
| 45373 | Cien Agaves Tacos & Tequila | Scottsdale, AZ | Scottsdale |
| 86821 | Chandler's - Hilton Carlsbad Oceanfront Resort & Spa | Carlsbad, CA | Carlsbad |
| 150442 | Lot 2 Restaurant & Wine Bar | Omaha, NE | Midtown |
| 145273 | Harbor's Edge - Sheraton San Diego Hotel & Marina | San Diego, CA | Shelter Island / San Diego Bay |
| 115339 | Guard & Grace | Denver, CO | Downtown / LoDo |
| 78223 | Watty & Meg | Brooklyn, NY | Cobble Hill |
| 72034 | Fratelli Brick Oven Pizza & Wine Bar | New York, NY | Upper East Side |
| 25339 | Shor Seafood at the Hyatt Resort & Spa | Key West, FL | Key West |
| 107422 | Los Poblanos Historic Inn & Organic Farm | Los Ranchos de Albuquerque, NM | Albuquerque |
| 103153 | Harrigan's Cafe & Wine Deck | Johnstown, PA | Johnstown |
| 73549 | The Woodcellar Bar & Grill | Evergreen, CO | Evergreen |
| 103615 | La Cave Wine Bar & Boutique | Lakewood, CO | Lakewood |
| 45709 | McCormick & Schmick's Town & Country Village | Houston, TX | West Side |
| 112762 | Kasa Restaurant & Bar | Orlando, FL | Downtown Orlando |
| 58864 | Hi-Life Restaurant & Lounge | New York, NY | Upper East Side |
| 22864 | McCormick & Schmick's Seafood - Roseville - The Fountains | Roseville, CA | Roseville |
| 12181 | Ostra at Mokara Hotel & Spa | San Antonio, TX | Downtown |
| 6296 | Interim Restaurant & Bar | Memphis, TN | East Memphis |
| 16795 | In Vino Wine Bar & Restaurant | New York, NY | East Village |
| 118852 | 630 Park Steakhouse - Graton Resort & Casino | Rohnert Park, CA | Rohnert Park |
| 2847 | Zinc Wine Bar & Bistro | Albuquerque, NM | Albuquerque |
| 70240 | Zocalo Mexican Cuisine & Tequileria | Kansas City, MO | Plaza / Brookside |
| 7792 | Bali Steak & Seafood | Honolulu, HI | Waikiki |
| 144754 | Jake's Bar & Grill | Billings, MT | Billings |
| 79729 | Lorenzo's Restaurant, Bar & Caberet - Hilton Garden Inn - SI | Staten Island, NY | Staten Island |
| 51736 | Three's Bar & Grill | Kihei, HI | Kihei |
| 15802 | Perry's Steakhouse & Grille - Champions | Houston, TX | Champions |
| 129217 | Crave Restaurant & Lounge | Poughkeepsie, NY | Poughkeepsie |
| 3997 | Don & Charlie's | Scottsdale, AZ | Scottsdale |
| 145240 | Stoic & Genuine | Denver, CO | Downtown / LoDo |
| 91480 | Goodfella’s Brick Oven Pizza & Restaurant - Victory | Staten Island, NY | Staten Island |
| 136045 | Bourbon Street Steakhouse & Grill | West Memphis, AR | Memphis |
| 15433 | Calistoga Inn Restaurant & Brewery | Calistoga, CA | Calistoga |
| 10345 | O'Neill's Bar & Grill | Mission Viejo, CA | Mission Viejo / Rancho Santa Margarita |
| 54433 | J&K Steakhouse of Morristown | Morristown, NJ | Morristown |
| 2366 | Bank & Bourbon | Philadelphia, PA | Center City |
| 112684 | Miller Time Pub & Grill - Lincoln | Lincoln, NE | Lincoln |
| 148156 | Cane & Canoe - Montage Kapalua Bay | Lahaina, HI | Kapalua |
| 94162 | The Boiler House and Texas Grill & Wine Garden | San Antonio, TX | Downtown |
| 7796 | Quiessence Restaurant & Wine Bar | Phoenix, AZ | Phoenix |
| 100243 | Elaine's Asian Bistro & Grill | Great Neck, NY | Great Neck |
| 37048 | Jade Eatery & Lounge | Forest Hills, NY | Forest Hills |
| 77344 | Piqueo Restaurante & Bar | Cypress, TX | CyFair |
| 64063 | DUO - Steak & Seafood | Wailea, HI | Wailea |
| 85966 | The 43rd Restaurant & Lounge | Houston, TX | Downtown |
| 102817 | Parker & Quinn | New York, NY | Midtown West |
| 104962 | Twigs Bistro & Martini Bar - Bridgeport | Tigard, OR | Tigard |
| 79210 | Vintana Wine & Dine | Escondido, CA | Escondido |
| 101221 | Bob's Steak & Chop House - San Antonio | San Antonio, TX | Northwest |
| 22867 | McCormick & Schmick's Seafood - Houston - Downtown | Houston, TX | Downtown |
| 4956 | Pepi's Restaurant & Bar | Vail, CO | Vail |
| 72964 | The Westgate Hotel - Sunday Brunch & Le Fontainebleau Room | San Diego, CA | Downtown / Gaslamp |
| 91177 | Danny's Grill & Wine Bar | Red Bank, NJ | Red Bank |
| 77635 | Tiny's & the Bar Upstairs | New York, NY | TriBeCa - Downtown |
| 51412 | Le Rendez-vous Bistro & Restaurant Francais | Tucson, AZ | Tucson |
| 5177 | Spruce Farm & Fish | Boulder, CO | Boulder |
| 5913 | Meriwether's Restaurant & Skyline Farm | Portland, OR | NW Portland |
| 91942 | Reilly Craft Pizza & Drink | Tucson, AZ | Tucson |
| 106498 | Pomo Cucina & Pizzeria | Scottsdale, AZ | Scottsdale |
| 106114 | Stone Brewing World Bistro & Gardens - Liberty Station | San Diego, CA | Point Loma |
| 79732 | Black Rock Steak & Seafood | Lahaina, HI | Kaanapali |
| 83791 | Dakota Bar & Grill | Tucson, AZ | Tucson |
| 43675 | Fresco Trattoria & Bar | Carlsbad, CA | Carlsbad |
| 84736 | Marina Kitchen - San Diego Marriott Marquis & Marina | San Diego, CA | Downtown / Gaslamp |
| 116239 | SOHO Asian Bar & Grill | Aventura, FL | Aventura |
| 54799 | Leucadia Pizzeria & Italian Restaurant | La Jolla, CA | University City/Golden Triangle |
| 48019 | The Metro Wine Bar & Bistro | Oklahoma City, OK | Oklahoma City |
| 72721 | Bob's Steak & Chop House - Dallas on Lamar | Dallas, TX | Downtown |
| 34501 | Zinc Bistro & Wine Bar | San Antonio, TX | Downtown |
| 73780 | Finch's Bistro & Wine Bar | La Jolla, CA | La Jolla |
| 139660 | Crisp. Wine, Beer, & Eatery | Houston, TX | Heights / Washington |
| 110587 | One Main Restaurant & Bar | Babylon, NY | Babylon |
| 24793 | J&G Steakhouse Scottsdale at The Phoenician | Scottsdale, AZ | Scottsdale |
| 68266 | E&E Grill House | New York, NY | Theater District / Times Square |
| 12580 | Binkley's Kitchen & Bar | Indianapolis, IN | Downtown Indy |
| 46051 | St. Clair Winery & Bistro | Albuquerque, NM | Albuquerque |
| 106519 | TruFire Kitchen & Bar - Southlake | Southlake, TX | Southlake |
| 146029 | NOLA Bistro & Bar | Osseo, MN | Maple Grove |
| 144994 | Red Martini, Wine Bar & Grill | Redmond, OR | Redmond |
| 117895 | Lucca Restaurant & Bar | Sacramento, CA | Sacramento |
| 38410 | Brasserie Max & Julie | Houston, TX | Midtown / Montrose |
| 61852 | George & Martha's | Morristown, NJ | Morristown |
| 69748 | Oak & Vine at Springside | Auburn, NY | Auburn |
| 90919 | Rice & Company - Luxor | Las Vegas, NV | Luxor Hotel and Casino |
| 101131 | Grape & Vine | New York, NY | West Village |
| 114160 | State & Lemp | Boise, ID | Boise |
| 108253 | The Granary 'Cue & Brew | San Antonio, TX | Downtown |
| 149575 | Main + Abbey - Hard Rock Hotel & Casino Sioux City | Sioux City, IA | Sioux City |
| 75742 | Bleu Restaurant & Lounge | Memphis, TN | Memphis |
| 30877 | The Standard Restaurant & Lounge | Albany, NY | Albany |
| 151408 | One Duval - Pier House Resort & Spa | Key West, FL | Key West |
| 78766 | Tandoor & Co. Restaurant | Rego Park, NY | Rego Park |
| 92920 | Anthony's Prime Steak & Seafood | Henderson, NV | M Resort |
| 99142 | Cork & Fork | La Quinta, CA | La Quinta |
| 28183 | Veranda Fireside Lounge & Restaurant | San Diego, CA | Poway / Rancho Bernardo |
| 116893 | Twigs Bistro & Martini Bar - Meridian | Meridian, ID | Meridian |
| 116200 | Streetcar Bistro & Taproom | Portland, OR | Pearl District |
| 6793 | McCormick & Schmick's Seafood - Denver | Denver, CO | Tech Center / Greenwood Village |
| 90739 | Lucio's BYOB & Grill | Houston, TX | Midtown / Montrose |
| 109984 | Pino's Contemporary Italian Restaurant & Wine Bar | Pittsburgh, PA | Point Breeze |
| 110206 | Paulaner Brauhaus & Restaurant NYC | New York, NY | East Village |
| 66118 | Wilf's Restaurant & Bar | Portland, OR | Pearl District |
| 110227 | House. Wine. & Bistro | Mcallen, TX | McAllen |
| 21073 | Black & Blue Seafood Chophouse | Huntington, NY | Huntington |
| 109003 | Mac 24/7 Bar & Restaurant | Honolulu, HI | Waikiki |
| 31996 | Tre Piani & Tre Bar | Princeton, NJ | Princeton |
| 43126 | Tuscany Gardens - Tuscany Suites & Casino | Las Vegas, NV | Paradise |
| 29239 | Parallax Restaurant & Lounge | Cleveland, OH | Tremont |
| 72328 | 51Fifteen Restaurant & Lounge | Houston, TX | Galleria / Uptown |
| 102514 | Cucina & Co. | New York, NY | Rockefeller Center Midtown |
| 115201 | Stonewood Grill & Tavern - Heathrow | Heathrow, FL | Heathrow |
| 18016 | Restaurant X & Bully Boy Bar | Congers, NY | Congers |
| 17104 | Mulvaney's B&L | Sacramento, CA | Sacramento |
| 2855 | Rio Rodizio & Sushi - Union | Union, NJ | Union |
| 116170 | Sansei Seafood Restaurant & Sushi Bar - WAIKOLOA, Hawaii | Waikoloa, HI | Waikoloa |
| 50041 | Marco Polo's @ The Viana Hotel & Spa | Westbury, NY | Westbury |
| 18394 | Morels Steakhouse & Bistro - Las Vegas | Las Vegas, NV | The Venetian and Palazzo |
| 66559 | Formaggio Taverna & Patio - Sacramento Marriott Rancho Cordova | Rancho Cordova, CA | Rancho Cordova |
| 13990 | McCormick & Schmick's Seafood - Pittsburgh Downtown | Pittsburgh, PA | Downtown |
| 96478 | Auden Bistro & Bar | New York, NY | Midtown West |
| 19546 | Twenty/20 Grill & Wine Bar - Sheraton Carlsbad Resort & Spa | Carlsbad, CA | Carlsbad |
| 2409 | City Lobster & Steakhouse | New York, NY | Theater District / Times Square |
| 28153 | Splashes at Surf & Sand Resort | Laguna Beach, CA | Laguna Beach |
| 95206 | Lazaranda Modern Kitchen & Tequila | Dallas, TX | North Dallas / Addison |
| 118324 | Revel Kitchen & Bar | Danville, CA | Danville |
| 68680 | Thirsty Lion Pub & Grill | Tempe, AZ | Tempe |
| 54112 | The National Bar & Dining Rooms | New York, NY | Midtown East |
| 80281 | Dean's Seafood Grill & Bar | Cary, NC | Cary |
| 61600 | La Vigna Restaurant & Bar | Forest Hills, NY | Forest Hills |
| 54622 | Lallisse Mediterranean Wine & Food | New York, NY | Murray Hill |
| 51268 | Colicchio & Sons - Tap Room | New York, NY | Meatpacking District |
| 5087 | Bob's Steak & Chop House - San Francisco | San Francisco, CA | Financial District / Embarcadero |
| 68995 | Cusp Dining & Drinks | La Jolla, CA | La Jolla |
| 75178 | Gram & Dun | Kansas City, MO | Plaza / Brookside |
| 99886 | 121 Restaurant & Bar - North Salem | North Salem, NY | North Salem |
| 149833 | Ling & Louie's - Minneapolis | Minneapolis, MN | Downtown / North Loop |
| 25375 | Vue Grille & Bar | Indian Wells, CA | Indian Wells |
| 30775 | HK's Restaurant & Bar - The Lodge of Four Seasons | Lake Ozark, MO | Lake of the Ozarks |
| 79603 | New Leaf Restaurant & Bar | New York, NY | Inwood |
| 77779 | Pampas Argentinas Steakhouse & Restaurant | Forest Hills, NY | Forest Hills |
| 44851 | Jack & Giulio's Italian Restaurant | San Diego, CA | Old Town |
| 7549 | The Stockyards Restaurant & 1889 Saloon | Phoenix, AZ | Phoenix |
| 17119 | Kingfisher Bar & Grill | Tucson, AZ | Tucson |
| 68098 | Novita Bistro & Lounge | Metuchen, NJ | Metuchen |
| 117370 | The Capital: American Eatery & Lounge | Albany, NY | Albany |
| 6789 | McCormick & Schmick's Seafood - Indianapolis | Indianapolis, IN | Downtown Indy |
| 92323 | Bistecca Restaurant & Bar | Parsippany, NJ | Parsippany |
| 56101 | Soigne Restaurant & Wine Bar | Brooklyn, NY | Park Slope |
| 113596 | Cooper's Hawk Winery & Restaurant - Columbus | Columbus, OH | Columbus |
| 4290 | Primo at the JW Marriott Starr Pass Resort & Spa | Tucson, AZ | Tucson |
| 7640 | Harry & Izzy's - Downtown | Indianapolis, IN | Downtown Indy |
| 106780 | Cooper's Hawk Winery & Restaurant - Indianapolis | Indianapolis, IN | Downtown Indy |
| 255 | Larkspur Restaurant & Bar | Vail, CO | Vail |
| 104974 | Root25 Taphouse & Kitchen | Denver, CO | Tech Center / Greenwood Village |
| 51646 | Fig & Olive - Westchester | Scarsdale, NY | Scarsdale |
| 112936 | Bo's Kitchen & Bar Room | New York, NY | Gramercy / Flatiron |
| 41344 | Shore Bird Restaurant & Beach Bar | Honolulu, HI | Waikiki |
| 51238 | Ragazzi Italian Kitchen & Bar | Nesconset, NY | Nesconset |
| 19306 | Madison & Vine | New York, NY | Midtown East |
| 139840 | Lucy Ethiopian Restaurant & Lounge | Houston, TX | Galleria / Uptown |
| 145435 | El Moro Spirits & Tavern | Durango, CO | Durango |

---

## A2. Multi-location names

Chains appear two ways in this data, and only one is visible to an exact-string comparison.

### A2.1 — the 23 exact duplicate names

23 names occur at more than one location with the same `name` value, ignoring case.
All have exactly 2 locations, and none has two locations in the same city. Complete list:

| name | objectID | city | state | neighborhood | market |
|---|---|---|---|---|---|
| Cocotte | 148 | San Francisco | CA | Russian Hill | San Francisco Bay Area |
|  | 102823 | New York | NY | SoHo | New York / Tri-State Area |
| Elements | 110407 | Camden | MO | Camden | Kansas City |
|  | 90868 | Chapel Hill | NC | Chapel Hill | Raleigh / Durham / Chapel Hill |
| Eleven | 150715 | Ashland | OR | Ashland | Portland / Oregon |
|  | 3204 | Pittsburgh | PA | Downtown | Pittsburgh |
| Grange | 26626 | Sacramento | CA | Sacramento | Sacramento / Sacramento Valley |
|  | 111739 | Westwood | NJ | Westwood | New York / Tri-State Area |
| Il Forno | 112282 | New York | NY | Midtown West | New York / Tri-State Area |
|  | 3912 | Santa Monica | CA | Santa Monica | Los Angeles / Orange County |
| Il Palio | 21310 | Shelton | CT | Shelton | New York / Tri-State Area |
|  | 6900 | Chapel Hill | NC | Chapel Hill | Raleigh / Durham / Chapel Hill |
| La Bella Vita | 101974 | Colorado Springs | CO | Colorado Springs | Denver / Colorado |
|  | 98683 | New York | NY | Little Italy | New York / Tri-State Area |
| La Provence | 3737 | Roseville | CA | Roseville | Sacramento / Sacramento Valley |
|  | 12532 | Lacombe | LA | Northshore | New Orleans / Louisiana |
| Latitude 41 | 7367 | Columbus | OH | Columbus | Columbus |
|  | 31597 | Mystic | CT | Mystic | New York / Tri-State Area |
| Mateo | 3981 | Boulder | CO | Boulder | Denver / Colorado |
|  | 91960 | Durham | NC | Durham | Raleigh / Durham / Chapel Hill |
| Pappas Bros. Steakhouse | 1959 | Dallas | TX | NW Dallas / Love Field Area | Dallas - Fort Worth |
|  | 1854 | Houston | TX | Galleria / Uptown | Houston |
| Prime Steakhouse | 4941 | Denver | CO | Downtown / LoDo | Denver / Colorado |
|  | 27409 | Key West | FL | Key West | Key West / Florida Keys |
| Raaga | 61711 | Santa Fe | NM | Santa Fe | New Mexico |
|  | 60436 | Chapel Hill | NC | Chapel Hill | Raleigh / Durham / Chapel Hill |
| Rafain Brazilian Steakhouse | 68527 | Dallas | TX | North Dallas / Addison | Dallas - Fort Worth |
|  | 144949 | Fort Worth | TX | Fort Worth Downtown | Dallas - Fort Worth |
| Range | 4221 | San Francisco | CA | Mission | San Francisco Bay Area |
|  | 141001 | Denver | CO | Downtown / LoDo | Denver / Colorado |
| Rye | 95884 | Leawood | KS | Leawood | Kansas City |
|  | 105424 | Brooklyn | NY | Williamsburg | New York / Tri-State Area |
| Sienna | 69259 | Pittsburgh | PA | Downtown | Pittsburgh |
|  | 40516 | El Dorado Hills | CA | El Dorado Hills | Sacramento / Sacramento Valley |
| Sociale | 2131 | San Francisco | CA | Presidio Heights | San Francisco Bay Area |
|  | 108562 | Brooklyn | NY | Brooklyn Heights | New York / Tri-State Area |
| Soco | 63832 | Brooklyn | NY | Clinton Hill | New York / Tri-State Area |
|  | 150973 | Orlando | FL | Downtown Orlando | Orlando / Central Florida East |
| South End | 32248 | New Canaan | CT | New Canaan | New York / Tri-State Area |
|  | 113335 | Venice | CA | Venice | Los Angeles / Orange County |
| Town | 101422 | Carbondale | CO | Carbondale | Denver / Colorado |
|  | 11449 | Honolulu | HI | Honolulu | Hawaii |
| Union | 145234 | Pasadena | CA | Pasadena | Los Angeles / Orange County |
|  | 116815 | Mobile | AL | Mobile | Mobile |
| Vivace | 5694 | Raleigh | NC | Raleigh | Raleigh / Durham / Chapel Hill |
|  | 2172 | Belmont | CA | Belmont | San Francisco Bay Area |

Two observations on this set:

- **Rafain Brazilian Steakhouse** has both locations in the same `market` (`Dallas - Fort Worth`): 68527 Dallas / 144949 Fort Worth. Filtering on `market` does not separate them — only `city` or distance does.
- **Eleven** differs only by case across its records: 150715 `Eleven` / 3204 `ELEVEN`.
- **Range** differs only by case across its records: 4221 `Range` / 141001 `range`.

### A2.2 — suffixed locations: the real chain encoding

1086 records carry a ` - <location>` suffix. Grouping on the base name with the suffix
stripped gives **213 distinct base names at more than one location, covering 722 records.**

This is what makes same-city disambiguation reproducible on the extract — see A2.3. Complete
roster of every multi-location group, largest first:

**Ruth's Chris Steak House** — 31 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 5211 | Ruth's Chris Steak House - Indianapolis Northside | Indianapolis, IN | Castleton / Keystone Crossings |
| 5000 | Ruth's Chris Steak House - Indianapolis | Indianapolis, IN | Downtown Indy |
| 5416 | Ruth's Chris Steak House - Sacramento | Sacramento, CA | Sacramento |
| 4095 | Ruth's Chris Steak House - Portland | Portland, OR | Downtown |
| 10840 | Ruth's Chris Steak House - Waikiki Beach Walk | Honolulu, HI | Waikiki |
| 3836 | Ruth's Chris Steak House - Parsippany | Parsippany, NJ | Parsippany |
| 7198 | Ruth's Chris Steak House - Nashville | Nashville, TN | West End |
| 25249 | Ruth's Chris Steak House - Baton Rouge | Baton Rouge, LA | Baton Rouge |
| 4009 | Ruth's Chris Steak House - San Antonio (Airport) | San Antonio, TX | Alamo Heights |
| 14227 | Ruth's Chris Steak House - Mishawaka | Granger, IN | South Bend |
| 3505 | Ruth's Chris Steak House - Del Mar | San Diego, CA | Del Mar |
| 3840 | Ruth's Chris Steak House - Scottsdale | Scottsdale, AZ | Scottsdale |
| 6504 | Ruth's Chris Steak House - Downtown Honolulu | Honolulu, HI | Honolulu |
| 110023 | Ruth's Chris Steak House - Houston | Houston, TX | Galleria / Uptown |
| 10744 | Ruth's Chris Steak House - Lake Mary | Lake Mary, FL | Lake Mary |
| 3830 | Ruth's Chris Steak House - Metairie | Metairie, LA | Metairie |
| 6164 | Ruth's Chris Steak House - Destin | Destin, FL | Destin |
| 4997 | Ruth's Chris Steak House - Biloxi | Biloxi, MS | Biloxi |
| 3828 | Ruth's Chris Steak House - Lafayette | Lafayette, LA | Lafayette |
| 111112 | Ruth's Chris Steak House - River Walk | San Antonio, TX | Downtown |
| 119344 | Ruth's Chris Steak House - Denver | Denver, CO | Downtown / LoDo |
| 3509 | Ruth's Chris Steak House - Walnut Creek | Walnut Creek, CA | Walnut Creek |
| 115090 | Ruth's Chris Steak House - Boise | Boise, ID | Boise |
| 1048 | Ruth's Chris Steak House - Cary | Cary, NC | Cary |
| 96967 | Ruth's Chris Steak House - Harrah's Las Vegas | Las Vegas, NV | Harrah's |
| 23998 | Ruth's Chris Steak House - North Raleigh | Raleigh, NC | Raleigh |
| 6508 | Ruth's Chris Steak House - Wailea | Wailea, HI | Wailea |
| 3508 | Ruth's Chris Steak House - San Diego | San Diego, CA | Downtown / Gaslamp |
| 5507 | Ruth's Chris Steak House - Pittsburgh | Pittsburgh, PA | Downtown |
| 21349 | Ruth's Chris Steak House - New Orleans | New Orleans, LA | Central Business District |
| 19624 | Ruth's Chris Steak House - Mobile | Mobile, AL | Mobile |

**Buca di Beppo** — 29 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 19378 | Buca di Beppo - Mira Mesa | San Diego, CA | Mira Mesa |
| 59398 | Buca di Beppo - Houston - Speedway | Houston, TX | Downtown |
| 53404 | Buca di Beppo - Greenwood | Greenwood, IN | Greenwood |
| 53377 | Buca di Beppo - Burnsville | Burnsville, MN | Burnsville |
| 53386 | Buca di Beppo - Columbus | Columbus, OH | Columbus |
| 59350 | Buca di Beppo - Albuquerque | Albuquerque, NM | Albuquerque |
| 59401 | Buca di Beppo - The Woodlands | Shenandoah, TX | The Woodlands |
| 59425 | Buca di Beppo - Mesa | Mesa, AZ | Mesa |
| 53383 | Buca di Beppo - Castleton Square | Indianapolis, IN | Castleton / Keystone Crossings |
| 53428 | Buca di Beppo - Pittsburgh - Robinson Town Center | Pittsburgh, PA | Robinson Township |
| 59452 | Buca di Beppo - Scottsdale | Scottsdale, AZ | Scottsdale |
| 1260 | Buca di Beppo - San Francisco | San Francisco, CA | SOMA |
| 53410 | Buca di Beppo - Downtown Indianapolis | Indianapolis, IN | Downtown Indy |
| 53434 | Buca di Beppo - Southlake | Southlake, TX | Southlake |
| 59359 | Buca di Beppo - Chandler | Chandler, AZ | Chandler |
| 53407 | Buca di Beppo - Honolulu | Honolulu, HI | Honolulu |
| 59317 | Buca di Beppo - Arrowhead | Peoria, AZ | Peoria |
| 53431 | Buca di Beppo - Pittsburgh - Station Square | Pittsburgh, PA | Downtown |
| 19399 | Buca di Beppo - Roseville | Roseville, CA | Roseville |
| 59308 | Buca di Beppo - Cool Springs | Franklin, TN | Franklin / Brentwood |
| 59392 | Buca di Beppo - Kansas City | Kansas City, MO | Kansas City |
| 19402 | Buca di Beppo - Sacramento | Sacramento, CA | Sacramento |
| 19405 | Buca di Beppo - San Diego | San Diego, CA | Downtown / Gaslamp |
| 59353 | Buca di Beppo - Albany | Colonie, NY | Albany |
| 94645 | Buca di Beppo - Tallahassee | Tallahassee, FL | Tallahassee |
| 19384 | Buca di Beppo - Pasadena | Pasadena, CA | Pasadena |
| 59338 | Buca di Beppo - Broomfield | Broomfield, CO | Broomfield |
| 19357 | Buca di Beppo - Carlsbad | Carlsbad, CA | Carlsbad |
| 53425 | Buca di Beppo - Park Lane | Dallas, TX | Downtown |

**The Melting Pot** — 26 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 109657 | The Melting Pot - Houston | Houston, TX | Galleria / Uptown |
| 62707 | The Melting Pot - Boise | Boise, ID | Boise |
| 5377 | The Melting Pot - Castleton | Indianapolis, IN | Castleton / Keystone Crossings |
| 1605 | The Melting Pot - Gaslamp Quarter | San Diego, CA | Downtown / Gaslamp |
| 14623 | The Melting Pot - Albuquerque | Albuquerque, NM | Albuquerque |
| 109651 | The Melting Pot - Scottsdale | Scottsdale, AZ | Scottsdale |
| 4829 | The Melting Pot - La Jolla | San Diego, CA | University City/Golden Triangle |
| 63313 | The Melting Pot - Raleigh | Raleigh, NC | Raleigh |
| 74356 | The Melting Pot - OKC | Oklahoma City, OK | Oklahoma City |
| 3778 | The Melting Pot - Cooper City | Cooper City, FL | Fort Lauderdale |
| 147847 | The Melting Pot - Longwood | Longwood, FL | Longwood |
| 61915 | The Melting Pot - Darien | Darien, CT | Darien |
| 60457 | The Melting Pot - Columbus | Columbus, OH | Columbus |
| 53878 | The Melting Pot - Tucson | Tucson, AZ | Tucson |
| 82216 | The Melting Pot - Poughkeepsie | Poughkeepsie, NY | Poughkeepsie |
| 109642 | The Melting Pot - Arrowhead | Glendale, AZ | Glendale / Peoria |
| 91225 | The Melting Pot - Buffalo | Buffalo, NY | Buffalo |
| 91591 | The Melting Pot - Rochester | Rochester, NY | Rochester |
| 7477 | The Melting Pot - Larkspur | Larkspur, CA | Larkspur |
| 3616 | The Melting Pot - Portland | Portland, OR | Downtown |
| 82210 | The Melting Pot - Albany | Albany, NY | Albany |
| 107437 | The Melting Pot - Dallas - Addison | Addison, TX | North Dallas / Addison |
| 109648 | The Melting Pot - Nashville | Nashville, TN | Nashville |
| 82213 | The Melting Pot - Syracuse | Syracuse, NY | Syracuse |
| 109639 | The Melting Pot - Ahwatukee | Ahwatukee, AZ | Ahwatukee |
| 15763 | The Melting Pot - Farmingdale | Farmingdale, NY | Farmingdale |

**Benihana** — 24 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 86998 | Benihana - Carlsbad | Carlsbad, CA | Carlsbad |
| 87070 | Benihana - Columbus | Columbus, OH | Polaris |
| 86968 | Benihana - Chandler | Chandler, AZ | Chandler |
| 145432 | Benihana - Key West | Key West, FL | Key West |
| 86962 | Benihana - Sacramento | Citrus Heights, CA | Citrus Heights |
| 87019 | Benihana - Short Hills | Short Hills, NJ | Short Hills |
| 86959 | Benihana - Beaverton | Beaverton, OR | Beaverton |
| 87121 | Benihana - Plano | Plano, TX | Plano |
| 87049 | Benihana - New York | New York, NY | Upper West Side |
| 87118 | Benihana - Houston | Houston, TX | Far Westheimer |
| 87031 | Benihana - Indianapolis | Indianapolis, IN | Downtown Indy |
| 87136 | Benihana - The Woodlands | Spring, TX | The Woodlands |
| 87004 | Benihana - San Diego | San Diego, CA | Mission Valley |
| 87034 | Benihana - Stuart | Stuart, FL | Stuart |
| 87016 | Benihana - Pittsburgh | Pittsburgh, PA | Downtown |
| 86983 | Benihana - Scottsdale | Scottsdale, AZ | Scottsdale |
| 87139 | Benihana - Sugar Land | Sugar Land, TX | Sugar Land / Missouri City |
| 86980 | Benihana - Denver | Denver, CO | Tech Center / Greenwood Village |
| 135958 | Benihana - North Little Rock | North Little Rock, AR | Little Rock |
| 87052 | Benihana - Manhasset | Manhasset, NY | Stormville |
| 87127 | Benihana - Memphis | Memphis, TN | Memphis |
| 87079 | Benihana - Westbury | Westbury, NY | Westbury |
| 87094 | Benihana - Houston - Downtown | Houston, TX | Downtown |
| 87097 | Benihana - Dallas | Dallas, TX | North Dallas / Addison |

**Fleming's Steakhouse** — 18 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 39988 | Fleming's Steakhouse - Nashville | Nashville, TN | Nashville |
| 40030 | Fleming's Steakhouse - San Diego | San Diego, CA | Downtown / Gaslamp |
| 40060 | Fleming's Steakhouse - Des Moines | Des Moines, IA | West Des Moines |
| 47338 | Fleming's Steakhouse - Peoria | Peoria, AZ | Glendale / Peoria |
| 39997 | Fleming's Steakhouse - Orlando | Orlando, FL | Dr. Phillips |
| 40009 | Fleming's Steakhouse - Raleigh | Raleigh, NC | Raleigh |
| 39994 | Fleming's Steakhouse - Omaha | Omaha, NE | West Omaha |
| 39940 | Fleming's Steakhouse - Houston | Houston, TX | River Oaks |
| 40036 | Fleming's Steakhouse - Scottsdale | Scottsdale, AZ | Scottsdale |
| 39964 | Fleming's Steakhouse - La Jolla | La Jolla, CA | University City/Golden Triangle |
| 40024 | Fleming's Steakhouse - San Antonio | San Antonio, TX | Alamo Heights |
| 39943 | Fleming's Steakhouse - Houston Beltway | Houston, TX | West Side |
| 40027 | Fleming's Steakhouse - Sandestin | Sandestin, FL | Destin |
| 39937 | Fleming's Steakhouse - West Hartford | West Hartford, CT | Hartford / West Hartford |
| 39904 | Fleming's Steakhouse - Chandler | Chandler, AZ | Chandler |
| 40051 | Fleming's Steakhouse - Tucson | Tucson, AZ | Tucson |
| 39919 | Fleming's Steakhouse - DC Ranch | Scottsdale, AZ | Scottsdale |
| 39922 | Fleming's Steakhouse - Denver | Denver, CO | Englewood |

**Maggiano's** — 15 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 15136 | Maggiano's - Hackensack | Hackensack, NJ | Hackensack |
| 15142 | Maggiano's - Indianapolis | Indianapolis, IN | Castleton / Keystone Crossings |
| 15073 | Maggiano's - Orlando | Orlando, FL | I Drive / Sand Lake |
| 15130 | Maggiano's - Denver South | Englewood, CO | Englewood |
| 15139 | Maggiano's - Houston | Houston, TX | Galleria / Uptown |
| 26038 | Maggiano's - San Antonio | San Antonio, TX | Northwest |
| 15127 | Maggiano's - Denver Pavilions | Denver, CO | Downtown / LoDo |
| 15091 | Maggiano's - Willow Bend | Plano, TX | Plano |
| 15154 | Maggiano's - Nashville | Nashville, TN | West End |
| 15133 | Maggiano's - Durham | Durham, NC | Durham |
| 15076 | Maggiano's - San Jose | San Jose, CA | San Jose |
| 15109 | Maggiano's - Bridgewater | Bridgewater, NJ | Bridgewater |
| 15160 | Maggiano's - Scottsdale | Scottsdale, AZ | Scottsdale |
| 150313 | Maggiano's - Sacramento | Sacramento, CA | Sacramento |
| 15061 | Maggiano's - Las Vegas | Las Vegas, NV | Fashion Show Mall |

**Kona Grill** — 13 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 28288 | Kona Grill - Omaha | Omaha, NE | West Omaha |
| 28279 | Kona Grill - Gilbert | Gilbert, AZ | Gilbert |
| 28285 | Kona Grill - Carmel | Carmel, IN | Carmel / Westfield |
| 28282 | Kona Grill - Chandler | Chandler, AZ | Chandler |
| 28321 | Kona Grill - San Antonio | San Antonio, TX | La Cantera |
| 146077 | Kona Grill - El Paso | El Paso, TX | El Paso |
| 28273 | Kona Grill - Scottsdale | Scottsdale, AZ | Scottsdale |
| 28300 | Kona Grill - Baton Rouge | Baton Rouge, LA | Baton Rouge |
| 116557 | Kona Grill - The Woodlands | The Woodlands, TX | The Woodlands |
| 28318 | Kona Grill - Houston | Houston, TX | Galleria / Uptown |
| 28306 | Kona Grill - Kansas City | Kansas City, MO | Plaza / Brookside |
| 28291 | Kona Grill - Denver | Denver, CO | Cherry Creek |
| 114313 | Kona Grill - Boise | Meridian, ID | Meridian |

**Morton's The Steakhouse** — 13 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 7731 | Morton's The Steakhouse - Houston - Downtown | Houston, TX | Downtown |
| 3024 | Morton's The Steakhouse - Pittsburgh | Pittsburgh, PA | Downtown |
| 3104 | Morton's The Steakhouse - San Antonio | San Antonio, TX | Downtown |
| 3106 | Morton's The Steakhouse - Portland | Portland, OR | Downtown |
| 3100 | Morton's The Steakhouse - Houston - Galleria | Houston, TX | Galleria / Uptown |
| 107917 | Morton's The Steakhouse - Biloxi | Biloxi, MS | Biloxi |
| 3123 | Morton's The Steakhouse - Sacramento | Sacramento, CA | Sacramento |
| 3115 | Morton's The Steakhouse - San Diego | San Diego, CA | Downtown / Gaslamp |
| 3029 | Morton's The Steakhouse - Indianapolis | Indianapolis, IN | Downtown Indy |
| 3107 | Morton's The Steakhouse - New Orleans | New Orleans, LA | Central Business District |
| 3116 | Morton's The Steakhouse - Denver | Denver, CO | Downtown / LoDo |
| 3109 | Morton's The Steakhouse - Nashville | Nashville, TN | Nashville |
| 7733 | Morton's The Steakhouse - San Jose | San Jose, CA | San Jose |

**Seasons 52** — 11 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 79990 | Seasons 52 - Roosevelt Field | Garden City, NY | Garden City |
| 70639 | Seasons 52 - Kansas City | Kansas City, MO | Plaza / Brookside |
| 94843 | Seasons 52 - San Diego | San Diego, CA | University City/Golden Triangle |
| 50173 | Seasons 52 - Phoenix | Phoenix, AZ | Phoenix |
| 100660 | Seasons 52 - Sacramento | Sacramento, CA | Arden Fair |
| 48736 | Seasons 52 - Plano | Plano, TX | Plano |
| 151189 | Seasons 52 - Princeton | Princeton, NJ | Princeton |
| 10681 | Seasons 52 - Orlando | Orlando, FL | I Drive / Sand Lake |
| 113794 | Seasons 52 - Edison | Edison, NJ | Edison |
| 115708 | Seasons 52 - Memphis | Memphis, TN | Memphis |
| 104785 | Seasons 52 - Westheimer | Houston, TX | Galleria / Uptown |

**The Capital Grille** — 11 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 114100 | The Capital Grille - Houston - CityCentre | Houston, TX | West Side |
| 2709 | The Capital Grille - Denver | Denver, CO | Downtown / LoDo |
| 14047 | The Capital Grille - Pittsburgh | Pittsburgh, PA | Downtown |
| 12256 | The Capital Grille - Indianapolis | Indianapolis, IN | Downtown Indy |
| 2358 | The Capital Grille - Phoenix | Phoenix, AZ | Phoenix |
| 116572 | The Capital Grille - Memphis | Memphis, TN | Downtown |
| 2059 | The Capital Grille - Dallas - Uptown | Dallas, TX | Uptown |
| 66457 | The Capital Grille - Plano | Plano, TX | Plano |
| 4996 | The Capital Grille - Scottsdale | Scottsdale, AZ | Scottsdale |
| 2058 | The Capital Grille - Houston | Houston, TX | Galleria / Uptown |
| 2063 | The Capital Grille - Miami | Miami, FL | Miami |

**McCormick & Schmick's Seafood** — 10 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 6775 | McCormick & Schmick's Seafood - San Diego | San Diego, CA | Downtown / Gaslamp |
| 22846 | McCormick & Schmick's Seafood - Raleigh - Crabtree Mall | Raleigh, NC | Raleigh |
| 6681 | McCormick & Schmick's Seafood - Houston | Houston, TX | Galleria / Uptown |
| 6684 | McCormick & Schmick's Seafood - Las Vegas | Las Vegas, NV | Paradise |
| 6794 | McCormick & Schmick's Seafood - Pittsburgh South Side | Pittsburgh, PA | Downtown |
| 22864 | McCormick & Schmick's Seafood - Roseville - The Fountains | Roseville, CA | Roseville |
| 22867 | McCormick & Schmick's Seafood - Houston - Downtown | Houston, TX | Downtown |
| 6793 | McCormick & Schmick's Seafood - Denver | Denver, CO | Tech Center / Greenwood Village |
| 13990 | McCormick & Schmick's Seafood - Pittsburgh Downtown | Pittsburgh, PA | Downtown |
| 6789 | McCormick & Schmick's Seafood - Indianapolis | Indianapolis, IN | Downtown Indy |

**Texas de Brazil** — 10 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 39355 | Texas de Brazil - Addison | Addison, TX | North Dallas / Addison |
| 110653 | Texas de Brazil - Syracuse | Syracuse, NY | Syracuse |
| 39379 | Texas de Brazil - Denver | Denver, CO | Stapleton / Northfield |
| 57682 | Texas de Brazil - San Antonio | San Antonio, TX | Downtown |
| 74959 | Texas de Brazil - Yonkers | Yonkers, NY | Yonkers |
| 39415 | Texas de Brazil - Memphis | Memphis, TN | Memphis |
| 105568 | Texas de Brazil - Houston | Houston, TX | Spring Branch |
| 95770 | Texas de Brazil - Pittsburgh | Pittsburgh, PA | Mt. Washington |
| 95767 | Texas de Brazil - Columbus | Columbus, OH | Columbus |
| 39364 | Texas de Brazil - Dallas | Dallas, TX | Uptown |

**Atria's** — 8 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 97225 | Atria's - PNC Park | Pittsburgh, PA | Downtown |
| 97210 | Atria's - Mt. Lebanon | Mount Lebanon, PA | Mt. Lebanon |
| 97219 | Atria's - O'Hara Township | Pittsburgh, PA | O'Hara Township |
| 92032 | Atria's - Wexford | Wexford, PA | Wexford |
| 97228 | Atria's - Richland | Gibsonia, PA | Gibsonia |
| 97222 | Atria's - Peters Township | McMurray, PA | McMurray |
| 97450 | Atria's - Pleasant Hills | Pittsburgh, PA | Pleasant Hills |
| 97213 | Atria's - Murrysville | Murrysville, PA | Murrysville |

**RA Sushi Bar Restaurant** — 8 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 110818 | RA Sushi Bar Restaurant - Houston Highland Village | Houston, TX | Downtown |
| 110875 | RA Sushi Bar Restaurant - Tempe | Tempe, AZ | Tempe |
| 110881 | RA Sushi Bar Restaurant - Tucson | Tucson, AZ | Tucson |
| 110878 | RA Sushi Bar Restaurant - Phoenix | Phoenix, AZ | Ahwatukee |
| 110911 | RA Sushi Bar Restaurant - Plano | Plano, TX | Plano |
| 110821 | RA Sushi Bar Restaurant - Houston CityCentre | Houston, TX | West Side |
| 110920 | RA Sushi Bar Restaurant - Leawood | Leawood, KS | Leawood |
| 110827 | RA Sushi Bar Restaurant - Mesa | Mesa, AZ | Mesa |

**Il Fornaio** — 7 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 6094 | Il Fornaio - Sacramento | Sacramento, CA | Sacramento |
| 961 | Il Fornaio - Corte Madera | Corte Madera, CA | Corte Madera |
| 6093 | Il Fornaio - Roseville | Roseville, CA | Roseville |
| 2864 | Il Fornaio - San Jose | San Jose, CA | San Jose |
| 2863 | Il Fornaio - Palo Alto | Palo Alto, CA | Palo Alto |
| 3974 | Il Fornaio - Coronado | Coronado, CA | Coronado |
| 3973 | Il Fornaio - Del Mar | Del Mar, CA | Del Mar |

**Perry's Steakhouse & Grille** — 7 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 15805 | Perry's Steakhouse & Grille - Clear Lake | Houston, TX | Clear Lake / Webster / Bay Area |
| 69556 | Perry's Steakhouse & Grille - San Antonio | San Antonio, TX | La Cantera |
| 15808 | Perry's Steakhouse & Grille - Memorial City | Houston, TX | West Side |
| 15799 | Perry's Steakhouse & Grille - Sugar Land | Sugar Land, TX | Sugar Land / Missouri City |
| 15811 | Perry's Steakhouse & Grille - The Woodlands | The Woodlands, TX | The Woodlands |
| 30181 | Perry's Steakhouse & Grille - Cinco Ranch/Katy | Katy, TX | Katy |
| 15802 | Perry's Steakhouse & Grille - Champions | Houston, TX | Champions |

**Dinosaur Bar-B-Que** — 6 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 83821 | Dinosaur Bar-B-Que - Troy | Troy, NY | Troy |
| 139297 | Dinosaur Bar-B-Que - Rochester | Rochester, NY | Rochester |
| 124594 | Dinosaur Bar-B-Que - Buffalo | Buffalo, NY | Buffalo |
| 5274 | Dinosaur Bar-B-Que - Harlem | New York, NY | Upper West Side |
| 100246 | Dinosaur Bar-B-Que - Stamford | Stamford, CT | Stamford |
| 102346 | Dinosaur Bar-B-Que - Brooklyn | Brooklyn, NY | Park Slope |

**Palm Restaurant** — 6 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 109195 | Palm Restaurant - Houston | Houston, TX | Galleria / Uptown |
| 7445 | Palm Restaurant - Orlando | Orlando, FL | I Drive / Sand Lake |
| 13357 | Palm Restaurant - San Antonio | San Antonio, TX | Downtown |
| 13372 | Palm Restaurant - NYC Too | New York, NY | Midtown East |
| 13351 | Palm Restaurant - Denver | Denver, CO | Downtown / LoDo |
| 13390 | Palm Restaurant - Nashville | Nashville, TN | Downtown |

**Piatti** — 6 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 1563 | Piatti - San Antonio | San Antonio, TX | Alamo Heights |
| 863 | Piatti - Sacramento | Sacramento, CA | Sacramento |
| 209 | Piatti - Mill Valley | Mill Valley, CA | Mill Valley |
| 551 | Piatti - La Jolla | La Jolla, CA | La Jolla |
| 860 | Piatti - Denver | Denver, CO | Cherry Creek |
| 2122 | Piatti - Santa Clara | Santa Clara, CA | Santa Clara |

**Sullivan's Steakhouse** — 6 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 11740 | Sullivan's Steakhouse - Baton Rouge | Baton Rouge, LA | Baton Rouge |
| 24319 | Sullivan's Steakhouse - Leawood | Leawood, KS | Leawood |
| 4661 | Sullivan's Steakhouse | Houston, TX | Galleria / Uptown |
| 11683 | Sullivan's Steakhouse - Tucson | Tucson, AZ | Tucson |
| 6269 | Sullivan's Steakhouse - Raleigh | Raleigh, NC | Raleigh |
| 14668 | Sullivan's Steakhouse - Omaha | Omaha, NE | Downtown / Old Market |

**Chart House Restaurant** — 5 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 11881 | Chart House Restaurant - Melbourne | Melbourne, FL | Melbourne |
| 11902 | Chart House Restaurant - Portland | Portland, OR | Downtown |
| 11530 | Chart House Restaurant - Cardiff | Cardiff, CA | Solana Beach |
| 11911 | Chart House Restaurant - Scottsdale | Scottsdale, AZ | Scottsdale |
| 17065 | Chart House Restaurant - Tower of the Americas | San Antonio, TX | Downtown |

**Cyclone Anaya's** — 5 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 145369 | Cyclone Anaya's - CityCentre | Houston, TX | West Side |
| 145366 | Cyclone Anaya's - Midtown | Houston, TX | Midtown / Montrose |
| 151276 | Cyclone Anaya's - Rice Village | Houston, TX | Midtown / Montrose |
| 145381 | Cyclone Anaya's - Woodway | Houston, TX | Galleria / Uptown |
| 145375 | Cyclone Anaya's -  Durham | Houston, TX | Heights / Washington |

**Eddie V's** — 5 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 112720 | Eddie V's - Orlando | Orlando, FL | Dr. Phillips |
| 35533 | Eddie V's - City Centre | Houston, TX | West Side |
| 51655 | Eddie V's - West Ave | Houston, TX | River Oaks |
| 116821 | Eddie V's - San Diego | San Diego, CA | Downtown / Gaslamp |
| 67972 | Eddie V's - La Jolla | La Jolla, CA | La Jolla |

**Fogo de Chao Brazilian Steakhouse** — 5 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 118927 | Fogo de Chao Brazilian Steakhouse - San Jose | San Jose, CA | San Jose |
| 39349 | Fogo de Chao Brazilian Steakhouse - Houston | Houston, TX | Galleria / Uptown |
| 39382 | Fogo de Chao Brazilian Steakhouse - San Antonio | San Antonio, TX | Downtown |
| 74671 | Fogo de Chao Brazilian Steakhouse - Las Vegas | Las Vegas, NV | Paradise |
| 110638 | Fogo de Chao Brazilian Steakhouse - San Diego | San Diego, CA | Downtown / Gaslamp |

**NoRTH** — 5 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 32161 | NoRTH - Kansas City | Leawood, KS | Leawood |
| 4413 | North - Denver | Denver, CO | Cherry Creek |
| 5471 | NoRTH - Tucson | Tucson, AZ | Tucson |
| 5644 | NoRTH - Scottsdale | Scottsdale, AZ | Scottsdale |
| 44395 | North | Armonk, NY | Armonk |

**Stanford's** — 5 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 84328 | Stanford's - Clackamas | Clackamas, OR | Clackamas |
| 84337 | Stanford's - Lloyd Center | Portland, OR | NE Portland |
| 84343 | Stanford's - Tanasbourne | Hillsboro, OR | Hillsboro |
| 84334 | Stanford's - Kruse Way (Lake Oswego) | Lake Oswego, OR | Lake Oswego |
| 84331 | Stanford's - Jantzen Beach | Portland, OR | North Portland |

**Bob's Steak & Chop House** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 113602 | Bob's Steak & Chop House - Nashville | Nashville, TN | Downtown |
| 101221 | Bob's Steak & Chop House - San Antonio | San Antonio, TX | Northwest |
| 72721 | Bob's Steak & Chop House - Dallas on Lamar | Dallas, TX | Downtown |
| 5087 | Bob's Steak & Chop House - San Francisco | San Francisco, CA | Financial District / Embarcadero |

**BRAVO Cucina Italiana** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 150088 | BRAVO Cucina Italiana - Columbus - Lennox | Columbus, OH | Columbus |
| 150073 | BRAVO Cucina Italiana - Columbus - Crosswoods | Columbus, OH | Worthington |
| 150070 | BRAVO Cucina Italiana - Columbus - Bethel Road | Columbus, OH | Northwest Columbus |
| 149911 | BRAVO Cucina Italiana - Buffalo - Walden | Buffalo, NY | Buffalo |

**BRIO Tuscan Grille** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 149908 | BRIO Tuscan Grille - Boca Raton | Boca Raton, FL | Boca Raton |
| 149965 | BRIO Tuscan Grille - Freehold - Raceway Mall | Freehold, NJ | Freehold |
| 150118 | BRIO Tuscan Grille - Winter Park | Winter Park, FL | Winter Park |
| 149980 | BRIO Tuscan Grille - Huntington Station - Walt Whitman | Huntington, NY | Huntington |

**Churrascos** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 883 | Churrascos - Westchase | Houston, TX | West Side |
| 150679 | Churrascos - Champions | Houston, TX | Champions |
| 114319 | Churrascos - Memorial City | Houston, TX | West Side |
| 882 | Churrascos - River Oaks | Houston, TX | Upper Kirby / Shepherd Corridor |

**Crush** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 71653 | Crush - Chico | Chico, CA | Chico |
| 107134 | Crush - Sandusky | Sandusky, OH | Sandusky |
| 115576 | Crush - MGM Grand | Las Vegas, NV | MGM Grand Hotel & Casino |
| 66649 | Crush - Solana Beach | Solana Beach, CA | Solana Beach |

**Eddie Merlot's** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 1815 | Eddie Merlot's - Fort Wayne | Fort Wayne, IN | Fort Wayne |
| 18712 | Eddie Merlot's - Columbus | Columbus, OH | Polaris |
| 114637 | Eddie Merlot's - Pittsburgh | Pittsburgh, PA | Downtown |
| 12544 | Eddie Merlot's - Indianapolis | Indianapolis, IN | Downtown Indy |

**Grindstone Charley's** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 139579 | Grindstone Charley's - Speedway | Indianapolis, IN | Speedway |
| 139768 | Grindstone Charley's - Kokomo | Kokomo, IN | Kokomo |
| 139771 | Grindstone Charley's - Lafayette | Lafayette, IN | Lafayette / West Lafayette |
| 139576 | Grindstone Charley's - Rockville Rd | Indianapolis, IN | West Indy |

**Gyu-Kaku** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 10453 | Gyu-Kaku - Kapiolani | Honolulu, HI | Honolulu |
| 79393 | Gyu-Kaku - Times Square | New York, NY | Theater District / Times Square |
| 133948 | Gyu-Kaku - Houston | Houston, TX | Downtown |
| 103705 | Gyu-Kaku - White Plains | White Plains, NY | White Plains |

**J. Alexander's** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 110467 | J. Alexander's - Denver | Englewood, CO | Englewood |
| 110488 | J. Alexander's - Jacksonville | Jacksonville, FL | Jacksonville |
| 110464 | J. Alexander's - Columbus | Columbus, OH | Worthington |
| 110485 | J. Alexander's - Houston | Houston, TX | Westchase |

**Oceanaire Seafood Room** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 2626 | Oceanaire Seafood Room - Indianapolis | Indianapolis, IN | Downtown Indy |
| 12358 | Oceanaire Seafood Room - Denver | Denver, CO | Downtown / LoDo |
| 3571 | Oceanaire Seafood Room - San Diego | San Diego, CA | Downtown / Gaslamp |
| 7296 | Oceanaire Seafood Room - Houston | Houston, TX | Galleria / Uptown |

**Spaghetti Warehouse** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 136165 | Spaghetti Warehouse - Syracuse | Syracuse, NY | Syracuse |
| 136153 | Spaghetti Warehouse - Arlington | Arlington, TX | Arlington |
| 136159 | Spaghetti Warehouse - Pittsburgh | Pittsburgh, PA | Downtown |
| 136147 | Spaghetti Warehouse - Akron | Akron, OH | Akron |

**Stone Creek** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 22507 | Stone Creek - Plainfield | Plainfield, IN | Plainfield |
| 22498 | Stone Creek - Greenwood | Greenwood, IN | Greenwood |
| 22504 | Stone Creek - Noblesville | Noblesville, IN |  Noblesville |
| 22510 | Stone Creek - Zionsville | Zionsville, IN | NW Indy / Zionsville |

**The Kitchen** — 4 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3482 | The Kitchen - Boulder | Boulder, CO | Boulder |
| 139456 | The Kitchen - Fort Collins | Fort Collins, CO | Fort Collins |
| 81049 | The Kitchen - Denver | Denver, CO | Downtown / LoDo |
| 32104 | The Kitchen | Jackson Hole, WY | Jackson |

**Acqua** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 87745 | Acqua | San Diego, CA | Mission Bay |
| 105523 | ACQUA - Forest Lake | Forest Lake, MN | Forest Lake |
| 63523 | Acqua - NYC | New York, NY | Upper West Side |

**Amerigo** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 24406 | Amerigo - Cool Springs | Brentwood, TN | Franklin / Brentwood |
| 32695 | Amerigo - Memphis | Memphis, TN | East Memphis |
| 24388 | Amerigo - West End | Nashville, TN | West End |

**BD's Mongolian Grill** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 110191 | BD's Mongolian Grill – Arena | Columbus, OH | Short North - Arena District |
| 110188 | BD's Mongolian Grill - Easton | Columbus, OH | Easton |
| 110209 | BD's Mongolian Grill – Dublin | Dublin, OH | Dublin |

**Cantina Laredo** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 83167 | Cantina Laredo - Nashville | Nashville, TN | The Gulch |
| 149221 | Cantina Laredo - Jacksonville | Jacksonville, FL | Jacksonville |
| 45820 | Cantina Laredo - Columbus | Columbus, OH | Columbus |

**Cerulean** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 144385 | Cerulean | Portlando, OR | Pearl District |
| 97438 | Cerulean - Indianapolis | Indianapolis, IN | Downtown Indy |
| 97435 | Cerulean - Winona Lake | Winona Lake, IN | Winona Lake - Warsaw |

**Crave** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 93931 | Crave - Akron | Akron, OH | Akron |
| 152158 | CRAVE - Summerlin | Las Vegas, NV | Downtown Summerlin |
| 50422 | CRAVE - Omaha | Omaha, NE | Midtown |

**Crossroads at House of Blues** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 78652 | Crossroads at House of Blues - New Orleans | New Orleans, LA | French Quarter |
| 66820 | Crossroads at House of Blues - Houston | Houston, TX | Downtown |
| 79084 | Crossroads at House of Blues - San Diego | San Diego, CA | Downtown / Gaslamp |

**Dick's Last Resort** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 114010 | Dick's Last Resort - San Antonio | San Antonio, TX | Downtown |
| 75679 | Dick's Last Resort - San Diego | San Diego, CA | Downtown / Gaslamp |
| 129250 | Dick's Last Resort - Orlando | Orlando, FL | Lake Buena Vista |

**Donovan's** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3532 | Donovan's - Phoenix | Phoenix, AZ | Phoenix |
| 16033 | Donovan's - San Diego Gaslamp | San Diego, CA | Downtown / Gaslamp |
| 1687 | Donovan's - La Jolla | La Jolla, CA | La Jolla |

**Grotto** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 64501 | Grotto - Houston | Houston, TX | Galleria / Uptown |
| 107914 | Grotto - The Woodlands | The Woodlands, TX | The Woodlands |
| 109186 | Grotto - Galveston - San Luis Resort | Galveston, TX | Galveston |

**Jax Fish House** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 6471 | Jax Fish House - Denver | Denver, CO | Downtown / LoDo |
| 82393 | Jax Fish House - Fort Collins | Fort Collins, CO | Fort Collins |
| 115792 | Jax Fish House - Glendale | Glendale, CO | Cherry Creek |

**Kabuki Japanese Restaurant** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 43198 | Kabuki Japanese Restaurant - Tempe | Tempe, AZ | Tempe |
| 43195 | Kabuki Japanese Restaurant - Glendale | Glendale, AZ | Glendale / Peoria |
| 43204 | Kabuki Japanese Restaurant - Las Vegas | Las Vegas, NV | Town Square |

**Landry's Seafood House** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 124645 | Landry's Seafood House - San Antonio | San Antonio, TX | Downtown |
| 102541 | Landry's Seafood House - The Woodlands | The Woodlands, TX | The Woodlands |
| 147844 | Landry's Seafood House - Denver | Englewood, CO | Englewood |

**Louie's Wine Dive** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 138958 | Louie's Wine Dive - Des Moines | Des Moines, IA | Des Moines |
| 148933 | Louie's Wine Dive - Omaha | Omaha, NE | West Omaha |
| 97267 | Louie's Wine Dive - Kansas City | Kansas City, MO | Plaza / Brookside |

**Merriman's** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 52798 | Merriman's – Waimea – Big Island | Kamuela, HI | Kamuela |
| 35704 | Merriman's - Poipu | Koloa, HI | Koloa |
| 22207 | Merriman's - Kapalua, Maui | Lahaina, HI | Kapalua |

**Mitchell's Fish Market** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 11536 | Mitchell's Fish Market - Sandestin | Miramar Beach, FL | Destin |
| 19531 | Mitchell's Fish Market - Galleria - Pittsburgh | Pittsburgh, PA | South Hills |
| 6658 | Mitchell's Fish Market - Carmel | Carmel, IN | Carmel / Westfield |

**MP Taverna** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 51034 | MP Taverna - Roslyn | Roslyn, NY | Roslyn |
| 41227 | MP Taverna - Irvington | Irvington, NY | Irvington |
| 101026 | MP Taverna - Astoria | Astoria, NY | Astoria |

**Ocean Prime** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 25456 | Ocean Prime - Phoenix | Phoenix, AZ | Scottsdale |
| 54049 | Ocean Prime - Denver | Denver, CO | Downtown / LoDo |
| 86356 | Ocean Prime - Indianapolis | Indianapolis, IN | Castleton / Keystone Crossings |

**Paul Martin's American Grill** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 129310 | Paul Martin's American Grill - Scottsdale | Scottsdale, AZ | Scottsdale |
| 15883 | Paul Martin's American Grill - Roseville | Roseville, CA | Roseville |
| 108910 | Paul Martin's American Grill - San Mateo | San Mateo, CA | San Mateo |

**Rock Bottom Brewery** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 41185 | Rock Bottom Brewery - Portland | Portland, OR | Downtown |
| 41182 | Rock Bottom Brewery - La Jolla | La Jolla, CA | La Jolla |
| 41170 | Rock Bottom Brewery - Indianapolis | Indianapolis, IN | Downtown Indy |

**Roy's** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 115804 | Roy's - Kaanapali | Lahaina, HI | Lahaina |
| 963 | Roy's - San Francisco | San Francisco, CA | SOMA |
| 40096 | Roy's - La Jolla | San Diego, CA | University City/Golden Triangle |

**Stone Werks** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 79162 | Stone Werks - The Vineyard | San Antonio, TX | North San Antonio |
| 32614 | Stone Werks - The Rim | San Antonio, TX | Northwest |
| 76780 | Stone Werks - Lincoln Heights | San Antonio, TX | Alamo Heights |

**Sushi Zushi** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 20611 | Sushi Zushi - Downtown | San Antonio, TX | Downtown |
| 20605 | Sushi Zushi - Lincoln Heights | San Antonio, TX | Alamo Heights |
| 20602 | Sushi Zushi - Colonnade | San Antonio, TX | North San Antonio |

**The Tasting Room** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 85492 | The Tasting Room - Kings Harbor | Kingwood, TX | Kingwood / Humble / Atascocita |
| 94765 | The Tasting Room - Uptown Park | Houston, TX | Galleria / Uptown |
| 57871 | The Tasting Room - CITYCENTRE | Houston, TX | West Side |

**The Wine Bistro** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 103939 | The Wine Bistro - Upper Arlington | Columbus, OH | Upper Arlington |
| 103948 | The Wine Bistro - Worthington | Columbus, OH | Worthington |
| 103969 | The Wine Bistro - Clintonville | Columbus, OH | Clintonville |

**Vivace** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 5694 | Vivace | Raleigh, NC | Raleigh |
| 16165 | Vivace - Park Hyatt Aviara | Carlsbad, CA | Carlsbad |
| 2172 | Vivace | Belmont, CA | Belmont |

**Walnut Grill** — 3 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 25486 | Walnut Grill - Wexford | Wexford, PA | Wexford |
| 34399 | Walnut Grill - Fox Chapel | Pittsburgh, PA | Fox Chapel |
| 112837 | Walnut Grill - Bridgeville | Bridgeville, PA | Downtown |

**5 Napkin Burger** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 79600 | 5 Napkin Burger - Union Square | New York, NY | Union Square |
| 40456 | 5 Napkin Burger - Upper West Side | New York, NY | Upper West Side |

**Alexander's Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 681 | Alexander's Steakhouse - SF | San Francisco, CA | SOMA |
| 3709 | Alexander's Steakhouse - Cupertino | Cupertino, CA | Cupertino |

**Almond** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 33013 | Almond - Bridgehampton | Bridgehampton, NY | Bridgehampton |
| 2494 | Almond | New York, NY | Gramercy / Flatiron |

**Anthony's Fish Grotto** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 117253 | Anthony's Fish Grotto | San Diego, CA | Shelter Island / San Diego Bay |
| 112984 | Anthony's Fish Grotto - La Mesa | La Mesa, CA | La Mesa |

**Aureole** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 32896 | Aureole - Las Vegas | Las Vegas, NV | Mandalay Bay Resort |
| 34660 | Aureole - Liberty Room | New York, NY | Theater District / Times Square |

**Azitra** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 67573 | Azitra - Broomfield | Broomfield, CO | Broomfield |
| 6317 | Azitra | Raleigh, NC | Raleigh |

**Azure** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 28060 | Azure - The Royal Hawaiian | Honolulu, HI | Waikiki |
| 4339 | Azure | Daytona Beach Shores, FL | Daytona Beach |

**B.B. King's Blues Club** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 42781 | B.B. King's Blues Club - Memphis | Memphis, TN | Memphis |
| 7114 | B.B. King's Blues Club | Nashville, TN | Downtown |

**Benares** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 97837 | Benares - Tribeca | New York, NY | TriBeCa - Downtown |
| 35014 | Benares - West Side | New York, NY | Midtown West |

**Benucci's** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 117334 | Benucci's - GRC | Greece, NY | Rochester |
| 79531 | Benucci's - Pittsford | Rochester, NY | Rochester |

**Big Bowl** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 38848 | Big Bowl - Edina | Edina, MN | Edina |
| 38950 | Big Bowl - Minnetonka | Minnetonka, MN | Minnetonka |

**Big Daddy's** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 30991 | Big Daddy's - Gramercy Park | New York, NY | Gramercy / Flatiron |
| 42784 | Big Daddy’s – Upper West Side | New York, NY | Upper West Side |

**Big Fish** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 124648 | Big Fish | Miami, FL | MiMo / Upper East Side |
| 80287 | Big Fish - Princeton | Princeton, NJ | Princeton |

**BLT Prime** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 4582 | BLT Prime | New York, NY | Gramercy / Flatiron |
| 139204 | BLT Prime - Trump Doral | Miami, FL | Miami |

**Blue Canyon Kitchen & Tavern** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 5953 | Blue Canyon Kitchen & Tavern - Missoula | Missoula, MT | Missoula |
| 15508 | Blue Canyon Kitchen & Tavern - Kalispell | Kalispell, MT | Kalispell |

**Bob's Steak and Chop House** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 29959 | Bob's Steak and Chop House - Omni Tucson National Resort | Tucson, AZ | Tucson |
| 110017 | Bob's Steak and Chop House - Woodlands | Shenandoah, TX | The Woodlands |

**Café 21** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 64003 | Café 21 - University Heights | San Diego, CA | University Heights |
| 64000 | Café 21 – Gaslamp | San Diego, CA | Downtown / Gaslamp |

**Caffe Buon Gusto** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 93814 | Caffe Buon Gusto - Montague | Brooklyn, NY | Brooklyn Heights |
| 93817 | Caffe Buon Gusto - UES | New York, NY | Upper East Side |

**Char Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 106633 | Char Steakhouse - Putnam Valley | Putnam Valley, NY | Putnam Valley |
| 100477 | Char Steakhouse - Red Bank | Red Bank, NJ | Red Bank |

**Ciro's Italian Restaurant** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 106144 | Ciro's Italian Restaurant - Kings Park | Kings Park, NY | Kings Park |
| 106147 | Ciro's Italian Restaurant - Hauppauge | Hauppauge, NY | Hauppauge |

**Cocotte** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 148 | Cocotte | San Francisco, CA | Russian Hill |
| 102823 | Cocotte | New York, NY | SoHo |

**Cooper's Hawk Winery & Restaurant** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 113596 | Cooper's Hawk Winery & Restaurant - Columbus | Columbus, OH | Columbus |
| 106780 | Cooper's Hawk Winery & Restaurant - Indianapolis | Indianapolis, IN | Downtown Indy |

**de Vere's Irish Pub** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 86260 | de Vere's Irish Pub - Davis | Davis, CA | Davis |
| 86254 | de Vere's Irish Pub - Sacramento | Sacramento, CA | Sacramento |

**Del Frisco's Grille** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 67849 | Del Frisco's Grille - NYC | New York, NY | Rockefeller Center Midtown |
| 103936 | Del Frisco's Grille - Houston | Houston, TX | River Oaks |

**Dos Caminos** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 30520 | Dos Caminos - SoHo | New York, NY | SoHo |
| 30496 | Dos Caminos - Park | New York, NY | Gramercy / Flatiron |

**Drunken Fish** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 56089 | Drunken Fish - Power & Light District | Kansas City, MO | Kansas City |
| 109699 | Drunken Fish - Leawood | Leawood, KS | Leawood |

**El Agave** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 847 | El Agave | San Diego, CA | Old Town |
| 139144 | El Agave - Del Mar | Del Mar, CA | Del Mar |

**Elements** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 110407 | Elements | Camden, MO | Camden |
| 90868 | Elements | Chapel Hill, NC | Chapel Hill |

**Eleven** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 150715 | Eleven | Ashland, OR | Ashland |
| 3204 | ELEVEN | Pittsburgh, PA | Downtown |

**Espetus Churrascaria** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3899 | Espetus Churrascaria - San Francisco | San Francisco, CA | Civic Center / Hayes Valley / Van Ness |
| 26203 | Espetus Churrascaria - San Mateo | San Mateo, CA | San Mateo |

**Feast** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 101248 | Feast - Tucson | Tucson, AZ | Tucson |
| 104584 | Feast | New York, NY | East Village |

**FishBones** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 101482 | FishBones - Lake Mary | Lake Mary, FL | Lake Mary |
| 101485 | FishBones - Orlando, FL | Orlando, FL | I Drive / Sand Lake |

**Fonda** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 76861 | Fonda - East Village | New York, NY | East Village |
| 76660 | Fonda - Brooklyn | Brooklyn, NY | Park Slope |

**Fushimi** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 83845 | Fushimi - Bay Ridge | Brooklyn, NY | Bay Ridge |
| 84187 | Fushimi - Staten Island | Staten Island, NY | Staten Island |

**Genji Japanese Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 37141 | Genji Japanese Steakhouse - Dublin | Dublin, OH | Dublin |
| 37138 | Genji Japanese Steakhouse - Reynoldsburg | Reynoldsburg, OH | Reynoldsburg |

**Gonza Tacos y Tequila** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 115684 | Gonza Tacos y Tequila - Wake Forest | Wake Forest, NC | Wake Forest |
| 96616 | Gonza Tacos y Tequila | Raleigh, NC | Raleigh |

**Gordon Biersch** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 144661 | Gordon Biersch - New Orleans | New Orleans, LA | French Quarter |
| 144655 | Gordon Biersch - Las Vegas | Las Vegas, NV | Paradise |

**Grange** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 26626 | Grange | Sacramento, CA | Sacramento |
| 111739 | Grange | Westwood, NJ | Westwood |

**Greek Taverna** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 56692 | Greek Taverna - Glen Rock | Glen Rock, NJ | Glen Rock |
| 56698 | Greek Taverna - Montclair | Montclair, NJ | Montclair |

**Hapa Sushi Grill & Sake Bar** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 30343 | Hapa Sushi Grill & Sake Bar - Cherry Creek | Denver, CO | Cherry Creek |
| 47158 | Hapa Sushi Grill & Sake Bar - Pearl St. Boulder | Boulder, CO | Boulder |

**Harry & Izzy's** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 70630 | Harry & Izzy's - Northside | Indianapolis, IN | Castleton / Keystone Crossings |
| 7640 | Harry & Izzy's - Downtown | Indianapolis, IN | Downtown Indy |

**Haru Sushi** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 15040 | Haru Sushi - Wall Street | New York, NY | Financial District |
| 31165 | Haru Sushi - Gramercy Park | New York, NY | Gramercy / Flatiron |

**Hiro 88** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 111379 | Hiro 88 - Lincoln | Lincoln, NE | Lincoln |
| 61447 | Hiro 88 | Omaha, NE | Downtown / Old Market |

**House of Japan** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 34678 | House of Japan - Dublin | Dublin, OH | Dublin |
| 34675 | House of Japan - Polaris | Columbus, OH | Polaris |

**Hula Grill** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 33451 | Hula Grill - Kaanapali | Lahaina, HI | Kaanapali |
| 25396 | Hula Grill - Waikiki | Honolulu, HI | Waikiki |

**Hunter Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 105661 | Hunter Steakhouse - Oceanside | Oceanside, CA | Oceanside |
| 105655 | Hunter Steakhouse - Mission Valley | San Diego, CA | Mission Valley |

**III Forks** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3813 | III Forks - Dallas | Dallas, TX | North Dallas / Addison |
| 36754 | III Forks - Houston | Houston, TX | Downtown |

**Il Forno** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 112282 | Il Forno | New York, NY | Midtown West |
| 3912 | Il Forno | Santa Monica, CA | Santa Monica |

**Il Palio** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 21310 | Il Palio | Shelton, CT | Shelton |
| 6900 | Il Palio | Chapel Hill, NC | Chapel Hill |

**Jacksons Restaurant** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 4016 | Jacksons Restaurant - Rotisserie - Bar | Canonsburg, PA | Canonsburg |
| 5506 | Jacksons Restaurant - Rotisserie - Bar - Doubletree Hotel | Moon Township, PA | Moon Township |

**Jake's Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 65827 | Jake's Steakhouse - Long Island | East Meadow, NY | East Meadow |
| 22084 | Jake's Steakhouse | Bronx, NY | Bronx |

**Japengo** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 70528 | Japengo - Waikiki | Honolulu, HI | Waikiki |
| 54922 | Japengo - Maui | Lahaina, HI | Lahaina |

**Jia** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 96121 | Jia - Teppan Tables - Beau Rivage | Biloxi, MS | Beau Rivage Resort & Casino |
| 91042 | Jia - Beau Rivage | Biloxi, MS | Beau Rivage Resort & Casino |

**Juniper Grill** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 77668 | Juniper Grill - Peters Twp | Mcmurray, PA | South Hills |
| 104125 | Juniper Grill - Cranberry Township | Cranberry Township, PA | Cranberry |

**JW Marriott San Antonio** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 39706 | JW Marriott San Antonio - 18 Oaks | San Antonio, TX | North San Antonio |
| 39703 | JW Marriott San Antonio - Cibolo Moon | San Antonio, TX | North San Antonio |

**Kincaid's** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3342 | Kincaid's - Honolulu | Honolulu, HI | Honolulu |
| 1304 | Kincaid's - Redondo | Redondo Beach, CA | Redondo Beach |

**Kingfish** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 105352 | Kingfish - New Orleans | New Orleans, LA | French Quarter |
| 1497 | KINGFISH | San Mateo, CA | San Mateo |

**Kirby's Prime Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 16111 | Kirby's Prime Steakhouse - San Antonio | San Antonio, TX | North San Antonio |
| 7562 | Kirby's Prime Steakhouse - The Woodlands | The Woodlands, TX | The Woodlands |

**Kobe Steaks** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 62146 | Kobe Steaks - Dallas | Dallas, TX | North Dallas / Addison |
| 62143 | Kobe Steaks - Nashville | Nashville, TN | Nashville |

**Koi** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 93751 | Koi - Soho | New York, NY | SoHo |
| 4035 | Koi - Bryant Park | New York, NY | Midtown West |

**La Bella Vita** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 101974 | La Bella Vita | Colorado Springs, CO | Colorado Springs |
| 98683 | La Bella Vita | New York, NY | Little Italy |

**La Provence** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3737 | La Provence | Roseville, CA | Roseville |
| 12532 | La Provence | Lacombe, LA | Northshore |

**Lasagna Restaurant** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 63442 | Lasagna Restaurant | New York, NY | Midtown East |
| 63439 | Lasagna Restaurant – Chelsea | New York, NY | Chelsea |

**Latitude 41** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 7367 | Latitude 41 | Columbus, OH | Columbus |
| 31597 | Latitude 41 | Mystic, CT | Mystic |

**Little India Restaurant** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 46093 | Little India Restaurant - Belmar | Lakewood, CO | Lakewood |
| 46090 | Little India Restaurant - Downtown | Denver, CO | Downtown / LoDo |

**Lola** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 6473 | Lola - Denver | Denver, CO | Highlands |
| 38920 | Lola - Great Neck | Great Neck, NY | Great Neck |

**Longhi's** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 106441 | Longhi's - Lahaina | Lahaina, HI | Lahaina |
| 17905 | Longhi's - Wailea | Wailea, HI | Wailea |

**Mariposa at Neiman Marcus** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 102715 | Mariposa at Neiman Marcus - San Antonio | San Antonio, TX | La Cantera |
| 2634 | Mariposa at Neiman Marcus - Ala Moana | Honolulu, HI | Honolulu |

**Market Table** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 107779 | Market Table - The Alexander | Indianapolis, IN | Downtown Indy |
| 15751 | Market Table | New York, NY | Greenwich Village |

**Mateo** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3981 | Mateo | Boulder, CO | Boulder |
| 91960 | Mateo | Durham, NC | Durham |

**Matsuhisa** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 65194 | Matsuhisa - Vail | Vail, CO | Vail |
| 6946 | Matsuhisa - Aspen | Aspen, CO | Aspen |

**Maya** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 2501 | Maya - New York | New York, NY | Upper East Side |
| 23845 | Maya | Avon, CO | Avon |

**McCormick's Fish House** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 6699 | McCormick's Fish House - Denver | Denver, CO | Downtown / LoDo |
| 6698 | McCormick's Fish House - Beaverton | Beaverton, OR | Beaverton |

**Mia Bella Trattoria** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 103204 | Mia Bella Trattoria - Vintage Park | Houston, TX | North Side |
| 100582 | Mia Bella Trattoria - Pavilions Downtown | Houston, TX | Downtown |

**Milano** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3314 | Milano - Latham NY | Latham, NY | Latham |
| 63463 | Milano | Houma, LA | Houma |

**Mint** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 145051 | Mint | Chapel Hill, NC | Chapel Hill |
| 65245 | Mint - LI | Garden City, NY | Garden City |

**Mo's A Place For Steaks** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 147508 | Mo's A Place For Steaks - Indianapolis | Indianapolis, IN | Downtown Indy |
| 39859 | Mo's a Place for Steaks - Houston | Houston, TX | Galleria / Uptown |

**MoCA Asian Bistro** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 129952 | MoCA Asian Bistro - Woodbury | Woodbury, NY | Woodbury |
| 53020 | MoCA Asian Bistro - Queens | Forest Hills, NY | Forest Hills |

**Monkeypod Kitchen** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 55432 | Monkeypod Kitchen - Wailea | Kihei, HI | Wailea |
| 100750 | Monkeypod Kitchen - Ko Olina | Kapolei, HI | Kapolei |

**Newport Grill** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 55903 | Newport Grill | Wichita, KS | Wichita |
| 139972 | Newport Grill - OP | Overland Park, KS | Overland Park |

**Nicolosi's** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 91192 | Nicolosi's - San Diego | San Diego, CA | College Area |
| 103669 | Nicolosi's - El Cajon | El Cajon, CA | El Cajon / Lakeside |

**NM Cafe at Neiman Marcus** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 100162 | NM Cafe at Neiman Marcus - Palo Alto | Palo Alto, CA | Palo Alto |
| 102706 | NM Cafe at Neiman Marcus - Scottsdale | Scottsdale, AZ | Scottsdale |

**Nonna** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 151546 | Nonna - Dallas | Dallas, TX | Park Cities |
| 148681 | Nonna | Monroe, LA | Monroe |

**Pacific Catch** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 18013 | Pacific Catch - Sunset District | San Francisco, CA | Sunset District |
| 14077 | Pacific Catch - Corte Madera | Corte Madera, CA | Corte Madera |

**Palomino** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3348 | Palomino - Indianapolis | Indianapolis, IN | Downtown Indy |
| 1062 | Palomino - Dallas | Dallas, TX | Uptown |

**Pappas Bros. Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 1959 | Pappas Bros. Steakhouse | Dallas, TX | NW Dallas / Love Field Area |
| 1854 | Pappas Bros. Steakhouse | Houston, TX | Galleria / Uptown |

**Piccola Bussola Ristorante** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 33433 | Piccola Bussola Ristorante - Huntington | Huntington, NY | Huntington |
| 33502 | Piccola Bussola Ristorante - Mineola | Mineola, NY | Mineola |

**Pittsburgh Blue** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 14437 | Pittsburgh Blue - Maple Grove | Maple Grove, MN | Maple Grove |
| 70627 | Pittsburgh Blue - Edina | Edina, MN | Edina |

**Portland Seafood Co.** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 84271 | Portland Seafood Co. - Washington Square | Tigard, OR | Tigard |
| 84259 | Portland Seafood Co. - Mall 205 | Portland, OR | SE Portland |

**Prepkitchen** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 103870 | Prepkitchen - La Jolla | La Jolla, CA | La Jolla |
| 69298 | Prepkitchen - Little Italy | San Diego, CA | Little Italy |

**Prime** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 117067 | Prime | Mansfield, TX | Mansfield |
| 90916 | Prime - Bellagio Hotel | Las Vegas, NV | Bellagio Hotel & Casino |

**Prime 47** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 145747 | Prime 47 - Carmel | Carmel, IN | Carmel / Westfield |
| 144688 | Prime 47 - Indianapolis | Indianapolis, IN | Downtown Indy |

**Prime Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 4941 | Prime Steakhouse | Denver, CO | Downtown / LoDo |
| 27409 | Prime Steakhouse | Key West, FL | Key West |

**Quattro** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 6232 | Quattro - South Beach | Miami Beach, FL | Miami Beach / South Beach |
| 5818 | Quattro - Four Seasons Hotel - Houston | Houston, TX | Downtown |

**Raaga** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 61711 | Raaga | Santa Fe, NM | Santa Fe |
| 60436 | Raaga | Chapel Hill, NC | Chapel Hill |

**Rafain Brazilian Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 68527 | Rafain Brazilian Steakhouse | Dallas, TX | North Dallas / Addison |
| 144949 | Rafain Brazilian Steakhouse | Fort Worth, TX | Fort Worth Downtown |

**Range** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 4221 | Range | San Francisco, CA | Mission |
| 141001 | range | Denver, CO | Downtown / LoDo |

**RingSide Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 25258 | RingSide Steakhouse - Uptown | Portland, OR | NW Portland |
| 60868 | RingSide Steakhouse - Eastside | Portland, OR | NE Portland |

**Rio Grande** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 148765 | Rio Grande - Ft. Collins | Fort Collins, CO | Fort Collins |
| 107491 | Rio Grande - Denver | Denver, CO | Downtown / LoDo |

**Rizzuto’s Restaurant and Bar** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 41374 | Rizzuto’s Restaurant and Bar - Westport | Westport, CT | Westport |
| 41371 | Rizzuto’s Restaurant and Bar - West Hartford | West Hartford, CT | Hartford / West Hartford |

**Rye** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 95884 | Rye | Leawood, KS | Leawood |
| 105424 | Rye | Brooklyn, NY | Williamsburg |

**SAGE** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 98002 | SAGE | Brooklyn, NY | Williamsburg |
| 68437 | Sage - Aria | Las Vegas, NV | Aria Hotel & Casino |

**Salut Bar Americain** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 23257 | Salut Bar Americain - St. Paul | St. Paul, MN | St. Paul |
| 5574 | Salut Bar Americain - Edina | Edina, MN | Edina |

**Sambuca** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3052 | Sambuca - Dallas Uptown | Dallas, TX | Uptown |
| 114550 | Sambuca - Plano | Plano, TX | Plano |

**Sambuca Restaurant** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 5423 | Sambuca Restaurant - Nashville | Nashville, TN | Nashville |
| 114553 | Sambuca Restaurant - Houston | Houston, TX | Downtown |

**Sansei Seafood Restaurant & Sushi Bar** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 113629 | Sansei Seafood Restaurant & Sushi Bar - WAIKIKI, Oahu | Honolulu, HI | Waikiki |
| 116170 | Sansei Seafood Restaurant & Sushi Bar - WAIKOLOA, Hawaii | Waikoloa, HI | Waikoloa |

**Seito Sushi** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 36595 | Seito Sushi | Orlando, FL | I Drive / Sand Lake |
| 94798 | Seito Sushi - Baldwin Park | Winter Park, FL | Winter Park |

**Sekisui** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 62362 | Sekisui - Bartlett | Bartlett, TN | East-Bartlett / Collierville / Germantown |
| 6222 | Sekisui - East | Memphis, TN | Memphis |

**Shiro of Japan** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 55411 | Shiro of Japan - The Shops @ Atlas Park | Glendale, NY | Glendale |
| 55408 | Shiro of Japan - Carle Place | Carle Place, NY | Carle Place |

**Shula's Steak House** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 22357 | Shula's Steak House - Hyatt Regency Houston | Houston, TX | Downtown |
| 4064 | Shula's Steak House - Indianapolis | Indianapolis, IN | Downtown Indy |

**Sienna** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 69259 | Sienna | Pittsburgh, PA | Downtown |
| 40516 | Sienna | El Dorado Hills, CA | El Dorado Hills |

**Silo Elevated Cuisine** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 11785 | Silo Elevated Cuisine - Alamo Heights | San Antonio, TX | Alamo Heights |
| 11788 | Silo Elevated Cuisine - 1604 | San Antonio, TX | North San Antonio |

**Sixth & Pine** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 67003 | Sixth & Pine - Nordstrom Green Hills Nashville | Nashville, TN | Nashville |
| 94183 | Sixth & Pine - Nordstrom Roosevelt Field Garden City | Garden City, NY | Garden City |

**Sociale** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 2131 | Sociale | San Francisco, CA | Presidio Heights |
| 108562 | Sociale | Brooklyn, NY | Brooklyn Heights |

**Soco** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 63832 | Soco | Brooklyn, NY | Clinton Hill |
| 150973 | Soco | Orlando, FL | Downtown Orlando |

**Sopapilla's** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 97717 | Sopapilla's | Franklin, TN | Franklin / Brentwood |
| 104377 | Sopapilla's - Hendersonville | Hendersonville, TN | Hendersonville |

**South End** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 32248 | South End | New Canaan, CT | New Canaan |
| 113335 | South End | Venice, CA | Venice |

**Spago** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3817 | Spago - Bachelor Gulch | Edwards, CO | Beaver Creek |
| 1658 | Spago - Las Vegas | Las Vegas, NV | Caesars Palace |

**Spice** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 91369 | Spice - Union Square | New York, NY | Union Square |
| 91390 | Spice - Upper West Side | New York, NY | Upper West Side |

**Stone Brewing World Bistro & Gardens** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 29155 | Stone Brewing World Bistro & Gardens | Escondido, CA | Escondido |
| 106114 | Stone Brewing World Bistro & Gardens - Liberty Station | San Diego, CA | Point Loma |

**Stoney River Legendary Steaks** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 110515 | Stoney River Legendary Steaks - Cool Springs | Franklin, TN | Franklin / Brentwood |
| 104086 | Stoney River Legendary Steaks - West End | Nashville, TN | West End |

**Straits Restaurant** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 3134 | Straits Restaurant - Burlingame | Burlingame, CA | Burlingame |
| 2177 | Straits Restaurant - Santana Row | San Jose, CA | San Jose |

**Sushi Lounge** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 13633 | Sushi Lounge - Totowa | Totowa, NJ | Totowa |
| 1860 | Sushi Lounge | Hoboken, NJ | Hoboken |

**Taverna Opa** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 135949 | Taverna Opa - Delray Beach | Delray Beach, FL | Delray Beach |
| 72421 | Taverna Opa - Hollywood | Hollywood, FL | Hollywood |

**The Blue Fish** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 90586 | The Blue Fish - Bayou | Houston, TX | Downtown |
| 90577 | The Blue Fish - Washington | Houston, TX | Heights / Washington |

**The Brickhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 64081 | The Brickhouse - Bend | Bend, OR | Bend |
| 64084 | The Brickhouse - Redmond | Redmond, OR | Redmond |

**The Grill on the Alley** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 392 | The Grill on the Alley - San Jose | San Jose, CA | San Jose |
| 24859 | The Grill on the Alley - Aventura | Aventura, FL | Aventura |

**The Herb Box** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 99511 | The Herb Box - DC Ranch | Scottsdale, AZ | Scottsdale |
| 99508 | The Herb Box - Old Town | Scottsdale, AZ | Scottsdale |

**The Perfect Pint** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 76819 | The Perfect Pint - West | New York, NY | Midtown West |
| 76822 | The Perfect Pint - East | New York, NY | Midtown East |

**The Smith** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 19258 | The Smith - East Village | New York, NY | East Village |
| 98185 | The Smith - Lincoln Center | New York, NY | Lincoln Square |

**The Westgate Hotel** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 72961 | The Westgate Hotel - The Westgate Room | San Diego, CA | Downtown / Gaslamp |
| 72964 | The Westgate Hotel - Sunday Brunch & Le Fontainebleau Room | San Diego, CA | Downtown / Gaslamp |

**Thirsty Lion** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 116227 | Thirsty Lion | Hillsboro, OR | Hillsboro |
| 140125 | Thirsty Lion - Denver | Denver, CO | Downtown / LoDo |

**Tien** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 11437 | Tien - Teppanyaki / Shabu Shabu | Biloxi, MS | Biloxi |
| 11434 | Tien - Traditional Asian Dining | Biloxi, MS | Biloxi |

**Town** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 101422 | Town | Carbondale, CO | Carbondale |
| 11449 | Town | Honolulu, HI | Honolulu |

**Tradicao Brazilian Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 56611 | Tradicao Brazilian Steakhouse - Bay Area | Webster, TX | Clear Lake / Webster / Bay Area |
| 87907 | Tradicao Brazilian Steakhouse - Southwest Houston | Stafford, TX | Stafford |

**Truluck's Seafood, Steak and Crab House** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 4113 | Truluck's Seafood, Steak and Crab House - Houston | Houston, TX | Galleria / Uptown |
| 29866 | Truluck's Seafood, Steak and Crab House - La Jolla | San Diego, CA | University City/Golden Triangle |

**Twigs Bistro & Martini Bar** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 104962 | Twigs Bistro & Martini Bar - Bridgeport | Tigard, OR | Tigard |
| 116893 | Twigs Bistro & Martini Bar - Meridian | Meridian, ID | Meridian |

**Uncle Jack's Steakhouse** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 676 | Uncle Jack's Steakhouse - Bayside | Bayside, NY | Bayside |
| 2654 | Uncle Jack's Steakhouse - Westside 9th Avenue | New York, NY | Midtown West |

**Union** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 145234 | Union | Pasadena, CA | Pasadena |
| 116815 | Union | Mobile, AL | Mobile |

**UNION Kitchen & Tap** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 65275 | UNION Kitchen & Tap | Encinitas, CA | Encinitas |
| 139657 | Union Kitchen & Tap - Gaslamp | San Diego, CA | Downtown / Gaslamp |

**Vinaigrette** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 93856 | Vinaigrette - Albuquerque | Albuquerque, NM | Albuquerque |
| 93850 | Vinaigrette - Santa Fe | Santa Fe, NM | Santa Fe |

**Wildfish Seafood Grille** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 5679 | Wildfish Seafood Grille - Scottsdale | Scottsdale, AZ | Scottsdale |
| 18169 | Wildfish Seafood Grille - San Antonio | San Antonio, TX | North San Antonio |

**Willie G's** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 29857 | Willie G's - Denver | Denver, CO | Downtown / LoDo |
| 41329 | Willie G's - Post Oak | Houston, TX | Galleria / Uptown |

**Woodfire Grille at Diamond Jo** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 84307 | Woodfire Grille at Diamond Jo - Dubuque | Dubuque, IA | Dubuque |
| 84589 | Woodfire Grille at Diamond Jo - Northwood | Northwood, IA | Northwood |

**Yank Sing** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 149527 | Yank Sing - Stevenson Street | San Francisco, AL | SOMA |
| 149530 | Yank Sing - Rincon Center | San Francisco, CA | Financial District / Embarcadero |

**Zengo** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 2945 | Zengo | Denver, CO | Downtown / LoDo |
| 43783 | Zengo - NYC | New York, NY | Midtown East |

**Zodiac at Neiman Marcus** — 2 locations

| objectID | name | city | neighborhood |
|---|---|---|---|
| 57604 | Zodiac at Neiman Marcus – Downtown Dallas | Dallas, TX | Downtown |
| 102688 | Zodiac at Neiman Marcus - San Diego | San Diego, CA | Mission Valley |

### A2.3 — same-city clusters

**44 base names have two or more locations in the same city**, forming
**51 distinct (base name, city) clusters** across **113 records**.

CLAUDE.md section 3 previously stated same-city ambiguity was not reproducible on this extract.
That held only for exact string equality (A2.1). It is reproducible, on real records, and no
synthetic case is needed. Complete list:

**Cyclone Anaya's — Houston** (5 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 145369 | Cyclone Anaya's - CityCentre | West Side | 29.780346, -95.560272 |
| 145366 | Cyclone Anaya's - Midtown | Midtown / Montrose | 29.752246, -95.376793 |
| 151276 | Cyclone Anaya's - Rice Village | Midtown / Montrose | 29.718681, -95.414982 |
| 145381 | Cyclone Anaya's - Woodway | Galleria / Uptown | 29.760291, -95.482356 |
| 145375 | Cyclone Anaya's -  Durham | Heights / Washington | 29.775794, -95.410362 |

**Churrascos — Houston** (4 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 883 | Churrascos - Westchase | West Side | 29.737063, -95.539263 |
| 150679 | Churrascos - Champions | Champions | 29.964618, -95.549561 |
| 114319 | Churrascos - Memorial City | West Side | 29.782685, -95.544132 |
| 882 | Churrascos - River Oaks | Upper Kirby / Shepherd Corridor | 29.742524, -95.410074 |

**Atria's — Pittsburgh** (3 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 97225 | Atria's - PNC Park | Downtown | 40.44807, -80.004233 |
| 97219 | Atria's - O'Hara Township | O'Hara Township | 40.489187, -79.872811 |
| 97450 | Atria's - Pleasant Hills | Pleasant Hills | 40.340052, -79.965678 |

**BRAVO Cucina Italiana — Columbus** (3 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 150088 | BRAVO Cucina Italiana - Columbus - Lennox | Columbus | 39.996275, -83.025755 |
| 150073 | BRAVO Cucina Italiana - Columbus - Crosswoods | Worthington | 40.115277, -83.013863 |
| 150070 | BRAVO Cucina Italiana - Columbus - Bethel Road | Northwest Columbus | 40.066856, -83.096968 |

**Perry's Steakhouse & Grille — Houston** (3 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 15805 | Perry's Steakhouse & Grille - Clear Lake | Clear Lake / Webster / Bay Area | 29.550702, -95.126383 |
| 15808 | Perry's Steakhouse & Grille - Memorial City | West Side | 29.783847, -95.536305 |
| 15802 | Perry's Steakhouse & Grille - Champions | Champions | 29.989467, -95.553302 |

**Stone Werks — San Antonio** (3 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 79162 | Stone Werks - The Vineyard | North San Antonio | 29.609516, -98.509329 |
| 32614 | Stone Werks - The Rim | Northwest | 29.601379, -98.604708 |
| 76780 | Stone Werks - Lincoln Heights | Alamo Heights | 29.497931, -98.46873 |

**Sushi Zushi — San Antonio** (3 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 20611 | Sushi Zushi - Downtown | Downtown | 29.423966, -98.491677 |
| 20605 | Sushi Zushi - Lincoln Heights | Alamo Heights | 29.496699, -98.469257 |
| 20602 | Sushi Zushi - Colonnade | North San Antonio | 29.538218, -98.570166 |

**The Wine Bistro — Columbus** (3 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 103939 | The Wine Bistro - Upper Arlington | Upper Arlington | 40.007465, -83.056883 |
| 103948 | The Wine Bistro - Worthington | Worthington | 40.132709, -83.016729 |
| 103969 | The Wine Bistro - Clintonville | Clintonville | 40.052276, -83.020045 |

**5 Napkin Burger — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 79600 | 5 Napkin Burger - Union Square | Union Square | 40.73333, -73.987645 |
| 40456 | 5 Napkin Burger - Upper West Side | Upper West Side | 40.786983, -73.977762 |

**BD's Mongolian Grill — Columbus** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 110191 | BD's Mongolian Grill – Arena | Short North - Arena District | 39.968152, -83.00551 |
| 110188 | BD's Mongolian Grill - Easton | Easton | 40.054409, -82.917455 |

**Benares — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 97837 | Benares - Tribeca | TriBeCa - Downtown | 40.714086, -74.009236 |
| 35014 | Benares - West Side | Midtown West | 40.765774, -73.982761 |

**Benihana — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 87118 | Benihana - Houston | Far Westheimer | 29.73709, -95.540337 |
| 87094 | Benihana - Houston - Downtown | Downtown | 29.756011, -95.369672 |

**Big Daddy's — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 30991 | Big Daddy's - Gramercy Park | Gramercy / Flatiron | 40.737838, -73.987713 |
| 42784 | Big Daddy’s – Upper West Side | Upper West Side | 40.791317, -73.974097 |

**Buca di Beppo — San Diego** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 19378 | Buca di Beppo - Mira Mesa | Mira Mesa | 32.916566, -117.118399 |
| 19405 | Buca di Beppo - San Diego | Downtown / Gaslamp | 32.712752, -117.15893 |

**Buca di Beppo — Indianapolis** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 53383 | Buca di Beppo - Castleton Square | Castleton / Keystone Crossings | 39.91157, -86.06335 |
| 53410 | Buca di Beppo - Downtown Indianapolis | Downtown Indy | 39.76836, -86.159561 |

**Buca di Beppo — Pittsburgh** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 53428 | Buca di Beppo - Pittsburgh - Robinson Town Center | Robinson Township | 40.456076, -80.167501 |
| 53431 | Buca di Beppo - Pittsburgh - Station Square | Downtown | 40.43101, -80.001647 |

**Café 21 — San Diego** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 64003 | Café 21 - University Heights | University Heights | 32.762918, -117.134478 |
| 64000 | Café 21 – Gaslamp | Downtown / Gaslamp | 32.71376, -117.160289 |

**Dos Caminos — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 30520 | Dos Caminos - SoHo | SoHo | 40.726568, -73.999865 |
| 30496 | Dos Caminos - Park | Gramercy / Flatiron | 40.742358, -73.984693 |

**Eddie V's — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 35533 | Eddie V's - City Centre | West Side | 29.778634, -95.561641 |
| 51655 | Eddie V's - West Ave | River Oaks | 29.740878, -95.418777 |

**Fleming's Steakhouse — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 39940 | Fleming's Steakhouse - Houston | River Oaks | 29.738065, -95.416944 |
| 39943 | Fleming's Steakhouse - Houston Beltway | West Side | 29.778333, -95.562476 |

**Fleming's Steakhouse — Scottsdale** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 40036 | Fleming's Steakhouse - Scottsdale | Scottsdale | 33.530234, -111.925621 |
| 39919 | Fleming's Steakhouse - DC Ranch | Scottsdale | 33.67098, -111.890458 |

**Grindstone Charley's — Indianapolis** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 139579 | Grindstone Charley's - Speedway | Speedway | 39.79786, -86.262711 |
| 139576 | Grindstone Charley's - Rockville Rd | West Indy | 39.764764, -86.251706 |

**Harry & Izzy's — Indianapolis** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 70630 | Harry & Izzy's - Northside | Castleton / Keystone Crossings | 39.907755, -86.097478 |
| 7640 | Harry & Izzy's - Downtown | Downtown Indy | 39.764278, -86.160022 |

**Haru Sushi — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 15040 | Haru Sushi - Wall Street | Financial District | 40.707719, -74.011657 |
| 31165 | Haru Sushi - Gramercy Park | Gramercy / Flatiron | 40.737089, -73.98893 |

**Jia — Biloxi** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 96121 | Jia - Teppan Tables - Beau Rivage | Beau Rivage Resort & Casino | 30.393029, -88.892298 |
| 91042 | Jia - Beau Rivage | Beau Rivage Resort & Casino | 30.393029, -88.892298 |

**JW Marriott San Antonio — San Antonio** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 39706 | JW Marriott San Antonio - 18 Oaks | North San Antonio | 29.667042, -98.400872 |
| 39703 | JW Marriott San Antonio - Cibolo Moon | North San Antonio | 29.667042, -98.400872 |

**Koi — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 93751 | Koi - Soho | SoHo | 40.72547, -74.005475 |
| 4035 | Koi - Bryant Park | Midtown West | 40.7529, -73.9835 |

**Lasagna Restaurant — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 63442 | Lasagna Restaurant | Midtown East | 40.754897, -73.968744 |
| 63439 | Lasagna Restaurant – Chelsea | Chelsea | 40.743263, -73.999773 |

**McCormick & Schmick's Seafood — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 6681 | McCormick & Schmick's Seafood - Houston | Galleria / Uptown | 29.755734, -95.457647 |
| 22867 | McCormick & Schmick's Seafood - Houston - Downtown | Downtown | 29.754922, -95.365242 |

**McCormick & Schmick's Seafood — Pittsburgh** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 6794 | McCormick & Schmick's Seafood - Pittsburgh South Side | Downtown | 40.428012, -79.966843 |
| 13990 | McCormick & Schmick's Seafood - Pittsburgh Downtown | Downtown | 40.440743, -80.00016 |

**Mia Bella Trattoria — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 103204 | Mia Bella Trattoria - Vintage Park | North Side | 29.99584, -95.574503 |
| 100582 | Mia Bella Trattoria - Pavilions Downtown | Downtown | 29.754209, -95.36434 |

**Morton's The Steakhouse — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 7731 | Morton's The Steakhouse - Houston - Downtown | Downtown | 29.756941, -95.364927 |
| 3100 | Morton's The Steakhouse - Houston - Galleria | Galleria / Uptown | 29.7419, -95.4612 |

**RA Sushi Bar Restaurant — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 110818 | RA Sushi Bar Restaurant - Houston Highland Village | Downtown | 29.741751, -95.443476 |
| 110821 | RA Sushi Bar Restaurant - Houston CityCentre | West Side | 29.778613, -95.56065 |

**RingSide Steakhouse — Portland** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 25258 | RingSide Steakhouse - Uptown | NW Portland | 45.523358, -122.695861 |
| 60868 | RingSide Steakhouse - Eastside | NE Portland | 45.526491, -122.518723 |

**Ruth's Chris Steak House — Indianapolis** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 5211 | Ruth's Chris Steak House - Indianapolis Northside | Castleton / Keystone Crossings | 39.911055, -86.116723 |
| 5000 | Ruth's Chris Steak House - Indianapolis | Downtown Indy | 39.766439, -86.159942 |

**Ruth's Chris Steak House — Honolulu** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 10840 | Ruth's Chris Steak House - Waikiki Beach Walk | Waikiki | 21.278886, -157.831216 |
| 6504 | Ruth's Chris Steak House - Downtown Honolulu | Honolulu | 21.301133, -157.863104 |

**Ruth's Chris Steak House — San Antonio** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 4009 | Ruth's Chris Steak House - San Antonio (Airport) | Alamo Heights | 29.5057, -98.4817 |
| 111112 | Ruth's Chris Steak House - River Walk | Downtown | 29.421925, -98.484148 |

**Ruth's Chris Steak House — San Diego** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 3505 | Ruth's Chris Steak House - Del Mar | Del Mar | 32.9275, -117.2379 |
| 3508 | Ruth's Chris Steak House - San Diego | Downtown / Gaslamp | 32.7192, -117.173 |

**Silo Elevated Cuisine — San Antonio** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 11785 | Silo Elevated Cuisine - Alamo Heights | Alamo Heights | 29.486982, -98.448073 |
| 11788 | Silo Elevated Cuisine - 1604 | North San Antonio | 29.608136, -98.498378 |

**Spice — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 91369 | Spice - Union Square | Union Square | 40.734541, -73.991915 |
| 91390 | Spice - Upper West Side | Upper West Side | 40.784308, -73.977336 |

**Stanford's — Portland** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 84337 | Stanford's - Lloyd Center | NE Portland | 45.531792, -122.653619 |
| 84331 | Stanford's - Jantzen Beach | North Portland | 45.411468, -122.738115 |

**The Blue Fish — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 90586 | The Blue Fish - Bayou | Downtown | 29.762113, -95.366485 |
| 90577 | The Blue Fish - Washington | Heights / Washington | 29.770939, -95.420492 |

**The Capital Grille — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 114100 | The Capital Grille - Houston - CityCentre | West Side | 29.780186, -95.561963 |
| 2058 | The Capital Grille - Houston | Galleria / Uptown | 29.739294, -95.470097 |

**The Herb Box — Scottsdale** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 99511 | The Herb Box - DC Ranch | Scottsdale | 33.673667, -111.889255 |
| 99508 | The Herb Box - Old Town | Scottsdale | 33.499382, -111.92769 |

**The Melting Pot — San Diego** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 1605 | The Melting Pot - Gaslamp Quarter | Downtown / Gaslamp | 32.714746, -117.15993 |
| 4829 | The Melting Pot - La Jolla | University City/Golden Triangle | 32.869901, -117.224814 |

**The Perfect Pint — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 76819 | The Perfect Pint - West | Midtown West | 40.757075, -73.983942 |
| 76822 | The Perfect Pint - East | Midtown East | 40.752713, -73.97259 |

**The Smith — New York** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 19258 | The Smith - East Village | East Village | 40.73099, -73.98838 |
| 98185 | The Smith - Lincoln Center | Lincoln Square | 40.771514, -73.981912 |

**The Tasting Room — Houston** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 94765 | The Tasting Room - Uptown Park | Galleria / Uptown | 29.756779, -95.457278 |
| 57871 | The Tasting Room - CITYCENTRE | West Side | 29.778617, -95.560415 |

**The Westgate Hotel — San Diego** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 72961 | The Westgate Hotel - The Westgate Room | Downtown / Gaslamp | 32.716313, -117.162494 |
| 72964 | The Westgate Hotel - Sunday Brunch & Le Fontainebleau Room | Downtown / Gaslamp | 32.716313, -117.162494 |

**Tien — Biloxi** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 11437 | Tien - Teppanyaki / Shabu Shabu | Biloxi | 30.411638, -88.890874 |
| 11434 | Tien - Traditional Asian Dining | Biloxi | 30.411638, -88.890874 |

**Yank Sing — San Francisco** (2 locations)

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 149527 | Yank Sing - Stevenson Street | SOMA | 37.79828, -122.401549 |
| 149530 | Yank Sing - Rincon Center | Financial District / Embarcadero | 37.79255, -122.39337 |

### A2.4 — clusters neighborhood cannot separate

On **9 of the 51 clusters**, two or more locations share the same `neighborhood`.
Neighborhood alone therefore cannot disambiguate them, which makes distance the deciding
signal and the last link of the `location_label` fallback chain load-bearing rather than
decorative. Complete list:

**Cyclone Anaya's — Houston**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 145369 | Cyclone Anaya's - CityCentre | West Side | 29.780346, -95.560272 |
| 145366 | Cyclone Anaya's - Midtown | Midtown / Montrose | 29.752246, -95.376793 |
| 151276 | Cyclone Anaya's - Rice Village | Midtown / Montrose | 29.718681, -95.414982 |
| 145381 | Cyclone Anaya's - Woodway | Galleria / Uptown | 29.760291, -95.482356 |
| 145375 | Cyclone Anaya's -  Durham | Heights / Washington | 29.775794, -95.410362 |

**Churrascos — Houston**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 883 | Churrascos - Westchase | West Side | 29.737063, -95.539263 |
| 150679 | Churrascos - Champions | Champions | 29.964618, -95.549561 |
| 114319 | Churrascos - Memorial City | West Side | 29.782685, -95.544132 |
| 882 | Churrascos - River Oaks | Upper Kirby / Shepherd Corridor | 29.742524, -95.410074 |

**Fleming's Steakhouse — Scottsdale**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 40036 | Fleming's Steakhouse - Scottsdale | Scottsdale | 33.530234, -111.925621 |
| 39919 | Fleming's Steakhouse - DC Ranch | Scottsdale | 33.67098, -111.890458 |

**Jia — Biloxi**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 96121 | Jia - Teppan Tables - Beau Rivage | Beau Rivage Resort & Casino | 30.393029, -88.892298 |
| 91042 | Jia - Beau Rivage | Beau Rivage Resort & Casino | 30.393029, -88.892298 |

**JW Marriott San Antonio — San Antonio**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 39706 | JW Marriott San Antonio - 18 Oaks | North San Antonio | 29.667042, -98.400872 |
| 39703 | JW Marriott San Antonio - Cibolo Moon | North San Antonio | 29.667042, -98.400872 |

**McCormick & Schmick's Seafood — Pittsburgh**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 6794 | McCormick & Schmick's Seafood - Pittsburgh South Side | Downtown | 40.428012, -79.966843 |
| 13990 | McCormick & Schmick's Seafood - Pittsburgh Downtown | Downtown | 40.440743, -80.00016 |

**The Herb Box — Scottsdale**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 99511 | The Herb Box - DC Ranch | Scottsdale | 33.673667, -111.889255 |
| 99508 | The Herb Box - Old Town | Scottsdale | 33.499382, -111.92769 |

**The Westgate Hotel — San Diego**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 72961 | The Westgate Hotel - The Westgate Room | Downtown / Gaslamp | 32.716313, -117.162494 |
| 72964 | The Westgate Hotel - Sunday Brunch & Le Fontainebleau Room | Downtown / Gaslamp | 32.716313, -117.162494 |

**Tien — Biloxi**

| objectID | name | neighborhood | lat, lng |
|---|---|---|---|
| 11437 | Tien - Teppanyaki / Shabu Shabu | Biloxi | 30.411638, -88.890874 |
| 11434 | Tien - Traditional Asian Dining | Biloxi | 30.411638, -88.890874 |

### A2.5 — the suffix is not always a location

Of the 1086 suffixed records, **680 suffixes match a known city or neighborhood in the corpus
and 406 do not.** `chain_name` therefore cannot be a blind split on the separator: the
suffix is sometimes a cuisine descriptor, a hotel room, a department store or a freeway. One
record carries the separator inside parentheses. Complete list of the non-geographic suffixes:

| objectID | name | extracted suffix | city |
|---|---|---|---|
| 17935 | Kai Sushi - The Ritz-Carlton, Kapalua | The Ritz-Carlton, Kapalua | Lahaina |
| 79990 | Seasons 52 - Roosevelt Field | Roosevelt Field | Garden City |
| 61354 | Star of Honolulu - Five Star | Five Star | Honolulu |
| 64861 | Max - Tribeca | Tribeca | New York |
| 57604 | Zodiac at Neiman Marcus – Downtown Dallas | Downtown Dallas | Dallas |
| 3314 | Milano - Latham NY | Latham NY | Latham |
| 15805 | Perry's Steakhouse & Grille - Clear Lake | Clear Lake | Houston |
| 67003 | Sixth & Pine - Nordstrom Green Hills Nashville | Nordstrom Green Hills Nashville | Nashville |
| 34114 | Jack's Restaurant & Bar - NYC | NYC | New York |
| 145369 | Cyclone Anaya's - CityCentre | CityCentre | Houston |
| 5211 | Ruth's Chris Steak House - Indianapolis Northside | Indianapolis Northside | Indianapolis |
| 94183 | Sixth & Pine - Nordstrom Roosevelt Field Garden City | Nordstrom Roosevelt Field Garden City | Garden City |
| 4478 | Bocca Di Bacco (Theatre District - 45th St.) | 45th St.) | New York |
| 90586 | The Blue Fish - Bayou | Bayou | Houston |
| 24778 | Rosa Mexicano - Riverside Square | Riverside Square | Hackensack |
| 36082 | Jeanne D'Arc - Cornell Hotel De France | Cornell Hotel De France | San Francisco |
| 65827 | Jake's Steakhouse - Long Island | Long Island | East Meadow |
| 93013 | Cafe Portofino - Marriott Kauai | Marriott Kauai | Lihue |
| 118600 | VIEWS - Four Seasons Lanai | Four Seasons Lanai | Lanai City |
| 85492 | The Tasting Room - Kings Harbor | Kings Harbor | Kingwood |
| 95227 | Dragon Noodle Co. - Monte Carlo | Monte Carlo | Las Vegas |
| 110818 | RA Sushi Bar Restaurant - Houston Highland Village | Houston Highland Village | Houston |
| 33286 | Aquarium Restaurant - Downtown Denver | Downtown Denver | Denver |
| 97225 | Atria's - PNC Park | PNC Park | Pittsburgh |
| 114100 | The Capital Grille - Houston - CityCentre | Houston - CityCentre | Houston |
| 99373 | The Cafe - Hilton Americas Houston | Hilton Americas Houston | Houston |
| 3960 | Soleil @k - San Diego Marriott Gaslamp | San Diego Marriott Gaslamp | San Diego |
| 41416 | Maze - By Gordon Ramsay | By Gordon Ramsay | New York |
| 83239 | Hawaii Calls - Marriott Waikoloa | Marriott Waikoloa | Waikoloa |
| 27556 | Campagna - Bedford Post Inn | Bedford Post Inn | Bedford |
| 84337 | Stanford's - Lloyd Center | Lloyd Center | Portland |
| 109345 | Bistro 2110 - The Blackwell Hotel | The Blackwell Hotel | Columbus |
| 22846 | McCormick & Schmick's Seafood - Raleigh - Crabtree Mall | Raleigh - Crabtree Mall | Raleigh |
| 99511 | The Herb Box - DC Ranch | DC Ranch | Scottsdale |
| 70630 | Harry & Izzy's - Northside | Northside | Indianapolis |
| 91048 | Stalla - Beau Rivage | Beau Rivage | Biloxi |
| 53362 | CK14 - The Crooked Knife at 14th Street | The Crooked Knife at 14th Street | New York |
| 7432 | Eagle's Nest - Hyatt Regency Indianapolis | Hyatt Regency Indianapolis | Indianapolis |
| 7731 | Morton's The Steakhouse - Houston - Downtown | Houston - Downtown | Houston |
| 103204 | Mia Bella Trattoria - Vintage Park | Vintage Park | Houston |
| 86719 | Carlsbad Beach Bistro - Hilton Garden Inn | Hilton Garden Inn | Carlsbad |
| 147433 | The Nickel - Hotel Teatro | Hotel Teatro | Denver |
| 17650 | The Shores Restaurant - La Jolla Shores Hotel | La Jolla Shores Hotel | La Jolla |
| 25435 | 333 Pacific - Steaks & Seafood | Steaks & Seafood | Oceanside |
| 95389 | La Taverne - The Broadmoor | The Broadmoor | Colorado Springs |
| 148765 | Rio Grande - Ft. Collins | Ft. Collins | Fort Collins |
| 111100 | Goode Co. Seafood - Katy Freeway | Katy Freeway | Houston |
| 4016 | Jacksons Restaurant - Rotisserie - Bar | Rotisserie - Bar | Canonsburg |
| 35533 | Eddie V's - City Centre | City Centre | Houston |
| 90898 | Julian Serrano - Aria | Aria | Las Vegas |
| 20377 | Dawson's - Hyatt Regency Sacramento | Hyatt Regency Sacramento | Sacramento |
| 44854 | Afternoon Tea - The Phoenician | The Phoenician | Scottsdale |
| 100816 | Pizza Republica - Denver Downtown | Denver Downtown | Denver |
| 70231 | Stokes Grill & Bar - West | West | Omaha |
| 34525 | SOB's - Sounds of Brazil | Sounds of Brazil | New York |
| 37021 | La Gran Terraza - University of San Diego | University of San Diego | San Diego |
| 52606 | Biscayne - Tropicana Las Vegas | Tropicana Las Vegas | Las Vegas |
| 25009 | Delta King - Pilothouse Restaurant | Pilothouse Restaurant | Sacramento |
| 11437 | Tien - Teppanyaki / Shabu Shabu | Teppanyaki / Shabu Shabu | Biloxi |
| 12406 | Glass Woods Tavern - Hyatt Regency New Brunswick | Hyatt Regency New Brunswick | New Brunswick |
| 52798 | Merriman's – Waimea – Big Island | Waimea - Big Island | Kamuela |
| 80689 | Kai Market - Sheraton Waikiki | Sheraton Waikiki | Honolulu |
| 10453 | Gyu-Kaku - Kapiolani | Kapiolani | Honolulu |
| 15808 | Perry's Steakhouse & Grille - Memorial City | Memorial City | Houston |
| 150088 | BRAVO Cucina Italiana - Columbus - Lennox | Columbus - Lennox | Columbus |
| 15040 | Haru Sushi - Wall Street | Wall Street | New York |
| 113443 | Bistro Molokini - Grand Wailea - Waldorf Astoria | Grand Wailea - Waldorf Astoria | Wailea |
| 15130 | Maggiano's - Denver South | Denver South | Englewood |
| 110191 | BD's Mongolian Grill – Arena | Arena | Columbus |
| 56089 | Drunken Fish - Power & Light District | Power & Light District | Kansas City |
| 113500 | Piatti Restaurant - San Antonio, Eilan | San Antonio, Eilan | San Antonio |
| 55744 | Beach Cafe - Tropicana Las Vegas | Tropicana Las Vegas | Las Vegas |
| 3052 | Sambuca - Dallas Uptown | Dallas Uptown | Dallas |
| 108235 | 350 First - Doubletree Hilton | Doubletree Hilton | Cedar Rapids |
| 103750 | Z'Tejas - Bethany Home | Bethany Home | Phoenix |
| 59398 | Buca di Beppo - Houston - Speedway | Houston - Speedway | Houston |
| 93934 | The Battle House Renaissance Mobile Hotel & Spa - The Trellis Room | The Trellis Room | Mobile |
| 138661 | Umberto's of New Hyde Park - Original | Original | New Hyde Park |
| 10444 | Arizona Inn - Dining Room | Dining Room | Tucson |
| 97837 | Benares - Tribeca | Tribeca | New York |
| 110515 | Stoney River Legendary Steaks - Cool Springs | Cool Springs | Franklin |
| 139141 | Iris Cafe - Store #9 | Store #9 | Brooklyn |
| 17524 | Bentley's Grill - The Grand Hotel in Salem | The Grand Hotel in Salem | Salem |
| 74152 | Cafe Select - NYC | NYC | New York |
| 103495 | Aura Thai - NY | NY | New York |
| 104587 | Mario's Restaurant - Arthur Ave. | Arthur Ave. | Bronx |
| 49339 | Flex Mussels - 13th Street | 13th Street | New York |
| 71569 | Rocco's Tacos & Tequila Bar - PGA | PGA | Palm Beach Gardens |
| 97024 | Jack Binion's Steakhouse - Horseshoe Council Bluffs | Horseshoe Council Bluffs | Council Bluffs |
| 57382 | The American Hotel - Market Yard Grille | Market Yard Grille | Freehold |
| 101164 | OCEAN - Hawks Cay Resort | Hawks Cay Resort | Duck Key |
| 10840 | Ruth's Chris Steak House - Waikiki Beach Walk | Waikiki Beach Walk | Honolulu |
| 84520 | Luau - Grand Hyatt | Grand Hyatt | Koloa |
| 150517 | Ristorante Italiano - Excelsior Inn | Excelsior Inn | Eugene |
| 29959 | Bob's Steak and Chop House - Omni Tucson National Resort | Omni Tucson National Resort | Tucson |
| 149527 | Yank Sing - Stevenson Street | Stevenson Street | San Francisco |
| 5377 | The Melting Pot - Castleton | Castleton | Indianapolis |
| 38074 | Woodcliff Hotel & Spa - Horizons Restaurant | Horizons Restaurant | Fairport |
| 117076 | Heartwood Restaurant & Lounge - Omaha Marriott | Omaha Marriott | Omaha |
| 28060 | Azure - The Royal Hawaiian | The Royal Hawaiian | Honolulu |
| 84472 | Ilima Terrace - Grand Hyatt Kauai | Grand Hyatt Kauai | Koloa |
| 140809 | Belle - A Southern Bistro | A Southern Bistro | Memphis |
| 113185 | Seasons 52 San Diego - The Headquarters | The Headquarters | San Diego |
| 55411 | Shiro of Japan - The Shops @ Atlas Park | The Shops @ Atlas Park | Glendale |
| 111559 | MAX's Wine Dive Houston - Fairview St. | Fairview St. | Houston |
| 1605 | The Melting Pot - Gaslamp Quarter | Gaslamp Quarter | San Diego |
| 94765 | The Tasting Room - Uptown Park | Uptown Park | Houston |
| 112126 | Ocean Pool Bar & Grill - Westin Kaanapali Ocean Resort Villas | Westin Kaanapali Ocean Resort Villas | Lahaina |
| 12565 | Black and Blue Steakhouse and Lounge - Valley View Casino | Valley View Casino | Valley Center |
| 51655 | Eddie V's - West Ave | West Ave | Houston |
| 95386 | Summit - The Broadmoor | The Broadmoor | Colorado Springs |
| 53191 | Cipriani - Wall Street | Wall Street | New York |
| 6765 | Bobby Van's Steakhouse - Broad Street | Broad Street | New York |
| 71425 | Putnam's - Gideon Putnam Resort | Gideon Putnam Resort | Saratoga Springs |
| 35497 | Fred's at Barneys New York - Madison Avenue | Madison Avenue | New York |
| 100582 | Mia Bella Trattoria - Pavilions Downtown | Pavilions Downtown | Houston |
| 43783 | Zengo - NYC | NYC | New York |
| 77668 | Juniper Grill - Peters Twp | Peters Twp | Mcmurray |
| 95899 | Wendell's - Inn of the Mountain Gods Resort and Casino | Inn of the Mountain Gods Resort and Casino | Mescalero |
| 56611 | Tradicao Brazilian Steakhouse - Bay Area | Bay Area | Webster |
| 139285 | Giada - The Cromwell | The Cromwell | Las Vegas |
| 115576 | Crush - MGM Grand | MGM Grand | Las Vegas |
| 149098 | Umai Mi - Modern Asian Restaurant & Bar | Modern Asian Restaurant & Bar | San Antonio |
| 84343 | Stanford's - Tanasbourne | Tanasbourne | Hillsboro |
| 118309 | Double Barrel - Monte Carlo | Monte Carlo | Las Vegas |
| 6232 | Quattro - South Beach | South Beach | Miami Beach |
| 94240 | Seoul Jung - Waikiki Resort Hotel | Waikiki Resort Hotel | Honolulu |
| 140782 | Whiskey Cake - OKC | OKC | Oklahoma City |
| 57400 | The Four Seasons Restaurant – The Grill Room | The Grill Room | New York |
| 4959 | Tres - SF (fka Tres Agaves) | SF (fka Tres Agaves) | San Francisco |
| 110173 | Dawson's Too - Sticks & Stones | Sticks & Stones | Brownsburg |
| 3479 | Capitol Grille - Hermitage Hotel - Nashville | Hermitage Hotel - Nashville | Nashville |
| 4838 | Jazmoz Bourbon Street Cafe - OKC Bricktown | OKC Bricktown | Oklahoma City |
| 63712 | Chinook Tavern - Denver Tech Center | Denver Tech Center | Greenwood Village |
| 6607 | Current - Coronado Island Marriott Resort | Coronado Island Marriott Resort | Coronado |
| 5818 | Quattro - Four Seasons Hotel - Houston | Four Seasons Hotel - Houston | Houston |
| 21472 | Spezia - Steaks, Italian & Seafood | Steaks, Italian & Seafood | Omaha |
| 6222 | Sekisui - East | East | Memphis |
| 15127 | Maggiano's - Denver Pavilions | Denver Pavilions | Denver |
| 19531 | Mitchell's Fish Market - Galleria - Pittsburgh | Galleria - Pittsburgh | Pittsburgh |
| 103165 | Salty Sow - Cactus | Cactus | Phoenix |
| 40687 | Five21 - The Oread Hotel | The Oread Hotel | Lawrence |
| 75541 | Meso Maya - Preston Forest | Preston Forest | Dallas |
| 150073 | BRAVO Cucina Italiana - Columbus - Crosswoods | Columbus - Crosswoods | Columbus |
| 16705 | Mignon - Prime Steaks, Seafood and Cocktails | Prime Steaks, Seafood and Cocktails | Plano |
| 24406 | Amerigo - Cool Springs | Cool Springs | Brentwood |
| 87907 | Tradicao Brazilian Steakhouse - Southwest Houston | Southwest Houston | Stafford |
| 26983 | Area 31 - Epic Hotel | Epic Hotel | Miami |
| 6654 | Mitchell's Steakhouse - Columbus Downtown | Columbus Downtown | Columbus |
| 53383 | Buca di Beppo - Castleton Square | Castleton Square | Indianapolis |
| 24112 | Adobo Grill - Downtown Indianapolis | Downtown Indianapolis | Indianapolis |
| 116431 | Olympia Grill - Seawall | Seawall | Galveston |
| 97021 | Fiore Steakhouse - Harrah's Rincon | Harrah's Rincon | Valley Center |
| 53428 | Buca di Beppo - Pittsburgh - Robinson Town Center | Pittsburgh - Robinson Town Center | Pittsburgh |
| 3817 | Spago - Bachelor Gulch | Bachelor Gulch | Edwards |
| 53938 | MAX's Wine Dive San Antonio - East Basse Rd | East Basse Rd | San Antonio |
| 16033 | Donovan's - San Diego Gaslamp | San Diego Gaslamp | San Diego |
| 72805 | Picasso - Bellagio | Bellagio | Las Vegas |
| 27859 | Wolfgang's Steak House - Waikiki Beach  | Waikiki Beach | Honolulu |
| 97228 | Atria's - Richland | Richland | Gibsonia |
| 15091 | Maggiano's - Willow Bend | Willow Bend | Plano |
| 111616 | La Cave - Wynn Las Vegas | Wynn Las Vegas | Las Vegas |
| 109078 | Hugo's Cellar - Four Queens | Four Queens | Las Vegas |
| 71998 | TENDER steak & seafood - Luxor | Luxor | Las Vegas |
| 6918 | Chez Philippe - Peabody Hotel Memphis | Peabody Hotel Memphis | Memphis |
| 97222 | Atria's - Peters Township | Peters Township | McMurray |
| 47158 | Hapa Sushi Grill & Sake Bar - Pearl St. Boulder | Pearl St. Boulder | Boulder |
| 33229 | Larks - Home Kitchen Cuisine at The Ashland Springs Hotel | Home Kitchen Cuisine at The Ashland Springs Hotel | Ashland |
| 139657 | Union Kitchen & Tap - Gaslamp | Gaslamp | San Diego |
| 11434 | Tien - Traditional Asian Dining | Traditional Asian Dining | Biloxi |
| 10423 | Park Avenue Grill - Skirvin Hilton | Skirvin Hilton | Oklahoma City |
| 4009 | Ruth's Chris Steak House - San Antonio (Airport) | San Antonio (Airport) | San Antonio |
| 30181 | Perry's Steakhouse & Grille - Cinco Ranch/Katy | Cinco Ranch/Katy | Katy |
| 14227 | Ruth's Chris Steak House - Mishawaka | Mishawaka | Granger |
| 96121 | Jia - Teppan Tables - Beau Rivage | Teppan Tables - Beau Rivage | Biloxi |
| 62626 | Dondero's - Grand Hyatt Kauai | Grand Hyatt Kauai | Poipu |
| 59680 | Gina La Fornarina - East | East | New York |
| 63523 | Acqua - NYC | NYC | New York |
| 81409 | Souvlaki GR - LES | LES | New York |
| 18067 | Beachhouse - Moana Surfrider | Moana Surfrider | Honolulu |
| 16165 | Vivace - Park Hyatt Aviara | Park Hyatt Aviara | Carlsbad |
| 12178 | Las Canarias - Omni La Mansion | Omni La Mansion | San Antonio |
| 145354 | Pericos - Huebner | Huebner | San Antonio |
| 5506 | Jacksons Restaurant - Rotisserie - Bar - Doubletree Hotel | Rotisserie - Bar - Doubletree Hotel | Moon Township |
| 31225 | Restaurant Soleil - Westin Palo Alto | Westin Palo Alto | Palo Alto |
| 6794 | McCormick & Schmick's Seafood - Pittsburgh South Side | Pittsburgh South Side | Pittsburgh |
| 93814 | Caffe Buon Gusto - Montague | Montague | Brooklyn |
| 74356 | The Melting Pot - OKC | OKC | Oklahoma City |
| 149965 | BRIO Tuscan Grille - Freehold - Raceway Mall | Freehold - Raceway Mall | Freehold |
| 79393 | Gyu-Kaku - Times Square | Times Square | New York |
| 98185 | The Smith - Lincoln Center | Lincoln Center | New York |
| 107779 | Market Table - The Alexander | The Alexander | Indianapolis |
| 6532 | Tommy Bahama's Restaurant & Bar - Wailea, Maui | Wailea, Maui | Kihei |
| 84277 | McCall’s Heartland Grill – Stratosphere Hotel | Stratosphere Hotel | Las Vegas |
| 39706 | JW Marriott San Antonio - 18 Oaks | 18 Oaks | San Antonio |
| 6875 | Havana - Alma de Cuba | Alma de Cuba | New York |
| 53410 | Buca di Beppo - Downtown Indianapolis | Downtown Indianapolis | Indianapolis |
| 22207 | Merriman's - Kapalua, Maui | Kapalua, Maui | Lahaina |
| 116380 | Fountain Cafe - Doubletree - Mission Valley | Doubletree - Mission Valley | San Diego |
| 16171 | California Bistro - Park Hyatt Aviara | Park Hyatt Aviara | Carlsbad |
| 7262 | Iron Starr Urban Barbecue - OKC | OKC | Oklahoma City |
| 72961 | The Westgate Hotel - The Westgate Room | The Westgate Room | San Diego |
| 113440 | Humuhumu - Grand Wailea | Grand Wailea | Wailea |
| 91510 | Imari A La Carte Dining - Hilton Waikoloa Village | Hilton Waikoloa Village | Waikoloa |
| 34660 | Aureole - Liberty Room | Liberty Room | New York |
| 50104 | Cafe 501 - Classen Curve | Classen Curve | Oklahoma City |
| 30991 | Big Daddy's - Gramercy Park | Gramercy Park | New York |
| 151666 | Game Time Bar and Grill - iplay America | iplay America | Freehold |
| 6504 | Ruth's Chris Steak House - Downtown Honolulu | Downtown Honolulu | Honolulu |
| 68572 | Tir Na Nog Irish Bar & Grill - Times Square | Times Square | New York |
| 90517 | Bien Shur - Sandia Resort and Casino | Sandia Resort and Casino | Albuquerque |
| 59317 | Buca di Beppo - Arrowhead | Arrowhead | Peoria |
| 141205 | Coastal Kitchen - Hilton Del Mar | Hilton Del Mar | Del Mar |
| 101242 | Atoll Restaurant - Catamaran Resort Hotel | Catamaran Resort Hotel | San Diego |
| 91453 | Rico's American Grill - Pointe Hilton Squaw Peak | Pointe Hilton Squaw Peak | Phoenix |
| 96970 | Toby Keith's - Harrah's Las Vegas | Harrah's Las Vegas | Las Vegas |
| 20389 | Vines - Hyatt Regency Sacramento | Hyatt Regency Sacramento | Sacramento |
| 33283 | Il Terrazzo - The Phoenician | The Phoenician | Scottsdale |
| 79162 | Stone Werks - The Vineyard | The Vineyard | San Antonio |
| 3100 | Morton's The Steakhouse - Houston - Galleria | Houston - Galleria | Houston |
| 65701 | Carmen's Cafe - Brookside | Brookside | Kansas City |
| 84334 | Stanford's - Kruse Way (Lake Oswego) | Kruse Way (Lake Oswego) | Lake Oswego |
| 150070 | BRAVO Cucina Italiana - Columbus - Bethel Road | Columbus - Bethel Road | Columbus |
| 5533 | Peacock Alley - Waldorf Astoria New York | Waldorf Astoria New York | New York |
| 113629 | Sansei Seafood Restaurant & Sushi Bar - WAIKIKI, Oahu | WAIKIKI, Oahu | Honolulu |
| 53431 | Buca di Beppo - Pittsburgh - Station Square | Pittsburgh - Station Square | Pittsburgh |
| 3050 | Red Marlin - Hyatt Regency Mission Bay | Hyatt Regency Mission Bay | San Diego |
| 149980 | BRIO Tuscan Grille - Huntington Station - Walt Whitman | Huntington Station - Walt Whitman | Huntington |
| 45133 | Relish Burger Bistro - The Phoenician | The Phoenician | Scottsdale |
| 76819 | The Perfect Pint - West | West | New York |
| 7742 | The Oak Room - The Westin St. Francis | The Westin St. Francis | San Francisco |
| 39943 | Fleming's Steakhouse - Houston Beltway | Houston Beltway | Houston |
| 59308 | Buca di Beppo - Cool Springs | Cool Springs | Franklin |
| 150487 | Harvest Organic Grille – Galleria | Galleria | Houston |
| 90916 | Prime - Bellagio Hotel | Bellagio Hotel | Las Vegas |
| 91015 | Joel Robuchon - MGM Grand | MGM Grand | Las Vegas |
| 31165 | Haru Sushi - Gramercy Park | Gramercy Park | New York |
| 149530 | Yank Sing - Rincon Center | Rincon Center | San Francisco |
| 46750 | Dragonfly - Robata Grill & Sushi | Robata Grill & Sushi | Orlando |
| 145810 | Langlois - Interactive Dining | Interactive Dining | New Orleans |
| 84271 | Portland Seafood Co. - Washington Square | Washington Square | Tigard |
| 24202 | Hill Country - Flatiron | Flatiron | New York |
| 2059 | The Capital Grille - Dallas - Uptown | Dallas - Uptown | Dallas |
| 112096 | Table 28 - Best West Governors Suites - Little Rock | Best West Governors Suites - Little Rock | Little Rock |
| 68452 | Stack - The Mirage | The Mirage | Las Vegas |
| 1304 | Kincaid's - Redondo | Redondo | Redondo Beach |
| 117334 | Benucci's - GRC | GRC | Greece |
| 94798 | Seito Sushi - Baldwin Park | Baldwin Park | Winter Park |
| 12613 | Altitude Restaurant - Hyatt Regency Denver | Hyatt Regency Denver | Denver |
| 32614 | Stone Werks - The Rim | The Rim | San Antonio |
| 71887 | Morso - NYC | NYC | New York |
| 107512 | The East Pole - Kitchen and Bar | Kitchen and Bar | New York |
| 86821 | Chandler's - Hilton Carlsbad Oceanfront Resort & Spa | Hilton Carlsbad Oceanfront Resort & Spa | Carlsbad |
| 109642 | The Melting Pot - Arrowhead | Arrowhead | Glendale |
| 52732 | Q KitchenBar - Hyatt Regency | Hyatt Regency | San Antonio |
| 145273 | Harbor's Edge - Sheraton San Diego Hotel & Marina | Sheraton San Diego Hotel & Marina | San Diego |
| 39526 | Hotel Del - Crown Room | Crown Room | San Diego |
| 67849 | Del Frisco's Grille - NYC | NYC | New York |
| 2634 | Mariposa at Neiman Marcus - Ala Moana | Ala Moana | Honolulu |
| 61840 | Cafe Mahjaic - Lotus Inn | Lotus Inn | Lotus |
| 139972 | Newport Grill - OP | OP | Overland Park |
| 76681 | Connolly's Pub and Restaurant - 47th | 47th | New York |
| 139204 | BLT Prime - Trump Doral | Trump Doral | Miami |
| 22864 | McCormick & Schmick's Seafood - Roseville - The Fountains | Roseville - The Fountains | Roseville |
| 681 | Alexander's Steakhouse - SF | SF | San Francisco |
| 48715 | Cafe Pesto - Kawaihae Harbor | Kawaihae Harbor | Kawaihae |
| 83341 | SWIFT - The Roundhouse at Beacon Falls | The Roundhouse at Beacon Falls | Beacon |
| 147613 | The Garden View Restaurant - Oregon Garden Resort | Oregon Garden Resort | Silverton |
| 145465 | Pointe in Tyme - Pointe Tapatio | Pointe Tapatio | Phoenix |
| 118852 | 630 Park Steakhouse - Graton Resort & Casino | Graton Resort & Casino | Rohnert Park |
| 79729 | Lorenzo's Restaurant, Bar & Caberet - Hilton Garden Inn - SI | Hilton Garden Inn - SI | Staten Island |
| 76822 | The Perfect Pint - East | East | New York |
| 87520 | Al Dente - Foxwoods Resort Casino | Foxwoods Resort Casino | Ledyard |
| 91480 | Goodfella’s Brick Oven Pizza & Restaurant - Victory | Victory | Staten Island |
| 70225 | Twisted Fork - Old Market | Old Market | Omaha |
| 114319 | Churrascos - Memorial City | Memorial City | Houston |
| 41962 | In the Raw - Bricktown | Bricktown | Oklahoma City |
| 14431 | First Chair - Vail Marriott | Vail Marriott | Vail |
| 45805 | Amelia's Bistro - New Jersey | New Jersey | Jersey City |
| 148156 | Cane & Canoe - Montage Kapalua Bay | Montage Kapalua Bay | Lahaina |
| 18676 | Wrigley Mansion - Geordie's | Geordie's | Phoenix |
| 110017 | Bob's Steak and Chop House - Woodlands | Woodlands | Shenandoah |
| 57247 | Son Cubano - New Jersey | New Jersey | West New York |
| 64063 | DUO - Steak & Seafood | Steak & Seafood | Wailea |
| 61717 | Beecher’s – The Cellar | The Cellar | New York |
| 104962 | Twigs Bistro & Martini Bar - Bridgeport | Bridgeport | Tigard |
| 111112 | Ruth's Chris Steak House - River Walk | River Walk | San Antonio |
| 46690 | High Finance  Restaurant - At the top of the Tram | At the top of the Tram | Albuquerque |
| 76780 | Stone Werks - Lincoln Heights | Lincoln Heights | San Antonio |
| 22867 | McCormick & Schmick's Seafood - Houston - Downtown | Houston - Downtown | Houston |
| 72964 | The Westgate Hotel - Sunday Brunch & Le Fontainebleau Room | Sunday Brunch & Le Fontainebleau Room | San Diego |
| 85951 | Arriba Arriba Mexican Restaurant - Queens | Queens | Sunnyside |
| 65347 | STK - NYC - Midtown | NYC - Midtown | New York |
| 87532 | Golden Dragon - Foxwoods Resort Casino | Foxwoods Resort Casino | Ledyard |
| 39703 | JW Marriott San Antonio - Cibolo Moon | Cibolo Moon | San Antonio |
| 22357 | Shula's Steak House - Hyatt Regency Houston | Hyatt Regency Houston | Houston |
| 106114 | Stone Brewing World Bistro & Gardens - Liberty Station | Liberty Station | San Diego |
| 53020 | MoCA Asian Bistro - Queens | Queens | Forest Hills |
| 84736 | Marina Kitchen - San Diego Marriott Marquis & Marina | San Diego Marriott Marquis & Marina | San Diego |
| 52078 | Reflect Restaurant - Cambria Suites | Cambria Suites | Morrisville |
| 78352 | The Little Village - Airline | Airline | Baton Rouge |
| 96877 | The Snowmass Kitchen - Starwood | Starwood | Snowmass |
| 72721 | Bob's Steak & Chop House - Dallas on Lamar | Dallas on Lamar | Dallas |
| 41329 | Willie G's - Post Oak | Post Oak | Houston |
| 76306 | The Dining Room - Columbus Easton | Columbus Easton | Columbus |
| 22114 | MALA - Wailea Beach Marriott  Resort | Wailea Beach Marriott  Resort | Wailea |
| 36412 | Makana Terrace - St. Regis - Hawaii | St. Regis - Hawaii | Princeville |
| 52120 | Sage Student Bistro - Institute for the Culinary Arts | Institute for the Culinary Arts | Omaha |
| 5401 | Columbus Fish Market - Grandview | Grandview | Columbus |
| 92575 | Vast - Devon Tower | Devon Tower | Oklahoma City |
| 41389 | Tamarind - Tribeca | Tribeca | New York |
| 90919 | Rice & Company - Luxor | Luxor | Las Vegas |
| 110821 | RA Sushi Bar Restaurant - Houston CityCentre | Houston CityCentre | Houston |
| 100750 | Monkeypod Kitchen - Ko Olina | Ko Olina | Kapolei |
| 149575 | Main + Abbey - Hard Rock Hotel & Casino Sioux City | Hard Rock Hotel & Casino Sioux City | Sioux City |
| 140863 | DB Brasserie - The Venetian | The Venetian | Las Vegas |
| 60808 | RingSide Fish House - Fox Tower | Fox Tower | Portland |
| 62083 | Aria Restaurant - Stamford, CT | Stamford, CT | Stamford |
| 23899 | Opaque - Dining In The Dark | Dining In The Dark | San Francisco |
| 72394 | Ethos - Gallery | Gallery | New York |
| 109186 | Grotto - Galveston - San Luis Resort | Galveston - San Luis Resort | Galveston |
| 151408 | One Duval - Pier House Resort & Spa | Pier House Resort & Spa | Key West |
| 10870 | Fresca - Fillmore | Fillmore | San Francisco |
| 87523 | Cedars Steakhouse - Foxwoods Resort Casino | Foxwoods Resort Casino | Ledyard |
| 13372 | Palm Restaurant - NYC Too | NYC Too | New York |
| 76795 | Canal Bistro - Mediterranean Grill | Mediterranean Grill | Indianapolis |
| 77431 | Adobe Resort - Oregon | Oregon | Yachats |
| 145381 | Cyclone Anaya's - Woodway | Woodway | Houston |
| 104371 | Champions - Marriott Airport Nashville | Marriott Airport Nashville | Nashville |
| 6919 | Capriccio Grill - Peabody Hotel Memphis | Peabody Hotel Memphis | Memphis |
| 93817 | Caffe Buon Gusto - UES | UES | New York |
| 97180 | Range Steakhouse - Harrah’s Ak-Chin Casino Resort | Harrah’s Ak-Chin Casino Resort | Maricopa |
| 56230 | Bistro N - Nordstrom Houston Galleria | Nordstrom Houston Galleria | Houston |
| 149521 | Bazille - Nordstrom - The Woodlands | Nordstrom - The Woodlands | The Woodlands |
| 57871 | The Tasting Room - CITYCENTRE | CITYCENTRE | Houston |
| 2654 | Uncle Jack's Steakhouse - Westside 9th Avenue | Westside 9th Avenue | New York |
| 30496 | Dos Caminos - Park | Park | New York |
| 43126 | Tuscany Gardens - Tuscany Suites & Casino | Tuscany Suites & Casino | Las Vegas |
| 107437 | The Melting Pot - Dallas - Addison | Dallas - Addison | Addison |
| 61258 | Stokes Grill and Bar - Old Market | Old Market | Omaha |
| 96967 | Ruth's Chris Steak House - Harrah's Las Vegas | Harrah's Las Vegas | Las Vegas |
| 60868 | RingSide Steakhouse - Eastside | Eastside | Portland |
| 23998 | Ruth's Chris Steak House - North Raleigh | North Raleigh | Raleigh |
| 101485 | FishBones - Orlando, FL | Orlando, FL | Orlando |
| 149911 | BRAVO Cucina Italiana - Buffalo - Walden | Buffalo - Walden | Buffalo |
| 65245 | Mint - LI | LI | Garden City |
| 68047 | SWB - Hyatt Regency Scottsdale | Hyatt Regency Scottsdale | Scottsdale |
| 149308 | The 9th Door - Beauvallon | Beauvallon | Denver |
| 87730 | Yellowtail - Bellagio Hotel | Bellagio Hotel | Las Vegas |
| 104785 | Seasons 52 - Westheimer | Westheimer | Houston |
| 86113 | Chefs Club Aspen - St. Regis Aspen | St. Regis Aspen | Aspen |
| 116170 | Sansei Seafood Restaurant & Sushi Bar - WAIKOLOA, Hawaii | WAIKOLOA, Hawaii | Waikoloa |
| 94243 | Fresco - Hilton Hawaiian Village | Hilton Hawaiian Village | Honolulu |
| 66559 | Formaggio Taverna & Patio - Sacramento Marriott Rancho Cordova | Sacramento Marriott Rancho Cordova | Rancho Cordova |
| 13990 | McCormick & Schmick's Seafood - Pittsburgh Downtown | Pittsburgh Downtown | Pittsburgh |
| 19546 | Twenty/20 Grill & Wine Bar - Sheraton Carlsbad Resort & Spa | Sheraton Carlsbad Resort & Spa | Carlsbad |
| 84811 | Imari Teppanyaki - Hilton Waikoloa Village | Hilton Waikoloa Village | Waikoloa |
| 6422 | Bella Luna - NYC | NYC | New York |
| 84331 | Stanford's - Jantzen Beach | Jantzen Beach | Portland |
| 109696 | Siena Tuscan Steakhouse - Ambassador Hotel | Ambassador Hotel | Wichita |
| 17452 | Norio's - The Fairmont Orchid - Kohala Coast | The Fairmont Orchid - Kohala Coast | Puako |
| 84259 | Portland Seafood Co. - Mall 205 | Mall 205 | Portland |
| 99796 | Nobu Lanai - Four Seasons Lanai | Four Seasons Lanai | Lanai City |
| 58366 | Bookmakers Restaurant - Holiday Inn Saratoga Springs | Holiday Inn Saratoga Springs | Saratoga Springs |
| 17065 | Chart House Restaurant - Tower of the Americas | Tower of the Americas | San Antonio |
| 101491 | Charley's Steak House and Seafood Grille - Kissimmee, FL | Kissimmee, FL | Kissimmee |
| 149611 | Parkside Seafood House - Oyster Bar | Oyster Bar | Lafayette |
| 51268 | Colicchio & Sons - Tap Room | Tap Room | New York |
| 39055 | Encore Restaurant - Steak, Seafood, Sushi | Steak, Seafood, Sushi | Buffalo |
| 39919 | Fleming's Steakhouse - DC Ranch | DC Ranch | Scottsdale |
| 11788 | Silo Elevated Cuisine - 1604 | 1604 | San Antonio |
| 30775 | HK's Restaurant & Bar - The Lodge of Four Seasons | The Lodge of Four Seasons | Lake Ozark |
| 68437 | Sage - Aria | Aria | Las Vegas |
| 4035 | Koi - Bryant Park | Bryant Park | New York |
| 46540 | High Steaks - Thunder Valley Casino Resort | Thunder Valley Casino Resort | Lincoln |
| 16780 | Pinnacle Restaurant - Falkner Winery | Falkner Winery | Temecula |
| 64000 | Café 21 – Gaslamp | Gaslamp | San Diego |
| 113437 | Grand Dining Room - Grand Wailea - Waldorf Astoria | Grand Wailea - Waldorf Astoria | Wailea |
| 82909 | Mirador - Lodge at Cordillera | Lodge at Cordillera | Edwards |
| 11896 | Peohe's – Coronado Waterfront Restaurant | Coronado Waterfront Restaurant | Coronado |
| 2177 | Straits Restaurant - Santana Row | Santana Row | San Jose |
| 113530 | Kitchen Notes - Omni Nashville | Omni Nashville | Nashville |
| 54922 | Japengo - Maui | Maui | Lahaina |
| 108424 | Five50 - Aria | Aria | Las Vegas |
| 78286 | Sustenio - Eilan Hotel | Eilan Hotel | San Antonio |
| 51646 | Fig & Olive - Westchester | Westchester | Scarsdale |
| 95374 | Lake Terrace - The Broadmoor | The Broadmoor | Colorado Springs |
| 87094 | Benihana - Houston - Downtown | Houston - Downtown | Houston |
| 20605 | Sushi Zushi - Lincoln Heights | Lincoln Heights | San Antonio |
| 90889 | BARMASA - Aria | Aria | Las Vegas |
| 105913 | Cafe Champagne Restaurant - Thornton Winery | Thornton Winery | Temecula |
| 24916 | Simply Fondue - Ft Worth | Ft Worth | Ft. Worth |
| 20602 | Sushi Zushi - Colonnade | Colonnade | San Antonio |
| 109006 | Sushi Yuzu - Ko'olina | Ko'olina | Kapolei |
| 91042 | Jia - Beau Rivage | Beau Rivage | Biloxi |
| 36415 | Kauai Grill - St. Regis - Hawaii | St. Regis - Hawaii | Princeville |
| 139576 | Grindstone Charley's - Rockville Rd | Rockville Rd | Indianapolis |
| 62629 | Tidepools - Grand Hyatt Kauai | Grand Hyatt Kauai | Poipu |
| 98428 | Jonathan's Grille - Green Hills | Green Hills | Nashville |
| 53425 | Buca di Beppo - Park Lane | Park Lane | Dallas |
| 59875 | Lakeside - Wynn Las Vegas | Wynn Las Vegas | Las Vegas |
| 147985 | Stables Ranch Grille - Tubac Golf Resort | Tubac Golf Resort | Tubac |
| 71083 | Charleston's Restaurant - Castleton | Castleton | Indianapolis |
| 4960 | Quattro Restaurant and Bar - Four Seasons Hotel | Four Seasons Hotel | East Palo Alto |
| 2028 | Mon Ami Gabi - Las Vegas - Main Dining Room | Las Vegas - Main Dining Room | Las Vegas |
| 53779 | Il Capriccio - NJ | NJ | Whippany |

---

## A3. Names that collide with a cuisine, a neighborhood or a city

### A3.1 — name identical to a full `food_type` value (1)

| objectID | name | city | its own food_type |
|---|---|---|---|
| 100624 | Bistro | Jupiter | Contemporary American |

### A3.2 — name identical to a cuisine token (4)

A query for any of these is ambiguous between a name lookup and a cuisine refinement. `Prime`
is the trap: the name reads as a steakhouse and the data says Mexican.

| objectID | name | city | its own food_type |
|---|---|---|---|
| 117067 | Prime | Mansfield | Mexican |
| 50611 | Cuisine | Detroit | Contemporary French |
| 100624 | Bistro | Jupiter | Contemporary American |
| 56647 | Plates | Larchmont | Contemporary American |

### A3.3 — name identical to a neighborhood or city value (10)

The two sets coincide on this extract: every name that matches a neighborhood also matches a
city. `searchableAttributes` order is what decides whether such a query returns the restaurant
or everything in the place that shares its name.

| objectID | name | restaurant is in | matches a neighborhood | matches a city |
|---|---|---|---|---|
| 145234 | Union | Pasadena, CA | yes | yes |
| 105322 | Lafayette | New York, NY | yes | yes |
| 12610 | Meridian | Indianapolis, IN | yes | yes |
| 65881 | Santa Fe | New York, NY | yes | yes |
| 100828 | Riverside | Hood River, OR | yes | yes |
| 116815 | Union | Mobile, AL | yes | yes |
| 70969 | Babylon | Raleigh, NC | yes | yes |
| 72718 | Acme | New York, NY | yes | yes |
| 95884 | Rye | Leawood, KS | yes | yes |
| 105424 | Rye | Brooklyn, NY | yes | yes |

`Rye` is the densest single test case in the corpus: two homonymous restaurants
(95884 Leawood, 105424 Brooklyn), a collision with a city and neighborhood value, and edit distance 1
from `Roe` (95284, Portland).

### A3.4 — name contains a cuisine word (1067, 21% of the corpus)

This is where the two personas pull in opposite directions. A query like "sushi" matches these
records on `name` and every sushi restaurant on `cuisine`; the order of `searchableAttributes`
alone decides which wins. Complete list:

| objectID | name | its own food_type | city |
|---|---|---|---|
| 113494 | Plates Kitchen | International | Raleigh |
| 145747 | Prime 47 - Carmel | Steakhouse | Carmel |
| 37393 | Grove Steakhouse at Viejas Casino | Steakhouse | Alpine |
| 111058 | Ichabod's Lounge | American | Las Vegas |
| 110128 | Mignon's Steak and Seafood | Steakhouse | Biloxi |
| 144688 | Prime 47 - Indianapolis | Steak | Indianapolis |
| 17935 | Kai Sushi - The Ritz-Carlton, Kapalua | Sushi | Lahaina |
| 82279 | Wild Note Cafe | Californian | Solana Beach |
| 113719 | Taberna Tapas | Tapas / Small Plates | Durham |
| 116302 | Mexican Festival Restaurant | Mexican | New York |
| 54055 | Pace's Steak House - Hauppauge | Steakhouse | Hauppauge |
| 6967 | Red Feather Lounge | Northwest | Boise |
| 10858 | G. Michael's Bistro & Bar | Contemporary American | Columbus |
| 146278 | Florent Restaurant & Lounge | American | San Diego |
| 107080 | Hong Kong Lounge II | Chinese | San Francisco |
| 102349 | Allegro Seafood Grill | Portuguese | Newark |
| 55363 | Vinnie's Steakhouse and Tavern | Steakhouse | Raleigh |
| 21748 | Bistro Milano | Italian | New York |
| 139888 | Primal Food & Spirits | American | Durham |
| 112351 | Popei's Clam Bar & Seafood Restaurant | Seafood | Bethpage |
| 15805 | Perry's Steakhouse & Grille - Clear Lake | Steakhouse | Houston |
| 69556 | Perry's Steakhouse & Grille - San Antonio | Steakhouse | San Antonio |
| 114055 | Zagara Restaurant and Wine Bar | Italian | New York |
| 29746 | Bodrum Turkish Mediterranean | Turkish | New York |
| 149320 | Stewart + Ogden Diner Bistro | American | Las Vegas |
| 24250 | Scott's Seafood Grill & Bar - Folsom | Seafood | Folsom |
| 102619 | 1 North Steakhouse | Steak | Hampton Bays |
| 4113 | Truluck's Seafood, Steak and Crab House - Houston | Seafood | Houston |
| 5211 | Ruth's Chris Steak House - Indianapolis Northside | Steakhouse | Indianapolis |
| 1959 | Pappas Bros. Steakhouse | Steak | Dallas |
| 102016 | Chance Asian Bistro & Bar | Asian | Brooklyn |
| 113383 | BO-beau kitchen + garden | Contemporary French / American | La Mesa |
| 108028 | Bistro Citron - Manhattan | French | New York |
| 88048 | Steakhouse at Indiana Grand Racing & Casino | Steakhouse | Shelbyville |
| 68620 | Bombay Bistro | Indian | Franklin |
| 144757 | Bluewater Bistro & Bar | Californian | Bodega Bay |
| 105634 | Tala Bistro | American | Latham |
| 78970 | Embers Steakhouse | Steakhouse | Brooklyn |
| 94183 | Sixth & Pine - Nordstrom Roosevelt Field Garden City | Contemporary American | Garden City |
| 104710 | Famous Greek Kitchen | Greek | Greenwich |
| 15430 | Fume Bistro & Bar | American | Napa |
| 91552 | The Southern | Steakhouse | Nashville |
| 5000 | Ruth's Chris Steak House - Indianapolis | Steakhouse | Indianapolis |
| 78316 | T-Fusion Steakhouse | Steakhouse | Brooklyn |
| 39988 | Fleming's Steakhouse - Nashville | Steak | Nashville |
| 65827 | Jake's Steakhouse - Long Island | Steakhouse | East Meadow |
| 18220 | Mastro's Steakhouse - Scottsdale | Steakhouse | Scottsdale |
| 34627 | The Mediterranean | Mediterranean | Boulder |
| 94726 | Bolt Bistro & Bar | Steakhouse | Raleigh |
| 110818 | RA Sushi Bar Restaurant - Houston Highland Village | Japanese | Houston |
| 49378 | 360 Bistro | American | Nashville |
| 36046 | Braddock's American Brasserie | American | Pittsburgh |
| 4855 | Island Prime | Steak | San Diego |
| 78880 | Artisan's Brewery & Italian Grill | Italian | Toms River |
| 61927 | Rosie McCann's Irish Pub & Restaurant | Irish | Santa Cruz |
| 72253 | 'Ulu Ocean Grill and Sushi Lounge | Hawaiian | Kaupulehu |
| 19186 | Vineyard Rose at South Coast Winery | Californian | Temecula |
| 38050 | Jimmy V's Steakhouse and Tavern | Steakhouse | Cary |
| 10159 | Pranzo Italian Grill | Italian | Santa Fe |
| 83239 | Hawaii Calls - Marriott Waikoloa | Hawaii Regional Cuisine | Waikoloa |
| 29866 | Truluck's Seafood, Steak and Crab House - La Jolla | Seafood | San Diego |
| 6775 | McCormick & Schmick's Seafood - San Diego | Seafood | San Diego |
| 150997 | Tommy's Italian-American Grill | Italian | Oklahoma City |
| 33781 | Bistro 234 | Continental | Turlock |
| 24445 | The Bistro at Marshdale | Continental | Evergreen |
| 109345 | Bistro 2110 - The Blackwell Hotel | American | Columbus |
| 86260 | de Vere's Irish Pub - Davis | Gastro Pub | Davis |
| 44980 | Aged Steakhouse - Forest Hills | American | Forest Hills |
| 20014 | Rice Bistro and Sushi | Asian | Greenwood Village |
| 24553 | Rococo Restaurant and Fine Wine | Seafood | Oklahoma City |
| 22846 | McCormick & Schmick's Seafood - Raleigh - Crabtree Mall | Seafood | Raleigh |
| 8090 | Azul Restaurant and Lounge | Southwest | Tucson |
| 25825 | Rocco's Italian Grille  | Italian | Winter Park |
| 2972 | Red & White Wine Bistro | American | Houston |
| 69295 | Saiko Sushi | Sushi | Coronado |
| 25912 | District American Kitchen and Wine Bar | American | Phoenix |
| 4092 | Dakota's Steakhouse | Steakhouse | Dallas |
| 81439 | La Torre Mexican Grill | Mexican | Bloomington |
| 152185 | Vinzo's Italian Grill and Pizzeria | Italian | Casselberry |
| 113734 | Mama's Boy Southern Table & Refuge | Southern | South Norwalk |
| 7731 | Morton's The Steakhouse - Houston - Downtown | Steakhouse | Houston |
| 19276 | Sushi Sasa | Japanese | Denver |
| 87919 | Cavatore Italian Restaurant | Italian | Houston |
| 56761 | Lynn's Steakhouse | Steakhouse | Houston |
| 86719 | Carlsbad Beach Bistro - Hilton Garden Inn | American | Carlsbad |
| 29494 | Stroubes Seafood and Steak | Seafood | Baton Rouge |
| 109555 | David's Restaurant & Lounge | Contemporary American | Amelia Island |
| 15958 | Taormina Sicilian Cuisine | Italian | Honolulu |
| 45757 | Mt. Fuji Japanese Steakhouse | Japanese | Westminster |
| 68317 | Kris Bistro & Wine Lounge | Contemporary French | Houston |
| 99355 | Nelore Churrascaria Brazilian Steakhouse | Brazilian Steakhouse | Houston |
| 100705 | Andalucia Tapas Restaurant & Bar | Tapas / Small Plates | Houston |
| 40030 | Fleming's Steakhouse - San Diego | Steak | San Diego |
| 156841 | Sangria Tapas Restaurant | Spanish | Mahwah |
| 138958 | Louie's Wine Dive - Des Moines | American | Des Moines |
| 82222 | Pacific Coast Grill - Cardiff | Seafood | Cardiff-By-The-Sea |
| 25435 | 333 Pacific - Steaks & Seafood | Steak | Oceanside |
| 45325 | Wined Up Wine Bar | Bar / Lounge / Bottle Service | New York |
| 48529 | Vail Ranch Steakhouse | Steakhouse | Temecula |
| 65497 | Pacific Beach Alehouse | Californian | San Diego |
| 111100 | Goode Co. Seafood - Katy Freeway | Seafood | Houston |
| 41983 | Fivespice Seafood & Wine Bar | Seafood | Lake Oswego |
| 103162 | Beast and Bottle | Contemporary American | Denver |
| 28147 | 221 South Oak Bistro | Contemporary American | Telluride |
| 20839 | Angelo's 677 Prime | Steakhouse | Albany |
| 63034 | Bistro 1051 | Italian | Clark |
| 129952 | MoCA Asian Bistro - Woodbury | Asian | Woodbury |
| 44854 | Afternoon Tea - The Phoenician | English | Scottsdale |
| 113170 | Vino Italian Tapas & Wine Bar | Contemporary Italian | Honolulu |
| 36595 | Seito Sushi | Japanese | Orlando |
| 109300 | TerraCotta Wine Bistro | Contemporary American | Santa Fe |
| 115660 | Don's Seafood - Lafayette | Seafood | Lafayette |
| 5416 | Ruth's Chris Steak House - Sacramento | Steakhouse | Sacramento |
| 726 | Rei do Gado Brazilian Steakhouse | Brazilian Steakhouse | San Diego |
| 43198 | Kabuki Japanese Restaurant - Tempe | Japanese | Tempe |
| 90091 | Boca Bistro | Spanish | Saratoga Springs |
| 7638 | OAKLEYS bistro | Contemporary American | Indianapolis |
| 4095 | Ruth's Chris Steak House - Portland | Steakhouse | Portland |
| 8105 | Rustic Canyon Wine Bar | Californian | Santa Monica |
| 147796 | Holley's Seafood Restaurant & Oyster Bar | Seafood | Houston |
| 15808 | Perry's Steakhouse & Grille - Memorial City | Steakhouse | Houston |
| 34024 | Two E Bar and Lounge | Bar / Lounge / Bottle Service | New York |
| 58465 | Pitch Coal-Fire Pizzeria | Pizzeria | Omaha |
| 41650 | Myron's Prime Steak House | Steakhouse | New Braunfels |
| 58726 | Peacock Alley American Grill & Bar | Steakhouse | Bismarck |
| 6327 | Brasa Brazilian Steakhouse | Brazilian Steakhouse | Raleigh |
| 11740 | Sullivan's Steakhouse - Baton Rouge | Steakhouse | Baton Rouge |
| 3024 | Morton's The Steakhouse - Pittsburgh | Steakhouse | Pittsburgh |
| 3396 | BLT Steak at Camelback Inn, A JW Marriott Resort | Steakhouse | Scottsdale |
| 140893 | Ambli Gourmet Eatery & Wine | Global, International | Denver |
| 63748 | Tutto Pazzo Restaurant & Tuscan Lounge | Italian | Huntington |
| 105403 | Game Seven Grill | Barbecue | Phoenix |
| 74587 | Wine Dive | American | Wichita |
| 41683 | Bistro 44 | Contemporary American | Northport |
| 31942 | Uniscali Modern Italian | Italian | Castle Rock |
| 91342 | Tony's Italian Ristorante | Italian | Columbus |
| 23776 | Nectar Restaurant & Lounge | Californian | Santa Rosa |
| 145195 | French Roast Bar & Bistro - Downtown | French | New York |
| 40060 | Fleming's Steakhouse - Des Moines | Steak | Des Moines |
| 151444 | Criollo Latin Kitchen | Latin American | Flagstaff |
| 14734 | One South | American | Indianapolis |
| 41884 | Mesob Ethiopian Restaurant | Ethiopian | Montclair |
| 103918 | D'Amico's Italian Market Cafe - Rice Village | Italian | Houston |
| 15040 | Haru Sushi - Wall Street | Japanese | New York |
| 113443 | Bistro Molokini - Grand Wailea - Waldorf Astoria | Californian | Wailea |
| 97048 | Boccone South | Italian | South Orange |
| 117094 | Clearie's Restaurant and Lounge | American | Redding |
| 15799 | Perry's Steakhouse & Grille - Sugar Land | Steakhouse | Sugar Land |
| 18298 | Del Frisco's Double Eagle Steak House - Houston | Steakhouse | Houston |
| 15130 | Maggiano's - Denver South | Italian | Englewood |
| 118489 | Soko Sushi & Sake bar | Sushi | Denver |
| 34813 | Sonny Lubick Steakhouse | Steakhouse | Fort Collins |
| 25456 | Ocean Prime - Phoenix | Seafood | Phoenix |
| 68245 | Sushi Zushi of Southlake | Japanese | Southlake |
| 138955 | Carefree Bistro | Bistro | Carefree |
| 6681 | McCormick & Schmick's Seafood - Houston | Seafood | Houston |
| 148954 | Supannee House of Thai | Thai | San Diego |
| 91066 | Jado Sushi | Sushi | New York |
| 105661 | Hunter Steakhouse - Oceanside | Steakhouse | Oceanside |
| 144523 | Songkran Thai Kitchen | Thai | Houston |
| 56299 | Langosta Lounge | Global, International | Asbury Park |
| 43768 | M bistro | Contemporary American | New Orleans |
| 32347 | David Burke Prime at Foxwoods | Steakhouse | Ledyard |
| 69640 | Butterfield 8 Restaurant & Lounge | American | New York |
| 74941 | Cajun Pacific | Cajun | San Francisco |
| 113413 | Omira Brazilian Steakhouse | Brazilian Steakhouse | Santa Fe |
| 34375 | Seven Bistro | American | New York |
| 115510 | Rosso @ Hotel Sorella Country Club Plaza | Mediterranean | Kansas City |
| 4941 | Prime Steakhouse | Gastro Pub | Denver |
| 15811 | Perry's Steakhouse & Grille - The Woodlands | Steakhouse | The Woodlands |
| 88498 | Terrain Garden Cafe | Organic | Westport |
| 66580 | Martini's Bistro | Contemporary American | Longmont |
| 19303 | Shari Sushi Lounge | Sushi | Orlando |
| 113842 | Rice Contemporary Asian Cuisine | Contemporary Asian | Eagle Idaho |
| 152200 | Black Fire Brazilian Steakhouse | Brazilian Steakhouse | Orlando |
| 72331 | Hearsay Gastro Lounge | Contemporary American | Houston |
| 69793 | The Greek Kitchen | Greek | New York |
| 95482 | Espana Tapas Restaurant | Spanish | Omaha |
| 56527 | C.R. Gibbs American Grille | American | Redding |
| 139147 | Mr. Adams Steakhouse | Brazilian Steakhouse | Newark |
| 51589 | Bistro 39 | Contemporary American | San Diego |
| 32428 | Vic & Anthony's Steakhouse - Houston | Steakhouse | Houston |
| 58468 | Firefly Grill & Wine Bar | Contemporary American | Encinitas |
| 37141 | Genji Japanese Steakhouse - Dublin | Japanese | Dublin |
| 6684 | McCormick & Schmick's Seafood - Las Vegas | Seafood | Las Vegas |
| 102730 | Sarabeth's Park Avenue South | American | New York |
| 90766 | Park 25 Bistro | American | Nashville |
| 33664 | Afternoon Tea at the Briarwood Inn | Afternoon Tea | Golden |
| 5014 | Mockingbird Bistro | Bistro | Houston |
| 5212 | Blue Bird Bistro | Organic | Kansas City |
| 81082 | Oscar's Steakhouse at the Plaza Hotel & Casino | Steakhouse | Las Vegas |
| 103495 | Aura Thai - NY | Thai | New York |
| 17788 | SAII Bistro | Sushi | Oklahoma City |
| 147838 | Bad Art Bistro | American | St Joseph |
| 152377 | Bistro Les Amis | French | SoHo |
| 5679 | Wildfish Seafood Grille - Scottsdale | Seafood | Scottsdale |
| 138778 | Maximillian's Grille & Wine Bar | Global, International | Cary |
| 51670 | Thirst Wine Bar & Bistro | Northwest | Portland |
| 145654 | City Thai Cuisine | Thai | Portland |
| 52420 | Island Lava Java Bistro | Contemporary American | Kailua |
| 94339 | La Baguette Bistro | French | Oklahoma City |
| 68527 | Rafain Brazilian Steakhouse | Brazilian Steakhouse | Dallas |
| 2626 | Oceanaire Seafood Room - Indianapolis | Seafood | Indianapolis |
| 106645 | Golden Kim Tar Chinese Restaurant | Chinese | San Francisco |
| 97024 | Jack Binion's Steakhouse - Horseshoe Council Bluffs | Steakhouse | Council Bluffs |
| 147904 | Il Mulino Prime | Italian | New York |
| 57382 | The American Hotel - Market Yard Grille | American | Freehold |
| 30106 | Citron Bistro | American | Denver |
| 62710 | Omaha Prime | Steakhouse | Omaha |
| 12028 | Hy's Steak House - Waikiki | Steak | Honolulu |
| 97363 | The Sea by Alexander's Steakhouse | Seafood | Palo Alto |
| 10840 | Ruth's Chris Steak House - Waikiki Beach Walk | Steakhouse | Honolulu |
| 89359 | Theo's Steak | Contemporary American | Rogers |
| 91429 | Wave Bistro | Asian | Omaha |
| 6240 | Ko'sin Sheraton Wild Horse Pass Resort | American | Chandler |
| 6224 | Sekisui Pacific Rim | Pan-Asian | Memphis |
| 92983 | Wine Experience Cafe and World Cellar | Contemporary American | Aurora |
| 3104 | Morton's The Steakhouse - San Antonio | Steakhouse | San Antonio |
| 48865 | 20nine Restaurant & Wine Bar | Contemporary American | San Antonio |
| 103009 | Bouche Bistro | French | Santa Fe |
| 29959 | Bob's Steak and Chop House - Omni Tucson National Resort | Steakhouse | Tucson |
| 68554 | Dominick's Steakhouse | Steakhouse | Scottsdale |
| 2708 | Ya Ya's Euro Bistro | Mediterranean | Greenwood Village |
| 112561 | SumoMaya Mexican-Asian Kitchen | Fusion / Eclectic | Scottsdale |
| 108835 | Carbon County Steakhouse | Steakhouse | Red Lodge |
| 3836 | Ruth's Chris Steak House - Parsippany | Steakhouse | Parsippany |
| 25792 | Boulevard Bistro | Californian | Elk Grove |
| 117076 | Heartwood Restaurant & Lounge - Omaha Marriott | American | Omaha |
| 28060 | Azure - The Royal Hawaiian | Seafood | Honolulu |
| 92554 | Pure Bistro | American | Brooklyn |
| 4096 | Bistro Boudin | American | San Francisco |
| 36718 | Graziella's Italian Bistro | Italian | White Plains |
| 55393 | Russian Samovar | Russian | New York |
| 140809 | Belle - A Southern Bistro | American | Memphis |
| 15934 | Sammy's Downtown Bistro | American | Bronxville |
| 152662 | Galatoire's 33 Bar and Steak | Steakhouse | New Orleans |
| 150913 | Bistro 60 | American | La Quinta |
| 111559 | MAX's Wine Dive Houston - Fairview St. | American | Houston |
| 79735 | Kona Kai Sushi | Sushi | Honolulu |
| 76930 | The Irish American Pub | American | New York |
| 56692 | Greek Taverna - Glen Rock | Greek | Glen Rock |
| 100465 | Cotto Wine Bar Restaurant | Italian | Stamford |
| 47338 | Fleming's Steakhouse - Peoria | Steak | Peoria |
| 12565 | Black and Blue Steakhouse and Lounge - Valley View Casino | Steakhouse | Valley Center |
| 64396 | Cafe Bleu Bistro & Wine Bar | Contemporary French | San Diego |
| 41731 | Tabla Mediterranean Bistro | Italian | Portland |
| 4971 | Opus Prime Steakhouse | Steak | Oklahoma City |
| 3961 | Frasca Food and Wine | Italian | Boulder |
| 59926 | Southern Prime Steakhouse | Steakhouse | Southern Pines |
| 140098 | L'incontro Italian Restaurant | Italian | Lake Wales |
| 6765 | Bobby Van's Steakhouse - Broad Street | Steakhouse | New York |
| 118927 | Fogo de Chao Brazilian Steakhouse - San Jose | Brazilian Steakhouse | San Jose |
| 32962 | Lucky 32 Southern Kitchen - Cary | Southern | Cary |
| 28141 | Vatan Indian Restaurant | Indian | New York |
| 6057 | Morrell Wine Bar & Cafe | American | New York |
| 107425 | Martyrs Steakhouse | Steakhouse | Taos |
| 66445 | Remington's Seafood Grill | Seafood | Addison |
| 17158 | Limelight Supper Club & Lounge | American | Denver |
| 145018 | Shango Bistro | Creole / Cajun / Southern | Buffalo |
| 103276 | Homestretch Steakhouse at Hoosier Park Racing & Casino | Steakhouse | Anderson |
| 98656 | Rick's Seafood | Seafood | Mahopac |
| 56611 | Tradicao Brazilian Steakhouse - Bay Area | Brazilian Steakhouse | Webster |
| 28432 | Infusion Lounge | Pan-Asian | San Francisco |
| 81778 | Gianni's Pizzeria-Red Bank | Pizzeria | Red Bank |
| 4294 | Y.O. Ranch Steakhouse | Steak | Dallas |
| 69892 | Metropolitan Bistro | American | Sea Cliff |
| 5206 | Sushi House | Sushi | Leawood |
| 52282 | Kenichi Pacific | Japanese | Kailua-Kona |
| 67744 | Solace & The Moonlight Lounge | American | Encinitas |
| 61615 | Thai Life Floating Restaurant | Thai | Key West |
| 89422 | Intertwined Bistro & Wine Bar | Fusion / Eclectic | Escondido |
| 63796 | OM Real Indian Food | Indian | New York |
| 32059 | Prime 108 | Contemporary American | Nashville |
| 149098 | Umai Mi - Modern Asian Restaurant & Bar | Italian | San Antonio |
| 111466 | Old Hickory Steakhouse at Gaylord Opryland | Steakhouse | Nashville |
| 54049 | Ocean Prime - Denver | Seafood | Denver |
| 78139 | Vintry Wine & Whiskey | Tapas / Small Plates | New York |
| 20461 | Tower Bridge Bistro | Californian | Sacramento |
| 145114 | Hush Bistro | American | Farmingdale |
| 7198 | Ruth's Chris Steak House - Nashville | Steakhouse | Nashville |
| 45892 | Twin Owls Steakhouse | Continental | Estes Park |
| 6232 | Quattro - South Beach | Italian | Miami Beach |
| 67099 | Uncle Nick's Greek Cuisine - Hell's Kitchen | Greek | New York |
| 95251 | Fadó Irish Pub & Restaurant-Denver | Comfort Food | Denver |
| 5202 | Ranch Steakhouse | Steakhouse | Oklahoma City |
| 22051 | Cameron's American Bistro | Contemporary American | Columbus |
| 78022 | Prime Bistro | French | Lawrence |
| 46447 | Tapas Papa Frita | Spanish | Scottsdale |
| 111301 | The Back Room Steakhouse | Steakhouse | Apopka |
| 39997 | Fleming's Steakhouse - Orlando | Steak | Orlando |
| 106366 | Kobe Japanese Steak House, Maui | Steakhouse | Lahaina |
| 33373 | Vernon's Hidden Valley Steakhouse | Steak | Los Ranchos De Albuquerque |
| 100345 | Stanley's Steakhouse | Steakhouse | Jackson |
| 144265 | Paname French Restaurant | French | New York |
| 69190 | Tavern on South | Contemporary American | Indianapolis |
| 59758 | Acme Food & Beverage Co. | Southern | Carrboro |
| 35857 | Iozzo's Garden of Italy | Italian | Indianapolis |
| 40009 | Fleming's Steakhouse - Raleigh | Steak | Raleigh |
| 145081 | Trio New American Cafe | Global, International | Colleyville |
| 148957 | Bino's Bistro & Creperie | Contemporary French | San Diego |
| 86254 | de Vere's Irish Pub - Sacramento | Gastro Pub | Sacramento |
| 65260 | Louie's Italian Restaurant and Bar | Italian | Cos Cob |
| 16861 | Vin48 Restaurant Wine Bar | American | Avon |
| 93871 | Bentley's Steak & Chop House | Steakhouse | Encinitas |
| 102931 | Olympic Provisions Northwest | Contemporary European | Portland |
| 21472 | Spezia - Steaks, Italian & Seafood | Italian | Omaha |
| 31873 | Walnut Brewery | Brewery | Boulder |
| 23419 | Portland Prime | Steakhouse | Portland |
| 104488 | Orale Mexican Kitchen | Mexican | Jersey City |
| 5403 | Rendezvous Bistro | American | Jackson Hole |
| 64231 | La Bonne Vie Steakhouse | Italian | Erie |
| 30343 | Hapa Sushi Grill & Sake Bar - Cherry Creek | Sushi | Denver |
| 33382 | AYZA Wine & Chocolate Bar | Wine Bar | New York |
| 51574 | Local Bistro + Bar | Italian | Scottsdale |
| 85270 | Aoyama French Thai & Japanese | Thai | Wyckoff |
| 676 | Uncle Jack's Steakhouse - Bayside | Steakhouse | Bayside |
| 108433 | CAMAJE Bistro | French American | New York |
| 4520 | Nakama Japanese Steakhouse & Sushi Bar | Japanese | Pittsburgh |
| 111553 | Seven Rivers Steaks Seafood and Spirits | Steakhouse | Ignacio |
| 117208 | Samurai Blue Sushi and Sake | Sushi | Portland |
| 39994 | Fleming's Steakhouse - Omaha | Steak | Omaha |
| 76144 | Fada Bistro | French | Brooklyn |
| 20611 | Sushi Zushi - Downtown | Sushi | San Antonio |
| 91855 | Divino Italian Restaurant | Italian | Houston |
| 116542 | Yesterday's Food & Spirits | American | Granger |
| 110875 | RA Sushi Bar Restaurant - Tempe | Japanese | Tempe |
| 113602 | Bob's Steak & Chop House - Nashville | Steakhouse | Nashville |
| 4582 | BLT Prime | Steak | New York |
| 69814 | To Thai For | Thai | Honolulu |
| 6890 | The Summit Steakhouse | Steakhouse | Aurora |
| 66175 | Monstera Noodles & Sushi | Japanese | Kohala Coast |
| 148528 | Little Napoli Italian Grill & Bar | Italian | Houston |
| 46693 | Sandiago's Mexican Grill | Mexican / Southwestern | Albuquerque |
| 102925 | Olympic Provisions Southeast | Contemporary European | Portland |
| 16705 | Mignon - Prime Steaks, Seafood and Cocktails | Steakhouse | Plano |
| 87907 | Tradicao Brazilian Steakhouse - Southwest Houston | Brazilian Steakhouse | Stafford |
| 21916 | Urban Fondue | Fondue | Portland |
| 51394 | Mizu Japanese Steakhouse | Japanese | Syracuse |
| 49000 | 5th and Wine | Contemporary American | Scottsdale |
| 6654 | Mitchell's Steakhouse - Columbus Downtown | Steakhouse | Columbus |
| 70246 | Giorgio's Ristorante - South Orange | Italian | South Orange |
| 3600 | Chou Chou Bistro | Contemporary French | San Francisco |
| 74875 | Zinna's Bistro | Italian | Cranbury |
| 49540 | Nonni's Bistro | European | Pleasanton |
| 97021 | Fiore Steakhouse - Harrah's Rincon | Steakhouse | Valley Center |
| 5595 | Venice Ristorante & Wine Bar | Italian | Denver |
| 24244 | Scott's Seafood on the River | Seafood | Sacramento |
| 56254 | Shearns Seafood and Prime Steaks | Steakhouse | Galveston |
| 24319 | Sullivan's Steakhouse - Leawood | Steakhouse | Leawood |
| 1606 | Blue Point Coastal Cuisine | Seafood | San Diego |
| 117067 | Prime | Mexican | Mansfield |
| 114826 | Pacific Table | Contemporary American | Fort Worth |
| 110404 | Gina's Bistro | Italian | Las Vegas |
| 25249 | Ruth's Chris Steak House - Baton Rouge | Steakhouse | Baton Rouge |
| 68872 | Crossroads American Kitchen and Bar | American | New York |
| 145870 | The Bistro | Italian | Boulder City |
| 53938 | MAX's Wine Dive San Antonio - East Basse Rd | American | San Antonio |
| 61021 | Kayne Prime | Steakhouse | Nashville |
| 79768 | Ignite Bistro | American | Carlsbad |
| 85381 | bistro sixty | Comfort Food | San Diego |
| 145078 | Bottle + Kitchen | Contemporary American | Portland |
| 43288 | Solare Ristorante Lounge | Italian | San Diego |
| 76228 | Market Bistro | Contemporary American | Jericho |
| 47440 | Cuvee Wine & Bistro | Contemporary American | Ocala |
| 75580 | ABA Turkish Restaurant | Turkish | New York |
| 64480 | Nai Tapas | Tapas / Small Plates | New York |
| 90946 | The Steakhouse at Camelot - Excalibur | Steak | Las Vegas |
| 27859 | Wolfgang's Steak House - Waikiki Beach  | American | Honolulu |
| 21715 | 315 Restaurant & Wine Bar | French | Santa Fe |
| 83113 | Kana Tapas Bar | Spanish | New York |
| 104794 | Kipos Greek Taverna | Greek | Chapel Hill |
| 3034 | Beach Chalet Brewery & Restaurant | American | San Francisco |
| 30967 | The Wayfarer Restaurant and Lounge | Northwest | Cannon Beach |
| 3106 | Morton's The Steakhouse - Portland | Steakhouse | Portland |
| 117994 | Gregoria's Cuban Steakhouse | Latin / Spanish | Durham |
| 104674 | Strega Bistro | Italian | Berkeley Heights |
| 7232 | Flyte World Dining & Wine | Contemporary American | Nashville |
| 4149 | Grazie! Italian Eatery | Italian | Bloomington |
| 4836 | Boulevard Steakhouse | Steakhouse | Edmond |
| 124645 | Landry's Seafood House - San Antonio | Seafood | San Antonio |
| 87997 | Rocco's Brick Oven Pizzeria | Pizzeria | Jackson Heights |
| 139354 | Punk's Simple Southern Food | American | Houston |
| 71998 | TENDER steak & seafood - Luxor | Steakhouse | Las Vegas |
| 82387 | Calandras Italian Village | Italian | Caldwell |
| 109507 | Original Roy's, Hawaii Kai | Hawaii Regional Cuisine | Honolulu |
| 78982 | ATRIO Wine Bar  Restaurant | Mediterranean | New York |
| 95971 | Lemon Mediterranean Restaurant | Mediterranean | Freehold |
| 101914 | Atami Japanese Restaurant | Japanese | New York |
| 29155 | Stone Brewing World Bistro & Gardens | Organic | Escondido |
| 4544 | Terra Bistro | Contemporary American | Vail |
| 25432 | Michael's Steak Chalet | Steakhouse | Osage Beach |
| 48592 | The Upstairs Bistro | Contemporary American | Canandaigua |
| 103132 | Anatolia Turkish Restaurant | Turkish | Nashville |
| 88021 | Bria Bistro | Italian | Nashville |
| 47158 | Hapa Sushi Grill & Sake Bar - Pearl St. Boulder | Sushi | Boulder |
| 129310 | Paul Martin's American Grill - Scottsdale | American | Scottsdale |
| 3158 | Towne House Restaurant at Wine & Roses | Californian | Lodi |
| 110077 | La Brasa Peruvian Kitchen | South American | Oklahoma City |
| 33229 | Larks - Home Kitchen Cuisine at The Ashland Springs Hotel | Northwest | Ashland |
| 69334 | Insignia Prime Steak & Sushi | Steakhouse | Smithtown |
| 1180 | The French Laundry | American | Yountville |
| 24985 | Rod's Steak and Seafood Grille | Steak | Convent Station |
| 104188 | Jordan's Steak Bistro | Steakhouse | Wellington |
| 32395 | Gordon Biersch Brewery Restaurant - San Diego | American | San Diego |
| 57154 | Bibi'z Restaurant & Lounge | Global, International | Westwood |
| 144592 | Low Country Kitchen | Southern | Steamboat Springs |
| 45505 | Cuvee Bistro | American | Destin |
| 91624 | Gallerie Bar & Bistro | American | Columbus |
| 13633 | Sushi Lounge - Totowa | Sushi | Totowa |
| 45427 | PAON Restaurant & Wine Bar | French | Carlsbad |
| 64765 | Buckhorn Steakhouse | Steakhouse | Winters |
| 102391 | Iaria's Italian Restaurant | Italian | Indianapolis |
| 110881 | RA Sushi Bar Restaurant - Tucson | Japanese | Tucson |
| 11434 | Tien - Traditional Asian Dining | Asian | Biloxi |
| 59893 | Southern Hospitality - Hell's Kitchen | Barbecue | New York |
| 101971 | Carlos' Bistro | Continental | Colorado Springs |
| 144973 | Strano! Sicilian Kitchen & Bar | Sicilian | Memphis |
| 50728 | DaVinci Ristorante & Wine Bar | Italian | Salem |
| 28087 | Easy Bistro | Contemporary American | Chattanooga |
| 110698 | Sushi One | Sushi | Raleigh |
| 25258 | RingSide Steakhouse - Uptown | Steakhouse | Portland |
| 44116 | Stella Modern Italian Cuisine | Italian | Oklahoma City |
| 21430 | Vigilucci's Seafood & Steakhouse | Italian | Carlsbad |
| 109615 | The Prime Rib Restaurant & Wine Cellar | American | Gillette |
| 12451 | Miyako Japanese Restaurant | Japanese | Honolulu |
| 69763 | Helga's German Restaurant & Deli | German | Aurora |
| 10417 | Staghorn Steakhouse | Steakhouse | New York |
| 4009 | Ruth's Chris Steak House - San Antonio (Airport) | Steakhouse | San Antonio |
| 61348 | Pure Sushi | Sushi | Scottsdale |
| 30181 | Perry's Steakhouse & Grille - Cinco Ranch/Katy | Steakhouse | Katy |
| 14227 | Ruth's Chris Steak House - Mishawaka | Steakhouse | Granger |
| 86683 | Richardson's Cuisine of New Mexico | Southwest | Phoenix |
| 39349 | Fogo de Chao Brazilian Steakhouse - Houston | Brazilian Steakhouse | Houston |
| 39940 | Fleming's Steakhouse - Houston | Steak | Houston |
| 3420 | Walter's Bistro | Contemporary American | Colorado Springs |
| 43015 | E.B. Green's Steakhouse | Steakhouse | Buffalo |
| 30835 | Zinc Bistro | French | Scottsdale |
| 151180 | Fado Portuguese Kitchen & Bar | Portuguese | Portland |
| 114538 | Maui Thai Bistro | Thai | Kihei |
| 3424 | Barclay Prime | Steakhouse | Philadelphia |
| 111940 | Mexican Sugar | Latin American | Plano |
| 3505 | Ruth's Chris Steak House - Del Mar | Steakhouse | San Diego |
| 32872 | Blackstones Steakhouse - Norwalk | Steakhouse | Norwalk |
| 7671 | Christner's Prime Steak and Lobster | Steak | Orlando |
| 86329 | Mollie Fontaine Lounge | International | Memphis |
| 102541 | Landry's Seafood House - The Woodlands | Seafood | The Woodlands |
| 6908 | Acacia real food & cocktails | Contemporary American | Tucson |
| 5871 | West Steak and Seafood | Steak | Carlsbad |
| 85117 | Bantam Bistro | American | Litchfield |
| 3739 | Gallagher's Steakhouse | Steakhouse | Las Vegas |
| 110878 | RA Sushi Bar Restaurant - Phoenix | Japanese | Phoenix |
| 2792 | Frankie & Johnnie's Steakhouse - Manhattan | Steak | New York |
| 53146 | Crave Sushi | Sushi | Houston |
| 108634 | Portneuf Grille & Lounge at the Riverside Inn | Northwest | Lava Hot Springs |
| 4725 | Masu Sushi | Sushi | Portland |
| 17014 | Randy's Steakhouse | Steakhouse | Frisco |
| 51277 | Trombino's Bistro Italiano | Italian | Albuquerque |
| 104350 | DK Steak House | American | Honolulu |
| 21853 | Woody's Tupelo Steakhouse | Steakhouse | Tupelo |
| 16159 | Argyle Steakhouse | Steakhouse | Carlsbad |
| 4705 | Steakhouse at the Spa | Steakhouse | Palm Springs |
| 35893 | Docks Oyster Bar and Seafood Grill | Seafood | New York |
| 103939 | The Wine Bistro - Upper Arlington | American | Columbus |
| 6794 | McCormick & Schmick's Seafood - Pittsburgh South Side | Seafood | Pittsburgh |
| 113587 | Il vino wine bar | Wine Bar | New York |
| 3840 | Ruth's Chris Steak House - Scottsdale | Steakhouse | Scottsdale |
| 105841 | Ayuttaya Thai Cuisine | Thai | Ocala |
| 101416 | South on Main | Contemporary Southern | Little Rock |
| 3982 | Solera Restaurant & Wine Bar | Contemporary American | Denver |
| 37657 | Shanahan's Steakhouse | Steakhouse | Denver |
| 65584 | Pietro's Italian Restaurant | Italian | Lodi |
| 41185 | Rock Bottom Brewery - Portland | American | Portland |
| 1896 | SÉR Steak+Spirits | Steak | Dallas |
| 7137 | Paloma Blanca Mexican Cuisine | Mexican | San Antonio |
| 50611 | Cuisine | Contemporary French | Detroit |
| 106633 | Char Steakhouse - Putnam Valley | American | Putnam Valley |
| 40036 | Fleming's Steakhouse - Scottsdale | Steak | Scottsdale |
| 4661 | Sullivan's Steakhouse | Steakhouse | Houston |
| 78586 | Latin Bites | Peruvian | Houston |
| 144508 | Capo's Chicago Pizza & Fine Italian Dinners | Italian | San Francisco |
| 16102 | Chandlers Steakhouse | Steakhouse | Boise |
| 7566 | Mickey Mantle's Steakhouse | Steakhouse | Oklahoma City |
| 114748 | School Street Bistro | Southern | Lodi |
| 85228 | Billy Bob's Steak House & Saloon | Steakhouse | Las Vegas |
| 32917 | Max's Bistro & Bar | Seafood | Fresno |
| 41485 | Greek Brothers Oyster Bar & Grill | Steakhouse | El Campo |
| 46183 | Akbar Restaurant - Garden City | Indian | Garden City |
| 20641 | Djon's Steak & Lobster House | Steak | Melbourne |
| 41143 | Pulehu, an Italian Grill | Italian | Lahaina |
| 40978 | BlueFin Japanese Restaurant | Japanese | San Jose |
| 66616 | Luke's, A Steak Place | Steakhouse | Wheat Ridge |
| 21970 | Sono Japanese Restaurant | Japanese | Raleigh |
| 52708 | Bistro Mezzaluna | Italian | Ft. Lauderdale |
| 106993 | The Signature Prime Steak & Seafood | Steakhouse | Honolulu |
| 103948 | The Wine Bistro - Worthington | Contemporary American | Columbus |
| 33691 | Uni Sushi | Sushi | The Woodlands |
| 42559 | Antibes Bistro | French | New York |
| 43528 | Ponty Bistro | French | New York |
| 76567 | Sushi Yasaka | Sushi | New York |
| 75361 | Angelo's Prime Bar & Grill | Contemporary American | Clifton Park |
| 67912 | O'Brien's Irish Pub | American | New York |
| 14572 | Currant American Brasserie | Contemporary American | San Diego |
| 79627 | Troy Mezze Lounge | Turkish | Raleigh |
| 82759 | Palmer's American Grill | Contemporary American | Farmingdale |
| 26521 | Prime Italian | Italian | Miami Beach |
| 48904 | Bistro 18 | Contemporary American | Montclair |
| 17866 | Rocks Modern Grill at Beaver Creek Lodge | Gastro Pub | Beaver Creek |
| 145558 | Bistro Maison | French | McMinnville |
| 54928 | Tamba Indian Grill and Bar | Indian | New York |
| 57847 | Chez Nous French Restaurant | Contemporary French | Humble |
| 22132 | Nikai Sushi | American | Jackson Hole |
| 110911 | RA Sushi Bar Restaurant - Plano | Japanese | Plano |
| 39964 | Fleming's Steakhouse - La Jolla | Steak | La Jolla |
| 6647 | Smith & Wollensky Steakhouse - Las Vegas | Steakhouse | Las Vegas |
| 116452 | ENO Artisan Pizzeria & Wine Bar | Pizzeria | Coronado |
| 16171 | California Bistro - Park Hyatt Aviara | Contemporary American | Carlsbad |
| 7262 | Iron Starr Urban Barbecue - OKC | Barbecue | Oklahoma City |
| 116554 | Wine Bistro Westerville | American | Westerville |
| 47656 | Bhatti Indian Grill | Indian | New York |
| 2401 | St. Elmo Steak House | Steak | Indianapolis |
| 104404 | Tumi International Restaurant | Peruvian | Elizabeth |
| 80584 | Malabar American Cooking | American | Sacramento |
| 15883 | Paul Martin's American Grill - Roseville | American | Roseville |
| 100624 | Bistro | Contemporary American | Jupiter |
| 59980 | Tannin Wine Bar and Kitchen | Contemporary American | Kansas City |
| 1523 | Artisanal Fromagerie Bistro & Wine Bar | French | New York |
| 90778 | Kachina Southwestern Grill | Southwest | Westminster |
| 60337 | Edoko Sushi | Sushi | Frisco |
| 91891 | Afghan Kebab House II | Afghan | New York |
| 29914 | Brenner's Steakhouse on the Bayou | Steakhouse | Houston |
| 151666 | Game Time Bar and Grill - iplay America | American | Freehold |
| 60625 | Caracara Mexican Grill | Mexican / Southwestern | Farmingdale |
| 6504 | Ruth's Chris Steak House - Downtown Honolulu | Steakhouse | Honolulu |
| 75088 | Espana Tapas & Wine Bar | Spanish | Saint James |
| 146083 | The Kemah Steak Company | Steakhouse | Kemah |
| 148933 | Louie's Wine Dive - Omaha | American | Omaha |
| 62827 | Steakhouse 85 | Steakhouse | New Brunswick |
| 103087 | The Wine Bar | American | Saratoga Springs |
| 2389 | K & L Bistro | French | Sebastopol |
| 50350 | Deno's Mountain Bistro | American | Winter Park |
| 151789 | Seoul Garden | Korean | San Francisco |
| 64729 | The Empire Lounge and Restaurant | American | Louisville |
| 39382 | Fogo de Chao Brazilian Steakhouse - San Antonio | Brazilian Steakhouse | San Antonio |
| 68572 | Tir Na Nog Irish Bar & Grill - Times Square | American | New York |
| 93667 | Christie's Seafood & Steaks | Seafood | Houston |
| 78148 | Asuka Sushi | Japanese | New York |
| 92797 | Mira Sushi & Izakaya Bar | Sushi | New York |
| 56839 | Mohegan Manor Restaurant & Club Sushi | American | Baldwinsville |
| 129286 | Port-o Lounge & Restaurant | Portuguese | Jersey City |
| 108595 | Pasion Latin Fusion | Latin American | Albuquerque |
| 12742 | buku: Global Street Food | Global, International | Raleigh |
| 91453 | Rico's American Grill - Pointe Hilton Squaw Peak | American | Phoenix |
| 56422 | Baci Bistro | Italian | Kailua |
| 102424 | Siro Urban Italian at Marriott World Center | Italian | Orlando |
| 5700 | Bootlegger Bistro | Italian | Las Vegas |
| 27820 | Splash Seafood Bar and Grill | Seafood | Des Moines |
| 129211 | Firenze Italian Steakhouse | Steakhouse | Worland |
| 110023 | Ruth's Chris Steak House - Houston | Steakhouse | Houston |
| 44965 | El Paso Mexican Restaurant | Mexican | New York |
| 100270 | Iron Sushi - Upper East Side | Japanese | New York |
| 12358 | Oceanaire Seafood Room - Denver | Seafood | Denver |
| 76312 | Cafe Mocha Espresso Wine Bar | Fusion / Eclectic | New York |
| 113101 | Reel Seafood Co | Seafood | Albany |
| 108277 | La Thai | Asian | New Orleans |
| 22813 | Mercy Wine Bar | European | Dallas |
| 3100 | Morton's The Steakhouse - Houston - Galleria | Steakhouse | Houston |
| 76258 | Central Park Fusion | Fusion / Eclectic | Hot Springs |
| 75709 | Lantern Thai Kitchen | Thai | New York |
| 46936 | Taj Mahal Homestyle Indian and Pakistani Cuisine | Indian | Boise |
| 4152 | Steve Fields Steak and Lobster Lounge | Steak | Plano |
| 34573 | Caffe Boa Bistro | Italian | Tempe |
| 113629 | Sansei Seafood Restaurant & Sushi Bar - WAIKIKI, Oahu | Contemporary Asian | Honolulu |
| 17047 | BARcelona Tapas - Indianapolis | Spanish | Indianapolis |
| 138865 | Steak 44 | Steakhouse | Phoenix |
| 43765 | Bistro 245 | Contemporary American | Key West |
| 85840 | SEA Vegas: The Thai Experience | Asian | Las Vegas |
| 114118 | Ernesto's Mexican Food | Mexican | Sacramento |
| 2168 | Brick & Bottle | Californian | Corte Madera |
| 106555 | Bistro Al Vino | American | Aurora |
| 117388 | TamashiSoul Sushi Bar | Japanese | San Francisco |
| 10744 | Ruth's Chris Steak House - Lake Mary | Steakhouse | Lake Mary |
| 16546 | Senorita's Mexican Grill | Mexican / Southwestern | Bloomfield |
| 20071 | Sushi Roku - Scottsdale | Sushi | Scottsdale |
| 59230 | Tucson's Steakhouse | Steakhouse | Salina |
| 3066 | Terra American Bistro | Contemporary American | San Diego |
| 22453 | Bistro Aix | French | Jacksonville |
| 71188 | Verde Mexican Kitchen & Cantina | American | Pittsburgh |
| 50938 | Blades' Bistro | International | Placitas |
| 107917 | Morton's The Steakhouse - Biloxi | Steakhouse | Biloxi |
| 45133 | Relish Burger Bistro - The Phoenician | American | Scottsdale |
| 90613 | Kalaheo Steak and Ribs | Steak | Kalaheo |
| 91819 | Yi Sushi | Sushi | El Cajon |
| 113863 | Chayo Mexican Kitchen + Tequila Bar | Mexican | Las Vegas |
| 40024 | Fleming's Steakhouse - San Antonio | Steak | San Antonio |
| 95188 | Josselin's Tapas Bar and Grill | Tapas / Small Plates | Koloa |
| 18910 | Bourbon Steak at The Fairmont Scottsdale Princess | American | Scottsdale |
| 5977 | Mahogany Prime Steakhouse OKC | Steak | Oklahoma City |
| 43663 | The Wine Bar & Restaurant | Contemporary American | Atlantic Highlands |
| 30481 | Tigelleria Organic Restaurant | Italian | Campbell |
| 39943 | Fleming's Steakhouse - Houston Beltway | Steak | Houston |
| 106558 | Packard's New American Kitchen | Contemporary American | Oklahoma City |
| 104932 | Rising Sun Sushi & Fusion Restaurant | Sushi | Humble |
| 3571 | Oceanaire Seafood Room - San Diego | Seafood | San Diego |
| 1854 | Pappas Bros. Steakhouse | Steak | Houston |
| 50071 | Liberty Prime Steakhouse | American | Jersey City |
| 98212 | Gilbey's Seafood and Steak | Steak | Orange Beach |
| 88468 | Marjan Fine Persian Grill | Persian | Morristown |
| 97093 | Etoile Cuisine Et Bar | French | Houston |
| 2002 | Musashi's Japanese Steakhouse | Japanese | Oklahoma City |
| 78136 | Fuji Sushi | Sushi | New York |
| 3123 | Morton's The Steakhouse - Sacramento | Steakhouse | Sacramento |
| 150487 | Harvest Organic Grille – Galleria | Organic | Houston |
| 90916 | Prime - Bellagio Hotel | Steakhouse | Las Vegas |
| 30565 | Departure Restaurant and Lounge | Asian | Portland |
| 2535 | Bistro Vendome | French | Denver |
| 106144 | Ciro's Italian Restaurant - Kings Park | Italian | Kings Park |
| 3758 | Sally's Seafood on the Water | Seafood | San Diego |
| 31165 | Haru Sushi - Gramercy Park | Japanese | New York |
| 22039 | Trio An American Bistro | Contemporary American | Jackson Hole |
| 103894 | Queenie's Steakhouse | Steakhouse | Denton |
| 140089 | 40 Steak + Seafood | Seafood | Bismarck |
| 67903 | EVO Italian | Italian | Tequesta |
| 46750 | Dragonfly - Robata Grill & Sushi | Tapas / Small Plates | Orlando |
| 40933 | Bistro Rollin | Contemporary French / American | Pelham |
| 2551 | Carneros Bistro & Wine Bar | Californian | Sonoma |
| 102379 | Vintage Italian Restaurant | Italian | Roselle Park |
| 74671 | Fogo de Chao Brazilian Steakhouse - Las Vegas | Brazilian Steakhouse | Las Vegas |
| 84271 | Portland Seafood Co. - Washington Square | Seafood | Tigard |
| 24202 | Hill Country - Flatiron | Barbecue | New York |
| 110701 | Istanbul Turkish Cuisine | Turkish | Lake Mary |
| 97057 | Andy's Bistro | Steakhouse | Metairie |
| 37207 | Vera Mae's Bistro | Contemporary American | Muncie |
| 117262 | Ichi Sushi & Ni Bar | Japanese | San Francisco |
| 7165 | Ortega's  A Mexican Bistro | Mexican | San Diego |
| 47467 | Strand Bistro at The Strand Hotel | American | New York |
| 94798 | Seito Sushi - Baldwin Park | Asian | Winter Park |
| 17290 | Jimmy's An American Restaurant & Bar | American | Aspen |
| 3830 | Ruth's Chris Steak House - Metairie | Steakhouse | Metairie |
| 90307 | Michoacan Gourmet Mexican Restaurant | Mexican | Las Vegas |
| 57901 | Chocolat Restaurant Lounge | American | New York |
| 16111 | Kirby's Prime Steakhouse - San Antonio | Steakhouse | San Antonio |
| 53935 | Mr. John's Steakhouse | Steakhouse | New Orleans |
| 92512 | Otaez Mexican Restaurant - Alameda | Mexican | Alameda |
| 148396 | West Park Bistro | Californian | San Carlos |
| 150442 | Lot 2 Restaurant & Wine Bar | American | Omaha |
| 61501 | Frederick's Bistro | French | San Antonio |
| 6576 | Ayothaya Thai | Thai | Orlando |
| 19831 | Jay's Bistro | Contemporary American | Fort Collins |
| 83110 | DJ's Steakhouse-Jumers Casino and Hotel | Steakhouse | Rock Island |
| 20743 | Manhattan Steak and Seafood | Steak | Orange |
| 53758 | Omaha Steakhouse -Phoenix | Steakhouse | Phoenix |
| 60298 | Thai Select | Thai | New York |
| 8107 | Blue River Bistro | Italian | Breckenridge |
| 62380 | Greystone The Steakhouse | Steakhouse | San Diego |
| 94237 | Bistro Le Steak | Steakhouse | New York |
| 11611 | Bistro West - Carlsbad | Contemporary American | Carlsbad |
| 116272 | XO Prime Steaks Pepper Pike | Steak | Pepper Pike |
| 38590 | La Scala Italian Restaurant | Italian | Lafayette |
| 79039 | Vinue Wine Bar | International | Denver |
| 72034 | Fratelli Brick Oven Pizza & Wine Bar | Italian | New York |
| 6164 | Ruth's Chris Steak House - Destin | Steakhouse | Destin |
| 4940 | La Fondue | Contemporary American | Denver |
| 4997 | Ruth's Chris Steak House - Biloxi | Steakhouse | Biloxi |
| 7562 | Kirby's Prime Steakhouse - The Woodlands | Steakhouse | The Woodlands |
| 100279 | Taj Mahal Indian Restaurant | Indian | Orlando |
| 106147 | Ciro's Italian Restaurant - Hauppauge | Italian | Hauppauge |
| 25339 | Shor Seafood at the Hyatt Resort & Spa | American | Key West |
| 116377 | Serena Sicilian Influence Gastropub | Italian | Durham |
| 118195 | Lime an American Cantina | Mexican / Southwestern | Denver |
| 141277 | Superior Seafood | Seafood | New Orleans |
| 107422 | Los Poblanos Historic Inn & Organic Farm | American | Los Ranchos de Albuquerque |
| 100249 | Bistro 72 At Hotel Indigo East End | Contemporary American | Riverhead |
| 103153 | Harrigan's Cafe & Wine Deck | Mediterranean | Johnstown |
| 112954 | Spuntino Wine Bar and Italian Tapas | Italian | Clifton |
| 111412 | Washington St. Bistro | American | Morristown |
| 5642 | Bobby's Restaurant and Lounge | Italian | Scottsdale |
| 103615 | La Cave Wine Bar & Boutique | Contemporary American | Lakewood |
| 149104 | SoCo Farm and Food | Contemporary Southern | Wilson |
| 86356 | Ocean Prime - Indianapolis | Seafood | Indianapolis |
| 45709 | McCormick & Schmick's Town & Country Village | Seafood | Houston |
| 88855 | Dragonwell Bistro | Chinese | Portland |
| 3115 | Morton's The Steakhouse - San Diego | Steakhouse | San Diego |
| 24268 | East by Southwest | Sushi | Durango |
| 29917 | Brenner’s Steakhouse Katy Freeway | Steakhouse | Houston |
| 90655 | South Pacific Dinner Theatre | American | Lihue |
| 108283 | Tapas D Jerez | Tapas / Small Plates | Centennial |
| 139204 | BLT Prime - Trump Doral | Steakhouse | Miami |
| 58864 | Hi-Life Restaurant & Lounge | American | New York |
| 20386 | Danton's Gulf Coast Seafood Kitchen | Seafood | Houston |
| 22864 | McCormick & Schmick's Seafood - Roseville - The Fountains | Seafood | Roseville |
| 150241 | Paisan's Italian Ristorante | Italian | Cary |
| 681 | Alexander's Steakhouse - SF | Steakhouse | San Francisco |
| 18013 | Pacific Catch - Sunset District | Seafood | San Francisco |
| 147613 | The Garden View Restaurant - Oregon Garden Resort | American | Silverton |
| 100756 | Sushi Bushido | Sushi | Kapaa |
| 21886 | Brix Restaurant and Wine Bar | Contemporary American | Flagstaff |
| 106471 | Academy Street Bistro | Contemporary American | Cary |
| 43588 | Mark's Prime Steak House - Ocala | Steakhouse | Ocala |
| 2657 | Garden Court | Californian | San Francisco |
| 3029 | Morton's The Steakhouse - Indianapolis | Steakhouse | Indianapolis |
| 16795 | In Vino Wine Bar & Restaurant | Italian | New York |
| 33439 | MÁS Tapas y Vino | Tapas / Small Plates | Albuquerque |
| 54547 | Le Bistro D’à Côté | French | New York |
| 45853 | Todd English at The Plaza Food Hall | Contemporary American | New York |
| 11683 | Sullivan's Steakhouse - Tucson | Steakhouse | Tucson |
| 40027 | Fleming's Steakhouse - Sandestin | Steak | Sandestin |
| 43291 | The French Gourmet | French | San Diego |
| 3537 | Mark's American Cuisine | Contemporary American | Houston |
| 118852 | 630 Park Steakhouse - Graton Resort & Casino | Steakhouse | Rohnert Park |
| 2847 | Zinc Wine Bar & Bistro | American | Albuquerque |
| 70240 | Zocalo Mexican Cuisine & Tequileria | Contemporary Mexican | Kansas City |
| 7792 | Bali Steak & Seafood | Steakhouse | Honolulu |
| 110956 | Wild Iris | Contemporary American | Brentwood |
| 3696 | SOBA Lounge | Pan-Asian | Pittsburgh |
| 79729 | Lorenzo's Restaurant, Bar & Caberet - Hilton Garden Inn - SI | Italian | Staten Island |
| 118711 | Massa' Coastal Italian Cuisine | Seafood | Mamaroneck |
| 66946 | Forno Bistro | Italian | Saratoga Springs |
| 11431 | Costa Cucina Italian Restaurant | Italian | Biloxi |
| 105145 | Montauk Seafood Grill | Seafood | Vail |
| 15802 | Perry's Steakhouse & Grille - Champions | Steakhouse | Houston |
| 129217 | Crave Restaurant & Lounge | Contemporary American | Poughkeepsie |
| 3828 | Ruth's Chris Steak House - Lafayette | Steakhouse | Lafayette |
| 52999 | Stage Restaurant Hawaii | Contemporary Asian | Honolulu |
| 150526 | Gem Creole Saloon | Creole / Cajun / Southern | Mcminnville |
| 136045 | Bourbon Street Steakhouse & Grill | American | West Memphis |
| 4332 | The French Room | Contemporary French / American | Dallas |
| 15433 | Calistoga Inn Restaurant & Brewery | American | Calistoga |
| 80734 | NYY Steak | Steakhouse | Coconut Creek |
| 54433 | J&K Steakhouse of Morristown | Steakhouse | Morristown |
| 45805 | Amelia's Bistro - New Jersey | Contemporary American | Jersey City |
| 21580 | Killen's Steakhouse | Steak | Pearland |
| 39937 | Fleming's Steakhouse - West Hartford | Steak | West Hartford |
| 110392 | Kabooki Sushi | Sushi | Orlando |
| 19975 | Loft Bar and Bistro | American | San Jose |
| 109636 | Rodizio Grill The Brazilian Steak House | Brazilian Steakhouse | Nashville |
| 64705 | Medi Wine Bar | Mediterranean | New York |
| 108976 | Joseph's Steakhouse - Hyde Park | Steakhouse | Hyde Park |
| 7551 | Yo Sake Downtown Sushi Lounge | Asian | Wilmington |
| 95917 | Centennial Steakhouse-Zia Park Casino | Steakhouse | Hobbs |
| 100492 | Railcar Modern American Kitchen | American | Omaha |
| 94162 | The Boiler House and Texas Grill & Wine Garden | American | San Antonio |
| 92545 | Angelo Bellini Italian Restaurant | Italian | New York |
| 7796 | Quiessence Restaurant & Wine Bar | Contemporary American | Phoenix |
| 97267 | Louie's Wine Dive - Kansas City | Contemporary American | Kansas City |
| 56218 | Rattan Pan Asian Bistro and Wine Bar | Asian | Houston |
| 144340 | Johnny's Italian Steakhouse - Olathe | Steakhouse | Olathe |
| 103054 | Akira Japanese Hibachi Steakhouse | Japanese | Plainfield |
| 5835 | The Wild Fig | Mediterranean | Aspen |
| 110017 | Bob's Steak and Chop House - Woodlands | Steakhouse | Shenandoah |
| 151108 | Yuzuki Japanese Eatery (fka Izakaya Yuzuki) | Japanese | San Francisco |
| 113251 | Osaka Japanese Cuisine | Japanese | Las Vegas |
| 38941 | 1808 American Bistro | American | Delaware |
| 3107 | Morton's The Steakhouse - New Orleans | Steakhouse | New Orleans |
| 112759 | The Black Sheep Bistro | Global, International | Old Town Spring |
| 100243 | Elaine's Asian Bistro & Grill | Chinese | Great Neck |
| 117703 | Peachtree Southern Kitchen and Cocktails | Southern | Hudson |
| 37048 | Jade Eatery & Lounge | Contemporary Asian | Forest Hills |
| 71971 | Bistro Fourteen | Contemporary American | Vail |
| 140998 | Kazu Japanese Restaurant | Japanese | Jacksonville |
| 33214 | The Oar Steak and Seafood Grill | Seafood | Patchogue |
| 64063 | DUO - Steak & Seafood | Steakhouse | Wailea |
| 85966 | The 43rd Restaurant & Lounge | American | Houston |
| 104962 | Twigs Bistro & Martini Bar - Bridgeport | American | Tigard |
| 111112 | Ruth's Chris Steak House - River Walk | Steakhouse | San Antonio |
| 119344 | Ruth's Chris Steak House - Denver | Steakhouse | Denver |
| 79210 | Vintana Wine & Dine | Californian | Escondido |
| 148171 | Infinity Bistro - Hartford | American | Hartford |
| 3509 | Ruth's Chris Steak House - Walnut Creek | Steakhouse | Walnut Creek |
| 3475 | Brandy Ho's Hunan Food | Chinese | San Francisco |
| 101221 | Bob's Steak & Chop House - San Antonio | Steakhouse | San Antonio |
| 3419 | Christopher's Restaurant/Crush Lounge | French American | Phoenix |
| 22867 | McCormick & Schmick's Seafood - Houston - Downtown | Seafood | Houston |
| 83560 | The Bombay Bistro | Indian | Summit |
| 105655 | Hunter Steakhouse - Mission Valley | Steakhouse | San Diego |
| 91177 | Danny's Grill & Wine Bar | Steak | Red Bank |
| 56647 | Plates | Contemporary American | Larchmont |
| 107131 | Ai Fuji Japanese Steakhouse | Japanese | Durham |
| 100477 | Char Steakhouse - Red Bank | Steak | Red Bank |
| 85951 | Arriba Arriba Mexican Restaurant - Queens | Mexican | Sunnyside |
| 51094 | Satis Bistro | Modern European | Jersey City |
| 4611 | Joseph's Steakhouse of Iowa City | Steak | Iowa City |
| 51412 | Le Rendez-vous Bistro & Restaurant Francais | French | Tucson |
| 115090 | Ruth's Chris Steak House - Boise | Steakhouse | Boise |
| 140644 | Argyll Whisky Beer | Gastro Pub | Denver |
| 94573 | Rusconi's American Kitchen | Contemporary American | Phoenix |
| 94153 | Bistro Foufou | French | Traverse City |
| 104890 | The Country Cat Dinnerhouse and Bar | American | Portland |
| 106498 | Pomo Cucina & Pizzeria | Italian | Scottsdale |
| 84388 | Bistro 46 @ Holiday Inn Plainview | American | Plainview |
| 7463 | Hama Sushi | Sushi | Venice |
| 149641 | Maxwell's Steakhouse | Steakhouse | Crested Butte |
| 96976 | Magnolia House by Kelly English | Steakhouse | Biloxi |
| 5616 | Son'z Steakhouse | Steakhouse | Lahaina |
| 150220 | Thai Peacock | Thai | Portland |
| 22357 | Shula's Steak House - Hyatt Regency Houston | Steak | Houston |
| 106114 | Stone Brewing World Bistro & Gardens - Liberty Station | Organic | San Diego |
| 53020 | MoCA Asian Bistro - Queens | Asian | Forest Hills |
| 79732 | Black Rock Steak & Seafood | Steak | Lahaina |
| 107035 | Verde Wine Bar and Ristorante | Italian | Deer Park |
| 105823 | Sushi Den | Japanese | Denver |
| 146203 | Social Southern Table and Bar | Southern | LaFayette |
| 58585 | West Side Steakhouse | Steak | New York |
| 84985 | Namaste Madreas Cuisine | Indian | Berkeley |
| 72397 | Fountain Bistro | Contemporary European | Detroit |
| 116239 | SOHO Asian Bar & Grill | Kosher | Aventura |
| 55045 | Colorado's Prime Steak | Contemporary American | Sanford |
| 39904 | Fleming's Steakhouse - Chandler | Steak | Chandler |
| 59791 | Sullivan Bistro | American | New York |
| 54799 | Leucadia Pizzeria & Italian Restaurant | Italian | La Jolla |
| 38437 | BLT Steak - Waikiki | Steakhouse | Honolulu |
| 104044 | Napolese Pizzeria | Pizzeria | Indianapolis |
| 87829 | Scuzzi's Italian Grill | Italian | San Antonio |
| 14077 | Pacific Catch - Corte Madera | Seafood | Corte Madera |
| 48019 | The Metro Wine Bar & Bistro | Contemporary American | Oklahoma City |
| 25741 | Zen Sushi Bistro | Japanese | Millbrae |
| 72721 | Bob's Steak & Chop House - Dallas on Lamar | Steakhouse | Dallas |
| 34501 | Zinc Bistro & Wine Bar | American | San Antonio |
| 1048 | Ruth's Chris Steak House - Cary | Steakhouse | Cary |
| 74362 | Surfish Bistro | Peruvian | Brooklyn |
| 73780 | Finch's Bistro & Wine Bar | Contemporary European | La Jolla |
| 32248 | South End | American | New Canaan |
| 55798 | Pizzeria Locale | Pizzeria | Boulder |
| 5479 | 310 Park South | American | Winter Park |
| 56290 | Temple Gourmet Chinese | Chinese | Red Bank |
| 117670 | Andrew Michael Italian Kitchen | Contemporary Italian | Memphis |
| 3461 | Afternoon Tea at the Brown Palace | Afternoon Tea | Denver |
| 36412 | Makana Terrace - St. Regis - Hawaii | Seafood | Princeville |
| 139660 | Crisp. Wine, Beer, & Eatery | Contemporary Italian | Houston |
| 111184 | Sapori Italian Restaurant - White Plains | Italian | White Plains |
| 52120 | Sage Student Bistro - Institute for the Culinary Arts | Contemporary American | Omaha |
| 106273 | Phil’s Italian Steak House | Steakhouse | Las Vegas |
| 27055 | Amelia's Italian Cuisine | Italian | Gainesville |
| 24793 | J&G Steakhouse Scottsdale at The Phoenician | Steakhouse | Scottsdale |
| 39838 | Massa's Seafood Grill | Southern | Houston |
| 37975 | French Market Grille | French | San Diego |
| 110638 | Fogo de Chao Brazilian Steakhouse - San Diego | Brazilian Steakhouse | San Diego |
| 46051 | St. Clair Winery & Bistro | American | Albuquerque |
| 10996 | Lawry's The Prime Rib - Las Vegas | Prime Rib | Las Vegas |
| 110224 | Quality Italian | Steakhouse | New York |
| 5444 | Saint Jacques French Cuisine | French | Raleigh |
| 146029 | NOLA Bistro & Bar | Creole | Osseo |
| 93826 | Urban Flats Winter Garden | Contemporary American | Winter Garden |
| 144994 | Red Martini, Wine Bar & Grill | Contemporary American | Redmond |
| 51724 | Bistro Casanova | Italian | Kahului |
| 78076 | Taste- An American Bistro at The Hilton Phoenix Chandler | American | Chandler |
| 53125 | EOS Greek Cuisine | Greek | Stamford |
| 151243 | Bistro Daisy | American | New Orleans |
| 5261 | Bistro 921 | Contemporary American | Portland |
| 101488 | Sweet Waters Steak House | Steakhouse | Westfield |
| 108910 | Paul Martin's American Grill - San Mateo | American | San Mateo |
| 4064 | Shula's Steak House - Indianapolis | Steak | Indianapolis |
| 76354 | La Fiamma Italian Restaurant and Bar | Italian | Harrison |
| 149452 | Babylon Turkish Restaurant | Turkish | Miami Beach |
| 15217 | Grand House China Bistro | Asian | Oklahoma City |
| 110821 | RA Sushi Bar Restaurant - Houston CityCentre | Japanese | Houston |
| 75742 | Bleu Restaurant & Lounge | Contemporary American | Memphis |
| 14026 | Red Prime Steak | Steakhouse | Oklahoma City |
| 129271 | Bistro Piattini | Italian | Albuquerque |
| 87307 | Lone Wolf Restaurant and Lounge | Steakhouse | Jackson |
| 4832 | Rothmann's Steakhouse | Steakhouse | East Norwich |
| 58879 | Hideaway Steakhouse | Steakhouse | Westminster |
| 30067 | Simms Steakhouse | Steak | Golden |
| 78511 | Nové Italian Restaurant | Italian | Wilton |
| 7026 | Sky Asian Fusion | Asian | Ocala |
| 78115 | Amaze Fusion Restaurant and Lounge | Asian | New York |
| 30877 | The Standard Restaurant & Lounge | American | Albany |
| 4331 | Thea Mediterranean Cuisine | Mediterranean | San Jose |
| 30550 | Butcher Shop Steakhouse - San Diego | Steak | San Diego |
| 33508 | BV Tuscany Italian Restaurant | Italian | Teaneck |
| 79696 | Monsoon: Asian Kitchen and Lounge | Asian | Babylon |
| 7319 | Pacifica Seafood Restaurant | Seafood | Palm Desert |
| 92920 | Anthony's Prime Steak & Seafood | Steakhouse | Henderson |
| 28045 | Mazza Mediterranean Cuisine | Mediterranean | Pembroke Pines |
| 112018 | Backstage Bistro (at Village Cinema) | Contemporary American | Meridian |
| 47371 | Organic Grill | Organic | New York |
| 115150 | Ai Sushi Sake Grill | Sushi | Dallas |
| 70351 | PY Steakhouse | Steak | Tucson |
| 108490 | Bistro Cassis Manhattan | French | New York |
| 87523 | Cedars Steakhouse - Foxwoods Resort Casino | Steakhouse | Ledyard |
| 57103 | Wine 30 | American | New York |
| 159 | Scala's Bistro | Italian | San Francisco |
| 139750 | South of Beale | Contemporary American | Memphis |
| 76795 | Canal Bistro - Mediterranean Grill | Mediterranean | Indianapolis |
| 18952 | Ibiza Food and Wine Bar | Mediterranean | Houston |
| 28183 | Veranda Fireside Lounge & Restaurant | Californian | San Diego |
| 43195 | Kabuki Japanese Restaurant - Glendale | Japanese | Glendale |
| 116893 | Twigs Bistro & Martini Bar - Meridian | American | Meridian |
| 116200 | Streetcar Bistro & Taproom | American | Portland |
| 6793 | McCormick & Schmick's Seafood - Denver | Seafood | Denver |
| 94621 | Hapa Sushi Grill and Sake Bar Lodo | Sushi | Denver |
| 109984 | Pino's Contemporary Italian Restaurant & Wine Bar | Contemporary Italian | Pittsburgh |
| 118822 | Savoie French Italian Eatery | Italian | Chula Vista |
| 55984 | Japango Sushi Restaurant | Sushi | Boulder |
| 43204 | Kabuki Japanese Restaurant - Las Vegas | Japanese | Las Vegas |
| 45730 | Vogue Bistro | French | Surprise |
| 97420 | Quetzalcoatl Fine Mexican Cuisine | Mexican / Southwestern | Huntington |
| 77902 | The New York Beer Company | American | New York |
| 110227 | House. Wine. & Bistro | Contemporary American | Mcallen |
| 112537 | Small Plates | Contemporary American | Syracuse |
| 97180 | Range Steakhouse - Harrah’s Ak-Chin Casino Resort | Steakhouse | Maricopa |
| 108250 | Yuki Hana Japanese Fusion | Sushi | Oviedo |
| 21073 | Black & Blue Seafood Chophouse | Seafood | Huntington |
| 11785 | Silo Elevated Cuisine - Alamo Heights | American | San Antonio |
| 18229 | Mastro's City Hall Steakhouse | Steakhouse | Scottsdale |
| 56230 | Bistro N - Nordstrom Houston Galleria | Contemporary American | Houston |
| 17647 | Bellamy's Restaurant and Wine Bar | Californian | Escondido |
| 3116 | Morton's The Steakhouse - Denver | Steakhouse | Denver |
| 110410 | MAX'S RESTAURANT (Cuisine of the Philippines) | Filipino | Jersey City |
| 7639 | Corner Wine Bar | Continental | Indianapolis |
| 10045 | Steak House No. 316 | American | Aspen |
| 6269 | Sullivan's Steakhouse - Raleigh | Steakhouse | Raleigh |
| 109162 | The Bistro on Park Avenue | American | Winter Park |
| 112996 | Voila French Bistro | French | Scottsdale |
| 2654 | Uncle Jack's Steakhouse - Westside 9th Avenue | Steak | New York |
| 74950 | Paravicinis Italian Bistro | Italian | Colorado Springs |
| 50608 | Andrew's Steak and Seafood | Steakhouse | Pittsburgh |
| 69133 | Mausam Indian Cuisine - Secaucus | Indian | Secaucus |
| 1590 | Sushi Neko | Japanese | Oklahoma City |
| 96967 | Ruth's Chris Steak House - Harrah's Las Vegas | Steakhouse | Las Vegas |
| 60868 | RingSide Steakhouse - Eastside | Contemporary American | Portland |
| 29239 | Parallax Restaurant & Lounge | Global, International | Cleveland |
| 23998 | Ruth's Chris Steak House - North Raleigh | Steakhouse | Raleigh |
| 6508 | Ruth's Chris Steak House - Wailea | Steakhouse | Wailea |
| 34510 | Jaxx Steakhouse | Steak | Addison |
| 72328 | 51Fifteen Restaurant & Lounge | International | Houston |
| 98413 | Salsa Puerto Rican and Latin Cuisine | Puerto Rican | Nashville |
| 110920 | RA Sushi Bar Restaurant - Leawood | Japanese | Leawood |
| 1860 | Sushi Lounge | Sushi | Hoboken |
| 56698 | Greek Taverna - Montclair | Greek | Montclair |
| 40051 | Fleming's Steakhouse - Tucson | Steak | Tucson |
| 44860 | Bencotto Italian Kitchen | Italian | San Diego |
| 147844 | Landry's Seafood House - Denver | Seafood | Englewood |
| 14668 | Sullivan's Steakhouse - Omaha | American | Omaha |
| 112051 | Arthur's Bistro | Contemporary American | Ocala |
| 3508 | Ruth's Chris Steak House - San Diego | Steakhouse | San Diego |
| 65962 | Sushi Shiono | Japanese | Kailua-Kona |
| 13135 | Mahogany Prime Omaha | Steak | Omaha |
| 64999 | Vito's Pizza and Italian Ristorante | Italian | Mesa |
| 5507 | Ruth's Chris Steak House - Pittsburgh | Steakhouse | Pittsburgh |
| 109198 | River City Seafood and Grill | Seafood | San Antonio |
| 24745 | Jack's Steak House | American | Orlando |
| 32071 | Wild Sage @ The Rusty Parrot Lodge | American | Jackson Hole |
| 2855 | Rio Rodizio & Sushi - Union | Brazilian Steakhouse | Union |
| 105580 | Mausam Indian Restaurant - Montclair | Indian | Montclair |
| 116170 | Sansei Seafood Restaurant & Sushi Bar - WAIKOLOA, Hawaii | Contemporary Asian | Waikoloa |
| 85498 | Hemisphere Steak and Seafood | Steakhouse | Orlando |
| 30757 | Pastiche Modern Eatery | American | Tucson |
| 18394 | Morels Steakhouse & Bistro - Las Vegas | Steakhouse | Las Vegas |
| 94243 | Fresco - Hilton Hawaiian Village | Italian | Honolulu |
| 92449 | Katz 21 Steak and Spirits | Steakhouse | Corpus Christi |
| 3709 | Alexander's Steakhouse - Cupertino | Steakhouse | Cupertino |
| 141184 | Marks Bistro | European | Omaha |
| 106864 | Venable Rotisserie Bistro | Contemporary American | Carrboro |
| 13990 | McCormick & Schmick's Seafood - Pittsburgh Downtown | Seafood | Pittsburgh |
| 55237 | Bistro 109 | Fusion / Eclectic | Sevierville |
| 152671 | Galatoire's Bistro - Baton Rouge | French | Baton Rouge |
| 96478 | Auden Bistro & Bar | American | New York |
| 19546 | Twenty/20 Grill & Wine Bar - Sheraton Carlsbad Resort & Spa | Californian | Carlsbad |
| 2409 | City Lobster & Steakhouse | Seafood | New York |
| 41182 | Rock Bottom Brewery - La Jolla | Brewery | La Jolla |
| 57673 | Nosh Restaurant and Wine Lounge | Contemporary American | Omaha |
| 113335 | South End | European | Venice |
| 5084 | NAAN Sushi | Sushi | Plano |
| 139135 | Krazy Greek Kitchen | Greek | Lake Mary |
| 51331 | Persian Room | Persian | Scottsdale |
| 59689 | Leroy's Kitchen + Lounge | Contemporary American | Coronado |
| 95206 | Lazaranda Modern Kitchen & Tequila | Mexican | Dallas |
| 88492 | Der Fondue Chessel | Fondue | Keystone |
| 109696 | Siena Tuscan Steakhouse - Ambassador Hotel | Steakhouse | Wichita |
| 40141 | Pacific'O | Hawaii Regional Cuisine | Lahaina |
| 84259 | Portland Seafood Co. - Mall 205 | Seafood | Portland |
| 58063 | Saltrock Southwest Kitchen | Southwest | Sedona |
| 88459 | Bighorn Bistro and Bar | American | Keystone |
| 80281 | Dean's Seafood Grill & Bar | Seafood | Cary |
| 101491 | Charley's Steak House and Seafood Grille - Kissimmee, FL | Steakhouse | Kissimmee |
| 149611 | Parkside Seafood House - Oyster Bar | Seafood | Lafayette |
| 54622 | Lallisse Mediterranean Wine & Food | Mediterranean | New York |
| 59272 | Grappa Bistro | Mediterranean | Golden |
| 42904 | Chef Fredy's Table formerly Tim Shafer's Cuisine | American | Morristown |
| 86437 | Fratelli's Italian Kitchen - Oceanside | Italian | Oceanside |
| 152992 | Bistro Barbes | Contemporary French / American | Denver |
| 39055 | Encore Restaurant - Steak, Seafood, Sushi | Contemporary American | Buffalo |
| 5087 | Bob's Steak & Chop House - San Francisco | Steakhouse | San Francisco |
| 1578 | George's California Modern | Californian | La Jolla |
| 12364 | The Top Steak House | Steakhouse | Columbus |
| 39919 | Fleming's Steakhouse - DC Ranch | Steak | Scottsdale |
| 11788 | Silo Elevated Cuisine - 1604 | American | San Antonio |
| 107518 | Tuscan Bistro Bar | Italian | Toms River |
| 151918 | Jefe Mexican Restaurant | Mexican | Lake Oswego |
| 7231 | Bistro Lancaster @The Lancaster Hotel | American | Houston |
| 77779 | Pampas Argentinas Steakhouse & Restaurant | Argentinean | Forest Hills |
| 44851 | Jack & Giulio's Italian Restaurant | Italian | San Diego |
| 107638 | Skye Bistro | American | Mentor |
| 8080 | Ceci Italian Restaurant | Italian | New York |
| 40612 | Bogota Latin Bistro | Latin American | Brooklyn |
| 53602 | Pars Cuisine | Persian | Albuquerque |
| 60085 | Ciao! 2 An Italian Cafe | Italian | Pittsburgh |
| 4492 | South Fin Grill | Seafood | Staten Island |
| 68098 | Novita Bistro & Lounge | Italian | Metuchen |
| 61477 | Honu Seafood and Pizza - Lahaina | Seafood | Lahaina |
| 25696 | Gaido's Seafood Restaurant | Seafood | Galveston |
| 117370 | The Capital: American Eatery & Lounge | American | Albany |
| 118705 | Rive Bistro | French | Westport |
| 925 | Wine Spectator Greystone Restaurant at The Culinary Institute of America | Californian | St. Helena |
| 6789 | McCormick & Schmick's Seafood - Indianapolis | Seafood | Indianapolis |
| 90364 | Wai’olu Ocean View Lounge | Tapas / Small Plates | Honolulu |
| 56101 | Soigne Restaurant & Wine Bar | Contemporary American | Brooklyn |
| 144589 | Vines Wine Bar | Wine Bar | Parker |
| 27409 | Prime Steakhouse | Steakhouse | Key West |
| 104884 | Zenith Steakhouse | Steakhouse | Flagstaff |
| 21349 | Ruth's Chris Steak House - New Orleans | Steakhouse | New Orleans |
| 10363 | Wine Cellar Restaurant | Contemporary American | Los Gatos |
| 33070 | 48 Lounge | Tapas / Small Plates | New York |
| 30019 | Bistro Jeanty | French | Yountville |
| 3109 | Morton's The Steakhouse - Nashville | Steakhouse | Nashville |
| 59521 | Patria Restaurant and Mixology Lounge | Latin / Spanish | Rahway |
| 69022 | Darfons Restaurant and Lounge | American | Nashville |
| 92116 | Central Bistro | Contemporary Italian | Phoenix |
| 51286 | Mama Louisa's Italian Restaurant | Italian | Tucson |
| 97600 | Karizma Hookah Lounge | Middle Eastern | New York |
| 11557 | Bohanan's Prime Steaks and Seafood | Steakhouse | San Antonio |
| 97408 | Costa Brava Bistro | Spanish | Bellaire |
| 51148 | Bistro La Source | French | Jersey City |
| 111406 | Theresa’s South | Contemporary Italian | Bay Head |
| 19624 | Ruth's Chris Steak House - Mobile | Steakhouse | Mobile |
| 104002 | Banzai Sushi | Japanese | Denver |
| 74194 | La Brasserie Bistro and Bar | French | La Quinta |
| 41413 | Feng Asian Bistro and Hibachi | Pan-Asian | Canton |
| 140923 | Driftwood Southern Kitchen | Southern | Raleigh |
| 144949 | Rafain Brazilian Steakhouse | Brazilian Steakhouse | Fort Worth |
| 144241 | Southern Rail | Southern | Phoenix |
| 74749 | Sushi Sasabune Hawaii | Sushi | Honolulu |
| 110827 | RA Sushi Bar Restaurant - Mesa | Japanese | Mesa |
| 44014 | Le Provencal Bistro | Contemporary French / American | Mamaroneck |
| 59692 | Lavender Bistro | Californian | La Quinta |
| 7733 | Morton's The Steakhouse - San Jose | Steakhouse | San Jose |
| 37138 | Genji Japanese Steakhouse - Reynoldsburg | Japanese | Reynoldsburg |
| 20605 | Sushi Zushi - Lincoln Heights | Sushi | San Antonio |
| 24916 | Simply Fondue - Ft Worth | Fondue | Ft. Worth |
| 146227 | Charley G's Seafood Grill | American | LaFayette |
| 85483 | Zutto Japanese American Pub | Japanese | New York |
| 20602 | Sushi Zushi - Colonnade | Sushi | San Antonio |
| 109006 | Sushi Yuzu - Ko'olina | Japanese | Kapolei |
| 51238 | Ragazzi Italian Kitchen & Bar | Italian | Nesconset |
| 36415 | Kauai Grill - St. Regis - Hawaii | Contemporary American | Princeville |
| 108670 | Volcano Asian Cuisine | Hibachi | Centennial |
| 18169 | Wildfish Seafood Grille - San Antonio | Seafood | San Antonio |
| 103969 | The Wine Bistro - Clintonville | American | Columbus |
| 39922 | Fleming's Steakhouse - Denver | Steak | Denver |
| 141139 | Basin Seafood and Spirits | Seafood | New Orleans |
| 71968 | Game Creek Restaurant | Contemporary American | Vail |
| 148204 | Minas Brazilian Restaurant | Brazilian | San Francisco |
| 38704 | Dante Ristorante Pizzeria | Italian | Omaha |
| 35584 | Rio Ranch Steakhouse | Steakhouse | Houston |
| 105217 | South at SF Jazz | Mexican | San Francisco |
| 71629 | Wild Salsa | Mexican | Dallas |
| 111232 | The Wine Guy Bistro-Gahanna | Contemporary American | Gahanna |
| 99916 | Fujiyama Steak House of Japan | Sushi | Indianapolis |
| 46354 | Chez Pierre Bistro | French | Palm Desert |
| 139840 | Lucy Ethiopian Restaurant & Lounge | Ethiopian | Houston |
| 7296 | Oceanaire Seafood Room - Houston | Seafood | Houston |
| 41170 | Rock Bottom Brewery - Indianapolis | American | Indianapolis |
| 14320 | Blu Seafood and Bar | Seafood | Durham |
| 50821 | Kenny's Italian Kitchen | Italian | Dallas |
| 22084 | Jake's Steakhouse | Contemporary American | Bronx |
| 53098 | Lola's Mexican Kitchen - Stamford | Mexican | Stamford |
| 44623 | Seven's Mediterranean Turkish Grill | Turkish | New York |

---

# B. Cuisine taxonomy

Delivered as `scripts/cuisine-taxonomy.json`. This section is the review record for it.

## B1. Coverage

- Distinct `food_type` values in the source: **114**. Entries in the mapping: **114**. Uncovered: **0**. Orphan entries: **0**.
- Records assigned a primary cuisine: **5000 / 5000**.
- Primary cuisines produced: **37**. Distinct tags: **102**.
- Mapping entries carrying a hand-review note: **52 of 114**.

## B2. Rules applied

- One primary `cuisine` per record, always non-null. It is the first-level facet.
- `cuisine_tags` is the second level. Every distinction lost by collapsing a raw value into a broader primary is preserved as a tag, so nothing becomes unsearchable. Tags are additive and may repeat across primaries.
- A raw value is folded into a broader primary when it is (a) a strict sub-variety of it (Sicilian -> Italian, South Indian -> Indian, Dim Sum -> Chinese), (b) a preparation or format rather than an origin (Tapas, Pizzeria, Hibachi, Bistro), or (c) a venue or dietary label carrying no origin at all (Wine Bar, Brewery, Kosher, Vegan).
- A raw value keeps its own primary when a diner would plausibly pick it from a facet list and it is not a sub-variety of another primary in this file.
- Assignments for values with 5 or fewer records were made by reading the actual restaurant names, not by inferring from the label. Where that reading contradicted the obvious guess, a `note` records it.

## B3. Complete mapping — all 114 values

Ordered by source record count.

| # | raw food_type | records | → cuisine | cuisine_tags |
|---|---|---|---|---|
| 1 | American | 865 | **American** | Traditional |
| 2 | Italian | 850 | **Italian** | Traditional |
| 3 | Contemporary American | 649 | **American** | Contemporary |
| 4 | Steakhouse | 328 | **Steakhouse** | Steakhouse |
| 5 | Seafood | 267 | **Seafood** | Seafood |
| 6 | French | 167 | **French** | — |
| 7 | Japanese | 140 | **Japanese** | — |
| 8 | Steak | 123 | **Steakhouse** | Steakhouse |
| 9 | Californian | 96 | **American** | Californian, Contemporary, Farm to Table |
| 10 | Mexican | 90 | **Mexican** | — |
| 11 | Mediterranean | 85 | **Mediterranean** | — |
| 12 | Sushi | 67 | **Japanese** | Sushi |
| 13 | Indian | 65 | **Indian** | — |
| 14 | Asian | 61 | **Asian** | — |
| 15 | Gastro Pub | 51 | **American** | Gastropub, Pub |
| 16 | Global, International | 43 | **International** | Global |
| 17 | Tapas / Small Plates | 42 | **Spanish** | Tapas, Small Plates |
| 18 | Spanish | 42 | **Spanish** | — |
| 19 | Greek | 42 | **Greek** | Mediterranean |
| 20 | Southern | 41 | **Southern** | Southern |
| 21 | Comfort Food | 40 | **American** | Comfort Food |
| 22 | Northwest | 37 | **American** | Pacific Northwest, Farm to Table |
| 23 | Mexican / Southwestern | 36 | **Mexican** | Southwestern |
| 24 | Brazilian Steakhouse | 33 | **Steakhouse** | Churrascaria, Brazilian, Latin American, Steakhouse |
| 25 | Latin American | 33 | **Latin American** | — |
| 26 | Continental | 32 | **European** | Continental |
| 27 | Fondue | 30 | **Fondue** | Swiss, Alpine |
| 28 | Fusion / Eclectic | 30 | **International** | Fusion, Eclectic |
| 29 | Hawaii Regional Cuisine | 30 | **Hawaiian** | Hawaii Regional, Pacific Rim |
| 30 | Southwest | 29 | **Southwestern** | Southwestern |
| 31 | International | 25 | **International** | — |
| 32 | Creole / Cajun / Southern | 25 | **Cajun & Creole** | Creole, Cajun, Southern |
| 33 | Thai | 25 | **Thai** | — |
| 34 | Barbecue | 24 | **Barbecue** | Southern |
| 35 | Chinese | 22 | **Chinese** | — |
| 36 | Contemporary French | 22 | **French** | Contemporary |
| 37 | Pizzeria | 20 | **Italian** | Pizza, Pizzeria |
| 38 | Contemporary Italian | 19 | **Italian** | Contemporary |
| 39 | European | 18 | **European** | — |
| 40 | Contemporary French / American | 17 | **French** | Contemporary, American, French American |
| 41 | Organic | 16 | **American** | Organic, Farm to Table |
| 42 | Creole | 16 | **Cajun & Creole** | Creole |
| 43 | French American | 15 | **French** | American, French American |
| 44 | Contemporary European | 14 | **European** | Contemporary |
| 45 | Turkish | 14 | **Turkish** | Mediterranean |
| 46 | Contemporary Southern | 13 | **Southern** | Southern, Contemporary |
| 47 | Pan-Asian | 13 | **Asian** | Pan-Asian |
| 48 | Latin / Spanish | 13 | **Latin American** | Spanish |
| 49 | Modern European | 11 | **European** | Contemporary, Modern European |
| 50 | Irish | 10 | **Irish** | European, Pub |
| 51 | Hawaiian | 10 | **Hawaiian** | Pacific Rim |
| 52 | Peruvian | 9 | **Peruvian** | South American, Latin American |
| 53 | Caribbean | 9 | **Caribbean** | Latin American |
| 54 | German | 8 | **German** | European |
| 55 | Korean | 8 | **Korean** | — |
| 56 | Portuguese | 8 | **Portuguese** | European, Mediterranean |
| 57 | Belgian | 7 | **Belgian** | European |
| 58 | Contemporary Asian | 7 | **Asian** | Contemporary, Pan-Asian |
| 59 | Cuban | 7 | **Cuban** | Caribbean, Latin American |
| 60 | Cajun | 6 | **Cajun & Creole** | Cajun |
| 61 | Contemporary Mexican | 5 | **Mexican** | Contemporary |
| 62 | Tex-Mex | 5 | **Mexican** | Tex-Mex, Southwestern |
| 63 | Argentinean | 5 | **Latin American** | Argentinean, Steakhouse, Parrilla, South American |
| 64 | Persian | 5 | **Middle Eastern** | Persian, Iranian |
| 65 | Brazilian | 5 | **Brazilian** | South American, Latin American |
| 66 | Provencal | 4 | **French** | Provencal, Regional French, Mediterranean |
| 67 | Wine Bar | 4 | **Bar & Lounge** | Wine Bar |
| 68 | Afternoon Tea | 4 | **British** | Afternoon Tea, Tea Room |
| 69 | Burgers | 4 | **American** | Burgers |
| 70 | Bistro | 4 | **French** | Bistro |
| 71 | Bar / Lounge / Bottle Service | 4 | **Bar & Lounge** | Bar, Lounge |
| 72 | Middle Eastern | 3 | **Middle Eastern** | — |
| 73 | Brewery | 3 | **Bar & Lounge** | Brewery, Beer |
| 74 | Moroccan | 3 | **African** | Moroccan, North African, Mediterranean |
| 75 | South American | 3 | **Latin American** | South American |
| 76 | Swiss | 3 | **European** | Swiss, Alpine |
| 77 | Kosher | 3 | **International** | Kosher |
| 78 | Contemporary Indian | 3 | **Indian** | Contemporary |
| 79 | Puerto Rican | 3 | **Caribbean** | Puerto Rican, Latin American |
| 80 | Southeast Asian | 3 | **Asian** | Southeast Asian |
| 81 | Scandinavian | 2 | **European** | Scandinavian, Nordic |
| 82 | South African | 2 | **African** | South African |
| 83 | Ethiopian | 2 | **African** | Ethiopian, East African |
| 84 | Prime Rib | 2 | **Steakhouse** | Steakhouse, Prime Rib |
| 85 | Filipino | 2 | **Asian** | Filipino, Southeast Asian |
| 86 | Breakfast | 2 | **American** | Breakfast, Brunch |
| 87 | Vietnamese | 2 | **Asian** | Vietnamese, Southeast Asian |
| 88 | British | 2 | **British** | European |
| 89 | Lebanese | 2 | **Middle Eastern** | Lebanese |
| 90 | Russian | 2 | **European** | Russian, Eastern European |
| 91 | English | 2 | **British** | English, European |
| 92 | Afghan | 2 | **Middle Eastern** | Afghan, Central Asian |
| 93 | Basque | 2 | **Spanish** | Basque, Regional Spanish |
| 94 | African | 2 | **African** | — |
| 95 | Dim Sum | 2 | **Chinese** | Dim Sum, Cantonese |
| 96 | Hibachi | 1 | **Japanese** | Hibachi, Teppanyaki |
| 97 | Low Country | 1 | **Southern** | Low Country, Southern |
| 98 | Pacific Rim | 1 | **Hawaiian** | Pacific Rim, Fusion |
| 99 | Australian | 1 | **International** | Australian |
| 100 | Eurasian | 1 | **Hawaiian** | Pacific Rim, Fusion, Eurasian |
| 101 | Traditional Mexican | 1 | **Mexican** | Traditional |
| 102 | Vegan | 1 | **American** | Vegan, Vegetarian, Plant Based |
| 103 | Sicilian | 1 | **Italian** | Sicilian, Regional Italian |
| 104 | Modern Australian | 1 | **International** | Australian, Contemporary |
| 105 | Eastern European | 1 | **European** | Eastern European, Ukrainian |
| 106 | Regional Mexican | 1 | **Mexican** | Regional Mexican |
| 107 | Beer Garden | 1 | **Bar & Lounge** | Beer Garden, Beer |
| 108 | Austrian | 1 | **European** | Austrian, Alpine |
| 109 | Syrian | 1 | **Middle Eastern** | Syrian |
| 110 | Vegetarian | 1 | **American** | Vegetarian |
| 111 | South Indian | 1 | **Indian** | South Indian, Regional Indian |
| 112 | Wild Game | 1 | **American** | Wild Game |
| 113 | Polynesian | 1 | **Hawaiian** | Polynesian, Pacific Rim, Tiki |
| 114 | Burmese | 1 | **Asian** | Burmese, Southeast Asian |

## B4. Resulting primary cuisine distribution

| # | cuisine | records | share |
|---|---|---|---|
| 1 | American | 1763 | 35.3% |
| 2 | Italian | 890 | 17.8% |
| 3 | Steakhouse | 486 | 9.7% |
| 4 | Seafood | 267 | 5.3% |
| 5 | French | 229 | 4.6% |
| 6 | Japanese | 208 | 4.2% |
| 7 | Mexican | 138 | 2.8% |
| 8 | International | 103 | 2.1% |
| 9 | Asian | 89 | 1.8% |
| 10 | Spanish | 86 | 1.7% |
| 11 | Mediterranean | 85 | 1.7% |
| 12 | European | 84 | 1.7% |
| 13 | Indian | 69 | 1.4% |
| 14 | Southern | 55 | 1.1% |
| 15 | Latin American | 54 | 1.1% |
| 16 | Cajun & Creole | 47 | 0.9% |
| 17 | Hawaiian | 43 | 0.9% |
| 18 | Greek | 42 | 0.8% |
| 19 | Fondue | 30 | 0.6% |
| 20 | Southwestern | 29 | 0.6% |
| 21 | Thai | 25 | 0.5% |
| 22 | Barbecue | 24 | 0.5% |
| 23 | Chinese | 24 | 0.5% |
| 24 | Turkish | 14 | 0.3% |
| 25 | Middle Eastern | 13 | 0.3% |
| 26 | Bar & Lounge | 12 | 0.2% |
| 27 | Caribbean | 12 | 0.2% |
| 28 | Irish | 10 | 0.2% |
| 29 | African | 9 | 0.2% |
| 30 | Peruvian | 9 | 0.2% |
| 31 | British | 8 | 0.2% |
| 32 | German | 8 | 0.2% |
| 33 | Korean | 8 | 0.2% |
| 34 | Portuguese | 8 | 0.2% |
| 35 | Belgian | 7 | 0.1% |
| 36 | Cuban | 7 | 0.1% |
| 37 | Brazilian | 5 | 0.1% |

## B5. Tag distribution

| tag | records |
|---|---|
| Traditional | 1716 |
| Contemporary | 857 |
| Steakhouse | 491 |
| Seafood | 267 |
| Farm to Table | 149 |
| Southern | 104 |
| Californian | 96 |
| Mediterranean | 71 |
| Southwestern | 70 |
| Sushi | 67 |
| Latin American | 66 |
| Pub | 61 |
| Gastropub | 51 |
| Global | 43 |
| Pacific Rim | 43 |
| Tapas | 42 |
| Small Plates | 42 |
| Creole | 41 |
| Comfort Food | 40 |
| European | 37 |
| Pacific Northwest | 37 |
| Alpine | 34 |
| Churrascaria | 33 |
| Brazilian | 33 |
| Swiss | 33 |
| American | 32 |
| French American | 32 |
| Continental | 32 |
| Fusion | 32 |
| Cajun | 31 |
| Eclectic | 30 |
| Hawaii Regional | 30 |
| South American | 22 |
| Pizza | 20 |
| Pizzeria | 20 |
| Pan-Asian | 20 |
| Organic | 16 |
| Spanish | 13 |
| Modern European | 11 |
| Southeast Asian | 8 |
| Caribbean | 7 |
| Tex-Mex | 5 |
| Argentinean | 5 |
| Parrilla | 5 |
| Persian | 5 |
| Iranian | 5 |
| Provencal | 4 |
| Regional French | 4 |
| Beer | 4 |
| Wine Bar | 4 |
| Afternoon Tea | 4 |
| Tea Room | 4 |
| Burgers | 4 |
| Bistro | 4 |
| Bar | 4 |
| Lounge | 4 |
| Brewery | 3 |
| Moroccan | 3 |
| North African | 3 |
| Kosher | 3 |
| Puerto Rican | 3 |
| Eastern European | 3 |
| Scandinavian | 2 |
| Nordic | 2 |
| Australian | 2 |
| South African | 2 |
| Ethiopian | 2 |
| East African | 2 |
| Prime Rib | 2 |
| Vegetarian | 2 |
| Filipino | 2 |
| Breakfast | 2 |
| Brunch | 2 |
| Vietnamese | 2 |
| Lebanese | 2 |
| Russian | 2 |
| English | 2 |
| Afghan | 2 |
| Central Asian | 2 |
| Basque | 2 |
| Regional Spanish | 2 |
| Dim Sum | 2 |
| Cantonese | 2 |
| Hibachi | 1 |
| Teppanyaki | 1 |
| Low Country | 1 |
| Eurasian | 1 |
| Vegan | 1 |
| Plant Based | 1 |
| Sicilian | 1 |
| Regional Italian | 1 |
| Ukrainian | 1 |
| Regional Mexican | 1 |
| Beer Garden | 1 |
| Austrian | 1 |
| Syrian | 1 |
| South Indian | 1 |
| Regional Indian | 1 |
| Wild Game | 1 |
| Polynesian | 1 |
| Tiki | 1 |
| Burmese | 1 |

## B6. Second-level refinement inside the largest primaries

The `American` merge is the main design decision: it absorbs the competing American buckets
reported in CLAUDE.md section 3 into one predictable first-level facet, and relies on
`cuisine_tags` as the second level. Below is what that second level actually yields — the
numbers that decide whether the merge is defensible.

**American** — 1763 records

| tag | records | share of primary |
|---|---|---|
| Traditional | 865 | 49% |
| Contemporary | 745 | 42% |
| Farm to Table | 149 | 8% |
| Californian | 96 | 5% |
| Gastropub | 51 | 3% |
| Pub | 51 | 3% |
| Comfort Food | 40 | 2% |
| Pacific Northwest | 37 | 2% |
| Organic | 16 | 1% |
| Burgers | 4 | 0% |
| Vegetarian | 2 | 0% |
| Breakfast | 2 | 0% |
| Brunch | 2 | 0% |
| Vegan | 1 | 0% |
| Plant Based | 1 | 0% |
| Wild Game | 1 | 0% |
| *(no tag)* | 0 | 0% |

**Italian** — 890 records

| tag | records | share of primary |
|---|---|---|
| Traditional | 850 | 96% |
| Pizza | 20 | 2% |
| Pizzeria | 20 | 2% |
| Contemporary | 19 | 2% |
| Sicilian | 1 | 0% |
| Regional Italian | 1 | 0% |
| *(no tag)* | 0 | 0% |

**Steakhouse** — 486 records

| tag | records | share of primary |
|---|---|---|
| Steakhouse | 486 | 100% |
| Churrascaria | 33 | 7% |
| Brazilian | 33 | 7% |
| Latin American | 33 | 7% |
| Prime Rib | 2 | 0% |
| *(no tag)* | 0 | 0% |

**Seafood** — 267 records

| tag | records | share of primary |
|---|---|---|
| Seafood | 267 | 100% |
| *(no tag)* | 0 | 0% |

**French** — 229 records

| tag | records | share of primary |
|---|---|---|
| Contemporary | 39 | 17% |
| American | 32 | 14% |
| French American | 32 | 14% |
| Provencal | 4 | 2% |
| Regional French | 4 | 2% |
| Mediterranean | 4 | 2% |
| Bistro | 4 | 2% |
| *(no tag)* | 167 | 73% |

**Japanese** — 208 records

| tag | records | share of primary |
|---|---|---|
| Sushi | 67 | 32% |
| Hibachi | 1 | 0% |
| Teppanyaki | 1 | 0% |
| *(no tag)* | 140 | 67% |

## B7. Assignments the hand review changed

Every mapping entry with a `note` in the JSON is reproduced here, because these are the calls
a reviewer needs to check. Assignments for values with 5 or fewer records were made by reading
the actual restaurant names rather than inferring from the label.

| raw food_type | records | → cuisine | note |
|---|---|---|---|
| American | 865 | American | `Traditional` is added so the second-level refinement inside American partitions cleanly against `Contemporary` (865 vs 745) instead of leaving half the bucket reachable only by default. The distinction is present in the source data — this labels the non-contemporary side, it does not invent it. |
| Wild Game | 1 | American | 92713 The Lion's Share, San Diego — American game menu. |
| Vegan | 1 | American | 76453 Axe, Venice — Californian vegan. Dietary, not an origin; see known_compromises. |
| Vegetarian | 1 | American | 68152 Natural Selection, Portland. Dietary, not an origin. |
| Low Country | 1 | Southern | 103636 Restaurant Fourteen Seventy Two, Denver — Low Country menu outside the Carolinas. |
| Steak | 123 | Steakhouse | Merged with Steakhouse per CLAUDE.md section 3 — 123 vs 328 records competing for one intent. |
| Prime Rib | 2 | Steakhouse | 10996 Lawry's The Prime Rib, 107593 Bully's East — both steakhouses. |
| Brazilian Steakhouse | 33 | Steakhouse | Arguable. Primary follows the dining format and price point, which is what drives the booking; `Brazilian` is kept as a tag so an origin-led query still reaches these 33 records. The alternative — primary Brazilian, tag Steakhouse — is equally defensible. |
| Italian | 850 | Italian | Same reasoning as the raw `American` value: partitions Italian against `Contemporary` (850 vs 19) rather than leaving 96% of the bucket untagged. |
| Sicilian | 1 | Italian | 144973 Strano! Sicilian Kitchen & Bar, Memphis. |
| Pizzeria | 20 | Italian | Format, not an origin. `Pizza` as a tag keeps the intent searchable without a 20-record primary. |
| Provencal | 4 | French | 3981 Mateo, 95263 Ba, 4948 L'Escale, 33067 Le Gigot — all French. |
| Bistro | 4 | French | 5014 Mockingbird Bistro, 10105 7 on Fulton, 72718 Acme, 138955 Carefree Bistro — French-leaning bistros. 100624 is a separate problem: a restaurant literally named `Bistro`, see the name/cuisine collisions in the analysis. |
| Hibachi | 1 | Japanese | 108670 Volcano Asian Cuisine, Centennial. |
| Dim Sum | 2 | Chinese | 149527 / 149530 Yank Sing, both San Francisco — same brand, two sites. |
| Southeast Asian | 3 | Asian | 103108 Pig and Khao (Filipino), 110548 Khe-Yo (Laotian), 55810 Shiok Singapore Kitchen — genuinely pan-regional, so the umbrella is accurate here. |
| Vietnamese | 2 | Asian | 22558 Indochine, 2527 Three Seasons. Folded for facet size; the tag keeps `vietnamese` searchable. |
| Filipino | 2 | Asian | 146230 Milkfish, 110410 MAX'S RESTAURANT (Cuisine of the Philippines). |
| Burmese | 1 | Asian | 150346 Burma Ruby, Palo Alto. |
| South Indian | 1 | Indian | 81913 Cholanad, Chapel Hill. |
| Traditional Mexican | 1 | Mexican | 103513 La Casa del Caballo, Bellaire. |
| Regional Mexican | 1 | Mexican | 112546 Casa Mezcal, Lower East Side. |
| Tex-Mex | 5 | Mexican | All 5 records are Cyclone Anaya's, the five-site Houston cluster (145369, 145366, 151276, 145375, 145381). |
| Tapas / Small Plates | 42 | Spanish | Format rather than origin. Assigning Spanish is right for the majority but will mislabel any non-Spanish small-plates restaurant in these 42 records; the tags are what a query should match. |
| Basque | 2 | Spanish | 113746 Txikito (Chelsea) is Spanish Basque; 150715 Eleven (Ashland) is one half of the Eleven / ELEVEN duplicate-name pair. |
| South American | 3 | Latin American | 141961 Sal y Pimienta, 107464 Palo Santo, 110077 La Brasa Peruvian Kitchen. |
| Argentinean | 5 | Latin American | 77779 Pampas Argentinas Steakhouse, 94117 Gaucho Grill, 76903 Estancia 460 — grill-led. Tagged Steakhouse so they surface alongside the format. |
| Brazilian | 5 | Brazilian | 152104 Botequim, 35521 Berimbau Do Brasil, 34525 SOB's, 98671 Green Forest, 148204 Minas — general Brazilian, not churrascarias. Kept separate from Brazilian Steakhouse on purpose. |
| Puerto Rican | 3 | Caribbean | 98413 Salsa Puerto Rican and Latin Cuisine, 82576 Sofrito-Midtown, 81022 Sazon. |
| Lebanese | 2 | Middle Eastern | 38155 Al Bustan, 118177 Au Za'atar. |
| Persian | 5 | Middle Eastern | 53602 Pars Cuisine, 88468 Marjan, 42829 Persepolis, 51331 Persian Room, 44683 Bandar. |
| Syrian | 1 | Middle Eastern | 148411 Naya, Pittsburgh — also one half of the Kaya / Naya same-city edit-distance-1 pair. |
| Afghan | 2 | Middle Eastern | 91891 Afghan Kebab House II, 100099 Afghanistan Khyber Pass. |
| South African | 2 | African | 139402 The Springbok, 34069 Peli Peli. |
| Ethiopian | 2 | African | 139840 Lucy Ethiopian, 41884 Mesob Ethiopian. |
| Moroccan | 3 | African | 124666 Kan Zaman, 70969 Babylon, 3174 Aziza. Babylon also collides with the Babylon neighborhood/city value. |
| Eastern European | 1 | European | 108904 Cafe Glechik, Sheepshead Bay — Ukrainian. |
| Austrian | 1 | European | 118699 Edi and The Wolf, East Village. |
| Swiss | 3 | European | 22045 Alpenrose at the Alpenhof Lodge, 60130 Mont Blanc, 74152 Cafe Select. |
| Scandinavian | 2 | European | 151336 Ragnars, 118390 Luksus. |
| Russian | 2 | European | 72853 Onegin, 55393 Russian Samovar. |
| English | 2 | British | 83164 Cock and Bull is a pub; 44854 Afternoon Tea - The Phoenician overlaps the Afternoon Tea value below, which is why both land on British. |
| Afternoon Tea | 4 | British | 3461 Brown Palace, 33664 Briarwood Inn, 80698 The Veranda at the Kahala, 96886 Lady Mendls — hotel tea service. Format, not an origin; British is the closest honest primary. |
| Australian | 1 | International | 109780 Bills Sydney, Waikiki. Folded for facet size; the tag keeps it searchable. |
| Modern Australian | 1 | International | 114505 Flinders Lane, East Village. |
| Kosher | 3 | International | 116239 SOHO Asian Bar & Grill, 118897 Chatanooga, 138925 Marani (Georgian) — three unrelated origins. Kosher is dietary, so no single cuisine is truthful; International is the least wrong. See known_compromises. |
| Pacific Rim | 1 | Hawaiian | 80689 Kai Market - Sheraton Waikiki. Reads as Asian from the label, but the record is a Waikiki hotel restaurant — Hawaiian is correct. |
| Eurasian | 1 | Hawaiian | 115966 Roy's Waikoloa Bar & Grill — Roy's is Hawaii fusion, not a Europe/Asia hybrid as the label suggests. |
| Polynesian | 1 | Hawaiian | 13282 Bali Hai, San Diego. |
| Fondue | 30 | Fondue | Dominated by The Melting Pot's 26 sites. Kept as its own primary because it is a distinct booking intent, not a regional cuisine. |
| Bar / Lounge / Bottle Service | 4 | Bar & Lounge | 150853 Comic Strip Live Comedy Club, 91990 Bathtub Gin, 45325 Wined Up Wine Bar, 34024 Two E Bar and Lounge — no origin information at all. |
| Beer Garden | 1 | Bar & Lounge | 83476 Pounds & Ounces, Chelsea. |

## B8. Known compromises

- `American` absorbs Contemporary American, Californian, Northwest, Comfort Food and Gastro Pub and so covers roughly a third of the corpus. That is deliberate: CLAUDE.md section 3 reports users cannot guess which of the competing American buckets a restaurant landed in, and a single predictable bucket refined by `cuisine_tags` beats four overlapping ones. It only works if the UI exposes cuisine_tags as a second-level refinement inside American.
- Dietary labels (Kosher, Vegan, Vegetarian) are modelled as tags on a best-effort cuisine. They deserve a dedicated `dietary` attribute, but 5 records cannot support a facet and food_type is the only signal available.
- `Bar & Lounge` is a venue primary, not a cuisine. The 12 records behind it carry no origin information whatsoever (one is a comedy club). Leaving them under a real cuisine would be a fabrication.

---

## Regenerating this document

Figures here were produced directly from `resources/dataset/` and
`scripts/cuisine-taxonomy.json`. `resources/` is source material and was never written to.
The analysis scripts were throwaway and are not committed; the transform pipeline in
`scripts/1-transform.js` is what will reproduce these numbers as `data/transform-report.md`.
