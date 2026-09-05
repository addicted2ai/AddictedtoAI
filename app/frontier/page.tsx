import { getSite } from '../../lib/site.mjs';
import { renderPlayersBoard, renderLeadChangeStrip, renderCapabilities } from '../../lib/render/frontier.mjs';

/**
 * The Frontier (CP-UI-001-2, K11/K19) — new route.
 *
 * A players board: rows are organisations, columns are what the tracked
 * feeds and the wiki's own cited facts can state about them TODAY. Every
 * cell with no source renders as a labelled absence — never a guess, never
 * an average. The one index-position column the packet named is omitted in
 * full: no registry `frontier` block and no independent index exists in this
 * repo yet (red-team ground truth, RT-CP-UI-001-2-1), so the board carries no
 * column it cannot source.
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
      <div dangerouslySetInnerHTML={{ __html: renderPlayersBoard(orgs, site, site.catalogFile.rows) }} />
      <p className="sort-note">
        Sorted by organisation name, A to Z. Nothing on this site is ordered by payment. Machine-
        readable: <a href="/catalog.json">/catalog.json</a>
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderLeadChangeStrip(site.changeLines) }} />
      <div dangerouslySetInnerHTML={{ __html: renderCapabilities(site, { limit: 8 }) }} />
    </>
  );
}
