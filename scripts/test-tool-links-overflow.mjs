#!/usr/bin/env node
// Regression test for the UND_ERR_HEADERS_OVERFLOW fallback in
// check-tool-links.mjs, without reaching the public internet.
//
// undici's fetch caps response headers at 16 KiB and aborts the request with
// UND_ERR_HEADERS_OVERFLOW when a site exceeds that; gemini.google.com sends
// ~24 KiB of CSP and cookie headers and is otherwise healthy. The checker
// re-tests that one cause with a raised header limit. That fallback cannot be
// verified by the real-directory run alone -- it only ever fires on
// gemini.google.com, and a future change to the error's shape would silently
// turn it off while the internet continues to work. This test holds the
// checker to its promise on a loopback server that sends the same oversized
// headers, and to its limit on a port nothing listens on.
//
//   node scripts/test-tool-links-overflow.mjs
//
// Runs in ~2 seconds, needs only loopback. Exit 0 means both directions held.
//
// The checker is spawned, not run in-process: it must see its own working
// directory as the repository root so it reads the synthetic tool list, and
// it must run detached from this process's event loop -- a spawnSync child
// would block the loop that is accepting the loopback connection and deadlock
// the test.

import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const checkerPath = fileURLToPath(new URL("./check-tool-links.mjs", import.meta.url));
const failures = [];

function toolCategories(href) {
  return `const categories = [
  {
    name: "Chat & Assistants",
    tools: [
      {
        href: "${href}",
        name: "loopback test",
        description: "synthetic entry for the overflow regression test",
        verified: "2026-08-13",
      },
    ],
  },
];
`;
}

function runChecker(tempRoot) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [checkerPath], {
      cwd: tempRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (chunk) => (out += chunk));
    child.stderr.on("data", (chunk) => (err += chunk));
    child.on("close", (code) => resolve({ status: code, stdout: out, stderr: err }));
  });
}

function makeTempRoot(entries) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tool-link-overflow-"));
  fs.mkdirSync(path.join(root, "app", "lib"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "app", "lib", "tool-categories.js"),
    entries
  );
  return root;
}

function listen(handler) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  // A server that behaves like gemini.google.com for undici: more than 16 KiB
  // of response headers, otherwise a plain 200.
  const oversized = await listen((request, response) => {
    response.setHeader("x-padding", "x".repeat(24 * 1024));
    response.end("ok");
  });
  const overflowUrl = `http://127.0.0.1:${oversized.address().port}/`;

  // A port that is guaranteed to have nothing listening on it: bind, take the
  // port, close. (Unused ports can be reused by the OS, but not in this
  // window, and not twice in a row.)
  const deadPort = await listen(() => {});
  const deadUrl = `http://127.0.0.1:${deadPort.address().port}/`;
  await new Promise((resolve) => deadPort.close(resolve));

  try {
    const goodRoot = makeTempRoot(toolCategories(overflowUrl));
    const good = await runChecker(goodRoot);
    fs.rmSync(goodRoot, { recursive: true, force: true });
    if (good.status === 0 && /ok\s+loopback test/.test(good.stdout)) {
      console.log(`ok    oversized headers resolve through the fallback (${overflowUrl})`);
    } else {
      console.log(`FAIL  oversized headers should resolve; exit ${good.status}`);
      console.log(good.stdout.trim());
      failures.push("oversized headers did not resolve");
    }

    const badRoot = makeTempRoot(toolCategories(deadUrl));
    const bad = await runChecker(badRoot);
    fs.rmSync(badRoot, { recursive: true, force: true });
    if (bad.status === 1 && /FAIL\s+loopback test/.test(bad.stdout)) {
      console.log(`ok    dead port still fails (${deadUrl})`);
    } else {
      console.log(`FAIL  dead port should fail; exit ${bad.status}`);
      console.log(bad.stdout.trim());
      failures.push("dead port did not fail");
    }
  } finally {
    await new Promise((resolve) => oversized.close(resolve));
  }

  if (failures.length > 0) {
    console.log(`\n${failures.length} overflow regression assertion(s) failed`);
    process.exitCode = 1;
  } else {
    console.log("all overflow regression assertions passed");
  }
}

main();
