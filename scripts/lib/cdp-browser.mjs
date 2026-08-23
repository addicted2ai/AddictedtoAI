// A minimal Chrome DevTools Protocol client: launch an already-installed
// Chromium-family browser, speak CDP to it over a hand-rolled WebSocket
// connection, evaluate JavaScript in a navigated page, and tear the browser
// down cleanly. No browser-automation package is a dependency of this
// repository (CHARTER.md rule 15 keeps inference spend inside the
// maintainer's own subscription; a new devDependency is a standing
// commitment no single round has standing to make), and this file adds
// none — every environment GitHub currently documents for `ubuntu-latest`
// ships Google Chrome preinstalled, and this machine has Edge.
//
// Node's own global `WebSocket` does not exist before v21 and is not stable
// until v22, but this repository's CI (`build-and-audit`,
// `.github/workflows/pr-checks.yml`) pins Node 20 — so a script built on the
// global would throw `WebSocket is not defined` the first time CI ran it.
// The client below speaks the DevTools Protocol over `node:http` and
// `node:net` instead, which has worked unchanged since Node 8.
//
// Extracted from `scripts/check-reflow.mjs` (round 170,
// docket/open/2026-08-22-...), which proved this exact technique — real
// render over CDP, not a computation from CSS — against the same
// constraints. That file's own CDP plumbing is untouched by this
// extraction (round loop/build/first-screenful-density chose not to risk
// its existing tests and comments for the sake of one more caller); this
// module exists so `scripts/check-first-screenful.mjs` does not have to
// duplicate ~300 lines of WebSocket framing to get the same technique. A
// future round unifying both call sites onto this module is a reasonable
// follow-up, not a defect either file currently has.
import { execFileSync, spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";

export function wsConnect(wsUrl) {
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

export class Session {
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

export async function evaluate(session, fnSource, argsLiteral = "") {
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

export async function launchBrowser() {
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
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-browser-"));
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

// See scripts/check-reflow.mjs's own comment on this same shape: closing the
// browser's top-level WebSocket target with `Browser.close` is how Chromium
// expects to be shut down, and an OS-level kill alone left orphaned
// chrome-headless-shell.exe processes running on this machine when tested.
// `Browser.close` is tried first; the OS-level kill still runs afterward,
// unconditionally, as a backstop.
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

export async function stopBrowser(browser) {
  await closeBrowserGracefully(browser.browserWsUrl);
  await new Promise((r) => setTimeout(r, 300));
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(browser.child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      browser.child.kill("SIGKILL");
    }
  } catch {
    // ESRCH / "not found" here means the graceful close already reaped it.
  }
  try {
    fs.rmSync(browser.userDataDir, { recursive: true, force: true });
  } catch {}
}

// Navigate a fresh tab to `url`, run `probeFnSource` (a function literal,
// stringified) in the page with `argsLiteral` as its call arguments, and
// close the tab. `deviceMetrics` is passed straight to
// `Emulation.setDeviceMetricsOverride`.
export async function measurePage(port, url, deviceMetrics, probeFnSource, argsLiteral = "") {
  const created = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((r) =>
    r.json()
  );
  const conn = await wsConnect(created.webSocketDebuggerUrl);
  const session = new Session(conn);
  try {
    await session.send("Page.enable");
    await session.send("Runtime.enable");
    await session.send("Emulation.setDeviceMetricsOverride", deviceMetrics);

    let loaded = false;
    session.conn.onMessage((raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.method === "Page.loadEventFired") loaded = true;
      } catch {}
    });
    await session.send("Page.navigate", { url });
    const deadline = Date.now() + 20000;
    while (!loaded && Date.now() < deadline) await new Promise((r) => setTimeout(r, 100));
    await new Promise((r) => setTimeout(r, 400));

    return await evaluate(session, probeFnSource, argsLiteral);
  } finally {
    session.close();
    try {
      await fetch(`http://127.0.0.1:${port}/json/close/${created.id}`);
    } catch {}
  }
}
