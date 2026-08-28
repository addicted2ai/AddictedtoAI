/**
 * Analytics — the GA4 tag, emitted on every page or on none (task 5.1,
 * specs/analytics).
 *
 * A server component, so the measurement ID is read once at build time and the
 * decision "analytics or silence" is baked into the exported HTML rather than
 * taken in the browser. With the variable unset this renders `null` and the
 * exported pages contain no analytics markup of any kind — *"local development
 * stays silent"*.
 *
 * The three parts, and why each is here:
 *   - the loader, `async` from googletagmanager.com (the only third-party
 *     origin on this site, and one of the three on task 4.10's allowlist);
 *   - the inline bootstrap, which defines `gtag` and configures the property
 *     with the automatic page_view **off** (see `lib/analytics.mjs`);
 *   - `RouteTracker`, which sends every page_view, including the first.
 *
 * The `data-analytics-*` attributes are hooks for the verification, not
 * configuration — `scripts/verify-analytics.mjs` uses them to state, per page,
 * that the markup it expected is the markup that shipped. They are never
 * evidence that a hit arrived; only the network is.
 */

import { bootstrapSnippet, loaderSrc, measurementIdFrom } from '../../lib/analytics.mjs';
import RouteTracker from './RouteTracker';

export default function Analytics() {
  // Throws on a set-but-malformed ID, which fails the build. A typo here would
  // otherwise ship a flawless-looking tag that reports to nobody.
  const id = measurementIdFrom(process.env);
  if (!id) return null;

  return (
    <>
      <script async src={loaderSrc(id)} data-analytics-loader={id} />
      <script
        data-analytics-config={id}
        dangerouslySetInnerHTML={{ __html: bootstrapSnippet(id) }}
      />
      <RouteTracker measurementId={id} />
    </>
  );
}
