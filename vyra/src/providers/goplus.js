// Live contract data from the GoPlus Security public API.
// Checked against a live response for one token (USDT on Ethereum). Other chains
// and token types are still untested. Anything missing maps to null ("unknown").

export const CHAINS = {
  ethereum: { id: 1, label: 'Ethereum' },
  bsc: { id: 56, label: 'BNB Chain' },
  polygon: { id: 137, label: 'Polygon' },
  base: { id: 8453, label: 'Base' },
  arbitrum: { id: 42161, label: 'Arbitrum' },
};

const flag = (v) => (v === undefined || v === null || v === '' ? null : v === '1' || v === 1 || v === true);
const num = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const DEAD_OWNERS = [
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead',
];

// Share of liquidity held by locked LP positions, as 0-100. Null if unknown.
function lockedLiquidityPercent(lpHolders) {
  if (!Array.isArray(lpHolders) || lpHolders.length === 0) return null;
  const locked = lpHolders
    .filter((h) => h.is_locked === 1 || h.is_locked === '1')
    .reduce((sum, h) => sum + (Number(h.percent) || 0), 0);
  return Math.round(locked * 1000) / 10;
}

export function mapGoPlus(d) {
  const owner = typeof d.owner_address === 'string' ? d.owner_address.toLowerCase() : null;
  return {
    isOpenSource: flag(d.is_open_source),
    isHoneypot: flag(d.is_honeypot),
    isProxy: flag(d.is_proxy),
    isMintable: flag(d.is_mintable),
    ownerCanReclaim: flag(d.can_take_back_ownership),
    hiddenOwner: flag(d.hidden_owner),
    ownerRenounced: owner && DEAD_OWNERS.includes(owner) ? true : null,
    buyTax: num(d.buy_tax),
    sellTax: num(d.sell_tax),
    transferPausable: flag(d.transfer_pausable),
    hasBlacklist: flag(d.is_blacklisted),
    cannotSellAll: flag(d.cannot_sell_all),
    holderCount: num(d.holder_count),
    lpLockedPercent: lockedLiquidityPercent(d.lp_holders),
    contractAgeDays: null, // not provided by GoPlus
    hasAudit: null, // entered manually in the UI
  };
}

export async function fetchContractSignals(chainKey, address) {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error('Choose a supported chain.');
  const addr = address.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(addr)) {
    throw new Error('That does not look like a contract address. It should start with 0x and be 42 characters long.');
  }

  const res = await fetch(
    `https://api.gopluslabs.io/api/v1/token_security/${chain.id}?contract_addresses=${addr}`
  );
  if (!res.ok) throw new Error(`The scan service returned an error (${res.status}). Try again in a moment.`);

  const body = await res.json();
  const data = body?.result?.[addr];
  if (!data || Object.keys(data).length === 0) {
    throw new Error('No data found for this address on that chain. Check the chain and address.');
  }
  return mapGoPlus(data);
}
