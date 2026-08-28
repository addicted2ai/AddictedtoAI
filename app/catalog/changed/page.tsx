import { getSite } from '../../../lib/site.mjs';
import { renderChangedTable } from '../../../lib/render/catalog.mjs';
import { sortNote } from '../../../lib/render/common.mjs';
import { SORT_CRITERIA } from '../../../lib/catalog.mjs';
import { changedFeed } from '../../../lib/changes.mjs';

/**
 * What changed recently (task 4.2, specs/directory).
 *
 * The same diff history the home page leads with, cut to the trailing 30 days
 * by the Pulse and rendered as a table rather than a rail. The Pulse decides
 * the window; the page does not re-derive it.
 */

export const metadata = {
  title: 'Changed in the last 30 days',
  description:
    'Price moves, status changes, releases and retirements observed in the tracked feeds over the last 30 days.',
};

export default async function ChangedPage() {
  const site = await getSite();
  const lines = changedFeed(site.tables.changed_30d ?? [], { entries: site.corpus.entry });

  return (
    <>
      <p className="eyebrow">directory · standing table</p>
      <h1 className="page-title">Changed in the last 30 days</h1>
      <p className="page-lede">
        Derived from the diff between consecutive source snapshots. Every row carries the source row
        it was read from; nothing here is a judgment about what the change means.
      </p>
      <div dangerouslySetInnerHTML={{ __html: sortNote(SORT_CRITERIA.changed) }} />
      <p className="sort-note">
        Machine-readable: <a href="/catalog/changed.json">/catalog/changed.json</a> · as a feed:{' '}
        <a href="/feeds/changes.xml">RSS</a>
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderChangedTable(lines) }} />
    </>
  );
}
