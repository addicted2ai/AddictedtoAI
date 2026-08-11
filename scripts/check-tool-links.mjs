#!/usr/bin/env node
// Fail when a Directory link stops resolving to the URL the Directory
// records. Run against a live server (via scripts/check-routes.sh) or on
// any machine with network access:
//
//   node scripts/check-tool-links.mjs
//
// The gap this closes: lychee follows redirects and reports 200, so a moved
// product -- runwayml.com -> runway.com, say -- passes green forever while
// the Directory points readers at a host that no longer carries the page.
// The href in tool-categories.js is the recorded final URL after redirects;
// this check is what keeps the two from drifting apart. A check that only
// reports "the link resolves" cannot see that, so it is not enough.
//
// Normalisation is deliberately narrow: leading "www." and a trailing slash
// are stripped before comparing, because those change nothing about where a
// link goes. Everything else -- host, path, query -- is compared literally,
// because a difference there means the link goes somewhere the Directory
// does not say it goes. Consent walls and geo redirects can fail this check
// on sites that are not actually broken; that is a signal to record the URL
// the page truly resolves to, not a reason to widen the normalisation.

import fs from "fs";
import path from "path";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "app/lib/tool-categories.js"), "utf8");
const blocks = [...source.matchAll(/\{\s*href:[\s\S]*?\n\s*\},/g)].map((m) => m[0]);

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]*)"`));
  return match ? match[1] : null;
}

function normalize(url) {
  try {
    const parsed = new URL(url);
    let host = parsed.hostname.replace(/^www\./, "");
    let pathname = parsed.pathname.replace(/\/+$/, "");
    if (pathname === "") pathname = "/";
    return `${host}${pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

const results = [];
for (const block of blocks) {
  const name = field(block, "name") || field(block, "href");
  const href = field(block, "href");
  if (!href) {
    results.push({ name, ok: false, problem: "no href field" });
    continue;
  }
  let finalUrl;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(href, {
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    finalUrl = response.url;
  } catch (error) {
    results.push({ name, ok: false, problem: `unreachable: ${error.message}` });
    continue;
  }
  const recorded = normalize(href);
  const resolved = normalize(finalUrl);
  if (resolved === recorded) {
    results.push({ name, ok: true, url: finalUrl });
  } else {
    results.push({
      name,
      ok: false,
      problem: `resolves to ${finalUrl}, Directory records ${href}`,
    });
  }
}

if (blocks.length === 0) {
  console.error("FAIL  no tool entries matched in app/lib/tool-categories.js");
  console.error("      the parser regex no longer matches the file — fix it, don't ignore it");
  process.exit(1);
}

const problems = results.filter((r) => !r.ok);
for (const result of results) {
  if (result.ok) {
    console.log(`ok    ${result.name} -> ${result.url}`);
  } else {
    console.log(`FAIL  ${result.name}: ${result.problem}`);
  }
}

if (problems.length > 0) {
  console.log(
    `\n${problems.length} Directory link${problems.length === 1 ? "" : "s"} no longer resolve to the recorded URL`
  );
  console.log("      update the href to where the product now lives, then re-record the verified date");
  process.exit(1);
}
// fetch keeps undici connection pools alive; without an explicit exit the
// script would hang after printing results, and a check that hangs is a
// check that never fails.
process.exit(0);
