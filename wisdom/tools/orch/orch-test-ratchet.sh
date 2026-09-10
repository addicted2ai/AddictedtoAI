#!/usr/bin/env bash
# Prove the test-count ratchet in orch-gates-only.sh on FIXTURE FILES.
#
# STATED LIMIT, because a proof that overstates itself is the defect it is
# meant to catch: this exercises the ratchet's PREDICATE — history parsing, the
# comparison, and the append/no-append decision — against real files on disk.
# It does NOT run orch-gates-only.sh end to end, so it does not prove the
# wiring (that $PASSED, $HEAD_SHA and $S are in scope where the block sits).
# The wiring is checked separately by `bash -n` plus reading the definitions:
# HEAD_SHA is set before the pin, PASSED immediately above the block, S at the
# top. Anyone who changes the script's structure must re-check that by hand.
#
# FIXTURES ARE FILES, never strings piped through another shell. Twice on
# 2026-09-08 a synthetic fixture routed through shell escaping produced a FALSE
# RED and nearly had me "fix" working code.
set -uo pipefail
T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
FAILS=0
check() { # name expected actual
  if [ "$2" = "$3" ]; then echo "  PASS  $1"; else echo "  FAIL  $1: expected [$2] got [$3]"; FAILS=$((FAILS+1)); fi
}

# The predicate, copied verbatim from orch-gates-only.sh. If you edit one, edit
# both — and the copy is why the limit above is stated.
last_of() { grep -oE '^[^	]*	[^	]*	[0-9]+' "$1" 2>/dev/null | grep -oE '[0-9]+$' | tail -1; }

echo "== 1. absent history establishes a baseline rather than refusing =="
H="$T/absent.tsv"
check "no last count" "" "$(last_of "$H")"

echo "== 2. a plain history reads its LAST count, not its first or its max =="
H="$T/plain.tsv"
printf '2026-09-08 10:00:00\taaaaaaa\t1700\n' >  "$H"
printf '2026-09-08 11:00:00\tbbbbbbb\t1740\n' >> "$H"
printf '2026-09-08 12:00:00\tccccccc\t1725\n' >> "$H"
check "last is 1725" "1725" "$(last_of "$H")"

echo "== 3. a hand-written line WITH A REASON still parses (the documented escape) =="
H="$T/reason.tsv"
printf '2026-09-08 10:00:00\taaaaaaa\t1725\n' >  "$H"
printf '2026-09-08 13:00:00\tddddddd\t1699\tdeleted the duplicated alias suite, deliberate\n' >> "$H"
check "last is 1699" "1699" "$(last_of "$H")"

echo "== 4. RED: a fall refuses and appends NOTHING (the baseline must not move) =="
H="$T/fall.tsv"
printf '2026-09-08 12:00:00\tccccccc\t1725\n' > "$H"
BEFORE=$(wc -l < "$H"); LAST=$(last_of "$H"); PASSED=1724
if [ "$PASSED" -lt "$LAST" ]; then VERDICT=refused; else VERDICT=accepted; printf 'x\ty\t%s\n' "$PASSED" >> "$H"; fi
AFTER=$(wc -l < "$H")
check "one fewer test refuses"        "refused" "$VERDICT"
check "history unchanged on a refusal" "$BEFORE" "$AFTER"
check "baseline still 1725"            "1725"    "$(last_of "$H")"

echo "== 5. GREEN: steady and rising both accept and DO append =="
for pair in "1725 steady" "1726 rose"; do
  set -- $pair; P=$1; LBL=$2
  H="$T/ok-$P.tsv"; printf '2026-09-08 12:00:00\tccccccc\t1725\n' > "$H"
  LAST=$(last_of "$H")
  if [ "$P" -lt "$LAST" ]; then VERDICT=refused; else VERDICT=accepted; printf 'x\ty\t%s\n' "$P" >> "$H"; fi
  check "$LBL ($P) accepts"       "accepted" "$VERDICT"
  check "$LBL appends new last"   "$P"       "$(last_of "$H")"
done

echo "== 6. THE MUTATION THAT MATTERS: the floor alone cannot catch case 4 =="
# 1724 is ABOVE the 1700 floor, so the floor reports green on a real loss.
TEST_FLOOR=1700; PASSED=1724
[ "$PASSED" -lt "$TEST_FLOOR" ] && FLOORSAYS=refused || FLOORSAYS=green
check "floor calls a 1-test loss green" "green" "$FLOORSAYS"

echo
[ "$FAILS" -eq 0 ] && echo "ALL RATCHET CHECKS PASS" || echo "$FAILS CHECK(S) FAILED"
exit "$FAILS"
