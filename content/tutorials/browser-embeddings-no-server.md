---
title: "Run a sentence-embedding model in the browser, with no server and no API key"
subjects:
  - tool/transformers-js
  - tool/onnx-runtime-web
  - model/all-minilm-l6-v2
verified_against:
  tool/transformers-js: "4.2.0"
  tool/onnx-runtime-web: "1.26.0-dev.20260416-b7804b056c"
  model/all-minilm-l6-v2: "2025-07-22"
verified_on: "2026-08-28"
reverify_days: 30
mentions:
  - tool/transformers-js
  - tool/onnx-runtime-web
  - model/all-minilm-l6-v2
---

You end with a static page that downloads one 22,972,370-byte quantized BERT,
then ranks six sentences against a query in 211 ms of local compute. No
inference server, no key, no build tool, no framework. The only third party
the visitor's browser talks to is the model host.

The interesting part is not the pipeline call — it is three defaults that
send bytes somewhere you did not intend, all of which this walkthrough turns
off.

## 1. Install the library outside anything you deploy

```bash
npm init -y
npm install @huggingface/transformers
```

Observed: `added 49 packages in 14s`, and `382 MB` of `node_modules`. The
browser build you will actually ship is 1,099,109 bytes of that. Most of the
rest is `onnxruntime-node` — prebuilt native binaries that a browser page
never loads and never can.

That ratio is the reason to keep this dependency out of the manifest of any
site you deploy. Install it in a directory of its own, copy the two things
you need out of `node_modules`, and let the rest stay on your laptop.

## 2. Copy the browser build and the WebAssembly runtime into your site

```js
// vendor.mjs
import { mkdir, readdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const nm = join(here, 'node_modules');
const vendor = join(here, 'site', 'vendor');

await mkdir(join(vendor, 'ort'), { recursive: true });
await copyFile(
  join(nm, '@huggingface', 'transformers', 'dist', 'transformers.web.js'),
  join(vendor, 'transformers.web.js'),
);

const ortDist = join(nm, 'onnxruntime-web', 'dist');
let n = 0;
for (const f of await readdir(ortDist)) {
  if (/^ort-wasm.*\.(wasm|mjs)$/.test(f) || f === 'ort.webgpu.bundle.min.mjs') {
    await copyFile(join(ortDist, f), join(vendor, 'ort', f));
    n += 1;
  }
}
console.log(`vendored transformers.web.js + ${n} onnxruntime files`);
```

`node vendor.mjs` prints `vendored transformers.web.js + 9 onnxruntime files`.
The library build is 1,099,109 bytes; the four `.wasm` binaries are the bulk:

```text
ort-wasm-simd-threaded.wasm             12,942,611
ort-wasm-simd-threaded.jspi.wasm        14,555,814
ort-wasm-simd-threaded.asyncify.wasm    23,567,050
ort-wasm-simd-threaded.jsep.wasm        26,101,073
```

Copy all four. The runtime picks one at load time based on what the browser
supports, and you cannot tell which from the source: this run — Chromium,
WebAssembly backend, cross-origin isolated — fetched
`ort-wasm-simd-threaded.asyncify.wasm` and none of the other three.

## 3. Give the page an import map

`transformers.web.js` is not fully bundled. It ends with two bare imports —
`onnxruntime-web/webgpu` and `onnxruntime-common` — and a browser cannot
resolve either. Loading it as a plain module fails immediately with:

```text
Failed to resolve module specifier "onnxruntime-web/webgpu".
Relative references must start with either "/", "./", or "../".
```

An import map is the whole fix. No bundler, no `node_modules` on the server.

```html
<!doctype html>
<meta charset="utf-8">
<title>local semantic search</title>
<script type="importmap">
{
  "imports": {
    "onnxruntime-web/webgpu": "/vendor/ort/ort.webgpu.bundle.min.mjs",
    "onnxruntime-common": "/vendor/ort/ort.webgpu.bundle.min.mjs"
  }
}
</script>
<pre id="out">starting...
</pre>
<script type="module" src="./app.js"></script>
```

