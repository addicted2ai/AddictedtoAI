import { getSite } from '../../lib/site.mjs';
import { renderToolsIndex } from '../../lib/render/tools.mjs';

/**
 * The curated tools directory (task 4.3, specs/directory).
 *
 * Every listing links a wiki entry, carries a `last_verified` date, and shows
 * whatever marker the Pulse's rolling link check earned it. Nothing here is
 * ordered by payment and the page says so.
 */

export const metadata = {
  title: 'Tools',
  description:
    'Curated tool listings, each with its canonical URL, pricing model, verification date and wiki entry. No paid placement, ever.',
};

export default async function ToolsPage() {
  const site = await getSite();

  return (
    <>
      <p className="eyebrow">directory</p>
      <h1 className="page-title">Tools worth knowing about</h1>
      <p className="page-lede">
        Curated by hand, each linked to its wiki entry and re-checked on a rolling cadence. A
        listing whose site stops answering keeps its place with a visible marker — a dead tool is a
        record, not an embarrassment.
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderToolsIndex(site.tools, site.corpus.byId) }} />
    </>
  );
}
