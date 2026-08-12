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
// So auto-merge is armed only for Origins whose published meaning permits the
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
//   delegated    — "the orchestrating model chose, briefed, reviewed and
//                  merged it". A review is asserted as part of the merge
//                  sequence, and auto-merge can perform the merge first.
//                  Withheld: the pull request opens and waits for the review,
//                  then a human arms the merge by hand.
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
// extracted.
export const AUTOMERGE_ORIGINS = new Set([
  "unsupervised",
  "supervised",
  "maintainer",
]);

export function originAllowsAutomerge(entry) {
  if (!entry || !entry.declaredOrigin) return false;
  return AUTOMERGE_ORIGINS.has(entry.origin);
}
