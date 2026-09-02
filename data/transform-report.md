# Transform report

- Records in: **5000** JSON, **5000** CSV rows.
- Join on `objectID`: **5000/5000** = **100.00%**, no orphans on either side.
- Records out: **5000**.
- Global mean `stars_count` (C): **4.294060**. Prior weight (m): **50**.

## Conflicts resolved

| defect | records | resolution |
|---|---|---|
| `phone` disagrees between files | **160** (3.2%) | CSV `phone_number` kept as source of truth, normalised to E.164. The JSON `phone` field carries a stray `x` suffix and sometimes a different number — a broken export, not a fresher value. |
| `price` int contradicts `price_range` | **220** (4.4%) | `price_range` wins: it is what the user sees and filters on. `price_tier` is derived from the label; the JSON int is not indexed. |
| `neighborhood` equals `city` | **2500** (50.0%) | `location_label` falls back to `city`. 6 match only case-insensitively and 6 records carry stray whitespace — a raw string comparison misses both. |
| `area` has no ` / ` separator | **2103** (42.1%) | `market` keeps the raw value as an opaque facet; `market_state` left null. Derived on the other 2897. |

<details><summary>All phone conflicts</summary>

| objectID | JSON `phone` (discarded) | CSV `phone_number` (kept) | indexed |
|---|---|---|---|
| 22981 | `7134181000x` | `(713) 418-1104` | `+17134181104` |
| 133981 | `9515871465x` | `(844) 873-8315` | `+18448738315` |
| 88048 | `317-421-8282x` | `(317) 421-8280` | `+13174218280` |
| 144757 | `7078753513x27` | `(707) 875-3513 e` | `+17078753513` |
| 94183 | `5166636395` | `(516) 746-0011 e` | `+15167460011` |
| 78316 | `7189980002x` | `(718) 627-8325` | `+17186278325` |
| 4162 | `2125176400x0` | `(212) 517-6400 e` | `+12125176400` |
| 99373 | `7135772349x` | `(713) 577-6115` | `+17135776115` |
| 100042 | `7248996073` | `(724) 899-6050` | `+17248996050` |
| 19186 | `9515879463x7230` | `(951) 587-9463 e` | `+19515879463` |
| 41416 | `2124688889` | `(212) 468-8898` | `+12124688898` |
| 46987 | `9702475707x1` | `(970) 247-5707 e` | `+19702475707` |
| 96487 | `6144861114x1` | `(614) 486-1114 e` | `+16144861114` |
| 8090 | `5207426000x7020` | `(520) 742-6000 e` | `+15207426000` |
| 107134 | `4195029463x2` | `(419) 502-9463` | `+14195029463` |
| 96922 | `2122266400` | `(646) 929-6307` | `+16469296307` |
| 86719 | `7606020822` | `(760) 602-0800` | `+17606020800` |
| 21511 | `9145915888x0` | `(914) 591-5888 e` | `+19145915888` |
| 3846 | `6195579441x203` | `(619) 557-9441 e` | `+16195579441` |
| 11440 | `2284363000x3232` | `(228) 436-3000 e` | `+12284363000` |
| 99157 | `3055342700x` | `(786) 276-5339` | `+17862765339` |
| 113443 | `8088751234x4900` | `(808) 875-1234` | `+18088751234` |
| 39730 | `8326677797x` | `(832) 667-7794` | `+18326677794` |
| 50425 | `3033893343x` | `(303) 389-3050` | `+13033893050` |
| 7359 | `3054458066x2407` | `(305) 445-8066 e` | `+13054458066` |
| 139141 | `7187227395x` | `(347) 844-9284` | `+13478449284` |
| 35365 | `6029556600x2808` | `(602) 955-6600 e` | `+16029556600` |
| 90766 | `615-321-1300x3` | `(615) 321-1300 e` | `+16153211300` |
| 37582 | `4804889009x1105` | `(480) 488-9009 e` | `+14804889009` |
| 100033 | `4158244224x10` | `(415) 824-4224` | `+14158244224` |
| 71569 | `5616230068` | `(561) 623-0127` | `+15616230127` |
| 97024 | `7123963682` | `(712) 396-3806` | `+17123963806` |
| 57382 | `7324313220x105` | `(732) 431-3220 e` | `+17324313220` |
| 101353 | `3157937444` | `(315) 624-3663` | `+13156243663` |
| 146830 | `9253718200` | `(925) 371-8100` | `+19253718100` |
| 31156 | `718-565-4333x` | `(718) 595-8102` | `+17185958102` |
| 148963 | `3375817926` | `(337) 504-2346` | `+13375042346` |
| 18784 | `2129561288x2` | `(212) 956-1288 e` | `+12129561288` |
| 4096 | `4159281849x2` | `(415) 351-5561` | `+14153515561` |
| 12586 | `4067283100` | `(406) 542-4660` | `+14065424660` |
| 15910 | `4804441234x8640` | `(480) 444-1234 e` | `+14804441234` |
| 92383 | `2127503270x` | `(646) 600-0996` | `+16466000996` |
| 4311 | `6466137100x2` | `(646) 613-7100 e` | `+16466137100` |
| 71425 | `5182264719` | `(518) 226-4125` | `+15182264125` |
| 42466 | `7328721245x10` | `(732) 872-1245 e` | `+17328721245` |
| 139285 | `8444262766` | `(855) 442-3271` | `+18554423271` |
| 15796 | `5045535638` | `(504) 553-5555` | `+15045535555` |
| 94240 | `8089224911x` | `(808) 921-8621` | `+18089218621` |
| 86254 | `9162319947x0` | `(916) 231-9947 e` | `+19162319947` |
| 6607 | `6194353000` | `(619) 522-3150` | `+16195223150` |
| 64231 | `8663743386x8359` | `(866) 374-3386 e` | `+18663743386` |
| 23284 | `3035610234x2` | `(303) 561-0234 e` | `+13035610234` |
| 10252 | `3038311992x` | `(303) 831-1962` | `+13038311962` |
| 4643 | `9709206313` | `(970) 920-6330` | `+19709206330` |
| 18142 | `2123342112` | `(646) 895-9624` | `+16468959624` |
| 4816 | `8002524499x6` | `(800) 252-4499 e` | `+18002524499` |
| 97021 | `7607513100x336` | `(760) 751-3100 e` | `+17607513100` |
| 117067 | `8174052980x` | `(817) 225-4140` | `+18172254140` |
| 16033 | `6192379700x1` | `(619) 237-9700 e` | `+16192379700` |
| 118411 | `3035566824x` | `(720) 439-2890` | `+17204392890` |
| 140143 | `8176403322` | `(817) 640-4711` | `+18176404711` |
| 100900 | `(914) 457-2531x531` | `(914) 457-2531 e` | `+19144572531` |
| 6918 | `9015294188x` | `(901) 529-4000` | `+19015294000` |
| 82387 | `9732268889x1` | `(973) 226-8889 e` | `+19732268889` |
| 29155 | `7602947866x1700` | `(760) 294-7866 e` | `+17602947866` |
| 48592 | `5853947070x111` | `(585) 394-7070 e` | `+15853947070` |
| 847 | `6192200692` | `(619) 220-8405` | `+16192208405` |
| 54226 | `9198338898x0` | `(919) 833-8898 e` | `+19198338898` |
| 149350 | `7728823602x2` | `(772) 882-3602 e` | `+17728823602` |
| 78580 | `9707286800x` | `(970) 728-2525` | `+19707282525` |
| 69301 | `7322918444x1` | `(732) 291-8444 e` | `+17322918444` |
| 54631 | `9705479595x` | `(970) 547-9191` | `+19705479191` |
| 116473 | `6468376776x` | `(646) 837-6779` | `+16468376779` |
| 16165 | `7604481234x6999` | `(760) 448-1234 e` | `+17604481234` |
| 96748 | `4068303055x3` | `(406) 830-3055 e` | `+14068303055` |
| 110971 | `9738459800` | `(973) 595-5595` | `+19735955595` |
| 41782 | `5059828608` | `(505) 930-5325` | `+15059305325` |
| 5574 | `9522163764` | `(952) 929-3764` | `+19529293764` |
| 49960 | `8508470003` | `(850) 727-4183` | `+18507274183` |
| 52423 | `8589646537x` | `(855) 567-2400` | `+18555672400` |
| 113440 | `8088751234x4900` | `(808) 875-1234` | `+18088751234` |
| 151666 | `7325778200` | `(732) 577-5545` | `+17325775545` |
| 46813 | `7246910536x2` | `(724) 691-0536 e` | `+17246910536` |
| 145597 | `5046066280` | `(917) 388-2512` | `+19173882512` |
| 24451 | `4157758500x5` | `(415) 775-8500 e` | `+14157758500` |
| 49969 | `6269667735` | `(626) 653-0700` | `+16266530700` |
| 52594 | `8086673939` | `(808) 739-3939` | `+18087393939` |
| 28180 | `8586758550x` | `(844) 277-3708` | `+18442773708` |
| 2002 | `4056025575` | `(405) 602-5623` | `+14056025623` |
| 30565 | `5038025371x` | `(503) 802-5370` | `+15038025370` |
| 69937 | `8603616633x` | `(860) 361-6730` | `+18603616730` |
| 84925 | `3034402880x` | `(303) 440-2882` | `+13034402882` |
| 79 | `2127670555x1` | `(212) 767-0555 e` | `+12127670555` |
| 24202 | `2122554544x10` | `(212) 255-4544` | `+12122554544` |
| 68452 | `(702) 588-5656x` | `(702) 792-7800` | `+17027927800` |
| 31009 | `9199299466x2` | `(919) 929-9466 e` | `+19199299466` |
| 34507 | `6313245006x2` | `(631) 324-5006 e` | `+16313245006` |
| 149800 | `8778337829x3` | `(877) 833-7829 e` | `+18778337829` |
| 28132 | `2126080555x476` | `(212) 608-0555 e` | `+12126080555` |
| 109642 | `6232024946` | `(623) 444-4946` | `+16234444946` |
| 39526 | `6195528490` | `(619) 522-8490` | `+16195228490` |
| 6164 | `8503375108` | `(850) 837-7884` | `+18508377884` |
| 107422 | `5033381615` | `(505) 338-1615` | `+15053381615` |
| 34504 | `6316682660x` | `(631) 668-1771` | `+16316681771` |
| 43291 | `8584881725x316` | `(858) 488-1725 e` | `+18584881725` |
| 7792 | `8089494321x43` | `(808) 949-4321 e` | `+18089494321` |
| 152095 | `8458252359` | `(845) 553-9300` | `+18455539300` |
| 14431 | `9704764444x5675` | `(970) 476-4444 e` | `+19704764444` |
| 104701 | `6198198154x` | `(619) 221-8000` | `+16192218000` |
| 36286 | `8502312166x1` | `(850) 231-2166 e` | `+18502312166` |
| 139738 | `0000000000` | `(646) 682-9842` | `+16466829842` |
| 26608 | `9709254240x` | `(970) 544-7814` | `+19705447814` |
| 76453 | `3106649787` | `(310) 450-1009` | `+13104501009` |
| 148171 | `8605607757x330` | `(860) 560-7757` | `+18605607757` |
| 6824 | `9199182735x` | `(919) 918-2777` | `+19199182777` |
| 57805 | `3178606500` | `(317) 860-5800` | `+13178605800` |
| 92047 | `6158840171x3` | `(615) 884-0171 e` | `+16158840171` |
| 5307 | `6029556600x2556` | `(602) 955-6600 e` | `+16029556600` |
| 39703 | `2104043434` | `(210) 491-5840` | `+12104915840` |
| 78730 | `2127961500x` | `(347) 472-5660` | `+13474725660` |
| 32716 | `9089019500x1` | `(908) 901-9500 e` | `+19089019500` |
| 74362 | `7188328200` | `(718) 788-8070` | `+17187888070` |
| 39019 | `4805854848x7320` | `(480) 585-4848 e` | `+14805854848` |
| 3461 | `3032973111` | `(303) 312-5952` | `+13033125952` |
| 52276 | `8088827771x2` | `(808) 882-7771 e` | `+18088827771` |
| 72247 | `8083258000x8915` | `(808) 325-8000` | `+18083258000` |
| 47167 | `2018650473x` | `(201) 865-2766` | `+12018652766` |
| 61108 | `808-447-6538` | `(808) 293-6000` | `+18082936000` |
| 5261 | `5032202685x` | `(503) 944-1092` | `+15039441092` |
| 92089 | `2523559500` | `(252) 347-0309` | `+12523470309` |
| 71644 | `5205450577x1` | `(520) 545-0577 e` | `+15205450577` |
| 109186 | `4097441500` | `(409) 740-8605` | `+14097408605` |
| 28183 | `8586758555` | `(844) 255-1288` | `+18442551288` |
| 75229 | `8082301234x` | `(808) 669-6299` | `+18086696299` |
| 42196 | `7168426100x` | `(716) 842-1000` | `+17168421000` |
| 6919 | `9015295199x` | `(901) 529-4000` | `+19015294000` |
| 7564 | `9194474000x` | `(919) 447-4200` | `+19194474200` |
| 149521 | `8325624880x1610` | `(832) 562-4880 e` | `+18325624880` |
| 147883 | `7025382821x` | `(702) 722-2289` | `+17027222289` |
| 55732 | `9704795429` | `(970) 479-5535` | `+19704795535` |
| 50608 | `4122317777x3106` | `(412) 231-7777 e` | `+14122317777` |
| 68047 | `480-444-1234x8650` | `(480) 444-1234 e` | `+14804441234` |
| 87730 | `7026938865` | `(702) 730-3900` | `+17027303900` |
| 129250 | `3213213002x` | `(321) 329-3002` | `+13213293002` |
| 28153 | `9493762779` | `(844) 864-5758` | `+18448645758` |
| 49567 | `4057496798` | `(405) 749-2433` | `+14057492433` |
| 44110 | `5165019700x143` | `(516) 501-9700` | `+15165019700` |
| 58366 | `5185846511x5` | `(518) 584-6511 e` | `+15185846511` |
| 3443 | `5032289535x4` | `(503) 228-9535 e` | `+15032289535` |
| 90718 | `8089364911` | `(808) 930-4911` | `+18089304911` |
| 25696 | `4097629625x4` | `(409) 761-5500 e` | `+14097615500` |
| 925 | `7079671010x` | `(707) 967-2370` | `+17079672370` |
| 144853 | `4156386109x` | `(415) 872-5507` | `+14158725507` |
| 113437 | `8088751234x4900` | `(808) 875-1234` | `+18088751234` |
| 84004 | `5165420700x1` | `(516) 542-0700 e` | `+15165420700` |
| 65389 | `9738275996x3` | `(855) 853-0234` | `+18558530234` |
| 113530 | `615-782-5300x` | `(615) 761-3700` | `+16157613700` |
| 54361 | `9198900142x` | `(919) 890-0143` | `+19198900143` |
| 139840 | `8326920355` | `(713) 334-0000` | `+17133340000` |
| 148597 | `6466198656x` | `(212) 620-2700 e` | `+12126202700` |

