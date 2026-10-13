import { evaluate } from './engine.js';

// Signals about the Telegram/Discord community. activeRatio is the fraction
// of members who posted in the last 7 days (0 to 1).
export const COMMUNITY_KEYS = [
  'memberCount', 'activeRatio', 'modCount', 'hasRules', 'scamReports30d', 'growthSpike',
];

// Community score starts at 0 and earns up to 100 points.
const RULES = [
  { key: 'memberCount', when: (v) => v < 100, severity: 'info', points: 0, label: 'Under 100 members' },
  { key: 'memberCount', when: (v) => v >= 100 && v < 1000, severity: 'info', points: 8, label: 'Small community' },
  { key: 'memberCount', when: (v) => v >= 1000 && v < 10000, severity: 'info', points: 15, label: 'Established community' },
  { key: 'memberCount', when: (v) => v >= 10000, severity: 'good', points: 20, label: 'Large community' },

  { key: 'activeRatio', when: (v) => v >= 0.15, severity: 'good', points: 25, label: 'Members are actively talking' },
  { key: 'activeRatio', when: (v) => v >= 0.05 && v < 0.15, severity: 'info', points: 12, label: 'Moderate member activity' },
  { key: 'activeRatio', when: (v, s) => v < 0.02 && s.memberCount > 1000, severity: 'warning', points: -10,
    label: 'Large group, almost nobody is talking', detail: 'Often a sign of purchased or botted members.' },

  { key: 'modCount', when: (v) => v >= 3, severity: 'good', points: 15, label: 'Three or more moderators' },
  { key: 'modCount', when: (v) => v >= 1 && v < 3, severity: 'info', points: 8, label: 'One or two moderators' },
  { key: 'modCount', when: (v) => v === 0, severity: 'warning', points: 0,
    label: 'No moderators', detail: 'Scam links and impersonators go unchecked.' },

  { key: 'hasRules', when: (v) => v === true, severity: 'good', points: 10, label: 'Rules are pinned' },

  { key: 'scamReports30d', when: (v) => v === 0, severity: 'good', points: 20, label: 'No scam reports in the last 30 days' },
  { key: 'scamReports30d', when: (v) => v >= 1 && v < 3, severity: 'warning', points: 5,
    label: 'A few scam reports in the last 30 days' },
  { key: 'scamReports30d', when: (v) => v >= 3, severity: 'critical', points: -25, cap: 40,
    label: 'Three or more scam reports in the last 30 days', detail: 'Multiple people have reported this project.' },

  { key: 'growthSpike', when: (v) => v === false, severity: 'good', points: 10, label: 'Growth looks organic' },
  { key: 'growthSpike', when: (v) => v === true, severity: 'warning', points: -15,
    label: 'Sudden membership spike', detail: 'Rapid jumps in members can mean botting.' },
];

export function analyzeCommunity(signals) {
  return evaluate({ section: 'community', rules: RULES, input: signals, base: 0, keys: COMMUNITY_KEYS });
}
