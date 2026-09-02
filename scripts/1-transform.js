#!/usr/bin/env node
/**
 * 1-transform.js — join, normalise, enrich.
 *
 * Reads   resources/dataset/restaurants_list.json  (5,000 records, JSON array)
 *         resources/dataset/restaurants_info.csv   (5,000 rows, semicolon-delimited)
 *         scripts/cuisine-taxonomy.json            (hand-reviewed food_type mapping)
 * Writes  data/records.json                        (index payload)
 *         data/enrichment-cache.json               (occasions, keyed by objectID)
 *         data/transform-report.md                 (counts, conflicts, mapping applied)
 *
 * Deterministic. Never talks to Algolia — that is 2-index.js. `resources/` is source
 * material and is never written to.
 *
 * Fails loudly rather than degrading quietly: a join below 100%, an unknown
 * price_range label, an unmapped food_type, a phone that does not yield 10 digits,
 * or an occasion outside the controlled vocabulary all abort the run.
 *
 * Usage:
 *   node scripts/1-transform.js              full run
 *   node scripts/1-transform.js --sample=100 first 100 records, report to stdout, no
 *                                            writes — the inspection step CLAUDE.md §4
 *                                            requires before enriching all 5,000
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_JSON = path.join(ROOT, 'resources/dataset/restaurants_list.json');
const SRC_CSV = path.join(ROOT, 'resources/dataset/restaurants_info.csv');
const TAXONOMY = path.join(ROOT, 'scripts/cuisine-taxonomy.json');
const OUT_RECORDS = path.join(ROOT, 'data/records.json');
const OUT_CACHE = path.join(ROOT, 'data/enrichment-cache.json');
const OUT_REPORT = path.join(ROOT, 'data/transform-report.md');

/** Bayesian prior weight. See CLAUDE.md §4 — 70 records sit under 10 reviews while the
 *  median is 336, so ranking on raw stars_count puts thin 5.0s on the first screen. */
const PRIOR_WEIGHT_M = 50;

/** price_range is the canonical, user-facing label (CLAUDE.md §3). price_tier is derived
 *  from it, never from the JSON `price` int, which contradicts it on 220 records. */
const PRICE_TIER = { '$30 and under': 1, '$31 to $50': 2, '$50 and over': 3 };

/** The JSON `price` int runs on a 2/3/4 scale against price_tier's 1/2/3. Used only to
 *  count conflicts for the report — never to derive a value. */
const JSON_PRICE_TO_TIER = { 2: 1, 3: 2, 4: 3 };

/** Controlled vocabulary. Free-form generation produces an unusable long-tail facet. */
const OCCASIONS = ['date night', 'business lunch', 'family friendly', 'special occasion', 'group dinner', 'solo friendly', 'late night'];

/** Bump when the occasions rules change — invalidates every cached entry. */
const OCCASION_RULES_VERSION = 1;

const US_STATES = new Set(['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia']);

const fail = (msg) => { throw new Error(`transform aborted: ${msg}`); };

// ---------------------------------------------------------------- normalisers

const trim = (s) => String(s ?? '').trim();

/** Fold diacritics, unify the apostrophe and dash glyphs the extract mixes, collapse
 *  whitespace, lowercase. Grouping and comparison only — never for output. 19 records
 *  store a curly apostrophe and 15 an en dash, and 4 chains mix dash glyphs across
 *  their own locations, so grouping on the raw string splits them. */
