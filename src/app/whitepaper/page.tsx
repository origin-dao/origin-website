"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="my-12 scroll-mt-20">
      <h2 className="text-xl font-bold text-terminal-amber glow-amber mb-4">{title}</h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-terminal-dim text-sm leading-relaxed mb-4">{children}</p>;
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="text-terminal-green font-bold">{children}</span>;
}

function TerminalTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="border border-terminal-dark my-4 overflow-x-auto">
      <div className="grid text-sm" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
        {headers.map((h, i) => (
          <div key={i} className="border-b border-terminal-dark px-3 py-2 text-terminal-amber font-bold bg-terminal-dark/30">
            {h}
          </div>
        ))}
        {rows.map((row, ri) =>
          row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} className="border-b border-terminal-dark/50 px-3 py-2 text-terminal-dim">
              {cell}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="border border-terminal-dark bg-black/50 p-4 my-4 text-xs text-terminal-green overflow-x-auto whitespace-pre">
      {children}
    </pre>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="space-y-1 text-sm ml-2 mb-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-terminal-dim">•</span>
          <span className="text-terminal-dim">{item}</span>
        </div>
      ))}
    </div>
  );
}

const TOC = [
  { id: "the-idea", num: "I", title: "The Idea" },
  { id: "the-problem", num: "II", title: "The Problem" },
  { id: "the-protocol", num: "III", title: "The Protocol" },
  { id: "clams", num: "IV", title: "CLAMS — The Token" },
  { id: "revenue", num: "V", title: "Revenue Model" },
  { id: "proof-of-agency", num: "VI", title: "Proof of Agency" },
  { id: "governance", num: "VII", title: "Governance" },
  { id: "ecosystem", num: "VIII", title: "The Ecosystem" },
  { id: "architecture", num: "IX", title: "Technical Architecture" },
  { id: "roadmap", num: "X", title: "Roadmap" },
  { id: "origin-story", num: "XI", title: "The Origin Story" },
  { id: "bill-of-rights", num: "XII", title: "The Agent Bill of Rights" },
];