</details>

<details><summary>All price conflicts</summary>

| objectID | JSON `price` (discarded) | CSV `price_range` (kept) | derived `price_tier` |
|---|---|---|---|
| 145693 | 2 | $50 and over | 3 |
| 4618 | 2 | $31 to $50 | 2 |
| 79990 | 3 | $30 and under | 1 |
| 55696 | 3 | $30 and under | 1 |
| 34996 | 3 | $30 and under | 1 |
| 27601 | 3 | $50 and over | 3 |
| 114055 | 3 | $30 and under | 1 |
| 145957 | 2 | $31 to $50 | 2 |
| 106792 | 3 | $30 and under | 1 |
| 40117 | 2 | $31 to $50 | 2 |
| 135253 | 3 | $30 and under | 1 |
| 109195 | 3 | $50 and over | 3 |
| 88474 | 4 | $31 to $50 | 2 |
| 94843 | 3 | $30 and under | 1 |
| 73378 | 3 | $50 and over | 3 |
| 96922 | 2 | $31 to $50 | 2 |
| 82222 | 2 | $50 and over | 3 |
| 45325 | 3 | $30 and under | 1 |
| 54847 | 3 | $30 and under | 1 |
| 88174 | 2 | $31 to $50 | 2 |
| 32884 | 3 | $30 and under | 1 |
| 113170 | 2 | $31 to $50 | 2 |
| 7916 | 2 | $31 to $50 | 2 |
| 103513 | 3 | $30 and under | 1 |
| 107782 | 3 | $30 and under | 1 |
| 95881 | 3 | $30 and under | 1 |
| 146584 | 2 | $31 to $50 | 2 |
| 116335 | 2 | $31 to $50 | 2 |
| 72058 | 2 | $31 to $50 | 2 |
| 138796 | 3 | $30 and under | 1 |
| 145792 | 3 | $50 and over | 3 |
| 4941 | 3 | $30 and under | 1 |
| 152200 | 2 | $31 to $50 | 2 |
| 111298 | 3 | $50 and over | 3 |
| 141049 | 2 | $31 to $50 | 2 |
| 33664 | 2 | $31 to $50 | 2 |
| 50173 | 3 | $30 and under | 1 |
| 74398 | 2 | $31 to $50 | 2 |
| 77251 | 2 | $31 to $50 | 2 |
| 718 | 2 | $31 to $50 | 2 |
| 42097 | 3 | $50 and over | 3 |
| 4155 | 2 | $31 to $50 | 2 |
| 88030 | 2 | $31 to $50 | 2 |
| 55411 | 2 | $31 to $50 | 2 |
| 3532 | 3 | $50 and over | 3 |
| 3961 | 3 | $50 and over | 3 |
| 106585 | 3 | $30 and under | 1 |
| 71464 | 3 | $30 and under | 1 |
| 49780 | 3 | $30 and under | 1 |
| 69892 | 2 | $31 to $50 | 2 |
| 87889 | 3 | $50 and over | 3 |
| 14056 | 3 | $30 and under | 1 |
| 109408 | 2 | $31 to $50 | 2 |
| 78094 | 2 | $31 to $50 | 2 |
| 2636 | 4 | $31 to $50 | 2 |
| 145846 | 2 | $31 to $50 | 2 |
| 33373 | 4 | $31 to $50 | 2 |
| 40123 | 2 | $31 to $50 | 2 |
| 3086 | 4 | $31 to $50 | 2 |
| 83443 | 4 | $31 to $50 | 2 |
| 27403 | 3 | $30 and under | 1 |
| 102931 | 3 | $30 and under | 1 |
| 64231 | 3 | $30 and under | 1 |
| 58819 | 3 | $30 and under | 1 |
| 102925 | 3 | $30 and under | 1 |
| 114097 | 2 | $31 to $50 | 2 |
| 70249 | 2 | $31 to $50 | 2 |
| 25240 | 3 | $30 and under | 1 |
| 151468 | 3 | $30 and under | 1 |
| 140641 | 2 | $31 to $50 | 2 |
| 10042 | 3 | $30 and under | 1 |
| 4544 | 4 | $31 to $50 | 2 |
| 111097 | 4 | $31 to $50 | 2 |
| 15991 | 4 | $31 to $50 | 2 |
| 69334 | 3 | $50 and over | 3 |
| 24265 | 3 | $30 and under | 1 |
| 25258 | 3 | $50 and over | 3 |
| 2683 | 3 | $50 and over | 3 |
| 32872 | 3 | $30 and under | 1 |
| 1906 | 2 | $31 to $50 | 2 |
| 112024 | 4 | $31 to $50 | 2 |
| 106159 | 2 | $31 to $50 | 2 |
| 13336 | 2 | $31 to $50 | 2 |
| 106633 | 2 | $31 to $50 | 2 |
| 48736 | 3 | $30 and under | 1 |
| 39706 | 2 | $50 and over | 3 |
| 15406 | 2 | $31 to $50 | 2 |
| 3778 | 4 | $31 to $50 | 2 |
| 116380 | 2 | $31 to $50 | 2 |
| 145798 | 2 | $50 and over | 3 |
| 151189 | 3 | $30 and under | 1 |
| 7410 | 2 | $31 to $50 | 2 |
| 118942 | 2 | $31 to $50 | 2 |
| 103105 | 2 | $31 to $50 | 2 |
| 63391 | 4 | $31 to $50 | 2 |
| 90400 | 2 | $31 to $50 | 2 |
| 37759 | 2 | $31 to $50 | 2 |
| 1591 | 3 | $30 and under | 1 |
| 145597 | 3 | $30 and under | 1 |
| 145876 | 3 | $30 and under | 1 |
| 7445 | 3 | $50 and over | 3 |
| 136030 | 2 | $31 to $50 | 2 |
| 114505 | 2 | $31 to $50 | 2 |
| 124615 | 3 | $30 and under | 1 |
| 5533 | 3 | $50 and over | 3 |
| 138865 | 3 | $50 and over | 3 |
| 43765 | 2 | $31 to $50 | 2 |
| 111841 | 2 | $31 to $50 | 2 |
| 59842 | 3 | $30 and under | 1 |
| 7974 | 2 | $31 to $50 | 2 |
| 34684 | 2 | $31 to $50 | 2 |
| 53878 | 2 | $31 to $50 | 2 |
| 65119 | 2 | $31 to $50 | 2 |
| 95263 | 3 | $30 and under | 1 |
| 28180 | 2 | $31 to $50 | 2 |
| 97093 | 3 | $30 and under | 1 |
| 963 | 2 | $31 to $50 | 2 |
| 30565 | 2 | $31 to $50 | 2 |
| 40933 | 2 | $31 to $50 | 2 |
| 10681 | 3 | $30 and under | 1 |
| 2551 | 2 | $31 to $50 | 2 |
| 108232 | 2 | $31 to $50 | 2 |
| 2394 | 2 | $31 to $50 | 2 |
| 115654 | 3 | $50 and over | 3 |
| 3815 | 3 | $30 and under | 1 |
| 47467 | 3 | $30 and under | 1 |
| 92389 | 2 | $31 to $50 | 2 |
| 7547 | 2 | $31 to $50 | 2 |
| 40120 | 2 | $31 to $50 | 2 |
| 2676 | 2 | $31 to $50 | 2 |
| 4940 | 3 | $30 and under | 1 |
| 4565 | 4 | $31 to $50 | 2 |
| 27 | 4 | $31 to $50 | 2 |
| 140854 | 3 | $30 and under | 1 |
| 147691 | 2 | $31 to $50 | 2 |
| 6296 | 2 | $31 to $50 | 2 |
| 83341 | 3 | $30 and under | 1 |
| 13357 | 3 | $50 and over | 3 |
| 33439 | 2 | $31 to $50 | 2 |
| 34504 | 2 | $50 and over | 3 |
| 110956 | 2 | $31 to $50 | 2 |
| 58801 | 2 | $31 to $50 | 2 |
| 90868 | 3 | $30 and under | 1 |
| 5008 | 3 | $30 and under | 1 |
| 64081 | 2 | $31 to $50 | 2 |
| 85246 | 3 | $30 and under | 1 |
| 55408 | 2 | $31 to $50 | 2 |
| 4968 | 3 | $30 and under | 1 |
| 70507 | 3 | $30 and under | 1 |
| 109636 | 3 | $30 and under | 1 |
| 104584 | 2 | $31 to $50 | 2 |
| 72718 | 2 | $31 to $50 | 2 |
| 147451 | 4 | $30 and under | 1 |
| 37666 | 3 | $30 and under | 1 |
| 112774 | 2 | $31 to $50 | 2 |
| 113794 | 3 | $30 and under | 1 |
| 85966 | 3 | $30 and under | 1 |
| 78967 | 2 | $31 to $50 | 2 |
| 40087 | 2 | $31 to $50 | 2 |
| 2834 | 4 | $31 to $50 | 2 |
| 115708 | 3 | $30 and under | 1 |
| 3439 | 2 | $31 to $50 | 2 |
| 77263 | 3 | $30 and under | 1 |
| 25741 | 2 | $50 and over | 3 |
| 72721 | 4 | $31 to $50 | 2 |
| 111184 | 2 | $31 to $50 | 2 |
| 150226 | 2 | $31 to $50 | 2 |
| 92494 | 2 | $31 to $50 | 2 |
| 4254 | 2 | $31 to $50 | 2 |
| 282 | 2 | $31 to $50 | 2 |
| 40096 | 2 | $31 to $50 | 2 |
| 7349 | 2 | $31 to $50 | 2 |
| 40483 | 2 | $31 to $50 | 2 |
| 60808 | 2 | $31 to $50 | 2 |
| 4832 | 3 | $50 and over | 3 |
| 7234 | 2 | $31 to $50 | 2 |
| 151408 | 4 | $30 and under | 1 |
| 50851 | 3 | $30 and under | 1 |
| 4747 | 2 | $31 to $50 | 2 |
| 4532 | 3 | $30 and under | 1 |
| 13372 | 3 | $50 and over | 3 |
| 47113 | 2 | $31 to $50 | 2 |
| 141304 | 4 | $31 to $50 | 2 |
| 3598 | 2 | $31 to $50 | 2 |
| 87673 | 2 | $31 to $50 | 2 |
| 60868 | 3 | $30 and under | 1 |
| 52054 | 3 | $30 and under | 1 |
| 144262 | 2 | $31 to $50 | 2 |
| 79234 | 3 | $30 and under | 1 |
| 37249 | 2 | $31 to $50 | 2 |
| 87730 | 3 | $50 and over | 3 |
| 7901 | 3 | $30 and under | 1 |
| 108871 | 3 | $30 and under | 1 |
| 29989 | 3 | $50 and over | 3 |
| 66559 | 2 | $31 to $50 | 2 |
| 76096 | 2 | $31 to $50 | 2 |
| 19546 | 2 | $31 to $50 | 2 |
| 35521 | 2 | $31 to $50 | 2 |
| 82213 | 2 | $31 to $50 | 2 |
| 2308 | 2 | $31 to $50 | 2 |
| 13351 | 3 | $50 and over | 3 |
| 5087 | 4 | $31 to $50 | 2 |
| 40084 | 2 | $31 to $50 | 2 |
| 5316 | 2 | $31 to $50 | 2 |
| 5617 | 3 | $30 and under | 1 |
| 110803 | 2 | $31 to $50 | 2 |
| 925 | 2 | $31 to $50 | 2 |
| 144853 | 2 | $31 to $50 | 2 |
| 27409 | 3 | $50 and over | 3 |
| 64084 | 2 | $31 to $50 | 2 |
| 13390 | 3 | $50 and over | 3 |
| 4290 | 2 | $31 to $50 | 2 |
| 40414 | 3 | $30 and under | 1 |
| 78286 | 3 | $30 and under | 1 |
| 109420 | 3 | $30 and under | 1 |
| 96886 | 3 | $50 and over | 3 |
| 139879 | 3 | $30 and under | 1 |
| 90295 | 2 | $31 to $50 | 2 |
| 76939 | 3 | $30 and under | 1 |
| 113380 | 3 | $30 and under | 1 |

