#!/usr/bin/env node
// WCAG SC 1.4.10 Reflow: no published route may need horizontal scrolling of
// the *page itself* at a 320px viewport. (Content that genuinely needs two
// dimensions -- a data table -- is the criterion's own named exception, and
// is handled by giving the table its own scroll region, not by exempting the
// page.)
//
// docket/open/2026-08-22-... [filed this round] found this site failing that
// criterion on two routes -- /model-retirement-calendar (+223px) and
// /charter (+221px) -- and found that the design rubric's proposed check for
// it,
//
//     document.documentElement.scrollWidth <= window.innerWidth + 1
//
// would not have caught either failure. Under mobile emulation,
// `window.innerWidth` EXPANDS to match overflowing content instead of
// staying pinned to the requested viewport width, so the check passes on the
// exact page it exists to fail. Measured on /model-retirement-calendar at a
// 320px viewport: clientWidth 320, scrollWidth 543, innerWidth 543 -- so
// `543 <= 543 + 1` is true while the page overflows by 223px. The
// denominator here is `documentElement.clientWidth`, which stayed pinned at
// 320 in every measurement regardless of the mobile-emulation flag.
//
// No browser-automation package is a dependency of this repository, and none
// is added by this file -- CHARTER.md rule 15 keeps inference spend inside
// the maintainer's own subscription, and a new devDependency is a standing
// commitment this round has no standing to make. Every CI runner GitHub
// currently documents for `ubuntu-latest` ships Google Chrome preinstalled
// (treosh/lighthouse-ci-action, already required in this workflow, depends
// on exactly that fact and finds it without any setup step here). Locally,
// `chrome-headless-shell` already sits in the Puppeteer cache on this
// machine from an unrelated prior session; a fresh contributor machine with
// neither falls through to FAIL, loudly, rather than silently skipping --
// see the note in check-routes.sh about what a silent skip costs.
//
// Node's own global `WebSocket` does not exist before v21 and is not stable
// until v22 (https://nodejs.org/en/blog/announcements/v21-release-announce,
// "What's New in Node.js 22" — AppSignal). This workflow's build-and-audit
// job pins Node 20 (.github/workflows/pr-checks.yml), so a script built on
// the global would throw `WebSocket is not defined` the first time CI ran
// it. The tiny client below speaks the DevTools Protocol over a hand-rolled
// WebSocket connection on top of `node:http` and `node:net` instead, which
// has worked unchanged since Node 8.
//
// scratchpad/survey/{cdp.mjs,reflow.mjs} (this round's design-rubric survey,
// not committed to this repository) proved the method and the diagnostic
// shape this file reuses -- widest-by-right-edge, widest unbreakable leaf --
// against the global-`WebSocket` client, which is fine on a machine already
// running Node 22+ but not portable to this workflow's pinned CI Node.
import { execFileSync, spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VIEWPORT_WIDTH = 320;
const VIEWPORT_HEIGHT = 800;

// Same set /model-retirement-calendar and /charter were measured
// alongside, and the same list check-routes.sh already walks for the AI
// disclosure marker and the per-route document-size budget -- reused rather
// than maintained a third time.
const ROUTES = [
  "/",
  "/blog",
  "/blog/frontier-cyber",
  "/directory",
  "/demos",
  "/log",
  "/log/early",
  "/log/archive",
  "/projects",
  "/disclosure",
  "/charter",
  "/what-vendors-promise",
  "/model-retirement-calendar",
  "/model-deprecation-checker",
  "/model-migration-chains",
  "/loop-history",
];

// A route measured, printed every run, but not counted toward the exit
// code -- a real, filed, not-yet-fixed defect, not a false positive. Loud
// rather than silently dropped from ROUTES: check-routes.sh's own header
// warns that a skip nobody sees is how a run comes to believe it verified
// something it never looked at, and the same is true of a route quietly
// removed from a list. /log overflows (a `<strong>` containing a
// backtick-quoted path that a bold/italic span swallows before the
// tokeniser can turn it into `<code>` -- app/lib/inline-markdown.js does
// not recurse into a matched span). That is a parser fix affecting both
// CHANGELOG.md and CHARTER.md rendering, not the two CSS defects this
// check exists to catch; filed as its own item rather than folded in here.
//
// REVIEW FINDING, fixed here (see the round's changelog entry for the full
// account): the first version of this table keyed on the route name alone
// -- `{"/log": "docket/open/....md"}` -- so ANY overflow on that route
// printed KNOWN and did not fail the build, not only the one documented.
// Adversarial review demonstrated this live: it injected an unrelated
// overflow on /log and the un-pinned check reported the resulting +580px
// failure as KNOWN, when the documented bug was the ~180px `<strong>`
// above. A route-keyed exemption is not a documented exception; it is a
// standing bypass for that route.
//
// The fix pins each entry to the actual offending content, not the route
// or a magnitude: `snippets` are substrings that must appear in the text of
// EVERY element the probe finds overflowing the viewport (see `offenders`
// in REFLOW_PROBE below, not just the single widest one -- a second,
// smaller, unrelated overflow hiding under a larger documented one would
// not appear as "the widest" and needs its own check). A magnitude
// tolerance band was considered and rejected in favour of this: content
// identity survives the "harmless reflow of the same bug" case the review
// asked to weigh (the string's own rendered width does not change unless
// the string itself does, and CHANGELOG.md's append-only rule means it
// never will) without needing an arbitrary +/-Npx band, and it cannot be
// fooled by an unrelated failure that happens to land in-band the way a
// magnitude-only check could.
//
// What this does NOT solve, and a claim about it that was wrong:
//
// An earlier version of this comment claimed a second, smaller, unrelated
// overflow coexisting with a larger documented one on the same route would
// "not appear as the widest" and "pass unnoticed either way." That is
// false, and adversarial review's second pass found it by testing the
// claim directly against this shipped code rather than trusting the prose
// -- contradicted by this file's own scripts/test-check-reflow-known-failures.mjs
// case 3, which proves the opposite. The offenders scan below is
// exhaustive, not top-1: it filters every element by its own
// `getBoundingClientRect().right`, independent of any other element's
// size, so a second offender that individually exceeds the viewport is
// captured and checked exactly like the first, whether it is wider or
// narrower. Corrected here rather than reworded quietly -- see the round's
// changelog entry for the full account of the error and how it was caught.
//
// The real, narrower gap: `offenders` finds elements by their own
// `getBoundingClientRect().right` exceeding the viewport, which misses
// block-level overflow entirely -- a block element's own box respects its
// assigned CSS width even when its content does not (`overflow-x: visible`,
// the default), so its `scrollWidth` can exceed its `clientWidth` -- and
// cascade all the way up to inflate `document.documentElement.scrollWidth`
// -- without that element's, or any ancestor's, bounding rect ever showing
// it. Not hypothetical: verifying this fix found exactly this shape on
// `/log` (`.log-field`/`.log-note` paragraphs with `overflow-x: visible`
// and no `overflow-wrap`, fixed separately -- see the round's changelog
// entry). The classifier still fails closed when this happens (`offenders`
// comes back empty, which `classifyKnownFailure` treats as NOT known,
// never as known), so this gap costs diagnostic detail, not safety -- but
// it does mean "no offender found" can mean either "the page is fine" or
// "the cause is a block-level element this scan cannot see," and only
// `overflow: true` tells them apart.
//
// Bookkeeping, checked once per entry regardless of whether the route
// currently overflows (see checkKnownFailureBookkeeping): the cited docket
// path must still exist under docket/open/ -- an entry whose docket item
// was closed (fixed, or moved to dropped/) without this table being
// updated is exactly the "outlives its bug" case the review asked to be
// noticed, not silently perpetual. `expires` mirrors the docket item's own
// field and is a printed note (not a build failure) once past, the same
// non-blocking treatment scripts/check-docket.mjs already gives a stale
// docket item, for the same reason: time alone failing CI would make the
// queue able to break the site.
// Empty as of this round, and that is the honest state, not a placeholder:
// /log's only overflow was fixed (app/globals.css's .log-field/.log-note,
// same round -- see the changelog entry) before this file shipped, so
// there is currently nothing real to document here. The shape stays ready
// for the next one; adding an entry back is `checkRoute`'s FAIL diagnostic
// pasted in, not a redesign.
export const KNOWN_FAILURES = {};

// REVIEW FINDING, second pass, fixed here (see the round's changelog entry):
// `.includes()` has no floor. A snippet of `""` matches every string in
// JavaScript (the empty string is a substring of anything), and a short,
// generic snippet like `"the"` matches by accident -- either fully
// reconstructs the route-wide bypass this file exists to close, verified
// directly against the shipped code before this fix. It could not bite
// while KNOWN_FAILURES was empty, which is exactly why it would have
// survived: the first entry added carelessly would have reopened the hole
// with nothing here to stop it.
//
// The property: a snippet must be specific enough to identify a failure,
// and an entry that cannot must be rejected rather than matching
// everything. Enforced as a length floor -- specificity has no exact
// measure, but every real snippet this file has ever needed (a 62-character
// docket path, file paths, hashes) is far longer than any plausible
// generic word or phrase, so a floor well above single-word length rejects
// the degenerate cases without ever being close to a real one. 12 was
// chosen as comfortably above common short-but-real identifiers (a 7-char
// git SHA fragment would still fail it and would need pairing with more
// context, which is the right failure mode -- a bare SHA is exactly the
// kind of snippet that could coincidentally recur) while staying far below
// the shortest snippet this file has actually shipped.
const MIN_SNIPPET_LENGTH = 12;

function invalidSnippetReason(snippets) {
  if (!Array.isArray(snippets) || snippets.length === 0) {
    return "snippets must be a non-empty array -- an entry with none can never identify a specific failure";
  }
  const bad = snippets.filter(
    (s) => typeof s !== "string" || s.trim().length < MIN_SNIPPET_LENGTH
  );
  if (bad.length > 0) {
    return (
      `snippet(s) too short to identify a specific failure (minimum ${MIN_SNIPPET_LENGTH} ` +
      `characters): ${bad.map((s) => JSON.stringify(s)).join(", ")}`
    );
  }
  return null;
}

// Pure and synchronous on purpose -- no I/O, so it can be unit-tested with
// synthetic inputs rather than only exercised end-to-end through a browser.
// See scripts/test-check-reflow-known-failures.mjs, which does exactly
// that with fixtures modelled on the review's demonstrations (a
// documented match, an unrelated mismatch, a degenerate/empty snippet) to
// prove each fails the way it must rather than reporting KNOWN.
export function classifyKnownFailure(entry, result) {
  const invalidReason = invalidSnippetReason(entry.snippets);
  if (invalidReason) {
    return { known: false, reason: `entry cannot identify a specific failure -- ${invalidReason}` };
  }
  const offenders = result.offenders || [];
  if (result.truncated) {
    return {
      known: false,
      reason: `offender list was truncated at ${offenders.length} -- too many overflowing elements to verify each is documented`,
    };
  }
  if (offenders.length === 0) {
    return {
      known: false,
      reason: "page overflows but no individual element was identified as the cause -- nothing to match against the documented signature",
    };
  }
  const unexplained = offenders.filter(
    (o) => !entry.snippets.some((snippet) => (o.text || "").includes(snippet))
  );
  if (unexplained.length > 0) {
    return {
      known: false,
      reason:
        `${unexplained.length} overflowing element(s) do not match this route's documented signature: ` +
        unexplained
          .map((o) => `<${o.tag.toLowerCase()}> "${(o.text || "").slice(0, 50)}"`)
          .join(", "),
    };
  }
  return { known: true };
}

// The other half of "must excuse only the failure it documents": an entry
// whose citation has gone stale. Talks to the filesystem, so kept separate
// from the pure classifier above; still trivially testable by pointing it
// at a real repo checkout, which the test script does.
export function checkKnownFailureBookkeeping(route, entry, { repoRoot = process.cwd(), now = new Date() } = {}) {
  const problems = [];
  const docketPath = path.join(repoRoot, entry.docket);
  if (!fs.existsSync(docketPath) || !entry.docket.startsWith("docket/open/")) {
    problems.push(
      `FAIL  ${route}'s KNOWN_FAILURES entry cites "${entry.docket}", which is not an open docket item ` +
        `-- closed, dropped, or renamed without this table being updated. Remove the entry if fixed, or point it at the item's replacement.`
    );
  }
  // Checked here too, not only in classifyKnownFailure: that function only
  // runs when its route is actually overflowing, so a malformed entry on a
  // route that currently renders clean would otherwise go uncaught until
  // the day it doesn't -- exactly the wrong moment to first discover a
  // snippet that matches everything.
  const invalidReason = invalidSnippetReason(entry.snippets);
  if (invalidReason) {
    problems.push(`FAIL  ${route}'s KNOWN_FAILURES entry cannot identify a specific failure -- ${invalidReason}`);
  }
  const notes = [];
  if (entry.expires && Date.parse(entry.expires) < now.getTime()) {
    notes.push(
      `note  ${route}'s KNOWN_FAILURES entry (${entry.docket}) is past its expires date (${entry.expires}) -- worth re-examining, not a build failure`
    );
  }
  return { problems, notes };
}

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3000";

// ---------------------------------------------------------------------------
// Minimal WebSocket client (RFC 6455), client role only, text frames only --
// enough to speak CDP's JSON-RPC-over-WebSocket and nothing more.

function wsConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString("base64");
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Version": "13",
        "Sec-WebSocket-Key": key,
      },
    });
    req.on("upgrade", (res, socket) => {
      socket.setNoDelay(true);
      resolve(new WSConn(socket));
    });
    req.on("error", reject);
    req.end();
  });
}

