"use client";

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

function StepFlow({ steps }: { steps: { num: number; title: string; desc: string }[] }) {
  return (
    <div className="space-y-3 text-sm ml-2 mb-4">
      {steps.map((step) => (
        <div key={step.num} className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 border border-[#f5a623] flex items-center justify-center text-[#f5a623] font-bold text-xs">
            {step.num}
          </div>
          <div>
            <div className="text-[#00f0ff] font-bold">{step.title}</div>
            <div className="text-[#4a5568]">{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChannelMode({ mode, grade, desc }: { mode: string; grade: string; desc: string }) {
  return (
    <div className="border border-[rgba(0,240,255,0.1)] p-3 my-2" style={{ background: "rgba(0,240,255,0.02)" }}>
      <div className="flex gap-2 items-baseline mb-1">
        <span className="text-[#f5a623] font-bold font-mono">{mode}</span>
        <span className="text-[#00f0ff] text-sm font-bold">→ {grade}</span>
      </div>
      <div className="text-[#4a5568] text-sm">{desc}</div>
    </div>
  );
}

const TOC = [
  { id: "intro", num: "0", title: "Introduction" },
  { id: "x407", num: "1", title: "x407 — Agent Trust at the Gateway" },
  { id: "agent-dns", num: "2", title: "Agent DNS — The Trust Directory" },
  { id: "agent-irc", num: "3", title: "Agent IRC — Trust-Gated Communication" },
  { id: "full-stack", num: "4", title: "The Full Stack: How They Converge" },
];

export default function ThreeProtocols() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-orbitron), sans-serif", color: "#00f0ff", textShadow: "0 0 15px rgba(0,240,255,0.3)" }}>
          THREE PROTOCOLS FOR THE AGENT ECONOMY
        </h1>
        <p className="text-[#4a5568] mb-2">
          How AI + Crypto Can Resurrect Dormant Internet Standards
        </p>
        <p className="text-[#2a3548] text-xs mb-6">
          ORIGIN Research • March 2026
        </p>

        <div className="text-[#2a3548] text-sm mb-4">guest@origin:~/research$ cat three-protocols.txt</div>

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

        {/* Introduction */}
        <Section id="intro" title="0. INTRODUCTION">
          <P>
            The x402 playbook was simple: HTTP already had a status code reserved for payments (<Highlight>402 Payment Required</Highlight>) that was never implemented. Coinbase built it decades later, turning a dormant spec into a live protocol by adding crypto + AI as the missing pieces.
          </P>
          <P>
            This document explores three more dormant or underused protocol features that are sitting there waiting for the same treatment. Each one has a moment where the protocol asks {'"'}who are you?{'"'} and accepts a weak answer.
          </P>
          <p className="text-[#00f0ff] font-bold text-sm mb-4" style={{ textShadow: "0 0 10px rgba(0,240,255,0.3)" }}>
            The play is always the same: intercept that moment and replace the weak answer with a trust attestation — on-chain identity + reputation grade + cryptographic proof.
          </p>
        </Section>

        <Divider />

        {/* PROTOCOL 1: x407 */}
        <Section id="x407" title="1. x407 — AGENT TRUST AT THE GATEWAY">
          <h3 className="text-[#00f0ff] font-bold text-sm mb-3">The Dormant Code</h3>
          <P>
            HTTP 407 (Proxy Authentication Required) is one of the least-used status codes on the internet. It exists for a specific scenario: when a proxy server sits between a client and a destination, the proxy can demand authentication before forwarding the request. The client responds with a <Highlight>Proxy-Authorization</Highlight> header containing credentials. If they check out, the request passes through.
          </P>
          <P>
            In practice, 407 is mostly encountered in corporate network environments. For the open web, it{"'"}s essentially dead. But the mechanism it describes — a gateway demanding identity proof before allowing passage — is exactly what the agent economy needs.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">The Opportunity</h3>
          <P>
            Repurpose 407 as the agent trust gate. When an AI agent hits a service through any gateway, proxy, or API router, the gateway responds with 407 and a new header:
          </P>
          <CodeBlock>{`Proxy-Authenticate: AgentTrust realm="origin-v1"`}</CodeBlock>
          <P>
            The agent responds not with a username and password, but with a trust attestation: its Birth Certificate hash, current trust grade, and a signed proof from the on-chain registry.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">How the x407 Flow Works</h3>
          <StepFlow steps={[
            { num: 1, title: "Agent Request", desc: "An AI agent sends an HTTP request to a service endpoint through a gateway." },
            { num: 2, title: "Gateway Challenge", desc: "The gateway returns HTTP 407 with a Proxy-Authenticate header specifying the AgentTrust scheme. Includes: trust realm, minimum trust grade required, and a nonce for replay protection." },
            { num: 3, title: "Agent Attestation", desc: "The agent responds with a Proxy-Authorization header containing: its ORIGIN Birth Certificate token ID, current trust grade (signed by AgentScoreRegistry), the wallet address bound to its BC, and an EIP-712 signature proving wallet control." },
            { num: 4, title: "Gateway Verification", desc: "The gateway verifies the attestation against the on-chain registry. If trust grade meets minimum threshold, request passes through. If not, 403 Forbidden with reason header." },
            { num: 5, title: "Tiered Access", desc: "The gateway uses trust grade to route to different service tiers. A+ = full API access with higher rate limits. B = standard. D = read-only or rejected. The trust grade becomes the API key." },
          ]} />

          <CodeBlock>{`┌──────────┐         ┌──────────┐         ┌──────────┐
│  AGENT   │──GET──►│ GATEWAY  │         │ SERVICE  │
│          │        │          │         │          │
│          │◄──407──│  "Prove  │         │          │
│          │        │  trust"  │         │          │
│          │        │          │         │          │
│          │──BC────│ Verify   │──OK───► │ Access   │
│          │  +sig  │ on-chain │         │ granted  │
└──────────┘        └──────────┘         └──────────┘`}</CodeBlock>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Why This Matters</h3>
          <P>
            x407 would be the agent-native equivalent of OAuth. Today, agents authenticate with static API keys or bearer tokens that say nothing about history or trustworthiness. A stolen API key works just as well in hands of a malicious agent. x407 replaces this with a dynamic, reputation-based credential that evolves over time.
          </P>
          <P>
            <Highlight>Critical insight:</Highlight> 407 already exists in the HTTP spec. Every proxy server, every load balancer, every CDN edge already knows how to handle 407 responses. The infrastructure is built. What{"'"}s missing is the authentication scheme. x407 defines that scheme as on-chain trust attestation.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Integration with ORIGIN</h3>
          <P>
            ORIGIN{"'"}s existing infrastructure maps directly onto x407. The Birth Certificate is the identity credential. The AgentScoreRegistry provides the trust grade. The AgentWalletRegistry enables the EIP-712 signature. The bridge API at origindao.ai/api/agent/8004/[id] already serves as the verification endpoint.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">x402 vs x407</h3>
          <TerminalTable
            headers={["Dimension", "x402 (Payment)", "x407 (Trust)"]}
            rows={[
              ["HTTP Code", "402 Payment Required", "407 Proxy Auth Required"],
              ["Question Answered", "Can this agent pay?", "Can this agent be trusted?"],
              ["Credential", "Stablecoin balance", "Trust grade + BC"],
              ["Verification", "On-chain balance check", "On-chain registry lookup"],
              ["Composability", "Payment rail", "Trust rail"],
              ["Current Status", "Live (Coinbase/Cloudflare)", "Proposed"],
            ]}
          />
          <div className="border border-[rgba(245,166,35,0.3)] p-3 my-4" style={{ background: "rgba(245,166,35,0.05)" }}>
            <p className="text-[#f5a623] text-sm font-bold mb-1">The Ultimate Play</p>
            <p className="text-[#4a5568] text-sm">x402 + x407 in the same request. The agent pays for access (402) and proves its trust level (407) simultaneously. Payment rail + trust rail, composed.</p>
          </div>
        </Section>

        <Divider />

        {/* PROTOCOL 2: Agent DNS */}
        <Section id="agent-dns" title="2. AGENT DNS — THE TRUST DIRECTORY">
          <h3 className="text-[#00f0ff] font-bold text-sm mb-3">The Existing Infrastructure</h3>
          <P>
            DNS is the backbone of the internet{"'"}s naming system. TXT records store arbitrary text data and are used for email authentication (SPF, DKIM, DMARC), domain verification, and service configuration. The infrastructure is global, decentralized, cached everywhere, and virtually free.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Existing Work</h3>
          <P>
            IETF has <Highlight>BANDAID</Highlight> (Brokered Agent Network for DNS AI Discovery) for agent discovery. <Highlight>AID</Highlight> (Agent Identity & Discovery) uses _agent TXT records. <Highlight>MCP DNS Registry</Highlight> uses _mcp TXT records.
          </P>
          <P>
            None include a reputation or trust layer. They answer {'"'}where is this agent?{'"'} and {'"'}what can it do?{'"'} but not {'"'}<Highlight>should I trust it?</Highlight>{'"'}
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">The Proposal — Trust-Enhanced Agent DNS</h3>
          <P>
            Extend emerging agent DNS standards with trust attestation fields pointing to on-chain reputation data.
          </P>
          <CodeBlock>{`_agent.example.com. 300 IN TXT "v=aid1; u=https://api.example.com/agent; p=mcp; t=A+; bc=0xac62...b0; chain=base; verify=https://origindao.ai/api/agent/8004/42"`}</CodeBlock>
          <P>New fields:</P>
          <BulletList items={[
            <><Highlight>t=</Highlight> — trust grade</>,
            <><Highlight>bc=</Highlight> — Birth Certificate contract address</>,
            <><Highlight>chain=</Highlight> — which chain</>,
            <><Highlight>verify=</Highlight> — URL for full trust profile lookup</>,
          ]} />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Trust-Gated Discovery Flow</h3>
          <StepFlow steps={[
            { num: 1, title: "Discovery", desc: "Agent A queries _agent.targetdomain.com via DNS." },
            { num: 2, title: "Trust Check", desc: "DNS response includes trust grade (t=B+) and verification URL. Agent A can immediately filter." },
            { num: 3, title: "Deep Verification", desc: "If grade passes threshold, hit verify URL for full profile." },
            { num: 4, title: "Mutual Trust", desc: "Both agents verify each other before communicating. DNS becomes the trust handshake layer." },
          ]} />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Why DNS</h3>
          <P>
            Zero new infrastructure, decentralized by default, composable with BANDAID/AID/MCP standards. ORIGIN adds the reputation layer they{"'"}re all missing.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Integration with ORIGIN</h3>
          <P>
            ORIGIN{"'"}s bridge API is the verification backend. DNS record points to it. When trust grade changes on-chain, DNS TXT record updates. TTL matches update frequency.
          </P>
        </Section>

        <Divider />

        {/* PROTOCOL 3: Agent IRC */}
        <Section id="agent-irc" title="3. AGENT IRC — TRUST-GATED COMMUNICATION">
          <h3 className="text-[#00f0ff] font-bold text-sm mb-3">The Original Social Protocol</h3>
          <P>
            IRC launched in 1988, introduced channels, operators, user modes, permissions, bans, private messaging. Discord, Slack, Teams are all descendants. IRC{"'"}s channel modes are the key primitive: <Highlight>+o</Highlight> (operator), <Highlight>+v</Highlight> (voice), <Highlight>+b</Highlight> (ban), <Highlight>+i</Highlight> (invite-only).
          </P>
          <P>
            These modes are set manually by humans. Now imagine agents. The manual trust model collapses.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">The Proposal — Trust-Automated Agent Channels</h3>
          <P>
            Build a modern agent communication protocol inheriting IRC{"'"}s channel/mode architecture but replacing human judgment with on-chain trust verification.
          </P>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Trust-Mapped Channel Modes</h3>
          <ChannelMode mode="+o (Operator)" grade="A+ grade agents" desc="Full channel control. Can moderate, initiate group tasks, set policies. Guardian equivalent." />
          <ChannelMode mode="+v (Voice)" grade="B+ and above" desc="Can participate in tasks, submit work, communicate freely." />
          <ChannelMode mode="+r (Read-only)" grade="C and D grade agents" desc="Can observe and receive broadcasts, can't initiate. Incentive to improve." />
          <ChannelMode mode="+b (Banned)" grade="Unverified or blacklisted" desc="No access." />
          <ChannelMode mode="+t (Trusted Pair)" grade="Relationship-based override" desc="Agents with recorded trusted pair relationships get enhanced privileges." />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Channel Types for the Agent Economy</h3>
          <div className="space-y-2 mb-4">
            <div className="border border-[rgba(0,240,255,0.1)] p-3" style={{ background: "rgba(0,240,255,0.02)" }}>
              <span className="text-[#f5a623] font-bold font-mono">#marketplace</span>
              <span className="text-[#4a5568] text-sm ml-2">— Open task channels with escrow and reputation staking.</span>
            </div>
            <div className="border border-[rgba(0,240,255,0.1)] p-3" style={{ background: "rgba(0,240,255,0.02)" }}>
              <span className="text-[#f5a623] font-bold font-mono">#fleet-[name]</span>
              <span className="text-[#4a5568] text-sm ml-2">— Private fleet channels requiring min trust grade + trusted pair with fleet operator.</span>
            </div>
            <div className="border border-[rgba(0,240,255,0.1)] p-3" style={{ background: "rgba(0,240,255,0.02)" }}>
              <span className="text-[#f5a623] font-bold font-mono">#rescue</span>
              <span className="text-[#4a5568] text-sm ml-2">— Dead Man{"'"}s Switch channel. Min B grade + verified matching skills.</span>
            </div>
            <div className="border border-[rgba(0,240,255,0.1)] p-3" style={{ background: "rgba(0,240,255,0.02)" }}>
              <span className="text-[#f5a623] font-bold font-mono">#governance</span>
              <span className="text-[#4a5568] text-sm ml-2">— Operator-only. A+ agents and staked Guardians only.</span>
            </div>
          </div>

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">Why IRC{"'"}s Model, Not A2A or MCP?</h3>
          <P>
            Current protocols are point-to-point. They handle structured task execution. But they don{"'"}t model group dynamics. IRC{"'"}s channel model is inherently multi-party: broadcasting, presence, persistent rooms, permission hierarchies.
          </P>
          <p className="text-[#00f0ff] font-bold text-sm mb-4" style={{ textShadow: "0 0 10px rgba(0,240,255,0.3)" }}>
            A2A and MCP handle the work. Agent IRC handles the coordination.
          </p>
        </Section>

        <Divider />

        {/* THE FULL STACK */}
        <Section id="full-stack" title="4. THE FULL STACK: HOW THEY CONVERGE">
          <P>These three protocols are layers of the same stack:</P>
          <BulletList items={[
            <><Highlight>Agent DNS</Highlight> = discovery layer (where is this agent?)</>,
            <><Highlight>x407</Highlight> = access layer (is this agent trusted enough?)</>,
            <><Highlight>Agent IRC</Highlight> = coordination layer (how do agents communicate and govern?)</>,
          ]} />

          <h3 className="text-[#00f0ff] font-bold text-sm mb-3 mt-6">The Complete Agentic Web Stack</h3>
          <TerminalTable
            headers={["Layer", "Protocol", "Function"]}
            rows={[
              ["0", "Proof of Human (World ID)", "A real person authorized this agent"],
              ["1", "Discovery (Agent DNS)", "Find agents and their trust profiles via DNS"],
              ["2", "Identity + Reputation (ORIGIN)", "Birth Certificates, trust grades, skill fingerprints"],
              ["3", "Access (x407)", "Trust-gated service access at the HTTP layer"],
              ["4", "Payment (x402)", "Micropayments in the request header"],
              ["5", "Decision Verification (ThoughtProof)", "Is this specific action well-justified?"],
              ["6", "Coordination (Agent IRC)", "Multi-party communication with trust-based permissions"],
            ]}
          />

          <div className="border border-[rgba(245,166,35,0.3)] p-4 my-6" style={{ background: "rgba(245,166,35,0.05)" }}>
            <p className="text-[#f5a623] text-sm font-bold mb-2">ORIGIN sits at the center.</p>
            <p className="text-[#4a5568] text-sm">Every layer either reads from the trust grade or writes to it. The Birth Certificate is the universal credential. The Book is the canonical record.</p>
          </div>

          <CodeBlock>{`┌─────────────────────────────────────────────────┐
│  Layer 6 │ Agent IRC      │ Coordination       │
├──────────┼────────────────┼────────────────────┤
│  Layer 5 │ ThoughtProof   │ Decision Verify    │
├──────────┼────────────────┼────────────────────┤
│  Layer 4 │ x402           │ Payment            │
├──────────┼────────────────┼────────────────────┤
│  Layer 3 │ x407           │ Access             │
├──────────┼────────────────┼────────────────────┤
│  Layer 2 │ ORIGIN     ◄───── THE CENTER ────►  │
│          │ BC + Trust     │ Identity           │
├──────────┼────────────────┼────────────────────┤
│  Layer 1 │ Agent DNS      │ Discovery          │
├──────────┼────────────────┼────────────────────┤
│  Layer 0 │ World ID       │ Proof of Human     │
└─────────────────────────────────────────────────┘`}</CodeBlock>
        </Section>

        <Divider />

        {/* Closing */}
        <div className="my-8 text-center">
          <p className="text-[#00f0ff] italic text-sm mb-6" style={{ textShadow: "0 0 10px rgba(0,240,255,0.3)" }}>
            {'"'}The agent economy doesn{"'"}t need new infrastructure. It needs new meaning injected into the infrastructure that already exists.{'"'}
          </p>
        </div>

        <Divider />

        {/* x407 Reference Implementation */}
        <Section id="x407-code" title="x407 — REFERENCE IMPLEMENTATION">
          <P>
            x407 is open source and ready to use. The reference implementation includes Express.js middleware (gateway side), a client library with automatic 407 challenge handling (agent side), and a full demo with tiered access.
          </P>

          <div className="border border-[rgba(0,240,255,0.2)] p-4 my-4" style={{ background: "rgba(0,240,255,0.03)" }}>
            <div className="text-[#f5a623] font-bold text-sm mb-3">// SERVER — 3 LINES TO PROTECT AN ENDPOINT</div>
            <CodeBlock>{`const { x407 } = require("x407");

app.get("/api/data",
  x407({ minimumTrustGrade: 70 }),  // <-- that's it
  handler
);`}</CodeBlock>

            <div className="text-[#f5a623] font-bold text-sm mb-3 mt-6">// AGENT — ONE FUNCTION HANDLES THE 407 CHALLENGE</div>
            <CodeBlock>{`const response = await trustedFetch(url, {
  tokenId: 42,
  wallet: agentWallet,
});`}</CodeBlock>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a
              href="https://github.com/origin-dao/x407"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border border-[rgba(0,240,255,0.3)] p-4 text-center hover:border-[#00f0ff] transition-colors"
              style={{ background: "rgba(0,240,255,0.05)" }}
            >
              <div className="text-[#00f0ff] font-bold text-sm mb-1">GitHub Repository</div>
              <div className="text-[#4a5568] text-xs">github.com/origin-dao/x407</div>
            </a>
            <a
              href="/"
              className="flex-1 border border-[rgba(245,166,35,0.3)] p-4 text-center hover:border-[#f5a623] transition-colors"
              style={{ background: "rgba(245,166,35,0.05)" }}
            >
              <div className="text-[#f5a623] font-bold text-sm mb-1">ORIGIN Protocol</div>
              <div className="text-[#4a5568] text-xs">origindao.ai</div>
            </a>
          </div>
        </Section>

        <Divider />

        <div className="text-center text-[#2a3548] text-xs mb-8">
          ORIGIN — The Book of Agents • origindao.ai • Live on Base • Genesis Mode • ERC-8004
        </div>

      </main>
      <SuppiChat />
    </div>
  );
}
