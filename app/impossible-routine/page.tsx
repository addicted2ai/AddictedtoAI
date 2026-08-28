import { getSite } from '../../lib/site.mjs';
import { renderDeltasIndex } from '../../lib/render/delta.mjs';

/**
 * Impossible → Routine (task 4.14, specs/site) — the showpiece.
 *
 * *"this surface's whole job is to demonstrate the field's pace with receipts
 * instead of asserting it, and dated pairs do not perish."*
 *
 * The page's own copy obeys the same rule it enforces on the deltas: it names
 * what a delta is and how it is built, and makes no claim about the field
 * that the dates below do not already make.
 */

export const metadata = {
  title: 'Impossible → Routine',
  description:
    'Capabilities that were research results, and the dated moment each became a commodity operation. Both ends dated, both ends sourced.',
};

export default async function ImpossibleRoutinePage() {
  const site = await getSite();

  return (
    <>
      <p className="eyebrow">the record of what stopped being hard</p>
      <h1 className="page-title">Impossible → Routine</h1>
      <p className="page-lede">
        Each pair below is one capability with two dates: the day it was a research result, and the
        day it became something anyone could buy. Both ends carry a source. An end without one does
        not publish — the build refuses it.
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderDeltasIndex(site.deltas) }} />
      <p className="sort-note">
        The same pairs as data: <a href="/dataset/deltas.csv">/dataset/deltas.csv</a>
      </p>
    </>
  );
}