Both specifiers point at the same file because the bundled WebGPU build
re-exports the common API.

## 4. Write the page

```js
// app.js
import { env, pipeline, cos_sim } from './vendor/transformers.web.js';

// Serve the WebAssembly runtime from this site instead of the default CDN.
env.backends.onnx.wasm.wasmPaths = '/vendor/ort/';

const out = document.getElementById('out');
const log = (line) => { out.textContent += line + '\n'; };

const DOCS = [
  'A KV cache reuses the attention keys and values already computed for earlier tokens.',
  'Quantization stores weights in fewer bits so a model fits in less memory.',
  'Sourdough needs a mature starter and a long cold proof in the fridge.',
  'Speculative decoding drafts several tokens with a small model and checks them with a large one.',
  'Rosemary and thyme both survive a hard frost outdoors.',
  'A tokenizer splits text into the integer ids a model actually consumes.',
];
const QUERY = 'how do I make a model take up less memory';

let bytes = 0;
const t0 = performance.now();
const embed = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
  dtype: 'q8',
  progress_callback: (p) => {
    if (p.status === 'done' && p.file) log(`fetched ${p.file}`);
    if (p.status === 'progress' && p.total) bytes = Math.max(bytes, p.total);
  },
});
const t1 = performance.now();
log(`pipeline ready in ${((t1 - t0) / 1000).toFixed(1)} s (largest file ${(bytes / 1048576).toFixed(1)} MB)`);

const opts = { pooling: 'mean', normalize: true };
const docVecs = [];
for (const d of DOCS) docVecs.push(await embed(d, opts));
const q = await embed(QUERY, opts);
const t2 = performance.now();
log(`embedded ${DOCS.length + 1} strings in ${(t2 - t1).toFixed(0)} ms, ${q.dims.at(-1)} dimensions each`);

const ranked = DOCS
  .map((d, i) => ({ d, s: cos_sim(Array.from(q.data), Array.from(docVecs[i].data)) }))
  .sort((a, b) => b.s - a.s);
for (const r of ranked) log(`${r.s.toFixed(3)}  ${r.d}`);
```

`dtype: 'q8'` selects `onnx/model_quantized.onnx`, 22,972,370 bytes, out of
the eight ONNX variants the repository ships (`fp16`, `int8`, `uint8`, `q4`,
`q4f16`, `bnb4`, `quantized`, and the unquantized `model.onnx`). Passing no
`dtype` at all is the single easiest way to accidentally download the full
one.

`pooling: 'mean'` and `normalize: true` are what turn a per-token tensor into
one comparable vector. Drop `normalize` and `cos_sim` still runs — it just
stops meaning what you think it means.

## 5. Serve it with two headers

```js
// server.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('./site/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.wasm': 'application/wasm', '.json': 'application/json',
};

createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  const file = join(ROOT, normalize(path === '/' ? '/index.html' : path));
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-embedder-policy': 'require-corp',
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(8080, () => console.log('http://localhost:8080/'));
```

Both details are worth a measurement rather than a shrug.

Serving the `.wasm` as `application/octet-stream` instead does **not** break
the page. It prints two console errors and carries on:

```text
wasm streaming compile failed: TypeError: Failed to execute 'compile' on
'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.
falling back to ArrayBuffer instantiation
```

The fallback buffers the whole 23,567,050-byte binary before compiling any of
it instead of compiling as it arrives. The page still produced identical
output. Nothing fails, so nothing tells you — which is how this
misconfiguration survives a launch.

The two cross-origin headers are what make the page cross-origin isolated,
and therefore what make `SharedArrayBuffer` and multi-threaded execution
available. In the run below, `crossOriginIsolated` evaluated to `true` and
`navigator.hardwareConcurrency` to `6`.

## 6. What it printed