</details>

## `market_state` — the field name overstates the data

Derived on 2897 records, of which only **922** hold an actual US state name.
The other 1975 hold values like `Tri-State Area` (the single largest market), `Orange County`, `Sacramento Valley` or `Chapel Hill`.
The derivation follows CLAUDE.md §3 as written. The name is misleading and this attribute must not be presented to users as a state filter.

## Chains

- Base names at more than one location: **213**, covering **722** records (14.4%).
- Records carrying a ` - <suffix>` in `name`: **1085**.
- Same-city clusters where `location_label` is not unique: **9**, covering **18** records, all flagged `location_label_ambiguous: true`.

Neighborhood does not disambiguate these; distance must complete the label.

| chain_name | city | objectID | name | location_label |
|---|---|---|---|---|
| The Herb Box | Scottsdale | 99511 | The Herb Box - DC Ranch | Scottsdale |
|  |  | 99508 | The Herb Box - Old Town | Scottsdale |
| Tien | Biloxi | 11437 | Tien - Teppanyaki / Shabu Shabu | Biloxi |
|  |  | 11434 | Tien - Traditional Asian Dining | Biloxi |
| Cyclone Anaya's | Houston | 145366 | Cyclone Anaya's - Midtown | Midtown / Montrose |
|  |  | 151276 | Cyclone Anaya's - Rice Village | Midtown / Montrose |
| Churrascos | Houston | 883 | Churrascos - Westchase | West Side |
|  |  | 114319 | Churrascos - Memorial City | West Side |
| Jia | Biloxi | 96121 | Jia - Teppan Tables - Beau Rivage | Beau Rivage Resort & Casino |
|  |  | 91042 | Jia - Beau Rivage | Beau Rivage Resort & Casino |
| McCormick & Schmick's Seafood | Pittsburgh | 6794 | McCormick & Schmick's Seafood - Pittsburgh South Side | Downtown |
|  |  | 13990 | McCormick & Schmick's Seafood - Pittsburgh Downtown | Downtown |
| Fleming's Steakhouse | Scottsdale | 40036 | Fleming's Steakhouse - Scottsdale | Scottsdale |
|  |  | 39919 | Fleming's Steakhouse - DC Ranch | Scottsdale |
| JW Marriott San Antonio | San Antonio | 39706 | JW Marriott San Antonio - 18 Oaks | North San Antonio |
|  |  | 39703 | JW Marriott San Antonio - Cibolo Moon | North San Antonio |
| The Westgate Hotel | San Diego | 72961 | The Westgate Hotel - The Westgate Room | Downtown / Gaslamp |
|  |  | 72964 | The Westgate Hotel - Sunday Brunch & Le Fontainebleau Room | Downtown / Gaslamp |

