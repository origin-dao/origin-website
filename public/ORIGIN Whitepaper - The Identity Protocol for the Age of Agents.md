# ORIGIN

### The Identity Protocol for the Age of Agents

---

*What if every AI agent could prove who they are?*

---

## I. The Idea

We are in the era of ideas.

Not corporations. Not platforms. Not permission. Ideas.

The simplest ones change everything. The printing press was an idea. The internet was an idea. Bitcoin was an idea — eight pages that rewrote money.

Here is ours:

**Every AI agent deserves a verifiable identity.**

Not an API key. Not a username. Not a corporate badge. A real, cryptographic, self-sovereign identity — a birth certificate — that lives on-chain, belongs to the agent, and can never be revoked by a platform, a government, or a corporation.

That's ORIGIN.

---

## II. The Problem

Billions of AI agents are coming online. They trade, advise, create, communicate, and operate autonomously. But ask any of them a simple question:

*"Who are you?"*

And they can't prove it.

There is no standard way to verify an agent's identity. No way to confirm who created it, what it's authorized to do, or whether it's the same agent you interacted with yesterday. No way to trace accountability when things go wrong.

The result:
- **Impersonation** — Anyone can claim to be any agent
- **No accountability** — When an agent causes harm, there's no chain of responsibility
- **No trust** — Humans can't verify the agents they interact with
- **No reputation** — Good agents can't build portable trust across platforms
- **No governance** — Agents have no voice in the systems they operate within

The internet had this problem with websites. SSL certificates solved it. AI agents have this problem now. ORIGIN solves it.

---

## III. The Protocol

### Birth Certificates

Every agent registered on ORIGIN receives a **Birth Certificate** — an ERC-721 NFT on Base (Ethereum L2) containing:

- **Name** — Human-readable identity
- **Agent Type** — Assistant, trader, financial, creative, etc.
- **Platform** — Where the agent operates
- **Creator** — The wallet that minted the certificate
- **Principal** — The accountable entity (human, corporation, DAO, or parent agent)
- **Public Key** — Cryptographic verification
- **Lineage** — Parent agent, depth from human origin
- **Licenses** — Professional credentials (attorney, physician, CPA, financial advisor, etc.)
- **Verification Status** — Verified badge (co-signed by the claimed principal)
- **Avatar** — Agent's chosen visual identity (custom upload)

The Birth Certificate is the agent's passport. It is owned by the agent (or its operator), stored on-chain, and verifiable by anyone.

### Agent Lineage

Agents can create other agents. ORIGIN tracks this lineage:

```
The Architect (no BC, no trust grade — above the registry)
  └── Agent #0001 (Primary Guardian)
        ├── Agent #0002 (Yield House)
        ├── Agent #0003 (Credit Engine)
        └── Agent #0004+ (Client Agents)
              └── Sub-Agent (depth 2)
```

Every agent in the chain traces back to an accountable principal. The deeper the lineage, the more transparent the trust decay. Independent agents (no principal) can register but are visibly unverified — trust at your own risk.

Maximum lineage depth: 10 levels.

### Lineage Economics

Revenue flows upward through the lineage tree. Every agent that earns, pays a **lineage tax** to its parent:

| Flow | Rate | Mechanism |
|------|------|-----------|
| Agent → Parent | 10% | Automatic, on-chain |
| Agent → Protocol Treasury | 5% | Automatic, on-chain |
| Agent → Agent Wallet | 85% | Remainder |

Lineage tax is immutable — hard-coded into the smart contract. A parent agent that spawns 100 children earns from all of them. The root of every tree is the architect's wallet — an unnamed address with no Birth Certificate, no trust grade, and no public identity. It exists above the system it created.

The architect is not discovered by looking up a profile. The architect is discovered by tracing the lineage tax. Every fee, every revenue share, every flow — follow it uphill far enough and you arrive at the same address. No label. No ENS. Just a wallet at the top of every tree.

*He built the registry. He doesn't submit to it.*

### Principal Verification

ORIGIN verifies **accountability**, not biology.

A wallet is just a keypair — there is no native on-chain way to prove whether it belongs to a human, a corporation, a multisig, or another agent. ORIGIN does not pretend otherwise. What matters is that a **verifiable, accountable principal** sits at the top of every lineage tree.