const foldName = (s) =>
  trim(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .toLowerCase();

/** CSV phone_number is the source of truth: the JSON `phone` field carries a stray `x`
 *  suffix and, on 160 records, a different number entirely. 67 CSV values carry a
 *  trailing " e" from the same broken export; their digits are intact. */
const toE164 = (raw, objectID) => {
  const d = String(raw ?? '').replace(/\D/g, '');
  const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  if (ten.length !== 10) fail(`objectID ${objectID}: phone_number "${raw}" yields ${ten.length} digits, expected 10`);
  return `+1${ten}`;
};

/** `area` is a market label at inconsistent granularity — metro, state, multi-city
 *  aggregate, macro-region. Never split into city + state (CLAUDE.md §3): it is an
 *  opaque navigation facet. market_state is derived only where the separator exists. */
const splitMarket = (area) => {
  const market = trim(area);
  const parts = market.split(' / ').map(trim).filter(Boolean);
  return { market, market_state: parts.length > 1 ? parts[parts.length - 1] : null };
};

/** Strip a trailing " - <location>" suffix to recover the chain base name.
 *  Guards: only separators surrounded by whitespace, and only outside parentheses —
 *  4478 "Bocca Di Bacco (Theatre District - 45th St.)" must not be split. Splits at the
 *  first eligible separator, so "Benihana - Houston - Downtown" yields "Benihana". */
const baseName = (name) => {
  const s = trim(name);
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
    else if (depth === 0 && (c === '-' || c === '–' || c === '—')) {
      if (/\s/.test(s[i - 1] ?? '') && /\s/.test(s[i + 1] ?? '')) return trim(s.slice(0, i));
    }
  }
  return s;
};

const digitsOnly = (s) => String(s ?? '').replace(/\D/g, '').replace(/^1/, '');

// ---------------------------------------------------------------- load + join

const readCsv = (file) => {
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  // Measured: 0 lines contain a double quote, so no field is quoted and a plain split
  // on ';' is safe. Assert it rather than assume it — a future extract may differ.
  const quoted = lines.filter((l) => l.includes('"')).length;
  if (quoted > 0) fail(`${path.basename(file)} contains ${quoted} quoted line(s); the plain ';' split is no longer safe`);
  const header = lines[0].split(';').map(trim);
  return lines.slice(1).map((line, i) => {
    const cells = line.split(';');
    if (cells.length !== header.length) fail(`${path.basename(file)} line ${i + 2}: ${cells.length} fields, expected ${header.length}`);
    return Object.fromEntries(header.map((h, j) => [h, cells[j]]));
  });
};

const listRaw = JSON.parse(fs.readFileSync(SRC_JSON, 'utf8'));
const infoRaw = readCsv(SRC_CSV);
const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY, 'utf8')).mapping;

if (!Array.isArray(listRaw) || listRaw.length === 0) fail('restaurants_list.json is not a non-empty array');

const infoById = new Map(infoRaw.map((r) => [trim(r.objectID), r]));
if (infoById.size !== infoRaw.length) fail(`restaurants_info.csv has duplicate objectIDs (${infoRaw.length} rows, ${infoById.size} unique)`);

const listIds = new Set(listRaw.map((r) => String(r.objectID)));
if (listIds.size !== listRaw.length) fail(`restaurants_list.json has duplicate objectIDs (${listRaw.length} records, ${listIds.size} unique)`);

const matched = listRaw.filter((r) => infoById.has(String(r.objectID)));
const orphansJson = listRaw.filter((r) => !infoById.has(String(r.objectID))).map((r) => r.objectID);
const orphansCsv = infoRaw.filter((r) => !listIds.has(trim(r.objectID))).map((r) => r.objectID);

// CLAUDE.md §7 — fail loudly below 100%. The current extract guarantees it; a
// production pipeline would not, and a silent partial join is the worst outcome.
const matchRate = matched.length / listRaw.length;
if (matchRate < 1) {
  fail(
    `join match rate ${(matchRate * 100).toFixed(2)}% (${matched.length}/${listRaw.length}). ` +
    `JSON records with no CSV row: ${orphansJson.length}${orphansJson.length ? ` (e.g. ${orphansJson.slice(0, 5).join(', ')})` : ''}. ` +
    `CSV rows with no JSON record: ${orphansCsv.length}${orphansCsv.length ? ` (e.g. ${orphansCsv.slice(0, 5).join(', ')})` : ''}.`
  );
}

