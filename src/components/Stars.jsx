import { starFillPercent } from '../lib/format.js';

/**
 * Five-star rating, the one visual code worth keeping verbatim from the experience being
 * replaced: a number alone is read, a star row is scanned.
 *
 * Two grey stars layers with an orange one clipped over them, rather than per-star
 * glyphs, so a 4.3 renders as 4.3 and not as a rounded 4. The number stays alongside
 * because stars alone lose the precision that `popularity_score` was built to protect.
 */
export function Stars({ stars, reviews }) {
  const percent = starFillPercent(stars);
  const label = `${Number(stars).toFixed(1)} out of 5`;

  return (
    <span className="stars" title={label}>
      <span className="stars-value">{Number(stars).toFixed(1)}</span>
      <span className="stars-row" role="img" aria-label={label}>
        <span className="stars-empty" aria-hidden="true">
          ★★★★★
        </span>
        <span className="stars-full" style={{ width: `${percent}%` }} aria-hidden="true">
          ★★★★★
        </span>
      </span>
      {reviews ? <span className="stars-reviews">({reviews} reviews)</span> : null}
    </span>
  );
}
