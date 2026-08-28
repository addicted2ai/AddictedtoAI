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
import { LISTING_INTERVAL_DAYS } from './linkcheck.mjs';

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
      // a dead tool.
      else if (failures >= 2) state = 'could-not-verify';
      else if (failures === 1) state = 'failing-once';
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
    // No `offline` marker here on purpose: how a run was invoked is not part
    // of the site's state, and recording it would make this file vary with
    // the flags rather than with the world. `checked` and `due` already say
    // whether the rolling check ran.
    link_check: {
      total: linkResult?.total ?? 0,
      due: linkResult?.due ?? 0,
      checked: linkResult?.checked ?? 0,
      interval_days: 30,
    },
    sources,
    vanished_feed_rows: derived?.vanished ?? [],
    unreadable_content: corpus.unreadable ?? [],
  };

  writeJson(`${p.derived}/freshness.json`, freshness);
  return freshness;
}