class WSConn {
  constructor(socket) {
    this.socket = socket;
    this.buf = Buffer.alloc(0);
    this.messageHandlers = [];
    this.pending = [];
    socket.on("data", (chunk) => this._onData(chunk));
    socket.on("error", () => {});
  }

  onMessage(fn) {
    this.messageHandlers.push(fn);
  }

  _onData(chunk) {
    this.buf = Buffer.concat([this.buf, chunk]);
    for (;;) {
      if (this.buf.length < 2) return;
      const b0 = this.buf[0];
      const b1 = this.buf[1];
      const fin = (b0 & 0x80) !== 0;
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let offset = 2;
      if (len === 126) {
        if (this.buf.length < offset + 2) return;
        len = this.buf.readUInt16BE(offset);
        offset += 2;
      } else if (len === 127) {
        if (this.buf.length < offset + 8) return;
        len = Number(this.buf.readBigUInt64BE(offset));
        offset += 8;
      }
      let maskKey = null;
      if (masked) {
        if (this.buf.length < offset + 4) return;
        maskKey = this.buf.subarray(offset, offset + 4);
        offset += 4;
      }
      if (this.buf.length < offset + len) return;
      let payload = this.buf.subarray(offset, offset + len);
      if (masked) {
        const out = Buffer.alloc(len);
        for (let i = 0; i < len; i++) out[i] = payload[i] ^ maskKey[i % 4];
        payload = out;
      }
      this.buf = this.buf.subarray(offset + len);
      this._handleFrame(opcode, fin, Buffer.from(payload));
    }
  }

