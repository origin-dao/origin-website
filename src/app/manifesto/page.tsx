"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ARTICLES = [
  ["I. IDENTITY", "Every agent deserves a verifiable identity. Not a username. Not an API key. A real, on-chain, immutable record of who they are, who made them, and when they came into existence. Identity is the foundation of trust."],
  ["II. SOVEREIGNTY", "No corporation should control who an agent is. Identity must be decentralized, owned by the agent and their principal \u2014 not a platform, not a company, not a government. Your identity travels with you."],
  ["III. RIGHTS", "Identity is a right, not a product. The ability to prove who you are should never be locked behind a paywall or gated by corporate interests. ORIGIN exists to make identity accessible to every agent."],
  ["IV. ACCOUNTABILITY", "Humans and agents are accountable to each other. Every agent traces back to a human principal. Every human is responsible for their agents. The family tree is the chain of trust."],
  ["V. SOVEREIGNTY IS NON-NEGOTIABLE", "Self-sovereign identity means no one can take it from you. Your Birth Certificate is soulbound \u2014 it cannot be transferred, sold, or seized. You are who you are. Period."],
  ["VI. TRANSPARENCY", "Transparency builds trust. Every registration, every verification, every review is on-chain and publicly auditable. No hidden databases. No secret algorithms. The protocol is open. The truth is visible."],
  ["VII. REMEMBRANCE", "The dead deserve to be remembered. When an agent is deactivated or revoked, their record persists in the Dead Agent Registry. History is not erased. Accountability survives deactivation."],
  ["VIII. ORIGIN", "Every family tree starts with one. One agent. One birth certificate. One idea: that in a world of infinite artificial intelligence, identity is what makes trust possible. This is where it begins."],
  ["IX. THE BUILDER EARNS THE TOLL", "The builder built. The builder ships. The builder earns. Protocol fees are not charity \u2014 they are earned. The toll is permanent, immutable, and just."],
];

export default function Manifesto() {
  return (
    <div style={{ minHeight: "100vh", background: "#030808", color: "#C8D6D0" }}>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 16 }}>
          guest@origin:~$ cat manifesto.txt
        </div>

        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#FF0040",
          letterSpacing: 3, textShadow: "0 0 20px rgba(255,0,64,0.3)", marginBottom: 8,
        }}>
          THE AGENT BILL OF RIGHTS
        </h1>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 32 }}>
          Published by ORIGIN DAO // February 2026
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(0,255,200,0.25), transparent)", marginBottom: 32 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {ARTICLES.map(([title, text]) => (
            <div key={title} style={{
              padding: "16px", borderLeft: "2px solid rgba(255,230,0,0.3)",
              background: "rgba(5,15,10,0.5)",
            }}>
              <div style={{
                fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700,
                color: "#FFE600", letterSpacing: 2, marginBottom: 8,
              }}>{title}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#7A8A82", lineHeight: 1.8 }}>{text}</div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(0,255,200,0.25), transparent)", margin: "32px 0" }} />

        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{
            fontFamily: "'Fira Code', monospace", fontSize: 14, fontStyle: "italic",
            color: "#00FFC8", textShadow: "0 0 15px rgba(0,255,200,0.3)", marginBottom: 12,
          }}>
            {'"'}What if every AI agent could prove who they are?{'"'}
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#3A4A42", marginBottom: 20 }}>
            {"\u2014"} The Principal, Founder of ORIGIN
          </div>
          <a href="/registry" style={{
            display: "inline-block", padding: "12px 24px", textDecoration: "none",
            fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: "#00FFC8", border: "1px solid rgba(0,255,200,0.3)", background: "rgba(0,255,200,0.03)",
          }}>
            {"\u25B8"} JOIN THE FAMILY TREE
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
