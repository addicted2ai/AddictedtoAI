import { getSite } from '../../../lib/site.mjs';
import { renderDeprecationsTable, renderFetchLine } from '../../../lib/render/catalog.mjs';
import { sortNote } from '../../../lib/render/common.mjs';
import { SORT_CRITERIA } from '../../../lib/catalog.mjs';

/**
 * Deprecations and retirements (task 4.2, specs/directory).
 *
 * *"Retirements are first-class data here, not footnotes; vendors delete this
 * record and this site keeps it."* Which is why this is a standing page with
 * its own URL and its own JSON sibling rather than a filter on the catalog.
 */

export const metadata = {
  title: 'Deprecations and retirements',
  description:
    'Every model the tracked feeds report as deprecated, retired or dead, with dates and sources. Kept after the vendor deletes theirs.',
};

export default async function DeprecationsPage() {
  const site = await getSite();

  return (
    <>
      <p className="eyebrow">directory · standing table</p>
      <h1 className="page-title">Deprecations and retirements</h1>
      <p className="page-lede">
        Every model the tracked feeds report as deprecated, retired or dead. Nothing is removed from
        this page when a vendor removes it from theirs — the lifecycle record is the point.
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderFetchLine(site) }} />
      <div dangerouslySetInnerHTML={{ __html: sortNote(SORT_CRITERIA.deprecations) }} />
      <p className="sort-note">
        Machine-readable: <a href="/catalog/deprecations.json">/catalog/deprecations.json</a>
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderDeprecationsTable(site.deprecations) }} />
    </>
  );
}
