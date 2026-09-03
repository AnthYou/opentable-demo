import { useEffect } from 'react';
import { ClearRefinements, useCurrentRefinements, useStats } from 'react-instantsearch';

/**
 * The filters, as a sidebar on desktop and a full-screen sheet on mobile.
 *
 * **The facets stay mounted in both states.** Only their presentation changes, driven by
 * CSS. Rendering them conditionally would unmount the `RefinementList` widgets every time
 * the sheet closes, which discards the facet values they hold and — depending on the
 * `preserveSharedStateOnUnmount` setting — can drop the refinement itself. A filter panel
 * that forgets what you selected when you close it is worse than no panel.
 *
 * The trigger reports how many refinements are active, because on mobile the sheet hides
 * the answer: a user who has filtered and scrolled has no other way to know.
 */
export function FilterPanel({ open, onOpen, onClose, children }) {
  const { items } = useCurrentRefinements();
  const { nbHits } = useStats();

  const activeCount = items.reduce((total, item) => total + item.refinements.length, 0);

  // Escape closes the sheet, and the page behind it must not scroll while it is open.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('has-sheet');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('has-sheet');
    };
  }, [open, onClose]);

  return (
    <>
      <aside className={`filters${open ? ' filters--open' : ''}`} aria-label="Filters">
        <div className="filters-head">
          <h2>Filters</h2>
          <ClearRefinements translations={{ resetButtonText: 'Clear all' }} />
          <button type="button" className="filters-close" onClick={onClose} aria-label="Close filters">
            ✕
          </button>
        </div>

        <div className="filters-body">{children}</div>

        <div className="filters-foot">
          <button type="button" className="filters-apply" onClick={onClose}>
            {`Show ${nbHits.toLocaleString('en-US')} restaurant${nbHits === 1 ? '' : 's'}`}
          </button>
        </div>
      </aside>

      <button type="button" className="filters-toggle" onClick={onOpen} aria-expanded={open}>
        Filters
        {activeCount > 0 ? <span className="filters-toggle-count">{activeCount}</span> : null}
      </button>
    </>
  );
}
