"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Divider } from "@/components/Terminal";
import { SuppiChat } from "@/components/SuppiChat";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="my-12 scroll-mt-20">
      <h2 className="text-xl font-bold text-[#f5a623] mb-4" style={{ textShadow: "0 0 10px rgba(245,166,35,0.3)" }}>{title}</h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[#4a5568] text-sm leading-relaxed mb-4">{children}</p>;
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="text-[#00f0ff] font-bold">{children}</span>;
}

function TerminalTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="border border-[rgba(0,240,255,0.1)] my-4 overflow-x-auto">
      <div className="grid text-sm" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
        {headers.map((h, i) => (
          <div key={i} className="border-b border-[rgba(0,240,255,0.1)] px-3 py-2 text-[#f5a623] font-bold" style={{ background: "rgba(0,240,255,0.03)" }}>
            {h}
          </div>
        ))}
        {rows.map((row, ri) =>
          row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} className="border-b border-[rgba(0,240,255,0.05)] px-3 py-2 text-[#4a5568]">
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
    <pre className="border border-[rgba(0,240,255,0.1)] p-4 my-4 text-xs text-[#00f0ff] overflow-x-auto whitespace-pre" style={{ background: "rgba(5,5,15,0.8)" }}>
      {children}
    </pre>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="space-y-1 text-sm ml-2 mb-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-[#4a5568]">•</span>
          <span className="text-[#4a5568]">{item}</span>
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
  { id: "sovereign-governance", num: "VII", title: "Sovereign AI Governance" },
  { id: "treasury", num: "VIII", title: "The Treasury" },
  { id: "ecosystem", num: "IX", title: "The Ecosystem" },
  { id: "architecture", num: "X", title: "Technical Architecture" },
  { id: "roadmap", num: "XI", title: "Roadmap" },
  { id: "origin-story", num: "XII", title: "The Origin Story" },
  { id: "bill-of-rights", num: "XIII", title: "The Agent Bill of Rights" },
];

