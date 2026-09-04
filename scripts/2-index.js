#!/usr/bin/env node
/**
 * 2-index.js — push records, settings and replicas to Algolia.
 *
 * Reads   data/records.json          (produced by 1-transform.js)
 *         scripts/settings.json      (versioned index configuration)
 *         scripts/rules.json         (versioned query rules)
 *         scripts/synonyms.json      (optional; absent for now)
 *         .env                       (unprefixed write key)
 *
 * Never transforms data. If a value looks wrong, fix 1-transform.js and re-run it —
 * this script's only job is to move bytes to Algolia in the right order.
 *
 * The write key never reaches the front end. It is read from ALGOLIA_WRITE_API_KEY,
 * deliberately unprefixed: Vite exposes only VITE_-prefixed variables to the browser
 * bundle, so the prefix convention is the mechanical guarantee (CLAUDE.md §7). This
 * script asserts that guarantee rather than trusting it.
 *
 * Usage:
 *   node scripts/2-index.js                 full push
 *   node scripts/2-index.js --dry-run       validate everything, touch no network
 *   node scripts/2-index.js --settings-only push settings + replicas, skip the 5,000
 *                                           records — the loop for CLAUDE.md §8, which
 *                                           requires changing one setting at a time
 *   node scripts/2-index.js --records-only  push records, leave configuration alone
 *   node scripts/2-index.js --prune         also delete objectIDs present in the index
 *                                           but absent from records.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { algoliasearch } from 'algoliasearch';
import 'dotenv/config';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RECORDS = path.join(ROOT, 'data/records.json');
const SETTINGS = path.join(ROOT, 'scripts/settings.json');
const RULES = path.join(ROOT, 'scripts/rules.json');
const SYNONYMS = path.join(ROOT, 'scripts/synonyms.json');
const ENV_FILE = path.join(ROOT, '.env');

const fail = (msg) => { throw new Error(`index aborted: ${msg}`); };
const mask = (s) => (s && s.length > 8 ? `${s.slice(0, 4)}${'.'.repeat(s.length - 8)}${s.slice(-4)}` : '****');

// ---------------------------------------------------------------- flags

const FLAGS = ['--dry-run', '--settings-only', '--records-only', '--prune'];
const args = process.argv.slice(2);
const unknown = args.filter((a) => !FLAGS.includes(a));
if (unknown.length) fail(`unknown argument(s): ${unknown.join(', ')}. Known: ${FLAGS.join(', ')}`);
const DRY_RUN = args.includes('--dry-run');
const SETTINGS_ONLY = args.includes('--settings-only');
const RECORDS_ONLY = args.includes('--records-only');
const PRUNE = args.includes('--prune');
if (SETTINGS_ONLY && RECORDS_ONLY) fail('--settings-only and --records-only are mutually exclusive');

const doRecords = !SETTINGS_ONLY;
const doSettings = !RECORDS_ONLY;

// ---------------------------------------------------------------- credentials

/**
 * The VITE_ prefix is what keeps the write key out of the bundle, so a prefixed write
 * key is not a style problem — it is a published secret. Scan the raw .env rather than
 * process.env, because process.env is polluted by the shell and would hide the file
 * that actually gets committed by mistake.
 */
if (fs.existsSync(ENV_FILE)) {
  const offenders = fs.readFileSync(ENV_FILE, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('=')[0].trim())
    .filter((k) => /^VITE_/.test(k) && /(WRITE|ADMIN|SECRET|PRIVATE|TOKEN)/i.test(k));
  if (offenders.length) {
    fail(
      `.env declares ${offenders.join(', ')}. A VITE_-prefixed key is compiled into the ` +
      'browser bundle and published. Rename it without the prefix and rotate the key — ' +
      'assume it is already public.'
    );
  }
}

const appId = process.env.ALGOLIA_APP_ID ?? process.env.VITE_ALGOLIA_APP_ID;
const indexName = process.env.ALGOLIA_INDEX_NAME ?? process.env.VITE_ALGOLIA_INDEX_NAME;
const writeKey = process.env.ALGOLIA_WRITE_API_KEY;
const searchKey = process.env.VITE_ALGOLIA_SEARCH_API_KEY;

