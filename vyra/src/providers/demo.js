// Sample contract signals so the app is usable without any network access.
export const DEMO_CONTRACTS = {
  established: {
    label: 'Established token',
    signals: {
      isOpenSource: true, isHoneypot: false, isProxy: false, isMintable: false,
      ownerCanReclaim: false, hiddenOwner: false, ownerRenounced: true,
      buyTax: 0, sellTax: 0, transferPausable: false, hasBlacklist: false,
      cannotSellAll: false, holderCount: 48200, lpLockedPercent: 92,
      contractAgeDays: 900, hasAudit: true,
    },
  },
  mixed: {
    label: 'Mixed signals',
    signals: {
      isOpenSource: true, isHoneypot: false, isProxy: true, isMintable: true,
      ownerCanReclaim: false, hiddenOwner: false, ownerRenounced: false,
      buyTax: 0.03, sellTax: 0.12, transferPausable: false, hasBlacklist: true,
      cannotSellAll: false, holderCount: 640, lpLockedPercent: 35,
      contractAgeDays: 21, hasAudit: false,
    },
  },
  honeypot: {
    label: 'Honeypot-style token',
    signals: {
      isOpenSource: false, isHoneypot: true, isProxy: false, isMintable: true,
      ownerCanReclaim: true, hiddenOwner: true, ownerRenounced: false,
      buyTax: 0.05, sellTax: 0.99, transferPausable: true, hasBlacklist: true,
      cannotSellAll: true, holderCount: 42, lpLockedPercent: 0,
      contractAgeDays: 2, hasAudit: false,
    },
  },
};
