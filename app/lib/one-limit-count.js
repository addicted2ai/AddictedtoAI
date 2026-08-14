import fs from "fs";
import path from "path";

// The blog's "one limit" passage carries a count of pull requests that
// merged over a failing `human-owned-paths` check. It used to be typed
// into the prose, and it drifted three times in four days — two, then
// five, then seven, then eight — each time caught only by a hand-run
// sweep. Same rule as the guardrails and the log: a stated fact is either
// derived at build time or can't drift.
//
// So the count, the failing set and the sweep date are read from
// scripts/one-limit-count-sweep.json — the machine-readable output
// scripts/sweep-one-limit-count.mjs writes and the round that runs it
// checks in. A later sweep that changes the count moves the page
// automatically, and scripts/check-one-limit-count.mjs asserts the
// rendered page still shows exactly what the file says.

const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

let cached;

export function getOneLimitCount() {
  if (cached) return cached;

  const file = path.join(process.cwd(), "scripts", "one-limit-count-sweep.json");
  const sweep = JSON.parse(fs.readFileSync(file, "utf8"));

  const countWord = WORDS[sweep.count] ?? String(sweep.count);
  const failingSetText = describeSet(sweep.failing);
  const sweptDate = formatDate(sweep.sweptAt);

  cached = {
    count: sweep.count,
    countWord,
    failing: sweep.failing,
    failingSetText,
    sweptAt: sweep.sweptAt,
    sweptDate,
    // The one sentence that can only be true if the page renders the
    // current sweep output: it carries the sweep's own date. The rendered
    // guardrail (scripts/check-one-limit-count.mjs) asserts this exact
    // string in the page's HTML, so a page edited back to hardcoding fails
    // even when its numbers happen to match the historical narrative.
    countSentence: `the sweep behind the count shown here ran on ${sweptDate} and counts ${countWord} (${failingSetText})`,
  };
  return cached;
}

function describeSet(failing) {
  const labeled = failing.map((n) => `#${n}`);
  if (labeled.length === 0) return "";
  if (labeled.length === 1) return labeled[0];
  return `${labeled.slice(0, -1).join(", ")} and ${labeled[labeled.length - 1]}`;
}

function formatDate(iso) {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
