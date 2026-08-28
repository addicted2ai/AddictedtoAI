import { getSite } from '../../lib/site.mjs';
import { renderTutorialsIndex } from '../../lib/render/tutorial.mjs';

/**
 * The tutorials index (task 4.5, specs/education-dynamic).
 *
 * A demoted or archived tutorial is not listed here — that is what demotion
 * means — but its URL keeps resolving, and the note at the bottom says how
 * many are delisted rather than letting them vanish silently.
 */

export const metadata = {
  title: 'Tutorials',
  description:
    'Tutorials whose steps were actually executed, each showing the date it was last verified and what it was verified against.',
};

export default async function TutorialsIndex() {
  const site = await getSite();

  return (
    <>
      <p className="eyebrow">tutorials</p>
      <h1 className="page-title">Things you can actually run</h1>
      <p className="page-lede">
        Every tutorial here declares what it depends on, which version its steps were run against,
        and the date they were last run. When that date goes stale the page says so before the first
        step — silent staleness is a false claim on a published page.
      </p>
      <div dangerouslySetInnerHTML={{ __html: renderTutorialsIndex(site.tutorials) }} />
    </>
  );
}
