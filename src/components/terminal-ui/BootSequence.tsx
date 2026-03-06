"use client";

import { useState, useEffect } from "react";
import { Cursor } from "./TypeWriter";
import { Scanlines } from "./Scanlines";
import { InjectStyles } from "./GlobalStyles";

interface BootSequenceProps {
  lines: string[];
  speed?: number;
  onComplete: () => void;
}

export function BootSequence({ lines, speed = 280, onComplete }: BootSequenceProps) {
  const [bootLines, setBootLines] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setBootLines((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 600);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [lines, speed, onComplete]);

  return (
    <>
      <InjectStyles />
      <Scanlines />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          padding: 40,
        }}
      >
        <div style={{ maxWidth: 600, width: "100%" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 13,
              color: "var(--neon-green)",
              lineHeight: 2,
            }}
          >
            {bootLines.map((line, i) => (
              <div
                key={i}
                style={{
                  opacity: 0,
                  animation: "fadeIn 0.2s ease-out forwards",
                  animationDelay: `${i * 0.05}s`,
                  color:
                    i === bootLines.length - 1
                      ? "var(--neon-yellow)"
                      : "var(--neon-green)",
                  fontWeight: i === bootLines.length - 1 ? 700 : 400,
                }}
              >
                {line}
              </div>
            ))}
            {bootLines.length < lines.length && <Cursor />}
          </div>
        </div>
      </div>
    </>
  );
}
