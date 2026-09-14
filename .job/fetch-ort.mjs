import { writeFileSync } from 'node:fs';
const urls = [
  'https://registry.npmjs.org/onnxruntime-web/latest',
  'https://registry.npmjs.org/-/package/onnxruntime-web/dist-tags',
];
let out = `run at ${new Date().toString()}\n`;
for (const u of urls) {
  const r = await fetch(u);
  const body = await r.text();
  out += `\n=== GET ${u}\nHTTP ${r.status} date: ${r.headers.get('date')}\n${body}\n`;
}
writeFileSync('D:/addictedtoai-worktrees/j-20260914-26/data/reviews/evidence/verify-onnx-runtime-web-latest-release.raw.txt', out);
console.log(out.length);
