# Evidence — tutorial `browser-embeddings-no-server`

Real-run transcripts backing every output shown in
`content/tutorials/browser-embeddings-no-server.md`.

- **Date of run:** 2026-08-28
- **Where:** a scratch directory outside this repository
  (`…/scratchpad/browser-inference/`), with its own `package.json`. Nothing
  was added to this repository's manifest: `@huggingface/transformers` pulls
  `onnxruntime-node` and 382 MB of `node_modules`, and it is the *subject* of
  the tutorial, not a dependency of the site.
- **Machine:** Windows 10, Node `v24.13.0`, npm `11.6.2`.
- **Browser:** headless Chromium `151.0.7922.34` (Playwright), driven by a
  script that waits for `window.__done === true` and then reads the page.

## 1. Install

```
$ npm install @huggingface/transformers --no-audit --no-fund
npm warn deprecated boolean@3.2.0: Package no longer supported. …
added 49 packages in 14s
```

```
$ du -sh node_modules
382M    …/scratchpad/browser-inference/node_modules
```

Versions installed (from the packages' own `package.json` files):

```
@huggingface/transformers  4.2.0
onnxruntime-web            1.26.0-dev.20260416-b7804b056c
onnxruntime-common         1.24.3
```

Cross-checked against the npm registry the same day:

```
$ node npmreg.mjs
@huggingface/transformers: version 4.2.0, license Apache-2.0, homepage https://github.com/huggingface/transformers.js#readme
onnxruntime-web: version 1.29.0, license MIT, homepage https://github.com/Microsoft/onnxruntime#readme
onnxruntime-common: version 1.29.0, license MIT, homepage https://github.com/Microsoft/onnxruntime#readme
onnxruntime-web dist-tags: {"extensions":"1.9.0-extensions","latest":"1.29.0","dev":"1.30.0-dev.20260826-b1f76d586a"}
has 1.26.0-dev.20260416-b7804b056c: true
```

That is the source of the tutorial's claim that the ORT build the page loads
is pinned by the library and trails `latest`.

## 2. Vendoring

```
$ node vendor.mjs
vendored transformers.web.js + 9 onnxruntime files

Name                                 Length
----                                 ------
transformers.web.js                  1099109
ort-wasm-simd-threaded.asyncify.mjs  47389
ort-wasm-simd-threaded.asyncify.wasm 23567050
ort-wasm-simd-threaded.jsep.mjs      46490
ort-wasm-simd-threaded.jsep.wasm     26101073
ort-wasm-simd-threaded.jspi.mjs      44518
ort-wasm-simd-threaded.jspi.wasm     14555814
ort-wasm-simd-threaded.mjs           24180
ort-wasm-simd-threaded.wasm          12942611
```

(The first `vendor.mjs` run copied 8 files; `ort.webgpu.bundle.min.mjs` was
added to the copy list after the import-map failure below, making 9.)

## 3. The import-map failure, before the fix

Loading `transformers.web.js` as a plain module, with no import map:

```
$ node verify.mjs
chromium 151.0.7922.34
PAGEERROR Failed to resolve module specifier "onnxruntime-web/webgpu". Relative references must start with either "/", "./", or "../".
page.waitForFunction: Timeout 300000ms exceeded.
```

The two bare specifiers were located in the build itself:

```
7547:from "onnxruntime-web/webgpu"
7605:from "onnxruntime-common"
```

## 4. The run shown in the tutorial

```
$ node verify.mjs
chromium 151.0.7922.34
--- page text ---
starting...
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

--- non-local origins requested ---
  https://huggingface.co
  https://us.aws.cdn.hf.co
```

## 5. Request log and isolation state (same page, instrumented run)

```
$ node verify2.mjs 8080
chromium 151.0.7922.34
RESULT: completed
crossOriginIsolated = true
hardwareConcurrency = 6
--- requests ---
  /
  /app.js
  /vendor/transformers.web.js
  /vendor/ort/ort.webgpu.bundle.min.mjs
  https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/config.json
  https://huggingface.co/api/resolve-cache/models/Xenova/all-MiniLM-L6-v2/751bff37182d3f1213fa05d7196b954e230abad9/config.json?…
  https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/tokenizer_config.json
  https://huggingface.co/api/resolve-cache/models/Xenova/all-MiniLM-L6-v2/751bff37182d3f1213fa05d7196b954e230abad9/tokenizer_config.json?…
  https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/onnx/model_quantized.onnx
  https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/tokenizer.json
  https://huggingface.co/api/resolve-cache/models/Xenova/all-MiniLM-L6-v2/751bff37182d3f1213fa05d7196b954e230abad9/tokenizer.json?…
  https://us.aws.cdn.hf.co/xet-bridge-us/…/…?…filename%3D%22model_quantized.onnx%22…
  (revalidation repeats of the three JSON files and the onnx file)
  /vendor/ort/ort-wasm-simd-threaded.asyncify.mjs
  /vendor/ort/ort-wasm-simd-threaded.asyncify.mjs
  /vendor/ort/ort-wasm-simd-threaded.asyncify.mjs
  /vendor/ort/ort-wasm-simd-threaded.asyncify.wasm
```

Sources of three tutorial claims: exactly one of the four `.wasm` builds was
fetched (`…asyncify.wasm`); the repository revision behind `main` is
`751bff37182d3f1213fa05d7196b954e230abad9`; the page is cross-origin isolated.

## 6. The `wasmPaths` comparison

Second page, identical except that
`env.backends.onnx.wasm.wasmPaths = '/vendor/ort/'` is absent:

```
$ node verify.mjs /default.html
chromium 151.0.7922.34
--- page text ---
starting...
ok, 384 dimensions

--- non-local origins requested ---
  https://huggingface.co
  https://us.aws.cdn.hf.co
  https://cdn.jsdelivr.net
  http://localhost:8080
```

## 7. The MIME-type test

Third server, identical except that `.wasm` is served as
`application/octet-stream`:

```
$ node verify2.mjs 8081
chromium 151.0.7922.34
CONSOLE-ERROR wasm streaming compile failed: TypeError: Failed to execute 'compile' on 'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.
CONSOLE-ERROR falling back to ArrayBuffer instantiation
RESULT: completed
crossOriginIsolated = true
hardwareConcurrency = 6
```

The draft of this tutorial had claimed browsers *refuse* the wrong MIME type.
The measurement says they warn and fall back, and the page still completes.
The tutorial states the measured behavior.

## 8. Model metadata used in front matter and prose

```
$ node hf.mjs
sha          751bff37182d3f1213fa05d7196b954e230abad9
lastModified 2025-07-22T16:42:24.000Z
license      apache-2.0 | tags: transformers.js, onnx, bert, feature-extraction, base_model:sentence-transformers/all-MiniLM-L6-v2, …
pipeline     feature-extraction | library: transformers.js
onnx files : onnx/model.onnx, onnx/model_bnb4.onnx, onnx/model_fp16.onnx, onnx/model_int8.onnx, onnx/model_q4.onnx, onnx/model_q4f16.onnx, onnx/model_quantized.onnx, onnx/model_uint8.onnx
hidden_size 384 | layers 6 | max_pos 512 | arch [ 'BertModel' ]
model_quantized.onnx HTTP 200 bytes 22972370
```

## What was not executed

- The WebGPU execution provider. Every run resolved to the WebAssembly path.
- Any browser other than headless Chromium `151.0.7922.34`; no headed run, no
  Firefox, no Safari.
- Repeat runs for timing variance. `3.5 s` and `211 ms` are single
  observations on one machine.
