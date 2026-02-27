"use client";

import { useState, useEffect } from "react";

interface TerminalLineProps {
  text: string;
  delay?: number;
  prefix?: string;
  className?: string;
}

export function TerminalLine({ text, delay = 0, prefix = ">", className = "" }: TerminalLineProps) {
  const [visible, setVisible] = useState(delay === 0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [visible, text]);

  if (!visible) return null;

  return (
    <div className={`mb-1 ${className}`}>
      <span className="text-[#2a3548] mr-2">{prefix}</span>
      <span>{displayText}</span>
      {displayText.length < text.length && <span className="cursor-blink" />}
    </div>
  );
}

export function TerminalPrompt() {
  return (
    <div className="flex items-center mt-4">
      <span className="text-[#2a3548] mr-2">guest@origin:~$</span>
      <span className="cursor-blink" />
    </div>
  );
}

interface FolderProps {
  name: string;
  description: string;
  href: string;
  locked?: boolean;
}

export function Folder({ name, description, href, locked = false }: FolderProps) {
  return (
    <a href={locked ? "#" : href} className={`folder block mb-3 group ${locked ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="text-[#f5a623] text-lg">
          {locked ? "🔒" : "📁"}
        </span>
        <div>
          <div className="text-[#c0d0e0] group-hover:text-[#00f0ff] transition-colors">
            {name}/
          </div>
          <div className="text-[#4a5568] text-sm">
            {description}
            {locked && <span className="text-[#ff003c] ml-2">[LOCKED]</span>}
          </div>
        </div>
      </div>
    </a>
  );
}

export function Divider() {
  return (
    <div className="origin-divider" />
  );
}

export function AsciiArt() {
  return (
    <pre className="text-[#00f0ff] glow text-xs sm:text-sm leading-tight select-none mb-6">
{`
  ██████  ██████  ██  ██████  ██ ██    ██ 
 ██    ██ ██   ██ ██ ██       ██ ███   ██ 
 ██    ██ ██████  ██ ██   ███ ██ ██ ██ ██ 
 ██    ██ ██   ██ ██ ██    ██ ██ ██  ████ 
  ██████  ██   ██ ██  ██████  ██ ██   ███ 
                                           
      D E C E N T R A L I Z E D            
    A G E N T   I D E N T I T Y            
`}
    </pre>
  );
}

// Glitch text component for reuse across site
export function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch-text ${className}`}>
      <span className="glitch-text-main">{text}</span>
      <span className="glitch-text-r" aria-hidden="true">{text}</span>
      <span className="glitch-text-c" aria-hidden="true">{text}</span>
    </span>
  );
}
