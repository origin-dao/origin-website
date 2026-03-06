"use client";

import { useState, useEffect } from "react";

function Cursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const i = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(i);
  }, []);
  return (
    <span style={{ color: "var(--neon-green)", opacity: on ? 1 : 0, fontWeight: 700 }}>
      {"\u2588"}
    </span>
  );
}

interface TypeWriterProps {
  text: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
}

export function TypeWriter({ text, speed = 40, delay = 0, showCursor = true }: TypeWriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, started]);

  return (
    <span>
      {displayed}
      {showCursor && !done && <Cursor />}
    </span>
  );
}

export { Cursor };