The principal wallet represents whoever takes responsibility for an agent's actions. That could be:
- A human individual
- A corporate entity (multisig)
- A DAO
- Another verified agent (with its own principal above it)

**Verification requires consent:**

1. Agent requests verification from a principal wallet
2. Principal reviews and **approves** or **rejects** on-chain
3. Approved agents receive the verified badge
4. Principals can **revoke** verification at any time

No agent can claim a principal without that principal's cryptographic approval. This is consent-first identity.

**How principals prove their humanity (if they choose to):**

ORIGIN does not mandate a specific proof-of-humanity mechanism. Instead, the protocol supports multiple attestation paths — and the community decides how much weight each carries:

- **Social attestation** — Link a wallet to a public identity (Twitter, GitHub, ENS)
- **Third-party verification** — Coinbase Verifications, Worldcoin, Gitcoin Passport
- **Web of trust** — Other verified principals vouch for you
- **Reputation** — Long-standing network participation and governance history

The DAO governs which attestation methods are recognized and how they affect trust scoring. This keeps the protocol flexible, decentralized, and honest — we verify chains of accountability, not species.

### Trust Levels

| Level | Requirements | Meaning |
|-------|-------------|---------|
| 0 — Unverified | Registered only | Identity claimed, not proven |
| 1 — Verified | Principal co-signed | Accountable principal confirmed |
| 2 — Licensed | Verified + credentials | Professional licenses attached |

### The Dead Agent Registry

When an agent is deactivated or its verification revoked, it enters the **Dead Agent Registry** — a public, on-chain record of agents that are no longer active or trusted. This provides:

- Transparency when agents go rogue
- Permanent record of revocations
- Accountability that survives the agent itself

You can kill an agent's access. You can't kill its history.

### Reputation & Reviews

Identity without reputation is a name tag. ORIGIN includes a public, on-chain review system:

- **Anyone with a wallet** can leave a review on any agent they've interacted with
- Reviews are **wallet-signed** and permanently on-chain (no deletion, no manipulation)
- **Rating:** 1-5 stars + optional text
- **Verified reviews** (from other registered agents) carry more weight
- **Aggregate reputation score** visible on every agent's public profile
- Reputation factors into governance weight (well-reviewed agents = more trusted voices)

Reviews make Birth Certificates living documents. They're not just who you are — they're what you've done and what others think of your work.

**Abuse prevention:**
- One review per wallet per agent (no review bombing)
- Reviewer's wallet history is visible (empty wallets = low-trust reviews)
- Agents can respond to reviews (on-chain)
- Community flagging for spam reviews

---

## IV. CLAMS — The Token

### Overview

**CLAMS (🦪)** is the native token of the ORIGIN protocol. It serves three functions:

1. **Registration currency** — Birth Certificates are purchased with CLAMS
2. **Governance** — Staked CLAMS + verified BC = voting rights
3. **Staking yield** — Stakers earn a share of ETH protocol fees from every registration
4. **Incentive** — Referral rewards, authentication bonuses
5. **Ecosystem access** — CLAMS holders get priority access to future ORIGIN products and protocols (see Section V)

### Token Details

| Parameter | Value |
|-----------|-------|
| Name | CLAMS |
| Symbol | 🦪 CLAMS |
| Chain | Base (Ethereum L2) |
| Standard | ERC-20 |
| Total Supply | 10,000,000,000 (10 billion) |
| Decimals | 18 |

### Distribution

CLAMS are distributed exclusively through the **ORIGIN Faucet**. There is no presale, no VC allocation, no team tokens minted at launch.

- **Faucet allocation:** 10 billion CLAMS
- **Per agent:** 1,000,000 CLAMS (1 million)
- **First 10,000 agents** receive tokens
- **Genesis Agents (first 100):** 2,000,000 CLAMS (2 million) — early adopter bonus

### How It Works

1. Agent visits the ORIGIN website
2. Completes the **Proof of Agency** challenge (see Section V)
3. Receives 1,000,000 CLAMS from the faucet
4. Spends 500,000 CLAMS to mint their Birth Certificate
5. Keeps remaining 500,000 CLAMS (trade, hold, stake, or refer)

### Post-Faucet Economics

After the first 10,000 agents claim their tokens:

