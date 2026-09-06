import { getSite } from '../../lib/site.mjs';
import {
  renderPlayersBoard,
  renderLeadChangeStrip,
  renderIndexLeaders,
  renderCapabilities,
} from '../../lib/render/frontier.mjs';
// RD-002 fix 2 (F-struct-4, RULES R8 / S17): the provenance value every board
// row repeats is stated ONCE above the board. /catalog already has the
// element that does exactly this for exactly these rows — reused, not
// reimplemented (IMPLEMENT.md family rules; "reuse before you draw").
import { renderFetchLine } from '../../lib/render/catalog.mjs';

/**
 * The Frontier (CP-UI-001-2, K11/K19) — new route.
 *
 * A players board: rows are organisations, columns are what the tracked
 * feeds and the wiki's own cited facts can state about them TODAY. Every
 * cell with no source renders as a labelled absence — never a guess, never
 * an average. The one index-position column the packet named is omitted in
 * full: the board carries no column it cannot source.
 *
 * The registry now HAS a `frontier` block (`separate-a-claim-from-a-fact`),
 * and it registers no metric and clears no rights — so `renderIndexLeaders`
 * below looks the metrics up, finds none cleared, and renders nothing at all.
 * That absence is a computed result: registering one cleared metric populates
 * the element with no edit to this file or to the renderer. A hard-wired empty
 * state shipped twice before and no data could ever have filled either
 * (implementer-ledger row 6).
 *
 * Fixed copy on this page carries no digit (loops/ui-loop/graph/knowledge/
 * frontier-plan.md §11.4): every number and date is inside an element
 * carrying `data-derived="frontier-<rail>"`.
 */

export const metadata = {
  title: 'The Frontier',
  description:
    'Every organisation this site tracks and its newest listed model, priced and dated from the tracked feeds, with an honest blank where the site has no source.',
};

export default async function FrontierPage() {
  const site = await getSite();
  const orgs = site.entries.filter((e: any) => e.data.kind === 'org');

  return (
    <>
      <p className="eyebrow">the frontier · players board</p>
      <h1 className="page-title">Who is shipping, and what the tracked feeds say about it</h1>
      <p className="page-lede">
        One row per organisation this site has a record for. A cell with no source renders as a
        labelled blank, not a guess — the shape of what the feeds have not yet stated is drawn as
        plainly as what they have.
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderFetchLine(site) }} />
      <div dangerouslySetInnerHTML={{ __html: renderPlayersBoard(orgs, site, site.catalogFile.rows) }} />
      <p className="sort-note">
        Sorted by organisation name, A to Z. Nothing on this site is ordered by payment. Machine-
        readable: <a href="/catalog.json">/catalog.json</a>
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderIndexLeaders(site.frontier, site.clearedMetrics) }} />
      <div dangerouslySetInnerHTML={{ __html: renderLeadChangeStrip(site.changeLines) }} />
      <div dangerouslySetInnerHTML={{ __html: renderCapabilities(site, { limit: 8 }) }} />
    </>
  );
}
