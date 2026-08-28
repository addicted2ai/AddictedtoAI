import { getSite } from '../../lib/site.mjs';
import { renderEntryRow } from '../../lib/render/entry.mjs';
import { sortNote } from '../../lib/render/common.mjs';

/**
 * The wiki browse index (specs/wiki, task 4.1's listing side).
 *
 * Only indexed entries appear. Stubs are excluded **by rule, not by taste**:
 * specs/wiki says a stub "appears in no browse listing", and the decision is
 * `indexability()`'s, derived at build time from what the entry is. They stay
 * reachable through the name search and the open dataset.
 */

export const metadata = {
  title: 'Wiki',
  description: 'One typed, sourced, dated record per thing in AI.',
};

const SORT = 'name, A to Z';

export default async function WikiIndex() {
  const site = await getSite();
  const rows = site.browsable.map(renderEntryRow).join('');
  const stubs = site.entries.length - site.browsable.length;

  return (
    <>
      <p className="eyebrow">wiki</p>
      <h1 className="page-title">Every thing, typed and dated</h1>
      <p className="page-lede">
        One record per model, lab, tool, concept, technique, benchmark, dataset, paper or event.
        Every fact carries its source and the date it was read.
      </p>
      <div dangerouslySetInnerHTML={{ __html: sortNote(SORT) }} />
      <ul className="browse" dangerouslySetInnerHTML={{ __html: rows }} />
      {stubs > 0 && (
        <p className="delisted-note">
          {stubs} further {stubs === 1 ? 'entry is' : 'entries are'} data-only stubs — minted
          mechanically from the source registry, not listed here, and reachable through the search
          box above and the <a href="/data">open dataset</a>. An entry is listed once it has a prose
          body, or two facts and a timeline event, or a lifecycle status worth keeping.
        </p>
      )}
    </>
  );
}