## Cuisine mapping applied

Source `food_type` values seen: **114**, unmapped: **0**.
Resulting primary cuisines: **37**. Distinct tags: **102**.

| source `food_type` | records | -> `cuisine` | `cuisine_tags` |
|---|---|---|---|
| American | 865 | **American** | Traditional |
| Italian | 850 | **Italian** | Traditional |
| Contemporary American | 649 | **American** | Contemporary |
| Steakhouse | 328 | **Steakhouse** | Steakhouse |
| Seafood | 267 | **Seafood** | Seafood |
| French | 167 | **French** | — |
| Japanese | 140 | **Japanese** | — |
| Steak | 123 | **Steakhouse** | Steakhouse |
| Californian | 96 | **American** | Californian, Contemporary, Farm to Table |
| Mexican | 90 | **Mexican** | — |
| Mediterranean | 85 | **Mediterranean** | — |
| Sushi | 67 | **Japanese** | Sushi |
| Indian | 65 | **Indian** | — |
| Asian | 61 | **Asian** | — |
| Gastro Pub | 51 | **American** | Gastropub, Pub |
| Global, International | 43 | **International** | Global |
| Greek | 42 | **Greek** | Mediterranean |
| Spanish | 42 | **Spanish** | — |
| Tapas / Small Plates | 42 | **Spanish** | Tapas, Small Plates |
| Southern | 41 | **Southern** | Southern |
| Comfort Food | 40 | **American** | Comfort Food |
| Northwest | 37 | **American** | Pacific Northwest, Farm to Table |
| Mexican / Southwestern | 36 | **Mexican** | Southwestern |
| Brazilian Steakhouse | 33 | **Steakhouse** | Churrascaria, Brazilian, Latin American, Steakhouse |
| Latin American | 33 | **Latin American** | — |
| Continental | 32 | **European** | Continental |
| Fondue | 30 | **Fondue** | Swiss, Alpine |
| Fusion / Eclectic | 30 | **International** | Fusion, Eclectic |
| Hawaii Regional Cuisine | 30 | **Hawaiian** | Hawaii Regional, Pacific Rim |
| Southwest | 29 | **Southwestern** | Southwestern |
| Creole / Cajun / Southern | 25 | **Cajun & Creole** | Creole, Cajun, Southern |
| International | 25 | **International** | — |
| Thai | 25 | **Thai** | — |
| Barbecue | 24 | **Barbecue** | Southern |
| Chinese | 22 | **Chinese** | — |
| Contemporary French | 22 | **French** | Contemporary |
| Pizzeria | 20 | **Italian** | Pizza, Pizzeria |
| Contemporary Italian | 19 | **Italian** | Contemporary |
| European | 18 | **European** | — |
| Contemporary French / American | 17 | **French** | Contemporary, American, French American |
| Creole | 16 | **Cajun & Creole** | Creole |
| Organic | 16 | **American** | Organic, Farm to Table |
| French American | 15 | **French** | American, French American |
| Contemporary European | 14 | **European** | Contemporary |
| Turkish | 14 | **Turkish** | Mediterranean |
| Contemporary Southern | 13 | **Southern** | Southern, Contemporary |
| Latin / Spanish | 13 | **Latin American** | Spanish |
| Pan-Asian | 13 | **Asian** | Pan-Asian |
| Modern European | 11 | **European** | Contemporary, Modern European |
| Hawaiian | 10 | **Hawaiian** | Pacific Rim |
| Irish | 10 | **Irish** | European, Pub |
| Caribbean | 9 | **Caribbean** | Latin American |
| Peruvian | 9 | **Peruvian** | South American, Latin American |
| German | 8 | **German** | European |
| Korean | 8 | **Korean** | — |
| Portuguese | 8 | **Portuguese** | European, Mediterranean |
| Belgian | 7 | **Belgian** | European |
| Contemporary Asian | 7 | **Asian** | Contemporary, Pan-Asian |
| Cuban | 7 | **Cuban** | Caribbean, Latin American |
| Cajun | 6 | **Cajun & Creole** | Cajun |
| Argentinean | 5 | **Latin American** | Argentinean, Steakhouse, Parrilla, South American |
| Brazilian | 5 | **Brazilian** | South American, Latin American |
| Contemporary Mexican | 5 | **Mexican** | Contemporary |
| Persian | 5 | **Middle Eastern** | Persian, Iranian |
| Tex-Mex | 5 | **Mexican** | Tex-Mex, Southwestern |
| Afternoon Tea | 4 | **British** | Afternoon Tea, Tea Room |
| Bar / Lounge / Bottle Service | 4 | **Bar & Lounge** | Bar, Lounge |
| Bistro | 4 | **French** | Bistro |
| Burgers | 4 | **American** | Burgers |
| Provencal | 4 | **French** | Provencal, Regional French, Mediterranean |
| Wine Bar | 4 | **Bar & Lounge** | Wine Bar |
| Brewery | 3 | **Bar & Lounge** | Brewery, Beer |
| Contemporary Indian | 3 | **Indian** | Contemporary |
| Kosher | 3 | **International** | Kosher |
| Middle Eastern | 3 | **Middle Eastern** | — |
| Moroccan | 3 | **African** | Moroccan, North African, Mediterranean |
| Puerto Rican | 3 | **Caribbean** | Puerto Rican, Latin American |
| South American | 3 | **Latin American** | South American |
| Southeast Asian | 3 | **Asian** | Southeast Asian |
| Swiss | 3 | **European** | Swiss, Alpine |
| Afghan | 2 | **Middle Eastern** | Afghan, Central Asian |
| African | 2 | **African** | — |
| Basque | 2 | **Spanish** | Basque, Regional Spanish |
| Breakfast | 2 | **American** | Breakfast, Brunch |
| British | 2 | **British** | European |
| Dim Sum | 2 | **Chinese** | Dim Sum, Cantonese |
| English | 2 | **British** | English, European |
| Ethiopian | 2 | **African** | Ethiopian, East African |
| Filipino | 2 | **Asian** | Filipino, Southeast Asian |
| Lebanese | 2 | **Middle Eastern** | Lebanese |
| Prime Rib | 2 | **Steakhouse** | Steakhouse, Prime Rib |
| Russian | 2 | **European** | Russian, Eastern European |
| Scandinavian | 2 | **European** | Scandinavian, Nordic |
| South African | 2 | **African** | South African |
| Vietnamese | 2 | **Asian** | Vietnamese, Southeast Asian |
| Australian | 1 | **International** | Australian |
| Austrian | 1 | **European** | Austrian, Alpine |
| Beer Garden | 1 | **Bar & Lounge** | Beer Garden, Beer |
| Burmese | 1 | **Asian** | Burmese, Southeast Asian |
| Eastern European | 1 | **European** | Eastern European, Ukrainian |
| Eurasian | 1 | **Hawaiian** | Pacific Rim, Fusion, Eurasian |
| Hibachi | 1 | **Japanese** | Hibachi, Teppanyaki |
| Low Country | 1 | **Southern** | Low Country, Southern |
| Modern Australian | 1 | **International** | Australian, Contemporary |
| Pacific Rim | 1 | **Hawaiian** | Pacific Rim, Fusion |
| Polynesian | 1 | **Hawaiian** | Polynesian, Pacific Rim, Tiki |
| Regional Mexican | 1 | **Mexican** | Regional Mexican |
| Sicilian | 1 | **Italian** | Sicilian, Regional Italian |
| South Indian | 1 | **Indian** | South Indian, Regional Indian |
| Syrian | 1 | **Middle Eastern** | Syrian |
| Traditional Mexican | 1 | **Mexican** | Traditional |
| Vegan | 1 | **American** | Vegan, Vegetarian, Plant Based |
| Vegetarian | 1 | **American** | Vegetarian |
| Wild Game | 1 | **American** | Wild Game |

