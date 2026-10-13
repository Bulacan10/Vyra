import { analyzeContract } from './contract.js';
import { analyzeSocial } from './social.js';
import { analyzeCommunity } from './community.js';
import { SECTION_WEIGHTS, verdictFor } from './weights.js';
import { clamp, SEVERITY_ORDER } from './engine.js';

/**
 * Combine the three sections into one 0-100 trust score.
 * Sections with no data are left out and the remaining weights re-normalised.
 * `confidence` falls when sections or signals are missing.
 * Returns null when there is no data at all.
 */
export function computeTrustScore({ contract, social, community }) {
  const sections = [
    analyzeContract(contract),
    analyzeSocial(social),
    analyzeCommunity(community),
  ].filter(Boolean);

  if (sections.length === 0) return null;

  const totalWeight = sections.reduce((sum, s) => sum + SECTION_WEIGHTS[s.section], 0);
  const weighted =
    sections.reduce((sum, s) => sum + s.score * SECTION_WEIGHTS[s.section], 0) / totalWeight;

  // Deal-breakers (honeypot, heavy scam reports) cap the overall score.
  const caps = sections.flatMap((s) => s.caps);
  const capped = caps.length ? Math.min(weighted, ...caps) : weighted;
  const score = Math.round(clamp(capped));

  const confidence = sections.reduce(
    (sum, s) => sum + s.coverage * SECTION_WEIGHTS[s.section],
    0
  );

  const findings = sections
    .flatMap((s) => s.findings)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return {
    score,
    verdict: verdictFor(score),
    confidence,
    wasCapped: capped < weighted,
    missingSections: Object.keys(SECTION_WEIGHTS).filter(
      (k) => !sections.some((s) => s.section === k)
    ),
    sections,
    findings,
  };
}
