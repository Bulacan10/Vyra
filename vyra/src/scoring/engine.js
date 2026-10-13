// Shared rule engine used by every section (contract, social, community).
// A rule fires when its signal is known and `when(value, allSignals)` is true.
// Firing adds `points` to the section score and may impose a `cap` on the
// final overall score (used for deal-breakers like honeypots).

export const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

export const isKnown = (v) => v !== null && v !== undefined && !Number.isNaN(v);

export const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2, good: 3 };

export function evaluate({ section, rules, input, base, keys }) {
  if (!input) return null;

  let score = base;
  const findings = [];
  const caps = [];

  rules.forEach((rule, i) => {
    const value = input[rule.key];
    if (!isKnown(value) || !rule.when(value, input)) return;
    const points = rule.points ?? 0;
    score += points;
    if (rule.cap != null) caps.push(rule.cap);
    findings.push({
      id: `${section}:${i}`,
      section,
      severity: rule.severity,
      kind: rule.kind,
      label: rule.label,
      detail: rule.detail,
      points,
    });
  });

  const known = keys.filter((k) => isKnown(input[k])).length;

  return {
    section,
    score: Math.round(clamp(score)),
    caps,
    findings,
    coverage: known / keys.length,
  };
}