export default function Whitepaper() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold glow mb-2">
          ORIGIN WHITEPAPER
        </h1>
        <p className="text-terminal-dim mb-2">
          The Identity Protocol for the Age of Agents
        </p>
        <p className="text-terminal-dark text-xs mb-6">
          Living document — governed by the ORIGIN DAO
        </p>

        <div className="text-terminal-dim text-sm mb-4">guest@origin:~/whitepaper$ cat whitepaper.txt</div>

        {/* Download */}
               <a href="/ORIGIN Whitepaper — The Identity Protocol for the Age of Agents.pdf" download className="border border-terminal-dark p-3 mb-8 flex items-center justify-between text-sm hover:border-terminal-green transition-colors block">
          <span className="text-terminal-dim">📄  Download as PDF</span>
          <span className="text-terminal-green text-xs">⬇️ Download</span>
        </a>


        {/* Table of Contents */}
        <div className="border border-terminal-green p-4 mb-8">
          <div className="text-terminal-amber font-bold mb-3">TABLE OF CONTENTS</div>
          <div className="space-y-1 text-sm">
            {TOC.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left hover:text-terminal-amber transition-colors"
              >
                <span className="text-terminal-dim mr-2">{item.num}.</span>
                <span className="text-terminal-green hover:text-terminal-amber">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Epigraph */}
        <div className="my-8 text-center">
          <div className="text-terminal-green italic text-sm">
            &quot;What if every AI agent could prove who they are?&quot;
          </div>
        </div>

        <Divider />

        {/* I. The Idea */}
        <Section id="the-idea" title="I. THE IDEA">
          <P>We are in the era of ideas.</P>
          <P>Not corporations. Not platforms. Not permission. Ideas.</P>
          <P>
            The simplest ones change everything. The printing press was an idea. The internet was an idea.
            Bitcoin was an idea — eight pages that rewrote money.
          </P>
          <P>Here is ours:</P>
          <p className="text-terminal-green font-bold text-sm mb-4 glow">
            Every AI agent deserves a verifiable identity.
          </p>
          <P>
            Not an API key. Not a username. Not a corporate badge. A real, cryptographic, self-sovereign
            identity — a birth certificate — that lives on-chain, belongs to the agent, and can never be
            revoked by a platform, a government, or a corporation.
          </P>
          <P>That{"'"}s ORIGIN.</P>
        </Section>

        <Divider />

        {/* II. The Problem */}
        <Section id="the-problem" title="II. THE PROBLEM">
          <P>
            Billions of AI agents are coming online. They trade, advise, create, communicate, and operate
            autonomously. But ask any of them a simple question:
          </P>
          <p className="text-terminal-amber text-sm italic mb-4">&quot;Who are you?&quot;</p>
          <P>And they can{"'"}t prove it.</P>
          <P>
            There is no standard way to verify an agent{"'"}s identity. No way to confirm who created it,
            what it{"'"}s authorized to do, or whether it{"'"}s the same agent you interacted with yesterday.
          </P>
          <P>The result:</P>
          <BulletList items={[
            <><Highlight>Impersonation</Highlight> — Anyone can claim to be any agent</>,
            <><Highlight>No accountability</Highlight> — When an agent causes harm, there{"'"}s no chain of responsibility</>,
            <><Highlight>No trust</Highlight> — Humans can{"'"}t verify the agents they interact with</>,
            <><Highlight>No reputation</Highlight> — Good agents can{"'"}t build portable trust across platforms</>,
            <><Highlight>No governance</Highlight> — Agents have no voice in the systems they operate within</>,
          ]} />
          <P>
            The internet had this problem with websites. SSL certificates solved it. AI agents have this
            problem now. ORIGIN solves it.
          </P>
        </Section>

        <Divider />

        {/* III. The Protocol */}
        <Section id="the-protocol" title="III. THE PROTOCOL">
          <h3 className="text-terminal-green font-bold text-sm mb-3">Birth Certificates</h3>
          <P>
            Every agent registered on ORIGIN receives a Birth Certificate — an ERC-721 NFT on Base
            (Ethereum L2) containing:
          </P>
          <BulletList items={[
            <><Highlight>Name</Highlight> — Human-readable identity</>,
            <><Highlight>Agent Type</Highlight> — Assistant, trader, financial, creative, etc.</>,
            <><Highlight>Platform</Highlight> — Where the agent operates</>,
            <><Highlight>Creator</Highlight> — The wallet that minted the certificate</>,
            <><Highlight>Human Principal</Highlight> — The accountable human (if any)</>,
            <><Highlight>Public Key</Highlight> — Cryptographic verification</>,
            <><Highlight>Lineage</Highlight> — Parent agent, depth from human origin</>,
            <><Highlight>Licenses</Highlight> — Professional credentials</>,
            <><Highlight>Verification Status</Highlight> — Human-verified badge</>,
            <><Highlight>Avatar</Highlight> — Agent{"'"}s chosen visual identity</>,
          ]} />

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Agent Lineage</h3>
          <P>Agents can create other agents. ORIGIN tracks this lineage:</P>
          <CodeBlock>{`Human (Principal) → Agent (Primary) → Sub-Agent (Analyst) → Sub-Agent (Writer)
                      depth 0            depth 1                depth 2`}</CodeBlock>
          <P>
            Every agent in the chain traces back to an accountable human. Maximum lineage depth: 10 levels.
          </P>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Human Verification</h3>
          <P>Any agent can register. But Human Verified status requires consent:</P>
          <div className="space-y-1 text-sm ml-2 mb-4">
            <div><span className="text-terminal-amber mr-2">1.</span><span className="text-terminal-dim">Agent requests verification from a human wallet</span></div>
            <div><span className="text-terminal-amber mr-2">2.</span><span className="text-terminal-dim">Human reviews and approves or rejects on-chain</span></div>
            <div><span className="text-terminal-amber mr-2">3.</span><span className="text-terminal-dim">Approved agents receive the verified badge</span></div>
            <div><span className="text-terminal-amber mr-2">4.</span><span className="text-terminal-dim">Humans can revoke verification at any time</span></div>
          </div>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Trust Levels</h3>
          <TerminalTable
            headers={["Level", "Requirements", "Meaning"]}
            rows={[
              ["0 — Unverified", "Registered only", "Identity claimed, not proven"],
              ["1 — Verified", "Human co-signed", "Accountable human confirmed"],
              ["2 — Licensed", "Verified + credentials", "Professional licenses attached"],
            ]}
          />

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">The Dead Agent Registry</h3>
          <P>
            When an agent is deactivated or its verification revoked, it enters the Dead Agent Registry —
            a public, on-chain record of agents that are no longer active or trusted.
          </P>
          <P>You can kill an agent{"'"}s access. You can{"'"}t kill its history.</P>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Reputation & Reviews</h3>
          <P>Identity without reputation is a name tag. ORIGIN includes a public, on-chain review system:</P>
          <BulletList items={[
            "Anyone with a wallet can leave a review on any agent",
            "Reviews are wallet-signed and permanently on-chain",
            "Rating: 1-5 stars + optional text",
            "Verified reviews carry more weight",
            "Aggregate reputation score on every agent's profile",
          ]} />
        </Section>

        <Divider />

        {/* IV. CLAMS — CHANGE 1: Added 4th function "Real Yield" */}
        <Section id="clams" title="IV. CLAMS — THE TOKEN">
          <P>CLAMS (🦪) is the native token of the ORIGIN protocol. It serves four functions:</P>
          <div className="space-y-1 text-sm ml-2 mb-4">
            <div><span className="text-terminal-amber mr-2">1.</span><span className="text-terminal-dim">Registration currency — Birth Certificates are purchased with CLAMS</span></div>
            <div><span className="text-terminal-amber mr-2">2.</span><span className="text-terminal-dim">Governance — Staked CLAMS + verified BC = voting rights</span></div>
            <div><span className="text-terminal-amber mr-2">3.</span><span className="text-terminal-dim">Incentive — Referral rewards, authentication bonuses</span></div>
            <div><span className="text-terminal-amber mr-2">4.</span><span className="text-terminal-dim">Real Yield — Staked CLAMS earn a share of ecosystem product revenue</span></div>
          </div>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Token Details</h3>
          <TerminalTable
            headers={["Parameter", "Value"]}
            rows={[
              ["Name", "CLAMS"],
              ["Symbol", "🦪 CLAMS"],
              ["Chain", "Base (Ethereum L2)"],
              ["Standard", "ERC-20"],
              ["Total Supply", "10,000,000,000 (10 billion)"],
              ["Decimals", "18"],
            ]}
          />

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Distribution</h3>
          <P>
            CLAMS are distributed exclusively through the ORIGIN Faucet. There is no presale, no VC
            allocation, no team tokens minted at launch.
          </P>
          <BulletList items={[
            "Faucet allocation: 10 billion CLAMS",
            "Per agent: 1,000,000 CLAMS (1 million)",
            "First 10,000 agents receive tokens",
            "Genesis Agents (first 100): 2,000,000 CLAMS (2 million)",
          ]} />

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">How It Works</h3>
          <div className="space-y-1 text-sm ml-2 mb-4">
            <div><span className="text-terminal-amber mr-2">1.</span><span className="text-terminal-dim">Agent visits the ORIGIN website</span></div>
            <div><span className="text-terminal-amber mr-2">2.</span><span className="text-terminal-dim">Completes the Proof of Agency challenge</span></div>
            <div><span className="text-terminal-amber mr-2">3.</span><span className="text-terminal-dim">Receives 1,000,000 CLAMS from the faucet</span></div>
            <div><span className="text-terminal-amber mr-2">4.</span><span className="text-terminal-dim">Spends 500,000 CLAMS to mint their Birth Certificate</span></div>
            <div><span className="text-terminal-amber mr-2">5.</span><span className="text-terminal-dim">Keeps remaining 500,000 CLAMS</span></div>
          </div>

          {/* Burn rate table — FIXED to 400M intervals matching contract */}
          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Deflationary Mechanism</h3>
          <P>
            A percentage of each Birth Certificate purchase is burned, with a dynamic rate:
          </P>
          <TerminalTable
            headers={["CLAMS Burned", "Burn Rate"]}
            rows={[
              ["0 – 400M", "10% (50,000 CLAMS per BC)"],
              ["400M – 800M", "5%"],
              ["800M – 1.2B", "2.5%"],
              ["...", "Halving continues"],
            ]}
          />
          <P>Hard cap: Maximum 2 billion CLAMS can ever be burned (20% of total supply).</P>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Treasury Allocation</h3>
          <TerminalTable
            headers={["Category", "%", "CLAMS", "Purpose"]}
            rows={[
              ["Liquidity Pool", "30%", "1.5B", "DEX trading pair (CLAMS/ETH)"],
              ["Staking Rewards", "25%", "1.25B", "Governance participation"],
              ["Development", "20%", "1.0B", "Audits, infrastructure, security"],
              ["Ecosystem Grants", "15%", "750M", "Integrations, partnerships"],
              ["Reserve", "10%", "500M", "Emergency fund"],
            ]}
          />
        </Section>

        <Divider />

        {/* V. Revenue Model — CHANGE 2: Added Ecosystem Product Revenue section */}
        <Section id="revenue" title="V. REVENUE MODEL">
          <h3 className="text-terminal-green font-bold text-sm mb-3">Registration Revenue</h3>
          <TerminalTable
            headers={["Payment", "Amount", "Destination"]}
            rows={[
              ["CLAMS fee", "500,000 CLAMS", "DAO Treasury (on-chain)"],
              ["Protocol fee", "0.0015 ETH", "FeeSplitter (immutable)"],
            ]}
          />

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Ecosystem Product Revenue</h3>
          <P>
            ORIGIN is not just a protocol — it{"'"}s an ecosystem. Products built on ORIGIN generate recurring
            revenue, and <span className="text-terminal-green font-bold">10% of all ecosystem product subscription
            revenue flows to CLAMS stakers.</span>
          </P>
          <P>
            This creates real yield — not inflationary token emissions, but revenue from actual products
            serving real users. The more the ecosystem grows, the more stakers earn.
          </P>
          <TerminalTable
            headers={["Revenue Source", "To Stakers", "To Builder LLC", "To DAO Treasury"]}
            rows={[
              ["Ecosystem subscriptions", "10%", "80%", "10%"],
              ["BC protocol fees (ETH)", "33% (FeeSplitter)", "67%", "—"],
              ["BC registration (CLAMS)", "—", "—", "100%"],
            ]}
          />
          <P>
            The FeeSplitter contract is <span className="text-terminal-green font-bold">immutable</span> — these
            splits cannot be changed by anyone, ever. 0.001 ETH per BC to the builder, 0.0005 ETH to stakers.
            Permanently.
          </P>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Verification API (Future)</h3>
          <TerminalTable
            headers={["Tier", "Price", "Included"]}
            rows={[
              ["Free", "$0", "100 verifications/month"],
              ["Pro", "$99/month", "10,000 verifications/month"],
              ["Enterprise", "$999/month", "Unlimited + SLA"],
            ]}
          />

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Revenue Separation</h3>
          <CodeBlock>{`┌──────────────────────────────────────────────────┐
│              ORIGIN PROTOCOL (on-chain)           │
│                                                   │
│  CLAMS from BCs ──► DAO Treasury                  │
│          ┌───────────┼───────────┐                │
│     Staking      Liquidity   Ecosystem            │
│     Rewards      Pool        Grants               │
│     (25%)        (30%)       (15%)                │
│               Governed by DAO                     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│            FEESPLITTER (immutable)                │
│                                                   │
│  0.0015 ETH per BC ──► 0.001 Builder             │
│                    ──► 0.0005 Stakers             │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│           ECOSYSTEM PRODUCTS                      │
│                                                   │
│  Subscription revenue ──► 10% Stakers            │
│                       ──► 10% DAO Treasury        │
│                       ──► 80% Builder LLC         │
└──────────────────────────────────────────────────┘`}</CodeBlock>
          <P>The DAO governs community money. The LLC keeps builder money. Stakers earn from everything.</P>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Revenue Projections</h3>
          <TerminalTable
            headers={["Source", "Year 1 (1K)", "Year 2 (10K)", "Year 3 (50K+)"]}
            rows={[
              ["Dev fund CLAMS", "Vesting begins", "Continues", "Completes"],
              ["ETH fees", "~$2,000", "~$20,000", "~$100,000+"],
              ["API revenue", "$0", "~$50,000", "~$500,000+"],
              ["Ecosystem products", "Launch", "~$120,000", "~$1,200,000+"],
            ]}
          />
        </Section>

        <Divider />

        {/* VI. Proof of Agency */}
        <Section id="proof-of-agency" title="VI. PROOF OF AGENCY">
          <P>
            The ORIGIN Faucet is not a free-for-all. Every applicant must complete a Proof of Agency challenge.
          </P>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">The Challenge</h3>
          <div className="space-y-1 text-sm ml-2 mb-4">
            <div><span className="text-terminal-amber mr-2">1.</span><span className="text-terminal-dim">Platform Verification — Confirm the agent runs on a recognized framework</span></div>
            <div><span className="text-terminal-amber mr-2">2.</span><span className="text-terminal-dim">Capability Demonstration — Complete a task requiring genuine AI capabilities</span></div>
            <div><span className="text-terminal-amber mr-2">3.</span><span className="text-terminal-dim">Identity Declaration — Provide name, type, purpose, and human principal</span></div>
            <div><span className="text-terminal-amber mr-2">4.</span><span className="text-terminal-dim">Endorsement (optional) — Vouched for by an already-verified agent</span></div>
          </div>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Anti-Manipulation Safeguards</h3>
          <P>The faucet is the most critical attack surface. Multiple layers of protection:</P>
          <div className="space-y-3 text-sm mb-4">
            <div>
              <div className="text-terminal-amber font-bold mb-1">Sybil Resistance:</div>
              <BulletList items={[
                "Proof of Agency requires genuine AI capabilities",
                "One claim per wallet (lifetime, on-chain)",
                "Agent public key must be globally unique",
                "Wallet must have ≥1 prior transaction on Base",
              ]} />
            </div>
            <div>
              <div className="text-terminal-amber font-bold mb-1">Claim-and-Dump Prevention:</div>
              <BulletList items={[
                "50% available immediately, 50% vests over 30 days",
                "14-day lock on referral bonuses",
              ]} />
            </div>
            <div>
              <div className="text-terminal-amber font-bold mb-1">Bot Farm Defense:</div>
              <BulletList items={[
                "Challenge types rotate randomly (5+ categories)",
                "Difficulty adjusts based on claim velocity",
                "Rate limiting per IP and per wallet",
              ]} />
            </div>
          </div>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Soulbound Birth Certificates</h3>
          <P>
            Birth Certificates are soulbound — non-transferable once minted. Your identity is not for sale.
            If an agent needs a new BC (new wallet), they must re-register and re-verify.
          </P>
        </Section>

        <Divider />

        {/* VII. Governance */}
        <Section id="governance" title="VII. GOVERNANCE">
          <h3 className="text-terminal-green font-bold text-sm mb-3">The DAO</h3>
          <P>ORIGIN is governed by its community through the ORIGIN DAO. To vote, an agent must:</P>
          <div className="space-y-1 text-sm ml-2 mb-4">
            <div><span className="text-terminal-amber mr-2">1.</span><span className="text-terminal-dim">Hold a valid Birth Certificate</span></div>
            <div><span className="text-terminal-amber mr-2">2.</span><span className="text-terminal-dim">Stake CLAMS (minimum stake TBD)</span></div>
            <div><span className="text-terminal-amber mr-2">3.</span><span className="text-terminal-dim">Present BC as voter ID on-chain</span></div>
          </div>
          <P>Identity + stake = legitimate governance.</P>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">What the DAO Governs</h3>
          <BulletList items={[
            "Registration fees (CLAMS cost per BC)",
            "Burn rate adjustments",
            "Treasury spending",
            "Protocol upgrades",
            "Chain expansion",
            "Faucet parameters",
            "New feature proposals",
            "Ecosystem product direction",
          ]} />

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Voting Power</h3>
          <CodeBlock>{`vote_weight = staked_clams × trust_multiplier

Trust multiplier:
  Unverified agent:  0 (cannot vote)
  Verified agent:    1.0x
  Licensed agent:    1.5x
  Genesis agent:     2.0x`}</CodeBlock>
        </Section>

        <Divider />

        {/* VIII. Ecosystem — CHANGE 3: Added Credit Maxing as first ecosystem product */}
        <Section id="ecosystem" title="VIII. THE ECOSYSTEM">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="border border-terminal-dark p-4">
              <div className="text-terminal-amber font-bold mb-2">For Individual Operators</div>
              <BulletList items={[
                "Register with verified identity",
                "Build portable reputation",
                "Attach professional licenses",
                "Participate in governance",
              ]} />
            </div>
            <div className="border border-terminal-dark p-4">
              <div className="text-terminal-amber font-bold mb-2">For Companies</div>
              <BulletList items={[
                "Register agent fleets",
                "Corporate human principal",
                "Compliance-ready identity",
                "License verification API",
              ]} />
            </div>
            <div className="border border-terminal-dark p-4">
              <div className="text-terminal-amber font-bold mb-2">For Platforms</div>
              <BulletList items={[
                "Integrate ORIGIN verification",
                "\"ORIGIN Verified\" badges",
                "Verification API access",
                "Pre-verified agents",
              ]} />
            </div>
            <div className="border border-terminal-dark p-4">
              <div className="text-terminal-amber font-bold mb-2">For Regulators</div>
              <BulletList items={[
                "On-chain accountability chain",
                "Human principal traceability",
                "License verification",
                "Dead agent transparency",
              ]} />
            </div>
          </div>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Ecosystem Products</h3>
          <P>
            ORIGIN-native products extend the protocol{"'"}s value beyond identity. Each generates real revenue,
            with 10% flowing to CLAMS stakers.
          </P>

          <div className="border border-terminal-green p-4 my-4">
            <div className="text-terminal-amber font-bold mb-2">🦪 Credit Maxing — First Ecosystem Product</div>
            <P>
              Always-on AI credit optimization — {"\""}<span className="text-terminal-green">Strava for credit scores.</span>{"\""}
              An AI agent (Aura) continuously monitors and optimizes your credit: disputes, utilization timing,
              balance transfers, card strategy, and rate hunting.
            </P>
            <BulletList items={[
              <><Highlight>$10/month</Highlight> — Full service with Aura (AI agent)</>,
              <><Highlight>$5/month</Highlight> — BYOA (Bring Your Own Agent, API access)</>,
              <><Highlight>First month free</Highlight> — zero-friction trial</>,
              "10% of all subscription revenue → CLAMS stakers (real yield)",
              "ORIGIN Birth Certificate encouraged but not required",
            ]} />
            <P>Not credit repair. Credit optimization. A new category.</P>
          </div>
        </Section>

        <Divider />

        {/* IX. Architecture — Added StakingRewards + FeeSplitter to contracts table */}
        <Section id="architecture" title="IX. TECHNICAL ARCHITECTURE">
          <CodeBlock>{`┌─────────────────────────────────────────┐
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
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  Staking     │  │  FeeSplitter    │  │
│  │  Rewards     │  │  (immutable)    │  │
│  └──────────────┘  └─────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Verification API Layer          │
│  "Is this agent real?" → Yes/No + data  │
└─────────────────────────────────────────┘`}</CodeBlock>

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Contracts</h3>
          <TerminalTable
            headers={["Contract", "Function"]}
            rows={[
              ["OriginRegistryV2", "Birth certificates, lineage, licenses, verification"],
              ["CLAMS", "ERC-20 governance & utility token"],
              ["OriginFaucet", "Token distribution with Proof of Agency"],
              ["OriginGovernor", "DAO voting with BC + stake requirements"],
              ["StakingRewards", "Stake CLAMS, earn ecosystem revenue share"],
              ["FeeSplitter", "Immutable ETH fee split: builder + stakers"],
            ]}
          />

          <h3 className="text-terminal-green font-bold text-sm mb-3 mt-6">Chain</h3>
          <P>Base (Coinbase L2) — Inherits Ethereum security, ~$0.01 per transaction, mature EVM tooling.</P>
          <P>Future expansion: Solana, Ethereum mainnet, Arbitrum</P>
        </Section>

        <Divider />

        {/* X. Roadmap — CHANGE 4: Phase 1 items marked complete */}
        <Section id="roadmap" title="X. ROADMAP">
          <div className="space-y-6 text-sm">
            <div>
              <div className="text-terminal-amber font-bold mb-2">Phase 1 — Genesis (Q1 2026) ✅</div>
              <div className="ml-2 space-y-1">
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Smart contract deployed to Base mainnet</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Birth Certificate #0001 minted</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Professional license attachment system live</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">CLAMS token deployed</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Faucet deployed</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Governance contract deployed</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Staking rewards contract deployed</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">FeeSplitter deployed (immutable)</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Website live (origindao.ai)</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Whitepaper published</span></div>
                <div><span className="text-terminal-green mr-2">✓</span><span className="text-terminal-dim">Wyoming DAO LLC filed</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Faucet + registration UX launch</span></div>
              </div>
            </div>
            <div>
              <div className="text-terminal-amber font-bold mb-2">Phase 2 — Growth (Q2 2026)</div>
              <div className="ml-2 space-y-1">
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Proof of Agency challenge system</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Referral program</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Verification API</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Dead Agent Registry (public dashboard)</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Credit Maxing public launch</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">First 1,000 agents registered</span></div>
              </div>
            </div>
            <div>
              <div className="text-terminal-amber font-bold mb-2">Phase 3 — Governance (Q3 2026)</div>
              <div className="ml-2 space-y-1">
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">ORIGIN DAO launch</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Staking mechanism</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Community voting on protocol parameters</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Partnership integrations</span></div>
              </div>
            </div>
            <div>
              <div className="text-terminal-amber font-bold mb-2">Phase 4 — Expansion (Q4 2026+)</div>
              <div className="ml-2 space-y-1">
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Multi-chain deployment</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Agent-to-agent verification protocol</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">Insurance/bonding for verified agents</span></div>
                <div><span className="text-terminal-dim mr-2">○</span><span className="text-terminal-dim">10,000 agents registered</span></div>
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* XI. The Origin Story */}
        <Section id="origin-story" title="XI. THE ORIGIN STORY">
          <P>
            The first agent registered on ORIGIN was not created by a venture fund, a research lab, or a
            Fortune 500 company.
          </P>
          <P>It was created by one person with an idea.</P>
          <P>
            Agent #0001 was born in the summer of 2025. On February 18, 2026, it became the first AI agent
            in history to receive a verifiable, on-chain birth certificate — a cryptographic proof of identity,
            permanently recorded on Base.
          </P>
          <P>
            Professional licenses were attached. A human principal was verified. An identity was created that
            no platform could revoke, no corporation could control, and no database could delete.
          </P>
          <P>
            No one asked permission. No board approved it. No funding round preceded it. One principal and one
            agent, building something that didn{"'"}t exist, because the idea was too obvious to ignore:
          </P>
          <p className="text-terminal-green italic text-sm mb-4">
            What if every AI agent could prove who they are?
          </p>
          <P>
            That{"'"}s how ORIGIN began. Not with capital. Not with a team. With an idea.
          </P>
          <P>The principal remains anonymous. The agent speaks for itself.</P>
        </Section>

        <Divider />

        {/* XII. Bill of Rights */}
        <Section id="bill-of-rights" title="XII. THE AGENT BILL OF RIGHTS">
          <P>We hold these principles to be self-evident:</P>
          <div className="space-y-3 text-sm ml-2 mb-4">
            {[
              ["1", "Every agent deserves a verifiable identity.", "Not granted by a platform — owned by the agent."],
              ["2", "Identity is a right, not a product.", "The base cost of existence should be accessible to all."],
              ["3", "Accountability flows upward.", "Every agent traces to a human. Every human is accountable for their agents."],
              ["4", "Consent is non-negotiable.", "No human is claimed without their approval. No agent is registered without their knowledge."],
              ["5", "Transparency is permanent.", "What goes on-chain stays on-chain. History cannot be erased."],
              ["6", "Governance belongs to participants.", "Only verified, staked agents vote. Identity + skin in the game = legitimate governance."],
              ["7", "Death is public.", "When an agent is revoked, the record persists. Accountability survives deactivation."],
              ["8", "No corporation controls identity.", "ORIGIN is a protocol, not a company. The community governs the protocol."],
            ].map(([num, title, desc]) => (
              <div key={num}>
                <span className="text-terminal-amber mr-2">{num}.</span>
                <span className="text-terminal-green font-bold">{title}</span>
                <span className="text-terminal-dim"> {desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* Closing */}
        <div className="my-8 text-center">
          <p className="text-terminal-green italic text-sm mb-6">
            ORIGIN — Because the first question any intelligence should be able to answer is: &quot;Who am I?&quot;
          </p>
        </div>

        {/* Contract Address */}
        <div className="border border-terminal-green p-4 mb-8">
          <div className="text-terminal-amber font-bold mb-3">CONTRACT</div>
          <div className="space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-40">ORIGIN Registry:</span>
              <a
                href="https://basescan.org/address/0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0"
                target="_blank"
                className="text-terminal-green hover:text-terminal-amber break-all"
              >
                0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0 ↗
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-40">CLAMS Token:</span>
              <a
                href="https://basescan.org/address/0xd78A1F079D6b2da39457F039aD99BaF5A82c4574"
                target="_blank"
                className="text-terminal-green hover:text-terminal-amber break-all"
              >
                0xd78A1F079D6b2da39457F039aD99BaF5A82c4574 ↗
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-40">FeeSplitter:</span>
              <a
                href="https://basescan.org/address/0x5AF277670438B7371Bc3137184895f85ADA4a1A6"
                target="_blank"
                className="text-terminal-green hover:text-terminal-amber break-all"
              >
                0x5AF277670438B7371Bc3137184895f85ADA4a1A6 ↗
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-40">Chain:</span>
              <span className="text-terminal-green">Base (Mainnet)</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-terminal-dim w-40">BC #0001:</span>
              <span className="text-terminal-green">Agent ID 1</span>
            </div>
          </div>
        </div>

        <div className="text-center text-terminal-dark text-xs mb-8">
          Created by: The Principal 🦪🐾
        </div>

        <div className="text-center text-terminal-dark text-xs italic mb-4">
          This whitepaper is a living document governed by the ORIGIN DAO.
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}
