// Print the median Lighthouse scores from a .lighthouseci/ run, to the
// job log and to the GitHub step summary.
//
// The analytics-enabled Lighthouse pass asserts at warn level so it can
// never block a merge -- which means when everything is fine it prints
// nothing at all, and the number it exists to surface stays invisible.
// This makes it visible either way.
import fs from "fs";
import path from "path";

const dir = ".lighthouseci";
if (!fs.existsSync(dir)) {
  console.log("No .lighthouseci directory - nothing to report.");
  process.exit(0);
}

const runs = fs
  .readdirSync(dir)
  .filter((f) => /^lhr-.*\.json$/.test(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));

if (runs.length === 0) {
  console.log("No Lighthouse reports found in .lighthouseci.");
  process.exit(0);
}

const median = (nums) => {
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const categories = ["performance", "accessibility", "best-practices", "seo"];
const rows = categories
  .filter((c) => runs[0].categories?.[c])
  .map((c) => {
    const scores = runs.map((r) => r.categories[c].score);
    return {
      category: c,
      median: median(scores),
      all: scores.map((s) => s.toFixed(2)).join(", "),
    };
  });

const transferKb = (
  median(runs.map((r) => r.audits?.["total-byte-weight"]?.numericValue ?? 0)) /
  1024
).toFixed(0);

const title = process.argv[2] || "Lighthouse";
console.log(`\n${title} - median of ${runs.length} run(s) on ${runs[0].finalUrl || runs[0].requestedUrl}`);
for (const r of rows) {
  console.log(`  ${r.category.padEnd(16)} ${r.median.toFixed(2)}   (runs: ${r.all})`);
}
console.log(`  ${"total transferred".padEnd(16)} ${transferKb} KB`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = [
    `### ${title}`,
    ``,
    `Median of ${runs.length} run(s) on \`${runs[0].finalUrl || runs[0].requestedUrl}\`.`,
    ``,
    `| category | median | runs |`,
    `| --- | --- | --- |`,
    ...rows.map((r) => `| ${r.category} | **${r.median.toFixed(2)}** | ${r.all} |`),
    `| total transferred | **${transferKb} KB** | |`,
    ``,
  ].join("\n");
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
}