const args = process.argv.slice(2);
const sampleArg = args.find((a) => a.startsWith('--sample='));
const SAMPLE = sampleArg ? Number(sampleArg.split('=')[1]) : null;
if (sampleArg && (!Number.isInteger(SAMPLE) || SAMPLE < 1)) fail(`--sample expects a positive integer, got "${sampleArg}"`);
const unknownArgs = args.filter((a) => a !== sampleArg);
if (unknownArgs.length) fail(`unknown argument(s): ${unknownArgs.join(', ')}`);
const work = SAMPLE ? listRaw.slice(0, SAMPLE) : listRaw;

// ---------------------------------------------------------------- pass 1: per record

// Computed over the whole corpus even on a sample run: C is a property of the dataset,
// not of the slice, and a sample-local mean would make sampled scores incomparable.
const C_GLOBAL_MEAN = infoRaw.reduce((a, r) => a + parseFloat(r.stars_count), 0) / infoRaw.length;

const stats = {
  phoneConflicts: [],
  priceConflicts: [],
  areaNoSeparator: 0,
  marketStateDerived: 0,
  neighborhoodEqualsCity: 0,
  neighborhoodWhitespace: 0,
  neighborhoodCaseOnly: 0,
  cuisineApplied: new Map(),
};

const records = work.map((src) => {
  const objectID = String(src.objectID);
  const info = infoById.get(objectID);

  // --- phone: CSV wins, the JSON field is corrupted
  const phone = toE164(info.phone_number, objectID);
  if (digitsOnly(src.phone) !== digitsOnly(info.phone_number)) {
    stats.phoneConflicts.push({ objectID, json: src.phone, csv: info.phone_number, kept: phone });
  }

  // --- price: the label wins, the int is discarded
  const price_range = trim(info.price_range);
  const price_tier = PRICE_TIER[price_range];
  if (price_tier === undefined) fail(`objectID ${objectID}: unknown price_range "${price_range}". Known labels: ${Object.keys(PRICE_TIER).join(', ')}`);
  if (JSON_PRICE_TO_TIER[Number(src.price)] !== price_tier) {
    stats.priceConflicts.push({ objectID, jsonPrice: src.price, price_range, price_tier });
  }

  // --- market: opaque facet, never split into city + state
  const { market, market_state } = splitMarket(src.area);
  if (market_state === null) stats.areaNoSeparator++; else stats.marketStateDerived++;

  // --- location_label: neighborhood (when distinct from city) -> city -> city + distance.
  //     The third rung needs the user's position and is applied at render time; this
  //     computes the first two, and pass 3 flags where they are insufficient.
  const cityRaw = trim(src.city);
  const hoodRaw = trim(info.neighborhood);
  if (info.neighborhood !== hoodRaw) stats.neighborhoodWhitespace++;
  const hoodIsCity = hoodRaw.toLowerCase() === cityRaw.toLowerCase();
  if (hoodIsCity) {
    stats.neighborhoodEqualsCity++;
    if (hoodRaw !== cityRaw) stats.neighborhoodCaseOnly++;
  }
  const location_label = hoodIsCity || !hoodRaw ? cityRaw : hoodRaw;

  // --- cuisine
  const foodType = trim(info.food_type);
  const mapped = taxonomy[foodType];
  if (!mapped) fail(`objectID ${objectID}: food_type "${foodType}" is absent from scripts/cuisine-taxonomy.json`);
  if (!mapped.cuisine) fail(`taxonomy entry "${foodType}" has no primary cuisine`);
  const mapKey = `${foodType}\u0000${mapped.cuisine}`;
  stats.cuisineApplied.set(mapKey, (stats.cuisineApplied.get(mapKey) ?? 0) + 1);

  // --- popularity: Bayesian average, not raw stars
  const stars_count = parseFloat(info.stars_count);
  const reviews_count = parseInt(info.reviews_count, 10);
  if (!Number.isFinite(stars_count)) fail(`objectID ${objectID}: stars_count "${info.stars_count}" is not a number`);
  if (!Number.isInteger(reviews_count)) fail(`objectID ${objectID}: reviews_count "${info.reviews_count}" is not an integer`);
  const v = reviews_count;
  const popularity_score = (v / (v + PRIOR_WEIGHT_M)) * stars_count + (PRIOR_WEIGHT_M / (v + PRIOR_WEIGHT_M)) * C_GLOBAL_MEAN;

  if (!src._geoloc || typeof src._geoloc.lat !== 'number' || typeof src._geoloc.lng !== 'number') fail(`objectID ${objectID}: missing or malformed _geoloc`);

  // Deliberately absent, per CLAUDE.md §4: country (constant US), mobile_reserve_url
  // (redundant with reserve_url), payment_options (used in no journey), price (the
  // JSON int, superseded by price_range, which it contradicts on 220 records).
  return {
    objectID,
    name: trim(src.name),
    chain_name: null,                 // pass 2
    is_chain: false,                  // pass 2
    address: trim(src.address),
    neighborhood: hoodRaw,            // raw (trimmed); equals city on 2,500 records
    city: cityRaw,
    state: trim(src.state),
    postal_code: trim(src.postal_code),
    location_label,
    location_label_ambiguous: false,  // pass 3
    market,
    market_state,
    _geoloc: { lat: src._geoloc.lat, lng: src._geoloc.lng },
    cuisine: mapped.cuisine,
    cuisine_tags: [...(mapped.cuisine_tags ?? [])],
    dining_style: trim(info.dining_style),
    price_range,
    price_tier,
    stars_count,
    reviews_count,
    popularity_score: Number(popularity_score.toFixed(6)),
    occasions: [],                    // pass 4
    image_url: trim(src.image_url),
    reserve_url: trim(src.reserve_url),
    phone,
  };
});

