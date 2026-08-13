// Decide whether scripts/round.mjs `ship` may arm auto-merge for a round.
//
// `ship`'s final act is `gh pr merge --auto --squash`: a *request*, never a
// merge. GitHub performs it the moment the required checks pass. For most
// rounds that is the point of the whole file. But a round's Origin is a
// published claim about what read the work before it landed, and auto-merge
// performs the merge at the earliest legal moment — which can be *before*
// that reading happened. The site then publishes a claim an oversight step
// that never occurred. Round 85 is the instance: it declared `Origin:
// delegated` and its pull request auto-merged at 01:36 while its review
// session was still running, with zero reviews and zero comments on the pull
// request. The work turned out to be sound — but the guarantee that the
// record promised, that something read it before it merged, had not been
// delivered. A gate that only matters when the work is bad is not a gate; it
// has to hold for every round carrying an Origin that promises a review.
//
// So auto-merge is armed for the Origins whose published meaning permits the
// merge to happen with nothing having read the work:
//
//   unsupervised — "scheduled, merged itself, nobody read it first". The value
//                  *is* the statement that nothing read it; auto-merge is
//                  exactly the claim. Allowed.
//   supervised   — "a human triggered the run and could veto before merge".
//                  The claim is a veto *capability*, not a performed review.
//                  Arming auto-merge leaves the human able to veto — they can
//                  close the pull request before GitHub merges — so the
//                  meaning stays true either way. Allowed.
//   maintainer   — "a human decided what and why; an assistant did the
//                  typing". The claim is who directed the work, not that
//                  anyone read the result before merge; auto-merge does not
//                  falsify it. Allowed.
//
// `delegated` is NOT here. Its published meaning is "the orchestrating model
// chose, briefed, reviewed and merged it" — a performed review, which
// auto-merge can beat. Round 85 was that failure: it declared `Origin:
// delegated` and auto-merged while its review session was still running. It
// was withheld entirely until the review had a shape that can be checked: a
// file in `docket/reviews/` that approves and covers the merged tree. Now
// `ship` arms a delegated round only when that artifact exists, by running
// `scripts/check-review-artifact.mjs` — the same check CI runs — and refuses
// to arm when it does not, saying why. The gate lives in the arming, not in
// CI: the `review-artifact` job in `.github/workflows/pr-checks.yml` is a
// *visible* check, not a required one (the required list is `build-and-audit`
// and `human-owned-paths`), so GitHub's auto-merge would ignore it. Until the
// maintainer promotes it to a required check — a settings change, see the
// docket item — this arming gate is the only thing that holds.
//
// A round that declares no Origin, or one the parser cannot read, is withheld
// too (fail closed): `ship` runs after the entry is written, so this is
// reachable, and a record that cannot vouch for what read the work must not
// be merged by nothing. The build already rejects such an entry — check-routes.sh
// pins the count of undeclared rounds at 47 — so a round reaching `ship` with
// no Origin has already failed the charge it was written to meet.
//
// This module parses nothing. The one parser for this field is
// app/lib/build-log.js, and `ship` reads the Origin through it; a second
// parser that could disagree with the first is the bug this repository keeps
// shipping. This module only decides, from the fields that parser already
// extracted. It also does not implement the review-artifact rule; that is
// scripts/check-review-artifact.mjs, and `ship` runs it. A second
// implementation of the rule is the same bug in another hat.
export const AUTOMERGE_ORIGINS = new Set([
  "unsupervised",
  "supervised",
  "maintainer",
]);

export function originAllowsAutomerge(entry) {
  if (!entry || !entry.declaredOrigin) return false;
  return AUTOMERGE_ORIGINS.has(entry.origin);
}
