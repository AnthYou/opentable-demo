import { liteClient } from 'algoliasearch/lite';

// Search-only credentials. Vite exposes VITE_-prefixed variables to the bundle,
// which is the mechanical guarantee that the write key cannot leak here.
export const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
export const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;
export const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME;

if (!appId || !searchApiKey || !indexName) {
  throw new Error(
    'Missing Algolia configuration. Set VITE_ALGOLIA_APP_ID, ' +
      'VITE_ALGOLIA_SEARCH_API_KEY and VITE_ALGOLIA_INDEX_NAME in .env'
  );
}

export const searchClient = liteClient(appId, searchApiKey);
