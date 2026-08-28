/**
 * redirects.mjs — `redirects.json` → `vercel.json` (task 2.9).
 *
 * Under `output: 'export'` Next's `redirects()` does not exist, so the host
 * applies them. The build generates the `redirects` array of `vercel.json`
 * from the checked-in `redirects.json`.
 *
 * **Ordering caveat, and why `vercel.json` is committed rather than ignored.**
 * Vercel reads `vercel.json` from the *source commit* when it configures a
 * deployment — before it runs the build command. A `vercel.json` produced
 * during that build therefore cannot affect that same deployment. So the
 * generated file must be committed: the local build regenerates it, the
 * publish step commits it alongside the `redirects.json` change, and the
 * deploy that follows reads the correct one. A `vercel.json` in `.gitignore`
 * would mean redirects that never take effect, and nothing would say so.
 *
 * Any top-level key other than `redirects` in an existing `vercel.json` is
 * preserved, so a later wave adding `headers` or `cleanUrls` is not clobbered
 * by a redirect regeneration.
 */

import { join } from 'node:path';
import { ROOT, readJson, writeJsonDeterministic } from './paths.mjs';
import { normalizeRoute } from './routes.mjs';

export const REDIRECTS_FILE = join(ROOT, 'redirects.json');
export const VERCEL_FILE = join(ROOT, 'vercel.json');

/**
 * @param {object} raw parsed redirects.json
 * @param {import('./errors.mjs').Diagnostics} diags
 * @returns {{source: string, destination: string, permanent: boolean}[]}
 */
export function validateRedirects(raw, diags, file = 'redirects.json') {
  const list = Array.isArray(raw) ? raw : (raw?.redirects ?? []);
  if (!Array.isArray(list)) {
    diags.error({ file, field: 'redirects', message: 'must be an array', rule: 'redirects' });
    return [];
  }
  const out = [];
  const seen = new Set();
  list.forEach((r, i) => {
    const at = `redirects[${i}]`;
    if (!r || typeof r !== 'object') {
      diags.error({ file, field: at, message: 'must be an object', rule: 'redirects' });
      return;
    }
    for (const key of ['source', 'destination']) {
      if (typeof r[key] !== 'string' || !r[key].startsWith('/')) {
        diags.error({
          file,
          field: `${at}.${key}`,
          message: `must be a root-relative path starting with "/" (got ${JSON.stringify(r[key])})`,
          rule: 'redirects',
        });
        return;
      }
    }
    const source = normalizeRoute(r.source);
    if (seen.has(source)) {
      diags.error({
        file,
        field: `${at}.source`,
        message: `duplicate redirect source "${source}"`,
        rule: 'redirects',
      });
      return;
    }
    if (source === normalizeRoute(r.destination)) {
      diags.error({
        file,
        field: `${at}.source`,
        message: `redirects to itself ("${source}")`,
        rule: 'redirects',
      });
      return;
    }
    seen.add(source);
    out.push({
      source,
      destination: r.destination,
      permanent: r.permanent !== false,
    });
  });
  return out.sort((a, b) => a.source.localeCompare(b.source));
}

export async function loadRedirects(diags, file = REDIRECTS_FILE) {
  const raw = await readJson(file, { redirects: [] });
  return validateRedirects(raw, diags, 'redirects.json');
}

export function mergeVercelConfig(existing, redirects) {
  const base = existing && typeof existing === 'object' ? { ...existing } : {};
  delete base.redirects;
  const keys = Object.keys(base).sort();
  const merged = {};
  for (const k of keys) merged[k] = base[k];
  merged.redirects = redirects;
  return merged;
}

export async function writeVercelConfig(redirects, file = VERCEL_FILE) {
  const existing = await readJson(file, null);
  return writeJsonDeterministic(file, mergeVercelConfig(existing, redirects));
}