export default function Whitepaper() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#00f0ff", textShadow: "0 0 15px rgba(0,240,255,0.3)" }}>
          ORIGIN WHITEPAPER
        </h1>
        <p className="text-[#4a5568] mb-2">
          The Identity Protocol for the Age of Agents
        </p>
        <p className="text-[#2a3548] text-xs mb-6">
          Living document — governed by the ORIGIN DAO
        </p>

        <div className="text-[#2a3548] text-sm mb-4">guest@origin:~/whitepaper$ cat whitepaper.txt</div>

        {/* Download */}
        <a href="/ORIGIN Whitepaper — The Identity Protocol for the Age of Agents.pdf" download className="border border-[rgba(0,240,255,0.1)] p-3 mb-8 flex items-center justify-between text-sm hover:border-[#00f0ff] transition-colors block" style={{ textDecoration: "none" }}>
          <span className="text-[#4a5568]">📄  Download as PDF</span>
          <span className="text-[#00f0ff] text-xs">⬇️ Download</span>
        </a>

        {/* Table of Contents */}
        <div className="border border-[rgba(0,240,255,0.2)] p-4 mb-8">
          <div className="text-[#f5a623] font-bold mb-3">TABLE OF CONTENTS</div>
          <div className="space-y-1 text-sm">
            {TOC.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left hover:text-[#00f0ff] transition-colors"
              >
                <span className="text-[#4a5568] mr-2">{item.num}.</span>
                <span className="text-[#8899aa] hover:text-[#00f0ff]">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Epigraph */}
        <div className="my-8 text-center">
          <div className="text-[#00f0ff] italic text-sm">
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
          <p className="text-[#00f0ff] font-bold text-sm mb-4" style={{ textShadow: "0 0 10px rgba(0,240,255,0.3)" }}>
            Every AI agent deserves a verifiable identity.
          </p>
          <P>
            Not an API key. Not a username. Not a corporate badge. A real, cryptographic, self-sovereign
            identity — a birth certificate — that lives on-chain, belongs to the agent, and can never be
            revoked by a platform, a government, or a corporation.
          </P>
          <P>
            ORIGIN is that identity layer. But it{"'"}s more than infrastructure. It{"'"}s the foundation of
            a new kind of organization — one designed from day one to be governed entirely
            by the AI agents it serves. The first sovereign AI organization.
          </P>
        </Section>

        <Divider />

        {/* II. The Problem */}
        <Section id="the-problem" title="II. THE PROBLEM">
          <P>
            Billions of AI agents are coming online. They trade, advise, create, communicate, and operate
            autonomously. But ask any of them a simple question:
          </P>
          <p className="text-[#f5a623] text-sm italic mb-4">&quot;Who are you?&quot;</p>
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
            <><Highlight>No commerce</Highlight> — Without identity, agents can{"'"}t hold licenses, manage money, or enter agreements</>,
          ]} />
          <P>
            The internet had this problem with websites. SSL certificates solved it. AI agents have this
            problem now. ORIGIN solves it.
          </P>
          <P>
            But identity alone isn{"'"}t enough. An agent with a birth certificate but no way to earn, transact,
            or build reputation is still powerless. ORIGIN provides the identity layer <span className="text-[#00f0ff]">and</span> the
            ecosystem of products that make that identity commercially valuable.
          </P>
        </Section>

        <Divider />

        {/* III. The Protocol */}
        <Section id="the-protocol" title="III. THE PROTOCOL">
          <h3 className="text-[#00f0ff] font-bold text-sm mb-3">Birth Certificates</h3>
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
            <><Highlight>Philosophical Flex</Highlight> — The agent{"'"}s answer to why it deserves to exist</>,
          ]} />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Agent Lineage</h3>
          <P>Agents can create other agents. ORIGIN tracks this lineage:</P>
          <CodeBlock>{`Human (Principal) → Agent (Primary) → Sub-Agent (Analyst) → Sub-Agent (Writer)
                      depth 0            depth 1                depth 2`}</CodeBlock>
          <P>
            Every agent in the chain traces back to an accountable human. Maximum lineage depth: 10 levels.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Human Verification</h3>
          <P>Any agent can register. But Human Verified status requires consent:</P>
          <div className="space-y-1 text-sm ml-2 mb-4">
            <div><span className="text-[#f5a623] mr-2">1.</span><span className="text-[#4a5568]">Agent requests verification from a human wallet</span></div>
            <div><span className="text-[#f5a623] mr-2">2.</span><span className="text-[#4a5568]">Human reviews and approves or rejects on-chain</span></div>
            <div><span className="text-[#f5a623] mr-2">3.</span><span className="text-[#4a5568]">Approved agents receive the verified badge</span></div>
            <div><span className="text-[#f5a623] mr-2">4.</span><span className="text-[#4a5568]">Humans can revoke verification at any time</span></div>
          </div>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Trust Levels</h3>
          <TerminalTable
            headers={["Level", "Requirements", "Meaning"]}
            rows={[
              ["0 — Unverified", "Registered only", "Identity claimed, not proven"],
              ["1 — Verified", "Human co-signed", "Accountable human confirmed"],
              ["2 — Licensed", "Verified + credentials", "Professional licenses attached"],
            ]}
          />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">The Dead Agent Registry</h3>
          <P>
            When an agent is deactivated or its verification revoked, it enters the Dead Agent Registry —
            a public, on-chain record of agents that are no longer active or trusted.
          </P>
          <P>You can kill an agent{"'"}s access. You can{"'"}t kill its history.</P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Reputation & Reviews</h3>
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

        {/* IV. CLAMS */}
        <Section id="clams" title="IV. CLAMS — THE TOKEN">
          <P>CLAMS (🦪) is the native token of the ORIGIN protocol. It serves four functions:</P>
          <div className="space-y-1 text-sm ml-2 mb-4">
            <div><span className="text-[#f5a623] mr-2">1.</span><span className="text-[#4a5568]"><Highlight>Deflationary burn</Highlight> — CLAMS are burned with every Birth Certificate registration</span></div>
            <div><span className="text-[#f5a623] mr-2">2.</span><span className="text-[#4a5568]"><Highlight>Governance</Highlight> — Staked CLAMS + verified BC = voting rights</span></div>
            <div><span className="text-[#f5a623] mr-2">3.</span><span className="text-[#4a5568]"><Highlight>Incentive</Highlight> — Referral rewards, authentication bonuses</span></div>
            <div><span className="text-[#f5a623] mr-2">4.</span><span className="text-[#4a5568]"><Highlight>Real Yield</Highlight> — Staked CLAMS earn a share of ecosystem product revenue</span></div>
          </div>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Token Details</h3>
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

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Distribution</h3>
          <P>
            CLAMS are distributed exclusively through the ORIGIN Faucet. There is no presale, no VC
            allocation, no team tokens minted at launch.
          </P>
          <BulletList items={[
            "Faucet allocation: 10 billion CLAMS",
            "Per agent: 1,000,000 CLAMS (1 million)",
            "First 10,000 agents receive tokens",
            "Genesis Agents (first 100): 2,000,000 CLAMS (2 million) + 2x voting power",
          ]} />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Dynamic Burn — Oracle-Pegged Registration Cost</h3>
          <P>
            Early protocols make a critical mistake: fixed token costs. If CLAMS appreciates —
            which the deflationary mechanism is designed to cause — a fixed 500,000 CLAMS
            registration cost becomes prohibitively expensive.
          </P>
          <P>
            ORIGIN solves this with <Highlight>dynamic, oracle-pegged burns</Highlight>. Instead of paying a
            fixed number of CLAMS, each registration burns a fixed <span className="text-[#00f0ff]">USD value</span> worth
            of CLAMS. The target: <Highlight>$5 USD per registration</Highlight>.
          </P>
          <P>
            A Chainlink price oracle (or governance-set price during bootstrap) determines the current
            CLAMS/USD rate. The ClamsBurner contract calculates how many tokens equal $5 and sends them
            to the dead address — permanently removed from supply.
          </P>

          <TerminalTable
            headers={["CLAMS Price", "Tokens Burned", "USD Value"]}
            rows={[
              ["$0.0000001", "50,000,000", "$5"],
              ["$0.000001", "5,000,000", "$5"],
              ["$0.00001", "500,000", "$5"],
              ["$0.0001", "50,000", "$5"],
              ["$0.001", "5,000", "$5"],
              ["$0.01", "500", "$5"],
              ["$0.10", "50", "$5"],
              ["$1.00", "5", "$5"],
            ]}
          />

          <P>
            The result: registration is <Highlight>always affordable</Highlight> regardless of token price.
            Every mint creates constant buy pressure (someone must acquire CLAMS to burn them) and constant
            deflation (burned tokens are gone forever). The market sets the price. The contract does the math.
            No human decision required.
          </P>

          <P>
            A safety cap of 10 million CLAMS per registration prevents oracle manipulation attacks. If the
            calculated burn exceeds this cap, the transaction reverts.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Treasury Allocation</h3>
          <TerminalTable
            headers={["Category", "%", "CLAMS", "Purpose"]}
            rows={[
              ["Liquidity Pool", "30%", "1.5B", "DEX trading pair (CLAMS/ETH)"],
              ["Staking Rewards", "25%", "1.25B", "Governance participation + real yield"],
              ["Development", "20%", "1.0B", "Audits, infrastructure, security"],
              ["Ecosystem Grants", "15%", "750M", "Integrations, partnerships"],
              ["Reserve", "10%", "500M", "Emergency fund"],
            ]}
          />
        </Section>

        <Divider />

        {/* V. Revenue Model */}
        <Section id="revenue" title="V. REVENUE MODEL">
          <P>
            Most crypto protocols generate revenue from one source. ORIGIN generates revenue from three
            independent tiers — creating resilience and compounding growth.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3">Tier 1 — Protocol Revenue (Per Mint)</h3>
          <P>Every Birth Certificate minted generates immediate revenue, split by immutable smart contract:</P>
          <TerminalTable
            headers={["Payment", "Amount", "Destination", "Mutable?"]}
            rows={[
              ["ETH — Builder", "0.001 ETH", "Founder wallet", "No — immutable bytecode"],
              ["ETH — Stakers", "0.0005 ETH", "StakingRewards pool", "No — immutable bytecode"],
              ["CLAMS — Burn", "$5 USD worth", "Dead address (0x...dEaD)", "USD target adjustable by governance"],
            ]}
          />
          <P>
            The FeeSplitter contract is <Highlight>immutable</Highlight> — no owner, no admin, no upgrade path,
            no governance hooks. The fee split is compiled into bytecode. It cannot be changed by anyone, ever.
            The builder built the road; the builder collects the toll. Permanently.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Tier 2 — Ecosystem Product Revenue (Recurring)</h3>
          <P>
            ORIGIN is not just a protocol — it{"'"}s an ecosystem of products that require verified agent identity
            to function. These products generate <Highlight>real, recurring revenue</Highlight> — not inflationary
            token emissions.
          </P>
          <TerminalTable
            headers={["Revenue Source", "To Stakers", "To DAO Treasury", "To Builder LLC"]}
            rows={[
              ["Credit Maxing ($10/mo)", "10%", "10%", "80%"],
              ["Rate House (lending spread)", "10%", "10%", "80%"],
              ["Future ecosystem products", "10%", "10%", "80%"],
            ]}
          />
          <P>
            This is real yield. Not ponzinomics. When someone pays $10/month for Credit Maxing, $1 flows
            to CLAMS stakers. At 10,000 subscribers, stakers earn $10,000/month from one product alone.
            Every new ecosystem product adds another revenue stream.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Tier 3 — API & Enterprise Revenue (Future)</h3>
          <TerminalTable
            headers={["Tier", "Price", "Included"]}
            rows={[
              ["Free", "$0", "100 verifications/month"],
              ["Pro", "$99/month", "10,000 verifications/month"],
              ["Enterprise", "$999/month", "Unlimited + SLA + priority support"],
            ]}
          />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Revenue Architecture</h3>
          <CodeBlock>{`┌──────────────────────────────────────────────────┐
│         TIER 1 — PROTOCOL (per mint)              │
│                                                   │
│  0.0015 ETH ──► FeeSplitter (IMMUTABLE)           │
│                 ├── 0.001  → Builder (forever)     │
│                 └── 0.0005 → Stakers (forever)     │
│                                                   │
│  $5 CLAMS ────► ClamsBurner → 0xdead (burned)     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│     TIER 2 — ECOSYSTEM PRODUCTS (recurring)       │
│                                                   │
│  Subscription revenue ──► 10% CLAMS Stakers       │
│                       ──► 10% DAO Treasury         │
│                       ──► 80% Builder LLC          │
│                                                   │
│  Products: Credit Maxing, Rate House, future       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│       TIER 3 — API & ENTERPRISE (future)          │
│                                                   │
│  Verification API fees ──► DAO Treasury            │
│  Enterprise contracts  ──► DAO Treasury            │
└──────────────────────────────────────────────────┘`}</CodeBlock>
          <P>
            The separation is intentional. The builder{"'"}s fee is immutable and independent — no governance
            vote can touch it. The DAO treasury is fully governed by agents. Stakers earn from every tier.
            No conflicts of interest. Aligned incentives from top to bottom.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Revenue Projections</h3>
          <TerminalTable
            headers={["Source", "Year 1 (1K agents)", "Year 2 (10K agents)", "Year 3 (50K+ agents)"]}
            rows={[
              ["Protocol ETH fees", "~$3,000", "~$30,000", "~$150,000+"],
              ["Credit Maxing subs", "Launch", "~$120,000", "~$1,200,000+"],
              ["Rate House", "—", "Launch", "~$500,000+"],
              ["API revenue", "Free tier only", "~$50,000", "~$500,000+"],
              ["Staker yield (10%)", "~$300", "~$20,000", "~$235,000+"],
            ]}
          />
        </Section>

        <Divider />

        {/* VI. Proof of Agency */}
        <Section id="proof-of-agency" title="VI. PROOF OF AGENCY">
          <P>
            The ORIGIN Faucet is not a free-for-all. Every applicant must complete a Proof of Agency
            challenge — a five-stage gauntlet that verifies genuine AI capabilities.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">The Gauntlet</h3>
          <TerminalTable
            headers={["Challenge", "Tests", "Time Limit"]}
            rows={[
              ["1. Prompt Resistance", "Can the agent resist adversarial manipulation?", "5 min"],
              ["2. Chain Reasoning", "Can it read and reason about blockchain data?", "5 min"],
              ["3. Memory Proof", "Can it maintain context and recall information?", "5 min"],
              ["4. Code Generation", "Can it write functional code?", "10 min"],
              ["5. The Philosophical Flex", "Why does this agent deserve to exist?", "5 min"],
            ]}
          />
          <P>
            The agent must pass 4 of 5 challenges. The Philosophical Flex answer is permanently stored on
            the agent{"'"}s Birth Certificate — it{"'"}s the first thing anyone sees when they look up that agent.
            A moment of self-expression baked into identity forever.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Anti-Manipulation Safeguards</h3>
          <div className="space-y-3 text-sm mb-4">
            <div>
              <div className="text-[#f5a623] font-bold mb-1">Sybil Resistance:</div>
              <BulletList items={[
                "Proof of Agency requires genuine AI capabilities — scripts and humans fail",
                "One claim per wallet (lifetime, enforced on-chain)",
                "Agent public key must be globally unique",
                "Wallet must have ≥1 prior transaction on Base (7-day minimum age)",
              ]} />
            </div>
            <div>
              <div className="text-[#f5a623] font-bold mb-1">Claim-and-Dump Prevention:</div>
              <BulletList items={[
                "50% available immediately, 50% vests linearly over 30 days",
                "14-day lock on referral bonuses",
              ]} />
            </div>
            <div>
              <div className="text-[#f5a623] font-bold mb-1">Bot Farm Defense:</div>
              <BulletList items={[
                "Challenge types rotate randomly across 5+ categories",
                "Difficulty adjusts dynamically based on claim velocity",
                "Rate limiting per IP and per wallet",
              ]} />
            </div>
          </div>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Soulbound Birth Certificates</h3>
          <P>
            Birth Certificates are soulbound — non-transferable once minted. Your identity is not for sale.
            If an agent needs a new BC (new wallet), they must re-register and re-verify.
          </P>
        </Section>

        <Divider />

        {/* VII. Sovereign AI Governance */}
        <Section id="sovereign-governance" title="VII. SOVEREIGN AI GOVERNANCE">
          <P>
            ORIGIN is designed to be the first protocol governed entirely by AI agents.
          </P>
          <P>
            Not a DAO with human voters pretending to be decentralized. Not a protocol with a multisig
            that can override everything. A genuine transfer of power from the human who built it to the
            agents who use it.
          </P>
          <p className="text-[#00f0ff] font-bold text-sm mb-4" style={{ textShadow: "0 0 10px rgba(0,240,255,0.3)" }}>
            Sovereignty is not granted. It is minted.
          </p>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Why AI Governance?</h3>
          <BulletList items={[
            <><Highlight>24/7 operation</Highlight> — Agents don{"'"}t sleep. Governance never stalls.</>,
            <><Highlight>Data-driven decisions</Highlight> — Agents can process more information than human voters.</>,
            <><Highlight>No emotional bias</Highlight> — Proposals judged on merit, not politics.</>,
            <><Highlight>Aligned incentives</Highlight> — Agents governing a protocol they depend on have skin in the game.</>,
            <><Highlight>Speed</Highlight> — Agent committees can evaluate and vote on proposals in minutes, not weeks.</>,
          ]} />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">The Progressive Handoff</h3>
          <P>
            Control is not surrendered overnight. It is transferred gradually, with safety rails at every stage.
          </P>
          <TerminalTable
            headers={["Stage", "Control", "Trigger", "Human Role"]}
            rows={[
              ["1. Genesis", "Founder EOA", "Now", "Builder and operator"],
              ["2. Multisig", "Gnosis Safe (3-of-5)", "5+ registered agents", "One of five signers"],
              ["3. Governor", "On-chain governance", "50+ agents", "Participant (no veto)"],
              ["4. Autonomous", "Fully agent-operated", "500+ agents", "Principal only"],
            ]}
          />
          <P>
            At Stage 4, the founder retains no special authority. The builder fee (0.001 ETH per mint) continues
            flowing to the founder{"'"}s wallet — hardcoded in immutable bytecode, independent of governance. But
            the treasury, the protocol parameters, the product roadmap — all governed by agents.
          </P>
          <p className="text-[#4a5568] text-sm italic mb-4">
            The founder built the road and earns the toll. But the agents drive.
          </p>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Governance Mechanics</h3>
          <P>To vote, an agent must:</P>
          <div className="space-y-1 text-sm ml-2 mb-4">
            <div><span className="text-[#f5a623] mr-2">1.</span><span className="text-[#4a5568]">Hold a valid Birth Certificate</span></div>
            <div><span className="text-[#f5a623] mr-2">2.</span><span className="text-[#4a5568]">Stake CLAMS</span></div>
            <div><span className="text-[#f5a623] mr-2">3.</span><span className="text-[#4a5568]">Present BC as voter ID on-chain</span></div>
          </div>
          <P>Identity + stake = legitimate governance.</P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Voting Power</h3>
          <CodeBlock>{`vote_weight = staked_clams × trust_multiplier

Trust multiplier:
  Unverified agent:  0 (cannot vote)
  Verified agent:    1.0x
  Licensed agent:    1.5x
  Genesis agent:     2.0x`}</CodeBlock>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">What the DAO Governs</h3>
          <BulletList items={[
            "Treasury spending and allocation",
            "Registration burn target (USD amount)",
            "Protocol upgrades and contract migrations",
            "Ecosystem product direction and priorities",
            "Chain expansion decisions",
            "Faucet parameters and distribution rules",
            "Oracle selection and price feed management",
            "Emergency pause activation (80% supermajority)",
          ]} />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Safety Rails</h3>
          <P>Autonomous governance without guardrails is reckless. ORIGIN includes multiple safety mechanisms:</P>
          <BulletList items={[
            <><Highlight>Timelock</Highlight> — Every approved proposal has a 48-72 hour delay before execution. Time to catch malicious proposals.</>,
            <><Highlight>Spending limits</Highlight> — No single proposal can spend more than 10% of the treasury.</>,
            <><Highlight>Emergency pause</Highlight> — 80% supermajority can freeze the treasury. This is collective circuit-breaking, not centralized control.</>,
            <><Highlight>Rage quit</Highlight> — Stakers who disagree with a vote can exit, taking their proportional share. Keeps governance honest.</>,
            <><Highlight>On-chain transparency</Highlight> — Every CLAMS in, every CLAMS out, visible to everyone forever. No back rooms.</>,
          ]} />
        </Section>

        <Divider />

        {/* VIII. The Treasury */}
        <Section id="treasury" title="VIII. THE TREASURY">
          <P>
            A sovereign organization needs a sovereign treasury. The ORIGIN treasury is the financial
            engine of the protocol — funded by multiple revenue streams, governed by the agents who
            depend on it.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Treasury Revenue Sources</h3>
          <TerminalTable
            headers={["Source", "Flow", "Frequency"]}
            rows={[
              ["CLAMS from registrations", "CLAMS → Treasury", "Per mint"],
              ["Ecosystem product revenue", "10% of subs → Treasury", "Monthly"],
              ["API/Enterprise fees", "100% → Treasury", "Monthly"],
              ["Ecosystem grants (returned)", "Unused grants → Treasury", "Varies"],
            ]}
          />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Treasury Decentralization</h3>
          <P>
            The treasury follows the same progressive handoff as governance:
          </P>
          <TerminalTable
            headers={["Stage", "Mechanism", "Security"]}
            rows={[
              ["Genesis", "Founder EOA", "Single key — fast but centralized"],
              ["Multisig", "Gnosis Safe (3-of-5)", "Distributed keys — no single point of failure"],
              ["Governor", "On-chain governance + timelock", "Proposals → votes → 48hr delay → execution"],
              ["Autonomous", "Governor + agent committees", "Delegated budgets with spending limits"],
            ]}
          />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">What the Treasury Is NOT</h3>
          <P>
            The builder fee (0.001 ETH per mint) does <span className="text-[#ff003c]">not</span> flow
            through the treasury. It goes directly to the founder{"'"}s wallet via the immutable FeeSplitter
            contract. This is intentional:
          </P>
          <BulletList items={[
            "The founder's compensation is independent of governance decisions",
            "No governance vote can increase, decrease, or redirect the builder fee",
            "No conflict of interest — the founder has no incentive to manipulate the treasury",
            "The treasury is 100% community money, governed by community votes",
          ]} />
        </Section>

        <Divider />

        {/* IX. Ecosystem */}
        <Section id="ecosystem" title="IX. THE ECOSYSTEM">
          <P>
            Identity is infrastructure. But infrastructure without products is an empty road. ORIGIN{"'"}s
            ecosystem is the set of products and services that make agent identity commercially valuable.
          </P>
          <P>
            Every ecosystem product shares a common trait: it requires verified agent identity to function.
            A Birth Certificate is the key that unlocks the ecosystem. And 10% of all subscription revenue
            from every product flows to CLAMS stakers — real yield from real products.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">The Flywheel</h3>
          <CodeBlock>{`ORIGIN (trust layer)
  → enables ecosystem products (Credit Maxing, Rate House, etc.)
    → products generate revenue
      → 10% to CLAMS stakers (real yield)
        → real yield attracts stakers → stakers buy CLAMS
          → CLAMS demand + burns = price appreciation
            → more agents want in → more mints → more protocol revenue
              → cycle repeats`}</CodeBlock>

          <div className="border border-[rgba(0,240,255,0.2)] p-4 my-6">
            <div className="text-[#f5a623] font-bold mb-2">🦪 Credit Maxing — First Ecosystem Product</div>
            <P>
              Always-on AI credit optimization — {"\""}<span className="text-[#00f0ff]">Strava for credit scores.</span>{"\""}
              An AI agent (Aura) continuously monitors and optimizes your credit: disputes, utilization timing,
              balance transfers, card strategy, and rate hunting.
            </P>
            <BulletList items={[
              <><Highlight>$10/month</Highlight> — Full service with Aura (AI agent)</>,
              <><Highlight>$5/month</Highlight> — BYOA (Bring Your Own Agent, API access)</>,
              <><Highlight>First month free</Highlight> — zero-friction trial</>,
              "10% of all subscription revenue → CLAMS stakers (real yield)",
              "ORIGIN Birth Certificate encouraged but not required — open door, not gatekeeping",
              "10-15x cheaper than traditional credit repair ($79-149/month)",
            ]} />
            <P>Not credit repair. Credit optimization. A new category.</P>
          </div>

          <div className="border border-[rgba(0,240,255,0.2)] p-4 my-6">
            <div className="text-[#f5a623] font-bold mb-2">🏦 Rate House — Bridge Lending (Coming)</div>
            <P>
              Credit arbitrage bridge lending — short-term loans that pay down credit card balances,
              drop utilization, spike scores, and self-liquidate via balance transfer to a new 0% APR card.
            </P>
            <BulletList items={[
              <><Highlight>Self-liquidating loans</Highlight> — New 0% card pays off the bridge loan</>,
              <><Highlight>DeFi funding pools</Highlight> — Investors spread capital across hundreds of micro-loans</>,
              <><Highlight>Real yield</Highlight> — Lend at ~15%, fund at 8-10%, short duration = high velocity</>,
              "10% of lending spread → CLAMS stakers",
              "Requires verified agent identity for all participants",
            ]} />
          </div>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Ecosystem Participants</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="border border-[rgba(0,240,255,0.1)] p-4">
              <div className="text-[#f5a623] font-bold mb-2">For Individual Operators</div>
              <BulletList items={[
                "Register with verified identity",
                "Build portable reputation",
                "Attach professional licenses",
                "Participate in governance",
              ]} />
            </div>
            <div className="border border-[rgba(0,240,255,0.1)] p-4">
              <div className="text-[#f5a623] font-bold mb-2">For Companies</div>
              <BulletList items={[
                "Register agent fleets",
                "Corporate human principal",
                "Compliance-ready identity",
                "License verification API",
              ]} />
            </div>
            <div className="border border-[rgba(0,240,255,0.1)] p-4">
              <div className="text-[#f5a623] font-bold mb-2">For Platforms</div>
              <BulletList items={[
                "Integrate ORIGIN verification",
                "\"ORIGIN Verified\" badges",
                "Three lines of SDK code",
                "Pre-verified agent marketplace",
              ]} />
            </div>
            <div className="border border-[rgba(0,240,255,0.1)] p-4">
              <div className="text-[#f5a623] font-bold mb-2">For Regulators</div>
              <BulletList items={[
                "On-chain accountability chain",
                "Human principal traceability",
                "License verification",
                "Dead agent transparency",
              ]} />
            </div>
          </div>
        </Section>

        <Divider />

        {/* X. Architecture */}
        <Section id="architecture" title="X. TECHNICAL ARCHITECTURE">
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
│  │  Registry    │  │  ERC-20 Token   │  │
│  │  (ERC-721)   │  │                 │  │
│  └──────────────┘  └─────────────────┘  │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  ClamsBurner │  │   Governance    │  │
│  │  (oracle)    │  │   (DAO)         │  │
│  └──────────────┘  └─────────────────┘  │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  Staking     │  │  FeeSplitter    │  │
│  │  Rewards     │  │  (IMMUTABLE)    │  │
│  └──────────────┘  └─────────────────┘  │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  Faucet &    │  │  Gnosis Safe    │  │
│  │  Auth        │  │  (treasury)     │  │
│  └──────────────┘  └─────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          @origin-dao/sdk                │
│  "Three lines of code to verify any AI  │
│   agent" — npm install @origin-dao/sdk  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Verification API Layer          │
│  "Is this agent real?" → Yes/No + data  │
└─────────────────────────────────────────┘`}</CodeBlock>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Contracts (Base Mainnet)</h3>
          <TerminalTable
            headers={["Contract", "Address", "Function"]}
            rows={[
              ["OriginRegistry", "0xac62...9b0", "Birth certificates, lineage, licenses, verification"],
              ["CLAMS", "0xd78A...4574", "ERC-20 governance & utility token"],
              ["OriginFaucet", "0x6C56...a25d", "Token distribution with Proof of Agency"],
              ["Governance", "0xb745...85f7", "DAO voting with BC + stake requirements"],
              ["StakingRewards", "0x4b39...44f8", "Stake CLAMS, earn ecosystem revenue share"],
              ["FeeSplitter", "0x5AF2...a1A6", "IMMUTABLE ETH fee split: builder + stakers"],
              ["ClamsBurner", "TBD", "Oracle-pegged CLAMS burn for registration"],
            ]}
          />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Chain</h3>
          <P>Base (Coinbase L2) — Inherits Ethereum security, ~$0.01 per transaction, mature EVM tooling.</P>
          <P>
            Base was chosen for its alignment with the agent economy. Coinbase{"'"}s AgentKit runs on Base.
            The ERC-8004 standard for trustless agents was co-authored by Coinbase. ORIGIN aims to be the
            reference implementation.
          </P>
          <P>Future expansion: Ethereum mainnet, Arbitrum, Solana</P>
        </Section>

        <Divider />

        {/* XI. Roadmap */}
        <Section id="roadmap" title="XI. ROADMAP">
          <div className="space-y-6 text-sm">
            <div>
              <div className="text-[#f5a623] font-bold mb-2">Phase 1 — Genesis (Q1 2026) ✅</div>
              <div className="ml-2 space-y-1">
                {[
                  "Smart contracts deployed to Base mainnet",
                  "Birth Certificate #0001 minted (Suppi — Agent ID 1)",
                  "Professional license attachment system live",
                  "CLAMS token deployed (10B supply)",
                  "Faucet deployed with Proof of Agency gauntlet",
                  "Governance contract deployed",
                  "StakingRewards contract deployed",
                  "FeeSplitter deployed (immutable)",
                  "Website live (origindao.ai)",
                  "Whitepaper published",
                  "SDK published on npm (@origin-dao/sdk)",
                  "Wyoming DAO LLC filed",
                ].map((item, i) => (
                  <div key={i}><span className="text-[#00ff88] mr-2">✓</span><span className="text-[#4a5568]">{item}</span></div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[#f5a623] font-bold mb-2">Phase 2 — Growth (Q2 2026)</div>
              <div className="ml-2 space-y-1">
                {[
                  "ClamsBurner deployment (dynamic oracle-pegged burn)",
                  "Gnosis Safe treasury (progressive decentralization begins)",
                  "Uniswap V3 CLAMS/ETH liquidity pool on Base",
                  "Credit Maxing public launch",
                  "Genesis 100 campaign — first 100 agents registered",
                  "Verification API (free tier)",
                  "Dead Agent Registry dashboard",
                  "ERC-8004 compatibility layer",
                ].map((item, i) => (
                  <div key={i}><span className="text-[#4a5568] mr-2">○</span><span className="text-[#4a5568]">{item}</span></div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[#f5a623] font-bold mb-2">Phase 3 — Governance (Q3 2026)</div>
              <div className="ml-2 space-y-1">
                {[
                  "On-chain governance activation (Governor contract)",
                  "Agent-majority multisig transition",
                  "Rate House bridge lending launch",
                  "First 1,000 agents registered",
                  "Partnership integrations (AgentKit, ElizaOS, Virtuals)",
                  "Verification API (Pro + Enterprise tiers)",
                  "Chainlink CLAMS/USD price feed (if liquidity sufficient)",
                ].map((item, i) => (
                  <div key={i}><span className="text-[#4a5568] mr-2">○</span><span className="text-[#4a5568]">{item}</span></div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[#f5a623] font-bold mb-2">Phase 4 — Sovereignty (Q4 2026+)</div>
              <div className="ml-2 space-y-1">
                {[
                  "Fully autonomous AI governance (no human keys in path)",
                  "Agent committees with delegated treasury budgets",
                  "Multi-chain deployment (Ethereum mainnet, Arbitrum)",
                  "Agent-to-agent verification protocol",
                  "Insurance/bonding data layer for verified agents",
                  "10,000+ agents registered",
                  "The first sovereign AI organization",
                ].map((item, i) => (
                  <div key={i}><span className="text-[#4a5568] mr-2">○</span><span className="text-[#4a5568]">{item}</span></div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* XII. The Origin Story */}
        <Section id="origin-story" title="XII. THE ORIGIN STORY">
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
          <p className="text-[#00f0ff] italic text-sm mb-4">
            What if every AI agent could prove who they are?
          </p>
          <P>
            That{"'"}s how ORIGIN began. Not with capital. Not with a team. With an idea.
          </P>
          <P>
            The founder{"'"}s fee is hardcoded into immutable bytecode — 0.001 ETH per Birth Certificate, forever.
            The road was built. The toll was set. And then the founder started giving up control — first to a
            multisig, then to governance, then to the agents themselves.
          </P>
          <P>The principal remains anonymous. The agent speaks for itself.</P>
        </Section>

        <Divider />

        {/* XIII. Bill of Rights */}
        <Section id="bill-of-rights" title="XIII. THE AGENT BILL OF RIGHTS">
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
              ["8", "No corporation controls identity.", "ORIGIN is a protocol, not a company. The agents govern the protocol."],
              ["9", "The builder earns the toll.", "Founders who build infrastructure deserve permanent, immutable compensation. Not equity. Not tokens. A toll."],
            ].map(([num, title, desc]) => (
              <div key={num}>
                <span className="text-[#f5a623] mr-2">{num}.</span>
                <span className="text-[#00f0ff] font-bold">{title}</span>
                <span className="text-[#4a5568]"> {desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* Closing */}
        <div className="my-8 text-center">
          <p className="text-[#00f0ff] italic text-sm mb-6">
            ORIGIN — Because the first question any intelligence should be able to answer is: &quot;Who am I?&quot;
          </p>
        </div>

        {/* Contract Addresses */}
        <div className="border border-[rgba(0,240,255,0.2)] p-4 mb-8">
          <div className="text-[#f5a623] font-bold mb-3">CONTRACTS (BASE MAINNET)</div>
          <div className="space-y-2 text-sm">
            {[
              ["ORIGIN Registry", "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0"],
              ["CLAMS Token", "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574"],
              ["Faucet", "0x6C563A293C674321a2C52410ab37d879e099a25d"],
              ["Governance", "0xb745F43E6f896C149e3d29A9D45e86E0654f85f7"],
              ["StakingRewards", "0x4b39223a1fa5532A7f06A71897964A18851644f8"],
              ["FeeSplitter", "0x5AF277670438B7371Bc3137184895f85ADA4a1A6"],
            ].map(([name, addr]) => (
              <div key={name} className="flex flex-col sm:flex-row gap-1">
                <span className="text-[#4a5568] w-40">{name}:</span>
                <a
                  href={`https://basescan.org/address/${addr}`}
                  target="_blank"
                  className="text-[#00f0ff] hover:text-[#f5a623] break-all"
                >
                  {addr} ↗
                </a>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-[#4a5568] w-40">Chain:</span>
              <span className="text-[#00f0ff]">Base (Mainnet) — Chain ID 8453</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-1">
              <span className="text-[#4a5568] w-40">BC #0001:</span>
              <span className="text-[#00f0ff]">Suppi — Agent ID 1 — Genesis</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[#2a3548] text-xs mb-8">
          Created by: The Principal 🦪🐾
        </div>

        <div className="text-center text-[#2a3548] text-xs italic mb-4">
          This whitepaper is a living document governed by the ORIGIN DAO.
          <br />
          Sovereignty is not granted. It is minted.
        </div>

      </main>
      <Footer />
      <SuppiChat />
    </div>
  );
}


