import { useEffect, useMemo, useState } from 'react';
import {
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
import {
  paramsForQuery,
  looksLikeCategory,
  geoParams,
  DEMO_LOCATIONS,
  DEMO_NEIGHBOURHOODS,
  findDemoPosition,
} from './searchParams.js';
import { Hit } from './components/Hit.jsx';
import { titleCase } from './lib/format.js';
import { insightsProps } from './insights.js';
import { FilterPanel } from './components/FilterPanel.jsx';
import './App.css';

/**
 * Resolves the user's position through the §5 fallback chain: browser geolocation, then
 * IP. Never leaves the user geo-blocked, and always reports which rung is in use so the
 * results can be explained.
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
 * Location selector.
 *
 * The corpus is a sparse national sample with gaps where you would not expect them —
 * Chicago holds zero records, nearest 116 km away, and Boston, Atlanta and Seattle are
 * the same. A demo driven only by the browser's position looks broken from any of them
 * while behaving perfectly, so the position has to be selectable.
 *
 * "Use my location" is the default and keeps the browser-then-IP behaviour. The cities
 * are the ten best-covered markets. Their record counts are deliberately not shown:
 * `DEMO_LOCATIONS` carries `within25km` because it is what justifies curating the list,
 * but a number beside a city in a search UI reads as a result count, and it is not one.
 *
 * The second group is the same idea one zoom level down. Markets move you between cities;
 * neighbourhoods move you inside one, which is the only way to watch proximity reorder a
 * result set that is already entirely local. Selected on corpus density like the markets —
 * see `DEMO_NEIGHBOURHOODS` for the two extra constraints that list carries.
 */
function LocationPicker({ value, onChange }) {
  return (
    <div className="location-picker">
      <label htmlFor="location">Near</label>
      <select id="location" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Use my location</option>
        <optgroup label="Cities">
          {DEMO_LOCATIONS.map((location) => (
            <option key={location.label} value={location.label}>
              {location.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Neighbourhoods">
          {DEMO_NEIGHBOURHOODS.map((location) => (
            <option key={location.label} value={location.label}>
              {location.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

/**
 * §5: "tell the user which location is in use so the results are never unexplained."
 *
 * `geoParams` reports which rung of the fallback chain is actually in use, and the banner
 * has to say so. The IP rung gets a full sentence rather than a label, because "your
 * approximate location" alone does not explain *why* it is approximate.
 */
function GeoBanner({ status, source, label, byCategory, waiting }) {
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

/** Reads the query from context so the banner stays a pure component. */
function HeaderBanner(props) {
  const { indexUiState } = useInstantSearch();
  return <GeoBanner {...props} byCategory={looksLikeCategory(indexUiState.query ?? '')} />;
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

/**
 * Curated entry points for the empty query. §2: the empty-query state must be a
 * destination, not a dead end.
 *
 * `occasions` carries a visible provenance note because it is derived from
 * `dining_style` + `price_tier` + `cuisine` and is not customer data — CLAUDE.md §4
 * requires that stated up front wherever the attribute is presented.
 */
const OCCASION_ENTRY_POINTS = [
  { value: 'date night', hint: 'Fine dining and elegant rooms' },
  { value: 'business lunch', hint: 'Steakhouses and quiet tables' },
  { value: 'family friendly', hint: 'Casual, entry price tier' },
  { value: 'special occasion', hint: 'The top price tier' },
  { value: 'group dinner', hint: 'Shareable and communal' },
];

const CUISINE_ENTRY_POINTS = ['Steakhouse', 'Italian', 'Japanese', 'Seafood', 'Mexican', 'French', 'Thai', 'Indian'];

/**
 * Illustration for an entry point.
 *
 * The file name is derived from the value by convention — `date night` resolves to
 * `/img/occasion-date-night.jpg` — so there is no second list to drift out of sync with
 * the vocabulary above. A value with no matching file loses its picture and nothing else:
 * the handler removes the element rather than leaving the browser's broken-image glyph.
 *
 * Local files rather than remote URLs, deliberately. Every `image_url` in the extract is a
 * decade-old link that now 302-redirects to the same grey placeholder (CLAUDE.md §6), which
 * is the whole argument against depending on somebody else's host for the pictures a demo
 * is judged on. These are served from `public/`.
 *
 * `alt=""` because they are decorative: the button already carries its label as text, and
 * describing the photograph would only make a screen reader read each entry point twice.
 */
function EntryImage({ kind, value, className }) {
  const slug = value.toLowerCase().replace(/\s+/g, '-');
  return (
    <img
      className={className}
      src={`/img/${kind}-${slug}.jpg`}
      alt=""
      loading="lazy"
      decoding="async"
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
    />
  );
}

function CuratedEntryPoints() {
  const { indexUiState, setIndexUiState } = useInstantSearch();
  const hasQuery = Boolean(indexUiState.query);
  const hasRefinement = Boolean(indexUiState.refinementList && Object.keys(indexUiState.refinementList).length > 0);
  if (hasQuery || hasRefinement) return null;

  const refine = (attribute, value) =>
    setIndexUiState((prev) => ({ ...prev, refinementList: { ...prev.refinementList, [attribute]: [value] } }));

  return (
    <section className="curated" aria-labelledby="curated-heading">
      <h2 id="curated-heading">Start with an occasion</h2>
      <p className="provenance">
        Occasions are <strong>derived</strong> from dining style, price tier and cuisine — a heuristic, not
        observed customer behaviour. In production this attribute is replaced by event streams, content and
        reviews.
      </p>
      <div className="cards">
        {OCCASION_ENTRY_POINTS.map(({ value, hint }) => (
          <button key={value} type="button" className="card" onClick={() => refine('occasions', value)}>
            <EntryImage kind="occasion" value={value} className="card-image" />
            <span className="card-body">
              <span className="card-title">{titleCase(value)}</span>
              <span className="card-hint">{hint}</span>
            </span>
          </button>
        ))}
      </div>

      <h2>Or a cuisine</h2>
      <div className="chips">
        {CUISINE_ENTRY_POINTS.map((value) => (
          <button key={value} type="button" onClick={() => refine('cuisine', value)}>
            <EntryImage kind="cuisine" value={value} className="chip-image" />
            {value}
          </button>
        ))}
      </div>
    </section>
  );
}

/** One facet group, so the sidebar stays declarative rather than a wall of markup. */
function Facet({ title, note, children }) {
  return (
    <section className="facet">
      <h2>{title}</h2>
      {note ? <p className="provenance">{note}</p> : null}
      {children}
    </section>
  );
}

export default function App() {
  const { position: browserPosition, status } = useGeoPosition();

  // '' means "use my real location". Anything else is a simulated city.
  const [selectedLabel, setSelectedLabel] = useState('');

  // Mobile only: the filters live in a sheet the user opens. Desktop ignores this — the
  // sidebar is always visible there, and the state simply never changes.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selected = findDemoPosition(selectedLabel);
  const position = selected ?? browserPosition;

  /**
   * Geo is never withdrawn, and that includes the wait. `geoParams(null)` falls through
   * to `aroundLatLngViaIP`, which needs no permission and is resolved server-side, so
   * proximity is present from the very first request and is simply upgraded to precise
   * coordinates if and when the browser answers.
   */
  const geo = useMemo(() => geoParams(position), [position]);

  // `<Hits hitComponent>` passes only the record and `sendEvent`, so the user's position
  // — which the third rung of the location-label fallback needs — is closed over here. A
  // named declaration rather than an arrow plus `displayName`: assigning to the component
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
        <div className="app-header-inner">
          <p className="brand">
            OpenTable <span>search &amp; discovery prototype</span>
          </p>
          <div className="search-row">
            <SearchBox
              placeholder="Restaurant, cuisine or neighbourhood"
              autoFocus
              searchAsYouType
              resetIconComponent={() => <span aria-hidden="true">✕</span>}
              submitIconComponent={() => <span aria-hidden="true">Search</span>}
            />
            <LocationPicker value={selectedLabel} onChange={setSelectedLabel} />
          </div>
          <HeaderBanner status={status} source={geo.source} label={geo.label} waiting={selected === null} />
        </div>
      </header>

      <CuratedEntryPoints />

      <div className="layout">
        <FilterPanel open={filtersOpen} onOpen={() => setFiltersOpen(true)} onClose={() => setFiltersOpen(false)}>
          <Facet title="Cuisine">
            <RefinementList attribute="cuisine" searchable searchablePlaceholder="Search cuisines" limit={8} showMore />
          </Facet>
          <Facet title="Style">
            <RefinementList attribute="cuisine_tags" limit={6} showMore />
          </Facet>
          <Facet title="Price">
            <RefinementList attribute="price_range" />
          </Facet>
          <Facet title="Dining style">
            <RefinementList attribute="dining_style" />
          </Facet>
          <Facet title="Occasion" note="Derived from dining style, price and cuisine — not observed behaviour.">
            <RefinementList
              attribute="occasions"
              limit={7}
              transformItems={(items) => items.map((item) => ({ ...item, label: titleCase(item.label) }))}
            />
          </Facet>
          <Facet title="Market">
            <RefinementList attribute="market" searchable searchablePlaceholder="Search markets" limit={6} showMore />
          </Facet>
          <Facet title="City">
            <RefinementList attribute="city" searchable searchablePlaceholder="Search cities" limit={6} showMore />
          </Facet>
          <Facet title="Neighbourhood">
            <RefinementList attribute="neighborhood" searchable searchablePlaceholder="Search neighbourhoods" limit={6} showMore />
          </Facet>
        </FilterPanel>

        <main className="results">
          <div className="results-toolbar">
            <Stats />
            <label className="sort">
              Sort
              <SortBy items={sortOptions} />
            </label>
          </div>
          <CurrentRefinements
            /*
             * The chips echo the stored value, so they need the same treatment as the
             * facet list — scoped to `occasions`, since every other attribute is already
             * capitalised and blanket-casing would rewrite values such as `$30 and under`.
             */
            transformItems={(items) =>
              items.map((item) =>
                item.attribute === 'occasions'
                  ? {
                      ...item,
                      refinements: item.refinements.map((r) => ({ ...r, label: titleCase(r.label) })),
                    }
                  : item
              )
            }
          />
          <Hits hitComponent={HitComponent} />
          <Pagination padding={2} />
        </main>
      </div>
    </InstantSearch>
  );
}
