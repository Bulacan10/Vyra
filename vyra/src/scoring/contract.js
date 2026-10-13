import { evaluate, isKnown } from './engine.js';
import { ESTABLISHED_MIN_HOLDERS, ESTABLISHED_MIN_AGE_DAYS, SOFT_FACTOR } from './weights.js';

// Signals describing the token contract. Taxes are fractions (0.05 = 5%) and
// lpLockedPercent is 0-100. null or undefined means "unknown" and never
// triggers a rule.
export const CONTRACT_KEYS = [
  'isOpenSource', 'isHoneypot', 'isProxy', 'isMintable', 'ownerCanReclaim',
  'hiddenOwner', 'ownerRenounced', 'buyTax', 'sellTax', 'transferPausable',
  'hasBlacklist', 'cannotSellAll', 'holderCount', 'lpLockedPercent',
  'contractAgeDays', 'hasAudit',
];

// Contract score starts at 100 and only loses points.
const RULES = [
  { key: 'isHoneypot', when: (v) => v === true, severity: 'critical', points: -80, cap: 10,
    label: 'Honeypot behaviour detected', detail: 'Buyers may not be able to sell this token.' },
  { key: 'cannotSellAll', when: (v) => v === true, severity: 'critical', points: -40, cap: 25,
    label: 'Holders cannot sell their full balance', detail: 'The contract blocks selling an entire balance, a common trap.' },
  { key: 'isOpenSource', when: (v) => v === false, severity: 'critical', points: -30,
    label: 'Source code is not verified', detail: 'Nobody can read what this contract actually does.' },
  { key: 'sellTax', when: (v) => v >= 0.3, severity: 'critical', points: -35, cap: 20,
    label: 'Sell tax is 30% or higher', detail: 'Most of the value is taken when you sell.' },
  { key: 'sellTax', when: (v) => v > 0.1 && v < 0.3, severity: 'warning', points: -20,
    label: 'Sell tax is above 10%', detail: 'High sell taxes eat into any exit.' },
  { key: 'buyTax', when: (v) => v > 0.1, severity: 'warning', points: -10,
    label: 'Buy tax is above 10%', detail: 'You lose a large share of every purchase.' },
  { key: 'hiddenOwner', when: (v) => v === true, severity: 'warning', points: -20,
    label: 'Hidden owner', detail: 'Someone keeps control of the contract without it being obvious.' },
  { key: 'ownerCanReclaim', when: (v) => v === true, severity: 'warning', kind: 'control', soft: true, points: -15,
    label: 'Owner can take back ownership', detail: 'Renouncing ownership may not be permanent.' },
  { key: 'isMintable', when: (v) => v === true, severity: 'warning', kind: 'control', soft: true, points: -15,
    label: 'New tokens can be minted', detail: 'Supply can be inflated, which dilutes holders.' },
  { key: 'transferPausable', when: (v) => v === true, severity: 'warning', kind: 'control', soft: true, points: -10,
    label: 'Transfers can be paused', detail: 'The owner can freeze trading.' },
  { key: 'hasBlacklist', when: (v) => v === true, severity: 'warning', kind: 'control', soft: true, points: -8,
    label: 'Blacklist function present', detail: 'The owner can block specific wallets from trading.' },
  { key: 'isProxy', when: (v) => v === true, severity: 'warning', kind: 'control', soft: true, points: -8,
    label: 'Upgradeable proxy contract', detail: 'The code can be swapped after you buy.' },
  { key: 'lpLockedPercent', when: (v) => v < 50, severity: 'warning', soft: true, points: -15,
    label: 'Less than half of liquidity is locked', detail: 'Liquidity can be pulled out, which is how rug pulls happen.' },
  { key: 'holderCount', when: (v) => v < 100, severity: 'warning', points: -10,
    label: 'Fewer than 100 holders', detail: 'A tiny holder base is easy to manipulate.' },
  { key: 'contractAgeDays', when: (v) => v < 7, severity: 'warning', points: -10,
    label: 'Contract is under a week old', detail: 'There is no track record yet.' },
  { key: 'hasAudit', when: (v) => v === false, severity: 'info', points: -5,
    label: 'No audit reported', detail: 'No independent review of the code was found.' },

  // Positive findings (no points, the base is already 100)
  { key: 'isOpenSource', when: (v) => v === true, severity: 'good', label: 'Source code is verified' },
  { key: 'ownerRenounced', when: (v) => v === true, severity: 'good', label: 'Ownership is renounced' },
  { key: 'lpLockedPercent', when: (v) => v >= 80, severity: 'good', label: 'Most liquidity is locked' },
  { key: 'hasAudit', when: (v) => v === true, severity: 'good', label: 'An audit is reported' },
  { key: 'holderCount', when: (v, all) => isEstablished(all), severity: 'good',
    label: 'Widely held and verified', detail: 'Owner-control risks are weighted lower for tokens like this.' },
];

/**
 * A token counts as established when its source is verified, it has a very large
 * holder base, it shows no scam traps, and it is not known to be brand new.
 * Holder counts can be inflated by airdrop spam, so this only ever softens
 * owner-control findings. Traps and hard caps are never discounted.
 */
export function isEstablished(s) {
  if (!s) return false;
  const trapped =
    s.isHoneypot === true || s.cannotSellAll === true || s.hiddenOwner === true ||
    s.sellTax > 0.1 || s.buyTax > 0.1;
  const tooYoung = isKnown(s.contractAgeDays) && s.contractAgeDays < ESTABLISHED_MIN_AGE_DAYS;
  return s.holderCount >= ESTABLISHED_MIN_HOLDERS && s.isOpenSource === true && !trapped && !tooYoung;
}

// For established tokens, soften the penalty on rules flagged `soft`.
function rulesFor(signals) {
  if (!isEstablished(signals)) return RULES;
  return RULES.map((r) =>
    r.soft
      ? {
          ...r,
          points: Math.round(r.points * SOFT_FACTOR),
          detail: `${r.detail} Weighted lower because this token is verified and widely held.`,
        }
      : r
  );
}

export function analyzeContract(signals) {
  return evaluate({ section: 'contract', rules: rulesFor(signals), input: signals, base: 100, keys: CONTRACT_KEYS });
}
