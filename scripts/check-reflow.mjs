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
  "/loop-history",
];

// A route measured, printed every run, but not counted toward the exit
// code -- a real, filed, not-yet-fixed defect, not a false positive. Loud
// rather than silently dropped from ROUTES: check-routes.sh's own header
// warns that a skip nobody sees is how a run comes to believe it verified
// something it never looked at, and the same is true of a route quietly
// removed from a list. /log overflows by 180px (a `<strong>` containing a
// backtick-quoted path that a bold/italic span swallows before the
// tokeniser can turn it into `<code>` -- app/lib/inline-markdown.js does
// not recurse into a matched span). That is a parser fix affecting both
// CHANGELOG.md and CHARTER.md rendering, not the two CSS defects this
// check exists to catch; filed as its own item rather than folded in here.
const KNOWN_FAILURES = {
  "/log": "docket/open/2026-08-22-log-note-nested-code-overflows-320px.md",
};

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

async function evaluate(session, fnSource) {
  const r = await session.send("Runtime.evaluate", {
    expression: `(${fnSource})()`,
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
  return { bin, port, child, userDataDir };
}

function stopBrowser(browser) {
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(browser.child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      browser.child.kill("SIGKILL");
    }
  } catch {}
  try {
    fs.rmSync(browser.userDataDir, { recursive: true, force: true });
  } catch {}
}

// ---------------------------------------------------------------------------
// The in-page probe. Deliberately measures `documentElement.clientWidth`,
// not `window.innerWidth` -- see the file header.

function REFLOW_PROBE() {
  const de = document.documentElement;
  const clientWidth = de.clientWidth;
  const scrollWidth = de.scrollWidth;
  const overflow = scrollWidth > clientWidth + 1;
  let widest = null;
  if (overflow) {
    const els = Array.from(document.querySelectorAll("body *"));
    const byRight = els
      .map((e) => ({
        tag: e.tagName,
        cls: (e.className || "").toString().slice(0, 40),
        right: Math.round(e.getBoundingClientRect().right),
      }))
      .sort((a, b) => b.right - a.right)
      .slice(0, 3);
    widest = byRight;
  }
  return { clientWidth, scrollWidth, overflow, widest };
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

    const result = await evaluate(session, REFLOW_PROBE.toString());
    return result;
  } finally {
    session.close();
    try {
      await fetch(`http://127.0.0.1:${port}/json/close/${created.id}`);
    } catch {}
  }
}

async function main() {
  let browser;
  try {
    browser = await launchBrowser();
  } catch (error) {
    console.log(`FAIL  ${error.message}`);
    process.exit(1);
  }
  console.log(`      using ${browser.bin}`);

  let failures = 0;
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
        console.log(
          `KNOWN ${route}  scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth} ` +
            `(+${result.scrollWidth - result.clientWidth}px at ${VIEWPORT_WIDTH}px) -- filed: ${known}`
        );
      } else if (result.overflow) {
        console.log(
          `FAIL  ${route}  scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth} ` +
            `(+${result.scrollWidth - result.clientWidth}px at ${VIEWPORT_WIDTH}px)`
        );
        for (const w of result.widest || []) {
          console.log(`        widest: <${w.tag.toLowerCase()} class="${w.cls}"> right edge ${w.right}px`);
        }
        failures++;
      } else if (known) {
        console.log(
          `FAIL  ${route}  no longer overflows, but is still listed in KNOWN_FAILURES -- ` +
            `close ${known} and remove this entry so the route is a real assertion again`
        );
        failures++;
      } else {
        console.log(`ok    ${route}  clientWidth ${result.clientWidth}, scrollWidth ${result.scrollWidth}`);
      }
    }
  } finally {
    stopBrowser(browser);
  }

  if (failures > 0) {
    console.log(`${failures} route(s) overflow a ${VIEWPORT_WIDTH}px viewport (SC 1.4.10)`);
    process.exit(1);
  }
  console.log(`all routes fit a ${VIEWPORT_WIDTH}px viewport (documentElement.clientWidth denominator)`);
}

main();