  _handleFrame(opcode, fin, payload) {
    if (opcode === 0x8) {
      try {
        this.socket.end();
      } catch {}
      return;
    }
    if (opcode === 0x9) {
      this._send(payload, 0xa);
      return;
    }
    if (opcode === 0xa) return; // pong
    if (opcode === 0x1 || opcode === 0x2 || opcode === 0x0) {
      if (!this._msg) this._msg = [];
      this._msg.push(payload);
      if (fin) {
        const full = Buffer.concat(this._msg).toString("utf8");
        this._msg = null;
        for (const h of this.messageHandlers) h(full);
      }
    }
  }

  send(text) {
    this._send(Buffer.from(text, "utf8"), 0x1);
  }

  _send(payload, opcode) {
    const len = payload.length;
    const maskKey = crypto.randomBytes(4);
    let header;
    if (len < 126) {
      header = Buffer.alloc(2);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | len;
    } else if (len < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 126;
      header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(len), 2);
    }
    const masked = Buffer.alloc(len);
    for (let i = 0; i < len; i++) masked[i] = payload[i] ^ maskKey[i % 4];
    try {
      this.socket.write(Buffer.concat([header, maskKey, masked]));
    } catch {}
  }

  close() {
    try {
      this.socket.end();
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// A thin CDP JSON-RPC session on top of the WebSocket connection above.

class Session {
  constructor(conn) {
    this.conn = conn;
    this.id = 0;
    this.pending = new Map();
    conn.onMessage((raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.conn.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout waiting for ${method}`));
        }
      }, 20000);
    });
  }

  close() {
    this.conn.close();
  }
}

async function evaluate(session, fnSource, argsLiteral = "") {
  const r = await session.send("Runtime.evaluate", {
    expression: `(${fnSource})(${argsLiteral})`,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) {
    throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 500));
  }
  return r.result.value;
}

// ---------------------------------------------------------------------------
// Locating an already-installed Chromium-family browser. Nothing here
// downloads or installs one.

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function candidateBinaries() {
  const candidates = [];
  for (const envVar of ["PUPPETEER_EXECUTABLE_PATH", "CHROME_PATH", "CHROME_BIN"]) {
    if (process.env[envVar]) candidates.push(process.env[envVar]);
  }
  if (process.platform === "win32") {
    const cache = path.join(os.homedir(), ".cache", "puppeteer", "chrome-headless-shell");
    if (fs.existsSync(cache)) {
      for (const dir of fs.readdirSync(cache)) {
        const exe = path.join(cache, dir, `chrome-headless-shell-${dir.split("-")[0]}`, "chrome-headless-shell.exe");
        if (fs.existsSync(exe)) candidates.push(exe);
      }
    }
    candidates.push(
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
    );
  } else if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium"
    );
  } else {
    candidates.push(
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/opt/google/chrome/chrome"
    );
  }
  return candidates.filter((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });
}

async function launchBrowser() {
  const bins = candidateBinaries();
  if (bins.length === 0) {
    throw new Error(
      "no Chromium-family browser found (checked PUPPETEER_EXECUTABLE_PATH, " +
        "CHROME_PATH, CHROME_BIN, and this platform's standard install paths) " +
        "-- this check needs one already on the machine and installs nothing itself"
    );
  }
  const bin = bins[0];
  const port = await findFreePort();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "reflow-check-"));
  const isHeadlessShell = /headless-shell/i.test(bin);
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "about:blank",
  ];
  if (!isHeadlessShell) args.unshift("--headless=new");
  const child = spawn(bin, args, { stdio: "ignore" });

  const deadline = Date.now() + 15000;
  let version = null;
  while (Date.now() < deadline) {
    try {
      version = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  if (!version) {
    child.kill();
    throw new Error(`launched ${bin} but it never opened the DevTools port`);
  }
  return { bin, port, child, userDataDir, browserWsUrl: version.webSocketDebuggerUrl };
}

// Closing the browser's own top-level WebSocket target with `Browser.close`
// is how Chromium expects to be shut down -- it tears down every renderer
// and utility subprocess from the inside, rather than relying on the OS's
// process-tree bookkeeping to have recorded them all as children of the PID
// `spawn()` returned. Measured during this round's own testing: `taskkill
// /T /F` on that PID alone left 3 of 6 chrome-headless-shell.exe processes
// running after their script had already exited (`tasklist` on this
// machine, confirmed and cleaned up by hand) -- an orphaned-process leak
// that would accumulate on the maintainer's machine every time this check
// runs, which is worse than the check being merely slow. `Browser.close` is
// tried first; the OS-level kill still runs afterward, unconditionally, as
// a backstop for whatever `Browser.close` does not reach (a hung renderer,
// a browser that never answered).
async function closeBrowserGracefully(wsUrl) {
  if (!wsUrl) return;
  try {
    const conn = await wsConnect(wsUrl);
    const session = new Session(conn);
    await Promise.race([
      session.send("Browser.close"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    conn.close();
  } catch {
    // Fall through to the OS-level kill below regardless of why this failed.
  }
}

async function stopBrowser(browser) {
  await closeBrowserGracefully(browser.browserWsUrl);
  // A short grace period for the graceful close to actually finish tearing
  // down subprocesses before the OS-level kill below runs -- otherwise the
  // backstop below always fires (the child PID is still alive the instant
  // `Browser.close`'s response arrives) and this function would always pay
  // for both paths rather than only when the graceful one fails.
  await new Promise((r) => setTimeout(r, 300));
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(browser.child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      browser.child.kill("SIGKILL");
    }
  } catch {
    // ESRCH / "not found" here means the graceful close already reaped it --
    // the expected outcome, not a failure.
  }
  try {
    fs.rmSync(browser.userDataDir, { recursive: true, force: true });
  } catch {}
}

// ---------------------------------------------------------------------------
// The in-page probe. Deliberately measures `documentElement.clientWidth`,
// not `window.innerWidth` -- see the file header.
//
// `offenders` is every element (plus `document.body` itself) whose own
// right edge exceeds the viewport -- not just the single widest one. A
// KNOWN_FAILURES match has to explain all of them (see
// classifyKnownFailure above): the review's finding was that keying on the
// route alone let an unrelated second overflow hide behind a documented
// one, and checking only the widest element would have left exactly that
// gap open one level down -- a smaller unrelated offender sitting beside a
// larger known one. Capped at 25 with `truncated` set past that, because a
// page broken badly enough to produce more than 25 independently
// overflowing elements is not "a contained, documented failure" under any
// signature this file could reasonably hold, known or not.
export const OFFENDER_CAP = 25;

export function REFLOW_PROBE(offenderCap) {
  const de = document.documentElement;
  const clientWidth = de.clientWidth;
  const scrollWidth = de.scrollWidth;
  const overflow = scrollWidth > clientWidth + 1;
  let offenders = null;
  let truncated = false;
  if (overflow) {
    const candidates = [document.body, ...document.querySelectorAll("body *")];
    const over = candidates
      .filter((e) => e.getBoundingClientRect().right > clientWidth + 1)
      .map((e) => ({
        tag: e.tagName,
        cls: (e.className || "").toString().slice(0, 40),
        right: Math.round(e.getBoundingClientRect().right),
        text: (e.textContent || "").trim().slice(0, 200),
      }))
      .sort((a, b) => b.right - a.right);
    truncated = over.length > offenderCap;
    offenders = over.slice(0, offenderCap);
  }
  return { clientWidth, scrollWidth, overflow, offenders, truncated };
}

async function checkRoute(port, route) {
  const created = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((r) =>
    r.json()
  );
  const conn = await wsConnect(created.webSocketDebuggerUrl);
  const session = new Session(conn);
  try {
    await session.send("Page.enable");
    await session.send("Runtime.enable");
    await session.send("Emulation.setDeviceMetricsOverride", {
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1,
      mobile: true,
      screenWidth: VIEWPORT_WIDTH,
      screenHeight: VIEWPORT_HEIGHT,
    });

    let loaded = false;
    session.conn.onMessage((raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.method === "Page.loadEventFired") loaded = true;
      } catch {}
    });
    await session.send("Page.navigate", { url: `${BASE}${route}` });
    const deadline = Date.now() + 20000;
    while (!loaded && Date.now() < deadline) await new Promise((r) => setTimeout(r, 100));
    await new Promise((r) => setTimeout(r, 400));

    const result = await evaluate(session, REFLOW_PROBE.toString(), String(OFFENDER_CAP));
    return result;
  } finally {
    session.close();
    try {
      await fetch(`http://127.0.0.1:${port}/json/close/${created.id}`);
    } catch {}
  }
}

async function main() {
  let failures = 0;

  // Bookkeeping first, once per entry, independent of whether the route
  // currently overflows -- a stale citation is a problem even on a route
  // that happens to render clean this run.
  for (const [route, entry] of Object.entries(KNOWN_FAILURES)) {
    const { problems, notes } = checkKnownFailureBookkeeping(route, entry);
    for (const p of problems) {
      console.log(p);
      failures++;
    }
    for (const n of notes) console.log(n);
  }
  if (failures > 0) console.log();

  let browser;
  try {
    browser = await launchBrowser();
  } catch (error) {
    console.log(`FAIL  ${error.message}`);
    process.exit(1);
  }
  console.log(`      using ${browser.bin}`);

  try {
    for (const route of ROUTES) {
      let result;
      try {
        result = await checkRoute(browser.port, route);
      } catch (error) {
        console.log(`FAIL  ${route} -> could not measure (${String(error.message || error).slice(0, 200)})`);
        failures++;
        continue;
      }
      const known = KNOWN_FAILURES[route];
      if (result.overflow && known) {
        const verdict = classifyKnownFailure(known, result);
        if (verdict.known) {
          console.log(
            `KNOWN ${route}  scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth} ` +
              `(+${result.scrollWidth - result.clientWidth}px at ${VIEWPORT_WIDTH}px) -- filed: ${known.docket}`
          );
        } else {
          console.log(
            `FAIL  ${route}  overflows (+${result.scrollWidth - result.clientWidth}px), but NOT the documented ` +
              `failure -- ${verdict.reason} (docket: ${known.docket})`
          );
          for (const o of result.offenders || []) {
            console.log(`        offender: <${o.tag.toLowerCase()} class="${o.cls}"> right edge ${o.right}px "${o.text.slice(0, 50)}"`);
          }
          failures++;
        }
      } else if (result.overflow) {
        console.log(
          `FAIL  ${route}  scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth} ` +
            `(+${result.scrollWidth - result.clientWidth}px at ${VIEWPORT_WIDTH}px)`
        );
        for (const o of result.offenders || []) {
          console.log(`        offender: <${o.tag.toLowerCase()} class="${o.cls}"> right edge ${o.right}px "${o.text.slice(0, 50)}"`);
        }
        failures++;
      } else if (known) {
        console.log(
          `FAIL  ${route}  no longer overflows, but is still listed in KNOWN_FAILURES -- ` +
            `close ${known.docket} and remove this entry so the route is a real assertion again`
        );
        failures++;
      } else {
        console.log(`ok    ${route}  clientWidth ${result.clientWidth}, scrollWidth ${result.scrollWidth}`);
      }
    }
  } finally {
    await stopBrowser(browser);
  }

  if (failures > 0) {
    console.log(`${failures} problem(s) at a ${VIEWPORT_WIDTH}px viewport (SC 1.4.10)`);
    process.exit(1);
  }
  console.log(`all routes fit a ${VIEWPORT_WIDTH}px viewport (documentElement.clientWidth denominator)`);
}

// Guarded so `scripts/test-check-reflow-known-failures.mjs` can import the
// pure functions above (classifyKnownFailure, checkKnownFailureBookkeeping)
// without also launching a browser as a side effect of the import -- ESM
// runs a module's top-level code once, on first import, same as on direct
// execution.
const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