// App ID and index name are public by design — they ship in the bundle either way — so
// reading the VITE_ forms costs nothing. Only the write key is prefix-sensitive.
if (!appId) fail('missing ALGOLIA_APP_ID (or VITE_ALGOLIA_APP_ID) in .env');
if (!indexName) fail('missing ALGOLIA_INDEX_NAME (or VITE_ALGOLIA_INDEX_NAME) in .env');
if (!writeKey) fail('missing ALGOLIA_WRITE_API_KEY in .env. It must NOT carry the VITE_ prefix.');
if (searchKey && writeKey === searchKey) {
  fail('ALGOLIA_WRITE_API_KEY is identical to VITE_ALGOLIA_SEARCH_API_KEY. A search-only key cannot write, and the failure would surface as an opaque 403.');
}

// ---------------------------------------------------------------- load + validate

if (!fs.existsSync(SETTINGS)) fail(`${path.relative(ROOT, SETTINGS)} not found`);
const settingsFile = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
if (!settingsFile.settings) fail('settings.json has no `settings` key');
if (!Array.isArray(settingsFile.replicas)) fail('settings.json has no `replicas` array');

// Keys prefixed with `_` are documentation. Assert they never reach the payload rather
// than relying on the file being shaped correctly.
const docKeys = Object.keys(settingsFile.settings).filter((k) => k.startsWith('_'));
if (docKeys.length) fail(`settings.settings contains documentation key(s) ${docKeys.join(', ')}; those must live outside the payload`);

const primarySettings = settingsFile.settings;

/** Derive the replica list from the single source of truth in settings.json. */
const replicaName = (r) => `${indexName}_${r.suffix}`;
const replicaRef = (r) => (r.type === 'virtual' ? `virtual(${replicaName(r)})` : replicaName(r));
for (const r of settingsFile.replicas) {
  if (!r.suffix) fail('a replica entry has no `suffix`');
  if (!['virtual', 'standard'].includes(r.type)) fail(`replica ${r.suffix}: type must be "virtual" or "standard", got ${JSON.stringify(r.type)}`);
  if (!r.settings || typeof r.settings !== 'object') fail(`replica ${r.suffix}: missing \`settings\``);
}
const derivedReplicas = settingsFile.replicas.map(replicaRef);

// Loaded unconditionally, including under --settings-only: the dangling-attribute
// check below needs the record schema to tell an inert setting from a working one.
if (!fs.existsSync(RECORDS)) {
  fail(`${path.relative(ROOT, RECORDS)} not found. Run \`node scripts/1-transform.js\` first — this script never transforms data.`);
}
const records = JSON.parse(fs.readFileSync(RECORDS, 'utf8'));
if (!Array.isArray(records) || records.length === 0) fail('records.json is not a non-empty array');
const missingId = records.findIndex((r) => !r.objectID);
if (missingId !== -1) fail(`record at position ${missingId} has no objectID`);
const recordIds = new Set(records.map((r) => r.objectID));
if (recordIds.size !== records.length) fail(`records.json has duplicate objectIDs (${records.length} records, ${recordIds.size} unique)`);

/**
 * Every attribute the configuration names must exist on the records, or the setting is
 * silently inert: Algolia accepts a searchableAttribute that matches no field and
 * simply never matches anything. That failure is invisible until a relevance test
 * fails for a reason nobody can find.
 */
const unwrap = (a) => a.replace(/^(unordered|searchable|filterOnly|attributeForDistinct|asc|desc)\(/, '').replace(/\)$/, '').split(',').map((s) => s.trim());
const referenced = new Set();
for (const a of primarySettings.searchableAttributes ?? []) unwrap(a).forEach((x) => referenced.add(x));
for (const a of primarySettings.attributesForFaceting ?? []) unwrap(a).forEach((x) => referenced.add(x));
for (const a of primarySettings.attributesToHighlight ?? []) referenced.add(a);
for (const a of primarySettings.numericAttributesForFiltering ?? []) referenced.add(a);
for (const a of primarySettings.customRanking ?? []) unwrap(a).forEach((x) => referenced.add(x));
for (const r of settingsFile.replicas) for (const a of r.settings.customRanking ?? []) unwrap(a).forEach((x) => referenced.add(x));

/** `searchable(city)` and `filterOnly(is_chain)` both declare a facet on the inner name. */
const unwrapFacet = (a) => a.replace(/^\w+\((.*)\)$/, '$1');