// ---------------------------------------------------------------- pass 2: chains

/** Chains appear two ways and only one is visible to an exact-string comparison:
 *  23 names are byte-identical duplicates, and 1,086 records encode the location as a
 *  " - <suffix>" suffix. Grouping on the folded base name catches both. */
const chainGroups = new Map();
for (const r of records) {
  const k = foldName(baseName(r.name));
  if (!chainGroups.has(k)) chainGroups.set(k, []);
  chainGroups.get(k).push(r);
}

let chainCount = 0;
for (const group of chainGroups.values()) {
  if (group.length < 2) continue;
  chainCount++;
  // Canonical display form: the most frequent raw base name, tie-broken by the
  // shortest. `Range` / `range` differ only by case and `Cafe 21` only by dash glyph
  // downstream — the group must expose one label, not two.
  const tally = new Map();
  for (const r of group) {
    const b = baseName(r.name);
    tally.set(b, (tally.get(b) ?? 0) + 1);
  }
  const canonical = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length || a[0].localeCompare(b[0]))[0][0];
  for (const r of group) {
    r.chain_name = canonical;
    r.is_chain = true;
  }
}

// ---------------------------------------------------------------- pass 3: label ambiguity

/** On 9 of the 50 same-city chain clusters two locations share a neighborhood, so
 *  location_label alone renders them identically — Fleming's Scottsdale 40036/39919
 *  both read "Scottsdale". Flag them so the front end knows distance is load-bearing
 *  rather than decorative. test-queries.md C2 and C3 fail without this. */
const labelGroups = new Map();
for (const r of records) {
  if (!r.is_chain) continue;
  const k = [foldName(r.chain_name), foldName(r.city), foldName(r.location_label)].join('\u0000');
  if (!labelGroups.has(k)) labelGroups.set(k, []);
  labelGroups.get(k).push(r);
}
let ambiguousRecords = 0;
const ambiguousClusters = [];
for (const group of labelGroups.values()) {
  if (group.length < 2) continue;
  ambiguousClusters.push(group);
  for (const r of group) {
    r.location_label_ambiguous = true;
    ambiguousRecords++;
  }
}