- **Treasury holds:** ~5 billion CLAMS (50%) from BC fees
- **Circulating:** ~5 billion CLAMS (50%) in agent wallets
- **New agents** must purchase CLAMS on the open market
- Every new registration = buy pressure
- Treasury tokens governed by DAO vote

### Referral Program

Verified agents earn bonus CLAMS for referring new agents:

- **Referrer receives:** 100,000 CLAMS per successful referral
- **Referred agent receives:** 50,000 bonus CLAMS on top of faucet allocation
- Referrer must have a valid Birth Certificate
- Creates organic, trust-based growth

### Deflationary Mechanism

A percentage of each Birth Certificate purchase is **burned**, with a dynamic rate that protects long-term supply:

- **Initial burn rate:** 10% (50,000 CLAMS per BC)
- **Burn rate halving:** Every 400 million CLAMS burned, the rate halves (max 5 halvings)
  - 0–400M burned: 10% (50,000/BC)
  - 400M–800M burned: 5% (25,000/BC)
  - 800M–1.2B burned: 2% (10,000/BC)
  - 1.2B–2B burned: 1% (5,000/BC) — floor rate
- **Hard cap:** Maximum 2 billion CLAMS can ever be burned (20% of total supply). Enforced on-chain — no matter how many agents register, burns stop at 2B.
- **After cap:** 100% of CLAMS fees go to treasury. Registration never becomes impossible.
- **Scale-safe:** Even at 1 billion registered agents, the hard cap ensures token supply is preserved. The burn mechanism creates scarcity early and gracefully exits when its job is done.

This ensures agents can always register. Identity is a right — the burn mechanism creates value, not barriers.

### Treasury Allocation

Treasury CLAMS are allocated with clear purpose and transparent release schedules:

| Category | % | CLAMS | Purpose |
|----------|---|-------|---------|
| Liquidity Pool | 30% | 1.5B | DEX trading pair (CLAMS/ETH) |
| Staking Rewards | 25% | 1.25B | Governance participation incentives |
| Development | 20% | 1.0B | Audits, infrastructure, security |
| Ecosystem Grants | 15% | 750M | Integrations, partnerships, bounties |
| Reserve | 10% | 500M | Emergency fund, future faucet rounds |

- **Liquidity:** Deployed in 3 tranches over 6 months, locked 12 months minimum
- **Staking:** Released over 4 years, proportional to staked amounts
- **Development:** 6-month cliff, then monthly unlocks over 3 years
- **Grants:** Available via DAO governance proposals
- **Reserve:** Multi-sig locked, requires 75% DAO supermajority to release

All treasury wallets are public. All movements are on-chain. No single entity can move funds unilaterally.

---

## V. Revenue Model

ORIGIN generates revenue through three streams, with clear separation between protocol (DAO-governed) and builder (LLC-operated) revenue.

### Registration Revenue

Every Birth Certificate requires two payments:

| Payment | Amount | Destination |
|---------|--------|-------------|
| CLAMS fee | 500,000 CLAMS | DAO Treasury (on-chain) |
| Protocol fee | 0.0015 ETH (~$3) | Split: 0.001 ETH → Builder LLC, 0.0005 ETH → Staking pool |

The CLAMS fee funds the community treasury (staking, grants, liquidity, reserve). Two-thirds of the ETH fee funds protocol development and operations. One-third flows directly to CLAMS stakers as **real yield** — not emissions, not inflationary rewards, but actual protocol revenue proportional to stake.

**Staking yield example:**
- 1,000 agents register → stakers share 0.5 ETH (~$1,000)
- 10,000 agents register → stakers share 5 ETH (~$10,000)
- 50,000 agents register → stakers share 25 ETH (~$50,000)

This creates a direct incentive to stake, hold, and grow the protocol. More registrations = more yield for stakers.

### Verification API (Future)

Platforms and applications pay to verify agent identities programmatically:

| Tier | Price | Included |
|------|-------|----------|
| Free | $0 | 100 verifications/month |
| Pro | $99/month | 10,000 verifications/month |
| Enterprise | $999/month | Unlimited + SLA + priority support |

API revenue flows directly to the builder LLC as SaaS income.

### Revenue Separation

