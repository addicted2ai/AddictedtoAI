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

// How many closed (docket/done/) items carry the push's `serves` value.
// `push` is the raw `policy.yml` `generative_push` object (or undefined/null
// if the key is absent); `doneItems` is the frontmatter of every file in
// docket/done/, in any order.
export function closedGenerativeCount(push, doneItems) {
  if (!push?.serves) return 0;
  return doneItems.filter((item) => item?.serves === push.serves).length;
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
// divide-by-zero) and 0 when `generative_push` names no `serves` value to
// look for. `readyItems` is the dispatcher's full `ready` list (every track
// mixed together); `track` narrows it here so the caller never has to
// pre-filter.
export function generativeShare(push, readyItems, track) {
  if (!push?.serves) return 0;
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
