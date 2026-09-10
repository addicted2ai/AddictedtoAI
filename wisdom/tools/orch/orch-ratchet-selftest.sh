#!/usr/bin/env bash
# THE RATCHET'S REFUSAL AND ITS ESCAPE HATCH, EXERCISED BEFORE I NEED THEM.
#
# WHY NOW. Round 3 of W1 will DELETE tests deliberately, so the ratchet will
# refuse a decrease that is correct, and the documented recovery is "append a
# line to the history naming the reason, then re-run". NEITHER PATH HAS EVER
# RUN. The refusal has never fired — every recorded run rose or held — and the
# hand-written line has never been parsed by the reader that must accept it. A
# recovery path discovered during an incident is a second incident, and the one
# thing worse than a guard that has never returned false is a guard whose
# ESCAPE has never been taken.
#
# This exercises the reader expression from orch-gates-only.sh against COPIES.
# It is a copy of the expression, which is the weaker kind of evidence and is
# labelled so; what it can prove is that the shapes parse as intended.
T=$(mktemp -d)
HIST="$T/hist.tsv"
read_last() {  # the expression from orch-gates-only.sh, verbatim
  grep -oE '^[^	]*	[^	]*	[0-9]+' "$1" 2>/dev/null | grep -oE '[0-9]+$' | tail -1
}
ok() { [ "$1" = "$2" ] && echo "  OK   $3 -> $1" || { echo "  FAIL $3 -> got '$1', wanted '$2'"; FAIL=1; }; }
FAIL=0

printf '2026-09-09 23:31:14\t95bb03e\t1819\n' > "$HIST"
ok "$(read_last "$HIST")" 1819 "plain baseline line"

# A RISE, written by the harness itself.
printf '2026-09-10 01:20:00\tabc1234\t1885\n' >> "$HIST"
ok "$(read_last "$HIST")" 1885 "harness-written rise"

# THE HAND-WRITTEN DECREASE, the escape hatch, in the form a person would type:
# a fourth tab-separated field carrying prose, WITH DIGITS IN IT, which is the
# case most likely to fool a trailing-digit extractor.
printf '2026-09-10 01:40:00\tdef5678\t1816\tlegitimate: 69 tests deleted with the 7 linter arms they bound (W1 round 3)\n' >> "$HIST"
ok "$(read_last "$HIST")" 1816 "hand-written decrease with a reason containing digits"

# The same reason written with SPACES rather than a tab, which is what someone
# typing quickly at 01:40 actually does.
printf '2026-09-10 01:45:00\tdef5678\t1810 legitimate: 6 more deleted\n' >> "$HIST"
ok "$(read_last "$HIST")" 1810 "decrease whose reason is space-separated"

# A COMMENT LINE, since the file already carries a header block in the drift
# history and someone will eventually add one here too.
printf '# note: the two lines above were written by hand, see bead 0iw3\n' >> "$HIST"
ok "$(read_last "$HIST")" 1810 "comment line after the last data line is ignored"

# THE FAILURE THIS MUST NOT HAVE: a malformed line silently becoming the
# baseline. A line with no count field at all.
printf '2026-09-10 01:50:00\tdef5678\n' >> "$HIST"
ok "$(read_last "$HIST")" 1810 "line with no count does not become the baseline"

echo
[ "$FAIL" = 0 ] && echo "ESCAPE HATCH PARSES IN EVERY SHAPE TESTED" || echo "SOME SHAPES DO NOT PARSE — fix before relying on the hatch"
rm -rf "$T"
exit "$FAIL"