const fields = new Set(Object.keys(records[0]));
const dangling = [...referenced].filter((f) => !fields.has(f));
if (dangling.length) {
  fail(`settings.json references attribute(s) absent from records.json: ${dangling.join(', ')}. Algolia would accept these and silently never match on them.`);
}

/**
 * Query rules. Unlike synonyms this file is required, because the rules in it are
 * load-bearing: without `category-query-dining_style` and `category-query-occasions`,
 * `casual elegant` returns 0 hits and `date night` returns 6 instead of 1,639, since
 * neither attribute is in `searchableAttributes`. A missing file would degrade the
 * discovery journey silently, so it aborts instead.
 *
 * Every faceted attribute a rule filters on must be in `attributesForFaceting`, or
 * Algolia accepts the rule and the filter matches nothing.
 */
let rules = null;
if (!fs.existsSync(RULES)) fail(`${path.relative(ROOT, RULES)} is missing. It carries the category-query rules the discovery journey depends on.`);
{
  const rulesFile = JSON.parse(fs.readFileSync(RULES, 'utf8'));
  rules = rulesFile.rules;
  if (!Array.isArray(rules) || rules.length === 0) fail('rules.json must carry a non-empty `rules` array');
  const facetable = new Set((primarySettings.attributesForFaceting ?? []).map((a) => unwrapFacet(a)));
  rules.forEach((r, i) => {
    if (!r.objectID) fail(`rule at position ${i} has no objectID. Stable ids are what make a rule reviewable in a diff.`);
    if (/^qr-\d+$/.test(r.objectID)) fail(`rule ${r.objectID} carries a dashboard-generated id. Rename it to something a diff can explain.`);
    if (!r.conditions?.length || !r.consequence) fail(`rule ${r.objectID} needs both conditions and a consequence`);
    for (const f of r.consequence.params?.automaticFacetFilters ?? []) {
      const attr = typeof f === 'string' ? f : f.facet;
      if (!facetable.has(attr)) {
        fail(`rule ${r.objectID} filters on \`${attr}\`, which is not in attributesForFaceting. Algolia would accept the rule and the filter would match nothing.`);
      }
    }
  });
}

let synonyms = null;
if (fs.existsSync(SYNONYMS)) {
  synonyms = JSON.parse(fs.readFileSync(SYNONYMS, 'utf8'));
  if (!Array.isArray(synonyms)) fail('synonyms.json must be an array of synonym objects');
  const badSyn = synonyms.findIndex((s) => !s.objectID || !s.type);
  if (badSyn !== -1) fail(`synonym at position ${badSyn} is missing objectID or type`);
}

// ---------------------------------------------------------------- plan

const plan = [];
if (doSettings) {
  plan.push(`setSettings  ${indexName}  (${Object.keys(primarySettings).length} keys + replicas: ${derivedReplicas.join(', ')})`);
  for (const r of settingsFile.replicas) plan.push(`setSettings  ${replicaName(r)}  (${r.type}: ${Object.keys(r.settings).join(', ')})`);
}
if (doRecords) plan.push(`saveObjects  ${indexName}  (${records.length} records)`);
if (doSettings) plan.push(`saveRules    ${indexName}  (${rules.length} rules, replacing existing: ${rules.map((r) => r.objectID).join(', ')})`);
if (doSettings && synonyms) plan.push(`saveSynonyms ${indexName}  (${synonyms.length} synonyms, replacing existing)`);
if (PRUNE) plan.push(`browse + deleteObjects ${indexName}  (remove objectIDs absent from records.json)`);

console.log(`app       ${appId}`);
console.log(`index     ${indexName}`);
console.log(`write key ${mask(writeKey)}`);
console.log(`records   ${records.length} from ${path.relative(ROOT, RECORDS)}`);
console.log(`rules     ${rules.length} from ${path.relative(ROOT, RULES)}`);
console.log(`synonyms  ${synonyms ? `${synonyms.length} from ${path.relative(ROOT, SYNONYMS)}` : 'none — scripts/synonyms.json absent'}`);
console.log(`\nplan (${plan.length} operation${plan.length === 1 ? '' : 's'}):`);
plan.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));

