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

/**
 * I23 (iter-08, R6 + R14's own disclosure precedent). Measured at 390x844:
 * the four elements this wraps (the lede, the fetch line, the sort note and
 * the machine-readable/related links) pushed the first stacked record's own
 * top edge to y=724.5 — the first complete record began entirely below the
 * fold. None of these four is the table itself or a value a reader needs
 * before the record they came for.
 *
 * Same disclosure primitive as `.nav-disclosure` (R14, layout.tsx) and
 * /tools' own `.listings-az`: `<details>` carries the open/expanded state
 * natively, ships `open` unconditionally so a script-less reader (or one
 * whose script has not yet run) gets every word exposed and in reading
 * order exactly as before this change (R4's own "activation, not
 * presence"), and this script only sets the default OPEN/CLOSED state to
 * match the viewport at load and again when it crosses the SAME 33.999rem
 * breakpoint R12's own stacked-record layout uses — not on every `resize`,
 * for the identical reason NAV_DISCLOSURE_SCRIPT in layout.tsx gives (an
 * address-bar show/hide during ordinary scrolling must not slam a reader's
 * own opened disclosure shut).
 *
 * NOT a fix for I23's second clause (a stacked record's own height, ~215.9px,
 * against a 120px bound): that reduction has no remaining lever this loop can
 * pull without either shortening published field VALUES (content, read-only
 * to this loop) or dropping some of the record's `data-label` attributes —
 * which I27, still open, names as an unmeasured assistive-technology
 * question. Per I23's own prescription this is the declared fallback:
 * "remove none and take the height out of the preamble alone." See the
 * iter-08 implementer report for what this does and does not close.
 */
const PREAMBLE_DISCLOSURE_SCRIPT = `try{var d=document.querySelector('.catalog-preamble');if(d){var mq=window.matchMedia('(max-width: 33.999rem)');var apply=function(matches){d.open=!matches};apply(mq.matches);mq.addEventListener('change',function(e){apply(e.matches)})}}catch(e){}`;

export default async function CatalogPage() {
  const site = await getSite();
  const rows = site.catalog;

  return (
    <>
      <p className="eyebrow">directory · standing table</p>
      <h1 className="page-title">Every model you can call today</h1>
      <details className="catalog-preamble" open>
        <summary>About this table</summary>
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
      </details>
      <script dangerouslySetInnerHTML={{ __html: PREAMBLE_DISCLOSURE_SCRIPT }} />
      <div dangerouslySetInnerHTML={{ __html: renderCatalogFilters(providersOf(rows), statusesOf(rows)) }} />
      <div dangerouslySetInnerHTML={{ __html: renderCatalogTable(rows, { id: 'catalog-table' }) }} />
      <CatalogFilter />
    </>
  );
}
