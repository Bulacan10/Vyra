import { evaluate } from './engine.js';

// Signals about the project's public presence. Rates are fractions (0 to 1).
export const SOCIAL_KEYS = [
  'accountAgeDays', 'followers', 'engagementRate', 'botFollowerPercent',
  'verified', 'teamDoxxed', 'hasWebsite', 'hasWhitepaper',
];

// Social score starts at 0 and earns up to 100 points.
const RULES = [
  { key: 'accountAgeDays', when: (v) => v < 30, severity: 'warning', points: 0,
    label: 'Main account is under 30 days old', detail: 'Brand-new accounts have no history to judge.' },
  { key: 'accountAgeDays', when: (v) => v >= 30 && v < 180, severity: 'info', points: 8,
    label: 'Main account is under six months old' },
  { key: 'accountAgeDays', when: (v) => v >= 180 && v < 365, severity: 'info', points: 14,
    label: 'Main account is under a year old' },
  { key: 'accountAgeDays', when: (v) => v >= 365, severity: 'good', points: 20,
    label: 'Main account is over a year old' },

  { key: 'engagementRate', when: (v) => v >= 0.02, severity: 'good', points: 20,
    label: 'Healthy engagement' },
  { key: 'engagementRate', when: (v) => v >= 0.005 && v < 0.02, severity: 'info', points: 10,
    label: 'Modest engagement' },
  { key: 'engagementRate', when: (v, s) => v < 0.005 && s.followers > 5000, severity: 'warning', points: -10,
    label: 'Large audience with almost no engagement', detail: 'This pattern often points to bought followers.' },

  { key: 'botFollowerPercent', when: (v) => v > 0.4, severity: 'critical', points: -20,
    label: 'Over 40% of followers look like bots', detail: 'The audience is likely inflated.' },
  { key: 'botFollowerPercent', when: (v) => v > 0.2 && v <= 0.4, severity: 'warning', points: -10,
    label: 'Over 20% of followers look like bots' },
  { key: 'botFollowerPercent', when: (v) => v <= 0.2, severity: 'good', points: 10,
    label: 'Few bot followers' },

  { key: 'verified', when: (v) => v === true, severity: 'good', points: 10, label: 'Account is verified' },
  { key: 'teamDoxxed', when: (v) => v === true, severity: 'good', points: 20,
    label: 'Team is publicly identified' },
  { key: 'teamDoxxed', when: (v) => v === false, severity: 'info', points: 0,
    label: 'Team is anonymous', detail: 'Nobody can be held accountable if things go wrong.' },
  { key: 'hasWebsite', when: (v) => v === true, severity: 'good', points: 10, label: 'Project has a website' },
  { key: 'hasWebsite', when: (v) => v === false, severity: 'info', points: 0, label: 'No website' },
  { key: 'hasWhitepaper', when: (v) => v === true, severity: 'good', points: 10, label: 'Whitepaper or docs published' },
  { key: 'hasWhitepaper', when: (v) => v === false, severity: 'info', points: 0, label: 'No whitepaper or docs' },
];

export function analyzeSocial(signals) {
  return evaluate({ section: 'social', rules: RULES, input: signals, base: 0, keys: SOCIAL_KEYS });
}