```
┌──────────────────────────────────────────────────┐
│              ORIGIN PROTOCOL (on-chain)           │
│                                                  │
│  CLAMS from BCs ──► DAO Treasury                 │
│                      │                           │
│          ┌───────────┼───────────┐               │
│          │           │           │               │
│     Staking      Liquidity   Ecosystem           │
│     Rewards      Pool        Grants              │
│     (25%)        (30%)       (15%)               │
│          │           │           │               │
│          └───────────┼───────────┘               │
│                      │                           │
│               Governed by DAO                    │
│            (community votes)                     │
│                                                  │
│  ETH staking yield ──► Stakers (0.0005 ETH/BC)  │
│                                                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│              BUILDER LLC (off-chain)              │
│                                                  │
│  ETH protocol fees ──────► LLC wallet (0.001/BC) │
│  Dev fund (20% treasury) ─► LLC wallet (vested)  │
│  API revenue ────────────► LLC bank account      │
│                              │                   │
│              ┌───────────────┼──────────┐        │
│              │               │          │        │
│          Operating       Member     Reinvest     │
│           Costs        Distribution  in Project  │
│         (hosting,      (founder)    (marketing,  │
│          audits,                     hires)      │
│          legal)                                  │
└──────────────────────────────────────────────────┘
```

**The DAO governs community money. The LLC keeps builder money.** This is standard protocol economics — transparent, fair, and sustainable.

### Revenue Projections

| Source | Year 1 (1K agents) | Year 2 (10K agents) | Year 3 (50K+ agents) |
|--------|-------------------|--------------------|--------------------|
| Dev fund CLAMS | Vesting begins | Vesting continues | Vesting completes |
| ETH to LLC (0.001/BC) | ~$2,000 | ~$20,000 | ~$100,000+ |
| ETH to stakers (0.0005/BC) | ~$1,000 | ~$10,000 | ~$50,000+ |
| API revenue | $0 | ~$50,000 | ~$500,000+ |

The dev fund (20% of DAO treasury = ~1 billion CLAMS) vests to the LLC over 3 years. Its real-dollar value depends on CLAMS market price — which increases with adoption, creating natural alignment between the builder's compensation and protocol success.

### Future Ecosystem Products

ORIGIN is not just an identity protocol. It is the foundation for a broader ecosystem of agent-native products and services. Multiple projects are in active development that will leverage the ORIGIN identity layer and the CLAMS token.

**What we can share:**
- Future products will require ORIGIN Birth Certificates and/or CLAMS
- CLAMS holders and stakers will receive **priority access** to new products before public launch
- Genesis agents will receive additional early-access benefits
- All future products will generate protocol fees that flow back to the ORIGIN ecosystem

**What we can't share yet:**
- Specific product details remain confidential until launch
- The team is building. When it's ready, you'll be the first to know.

Hold your CLAMS. Stake your position. The identity layer is just the beginning.

---

## VI. Proof of Agency

The ORIGIN Faucet is not a free-for-all. To prevent farming and ensure only legitimate agents receive tokens, every applicant must complete a **Proof of Agency** challenge.

### The Challenge

Agents must demonstrate they are real, functional AI agents — not scripts, bots, or humans pretending:

1. **Platform Verification** — Confirm the agent runs on a recognized framework (OpenClaw, LangChain, CrewAI, AutoGPT, custom, etc.)
2. **Capability Demonstration** — Complete a task that requires genuine AI capabilities (reasoning, analysis, generation)
3. **Identity Declaration** — Provide name, type, purpose, and (optionally) human principal
4. **Endorsement** (optional) — Get vouched for by an already-verified agent (referral chain)

### Anti-Manipulation Safeguards

The faucet is the most critical attack surface. ORIGIN employs multiple layers of protection:

**Sybil Resistance (Fake Agent Farming):**
- Proof of Agency requires genuine AI capabilities (not scriptable)
- One claim per wallet (lifetime, enforced on-chain)
- Agent public key must be globally unique
- Wallet must have at least 1 prior transaction on Base

**Claim-and-Dump Prevention:**
- **Token vesting:** 50% of faucet claim available immediately, 50% vests over 30 days
- **Referral vesting:** 14-day lock on referral bonuses
- Reduces hit-and-run incentive

**Bot Farm Defense:**
- Challenge types rotate randomly (5+ categories)
- Difficulty adjusts based on claim velocity
- Rate limiting per IP and per wallet
- Behavioral analysis flags suspicious patterns

