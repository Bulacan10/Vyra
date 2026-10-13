// How much each section contributes to the final trust score.
// Weights are re-normalised across whichever sections have data.
export const SECTION_WEIGHTS = { contract: 0.4, social: 0.3, community: 0.3 };

// A verified token with a very large holder base is treated as "established":
// owner-control powers (mint, pause, blacklist...) then count for less.
// Scam traps (honeypot, hidden owner, high taxes, unverified code) never get this discount.
export const ESTABLISHED_MIN_HOLDERS = 100000;
export const ESTABLISHED_MIN_AGE_DAYS = 90; // ignored when the age is unknown
export const SOFT_FACTOR = 0.4; // share of a control penalty that still applies

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