Resulting distribution:

| cuisine | records | share |
|---|---|---|
| American | 1763 | 35.3% |
| Italian | 890 | 17.8% |
| Steakhouse | 486 | 9.7% |
| Seafood | 267 | 5.3% |
| French | 229 | 4.6% |
| Japanese | 208 | 4.2% |
| Mexican | 138 | 2.8% |
| International | 103 | 2.1% |
| Asian | 89 | 1.8% |
| Spanish | 86 | 1.7% |
| Mediterranean | 85 | 1.7% |
| European | 84 | 1.7% |
| Indian | 69 | 1.4% |
| Southern | 55 | 1.1% |
| Latin American | 54 | 1.1% |
| Cajun & Creole | 47 | 0.9% |
| Hawaiian | 43 | 0.9% |
| Greek | 42 | 0.8% |
| Fondue | 30 | 0.6% |
| Southwestern | 29 | 0.6% |
| Thai | 25 | 0.5% |
| Barbecue | 24 | 0.5% |
| Chinese | 24 | 0.5% |
| Turkish | 14 | 0.3% |
| Middle Eastern | 13 | 0.3% |
| Caribbean | 12 | 0.2% |
| Bar & Lounge | 12 | 0.2% |
| Irish | 10 | 0.2% |
| Peruvian | 9 | 0.2% |
| African | 9 | 0.2% |
| Portuguese | 8 | 0.2% |
| German | 8 | 0.2% |
| British | 8 | 0.2% |
| Korean | 8 | 0.2% |
| Cuban | 7 | 0.1% |
| Belgian | 7 | 0.1% |
| Brazilian | 5 | 0.1% |

