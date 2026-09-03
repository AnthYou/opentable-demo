import { Highlight } from 'react-instantsearch';
import { resolveLocationLabel, formatPrice, formatRating } from '../lib/format.js';
import { EVENT_CLICKED, EVENT_BOOKED } from '../insights.js';

/**
 * One result card.
 *
 * `Highlight` on the name is load-bearing rather than decorative: with typo tolerance
 * active a query for `naya` can return `Kaya`, and the result is only comprehensible if
 * the matched characters are marked.
 *
 * `occasions` is deliberately absent from the card. CLAUDE.md §4 requires its provenance
 * — derived heuristically, not observed — to be stated wherever it is presented, and a
 * disclaimer on every card is noise. It appears instead on the curated entry points and
 * the facet, each carrying the note once.
 */
export function Hit({ hit, userPosition, sendEvent }) {
  const location = resolveLocationLabel(hit, userPosition);
  const price = formatPrice(hit);
  const rating = formatRating(hit);

  return (
    // The click event fires on the card, the conversion on the booking link. Both go
    // through `sendEvent`, which is what attaches the queryID of the search that
    // produced this hit — see `insights.js`.
    <article className="hit" onClick={() => sendEvent?.('click', hit, EVENT_CLICKED)}>
      <img className="hit-image" src={hit.image_url} alt="" loading="lazy" width="120" height="90" />

      <div className="hit-body">
        <h3 className="hit-name">
          <Highlight attribute="name" hit={hit} />
        </h3>

        <p className="hit-location">
          {location}
          {hit.is_chain && hit.chain_name ? <span className="hit-chain"> · {hit.chain_name}</span> : null}
        </p>

        <p className="hit-meta">
          <span>{hit.cuisine}</span>
          {price.glyphs ? <span title={price.label}> · {price.glyphs}</span> : null}
          {hit.dining_style ? <span> · {hit.dining_style}</span> : null}
        </p>

        {rating ? (
          <p className="hit-rating">
            <strong>{rating.stars}</strong>
            {rating.reviews ? <span className="hit-reviews"> ({rating.reviews} reviews)</span> : null}
          </p>
        ) : null}
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
        Book a table
      </a>
    </article>
  );
}