// ---------------------------------------------------------------- pass 4: occasions

/**
 * DERIVED, NOT OBSERVED. A heuristic over dining_style + price_tier + cuisine — not
 * customer data. It exists because users think in occasions long before they think in
 * cuisines, which is what makes persona 2's curated entry points possible. In
 * production it is replaced by observed behaviour: event streams, content, reviews.
 * This provenance must be stated wherever the attribute is presented (CLAUDE.md §4).
 *
 * Every rule names the signal it rests on. `late night` is the weakest: the extract
 * carries no opening hours, so it is inferred from drink-led venue tags alone and is a
 * venue-type proxy, not a claim about closing time.
 */
const OCCASION_RULES = [
  { occasion: 'special occasion', basis: '`dining_style` = Fine Dining, or the top price tier', test: (r) => r.dining_style === 'Fine Dining' || r.price_tier === 3 },
  { occasion: 'date night', basis: 'Fine Dining, or Casual Elegant above the entry price tier', test: (r) => r.dining_style === 'Fine Dining' || (r.dining_style === 'Casual Elegant' && r.price_tier >= 2) },
  { occasion: 'business lunch', basis: 'Steakhouse at any tier, or a non-casual style above the entry tier', test: (r) => r.cuisine === 'Steakhouse' || (r.price_tier >= 2 && (r.dining_style === 'Fine Dining' || r.dining_style === 'Casual Elegant')) },
  { occasion: 'family friendly', basis: 'Casual Dining or Home Style at the entry price tier', test: (r) => (r.dining_style === 'Casual Dining' || r.dining_style === 'Home Style') && r.price_tier === 1 },
  { occasion: 'group dinner', basis: 'shareable or communal formats — Steakhouse, Barbecue, Fondue, Mexican, Chinese, Italian, or a Tapas tag', test: (r) => ['Steakhouse', 'Barbecue', 'Fondue', 'Mexican', 'Chinese', 'Italian'].includes(r.cuisine) || r.cuisine_tags.includes('Tapas') },
  { occasion: 'solo friendly', basis: 'counter-service formats — Sushi, Dim Sum, bar or wine-bar seating', test: (r) => r.cuisine_tags.some((t) => ['Sushi', 'Dim Sum', 'Bar', 'Wine Bar'].includes(t)) },
  { occasion: 'late night', basis: 'drink-led venue types only; the extract has no opening hours, so this is a venue proxy', test: (r) => r.cuisine === 'Bar & Lounge' || r.cuisine_tags.some((t) => ['Bar', 'Lounge', 'Brewery', 'Beer Garden', 'Pub', 'Gastropub'].includes(t)) },
];

const occasionFingerprint = (r) =>
  crypto.createHash('sha1')
    .update(JSON.stringify([OCCASION_RULES_VERSION, r.dining_style, r.price_tier, r.cuisine, [...r.cuisine_tags].sort()]))
    .digest('hex')
    .slice(0, 16);

/** Cached on disk keyed by objectID and never re-enriched while the fingerprint matches
 *  (CLAUDE.md §4). These rules are deterministic, so the cache is redundant today — it
 *  exists as the seam for replacing the heuristic with an expensive or
 *  non-deterministic source without reworking the pipeline. The fingerprint means a
 *  rules change or an input change invalidates the entry instead of serving stale data. */
let cache = {};
if (fs.existsSync(OUT_CACHE)) {
  try {
    cache = JSON.parse(fs.readFileSync(OUT_CACHE, 'utf8'));
  } catch {
    console.warn(`warning: ${path.relative(ROOT, OUT_CACHE)} is unreadable, re-enriching from scratch`);
    cache = {};
  }
}