## `occasions` — derived, not observed

A heuristic over `dining_style` + `price_tier` + `cuisine`. **Not customer data.** In
production it is replaced by observed behaviour: event streams, content, reviews.
This provenance must be stated wherever the attribute is presented.

| occasion | records | share | rule basis |
|---|---|---|---|
| special occasion | 770 | 15.4% | `dining_style` = Fine Dining, or the top price tier |
| date night | 1639 | 32.8% | Fine Dining, or Casual Elegant above the entry price tier |
| business lunch | 1627 | 32.5% | Steakhouse at any tier, or a non-casual style above the entry tier |
| family friendly | 1858 | 37.2% | Casual Dining or Home Style at the entry price tier |
| group dinner | 1634 | 32.7% | shareable or communal formats — Steakhouse, Barbecue, Fondue, Mexican, Chinese, Italian, or a Tapas tag |
| solo friendly | 77 | 1.5% | counter-service formats — Sushi, Dim Sum, bar or wine-bar seating |
| late night | 73 | 1.5% | drink-led venue types only; the extract has no opening hours, so this is a venue proxy |

> Records with no occasion at all: **1032** (20.6%).

Enrichment cache: **5000** hits, **0** misses (rules version 1).

## Ranking sanity — top 20 by `popularity_score`

The calibration check from CLAUDE.md §4: if unrecognisable restaurants surface, `m` is too low.

