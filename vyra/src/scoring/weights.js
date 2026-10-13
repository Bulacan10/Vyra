// How much each section contributes to the final trust score.
// Weights are re-normalised across whichever sections have data.
export const SECTION_WEIGHTS = { contract: 0.4, social: 0.3, community: 0.3 };

// Score bands, highest first.
export const VERDICTS = [
  { min: 80, label: 'Low risk', tone: 'good' },
  { min: 60, label: 'Moderate risk', tone: 'warn' },
  { min: 40, label: 'High risk', tone: 'bad' },
  { min: 0, label: 'Critical risk', tone: 'critical' },
];

export function verdictFor(score) {
  return VERDICTS.find((v) => score >= v.min);
}
