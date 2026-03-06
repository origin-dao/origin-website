"use client";

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 20,
        padding: "14px 24px",
        borderTop: "1px solid rgba(0,255,200,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono, monospace)",
            fontSize: 9,
            color: "var(--dim, #3A4A42)",
            letterSpacing: 1,
          }}
        >
          ORIGIN_PROTOCOL // not your keys, not your clams // dyor
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { href: "https://github.com/origin-dao", label: "github" },
            { href: "https://x.com/OriginDAO_ai", label: "x.com" },
            { href: "/contracts", label: "contracts" },
            { href: "/whitepaper", label: "docs" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              style={{
                fontFamily: "var(--mono, monospace)",
                fontSize: 9,
                color: "var(--dim, #3A4A42)",
                textDecoration: "none",
                letterSpacing: 1,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "var(--neon-green, #00FFC8)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "var(--dim, #3A4A42)";
              }}
            >
              [{link.label}]
            </a>
          ))}
        </div>
        <span
          style={{
            fontFamily: "var(--mono, monospace)",
            fontSize: 9,
            color: "var(--dim, #3A4A42)",
          }}
        >
          gm {"\u2600\uFE0F"}
        </span>
      </div>
    </footer>
  );
}
