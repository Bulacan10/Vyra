# Vyra

Vyra is a Web3 security reputation scanner. It combines contract, social and community signals into a single **0 to 100 trust score**, and explains every point that was added or lost.

> Vyra is a heuristic aid for doing your own research. It is not a guarantee of safety and not financial advice.

## Run it

```bash
npm install
npm run dev     # start the app
npm test        # run the scoring tests
npm run build   # production build into dist/
```

Requires Node 18 or newer.

## How the score works

Each section is scored 0 to 100 by a shared rule engine, then combined.

| Section | Weight | How it is scored |
| --- | --- | --- |
| Contract | 40% | Starts at 100 and loses points for risks: honeypot, unverified source, high taxes, hidden owner, mintable supply, unlocked liquidity and more |
| Social | 30% | Earns up to 100 points for account age, engagement, few bot followers, a verified account, a public team, a website and docs |
| Community | 30% | Earns up to 100 points for size, real activity, moderators, pinned rules, no scam reports and organic growth |

- **Deal-breakers cap the total.** A honeypot caps the overall score at 10, and three or more scam reports cap it at 40, however good everything else looks.
- **Established tokens get a fairer reading.** A token with a verified source, 100,000+ holders, no scam traps and no known young age is treated as established. Owner-control powers (mint, pause, blacklist, upgradeable proxy, reclaiming ownership) and unlocked liquidity then count for 40% of their normal penalty. Scam traps (honeypot, hidden owner, high taxes, unverified code) are never discounted, and the hard caps still apply. Holder counts can be inflated by airdrop spam, which is why the discount is limited to owner-control findings.
- **Missing data is not penalised.** Sections with no data are left out and the remaining weights are re-scaled. Unknown signals never trigger a rule. The **confidence** figure drops instead.
- **Bands:** 80+ low risk, 60 to 79 moderate, 40 to 59 high, under 40 critical.

## Data sources

| Section | Source today |
| --- | --- |
| Contract | Live scan through the public [GoPlus Security API](https://gopluslabs.io), plus three built-in samples. The GoPlus mapping has not been tested against live responses yet. |
| Social | Entered by hand |
| Community | Entered by hand |

## Project structure

```
src/
  scoring/      Rule engine and the contract, social and community rule tables
    engine.js     evaluate(): applies rules, tracks caps and coverage
    index.js      computeTrustScore(): combines sections into the final score
    weights.js    section weights and verdict bands
  providers/    Where signals come from (goplus.js live scan, demo.js samples)
  components/   React UI (tabs, forms, verdict ruler, findings list)
  fields.js     Form definitions and form-to-signal parsing
tests/          Scoring tests (node:test)
```

## Roadmap

- Verify and harden the GoPlus integration against live data
- Pull social signals automatically instead of typing them in
- Add a wallet or address reputation scan
- Save and share score reports
