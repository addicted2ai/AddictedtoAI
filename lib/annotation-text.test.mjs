import test from 'node:test';
import assert from 'node:assert/strict';
import { annotationText } from './annotation-text.mjs';

test('renders non-empty backtick spans as code', () => {
  assert.equal(annotationText('status is `active`'), 'status is <code>active</code>');
});

test('escapes before promoting code spans', () => {
  assert.equal(
    annotationText('<script>alert(1)</script> & "'),
    '&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;',
  );
});

test('leaves unmatched and empty spans as escaped literal text', () => {
  assert.equal(annotationText('`one only'), '`one only');
  assert.equal(annotationText('empty `` span'), 'empty `` span');
});

test('keeps escaped characters inside promoted code spans escaped', () => {
  assert.equal(annotationText('value is `a<b`'), 'value is <code>a&lt;b</code>');
});