```text
fetched config.json
fetched tokenizer_config.json
fetched tokenizer.json
fetched onnx/model_quantized.onnx
pipeline ready in 3.5 s (largest file 21.9 MB)
embedded 7 strings in 211 ms, 384 dimensions each
query: how do I make a model take up less memory
0.540  Quantization stores weights in fewer bits so a model fits in less memory.
0.265  A tokenizer splits text into the integer ids a model actually consumes.
0.186  Speculative decoding drafts several tokens with a small model and checks them with a large one.
0.181  A KV cache reuses the attention keys and values already computed for earlier tokens.
0.092  Sourdough needs a mature starter and a long cold proof in the fridge.
-0.025  Rosemary and thyme both survive a hard frost outdoors.
```

Four files, one of them the model. (`21.9 MB` is the same 22,972,370 bytes;
the page divides by 1,048,576.) 211 ms for seven strings, on CPU, in a tab.

The request log also shows what "`main`" resolved to: every model file was
fetched through
`huggingface.co/api/resolve-cache/models/Xenova/all-MiniLM-L6-v2/751bff37182d3f1213fa05d7196b954e230abad9/…`.
That hex string is the commit your run is pinned to whether you asked for a
pin or not — worth recording next to any evaluation numbers you publish.

Read the scores as a spread, not as a percentage. The intended answer scores
`0.540`. The nearest distractor scores `0.265` — a sentence about tokenizers
that shares vocabulary and register with the query but answers nothing.
Unrelated text scores near zero and can go below it: the gardening sentence
scores `-0.025`. On this model and this corpus, in other words, a fixed
threshold anywhere between `0.3` and `0.5` would have kept only the right
answer, and one at `0.25` would have admitted a wrong one. Print the losers,
not just the winner, before you pick a number.

## The CDN default, measured

Delete the `env.backends.onnx.wasm.wasmPaths` line and the page still works —
by fetching the runtime from `cdn.jsdelivr.net`. Both variants were loaded in
the same browser with every request's origin recorded:

```text
with wasmPaths set:      huggingface.co, us.aws.cdn.hf.co
with the line removed:   huggingface.co, us.aws.cdn.hf.co, cdn.jsdelivr.net
```

One line is the difference between two third-party origins and three. If you
are shipping this under a content-security policy, that is the line that
decides whether the policy needs a `jsdelivr` exception.

To go further and drop the model host too, mirror the four files the run
fetched — `config.json`, `tokenizer_config.json`, `tokenizer.json`,
`onnx/model_quantized.onnx` — onto your own origin and pass their location to
the pipeline. Then the page has no third-party origin at all.

## What was executed, and where

Every command and every output above was run on 2026-08-28. The page was
loaded in headless Chromium `151.0.7922.34`, driven by Playwright, on Windows
10 with Node `v24.13.0` and npm `11.6.2`. The `wasmPaths` comparison was two
separate loads of two pages differing only in that line; the MIME-type result
was a third load against a server differing only in its `.wasm`
`content-type`.

Not executed: the WebGPU backend. The import map points at the WebGPU-bundled
runtime, but every run here resolved to the WebAssembly path, so no number
above describes GPU performance. Nor was the page opened in a headed browser,
or in Firefox or Safari — the timings are one machine, one engine, one run
each.

## What will break this first

- **Transformers.js versioning.** The `dtype` option and `transformers.web.js`
  itself are library API, and this walkthrough is pinned to one release.
- **The ONNX Runtime build is not yours to choose.** The page loads whatever
  `onnxruntime-web` build the library pins — here `1.26.0-dev.20260416-b7804b056c`,
  while that package's own `latest` tag stood at `1.29.0`. Copying "the latest
  ORT" into `vendor/ort/` instead of the one in `node_modules` is how this
  stops working.
- **The model repository is a moving branch, not a release.** `main` was last
  modified 2025-07-22; a new commit changes the bytes behind the same URL.
- **File names.** `onnx/model_quantized.onnx` is a convention, not a contract.
  A re-export with different variant names changes what `dtype: 'q8'` resolves
  to.
