// Form definitions for the manual-entry tabs, plus helpers to turn raw form
// values into the signal objects the scoring engine expects.
// Field types: number (as typed), percent (typed 0-100, stored 0-1), choice (yes/no/blank).

export const SOCIAL_FIELDS = [
  { key: 'accountAgeDays', type: 'number', label: 'Main X account age (days)', placeholder: '365' },
  { key: 'followers', type: 'number', label: 'Followers', placeholder: '12000' },
  { key: 'engagementRate', type: 'percent', label: 'Engagement rate (%)',
    hint: 'Average likes, replies and reposts per post as a share of followers. Around 1 to 3% is typical.', placeholder: '2' },
  { key: 'botFollowerPercent', type: 'percent', label: 'Estimated bot followers (%)',
    hint: 'Take this from a follower-audit tool.', placeholder: '10' },
  { key: 'verified', type: 'choice', label: 'Account is verified' },
  { key: 'teamDoxxed', type: 'choice', label: 'Team is publicly identified' },
  { key: 'hasWebsite', type: 'choice', label: 'Project has a website' },
  { key: 'hasWhitepaper', type: 'choice', label: 'Whitepaper or docs published' },
];

export const COMMUNITY_FIELDS = [
  { key: 'memberCount', type: 'number', label: 'Members', placeholder: '5000' },
  { key: 'activeRatio', type: 'percent', label: 'Members active in the last 7 days (%)',
    hint: 'Share of members who posted at least once.', placeholder: '12' },
  { key: 'modCount', type: 'number', label: 'Moderators', placeholder: '3' },
  { key: 'hasRules', type: 'choice', label: 'Rules are pinned' },
  { key: 'scamReports30d', type: 'number', label: 'Scam reports in the last 30 days',
    hint: 'Count reports you found on X, Telegram or scam-tracking sites.', placeholder: '0' },
  { key: 'growthSpike', type: 'choice', label: 'Membership jumped suddenly this month' },
];

export const CONTRACT_LABELS = {
  isOpenSource: 'Source verified',
  isHoneypot: 'Honeypot',
  cannotSellAll: 'Cannot sell full balance',
  isMintable: 'Mintable',
  isProxy: 'Upgradeable proxy',
  hiddenOwner: 'Hidden owner',
  ownerCanReclaim: 'Owner can reclaim ownership',
  ownerRenounced: 'Ownership renounced',
  transferPausable: 'Transfers pausable',
  hasBlacklist: 'Blacklist function',
  buyTax: 'Buy tax',
  sellTax: 'Sell tax',
  holderCount: 'Holders',
  lpLockedPercent: 'Liquidity locked',
  contractAgeDays: 'Contract age',
  hasAudit: 'Audit reported',
};

export function parseForm(fields, values) {
  const out = {};
  let any = false;
  for (const f of fields) {
    const raw = values[f.key];
    let v = null;
    if (raw !== undefined && raw !== '') {
      if (f.type === 'choice') v = raw === 'yes';
      else {
        const n = Number(raw);
        v = Number.isNaN(n) ? null : f.type === 'percent' ? n / 100 : n;
      }
    }
    out[f.key] = v;
    if (v !== null) any = true;
  }
  return any ? out : null;
}

export function formatSignal(key, value) {
  if (value === null || value === undefined) return 'Unknown';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key === 'buyTax' || key === 'sellTax') return `${Math.round(value * 1000) / 10}%`;
  if (key === 'lpLockedPercent') return `${value}%`;
  if (key === 'contractAgeDays') return `${value} days`;
  return Number(value).toLocaleString();
}
