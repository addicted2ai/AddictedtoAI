// The tracks whose work is visitor-facing -- the only ones that can
// plausibly argue CHARTER.md test 1 ("worth a stranger's attention if they
// never learned an AI made it"). `author` publishes and `build` ships things
// in `app/` and `public/`. `scout` only files items for other tracks to act
// on (see policy.yml's `feeds: [author]`) and `meta` only fixes the
// machinery the other tracks run on; neither produces anything a visitor
// sees, so neither can claim the value that names test 1, even though both
// are advancing (not defending) tracks. `maintain`/`audit` are excluded on a
// separate basis -- they are defending tracks, exempt from test 1 by
// CHARTER.md design -- and are not read from this list; see `DEFENDING` in
// scripts/check-docket.mjs.
//
// Single source of truth, imported by both places that need it, so a future
// edit cannot update one and silently leave the other stale -- exactly the
// duplicated-rate-card defect this repository has already shipped once
// (round 3's rate card, caught by review, recorded in CHANGELOG.md) and is
// not repeating here:
//
//   - scripts/check-docket.mjs rejects `worth-a-visit` filed under any track
//     not on this list -- the filing gate, a required CI check.
//   - scripts/generative-push.mjs filters `closedGenerativeCount` and
//     `generativeShare` to this list directly, so an item carrying
//     `worth-a-visit` under a non-visitor-facing track contributes nothing
//     to the push regardless of whether it reached docket/open/ or
//     docket/done/ through the filing gate at all -- the code-level
//     guarantee.
//
// Both are deliberate, not redundant. The filing gate is a required check,
// but `enforce_admins` is `false` on `main` and this repository has already
// documented (docket/open/2026-08-11-branch-protection-does-not-require-review.md,
// verified with real merged pull requests, #16/#25/#27) that the account
// this loop pushes and merges as can merge past a red required check. A
// guarantee that rested on the filing gate alone would be exactly as strong
// as that gate's enforcement -- which is not unconditional in this
// repository today. Filtering here as well means `generativeShare("meta")`
// is genuinely always `0` in the arithmetic itself, not merely blocked
// upstream of it. Reviewed and added on round 8d0098e, after review proved
// the filing gate alone with a hand-placed `docket/open/` item that bypassed
// it entirely.
export const VISITOR_FACING = ["author", "build"];