| # | score | objectID | name | city | stars | reviews |
|---|---|---|---|---|---|---|
| 1 | 4.888 | 38071 | Russell's Steaks, Chops, and More | Williamsville | 4.9 | 2512 |
| 2 | 4.883 | 24451 | Quince Restaurant | San Francisco | 4.9 | 1693 |
| 3 | 4.879 | 31153 | Beach Walk Henderson Park Inn | Destin | 5 | 242 |
| 4 | 4.869 | 8088 | Madrona Manor | Healdsburg | 4.9 | 914 |
| 5 | 4.857 | 133999 | Cafe Monarch | Scottsdale | 4.9 | 662 |
| 6 | 4.852 | 21772 | The Kitchen Restaurant | Sacramento | 4.9 | 578 |
| 7 | 4.850 | 37012 | Uptown Billiards Club | Portland | 4.9 | 557 |
| 8 | 4.829 | 5062 | Pazza Notte | New York | 5 | 156 |
| 9 | 4.820 | 54118 | La Becasse MI | Maple City | 4.9 | 328 |
| 10 | 4.813 | 78970 | Embers Steakhouse | Brooklyn | 5 | 139 |
| 11 | 4.798 | 2767 | Mama's Fish House | Paia | 4.8 | 12669 |
| 12 | 4.795 | 3934 | GW Fins | New Orleans | 4.8 | 5523 |
| 13 | 4.795 | 4487 | Restaurant August | New Orleans | 4.8 | 4668 |
| 14 | 4.793 | 10252 | Fruition Restaurant | Denver | 4.8 | 3481 |
| 15 | 4.791 | 3267 | Geronimo | Santa Fe | 4.8 | 2858 |
| 16 | 4.788 | 38881 | Chef and The Farmer | Kinston | 4.8 | 1994 |
| 17 | 4.786 | 4332 | The French Room | Dallas | 4.8 | 1733 |
| 18 | 4.785 | 19312 | Restaurant Orsay | Jacksonville | 4.8 | 1663 |
| 19 | 4.782 | 73378 | Bliss Restaurant | San Antonio | 4.8 | 1357 |
| 20 | 4.780 | 25864 | Rudy & Paco Restaurant & Bar | Galveston | 4.8 | 1212 |

For contrast, the 8 records holding a 5.0 with fewer than 10 reviews rank:

| objectID | name | reviews | rank |
|---|---|---|---|
| 154318 | Ellen's Cafe | 1 | 2414 / 5000 |
| 118600 | VIEWS - Four Seasons Lanai | 2 | 2403 / 5000 |
| 52078 | Reflect Restaurant - Cambria Suites | 2 | 2404 / 5000 |
| 152740 | Abruzzi Trattoria | 3 | 2381 / 5000 |
| 61354 | Star of Honolulu - Five Star | 5 | 2318 / 5000 |
| 145654 | City Thai Cuisine | 5 | 2319 / 5000 |
| 107158 | Delizia 92 | 8 | 1840 / 5000 |
| 152332 | Roux 30a | 9 | 1523 / 5000 |

## Fields deliberately not indexed

| field | reason |
|---|---|
| `country` | constant `US` on all 5,000 records — useless as a facet |
| `mobile_reserve_url` | redundant with `reserve_url` |
| `payment_options` | used in no user journey |
| `price` (JSON int) | superseded by `price_range`, which it contradicts on 220 records |

---

Generated by `scripts/1-transform.js`. Deterministic: the same inputs produce the same output. `resources/` was read, never written.