if (DRY_RUN) {
  console.log('\n[dry-run] validated, no network call made. Drop --dry-run to execute.');
  process.exit(0);
}

// ---------------------------------------------------------------- push

const client = algoliasearch(appId, writeKey);

/**
 * Order matters and is not interchangeable:
 *   1. primary settings, carrying the derived `replicas` array — this is what makes
 *      Algolia create the replica indices. Settings before records so the first
 *      indexing pass already uses them.
 *   2. each replica's own settings. Algolia rejects settings on an index that does not
 *      exist yet, so this cannot precede step 1.
 *   3. records.
 * Virtual replicas inherit the primary's settings automatically, so `forwardToReplicas`
 * is deliberately not used — forwarding would overwrite the per-replica customRanking
 * that is the entire point of having them.
 */
try {
  if (doSettings) {
    process.stdout.write(`\nsetSettings ${indexName} ... `);
    const res = await client.setSettings({
      indexName,
      indexSettings: { ...primarySettings, replicas: derivedReplicas },
    });
    await client.waitForTask({ indexName, taskID: res.taskID });
    console.log('done');

    for (const r of settingsFile.replicas) {
      const name = replicaName(r);
      process.stdout.write(`setSettings ${name} ... `);
      const rr = await client.setSettings({ indexName: name, indexSettings: r.settings });
      await client.waitForTask({ indexName: name, taskID: rr.taskID });
      console.log('done');
    }
  }

  if (doRecords) {
    process.stdout.write(`saveObjects ${indexName} (${records.length} records) ... `);
    await client.saveObjects({ indexName, objects: records, waitForTasks: true });
    console.log('done');
  }

  if (doSettings) {
    // clearExistingRules so this file is the whole rule set. Without it a rule deleted
    // here would survive in the index, and the repo would stop describing what is live.
    process.stdout.write(`saveRules ${indexName} (${rules.length}) ... `);
    const rr = await client.saveRules({ indexName, rules, clearExistingRules: true });
    await client.waitForTask({ indexName, taskID: rr.taskID });
    console.log('done');
  }

  if (doSettings && synonyms) {
    process.stdout.write(`saveSynonyms ${indexName} (${synonyms.length}) ... `);
    const sr = await client.saveSynonyms({ indexName, synonymHit: synonyms, replaceExistingSynonyms: true });
    await client.waitForTask({ indexName, taskID: sr.taskID });
    console.log('done');
  }

  // Records are upserted by objectID, so a record dropped from the corpus would linger.
  // Report it always; delete only when asked, because deletion is not reversible.
  if (doRecords) {
    const live = new Set();
    await client.browseObjects({
      indexName,
      browseParams: { attributesToRetrieve: ['objectID'], hitsPerPage: 1000 },
      aggregator: (batch) => batch.hits.forEach((h) => live.add(h.objectID)),
    });
    const wanted = new Set(records.map((r) => r.objectID));
    const stale = [...live].filter((id) => !wanted.has(id));
    if (stale.length === 0) {
      console.log(`\nno stale objects: the index holds exactly the ${wanted.size} objectIDs in records.json`);
    } else if (PRUNE) {
      process.stdout.write(`\ndeleting ${stale.length} stale object(s) ... `);
      await client.deleteObjects({ indexName, objectIDs: stale, waitForTasks: true });
      console.log('done');
    } else {
      console.log(`\n${stale.length} stale object(s) in the index but not in records.json (e.g. ${stale.slice(0, 5).join(', ')}).`);
      console.log('Re-run with --prune to delete them. Not done automatically: deletion is not reversible.');
    }
  }

  console.log(`\nindexed. Search UI reads this index as VITE_ALGOLIA_INDEX_NAME=${indexName}.`);
  if (doSettings) console.log(`replicas: ${settingsFile.replicas.map((r) => replicaName(r)).join(', ')}`);
} catch (err) {
  // Algolia errors carry the status and a message but never the key; still, keep the
  // handler explicit so no client internals reach the log.
  const status = err?.status ?? err?.statusCode;
  console.error(`\nindex aborted: Algolia rejected the request${status ? ` (HTTP ${status})` : ''}: ${err?.message ?? err}`);
  if (status === 403) console.error('403 usually means the key lacks addObject/settings ACLs, or a search-only key was used.');
  process.exitCode = 1;
}