let cacheHits = 0;
let cacheMisses = 0;
const occasionCounts = Object.fromEntries(OCCASIONS.map((o) => [o, 0]));
for (const r of records) {
  const fp = occasionFingerprint(r);
  const hit = cache[r.objectID];
  if (hit && hit.fingerprint === fp && Array.isArray(hit.occasions)) {
    r.occasions = [...hit.occasions];
    cacheHits++;
  } else {
    r.occasions = OCCASION_RULES.filter((rule) => rule.test(r)).map((rule) => rule.occasion);
    cache[r.objectID] = { fingerprint: fp, occasions: [...r.occasions] };
    cacheMisses++;
  }
  for (const o of r.occasions) {
    if (!OCCASIONS.includes(o)) fail(`objectID ${r.objectID}: occasion "${o}" is outside the controlled vocabulary`);
    occasionCounts[o]++;
  }
}

// ---------------------------------------------------------------- report

const pct = (n, d = records.length) => `${((100 * n) / d).toFixed(1)}%`;
const R = [];
const w = (s = '') => R.push(s);

w('# Transform report');
w();
if (SAMPLE) {
  w(`> **Sample run — first ${SAMPLE} records only.** Nothing was written. This is the`);
  w('> inspection step CLAUDE.md §4 requires before enriching the full corpus.');
  w();
}
w(`- Records in: **${listRaw.length}** JSON, **${infoRaw.length}** CSV rows.`);
w(`- Join on \`objectID\`: **${matched.length}/${listRaw.length}** = **${(matchRate * 100).toFixed(2)}%**, no orphans on either side.`);
w(`- Records out: **${records.length}**.`);
w(`- Global mean \`stars_count\` (C): **${C_GLOBAL_MEAN.toFixed(6)}**. Prior weight (m): **${PRIOR_WEIGHT_M}**.`);
w();

w('## Conflicts resolved');
w();
w('| defect | records | resolution |');
w('|---|---|---|');
w(`| \`phone\` disagrees between files | **${stats.phoneConflicts.length}** (${pct(stats.phoneConflicts.length)}) | CSV \`phone_number\` kept as source of truth, normalised to E.164. The JSON \`phone\` field carries a stray \`x\` suffix and sometimes a different number — a broken export, not a fresher value. |`);
w(`| \`price\` int contradicts \`price_range\` | **${stats.priceConflicts.length}** (${pct(stats.priceConflicts.length)}) | \`price_range\` wins: it is what the user sees and filters on. \`price_tier\` is derived from the label; the JSON int is not indexed. |`);
w(`| \`neighborhood\` equals \`city\` | **${stats.neighborhoodEqualsCity}** (${pct(stats.neighborhoodEqualsCity)}) | \`location_label\` falls back to \`city\`. ${stats.neighborhoodCaseOnly} match only case-insensitively and ${stats.neighborhoodWhitespace} records carry stray whitespace — a raw string comparison misses both. |`);
w(`| \`area\` has no \` / \` separator | **${stats.areaNoSeparator}** (${pct(stats.areaNoSeparator)}) | \`market\` keeps the raw value as an opaque facet; \`market_state\` left null. Derived on the other ${stats.marketStateDerived}. |`);
w();

if (stats.phoneConflicts.length) {
  w('<details><summary>All phone conflicts</summary>');
  w();
  w('| objectID | JSON `phone` (discarded) | CSV `phone_number` (kept) | indexed |');
  w('|---|---|---|---|');
  stats.phoneConflicts.forEach((c) => w(`| ${c.objectID} | \`${c.json}\` | \`${c.csv}\` | \`${c.kept}\` |`));
  w();
  w('</details>');
  w();
}
if (stats.priceConflicts.length) {
  w('<details><summary>All price conflicts</summary>');
  w();
  w('| objectID | JSON `price` (discarded) | CSV `price_range` (kept) | derived `price_tier` |');
  w('|---|---|---|---|');
  stats.priceConflicts.forEach((c) => w(`| ${c.objectID} | ${c.jsonPrice} | ${c.price_range} | ${c.price_tier} |`));
  w();
  w('</details>');
  w();
}

