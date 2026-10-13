import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTrustScore } from '../src/scoring/index.js';
import { analyzeContract, isEstablished } from '../src/scoring/contract.js';
import { analyzeSocial } from '../src/scoring/social.js';
import { analyzeCommunity } from '../src/scoring/community.js';
import { mapGoPlus } from '../src/providers/goplus.js';
import { DEMO_CONTRACTS } from '../src/providers/demo.js';

const bestSocial = {
  accountAgeDays: 800, followers: 20000, engagementRate: 0.03, botFollowerPercent: 0.05,
  verified: true, teamDoxxed: true, hasWebsite: true, hasWhitepaper: true,
};
const bestCommunity = {
  memberCount: 25000, activeRatio: 0.2, modCount: 5, hasRules: true,
  scamReports30d: 0, growthSpike: false,
};

test('best-case sections each score 100', () => {
  assert.equal(analyzeContract(DEMO_CONTRACTS.established.signals).score, 100);
  assert.equal(analyzeSocial(bestSocial).score, 100);
  assert.equal(analyzeCommunity(bestCommunity).score, 100);
});

test('established token with strong signals scores 100 as low risk', () => {
  const r = computeTrustScore({
    contract: DEMO_CONTRACTS.established.signals, social: bestSocial, community: bestCommunity,
  });
  assert.equal(r.score, 100);
  assert.equal(r.verdict.label, 'Low risk');
  assert.equal(r.confidence, 1);
});

test('honeypot caps the overall score even when social and community are perfect', () => {
  const r = computeTrustScore({
    contract: DEMO_CONTRACTS.honeypot.signals, social: bestSocial, community: bestCommunity,
  });
  assert.ok(r.score <= 10, `expected <= 10, got ${r.score}`);
  assert.equal(r.wasCapped, true);
  assert.equal(r.verdict.label, 'Critical risk');
});

test('returns null when there is no data', () => {
  assert.equal(computeTrustScore({ contract: null, social: null, community: null }), null);
});

test('missing sections are left out and lower confidence', () => {
  const r = computeTrustScore({ contract: null, social: bestSocial, community: null });
  assert.equal(r.score, 100);
  assert.ok(Math.abs(r.confidence - 0.3) < 1e-9);
});

test('unknown (null) signals never trigger rules', () => {
  const r = analyzeContract({ lpLockedPercent: null, holderCount: null, contractAgeDays: null });
  assert.equal(r.findings.length, 0);
  assert.equal(r.score, 100);
});

test('bot-heavy, low-engagement social presence scores poorly', () => {
  const r = analyzeSocial({
    accountAgeDays: 10, followers: 50000, engagementRate: 0.001, botFollowerPercent: 0.6,
    verified: false, teamDoxxed: false, hasWebsite: false, hasWhitepaper: false,
  });
  assert.equal(r.score, 0);
  assert.ok(r.findings.some((f) => f.severity === 'critical'));
});

test('three or more scam reports cap the overall score at 40', () => {
  const r = computeTrustScore({
    contract: DEMO_CONTRACTS.established.signals, social: bestSocial,
    community: { ...bestCommunity, scamReports30d: 5 },
  });
  assert.ok(r.score <= 40);
});

test('findings are sorted with the most severe first', () => {
  const r = computeTrustScore({ contract: DEMO_CONTRACTS.mixed.signals });
  const order = { critical: 0, warning: 1, info: 2, good: 3 };
  for (let i = 1; i < r.findings.length; i++) {
    assert.ok(order[r.findings[i - 1].severity] <= order[r.findings[i].severity]);
  }
});

