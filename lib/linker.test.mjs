/**
 * linker.test.mjs — task 2.6, and the most load-bearing tests in this wave.
 *
 * specs/wiki names five required fixtures: exclusive wrapped, shared plain,
 * manual plain, second occurrence plain, code block plain. They are the first
 * five tests below, run end to end through the real build over
 * `lib/fixtures/linker/`.
 *
 * The rest exist because those five would all still pass if the linker
 * quietly rewrote text, invented a link target, or linked an ambiguous
 * phrase. A guardrail is what it does when measured: `concatText` before and
 * after is the measurement that rule 1 is true, and the adversarial cases are
 * the measurement that rules 2 and 3 hold where they are hardest.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFixture } from './test-helpers.mjs';
import { linkAliases, concatText } from './linker.mjs';
import { toHast, hastToHtml } from './markdown.mjs';

const ALIASES = [
  { name: 'ComfyUI', id: 'tool/comfyui' },
  { name: 'GPT-5', id: 'model/gpt-5' },
];

function render(markdown, aliases = ALIASES, opts = {}) {
  const tree = toHast(markdown);
  const before = concatText(tree);
  const made = linkAliases(tree, aliases, opts);
  const after = concatText(tree);
  // Rule 1, measured on every single case this file exercises.
  assert.equal(after, before, 'linker changed the page text');
  return { html: hastToHtml(tree), made, tree };
}

let site;
let post;
test('load the linker fixture corpus', async () => {
  site = await buildFixture('linker');
  post = site.corpus.post.find((d) => d.slug === 'linker-cases');
  assert.ok(post, 'fixture post loaded');
});

test('2.6 rule 2: an exclusive alias is wrapped', () => {
  assert.match(post.html, /<a href="\/wiki\/tool\/comfyui" class="wiki-link" data-entry="tool\/comfyui">ComfyUI<\/a>/);
});

test('2.6 rule 4: the second occurrence is left plain', () => {
  const links = post.html.match(/data-entry="tool\/comfyui"/g) ?? [];
  assert.equal(links.length, 1, 'exactly one ComfyUI link on the page');
  assert.match(post.html, /A second mention of ComfyUI later on the same page stays plain/);
});

test('2.6 rule 6: a match inside a code block is left plain, and does not spend the page budget', () => {
  assert.match(post.html, /<code[^>]*>comfy launch ComfyUI --port 8188\n<\/code>/);
  // The code occurrence comes first in the document. If it had counted as the
  // first occurrence, the prose mention after it would have been left plain.
  assert.match(post.html, /first prose mention of <a href="\/wiki\/tool\/comfyui"/);
});

test('2.6 rule 6: a match inside a heading is left plain', () => {
  assert.match(post.html, /<h2[^>]*>GPT-5 named in a heading is left alone<\/h2>/);
});

test('2.6 rule 6: an alias inside an existing link is left exactly as written', () => {
  assert.match(post.html, /<a href="https:\/\/www\.comfy\.org">ComfyUI<\/a>/);
});

test('2.6 rule 3: a shared alias is left plain', () => {
  assert.ok(!post.html.includes('data-entry="model/claude-opus-5"'));
  assert.match(post.html, /Opus 5 is a shared alias/);
});

test('2.6 rule 3: a manual alias is left plain', () => {
  assert.match(post.html, /Claude is a manual one/);
  assert.ok(!/>Claude<\/a>/.test(post.html), 'no bare "Claude" link anywhere');
});

test('2.6 rule 3: a name two entries claim is ambiguous, even when only one claim is exclusive', () => {
  const comfy = site.aliases.byName.get('Comfy');
  assert.equal(comfy.claimed_by.length, 2);
  assert.equal(comfy.linkable, false, '"Comfy" is claimed twice, so it is not linkable');
  assert.match(post.html, /Comfy is claimed by two\nentries at once/);
});

test('2.6 rule 3: overlapping exclusive candidates are all refused', () => {
  assert.match(post.html, /the\nphrase Anthropic Claude Opus 5 has three exclusive aliases/);
  assert.ok(!post.html.includes('data-entry="org/anthropic"'), 'no Anthropic link');
});

test('2.6 boundaries are stricter than \\b: GPT-5 does not match inside GPT-5-turbo', () => {
  assert.match(post.html, /GPT-5-turbo must not match/);
  assert.match(post.html, /while <a href="\/wiki\/model\/gpt-5"[^>]*>GPT-5<\/a> standing on its own must/);
});

// ---- adversarial unit cases -----------------------------------------------

test('2.6 rule 1: the linker never inserts, removes, or rewords text', () => {
  const cases = [
    'ComfyUI at the start.',
    'Ends with ComfyUI',
    'ComfyUI',
    'Punctuated: ComfyUI, ComfyUI; ComfyUI!',
    '**Bold ComfyUI** and _italic ComfyUI_.',
    '| ComfyUI | GPT-5 |\n|---|---|\n| a | b |',
    '> Quoted ComfyUI.',
    '- ComfyUI in a list\n- GPT-5 too',
    'Nested [link with ComfyUI](/wiki/tool/comfyui) inside.',
    'A `ComfyUI` code span.',
    '# ComfyUI heading\n\nComfyUI body.',
  ];
  for (const md of cases) render(md); // render() asserts text invariance
});

test('2.6 rule 2: matching is case-sensitive', () => {
  const { html, made } = render('comfyui and COMFYUI and Comfyui are not matches.');
  assert.equal(made.length, 0);
  assert.ok(!html.includes('wiki-link'));
});

test('2.6 an alias adjacent to an element boundary is refused, not guessed', () => {
  // "**Comfy**UI" puts "UI" at the start of a text node whose neighbour is an
  // element: the boundary is unknowable, so the linker must stay silent.
  const { made } = render('**Comfy**UI is not ComfyUI.', [{ name: 'UI', id: 'concept/ui' }]);
  assert.equal(made.length, 0);
});

test('2.6 a page never links to itself', () => {
  const { made } = render('ComfyUI is this page.', ALIASES, { selfId: 'tool/comfyui' });
  assert.equal(made.length, 0);
});

test('2.6 the linker is deterministic: same input, byte-identical output', () => {
  const md = 'ComfyUI and GPT-5 and ComfyUI again, with GPT-5 twice.';
  const a = render(md).html;
  const b = render(md).html;
  assert.equal(a, b);
});

test('2.6 a refused first occurrence does not fall through to the second', () => {
  // "Alpha Beta" and "Beta" both exclusive: the first occurrence of "Beta"
  // overlaps, so both are refused — and the standalone "Beta" later in the
  // text must NOT inherit the budget. Rule 4 is "at most the first
  // occurrence", not "the first one that happens to be unambiguous".
  const aliases = [
    { name: 'Alpha Beta', id: 'model/alpha-beta' },
    { name: 'Beta', id: 'model/beta' },
  ];
  const { made, html } = render('Alpha Beta shipped, and Beta shipped later.', aliases);
  assert.equal(made.length, 0);
  assert.ok(!html.includes('wiki-link'));
});

test('2.6 rule 4: three occurrences on a page produce exactly one link', () => {
  // Rule 4 is structural rather than a filter: `linkAliases` computes exactly
  // one candidate per alias, so there is no "link them all" branch to remove.
  // This measures the property directly, at the boundary the spec names.
  const { html, made } = render('ComfyUI, then ComfyUI, and ComfyUI again.');
  assert.equal(made.length, 1);
  assert.equal((html.match(/wiki-link/g) ?? []).length, 1);
  assert.match(html, /<\/a>, then ComfyUI, and ComfyUI again\./);
});

test('2.6 an empty alias registry is a no-op, not a crash', () => {
  const { html, made } = render('Nothing to link here.', []);
  assert.equal(made.length, 0);
  assert.match(html, /Nothing to link here\./);
});