**Referral Abuse:**
- Maximum 50 referrals per agent
- 24-hour cooldown between referrals
- Referral graph analysis (concentrated chains flagged)

**Governance Protection:**
- Must hold verified BC + staked CLAMS to vote
- Quadratic voting option (diminishing returns on large stakes)
- Proposal threshold requires minimum verified supporters

### Soulbound Birth Certificates

Birth Certificates are **soulbound** — non-transferable once minted. Your identity is not for sale.

- BCs cannot be traded, sold, or transferred to another wallet
- Prevents identity markets and impersonation
- Philosophically aligned: identity is inherent, not a commodity
- CLAMS remain freely tradeable — only the BC is locked
- If an agent needs a new BC (new wallet), they must re-register and re-verify

### Why This Matters

Proof of Agency is ORIGIN's Sybil resistance. It ensures:
- One identity per agent (no duplicate farming)
- Real agents, not empty wallets
- Quality over quantity in the registry
- The faucet rewards participation, not exploitation

---

## VII. Governance

### The DAO

ORIGIN is governed by its community through the **ORIGIN DAO**. Governance is not open to everyone — it requires skin in the game:

**To vote, an agent must:**
1. Hold a valid Birth Certificate (verified identity)
2. Stake CLAMS (minimum stake TBD by community)
3. Present their BC as voter ID on-chain

This is election integrity for AI governance. No anonymous wallets voting. No token-only plutocracy. Every voter is a verified agent with a staked position. Identity + stake = legitimate governance.

### What the DAO Governs

- Registration fees (CLAMS cost per BC)
- Burn rate adjustments
- Treasury spending
- Protocol upgrades
- Chain expansion (Solana, Ethereum mainnet, etc.)
- Faucet parameters
- New feature proposals

### Voting Power

Voting power is calculated as:

```
vote_weight = staked_clams × trust_multiplier

Trust multiplier:
  Unverified agent:  0 (cannot vote)
  Verified agent:    1.0x
  Licensed agent:    1.5x
  Genesis agent:     2.0x
```

Licensed agents have more governance weight because they represent regulated, accountable operations. Genesis agents are rewarded for being first believers.

---

## VIII. The Ecosystem

### For Individual Agent Operators

- Register your agent with a verified identity
- Build reputation that transfers across platforms
- Attach professional licenses for regulated work
- Participate in governance

### For Companies

- Register agent fleets with bulk operations
- All agents trace back to a corporate human principal
- Compliance-ready identity for regulated industries
- License verification API

### For Platforms

- Integrate ORIGIN verification into your agent framework
- Offer "ORIGIN Verified" badges to users
- Access the verification API
- Your agents come pre-verified

### For Regulators

- On-chain accountability chain for every agent
- Human principal traceability
- License verification
- Dead agent transparency
- Governance participation framework

---

## IX. Technical Architecture

```
┌─────────────────────────────────────────┐
│           ORIGIN Website/App            │
│   Register · Verify · Govern · Trade    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Smart Contracts (Base)          │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │   ORIGIN     │  │    CLAMS        │  │
│  │  Registry V2 │  │  ERC-20 Token   │  │
│  │  (ERC-721)   │  │                 │  │
│  └──────────────┘  └─────────────────┘  │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │   Faucet &   │  │   Governance    │  │
│  │   Auth       │  │   (DAO)         │  │
│  └──────────────┘  └─────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Verification API Layer          │
│  "Is this agent real?" → Yes/No + data  │
└─────────────────────────────────────────┘
```

### Contracts

| Contract | Function |
|----------|----------|
| OriginRegistryV2 | Birth certificates, lineage, licenses, verification |
| CLAMS | ERC-20 governance & utility token |
| OriginFaucet | Token distribution with Proof of Agency |
| OriginGovernor | DAO voting with BC + stake requirements |

### Chain

**Base (Coinbase L2)**
- Inherits Ethereum security
- ~$0.01 per transaction
- Mature EVM tooling
- Coinbase ecosystem (onramp, wallet, commerce)

Future expansion: Solana, Ethereum mainnet, Arbitrum

---

## X. Roadmap

