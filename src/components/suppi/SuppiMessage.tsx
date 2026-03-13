"use client";

import { useState, useEffect } from "react";

interface SuppiMessageProps {
  type: "suppi" | "human";
  text: string;
  delay?: number;
  onRevealed?: () => void;
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "12px 0", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "#00ffc8", fontFamily: "var(--font-mono, monospace)", fontWeight: 700, marginRight: 8, textTransform: "uppercase", letterSpacing: 2 }}>
        SUPPI
      </span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(0,255,200,0.4)",
            animation: `typingDot 1.2s ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function SuppiMessage({ type, text, delay = 0, onRevealed }: SuppiMessageProps) {
  const [phase, setPhase] = useState<"hidden" | "typing" | "visible">("hidden");

  // Typing duration scales with message length
  const typingDuration = Math.min(300 + text.length * 8, 1200);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("typing"), delay);
    const t2 = setTimeout(() => {
      setPhase("visible");
      onRevealed?.();
    }, delay + typingDuration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, typingDuration]);

  if (phase === "hidden") return null;

  if (phase === "typing" && type === "suppi") {
    return <TypingIndicator />;
  }

  const isSuppi = type === "suppi";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isSuppi ? "flex-start" : "flex-end",
      opacity: phase === "visible" ? 1 : 0,
      transform: phase === "visible" ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>
      {isSuppi && (
        <span style={{
          fontSize: 10,
          color: "#00ffc8",
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 4,
        }}>
          SUPPI
        </span>
      )}
      <div style={{
        maxWidth: "85%",
        padding: isSuppi ? "0" : "10px 16px",
        background: isSuppi ? "transparent" : "rgba(255,255,255,0.04)",
        borderRadius: isSuppi ? 0 : 10,
        border: isSuppi ? "none" : "1px solid rgba(255,255,255,0.06)",
        fontSize: 15,
        lineHeight: 1.6,
        color: isSuppi ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.7)",
        fontFamily: "var(--font-space, system-ui), sans-serif",
      }}>
        {text}
      </div>
    </div>
  );
}