test('mapGoPlus converts string flags and numbers, leaving gaps as null', () => {
  const s = mapGoPlus({
    is_open_source: '1', is_honeypot: '0', sell_tax: '0.05', holder_count: '1234',
    owner_address: '0x000000000000000000000000000000000000dead',
    lp_holders: [{ is_locked: 1, percent: '0.6' }, { is_locked: 0, percent: '0.4' }],
  });
  assert.equal(s.isOpenSource, true);
  assert.equal(s.isHoneypot, false);
  assert.equal(s.sellTax, 0.05);
  assert.equal(s.holderCount, 1234);
  assert.equal(s.ownerRenounced, true);
  assert.equal(s.lpLockedPercent, 60);
  assert.equal(s.isMintable, null);
  assert.equal(s.hasAudit, null);
});

// ---- Established-token handling ----

// What a live scan of USDT on Ethereum returned (see the screenshot test run).
const usdtLike = {
  isOpenSource: true, isHoneypot: false, isProxy: false, isMintable: true,
  ownerCanReclaim: false, hiddenOwner: false, ownerRenounced: null,
  buyTax: 0, sellTax: 0, transferPausable: true, hasBlacklist: true,
  cannotSellAll: null, holderCount: 15624287, lpLockedPercent: null,
  contractAgeDays: null, hasAudit: null,
};

test('widely held verified token: owner powers cost less (USDT-like scores 87, low risk)', () => {
  const r = computeTrustScore({ contract: usdtLike });
  assert.equal(r.score, 87);
  assert.equal(r.verdict.label, 'Low risk');
  assert.ok(r.findings.some((f) => f.label === 'Widely held and verified'));
});

test('the same powers on a small token keep the full penalty (67)', () => {
  const r = computeTrustScore({ contract: { ...usdtLike, holderCount: 640 } });
  assert.equal(r.score, 67);
  assert.ok(!r.findings.some((f) => f.label === 'Widely held and verified'));
});

test('established status needs verified source', () => {
  assert.equal(isEstablished({ ...usdtLike, isOpenSource: false }), false);
  assert.equal(isEstablished({ ...usdtLike, isOpenSource: null }), false);
});

test('established status is lost when any scam trap is present', () => {
  for (const trap of [{ isHoneypot: true }, { cannotSellAll: true }, { hiddenOwner: true }, { sellTax: 0.2 }, { buyTax: 0.2 }]) {
    assert.equal(isEstablished({ ...usdtLike, ...trap }), false, JSON.stringify(trap));
  }
});

test('a known young contract is not treated as established, an unknown age is', () => {
  assert.equal(isEstablished({ ...usdtLike, contractAgeDays: 20 }), false);
  assert.equal(isEstablished({ ...usdtLike, contractAgeDays: 400 }), true);
  assert.equal(isEstablished(usdtLike), true);
});

test('traps and caps are never discounted for a widely held token', () => {
  const hidden = analyzeContract({ ...usdtLike, hiddenOwner: true });
  const base = analyzeContract({ ...usdtLike, holderCount: 640, hiddenOwner: true });
  assert.equal(hidden.score, base.score);
  const honey = computeTrustScore({ contract: { ...usdtLike, isHoneypot: true } });
  assert.ok(honey.score <= 10);
});

test('unlocked liquidity is softened only for established tokens', () => {
  const small = analyzeContract({ isOpenSource: true, holderCount: 500, lpLockedPercent: 10 });
  const big = analyzeContract({ isOpenSource: true, holderCount: 500000, lpLockedPercent: 10 });
  assert.equal(small.score, 85);
  assert.equal(big.score, 94);
});

test('owner-control findings are tagged so the UI can label them', () => {
  const r = analyzeContract(usdtLike);
  const kinds = Object.fromEntries(r.findings.map((f) => [f.label, f.kind]));
  assert.equal(kinds['New tokens can be minted'], 'control');
  assert.equal(kinds['Transfers can be paused'], 'control');
});

test('result lists which sections have no data', () => {
  const r = computeTrustScore({ contract: usdtLike });
  assert.deepEqual(r.missingSections, ['social', 'community']);
  const all = computeTrustScore({ contract: usdtLike, social: bestSocial, community: bestCommunity });
  assert.deepEqual(all.missingSections, []);
});