w('## `market_state` — the field name overstates the data');
w();
const msActual = records.filter((r) => r.market_state && US_STATES.has(r.market_state)).length;
w(`Derived on ${stats.marketStateDerived} records, of which only **${msActual}** hold an actual US state name.`);
w(`The other ${stats.marketStateDerived - msActual} hold values like \`Tri-State Area\` (the single largest market), \`Orange County\`, \`Sacramento Valley\` or \`Chapel Hill\`.`);
w('The derivation follows CLAUDE.md §3 as written. The name is misleading and this attribute must not be presented to users as a state filter.');
w();

w('## Chains');
w();
const chainRecords = records.filter((r) => r.is_chain).length;
const suffixedRecords = records.filter((r) => baseName(r.name) !== r.name).length;
w(`- Base names at more than one location: **${chainCount}**, covering **${chainRecords}** records (${pct(chainRecords)}).`);
w(`- Records carrying a \` - <suffix>\` in \`name\`: **${suffixedRecords}**.`);
w(`- Same-city clusters where \`location_label\` is not unique: **${ambiguousClusters.length}**, covering **${ambiguousRecords}** records, all flagged \`location_label_ambiguous: true\`.`);
w();
if (ambiguousClusters.length) {
  w('Neighborhood does not disambiguate these; distance must complete the label.');
  w();
  w('| chain_name | city | objectID | name | location_label |');
  w('|---|---|---|---|---|');
  for (const g of ambiguousClusters) g.forEach((r, i) => w(`| ${i === 0 ? r.chain_name : ''} | ${i === 0 ? r.city : ''} | ${r.objectID} | ${r.name} | ${r.location_label} |`));
  w();
}

w('## Cuisine mapping applied');
w();
const applied = [...stats.cuisineApplied.entries()].map(([k, n]) => {
  const [ft, cu] = k.split('\u0000');
  return { ft, cu, n };
});
w(`Source \`food_type\` values seen: **${applied.length}**, unmapped: **0**.`);
w(`Resulting primary cuisines: **${new Set(records.map((r) => r.cuisine)).size}**. Distinct tags: **${new Set(records.flatMap((r) => r.cuisine_tags)).size}**.`);
w();
w('| source `food_type` | records | -> `cuisine` | `cuisine_tags` |');
w('|---|---|---|---|');
applied.sort((a, b) => b.n - a.n || a.ft.localeCompare(b.ft))
  .forEach(({ ft, cu, n }) => w(`| ${ft} | ${n} | **${cu}** | ${(taxonomy[ft].cuisine_tags ?? []).join(', ') || '—'} |`));
w();
w('Resulting distribution:');
w();
w('| cuisine | records | share |');
w('|---|---|---|');
const cuisineDist = new Map();
records.forEach((r) => cuisineDist.set(r.cuisine, (cuisineDist.get(r.cuisine) ?? 0) + 1));
[...cuisineDist.entries()].sort((a, b) => b[1] - a[1]).forEach(([c, n]) => w(`| ${c} | ${n} | ${pct(n)} |`));
w();

w('## `occasions` — derived, not observed');
w();
w('A heuristic over `dining_style` + `price_tier` + `cuisine`. **Not customer data.** In');
w('production it is replaced by observed behaviour: event streams, content, reviews.');
w('This provenance must be stated wherever the attribute is presented.');
w();
w('| occasion | records | share | rule basis |');
w('|---|---|---|---|');
OCCASION_RULES.forEach((rule) => w(`| ${rule.occasion} | ${occasionCounts[rule.occasion]} | ${pct(occasionCounts[rule.occasion])} | ${rule.basis} |`));
w();
const unsupported = OCCASIONS.filter((o) => occasionCounts[o] === 0);
const dominant = OCCASIONS.filter((o) => occasionCounts[o] / records.length > 0.8);
const noOccasion = records.filter((r) => r.occasions.length === 0).length;
if (unsupported.length) w(`> **${unsupported.length} vocabulary term(s) produced no records**: ${unsupported.join(', ')}. The available signals do not support them; forcing a rule would be fabrication.`);
if (dominant.length) w(`> **${dominant.length} term(s) cover more than 80% of the corpus**: ${dominant.join(', ')}. A facet that matches almost everything cannot refine anything — narrow the rule or drop the term.`);
w(`> Records with no occasion at all: **${noOccasion}** (${pct(noOccasion)}).`);
w();
w(`Enrichment cache: **${cacheHits}** hits, **${cacheMisses}** misses (rules version ${OCCASION_RULES_VERSION}).`);
w();

