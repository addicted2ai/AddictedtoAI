// The decaying weight boost for `serves: worth-a-visit` docket items
// (CHARTER.md test 1 -- "worth a stranger's attention"), anchored to shipped
// generative work rather than to elapsed time: a clock-based decay expires
// whether or not anything shipped, silently returning the loop to today's
// composition regardless of whether it had produced anything. See
// policy.yml's `generative_push` block, the only place the tunable numbers
// live -- every function below takes them as an argument rather than reading
// policy.yml itself, so it stays testable with numbers that never touch the
// real file.
//
//     M       = max(floor_multiplier, start_multiplier - decay_per_shipped * closedCount)
//     applied = 1 + (M - 1) * generativeShare
//
// `generativeShare` is scoped to one track's own ready stock on purpose: a
// boost applied to the aggregate queue could fire on a track holding no
// `worth-a-visit` work at all, which is the "invisible thumb on the scale"
// this item exists to rule out. scripts/dispatch.mjs is the only caller in
// the running loop; scripts/test-dispatch-generative-push.mjs imports the
// same functions so the two never drift into two copies of one formula.
//
// Both counting functions below filter to `VISITOR_FACING`
// (scripts/visitor-facing-tracks.mjs, the single definition also imported by
// scripts/check-docket.mjs) themselves, ignoring any item whose `track:` is
// not on that list regardless of what its `serves:` says. This is
// deliberate, second enforcement, not a belt-and-braces restatement of the
// filing gate: review on round 8d0098e hand-placed a `track: meta, serves:
// worth-a-visit` item directly into `docket/open/`, bypassing
// `scripts/check-docket.mjs` entirely, and got a nonzero `generativeShare`
// and `pushApplied` out of the pre-fix version of these functions -- proof
// that a comment claiming "meta's exposure is structurally 0" was false
// against this file's own code, because this file trusted the filing gate
// to have already run. `enforce_admins` is `false` on `main` and this
// repository has documented, with real merged pull requests, that its own
// account can merge past a red required check
// (docket/open/2026-08-11-branch-protection-does-not-require-review.md), so
// the filing gate is not an unconditional guarantee. Filtering here means
// `generativeShare("meta", ...)` returns `0` because this function's own
// arithmetic says so, not because nothing upstream let a `meta` item reach
// this data.

import { VISITOR_FACING } from "./visitor-facing-tracks.mjs";

// How many closed (docket/done/) items carry the push's `serves` value,
// filed under a `VISITOR_FACING` track. `push` is the raw `policy.yml`
// `generative_push` object (or undefined/null if the key is absent);
// `doneItems` is the frontmatter of every file in docket/done/, in any
// order.
export function closedGenerativeCount(push, doneItems) {
  if (!push?.serves) return 0;
  return doneItems.filter(
    (item) => VISITOR_FACING.includes(item?.track) && item?.serves === push.serves
  ).length;
}

// The multiplier M, clamped at the floor. Returns 1 (neutral -- no push) if
// `generative_push` is missing or malformed in a way that would make the
// arithmetic meaningless, rather than throwing or silently applying a boost
// nobody configured.
export function pushMultiplier(push, closedCount) {
  if (
    !push ||
    typeof push.start_multiplier !== "number" ||
    typeof push.floor_multiplier !== "number" ||
    typeof push.decay_per_shipped !== "number"
  ) {
    return 1;
  }
  const raw = push.start_multiplier - push.decay_per_shipped * closedCount;
  return Math.max(push.floor_multiplier, raw);
}

// The share of one track's ready stock that itself carries the push's
// `serves` value. 0 when the track has no ready items at all (not a
// divide-by-zero), 0 when `generative_push` names no `serves` value to look
// for, and 0 unconditionally when `track` is not in `VISITOR_FACING` --
// checked first, before looking at any item, so a `worth-a-visit` item
// somehow present under a non-visitor-facing track (the filing gate did not
// run, or ran and was merged past) cannot move this number no matter how
// many of them exist. `readyItems` is the dispatcher's full `ready` list
// (every track mixed together); `track` narrows it here so the caller never
// has to pre-filter.
export function generativeShare(push, readyItems, track) {
  if (!push?.serves) return 0;
  if (!VISITOR_FACING.includes(track)) return 0;
  const trackItems = readyItems.filter((item) => item.track === track);
  if (trackItems.length === 0) return 0;
  const generative = trackItems.filter((item) => item.serves === push.serves).length;
  return generative / trackItems.length;
}

// applied = 1 + (M - 1) * share. At share 0 this is always 1 (no boost, no
// matter how high M is); at share 1 it is M exactly.
export function pushApplied(multiplier, share) {
  return 1 + (multiplier - 1) * share;
}
