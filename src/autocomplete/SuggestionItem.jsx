import { Highlight } from 'react-instantsearch';
import { resolveLocationLabel, formatPrice } from '../lib/format.js';

/**
 * One row in the header dropdown — persona 1, known-item.
 *
 * This directory used to be earmarked for an Autocomplete.js instance. It is now the
 * item renderer for react-instantsearch's own `<Autocomplete>` widget, which takes a
 * per-index `searchParameters` object and so preserves the parameter separation §6
 * asked for without a second library. See CLAUDE.md §6.
 *
 * Three things the row has to carry, each traceable to a measured pain:
 *
 * - **Highlighted name.** Typo tolerance can answer `naya` with `Kaya`; without the
 *   matched characters marked, the row looks like a bug.
 * - **A location that actually disambiguates.** `resolveLocationLabel` appends distance
 *   on the 18 records flagged `location_label_ambiguous`, where the label alone renders
 *   identically — Fleming's Steakhouse 40036 and 39919 both read "Scottsdale".
 * - **Few rows.** `knownItemParams` caps the dropdown at five, because a query for
 *   `ruth` matches 31 near-identical Ruth's Chris rows and 31 of those is a dead end
 *   rather than a suggestion list (test-queries.md K17).
 *
 * §6: "Selecting a suggestion in the dropdown goes straight to the restaurant." There is
 * no restaurant detail page in this prototype, so the closest real destination is the
 * booking page — which also makes the row the natural place to fire the conversion
 * event once `insights.js` lands.
 */
export function SuggestionItem({ item, onSelect, userPosition }) {
  const location = resolveLocationLabel(item, userPosition);
  const price = formatPrice(item);

  return (
    <a
      className="suggestion"
      href={item.reserve_url}
      target="_blank"
      rel="noreferrer"
      onClick={onSelect}
      data-object-id={item.objectID}
    >
      <img className="suggestion-image" src={item.image_url} alt="" loading="lazy" width="44" height="44" />
      <span className="suggestion-text">
        <span className="suggestion-name">
          <Highlight attribute="name" hit={item} />
        </span>
        <span className="suggestion-meta">
          {location}
          {item.cuisine ? ` · ${item.cuisine}` : ''}
          {price.glyphs ? ` · ${price.glyphs}` : ''}
        </span>
      </span>
    </a>
  );
}