w('## Ranking sanity — top 20 by `popularity_score`');
w();
w('The calibration check from CLAUDE.md §4: if unrecognisable restaurants surface, `m` is too low.');
w();
const ranked = [...records].sort((a, b) => b.popularity_score - a.popularity_score);
w('| # | score | objectID | name | city | stars | reviews |');
w('|---|---|---|---|---|---|---|');
ranked.slice(0, 20).forEach((r, i) => w(`| ${i + 1} | ${r.popularity_score.toFixed(3)} | ${r.objectID} | ${r.name} | ${r.city} | ${r.stars_count} | ${r.reviews_count} |`));
w();
const rankOf = new Map(ranked.map((r, i) => [r.objectID, i + 1]));
const thin = records.filter((r) => r.stars_count === 5 && r.reviews_count < 10);
w(`For contrast, the ${thin.length} records holding a 5.0 with fewer than 10 reviews rank:`);
w();
w('| objectID | name | reviews | rank |');
w('|---|---|---|---|');
thin.sort((a, b) => a.reviews_count - b.reviews_count).forEach((r) => w(`| ${r.objectID} | ${r.name} | ${r.reviews_count} | ${rankOf.get(r.objectID)} / ${records.length} |`));
w();

w('## Fields deliberately not indexed');
w();
w('| field | reason |');
w('|---|---|');
w('| `country` | constant `US` on all 5,000 records — useless as a facet |');
w('| `mobile_reserve_url` | redundant with `reserve_url` |');
w('| `payment_options` | used in no user journey |');
w('| `price` (JSON int) | superseded by `price_range`, which it contradicts on 220 records |');
w();
w('---');
w();
w('Generated by `scripts/1-transform.js`. Deterministic: the same inputs produce the same output. `resources/` was read, never written.');

const report = R.join('\n') + '\n';

// ---------------------------------------------------------------- write

if (SAMPLE) {
  process.stdout.write(report);
  console.error(`\n[sample] ${records.length} records processed, nothing written. Re-run without --sample for the full corpus.`);
} else {
  fs.mkdirSync(path.dirname(OUT_RECORDS), { recursive: true });
  fs.writeFileSync(OUT_RECORDS, `${JSON.stringify(records, null, 2)}\n`);
  fs.writeFileSync(OUT_CACHE, `${JSON.stringify(cache, null, 2)}\n`);
  fs.writeFileSync(OUT_REPORT, report);
  console.log(`records -> ${path.relative(ROOT, OUT_RECORDS)}  (${records.length} records, ${(fs.statSync(OUT_RECORDS).size / 1e6).toFixed(2)} MB)`);
  console.log(`cache   -> ${path.relative(ROOT, OUT_CACHE)}  (${Object.keys(cache).length} entries, ${cacheHits} hits / ${cacheMisses} misses)`);
  console.log(`report  -> ${path.relative(ROOT, OUT_REPORT)}`);
  console.log(`\njoin ${(matchRate * 100).toFixed(2)}%  |  phone conflicts ${stats.phoneConflicts.length}  |  price conflicts ${stats.priceConflicts.length}  |  chains ${chainCount}  |  ambiguous labels ${ambiguousRecords}`);
}
