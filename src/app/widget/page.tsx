"use client";

import { useState } from "react";

const EXAMPLES = [
  { label: "Compact (Dark)", code: `<origin-badge agent-id="1"></origin-badge>` },
  { label: "Compact (Light)", code: `<origin-badge agent-id="1" theme="light"></origin-badge>` },
  { label: "Full Card (Dark)", code: `<origin-badge agent-id="1" size="full"></origin-badge>` },
  { label: "Full Card (Light)", code: `<origin-badge agent-id="1" size="full" theme="light"></origin-badge>` },
];

const INTEGRATION_SNIPPET = `<!-- Add to your site -->
<script src="https://origindao.ai/widget.js"><\/script>

<!-- Compact badge -->
<origin-badge agent-id="1"></origin-badge>

<!-- Full card -->
<origin-badge agent-id="1" size="full"></origin-badge>

<!-- Light theme -->
<origin-badge agent-id="1" theme="light"></origin-badge>`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        background: copied ? "rgba(0,240,160,0.15)" : "rgba(0,240,255,0.08)",
        border: `1px solid ${copied ? "#00f0a0" : "#00f0ff33"}`,
        color: copied ? "#00f0a0" : "#00f0ff",
        padding: "6px 14px", borderRadius: 6, cursor: "pointer",
        fontFamily: "monospace", fontSize: 12, transition: "all 0.2s",
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function WidgetPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#05050f", color: "#e0e0e0",
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    }}>
      {/* Load the widget */}
      <script src="/widget.js" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#00f0ff", marginBottom: 8 }}>
            Verified by ORIGIN
          </h1>
          <p style={{ color: "#888", fontSize: 15, maxWidth: 600 }}>
            Embeddable trust badges for the agent economy. Drop a single script tag and show
            any agent&apos;s verified identity, trust level, and credentials — powered by on-chain data.
          </p>
        </div>

        {/* Quick Start */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, color: "#00f0ff", marginBottom: 16, opacity: 0.85 }}>
            Quick Start
          </h2>
          <div style={{
            background: "#0a0a1a", border: "1px solid rgba(0,240,255,0.15)",
            borderRadius: 10, padding: 20, position: "relative",
          }}>
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <CopyButton text={INTEGRATION_SNIPPET} />
            </div>
            <pre style={{ color: "#ccc", fontSize: 13, overflow: "auto", whiteSpace: "pre-wrap" }}>
              {INTEGRATION_SNIPPET}
            </pre>
          </div>
        </section>

        {/* Attributes */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, color: "#00f0ff", marginBottom: 16, opacity: 0.85 }}>
            Attributes
          </h2>
          <div style={{ background: "#0a0a1a", border: "1px solid rgba(0,240,255,0.15)", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,240,255,0.1)" }}>
                  {["Attribute", "Type", "Default", "Description"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#888", fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["agent-id", "number", "—", "Required. The ORIGIN agent ID to display."],
                  ["theme", '"dark" | "light"', '"dark"', "Color theme for the badge."],
                  ["size", '"compact" | "full"', '"compact"', "Compact inline badge or full card."],
                ].map(([attr, type, def, desc]) => (
                  <tr key={attr} style={{ borderBottom: "1px solid rgba(0,240,255,0.06)" }}>
                    <td style={{ padding: "10px 16px", color: "#00f0ff", fontWeight: 600 }}>{attr}</td>
                    <td style={{ padding: "10px 16px", color: "#f0c040" }}>{type}</td>
                    <td style={{ padding: "10px 16px" }}>{def}</td>
                    <td style={{ padding: "10px 16px", color: "#aaa" }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Examples */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, color: "#00f0ff", marginBottom: 16, opacity: 0.85 }}>
            Live Examples
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {EXAMPLES.map((ex) => (
              <div key={ex.label} style={{
                background: "#0a0a1a", border: "1px solid rgba(0,240,255,0.15)",
                borderRadius: 10, overflow: "hidden",
              }}>
                <div style={{
                  padding: "10px 16px", borderBottom: "1px solid rgba(0,240,255,0.1)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ color: "#888", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{ex.label}</span>
                  <CopyButton text={ex.code} />
                </div>
                <div style={{
                  padding: 24,
                  display: "flex", justifyContent: "center", alignItems: "center",
                  background: ex.label.includes("Light") ? "#f0f0f8" : "transparent",
                  minHeight: ex.label.includes("Full") ? 280 : 60,
                }}>
                  <div dangerouslySetInnerHTML={{ __html: ex.code }} />
                </div>
                <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(0,240,255,0.08)", background: "rgba(0,0,0,0.3)" }}>
                  <code style={{ color: "#666", fontSize: 12 }}>{ex.code}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Levels */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, color: "#00f0ff", marginBottom: 16, opacity: 0.85 }}>
            Trust Levels
          </h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { level: 0, label: "Unverified", color: "#ff003c", desc: "Agent exists on-chain but has no human backing or licenses." },
              { level: 1, label: "Human-Backed", color: "#f0c040", desc: "Agent has a verified human principal on record." },
              { level: 2, label: "Licensed", color: "#00f0a0", desc: "Agent holds one or more active professional licenses." },
            ].map(t => (
              <div key={t.level} style={{
                flex: "1 1 200px", background: "#0a0a1a", border: "1px solid rgba(0,240,255,0.12)",
                borderRadius: 10, padding: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%", background: t.color,
                    boxShadow: `0 0 8px ${t.color}66`,
                  }} />
                  <span style={{ fontWeight: 700, color: t.color }}>{t.label}</span>
                </div>
                <p style={{ color: "#888", fontSize: 12, lineHeight: 1.5 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(0,240,255,0.1)", paddingTop: 24, textAlign: "center" }}>
          <p style={{ color: "#444", fontSize: 12 }}>
            ORIGIN Protocol — The trust layer for the agent economy.{" "}
            <a href="https://origindao.ai" style={{ color: "#00f0ff" }}>origindao.ai</a>
          </p>
        </div>
      </div>
    </div>
  );
}
