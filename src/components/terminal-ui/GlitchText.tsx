"use client";

import { useState, useEffect, type CSSProperties, type ElementType } from "react";

interface GlitchTextProps {
  children: string;
  intensity?: "low" | "high";
  as?: ElementType;
  style?: CSSProperties;
}

const GLITCH_CHARS = "\u2588\u2593\u2592\u2591\u2573\u256C\u256B\u253C\u2518\u2510\u250C\u2514";

export function GlitchText({ children, intensity = "low", as: Tag = "span", style = {} }: GlitchTextProps) {
  const [display, setDisplay] = useState(children);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < (intensity === "high" ? 0.15 : 0.04)) {
        setIsGlitching(true);
        const text = String(children);
        const pos = Math.floor(Math.random() * text.length);
        const glitched =
          text.slice(0, pos) +
          GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] +
          text.slice(pos + 1);
        setDisplay(glitched);
        setTimeout(() => {
          setDisplay(children);
          setIsGlitching(false);
        }, 80 + Math.random() * 60);
      }
    }, intensity === "high" ? 300 : 1500);
    return () => clearInterval(interval);
  }, [children, intensity]);

  return (
    <Tag
      style={{
        ...style,
        ...(isGlitching
          ? { textShadow: "2px 0 #ff0040, -2px 0 #00ffc8" }
          : {}),
      }}
    >
      {display}
    </Tag>
  );
}
