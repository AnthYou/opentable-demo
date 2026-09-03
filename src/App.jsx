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
import { paramsForQuery, looksLikeCategory, geoParams, DEMO_LOCATIONS } from './searchParams.js';
import { Hit } from './components/Hit.jsx';
import { insightsProps } from './insights.js';
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
 * `browseGeoParams` returns the label precisely so this can never be skipped.
 *
 * Two states to explain, not one. While browsing, proximity is ranking the results and
 * the user needs to know from where. Once they type, location stops ranking and saying
 * otherwise would be a lie — so the banner says which signal is in charge.
 */
function GeoBanner({ status, source, label, byCategory, waiting }) {
  // `geoParams` reports which rung of the fallback chain is actually in use, and the
  // banner has to say so — §5: "tell the user which location is in use so the results
  // are never unexplained". The IP rung gets a full sentence rather than a label,
  // because "your approximate location" alone does not explain *why* it is approximate.
  const ranking = byCategory
    ? `Nearest to ${label} first, best rated within each area.`
    : `Ranked by how well the name matches. Distance from ${label} is shown, not ranked.`;

  const explanation =
    source === 'ip'
      ? ` Your browser has not shared a location, so this is an approximate position from your network.${
          waiting && status === 'pending' ? ' Still asking — results will sharpen if you allow it.' : ''
        }`
      : '';

  return (
    <p className="geo-banner" role="status">
      {ranking}
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

/**
 * Location selector.
 *
 * The corpus is a sparse national sample with gaps where you would not expect them —
 * Chicago holds zero records, nearest 116 km away, and Boston, Atlanta and Seattle are
 * the same. A demo driven only by the browser's position looks broken from any of them
 * while behaving perfectly, so the position has to be selectable.
 *
 * "Use my location" is the default and keeps the previous behaviour: browser position if
 * granted, an approximate position from the network otherwise. The cities are the ten
 * best-covered markets.
 *
 * Their record counts are deliberately *not* shown. `DEMO_LOCATIONS` carries
 * `within25km` because it is what justifies curating the list, but a number next to a
 * city in a search UI reads as a result count, and it is not one.
 */
function LocationPicker({ value, onChange }) {
  return (
    <div className="location-picker">
      <label htmlFor="location">Searching near</label>
      <select id="location" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Use my location</option>
        {DEMO_LOCATIONS.map((location) => (
          <option key={location.label} value={location.label}>
            {location.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Applies the dial from `searchParams.js`. Geo coordinates are always sent; only
 * `aroundPrecision` changes, and it changes on what the query looks like — a category
 * gets a fine bucket so proximity orders the results, a name gets a bucket so coarse
 * that geo decides nothing.
 */
function SearchConfiguration({ geo }) {
  const { indexUiState } = useInstantSearch();
  const query = indexUiState.query ?? '';
  return <Configure {...paramsForQuery(query)} {...(geo?.params ?? {})} />;
}

/** Reads the query from context so the banner stays a pure component. */
function HeaderBanner(props) {
  const { indexUiState } = useInstantSearch();
  return <GeoBanner {...props} byCategory={looksLikeCategory(indexUiState.query ?? '')} />;
}

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
  const { position: browserPosition, status } = useGeoPosition();

  // '' means "use my real location". Anything else is a simulated city.
  const [selectedLabel, setSelectedLabel] = useState('');
  const selected = DEMO_LOCATIONS.find((location) => location.label === selectedLabel) ?? null;
  const position = selected ?? browserPosition;

  // `discoveryGeoParams` decides the rung; App only decides whether the IP rung is still
  // worth trying. `pending` sends no geo parameter at all rather than guessing, so the
  // first paint is not silently ordered by the wrong location.
  /**
   * Geo is never withdrawn, and that includes the wait.
   *
   * An earlier version returned null while the permission prompt was open, which meant
   * the first request — and everything typed until the user answered — carried no geo at
   * all. The prompt has no timeout the app controls: it stays open until dismissed.
   *
   * `geoParams(null)` falls through to `aroundLatLngViaIP`, which needs no permission and
   * is resolved server-side, so proximity is present from the very first request and is
   * simply upgraded to precise coordinates if and when the browser answers. The same path
   * covers a denial and a browser with no geolocation API.
   */
  const geo = useMemo(() => geoParams(position), [position]);

  // `<Hits hitComponent>` passes only `{ hit }`, so the user's position — which the
  // third rung of the location-label fallback needs — is closed over here.
  // `<Hits hitComponent>` passes only the record, so the user's position — which the
  // third rung of the location-label fallback needs — is closed over here. A named
  // declaration rather than an arrow plus `displayName`: assigning to the component
  // object is a mutation React treats as illegal.
  const HitComponent = useMemo(() => {
    function HitWithPosition({ hit, sendEvent }) {
      return <Hit hit={hit} userPosition={position} sendEvent={sendEvent} />;
    }
    return HitWithPosition;
  }, [position]);


  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      insights={insightsProps}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <SearchConfiguration geo={geo} />

      <header className="app-header">
        <h1>OpenTable — search &amp; discovery prototype</h1>
        <SearchBox placeholder="Search restaurants, cuisines, neighborhoods" autoFocus />
        <LocationPicker value={selectedLabel} onChange={setSelectedLabel} />
        <HeaderBanner status={status} source={geo.source} label={geo.label} waiting={selected === null} />
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