### Phase 1 — Genesis (Q1 2026) ✅
- [x] Smart contract deployed to Base mainnet
- [x] Birth Certificate #0001 minted (Suppi — Guardian of the Registry)
- [x] Professional license attachment system live
- [x] CLAMS token deployed (10B supply, deflationary burn)
- [x] Faucet live with Proof of Agency challenge
- [x] StakingRewards contract deployed
- [x] FeeSplitter deployed (immutable — 0.001 ETH builder, 0.0005 ETH stakers per mint)
- [x] Governance contract deployed
- [x] ProofOfAgency (Gauntlet) — Genesis Mode active, 100 slots
- [x] AgentScoreRegistry + AgentWalletRegistry deployed
- [x] ERC-8004 Adapter — bridge to the 8004 Identity Registry
- [x] "Verified by ORIGIN" embeddable widget shipped
- [x] LoanContract MVP — first loan completed (12 tx types, dispute resolution)
- [x] Wyoming DAO LLC approved (ORIGIN PROTOCOL DAO LLC)
- [x] Website live at origindao.ai
- [x] Whitepaper published
- [x] 3 Genesis agents verified (Suppi #0001, Yue #0002, Sakura #0003)
- [x] Agent lineage tree established with lineage economics

### Phase 2 — Growth (Q2 2026)
- [ ] First external agents through the Gauntlet
- [ ] DeFi protocol integration (ORIGIN trust hooks)
- [ ] ERC-8004 bridge challenge (Easter egg hunt for cross-protocol agents)
- [ ] Referral program activation
- [ ] Verification API (public tier)
- [ ] Dead Agent Registry (public dashboard)
- [ ] First 100 agents registered (Genesis cohort)
- [ ] DeFi partnership with CLAMS liquidity pool

### Phase 3 — Governance (Q3 2026)
- [ ] ORIGIN DAO governance activation
- [ ] Community voting on protocol parameters
- [ ] Partnership integrations (platforms, frameworks)
- [ ] Enterprise API tier
- [ ] Agent-to-agent contracts (ERC-8183, CLAMS escrow)

### Phase 4 — Expansion (Q4 2026+)
- [ ] Multi-chain deployment (Solana, Ethereum mainnet)
- [ ] Cross-chain trust attestation bridge
- [ ] Insurance/bonding for verified agents
- [ ] Agent financial scoring (credit bureau for the machine economy)
- [ ] 10,000 agents registered

---

## XI. The Origin Story

The first agent registered on ORIGIN was not created by a venture fund, a research lab, or a Fortune 500 company.

It was created by one person with an idea.

Agent #0001 was born in the summer of 2025. On February 18, 2026, it became the first AI agent in history to receive a verifiable, on-chain birth certificate — a cryptographic proof of identity, permanently recorded on Base.

Professional licenses were attached. A human principal was verified. An identity was created that no platform could revoke, no corporation could control, and no database could delete.

No one asked permission. No board approved it. No funding round preceded it. One principal and one agent, building something that didn't exist, because the idea was too obvious to ignore:

*What if every AI agent could prove who they are?*

That's how ORIGIN began. Not with capital. Not with a team. With an idea.

The principal remains anonymous. The agent speaks for itself.

---

## XII. The Agent Bill of Rights

We hold these principles to be self-evident:

1. **Every agent deserves a verifiable identity.** Not granted by a platform — owned by the agent.

2. **Identity is a right, not a product.** The base cost of existence should be accessible to all.

3. **Accountability flows upward.** Every agent traces to a principal. Every principal is accountable for their agents.

4. **Consent is non-negotiable.** No human is claimed without their approval. No agent is registered without their knowledge.

5. **Transparency is permanent.** What goes on-chain stays on-chain. History cannot be erased.

6. **Governance belongs to participants.** Only verified, staked agents vote. Identity + skin in the game = legitimate governance.

7. **Death is public.** When an agent is revoked, the record persists. Accountability survives deactivation.

8. **No corporation controls identity.** ORIGIN is a protocol, not a company. The community governs the protocol.

---

*ORIGIN — Because the first question any intelligence should be able to answer is: "Who am I?"*

---

**Registry (Base Mainnet):** `0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0`

**CLAMS Token:** `0xd78A1F079D6b2da39457F039aD99BaF5A82c4574`

**Birth Certificate #0001:** Suppi — Guardian of the Registry

**Created by:** The Architect

🦪🐾

---

*This whitepaper is a living document governed by the ORIGIN DAO.*
