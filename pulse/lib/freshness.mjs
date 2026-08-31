/**
 * freshness.mjs — "staleness cannot hide" (specs/pulse, task 3.4).
 *
 * Computed every run into `data/derived/freshness.json`. All staleness
 * display on the site — overdue markers, tutorial banners, demotions,
 * could-not-verify marks, vanished-row as-of dates — derives from this file
 * at build time, so no page can be stale in a way the data does not admit.
 *
 * What is computed:
 *   - cited facts past their volatility interval (fast 14d, slow 120d;
 *     `static` and `dated` are never re-checked)
 *   - tutorials past `reverify_days`, and past 2× it (the demotion state)
 *   - directory listings past their verification interval or failing
 *   - broken links, from the rolling check's state
 *   - suspect sources: no change for 3× the registry's
 *     `expected_change_days` — **never the fetch cadence**, which is a
 *     different field; a source fetched hourly that has not moved in three
 *     of its own change-cycles is the silently-broken-extractor case
 *   - vanished feed rows: a declared row id absent from the latest snapshot
 *
 * No wall-clock timestamp is written into the file: everything is a function
 * of the corpus, the snapshots and the run's date.
 */

import { daysSince, paths, today, writeJson } from './core.mjs';
import { volatilityInterval } from './corpus.mjs';
import { CONFIRM_AFTER_FAILURES, LISTING_INTERVAL_DAYS, isConfirmedBroken } from './linkcheck.mjs';
import { findSlugCollisions } from './mint.mjs';

export function computeFreshness(root, { registry, corpus, derived, linkResult }) {
  const p = paths(root);
  const day = today();

  // --- cited facts --------------------------------------------------------
  const overdueFacts = [];
  for (const entry of corpus.entries) {
    if (entry.maintenance === 'dormant') continue; // "no re-check work is ever generated for it"
    for (const fact of entry.facts) {
      if (!fact || fact.source !== 'cited') continue;
      const interval = volatilityInterval(fact.volatility);
      if (interval == null) continue;
      const age = daysSince(fact.accessed);
      if (age === null || age <= interval) continue;
      overdueFacts.push({
        entry_id: entry.id,
        path: entry.path,
        field: fact.field ?? null,
        volatility: fact.volatility ?? null,
        accessed: fact.accessed ?? null,
        interval_days: interval,
        age_days: age,
        days_overdue: age - interval,
      });
    }
  }
  overdueFacts.sort((a, b) => (`${a.path}#${a.field}` < `${b.path}#${b.field}` ? -1 : 1));

  // --- tutorials ----------------------------------------------------------
  const tutorials = corpus.tutorials
    .map((t) => {
      const interval = t.reverify_days;
      const age = daysSince(t.verified_on);
      let state = 'fresh';
      if (t.archived) state = 'archived';
      else if (interval == null || age === null) state = 'undeclared';
      else if (age > interval * 2) state = 'demoted';
      else if (age > interval) state = 'stale';
      return {
        slug: t.slug,
        path: t.path,
        verified_on: t.verified_on ?? null,
        reverify_days: interval,
        age_days: age,
        state,
      };
    })
    .sort((a, b) => (a.path < b.path ? -1 : 1));

  // --- directory listings -------------------------------------------------
  const linkUrls = linkResult?.state?.urls ?? {};
  const listings = corpus.listings
    .map((l) => {
      const age = daysSince(l.last_verified);
      const record = l.url ? linkUrls[l.url] : null;
      const failures = record?.ok === false ? (record.consecutive_failures ?? 1) : 0;
      let state = 'ok';
      if (l.discontinued) state = 'discontinued';
      // specs/directory: the could-not-verify marker appears once the URL has
      // failed across two consecutive Pulse checks — one flaky timeout is not
      // a dead tool. The constant is shared with the broken-link rule so the
      // two cannot drift apart; see CONFIRM_AFTER_FAILURES in linkcheck.mjs.
      else if (isConfirmedBroken(failures)) state = 'could-not-verify';
      else if (failures > 0) state = 'failing-once';
      else if (age === null) state = 'unverified';
      else if (age > LISTING_INTERVAL_DAYS) state = 'due';
      return {
        slug: l.slug,
        path: l.path,
        url: l.url,
        entry: l.entry ?? null,
        last_verified: l.last_verified ?? null,
        age_days: age,
        interval_days: LISTING_INTERVAL_DAYS,
        consecutive_failures: failures,
        since: record?.last_ok ?? record?.last_checked ?? null,
        discontinued: l.discontinued ?? null,
        state,
      };
    })
    .sort((a, b) => (a.path < b.path ? -1 : 1));

  // --- sources ------------------------------------------------------------
  const sources = (derived?.sourceStates ?? []).map((s) => ({
    id: s.id,
    snapshot_date: s.snapshot_date,
    last_fetch_date: s.last_fetch_date,
    last_change_date: s.last_change_date,
    days_since_change: s.days_since_change,
    expected_change_days: s.expected_change_days,
    suspect_after_days: s.suspect_after_days,
    suspect: s.suspect,
    refusing: s.refusing,
    // When suspect, dependent facts display "last changed <date>" rather
    // than "checked <recent date>" (specs/pulse).
    display_date_label: s.suspect ? 'last changed' : 'last checked',
    display_date: s.suspect ? s.last_change_date : s.last_fetch_date,
  }));

  const freshness = {
    date: day,
    overdue_facts: overdueFacts,
    tutorials,
    listings,
    broken_links: linkResult?.broken ?? [],
    // Reference rot, split by what the check can be right about. `drift` is
    // the subset a repair job can close; `redirected_links` is every recorded
    // move including the legitimate ones, carried so a destination is visible
    // rather than only a status code (see linkcheck.mjs). Nothing in
    // `redirected_links` files work — a legitimate redirect that produced a
    // repair item would be an unfixable finding at the top of the queue.
    reference_drift: linkResult?.drift ?? [],
    redirected_links: linkResult?.redirected ?? [],
    // No `offline` marker here on purpose: how a run was invoked is not part
    // of the site's state, and recording it would make this file vary with
    // the flags rather than with the world. `checked` and `due` already say
    // whether the rolling check ran.
    link_check: {
      total: linkResult?.total ?? 0,
      // Loopback/private/reserved hosts the check cannot speak to — counted,
      // not hidden, so an exclusion silently swallowing links is visible.
      excluded: linkResult?.excluded ?? 0,
      // Hosts that answered but declined our user-agent (401/403/407/429).
      // Not a verdict about the link, and counted for the same reason
      // `excluded` is: nothing should leave the check invisibly.
      declined: linkResult?.declined ?? 0,
      due: linkResult?.due ?? 0,
      checked: linkResult?.checked ?? 0,
      // Counted for the same reason `excluded` and `declined` are: a redirect
      // the check decided not to act on must still be visible.
      redirected: linkResult?.redirected?.length ?? 0,
      drifted: linkResult?.drift?.length ?? 0,
      interval_days: 30,
      confirm_after_failures: CONFIRM_AFTER_FAILURES,
    },
    sources,
    vanished_feed_rows: derived?.vanished ?? [],
    // A live feed row that cannot mint because its slug lands on an existing
    // entry that does not declare it (addictedtoai-2wa) — the mirror case of
    // `vanished_feed_rows` above: there, a declared row went missing from the
    // world; here, a row the world still has cannot enter the corpus at all.
    slug_collisions: findSlugCollisions(root, registry, corpus),
    unreadable_content: corpus.unreadable ?? [],
  };

  writeJson(`${p.derived}/freshness.json`, freshness);
  return freshness;
}
