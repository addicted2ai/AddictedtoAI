/**
 * errors.mjs — how the build says no.
 *
 * Two rules the specs are explicit about and this module makes structural:
 *
 *  1. A build failure always names the **file** and the **field** (or the
 *     reference) at fault. A diagnostic without a file path is a bug in the
 *     caller, not a style preference — the person reading it is a weak model
 *     with no context, and "invalid front matter" tells it nothing.
 *  2. Violations are *collected*, not thrown at the first one. Failing on
 *     error one hides errors two through nine and turns a five-minute fix
 *     into five builds.
 *
 * Warnings are a separate channel on purpose: the currency-literal check
 * (task 2.10) and the blog ceiling (task 4.6) are warnings, "not a failure,
 * so historical rebuilds never break".
 */

export class BuildError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BuildError';
  }
}

/** One problem, in the shape every reporter prints. */
export function diagnostic({ file, field, message, rule }) {
  return { file: file ?? null, field: field ?? null, message, rule: rule ?? null };
}

export function formatDiagnostic(d) {
  const where = d.file ? d.file : '<unknown file>';
  const what = d.field ? `${where}: ${d.field}` : where;
  const rule = d.rule ? ` [${d.rule}]` : '';
  return `${what}: ${d.message}${rule}`;
}

/**
 * Collects errors and warnings across a whole build pass, then fails once
 * with all of them. `throwIfErrors` is the single gate; nothing else in the
 * pipeline calls `process.exit`.
 */
export class Diagnostics {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  error(d) {
    this.errors.push(diagnostic(d));
    return this;
  }

  warn(d) {
    this.warnings.push(diagnostic(d));
    return this;
  }

  get ok() {
    return this.errors.length === 0;
  }

  /** Warnings go to stdout named, always — a silent warning is not a warning. */
  printWarnings(out = process.stdout) {
    for (const w of this.warnings) out.write(`warning: ${formatDiagnostic(w)}\n`);
    return this.warnings.length;
  }

  throwIfErrors(context = 'content') {
    if (this.ok) return;
    const lines = this.errors.map((e) => `  - ${formatDiagnostic(e)}`);
    throw new BuildError(
      `${this.errors.length} ${context} error(s):\n${lines.join('\n')}`,
    );
  }
}
