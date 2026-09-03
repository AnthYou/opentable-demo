import { Highlight } from 'react-instantsearch';
import { formatPlace, formatPrice, formatRating, initials, tileHue } from '../lib/format.js';
import { Stars } from './Stars.jsx';
import { EVENT_CLICKED, EVENT_BOOKED } from '../insights.js';

/**
 * One result card.
 *
 * The composition follows the experience being replaced, because those codes are what a
 * diner already knows how to read: a block on the left, the name, the rating, then the
 * place and a meta line of cuisine and price. What is modernised is everything else —
 * the type scale, the spacing, a real hover state, and a rating that renders 4.3 as 4.3.
 *
 * Place gets its own line, above cuisine and price. It carries neighborhood, city, state
 * and distance, so a reader can tell where every result is and watch the distances ascend
 * down the page while proximity is leading the ranking.
 *
 * `Highlight` on the name is load-bearing rather than decorative: with typo tolerance
 * active a query for `naya` can return `Kaya`, and the row only makes sense if the
 * matched characters are marked.
 *
 * `occasions` is deliberately absent. CLAUDE.md §4 requires its provenance — derived
 * heuristically, not observed — stated wherever it appears, and a disclaimer on every
 * card is noise. It appears on the curated entry points and its facet, each carrying the
 * note once.
 *
 * The whole card opens `reserve_url`, and it does so through a real anchor on the name
 * whose hit area is expanded over the card in CSS. A click handler calling `window.open`
 * would have been fewer lines and worse: no keyboard activation, no middle-click, no
 * cmd-click, no context menu, and nothing for a screen reader to announce as a link.
 * Wrapping the card in an anchor instead is not available — `Book` is an anchor too, and
 * nesting them is invalid HTML — so the overlay is what buys link semantics without the
 * nesting. `Book` is raised above it so a booking stays its own target.
 */
export function Hit({ hit, userPosition, sendEvent }) {
  const place = formatPlace(hit, userPosition);
  const price = formatPrice(hit);
  const rating = formatRating(hit);

  const meta = [hit.cuisine, price.label].filter(Boolean);

  return (
    <article className="hit" onClick={() => sendEvent?.('click', hit, EVENT_CLICKED)}>
      <span className="hit-tile" style={{ '--tile-hue': tileHue(hit.objectID) }} aria-hidden="true">
        {initials(hit.name)}
      </span>

      <div className="hit-body">
        <h3 className="hit-name">
          {hit.reserve_url ? (
            <a className="hit-link" href={hit.reserve_url} target="_blank" rel="noreferrer">
              <Highlight attribute="name" hit={hit} />
            </a>
          ) : (
            <Highlight attribute="name" hit={hit} />
          )}
        </h3>

        {rating ? <Stars stars={hit.stars_count} reviews={rating.reviews} /> : null}

        {place.length ? <p className="hit-place">{place.join(' · ')}</p> : null}

        <p className="hit-meta">{meta.join(' · ')}</p>

        {hit.is_chain && hit.chain_name ? <p className="hit-chain">{hit.chain_name}</p> : null}
      </div>

      <a
        className="hit-book"
        href={hit.reserve_url}
        target="_blank"
        rel="noreferrer"
        data-object-id={hit.objectID}
        onClick={(event) => {
          // Conversion, not a click: this is the event the business goal is measured on.
          // `stopPropagation` so one booking does not also register as a card click.
          event.stopPropagation();
          sendEvent?.('conversion', hit, EVENT_BOOKED);
        }}
      >
        Book
      </a>
    </article>
  );
}
