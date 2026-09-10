// One guard call in its own process, so its process.exit(3) IS the observation.
// The prefixes arrive as JSON on argv rather than as bare tokens, because Git
// Bash rewrote a bare "/" into "C:/Program Files/Git/" and the rewrite was
// invisible in the result.
import { requireQuietTree } from './orch-require-quiet-tree.mjs';
const [root, expectedJson] = process.argv.slice(2);
requireQuietTree(root, [], JSON.parse(expectedJson));
console.log('ALLOWED');
