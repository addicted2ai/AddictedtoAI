import { getSite } from '../../lib/site.mjs';
import {
  renderCatalogTable,
  renderCatalogFilters,
  renderFetchLine,
} from '../../lib/render/catalog.mjs';
import { sortNote } from '../../lib/render/common.mjs';
import { SORT_CRITERIA, providersOf, statusesOf } from '../../lib/catalog.mjs';
import CatalogFilter from '../_components/CatalogFilter';

/**
 * Every model you can call today (task 4.2, specs/directory).
 *
 * The whole table is server-rendered — all of it, not a page of it — because
 * this page's job is to be the complete answer to one recurring question.
 * Filtering happens over the rendered rows in the browser; with JavaScript
 * off you still get every row.
 */

export const metadata = {
  title: 'Model catalog',
  description:
    'Every model in the tracked feeds, with input and output price, context window and status, and the date each row was read.',
};

export default async function CatalogPage() {
  const site = await getSite();
  const rows = site.catalog;

  return (
    <>
      <p className="eyebrow">directory · standing table</p>
      <h1 className="page-title">Every model you can call today</h1>
      <p className="page-lede">
        Generated from the tracked public feeds. Prices are per million tokens, converted from the
        per-token figures the sources publish; a value the source does not publish renders as
        absent, never as an estimate.
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderFetchLine(site) }} />
      <div dangerouslySetInnerHTML={{ __html: sortNote(SORT_CRITERIA.catalog) }} />
      <p className="sort-note">
        Machine-readable: <a href="/catalog.json">/catalog.json</a> · related:{' '}
        <a href="/catalog/deprecations">deprecations &amp; retirements</a> ·{' '}
        <a href="/catalog/changed">changed in 30 days</a>
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderCatalogFilters(providersOf(rows), statusesOf(rows)) }} />
      <div dangerouslySetInnerHTML={{ __html: renderCatalogTable(rows, { id: 'catalog-table' }) }} />
      <CatalogFilter />
    </>
  );
}
