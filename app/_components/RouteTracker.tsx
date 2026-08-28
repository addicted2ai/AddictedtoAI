'use client';

/**
 * RouteTracker — the only thing on this site that sends a `page_view`
 * (task 5.1, specs/analytics).
 *
 * **The failure this exists to prevent.** The App Router navigates
 * client-side: after the first load, clicking a link swaps the page without a
 * document load. gtag's automatic page_view fires once, on that first load,
 * and never again — so a visitor who reads eight pages is recorded as one
 * single-page session. *"On load only counts one page per visit and
 * undercounts everything a visitor clicks."* Real traffic then looks like a
 * trickle, and the loop reads that trickle as "nobody comes here".
 *
 * So this watches the pathname and sends the event itself. gtag's automatic
 * send is disabled in the bootstrap (`send_page_view: false`,
 * `lib/analytics.mjs`), which makes this component the single sender on first
 * load *and* on every navigation — exactly one `page_view` per page, by
 * construction rather than by two mechanisms agreeing not to overlap.
 *
 * Deliberately not used: `useSearchParams`. Under `output: 'export'` it forces
 * a page out of static rendering, and the query string is read straight off
 * `window.location` here at no cost.
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    /** Test hook: every page_view this component has sent, in order. */
    __ataiPageViews?: string[];
  }
}

export default function RouteTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();

  // The last URL a page_view was sent for. Guards the one way this component
  // could produce the double-fire it is meant to prevent: an effect that runs
  // twice for the same route (React's development double-invoke, a re-render
  // that does not change the path). It compares URLs rather than counting, so
  // a genuine A -> B -> A still sends three.
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (!measurementId) return;
    const url = window.location.pathname + window.location.search;
    if (sent.current === url) return;
    const kind = sent.current === null ? 'load' : 'route';
    sent.current = url;

    if (typeof window.gtag !== 'function') return; // tag blocked or not yet on the page
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: url,
      page_title: document.title,
      send_to: measurementId,
      // Stamped for two reasons, one operational and one that is the whole
      // point of task 5.2. Operationally it separates landings from
      // click-throughs in the property, which is the shape of the signal the
      // loop wants. More importantly it makes the hit *attributable*: GA4's
      // Enhanced Measurement ("page changes based on browser history events")
      // ALSO sends a page_view on pushState, from the property's own settings,
      // which no code here controls. Without this marker the click-through
      // assertion passes on Enhanced Measurement's hit even when this
      // component has been deleted — measured, not supposed: with the tracker
      // disabled the assertion passed on a hit carrying no marker. An
      // assertion that cannot tell whose event it caught is not testing this
      // component at all.
      atai_nav: kind,
    });

    // Not analytics: a record of what this component did, for the verification
    // to read back when a hit is missing and the question is whether the
    // tracker stayed silent or the network swallowed it.
    (window.__ataiPageViews ??= []).push(url);
  }, [pathname, measurementId]);

  return null;
}
