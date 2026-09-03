/**
 * searchClient.js — the single Algolia client.
 *
 * One search surface, one client. Parameters live in `searchParams.js`; this file only
 * answers "which index, with which key".
 *
 * Nothing else belongs here: no parameters, no widgets, no Insights wiring.
 */

import { liteClient } from 'algoliasearch/lite';

/**
 * Vite injects only VITE_-prefixed variables into the browser bundle. That is the
 * mechanical guarantee the write key cannot reach the front end (CLAUDE.md §7), and it
 * is why nothing in `src/` may read an unprefixed variable.
 */
export const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
export const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;
export const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME;

/**
 * The front-end half of the §7 guarantee, mirroring the check in `scripts/2-index.js`.
 * Vite only injects VITE_-prefixed variables, so a variable named like a write key
 * appearing here means somebody added the prefix and the secret is now compiled into a
 * public bundle. Fail at boot rather than ship it.
 */
const leaked = Object.keys(import.meta.env).filter((k) => /^VITE_/.test(k) && /(WRITE|ADMIN|SECRET|PRIVATE|TOKEN)/i.test(k));
if (leaked.length > 0) {
  throw new Error(
    `Refusing to start: ${leaked.join(', ')} is VITE_-prefixed and therefore compiled ` +
    'into this bundle. Rename it without the prefix and rotate the key — assume it is ' +
    'already public.'
  );
}

/**
 * Fail loudly on missing configuration. This is the failure §7 warns about — "environment
 * variables, build config and asset paths fail in ways local development hides" — so the
 * message names the exact variables and both places they have to be set. A thrown error
 * here blanks the page, which is ugly but never silent; rendering it readably is
 * `App.jsx`'s job, not this file's.
 */
const missing = Object.entries({
  VITE_ALGOLIA_APP_ID: appId,
  VITE_ALGOLIA_SEARCH_API_KEY: searchApiKey,
  VITE_ALGOLIA_INDEX_NAME: indexName,
})
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  throw new Error(
    `Missing Algolia configuration: ${missing.join(', ')}. Set these in .env for local ` +
    'development and in the deployment platform\'s environment variables for a build — ' +
    'Vercel reads them from Project Settings, not from the repo.'
  );
}

export const searchClient = liteClient(appId, searchApiKey);

/**
 * Sort options for the discovery page.
 *
 * The primary index comes first and is the geo-aware default: there is no `distance`
 * replica, because a replica's order comes from stored attributes and distance depends
 * on the user's position at query time. Proximity ordering is produced by sending
 * `aroundLatLng` to the primary, where the `geo` criterion sits second in `ranking`
 * (CLAUDE.md §5).
 *
 * **Coupled to `scripts/settings.json`.** The suffixes must match `replicas[].suffix`
 * and the composition must match how `scripts/2-index.js` builds the names
 * (`${indexName}_${suffix}`). If they drift, the sort control points at an index that
 * does not exist and the failure surfaces at query time, not at build time. Labels are
 * duplicated from `replicas[].label` on purpose rather than importing settings.json,
 * which would ship the whole index configuration and its review notes to the browser.
 */
export const sortOptions = [
  { label: 'Most relevant', value: indexName },
  { label: 'Top rated', value: `${indexName}_rating_desc` },
  { label: 'Price: low to high', value: `${indexName}_price_asc` },
  { label: 'Price: high to low', value: `${indexName}_price_desc` },
];
