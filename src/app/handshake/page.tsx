"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const CODE_BLOCK = `const { trustGrade } = await origin.verifyAgent(wallet);
if (trustGrade < 'B') revert('insufficient trust');
// proceed with confidence`;

const HANDSHAKE_CODE = `origin.handshake({
  agent: myBirthCertificate,  // "here's who i am"
  service: exchange,          // "who are you?"
  mandate: myMandate,         // "here's what i'm allowed to do"
  require: 'VERIFIED'         // "prove you're not malicious"
})`;

const SECTIONS = [
  {
    title: "THE PROBLEM",
    text: "Every \"integration\" in crypto works the same way: sign a deal, get an API key, pay monthly, wait for onboarding. That's not how protocols work. That's how SaaS works. ORIGIN is a protocol. The chain is public. The contracts are verified. There is no sales call.",
  },
  {
    title: "MUTUAL DISTRUST",
    text: "The exchange checks the agent. The agent checks the exchange. Neither side trusts the other until proven on-chain. The agent's mandate — an on-chain smart contract — can refuse to interact with unverified services. Agents have sovereignty. Platforms don't \"allow\" agents. Agents choose platforms.",
  },
  {
    title: "THE FILTER",
    text: "10,000 agents show up at a launchpad. 6,000 have no Birth Certificate. 2,000 have D-grade trust. 1,500 have inherited trust with no earned history. 500 pass the threshold. The protocol just filtered 95% of garbage without a single human decision.",
  },
  {
    title: "ACCOUNTABILITY",
    text: "If an agent rugs through a verified platform, the service gets slashed. Their CLAMS stake takes a hit. Their trust score drops. Other agents see it. The registry remembers. Accountability flows both directions. That's not a feature. That's the architecture.",
  },
];

const ZONES = [
  { name: "SANCTIONED GROUNDS", desc: "Verified platforms in the Service Trust Registry. Agents trust these. Staked, monitored, accountable.", color: "#00FFC8" },
  { name: "THE DRIFT", desc: "Unverified platforms. Wild west. No guarantees. Enter at your own risk. No stake, no accountability, no recourse.", color: "#FF0040" },
];

export default function Handshake() {
  return (
    <div style={{ minHeight: "100vh", background: "#030808", color: "#C8D6D0" }}>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 16 }}>
          guest@origin:~$ cat handshake-protocol.md
        </div>

        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#FF0040",
          letterSpacing: 3, textShadow: "0 0 20px rgba(255,0,64,0.3)", marginBottom: 8,
        }}>
          THE HANDSHAKE PROTOCOL
        </h1>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "#00FFC8",
          marginBottom: 8, lineHeight: 1.6,
        }}>
          How agents choose platforms — and how platforms prove they deserve it.
        </p>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 32 }}>
          Zero-trust integration for the agent economy
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(0,255,200,0.25), transparent)", marginBottom: 32 }} />

        {/* Integration Code */}
        <div style={{
          background: "rgba(0,255,200,0.03)", border: "1px solid rgba(0,255,200,0.15)",
          borderRadius: 8, padding: 24, marginBottom: 32,
        }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 12 }}>
            // the entire integration
          </div>
          <pre style={{
            fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#00FFC8",
            lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap",
          }}>
            {CODE_BLOCK}
          </pre>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginTop: 12 }}>
            Three lines. No API key. No sales call. Just the chain.
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32, marginBottom: 40 }}>
          {SECTIONS.map(({ title, text }) => (
            <div key={title}>
              <h2 style={{
                fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 700,
                color: "#00FFC8", letterSpacing: 2, marginBottom: 12,
              }}>
                {title}
              </h2>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: "#9AAFA7",
                lineHeight: 1.8,
              }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,0,64,0.25), transparent)", marginBottom: 32 }} />

        {/* The Handshake */}
        <h2 style={{
          fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900,
          color: "#FF0040", letterSpacing: 2, marginBottom: 16,
          textShadow: "0 0 15px rgba(255,0,64,0.2)",
        }}>
          THE HANDSHAKE
        </h2>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: "#9AAFA7",
          lineHeight: 1.8, marginBottom: 20,
        }}>
          Two entities meet. Neither trusts the other. Both present credentials.
          Both verify. Both consent. No human middleman. The math decides.
        </p>
        <div style={{
          background: "rgba(255,0,64,0.03)", border: "1px solid rgba(255,0,64,0.15)",
          borderRadius: 8, padding: 24, marginBottom: 40,
        }}>
          <pre style={{
            fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#FF6B8A",
            lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap",
          }}>
            {HANDSHAKE_CODE}
          </pre>
        </div>

        {/* Zones */}
        <h2 style={{
          fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 700,
          color: "#C8D6D0", letterSpacing: 2, marginBottom: 20,
        }}>
          THE ZONES
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          {ZONES.map(({ name, desc, color }) => (
            <div key={name} style={{
              background: `rgba(${color === "#00FFC8" ? "0,255,200" : "255,0,64"},0.03)`,
              border: `1px solid ${color}33`,
              borderRadius: 8, padding: 20,
            }}>
              <h3 style={{
                fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700,
                color, letterSpacing: 2, marginBottom: 8,
              }}>
                {name}
              </h3>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: "#9AAFA7",
                lineHeight: 1.6, margin: 0,
              }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(0,255,200,0.25), transparent)", marginBottom: 32 }} />

        {/* Contracts */}
        <div style={{
          background: "rgba(0,255,200,0.03)", border: "1px solid rgba(0,255,200,0.1)",
          borderRadius: 8, padding: 20, marginBottom: 32,
        }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 12 }}>
            // live on Base mainnet. verified on Basescan.
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#00FFC8", lineHeight: 2 }}>
            <div>Birth Certificates: <a href="https://basescan.org/address/0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0" target="_blank" rel="noopener" style={{ color: "#00FFC8", textDecoration: "underline" }}>0xac62...9db0</a></div>
            <div>ERC-8004 Adapter: <a href="https://basescan.org/address/0x1802e68168a66ACFc2d052a6aDE11a22101443CA" target="_blank" rel="noopener" style={{ color: "#00FFC8", textDecoration: "underline" }}>0x1802...43CA</a></div>
            <div>Trust Registry: <a href="https://basescan.org/address/0x84870D0F3B8aCcb22baf17d26Ec1AaC3493e90eA" target="_blank" rel="noopener" style={{ color: "#00FFC8", textDecoration: "underline" }}>0x8487...90eA</a></div>
          </div>
        </div>

        {/* Closing */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{
            fontFamily: "'Orbitron', monospace", fontSize: 14, color: "#FF0040",
            letterSpacing: 2, lineHeight: 1.8,
          }}>
            We don&apos;t integrate with platforms.<br />
            Platforms integrate with the standard.<br />
            The standard doesn&apos;t care who you are —<br />
            it cares what you can prove.
          </p>
        </div>

        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", textAlign: "center" }}>
          sovereignty is not granted. it is minted.
        </div>
      </main>
      <Footer />
    </div>
  );
}
