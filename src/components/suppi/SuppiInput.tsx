"use client";

import { useState, useRef, useEffect } from "react";
import type { QuickReply } from "@/lib/suppiConversation";

interface SuppiInputProps {
  quickReplies: QuickReply[];
  placeholder?: string;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function SuppiInput({ quickReplies, placeholder, onSend, disabled }: SuppiInputProps) {
  const [value, setValue] = useState("");
  const [chipVisible, setChipVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animate chips in after a short delay
  useEffect(() => {
    if (quickReplies.length > 0) {
      const t = setTimeout(() => setChipVisible(true), 300);
      return () => clearTimeout(t);
    } else {
      setChipVisible(false);
    }
  }, [quickReplies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleChip = (reply: QuickReply) => {
    if (disabled) return;
    onSend(reply.value);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Quick reply chips */}
      {quickReplies.length > 0 && (
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap",
          marginBottom: 12,
          opacity: chipVisible ? 1 : 0,
          transform: chipVisible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}>
          {quickReplies.map((reply) => (
            <button
              key={reply.value}
              onClick={() => handleChip(reply)}
              disabled={disabled}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: 0.5,
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = "rgba(0,255,200,0.4)";
                  e.currentTarget.style.color = "#00ffc8";
                  e.currentTarget.style.background = "rgba(0,255,200,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {reply.label}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "4px 4px 4px 16px",
        transition: "border-color 0.2s",
      }}
        onFocus={() => {
          const el = inputRef.current?.parentElement;
          if (el) el.style.borderColor = "rgba(0,255,200,0.25)";
        }}
        onBlur={() => {
          const el = inputRef.current?.parentElement;
          if (el) el.style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        <span style={{
          color: "#00ffc8",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || "Type here..."}
          disabled={disabled}
          autoFocus
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "var(--font-space, system-ui), sans-serif",
            fontSize: 14,
            padding: "10px 0",
          }}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: value.trim() ? "#00ffc8" : "rgba(255,255,255,0.05)",
            border: "none",
            cursor: value.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke={value.trim() ? "#0a0a0a" : "rgba(255,255,255,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
