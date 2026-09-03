import { useEffect, useMemo, useState } from 'react';
import {
  ClearRefinements,
  Configure,
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  SortBy,
  Stats,
  useInstantSearch,
} from 'react-instantsearch';

import { searchClient, indexName, sortOptions } from './searchClient.js';
import { discoveryParams, discoveryGeoParams, DEFAULT_METRO } from './searchParams.js';
import { Hit } from './components/Hit.jsx';
import './App.css';

/**
 * Resolves the user's position through the §5 fallback chain: browser geolocation, then
 * IP, then a default metro. Never leaves the user geo-blocked, and always reports which
 * rung is in use so the results can be explained.
 */
function useGeoPosition() {
  // Availability is knowable during render, so it is the initial state rather than a
  // synchronous setState inside the effect.
  const [state, setState] = useState(() => ({
    position: null,
    status: 'geolocation' in navigator ? 'pending' : 'unavailable',
  }));

  useEffect(() => {
    if (state.status === 'unavailable') return undefined;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!cancelled) setState({ position: { lat: coords.latitude, lng: coords.longitude }, status: 'granted' });
      },
      () => {
        if (!cancelled) setState({ position: null, status: 'denied' });
      },
      { timeout: 8000, maximumAge: 300000 }
    );
    return () => {
      cancelled = true;
    };
    // Runs once: the browser is asked for a position a single time per session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

/**
 * §5: "tell the user which location is in use so the results are never unexplained."
 * `discoveryGeoParams` returns the label precisely so this can never be skipped.
 */
function GeoBanner({ status, label }) {
  const explanation = {
    pending: 'Finding your location…',
    granted: `Sorted by distance from ${label}.`,
    denied: `Location access declined, so results use ${label} from your network.`,
    unavailable: `Your browser cannot share a location, so results use ${DEFAULT_METRO.label}.`,
  }[status];

  return (
    <p className="geo-banner" role="status">
      {explanation}
    </p>
  );
}

/**
 * Curated entry points for the empty query. §2: the empty-query state must be a
 * destination, not a dead end.
 *
 * `occasions` carries a visible provenance note because it is derived from
 * `dining_style` + `price_tier` + `cuisine` and is not customer data — CLAUDE.md §4
 * requires that to be stated up front wherever the attribute is presented.
 */
const OCCASION_ENTRY_POINTS = ['date night', 'business lunch', 'family friendly', 'special occasion', 'group dinner'];
const CUISINE_ENTRY_POINTS = ['Steakhouse', 'Italian', 'Japanese', 'Seafood', 'Mexican', 'French'];

function CuratedEntryPoints() {
  const { indexUiState, setIndexUiState } = useInstantSearch();
  const hasQuery = Boolean(indexUiState.query);
  const hasRefinement = Boolean(indexUiState.refinementList && Object.keys(indexUiState.refinementList).length > 0);
  if (hasQuery || hasRefinement) return null;

  const refine = (attribute, value) =>
    setIndexUiState((prev) => ({ ...prev, refinementList: { ...prev.refinementList, [attribute]: [value] } }));

  return (
    <section className="curated">
      <h2>Start with an occasion</h2>
      <p className="provenance">
        Occasions are <strong>derived</strong> from dining style, price tier and cuisine — a heuristic, not
        observed customer behaviour. In production this attribute is replaced by event streams, content and
        reviews.
      </p>
      <div className="chips">
        {OCCASION_ENTRY_POINTS.map((value) => (
          <button key={value} type="button" onClick={() => refine('occasions', value)}>
            {value}
          </button>
        ))}
      </div>

      <h2>Or a cuisine</h2>
      <div className="chips">
        {CUISINE_ENTRY_POINTS.map((value) => (
          <button key={value} type="button" onClick={() => refine('cuisine', value)}>
            {value}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const { position, status } = useGeoPosition();

  // `discoveryGeoParams` decides the rung; App only decides whether the IP rung is still
  // worth trying. `pending` sends no geo parameter at all rather than guessing, so the
  // first paint is not silently ordered by the wrong location.
  const geo = useMemo(() => {
    if (status === 'pending') return null;
    return discoveryGeoParams(position, { ipFallback: status !== 'unavailable' });
  }, [position, status]);

  // `<Hits hitComponent>` passes only `{ hit }`, so the user's position — which the
  // third rung of the location-label fallback needs — is closed over here.
  const HitComponent = useMemo(() => {
    // A named declaration rather than an arrow plus `displayName`: assigning to the
    // component object is a mutation React treats as illegal.
    function HitWithPosition({ hit }) {
      return <Hit hit={hit} userPosition={position} />;
    }
    return HitWithPosition;
  }, [position]);

  return (
    <InstantSearch searchClient={searchClient} indexName={indexName} future={{ preserveSharedStateOnUnmount: true }}>
      <Configure {...discoveryParams} {...(geo?.params ?? {})} />

      <header className="app-header">
        <h1>OpenTable — search &amp; discovery prototype</h1>
        {/*
          Interim control. §6 gives the header box to Autocomplete.js in `src/autocomplete/`,
          which serves persona 1 with its own parameter set; this InstantSearch SearchBox
          drives the discovery page until that lands.
        */}
        <SearchBox placeholder="Search restaurants, cuisines, neighborhoods" autoFocus />
        <GeoBanner status={status} label={geo?.label ?? DEFAULT_METRO.label} />
      </header>

      <CuratedEntryPoints />

      <div className="layout">
        <aside className="filters">
          <ClearRefinements />

          <h2>Cuisine</h2>
          <RefinementList attribute="cuisine" searchable searchablePlaceholder="Search cuisines" limit={8} showMore />

          <h2>Style</h2>
          <RefinementList attribute="cuisine_tags" limit={6} showMore />

          <h2>Price</h2>
          <RefinementList attribute="price_range" />

          <h2>Dining style</h2>
          <RefinementList attribute="dining_style" />

          <h2>Occasion</h2>
          <p className="provenance">Derived, not observed — see above.</p>
          <RefinementList attribute="occasions" limit={7} />

          <h2>Market</h2>
          <RefinementList attribute="market" searchable limit={6} showMore />

          <h2>City</h2>
          <RefinementList attribute="city" searchable limit={6} showMore />

          <h2>Neighborhood</h2>
          <RefinementList attribute="neighborhood" searchable limit={6} showMore />
        </aside>

        <main className="results">
          <div className="results-toolbar">
            <Stats />
            <SortBy items={sortOptions} />
          </div>
          <CurrentRefinements />
          <Hits hitComponent={HitComponent} />
          <Pagination padding={2} />
        </main>
      </div>
    </InstantSearch>
  );
}
