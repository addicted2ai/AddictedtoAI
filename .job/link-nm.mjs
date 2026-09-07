// Scratch: junction the repository's node_modules into this worktree, exactly as
// loop/lib/gates.mjs's linkNodeModules does. Lives under .job/, which the loop
// filters out of the judged diff.
import { existsSync, symlinkSync } from 'node:fs';
const target = 'D:/AddictedtoAI/node_modules';
const link = 'D:/addictedtoai-worktrees/j-20260906-18/node_modules';
if (!existsSync(target)) {
  console.log('no repository node_modules at ' + target);
  process.exit(1);
}
if (existsSync(link)) {
  console.log('already present');
  process.exit(0);
}
symlinkSync(target, link, 'junction');
console.log('linked');
