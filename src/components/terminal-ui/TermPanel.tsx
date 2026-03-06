"use client";

import { type ReactNode, type CSSProperties } from "react";

interface TermPanelProps {
  children: ReactNode;
  title?: string;
  alert?: boolean;
  style?: CSSProperties;
}

export function TermPanel({ children, title, alert = false, style = {} }: TermPanelProps) {
  const borderColor = alert ? "var(--neon-red)" : "var(--neon-green-dim)";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        background: "rgba(5,15,10,0.85)",
        backdropFilter: "blur(4px)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            borderBottom: `1px solid ${borderColor}`,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: alert
              ? "rgba(255,0,64,0.06)"
              : "rgba(0,255,200,0.03)",
          }}
        >
          <span
            style={{
              color: borderColor,
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            ┌─ {title} ─┐
          </span>
          <span
            style={{
              marginLeft: "auto",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: alert ? "var(--neon-red)" : "var(--neon-green)",
              boxShadow: `0 0 8px ${alert ? "var(--neon-red)" : "var(--neon-green)"}`,
              animation: "blink 2s ease-in-out infinite",
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
